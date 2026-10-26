"""Refinamento 06: superfícies esculpíveis e ornamentos em curvas convertidos em malha.
Uso (Blender 3.6+ com glTF exporter):
 blender -b --factory-startup --python jazz-club/blender/refine_sommerfeld_06.py -- \
   --output dist/jazz-club/assets/sommerfeld-study.glb \
   --blend dist/jazz-club/assets/sommerfeld-study.blend
Este personagem é estudo artístico, NÃO semelhança histórica homologada.
"""
import argparse
import math
import os
import sys
from mathutils import Vector
import bpy
sys.path.insert(0,os.path.dirname(os.path.abspath(__file__)))
import build_sommerfeld as base

def surface_ribbon(name,points,widths,material,parent,normal=(0,1,0)):
    """Uma peça de superfície tapering, em lugar de uma linha cilíndrica visível."""
    normal=Vector(normal).normalized()
    coords=[Vector(p) for p in points]
    vertices=[]
    faces=[]
    for i,p in enumerate(coords):
        direction=(coords[min(len(coords)-1,i+1)]-coords[max(i-1,0)]).normalized()
        side=direction.cross(normal)
        if side.length<0.0001:
            side=direction.cross(Vector((0,0,1)))
        side.normalize()
        width=widths[i] if isinstance(widths,(list,tuple)) else widths
        vertices.extend((p+side*width,p-side*width))
        if i:
            a=2*i
            faces.append((a-2,a-1,a+1,a))
    return base.mesh(name,vertices,faces,material,parent)

def face_and_hair(head):
    skin=bpy.data.materials['skin-pbr']
    hair=bpy.data.materials['hair-grey-brown']
    grey=bpy.data.materials['silver-strands']
    shadow=bpy.data.materials['face-shadow-pbr']
    for obj in list(bpy.data.objects):
        if obj.name.startswith(('SweptHair','TempleStrand','MoustacheStrand','Eyebrow','HairlineStrand')):
            bpy.data.objects.remove(obj,do_unlink=True)
    # O rosto com sete shape keys vem da mesma malha anatômica do gerador base.
    face=bpy.data.objects.get('SOMMERFELD_FACE_QUAD_BASE')
    face['stage']='surface-study-06;retopology still subject to sculpt approval'
    # Hair shell: 96 longitude samples x 31 latitude rings.
    vertices=[]
    quads=[]
    cols=96
    rows=30
    for row in range(rows+1):
        for j in range(cols):
            angle=math.tau*j/cols
            front=max(0,math.sin(angle))
            side=abs(math.cos(angle))
            caplimit=1.14+.15*front-.09*front*side
            phi=.001+row/rows*caplimit
            x=.207*math.sin(phi)*math.cos(angle)
            y=.192*math.sin(phi)*math.sin(angle)-.013
            z=.288*math.cos(phi)
            vertices.append((x,y,z))
    for row in range(rows):
        for j in range(cols):
            a=row*cols+j
            b=row*cols+(j+1)%cols
            quads.append((a,b,b+cols,a+cols))
    cap=base.mesh('HairCap_Rev06',vertices,quads,hair,head)
    cap['artifact']='original procedural hair study, editable quad shell'
    # Sweep accents remain visually subtle and stay on the cap.
    for k in range(14):
        az=.48+k*math.pi/13
        path=[]
        widths=[]
        for j in range(18):
            t=j/17
            phi=.13+.65*t
            a=az-.12*t
            path.append((.209*math.sin(phi)*math.cos(a),
                         .194*math.sin(phi)*math.sin(a)-.014,
                         .289*math.cos(phi)))
            widths.append(.0005+.0018*math.sin(math.pi*t)**1.4)
        surface_ribbon('HairSweep_%02d'%k,path,widths,grey if k%6==0 else hair,head,normal=(0,0,1))
    for side in (-1,1):
        x=side*.083
        brow=[]
        widths=[]
        for i in range(26):
            t=-1+2*i/25
            brow.append((x+.047*t,.177,.124+.007*(1-t*t)))
            widths.append(.001+.006*math.sin(math.pi*i/25))
        surface_ribbon('EyebrowRibbon_%s'%side,brow,widths,hair,head)
        upper=[]
        widths=[]
        for i in range(28):
            t=-1+2*i/27
            upper.append((x+.039*t,.185,.058+.012*(max(0,1-t*t)**.70)))
            widths.append(.0008+.002*math.sin(math.pi*i/27))
        surface_ribbon('UpperLidRibbon_%s'%side,upper,widths,skin,head)
        # Bigode contorna o lábio superior, afinando gradualmente nas pontas.
        must=[]
        widths=[]
        for i in range(28):
            t=i/27
            must.append((side*(.010+.078*t),.210-.014*t**1.3,
                         -.126-.010*t**1.3+.002*math.sin(math.pi*t)))
            widths.append(.001+.011*math.sin(math.pi*t)**.7)
        surface_ribbon('MoustachePatch_%s'%side,must,widths,hair,head)
        for j in range(10):
            t=(j+.5)/10
            x0=side*(.010+.073*t)
            base.piece('MoustacheFibre',(x0,.216-.013*t,-.123-.010*t),
                       (x0+side*.006,.207-.013*t,-.132-.011*t),
                       .0006,grey if j==8 else hair,head)
    head['visualStatus']='refined curves and hair shell; not final sculpt'

