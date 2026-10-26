"""Safety check: never guess Blender morph target order.
A wrong target-name order makes a 'smile' deform another feature silently.
"""
import json,sys,tempfile,unittest
from pathlib import Path
sys.path.insert(0,str(Path(__file__).resolve().parents[1]/'blender'))
import glb_clips13 as pack

MORPHS=['Blink_L','Blink_R','BrowRaise','Smile','JawOpen',
        'Squint_L','Squint_R','Pucker','Frown','Speech_A']

class GLBMorphClipTests(unittest.TestCase):
    def make_sample(self,path,with_names):
        face={
            'name':'SOMMERFELD_FACE_QUAD_BASE',
            'primitives':[{'targets':[{'POSITION':i} for i in range(10)]}],
        }
        if with_names:face['extras']={'targetNames':MORPHS}
        doc={
            'asset':{'version':'2.0'},
            'meshes':[face],
            'nodes':[{'mesh':0}],
            'buffers':[{'byteLength':4}],
            'bufferViews':[],
            'accessors':[],
        }
        pack.store_glb(path,doc,bytearray(b'\0'*4))

    def test_no_guessed_target_order(self):
        with tempfile.TemporaryDirectory() as folder:
            path=Path(folder)/'no_names.glb'
            self.make_sample(path,False)
            with self.assertRaisesRegex(ValueError,'Morph names unavailable'):
                pack.apply(path)

    def test_three_valid_named_animation_clips(self):
        with tempfile.TemporaryDirectory() as folder:
            path=Path(folder)/'with_names.glb'
            self.make_sample(path,True)
            pack.apply(path)
            doc,_=pack.read_glb(path)
            self.assertEqual({x['name'] for x in doc['animations']},
                             {'SmileCycle','JawOpenCycle','BlinkCycle'})
            for anim in doc['animations']:
                channel=anim['channels'][0]
                self.assertEqual(channel['target']['path'],'weights')
                out_accessor=doc['accessors'][anim['samplers'][0]['output']]
                self.assertEqual(out_accessor['count'],60)
            pack.apply(path)  # idempotent
            doc,_=pack.read_glb(path)
            self.assertEqual(len(doc['animations']),3)

if __name__=='__main__':unittest.main()
