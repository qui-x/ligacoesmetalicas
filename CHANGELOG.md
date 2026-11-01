## Em desenvolvimento — Estruturas fora de CCC/CFC/HC (modelo geral) e 3 metais novos

- **Modelo cristalográfico geral:** a célula vem da própria ficha (a, b, c, α, β, γ) e os átomos, das operações de simetria registradas. A visualização só é liberada quando a ficha passa nas conferências abaixo; se uma falha, a estrutura fica bloqueada com o motivo:
  - tipo registrado × grupo espacial;
  - métrica da célula exigida pelo sistema cristalino;
  - átomos gerados = Z declarado no CIF (guardado no banco com a fonte);
  - distância mínima entre átomos;
  - volume por átomo.
- **Agora visualizáveis:** manganês (cúbica complexa), estanho (tetragonal), samário e bismuto (romboédricas), netúnio (ortorrômbica) e plutônio (monoclínica).
- **Três metais novos, homologados a partir de CIF local:** amerício (dupla hexagonal), polônio (cúbica simples, 283 K) e protactínio (tetragonal de corpo centrado). São agora 65 metais investigáveis e 62 estruturas visualizáveis.
- **Vizinhança por camadas de distância:** a primeira camada vai até 3 % além do vizinho mais próximo, e as camadas seguintes são informadas. Nessas estruturas, o número de coordenação depende da distância considerada.
- **Medir:** o parâmetro de rede é medido ao longo de cada eixo da célula (a, b ou c).
- **Calcular:** número efetivo pela contagem das posições, volume com os seis parâmetros e densidade teórica. Sem raio nem empacotamento de esferas rígidas no modelo geral.
- **Maleabilidade e ductilidade indisponíveis no modelo geral:** a deformação didática foi construída para CCC, CFC e HC. O roteiro de deformação e a missão de empacotamento listam só metais de modelo canônico.
- **Continuam bloqueados:**
  - lantânio, praseodímio e neodímio: a ficha da dupla hexagonal registra só 2 dos 4 átomos por célula;
  - índio: a ficha local é de um estudo de dilatação térmica e não informa a temperatura da célula.
- **Correção de enquadramento:** a câmera inclui os vértices da célula mesmo quando eles não têm átomos (bismuto).
- **Documentação e testes:**
  - relatório em `docs/REVISAO-CIENTIFICA-FONTES.md` (seção 3); `docs/VERIFICACAO-ESTRUTURAS.md` e `docs/FORMULAS-CRISTALOGRAFICAS.md` atualizados; Manual atualizado;
  - `tests/structure-audit.cjs` confere as estruturas gerais contra o próprio CIF (Z e volume) e contra uma busca exaustiva de vizinhos.

## Revisão científica das fontes e 5 metais novos (mesclada em #34)

- Fontes primárias no lugar do WebElements, com o CIF do COD guardado no repositório: rubídio, titânio, nióbio, ródio, rutênio, háfnio, rênio, ósmio e irídio.
- **Rubídio corrigido:** a = 5,697 Å a 297 K (COD 9012879); antes, 5,585 Å, valor de baixa temperatura. A densidade teórica passa a 1,535 g/cm³, igual à da ficha. Nos outros oito metais, a diferença máxima é de 0,07 %.
- Cobalto, césio e zircônio mantêm a referência atual, com o motivo registrado no banco: ficha de 1936 imprecisa, ficha a 5 K e nenhuma ficha local, respectivamente.
- Cinco metais novos, homologados a partir de CIF local: potássio (CCC), rádio (CCC), tório (CFC), actínio (CFC) e tecnécio (HC). São agora 62 metais investigáveis e 53 estruturas visualizáveis.
- `scripts/structure-from-cif.py`: monta o registro da estrutura a partir do CIF, sem extrapolar temperatura nem aceitar pressão diferente da ambiente.
- Relatório em `docs/REVISAO-CIENTIFICA-FONTES.md`; `docs/VERIFICACAO-ESTRUTURAS.md` atualizado.

## Verificação das estruturas e interação com o modelo (mesclada em #33)

- Auditoria da construção das 48 estruturas visualizáveis (13 CCC, 14 CFC, 21 HC), sítio por sítio. Ela compara a vizinhança, os átomos efetivos, os instrumentos do Medir e as fórmulas do Calcular com a cristalografia e com um cálculo independente: nenhuma divergência. Os 9 metais com estrutura fora de CCC/CFC/HC continuam bloqueados, com motivo.
- Construção de todos os 57 metais pela interface (2D e 3D), sem erros.
- Relatório em `docs/VERIFICACAO-ESTRUTURAS.md`, com a tabela por metal e os achados de dados para a revisão científica: o parâmetro do rubídio e a fonte secundária em 12 metais.
- Interação:
  - o motivo de "Organizar estrutura" indisponível aparece junto do botão, na cena e no Preparo;
  - seleções inválidas no Medir e falhas no Calcular são explicadas em linguagem do estudante (sem códigos internos);
  - o Calcular indica a fórmula que vem antes quando uma entrada depende de outro cálculo, com "Ir para…";
  - corrigidos o singular e o plural ("1 unidade", "2 pontos").
- Testes permanentes: `tests/structure-audit.cjs` (em `test:scientific`) e `tests/model-interaction.cjs` (em `test:comparison`).

## Paridade SIAB, Etapa 10: Tour e ajuda contextual (mesclada em #32)

- Tour da oficina em 5 passos, no estilo do SIAB:
  - cada passo contorna um controle real (Montagem → Preparo, Módulo, a estrutura, a cena, Ver e Dados);
  - o cartão tem "PASSO n DE 5", pontos de progresso, "Pular tour", "Voltar" e "Próximo"/"Concluir";
  - Escape encerra o tour e o foco volta para onde estava;
  - no computador abre os painéis; no celular contorna os botões;
  - funciona só na oficina livre.
- Aviso "Primeira vez na Oficina?", com "Fazer o tour", "Abrir o manual" e "Agora não". Não volta depois do tour, de "Agora não" ou de uma visita ao Manual.
- Botão "?" nas docas: abre a ajuda do que o painel mostra naquele momento, com o tópico certo do Manual e "Abrir no Manual".
- Menu → Recursos → "Tour da oficina"; Manual → "Iniciar tour da oficina"; novo tópico "Tour da oficina e ajuda dos painéis".
- Corrigido: com um painel aberto, Escape fechava o painel em vez da janela por cima dele (tour, ajuda, tela inicial, Sobre).
- TEST-TOUR em `npm run test:parity`; evidências em `docs/evidence-parity/TOUR/`.

