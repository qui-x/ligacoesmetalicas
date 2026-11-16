# SILM — Etapa 89: prensa 3D com garras vinculadas ao campo J2

**Status:** módulo experimental no PR #181 (draft), dependente da sala do PR #179 e da ponte mecânica do PR #180. Não altera a `main` ou o PR #172 de CPFEM.

## Referência correta da deformação

O motor `SILM.specimenJ2.active`, na configuração atual, resolve pequenas deformações em seção 2D e deformação plana. A extremidade `v=0` recebe deslocamento prescrito no domínio normalizado; a extremidade `v=1` permanece apoiada na componente vertical. O código não deve inverter essas posições por causa do eixo Y renderizado da cena.

`domain/silm/lab3d-press.js` utiliza as duas coordenadas da malha convergida, por meio de `surface.position(.5,0,1)` e `surface.position(.5,1,1)`. O equipamento visual possui:
- uma garra móvel cujo deslocamento segue **somente** a borda carregada da amostra;
- um apoio fixo coerente com a outra borda;
- guias cilíndricas e camisa do fuso telescópica, com geometria procedural original, e suportes das garras;
- a malha J2 e seus mapas mecânicos continuam sendo a fonte da forma da amostra. A extrusão Z permanece constante e ilustrativa.

O modelo não calcula torque, contato bilateral/unilateral, atrito de garras, pressão hidráulica, potência da prensa ou forças em unidades físicas por metal.

## Transição entre resultados resolvidos

Ao alterar a carga, o SILM obtém primeiro um campo J2 convergido e uma superfície compatível. Somente depois atualiza, juntos, a amostra, a posição de ambas as garras, a pose da prensa e as sombras locais. Não são exibidas malhas de um resolvedor que falhou.

Para demonstrar o movimento, a cena interpola por aproximadamente **280 ms** as posições visuais de vértices, garras e manchas de sombra entre dois estados **já convergidos**. As normais triangulares são renormalizadas; as malhas transitórias usam um buffer WebGL próprio, enquanto a geometria estática permanece no cache. Esses quadros intermediários **não** foram submetidos ao solver J2 e não devem ser apresentados como soluções de equilíbrio, medidas experimentais, contato real ou comportamento temporal do metal.

Em preferência de movimento reduzido a animação é omitida. Ao selecionar outro mapa ou reiniciar uma investigação, a transição visual não se transforma em histórico científico; continua transitória na sessão.

## Testes e limites

- `tests/silm-lab3d-press.test.cjs`: garras em coordenadas J2, invariância do apoio em exemplos com borda fixa, interpolação sem extrapolação, normais unitárias e rejeição de geometria inválida.
- `tests/run-silm-lab3d-browser.mjs`: a garra móvel deve responder a mudanças de carga; a transição inicia no modo normal, termina em tempo finito e é desativada no movimento reduzido. Permanecem os testes de mapas, Joule, microestrutura e de não escrita no estado científico.
- `tests/run-silm-lab3d-touch.mjs`: toque móvel emulado na prensa e aquecedor; arrasto da câmera sem ativação falsa.
- A auditoria de material/BRDF, desempenho de GPU real e geometria de deformação finita continua pendente.

**Não mesclar na `main` antes de verificar as capturas e a consistência física com a reformulação Montagem/Ver/Dados.**
