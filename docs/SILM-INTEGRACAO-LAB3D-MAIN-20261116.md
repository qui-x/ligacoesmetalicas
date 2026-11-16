# SILM — Preparação da integração da sala 3D à main (16/11/2026)

## Objetivo

Branch de integração **separada de main**, criada para validar um conjunto coerente das alterações dos PRs #179, #180 e #181 antes de qualquer publicação. O projeto continua com as docas Montagem, Ver e Dados da main atual; o PR #178 não foi mesclado nem duplicado.

## Proveniência e reconciliação

- `main` usada como referência de comparação: `c5708f103e025ab7af14974e302d58a84c0524ac`.
- #179 (laboratório navegável): `445a4ac8adfba214a38b44b70f3ced6ce1a1d87f`.
- #181 (mapas, Joule/calor, sombras, toque, prensa J2): `ea00d0d04fe6ab60d098668349a7fb018d1b5bb1`. A branch deste PR já descende da #179 e carrega suas alterações.
- #180 (ponte mecânica): `675664e80a009ba09329f65949873e4bab05be3d`. O arquivo `domain/silm/mechanics-scene-bridge.js` é byte a byte idêntico no #180 e no #181 (mesmo Git blob SHA-1 `451bd76b0eea3680854a85d6fc47bbd6d1c7a867`), portanto foi mantida a cópia já presente no #181. Os seis arquivos **exclusivos** do PR #180 foram adicionados à branch de integração, incluindo testes, documentação, motor Swift de pesquisa e workflow próprio.

Os PRs **#171** (base científica/80 elementos), **#172** (CPFEM) e **#178** (reformulação das docas) estão fora do conjunto e não devem ser modificados, fechados ou mesclados durante esta preparação. Nenhum novo valor por metal foi incorporado.

## Plano de validação e critérios de liberação

1. Abrir PR da branch de integração contra `main`, mantendo-o em **draft** até os testes.
2. Conferir diferenças, detecção de conflitos e consistência entre `index.html`, `sw.js` e os scripts novos.
3. Executar workflows dedicados à sala 3D e ponte, além das demais regressões acionadas no PR. A sala deve passar por Chromium e WebKit com WebGL2, fallback do Firefox e toque emulado.
4. Confirmar que acesso ao microscópio, dados, mapas, alimentação, carga e retornos não escrevem no estado científico dos elementos.
5. Antes de merge, revisar as capturas e os fluxos de Montagem/Ver/Dados. A presença da sala 3D na mesma tela não substitui homologação visual em dispositivo real.
6. Somente após aprovação, realizar um merge **único e controlado** desse conjunto na `main`. Não mesclar separadamente os PRs #179/#180/#181 depois disso, pois seus conteúdos já estarão representados; atualizá-los/encerrá-los de forma rastreável.

## Limites científicos

O campo de deformação usado na sala é J2 2D normalizado, com extrusão visual constante em Z; as transições de prensa não são novos cálculos FEM. A rede eletrotérmica da amostra é equivalente 1D e relativa; sombras e brilho não são propriedades ópticas medidas. Propriedades experimentais verdadeiras devem permanecer vinculadas a cada fonte e às condições de validade originais, sem impor CNTP.

## Estado

Esta preparação **não realiza merge**. A etapa só estará pronta quando os testes do PR de integração e a inspeção de mudanças forem aprovados. O vínculo ao PR e as execuções deverão constar na descrição do pull request.