## Paridade SIAB, Etapa 8: Relatórios (mesclada em #31)

- O Relatório ganhou a organização do SIAB:
  - ações no topo ("Atualizar dados da investigação", "Registrar no Caderno", "Imprimir / salvar em PDF", "Imprimir para preencher à mão", "Voltar" para a origem e "Encerrar atividade");
  - painel "Preparar relatório";
  - folha em dez seções numeradas, com "Fontes" e "Nota sobre o modelo".
- Três modos:
  - **Relatório completo:** campos editáveis.
  - **Para preencher à mão:** identificação e respostas em linhas, de 5 a 25 por resposta.
  - **Atividade de análise · Professor:** só fora de uma atividade. O professor escolhe os dados incluídos, as respostas em branco, a proposta e a questão. O SILM não cria dados hipotéticos.
- Cada dado mostra a origem: dado tabelado, representação didática, condição de referência, medida do modelo ou calculado pelo SILM (com a origem de cada entrada).
- Novos campos "Análise" e "Resposta à investigação", como no SIAB. Relatórios antigos continuam válidos.
- O relatório arquivado (aberto pelo Caderno) fica só para leitura e tem "Voltar ao Caderno".
- Tópico "Registrar e imprimir" do Manual atualizado.
- TEST-REPORT em `npm run test:parity`; evidências em `docs/evidence-parity/REPORT/`.

## Paridade SIAB, Etapa 12: Menu, preferências, projetor e aplicativo (mesclada em #30)

- O Menu voltou a ter os itens que a Base SI já trazia e o SILM tinha retirado:
  - "Relatório" no menu da atividade;
  - "Área do Professor";
  - "Animação de abertura";
  - "Tela inicial".
- Ajuda, "Apoio pedagógico" e "Como apresentar à turma" abrem o tópico certo do Manual.
- "Tela inicial": janela "Como deseja iniciar?" (Página inicial ou Oficina dos Metais), como no SIAB:
  - aparece na primeira visita sem destino;
  - tem "Redefinir preferência" e "Agora não";
  - também abre por "Configurações de inicialização", no rodapé do Início.
- "Sobre o SILM" abre uma janela com versão, licença e atalhos para o Manual. A página `#/sobre` mostra o mesmo conteúdo.
- O botão Acessibilidade do cabeçalho abre o Menu com o foco no grupo de acessibilidade.
- A animação de abertura respeita "Animação de abertura" e "Reduzir animações" e mostra "Toque ou aperte uma tecla para pular".
- O cabeçalho tem a altura do SIAB e não mostra mais a versão. A barra inferior do celular usa ícones de linha. O "Agora" do Menu virou cartão e mostra o contexto da tela.
- O modo projetor amplia o texto (19 px, como no SIAB).
- "Instalar aplicativo" aparece sempre que a instalação é possível. Sem pedido do navegador, abre as instruções do Manual.
- Corrigidos os tópicos "professor" e "abertura" do Manual, que descreviam botões inexistentes.
- TEST-SHELL em `npm run test:parity`; evidências em `docs/evidence-parity/SHELL/`.

## Paridade SIAB, Etapa 7: Manual (mesclada em #29)

- O Manual ganhou a arquitetura do SIAB:
  - barra com "Buscar no Manual", "Voltar à oficina" e impressão;
  - apresentação "Encontre seu próximo passo.";
  - atalhos "Quero saber";
  - os quatro grupos de tópicos em cartões.
- Cada tópico tem página própria, com caminho, "Passo a passo", "Saiba mais" recolhível, "Veja também" e "Voltar ao Manual". A busca tem resultados, mensagem para busca vazia e "Limpar busca".
- Dois tópicos novos: "Usar o Caderno" e "Por que uma opção não aparece". Os marcadores "Documentação provisória" saíram.
- TEST-MANUAL em `npm run test:parity`; evidências em `docs/evidence-parity/MANUAL/`.

## Paridade SIAB, Etapa 6: Caderno (mesclada em #28)

- O Caderno segue a ordem do SIAB: ações ("Baixar caderno (CSV)", "Imprimir", "Apagar caderno" em destaque de risco), filtro, nova anotação e lista.
- O backup JSON fica num grupo próprio no fim da página, com a nota sobre dados locais.
- O cabeçalho e o conteúdo ficaram na mesma coluna.
- Ao imprimir, também por Ctrl+P, no papel ficam só o cabeçalho e os registros.
- TEST-NOTEBOOK em `npm run test:parity`; evidências em `docs/evidence-parity/NOTE/`.

## Paridade SIAB, Etapa 5.5: Oficina → Visão geral (mesclada em #27)

- Corrigido o layout da Visão geral. O contêiner herdava a grade de colunas de 160 px da Base, o que espremia controles, aviso e cartões lado a lado e cortava botões no celular ("Restau", "Elétro").
- Agora, como "Sua bancada" no SIAB:
  - a barra de controles ocupa a largura toda;
  - o aviso fica logo abaixo;
  - os cartões, com no mínimo 300 px, formam a grade.
- TEST-WORKSPACE (parte 5.5) roda em 1366×768, 390×844 e 844×390. Evidências em `docs/evidence-parity/LAB-OVERVIEW/`.

## Paridade SIAB, Etapas 5.3 e 5.4: Oficina → Ver e Dados (mesclada em #26)

- Os painéis abertos por Ver e Dados se chamam "Investigar" e "Dados da investigação", como no SIAB, sem título repetido dentro deles.
- Dados ganhou a seção "Relatório" ("Dados medidos e registro da investigação."), com "Abrir relatório" e "Abrir Caderno" em largura total.
- TEST-WORKSPACE (partes 5.3 e 5.4) confere:
  - as famílias de cada módulo;
  - que mostrar elétrons não muda o estado científico;
  - a origem das entradas do cálculo;
  - os registros "Calculado pelo SILM";
  - o retorno do foco.
- Evidências em `docs/evidence-parity/LAB-VIEW/` e `LAB-DATA/`.

## Paridade SIAB, Etapa 5.2: Oficina → Montagem (mesclada em #25)

