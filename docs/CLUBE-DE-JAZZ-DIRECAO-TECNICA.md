# Clube de Jazz — Jazz e Metais
## Direção artística e técnica: elenco, coreografia e identidade cristalina

**Data de registro:** 29 de outubro de 2026  
**Projeto:** SILM — Simulador Interativo de Ligações Metálicas  
**Local do recurso:** `jazz-club/`  
**Status:** documento de direção em elaboração; não representa congelamento integral da especificação.

> Este documento consolida as decisões e propostas discutidas para orientar a próxima etapa de definição. “Escolhido” indica a direção escolhida na discussão; “provisório” indica que precisa de validação antes de se tornar requisito congelado; “pendente” indica que não houve decisão final.

---

## 1. Objetivo

Desenvolver o Clube de Jazz — **Jazz e Metais** como uma experiência cênica em tela cheia, integrada ao SILM, ambientada em um clube inspirado na década de 1920. A apresentação deverá combinar jazz, progressão dramática, personagens inspirados nos 17 elementos considerados terras raras, dois personagens da plateia, coreografia expressiva e identidade visual baseada em estruturas cristalinas.

O espetáculo deve permanecer artisticamente interessante e cientificamente responsável. A dança é uma metáfora cênica; não deve ser apresentada como simulação literal das trajetórias dos elétrons ou como prova da estrutura cristalina de um elemento.

## 2. Estado do protótipo e contexto de implementação

O protótipo documentado no repositório usa uma versão estática em `jazz-club/`, com Babylon.js e uma alternativa visual Canvas2D. O cadastro de coreografia parte atualmente de três personagens provisórios:

- **Euria** — európio (Eu), com motivo visual provisório CCC;
- **Céria** — cério (Ce), com motivo visual provisório CFC;
- **Gádia** — gadolínio (Gd), com motivo visual provisório HC.

Essas associações são pontos de partida do protótipo e requerem verificação científica explícita quanto à fase, às condições físicas e à nomenclatura adotada. O protótipo não equivale ao elenco final de 17 elementos.

Os arquivos centrais identificados no projeto são:

- `jazz-club/src/dance-core.js`: dados e regras de coreografia;
- `jazz-club/src/dance.js`: cena e execução Babylon.js;
- `jazz-club/src/dance-fallback.js`: alternativa Canvas2D;
- `jazz-club/src/jukebox-library.js` e módulos relacionados: seleção e reprodução de faixas;
- `jazz-club/README.md`: instruções e limites atuais do protótipo.

Uma falha anterior de inicialização foi reportada: tentativa de chamar `addEventListener` sobre uma referência nula em `dance.js`. Ela deve ser reproduzida e verificada no código vigente antes de considerar a inicialização homologada. Este registro não afirma que o problema ainda está presente ou que já foi corrigido.

## 3. Diretrizes discutidas para o elenco e a progressão dramática

### 3.1 Elenco completo, modelos progressivos — DIREÇÃO ESCOLHIDA

A arquitetura deve prever desde o início o elenco completo, enquanto os modelos 3D e animações finais serão produzidos por etapas. O cadastro lógico dos personagens não pode depender da quantidade de modelos já concluídos.

Escopo dramático previsto:
- 17 personagens dançantes relacionados aos 17 elementos considerados terras raras: 15 lantanídeos, escândio e ítrio;
- dois personagens da plateia, com função cênica distinta da dos dançarinos;
- catálogo completo separado do elenco ativo em cada momento;
- possibilidade de ensaiar o sistema com modelos provisórios antes de investir no acabamento individual.

### 3.2 Progressão dramática — DIREÇÃO ESCOLHIDA

Os personagens entram progressivamente e a apresentação culmina em uma coreografia coletiva que reúne os 17 elementos. A apresentação deve construir a expectativa e a escala do clímax; não basta tornar todos visíveis de uma vez no final.

A estrutura em atos pode ser usada como ferramenta de planejamento, mas a sequência, o número de atos e a associação de cada faixa ainda precisam ser definidos na partitura musical.

### 3.3 Organização por famílias de aplicações ou propriedades — PROPOSTA ESCOLHIDA PARA DESENVOLVIMENTO

As primeiras entradas serão organizadas em grupos musicais associados a aplicações tecnológicas ou propriedades. Esses agrupamentos são recursos dramatúrgicos, não famílias químicas naturais nem uma classificação científica exclusiva.

Regras:
1. Cada personagem recebe uma família temática principal para a estreia.
2. Pode participar de outros grupos posteriormente, se houver relação científica ou artística justificável.
3. As justificativas devem distinguir elemento puro, liga, composto, íon, material hospedeiro, isótopo e produto tecnológico, conforme o caso.
4. A relação científica deve ser documentada e verificada antes de se congelar a cena ou o texto correspondente.
5. A associação temática não pode insinuar que um elemento tem uma única aplicação.

Os cinco eixos exploratórios discutidos são:
- materiais avançados, ligas e energia;
- superfícies, vidro e catálise;
- magnetismo, motores e movimento;
- luz, cor e comunicação óptica;
- precisão, instrumentação e aplicações especializadas.

Esses eixos são provisórios e podem ser renomeados, fundidos, subdivididos ou reorganizados depois da curadoria científica e musical.

### 3.4 Famílias com recorrências — REGRA ESCOLHIDA

Cada elemento tem uma entrada dramática principal, mas pode voltar em outras famílias. O retorno não é obrigatório; ele depende da partitura e deve ter justificativa artística ou científica.

O elenco não deve ser dividido em grupos exclusivos permanentes. A mesma pessoa/personagem pode integrar sequências diferentes em faixas distintas.

### 3.5 Modelo híbrido de permanência no palco — DIREÇÃO ESCOLHIDA

A maioria dos personagens permanece no palco depois da entrada. Saídas e reentradas físicas são reservadas a momentos com função dramática clara, como:
- solo ou destaque individual;
- transição entre atos ou mudança de atmosfera;
- cruzamento temático importante;
- redistribuição de palco que contribua para uma imagem cênica.

Saídas e reentradas não devem ser usadas apenas para esconder limitações temporárias dos modelos ou simplificar arbitrariamente a programação.

## 4. Comportamento coreográfico: movimento em camadas

**Direção escolhida para aprofundamento:** quando um personagem ou grupo recebe destaque, os demais mantêm movimentos discretos e coerentes com a música. A intensidade aumenta progressivamente até o clímax.

Camadas de participação:
1. **Destaque:** gesto, solo, deslocamento ou sequência principal com maior amplitude e intenção cênica.
2. **Conjunto ativo:** participantes que executam a coreografia coletiva de suporte ou de resposta.
3. **Presença cênica:** personagens visíveis que mantêm movimentos pequenos, ritmados e legíveis, sem competir pelo foco.

O crescendo não deve significar apenas que todos passam a se movimentar mais. Ele pode resultar da entrada de novas pessoas, do aumento das formações, da ampliação gradual dos gestos, da interação entre grupos, da iluminação e do enquadramento.

Os dois personagens da plateia podem reagir de modo discreto às mudanças do espetáculo, mas não devem competir com a dança. Sua identidade, rig e repertório de reações precisam ser planejados separadamente.

### 4.1 Regra técnica a investigar

Cada personagem deve ter um controlador central de movimento que resolva a pose final e as prioridades, em vez de vários módulos alterarem independentemente as mesmas articulações.

O sistema deve distinguir:
- **presença:** fora do palco, entrando, em cena ou saindo;
- **participação:** destaque, conjunto ou presença cênica;
- **prioridade/ênfase:** qual movimento prevalece quando duas instruções coincidem.

O comportamento deve ser recuperável a partir do tempo atual da música, incluindo pausa, retomada e troca de faixa. Não pode depender apenas da soma de tempo entre quadros renderizados.

## 5. Referências audiovisuais para mobilidade jazzística

