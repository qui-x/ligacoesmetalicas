# Testes, regressões e limitações — 0.2.0

## Resultado de compatibilidade

| Motor | Desktop | Mobile | Condição |
|---|---|---|---|
| Chromium 153.0.8010.0 | PASS | PASS | Headless; emulação móvel e eventos touch |
| Firefox 153.0 | PASS | PASS | Gecko; viewport móvel e touch, sem emulação `isMobile` |
| WebKit 26.5 | Não executado | Não executado | Download disponível, inicialização bloqueada por bibliotecas nativas ausentes |

`0.2.0/evidence/COMPATIBILIDADE.json` registra versões efetivas, dimensões, estados, resultados e o erro de disponibilidade do WebKit. As versões da tabela devem ser lidas junto desse arquivo. A ausência do WebKit não é aprovação de Safari/iOS.

Foram exercitados 320, 360, 390, 768, 844, 1024 e 1440 px, portrait/landscape e fonte 75%, 150% e 200%. Verificações: ausência de overflow horizontal, sheet dentro do viewport, mouse/touch/teclado, foco contido e retorno, Manual/busca/acordeão, modal, notificação, preferências do sistema e persistência, reset estrutural e de domínio. Oito scans axe (claro/escuro, dois motores, dois modos) retornaram zero violações nos estados da demo analisados. Isso não equivale a certificação WCAG de todos os fluxos.

Capturas desktop/mobile e Manual foram inspecionadas. A interface vazia, o módulo nulo e os cenários offline são registrados também em `ACEITE-FINAL.json` após a execução final.

## Regressões reproduzíveis

`tests/run.cjs` executa 15 grupos, com resultados em `tests/results/REGRESSAO.json`. Uma cópia congelada da execução de entrega está em `0.2.0/evidence/REGRESSAO.json`.

| Grupo | Evidência |
|---|---|
| 3 | Contexto externo, painéis e substituição do host |
| 4 | Montagens repetidas e limpeza de escopo |
| 5 | Contrato pluggável e ações |
| 6 | Tema e proteção de tokens estruturais |
| 7 | Fonte, preferências e teclado |
| 8 | Dimensões, sheets e alvos de toque |
| 9 | Manual, busca, ações e limpeza |
| 10 | Modal e quatro tipos de notificação |
| 11 | Migração seletiva, namespaces e JSON inválido |
| 12 | Instalação de SW anterior de teste, update real, cache alheio preservado, reload online/offline |
| 13 | Referências DOM/ARIA e IDs |
| 15 | Demo completa e destroy |
| 16 | Resets repetidos e recuperação |
| 17 | Falhas controladas de mount, timer, ação e resize |
| 18 | 65 ciclos, GC, contadores DOM/listeners, WebGL e referências obsoletas |

`tests/manual-recovery.cjs` cobre skip link no Manual, IDs na impressão, foco após reset e botão de busca em telas estreitas com fonte ampliada. `tests/final-acceptance.cjs` cobre os gates de base vazia e demo na versão final. Os testes não reescrevem checkpoints históricos.

Na memória: cinco ciclos de aquecimento, sessenta medidos e seis coletas pós-GC. O critério é crescimento final de heap inferior a 1 MB, nós DOM até +40 e listeners até +5 sobre a primeira medição; recursos geridos, canvases e overlays retornam a zero. A evidência adicional de compatibilidade deixa interval e RAF realmente executar antes de desmontar e verifica que não voltam a incrementar o contador. Contexto WebGL foi criado e perdido; host antigo desconectado e escrita de storage por contexto destruído bloqueada. Resultados pertencem ao cenário testado, não a uma prova geral sobre bibliotecas externas.

## Problemas encontrados e resolvidos

