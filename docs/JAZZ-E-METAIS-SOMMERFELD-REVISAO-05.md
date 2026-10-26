# Jazz e Metais — Sommerfeld · Refinamento 05

**Data:** 26 de outubro de 2026
**Branch de desenvolvimento:** `feature/baile-eletrons-jazz-1925`
**Situação:** estudo geométrico em andamento, **sem aprovação de semelhança histórica nem homologação 3D no navegador**.

## Melhorias realizadas
1. **Face integrada:** reduzir a aparência de nariz feito de peças separadas e modelar o relevo nasal na malha de quadriláteros da face. A superfície editável mantém 5.472 vértices, 5.376 faces e sete alvos matemáticos de expressão.
2. **Olhos e bigode:** tratamento para diminuir o aspecto de peças excessivamente destacadas e o efeito de mechas de bigode paralelas. A naturalidade dos olhos e pálpebras ainda requer escultura.
3. **Cabelo:** reduzir linhas artificiais na testa e trabalhar uma linha capilar mais limpa, preservando direção de penteado coerente com a época.
4. **Mãos:** acrescentar quatro dedos segmentados mais polegar por mão, como maquete das proporções e futuras articulações; **não representam rig de dedos homologado**.
5. **Figurino:** acrescentar detalhes de dobra no paletó, mantendo a intenção de um traje sóbrio de 1925.
6. **Reprodutibilidade:** gerar um GLB estático de estudo 05 por Python, manter testes matemáticos e preparar uma ponte Blender para importação, reconstrução da malha quad com shape keys e exportação posterior para glTF.

## Artefatos da inspeção local
Um pacote de teste foi gerado e anexado na conversa: `Jazz-e-Metais-Sommerfeld-Refinamento-05.zip`. Contém:
- `sommerfeld-study-05.glb` estático;
- `sommerfeld-05-vistas.png` (frontal, 3/4 e perfil);
- `sommerfeld-05-rosto.png` e `sommerfeld-04-vs-05.png`;
- `build_sommerfeld_05.py` e `face_anatomy_05.py` (a fonte da prévia offline);
- `assemble_blender_05.py` (experimento de montagem do arquivo .blend/GLB com shape keys);
- `test_sommerfeld_05.py`, relatório de geometrias e roteiro de execução.

**Validação executada localmente:** GLB exportado e reimportado; 9 testes aprovados incluindo cabeçalho, dimensões, geometria finita, componentes das mãos, nariz incorporado e 7 alvos de expressão na fonte matemática. O modelo estático tem cerca de 64 mil triângulos e 191 objetos de geometria, **valores de estudo ainda inadequados como orçamento final mobile sem otimização**.

**Validação pendente:** Blender real (bpy), geração do `.blend`, shapekeys exportadas, controles de pose, visualização Babylon.js com GPU, Chrome/Firefox/WebKit, performance móvel, likeness histórica e aprovação de materialidade. Nenhum resultado dessas etapas deve ser declarado como concluído sem teste.

## Fonte editável no GitHub
- `jazz-club/blender/face_anatomy.py` — perfil facial integrado, usado no gerador Blender existente.
- `jazz-club/blender/build_sommerfeld.py` — nariz integrado e dedos segmentados.
- `jazz-club/blender/assemble_sommerfeld_05.py` — monta a geometria da prévia 05 em uma cena editável, recria alvos faciais e salva `.blend` + `.glb` **mediante execução no Blender**.
- O código offline que cria o GLB da prévia visual está no pacote anexo; **ainda há diferenças de geometria e materiais entre o gerador Blender da branch e essa prévia**, que exigirão reconciliação na próxima rodada. O `.blend` da maquete estático ainda não foi executado nem verificado.

## Próximos critérios de qualidade — permanecemos com Sommerfeld
- Remover aparência rígida nos olhos e pálpebras, criar superfície orgânica e melhor retopologia de deformação.
- Modelar cabelo/cílios/pele com UVs e mapas PBR apropriados.
- Refinar mãos e dedos com deformações sem interseção e contato convincente com cadeira/mesa.
- Ajustar mangas, paletó e colete para um caimento natural.
- Confirmar semelhança histórica por comparação documentada de retratos, sem exagerar anacronismos.
- Compilar e observar o **mesmo modelo** no Blender e Babylon.js, com capacidade de pausa e movimento reduzido.
- **Somente após aprovar Sommerfeld:** desenvolver plano de execução da plateia, cientistas e 17 protagonistas.

**Referências:** [CrossMind Studio](https://www.youtube.com/@CrossMindStudio), [Biblioteca do Congresso — Sommerfeld ca. 1920–1925](https://www.loc.gov/item/2014715010/), [Khronos glTF Blender exporter](https://github.com/KhronosGroup/glTF-Blender-IO/blob/main/docs/blender_docs/scene_gltf2.rst).
