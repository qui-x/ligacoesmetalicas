"""Contract of a truly connected facial mouth mesh. Pure Python."""
import math,sys,unittest
from pathlib import Path
sys.path.insert(0,str(Path(__file__).resolve().parents[1]/'blender'))
import face_integration12 as face
class IntegratedFaceTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.v,cls.f,cls.m,cls.bounds,cls.starts=face.build()
    def test_counts(self):
        r=face.validate()
        self.assertEqual((r['vertices'],r['quads'],r['mouth_open_edges']), (5664,5376,64))
        self.assertEqual(r['boundary_edges'],256)
    def test_mouth_is_same_connected_mesh(self):
        self.assertTrue(all(i<len(self.v)-192 for i in self.bounds))
        self.assertEqual(len(set(self.bounds)),64)
        # Bridge faces include old cranial vertex AND first inward ring.
        border=len(self.f)-192
        self.assertTrue(any(min(p)<5472 and max(p)>=5472 for p in self.f[border:border+64]))
    def test_all_morphs_preserve_topology(self):
        self.assertEqual(len(self.m),10)
        for coords in self.m.values():
            self.assertEqual(len(coords),len(self.v))
            self.assertTrue(all(all(math.isfinite(a) for a in xyz) for xyz in coords))
    def test_jaw_open_and_smile_distinct(self):
        inner=self.starts[-1]
        a=self.v[inner:inner+64]
        o=self.m['JawOpen'][inner:inner+64]
        self.assertGreater(max(v[2] for v in o)-min(v[2] for v in o),
                           max(v[2] for v in a)-min(v[2] for v in a)+.01)
        self.assertNotEqual(a,self.m['Smile'][inner:inner+64])
    def test_deterministic(self):
        self.assertEqual(self.v,face.build()[0])
if __name__=='__main__':unittest.main()