- A doca Montagem fecha com "Fechar" escrito, como no SIAB.
- A aba Preparo ganhou dois grupos rotulados: "Metal da investigação" e "Estrutura".
- "Iniciar investigação" virou a ação principal. Antes ele tinha o fundo cinza do navegador e parecia desativado.
- O Resumo mostra pares rótulo/valor: Metal, Estrutura (com o nome completo), Unidades, Módulo, Medições e Cálculos.
- TEST-WORKSPACE ganhou a parte 5.2. Ela confere que um metal sem geometria validada nunca recebe estrutura cristalina inventada. Evidências em `docs/evidence-parity/LAB-MOUNT/`.

## Paridade SIAB, Etapa 5.1: Oficina → Foco (mesclada em #24)

- "Oficina vazia" no padrão da "Bancada vazia" do SIAB: ilustração, o que fazer e as ações "Abrir Montagem", "Começar com o cobre" e "Tabela periódica".
- Metal sem estrutura também ganha um cartão com a ação certa para o módulo.
- Etiqueta do módulo na barra da Oficina ("Módulo · Explorar"; numa atividade, "Missão · …" ou "Roteiro · …").
- Sem comandos repetidos: Desfazer só na barra; "Limpar estrutura" só no menu Mais.
- TEST-WORKSPACE (parte 5.1) em `npm run test:parity`; evidências em `docs/evidence-parity/LAB-FOCUS/`.

## Paridade SIAB, Etapa 4: Roteiros Experimentais (mesclada em #23)

- Lista de roteiros em linhas, com o módulo e uma seta à direita.
- Roteiro em coluna de leitura, na ordem do SIAB: "O problema", "Objetivo", "O que você vai fazer", "Na oficina", "O que observar" e "Critério de conclusão".
- Identificação (Nome, Turma, Data, Professor, Grupo) antes de "Montar na oficina":
  - fica guardada para a próxima montagem;
  - é copiada para o relatório da sessão;
  - aparece no relatório e no registro do Caderno.
- Painel do roteiro na Oficina: evidência ao vivo, retorno em `role="status"` e o botão "Relatório".
- TEST-ROUTE em `npm run test:parity`; evidências em `docs/evidence-parity/ROUTE/`, `ROUTE-DETAIL/` e `ROUTE-PANEL/`.

## Paridade SIAB, Etapa 3: Missões (mesclada em #22)

- Lista de missões em linhas, com situação à direita ("Não realizado", "Em andamento", "Concluído").
- Especificação em coluna de leitura: "MISSÃO · situação", "O problema", "Objetivo e regras", metal da investigação, temas relacionados e fontes.
- Painel da missão na Oficina, na estrutura do SIAB:
  - evidência acompanhada ao vivo ("Pendente"/"Atendida");
  - dica;
  - campo "Conclusão" salvo na sessão (sobrevive a recarregar);
  - retorno em `role="status"`.
- A aba do painel diz "Missão" durante uma missão.
- O registro da missão concluída no Caderno inclui a conclusão do estudante.
- TEST-MISSION em `npm run test:parity`; evidências em `docs/evidence-parity/MISSION/`, `MISSION-DETAIL/` e `MISSION-PANEL/`.

## Paridade SIAB, Etapa 2: Aprender (mesclada em #21)

- Lista "Temas" na arquitetura do SIAB: uma linha por tema (o cartão inteiro é o link) com resumo curto e situação "Não revisado"/"Revisado" à direita.
- Tema em coluna de leitura: "APRENDER · TEMA", título, ideia principal como abertura e as ações "Investigar na oficina" e "Marcar como revisado". Logo abaixo ficam o conteúdo relacionado (missões e roteiros pelo nome), "Aprofunde" e as fontes.
- "Investigar na oficina" prepara o metal representativo na Montagem e abre a Oficina; a investigação só começa com Iniciar e nunca substitui outra.
- Foco no título ao abrir o tema; ao voltar, o foco retorna à linha do tema aberto.
- TEST-LEARN em `npm run test:parity`; evidências em `docs/evidence-parity/LEARN/` e `LEARN-DETAIL/`.

## Paridade SIAB, Etapa 1: Início (mesclada em #20)

- O Início segue a hierarquia do SIAB:
  - sobretítulo com o nome completo;
  - título curto com destaque ("A arquitetura dos metais");
  - lema e símbolo;
  - o mesmo recuo acima do hero.
- Cartões: etiqueta e setas à direita; ícones desenhados no lugar de caracteres; contagens em peso normal; "Entrar na oficina".
- Botão Acessibilidade do cabeçalho sem o fundo cinza padrão do navegador.
- Foco como no SIAB: na abertura, o primeiro Tab é "Ir para o conteúdo". Ao trocar de tela, a página volta ao topo e o foco vai ao título.
- A marca leva sempre ao Início. Durante uma missão ou um roteiro, o Início agora abre e mostra "Retomar atividade" (antes o cartão de retomada nunca aparecia). As outras telas voltam à atividade com um aviso.
- Resumo da investigação no singular quando há uma unidade.
- Novo teste de tela `npm run test:parity` (TEST-HOME) nos dois fluxos de CI.
- Capturas SIAB × SILM em cinco tamanhos: `scripts/parity-capture.cjs` e `docs/evidence-parity/HOME/`.
- Nenhum dado científico alterado (schema 8).

## 0.15.5 — Consolidação

- Mescladas a auditoria de paridade mecânica SIAB × SILM (correção da pinça cancelada, testes e CI), os textos enxutos com a matriz de paridade de telas e os testes de acessibilidade e de mecânicas no celular.
- Os textos enxutos passaram para a fonte da entrada (`integracao/index.html`); antes, um build os desfaria. Como pede o plano de paridade, a página inicial não tem atalho para o Clube de Jazz; o clube continua intacto.
- Versão única: `VERSION` é a fonte e `scripts/check-version.cjs` confere pacote, lock, BUILD-INFO, manifesto, rótulos e cache.
- Cache offline só com o que a página usa: 81 recursos em vez de 193.
- Auditoria (`scripts/audit-silm.py`) reescrita para a arquitetura atual: Base SI travada, entrada gerada, um único shell, ordem do motor, cache, contratos científicos.
- Cobertura dos roteiros gerada a partir do catálogo: 57 metais.
- Alvos de toque de pelo menos 24 px para as esferas no palco científico (WCAG 2.5.8), sem mudar o tamanho visual; o clique de ponteiro vai para a unidade de centro mais próximo.
- Manual e `RENDERER-3D.md` corrigidos: os elétrons continuam visíveis durante a órbita 3D.
- Nenhum dado científico alterado (schema 8).

## 0.15.4 — Comparação, elétrons 3D e seleção de metais

