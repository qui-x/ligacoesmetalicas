# Baseline F0 — Explorar

> **Status:** inventário estático concluído; execução automatizada pendente.  
> **Data da captura:** 03/11/2026.  
> **Branch auditada:** especificacoes-atuais.  
> **Commit auditado:** 9049b7db12be96945181531f02edb1159b25c02f.  
> **Objetivo:** fixar o estado de partida antes de modificar contratos, relógio, motores ou persistência.

## 1. Resultado executivo

A inspeção do código, dos scripts, dos testes e dos workflows foi concluída. O estado atual está documentado abaixo, mas o baseline **não pode ser marcado como aprovado** até que build e testes sejam executados sobre este commit ou sobre um commit de baseline equivalente.

Nesta execução:
- inventário do código e dos testes: concluído;
- identificação de versões, valores didáticos e ciclos temporais independentes: concluída;
- consulta de checks do HEAD: nenhum check registrado;
- execução local de npm: não realizada, pois o ambiente não conseguiu resolver github.com para obter o repositório;
- workflow de validação: identificado, mas não cobria a branch especificacoes-atuais;
- resultados de testes: pendentes, não presumidos.

A falha de acesso de rede ao clonar não é uma falha de build do SILM. É uma limitação do ambiente de execução desta auditoria. O documento não atribui sucesso nem falha ao código sem log real.

## 2. Identidade do baseline e relação entre branches

| Item | Valor |
|---|---|
| Repositório | qui-x/ligacoesmetalicas |
| Branch de desenvolvimento/documentação | especificacoes-atuais |
| HEAD auditado | 9049b7db12be96945181531f02edb1159b25c02f |
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

## 7. CI observado e lacuna de gatilho

O workflow .github/workflows/silm-016-validation.yml executa:
1. npm ci;
2. instalação do Chromium para Playwright;
3. npm run build;
4. npm run test:mobile-mechanics;
5. npm test;
6. npm run test:a11y;
7. npm run test:parity;
8. npm run test:comparison;
9. npm run test:routes:browser com SILM_BROWSER_SUITE=workspace-family.

Antes desta captura, seu gatilho de push abrangia somente feat/silm-0.16-acessibilidade-mobile. O gatilho pull_request exigia destino main e alterações em caminhos de código, testes, scripts ou package files. Por isso, commits exclusivamente documentais na especificacoes-atuais não recebiam validação.

A consulta de check-runs no HEAD 9049b7d retornou zero checks. A lista de Actions não apresentou execução na branch especificacoes-atuais. Execuções bem-sucedidas encontradas para a branch claude/optimistic-cerf-167d72 não são o baseline deste HEAD e não devem ser usadas para afirmar aprovação.

**Correção operacional proposta:** habilitar o mesmo workflow de validação nos pushes de especificacoes-atuais. Isso não muda a aplicação; permite que o próximo commit da branch inicie o pipeline real de F0.

## 8. Execução pendente — comandos e captura obrigatória

Executar no runner com Node.js 22 e instalar dependências com npm ci. Registrar o SHA exato avaliado.

Ordem:
1. npm ci
2. npm run build
3. npm run test:scientific
4. npm run test:routes
5. npm run test:learning
6. npm run test:integration
7. npm run test:mobile-mechanics
8. npm run test:a11y
9. npm run test:parity
10. npm run test:comparison
11. npm run test:backup
12. npm run test:routes:browser

Capturar para cada etapa: resultado, duração, logs de falha, versão real de Node/npm, navegador e commit testado. Se o workflow não executar todos os comandos, executar os que faltam em pipeline adicional antes de marcar F0 como concluída.

### Registro de execução

| Etapa | Resultado nesta auditoria |
|---|---|
| Clone/checkout do repositório | Bloqueado: DNS não resolveu github.com no ambiente local. |
| npm ci | Não executado. |
| npm run build | Não executado. |
| npm run test:scientific | Não executado. |
| npm run test:routes | Não executado. |
| npm run test:learning | Não executado. |
| npm run test:integration | Não executado. |
| npm run test:mobile-mechanics | Não executado. |
| npm run test:a11y | Não executado. |
| npm run test:parity | Não executado. |
| npm run test:comparison | Não executado. |
| npm run test:backup | Não executado. |
| npm run test:routes:browser | Não executado. |

Não interpretar “Não executado” como sucesso ou falha. O baseline automatizado permanece pendente.

## 9. Decisão sobre F1

F1 não deve alterar regras científicas antes do resultado do baseline. A partir do inventário estático, a primeira rodada de contratos deve cobrir:

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
- [ ] O pipeline roda no commit-base da branch completa.
- [ ] Build termina com sucesso.
- [ ] A suíte de regressão exigida termina com sucesso.
- [ ] Falhas preexistentes, se houver, estão identificadas por teste e log.
- [ ] Resultados, versões e SHA estão registrados.
- [ ] O baseline é reproduzível por outro checkout.

Até lá, F0 tem **inventário estático concluído e baseline automatizado pendente**.

## 11. Limites

Esta captura não alterou os motores, o schema científico, os dados, a interface ou os testes. O workflow poderá ter seu gatilho de branch ampliado como infraestrutura de CI, sem alterar a aplicação. Não há homologação científica ou técnica reivindicada por esta auditoria.
