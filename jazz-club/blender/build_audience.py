"""Build artist-editable seated-scientist blockout GLB assets with Blender (bpy).
This is a visual proxy, NOT likeness-homologated final character art.
Usage: blender -b -t 2 --python jazz-club/blender/build_audience.py -- --manifest jazz-club/data/scientists.json --output dist/jazz-club/assets/scientists-proxy.glb
"""
import argparse
import json
import math
import os
import sys
from mathutils import Vector
import bpy

def cli():
    argv = sys.argv[sys.argv.index("--")+1:] if "--" in sys.argv else []
    p=argparse.ArgumentParser()
    p.add_argument("--manifest",required=True)
    p.add_argument("--output",required=True)
    return p.parse_args(argv)

def rgba(hex_color):
    s=hex_color.lstrip("#")
    return tuple(int(s[i:i+2],16)/255 for i in (0,2,4))+(1.0,)

def mat(name,color,metallic=0.0,roughness=0.75):
    m=bpy.data.materials.new(name)
    m.diffuse_color=rgba(color)
    m.use_nodes=True
    bsdf=m.node_tree.nodes.get("Principled BSDF")
    bsdf.inputs["Base Color"].default_value=rgba(color)
    bsdf.inputs["Metallic"].default_value=metallic
    bsdf.inputs["Roughness"].default_value=roughness
    return m

def material(obj,m):
    obj.data.materials.append(m)
    return obj

def parent_keep_world(obj,par):
    current=obj.matrix_world.copy()
    obj.parent=par
    obj.matrix_world=current
    return obj

def ellipsoid(name,center,scale,m,segments=24,rings=12,par=None):
    bpy.ops.mesh.primitive_uv_sphere_add(segments=segments,ring_count=rings,location=center)
    o=bpy.context.object
    o.name=name
    o.scale=scale
    material(o,m)
    bpy.ops.object.shade_smooth()
    if par: parent_keep_world(o,par)
    return o

def cube(name,center,scale,m,par=None):
    bpy.ops.mesh.primitive_cube_add(size=1,location=center)
    o=bpy.context.object
    o.name=name
    o.dimensions=scale
    bpy.ops.object.transform_apply(location=False,rotation=False,scale=True)
    material(o,m)
    if par: parent_keep_world(o,par)
    return o

def link_between(name,pa,pb,radius,m,par=None):
    mid=(Vector(pa)+Vector(pb))/2
    diff=Vector(pb)-Vector(pa)
    bpy.ops.mesh.primitive_cylinder_add(vertices=12,radius=radius,depth=diff.length,location=mid)
    o=bpy.context.object
    o.name=name
    o.rotation_euler=diff.to_track_quat("Z","Y").to_euler()
    material(o,m)
    if par: parent_keep_world(o,par)
    return o

def empty(name,at):
    o=bpy.data.objects.new(name,None)
    bpy.context.collection.objects.link(o)
    o.location=at
    return o

def seat(prefix,x,y,upholstery,wood):
    # Chair and table included for composition preview; production scenery uses separate high-detail assets.
    cube(prefix+"-seat",(x,y,0.57),(0.73,0.7,0.14),upholstery)
    cube(prefix+"-back",(x,y-0.34,1.02),(0.77,0.12,0.92),wood)
    for dx in (-.31,.31):
        for dy in (-.28,.28):
            cube(prefix+"-leg",(x+dx,y+dy,.29),(.07,.07,.57),wood)

def glasses(prefix,x,y,z,gold,rig):
    for dx in (-.084,.084):
        bpy.ops.mesh.primitive_torus_add(major_segments=20,minor_segments=6,location=(x+dx,y+.194,z))
        o=bpy.context.object
        o.name=prefix+"-glasses"
        o.rotation_euler.x=math.pi/2
        o.scale=(.065,.066,.065)
        material(o,gold)
        parent_keep_world(o,rig)
    link_between(prefix+"-bridge",(x-.019,y+.194,z),(x+.019,y+.194,z),.007,gold,rig)