- Visão Geral com até seis metais recentes, geometria documental e controles comuns de propriedades qualitativas.
- Referências DHCP inconsistentes não são apresentadas como estruturas completas. Novas referências visuais ainda não habilitam medições/cálculos na bancada.
- Mar de elétrons compartilhado nos quadros; movimento contínuo durante a órbita 3D, pausa explícita e movimento reduzido.
- Escolha na tabela prepara o metal em Montagem sem substituir automaticamente a investigação.
- Testes de comparação, elétrons 3D e seleção disponíveis em npm run test:comparison.

## 0.15.3 — Integridade de sessão e backup

- Gravação coordenada, reversão em falhas e aviso por documento.
- Bloqueio de edição em abas obsoletas.
- Backup do Caderno com relatórios completos e validação de importação.
- Correção dos links das atividades concluídas.
- Validação: npm test; testes/notebook-backup.cjs (backup em contexto vazio e conflito entre abas).

# Registro de alterações

## SILM 0.15.2 — Docas e módulos da família SI

Correção de origem 0.1.x — gramática operacional compartilhada.

- Montagem → Módulo reúne o seletor e os cartões explicativos de Explorar, Medir e Calcular, com estado ativo e bloqueio por atividade.
- Ver registra ferramentas científicas na API de visualizadores da Base SI 0.9.17, com famílias permitidas pelo módulo, catálogo, detalhe, retorno de foco e expansão.
- Dados organiza dados do metal/fontes, medições/cálculos, JSON, Caderno e relatório, sem duplicar a investigação.
- Manual atualizado para os caminhos efetivamente disponíveis na interface integrada.
- Build da integração inclui a atualização do service worker; o primeiro preparo offline não anuncia uma atualização inexistente.
- Corrigida a regressão do teste de cobertura de roteiros, que ainda fixava 43 metais após a expansão para 57.
- A validação e as diferenças ainda abertas em relação à Base/SIAB estão em `docs/PARIDADE-BASE-SI-0.15.2.md`.


## SILM 0.15.1 — Homologação das estruturas existentes

- Adicionado teste de cobertura para os 57 registros com estrutura de referência: valida fontes, fase sólida, geometria, sítios da célula e número de coordenação.
- Formalizada a distinção entre 48 estruturas visualizáveis (CCC/CFC/HC) e nove estruturas registradas que precisam de modelos próprios.
- Documentadas as lacunas de evidência local e as prioridades de pesquisa para as famílias metálicas.

## SILM 0.15.0 — Expansão da cobertura cristalográfica

- Homologadas referências experimentais para 14 metais adicionais compatíveis com CCC, CFC ou HC: Ti, Cr, Co, Rb, Zr, Nb, Ru, Rh, Cd, Cs, Hf, Re, Os e Ir.
- A cobertura passa de 43 para 57 metais investigáveis; o renderizador cristalográfico passa de 34 para 48 metais.
- Atualizados banco canônico, fontes, bundle gerado, testes de cobertura e documentação da proveniência.
- Não foram inventadas temperaturas numéricas ausentes nas fichas de referência; as condições ambientais sem valor publicado são marcadas como qualitativas.
- O schema científico permanece na versão 8. Nove metais investigáveis com estruturas fora de CCC/CFC/HC continuam sem visualização até a implementação de modelos específicos.

## SILM 0.14.7 — Barra contextual e expansão da oficina

- A tela inteira agora é aplicada à oficina como um todo; a estrutura cristalina passa a ocupar apenas a área flexível abaixo da barra contextual.
- A barra global de navegação deixa de sobrepor a cena durante a expansão.
- Os controles Foco/Visão geral e os atalhos Montagem, Ver e Dados permanecem à mostra e funcionam no modo expandido.
- Os painéis contextuais abertos ficam acima da cena e podem ser fechados normalmente; Escape ou o botão Expandir/Recolher retornam ao layout anterior.
- Testes de integração atualizados para validar o viewport da oficina, a posição da cena sob a barra contextual e a disponibilidade dos menus em telas móveis.

## SILM 0.14.6 — Tela inteira e controles integrados

- A cena cristalina ocupa a janela inteira em modo expandido, aproveitando a maior área útil sem deformar a geometria da estrutura.
- O botão **Expandir/Recolher** passa para a barra flutuante de controles da cena; o mesmo botão abre e fecha a visualização.
- Em celulares, o botão permanece disponível mesmo quando o conjunto de controles está recolhido; durante a expansão, zoom, enquadramento e rotação permanecem expostos.
- Os testes de integração foram atualizados para verificar posição, dimensões e preservação do estado científico.

## SILM 0.14.5 — Visualização expandida da estrutura cristalina

- Adicionado o botão **Expandir** à barra da Oficina dos Metais; ele só é habilitado quando há uma estrutura cristalina organizada e com unidades.
- A mesma cena configurada ocupa a área visível, redimensionando a visualização 2D/3D existente. Não há clone, reset, nova investigação nem alteração do estado científico.
- O modo expandido inclui **Voltar**, fecha as docas para liberar espaço, funciona com teclado e permite sair por Esc. Ajustes de layout consideram margens seguras de celulares e orientação paisagem.
- Cobertura de integração ampliada para disponibilidade, expansão desktop/mobile, saída por Esc e invariância do estado científico. A execução da suíte precisa ser confirmada no ambiente de teste.

## SILM 0.14.4 — Oficina dos Metais

- Renomeada a área de manipulação para **Oficina dos Metais**, nomeado a partir do tema A Arquitetura dos Metais e do trabalho de montar e investigar estruturas.
- Atualizados Home, navegação global e móvel, título acessível da cena, retorno de atividades e instruções do Manual. A rota técnica `#/ambiente` foi preservada para compatibilidade.
- Corrigida a informação desatualizada sobre o Caderno no Manual e o texto da seção Sobre, agora alinhado à Base SI 0.9.17.
- Atualizados metadados do produto, PWA, cache e documentação. A execução de testes funcionais desta rodada ainda precisa ser confirmada.

## SILM 0.14.3 — Caderno integrado ao fluxo de aprendizagem

- Missões e roteiros concluídos geram automaticamente uma entrada de conclusão no Caderno, com metal, estrutura, medidas e cálculos registrados; a criação é idempotente.
- Relatórios podem ser registrados no Caderno. A referência preserva uma cópia do relatório e permite reabri-lo depois, inclusive para investigações livres.
- Anotações manuais agora têm título próprio; a linha do tempo distingue atividades e relatórios, permite abrir a atividade/relatório associado e mantém filtros, exclusão confirmada, impressão e backups JSON/CSV.
- Atualizados testes de navegador para conclusão automática, criação de referência e reabertura do relatório. A execução automatizada desta rodada ainda precisa ser confirmada.