A equipe deverá observar vídeos para extrair princípios de movimento e transformá-los em animações originais. O objetivo não é copiar uma coreografia completa: é estudar apoio, transferência de peso, isolamentos, sincopação, passos, postura, continuidade, gestos e dinâmica de conjunto.

### 5.1 Primeira lista de estudo

1. **Josephine Baker — filmagens históricas de dança**  
   https://vimeo.com/21916110  
   Uso: observar energia, postura, gesto, relação entre dança e presença cênica. É uma seleção de trechos de filmes silenciosos das décadas de 1920 e 1930; não deve ser descrita como gravação direta de uma apresentação de palco em 1925. Contexto histórico acadêmico: https://www.mdpi.com/2076-0752/9/1/23

2. **Isolamentos de cabeça, ombros e quadril — Howcast**  
   https://www.youtube.com/watch?v=eRmSyTIbYSw  
   Uso: estudar a separação e a coordenação de partes do corpo. Referência textual complementar: https://howcast.com/videos/501766-head-shoulder-hip-roll-isolations-jazz-dance/

3. **Isolamentos para iniciantes — BalletMet/Justice**  
   https://www.youtube.com/watch?v=v0Um2xFPiI8  
   Uso: observar isolamentos de cabeça, ombros, caixa torácica e quadris.

4. **The Big Apple — registro cinematográfico de 1939**  
   https://www.1929studios.com/big-apple  
   https://youtu.be/H1K5M5xluZs  
   Uso: estudar formações coletivas e chamadas/respostas. É referência posterior aos anos 1920 e deve ser identificada como tal.

5. **Charleston dos anos 1920 — footwork e mecânica dos passos**  
   https://www.idance.net/en/lessons/1180-1920s-charleston-footwork-1-of-10-online-vintage-dances-dance-lesson-with-jo-hoffberg-kevin-st-laurent  
   Uso: estudar apoio, ritmo e posições corporais. A página informa que a aula completa pode depender de compra ou assinatura.

Esses links compõem uma lista inicial de referência, não uma análise audiovisual concluída. A disponibilidade, a acessibilidade e as condições de uso de cada material devem ser verificadas durante a produção.

### 5.2 Ficha de análise de cada movimento

Para cada referência escolhida, registrar:
- URL, título, autoria quando indicada e intervalo de tempo analisado;
- parte do corpo e articulações envolvidas;
- transferência de peso e contato dos pés com o chão;
- direção, amplitude, aceleração e desaceleração do gesto;
- relação com batida, síncope ou frase musical;
- posição inicial e pose de saída;
- possibilidade de reutilização por outros personagens;
- observações sobre direitos de uso.

A ficha deve orientar uma animação própria, com execução e timing adaptados à identidade dos personagens. Não incorporar filmagens ou áudios de terceiros ao produto sem autorização/licença adequada.

## 6. Identidade visual baseada em estruturas cristalinas

Os padrões discutidos devem ser reconhecíveis no figurino, em acessórios ou em motivos geométricos próprios. A geometria deve continuar compreensível sem depender somente de cor, e deve permanecer legível durante giros e movimentos.

### 6.1 CFC — Cúbica de Faces Centradas

Motivo estrutural: pontos nos vértices do cubo e nos centros das faces.

Possibilidades visuais: placas ou painéis de linguagem cúbica; pontos centrais nas faces; motivos geométricos de face com destaque próprio. A representação deve comunicar a presença dos centros das faces, não apenas um contorno cúbico.

### 6.2 CCC — Cúbica de Corpo Centrado

Motivo estrutural: pontos nos vértices e um ponto no centro do corpo da célula.

Possibilidades visuais: contorno cúbico acompanhado de um elemento central claramente destacado. O centro precisa ser distinguível dos pontos periféricos durante o movimento.

### 6.3 HC — Hexagonal Compacta

Motivo estrutural: camadas compactas com empilhamento ABAB.

Possibilidades visuais: simetria hexagonal, eixo vertical e padrão de duas camadas que se alternam. O motivo deve conter mais informação do que simplesmente usar um hexágono decorativo.

### 6.4 DHC — Dupla Hexagonal Compacta

Motivo estrutural: camadas compactas com empilhamento ABAC; em referências internacionais também aparece a sigla DHCP (*double hexagonal close-packed*).

Possibilidades visuais: padrão de quatro níveis/camadas que permita perceber o ciclo ABAC, por exemplo em uma peça vertical do figurino, ornamento de costas, gola ou acessório. O desenho precisa ser distinguível de HC.

### 6.5 Requisitos de comunicação visual

- O padrão estrutural deve aparecer em pelo menos uma área visível do personagem e não depender exclusivamente da iluminação frontal.
- A forma e o padrão devem continuar legíveis em escala reduzida e sob iluminação variável.
- Cores, brilho, metalização e acessórios reforçam a identidade; não substituem a geometria.
- Os personagens podem compartilhar uma estrutura sem compartilhar o mesmo figurino ou personalidade.
- A dança é uma metáfora de jazz e não a trajetória de átomos ou elétrons na rede.

### 6.6 Regra científica obrigatória

Não se deve atribuir CFC, CCC, HC ou DHC arbitrariamente aos 17 elementos. A estrutura deve ser verificada para a fase e as condições físicas escolhidas. Alguns elementos apresentam transições de fase ou estruturas que não cabem nessas quatro classes simplificadas; por exemplo, estruturas do tipo Sm precisam de tratamento próprio, e não de uma classificação forçada.

A ficha científica de cada elemento deve informar:
- estrutura/fase de referência;
- temperatura e pressão, quando relevantes para a identificação;
- fonte técnica utilizada;
- exceções ou transições conhecidas que afetem a representação;
- se o desenho é literal, simplificado ou apenas um motivo artístico inspirado na estrutura.

### 6.7 Fontes técnicas iniciais para estruturas

- Universidade de Tecnologia de Graz — HC: https://lampz.tugraz.at/~hadley/ss1/crystalstructure/structures/hcp/hcp.php
- Universidade de Tecnologia de Graz — DHC/DHCP: https://lampz.tugraz.at/~hadley/ss1/crystalstructure/structures/hcp/dhcp.php
- Compêndio didático de estruturas cristalinas e transições de fase: https://lampz.tugraz.at/~hadley/ss1/book/crystals/crystalstructure.php

Essas fontes apoiam a distinção dos padrões e o estudo das fases; a atribuição final a cada elemento precisa ser feita individualmente.

## 7. Pipeline técnico proposto para Blender e Babylon.js

**Direção em análise; ainda precisa de confirmação explícita antes do congelamento:** usar o Blender para desenvolver rigs, clipes e movimentos com qualidade artística e o Babylon.js para coordenar participantes, posições, formações, transições, intensidade e sincronização musical.

O modelo híbrido evita dois extremos:
- produzir um grande número de animações exclusivas para cada elemento e combinação;
- depender exclusivamente de movimentos procedurais, com risco de resultados mecânicos ou pouco expressivos.

A proposta é criar primeiro um conjunto pequeno e reutilizável de clipes, por exemplo:
- groove/base rítmica;
- isolamento corporal;
- entrada no palco;
- giro ou mudança de direção;
- sequência de grupo;
- destaque/solo;
- transição entre formações;
- pose e sequência do final coletivo.

Os nomes acima são exemplos de organização, não nomes obrigatórios.

A exportação Blender → glTF/GLB → Babylon.js deverá ser validada com rig, materiais e animações reais antes da produção em escala. Documentação oficial inicial:
- Babylon.js — personagem animado: https://doc.babylonjs.com/features/featuresDeepDive/animation/animatedCharacter/
- Babylon.js — pipeline de exportação para glTF, incluindo Blender: https://doc.babylonjs.com/preparingArtForBabylon/dccToGltf

O protótipo de três personagens deve validar mobilidade e mistura de movimentos. Em seguida, os 17 devem ser instanciados e testados com modelos provisórios antes de refinar todos os ativos.

## 8. Desempenho, acessibilidade e critérios de validação

