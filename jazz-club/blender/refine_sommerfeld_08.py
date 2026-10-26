"""Sommerfeld, Rev08: 360° bilateral body/rear/nape closure in native Blender.
Builds ONE editable .blend and GLB from the SAME bpy scene.
The optional offline preview from the chat is a separate geometric study,
not an exact render of Blender output. No photoreal or likeness claims.

blender -b --factory-startup --python jazz-club/blender/refine_sommerfeld_08.py -- \
  --output dist/jazz-club/assets/sommerfeld-study.glb \
  --blend dist/jazz-club/assets/sommerfeld-study.blend
"""
import argparse
import math
import sys
from pathlib import Path
import bpy

HERE=Path(__file__).resolve().parent
sys.path.insert(0,str(HERE))
import refine_sommerfeld_07 as previous
import refine_sommerfeld_06 as surfaces
import build_sommerfeld as base

def patch(name,vertices,quads,material,parent):
    obj=base.mesh(name,vertices,quads,material,parent)
    for polygon in obj.data.polygons:
        polygon.use_smooth=True
    obj['revision']='08'
    return obj

def ribbon(name,points,widths,material,parent,normal=(0,1,0)):
    return surfaces.surface_ribbon(name,points,widths,material,parent,normal=normal)

def build_back_coat(root):
    coat=bpy.data.materials['wool-charcoal']
    coatlight=bpy.data.materials['waistcoat-slate']
    dark=bpy.data.materials['wool-charcoal']
    nx,nz=28,35
    vertices=[]
    quads=[]
    for iz in range(nz):
        t=iz/(nz-1)
        z=.80+.64*t
        width=.249+.077*math.exp(-((z-1.27)/.12)**2)-.015*math.exp(-((z-1.03)/.14)**2)
        ry=.198+.025*math.exp(-((z-1.25)/.19)**2)
        for ix in range(nx):
            u=-1+2*ix/(nx-1)
            x=u*width
            y=-ry*math.sqrt(max(0,1-.42*u*u))-.008*math.sin(math.pi*t)
            y-=.005*math.sin(math.pi*(u+1))*math.exp(-((z-1.11)/.1)**2)
            vertices.append((x,y,z))
    for iz in range(nz-1):
        for ix in range(nx-1):
            a=iz*nx+ix
            quads.append((a,a+nx,a+nx+1,a+1))
    panel=patch('CoatBackFullPanel08',vertices,quads,coat,root)
    panel['materialSemantics']='Rear wool jacket material, artistic study'
    for side in (-1,1):
        path=[]
        widths=[]
        for i in range(30):
            t=i/29
            path.append((side*(.004+.008*t),-.221+.009*t,.812+.235*t))
            widths.append(.0006+.003*math.sin(math.pi*t))
        ribbon('CoatBackVent08_%s'%side,path,widths,dark,root)
        seam=[
            (side*.045,-.232,1.39),(side*.147,-.231,1.343),
            (side*.289,-.18,1.28),(side*.341,-.071,1.22)
        ]
        ribbon('BackShoulderSeam08_%s'%side,seam,
               [.0015,.0023,.002,.0008],coatlight,root,normal=(0,0,1))
        cuff=[(side*.275,.377,.918),(side*.337,.402,.913),
              (side*.345,.428,.898),(side*.310,.450,.884)]
        ribbon('BackSleeveCuff08_%s'%side,cuff,
               [.002,.003,.003,.001],dark,root,normal=(0,0,1))
        sleeve=[(side*.362,-.062,1.263),(side*.428,.052,1.101),
                (side*.428,.151,1.020),(side*.355,.340,.922)]
        ribbon('OuterSleeveBackSeam08_%s'%side,sleeve,
               [.0008,.0028,.0025,.0008],dark,root,normal=(1,0,0))
        trouser=[(side*.066,.469,.235),(side*.163,.463,.231),
                 (side*.251,.464,.237)]
        ribbon('RearTrouserHem08_%s'%side,trouser,
               [.001,.004,.001],coatlight,root,normal=(0,0,1))
    collar=[]
    widths=[]
    for i in range(45):
        u=-1+2*i/44
        collar.append((.165*u,-.128-.048*math.sqrt(max(0,1-u*u)),
                       1.409+.060*(1-u*u)))
        widths.append(.005+.025*math.sqrt(max(0,1-u*u)))
    ribbon('RearNeckCollar08',collar,widths,coatlight,root,normal=(0,0,1))
    hem=[(.256*u,-.188-.028*math.sqrt(max(0,1-u*u)),.818)
         for u in [-1+2*i/44 for i in range(45)]]
    ribbon('JacketRearHem08',hem,
           [.0008+.004*math.sin(math.pi*i/44) for i in range(45)],
           dark,root,normal=(0,0,1))

