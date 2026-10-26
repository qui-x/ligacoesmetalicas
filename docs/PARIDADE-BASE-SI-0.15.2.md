# Paridade de uso — SILM 0.15.2

Correção de origem **0.1.x — infraestrutura e gramática operacional**. Esta rodada utiliza a Base genérica desenvolvida na conversa **Base para Simuladores** e aproxima a Oficina dos Metais da organização do SIAB.

## Referências efetivamente conferidas

- SILM de partida: [`qui-x/ligacoesmetalicas@79dd767`](https://github.com/qui-x/ligacoesmetalicas/commit/79dd76727ef6e54c777e76856b7d01d6a377bdda), versão 0.15.1.
- Base genérica: [`baseparasimuladores@68ed86c`](https://github.com/quimicaifbacampusvca/baseparasimuladores/commit/68ed86cb416ea31489be481fc52d86aeedce2892), versão 0.9.17.
- Referência de uso: [`qui-x/acidobase@01de123`](https://github.com/qui-x/acidobase/commit/01de12390ec0b6bfb6ed22169b0d625e1dfe4961), branch `acidosebases1.0.0`.

O snapshot executável do SILM já corresponde à Base 0.9.17: `integracao/base-lock.json` e o build verificam seus hashes. Documentos antigos que mencionam integração em 0.9.8 ou 0.9.11 descrevem etapas históricas. A presença dos subsistemas no snapshot exige adaptação de cada fluxo ao domínio científico para demonstrar paridade funcional.

## Ajustes desta rodada

| Área | Situação de partida | Comportamento na 0.15.2 |
| --- | --- | --- |
| Montagem → Módulo | Aba orientava a procurar o seletor em Ver | Seleção e cartões Explorar/Medir/Calcular na aba Módulo; identificação do ativo e bloqueio em atividade guiada |
| Ver | Lista única de módulo, instrumentos, elétrons e propriedades | Registro de visualizadores pela API pública da Base; famílias Observar/Medir/Analisar conforme o módulo; catálogo → ferramenta → retorno |
| Dados | Dados científicos, registros e JSON numa lista contínua | Catálogo com dados do metal/fontes, medições/cálculos e arquivos; acesso a Caderno e relatório |
| Painéis | Conteúdo específico sem expansão de Ver | Expansão/restauração pelo mecanismo de workspace da Base; folhas móveis e retorno de foco |
| Manual | Conversão de “Montagem → Módulo” para “Ver → Módulo” | Orientações apontam para os caminhos realmente presentes na interface integrada |
| Offline | Build da integração não regenerava o precache | Build integra HTML e recursos novos ao service worker; cache de produto 0.15.2 |
| Aviso PWA | Primeiro controle pelo service worker anunciava “nova versão” | Aviso reservado à substituição de um controlador já existente |
| Regressão dos roteiros | Teste ainda fixava 43 metais | Cobertura compara todos os metais elegíveis do banco atual; os 57 registros continuam validados pelo teste científico |

`workspace-family.js` registra as vistas e adapta os documentos ao produto. Docas, teclado, modal mobile, foco e expansão usam os serviços da Base. O snapshot upstream continua íntegro, sem inicializar a demonstração genérica.

## Mapa para as próximas rodadas

| Contrato da Base | Estado observado no SILM | Próxima verificação ou integração |
| --- | --- | --- |
| Menu e Home | Gaveta, preferências, cinco caminhos e retomada presentes | Comparar todos os recursos, ações e estados com o SIAB atual |
| Workspace e docas | Primeira adaptação funcional nesta rodada | Revisar apresentacões compacta/larga e ferramentas equivalentes, além da expansão já disponível |
| Manipulação e Desfazer | Comandos científicos e Desfazer funcionam; organizar reinicia seu histórico por contrato do modelo | Conferir Refazer e histórico cronológico da sessão, distintos dos registros de medida |
| Aprender | Sete temas e marcador Concluído | Conferir continuidade de leitura e todos os retornos contextuais |
| Missões e Roteiros | Seis missões, cinco roteiros, módulo restrito e restauração da investigação livre | Auditar falhas de gravação e recuperação de cada transição, além dos fluxos já testados |
| Professor | Tabela periódica e consulta de fontes | Integrar editor, biblioteca de atividades e compartilhamento do professor sobre o domínio SILM |
| Caderno e relatórios | Notas, filtros, JSON/CSV, impressão e referências a relatórios presentes | Comparar modos de relatório e atualização de dados com o SIAB |
| Persistência entre abas | A proteção da Base observa seus próprios documentos genéricos | Incluir e testar `scientific.state`, `route.session`, representação e arquivos próprios do SILM; o snapshot sozinho não protege essas chaves |
| Tour e montagens prontas | Implementações da Base estão no snapshot | Homologar os alvos e conectar presets ao modelo científico antes de declarar equivalência |
| Distribuição | PWA e entrada modular integrada | Homologar standalone SILM, instalação real, atualização e impressão física |
| Multinavegadores | Evidência desta rodada em Chromium | Firefox, WebKit/Safari, leitores de tela e aparelhos físicos permanecem pendentes |

Esta é a primeira rodada de aproximação operacional; a equivalência integral da família continua aberta. O schema científico permanece 8, com 57 metais investigáveis e 48 estruturas visualizáveis pelos modelos CCC/CFC/HC existentes.

## Verificação reproduzível

- `npm run build`: validadores científicos, bundle, geometria estrutural do build, service worker e cobertura.
- `npm test`: banco, estado científico, catálogos, atividades, ferramentas e regressão de navegador na entrada principal.
- `tests/workspace-family.cjs`: cartões de módulo, famílias permitidas, catálogo/detalhe, retorno de foco, setas, Escape, expansão e invariância científica em 320×640, 390×844, 844×390, 1024×768 e 1440×1000.
- `tests/routes-browser.cjs` e `tests/learning-browser.cjs`: ferramentas acessadas pela navegação atual; relatório arquivado aguarda a renderização do destino antes da verificação de somente leitura.

Resultados executados e limites: [relatório desta rodada](RELATORIO-BUILD-TESTES-0.15.2.md).