O teste completo deve conter 17 personagens dançantes, dois personagens da plateia, música, luzes, câmera e jukebox. Um teste com personagens isolados não comprova a viabilidade do clímax.

Metas provisórias de desempenho para medir — não resultados já comprovados:
- alvo de 60 quadros por segundo em computadores adequados;
- mínimo de referência de 30 quadros por segundo em dispositivos móveis compatíveis, sujeito à medição e aos testes.

Quando necessário, avaliar redução controlada de sombras, detalhes, resolução de texturas e pós-processamento. A camada de presença cênica deve usar movimento econômico, mas a cena ainda precisa ser medida na sua configuração completa.

Critérios mínimos de aceite do sistema de camadas:
- hierarquia de atenção legível;
- transições sem saltos bruscos ou pose incompatível;
- controle central de pose;
- pausa e retomada coerentes;
- troca de faixa sem personagens presos em trajetórias;
- formações legíveis com o elenco completo;
- Canvas2D preserva a lógica da progressão, mesmo simplificando a aparência;
- acessibilidade e preferência por movimento reduzido respeitadas pelos controles existentes;
- falhas de inicialização e de seletores nulos verificadas;
- navegador e dispositivo de teste registrados.

## 9. Sequência de implementação proposta

1. Reproduzir e estabilizar os problemas de inicialização e os controles da cena atual.
2. Criar fichas de análise de movimento a partir das referências audiovisuais.
3. Validar mobilidade e transições com os três personagens provisórios.
4. Criar uma ficha científica/visual completa para cada personagem e validar as estruturas.
5. Ampliar o cadastro e as formações para 17 personagens, usando modelos provisórios.
6. Testar a progressão cumulativa, recorrências temáticas e o final coletivo.
7. Produzir/refinar ativos em lotes e ajustar o desempenho.
8. Validar a experiência integrada com música, jukebox, câmera e fallback.

A data de demonstração mencionada em conversas anteriores não é uma garantia de entrega de todos os modelos refinados. Qualquer cronograma deverá distinguir protótipo funcional, elenco completo provisório, modelos finais e homologação integrada.

## 10. Decisões que permanecem pendentes

1. **Partitura musical e sincronização:** como serão definidos BPM, offsets, marcadores por faixa, entradas, transições e clímax.
2. **Arquitetura de animação:** o modelo híbrido Blender/Babylon.js é a recomendação, mas precisa de confirmação formal.
3. **Curadoria científica dos 17 elementos:** associar família principal, recorrências, aplicações e estrutura/fase com referências verificáveis.
4. **Direção de arte do salão:** desenho do palco, dimensões, áreas de destaque, circulação, iluminação, câmera e silhuetas no final coletivo.
5. **Jukebox:** comportamento físico no cenário, interface lateral, troca de faixa e transições coreográficas.
6. **Personagens da plateia:** aparência, função dramática, reações e limites de movimento.
7. **Compatibilidade e desempenho:** dispositivos e navegadores de referência, medições e critérios finais de aceite.
8. **Cronograma de produção:** só congelar depois de definir o escopo mínimo demonstrável e as dependências técnicas.

## 11. Referências técnicas

- Babylon.js, *Animating Characters*: https://doc.babylonjs.com/features/featuresDeepDive/animation/animatedCharacter/
- Babylon.js, *Export Pipeline to glTF*: https://doc.babylonjs.com/preparingArtForBabylon/dccToGltf
- TU Graz, *Hexagonal Close-Packed*: https://lampz.tugraz.at/~hadley/ss1/crystalstructure/structures/hcp/hcp.php
- TU Graz, *Double Hexagonal Close-Packed*: https://lampz.tugraz.at/~hadley/ss1/crystalstructure/structures/hcp/dhcp.php
- TU Graz, *Crystal Structure*: https://lampz.tugraz.at/~hadley/ss1/book/crystals/crystalstructure.php
- Ramsay Burt, *Josephine Baker dancing in the 1920s & 30s* (film excerpts): https://vimeo.com/21916110
- Howcast, *Head, Shoulder & Hip Roll Isolations — Jazz Dance*: https://www.youtube.com/watch?v=eRmSyTIbYSw
- BalletMet/Justice, *How to Do Isolations for Beginners*: https://www.youtube.com/watch?v=v0Um2xFPiI8
- *Dance on Screen: The Big Apple* (1939): https://www.1929studios.com/big-apple
- iDance, *1920s Charleston Footwork*: https://www.idance.net/en/lessons/1180-1920s-charleston-footwork-1-of-10-online-vintage-dances-dance-lesson-with-jo-hoffberg-kevin-st-laurent
- Estudo histórico sobre dança de Josephine Baker: https://www.mdpi.com/2076-0752/9/1/23

---

**Regra de mudança:** quando uma proposta for formalmente aprovada ou alterada, atualizar este documento distinguindo: decisão anterior, nova decisão, razão da mudança, arquivos afetados e testes necessários. Não transformar exemplos ou matrizes provisórias em classificação científica final sem validação documental.


## 12. Sincronização musical híbrida — DIREÇÃO ESCOLHIDA PARA APROFUNDAMENTO

A direção escolhida é **C — sincronização híbrida**. A música fornece a referência temporal; a partitura determina os eventos cênicos. Esta decisão orienta o desenho técnico, mas os detalhes de implementação e os critérios de aceite ainda precisam ser congelados.

### 12.1 Princípios

1. **Relógio principal:** a posição real de reprodução da faixa é a referência temporal da partitura. Para a reprodução baseada em `HTMLMediaElement`, usar a posição de mídia em segundos como referência, considerando que o valor é atualizado pelo navegador e pode não avançar a cada leitura. Documentação: https://developer.mozilla.org/en-US/docs/Web/API/HTMLMediaElement/currentTime
2. **BPM:** utilizado para estimar batidas e organizar padrões rítmicos. Não deve ser o único mecanismo de sincronização de atos, solos, entradas ou mudanças de formação.
3. **Marcadores por faixa:** faixas importantes terão eventos definidos especificamente para introdução, entradas, destaques, mudanças de formação, crescimento de intensidade, clímax e encerramento.
4. **Partitura genérica:** faixas sem marcadores completos devem continuar funcionando com um conjunto de movimentos reutilizáveis e eventos básicos inferidos de metadados disponíveis, sem inventar entradas ou acontecimentos dramáticos específicos.
5. **Recuperação determinística:** a cena deve conseguir reconstruir o estado esperado diretamente a partir do tempo atual. Não deve depender apenas de temporizadores que contam o tempo desde que uma ação começou.
6. **Motor compartilhado:** a partitura e a resolução dos eventos devem ser independentes da renderização. Babylon.js e Canvas2D devem consumir o mesmo estado de apresentação, ainda que tenham níveis visuais diferentes.

### 12.2 Relógio, eventos e precisão

A interface `HTMLMediaElement.currentTime` expressa a posição atual de reprodução em segundos e também permite solicitar uma busca para outro instante. A documentação observa que a posição reportada é uma aproximação da posição da mídia e que leituras consecutivas podem retornar o mesmo valor; logo, a precisão não pode ser deduzida apenas pelo número de casas decimais.

O evento `timeupdate` varia com as condições de execução e pode ocorrer aproximadamente entre 4 e 66 vezes por segundo. Por isso, deve servir para atualizar indicadores de interface e notificações gerais, não ser o único acionador de cada pose de dança. Referência: https://developer.mozilla.org/en-US/docs/Web/API/HTMLMediaElement/timeupdate_event

A proposta de execução é consultar a posição atual da faixa no ciclo de atualização visual e resolver a pose correspondente ao tempo atual. Os marcadores de evento não devem depender do quadro exato em que o navegador notificou um evento.

Se uma implementação posterior usar Web Audio API para agendar áudio com precisão adicional, o relógio do AudioContext deve ser tratado conscientemente: ele é uma linha temporal própria e diferente do relógio de sistema. Evitar misturar relógios sem uma conversão explícita. Referência: https://developer.mozilla.org/en-US/docs/Web/API/BaseAudioContext/currentTime

