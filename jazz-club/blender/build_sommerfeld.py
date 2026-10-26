"""Sommerfeld hero-character geometry study for Blender 3.6+.
This is a detailed procedural BLOCKOUT, not a likeness-approved final sculpt.
Run: blender -b --factory-startup --python jazz-club/blender/build_sommerfeld.py -- --output dist/jazz-club/assets/sommerfeld-study.glb
"""
import argparse, math, os, sys
import bpy
from mathutils import Vector

def color(name, rgb, metal=0, rough=.78):
    m=bpy.data.materials.new(name)
    m.use_nodes=True
    m.diffuse_color=(*rgb,1)
    bsdf=m.node_tree.nodes.get('Principled BSDF')
    bsdf.inputs['Base Color'].default_value=(*rgb,1)
    bsdf.inputs['Roughness'].default_value=rough
    bsdf.inputs['Metallic'].default_value=metal
    return m

def ctrl(name,pos,parent=None):
    o=bpy.data.objects.new(name,None)
    bpy.context.collection.objects.link(o)
    o.location=pos
    o.parent=parent
    return o

def mesh(name,points,faces,material,parent):
    d=bpy.data.meshes.new(name+'-topology')
    d.from_pydata(points,[],faces)
    d.update()
    o=bpy.data.objects.new(name,d)
    bpy.context.collection.objects.link(o)
    o.parent=parent
    o.data.materials.append(material)
    for polygon in d.polygons: polygon.use_smooth=True
    return o

def sphere(name,xyz,scale,material,parent):
    bpy.ops.mesh.primitive_uv_sphere_add(segments=32,ring_count=18)
    o=bpy.context.object
    o.name=name
    o.parent=parent
    o.location=xyz
    o.scale=scale
    o.data.materials.append(material)
    bpy.ops.object.shade_smooth()
    return o

def piece(name,start,end,radius,material,parent):
    a,b=Vector(start),Vector(end)
    bpy.ops.mesh.primitive_cylinder_add(vertices=18,radius=radius,depth=(b-a).length)
    o=bpy.context.object
    o.name=name
    o.parent=parent
    o.location=(a+b)/2
    o.rotation_euler=(b-a).to_track_quat('Z','Y').to_euler()
    o.data.materials.append(material)
    return o

def face_quadmesh(material,head):
    rows,segments=38,64
    vertices=[]
    for i in range(rows+1):
        polar=.001+(math.pi-.002)*i/rows
        z=.285*math.cos(polar)
        s=math.sin(polar)
        for k in range(segments):
            a=2*math.pi*k/segments
            x=.203*s*math.cos(a)
            y=.186*s*math.sin(a)
            x*=1-.11*max(0,(-z-.045)/.24)
            frontal=max(0.,math.sin(a))
            def gauss(cx,cz,wx,wz):
                return math.exp(-((x-cx)/wx)**2-((z-cz)/wz)**2)
            y+=frontal*(.013*gauss(-.1,-.052,.064,.07)+
                        .013*gauss(.1,-.052,.064,.07)-
                        .019*gauss(-.075,.05,.049,.038)-
                        .019*gauss(.075,.05,.049,.038)+
                        .014*gauss(0,.076,.042,.14)+
                        .045*gauss(0,-.03,.05,.05))
            vertices.append((x,y,z))
    quads=[]
    for i in range(rows):
        for k in range(segments):
            a=i*segments+k
            b=i*segments+(k+1)%segments
            quads.append((a,b,b+segments,a+segments))
    obj=mesh('SOMMERFELD_FACE_QUAD_BASE',vertices,quads,material,head)
    obj.shape_key_add(name='Basis',from_mix=False)
    for name in ['Blink_L','Blink_R','BrowRaise','Smile']:
        key=obj.shape_key_add(name=name,from_mix=False)
        for j,v in enumerate(obj.data.vertices):
            x,y,z=v.co
            front=max(0,min(1,(y+.02)/.20))
            if name=='BrowRaise':
                g=math.exp(-((abs(x)-.08)/.075)**2-((z-.12)/.05)**2)
                key.data[j].co=(x,y,z+.016*g*front)
            elif name=='Smile':
                g=math.exp(-((abs(x)-.105)/.057)**2-((z+.13)/.06)**2)
                key.data[j].co=(x,y+.012*g*front,z+.008*g*front)
            else:
                side=-1 if name=='Blink_L' else 1
                g=math.exp(-((x-side*.08)/.05)**2-((z-.054)/.046)**2)
                key.data[j].co=(x,y-.014*g*front,z-.013*g*front)
    return obj

