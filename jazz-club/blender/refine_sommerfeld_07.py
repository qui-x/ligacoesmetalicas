"""Blender 3.6+ character study 07: material maps + refined original details.
Generates one editable .blend + one GLB from the SAME Blender scene.
A study of volume/material; not a historically approved facial likeness.
Run:
 blender -b --factory-startup --python jazz-club/blender/refine_sommerfeld_07.py -- \
  --output dist/jazz-club/assets/sommerfeld-study.glb \
  --blend dist/jazz-club/assets/sommerfeld-study.blend
"""
import argparse,math,os,sys
from pathlib import Path
from mathutils import Vector
import bpy
HERE=Path(__file__).resolve().parent
sys.path.insert(0,str(HERE))
import refine_sommerfeld_06 as previous
import materials07

def uv_for_unmapped_objects():
    """Generated box/projection UVs; only starting points for artist UV unwrapping."""
    for obj in bpy.data.objects:
        if obj.type!='MESH' or obj.data.uv_layers:
            continue
        uv=obj.data.uv_layers.new(name='ProceduralStudyUV')
        for poly in obj.data.polygons:
            for loopidx in poly.loop_indices:
                vertex=obj.data.vertices[obj.data.loops[loopidx].vertex_index].co
                uv.data[loopidx].uv=(vertex.x*1.9+.5,vertex.z*1.7+.5)

def assign_textures(textures_dir):
    profiles={
        'skin-pbr':('skin',.81,0.0),
        'wool-charcoal':('wool',.92,0.0),
        'hair-grey-brown':('hair',.84,0.0),
        'waistcoat-slate':('vest',.89,0.0),
    }
    for material_name,(kind,rough,metal) in profiles.items():
        mat=bpy.data.materials.get(material_name)
        if mat is None:
            raise RuntimeError('Expected material missing: '+material_name)
        mat.use_nodes=True
        nodes=mat.node_tree.nodes
        bsdf=nodes.get('Principled BSDF')
        if bsdf is None:
            raise RuntimeError('Principled shader unavailable: '+material_name)
        image=bpy.data.images.load(str(textures_dir/(kind+'-albedo-07.png')),check_existing=True)
        image.pack()  # preserve the native .blend without external dependency
        image.colorspace_settings.name='sRGB'
        tex=nodes.new('ShaderNodeTexImage')
        tex.name='SourceBaked'+kind.title()
        tex.image=image
        mat.node_tree.links.new(tex.outputs['Color'],bsdf.inputs['Base Color'])
        bsdf.inputs['Roughness'].default_value=rough
        bsdf.inputs['Metallic'].default_value=metal
    return len(profiles)

def soften_surface(mesh_name):
    obj=bpy.data.objects.get(mesh_name)
    if obj is None:
        raise RuntimeError('Missing mesh '+mesh_name)
    if obj.type!='MESH':
        raise RuntimeError('Not a mesh '+mesh_name)
    for polygon in obj.data.polygons:
        polygon.use_smooth=True

def add_hair_flyaways(head):
    """Individual swept highlights, not an imported/human-hair asset."""
    hair=bpy.data.materials['hair-grey-brown']
    sil=bpy.data.materials['silver-strands']
    for side in (-1,1):
        for i in range(9):
            t=(i+.5)/9
            # Remain close to the existing procedural scalp; final hair will need sculpt.
            a=(.50+math.pi*t*.86) if side==1 else (-.50-math.pi*t*.86)
            path=[]
            widths=[]
            for j in range(18):
                u=j/17
                p=.15+.72*u
                phi=a-.10*u*side
                r=.209*math.sin(p)
                path.append((r*math.cos(phi),.193*math.sin(p)*math.sin(phi)-.011,
                             .291*math.cos(p)))
                widths.append(.0004+.0013*math.sin(math.pi*u)**1.1)
            previous.surface_ribbon('Sommerfeld07SideLock_%s_%s'%(side,i),
                                   path,widths,sil if i%7==0 else hair,
                                   head,normal=(0,0,1))

def create_scene():
    previous.base.create()
    root=bpy.data.objects.get('SOMMERFELD_ROOT')
    head=bpy.data.objects.get('HEAD_ANCHOR')
    if not root or not head:
        raise RuntimeError('Sommerfeld nodes not created')
    previous.face_and_hair(head)
    previous.garment_curves(root)
    add_hair_flyaways(head)
    root['modelStatus']='sommerfeld-study-07-not-approved'
    root['tech']='Blender GLB and BLEND from single scene'
    root['reference']='Library of Congress, Bain News, ca. 1920–1925'
    root['needReview']='portrait, sleeves, hands, eyelashes, hair, physics of cloth'
    for object_name in ('SOMMERFELD_FACE_QUAD_BASE','HairCap_Rev06'):
        soften_surface(object_name)
    uv_for_unmapped_objects()
    if not bpy.data.objects.get('SOMMERFELD_FACE_QUAD_BASE').data.shape_keys:
        raise RuntimeError('Facial shape keys missing')
    return root

def main():
    argv=sys.argv[sys.argv.index('--')+1:] if '--' in sys.argv else []
    parser=argparse.ArgumentParser()
    parser.add_argument('--output',required=True)
    parser.add_argument('--blend',required=True)
    args=parser.parse_args(argv)
    output=Path(args.output).resolve()
    blend=Path(args.blend).resolve()
    output.parent.mkdir(parents=True,exist_ok=True)
    blend.parent.mkdir(parents=True,exist_ok=True)
    create_scene()
    texdir=output.parent/'materials07'
    materials07.generate(texdir)
    assign_textures(texdir)
    bpy.ops.wm.save_as_mainfile(filepath=str(blend),compress=True)
    bpy.ops.export_scene.gltf(filepath=str(output),
                              export_format='GLB',
                              export_extras=True,
                              export_morph=True,
                              export_animations=True,
                              export_image_format='AUTO')
    if not blend.is_file() or not output.is_file() or output.stat().st_size<8000:
        raise RuntimeError('Blender output missing / GLB empty')
    print('SOMMERFELD_REV07_EXPORTED',output.stat().st_size,blend.stat().st_size)

if __name__=='__main__':
    main()
