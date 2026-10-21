# Registro de alterações

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
