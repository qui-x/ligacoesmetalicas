# SILM 0.10.1 — Correção de origem: gramática da família (Base Estrutural 0.3.1)

**Origem executável:** SILM 0.10.0 (`entregas/SILM-0.10.0.zip`, SHA-512 `e84a0043727bcca93120bede748f3e7aab55ad41e418733bb18272256c914b68ad22885e0a19addcddfb488cd6eee5764667daa2bdf924b6526b3931ecaec084`).

**Tipo:** correção de origem declarada (série 0.1.x: núcleo e interface herdados). Esta versão não muda nenhum dado nem cálculo científico; o `scientificState` continua no schema 8.

## Por que esta versão existe

O autor pediu que o SILM fosse "exatamente igual ao SIAB em forma de mexer nele". A revisão foi feita com ele, item por item (R01–R24), e as mudanças aprovadas foram aplicadas à **Base Estrutural 0.3.0**. A Base é neutra e foi entregue diretamente ao autor, fora deste repositório. Nesta versão, o SILM troca o seu núcleo pelo da Base 0.3.1 (a 0.3.0 com as correções descritas em "Revisão adversarial") e passa a declarar o seu conteúdo nas formas da família.

## O que muda para quem usa

- **Entrada**:
  - a abertura oficial do SILM roda sobre a camada de abertura da família;
  - a preferência "Animação de abertura" saiu de Recursos e foi para Acessibilidade. A preferência antiga é migrada uma vez;
  - "Como deseja iniciar?" tem cartões (Página inicial, Aprender, Laboratório) e aparece sozinho na primeira visita;
  - a página inicial é editorial: "A Arquitetura **dos Metais**", lema "Observe. Monte. Meça. Interprete.", o Laboratório em destaque e metas vivas.
- **Menu**: o cartão "Agora" mostra o metal e o módulo ("Cobre · Medir"). Recursos traz "Montagens prontas".
- **Acessibilidade**:
  - painel em grupos, com interruptores e "Restaurar padrões";
  - nota de cores: "Camadas, estados e medidas também são descritos em texto.";
  - VLibras sob demanda.
- **Laboratório**:
  - Montagem tem Resumo e os grupos Metal, Estrutura, Propriedades e Módulo;
  - Ver traz as famílias Observar (Síntese, Camadas), Medir (Instrumentos) e Analisar (Comparar, Calcular);
  - Dados é ponto de partida para Medições, Cálculos, Histórico, "Dados do metal" (antes "Tabela") e Relatório;
  - os cartões de módulo vêm numerados (Explorar 1, Medir 2, Calcular 3) e com fatos.
- **Montagens prontas**: "Cobre · CFC", "Ferro · CCC" e "Magnésio · HC". Usam os mesmos dados de referência e a mesma organização cristalina da montagem manual.
- **Aprender**:
  - lista com "Revisado/Não revisado";
  - "Investigar no Laboratório" seleciona o metal representativo do tema: Ligação metálica → Cu, Estrutura → Fe, Elétrons → Na, Propriedades → Cu;
  - a investigação começa pelo gesto da pessoa na Tabela Periódica.

## Revisão adversarial

Depois da adoção, uma revisão adversarial do SILM 0.10.1 confirmou 15 achados, e todos foram corrigidos:

- **Atividades**:
  - durante roteiros e missões, a Montagem continua com os grupos do SILM (`activityPanel:false`). Em atividade restrita, como a missão demonstrativa, o grupo Metal fica oculto e os painéis dizem que a atividade não usa metal. A atividade fica no Menu;
  - nas atividades de navegação livre (o roteiro), o cartão "Agora" mostra o título da atividade. Em atividade restrita, o Menu mostra só o Menu da atividade;
  - a ajuda e o Manual citam "Concluir missão", o rótulo que existe no Menu da atividade.
- **Laboratório**:
  - "Dados do metal" abre a ferramenta;
  - o tema do metal da investigação redesenha a cena;
  - a montagem pronta descarta a fórmula escolhida no Calcular e pede a confirmação do próprio SILM, que diz o que acontece com a investigação e não promete Desfazer.
- **Calcular**: a fórmula escolhida e os valores digitados são descartados quando a investigação é trocada, encerrada ou resetada.
- **Som**: só a coordenação tem tom (8 grave, 12 agudo, os dois valores que o modelo produz); as outras medidas só vibram.
- **Textos**:
  - caminhos do painel Ver e rótulos de Acessibilidade atualizados no Manual;
  - "Sobre o SILM" descreve Medir e Calcular;
  - no rascunho M6, as origens usam os rótulos do SILM.

Três correções eram do núcleo e entraram pela **Base 0.3.1**, nunca no produto:

- a confirmação declarada pela montagem pronta. O SILM só pergunta quando há uma investigação a encerrar;
- a segurança da abertura contada do início do ciclo;
- `SimCore.opening.stop()`, que o SILM usa quando falha ao montar e que a Base usa no aviso de falha de carregamento.

Uma segunda verificação independente conferiu as correções antes do fechamento. Ela encontrou e corrigiu:

- textos velhos do Manual: o relatório "sem medidas ou cálculos", o painel "Informações", "Concluído" no lugar de "Revisado" e a lista dos grupos e de Dados;
- `resetCalc` também no reset da investigação;
- a confirmação da montagem pronta sem investigação aberta;
- os documentos de arquitetura e identidade visual;
- o parâmetro de rede a partir do raio, que faltava nas listas de cálculos.

**Fica para as missões temáticas (R19)**: com `activityPanel:false`, os objetivos ao vivo de uma missão com passos não aparecem na Montagem. Antes de as missões M1–M6 entrarem, elas precisam de outra superfície para os objetivos, ou o painel da atividade precisa voltar.

## Decisões registradas

1. **R06 (Tabela Periódica na cena)**: o autor decidiu manter a Tabela na cena, que deve caber corretamente em qualquer tamanho de tela.
2. **R19 (missões temáticas)** e **R23 (som de cada metal)** são conteúdo científico e pedagógico. Ficam para versões próprias, com validação do autor e fontes verificáveis. Nada foi inventado.
3. **O vocabulário do produto fica no SILM**: unidade, estrutura, metal e as fórmulas. A Base continua sem nenhum termo científico.
