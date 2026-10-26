"""Sommerfeld 12 — mouth stitched into skull, with ONE animated face mesh.
Generates .blend and GLB from the same Blender scene. Requires bpy.
Topology is shared with the independently tested Python preview.
 blender -b --factory-startup --python jazz-club/blender/refine_sommerfeld_12.py -- \
 --output dist/jazz-club/assets/sommerfeld-study.glb \
 --blend dist/jazz-club/assets/sommerfeld-study.blend
Not a historically approved likeness or final production rig.
"""
import argparse,math,sys
from pathlib import Path
import bpy
HERE=Path(__file__).resolve().parent
sys.path.insert(0,str(HERE))
import refine_sommerfeld_09 as scene_base
import refine_sommerfeld_10 as eye_topology
import face_integration12 as integrated
import build_sommerfeld as base

def replace_face():
    face_old=bpy.data.objects.get('SOMMERFELD_FACE_QUAD_BASE')
    head=bpy.data.objects.get('HEAD_ANCHOR')
    if face_old is None or head is None:
        raise RuntimeError('Sommerfeld face or head not found')
    skin=face_old.data.materials[0] if face_old.data.materials else bpy.data.materials['skin-pbr']
    bpy.data.objects.remove(face_old,do_unlink=True)
    for name in ('MouthLoops11','MouthCavityStudy11'):
        old=bpy.data.objects.get(name)
        if old:bpy.data.objects.remove(old,do_unlink=True)
    vertices,quads,morphs,bounds,starts=integrated.build()
    report=integrated.validate()
    face=base.mesh('SOMMERFELD_FACE_QUAD_BASE',vertices,quads,skin,head)
    lip=base.color('sommerfeld12-natural-lip-shading',(.53,.325,.278),rough=.88)
    face.data.materials.append(lip)
    ordinary=len(quads)-3*integrated.STEPS
    for poly in face.data.polygons:
        poly.use_smooth=True
        poly.material_index=1 if poly.index>=ordinary+integrated.STEPS else 0
    # Initial planar portrait UVs; final sculpt needs manual unwrap.
    uv=face.data.uv_layers.new(name='PortraitIntegratedUV')
    for poly in face.data.polygons:
        for li in poly.loop_indices:
            vert=face.data.vertices[face.data.loops[li].vertex_index].co
            uv.data[li].uv=(.5+vert.x*1.8,.5+vert.z*1.6)
    face.shape_key_add(name='Basis',from_mix=False)
    for name,positions in morphs.items():
        key=face.shape_key_add(name=name,from_mix=False)
        for i,pos in enumerate(positions):key.data[i].co=pos
    face['revision']='12'
    face['mouthGeometry']='single connected cranial mesh with 64-edge aperture'
    face['topologyReport']=str(report)
    return face,head

def mouth_interior(head):
    # Dark backplate is behind the actual aperture, not a lip overlay.
    dark=base.color('sommerfeld12-mouth-interior',(.093,.048,.049),rough=.94)
    verts=[(0,.121,-.163)]
    for i in range(integrated.STEPS):
        a=math.tau*i/integrated.STEPS
        verts.append((.048*math.cos(a),.121,-.163+.008*math.sin(a)))
    faces=[(0,i+1,(i+1)%integrated.STEPS+1) for i in range(integrated.STEPS)]
    o=base.mesh('MouthInterior12',verts,faces,dark,head)
    o['status']='illustrative recessed mouth only, not anatomical interior'
    return o

def main():
    argv=sys.argv[sys.argv.index('--')+1:] if '--' in sys.argv else []
    parser=argparse.ArgumentParser()
    parser.add_argument('--output',required=True)
    parser.add_argument('--blend',required=True)
    args=parser.parse_args(argv)
    glb,blend=Path(args.output).resolve(),Path(args.blend).resolve()
    glb.parent.mkdir(parents=True,exist_ok=True)
    blend.parent.mkdir(parents=True,exist_ok=True)
    scene_base.assemble_scene(glb)
    eye_topology.prepare_face()
    face,head=replace_face()
    mouth_interior(head)
    root=bpy.data.objects.get('SOMMERFELD_ROOT')
    root['modelStatus']='revision12-connected-mouth-study-not-approved'
    root['topology']='Face connected at lips; eye sockets still separate'
    keys={key.name for key in face.data.shape_keys.key_blocks}
    if not {'Basis','Smile','JawOpen','Pucker','Frown','Speech_A'}.issubset(keys):
        raise RuntimeError('Missing shape keys')
    if len(face.data.vertices)!=5664 or len(face.data.polygons)!=5376:
        raise RuntimeError('Topological regression')
    bpy.ops.wm.save_as_mainfile(filepath=str(blend),compress=True)
    bpy.ops.export_scene.gltf(filepath=str(glb),export_format='GLB',
        export_extras=True,export_morph=True,export_animations=True,
        export_image_format='AUTO')
    if not glb.is_file() or glb.stat().st_size<8000 or not blend.is_file():
        raise RuntimeError('Blender did not generate the expected outputs')
    print('SOMMERFELD_12_EXPORTED',glb.stat().st_size,blend.stat().st_size)
if __name__=='__main__':main()