### 12.3 Modelo de metadados e partitura

Metadados conceituais por faixa:
- identificador estável e título;
- duração esperada quando conhecida;
- BPM estimado ou confirmado;
- `beatOffset`/offset musical para ajustar o início da grade rítmica;
- marcadores com tempos em segundos;
- opcionalmente, referência à posição por compasso/batida para edição humana;
- eventos e estado cênico associados a cada marcador;
- versão do formato e informações da fonte/autor da marcação.

Os tempos em segundos devem permanecer como referência executável, porque BPM sozinho não representa mudanças de andamento e pode sofrer imprecisão de estimativa. Os campos de compasso/batida facilitam a edição musical, mas devem ser resolvidos para tempos concretos e verificados contra o áudio real.

Exemplos de tipos de evento:
- `section-start`: início de introdução, verso, refrão, ponte ou outra seção nomeada;
- `enter` / `exit`: entrada ou saída deliberada de um personagem ou grupo;
- `focus`: definição de personagem ou grupo em destaque;
- `formation`: troca de formação;
- `intensity`: alteração da energia cênica;
- `lighting` / `camera`: evento de apresentação opcional;
- `collective-finale`: convergência para a coreografia com os 17 elementos;
- `ending`: pose e comportamento final.

Os nomes são proposta de esquema e ainda precisam de validação antes de se tornarem interface pública de dados.

### 12.4 Comportamento em interrupções e navegação na faixa

- **Play:** iniciar o áudio por uma ação permitida do usuário e acompanhar a posição real de reprodução; não afirmar que a faixa começou até a reprodução ser confirmada.
- **Pause:** congelar a progressão musical da coreografia de forma coerente, mantendo um estado visual legível.
- **Resume:** continuar a partir da posição atual, sem reiniciar os eventos já ultrapassados.
- **Seek para frente ou para trás:** reconstruir o estado cênico correspondente ao novo tempo, sem disparar sequencialmente todos os eventos intermediários como se tivessem acabado de acontecer.
- **Troca de faixa:** encerrar ou transicionar o estado da faixa anterior e inicializar a partitura nova; não carregar automaticamente o solo ou a formação da faixa anterior sem regra explícita de continuidade.
- **Buffering/interrupção:** distinguir áudio pausado, aguardando dados e efetivamente em reprodução. Evitar que personagens avancem enquanto o áudio está interrompido.
- **Fim da faixa:** resolver para um encerramento definido pela partitura ou para uma pose segura, evitando continuar indefinidamente um estado de destaque.
- **Faixa sem partitura completa:** manter groove e formações genéricas, mas não inventar entradas narrativas específicas.

### 12.5 Relação com as camadas de movimento

A partitura determina quem participa e quando; o controlador de pose resolve a mistura de movimentos. Para cada instante, o estado deve considerar:
- elenco presente, em entrada ou em saída;
- participante em destaque;
- grupo coreográfico;
- camada de presença cênica;
- intensidade e formação;
- clipes ativos e prioridades;
- posição e orientação de cada personagem.

O tempo atual da música deve selecionar os estados e a interpolação entre eles. A arquitetura não pode exigir que uma animação termine naturalmente antes de calcular um estado posterior, pois isso falharia após um seek ou uma troca de faixa.

### 12.6 Plano mínimo de validação

1. Reproduzir uma sequência com marcador no início, entrada de grupo, destaque e final.
2. Pausar no meio de uma transição, retomar e verificar continuidade e sincronização.
3. Avançar e retroceder na faixa, conferindo que o estado se reconstrói sem personagens duplicados ou poses antigas.
4. Trocar de faixa durante uma entrada e durante um solo.
5. Reproduzir uma faixa sem marcadores específicos e confirmar a coreografia genérica.
6. Comparar Babylon.js e Canvas2D quanto à ordem de entradas, formações, destaque e final.
7. Testar com renderização irregular e registrar deriva percebida entre evento musical e pose.
8. Testar pelo menos uma faixa com alterações de BPM ou marcadores de seção para garantir que BPM fixo não é tratado como verdade absoluta.
9. Conferir que a troca de faixa mantém responsivos os controles da jukebox.
10. Registrar navegador, dispositivo, áudio usado, tempo do evento e resultado observado.

### 12.7 Limites de escopo e risco de cronograma

A solução híbrida permite que algumas faixas tenham uma partitura detalhada enquanto as demais usam movimentos genéricos. Isso torna a produção incremental: primeiro criar uma faixa completa de referência, validar o motor e só então ampliar o repertório.

O principal risco é tentar marcar todas as faixas detalhadamente antes de validar o formato e o controlador. O segundo risco é assumir que BPM resolve automaticamente as entradas dramáticas. O terceiro é depender de notificações de tempo da interface em vez de reconstruir o estado a partir da posição atual do áudio.

Sequência sugerida:
1. estabilizar a jukebox e os controles da reprodução;
2. documentar o esquema de uma partitura;
3. produzir uma faixa de teste com marcadores editados manualmente;
4. validar play/pause/seek/troca de faixa;
5. criar o comportamento genérico para faixas sem partitura completa;
6. expandir para as faixas selecionadas para o espetáculo.

### 12.8 Referências técnicas

- MDN — `HTMLMediaElement.currentTime`: https://developer.mozilla.org/en-US/docs/Web/API/HTMLMediaElement/currentTime
- MDN — evento `timeupdate`: https://developer.mozilla.org/en-US/docs/Web/API/HTMLMediaElement/timeupdate_event
- MDN — `BaseAudioContext.currentTime`: https://developer.mozilla.org/en-US/docs/Web/API/BaseAudioContext/currentTime
- W3C — Web Audio API: https://www.w3.org/TR/webaudio/
- Babylon.js — personagens animados e Animation Groups: https://doc.babylonjs.com/features/featuresDeepDive/animation/animatedCharacter/

### 12.9 Pontos ainda pendentes

Antes de congelar essa seção, decidir:
1. se os marcadores serão editados manualmente em JSON, em uma ferramenta visual ou nos dois;
2. qual formato de partitura será considerado oficial e versionado;
3. se os eventos serão expressos apenas em segundos ou se a edição terá compassos/batidas além dos segundos executáveis;
4. qual será a política de transição visual ao trocar de faixa;
5. se a primeira faixa de referência será “O Baile dos Elétrons” ou outra faixa com estrutura musical mais conveniente;
6. quais desvios temporais e comportamentos de pausa/seek serão aceitos nos testes.



## 13. Editor separado com pré-visualização sincronizada — PROPOSTA ESCOLHIDA PARA ANÁLISE, NÃO CONGELADA

A direção escolhida para aprofundamento é **C — ferramenta de autoria separada da apresentação pública, com pré-visualização sincronizada da cena e da música**. A escolha define a intenção de separar papéis; ainda faltam decisões de implantação, isolamento da pré-visualização e fluxo de publicação.

### 13.1 Objetivo e princípios

O editor é uma ferramenta de produção para criar, validar e ensaiar partituras. A apresentação pública continua sendo uma experiência independente, sem painéis de depuração, edição de eventos, controles de desenvolvimento ou funcionalidades exclusivas de autoria.

Princípios:
1. **Um formato oficial:** JSON versionado é a fonte de verdade. O editor visual lê e modifica esse formato; não cria uma representação paralela que exija conversão posterior.
2. **Um motor de execução:** a pré-visualização deve reutilizar o motor e a lógica de resolução da partitura usados no espetáculo. Não criar uma segunda implementação de coreografia que possa divergir.
3. **Isolamento da apresentação:** os controles do editor vivem em uma ferramenta/rota separada e não são adicionados à UI do público.
4. **Salvar não é publicar:** a edição gera uma cópia local, um download ou um artefato de revisão. Não altera automaticamente os arquivos oficiais nem a branch `main`.
5. **Pré-visualização sincronizada:** alterações em rascunho podem ser testadas na cena e no áudio antes de serem promovidas à coleção oficial de partituras.
6. **Validação visível:** o editor distingue sintaxe JSON inválida, falhas de esquema, referências desconhecidas e problemas semânticos/cênicos.
7. **Sem segredos no cliente:** a ferramenta estática não guarda tokens de GitHub, credenciais ou outras chaves de escrita.

