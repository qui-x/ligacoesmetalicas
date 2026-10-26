# Jazz e Metais — Sommerfeld · Revisão 08 — fechamento 360°

**26/10/2026 | Branch isolada:** `feature/baile-eletrons-jazz-1925`
**Situação:** fechamento geométrico demonstrável, **não** personagem homologado.

## Solicitação atendida
Responder à observação de que um lado do personagem parecia incompleto. O GLB anterior já continha membros bilaterais, mas carecia de acabamento equivalente nas costas, nuca, ombros, costuras externas das mangas e barras. A revisão 08 destina-se ao **fechamento visual em 360 graus**, sem iniciar novos personagens.

## Novos componentes de geometria
- `CoatBackFullPanel08`: painel tridimensional posterior do paletó;
- `CoatBackVent08_±1`, `JacketRearHem08`: pregas e barra posterior;
- `RearNeckCollar08`: continuação do colarinho nas costas;
- `BackShoulderSeam08_±1`: costuras superiores de ambos os ombros;
- `BackSleeveCuff08_±1`, `OuterSleeveBackSeam08_±1`: acabamento dos dois braços no lado posterior;
- `RearTrouserHem08_±1`: bainha posterior de ambas as pernas;
- `RearHairNapeContinuous08`, `BackHairLock08_00..14`, `HairRearTemporalBridge08_±1`: cabelo posterior, nuca e transições nas laterais. Mechas foram suavizadas após revisão visual para evitar repetição vertical excessiva.

Os nomes são deliberadamente verificáveis nas estruturas 3D exportadas.

## Resultados de teste realmente executados
- **Prévia 3D local, feita em Python/trimesh:** `sommerfeld-study-08.glb`, **258 submalhas, 60.412 triângulos, 991.864 bytes**.
- **Exportação e reimportação GLB:** concluídas.
- **Oito testes locais:** 8/8 passaram: cabeçalho GLB, novo painel, cobertura capilar posterior, acabamento bilateral, existência dos dedos, coordenadas finitas, comparação estrutural contra 07 e manifesto.
- **Capturas 360° em software VTK:** frente, perfil direito, costas, perfil esquerdo, três quartos traseiro e três quartos frontal. Para deixar as costas visíveis na inspeção, cadeira e palco foram ocultados **somente nas renderizações**; continuam na cena GLB de estudo.
- **Comparação visual 07 × 08:** imagens de costas e três quartos traseiros com câmera equivalente.
- **Giro de câmera em 24 quadros:** a geometria é estática, não uma animação humana.
- **Pacote entregue no chat:** `Jazz-e-Metais-Sommerfeld-Refinamento-08.zip`, 13 arquivos; inclui conversor de GLB estático para `.blend` a ser executado no Blender do usuário.

## Fonte Blender versionada e CI
- `jazz-club/blender/refine_sommerfeld_08.py`: integra as novas partes traseiras ao gerador de estudo 07 com **Blender bpy**, exporta `.blend` e `.glb` da mesma cena **quando executado com sucesso no Blender**.
- `.github/workflows/jazz-blender-audience.yml`: alterado para gerar a versão 08 e exigir os novos nós traseiros nos metadados glTF.
- O modelo GLB da prévia **não é a saída comprovada do gerador Blender**. A execução real do Blender, a build GitHub Actions e a renderização Babylon.js permanecem pendentes de validação. Não usar o resultado VTK como prova da renderização web.

## Problemas visuais ainda presentes
1. **Nuca/cabelo:** a nova malha ainda aparenta um casco em determinados ângulos; exige escultura de mechas, transição natural no couro cabeludo e melhor sombra.
2. **Ombros/terno:** continuidade geométrica existe, mas os encaixes e dobras ainda parecem rígidos, especialmente na junção manga–corpo.
3. **Pose:** mãos têm dedos individuais em malhas de estudo, mas faltam rig de mãos, deformação de manga e gestos testados sem interseções.
4. **Materiais:** acabamento PBR, UV, rugosidade, normal maps e bake precisam ser aprovados no Blender e no navegador.
5. **Fisionomia histórica:** Sommerfeld continua interpretação artística; confrontar os rostos da década de 1920, adereços e óculos com fotos verificadas.
6. **Performance:** ~60 mil triângulos e mais de 250 partes na prévia estática; precisa otimizar draw calls, materiais, instancing/LOD antes de mobile.

## Próxima revisão
**Revisão 09 — acabamento do personagem completo:** resolver encaixes de tecido na região das costas/ombros, melhorar anatomia mão-punho, fazer a nuca e o cabelo deixarem de ser um casco e **validar uma única saída Blender → GLB → Babylon.js em GPU real**. Permanecer exclusivamente com Sommerfeld; não iniciar outros cientistas nem os 17 protagonistas até aprovação do padrão.

## Referências
- Documento-mestre: `JAZZ-E-METAIS-IDENTIDADE-MODELO-3D.md`.
- Retrato: Library of Congress, Bain News Service, c. 1920–1925: https://www.loc.gov/item/2014715010/
- Referência de processo de criação: https://www.youtube.com/@CrossMindStudio
