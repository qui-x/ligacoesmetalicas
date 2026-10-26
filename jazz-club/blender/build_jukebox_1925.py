"""Jazz e Metais | Fonógrafo automático de 1925, modelo autoral no Blender.
Gera GLB com visor físico selecionável (JB_SELECTION_WINDOW_1925) e materiais PBR.
Ferramenta: Blender 3.6+; uso: blender -b --factory-startup --python
  jazz-club/blender/build_jukebox_1925.py -- jazz-club/assets/jukebox-1925.glb
A seleção é uma textura viva inserida na superfície pelo Babylon.js.
A estética remete a móveis/gramofones seletivos do período, não jukeboxes néon 1940.
"""
import bpy,sys,math
from pathlib import Path
from mathutils import Vector

def material(name, color, metallic=0.0, rough=.5):
    mat=bpy.data.materials.new(name);mat.diffuse_color=(*color,1)
    mat.use_nodes=True;pbr=mat.node_tree.nodes.get('Principled BSDF')
    pbr.inputs['Base Color'].default_value=(*color,1)
    pbr.inputs['Metallic'].default_value=metallic
    pbr.inputs['Roughness'].default_value=rough
    return mat

def cube(name,loc,scale,mat,bevel=0.0):
    bpy.ops.mesh.primitive_cube_add(size=1,location=loc)
    obj=bpy.context.object;obj.name=name
    obj.dimensions=scale;bpy.ops.object.transform_apply(location=False,rotation=False,scale=True)
    obj.data.materials.append(mat)
    if bevel:
        modifier=obj.modifiers.new('Rounded handcrafted edge','BEVEL')
        modifier.width=bevel;modifier.segments=3
        modifier.affect='EDGES' if hasattr(modifier,'affect') else None
        obj.modifiers.new('Corner normals','WEIGHTED_NORMAL')
    return obj

def cylinder(name,loc,radius,depth,mat,verts=40,rotation=None):
    bpy.ops.mesh.primitive_cylinder_add(vertices=verts,radius=radius,depth=depth,location=loc)
    o=bpy.context.object;o.name=name;o.data.materials.append(mat)
    if rotation:o.rotation_euler=rotation
    for poly in o.data.polygons:poly.use_smooth=True
    return o

def torus(name,loc,major,minor,mat,rot=None):
    bpy.ops.mesh.primitive_torus_add(major_segments=50,minor_segments=12,location=loc,
        major_radius=major,minor_radius=minor)
    o=bpy.context.object;o.name=name;o.data.materials.append(mat)
    if rot:o.rotation_euler=rot
    for poly in o.data.polygons:poly.use_smooth=True
    return o

def text(name,body,loc,size,mat,align='CENTER'):
    curve=bpy.data.curves.new(name,'FONT');curve.body=body;curve.size=size
    curve.align_x=align;curve.extrude=.003;curve.bevel_depth=.0007
    o=bpy.data.objects.new(name,curve);bpy.context.collection.objects.link(o)
    o.location=loc;o.rotation_euler=(math.pi/2,0,0)
    o.data.materials.append(mat)
    return o

