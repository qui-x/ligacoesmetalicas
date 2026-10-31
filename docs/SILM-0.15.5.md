# SILM 0.15.5 — Consolidação

**Origem:** `main@893076b` (SILM 0.15.4 sobre a Base SI 0.9.17). Esta versão não muda nenhum dado nem cálculo científico (schema 8).

## Por que esta versão existe

Entre 19 e 30 de outubro, o SILM passou a rodar sobre a Base SI, com Roteiros, Missões, Temas, Caderno, Oficina dos Metais e 14 metais novos. Ao analisar o conjunto, apareceram três frentes:

- **Branches com trabalho pronto e fora do `main`:**
  - a auditoria de paridade mecânica SIAB × SILM;
  - os textos enxutos e a matriz de paridade de telas;
  - os testes de acessibilidade e de mecânicas no celular.
- **Metadados desencontrados:** 0.15.4 no pacote, 0.15.2 no `BUILD-INFO.json` e no site.
- **Ferramentas de verificação que ainda olhavam para a arquitetura antiga.**

A 0.15.5 junta tudo, sem mexer no clube Jazz e Metais.

## O que muda

1. **Branches mescladas:**
   - `feat/paridade-mecanica-siab-silm-20261029-audit`: correção do clique residual depois de uma pinça cancelada, testes da montagem, teste público SIAB × SILM e CI;
   - `refactor/silm-copy-slim-20261030`: textos enxutos, Visão geral com os controles compactos e a matriz `docs/PARIDADE-SIAB-SILM.md`;
   - `feat/silm-0.16-acessibilidade-mobile`: axe em sete tamanhos e três temas, toque real no celular e CI.
2. **Os textos enxutos agora estão na fonte da entrada.** A branch de textos editava só o `index.html`, que é gerado. Qualquer build desfaria os textos. Agora eles estão em `integracao/index.html`. A auditoria confere que o `index.html` é exatamente a saída do gerador.
3. **Entrada do Jazz e Metais preservada.** A mesclagem dos textos removia o link do símbolo do SILM para o clube. Ele foi restaurado exatamente como estava, porque o clube fica fora desta etapa.
4. **Versão única.**
   - `VERSION` é a fonte da versão. `scripts/check-version.cjs` confere pacote, lock, `BUILD-INFO.json`, o manifesto da Base no `adapter.js`, os rótulos da página e a versão do cache.
   - A conferência roda no fim do build e nos testes científicos.
   - O `BUILD-INFO.json` agora declara a Base SI 0.9.17, e não a antiga Base Estrutural 0.3.1.
5. **Cache offline só com o que a página usa:** caiu de 193 para 81 recursos (cerca de 0,8 MB a menos).
   - Fica tudo o que `index.html` e `completo.html` carregam, mais o manifesto, os ícones, `assets/` e a entrada do Jazz e Metais (lista fixa, sem áudio).
   - Saem as fontes da Base (`upstream/app.js`, `.ts`), o núcleo antigo, os scripts de domínio não carregados e as evidências `.cif`. Nenhum deles é pedido em tempo de execução.
6. **Auditoria da arquitetura atual.** `scripts/audit-silm.py` foi reescrita. A anterior quebrava (`ValueError`) porque conferia o núcleo antigo. A nova confere:
   - a versão única;
   - a Base SI travada por hash;
   - a entrada gerada;
   - um único shell carregado;
   - a ordem do motor científico;
   - o cache offline;
   - a sintaxe;
   - o schema 8 e os validadores;
   - os contratos de representação;
   - os roteiros e a documentação.
7. **Cobertura dos roteiros gerada.** `docs/COBERTURA-ROTEIROS.md` ainda listava 43 metais. Agora sai de `scripts/build-route-coverage.cjs`, a partir do catálogo real:
   - 57 metais investigáveis;
   - 48 com os 5 roteiros;
   - 9 só com o roteiro dos elétrons, e o documento explica por quê.
8. **Alvos de toque de 24 px no palco científico (WCAG 2.5.8).** O teste ampliado da branch de acessibilidade mostrou que, num celular de 320 px, as 14 esferas do CFC tinham botões de 15 a 18 px.
   - Agora cada botão de unidade ganha uma margem transparente até ter pelo menos 24 px na tela. A margem é recalculada com o zoom, o tamanho do palco e a profundidade.
   - A esfera, os anéis de vizinhança e de calor e os rótulos ficam num corpo visual próprio e não mudam de tamanho.
   - Como as margens podem se sobrepor, o clique de ponteiro vai para a unidade de centro mais próximo, ou para a da frente quando o ponto cai em mais de uma esfera. É a mesma regra do toque central do renderizador.
   - Enter e Espaço continuam usando a unidade em foco.
9. **Documentação corrigida.** O Manual e o `RENDERER-3D.md` diziam que os elétrons somem durante a órbita 3D. Desde a 0.15.4, eles continuam visíveis e animados.

## O núcleo antigo

A Base Estrutural 0.3.1 (`js/`, `css/`, `a11y.js`), o `domain/silm/bootstrap.js` e as suítes `tests/suites/s040–s120` não rodam desde a integração com a Base SI.

- Eles continuam no repositório como histórico.
- A auditoria garante que nenhum deles volte a ser carregado pela entrada.
- A remoção depende de uma decisão do autor.

## Validação

Veja `docs/RELATORIO-BUILD-TESTES-0.15.5.md`.

## Próximos passos

Conforme a ordem combinada:

1. Revisão científica: o parâmetro do rubídio, as fontes dos 14 metais novos e as estruturas sem modelo validado na comparação.
2. Paridade de telas com o SIAB, nas etapas 1 a 6 de `docs/PARIDADE-SIAB-SILM.md`.
