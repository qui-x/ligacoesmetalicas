"""Geometria compartilhada da revisão 09. Sem dependências do Blender.
Unidades: metros. Z vertical. Mesmo cálculo para prévia e bpy.
"""
import math

def rear_hair_patch(z0=1.735,nx=64,nr=24):
    vertices,faces=[],[]
    for row in range(nr+1):
        t=row/nr
        for j in range(nx):
            u=j/(nx-1)
            a=math.pi+math.pi*u
            rx=.207*(1-.16*t**1.2)
            ry=.180*(1-.13*t**1.3)
            x=rx*math.cos(a)+.003*math.sin(4*a+2*t)*t
            y=ry*math.sin(a)-.012-.014*math.sin(math.pi*t)
            edge=.026*math.cos(math.tau*3*u)+.010*math.sin(math.tau*7*u+.8)
            z=z0+.191-(.254-edge)*t+.012*math.sin(2*a)*t*(1-t)
            y+=.002*math.sin(6*a+3*t)*math.sin(math.pi*t)
            vertices.append((x,y,z))
    for row in range(nr):
        for j in range(nx-1):
            a=row*nx+j
            faces.append((a,a+1,a+1+nx))
            faces.append((a,a+1+nx,a+nx))
    return vertices,faces

def rear_hair_locks(z0=1.735,count=11):
    for i in range(count):
        u=(i+.5)/count
        a=math.pi+math.pi*u
        path,widths=[],[]
        for j in range(25):
            t=.04+.86*j/24
            x=.207*(1-.16*t**1.2)*math.cos(a)+.003*math.sin(4*a+2*t)*t
            y=.180*(1-.13*t**1.3)*math.sin(a)-.014-.014*math.sin(math.pi*t)-.002
            edge=.026*math.cos(math.tau*3*u)+.010*math.sin(math.tau*7*u+.8)
            z=z0+.191-(.254-edge)*t+.012*math.sin(2*a)*t*(1-t)
            path.append((x,y,z))
            widths.append(.00015+.0016*math.sin(math.pi*t)**1.15)
        yield f'BackHairLock09_{i:02d}',path,widths

def sleeve_profiles(r0,r1):
    return [(0,r0*.96),(.065,r0*1.005),(.18,r0*1.025),
            (.34,r0*1.02),(.56,(r0+r1)/2),(.79,r1*1.005),
            (.94,r1*1.005),(1,r1)]

def rear_collar_patch():
    vertices,faces=[],[]
    for side_i,zoff in enumerate((-.020,.006,.035)):
        for i in range(45):
            u=-1+2*i/44
            vertices.append((.168*u,-.134-.052*math.sqrt(max(0,1-u*u))-side_i*.005,
                             1.425+.047*(1-u*u)+zoff))
    for row in range(2):
        for i in range(44):
            a=row*45+i
            faces.append((a,a+1,a+46))
            faces.append((a,a+46,a+45))
    return vertices,faces
