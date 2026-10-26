"""Contract for original texture maps; no Pillow or Blender needed."""
import sys,struct,tempfile,unittest,zlib
from pathlib import Path
sys.path.insert(0,str(Path(__file__).resolve().parents[1]/'blender'))
import materials07

class Materials07Tests(unittest.TestCase):
    def test_texture_generation_and_png_integrity(self):
        with tempfile.TemporaryDirectory() as tmp:
            out=materials07.generate(tmp,size=64)
            files=sorted(out.glob('*.png'))
            self.assertEqual(len(files),4)
            for f in files:
                b=f.read_bytes()
                self.assertEqual(b[:8],b'\x89PNG\r\n\x1a\n')
                n=struct.unpack('>I',b[8:12])[0]
                self.assertEqual(n,13)
                w,h=struct.unpack('>II',b[16:24])
                self.assertEqual((w,h),(64,64))
                pos=8
                pieces=[]
                while pos<len(b):
                    size=struct.unpack('>I',b[pos:pos+4])[0]
                    name=b[pos+4:pos+8]
                    payload=b[pos+8:pos+8+size]
                    expected=struct.unpack('>I',b[pos+8+size:pos+12+size])[0]
                    self.assertEqual(zlib.crc32(name+payload)&0xffffffff,expected)
                    if name==b'IDAT': pieces.append(payload)
                    pos+=12+size
                    if name==b'IEND':break
                pixels=zlib.decompress(b''.join(pieces))
                self.assertEqual(len(pixels),64*(1+64*3))

    def test_same_seed_same_output(self):
        with tempfile.TemporaryDirectory() as a,tempfile.TemporaryDirectory() as b:
            materials07.generate(a,size=32)
            materials07.generate(b,size=32)
            for item in materials07.BASE:
                name=item+'-albedo-07.png'
                self.assertEqual((Path(a)/name).read_bytes(),(Path(b)/name).read_bytes())

if __name__=='__main__':unittest.main()