### 13.2 Arquitetura preliminar

Componentes lógicos sugeridos:
- **Editor de partitura:** lista de faixas, linha do tempo, formulário de propriedades, seleção de eventos, comandos de desfazer/refazer e estados de rascunho.
- **Validador:** JSON Schema versionado e regras adicionais de domínio, como identificadores existentes, intervalos temporais, participantes, formações e tipos de eventos suportados.
- **Núcleo da partitura:** leitura, normalização, resolução temporal e seleção do estado esperado para uma posição da música, sem dependência do DOM do editor.
- **Pré-visualização:** cena Babylon.js que usa o mesmo runtime do espetáculo; quando necessário, Canvas2D deve reproduzir a mesma lógica narrativa com apresentação simplificada.
- **Adaptador de sincronização:** controla play/pause/seek e transmite a partitura não publicada para a pré-visualização.
- **Exportação:** gera JSON validado para revisão e incorporação posterior no repositório.

A organização concreta entre módulo compartilhado, painel embutido e iframe de pré-visualização continua pendente. Deve ser escolhida após inspecionar quanto de `dance.js` e da UI atual ainda depende diretamente de elementos específicos de `jazz-club/index.html`. Evitar copiar o motor para o editor. Um iframe pode isolar a interface visual, mas acrescenta um protocolo de mensagens e testes extras; um painel com módulos compartilhados é mais simples, desde que o runtime seja desacoplado dos controles da apresentação.

### 13.3 Implicações técnicas e manutenção

A pré-visualização requer que o núcleo da dança possa ser instanciado sem pressupor que todos os controles do palco público estejam presentes. Esta separação também ajuda a prevenir falhas como tentativas de adicionar listeners a elementos DOM ausentes.

A partitura e o motor devem ter responsabilidades distintas:
- partitura: define eventos e intenção cênica;
- núcleo: valida e resolve qual estado corresponde ao tempo atual;
- renderer: representa esse estado em Babylon.js ou Canvas2D;
- editor: ajuda a autoria sem assumir a execução final.

O JSON Schema deve ser versionado e validado no browser e nos testes automatizados. JSON Schema 2020-12 permite descrever e validar a estrutura dos documentos; as regras próprias do projeto (por exemplo, referências válidas a participantes) requerem verificações semânticas adicionais. Referências: https://json-schema.org/draft/2020-12/ e https://json-schema.org/draft/2020-12/json-schema-validation

### 13.4 Segurança operacional e publicação

O caminho inicial recomendado é **importar, editar, validar, pré-visualizar e exportar**:
1. O editor abre um arquivo JSON escolhido explicitamente pelo usuário ou uma cópia de referência.
2. O áudio pode usar uma faixa pública da coleção; para arquivos de ensaio, a seleção local deve ser explícita.
3. A ferramenta mantém alterações como rascunho durante a sessão e oferece exportação.
4. O JSON exportado passa por testes/revisão e só depois é adicionado à branch de trabalho e incorporado por pull request.
5. Não conceder ao editor acesso de escrita ao GitHub no primeiro MVP.

O navegador pode ler arquivos locais que o usuário seleciona explicitamente por controles de arquivo ou arrastar e soltar. Isso não exige enviar tais arquivos a um servidor. Referência: https://developer.mozilla.org/en-US/docs/Web/API/File_API

**Limite importante:** se a ferramenta for publicada em um repositório público e num site estático público, uma URL separada ou não listada na apresentação não torna o editor privado. O código e a página continuarão acessíveis a quem obtiver a URL. Para restringir realmente o acesso, deve permanecer local/de desenvolvimento ou ser hospedada num ambiente que implemente controle de acesso. A ausência de credenciais e de capacidade de escrita reduz o risco, mas não equivale a autenticação.

Se a pré-visualização utilizar `postMessage` entre o editor e um iframe/janela, deve validar a origem e a fonte da mensagem, verificar o formato do conteúdo e usar um `targetOrigin` exato quando aplicável. Não aceitar mensagens arbitrárias nem executar texto de JSON como código. Referência: https://developer.mozilla.org/en-US/docs/Web/API/Window/postMessage

### 13.5 Facilidade de autoria

A primeira interface útil não precisa ser um editor musical completo. Deve permitir:
- carregar/selecionar uma faixa e uma partitura;
- exibir tempo atual, duração e marcadores numa linha do tempo;
- selecionar, criar, mover, editar e remover um evento;
- associar personagens, grupos, formação, destaque e intensidade;
- reproduzir, pausar, avançar e retroceder;
- ver o estado da cena no tempo selecionado;
- validar a partitura e localizar os erros;
- desfazer/refazer edições;
- exportar o JSON e reabrir a cópia para confirmar que não houve perda.

A edição precisa oferecer entrada numérica de tempo em segundos, além de deslocamento pela linha do tempo. O ajuste por batida/compasso pode ser acrescentado quando o esquema de música estiver estabilizado; não deve obrigar todos os eventos a usar um BPM presumidamente constante.

A ferramenta deve distinguir claramente **rascunho alterado**, **válido para pré-visualização** e **aprovado para integração**. Estar sintaticamente válido não significa que uma coreografia seja artisticamente aprovada.

### 13.6 Escopo faseado

**Fase 1 — Fundamento:** isolar o núcleo da partitura do DOM e dos controles de interface; definir JSON Schema e regras semânticas; criar testes para uma faixa piloto.

**Fase 2 — Pré-visualização:** abrir a mesma partitura e áudio; sincronizar play/pause/seek; mostrar os marcadores e o estado cênico no tempo atual.

**Fase 3 — Editor mínimo:** criar e editar eventos, associar participantes, validar, desfazer/refazer e exportar JSON.

**Fase 4 — Usabilidade musical:** zoom, ajuste de grade, duplicação de eventos, avisos de colisão/ordem, navegação entre seções e pré-visualização do clímax com elenco provisório.

**Fase 5 — Expansão:** preparar mais partituras, integrar a revisão de conteúdo e adicionar ferramentas de autoria conforme a necessidade real.

O cronograma deve ser recalculado após a Fase 1, porque o grau de acoplamento entre `dance.js`, o HTML atual e o fallback ainda precisa ser confirmado.

### 13.7 Critérios para considerar a primeira versão útil

- Abrir um JSON válido e detectar um inválido com mensagens localizáveis.
- Não alterar o JSON oficial ao editar um rascunho.
- Pré-visualizar uma partitura com a mesma lógica narrativa do espetáculo.
- Fazer play/pause/seek e reconstruir o estado sem duplicação ou poses obsoletas.
- Alterar um marcador e ver o resultado na pré-visualização sem recarregar a página inteira.
- Exportar e reabrir o JSON mantendo todos os campos suportados.
- Confirmar que a apresentação pública continua sem controles de autoria/de desenvolvimento.
- Confirmar que a ferramenta não precisa de token de GitHub nem envia os arquivos locais selecionados a um serviço remoto.
- Testar a operação em navegadores-alvo e registrar limitações.

### 13.8 Decisões ainda pendentes

1. A ferramenta será apenas local/de desenvolvimento, ou será publicada como ferramenta estática separada no GitHub Pages? A publicação estática em repositório público não oferece privacidade por esconder a URL.
2. A pré-visualização será um painel que instancia o runtime compartilhado ou um iframe isolado? A escolha depende do desacoplamento do motor atual e do nível de isolamento desejado.
3. Qual é a faixa piloto e qual conjunto mínimo de eventos será necessário para demonstrar a sincronização?
4. A edição automática de arquivo ficará fora do primeiro MVP (recomendado), usando exportação e revisão manual de Git, ou haverá uma integração de escrita posterior?
5. Quais testes serão executados automaticamente em cada alteração da partitura?



