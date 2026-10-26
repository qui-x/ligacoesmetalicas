"""Sommerfeld revisão 10: edge loops de pálpebras deformáveis e cena unificada.
Método inspirado nas etapas de topologia/modelagem/UV/animação descritas
pelo CrossMind Studio. Geometrias autorais. Não utiliza assets do curso.
Saídas .blend + .glb derivadas da mesma cena; requer Blender real:
 blender -b --factory-startup --python jazz-club/blender/refine_sommerfeld_10.py -- \
  --output dist/jazz-club/assets/sommerfeld-study.glb \
  --blend dist/jazz-club/assets/sommerfeld-study.blend
"""
import argparse,sys
from pathlib import Path
import bpy
HERE=Path(__file__).resolve().parent
sys.path.insert(0,str(HERE))
import refine_sommerfeld_09 as previous
import facial_topology10 as topology
import build_sommerfeld as base

def build_eyelid(side,head,skin):
    points,quads,morphs=topology.eyelid_patch(side)
    report=topology.validate_eyelid(side)
    suffix='L' if side<0 else 'R'
    ob=base.mesh('EyeSocketLoops10_'+suffix,points,quads,skin,head)
    for face in ob.data.polygons:
        face.use_smooth=True
    uv=ob.data.uv_layers.new(name='EyeRingsUV')
    steps=topology.RADIAL_STEPS
    for polygon in ob.data.polygons:
        for li in polygon.loop_indices:
            vi=ob.data.loops[li].vertex_index
            uv.data[li].uv=((vi%steps)/steps,(vi//steps)/(topology.RINGS-1))
    ob.shape_key_add(name='Basis',from_mix=False)
    for name,coords in morphs.items():
        key=ob.shape_key_add(name=name,from_mix=False)
        for i,xyz in enumerate(coords):
            key.data[i].co=xyz
    ob['scientificContext']='Artistic face geometry, not a metal/electron representation'
    ob['topology']='Editable quad eyelid rings, not a fully retopologized head'
    ob['report']=str(report)
    return ob

def prepare_face():
    head=bpy.data.objects.get('HEAD_ANCHOR')
    root=bpy.data.objects.get('SOMMERFELD_ROOT')
    if not head or not root:
        raise RuntimeError('Head or root controller missing')
    # Remove experimental floating lid objects; replacing with quad eyelid loops.
    for ob in list(bpy.data.objects):
        if ob.name.startswith(('UpperLid_L','UpperLid_R')):
            bpy.data.objects.remove(ob,do_unlink=True)
    skin=bpy.data.materials.get('skin-pbr')
    if skin is None:
        raise RuntimeError('Facial material missing')
    for side in (-1,1):
        build_eyelid(side,head,skin)
    root['modelStatus']='sommerfeld-10-mesh-study-not-approved'
    root['sourceTechniques']='CrossMind Studio: topology-first, head/UV/animation workflow'
    root['technicalReview']='Eyelid loop morphs require Babylon render testing'
    face=bpy.data.objects.get('SOMMERFELD_FACE_QUAD_BASE')
    if not face or not face.data.shape_keys:
        raise RuntimeError('Original head shape keys lost')
    return root

def main():
    args=sys.argv[sys.argv.index('--')+1:] if '--' in sys.argv else []
    cli=argparse.ArgumentParser()
    cli.add_argument('--output',required=True)
    cli.add_argument('--blend',required=True)
    opts=cli.parse_args(args)
    out,blend=Path(opts.output).resolve(),Path(opts.blend).resolve()
    out.parent.mkdir(parents=True,exist_ok=True)
    blend.parent.mkdir(parents=True,exist_ok=True)
    previous.assemble_scene(out)
    prepare_face()
    for side in ('L','R'):
        part=bpy.data.objects.get('EyeSocketLoops10_'+side)
        if not part or not part.data.shape_keys:
            raise RuntimeError('Eye rings missing')
        keys={k.name for k in part.data.shape_keys.key_blocks}
        if not {'Basis','Blink_'+side,'Squint_'+side,'BrowRaise'}.issubset(keys):
            raise RuntimeError('Eyelid morphs missing: '+side)
    bpy.ops.wm.save_as_mainfile(filepath=str(blend),compress=True)
    bpy.ops.export_scene.gltf(filepath=str(out),export_format='GLB',
                              export_extras=True,export_morph=True,
                              export_animations=True,export_image_format='AUTO')
    if not out.exists() or out.stat().st_size<8000 or not blend.exists():
        raise RuntimeError('Blender/GLB output missing')
    print('SOMMERFELD_10_EXPORTED',out.stat().st_size,blend.stat().st_size)

if __name__=='__main__':
    main()
