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
