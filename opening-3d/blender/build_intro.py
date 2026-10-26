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


def attach_kinetic_title():
    """Build genuine 3D lettering in the same Blender scene, not an SVG overlay."""
    scene=bpy.context.scene
    scene.render.resolution_x=960
    scene.render.resolution_y=540
    scene.render.resolution_percentage=100
    scene.render.film_transparent=False
    try:
        scene.render.engine='BLENDER_EEVEE_NEXT'
    except Exception:
        scene.render.engine='BLENDER_EEVEE'
    bpy.data.objects['SILM_LOGO_MASTER'].location.z=1.13

    w=bpy.data.worlds.new('SILM_IVORY_STUDIO')
    scene.world=w
    w.use_nodes=True
    w.node_tree.nodes.get('Background').inputs['Color'].default_value=(0.84,0.81,0.75,1)
    w.node_tree.nodes.get('Background').inputs['Strength'].default_value=.8

    def area(name,location,energy,color,size=4):
        data=bpy.data.lights.new(name,'AREA')
        data.energy=energy
        data.color=color
        data.shape='DISK'
        data.size=size
        obj=bpy.data.objects.new(name,data)
        bpy.context.collection.objects.link(obj)
        obj.location=location
        obj.rotation_euler=(Vector((0,0,0))-obj.location).to_track_quat('-Z','Y').to_euler()
        return obj

    area('KEY_warm_studio',(-3,-5,5),1100,(1,.87,.66),5)
    area('FILL_cool_studio',(4,-3,1.5),720,(.83,.92,1),4)
    area('RIM_metallic',(0,2,4),1400,(1,.76,.41),3)
    sweep=area('SWEEP_across_SILM',(-3,-2,-1.2),25,(1,.89,.62),2)

    bpy.ops.object.camera_add(location=(0,-12,.12))
    camera=bpy.context.object
    camera.name='SILM_OPENING_CAMERA'
    camera.rotation_euler=(Vector((0,0,0))-camera.location).to_track_quat('-Z','Y').to_euler()
    camera.data.type='ORTHO'
    camera.data.ortho_scale=7
    scene.camera=camera

    mat_name=material('TITULO_SILM_GOLD',(.70,.45,.12),metallic=.92,roughness=.21)
    mat_desc=material('NOME_EXTENSO_GRAPHITE',(.10,.115,.13),metallic=.06,roughness=.72)
    mat_tag=material('ARQUITETURA_DOS_METAIS',(.28,.30,.33),metallic=.03,roughness=.78)
    from pathlib import Path
    serif_paths=['/usr/share/fonts/truetype/dejavu/DejaVuSerif.ttf',
                 '/usr/share/fonts/truetype/liberation2/LiberationSerif-Regular.ttf']
    sans_paths=['/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf',
                '/usr/share/fonts/truetype/liberation2/LiberationSans-Regular.ttf']
    italic_paths=['/usr/share/fonts/truetype/dejavu/DejaVuSerif-Italic.ttf',
                  '/usr/share/fonts/truetype/liberation2/LiberationSerif-Italic.ttf']
    def getfont(paths):
        for p in paths:
            if Path(p).exists(): return bpy.data.fonts.load(p)
        return None
    serif,sans,italic=(getfont(x) for x in (serif_paths,sans_paths,italic_paths))
    def title_object(name,value,fontsize,material,ft):
        cu=bpy.data.curves.new(name,'FONT')
        cu.body=value
        cu.size=fontsize
        cu.align_x='CENTER'
        cu.align_y='CENTER'
        cu.extrude=.026 if fontsize>.5 else .003
        cu.bevel_depth=.005 if fontsize>.5 else .001
        if ft:cu.font=ft
        obj=bpy.data.objects.new(name,cu)
        bpy.context.collection.objects.link(obj)
        obj.data.materials.append(material)
        obj.rotation_euler=(math.pi/2,0,0)
        return obj

    text_nodes=[title_object('SILM_LETRA_'+s,s,1.0,mat_name,serif) for s in 'SILM']
    bpy.context.view_layer.update()
    widths=[o.dimensions.x for o in text_nodes]
    gap=.10
    cursor=-(sum(widths)+3*gap)/2
    for i,o in enumerate(text_nodes):
        x=cursor+widths[i]/2
        cursor+=widths[i]+gap
        start=90+i*7
        poses=[(1,(x+(-.26 if i%2 else .26),.60,-1.45),.001,16),
               (start,(x+(-.26 if i%2 else .26),.60,-1.45),.001,16),
               (start+20,(x,-.13,-1.12),1.045,-1),
               (start+28,(x,-.13,-1.17),1,0)]
        for f,position,size,angle in poses:
            o.location=position
            o.scale=(size,size,size)
            o.rotation_euler=(math.pi/2,0,math.radians(angle))
            for p in ('location','scale','rotation_euler'):
                o.keyframe_insert(data_path=p,frame=f)

    description=title_object('SILM_NOME_COMPLETO','Simulador Interativo de Ligações Metálicas',.30,mat_desc,sans)
    bpy.context.view_layer.update()
    stretch=min(1,5.8/max(1e-6,description.dimensions.x))
    for f,at,yz in [(1,.001,(.6,-1.96)),(121,.001,(.6,-1.96)),(146,1.02,(-.13,-1.91)),(153,1,(-.13,-1.94))]:
        description.location=(0,yz[0],yz[1])
        description.scale=(stretch*at,at,at)
        description.keyframe_insert(data_path='location',frame=f)
        description.keyframe_insert(data_path='scale',frame=f)
    tagline=title_object('SILM_ASSINATURA','A Arquitetura dos Metais',.30,mat_tag,italic)
    for f,at,z in [(1,.001,-2.39),(139,.001,-2.39),(168,1.02,-2.39),(183,1,-2.41)]:
        tagline.location=(0,-.12,z)
        tagline.scale=(at,at,at)
        tagline.keyframe_insert(data_path='location',frame=f)
        tagline.keyframe_insert(data_path='scale',frame=f)
    for f,x,energy in [(99,-3,20),(117,-1.8,450),(147,.5,650),(168,2.6,340),(183,3.3,15)]:
        sweep.location.x=x
        sweep.data.energy=energy
        sweep.keyframe_insert(data_path='location',frame=f)
        sweep.data.keyframe_insert(data_path='energy',frame=f)
    for f,name in [(1,'01 - Metal se organiza'),(28,'02 - Formacao das hastes'),
                   (70,'03 - Eletrons'),(90,'04 - SILM letra a letra'),
                   (121,'05 - Nome completo'),(139,'06 - A Arquitetura dos Metais'),
                   (183,'07 - Marca completa')]:
        scene.timeline_markers.new(name,frame=f)
    scene.frame_set(1)

def run():
    ap=argparse.ArgumentParser()
    ap.add_argument('--output',required=True)
    ap.add_argument('--blend',required=True)
    ap.add_argument('--frames',default=None)
    ap.add_argument('--render',action='store_true')
    args=sys.argv[sys.argv.index('--')+1:] if '--' in sys.argv else []
    opts=ap.parse_args(args)
    build()
    attach_kinetic_title()
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
    if opts.render and opts.frames:
        os.makedirs(os.path.abspath(opts.frames),exist_ok=True)
        bpy.context.scene.render.filepath=os.path.join(os.path.abspath(opts.frames),'SILM_')
        bpy.ops.render.render(animation=True)
        print('SILM_TITLE_RENDER_OK')

if __name__=='__main__':
    run()
