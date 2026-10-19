# Checklist — SILM 0.12.0 (representação 3D científica)

| Item do prompt | Situação | Evidência |
|---|---|---|
| §2 Um estado científico, uma estrutura, várias representações | ✅ | `SILM.crystal.layout3D` sobre `SILM.crystal.geometry` (Å); itens 0.12-01, 0.12-04; auditoria "Representação 3D" |
| §3 Renderizador 3D comum (Explorar, Medir, Calcular, comparação) | ✅ | renderizador comum da 0.11.x com câmera de órbita; vista cristalina e `renderSnapshot`; itens 0.12-04, 0.12-12 |
| §4 Tecnologia: precisão, manutenção, desempenho, compatibilidade, ciclo de vida, volta ao 2D; sem motor pesado | ✅ | sem WebGL nem dependência nova; decisão 1 em `docs/SILM-0.12.0.md` |
| §5 Coordenadas científicas → cena 3D → câmera → projeção → tela; nunca a partir de pixels | ✅ | `docs/RENDERER-3D.md`; item 0.12-02 |
| §6 representationState: `viewMode` e `camera3D` (alvo, posição, zoom, projeção, orientação); câmera fora do estado científico | ✅ | `domain/silm/representation.js` (versão 2, migração da 1); item 0.12-11 |
| §7 Controle 2D ↔ 3D sem mudar metal, estrutura, elétrons, propriedade, medições e cálculos; seleção preservada | ✅ | seletor Projeção (grupos 2D e 3D) e Ver → Observar → Camadas; item 0.12-01 |
| §8 Órbita, pan, zoom, enquadrar, restaurar, alvo coerente; perspectiva e ortográfica; XY, XZ, YZ e 3D | ✅ | itens 0.12-02, 0.12-03 |
| §9 CCC, CFC e HC em 3D (vértices, centro do corpo, centros das faces, hexágono e empilhamento); sem barras M—M | ✅ | item 0.12-02 |
| §10 Célula em contorno tracejado, distinta de ligação | ✅ | arestas `.silm-cell-edges`; auditoria (uma só origem de linha na vista) |
| §11 Rede extensa 3D finita e adaptativa | ✅ | item 0.12-13 (≤ 260 sítios, também afastando) |
| §12 Raio visual esquemático, declarado | ✅ | texto da cena "esferas reduzidas, sem escala física absoluta"; Manual "Ver a estrutura em 3D" |
| §13 Oclusão: órbita, transparência controlada (Camadas → Centros), seleção por cima | ✅ | contrato 3D, "Projeções" |
| §14 Toque e seleção centrais; o mesmo objeto científico do 2D | ✅ | itens 0.12-01, 0.12-09 |
| §15 Vizinhança em 3D com a mesma coordenação do 2D, sem ligações | ✅ | item 0.12-12 (12 no CFC) |
| §16 Elétrons coletivos, sem órbitas nem duplicação; estáticos com movimento reduzido | ✅ | item 0.12-05 |
| §17 Propriedades integradas; iluminação não é modelo de brilho | ✅ | item 0.12-06; contrato 3D, regra 4 |
| §18 Medir em 3D com `measurements[]`; distância e ângulo 2D = 3D | ✅ | item 0.12-04 |
| §19 Calcular em 3D com resultados idênticos | ✅ | item 0.12-04 (raio a partir de a no CFC, d = 2r destacado) |
| §20 Sincronização 2D/3D (sem sincronizar câmera) | ✅ | contrato 3D, tabela "Compartilhado" |
| §21 Camadas do sistema geral reutilizadas | ✅ | as mesmas camadas da 0.11.x |
| §22 Eixos como referência visual, sem grade confundível com a rede | ✅ | item 0.12-13 |
| §23 Celular: um dedo gira, dois dedos deslocam e aproximam, toque seleciona; controles alternativos | ✅ | item 0.12-09 (390 px, alvos de 44 px) |
| §24 Acessibilidade: descrição, seleção, vizinhança, câmera por teclado e controles, foco, movimento reduzido, contraste, visão de cores; sem centenas de centros no tab order | ✅ | item 0.12-10 (axe sem violações, uma unidade no tab order) |
| §25 Volta ao 2D se o 3D falhar | ✅ | item 0.12-07 |
| §26 Desempenho e ciclo de vida | ✅ | item 0.12-08 |
| §27 Testes, incluindo regressões 0.2.x–0.11.x | ✅ | suítes s040 a s120 completas no Chromium; Gecko e WebKit não estão instalados neste ambiente (pendência registrada para a 0.16.x) |
| §28 Documentação | ✅ | `docs/SILM-0.12.0.md`, `docs/RENDERER-3D.md`, `docs/CONTRATO-REPRESENTACAO-3D.md`; tópico do Manual "Ver a estrutura em 3D" |
| Nenhum dado científico alterado (schema 8); núcleo = Base Estrutural 0.3.1 | ✅ | auditoria "Núcleo herdado preservado" |
| §29 Regra de parada: não iniciar a 0.13.0 | ✅ | Roteiros continuam os da 0.10.1 |
