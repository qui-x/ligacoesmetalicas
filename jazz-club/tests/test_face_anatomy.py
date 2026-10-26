import math
import sys
import unittest
from pathlib import Path

sys.path.insert(0,str(Path(__file__).resolve().parents[1]/'blender'))
import face_anatomy as face

class AnatomyTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.vertices,cls.quads=face.head_geometry()
        cls.targets=face.facial_targets(cls.vertices)

    def test_deterministic(self):
        self.assertEqual((self.vertices,self.quads),face.head_geometry())

    def test_sculptable_quad_geometry(self):
        info=face.validate_topology(self.vertices,self.quads,self.targets)
        self.assertEqual(info['quads'],5376)
        self.assertEqual(info['vertices'],5472)
        self.assertEqual(info['boundary_edges'],192)

    def test_eyes_deform_independently(self):
        left=self.targets['Blink_L']
        right=self.targets['Blink_R']
        at_left=max(range(len(self.vertices)),key=lambda j:self.vertices[j][2]-left[j][2])
        self.assertTrue(self.vertices[at_left][0]<0)
        self.assertNotEqual(left,right)

    def test_all_targets_finite(self):
        for arr in self.targets.values():
            for p in arr:
                self.assertTrue(all(math.isfinite(x) for x in p))

    def test_invalid_parameters_rejected(self):
        for rows,cols in [(10,96),(56,14),(56,95)]:
            with self.assertRaises(ValueError):
                face.head_geometry(rows,cols)

if __name__=='__main__':
    unittest.main()