| Problema | Correção/verificação |
|---|---|
| Preferências de A11Y substituíam a query e removiam `demo=1` | Mesclagem dos parâmetros; demo persiste após reload |
| Possível referência ao objeto anterior de A11Y em restauração | Atualização coerente do estado exportado; preferências revalidadas |
| Contextos/hosts de montagens anteriores | Novo host, escrita protegida e cleanup por escopo; ciclos e estado stale exercitados |
| Promessas rejeitadas em ações/listeners | Captura de erro e estado neutro; quatro falhas controladas |
| Busca do Manual quebrava “Buscar” em mobile | Entrada flexível e botões sem quebra; teste em 320/390 e até 200% |
| Skip link aparecia fora de posição em captura Gecko e apontava sempre para workspace | Ocultação sem foco e destino de foco segundo a tela; Manual permanece aberto |
| Impressão podia duplicar ID do título | Remoção de ID da cópia de impressão; IDs únicos verificados |
| Reset solicitado no Manual tentava focar região ainda oculta | Foco aplicado após troca de rota |
| Migração inválida silenciosa | Log técnico neutro; padrões permanecem disponíveis |
| Espera por SW após falha de registro | Preparação adicional termina quando registro falha |

Durante preparação dos testes, houve também ajustes no harness: aguardar `window.SimCore?.ready` durante reload, aguardar mudança assíncrona de media query no Gecko e retirar gravação dos gates históricos da suíte distribuída. São correções de teste, não regressões do produto. Não há falha estrutural crítica conhecida nos cenários aprovados.

## Reexecutar

Requer Node.js 22 ou posterior, Python 3 opcional para servir manualmente, Playwright e navegadores. As dependências só são usadas em desenvolvimento.

```bash
npm install
npx playwright install chromium firefox webkit
npm run build
npm test
npm run test:compat
npm run test:recovery
npm run test:acceptance
```

O SO precisa fornecer as dependências dos navegadores. O ambiente desta entrega usou Chromium fornecido por `@sparticuz/chromium` e Playwright para Gecko; isso não vira dependência de produção. `PLAYWRIGHT_MODULE`, `AXE_MODULE`, `CHROMIUM_EXECUTABLE`, `CHROMIUM_LIBS` e `TEST_OUTPUT` permitem reproduzir o ambiente sem caminhos absolutos gravados no pacote. Em instalação convencional, omita essas variáveis.

Os resultados de uma nova execução ficam em `tests/results`; não altere as evidências congeladas da entrega nem distribua a cópia modificada com o mesmo hash. A suíte falha se Chromium/Firefox não iniciarem; WebKit indisponível é registrado expressamente.

## Limitações para homologação

1. Sem teste em Safari/iOS, aparelhos físicos, teclado virtual real, leitores de tela ou PWA instalada pelo usuário. Touch e orientação foram emulados. O diálogo de impressão real e instalação no sistema operacional não foram homologados.
2. Offline depende de carga online completa, HTTPS/localhost, recursos declarados e políticas de quota/evicção. O cache de arquivos de um domínio pode permanecer após unload; dados pessoais/científicos não são colocados nesse cache pelo core. Uma preparação de cache já iniciada pode concluir após desmontagem.
3. Lifecycle requer cooperação do módulo: recursos externos devem usar scope/cleanup/signal; hooks que nunca terminam não têm cancelamento forçado. Não há sandbox de segurança entre módulos.
4. API e manifesto são um contrato de integração em JavaScript, não um validador completo de conteúdo hostil. Cores, acessibilidade do renderer, schema persistente e ciência de futuros módulos exigem testes próprios.
5. O cache PWA e manifesto instalado pertencem à Base; identidade dinâmica altera a página. Distribuições derivadas precisam versionar cache/manifesto no seu próprio pacote.
6. O índice de auditoria é estático com revisão por responsabilidade; a ausência de termos e os testes não são prova matemática de inexistência de acoplamento ou vazamento.
7. Cabeçalhos com muitas ações e fonte elevada ocupam mais espaço e podem exigir rolagem vertical. A disposição mantém controles acessíveis; módulos devem limitar ações simultâneas pelo contexto.

Estado: pronta para homologação dentro dos cenários e limites registrados. A validação externa e qualquer próxima versão permanecem fora desta execução.
