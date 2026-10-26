"""Sommerfeld Rev11 — eyelid + mouth quad rings; .blend and GLB from ONE scene.
CrossMind-inspired topology-first method; original geometry, no tutorial assets.
Requires Blender with bpy and glTF exporter. Study, not likeness-approved.

blender -b --factory-startup --python jazz-club/blender/refine_sommerfeld_11.py -- \
  --output dist/jazz-club/assets/sommerfeld-study.glb \
  --blend dist/jazz-club/assets/sommerfeld-study.blend
"""
import argparse
import sys
from pathlib import Path
import bpy

HERE=Path(__file__).resolve().parent
sys.path.insert(0,str(HERE))
import refine_sommerfeld_09 as scene_base
import refine_sommerfeld_10 as eye_topology
import facial_mouth11 as mouth_geometry
import build_sommerfeld as base

def lip_material():
    material=bpy.data.materials.get('warm-lips-study11')
    if material:return material
    return base.color('warm-lips-study11',(.44,.225,.205),rough=.81)

def mouth_cavity_material():
    m=bpy.data.materials.get('mouth-cavity-study11')
    if m:return m
    return base.color('mouth-cavity-study11',(.095,.043,.044),rough=.94)

def build_mouth(head,skin):
    verts,quads,morphs=mouth_geometry.mouth_patch()
    report=mouth_geometry.validate_mouth()
    ob=base.mesh('MouthLoops11',verts,quads,skin,head)
    ob.data.materials.append(lip_material())
    # Most outer loops are skin; inner rings have darker lip material.
    step=mouth_geometry.RADIAL_STEPS
    for face in ob.data.polygons:
        face.use_smooth=True
        ring=face.index//step
        face.material_index=1 if ring>=2 else 0
    uv=ob.data.uv_layers.new(name='MouthRingsUV')
    for face in ob.data.polygons:
        for loop_id in face.loop_indices:
            idx=ob.data.loops[loop_id].vertex_index
            uv.data[loop_id].uv=((idx%step)/step,
                                 (idx//step)/(mouth_geometry.RINGS-1))
    ob.shape_key_add(name='Basis',from_mix=False)
    for name,positions in morphs.items():
        key=ob.shape_key_add(name=name,from_mix=False)
        for i,xyz in enumerate(positions):
            key.data[i].co=xyz
    ob['topology11']=str(report)
    ob['status']='Study only; mouth patch not yet sewn to full face'
    # Dark aperture is independent, recessed and not an anatomical interior.
    # It serves as a backdrop for the JawOpen study without exposing skin behind.
    import math
    zc=-.163
    points=[(0,.211,zc)]
    for i in range(step):
        a=math.tau*i/step
        points.append((.049*math.cos(a),.211,zc+.007*math.sin(a)))
    triangles=[(0,i+1,(i+1)%step+1) for i in range(step)]
    cavity=base.mesh('MouthCavityStudy11',points,triangles,
                     mouth_cavity_material(),head)
    for face in cavity.data.polygons:face.use_smooth=True
    cavity['status']='Recessed visualization only, no teeth/tongue rig'
    return ob

def main():
    argv=sys.argv[sys.argv.index('--')+1:] if '--' in sys.argv else []
    p=argparse.ArgumentParser()
    p.add_argument('--output',required=True)
    p.add_argument('--blend',required=True)
    args=p.parse_args(argv)
    glb,blend=Path(args.output).resolve(),Path(args.blend).resolve()
    glb.parent.mkdir(parents=True,exist_ok=True)
    blend.parent.mkdir(parents=True,exist_ok=True)
    scene_base.assemble_scene(glb)
    eye_topology.prepare_face()
    head=bpy.data.objects.get('HEAD_ANCHOR')
    root=bpy.data.objects.get('SOMMERFELD_ROOT')
    if not head or not root:
        raise RuntimeError('Missing head / root')
    skin=bpy.data.materials.get('skin-pbr')
    if skin is None:raise RuntimeError('Missing skin material')
    # Remove old decorative lip seam; the new lip surface has real topology.
    for obj in list(bpy.data.objects):
        if obj.name.startswith(('NaturalLipSeam','LipsArc','MouthRibbon')):
            bpy.data.objects.remove(obj,do_unlink=True)
    lips=build_mouth(head,skin)
    root['modelStatus']='study-11-expression-topology-not-approved'
    required=('MouthLoops11','EyeSocketLoops10_L','EyeSocketLoops10_R',
              'SOMMERFELD_FACE_QUAD_BASE')
    if any(bpy.data.objects.get(name) is None for name in required):
        raise RuntimeError('Some facial meshes are missing')
    if len(lips.data.shape_keys.key_blocks)!=1+len(mouth_geometry.MORPHS):
        raise RuntimeError('Mouth morph targets missing')
    bpy.ops.wm.save_as_mainfile(filepath=str(blend),compress=True)
    bpy.ops.export_scene.gltf(filepath=str(glb),export_format='GLB',
                              export_extras=True,export_morph=True,
                              export_animations=True,export_image_format='AUTO')
    if not glb.exists() or glb.stat().st_size<8000 or not blend.exists():
        raise RuntimeError('Blender outputs missing/empty')
    print('SOMMERFELD_STUDY11_EXPORTED',glb.stat().st_size,blend.stat().st_size)

if __name__=='__main__':
    main()
