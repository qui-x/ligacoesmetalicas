# Interações entre propriedades metálicas — P7

## Referência de projeto

Esta implementação reaproveita o estudo registrado em
[`especificacoes-atuais/docs/PLANO-PROPRIEDADES-METALICAS.md`, seção 9 — Propriedades juntas (P7)](https://github.com/qui-x/ligacoesmetalicas/blob/especificacoes-atuais/docs/PLANO-PROPRIEDADES-METALICAS.md#9-propriedades-juntas-p7-iniciada-com-calor-corrente).

O estudo P7 definiu duas famílias de interação, com três experiências selecionáveis na interface:

- Condutividade elétrica + condução térmica (calor + corrente).
- Maleabilidade + campo elétrico (deformação + corrente).
- Ductilidade + campo elétrico (deformação + corrente).

## Como a combinação funciona

A investigação mantém uma única propriedade-base em `scientificState.properties.active`. O segundo fenômeno é um estímulo complementar transitório, controlado pelos motores já existentes. Não se cria uma segunda investigação, não se sobrepõem duas propriedades-base e os estímulos transitórios não são gravados como se fossem dados do metal.

### Calor + corrente

A condutividade elétrica é a experiência-base. A fonte térmica é ligada pelo controlador de difusão sobre o grafo de vizinhos da estrutura cristalina.

A temperatura local aumenta o espalhamento dos elétrons e reduz a deriva média nas regiões mais quentes. O estudo usa fatores didáticos qualitativos: espalhamento (1 + 3T) e deriva (1/(1 + 2T)), com (T) entre 0 (ambiente) e 1 (fonte). O elétron não passa a ter uma velocidade real calculada pelo SILM; a cena demonstra a tendência de espalhamento.

### Maleabilidade + corrente

A maleabilidade é a experiência-base. O campo elétrico é um estímulo transitório. Durante a compressão, os deslizamentos de planos produzem defeitos cristalinos (discordâncias, não desenhadas individualmente) que aumentam o espalhamento eletrônico.

O fator qualitativo de espalhamento é (1 + 1{,}2d), e a deriva é reduzida por (1/(1 + 0{,}6d)), em que (d) é a fração dos deslizamentos realizados ((0 leq d leq 1)).

### Ductilidade + corrente

Usa a mesma regra qualitativa da combinação anterior, mas a experiência-base é a tração: a amostra se alonga e se estreita, e o campo elétrico permanece como estímulo complementar. Maleabilidade e ductilidade continuam sendo fenômenos distintos; a combinação elétrica não transforma uma experiência na outra.

## Onde cada ação fica disponível

**Ver → Observar** apresenta os comandos diretos:

- **Calor + corrente**
- **Maleabilidade + corrente**
- **Ductilidade + corrente**

Ao ativar uma combinação, a interface inicia a propriedade-base correspondente e liga o estímulo complementar. Ao tocar novamente na combinação ativa, desliga apenas o estímulo complementar; a experiência-base permanece aberta e pode ser encerrada pelo comando próprio da propriedade.

As combinações que dependem do grafo de vizinhos ou de deslizamento de planos exigem uma estrutura cristalina organizada. Na montagem livre, Observar permite identificar os centros metálicos e mostrar o modelo coletivo de elétrons; não simula difusão térmica nem deformação cristalográfica sem a geometria que fundamenta esses motores.

## Limites científicos

- Os efeitos são qualitativos; os coeficientes são didáticos e iguais para todos os metais.
- O banco não contém valores numéricos homologados de condutividade elétrica, condutividade térmica, resistividade ou limite de escoamento para alimentar essas combinações.
- A regra de Matthiessen orienta a interpretação do espalhamento, não fornece aqui uma resistividade numérica da amostra.
- Brilho metálico permanece uma experiência independente. O estudo P7 não validou sua combinação simultânea com calor, corrente ou deformação.
- Outras combinações entre propriedades não devem ser ativadas por associação visual. Precisam de hipótese científica, mecanismo, parâmetros, limitações e testes próprios antes de serem oferecidas ao aluno.

## Componentes reutilizados

- `domain/silm/thermal.js`: difusão térmica na rede de vizinhos e fonte de calor.
- `domain/silm/drive.js`: intensidade do campo e estímulo elétrico transitório durante a deformação.
- `domain/silm/deformation.js`: resposta mecânica por deslizamento de planos.
- `domain/silm/electron-view.js`: espalhamento e deriva dos elétrons, incluindo temperatura e defeitos.
- `integracao/metallic-experience.js`: coordenação dos controladores e alternância do estímulo complementar.
- `integracao/workspace-family.js`: comandos diretos na família Observar.
