# Missões temáticas de ligação metálica — rascunho para validação do autor

> **Situação: RASCUNHO. Ainda não está no programa.** Este rascunho atende ao pedido feito na revisão (R19: "precisamos de algumas missões temáticas voltada ao tema de ligações metálicas").
>
> Os enunciados são conteúdo científico e pedagógico, por isso só entram no SILM depois da validação do autor. Cada objetivo é verificado pelo estado científico do SILM (`scientificState`), nunca pela tela, e passa a "Concluído" ao vivo, sem pontuação, como na família. Nenhum número novo é introduzido: todo valor vem do banco do SILM ou de um cálculo com fórmula e fonte.

## M1 · Do átomo ao sólido metálico

- **Problema**: por que unidades isoladas de cobre não mostram a organização de um metal?
- **Objetivos verificáveis**:
  1. Monte uma estrutura de cobre com pelo menos 8 unidades (`structure.units.length ≥ 8`).
  2. Organize a estrutura cristalina de referência (`structure.mode = 'crystalline'`).
  3. Observe a vizinhança de um centro: meça a coordenação (`measurements` com `type = 'coordination'`).
- **Conclusão pedida**: explique o que muda entre a montagem livre e a estrutura organizada.
- **Ideia científica**: no sólido metálico, os centros ocupam posições periódicas de uma rede; a célula unitária é a unidade que se repete, não uma molécula.

## M2 · Elétrons de todos e de ninguém

- **Problema**: o que mantém os centros metálicos unidos sem ligações entre pares de átomos?
- **Objetivos verificáveis**:
  1. Organize a estrutura de um metal disponível.
  2. Ative o modelo eletrônico (`electrons` presente).
  3. Ligue o movimento eletrônico e observe a distribuição sobre o conjunto.
- **Conclusão pedida**: descreva o papel dos elétrons de valência deslocalizados na coesão do metal.
- **Limite a deixar explícito**: os pontos não representam a contagem real de elétrons, e o movimento sem campo não é corrente elétrica.

## M3 · Três arranjos, três vizinhanças

- **Problema**: os metais se organizam todos da mesma forma?
- **Objetivos verificáveis**:
  1. Organize ferro (CCC) e meça a coordenação.
  2. Organize cobre (CFC) e meça a coordenação.
  3. Organize magnésio (HC) e meça a coordenação.

  Como o SILM guarda uma investigação por vez, cada etapa é verificada quando o metal está ativo e registrada nos objetivos.
- **Conclusão pedida**: compare as coordenações e relacione-as ao tipo de estrutura.
- **Ideia científica**: CCC tem coordenação 8; CFC e HC têm coordenação 12 (estruturas compactas). Os valores vêm da geometria do modelo cristalográfico do SILM.

## M4 · Quanto espaço os átomos ocupam?

- **Problema**: por que algumas estruturas são chamadas de compactas?
- **Objetivos verificáveis**:
  1. Com uma estrutura cúbica organizada, calcule o fator de empacotamento (`calculations` com `formula = 'packing-factor'`).
  2. Repita para outra estrutura cúbica.
- **Conclusão pedida**: compare os fatores e relacione-os às coordenações da M3.
- **Limite**: modelo de esferas rígidas; a comparação com valores tabelados não é erro experimental.

## M5 · Por que o metal se deforma sem quebrar?

- **Problema**: o que acontece com a estrutura quando um metal é martelado?
- **Objetivos verificáveis**:
  1. Inicie a experiência de maleabilidade (`properties.active = 'malleability'`).
  2. Aplique compressão até o limite didático.
  3. Ative os elétrons durante a deformação.
- **Conclusão pedida**: explique, com a ideia de camadas que deslizam e elétrons que continuam compartilhados, por que o sólido não se fragmenta.
- **Limite**: representação qualitativa; não há escala de força nem de tempo.

## M6 · Densidade a partir da estrutura

- **Problema**: é possível prever a densidade de um metal a partir da sua célula unitária?
- **Objetivos verificáveis**:
  1. Organize a estrutura do cobre.
  2. Calcule a densidade teórica (`calculations` com `formula = 'theoretical-density'`), com origem explícita de cada entrada.
- **Conclusão pedida**: identifique de onde vem cada valor, com os rótulos de origem do SILM (Dado tabelado, Calculado pelo SILM — origem de n e de V —, Medida do modelo quando ela alimenta o volume, Valor informado pelo usuário ou Constante definida), e o que a densidade calculada representa.
- **Limite**: ainda não há densidade experimental com fonte no banco para comparar. Ela só entra quando houver uma fonte verificável.

## O que preciso de você

1. Aprovar, cortar ou reescrever os enunciados. O texto final é seu.
2. Escolher quais missões abrem com navegação livre e quais ficam restritas (atividade do professor).
3. Confirmar os metais de cada missão (Fe, Cu, Mg; Na para elétrons, se preferir).
