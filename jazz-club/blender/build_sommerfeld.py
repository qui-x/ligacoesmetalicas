"""Sommerfeld hero-character geometry study for Blender 3.6+.
This is a detailed procedural BLOCKOUT, not a likeness-approved final sculpt.
Run: blender -b --factory-startup --python jazz-club/blender/build_sommerfeld.py -- --output dist/jazz-club/assets/sommerfeld-study.glb
"""
import argparse, math, os, sys
import bpy
from mathutils import Vector
# Explicit Blender --python import path, independent of the GitHub runner cwd.
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import face_anatomy as face_profile

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
    # Shared, testable quad surface; editable anatomical study, not final likeness.
    vertices,faces=face_profile.head_geometry()
    targets=face_profile.facial_targets(vertices)
    report=face_profile.validate_topology(vertices,faces,targets)
    obj=mesh('SOMMERFELD_FACE_QUAD_BASE',vertices,faces,material,head)
    obj['status']='historical-artistic-study; not an approved likeness'
    obj['topologyReport']=str(report)
    # Stable UVs permit baking skin materials and details in later passes.
    uv=obj.data.uv_layers.new(name='PortraitUV')
    cols=face_profile.COLUMNS
    for polygon in obj.data.polygons:
        for loop_index in polygon.loop_indices:
            vertex_id=obj.data.loops[loop_index].vertex_index
            row=vertex_id//cols
            col=vertex_id%cols
            uv.data[loop_index].uv=(col/cols,1-row/face_profile.ROWS)
    obj.shape_key_add(name='Basis',from_mix=False)
    for key_name,coords in targets.items():
        key=obj.shape_key_add(name=key_name,from_mix=False)
        for i,pos in enumerate(coords):
            key.data[i].co=pos
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
    root['modelStatus']='artistic-study-03-not-verified-likeness'
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
    sphere('NoseBridge',(0,.193,.005),(.028,.035,.095),skin,head)
    sphere('NoseTip',(0,.231,-.075),(.039,.045,.030),skin,head)
    for side in (-1,1):
        sphere('Ear',(side*.199,-.006,-.012),(.037,.041,.087),skin,head)
        sphere('EarConcha',(side*.223,.037,-.012),(.018,.013,.047),shadow,head)
        sphere('EyeSclera',(side*.079,.174,.056),(.036,.019,.016),white,head)
        sphere('Iris',(side*.079,.196,.056),(.014,.007,.014),eye,head)
        lid=sphere('UpperLid_L' if side<0 else 'UpperLid_R',(side*.079,.197,.082),(.043,.011,.010),skin,head)
        lid.shape_key_add(name='Basis',from_mix=False)
        blink=lid.shape_key_add(name='Blink_L' if side<0 else 'Blink_R',from_mix=False)
        # Object local Z axis is scaled to eyelid thickness; blend moves it toward iris.
        for v in lid.data.vertices:
            co=v.co
            blink.data[v.index].co=(co.x,co.y,co.z-.9)
        brow=sphere('Eyebrow',(side*.084,.175,.127),(.067,.012,.013),hair,head)
        brow.rotation_euler.y=side*.10
        for k in range(6):
            f=(k+.5)/6
            sphere('MoustacheStrand',(side*(.018+.075*f),.218,-.122-.013*f),
                   (.014,.010,.009),hair,head)
    sphere('SweptHair',(0,-.025,.208),(.208,.190,.083),hair,head)
    for side in (-1,1):
        for k in range(6):
            sphere('TempleStrand',(side*(.174-.015*k),-.018,.135+.020*k),
                   (.028,.034,.021),grey if k%3==0 else hair,head)
    # Frames are modeled as real geometry, not added as a 2D sprite.
    for side in (-1,1):
        bpy.ops.mesh.primitive_torus_add(major_segments=32,minor_segments=8,
                         location=(0,0,0),major_radius=.055,minor_radius=.003)
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