## 14. Editor de partituras — direção de privacidade escolhida; MVP exclusivamente local no ambiente de desenvolvimento

A direção escolhida é **C — ambiente privado com controle de acesso apropriado**. Isso significa que a ferramenta de autoria e seus recursos devem ser acessíveis somente aos usuários autorizados. Esta seção analisa as consequências e propõe critérios de aceite; o método de hospedagem e a política de acesso ainda não estão congelados.

### 14.1 Requisito de segurança

Não é suficiente:
- esconder o link do editor;
- confiar numa variável JavaScript que decide mostrar ou não os controles;
- exibir uma tela de senha no cliente sem proteção dos recursos no servidor/proxy;
- publicar os arquivos estáticos em uma URL pública e presumir que a URL pouco conhecida os torna privados.

O controle precisa acontecer antes de disponibilizar a aplicação e os recursos protegidos. A autorização feita apenas no cliente é contornável e não deve ser usada como decisão final de acesso. Referência: OWASP Authorization Cheat Sheet: https://cheatsheetseries.owasp.org/cheatsheets/Authorization_Cheat_Sheet.html

A política mínima proposta é negar por padrão e permitir somente identidades explicitamente autorizadas. A lista de pessoas/grupos autorizados, o método de autenticação e o processo para revogar acesso devem ser definidos antes da implantação.

### 14.2 Implicações de GitHub Pages

GitHub Pages é hosting estático e, por padrão, os sites publicados ficam acessíveis publicamente, mesmo quando o repositório de origem é privado, salvo se a publicação privada com controle de acesso tiver sido configurada.

A documentação atual do GitHub indica que a publicação de um site Pages privado com controle de acesso exige **GitHub Enterprise Cloud** e um repositório privado/interno pertencente a uma organização compatível. Não se deve presumir que o plano pessoal atual e um repositório sob o usuário `qui-x` suportem essa modalidade. Referências oficiais:
- https://docs.github.com/en/enterprise-cloud%40latest/pages/getting-started-with-github-pages/changing-the-visibility-of-your-github-pages-site
- https://docs.github.com/en/enterprise-cloud%40latest/pages/getting-started-with-github-pages/creating-a-github-pages-site

Consequência: simplesmente criar `editor/` ou uma branch separada na publicação pública do SILM **não** satisfaz o requisito de privacidade. O editor não deve ser distribuído nessa publicação antes de se definir o controle de acesso efetivo.

### 14.3 Topologias possíveis

**Opção A — ambiente local de desenvolvimento:** executar o editor num servidor local e manter a superfície acessível apenas na máquina/ambiente de desenvolvimento. Reduz a exposição externa e pode ser a etapa inicial de protótipo, mas não oferece automaticamente colaboração remota. O processo de execução e atualização deverá ser documentado.

**Opção B — aplicação hospedada atrás de proxy de identidade:** hospedar a ferramenta num ambiente servidor e colocar um controle de acesso real antes da aplicação. Uma possibilidade é Cloudflare Access, que atua como proxy com políticas baseadas em identidade. A documentação pede um domínio ativo na Cloudflare para a opção de publicar uma aplicação em hostname público e define políticas de acesso, com negação por padrão se não houver uma regra de permissão adequada:
- https://developers.cloudflare.com/cloudflare-one/access-controls/applications/http-apps/
- https://developers.cloudflare.com/cloudflare-one/access-controls/applications/http-apps/self-hosted-public-app/

Esta opção exige confirmar a disponibilidade de domínio/DNS, local de hospedagem, política de identidade, custos e como impedir acesso direto à origem que contorne o proxy. Usar apenas o Access no hostname público não resolve caso o serviço de origem também permaneça diretamente exposto.

**Opção C — publicação privada no GitHub Pages:** considerar somente se houver organização/plano elegível no GitHub Enterprise Cloud e se a restrição de acesso aos membros do repositório corresponder aos requisitos. Não deve ser tratada como disponível sem confirmar o plano e a propriedade/visibilidade do repositório.

A escolha entre essas opções depende de uma decisão sobre a necessidade de abrir o editor remotamente a partir de outros dispositivos. Não assumir a existência de domínio próprio, assinatura empresarial, servidor, conta de hospedagem ou provedor de identidade antes de confirmar os recursos disponíveis.

### 14.4 Segredos e permissões de escrita

O primeiro MVP deve manter o fluxo **importar → editar → validar → pré-visualizar → exportar → revisar → incorporar por pull request**.

Regras:
- Não colocar token de GitHub, chave de API ou segredo de hospedagem dentro de arquivos JavaScript, JSON, variáveis de build públicas ou dados do navegador.
- Não conceder permissão de escrita ao repositório a partir da interface de autoria no MVP.
- Manter as alterações de partitura como rascunhos separados da versão oficial.
- Se, numa fase futura, for necessária publicação automatizada, realizá-la por um workflow controlado, com permissões mínimas, revisão de origem e credenciais de curta duração quando possível.
- Evitar armazenar conteúdo de partituras privadas em logs de autenticação ou telemetria sem necessidade.
- Não considerar a autenticação de entrada uma garantia de autorização para todas as operações; validar separadamente o que cada identidade pode ler, exportar ou publicar.

Para futuras implantações automatizadas, GitHub Actions suporta OIDC para trocar uma identidade de workflow por uma credencial de curta duração no provedor, em vez de manter credenciais permanentes como secrets; a configuração deverá restringir repositórios/branches/ambientes confiáveis:
https://docs.github.com/en/actions/how-tos/secure-your-work/security-harden-deployments/oidc-in-cloud-providers

### 14.5 Critérios de aceite de segurança e operação

A decisão de arquitetura só pode ser considerada implementável quando os testes demonstrarem:

1. **Usuário autorizado:** consegue autenticar e abrir o editor.
2. **Usuário não autorizado:** recebe negação de acesso antes de obter a aplicação e seus recursos protegidos.
3. **Revogação:** removendo a identidade da política autorizada, o acesso é bloqueado depois da atualização/expiração aplicável das sessões.
4. **URL/origem direta:** não há uma rota, subdomínio ou origem alternativa que permita contornar o controle de acesso.
5. **Apresentação pública isolada:** a página pública do Clube de Jazz continua sem controles editoriais e sem referenciar/embutir a aplicação privada.
6. **Sem credenciais no cliente:** arquivos entregues ao navegador não contêm tokens persistentes ou segredos de implantação.
7. **Partitura sem escrita automática:** editar e exportar não altera a partitura oficial nem a branch `main`.
8. **Importação segura:** JSON inválido, eventos desconhecidos, conteúdo fora dos limites e referências inexistentes são rejeitados com mensagens compreensíveis.
9. **Fluxo musical:** play/pause/seek e troca de faixa reconstruem o estado sem duplicação de personagens, poses obsoletas ou descompasso permanente.
10. **Disponibilidade e recuperação:** é documentado como atualizar, voltar à versão anterior e recuperar o acesso administrativo sem enfraquecer a política global.
11. **Auditoria mínima:** ficam registrados os eventos administrativos pertinentes (alteração de políticas/deploy), sem coletar dados pessoais desnecessários.
12. **Teste em navegador-alvo:** a autenticação e o editor funcionam sem controles editoriais aparecerem no modo público e sem comprometer a pré-visualização.

Os critérios 2, 3 e 4 precisam ser testados como controle real no perímetro de hospedagem, não por simples inspeção da interface.

### 14.6 Implicações para o cronograma

A privacidade torna a hospedagem e o acesso uma dependência explícita do editor. A ordem recomendada é:
1. confirmar se o editor será acessado apenas no ambiente de desenvolvimento ou remotamente;
2. verificar os recursos reais disponíveis (plano de GitHub, domínio/DNS, hospedagem e provedor de identidade);
3. selecionar a topologia de acesso e documentar a política de negação por padrão;
4. validar o perímetro com testes de acesso autorizado, acesso negado e origem direta;
5. concluir o protótipo de partitura e pré-visualização;
6. desenvolver o editor visual;
7. só depois pensar em publicação automatizada ou escrita direta no GitHub.

