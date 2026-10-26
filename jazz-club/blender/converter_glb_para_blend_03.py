"""Importar estudo geométrico GLB no Blender e salvar uma cena editável .blend.
Use: blender --background --python converter_glb_para_blend_03.py -- \
  --glb sommerfeld-study-03.glb --output Sommerfeld-estudo-03.blend
Não gera rig, animações nem aparência historicamente homologada.
"""
import argparse
import os
import sys
import bpy

args=sys.argv[sys.argv.index('--')+1:] if '--' in sys.argv else []
p=argparse.ArgumentParser()
p.add_argument('--glb',required=True)
p.add_argument('--output',required=True)
options=p.parse_args(args)
source=os.path.abspath(options.glb)
output=os.path.abspath(options.output)
if not os.path.isfile(source):raise SystemExit('GLB não encontrado: '+source)
if not output.lower().endswith('.blend'):raise SystemExit('Saída precisa terminar em .blend')
bpy.ops.wm.read_factory_settings(use_empty=True)
bpy.ops.import_scene.gltf(filepath=source)
count=sum(o.type=='MESH' for o in bpy.data.objects)
if count<120:raise SystemExit('Importação incompleta: '+str(count)+' malhas')
bpy.context.scene.unit_settings.system='METRIC'
os.makedirs(os.path.dirname(output),exist_ok=True)
bpy.ops.wm.save_as_mainfile(filepath=output,compress=True)
print('SOMMERFELD_REV03_BLEND_SAVED',output,'meshes',count)