## SILM 0.14.2 — Base SI 0.9.17 e Caderno didático

- Snapshot sincronizado com Base SI 0.9.17 (commit 68ed86cb416ea31489be481fc52d86aeedce2892), preservando o motor científico no schema 8.
- Caderno ampliado com tipos de registro, filtro, exclusão, backup JSON validado, CSV e impressão.
- Registros podem identificar o metal ativo; limpeza e restauração são bloqueadas durante atividades orientadas.
- Alinhados metadados de versão do HTML, pacote, PWA e cache. Testes atualizados; execução automatizada ainda precisa ser confirmada.

## SILM 0.14.1 — Caderno no Início e responsividade

- Card Caderno copiado da Base SI 0.9.17 (68ed86c), com acesso direto às observações.
- Botões da montagem sem compressão em telas estreitas; estrutura com espaço adequado na horizontal.
- Grade original da base com cinco caminhos; removido o atalho duplicado no rodapé.
- Integração pontual: demais recursos da base continuam no snapshot 0.9.13.

## SILM 0.14.0 — Interface unificada, missões e temas

- Interface da Base SI 0.9.13 integrada ao motor científico e à identidade SILM.
- Seis missões e sete temas conectados ao laboratório e aos roteiros existentes.
- Manual, caderno, professor e relatórios acessíveis na mesma navegação.
- Dados anteriores preservados, exportação da investigação antiga e redirecionamento da entrada legado.
- Verificação em Chromium: ciência, atividades, migração, mobile e offline.

## SILM 0.12.0 — Representação 3D científica

- Consolidação da branch `claude/optimistic-cerf-167d72` com a integração da Base Demo SI 0.9.8.
- Entrada `integracao/index.html`: navegação, docas, investigação e renderer comum 2D/3D, com armazenamento separado.
- Correção: reenquadrar uma vista 3D grava a câmera `crystal3d`, preservando a câmera 2D `crystal`.
- A distribuição principal mantém Medir, Calcular e demais recursos completos; a nova base permanece em integração.


- **Vista 3D da estrutura cristalina:** a mesma estrutura, em ångström, girada por uma câmera de órbita no renderizador comum. Não há motor 3D paralelo nem WebGL.
  - Vistas: 3D livre, Plano XY (de cima), Plano XZ (de frente) e Plano YZ (de lado), no seletor Projeção e em Ver → Observar → Camadas.
  - Perspectiva ou ortográfica, pelo botão da barra ou pela tecla P.
  - Girar: arrastar (no celular, um dedo), teclas J L I K e botões. Deslocar e aproximar como no 2D (Shift + arrastar, dois dedos, Ctrl/⌘ + roda, + −). F enquadra; 0 restaura.
  - Eixos x, y e z no canto, como referência visual.
- **A mesma ciência:** seleção, vizinhos, medições e cálculos são os mesmos objetos do 2D. Distância e ângulo dão o mesmo valor no 2D e no 3D, e o calor continua na isométrica de referência.
- **Elétrons** ocultos durante a órbita e redistribuídos ao soltar, sem elétrons "3D" à parte.
- **Comparação** na mesma orientação 3D da vista principal.
- **Volta ao 2D** com aviso se a vista 3D falhar.
- **representationState v2** (`viewMode`, `camera3D`, câmera `crystal3d`), com migração da v1 sem perda.
- **Documentação:** `docs/SILM-0.12.0.md`, `docs/RENDERER-3D.md`, `docs/CONTRATO-REPRESENTACAO-3D.md` e o tópico do Manual "Ver a estrutura em 3D".
- Nenhum dado científico mudou (schema 8). O núcleo continua o da Base Estrutural 0.3.1, sem alteração.

## SILM 0.11.0 — Representação 2D científica

- **Renderizador 2D comum** (`domain/silm/renderer-2d.js`): montagem livre, estrutura cristalina e comparação usam o mesmo palco, com camadas numa ordem central e sem z-index espalhado.
- **Câmera**:
  - "Controles da vista" com Aproximar, Afastar, Enquadrar a estrutura, Centralizar e Restaurar vista;
  - arrastar o fundo desloca; pinça e Ctrl/⌘ + roda aproximam no ponto;
  - teclas + − F C 0 e Shift + setas;
  - um anúncio por gesto; fora do Desfazer.
- **Projeções** Isométrica, Frontal, Superior e Lateral na estrutura cristalina. No HC visto de cima, a camada B aparece entre os centros da A.
- **representationState** separado e versionado (`representation.view`): `scientificState ≠ representationState`. A fachada de leitura é `SILM.representationState`.
- **Invariância:**
  - medições idênticas com 50 %, 100 % e 200 % de zoom e em qualquer projeção;
  - Organizar e calor idênticos à 0.10.1, porque a isométrica de referência fica congelada.
- **Toque central:** um toque até cerca de 22 px da borda de uma unidade a seleciona. O anel de seleção ganhou camada própria e nunca fica atrás de outra esfera.
- **Rótulos e cotas com tamanho de tela constante**, e o valor da medição sai de cima dos marcadores.
- **Rede extensa em janela**, com até 260 sítios.
- **Comparação** com o mesmo renderizador, na mesma projeção, com os planos do HC e cópias só do necessário.
- **Leitura simples reduz o movimento**, como no SIAB.
- **Correções:**
  - a medida em revisão não aparece mais no Calcular;
  - a conversão do toque para a cena desconta a borda do palco.
- **Revisão adversarial** (15 achados confirmados, todos corrigidos, testes 0.11-15 a 0.11-22):
  - o palco não rola mais ao focar uma unidade fora da vista; a câmera vai até ela;
  - a pinça que começa numa unidade não a move;
  - arrastar a partir de uma unidade desloca a vista no cristal e na montagem somente leitura, sem virar clique; Enter e Espaço nunca são ignorados;
  - os elétrons estáticos da rede não se refazem ao aproximar ou deslocar;
  - as fontes de calor ficam marcadas em toda projeção, e a faixa "calor" só aparece junto delas;
  - o valor do zoom saiu da região viva;
  - tocar perto da unidade selecionada escolhe o destino; o clique perto de uma unidade seleciona uma vez só;
  - o Organizar anima a partir das posições livres;
  - vista e vizinhos não entram mais no Histórico da investigação;
  - a vista é gravada mesmo recarregando logo depois do gesto;
  - o botão "Vista" foi para o cabeçalho da cena (em 320 px cobria uma unidade), e a barra fica presa ao palco no tablet em retrato;
  - a descrição da cena também vale para a montagem livre editável.
