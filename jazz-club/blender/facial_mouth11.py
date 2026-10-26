"""Sommerfeld Rev11: independent, animation-ready lip edge-loop study.
Pure Python geometry, same coordinates for Blender and offline GLB preview.
+Y = forwards, Z = upwards, local to head anchor. Not a final head retopology.
"""
from __future__ import annotations
import math

RADIAL_STEPS = 64
RINGS = 5
MORPHS = ('Smile', 'JawOpen', 'Pucker', 'Frown', 'Speech_A')

def mouth_patch(steps=RADIAL_STEPS):
    if steps < 32 or steps % 4:
        raise ValueError('steps must be >=32 and divisible by four')
    specs = [
        (.094, .036, .179),
        (.079, .025, .190),
        (.066, .017, .204),
        (.054, .009, .216),
        (.047, .0035, .218),
    ]
    zc = -.163
    coords = []
    for ring, (width, height, front) in enumerate(specs):
        for j in range(steps):
            angle = math.tau*j/steps
            u, v = math.cos(angle), math.sin(angle)
            cupids_bow = .004*math.exp(-((abs(u)-.39)/.22)**2) * max(0,v)
            upper_height = 1.03 if v > 0 else .96
            x = width*u
            y = front-.007*abs(u)+.004*(1-u*u)
            z = zc+height*upper_height*v+cupids_bow
            coords.append((x,y,z))
    faces = []
    for ring in range(RINGS-1):
        for j in range(steps):
            a = ring*steps+j
            b = ring*steps+(j+1)%steps
            faces.append((a,b,b+steps,a+steps))
    morphs = {}
    for name in MORPHS:
        shaped = []
        for i,(x,y,z) in enumerate(coords):
            ring = i//steps
            a = math.tau*(i%steps)/steps
            u,v = math.cos(a),math.sin(a)
            s = (.13,.33,.62,.87,1.0)[ring]
            cx = abs(u)**1.6
            xx, yy, zz = x,y,z
            if name == 'Smile':
                xx *= 1+.11*s
                zz += .017*s*cx+.0045*s*(1-cx)
                yy += .003*s*(1-cx)
            elif name == 'JawOpen':
                if v < 0:
                    zz -= .033*s*(-v)**.75
                    yy -= .007*s*(-v)
                else:
                    zz += .0025*s*v
            elif name == 'Pucker':
                xx *= 1-.23*s
                zz = zc+(zz-zc)*(1+.18*s)
                yy += .014*s
            elif name == 'Frown':
                zz -= .014*s*cx
                xx *= 1-.018*s
            elif name == 'Speech_A':
                if v < 0:
                    zz -= .022*s*(-v)**.7
                else:
                    zz += .006*s*v
                xx *= 1-.035*s
            shaped.append((xx,yy,zz))
        morphs[name] = shaped
    return coords, faces, morphs

def validate_mouth(steps=RADIAL_STEPS):
    vertices, quads, targets = mouth_patch(steps)
    assert len(vertices) == RINGS*steps and len(quads) == (RINGS-1)*steps
    assert set(targets) == set(MORPHS)
    assert all(len(v) == len(vertices) for v in targets.values())
    assert all(all(math.isfinite(n) for n in p) for p in vertices)
    edges = {}
    for q in quads:
        assert len(q)==4 and len(set(q)) == 4
        for i in range(4):
            e = tuple(sorted((q[i],q[(i+1)%4])))
            edges[e] = edges.get(e,0)+1
    assert all(1 <= c <= 2 for c in edges.values())
    assert sum(c==1 for c in edges.values()) == 2*steps
    baseline=min(p[2] for p in vertices[-steps:])
    opened=min(p[2] for p in targets['JawOpen'][-steps:])
    assert opened < baseline-.02
    for name,coords in targets.items():
        assert all(all(math.isfinite(n) for n in p) for p in coords)
        assert any(sum(abs(a-b) for a,b in zip(p,q)) > 1e-5
                   for p,q in zip(vertices,coords)), name
    return {'vertices':len(vertices),'quads':len(quads),
            'morphs':len(targets),'boundary_edges':2*steps,
            'status':'animated-mouth-study-not-historical-likeness'}

if __name__ == '__main__':
    print(validate_mouth())
