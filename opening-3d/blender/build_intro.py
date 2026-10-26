"""SILM opening: procedural 3D study derived from official 256x240 SVG.
Source: assets/silm-simbolo.svg and docs/IDENTIDADE-VISUAL.md.
No scientific crystal structure is represented by the logo.
Run: blender -b --factory-startup --python opening-3d/blender/build_intro.py -- --output ...glb --blend ...blend
"""
import argparse, math, os, sys
import bpy
from mathutils import Vector

FPS = 30
LAST = 183
SCALE = 46.0
CENTRE = (134.0, 120.0)
FRONT = [(68,86),(160,86),(160,178),(68,178)]
BACK = [(108,50),(200,50),(200,142),(108,142)]
VERTICES = FRONT + BACK
NODE_CENTRE = (130,110)

def xyz(p, depth):
    return ((p[0]-CENTRE[0])/SCALE, depth, (CENTRE[1]-p[1])/SCALE)

def material(name, color, metallic=0.0, roughness=0.4, emission=0.0):
    m=bpy.data.materials.new(name)
    m.use_nodes=True
    p=m.node_tree.nodes.get('Principled BSDF')
    p.inputs['Base Color'].default_value=(*color,1)
    p.inputs['Metallic'].default_value=metallic
    p.inputs['Roughness'].default_value=roughness
    if emission:
        p.inputs['Emission Color'].default_value=(*color,1)
        p.inputs['Emission Strength'].default_value=emission
    m.diffuse_color=(*color,1)
    return m

def root_object():
    o=bpy.data.objects.new('SILM_LOGO_MASTER',None)
    bpy.context.collection.objects.link(o)
    o['reference']='assets/silm-simbolo.svg'
    o['semantic']='institutional-logo-not-crystallographic-structure'
    return o

def put_sphere(name,pos,r,mat,root,segments=24):
    bpy.ops.mesh.primitive_uv_sphere_add(segments=segments,ring_count=14,radius=r)
    o=bpy.context.object
    o.name=name
    o.parent=root
    o.location=pos
    o.data.materials.append(mat)
    for p in o.data.polygons: p.use_smooth=True
    return o

def put_edge(name,a,b,r,mat,root):
    a,b=Vector(a),Vector(b)
    d=b-a
    bpy.ops.mesh.primitive_cylinder_add(vertices=12,radius=r,depth=1.0)
    o=bpy.context.object
    o.name=name
    o.parent=root
    o.rotation_euler=d.to_track_quat('Z','Y').to_euler()
    o.data.materials.append(mat)
    for p in o.data.polygons: p.use_smooth=True
    # Start at first endpoint; extend progressively to complete the segment.
    o.location=a
    o.scale.z=0.001
    for f, loc, height in [(1,a,.001),(28,a,.001),(61,(a+b)*.5,d.length)]:
        o.location=loc
        o.scale.z=height
        o.keyframe_insert(data_path='location',frame=f)
        o.keyframe_insert(data_path='scale',frame=f)
    return o

def interp(a,b,t):
    return a*(1-t)+b*t

def bezier(a,b,c,d,t):
    x=(1-t)**3
    u=t*t
    return (x*a[0]+3*(1-t)**2*t*b[0]+3*(1-t)*u*c[0]+t**3*d[0],
            x*a[1]+3*(1-t)**2*t*b[1]+3*(1-t)*u*c[1]+t**3*d[1])

def electron_curve():
    pieces=[
        ((82,133),(98,132),(109,112),(126,110)),
        ((126,110),(143,108),(151,127),(167,127)),
        ((167,127),(181,127),(190,118),(202,109)),
    ]
    out=[]
    for a,b,c,d in pieces:
        out.extend([bezier(a,b,c,d,i/12) for i in range(12)])
    out.append((202,109))
    return out

