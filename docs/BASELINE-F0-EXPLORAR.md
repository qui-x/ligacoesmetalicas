# Baseline F0 — Explorar

> **Status:** APROVADO — baseline automatizado integralmente verde.  
> **Data da captura:** 03/11/2026.  
> **Branch auditada:** especificacoes-atuais.  
> **Commit auditado:** 73040ddfce0491cee81c9c430abff67471f4fce8.  
> **Objetivo:** fixar o estado de partida antes de modificar contratos, relógio, motores ou persistência.

## 1. Resultado executivo

O baseline F0 foi executado no GitHub Actions sobre o commit **73040ddfce0491cee81c9c430abff67471f4fce8** e terminou com conclusão `success`. Todas as etapas do job passaram, incluindo build, regressão, navegação de browser, mobile, backup, acessibilidade, paridade e comparação.

Resultados consolidados:
- `npm ci`: sucesso; cinco pacotes instalados e zero vulnerabilidades reportadas;
- `npm run build`: sucesso;
- `npm test`: sucesso; suítes científica, rotas, aprendizagem e integração;
- mecânicas móveis: sucesso em 320×640, 390×844 e 844×390;
- backup/restauração: sucesso em navegador vazio e bloqueio de aba obsoleta;
- acessibilidade: 84 cenários, sete viewports e três temas, sem overflow ou alvos menores que 24×24 px;
- paridade SIAB × SILM: 15 cenários de tela/experiência aprovados;
- comparação: geometria, elétrons 3D, montagem, tabela e interação aprovados;
- navegação de browser: sucesso com foco, teclado e expansão.

Nenhuma falha de teste foi registrada. A advertência de depreciação do módulo Node `punycode` não interrompeu a execução e foi tratada como não bloqueante.

## 2. Identidade do baseline e relação entre branches

| Item | Valor |
|---|---|
| Repositório | qui-x/ligacoesmetalicas |
| Branch de desenvolvimento/documentação | especificacoes-atuais |
| HEAD auditado | 73040ddfce0491cee81c9c430abff67471f4fce8 |
| Main no momento da captura | 0f59c73ede10500a2be0ace3e582db36881fb874 |
| Merge base retornado pelo GitHub | 5db5c95950456a5e5c1fe8aa5a234daa93c981e9 |
| Versão do pacote na branch completa | 0.15.5 |
| Engine declarada | Node.js >= 22 |
| Schema científico | 8 |

A comparação de branches mostra divergência aparente: a main recebeu um commit de publicação que a deixa com apenas os arquivos necessários à aplicação pública. A mensagem desse commit confirma que docs, tests, scripts, package.json, workflows e o projeto completo permanecem na especificacoes-atuais. Portanto, a main não é o ambiente correto para executar o baseline de desenvolvimento e não deve ser mesclada de volta automaticamente apenas para igualar os ponteiros.

A branch especificacoes-atuais continua sendo o alvo do desenvolvimento. O commit de limpeza da main é uma decisão de publicação, não evidência de que o código de desenvolvimento desta branch esteja atualizado ou testado.

## 3. Identificação do ambiente de build

O package.json declara:
- pacote SILM 0.15.5;
- Node.js >= 22;
- npm ci como instalação reprodutível da árvore de dependências, definida pelo package-lock.json.

Comandos existentes:

| Comando | Escopo |
|---|---|
| npm run build | Validação de dados e estado; geração de dados, layout, integração, entrada, service worker e cobertura; verificação de versão. |
| npm run test:scientific | Versão, dados científicos, cobertura cristalina, estrutura, deformação, térmico, elétrico e estado. |
| npm run test:routes | Service worker, rotas, armazenamento durável e atividades do professor. |
| npm run test:learning | Testes de temas e aprendizagem. |
| npm run test:integration | Build da integração e testes da Base. |
| npm test | Conjunto científico, rotas, aprendizagem e integração. |
| npm run test:mobile-mechanics | Mecânicas científicas móveis. |
| npm run test:a11y | Acessibilidade do workspace. |
| npm run test:parity | Paridade de telas SIAB/SILM. |
| npm run test:comparison | Comparação, elétrons 3D, montagem e interação. |
| npm run test:backup | Backup e restauração do Caderno. |
| npm run test:routes:browser | Suíte de navegação no navegador. |

## 4. Mapa técnico observado