- **Documentação:** `docs/SILM-0.11.0.md`, `docs/RENDERER-2D.md`, `docs/CONTRATO-REPRESENTACAO-2D.md` e o tópico do Manual "Mover a vista".
- Nenhum dado científico mudou (schema 8). O núcleo continua o da Base Estrutural 0.3.1, sem alteração.

## SILM 0.10.1 — Correção de origem: gramática da família

- Núcleo da **Base Estrutural 0.3.1**, adotado sem nenhuma alteração local. A Base é neutra e foi entregue ao autor fora deste repositório. A 0.3.1 corrige a 0.3.0 em três pontos pedidos pela revisão do SILM: texto da confirmação declarado pela montagem pronta, segurança da abertura contada do início do ciclo e `SimCore.opening.stop()`.
- **Entrada**:
  - abertura oficial sobre a camada da família;
  - "Animação de abertura" em Acessibilidade, com migração da preferência antiga;
  - "Como deseja iniciar?" com cartões e convite na primeira visita;
  - página inicial editorial ("A Arquitetura **dos Metais**", lema, Laboratório em destaque, metas vivas).
- **Menu**: "Agora · <metal> · <módulo>"; Montagens prontas em Recursos.
- **Acessibilidade**: painel em grupos, "Restaurar padrões", som e vibração das medições (desligados por padrão), VLibras sob demanda.
- **Laboratório**:
  - Montagem por grupos (Resumo, Metal, Estrutura, Propriedades, Módulo);
  - Ver em famílias (Observar, Medir, Analisar);
  - Dados como ponto de partida, com "Dados do metal";
  - cartões de módulo numerados e com fatos;
  - tour do laboratório;
  - cena com sobretítulo "MONTAGEM LIVRE" ou "ESTRUTURA CRISTALINA".
- **Montagens prontas**: Cobre · CFC, Ferro · CCC e Magnésio · HC, com os dados de referência do banco.
- **Aprender** em lista; "Investigar no Laboratório" seleciona o metal do tema.
- **R06**: a Tabela Periódica cabe na cena em qualquer tela a partir de 768 px. No celular, rola com uma dica.
- **Revisão adversarial** (15 achados confirmados, todos corrigidos):
  - durante roteiros e missões, a Montagem mantém os grupos do SILM (em atividade restrita, sem Metal, e os painéis dizem que a atividade não usa metal); a atividade fica no Menu; no roteiro de navegação livre, o cartão "Agora" mostra o título dela;
  - a ajuda e o Manual citam "Concluir missão" (Menu da atividade), o rótulo que existe;
  - "Dados do metal" abre a ferramenta, não o menu de Dados;
  - o tema do metal da investigação redesenha a cena;
  - a montagem pronta só pergunta quando há investigação a encerrar ("Iniciar uma nova investigação?"), sem prometer Desfazer;
  - trocar, encerrar ou resetar a investigação descarta a fórmula escolhida e os valores digitados no Calcular;
  - o som toca só na coordenação (8 grave, 12 agudo); as outras medidas só vibram;
  - caminhos do painel Ver (Observar → Camadas, Medir → Instrumentos, Analisar → Comparar/Calcular) e rótulos de Acessibilidade (Reduzir animações, Leitura simples, Espaçamento de letras) atualizados no Manual;
  - "Sobre o SILM" e o tópico do Relatório descrevem Medir e Calcular; o Manual não cita mais o painel "Informações".
- Nenhum dado científico mudou (schema 8).

## SILM 0.10.0 — Módulo Calcular

- Ver → Calcular com o catálogo central de fórmulas: número efetivo de átomos (com decomposição geométrica), volume da célula, raio ↔ parâmetro (CCC e CFC; HC pela menor distância entre vizinhos), fator de empacotamento (esferas rígidas), densidade teórica e razão c/a no HC (com o valor ideal √(8/3) como referência geométrica).
- Só aparecem os cálculos compatíveis com a estrutura; uma operação por vez; a cena destaca frações, contato ou arestas da célula.
- Origem explícita de cada entrada: dado tabelado, medida do modelo, valor informado ou calculado pelo SILM; constantes com valor e fonte (N_A exato do SI).
- Modo assistido com origem à vista; escolha entre medida e referência; valor informado com vírgula decimal e teclado numérico; erros associados ao campo.
- Conversões centralizadas (pm, nm, nm³, cm³, m³, kg/m³); 4 algarismos significativos; peso atômico em intervalo gera densidade em intervalo.
- Dados → Cálculos: reabrir com fórmula, entradas, origens, intermediários e fontes; remover e limpar; cálculo de estado anterior identificado e nunca recalculado; um cálculo pode alimentar outro sem planilha reativa.
- Referência tabelada lado a lado no parâmetro calculado, sem chamar a diferença de erro experimental.
- Schema científico 8 (`calculations[]`), com migração 7 → 8 e validação que recalcula cada registro.
- Documentação: `docs/MODULO-CALCULAR.md`, `docs/CONTRATO-CALCULOS.md`, `docs/FORMULAS-CRISTALOGRAFICAS.md`, `docs/CONSTANTES-CIENTIFICAS.md`.

## SILM 0.9.1 — Correção de homologação: cena prioritária no celular e no tablet

- Explicações, legendas e instruções da cena em "Como ler esta cena" (recolhível; fechado até 900 px, aberto no desktop; escolha lembrada).
- Na cena ficam a estrutura, os controles e uma linha de retorno; estado eletrônico e observação compacta só para leitores de tela até 900 px; metadados em até duas linhas.
- Sem a linha "SILM — A Arquitetura dos Metais" repetida no espaço de trabalho do celular e do tablet.
- Esferas sempre redondas: símbolo sem quebra, proporcional ao diâmetro e omitido abaixo de 16 px (fonte simplificada não deforma mais as unidades).
- Botões do cartão do elemento quebram só entre palavras ("Iniciar investigação" não aparece mais como "investigaçã/o" no celular).

## SILM 0.9.0 — Módulo Medir

