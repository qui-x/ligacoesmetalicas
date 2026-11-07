# SILM — Rede cristalina × ambiente atômico: efeitos das propriedades

**Status:** especificação pedagógica e científica em discussão; não implementada na interface pública.

## 1. Correção de escopo (06/11/2026)

A revisão inicial propôs para a escala 4 coordenação, seleção de centros, distâncias e vizinhos. Isso **duplica a escala 3**, que já oferece navegação, célula, rede e seleção de unidades no motor atual. A orientação do autor é diferente: **o ambiente atômico deve mostrar como as propriedades metálicas aplicadas à estrutura se manifestam em um centro metálico em foco**.

O que já existe na main:
- `domain/silm/workshop.js`: quatro escalas (objeto, microestrutura, rede/célula, ambiente atômico).
- `integracao/adapter.js#setWorkshopScale`: escalas 3 e 4 renderizam a mesma rede; a quarta seleciona um centro e liga vizinhos.
- `domain/silm/crystal-view.js`: uma cena 2D/3D e motor de propriedades comum; há seleção, propriedades simultâneas e camada eletrônica. Não há ainda uma camada própria para *resposta local*.

## 2. Papéis distintos das escalas

### Escala 3 — Rede e célula: fenômeno coletivo

Pergunta: **o que acontece com o material e sua estrutura quando aplico uma condição?**

Ações: configurar estímulos térmicos, elétricos, mecânicos e luminosos conforme disponibilidade científica; observar geometria, resposta da rede, distribuição e relações simultâneas entre propriedades. Inclui visualização de vizinhos, coordenação e navegação da rede — não são funcionalidades exclusivas da escala 4.

### Escala 4 — Ambiente atômico: resposta local do centro em foco

Pergunta: **como o fenômeno aplicado ao metal se manifesta neste centro e no ambiente imediatamente relacionado a ele?**

Ações: selecionar um centro já pertencente à rede, acompanhar sua resposta relativa ao estado inicial, observar deslocamento/vibração, a influência das regiões ao redor e, quando cientificamente justificável, indicadores locais derivados do mesmo motor de propriedades da escala 3.

**Não é um átomo neutro isolado**, e a visualização não pressupõe que a ação sobre o metal aconteça somente nesse átomo. O centro é uma *janela de leitura local* de um sistema coletivo. A coordenação pode aparecer como contexto, mas nunca será o objetivo primário da quarta escala.

### Consulta de átomo neutro isolado

Configuração eletrônica tabelada, subníveis e afins, quando disponíveis, serão apresentados somente como **referência conceitual separada**, não como a distribuição eletrônica efetiva no metal.

## 2.1. Decisão de representação visual — manter o nível atual

**Decisão aprovada pelo autor:** preservar o nível de representação já utilizado pelo SILM para os centros metálicos. Não ampliar a visualização principal para um modelo nuclear de Rutherford, não representar prótons e nêutrons individualmente e não criar uma simulação de órbitas eletrônicas para os centros inseridos no sólido.

- Manter a abstração de centro metálico no contexto cristalino, com as propriedades visuais e os controles já estabelecidos.
- A diferenciação da escala 4 ocorrerá pelo **comportamento local diante dos estímulos aplicados à rede**, não por detalhamento subatômico.
- Posição de referência, vibração, deslocamento, vizinhança e contexto eletrônico coletivo podem ser representados apenas quando respaldados pelo motor científico ou identificados como recursos didáticos.
- Evitar novos botões, painéis e modos nucleares nesta etapa. A configuração eletrônica tabelada do átomo isolado permanece, quando pertinente, como **informação de referência**, não como uma reconstrução do núcleo na cena.
- Preservar a visualização existente até que melhorias funcionais na resposta local sejam implementadas e validadas.

## 3. Matriz de comportamento por fenômeno

| Condição aplicada na rede | Leitura no centro selecionado | Restrições científicas |
|---|---|---|
| **Aquecimento** | Vibração do centro em torno da posição de equilíbrio, relacionada à vibração coletiva; amplitude ilustrativa ou estimada apenas se houver parâmetro validado; indicadores de temperatura local quando calculados no modelo | Vibração atômica não é órbita e não significa deslocamento permanente; condutividade térmica metálica também envolve elétrons |
| **Resfriamento** | Relaxamento temporal das amplitudes e das condições locais conforme a dissipação/condições de contorno modeladas | Não fazer temperatura regressar magicamente; sem modelo de balanço não inventar velocidade ou temperatura absoluta |
| **Campo elétrico / corrente** | Contextualizar centro, campo local do modelo e efeitos de espalhamento por vibrações/defeitos, somente quando modelados | Não simular elétrons «batendo no átomo» de modo determinístico; corrente é resposta coletiva de estados eletrônicos deslocalizados |
| **Solicitação mecânica** | Deslocamento relativo à posição inicial; deformação elástica reversível ou mudança de vizinhança quando houver deformação plástica/dislocações no modelo | Plasticidade de metais não deve ser representada apenas como planos perfeitos que deslizam rigidamente |
| **Luz** | Indicação de interação da radiação com o material e resposta eletrônica quando houver um modelo óptico validado | Não inventar excitação exclusiva de um átomo ou transições orbitais discretas típicas do átomo isolado para o metal |
| **Propriedades simultâneas** | Mostrar conjuntamente efeitos compatíveis (ex.: temperatura local, deslocamento e contexto de corrente) provenientes do mesmo estado científico | Não somar animações independentes como se fossem mecanismos físicos desacoplados |