| Componente | Observação de partida | O que F1 deve formalizar |
|---|---|---|
| domain/silm/state.js | Schema 8; validação estrita; serviço único de escrita; migrações 1–7 para 8. | Contrato de estado e fronteira de escrita; não misturar versão do motor com schema do estado. |
| domain/silm/data-api.js | Dados científicos congelados em memória; resolução de elementos e fontes. | Versão/revisão do dataset e contrato de proveniência. |
| domain/silm/crystal.js | Geometria cristalográfica determinística; modelos BCC/FCC/HCP e tipos gerais derivados do banco. | Identidade de algoritmo geométrico, entradas cristalográficas, saídas e tolerâncias. |
| domain/silm/properties.js | Catálogo inclui electrical, thermal, malleability, ductility e luster; defaults e parâmetros didáticos; fresh() usa modelVersion 1 para o conjunto de propriedades. | Separar descritor de propriedade do algoritmo e declarar evidência/aplicabilidade por experiência. |
| domain/silm/thermal.js | D=.45, DT=1/120 s, SETTLE=.01; grafo de vizinhos; fonte ideal prende centros em 1; controlador próprio com requestAnimationFrame. | Contrato de motor qualitativo, ciclo dinâmico, fonte, estado transitório e futura integração ao relógio comum. |
| domain/silm/deformation.js | Sistemas representativos FCC/BCC/HCP; LIMIT=4, YIELD=.5, EPS_YIELD=.06; controlador próprio e requestAnimationFrame; strain/limiar são didáticos. | Contrato geométrico/mecânico qualitativo, entradas, saídas, parâmetros e limites. |
| domain/silm/drive.js | Controlador guarda intensidade, ângulo e deformField; limites expostos MIN_INTENSITY=.05, MIN_ANGLE=5°, MAX_ANGLE=80°. | Descritor do atuador e semântica dos parâmetros; percentual não deve ser confundido com grandeza física. |
| domain/silm/electron-view.js | Canvas de marcadores, 24–150 partículas; fatores de espalhamento/deriva normalizados; próprio requestAnimationFrame. | Classificar como representação visual, não solver de transporte eletrônico; separar tempo visual do tempo científico. |
| domain/silm/measurements.js | Serviço independente, registros com unidade, resolução, contexto e validação. | Manter fora do orquestrador e definir contrato de observação de resultado. |
| domain/silm/calculations.js | Catálogo de fórmulas, entradas com origem, referências, dependências e validação. | Manter fora do orquestrador e identificar a dependência por IDs canônicos. |
| integracao/metallic-experience.js | Integra controles e domínio; não deve se tornar proprietário de estado científico. | Adaptador de comandos e apresentação, sem física própria. |

## 5. Transientes e fontes independentes de tempo

Foram observadas três fontes de atualização distintas:
1. thermal.js: controlador temporal com passo nominal 1/120 s, atualizado por requestAnimationFrame e acumulador limitado.
2. deformation.js: controlador temporal próprio, também com passo nominal 1/120 s e requestAnimationFrame.
3. electron-view.js: animação de marcadores com delta de frame e requestAnimationFrame próprios.

Isso confirma a necessidade da F2. Antes de F2, os testes precisam fixar o comportamento atual; não consolidar os três laços por substituição mecânica, pois a animação eletrônica é representação e os motores térmico/mecânico têm variáveis e semânticas diferentes.

## 6. Cobertura de testes existente

Testes localizados:
- tests/thermal.cjs;
- tests/deformation.cjs;
- tests/drive.cjs;
- tests/suites/s080-explorar.cjs;
- tests/suites/s090-medir.cjs;
- tests/suites/s100-calcular.cjs;
- tests/durable-storage.cjs;
- tests/notebook-backup.cjs;
- testes de integração, mobile, acessibilidade, comparação e representação.

O conjunto s080-explorar já verifica fluxos integrados, modos livre/cristalino, camadas, comparação, preservação entre módulos, recarga, offline, responsividade e acessibilidade. Também verifica que a alteração de camada não polui o Histórico.

A existência dos testes não comprova que a revisão atual passa. Nenhum resultado de execução foi inferido a partir da presença dos arquivos.

## 7. CI executado