- Ver → Medir com quatro instrumentos de modelo quantitativo: distância, ângulo, parâmetro de rede (`a`; `a` e `c` no HC) e vizinhança/coordenação.
- Valores calculados das coordenadas científicas em Å (parâmetros tabelados); zoom, redimensionamento e projeção não alteram a medida.
- Cota de medição (não ligação M—M), arco do ângulo e marcadores com letras A/B/C; anúncios "Ponto A selecionado. Selecione o ponto B." e resultado falado por extenso.
- Unidades Å, pm e nm com conversão exata e centralizada; valor canônico em Å; resolução explícita, sem `±`.
- Dados → Medições: rever, remover e limpar (sem limpar a estrutura); medições de estado anterior identificadas; reload, troca de módulo e de metal.
- Schema científico 7 (`measurements[]`), com migração 6 → 7 e validação que recalcula cada registro.
- Identidade oficial do SILM (pacote do autor): símbolo mestre, ícone de aplicação, PNG do PWA e abertura oficial com o contrato da família SIAB; correção do quadrado preto do filtro térmico sem editar o pacote.
- Correção de origem 0.1.x: abrir uma tela do domínio diretamente (ex.: `#/inicio`, atalho do PWA) não mostra mais "Tela não encontrada".
- Documentação: `docs/MODULO-MEDIR.md`, `docs/CONTRATO-MEDICOES.md`, `docs/INSTRUMENTOS-E-UNIDADES.md`, `docs/IDENTIDADE-VISUAL.md`.

## SILM 0.8.0 — Módulo Explorar

- Ver → Observar contextual: foco em Síntese, Centro, Célula/Montagem, Elétrons ou Propriedade, acompanhando a última ação; foco Centro com posição, coordenação e vizinhos (distância calculada a partir dos parâmetros tabelados).
- Ver → Camadas: centros, célula, rede, vizinhos, elétrons, rótulos e indicações da propriedade, reutilizando os estados existentes.
- Ver → Comparar: livre × cristalina, célula × rede, elétrons ocultos × visíveis, antes × depois da propriedade; cenas derivadas somente leitura; lado a lado no desktop, A/B no celular.
- Indicador compacto da propriedade em estudo na linha da cena.
- Continuidade entre módulos, Manual, Professor, reload e offline; schema científico inalterado (6); representação da exploração fora do estado científico.
- Documentação: `docs/MODULO-EXPLORAR.md`, `docs/CONTRATO-EXPLORACAO.md`; tópico provisório no Manual.
- Correção de origem 0.1.x: link direto para um tópico do Manual (`#/manual/<tópico>`) abre o tópico, e não o índice.

## SILM 0.7.0 — Propriedades Metálicas

- Elegibilidade por propriedade, calculada do banco por metal (experiência qualitativa, dado tabelado ou indisponível com motivo); cobertura por propriedade em `docs/COBERTURA-METAIS.md`.
- Condutividade elétrica: campo elétrico qualitativo; sem campo, movimento não direcionado; com campo, deslocamento coletivo médio oposto ao campo, não uniforme.
- Condutividade térmica: aquecer região e propagação qualitativa por etapas (anéis + vibração), sem fusão; rede e elétrons, não só elétrons.
- Maleabilidade (compressão, lâmina) e ductilidade (tração, fio), distintas; brilho metálico (luz incidente e refletida, sem cor própria inventada).
- Dados tabelados: contrato com valor, unidade, condição e fonte; σ = 1/ρ classificado como calculado; lacunas declaradas, sem valor típico (nesta versão, valores não homologados no banco).
- Proveniência: `docs/FONTES-E-PROVENIENCIA.md` e `docs/CONTRATO-PROPRIEDADES.md`.
- Estado das experiências no mesmo scientificState (schema 6), migração 5 → 6; Restaurar e Encerrar por experiência; resets gerais limpam as propriedades.
- Persistência e reload da experiência; offline.
- Acessibilidade: estado textual, níveis por quantidade de anéis, setas rotuladas, movimento reduzido, alto contraste e visão de cores.
- Mobile: controles em Montagem → Propriedades; cena livre.
- Limitações científicas declaradas por propriedade.

## SILM 0.6.0 — Modelo Eletrônico e Elétrons Deslocalizados

- Novo scientificState (schema 5): `electrons` passa a ser um modelo formal (`delocalized-electron-model`, representação qualitativa) ligado ao metal e à estrutura; migração 4 → 5 sem perda de metal, investigação, estrutura e representação.
- Modelo eletrônico: centros metálicos positivos envolvidos por elétrons de valência deslocalizados pela estrutura inteira; sem pares M—M e sem pares eletrônicos localizados.
- Valência: origem conceitual na convenção de valência e na configuração do átomo neutro registradas no banco, com fonte; sem contagem por grupo nem contagem visual literal.
- Transição átomo isolado → estrutura: esquema em Ver e transição curta ao adicionar unidade; não é ionização em fase gasosa.
- Partículas qualitativas num canvas único (24 a 150 marcadores; até 80 em telas pequenas), sobre montagem livre, célula e rede extensa; o contorno da célula não é parede.
- Movimento por passeio aleatório isotrópico: sem direção predominante, sem órbitas, sem setas e sem corrente; pausa com a aba oculta.
- Mostrar/Ocultar elétrons e Movimento eletrônico (alternância); ocultar não apaga o modelo.
- Movimento reduzido (do sistema ou do SILM): representação estática equivalente.
- Persistência e reload da configuração; as posições dos marcadores não são estado.
- Acessibilidade: marcadores fora da ordem de tabulação, estado legível, contorno de contraste, alto contraste e visão de cores verificados.
- Mobile: densidade reduzida em telas pequenas; em telas largas, as informações da cena ficam numa coluna lateral e a cena ganha altura.
- Documentação das limitações (`docs/LIMITACOES-MODELO-ELETRONICO.md`) e do modelo (`docs/MODELO-ELETRONICO.md`); tópico "Elétrons deslocalizados" no Manual.

## SILM 0.5.0 — Estruturas Cristalinas e Rede Metálica

