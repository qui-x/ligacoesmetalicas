"""Rebuild an editable quad portrait from a Rev05 study GLB inside Blender.
Usage:
blender -b --factory-startup --python jazz-club/blender/assemble_sommerfeld_05.py -- \
  --glb sommerfeld-study-05.glb --blend Sommerfeld-05.blend --webglb Sommerfeld-05-web.glb

This is an artistic study and geometry/rig smoke test, not an approved likeness.
Requires the static GLB produced by the offline revision-05 source package.
"""
import argparse
from pathlib import Path
import sys
import bpy
from mathutils import Matrix, Vector

sys.path.insert(0,str(Path(__file__).resolve().parent))
import face_anatomy as anatomy

def empty(name,position,parent=None):
    node=bpy.data.objects.new(name,None)
    bpy.context.scene.collection.objects.link(node)
    node.location=position
    if parent is not None:
        node.parent=parent
        node.matrix_world=Matrix.Translation(Vector(position))
    return node

def reparent(obj,parent):
    pose=obj.matrix_world.copy()
    obj.parent=parent
    obj.matrix_world=pose

def make_face(head,material):
    vertices,quads=anatomy.head_geometry()
    targets=anatomy.facial_targets(vertices)
    anatomy.validate_topology(vertices,quads,targets)
    m=bpy.data.meshes.new('PortraitFace05-quadmesh')
    m.from_pydata(vertices,[],quads)
    m.update()
    ob=bpy.data.objects.new('SOMMERFELD_FACE_QUAD_BASE',m)
    bpy.context.scene.collection.objects.link(ob)
    ob.parent=head
    m.materials.append(material)
    for face in m.polygons:face.use_smooth=True
    uv=m.uv_layers.new(name='PortraitUV')
    for p in m.polygons:
        for loop_idx in p.loop_indices:
            vi=m.loops[loop_idx].vertex_index
            row,col=divmod(vi,anatomy.COLUMNS)
            uv.data[loop_idx].uv=(col/anatomy.COLUMNS,1-row/anatomy.ROWS)
    ob.shape_key_add(name='Basis',from_mix=False)
    for name,positions in targets.items():
        target=ob.shape_key_add(name=name,from_mix=False)
        for i,xyz in enumerate(positions):
            target.data[i].co=xyz
    ob['reviewStatus']='study05-not-approved'
    return ob

def belongs_to_head(name):
    n=name.lower()
    return any(x in n for x in (
        'eye ','eye_','ear ','ear_','nostril','hair','sideburn','combed',
        'eyebrow','brow','moustache','spectacle','bridge spectacles',
        'temple ','nasolabial','underlid','upperlid','lowerlid'))

def center_x(ob):
    if ob.type!='MESH' or not ob.data.vertices:return 0.0
    vals=[(ob.matrix_world@v.co).x for v in ob.data.vertices]
    return (min(vals)+max(vals))*.5

def main():
    arguments=sys.argv[sys.argv.index('--')+1:] if '--' in sys.argv else []
    cli=argparse.ArgumentParser()
    for opt in ('glb','blend','webglb'):cli.add_argument('--'+opt,required=True)
    args=cli.parse_args(arguments)
    glb,blend,webglb=map(lambda p:Path(p).resolve(),(args.glb,args.blend,args.webglb))
    if not glb.is_file():raise RuntimeError('Source GLB missing: '+str(glb))
    bpy.ops.wm.read_factory_settings(use_empty=True)
    bpy.ops.import_scene.gltf(filepath=str(glb))
    source=[o for o in bpy.context.scene.objects if o.type=='MESH']
    if len(source)<90:raise RuntimeError('Incomplete static study')
    previous=next((o for o in source if o.name.startswith('Portrait_HEAD_Rev05')),None)
    if previous is None:raise RuntimeError('Rev05 head absent')
    material=previous.data.materials[0] if previous.data.materials else bpy.data.materials.new('PortraitSkin')
    bpy.data.objects.remove(previous,do_unlink=True)
    root=empty('SOMMERFELD_ROOT',(0,0,0))
    root['scientistId']='sommerfeld'
    root['productionStatus']='study05-not-homologated'
    head=empty('HEAD_ANCHOR',(0,0,1.735),root)
    arms={}
    for side,key in ((-1,'L'),(1,'R')):
        top=empty('ARM_'+key+'_UPPER',(side*.315,0,1.302),root)
        fore=empty('ARM_'+key+'_FORE',(side*.42,.13,1.025),top)
        arms[key]=(top,fore)
    for ob in source:
        if ob.name not in bpy.data.objects:continue
        n=ob.name.lower()
        if belongs_to_head(n):
            reparent(ob,head)
        elif any(x in n for x in ('sleeve upper','sleeve forearm','shirt cuff',
                                  'hand_','finger_','thumb_')):
            key='L' if center_x(ob)<0 else 'R'
            is_fore=any(x in n for x in ('sleeve forearm','shirt cuff','hand_','finger_','thumb_'))
            reparent(ob,arms[key][1 if is_fore else 0])
    face=make_face(head,material)
    for frame,yaw in ((1,0),(24,.04),(48,0),(72,-.04),(96,0)):
        head.rotation_euler[2]=yaw
        head.keyframe_insert('rotation_euler',frame=frame,group='HeadIdle')
    bpy.context.scene.frame_start=1
    bpy.context.scene.frame_end=96
    bpy.context.scene.frame_set(1)
    blend.parent.mkdir(parents=True,exist_ok=True)
    webglb.parent.mkdir(parents=True,exist_ok=True)
    bpy.ops.wm.save_as_mainfile(filepath=str(blend),compress=True)
    bpy.ops.export_scene.gltf(filepath=str(webglb),export_format='GLB',
                              export_extras=True,export_morph=True,
                              export_animations=True)
    assert len(face.data.shape_keys.key_blocks)==8
    print('STUDY05_ASSEMBLY_OK',blend,webglb)

if __name__=='__main__':
    main()
