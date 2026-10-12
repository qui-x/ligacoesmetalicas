# SILM 0.8.0 — Módulo Explorar

**Origem executável:** SILM 0.7.0 (`entregas/SILM-0.7.0.zip`, SHA-512 `94dddbe025871121f8a1e06d5fe6f9a9266c8d22c73a96954660947d17fa9d1cabe966623ca765010e74e9c7a2ac3bad97d4a03933eaf3ebfca16f6a00311ef7`), sem build intermediária. A regra de parada (§28) foi dispensada pelo autor, que pediu a execução contínua das séries até a 0.17.x.

## Critério de aceite (§27)

> O módulo Explorar integra de forma coerente e não linear as mecânicas científicas já implementadas no SILM, permitindo que o estudante manipule, observe e compare qualitativamente estrutura, cristalografia, elétrons e propriedades do mesmo metal sem criar estados científicos paralelos ou antecipar instrumentos de medição e cálculo.

## O que esta versão implementa

1. **Ver → Observar contextual.** Barra de foco com Síntese, Centro, Célula ou Montagem, Elétrons e Propriedade. O foco acompanha a última ação (organizar, selecionar unidade, mostrar elétrons, iniciar experiência). O foco **Centro** é novo: posição na célula, coordenação e vizinhos imediatos com a distância calculada pelo SILM a partir dos parâmetros de rede tabelados. Ver [`MODULO-EXPLORAR.md`](MODULO-EXPLORAR.md).
2. **Ver → Camadas:**
   - centros metálicos, célula, rede, vizinhos, elétrons, rótulos e indicações da propriedade;
   - reutilizam os estados da 0.5.x e da 0.6.x, sem visibilidade duplicada;
   - só as aplicáveis aparecem, e o estado fica legível ("Camadas visíveis: …").
3. **Ver → Comparar:** livre × cristalina, célula × rede, elétrons ocultos × visíveis, antes × depois da propriedade.
   - Cenas A/B derivadas e somente leitura, desenhadas por um renderizador estático que reutiliza geometria, transformações e a camada eletrônica (estática).
   - Lado a lado no desktop; alternância A/B no celular.
4. **Indicador compacto** na linha da cena: estrutura e propriedade em estudo.
5. **Continuidade:** investigação, estrutura, elétrons e propriedade preservados entre módulos, Manual, Professor e reload.
6. **Manual:** tópico operacional provisório "Explorar: observar, camadas e comparar".

## Decisões registradas

1. **Schema científico continua 6** (§18). Foco, camadas de apresentação e último modo de comparação ficam em `exploration.view`, fora do estado científico, com saneamento campo a campo. Ver [`CONTRATO-EXPLORACAO.md`](CONTRATO-EXPLORACAO.md).
2. **Comparação por renderizador derivado**, e não por uma segunda instância da cena. Uma segunda cena duplicaria ids, controles e laços de animação. O renderizador não tem ids nem foco, é descrito por texto (`role="img"`, "A: …"/"B: …") e nunca escreve no estado.
3. **Centros metálicos esmaecidos, não removidos:** as unidades continuam operáveis por teclado e toque.
4. **Camadas e foco não vão para o Histórico** (§24). Ações científicas continuam registradas.
5. **Grupos não são módulos** (§5, §8): Montagem, Ver (Observar, Camadas, Comparar) e Dados.
6. **Correção de origem 0.1.x: link direto para tópico do Manual.** Ao abrir `#/manual/<tópico>` diretamente, a Base mostrava o índice, porque `S.manual.clear()` (na ativação do domínio) zerava o tópico pedido pela rota. O defeito vinha da Base e existia também na 0.7.0. `js/manual/manual.js` passa a renderizar o tópico da rota atual depois do registro. É integração declarada na auditoria, e o item 0.8-17 a verifica.

## Revisão

Corrigido na inspeção das capturas: as esferas das cenas derivadas estavam com o dobro do tamanho (raio × diâmetro), e as da montagem livre, com metade.

## Documentos

- [Módulo Explorar](MODULO-EXPLORAR.md) · [Contrato da exploração](CONTRATO-EXPLORACAO.md)
- [Arquitetura científica](ARQUITETURA-CIENTIFICA.md) · [Roadmap](ROADMAP-SILM.md) · [Estado científico (schema 6, inalterado)](SCIENTIFIC-STATE.md)
- [Relatório de build e testes](RELATORIO-BUILD-TESTES-0.8.0.md) · [Checklist](checklists/CHECKLIST-0.8.0.md)