A primeira demonstração do motor musical pode acontecer localmente enquanto a topologia de acesso remoto é definida; a experiência privada completa não deve ser declarada pronta antes dos testes de autenticação e acesso direto.

### 14.7 Decisão de execução local — ESCOLHIDA PARA O MVP

Foi escolhida a execução **somente no ambiente de desenvolvimento**, por ser a alternativa mais simples nesta fase. Esta decisão substitui a necessidade imediata de hospedagem remota privada, domínio próprio, provedor de identidade e configuração de autenticação remota.

Consequências:
- O editor não será publicado no GitHub Pages nem incorporado à apresentação pública do Clube de Jazz.
- O acesso inicial ocorrerá apenas no ambiente de desenvolvimento, com a aplicação servida localmente.
- Se for necessário iniciar um servidor de desenvolvimento, ele deverá escutar apenas em loopback (`127.0.0.1` ou equivalente local), salvo decisão explícita e documentada posterior. Não expor portas à rede local ou à internet por conveniência.
- A ferramenta não receberá token de escrita do GitHub e não modificará a partitura oficial automaticamente.
- O fluxo do MVP será importar/abrir JSON → editar → validar → pré-visualizar → exportar → revisar e incorporar por fluxo normal de Git.
- A apresentação pública e seus controles não serão alterados para acomodar o editor.
- A necessidade de autenticação remota será reconsiderada apenas se surgir uma necessidade real de colaboração fora do ambiente de desenvolvimento.

### 14.8 Critérios de aceite específicos para execução local

1. A ferramenta não é publicada nem referenciada a partir da apresentação pública.
2. O servidor de desenvolvimento, quando usado, aceita conexões apenas de loopback por padrão.
3. A aplicação abre e edita uma partitura sem credenciais ou tokens de escrita do GitHub.
4. Importar um arquivo inválido apresenta erros compreensíveis e não sobrescreve o último arquivo válido.
5. A pré-visualização usa o núcleo comum da partitura e mantém sincronização em play/pause/seek.
6. Exportar e reabrir o arquivo preserva os campos e eventos reconhecidos pelo formato.
7. Alterar ou exportar uma partitura não altera automaticamente a branch `main`.
8. As instruções para iniciar e encerrar o editor local são documentadas junto do código, quando a implementação começar.
9. Verifica-se que a ferramenta não escuta em endereço público nem expõe uma rota remota inadvertidamente.

Os critérios anteriores de autenticação remota e bloqueio de URL/origem direta aplicam-se somente a uma futura implantação remota e não são requisito para a primeira execução local.


## 15. Decisão registrada: editor exclusivamente no ambiente de desenvolvimento

Em 29 de outubro de 2026, foi escolhida a opção **executar apenas no ambiente de desenvolvimento**, por ser mais simples e adequada à fase atual.

### Limites da decisão
- Não criar agora serviço de hospedagem remota privada nem fluxo de autenticação remota.
- Não publicar o editor no GitHub Pages, nem mesmo numa URL não listada.
- Não alterar a experiência pública do Clube de Jazz para incluir controles de autoria.
- Priorizar o núcleo de partitura, a pré-visualização sincronizada e o ciclo de edição/exportação.
- Reavaliar a necessidade de acesso remoto apenas se colaboração fora do ambiente de desenvolvimento tornar-se um requisito explícito.

### Próxima sequência técnica
1. Inspecionar e modularizar a lógica existente de partitura/coreografia, sem duplicar o motor.
2. Definir e validar o JSON Schema e as regras semânticas.
3. Criar uma faixa-piloto com marcadores.
4. Implementar pré-visualização local com play/pause/seek.
5. Acrescentar edição mínima, validação, desfazer/refazer e exportação.
6. Verificar que a versão pública permanece independente do editor.

Esta escolha determina o ambiente de execução do primeiro MVP; não congela ainda o desenho completo da interface nem o formato final dos eventos.


## 16. Código do editor em pasta local fora do repositório público — OPÇÃO ESCOLHIDA PARA ANÁLISE

Foi indicada a opção **C — manter o código do editor apenas numa pasta local de desenvolvimento, fora do repositório público**. A escolha responde à intenção de não publicar o editor nem seus arquivos; as medidas de manutenção, versionamento e ligação com os ativos do espetáculo ainda precisam ser definidas antes de congelar a solução.

### 16.1 Benefícios

- O código e a interface de autoria não entram na publicação estática pública do SILM.
- Não há necessidade imediata de um repositório privado remoto, serviço de autenticação ou hospedagem do editor.
- O desenvolvimento pode se concentrar na modelagem JSON, na pré-visualização sincronizada e no controlador da partitura.
- A apresentação pública pode continuar sendo validada de forma independente.
- Os arquivos de rascunho e as partituras em edição não são enviados automaticamente ao repositório público.

### 16.2 Riscos de manutenção

Manter uma pasta fora do repositório não garante, por si só, histórico de alterações, backup ou recuperabilidade. Se os arquivos forem perdidos, o editor pode precisar ser reconstruído. Sem histórico, também ficará mais difícil comparar versões, desfazer mudanças ou diagnosticar regressões.

Mitigação recomendada:
- criar uma pasta local separada do clone público;
- manter a pasta sem repositório Git, conforme decisão do usuário;
- criar backups manuais datados da pasta e das partituras de trabalho;
- verificar periodicamente se os backups são legíveis e restauráveis;
- não armazenar tokens, senhas ou credenciais no editor;
- documentar como restaurar uma cópia e iniciar o ambiente de desenvolvimento;
- rever a estratégia se houver necessidade de colaboração entre máquinas ou de recuperação remota.

A pasta não terá histórico Git. Portanto, backups manuais datados são a forma definida para recuperar versões anteriores. Sem cópia adicional, uma falha do computador ou perda do diretório pode eliminar tanto o código como as partituras de trabalho. Se a colaboração remota ou histórico refinado se tornar necessário, rever a política antes de escolher um novo destino de versionamento.

### 16.3 Como reutilizar o motor sem duplicá-lo

O editor deve reutilizar o núcleo de partitura/coreografia que já existe em `jazz-club/src/`, sem criar uma cópia independente do algoritmo.

Como os arquivos do editor ficarão fora do clone público, será necessário definir um ponto de integração local. A opção técnica preferida para investigar é um servidor de desenvolvimento que exponha, sob loopback apenas, a interface do editor local e os módulos de runtime existentes do clone, sem modificar o artefato público. A configuração precisa:
- resolver os caminhos locais explicitamente;
- não escutar em interfaces públicas por padrão;
- impedir importações que dependam de diretórios arbitrários do computador;
- usar os mesmos módulos de runtime empregados pelo espetáculo, e não versões copiadas que possam divergir;
- deixar claro como funciona se o diretório do clone for movido;
- não depender de recursos de autoria no build público.

A escolha entre um pequeno servidor local próprio, configuração de ferramenta de desenvolvimento ou outro mecanismo de integração deve ocorrer após inspeção do código e dos caminhos de importação atuais. Não se deve assumir que abrir arquivos diretamente com `file://` será suficiente para módulos ES, carregamento de áudio e sincronização, pois restrições de origem e CORS podem impedir operações.

### 16.4 Separação de conteúdo e código

Tratar separadamente:
- **código do editor:** apenas na pasta local fora do repositório público;
- **módulos do runtime:** continuam sendo os módulos versionados do projeto, sem cópias divergentes;
- **rascunhos de partitura:** guardados localmente durante a edição;
- **partitura aprovada:** exportada, validada e incorporada ao fluxo de mudanças do projeto apenas quando estiver pronta;
- **ativos de áudio/modelos:** referenciados a partir da coleção existente quando possível, sem duplicação desnecessária.

Não copiar arquivos de áudio grandes para a pasta do editor só para conseguir pré-visualizá-los, a menos que exista necessidade técnica documentada. A ferramenta deve indicar com clareza o caminho e o identificador da faixa que está usando.

