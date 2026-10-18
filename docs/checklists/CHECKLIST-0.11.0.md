# Checklist — SILM 0.11.0 (representação 2D científica)

| Item do prompt | Situação | Evidência |
|---|---|---|
| §2–4 Renderizador 2D comum para Explorar, Medir, Calcular e comparação | ✅ | `domain/silm/renderer-2d.js`; item 0.11-01, 0.11-12; auditoria "renderizador comum nas três cenas" |
| §3, §23 `scientificState ≠ representationState`; representationState versionado | ✅ | `domain/silm/representation.js`; itens 0.11-02, 0.11-13; auditoria |
| §5 Coordenadas científicas → cena → palco, com inversa para o toque | ✅ | item 0.11-04 (ida e volta < 10⁻¹², destino a 200 %) |
| §6 Zoom 50 %, 100 % e 200 % com medições idênticas (obrigatório) | ✅ | item 0.11-03 (2,556 Å em todos, também na projeção superior) |
| §7 Pan, zoom, enquadrar, centralizar e restaurar vista | ✅ | itens 0.11-02, 0.11-05 |
| §8 Resize e teclado virtual não movem a estrutura | ✅ | item 0.11-04 |
| §9 Centros com estilo consistente; tamanho visual ≠ raio real | ✅ | texto da cena; contrato |
| §10 Montagem livre: seleção, movimento, assistência e desfazer preservados; toque melhor | ✅ | suíte 0.4.x completa; itens 0.11-04, 0.11-10 |
| §11 CCC, CFC e HC; HC não parece cúbico deformado | ✅ | item 0.11-07 (camada B entre os centros da A na vista superior) |
| §12 Projeções frontal, superior, lateral e isométrica; medidas pela geometria | ✅ | itens 0.11-03, 0.11-07 |
| §13 Rede extensa em janela, sem rede infinita | ✅ | item 0.11-08 (≤ 260 sítios) |
| §14 Vizinhança por halo e contorno, sem barras M—M | ✅ | itens 0.5-128, 0.11-08 |
| §15 Elétrons com zoom, pan, recorte, movimento reduzido e desempenho | ✅ | suíte 0.6.x; item 0.7-149 (centros no mesmo espaço pela câmera) |
| §16 Propriedades sem motor paralelo; contratos da 0.7.x | ✅ | suíte 0.7.x; calor idêntico em todas as projeções (0.11-07) |
| §17 Medir: A/B/C, cota, arco e rótulos de instrumento | ✅ | suíte 0.9.x; item 0.11-09 |
| §18 Calcular: geometria na mesma cena (contato, arestas, a e c no HC) | ✅ | suíte 0.10.x; item 0.11-09 |
| §19 Camadas numa ordem central, sem z-index espalhado | ✅ | item 0.11-01; auditoria |
| §20 Toque central; seleção sobrevive a zoom e pan; área maior no toque; prioridade | ✅ | itens 0.11-06, 0.11-10 |
| §21 Rótulos sem excesso nem colisão; menos rótulos secundários quando não cabem | ✅ | item 0.11-09; `data-labels-fit` |
| §22 Comparação com o mesmo renderizador, sem duplicar o estado inteiro | ✅ | item 0.11-12; cópias só de metal, estrutura, elétrons e propriedades |
| §24 Desempenho e limpeza | ✅ | item 0.11-14; suíte 0.6.x (aba oculta, custo por quadro) |
| §25 Celular: toque seleciona, arrasto desloca, pinça aproxima | ✅ | item 0.11-10 (390 e 320 px) |
| §26 Acessibilidade: descrição da cena, foco, contraste, movimento reduzido, Leitura simples | ✅ | item 0.11-11 (axe sem violações) |
| §27 Regressões 0.2.x–0.10.x | ✅ | suítes s040 a s101 completas |
| §28 Documentação | ✅ | `docs/SILM-0.11.0.md`, `docs/RENDERER-2D.md`, `docs/CONTRATO-REPRESENTACAO-2D.md`; tópico do Manual "Mover a vista" |
| Nenhum dado científico alterado (schema 8); Organizar e calor idênticos à 0.10.1 | ✅ | item 0.11-07; validadores científicos |
| Núcleo = Base Estrutural 0.3.1, sem alteração local | ✅ | auditoria "Núcleo herdado preservado" |
| §29 Regra de parada: não iniciar a 0.12.0 | ✅ | nenhum renderizador 3D |
| Revisão adversarial da 0.11.0: 15 achados confirmados, todos corrigidos | ✅ | itens 0.11-15 a 0.11-22 (foco sem rolagem, pinça sobre unidade, deslocar a partir da unidade, elétrons estáveis na rede, fontes de calor em toda projeção, toque e clique perto, animação do Organizar, Histórico, gravação no `pagehide`, botão Vista em 320 px, barra no tablet, descrição da montagem livre); item 0.11-01 (zoom fora da região viva) |