def build_rear_hair(head):
    hair=bpy.data.materials['hair-grey-brown']
    detail=bpy.data.materials['silver-strands']
    nx,nr=44,16
    points=[]
    quads=[]
    for r in range(nr+1):
        t=r/nr
        for j in range(nx):
            u=j/(nx-1)
            a=math.pi+math.pi*u
            x=.207*math.cos(a)*(1-.08*t)
            y=-.174*math.sin(math.pi*u)-.017-.022*math.sin(math.pi*t)
            z=.184-.249*t+.016*math.cos(3*a)*t+.014*math.cos(4*a)*t*t
            points.append((x,y,z))
    for r in range(nr):
        for j in range(nx-1):
            a=r*nx+j
            quads.append((a,a+1,a+nx+1,a+nx))
    scalp=patch('RearHairNapeContinuous08',points,quads,hair,head)
    scalp['note']='Back-of-head surface, not final sculpt or hairstyle'
    for i in range(15):
        u=(i+.5)/15
        a=math.pi+math.pi*u
        pts=[]
        widths=[]
        for j in range(22):
            t=j/21
            wave=.0055*math.sin(t*math.pi*1.4+1.8*u)*t**1.5
            x=.207*math.cos(a)*(1-.08*t)+wave
            y=-.174*math.sin(math.pi*u)-.020-.019*math.sin(math.pi*t)-.002
            z=.187-.249*t+.014*math.cos(4*a)*t*t+.004*math.sin(math.pi*u*3)*t*t
            pts.append((x,y,z))
            widths.append(.00018+.0014*math.sin(math.pi*t)**.95)
        ribbon('BackHairLock08_%02d'%i,pts,widths,
               detail if i in (3,10) else hair,head,normal=(0,0,1))
    for side in (-1,1):
        path=[(side*.194,-.018,.134),(side*.201,-.055,.088),
              (side*.189,-.116,.019),(side*.151,-.152,-.051)]
        ribbon('HairRearTemporalBridge08_%s'%side,path,
               [.002,.009,.012,.001],hair,head)

def add_uv_for_new_geometry():
    previous.uv_for_unmapped_objects()

def main():
    argv=sys.argv[sys.argv.index('--')+1:] if '--' in sys.argv else []
    p=argparse.ArgumentParser()
    p.add_argument('--output',required=True)
    p.add_argument('--blend',required=True)
    args=p.parse_args(argv)
    out=Path(args.output).resolve()
    blend=Path(args.blend).resolve()
    out.parent.mkdir(parents=True,exist_ok=True)
    blend.parent.mkdir(parents=True,exist_ok=True)
    root=previous.create_scene()
    head=bpy.data.objects.get('HEAD_ANCHOR')
    if not root or head is None:
        raise RuntimeError('Character hierarchy missing')
    build_back_coat(root)
    build_rear_hair(head)
    root['modelStatus']='sommerfeld-study-08-360-not-approved'
    root['qualityLimit']='Not a final historical likeness, rig, material or GPU QA'
    add_uv_for_new_geometry()
    texdir=out.parent/'materials07'
    import materials07
    materials07.generate(texdir)
    previous.assign_textures(texdir)
    expected={'CoatBackFullPanel08','RearNeckCollar08','RearHairNapeContinuous08'}
    if not expected.issubset({o.name for o in bpy.data.objects}):
        raise RuntimeError('Required 360-degree geometry absent')
    if not bpy.data.objects['SOMMERFELD_FACE_QUAD_BASE'].data.shape_keys:
        raise RuntimeError('Facial morph targets were lost')
    bpy.ops.wm.save_as_mainfile(filepath=str(blend),compress=True)
    bpy.ops.export_scene.gltf(
        filepath=str(out),export_format='GLB',export_extras=True,
        export_morph=True,export_animations=True,export_image_format='AUTO')
    if not out.is_file() or out.stat().st_size<8000 or not blend.is_file():
        raise RuntimeError('Missing Blender or glTF output')
    print('SOMMERFELD_REV08_EXPORTED',blend,out)

if __name__=='__main__':
    main()