### 16.5 Critérios de aceite

1. Nenhum arquivo-fonte do editor é adicionado à árvore do repositório público nem ao artefato publicado.
2. A ferramenta roda no ambiente local, e qualquer servidor de desenvolvimento escuta apenas em loopback por padrão.
3. A pré-visualização utiliza o mesmo núcleo de partitura/coreografia do projeto.
4. Mover ou não encontrar o clone do projeto gera uma mensagem explícita, não uma falha silenciosa nem a utilização de uma cópia antiga.
5. O editor importa, valida, edita, exporta e reabre um JSON sem perda dos campos suportados.
6. A edição não altera automaticamente a partitura oficial nem a branch `main`.
7. Existe uma política aprovada de versionamento local e backup antes de produzir partituras importantes.
8. A apresentação publicada não ganha dependências em tempo de execução do editor local.
9. O passo a passo para iniciar o editor, encerrar o servidor e restaurar a pasta está documentado.

### 16.6 Política de manutenção escolhida

Foi escolhida a opção **B — pasta local sem Git, com backups manuais datados**.

Procedimento proposto:
- guardar o código do editor fora do clone público;
- fazer cópias datadas após marcos funcionais e antes de alterações estruturais;
- manter pelo menos uma cópia de backup em local diferente da pasta de trabalho;
- verificar periodicamente a abertura/restauração de uma cópia;
- incluir nos backups as partituras e configurações necessárias para reconstruir o ambiente, sem credenciais ou segredos;
- documentar como identificar a versão mais recente e recuperar um marco anterior.

Como essa política não oferece comparação automática de diffs, os nomes das cópias devem indicar data e finalidade, por exemplo `editor-partituras_2026-10-29_previa-inicial`. A frequência e o destino dos backups podem ser refinados antes da implementação, mas devem estar definidos antes de criar partituras importantes.

### 16.7 Decisões locais ainda abertas

- Qual será o caminho da pasta do editor, sem pressupor a letra de unidade ou a organização atual da máquina?
- Qual servidor/configuração local será utilizado para expor a pré-visualização em loopback?
- Como o editor resolverá a localização do clone `qui-x/ligacoesmetalicas` sem fixar um caminho frágil?
- Qual frequência prática dos backups manuais datados será adequada para cada etapa de trabalho?

A opção escolhida determina a política de manutenção do primeiro MVP; não congela o desenho completo da interface nem o formato final da partitura.


## 17. Arquitetura de animação e coreografia — próxima decisão técnica em análise

A próxima parte da direção técnica é definir como o trabalho artístico de animação será dividido entre Blender e Babylon.js. A meta é aumentar a mobilidade e a expressividade observadas nas referências de dança sem tornar inviável a produção de 17 personagens e a coreografia coletiva.

### 17.1 Opções a comparar

**A — Animação predominantemente pré-produzida no Blender**
- As sequências corporais são animadas e refinadas no Blender, exportadas como clipes e selecionadas durante a reprodução.
- Vantagens: controle artístico direto, maior previsibilidade de poses e continuidade expressiva.
- Custos/riscos: a quantidade de clipes pode crescer rapidamente; combinações entre grupos podem exigir muitas variações ou transições extras.
- Adequação provável: solos e movimentos de alta exigência artística; menos flexível para gerar novas formações em tempo real.

**B — Coreografia predominantemente procedural no Babylon.js**
- Posições, articulações, ritmos e formações são calculados em execução por regras e parâmetros.
- Vantagens: flexibilidade, adaptação às quantidades de personagens e possibilidade de criar variações sem exportar clipes exclusivos.
- Custos/riscos: maior trabalho de programação e refinamento; movimentos podem parecer mecânicos ou apresentar conflitos biomecânicos se a abordagem for usada para todas as ações.
- Adequação provável: formações, deslocamentos, reposicionamento e movimentos de fundo; risco maior para gestos artísticos complexos.

**C — Modelo híbrido: clipes artísticos + coordenação procedural**
- Blender fornece clipes reutilizáveis, transições e ações de maior exigência expressiva.
- Babylon.js coordena participantes, formações, posições no palco, prioridades, pesos de animação, intensidade e sincronização com a partitura.
- Vantagens: equilíbrio entre controle artístico e flexibilidade do espetáculo.
- Custos/riscos: requer contrato claro entre rigs, nomes de clipes, estados e sincronização; a mistura de animações deve evitar que múltiplas camadas tentem controlar as mesmas articulações de modo incompatível.

**Recomendação preliminar:** aprofundar a opção C. Não é aprovação definitiva até analisar o rig atual, a forma de exportação, o fallback Canvas2D e os testes necessários.

### 17.2 Princípios que independem da opção final

1. O controlador deverá resolver uma pose coerente por personagem, com prioridade explícita para camada rítmica, coreografia de grupo e destaque.
2. A partitura musical determina o estado no tempo; o motor deve reconstruir o estado por tempo absoluto e não exigir que cada clipe anterior termine naturalmente.
3. Entrada, saída, destaque e presença cênica devem usar estados documentados; um personagem não pode ficar preso numa transição depois de seek ou troca de música.
4. Os clipes devem ser reutilizáveis entre personagens compatíveis, mas não se deve presumir compatibilidade de rigs sem testar a exportação e a deformação.
5. Movimentos de referência observados em vídeos devem ser traduzidos em animações originais, sem exigir cópia literal de uma coreografia protegida.
6. A assinatura de CFC, CCC, HC ou DHC no figurino deve continuar legível durante os movimentos, e o movimento não será tratado como representação literal da estrutura microscópica.
7. Babylon.js e Canvas2D devem consumir a mesma intenção coreográfica, ainda que o fallback simplifique a realização visual.

### 17.3 Protótipo de prova

Antes de criar animações exclusivas para todos os personagens:
1. selecionar um dos rigs existentes e confirmar sua compatibilidade com a pipeline Blender → glTF/GLB → Babylon.js;
2. criar um pequeno conjunto de movimentos: groove base, isolamentos, transferência de peso/passos, entrada, giro/transição e destaque;
3. coordenar três personagens com as camadas de movimento já escolhidas;
4. validar pause/seek/troca de faixa, incluindo reconstrução do estado da pose;
5. aumentar para 17 personagens com modelos provisórios;
6. medir desempenho e conferir a legibilidade das quatro assinaturas cristalinas antes de refinar todos os modelos.

### 17.4 Critérios de aceite

- O ciclo de peso, pés, quadris, tronco, ombros e cabeça parece articulado, e não como um corpo rígido.
- Nenhuma animação deixa o personagem deslizando sem apoio de forma não intencional.
- Os isolamentos e gestos de destaque podem ser combinados com o movimento de base sem conflito perceptível.
- A entrada e a saída terminam em poses válidas, e seek não deixa personagens em poses intermediárias obsoletas.
- A composição de três personagens é convincente antes de ser ampliada para 17.
- O teste com elenco completo permite distinguir destaque, conjunto e presença cênica.
- A estrutura visual continua legível durante giros e deslocamentos.
- A cena pública permanece livre dos controles do editor local.
- Os critérios de desempenho são medidos com equipamento e navegador identificados; metas de FPS ainda não são consideradas garantidas.

### 17.5 Questão a decidir antes do congelamento

A preferência preliminar é o **modelo híbrido (C)**. A discussão seguinte deve avaliar se ele será usado como arquitetura principal para todas as ações ou se algumas categorias terão exceções deliberadas, por exemplo:
- clipes pré-produzidos para solos e gestos de personagem;
- cálculo procedural para deslocamento, formação e reposicionamento;
- movimentos genéricos e mais econômicos para a camada de presença cênica;
- fallback Canvas2D com uma representação simplificada da mesma sequência de eventos.

O contrato de clipes, os rigs, os estados e a estratégia de mistura só devem ser congelados depois dessa discussão e de uma prova funcional com os ativos existentes.