A escala 4 não adiciona estímulos próprios. Ela **herda exatamente as condições impostas na escala 3** e as interpreta no entorno do centro escolhido.

## 4. Contrato visual e operacional

1. Preservar as quatro escalas e as mesmas propriedades/estado experimental ao navegar entre 3 e 4.
2. Na escala 3, a câmera e os controles dão primazia à visão coletiva da amostra, mantendo funções já existentes de célula, vizinhos e navegação.
3. Na escala 4, seguir o centro em foco; manter a rede como contexto reduzido; diferenciar claramente **posição inicial**, **estado atual** e **efeitos ativos** sem cores que prejudiquem os temas/acessibilidade.
4. A barra superior segue dedicada às escalas; desenho no centro; faixa única de controles inferiores. Evitar novos menus permanentes cobrindo a cena.
5. Uma seleção de centro na escala 3 continua sendo o centro da escala 4. Ao trocar o centro, conservar condições aplicadas e passar a exibir a leitura local do novo centro.
6. Os módulos **Explorar, Medir e Calcular** mantêm suas competências: Explorar mostra modelos qualitativos cientificamente identificados; Medir registra grandezas fundamentadas; Calcular recebe dados/expressões verificáveis.
7. Um parâmetro local indisponível deve aparecer como `Sem modelo local validado`, não como número ou movimento arbitrário.
8. Mar de elétrons e corrente são **coletivos**: não associar uma bolha eletrônica exclusiva ao centro selecionado.
9. Para ligas ou mistura composicional, distinguir ocupação de sítio explícita, região de maior concentração e incerteza; a cor do grão, sozinha, não atribui identidade atômica.
10. Mudança de escala, câmera ou seleção não pode alterar o estado científico nem reiniciar fenômenos contínuos, incluindo regressão térmica.

## 5. Especificação de dados e motor (não implementada)

Fonte única: o estado do experimento, estrutura e propriedades existente no SILM. Uma *projeção somente leitura* da resposta local poderia oferecer:

- `selectedCenterId` e sítio de origem;
- `activeStimuli` e condições de contorno;
- `referencePosition` e `currentPosition` quando fornecidas pelo motor;
- `localTemperature`, `localDisplacement`, `localElectricalContext` e equivalentes **apenas quando calculáveis**;
- `modelKind`: `referenced` / `derived` / `illustrative` / `unavailable`;
- `sourceIds`, limites de validade e unidades.

Os indicadores locais não são novos estados científicos editáveis; não podem criar valores falsamente precisos nem reconstruir o estado material ao mudar a câmera.

## 6. Critérios de aceite propostos

- Se o usuário aplica calor à rede, ao mudar para o ambiente atômico encontra **o mesmo ensaio**, centrado num átomo da rede, com explicação adequada do efeito local.
- Quando a fonte de calor é desligada, o estado local acompanha a evolução térmica do modelo; não retorna instantaneamente a ambiente sem justificativa.
- Ao aplicar campo elétrico, a interface não confunde vibração de centros metálicos e transporte coletivo de elétrons.
- Sob deformação, mostra deslocamentos relativos aos sítios de referência sem confundir elasticidade e plasticidade.
- Alternar escalas 3↔4 e selecionar diferentes centros não muda energia, temperatura calculada, propriedades ativas nem histórico.
- A quarta escala possui propósito visual e científico diferente, **não apenas zoom e vizinhos**.
- Funciona em 320 px de largura, paisagem de baixa altura, desktop, temas, alto contraste e foco por teclado.
- Os testes automatizados com Playwright e as validações numéricas usam o contrato científico do projeto; nenhuma aprovação é presumida antes dos testes.

## 7. Referências para revisão científica

- ACS, *Misconceptions about Metals*, Journal of Chemical Education, DOI: 10.1021/acs.jchemed.4c00010. Discute ressalvas sobre elétrons deslocalizados, espalhamento e plasticidade.
- University of Texas, *Statistical Mechanics*, §7.12: vibrações de rede como movimentos acoplados em torno do equilíbrio.
- ETH Zurich, *Microstructure Evolution*, descrição da plasticidade associada a discordâncias e deslizamento.
- MIT OpenCourseWare, 3.091, *Bonding in Metals, Semiconductors and Insulators*.