def create():
    bpy.ops.wm.read_factory_settings(use_empty=True)
    scene=bpy.context.scene
    scene.render.fps=30
    skin=color('skin-pbr',(.65,.45,.35),rough=.84)
    shadow=color('face-shadow-pbr',(.39,.28,.24),rough=.91)
    hair=color('hair-grey-brown',(.24,.22,.21),rough=.89)
    grey=color('silver-strands',(.38,.37,.34),rough=.9)
    eye=color('iris-dark',(.16,.115,.085),rough=.4)
    white=color('sclera',(.77,.74,.66),rough=.53)
    coat=color('wool-charcoal',(.09,.10,.115),rough=.92)
    waist=color('waistcoat-slate',(.21,.205,.205),rough=.86)
    ivory=color('cotton-ivory',(.83,.80,.71),rough=.89)
    brass=color('brass-aged',(.57,.40,.19),metal=.7,rough=.35)
    root=ctrl('SOMMERFELD_ROOT',(0,0,0))
    root['scientistId']='sommerfeld'
    root['modelStatus']='artistic-study-not-verified-likeness'
    root['portraitSource']='https://www.loc.gov/item/2014715010/'
    root['sceneYear']='1925 (fictional historical meeting)'
    # Garments: editable shells and tailored lapels (not a shared primitive).
    layers=[(1.37,.28,.16),(1.28,.36,.22),(1.05,.32,.2),(.95,.27,.18)]
    pts=[]
    for h,rx,ry in layers:
        for k in range(32):
            theta=2*math.pi*k/32
            pts.append((rx*math.cos(theta),ry*math.sin(theta),h))
    faces=[]
    for row in range(len(layers)-1):
        for k in range(32):
            a=row*32+k
            b=row*32+(k+1)%32
            faces.append((a,b,b+32,a+32))
    mesh('TailoredThreePieceJacket',pts,faces,coat,root)
    sphere('Waistcoat',(0,.11,1.16),(.23,.115,.24),waist,root)
    sphere('ShirtCollar',(0,.22,1.38),(.095,.042,.11),ivory,root)
    piece('Tie',(0,.25,1.32),(0,.25,1.1),.025,brass,root)
    for side in (-1,1):
        mesh('Lapel'+str(side),[(side*.06,.19,1.40),(side*.29,.18,1.28),
                                (side*.11,.248,1.06)],[(0,1,2)],waist,root)
        upper=ctrl('ARM_'+('L' if side<0 else 'R')+'_UPPER',(side*.31,0,1.26),root)
        piece('UpperSleeve',(0,0,0),(side*.08,.04,-.31),.115,coat,upper)
        fore=ctrl('ARM_'+('L' if side<0 else 'R')+'_FORE',(side*.08,.04,-.31),upper)
        piece('ForearmSleeve',(0,0,0),(-side*.15,.23,-.15),.095,coat,fore)
        sphere('AnatomicalHand',(-side*.15,.23,-.15),(.07,.092,.049),skin,fore)
        sphere('SeatedThigh',(side*.15,.16,.71),(.15,.29,.13),coat,root)
        piece('TrouserLeg',(side*.15,.35,.68),(side*.15,.42,.24),.11,coat,root)
        sphere('Shoe',(side*.15,.56,.14),(.14,.24,.08),coat,root)
    sphere('Neck',(0,0,1.46),(.10,.10,.14),skin,root)
    head=ctrl('HEAD_ANCHOR',(0,0,1.70),root)
    face_quadmesh(skin,head)
    sphere('NoseBridge',(0,.178,.00),(.044,.06,.106),skin,head)
    sphere('NoseTip',(0,.244,-.076),(.061,.069,.048),skin,head)
    for side in (-1,1):
        sphere('Ear',(side*.199,-.006,-.012),(.052,.055,.107),skin,head)
        sphere('EarConcha',(side*.223,.037,-.012),(.024,.017,.059),shadow,head)
        sphere('EyeSclera',(side*.079,.172,.056),(.05,.032,.025),white,head)
        sphere('Iris',(side*.079,.201,.056),(.020,.011,.020),eye,head)
        sphere('UpperLid',(side*.079,.197,.082),(.058,.017,.014),skin,head)
        brow=sphere('Eyebrow',(side*.084,.175,.127),(.072,.017,.019),hair,head)
        brow.rotation_euler.y=side*.10
        for k in range(6):
            f=(k+.5)/6
            sphere('MoustacheStrand',(side*(.018+.075*f),.218,-.122-.013*f),
                   (.019,.015,.02),hair,head)
    sphere('SweptHair',(0,-.025,.235),(.205,.185,.080),hair,head)
    for side in (-1,1):
        for k in range(6):
            sphere('TempleStrand',(side*(.174-.015*k),-.018,.135+.020*k),
                   (.037,.05,.038),grey if k%3==0 else hair,head)
    # Frames are modeled as real geometry, not added as a 2D sprite.
    for side in (-1,1):
        bpy.ops.mesh.primitive_torus_add(major_segments=32,minor_segments=8,
                         location=(0,0,0),major_radius=.069,minor_radius=.005)
        o=bpy.context.object
        o.name='RoundSpectacles'
        o.parent=head
        o.location=(side*.08,.205,.058)
        o.rotation_euler.x=math.pi/2
        o.data.materials.append(brass)
        piece('SpectacleTemple',(side*.147,.19,.06),(side*.211,.01,.06),.004,brass,head)
    piece('SpectacleBridge',(-.014,.21,.058),(.014,.21,.058),.005,brass,head)
    # Root and head are exported as named Babylon pose controllers.
    head['controls']='look_stage, idle_seated, head_turn'
    root['animationLogic']='Babylon Animation on named GLB nodes; not physical dynamics'
    return root

def run():
    args=sys.argv[sys.argv.index('--')+1:] if '--' in sys.argv else []
    p=argparse.ArgumentParser()
    p.add_argument('--output',required=True)
    p.add_argument('--blend',default=None)
    opts=p.parse_args(args)
    create()
    path=os.path.abspath(opts.output)
    os.makedirs(os.path.dirname(path),exist_ok=True)
    bpy.ops.export_scene.gltf(filepath=path,export_format='GLB',export_extras=True,
                              export_morph=True,export_animations=True)
    assert os.path.isfile(path) and os.path.getsize(path)>4000
    if opts.blend:
        blend=os.path.abspath(opts.blend)
        os.makedirs(os.path.dirname(blend),exist_ok=True)
        bpy.ops.wm.save_as_mainfile(filepath=blend)
    print('SOMMERFELD_STUDY_EXPORT_OK',os.path.getsize(path))
if __name__=='__main__': run()
