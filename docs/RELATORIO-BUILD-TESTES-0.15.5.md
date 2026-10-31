# Relatório de build e testes — SILM 0.15.5

**Ambiente:** Node 22.22.0; Playwright 1.62.1 com o Chromium do ambiente (`SILM_CHROMIUM=/opt/pw-browsers/chromium`, build 1194). O Playwright atualizado procura o build 1234, que não está instalado aqui.

## Build

`npm run build`: aprovado. Passos executados:
- validadores do banco e do estado científico;
- bundle;
- geometria;
- Base SI 0.9.17 conferida por hash;
- entrada gerada;
- service worker com 81 recursos;
- cobertura dos metais (57 investigáveis; CCC 13, CFC 14, HC 21);
- cobertura dos roteiros (57 metais, 5 roteiros);
- versão única 0.15.5.

## Testes

| Bateria | Resultado |
|---|---|
| `npm test` (dados científicos, roteiros, gravação transacional, missões e temas, integração completa em cinco tamanhos) | ✅ aprovado |
| `npm run test:routes:browser` | ✅ aprovado |
| `npm run test:a11y`: axe-core WCAG 2.0/2.1/2.2 AA, 84 cenários (docas e palco científico, 7 tamanhos, 3 temas), sem overflow e sem alvos menores que 24×24 px | ✅ aprovado |
| `npm run test:comparison` (Visão geral, elétrons 3D, seleção na tabela) | ✅ aprovado |
| `npm run test:backup` (backup do Caderno, aba obsoleta) | ✅ aprovado |
| `npm run test:mobile-mechanics`: toque real em 320×640, 390×844 e 844×390 | ✅ aprovado |
| `python3 scripts/audit-silm.py` (arquitetura atual) | ✅ 14/14 |

## O que estes testes encontraram e foi corrigido

- **Alvos de toque menores que 24 px.** No palco científico em 320 px, as 14 esferas do CFC mediam de 15 a 18 px.
  - O teste ampliado da branch de acessibilidade reprovou.
  - Foi corrigido com uma margem transparente nos botões das unidades e com o clique indo para a unidade de centro mais próximo.
- **`test:comparison`** reprovava no `main` (a doca da Montagem cobria o botão "Movimento eletrônico" em 1280×720). Com a Visão geral compacta da branch de textos enxutos, passou.

## Limites

- Só o Chromium foi testado; Firefox/Gecko, Safari/WebKit e aparelhos físicos continuam pendentes.
- As suítes antigas `tests/suites/s040–s120` e o executor `tests/browser.cjs` usam a entrada anterior (`#/laboratorio`, `SILM.scientificState`) e não fazem parte da verificação.