def scientist(s,i,mats):
    x,y=map(float,s["seat"])
    tag=s["id"]
    colors=s["costume"]
    jacket=mat(tag+"-coat",colors["coat"],roughness=.88)
    vest=mat(tag+"-vest",colors["vest"],roughness=.88)
    hair=mat(tag+"-hair",colors["hair"],roughness=.91)
    trim=mat(tag+"-trim",colors["accent"],metallic=.24,roughness=.36)
    skin=mats["skin"]
    # Rig-friendly named groups (one head controller per person).
    root=empty("scientist-"+tag+"-ROOT",(x,y,0))
    root["scientistId"]=tag
    root["scientificRole"]=s["role"]
    root["interpretation"]="Fictionalized historical tribute; blockout proxy, not verified likeness."
    seat("chair-"+tag,x,y,mats["upholstery"],mats["wood"])
    ellipsoid(tag+"-torso",(x,y,1.03),(.32,.24,.42),jacket,par=root)
    ellipsoid(tag+"-vest-body",(x,y+.115,1.045),(.215,.138,.33),vest,par=root)
    ellipsoid(tag+"-neck",(x,y+.01,1.40),(.10,.102,.17),skin,par=root)
    cube(tag+"-shirt-collar",(x,y+.227,1.32),(.105,.035,.15),mats["shirt"],root)
    ellipsoid(tag+"-tie",(x,y+.252,1.19),(.041,.020,.16),trim,par=root)
    for side in (-1,1):
        dx=side*.34
        link_between(tag+"-arm-upper",(x+dx*.77,y,1.29),(x+dx,y+.07,.92),.115,jacket,root)
        link_between(tag+"-arm-fore",(x+dx,y+.07,.92),(x+side*.23,y+.31,.76),.092,jacket,root)
        ellipsoid(tag+"-hand",(x+side*.23,y+.31,.76),(.085,.073,.06),skin,par=root)
        ellipsoid(tag+"-thigh",(x+side*.17,y+.13,.64),(.135,.28,.13),jacket,par=root)
        link_between(tag+"-shin",(x+side*.17,y+.32,.63),(x+side*.17,y+.35,.20),.099,jacket,root)
        ellipsoid(tag+"-shoe",(x+side*.17,y+.49,.13),(.137,.24,.09),mats["shoe"],par=root)
    head=empty("scientist-"+tag+"-HEAD",(x,y,1.68))
    parent_keep_world(head,root)
    ellipsoid(tag+"-skull",(x,y,1.68),(.205,.19,.245),skin,par=head)
    ellipsoid(tag+"-hair-cap",(x,y-.011,1.837),(.209,.19,.108),hair,par=head)
    ellipsoid(tag+"-nose",(x,y+.185,1.64),(.049,.075,.078),skin,par=head)
    for side in (-1,1):
        ellipsoid(tag+"-ear",(x+side*.199,y,1.66),(.046,.060,.073),skin,par=head)
        ellipsoid(tag+"-eye",(x+side*.087,y+.17,1.69),(.023,.012,.022),mats["eye"],par=head)
        ellipsoid(tag+"-brow",(x+side*.085,y+.176,1.745),(.073,.012,.013),hair,par=head)
    # The following profiles are artistic proxies; portrait-specific moustache/hair will be approved later.
    if i in (0,1,4,6):
        ellipsoid(tag+"-moustache",(x,y+.203,1.585),(.089,.023,.020),hair,par=head)
    if colors.get("glasses"):
        glasses(tag,x,y,1.69,trim,head)
    # Head turns + nods as subtle seated idle, keyframed for the GLB export.
    phase=i*.39
    for frame in (1,45,90,135,180):
        t=frame/180*math.tau + phase
        head.rotation_euler.z=math.sin(t)*.075
        head.rotation_euler.x=math.cos(t)*.025
        head.keyframe_insert(data_path="rotation_euler",frame=frame,group="HeadIdle")
    # Standardize the position to avoid characters appearing to speak or respond historically.
    return root

def main():
    args=cli()
    with open(args.manifest,encoding="utf-8") as f:
        data=json.load(f)
    audience=data.get("scientists",[])
    if len(audience)!=8 or len({p["id"] for p in audience})!=8:
        raise ValueError("Expected eight distinct scientists.")
    bpy.ops.wm.read_factory_settings(use_empty=True)
    scene=bpy.context.scene
    scene.render.fps=30
    scene.frame_start=1
    scene.frame_end=180
    shared={
        "skin":mat("shared-skin","#c7a58c",roughness=.82),
        "shirt":mat("shared-shirt","#e3ddcc",roughness=.9),
        "eye":mat("shared-eye","#1f2527",roughness=.4),
        "shoe":mat("shared-shoes","#171a1c",roughness=.6),
        "upholstery":mat("shared-seat","#4e2937",roughness=.89),
        "wood":mat("shared-mahogany","#442a20",roughness=.65),
    }
    for i,person in enumerate(audience):
        scientist(person,i,shared)
    os.makedirs(os.path.dirname(os.path.abspath(args.output)),exist_ok=True)
    bpy.ops.export_scene.gltf(filepath=os.path.abspath(args.output),
                              export_format="GLB",
                              export_animations=True,
                              export_extras=True,
                              export_apply=True)
    if os.path.getsize(args.output)<1024:
        raise RuntimeError("Exported GLB is unexpectedly small.")
    print("JAZZ_AUDIENCE_OK",len(audience),os.path.getsize(args.output),args.output)

if __name__=="__main__":
    main()
