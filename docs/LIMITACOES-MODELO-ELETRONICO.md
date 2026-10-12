# Limitações do modelo eletrônico do SILM

> Declaração obrigatória da série 0.6.x (§145–150). O mesmo texto aparece em Ver → Observar → Modelo eletrônico → "Limites da representação eletrônica" e no Manual (Elétrons deslocalizados → Limites da representação).

1. **Os pontos exibidos pelo SILM são marcadores qualitativos da distribuição eletrônica e não representam a quantidade real de elétrons da amostra.** A quantidade de pontos é escolhida por legibilidade e desempenho (de 24 a 150, até 80 em telas pequenas). O estado científico não guarda contagem de elétrons, e o validador recusa `electronCountReal` e `particles`.
2. **A trajetória visual das partículas não representa trajetórias quânticas individuais de elétrons.** O movimento é um passeio aleatório didático. Elétrons num sólido são descritos por estados deslocalizados, não por pontos com caminho definido.
3. **O movimento visual não corresponde diretamente à velocidade física dos elétrons.** Não há conversão de px/s para m/s, e a velocidade visual não muda com a temperatura.
4. **Na ausência de campo externo, o movimento não representa corrente elétrica orientada.** Não há direção predominante nem setas. Condutividade, campo aplicado e circuito pertencem à série 0.7.x e seguintes.
5. **O modelo simplifica a descrição eletrônica do sólido metálico para fins didáticos.** Não há bandas, densidade de estados nem distinção entre contribuições s, p e d. A convenção de valência do banco é qualitativa.
6. **Os elétrons não pertencem visualmente a pares específicos de centros metálicos.** Não há linhas `M—M`, pares `M : M` nem órbitas em torno de um centro na estrutura formada.

## Outras limitações registradas

- **Montagem livre:** a distribuição é uma representação didática preliminar. As posições da montagem não são distâncias reais.
- **CCC, CFC e HC:** usam o mesmo modelo. O SILM não atribui comportamento eletrônico específico a cada estrutura.
- **Centros metálicos:** o anel interno discreto que aparece com elétrons visíveis indica, de forma didática, o caráter positivo do centro. Não é carga formal fixa, e nenhuma unidade recebe rótulo de carga.
- **Transição átomo → estrutura:** é um esquema conceitual. Não é a ionização de um átomo isolado em fase gasosa.
- **Posições dos marcadores:** não são estado científico. Após recarregar, a configuração (visível, movimento) volta, mas as posições exatas não precisam se repetir.