def build():
    bpy.ops.wm.read_factory_settings(use_empty=True)
    scene=bpy.context.scene
    scene.frame_start=1
    scene.frame_end=LAST
    scene.render.fps=FPS
    master=root_object()
    gold=material('SILM_gold_PBR',(.67,.43,.105),metallic=.88,roughness=.25)
    gold_light=material('SILM_gold_highlight',(.89,.68,.27),metallic=.72,roughness=.17)
    cyan=material('SILM_electron_blue',(.08,.47,.78),metallic=.03,roughness=.33,emission=2.0)
    blue_point=material('SILM_blue_points',(.39,.81,.96),emission=3.3)
    # Edges preserve the exact projected geometry of the institutional SVG.
    segments=[(0,1),(1,2),(2,3),(3,0),
              (4,5),(5,6),(6,7),(7,4),
              (0,4),(1,5),(2,6),(3,7)]
    pts=[xyz(v,-.5 if i<4 else .5) for i,v in enumerate(VERTICES)]
    for i,(a,b) in enumerate(segments):
        put_edge('SILM_STRUT_%02d'%i,pts[a],pts[b],.027,gold,master)
    # Volumetric centers: 8 external vertices plus an inner center.
    for i,(p,at) in enumerate(zip(VERTICES,pts)):
        radius=(12.8 if i<4 else (11 if i in (4,5) else 10.2))/SCALE
        o=put_sphere('SILM_VERTEX_%02d'%i,at,radius,gold_light if i<4 else gold,master)
        shift=Vector(((-1)**i*(.28+.04*(i%3)), -.08, (-1)**(i+1)*(.22+.02*(i%4))))
        for frame,position,size in [(1,Vector(at)+shift,.02),(24,Vector(at)+shift*.44,.72),(59,Vector(at),1.06),(69,Vector(at),1)]:
            o.location=position
            o.scale=(size,size,size)
            o.keyframe_insert(data_path='location',frame=frame)
            o.keyframe_insert(data_path='scale',frame=frame)
    at=xyz(NODE_CENTRE,0.0)
    center=put_sphere('SILM_INTERNAL_CENTRE',at,13.2/SCALE,gold_light,master)
    for frame,size in [(1,.001),(25,.001),(66,1.08),(75,1)]:
        center.scale=(size,)*3
        center.keyframe_insert(data_path='scale',frame=frame)
    # Short, softly curved electron ribbon, matching original cubic segments.
    curve=electron_curve()
    for i in range(len(curve)-1):
        a,b=xyz(curve[i],-.13),xyz(curve[i+1],-.13)
        d=Vector(b)-Vector(a)
        bpy.ops.mesh.primitive_cylinder_add(vertices=10,radius=.050,depth=1.0)
        o=bpy.context.object
        o.name='ELECTRON_RIBBON_%02d'%i
        o.parent=master
        o.location=(Vector(a)+Vector(b))*.5
        o.rotation_euler=d.to_track_quat('Z','Y').to_euler()
        o.data.materials.append(cyan)
        for frame,size in [(1,.001),(71,.001),(88,d.length)]:
            o.scale.z=size
            o.keyframe_insert(data_path='scale',frame=frame)
    # Three visibly mobile electrons. Motion itself is baked to GLB keyframes.
    for j in range(3):
        initial=xyz(curve[(j*11)%len(curve)],-.18)
        dot=put_sphere('ELECTRON_PARTICLE_%d'%(j+1),initial,.087,blue_point,master,16)
        dot.scale=(.001,)*3
        dot.keyframe_insert(data_path='scale',frame=1)
        dot.keyframe_insert(data_path='scale',frame=76)
        dot.scale=(1,)*3
        dot.keyframe_insert(data_path='scale',frame=86)
        for frame in range(86,LAST+1,4):
            t=((frame-86)/94.0 + j/3.0)%1.0
            pos=curve[round(t*(len(curve)-1))]
            dot.location=xyz(pos,-.18)
            dot.keyframe_insert(data_path='location',frame=frame)
        dot.location=xyz(curve[(j*11)%len(curve)],-.18)
        dot.keyframe_insert(data_path='location',frame=LAST)
    # Tiny thermal highlights, not a second structural or orbital model.
    for i in (0,2,4,6,8):
        point=pts[i] if i<8 else at
        glow=put_sphere('THERMAL_HIGHLIGHT_%d'%i,Vector(point)+Vector((0,-.06,.04)),
                        .07,gold_light,master,16)
        for frame,size in [(1,.001),(96,.001),(108,1.25),(122,.001)]:
            glow.scale=(size,)*3
            glow.keyframe_insert(data_path='scale',frame=frame)
    # Maleability and ductility: restrained silhouette changes; return to SVG master.
    for frame,sx,sz in [(1,1,1),(117,1,1),(129,1.035,1),(141,1,1),
                        (145,1,1),(155,1,1.055),(165,1,1),(LAST,1,1)]:
        master.scale=(sx,1,sz)
        master.keyframe_insert(data_path='scale',frame=frame)
    for action in bpy.data.actions:
        # Avoid constant-speed mechanical transitions on the logo itself.
        for fc in getattr(action,'fcurves',[]):
            for key in fc.keyframe_points:
                key.interpolation='BEZIER'
    scene.frame_set(LAST)
    return master

def run():
    ap=argparse.ArgumentParser()
    ap.add_argument('--output',required=True)
    ap.add_argument('--blend',required=True)
    args=sys.argv[sys.argv.index('--')+1:] if '--' in sys.argv else []
    opts=ap.parse_args(args)
    build()
    out=os.path.abspath(opts.output)
    blend=os.path.abspath(opts.blend)
    os.makedirs(os.path.dirname(out),exist_ok=True)
    os.makedirs(os.path.dirname(blend),exist_ok=True)
    bpy.ops.wm.save_as_mainfile(filepath=blend)
    # NLA/actions export default gathers keyed transform animations into glTF clips.
    bpy.ops.export_scene.gltf(filepath=out,export_format='GLB',
                              export_extras=True,export_animations=True)
    assert os.path.isfile(out) and os.path.getsize(out)>5000
    print('SILM_OPENING_GLB_OK',out,os.path.getsize(out))

if __name__=='__main__':
    run()
