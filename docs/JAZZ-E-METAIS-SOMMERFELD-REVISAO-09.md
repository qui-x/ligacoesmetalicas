# Jazz e Metais — Sommerfeld · Revisão 09
**26/10/2026 · Branch `feature/baile-eletrons-jazz-1925` · Somente personagem-padrão Sommerfeld**

## O que mudou
A revisão 08 fechou geometricamente o corpo, mas a nuca tinha aparência de capa plana/rigidamente estriada, e as mangas apresentavam encontros abruptos.

- **Nuca:** substituir a superfície posterior simples por uma malha curva com menor largura na base, contorno inferior levemente irregular e 11 mechas superficiais discretas, preservando pontes laterais.
- **Mangas:** substituir a progressão antiga de quatro anéis por um perfil de oito anéis para reduzir mudanças bruscas de raio nas regiões dos ombros, antebraços e punhos; a escolha dos valores foi corrigida após inspecionar a primeira tentativa, que gerava ombros demasiadamente arredondados.
- **Gola:** substituir a linha posterior por uma peça com superfície tridimensional, preservando a separação entre pescoço e paletó.
- **Sem mudar:** base facial, pose sentada, quantidade de dedos, nível de aprovação. Ainda não existe rigging humano final nem escultura fisionômica histórica aprovada.

## Uma fonte geométrica para as alterações desta revisão
`jazz-club/blender/rev09_shapes.py` contém, **em Python puro**, as curvas compartilhadas de:
- `rear_hair_patch` e `rear_hair_locks`;
- `sleeve_profiles`;
- `rear_collar_patch`.

`jazz-club/blender/refine_sommerfeld_09.py` usa esse módulo no Blender, mantendo os controladores de cabeça/braços, a malha facial e suas sete deformações configuráveis das versões anteriores.

A **prévia GLB estática local** também usa o mesmo módulo, e as partes novas têm fórmulas e posições de referência comuns; isso reduz divergência na revisão 09, mas **não significa que todo o corpo está implementado num único gerador idêntico**. O restante da cena ainda tem representações distintas entre o gerador offline/trimesh e a versão Blender. Unificar completamente as duas linhas permanece tarefa técnica.

## Resultados efetivamente verificados no ambiente local
- GLB `sommerfeld-study-09.glb` exportado e reimportado: **254 submalhas, 63.134 triângulos e 1.037.756 bytes**.
- **10/10 testes locais aprovados**: cabeçalho/GLB reimportável, topologia nova da nuca, malha de cabelo e contorno inferior não uniforme, gola, perfil de mangas, bilateralidade, dedos, painel de costas, coordenadas finitas, manifesto e ausência de regressão da topologia facial.
- Vistas renderizadas **em software VTK**, em seis ângulos, mais comparação lado a lado 08 × 09 e giro de câmera de 24 quadros.
- Arquivos e resultados estão no pacote do chat `Jazz-e-Metais-Sommerfeld-Refinamento-09.zip`.

### O que **não** foi verificado
- Blender nativo não está instalado neste ambiente; **não foi possível executar `bpy`** nem confirmar o `.blend` da revisão 09.
- GitHub Actions foi corrigido para utilizar **`refine_sommerfeld_09.py`**, mas **seu resultado de execução não foi comprovado nesta etapa**.
- Babylon.js/GPU, rig humano, shape keys animadas e desempenho mobile não foram homologados.
- Semelhança do rosto ao retrato histórico e nível gráfico comparável a *Liar's Bar* ainda não aprovados.

## Correção identificada na CI
A automação anterior continuava executando `refine_sommerfeld_06.py` apesar de documentar a revisão 08. Isso foi corrigido: o workflow `.github/workflows/jazz-blender-audience.yml` agora compila o script 09 e valida os nós `RearHairNapeContinuous09`, `RearNeckCollar09`, `UpperSleeve09_L/R` e `ForearmSleeve09_L/R`. A `main` continua inalterada.

## Riscos e próximos critérios
1. **Modelo artístico**: olhos, nariz, cabelo e mãos continuam com aspecto de maquete; a revisão 09 não é aprovação artística.
2. **Defeitos de rig**: punho/manga, articulações de dedos, poses sentadas, contato com móveis; requer deformação humana em Blender e inspeção real.
3. **Superfícies**: ainda há bordas de ombro e gola passíveis de clipping; observar com câmera aproximada.
4. **Materiais**: base original procedural com texturas ainda sem mapas PBR definitivos e sem cabelo artístico homologado.
5. **Pipeline:** confirmar uma build Blender + GLB + visualizador Babylon real, inclusive a carga de nós e animações.
6. **Somente após aprovar Sommerfeld**: planejar escala para os demais cientistas e 17 protagonistas.

**Referências:** [Library of Congress: A. Sommerfeld, c. 1920–1925](https://www.loc.gov/item/2014715010/) · [CrossMind Studio](https://www.youtube.com/@CrossMindStudio).