O workflow `.github/workflows/silm-016-validation.yml` foi habilitado para pushes na branch `especificacoes-atuais`. A execução [#47 / 41737430380](https://github.com/qui-x/ligacoesmetalicas/actions/runs/41737430380) rodou sobre o SHA indicado neste relatório e concluiu com sucesso.

Etapas executadas:
1. checkout da branch;
2. Node.js 22 e `npm ci`;
3. instalação do Chromium para Playwright;
4. `npm run build`;
5. `npm run test:mobile-mechanics`;
6. `npm test`;
7. `npm run test:backup`;
8. `npm run test:a11y`;
9. `npm run test:parity`;
10. `npm run test:comparison`;
11. `npm run test:routes:browser` com `SILM_BROWSER_SUITE=workspace-family`.

O gatilho de branch alterado para permitir a execução em `especificacoes-atuais` é infraestrutura de CI; não mudou a aplicação. A validação ocorreu na branch de desenvolvimento, sem merge ou escrita na `main`.

## 8. Registro da execução aprovada

| Campo | Resultado |
|---|---|
| Workflow | SILM 0.16 — acessibilidade e mobile |
| Run | [#47 / 41737430380](https://github.com/qui-x/ligacoesmetalicas/actions/runs/41737430380) |
| Commit testado | `73040ddfce0491cee81c9c430abff67471f4fce8` |
| Início / fim | 23:13:28Z / 23:19:57Z |
| Duração | 6 min 29 s |
| Runner | Ubuntu 24.04.5 |
| Node.js / npm | v22.23.4 / 10.9.9 |
| Navegador | Chromium 151.0.7922.34 (Playwright Chromium v1234) |
| Resultado geral | `completed / success` |

| Comando | Resultado observado |
|---|---|
| `npm ci` | PASS; cinco pacotes instalados, zero vulnerabilidades reportadas |
| `npm run build` | PASS |
| `npm test` | PASS; científico, rotas, aprendizagem e integração; inclui `engine-contracts.cjs` |
| `npm run test:mobile-mechanics` | PASS; três viewports móveis |
| `npm run test:backup` | PASS; backup/restauração em navegador vazio e bloqueio de aba obsoleta |
| `npm run test:a11y` | PASS; 84 cenários, sete viewports e três temas |
| `npm run test:parity` | PASS; 15 áreas de tela/experiência SIAB × SILM |
| `npm run test:comparison` | PASS; geometria, elétrons 3D, tabela e interação de 62 estruturas |
| `npm run test:routes:browser` | PASS; workspace, foco, teclado e expansão |

Todas as etapas de setup, teste e cleanup terminaram com `success`. A advertência Node `punycode` não interrompeu a execução.

**Decisão:** F0 está fechado e aprovado para o commit testado. A validação comprova o baseline técnico e sua regressão automatizada; não é ensaio experimental de propriedades físicas.

## 9. Decisão sobre F1

Com F0 aprovado, F1 pode congelar assinaturas e fixtures sem alterar as regras científicas. A primeira rodada de contratos cobre:

- geometry/crystal: função determinística sem relógio;
- thermal: motor dinâmico qualitativo;
- deformation: motor dinâmico qualitativo com saída geométrica;
- drive: controlador de entrada/atuador, não motor físico;
- electron-view: renderer de marcadores, não motor científico;
- properties: catálogo e elegibilidade, não contrato de execução;
- measurements e calculations: serviços independentes;
- metallic-experience: adaptador/integrador.

O descritor de cada motor deve declarar ID, versão do algoritmo, classe de evidência, aplicabilidade, entradas, unidades, saídas, dependências, estado próprio, determinismo, ciclo de vida, erros e testes de referência. Versões ausentes devem ser identificadas como lacuna, não preenchidas com o número da versão do produto.

## 10. Critério de fechamento do F0

F0 só pode ser marcado como concluído quando:
- [x] O pipeline roda no commit-base da branch completa.
- [x] Build termina com sucesso.
- [x] A suíte de regressão exigida termina com sucesso.
- [x] Falhas preexistentes, se houver, estão identificadas por teste e log.
- [x] Resultados, versões e SHA estão registrados.
- [x] O baseline é reproduzível por outro checkout.

F0 está **aprovado** para o commit testado. Alterações posteriores de código ou testes devem executar novamente a suíte aplicável. Esta aprovação não autoriza alteração da `main`.

## 11. Limites

A homologação F0 confirma a base técnica e os testes de regressão no commit indicado; não constitui validação experimental de grandezas físicas nem transforma modelos qualitativos em quantitativos. A `main` permaneceu intacta.
