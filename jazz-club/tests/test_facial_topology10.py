"""Teste puro da topologia facial inspirada em modelagem animation-ready."""
import sys,unittest
from pathlib import Path
sys.path.insert(0,str(Path(__file__).resolve().parents[1]/'blender'))
import facial_topology10 as f

class TestFacialLoops10(unittest.TestCase):
    def test_counts_and_boundaries(self):
        for side in (-1,1):
            report=f.validate_eyelid(side)
            self.assertEqual(report['vertices'],192)
            self.assertEqual(report['quads'],144)
            self.assertEqual(report['boundaries'],96)

    def test_independent_blink(self):
        for side in (-1,1):
            points,_,targets=f.eyelid_patch(side)
            own='Blink_L' if side<0 else 'Blink_R'
            other='Blink_R' if side<0 else 'Blink_L'
            self.assertNotEqual(points,targets[own])
            self.assertEqual(points,targets[other])

    def test_symmetry(self):
        left,_,_=f.eyelid_patch(-1)
        right,_,_=f.eyelid_patch(1)
        for a,b in zip(left,right):
            self.assertAlmostEqual(a[0],-b[0],places=8)
            self.assertAlmostEqual(a[1],b[1],places=8)
            self.assertAlmostEqual(a[2],b[2],places=8)

    def test_invalid_parameters(self):
        for side,n in ((0,48),(-1,20),(1,47)):
            with self.assertRaises(ValueError):
                f.eyelid_patch(side,n)

if __name__=='__main__':
    unittest.main()
