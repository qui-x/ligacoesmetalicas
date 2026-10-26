"""Sommerfeld 12: seamless mouth rings sewn into the SAME facial mesh.
Shared Python geometry for Blender and static preview; not a final likeness.
Mouth hole replaces 192 cranial quads and bridges through 3 loops of 64 quads.
"""
import math
import face_anatomy as base

TOP,BOTTOM,LEFT,RIGHT=35,43,12,36
STEPS=64
EXTRA=('Pucker','Frown','Speech_A')
MORPHS=base.MORPHS+EXTRA

def perimeter():
    idx=[]
    idx.extend(TOP*base.COLUMNS+c for c in range(LEFT,RIGHT+1))
    idx.extend(r*base.COLUMNS+RIGHT for r in range(TOP+1,BOTTOM+1))
    idx.extend(BOTTOM*base.COLUMNS+c for c in range(RIGHT-1,LEFT-1,-1))
    idx.extend(r*base.COLUMNS+LEFT for r in range(BOTTOM-1,TOP,-1))
    assert len(idx)==STEPS and len(set(idx))==STEPS
    return idx

def skin_at(x,z,vertices):
    rows=list(range(TOP-1,BOTTOM+2))
    zr={r:vertices[r*base.COLUMNS+24][2] for r in rows}
    for i in range(len(rows)-1):
        r0,r1=rows[i:i+2]
        if zr[r0]>=z>=zr[r1]:break
    else:
        r0,r1=(rows[:2] if z>zr[rows[0]] else rows[-2:])
    def on_row(r):
        pairs=[(vertices[r*base.COLUMNS+c][0],vertices[r*base.COLUMNS+c][1])
               for c in range(LEFT-2,RIGHT+3)]
        pairs.sort()
        for j in range(len(pairs)-1):
            x0,y0=pairs[j];x1,y1=pairs[j+1]
            if x0<=x<=x1:break
        else:
            x0,y0,x1,y1=(*pairs[0],*pairs[1]) if x<pairs[0][0] else (*pairs[-2],*pairs[-1])
        return y0+(y1-y0)*(x-x0)/(x1-x0) if x1!=x0 else y0
    y0,y1=on_row(r0),on_row(r1)
    return y0+(y1-y0)*(z-zr[r0])/(zr[r1]-zr[r0])

def build():
    original,quads=base.head_geometry()
    bounds=perimeter()
    faces=[]
    for row in range(base.ROWS):
        for col in range(base.COLUMNS):
            if TOP<=row<BOTTOM and LEFT<=col<RIGHT:continue
            faces.append(quads[row*base.COLUMNS+col])
    vertices=list(original)
    ring_spec=((.089,.034,.50,.001),(.071,.021,1.,.002),(.043,.006,1.,.0035))
    for rx,rz,blend,raise_y in ring_spec:
        for idx in bounds:
            x0,y0,z0=original[idx]
            a=math.atan2((z0+.163)/.045,x0/.103)
            tx=rx*math.cos(a);tz=-.163+rz*math.sin(a)
            x=x0*(1-blend)+tx*blend
            z=z0*(1-blend)+tz*blend
            y=skin_at(x,z,original)+raise_y
            vertices.append((x,y,z))
    starts=[len(original)+STEPS*i for i in range(3)]
    previous=bounds
    for start in starts:
        current=[start+i for i in range(STEPS)]
        faces.extend((previous[i],previous[(i+1)%STEPS],
                      current[(i+1)%STEPS],current[i]) for i in range(STEPS))
        previous=current
    targets={}
    old_targets=base.facial_targets(original)
    for name in MORPHS:
        existing=old_targets.get(name,original)
        shaped=list(existing)
        for ring in range(3):
            for j,idx in enumerate(bounds):
                x,y,z=vertices[starts[ring]+j]
                x0,y0,z0=original[idx]; bx,by,bz=existing[idx]
                inherited=(.42,.13,.03)[ring]
                x+=(bx-x0)*inherited
                y+=(by-y0)*inherited
                z+=(bz-z0)*inherited
                strength=(.22,.63,1.0)[ring]
                a=math.atan2((z+.163)/.045,x/.103)
                u,v=math.cos(a),math.sin(a)
                corner=abs(u)**1.6
                if name=='Smile':
                    x*=1+.055*strength
                    z+=.0065*strength*corner+.0018*strength*(1-corner)
                    y+=.003*strength*(1-corner)
                elif name=='JawOpen':
                    if v<0:
                        z-=.018*strength*(-v)**.75
                        y-=.004*strength*(-v)
                    else:z+=.002*strength*v
                elif name=='Pucker':
                    x*=1-.21*strength
                    z=-.163+(z+.163)*(1+.19*strength)
                    y+=.010*strength
                elif name=='Frown':z-=.012*strength*corner
                elif name=='Speech_A':
                    z+=(-.022*strength*(-v)**.7 if v<0 else .004*strength*v)
                    x*=1-.025*strength
                shaped.append((x,y,z))
        targets[name]=shaped
    return vertices,faces,targets,bounds,starts

def validate():
    vertices,faces,targets,bounds,starts=build()
    assert len(vertices)==base.COLUMNS*(base.ROWS+1)+3*STEPS
    assert len(faces)==base.COLUMNS*base.ROWS
    assert len(bounds)==STEPS and len(set(bounds))==STEPS
    assert all(len(v)==len(vertices) for v in targets.values())
    edges={}
    for face in faces:
        assert len(set(face))==4
        for j in range(4):
            edge=tuple(sorted((face[j],face[(j+1)%4])))
            edges[edge]=edges.get(edge,0)+1
    assert max(edges.values())==2
    boundaries=sum(n==1 for n in edges.values())
    assert boundaries==2*base.COLUMNS+STEPS,boundaries
    assert all(all(math.isfinite(n) for n in v) for v in vertices)
    k=starts[-1]
    neutral=max(v[2] for v in vertices[k:k+STEPS])-min(v[2] for v in vertices[k:k+STEPS])
    opened=max(v[2] for v in targets['JawOpen'][k:k+STEPS])-min(v[2] for v in targets['JawOpen'][k:k+STEPS])
    assert opened>neutral+.010
    return {'vertices':len(vertices),'quads':len(faces),'mouth_open_edges':STEPS,
            'boundary_edges':boundaries,'blendshapes':len(targets),
            'mouth_gap_neutral':neutral,'mouth_gap_open':opened}

if __name__=='__main__':print(validate())
