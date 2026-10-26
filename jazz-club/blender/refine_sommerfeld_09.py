"""Sommerfeld 09: one Blender scene for editable .blend and Babylon.js GLB.
The shapes for rear scalp, collar and sleeves come from rev09_shapes.py,
also used by the local offline preview. The rest is still experimental.
Not a verified historical likeness or production-ready rig.
Example:
 blender -b --factory-startup --python jazz-club/blender/refine_sommerfeld_09.py -- \
 --output dist/jazz-club/assets/sommerfeld-study.glb \
 --blend dist/jazz-club/assets/sommerfeld-study.blend
"""
import argparse,math,sys
from pathlib import Path
import bpy
from mathutils import Vector
HERE=Path(__file__).resolve().parent
sys.path.insert(0,str(HERE))
import refine_sommerfeld_07 as previous
import refine_sommerfeld_08 as back08
import refine_sommerfeld_06 as curves
import build_sommerfeld as base
import rev09_shapes
import materials07

def loft_sleeve(name,a,b,r0,r1,parent,material):
    aa,bb=Vector(a),Vector(b)
    direction=(bb-aa).normalized()
    perpendicular=direction.cross(Vector((0,0,1)))
    if perpendicular.length<.0001:
        perpendicular=direction.cross(Vector((0,1,0)))
    perpendicular.normalize()
    cross=direction.cross(perpendicular).normalized()
    profiles=rev09_shapes.sleeve_profiles(r0,r1)
    n=28
    vertices,quads=[],[]
    for t,r in profiles:
        pos=aa.lerp(bb,t)
        for j in range(n):
            angle=math.tau*j/n
            vertices.append(pos+r*(math.cos(angle)*perpendicular+
                                   math.sin(angle)*cross))
    for row in range(len(profiles)-1):
        for j in range(n):
            a=row*n+j
            k=row*n+(j+1)%n
            quads.append((a,k,k+n,a+n))
    part=base.mesh(name,vertices,quads,material,parent)
    for poly in part.data.polygons:poly.use_smooth=True
    part['editable']='Shoulder sleeve loft; parent transform kept for pose tests'
    return part

def replace_sleeves():
    coat=bpy.data.materials['wool-charcoal']
    for node in list(bpy.data.objects):
        if node.name.startswith(('UpperSleeve','ForearmSleeve')) and node.type=='MESH':
            bpy.data.objects.remove(node,do_unlink=True)
    for side,key in ((-1,'L'),(1,'R')):
        upper=bpy.data.objects.get('ARM_'+key+'_UPPER')
        fore=bpy.data.objects.get('ARM_'+key+'_FORE')
        if upper is None or fore is None:
            raise RuntimeError('Missing arm controller '+key)
        loft_sleeve('UpperSleeve09_'+key,(0,0,0),
                    (side*.08,.04,-.31),.115,.096,upper,coat)
        loft_sleeve('ForearmSleeve09_'+key,(0,0,0),
                    (-side*.15,.23,-.15),.095,.086,fore,coat)

def replace_nape_and_collar(root,head):
    coat=bpy.data.materials['waistcoat-slate']
    hair=bpy.data.materials['hair-grey-brown']
    accent=bpy.data.materials['silver-strands']
    # The 08 version of the collar is removed to avoid competing surfaces.
    obsolete=bpy.data.objects.get('RearNeckCollar08')
    if obsolete:bpy.data.objects.remove(obsolete,do_unlink=True)
    points,faces=rev09_shapes.rear_collar_patch()
    collar=base.mesh('RearNeckCollar09',points,faces,coat,root)
    for p in collar.data.polygons:p.use_smooth=True
    # rev09_shapes returns coordinates in world basis; head is at Z=1.70.
    z_offset=head.location.z
    points,faces=rev09_shapes.rear_hair_patch()
    points=[(x,y,z-z_offset) for x,y,z in points]
    scalp=base.mesh('RearHairNapeContinuous09',points,faces,hair,head)
    for p in scalp.data.polygons:p.use_smooth=True
    for name,path,widths in rev09_shapes.rear_hair_locks():
        idx=int(name.rsplit('_',1)[-1])
        path=[(x,y,z-z_offset) for x,y,z in path]
        curves.surface_ribbon(name,path,widths,
                              accent if idx in (2,8) else hair,head,
                              normal=(0,0,1))
    for side in (-1,1):
        p=[(side*.197,-.015,1.735+.136),
           (side*.196,-.054,1.735+.086),
           (side*.178,-.120,1.735+.019),
           (side*.156,-.141,1.735-.052)]
        p=[(x,y,z-z_offset) for x,y,z in p]
        curves.surface_ribbon('HairRearTemporalBridge09_'+str(side),p,
                              [.0007,.005,.007,.0004],hair,head)

def assemble_scene(out):
    """Compose one editable Blender scene without exporting it. Reusable by future sculpt studies."""
    root=previous.create_scene()
    head=bpy.data.objects.get('HEAD_ANCHOR')
    if not root or not head:
        raise RuntimeError('Sommerfeld nodes not initialized')
    back08.build_back_coat(root)
    for ob in list(bpy.data.objects):
        if ob.name.endswith('08') or '08_' in ob.name:
            if ob.name!='RearNeckCollar08':
                ob.name=ob.name.replace('08','09')
    replace_nape_and_collar(root,head)
    replace_sleeves()
    previous.uv_for_unmapped_objects()
    materials07.generate(out.parent/'materials07')
    previous.assign_textures(out.parent/'materials07')
    root['modelStatus']='sommerfeld-09-unapproved-3D-study'
    root['reference']='Library of Congress ca. 1920-1925; artistic interpretation'
    root['sourceShapes']='rev09_shapes.py; shared with offline preview'
    required={'RearHairNapeContinuous09','RearNeckCollar09',
              'UpperSleeve09_L','UpperSleeve09_R',
              'ForearmSleeve09_L','ForearmSleeve09_R'}
    available={ob.name for ob in bpy.data.objects}
    if not required.issubset(available):
        raise RuntimeError('Missing shapes: '+str(required-available))
    face=bpy.data.objects.get('SOMMERFELD_FACE_QUAD_BASE')
    if not face or not face.data.shape_keys or len(face.data.shape_keys.key_blocks)<8:
        raise RuntimeError('The editable facial study lost morph keys')
    return root

def main():
    arguments=sys.argv[sys.argv.index('--')+1:] if '--' in sys.argv else []
    cli=argparse.ArgumentParser()
    cli.add_argument('--output',required=True)
    cli.add_argument('--blend',required=True)
    args=cli.parse_args(arguments)
    out,blend=Path(args.output).resolve(),Path(args.blend).resolve()
    out.parent.mkdir(parents=True,exist_ok=True)
    blend.parent.mkdir(parents=True,exist_ok=True)
    assemble_scene(out)
    bpy.ops.wm.save_as_mainfile(filepath=str(blend),compress=True)
    bpy.ops.export_scene.gltf(filepath=str(out),export_format='GLB',
                              export_extras=True,export_morph=True,
                              export_animations=True,export_image_format='AUTO')
    if not out.exists() or out.stat().st_size<8000 or not blend.exists():
        raise RuntimeError('No valid output from Blender')
    print('SOMMERFELD_09_EXPORTED',out.stat().st_size,blend.stat().st_size)

if __name__=='__main__':
    main()
