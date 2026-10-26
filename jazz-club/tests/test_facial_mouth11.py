"""Pure-Python checks for the Sommerfeld mouth topology."""
import math
import sys
import unittest
from pathlib import Path
sys.path.insert(0,str(Path(__file__).resolve().parents[1]/'blender'))
import facial_mouth11 as f

class Mouth11Test(unittest.TestCase):
    def test_topology(self):
        result=f.validate_mouth()
        self.assertEqual((result['vertices'],result['quads'],result['boundary_edges']), (320,256,128))

    def test_morphs(self):
        vertices,faces,morphs=f.mouth_patch()
        self.assertEqual(set(morphs),set(f.MORPHS))
        self.assertTrue(all(len(x)==len(vertices) for x in morphs.values()))
        self.assertTrue(all(all(math.isfinite(n) for n in p) for arr in morphs.values() for p in arr))

    def test_expressions_are_distinct(self):
        points,_,m=f.mouth_patch()
        self.assertGreater(max(p[0] for p in m['Smile']),max(p[0] for p in points))
        self.assertLess(min(p[2] for p in m['JawOpen'][-64:]),min(p[2] for p in points[-64:])-.02)
        self.assertLess(max(p[0] for p in m['Pucker']),max(p[0] for p in points))

    def test_invalid_step_count(self):
        for n in (16,33,63):
            with self.assertRaises(ValueError):f.mouth_patch(n)

if __name__=='__main__':
    unittest.main()
