"""Original deterministic texture study, no third-party assets.
256 px skin, wool, hair, vest base-color maps for Blender/glTF.
This is an artistic study; not final photoreal PBR or historic likeness.
"""
import argparse,math,random,struct,zlib
from pathlib import Path
SIZE=256
BASE={'skin':(188,147,120),'wool':(49,51,56),'hair':(78,70,62),'vest':(83,76,74)}

def png_rgb(path,w,h,pixels):
    def chunk(name,b):
        return struct.pack('>I',len(b))+name+b+struct.pack('>I',zlib.crc32(name+b)&0xffffffff)
    rows=b''.join(b'\x00'+bytes(pixels[y*w*3:(y+1)*w*3]) for y in range(h))
    data=(b'\x89PNG\r\n\x1a\n'
          +chunk(b'IHDR',struct.pack('>2I5B',w,h,8,2,0,0,0))
          +chunk(b'IDAT',zlib.compress(rows,9))
          +chunk(b'IEND',b''))
    Path(path).write_bytes(data)

def generate(directory,size=SIZE):
    directory=Path(directory)
    directory.mkdir(parents=True,exist_ok=True)
    for kind,rgb in BASE.items():
        rng=random.Random(20261026+sum(map(ord,kind)))
        pixels=bytearray()
        for v in range(size):
            for u in range(size):
                x,y=u/size,v/size
                noise=rng.gauss(0,1)
                if kind=='skin':
                    bump=1.5*noise+1.6*math.sin(math.tau*x*12)*math.cos(math.tau*y*9)
                    blush=3*math.exp(-((x-.32)/.23)**2-((y-.5)/.29)**2)
                    d=(bump+blush,bump*.78,bump*.66)
                elif kind=='wool':
                    warp=(2.0 if u%3==0 else -.5)+(2.0 if v%3==0 else -.5)
                    d=(warp+1.35*noise,)*3
                elif kind=='hair':
                    strokes=3.1*math.sin(math.tau*x*65+.4*math.sin(math.tau*y*3))
                    d=(strokes+noise,strokes+.9*noise,strokes+.8*noise)
                else:
                    weave=1.7*math.sin(math.tau*x*37)*math.cos(math.tau*y*37)
                    d=(weave+noise,)*3
                pixels.extend(max(0,min(255,round(rgb[i]+d[i]))) for i in range(3))
        png_rgb(directory/f'{kind}-albedo-07.png',size,size,pixels)
    return directory

if __name__=='__main__':
    p=argparse.ArgumentParser()
    p.add_argument('--output',required=True)
    print('MATERIAL_STUDIES',generate(p.parse_args().output))
