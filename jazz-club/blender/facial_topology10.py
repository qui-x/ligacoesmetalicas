"""Malha local de pálpebras com anéis quadrangulares deformáveis.
Sommerfeld / estudo 10. Fonte pura em Python, compartilhada com a prévia.
Não equivale a uma retopologia completa de todo o crânio.
Coordenadas relativas ao controlador HEAD_ANCHOR; +Y é a frente.
"""
from __future__ import annotations
import math
RADIAL_STEPS=48
RINGS=4
MORPHS=('Blink_L','Blink_R','Squint_L','Squint_R','BrowRaise')

def eyelid_patch(side:int,radial_steps:int=RADIAL_STEPS):
    if side not in (-1,1) or radial_steps<24 or radial_steps%4:
        raise ValueError('side=-1/1 e radial_steps>=24 múltiplo de quatro')
    specs=((.068,.050,.150),(.055,.037,.172),
           (.045,.025,.185),(.034,.015,.195))
    points=[]
    cx=side*.081
    cz=.060
    for ring,(rx,rz,front) in enumerate(specs):
        for i in range(radial_steps):
            a=math.tau*i/radial_steps
            u,v=math.cos(a),math.sin(a)
            taper=.92 if u<-.65 else 1.
            x=cx+side*rx*u*taper
            z=cz+rz*v+(.0025*(1-u*u) if ring==2 else 0.)
            y=front-.008*abs(u)+.003*math.cos(a*2)
            points.append((x,y,z))
    quads=[]
    for ring in range(len(specs)-1):
        for i in range(radial_steps):
            a=ring*radial_steps+i
            b=ring*radial_steps+(i+1)%radial_steps
            quads.append((a,b,b+radial_steps,a+radial_steps))
    morphs={}
    for name in MORPHS:
        coords=[]
        for i,(x,y,z) in enumerate(points):
            ring=i//radial_steps
            local_z=z-cz
            strength=(.02,.12,.63,.95)[ring]
            if name==('Blink_L' if side<0 else 'Blink_R'):
                z=cz+local_z*(1-strength*.94)
                y+=.002*strength
            elif name==('Squint_L' if side<0 else 'Squint_R'):
                z=cz+local_z*(1-strength*.38)
                y+=.001*strength
            elif name=='BrowRaise':
                top=max(0.,local_z/.050)
                z+=.014*top*(1-.55*strength)
            coords.append((x,y,z))
        morphs[name]=coords
    return points,quads,morphs

def validate_eyelid(side:int):
    pts,quads,targets=eyelid_patch(side)
    if len(pts)!=RINGS*RADIAL_STEPS or len(quads)!=(RINGS-1)*RADIAL_STEPS:
        raise AssertionError('Invalid quad count')
    if set(targets)!=set(MORPHS) or any(len(m)!=len(pts) for m in targets.values()):
        raise AssertionError('Target topology mismatch')
    if any(not all(math.isfinite(x) for x in p) for p in pts):
        raise AssertionError('Non-finite coordinates')
    blink=targets['Blink_L' if side<0 else 'Blink_R']
    before=max(v[2] for v in pts[-RADIAL_STEPS:])-min(v[2] for v in pts[-RADIAL_STEPS:])
    after=max(v[2] for v in blink[-RADIAL_STEPS:])-min(v[2] for v in blink[-RADIAL_STEPS:])
    if after>=before*.18:
        raise AssertionError('Blink cannot close')
    edges={}
    for face in quads:
        for j in range(4):
            e=tuple(sorted((face[j],face[(j+1)%4])))
            edges[e]=edges.get(e,0)+1
    if sum(v==1 for v in edges.values())!=2*RADIAL_STEPS:
        raise AssertionError('Unexpected boundaries')
    return {'vertices':len(pts),'quads':len(quads),'morphs':len(targets),
            'boundaries':2*RADIAL_STEPS,'status':'study-not-homologated'}

if __name__=='__main__':
    print(validate_eyelid(-1),validate_eyelid(1))
