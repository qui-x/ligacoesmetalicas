# Ensaio eletrotérmico da Oficina — 0.15.10

A seleção conjunta de condutividade elétrica e térmica inicia o mesmo ensaio disponível em **Estímulos → Efeito Joule**. A célula destacada visita a amostra: navegar, girar, ampliar ou trocar o mapa não avança o tempo nem transporta a temperatura junto com o destaque.

## Uso e condições

- **Condições Joule**, na faixa inferior: tensão ou corrente imposta, terminais à temperatura ambiente ou isolamento térmico, alimentação, calor externo e mapa de temperatura, potencial ou dissipação.
- O botão com ícone de avanço calcula **0,5 intervalo relativo**. A animação eletrônica não governa o relógio do ensaio.
- Desligar a alimentação zera corrente e Joule. A energia só diminui quando há saída de calor; uma amostra isolada conserva sua energia depois de desligar as fontes.
- O controle na cena ajusta a condição elétrica escolhida. Os valores de U, I, R, potência e temperatura são relativos. Não são volts, ampères, ohms, watts, segundos ou graus.
- **Condições Joule → Leituras e balanço de energia** mostra também temperatura máxima e energias gerada por Joule, fornecida externamente, armazenada e removida. **Reiniciar ensaio** zera os campos e desliga as fontes, preservando a condição de contorno e o modo elétrico escolhidos.
- O ensaio é temporário: restaurar volta ao estado inicial; encerrar, trocar a investigação ou recarregar descarta o campo calculado. O Caderno ainda não exporta este ensaio.

## Modelo declarado

A amostra é um recorte finito dos sítios da geometria cristalográfica. Arestas únicas ligam primeiros vizinhos. Os terminais são as faces de x mínimo e máximo; o potencial de referência fica no máximo. Os demais sítios conservam corrente. Uma malha desconexa é recusada, sem criar conexões artificiais.

Para uma aresta de comprimento L e menor comprimento da malha Lmin, o peso w = Lmin/L. A condutância elétrica é G = w/[1 + 0,5(Ti + Tj)/2]. Cada nó possui capacidade térmica relativa 1; a condutância térmica da aresta é K = 0,15w. Esses coeficientes são **ilustrativos e iguais entre metais**, não dados experimentais. T = 0 representa o ambiente.

O laplaciano elétrico com terminais prescritos é resolvido por gradientes conjugados. A tensão imposta é a intensidade escolhida. A corrente imposta é essa intensidade multiplicada pela condutância da amostra fria; a tensão necessária é calculada a cada passo. A potência G(Vi − Vj)² é dividida igualmente entre as duas extremidades.

O calor externo, quando ligado, fornece potência relativa 0,25 ao sítio interior mais próximo do centro. É contabilizado separadamente de Joule. O isolamento não remove energia; a outra condição mantém os terminais em T = 0 e registra o calor retirado, inclusive ao mudar o contorno de uma amostra quente.

A integração térmica usa Euler explícito com subpassos menores ou iguais a min(0,1; 0,8/max ΣK). Todos os subpassos precisam passar pela verificação de potência e balanço de energia. Temperaturas não finitas, negativas ou acima do limite didático 10 recusam o intervalo inteiro, preservando o relógio, o campo e os acumuladores anteriores.

## Representação e limites

Os campos usam a transformação fixa v/(1+v) para a cor; não são renormalizados pelo máximo de cada quadro. O potencial usa contorno tracejado, a dissipação contorno duplo e a temperatura contorno contínuo, acompanhando o tema de acessibilidade. A leitura numérica mantém o valor calculado.

A deriva visual dos elétrons acompanha I/(1+I), calculado pela rede, sem reaplicar o redutor térmico da experiência elétrica isolada. Os marcadores não representam trajetórias locais, velocidade real nem número real de elétrons. A animação é uma pista qualitativa e pode ser reduzida nas configurações de acessibilidade.

As montagens de referência verificadas são **Cu, Fe, Mg, Sn, Po e Am**. **Mn, Bi, Np e Pu** ficam indisponíveis neste ensaio porque o critério de primeiros vizinhos do recorte atual produz uma malha desconexa. Isso é uma limitação do modelo, não ausência de condução no metal real. Outros elementos são aceitos somente se a sua geometria gerar uma malha válida.

Não há comparação quantitativa entre metais, calibração SI, curva material homologada, inversão de polaridade, termoelectricidade ou mudança de fase nesta versão. Esses recursos dependem de validação posterior.

## Verificação

`node --test tests/*.test.*` cobre circuito em série, conservação de corrente nos sítios internos e terminais, potência elétrica igual à dissipação, balanço de energia, fonte externa independente, isolamento, resfriamento, tensão versus corrente imposta e recusa atômica de intervalos inválidos.

`tests/run-workshop-micro-main.mjs` verifica em Chromium e Firefox, desktop e celular, a faixa inferior, deslocamento integral da célula, mapas, avanço manual, resfriamento, conservação da corrente imposta e seleção conjunta por Ctrl.
