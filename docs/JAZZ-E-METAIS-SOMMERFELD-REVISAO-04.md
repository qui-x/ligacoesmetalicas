# Jazz e Metais — Sommerfeld · revisão 04 (refinamento)
**26/10/2026 — estudo em andamento, não homologado**

> A pedido do autor, **não** iniciar produção em série nem planejar demais personagens da plateia antes que Sommerfeld seja aprovado como padrão gráfico e técnico.

## Progresso da revisão 04
- **Rosto:** abertura dos olhos reduzida, pálpebras menos proeminentes, bigode com mechas finas, sobrancelhas discretas e pequenas linhas de expressão; nariz e orelhas com volumes menores.
- **Cabelo:** redução de volumes grosseiros, mais mechas, pentes de risca e fios grisalhos; ainda requer escultura artística e comparação com fotografias históricas.
- **Materialidade:** pele e lã com paleta menos saturada; serão necessários UVs, texturas PBR bakeadas e teste real de iluminação no Babylon.
- **Corpo e roupas:** malhas da revisão 03 mantidas, com fingers menores; mãos e terno precisam de nova etapa de rig/tecido.
- **Prévia:** arquivo estático `sommerfeld-study-04.glb` produzido localmente por geometria Python, acompanhado de imagens frontal/3-4/perfil, close do rosto e comparação 03/04; disponível no pacote da conversa de revisão.
- **Validação offline:** 5 testes de cabeçalho GLB, leitura/reimportação, finitude das coordenadas, peças presentes, metadados e face com 5.376 quadros e sete targets matemáticos passaram.
- **Blender/Babylon:** `jazz-club/blender/build_sommerfeld.py` atualizado com mudanças proporcionais equivalentes para a fonte animável. **O GLB estático de prévia não é binariamente idêntico à saída deste script**; só haverá uma fonte gráfica única após executarmos Blender, aprovarmos sua exportação e realizarmos o teste real Babylon.js.

## Pesquisa visual
- Fotografia de Sommerfeld: Library of Congress, Bain News Service, ca. 1920–1925: https://www.loc.gov/item/2014715010/ . Acervo indica nenhuma restrição conhecida de publicação, mas não autoriza afirmar que o retrato tem licença universal; consulta e proveniência sempre explícitas.
- Metodologia para modelagem, retopologia e rig: CrossMind Studio, https://www.youtube.com/@CrossMindStudio. Apenas técnicas públicas, sem reaproveitar assets dos vídeos.

## Problemas ainda impeditivos de homologação
1. A semelhança histórica ainda não foi avaliada e aprovada; acessórios como óculos exigem análise documental.
2. O rosto permanece estilizado/geométrico, não esculpido com alças de topologia específicas ao redor de olhos, boca e músculos faciais.
3. Mãos e dedos não possuem rig confiável, não simulam contato natural com objetos nem gesto de aplausos.
4. PBR/UV, iluminação e clipping (especialmente terno e cadeira) precisam de inspeção em ambiente com GPU.
5. Não houve execução real do Blender nesta sessão, nem build Babylon.js homologada.
6. Nenhuma alteração neste branch deve alcançar a `main` sem revisão de integridade do simulador.

## Próximo marco (ainda **Sommerfeld**, não outros personagens)
- Executar/exportar o `.blend` nativo pelo Blender/GitHub Actions e conferir o GLB resultante.
- Reunir a malha renderizável e a malha de deformação em um único asset, reconciliando controles faciais.
- Refinar fisionomia em comparação com fotografias da década de 1920; retrabalhar cabelos, óculos, tecidos e mãos.
- Testar controle de câmera e animações de observar/anotar/aplaudir no Babylon.js real.
- Obter aprovação do padrão em close, corpo inteiro, projeções laterais, com movimento e reduced-motion. **Somente depois** organizar produção dos demais protagonistas/cientistas.

## Onde estão os códigos
- `jazz-club/blender/build_sommerfeld.py` — geração Blender do estudo 04, com saídas GLB e .blend mediante execução.
- `jazz-club/blender/face_anatomy.py` — superfície em quadriláteros e sete deformações-alvo.
- `jazz-club/web/src/main.js` — visualizador Babylon de desenvolvimento.
- `.github/workflows/jazz-blender-audience.yml` — CI de construção de assets e pacote de teste, sem publicar na main.
