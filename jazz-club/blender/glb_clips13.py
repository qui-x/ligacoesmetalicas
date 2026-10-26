"""SILM Jazz e Metais — glTF 2.0 morph-animation clip validator/packer.
Run AFTER Blender exports Sommerfeld. Pure stdlib, no Blender dependency:
 python jazz-club/blender/glb_clips13.py --glb dist/jazz-club/assets/sommerfeld-study.glb
Adds three glTF weight-animation clips to the connected face; does not change
the face sculpt or invent shape keys. Tests the actual Blender-exported GLB.
"""
import argparse
import json
import struct
from pathlib import Path

def read_glb(path):
    b=Path(path).read_bytes()
    if b[:4]!=b'glTF' or struct.unpack_from('<II',b,4)!=(2,len(b)):
        raise ValueError('Invalid GLB2')
    offset=12
    parts=[]
    while offset<len(b):
        n,kind=struct.unpack_from('<I4s',b,offset)
        offset+=8
        parts.append((kind,b[offset:offset+n]))
        offset+=n
    if len(parts)!=2 or parts[0][0]!=b'JSON' or parts[1][0]!=b'BIN\0':
        raise ValueError('Expected JSON and BIN chunks')
    return json.loads(parts[0][1]),bytearray(parts[1][1])

def store_glb(path,doc,blob):
    raw=json.dumps(doc,ensure_ascii=False,separators=(',',':')).encode()
    raw+=b' '*((-len(raw))%4)
    blob+=b'\0'*((-len(blob))%4)
    output=(struct.pack('<4sII',b'glTF',2,12+8+len(raw)+8+len(blob))
            +struct.pack('<I4s',len(raw),b'JSON')+raw
            +struct.pack('<I4s',len(blob),b'BIN\0')+blob)
    Path(path).write_bytes(output)

def add_accessor(doc,blob,data,with_bounds=False):
    blob.extend(b'\0'*((-len(blob))%4))
    pos=len(blob)
    blob.extend(struct.pack('<%sf'%len(data),*data))
    view=len(doc['bufferViews'])
    doc['bufferViews'].append({'buffer':0,'byteOffset':pos,'byteLength':len(data)*4})
    accessor={'bufferView':view,'componentType':5126,'count':len(data),'type':'SCALAR'}
    if with_bounds:accessor.update({'min':[min(data)],'max':[max(data)]})
    idx=len(doc['accessors'])
    doc['accessors'].append(accessor)
    return idx

def apply(path):
    doc,blob=read_glb(path)
    candidates=[(i,m) for i,m in enumerate(doc['meshes'])
                if m.get('name')=='SOMMERFELD_FACE_QUAD_BASE']
    if len(candidates)!=1:
        raise ValueError('Expected one Blender connected facial mesh')
    mesh_index,mesh=candidates[0]
    target_count=len(mesh['primitives'][0].get('targets',[]))
    if target_count<10:
        raise ValueError('Blender did not export 10 facial morph targets')
    names=mesh.get('extras',{}).get('targetNames')
    # Never invent a morph order: a different exporter can reorder shape keys.
    # A wrong mapping would silently animate a different anatomical feature.
    if not names or len(names)!=target_count:
        raise ValueError('Morph names unavailable; do not guess target order')
    if not set(('Smile','JawOpen','Blink_L','Blink_R')).issubset(names):
        raise ValueError('Required mouth/eye morphs not present')
    face_nodes=[i for i,node in enumerate(doc['nodes']) if node.get('mesh')==mesh_index]
    if len(face_nodes)!=1:raise ValueError('Ambiguous connected face node')
    node_index=face_nodes[0]
    mesh.setdefault('weights',[0.0]*target_count)
    doc.setdefault('animations',[])
    for clip,peaks in (
        ('SmileCycle',{'Smile':1.}),
        ('JawOpenCycle',{'JawOpen':.9}),
        ('BlinkCycle',{'Blink_L':1.,'Blink_R':1.}),
    ):
        if any(a.get('name')==clip for a in doc['animations']):continue
        times=[0.,.35,.65,1.02,1.4,1.85]
        weights=[]
        for scale in (0.,0.,1.,1.,0.,0.):
            frame=[0.]*target_count
            for name,peak in peaks.items():frame[names.index(name)]=peak*scale
            weights.extend(frame)
        inp=add_accessor(doc,blob,times,True)
        out=add_accessor(doc,blob,weights)
        doc['animations'].append({'name':clip,
            'samplers':[{'input':inp,'output':out,'interpolation':'LINEAR'}],
            'channels':[{'sampler':0,'target':{'node':node_index,'path':'weights'}}]})
    doc['buffers'][0]['byteLength']=len(blob)
    store_glb(path,doc,blob)
    check,_=read_glb(path)
    required={'SmileCycle','JawOpenCycle','BlinkCycle'}
    if not required.issubset(a.get('name') for a in check['animations']):
        raise ValueError('Morph animation clips missing after serialization')
    print('REV13_GLTF_ANIMATION_VERIFIED',path,target_count,sorted(required))

if __name__=='__main__':
    p=argparse.ArgumentParser()
    p.add_argument('--glb',required=True)
    apply(p.parse_args().glb)