def garment_curves(root):
    coat=bpy.data.materials['wool-charcoal']
    vest=bpy.data.materials['waistcoat-slate']
    for obj in list(bpy.data.objects):
        if obj.name.startswith('Lapel'):
            bpy.data.objects.remove(obj,do_unlink=True)
    # Two gridded, gently convex lapel patches rather than flat triangles.
    for side in (-1,1):
        left=Vector((side*.06,.19,1.40))
        right=Vector((side*.29,.18,1.28))
        bottom=Vector((side*.11,.248,1.06))
        inside=Vector((side*.05,.212,1.29))
        n=12
        vertices=[]
        faces=[]
        for j in range(n):
            t=j/(n-1)
            p=left.lerp(inside,t)
            q=right.lerp(bottom,t)
            for i in range(n):
                u=i/(n-1)
                pt=p.lerp(q,u)
                pt.y+=.014*math.sin(math.pi*u)*math.sin(math.pi*t)
                vertices.append(pt)
        for j in range(n-1):
            for i in range(n-1):
                a=j*n+i
                faces.append((a,a+1,a+n+1,a+n))
        panel=base.mesh('SculptedLapel_%s'%side,vertices,faces,coat,root)
        panel['seam']='editable curved lapel patch; no fabric dynamics simulated'
        for z in (1.04,1.12,1.20):
            t=[i/17 for i in range(18)]
            curve=[(side*(.25+.021*u),.197+.007*math.sin(math.pi*u),
                    z+.016-.032*u) for u in t]
            widths=[.0004+.002*math.sin(math.pi*u) for u in t]
            surface_ribbon('WoolFold_%s_%s'%(side,round(z,2)),curve,widths,vest,root)
    root['costumeStatus']='notch lapels and cloth fold surfaces, still no cloth bake'

def main():
    argv=sys.argv[sys.argv.index('--')+1:] if '--' in sys.argv else []
    p=argparse.ArgumentParser()
    p.add_argument('--output',required=True)
    p.add_argument('--blend',required=True)
    args=p.parse_args(argv)
    base.create()
    root=bpy.data.objects['SOMMERFELD_ROOT']
    head=bpy.data.objects['HEAD_ANCHOR']
    root['modelStatus']='artistic-study-06-not-verified-likeness'
    face_and_hair(head)
    garment_curves(root)
    for obj in bpy.context.scene.objects:
        if obj.type=='MESH':
            for p in obj.data.polygons:
                p.use_smooth=True
    os.makedirs(os.path.dirname(os.path.abspath(args.output)),exist_ok=True)
    os.makedirs(os.path.dirname(os.path.abspath(args.blend)),exist_ok=True)
    bpy.ops.wm.save_as_mainfile(filepath=os.path.abspath(args.blend),compress=True)
    bpy.ops.export_scene.gltf(filepath=os.path.abspath(args.output),
                              export_format='GLB',export_extras=True,
                              export_morph=True,export_animations=True)
    if not os.path.isfile(args.output) or os.path.getsize(args.output)<8000:
        raise RuntimeError('Blender export did not produce a valid-size GLB')
    print('SOMMERFELD_06_EXPORTED',args.output,args.blend)

if __name__=='__main__':
    main()
