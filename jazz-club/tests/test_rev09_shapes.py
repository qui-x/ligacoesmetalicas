"""Geometry smoke tests independent of Blender or GPU."""
import math,sys,unittest
from pathlib import Path
sys.path.insert(0,str(Path(__file__).resolve().parents[1]/'blender'))
import rev09_shapes as g

class Rev09ShapeTests(unittest.TestCase):
    def test_back_scalp(self):
        verts,faces=g.rear_hair_patch()
        self.assertEqual(len(verts),1600)
        self.assertEqual(len(faces),3024)
        self.assertTrue(all(len(f)==3 for f in faces))
        self.assertTrue(all(all(math.isfinite(x) for x in v) for v in verts))
        self.assertGreater(max(v[2] for v in verts)-min(v[2] for v in verts),.2)

    def test_nape_has_irregular_edge(self):
        verts,_=g.rear_hair_patch()
        bottom=[v[2] for v in verts[-64:]]
        self.assertGreater(max(bottom)-min(bottom),.04)

    def test_locks(self):
        locks=list(g.rear_hair_locks())
        self.assertEqual(len(locks),11)
        self.assertEqual(len(set(x[0] for x in locks)),11)
        self.assertTrue(all(len(path)==25 and len(widths)==25 for _,path,widths in locks))

    def test_sleeves(self):
        profiles=g.sleeve_profiles(.115,.096)
        self.assertEqual(len(profiles),8)
        self.assertEqual(profiles[0][0],0)
        self.assertEqual(profiles[-1][0],1)
        self.assertTrue(all(0<r<.2 for _,r in profiles))
        self.assertTrue(all(a[0]<b[0] for a,b in zip(profiles,profiles[1:])))

    def test_rear_collar(self):
        verts,faces=g.rear_collar_patch()
        self.assertEqual((len(verts),len(faces)),(135,176))
        self.assertTrue(all(min(face)>=0 and max(face)<len(verts) for face in faces))

if __name__=='__main__':
    unittest.main()
