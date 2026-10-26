"""Pure-Python facial study surface for an artistic Sommerfeld interpretation (revision 05).
Not a photogrammetric portrait or final facial edge-loop retopology.
Quad mesh editable in Blender. Positive Y front, Z up; meters.
"""
from __future__ import annotations
import math

ROWS=56
COLUMNS=96
MORPHS=('Blink_L','Blink_R','BrowRaise','Smile','JawOpen','Squint_L','Squint_R')

def bell(x,z,cx,cz,sx,sz):
    return math.exp(-(((x-cx)/sx)**2 + ((z-cz)/sz)**2))

def head_geometry(rows=ROWS,columns=COLUMNS):
    if rows<24 or columns<32 or columns%4:
        raise ValueError('Use >=24 rows and columns >=32, multiple of four')
    points=[]
    for row in range(rows+1):
        polar=.0008+(math.pi-.0016)*row/rows
        z=.283*math.cos(polar)
        sine=math.sin(polar)
        for col in range(columns):
            a=math.tau*col/columns
            x=.200*sine*math.cos(a)
            x*=1-.14*max(0,(-z-.065)/.215)
            y=.181*sine*math.sin(a)
            front=max(0,math.sin(a))**3
            relief=(
                .010*bell(x,z,0,.165,.16,.064)
                +.013*bell(abs(x),z,.088,.129,.048,.036)
                -.026*bell(abs(x),z,.083,.065,.045,.039)
                +.020*bell(abs(x),z,.125,-.043,.060,.068)
                +.011*bell(x,z,0,.070,.043,.155)
                +.043*bell(x,z,0,.014,.040,.092)  # nasal bridge in shared face mesh
                +.043*bell(x,z,0,-.070,.041,.037)  # nasal tip in shared face mesh
                +.012*bell(abs(x),z,.034,-.089,.027,.025)  # alae
                -.014*bell(abs(x),z,.112,-.127,.032,.079)
                +.008*bell(x,z,0,-.119,.055,.023)
                +.010*bell(x,z,0,-.155,.051,.018)
                +.018*bell(x,z,0,-.228,.091,.037)
                -.010*bell(x,z,0,-.189,.07,.019)
            )
            asym=.0027*math.sin(17*x+5*z)*bell(x,z,0,0,.2,.21)
            points.append((x,y+front*(relief+asym),z))
    faces=[]
    for row in range(rows):
        for col in range(columns):
            a=row*columns+col
            b=row*columns+(col+1)%columns
            faces.append((a,b,b+columns,a+columns))
    return points,faces

def facial_targets(points):
    """Named shape-key position arrays; topologies unchanged."""
    output={}
    for name in MORPHS:
        new=[]
        for x,y,z in points:
            front=max(0,min(1,(y+.05)/.24))
            nx,ny,nz=x,y,z
            if name.startswith('Blink'):
                side=-1 if name.endswith('_L') else 1
                mask=bell(x,z,side*.081,.068,.052,.050)*front
                ny-=.014*mask
                nz-=.011*mask
            elif name.startswith('Squint'):
                side=-1 if name.endswith('_L') else 1
                mask=bell(x,z,side*.086,.049,.062,.063)*front
                ny+=.008*mask
                nz+=.008*mask
            elif name=='BrowRaise':
                mask=bell(abs(x),z,.086,.128,.073,.054)*front
                nz+=.019*mask
            elif name=='Smile':
                cheek=bell(abs(x),z,.115,-.104,.064,.080)*front
                corner=bell(abs(x),z,.076,-.143,.052,.035)*front
                ny+=.012*cheek
                nz+=.011*corner
            elif name=='JawOpen':
                mask=bell(x,z,0,-.214,.140,.074)*front
                nz-=.024*mask
                ny-=.009*mask
            new.append((nx,ny,nz))
        output[name]=new
    return output

def validate_topology(points,faces,targets):
    """Math-only checks; do not treat as artistic or historical validation."""
    if len(points)!=(ROWS+1)*COLUMNS or len(faces)!=ROWS*COLUMNS:
        raise AssertionError('Unexpected mesh topology')
    if not all(len(f)==4 and all(0<=v<len(points) for v in f) for f in faces):
        raise AssertionError('Face indexing invalid')
    if set(targets)!=set(MORPHS) or any(len(p)!=len(points) for p in targets.values()):
        raise AssertionError('Morph targets inconsistent')
    if any(not all(math.isfinite(v) for v in p) for p in points):
        raise AssertionError('Non-finite vertex')
    if not all(any(sum(abs(a-b) for a,b in zip(v0,v1))>1e-5
                       for v0,v1 in zip(points,morph)) for morph in targets.values()):
        raise AssertionError('Inert facial morph')
    frequencies={}
    for face in faces:
        for j in range(4):
            edge=tuple(sorted((face[j],face[(j+1)%4])))
            frequencies[edge]=frequencies.get(edge,0)+1
    if any(n not in (1,2) for n in frequencies.values()):
        raise AssertionError('Non-manifold edge')
    if sum(n==1 for n in frequencies.values())!=2*COLUMNS:
        raise AssertionError('Unexpected poles')
    return {'vertices':len(points),'quads':len(faces),'morphs':len(targets),
            'boundary_edges':2*COLUMNS,'anatomical_status':'editable-study-not-final-likeness'}

if __name__=='__main__':
    p,f=head_geometry()
    print(validate_topology(p,f,facial_targets(p)))