- Evolução do scientificState: schema 4, modelo da estrutura 2 (`mode` livre/cristalino, `crystallography`); migração 3 → 4 preservando a montagem livre.
- CCC/BCC, CFC/FCC e HC/HCP a partir do banco: sítios expandidos pelas operações de simetria registradas e conferidos com o modelo; 34 metais com visualização.
- Organização cristalográfica (Organizar estrutura): reaproveita as unidades, completa a célula com unidades marcadas como completadas pelo SILM e guarda a montagem livre para o retorno.
- Célula unitária (mostrar/ocultar), rede extensa (vista Rede, SVG único esmaecido), vizinhança e coordenação (8, 12, 12) sem linhas de ligação.
- Elegibilidade cristalográfica separada da investigação, com motivos `REFERENCE_STRUCTURE_MISSING`, `CRYSTAL_STRUCTURE_UNSUPPORTED`, `REFERENCE_CONDITION_UNSUPPORTED` e `DATA_CONFLICT`; cobertura por metal gerada (`docs/COBERTURA-METAIS.md`).
- Persistência da representação (vista, célula, vizinhos, rótulos, seleção), reload e offline; acessibilidade (nome da estrutura, estado da célula, contagem de vizinhos, destaque não só por cor); mobile e redução de movimento.
- **Correção de origem 0.1.x — paridade de família com o SIAB 1.0.0:** workspace Montagem (Resumo, Metal, Estrutura, Módulo), Ver (Observar) e Dados (Tabela, Histórico, Relatório); Histórico cronológico da investigação. Núcleo: fontes opcionais do painel direito (`workspace.js`, `domain.js`).
- Testes reorganizados: kit compartilhado, uma suíte por série e executor único que roda as séries anteriores como regressão; relatório e entrega gerados por script.

## SILM 0.4.0 — Formação e Montagem da Estrutura Metálica

- scientificState schema 3: `structure` passa a aceitar a montagem metálica formal (`metallic-assembly`, modelo 1); migração segura schema 2 → 3, sem montagem automática.
- Estrutura metálica como objeto científico persistente: Iniciar montagem cria a estrutura vazia; unidades do metal ativo, com IDs estáveis e posições normalizadas da cena (sem pixels, sem ångström).
- Montagem manual: + Adicionar unidade (sempre do metal da investigação), seleção única, movimentação por arrasto (Pointer Events), por toque ou clique no destino e por setas do teclado.
- Assistência de posicionamento (mecanismo de interface) e prevenção de sobreposição; sem rede CCC/CFC/HC, sem linhas M—M, sem elétrons.
- Formação coletiva: uma única montagem com destaque coletivo por região.
- Desfazer adição e movimento (30 ações, não persistido), Limpar estrutura com confirmação, reset e encerramento integrados.
- Persistência e retomada após reload, troca de tela, troca de módulo e offline.
- Integração mobile (cena dominante, alvos de toque, painéis da Base), acessibilidade (nomes "Unidade de cobre 3 de 5", anúncios, foco, alto contraste, movimento reduzido).
- Medir e Calcular mostram a montagem sem editá-la; mensagens contextuais sem ferramentas falsas.
- Painel Informações separa "Representação didática" (montagem) de "Dado tabelado" (estrutura de referência) e informa que a montagem ainda não representa a geometria cristalográfica.
- Convenções do SIAB 1.0.0 na montagem: ↶ Desfazer com descrição, "+" na ação principal, "?" de ajuda, rótulo MÓDULO · EXPLORAR. Comparação completa em `docs/PARIDADE-SIAB-1.0.0.md`.
- **Correção de origem 0.3.x — retomada:** o Laboratório Livre é retomado diretamente, sem o diálogo "Retomar sessão?" a cada abertura ou recarga. A Base recebe a opção de domínio `session.resumeFree: 'direct'` (`js/experience/activity.js`); atividades continuam perguntando.
- Validador do estado com 45 estados inválidos, regressão do banco (`tests/scientific-data.cjs`) e suíte Playwright 0.4.0. Documentação: `SILM-0.4.0.md`, `MONTAGEM-ESTRUTURA-METALICA.md`, `SCIENTIFIC-STATE.md` (schema 3) e reconstrução dos documentos ausentes do pacote 0.3.0.

## SILM 0.3.0 — Estado Científico e Laboratório Livre

- Estado científico formal schema 2, com investigação de um metal, ID, status, datas e módulo ativo; dados tabelados continuam no banco local.
- Início explícito pela Tabela compartilhada; troca de metal com confirmação. A seleção de apresentação do Professor continua independente e sua ação Investigar utiliza o mesmo serviço.
- Persistência e retomada pelo storage da Base, migração mínima da seleção provisória 0.2.1 e recuperação de dados inválidos.
- Reset preserva metal e investigação; encerramento retorna à seleção. Painéis, viewport e relatório estrutural refletem o estado único.
- Validador científico do estado, documentação e testes de navegador/mobile/offline. Nenhuma rede, átomo, elétron, ferramenta de medição ou cálculo foi implementado.

## SILM 0.2.1 — Correções após homologação

- Homologação automatizada da versão 0.2.0 encontrou ausência de título principal na superfície da Tabela e retorno de foco ausente ao fechar a apresentação do Professor.
- Corrigido o título da Tabela para nível 1 e o retorno explícito de foco ao botão que abriu a apresentação.
- Mantido o mesmo banco, elegibilidade e comportamento científico da 0.2.0; nenhuma mecânica nova foi iniciada.
- Testes automatizados passaram em Chromium e Firefox. WebKit ficou indisponível por dependências de sistema ausentes; leitor de tela físico e projetor requerem verificação manual.
- Gerado novo pacote SILM 0.2.1. O ZIP congelado 0.2.0 não foi alterado.

## SILM 0.2.0 — Banco Científico, Fontes e Seleção de Metais

- Banco local/offline dos 118 elementos, com identidade, posição periódica e categoria documentadas.
- Registro formal de fontes e proveniência por campo; pesos atômicos CIAAW, configuração neutra NIST e estruturas cristalinas experimentais com condições e parâmetros.
- Critério verificável de elegibilidade: 43 metais com conjunto mínimo; demais metais visíveis com código e justificativa. Todos Z ≥ 104 permanecem visíveis e indisponíveis.
- Tabela Periódica com busca por nome, símbolo e número atômico, seleção única, painel científico e referências legíveis.
- Área do Professor reutiliza o mesmo componente e dataset em apresentação ampliada, com solicitação opcional de tela cheia nativa e estado pedagógico separado do estado científico.
- Validador estrutural do banco, testes negativos e documentação científica.
- Nenhuma estrutura visual, liga, dinâmica eletrônica, cálculo ou experimento de propriedade foi implementado.

## SILM 0.1.1

Fundação de interface, navegação e identidade. Consulte o histórico em `docs/SILM-0.1.1.md`.