def cabinet():
    bpy.ops.object.select_all(action='SELECT');bpy.ops.object.delete(use_global=False)
    mahogany=material('1925 polished mahogany',(.23,.090,.052),0,.29)
    oak=material('1925 smoked walnut veneer',(.105,.048,.035),0,.42)
    brass=material('1925 brass hand-polished',(.68,.45,.17),.86,.25)
    brassLight=material('1925 brass illuminated',(.88,.65,.32),.66,.29)
    lacquer=material('1925 black lacquer',(.034,.030,.029),.13,.20)
    cream=material('1925 yellowed paper',(.80,.68,.49),0,.9)
    glass=material('1925 smoked glass',(.15,.12,.088),.25,.27)

    cube('JB_CABINET_BODY_1925',(0,0,1.46),(1.55,.83,2.82),mahogany,.105)
    cube('JB_BASE_PLINTH_1925',(0,0,.15),(1.72,1.05,.30),oak,.06)
    cube('JB_BASE_BRASS_1925',(0,-.01,.31),(1.58,.86,.045),brass,.014)
    cube('JB_CROWN_1925',(0,.03,2.86),(1.63,.86,.24),oak,.10)
    cube('JB_CROWN_CAP_1925',(0,.01,2.96),(1.67,.91,.07),brass,.02)
    cube('JB_FRONT_INSET_1925',(0,-.437,1.57),(1.31,.055,2.32),oak,.065)
    # Selection glass is a real 3D mesh with UVs; Babylon sets its visible
    # DynamicTexture to display the live catalogue and detect row selection.
    cube('JB_SCREEN_BRASS_FRAME_1925',(0,-.484,1.96),(1.245,.11,1.42),brass,.055)
    cube('JB_SCREEN_LEATHER_MAT_1925',(0,-.547,1.96),(1.13,.035,1.30),lacquer,.025)
    screen=cube('JB_SELECTION_WINDOW_1925',(0,-.573,1.96),(1.07,.008,1.235),cream,.002)
    screen['jukebox_screen']=True
    # Material for the dynamic display is supplied at runtime. Give the
    # physical front plane a stable UV in case Blender's cube unwrap changes.
    uv=screen.data.uv_layers.active
    if uv is None:uv=screen.data.uv_layers.new(name='SelectionDisplayUV')
    for poly in screen.data.polygons:
        for li in poly.loop_indices:
            co=screen.data.vertices[screen.data.loops[li].vertex_index].co
            uv.data[li].uv=((co.x+.535)/1.07,(co.z+.6175)/1.235)
    for side in [-1,1]:
        cube('JB_SIDE_FLUTED_1925',(side*.68,-.449,1.55),(.075,.09,2.33),mahogany,.026)
        cube('JB_SIDE_BRASS_STRIPE_1925',(side*.692,-.508,1.56),(.020,.016,2.24),brass,.008)
        cube('JB_TOP_INLAY_1925',(side*.32,-.471,2.76),(.18,.017,.045),brassLight,.01)
    # Mechanical selection controls under display
    cube('JB_SELECTOR_BRASS_PANEL_1925',(0,-.515,1.015),(1.19,.09,.35),brass,.048)
    for x,label in [(-.42,'JB_PREV_1925'),(.42,'JB_NEXT_1925')]:
        cylinder(label,(x,-.618,1.01),.092,.060,lacquer,32,(math.pi/2,0,0))
        cylinder(label+'_EDGE',(x,-.655,1.01),.061,.018,brassLight,32,(math.pi/2,0,0))
    cylinder('JB_MAIN_PLAY_1925',(0,-.628,1.01),.13,.07,brassLight,40,(math.pi/2,0,0))
    cube('JB_COIN_SLOT_BRASS_1925',(0,-.50,.72),(.34,.04,.155),brass,.014)
    cube('JB_COIN_BLACK_1925',(0,-.526,.725),(.18,.013,.021),lacquer,.003)
    # Fan-shaped acoustic grille, historical automatic phonograph language
    cube('JB_LOWER_GRILLE_1925',(0,-.47,.52),(1.19,.04,.34),oak,.03)
    for x in [i*.092 for i in range(-5,6)]:
        cube('JB_SPEAKER_SLAT_1925',(x,-.502,.515),(.017,.012,.25),brass,.003)
    text('JB_BRAND_1925','JAZZ & METAIS',(0,-.54,2.738),.115,brassLight)
    text('JB_SERIAL_1925','DISCOS AUTOMATICOS',(0,-.546,.806),.055,cream)
    # Dramatic shallow relief ornament, leaves real space to select via glass
    for x in [-.52,.52]:
        for z in [.52,2.65]:
            cylinder('JB_CORNER_ROSETTE_1925',(x,-.51,z),.041,.013,brass,16,(math.pi/2,0,0))
    return screen

def main():
    args=sys.argv[sys.argv.index('--')+1:] if '--' in sys.argv else []
    if len(args)!=1:raise SystemExit('Blender: provide output GLB after --')
    target=Path(args[0]).resolve();target.parent.mkdir(parents=True,exist_ok=True)
    screen=cabinet()
    # Export all meshes/text, including UVs/materials and selectable mesh name.
    bpy.ops.export_scene.gltf(filepath=str(target),export_format='GLB',export_apply=True,
         export_materials='EXPORT',export_extras=True)
    assert target.exists() and target.stat().st_size>10000
    print('JAZZ_JUKEBOX_1925_READY',target,target.stat().st_size,screen.name)
if __name__=='__main__':main()
