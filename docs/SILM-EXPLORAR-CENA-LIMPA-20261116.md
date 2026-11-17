# SILM — Explorar com a cena como prioridade (16/11/2026)

## Decisão de experiência

Adotar a concepção do SIAB: preparar em **Montagem**, escolher o fenômeno em **Ver**, manipular a amostra/instrumento **na cena**, consultar as condições e registros em **Dados**. Explorar continua qualitativo quando o motor é normalizado; Medir e Calcular conservam suas responsabilidades independentes.

**Regra:** um estímulo tem um controle primário contextual. A cena não exibe permanentemente outros seletors, leituras, mapas, sliders ou grupos de botões. O material e a deformação são o foco.

### Aplicações da primeira remodelação

1. **Sala 3D:** instrumento selecionável na própria cena é o caminho principal. Comandos de teclado/alternativa sem toque ficam em **Ações alternativas**, fechado por padrão. Instrumentos e ações existentes preservam APIs, IDs de teste e sequência científica.
2. **Leituras:** mapa mecânico e balanço Joule/eletrotérmico se recolhem sob **Leituras da amostra**, mantendo o valor e a proveniência relativa; não são resultados medidos por metal.
3. **Exclusão mútua:** ao abrir painel de instrumento, fecha ações alternativas e leituras; ao abrir um painel opcional, fecha o anterior sem perder o estado da amostra.
4. **Celular:** manter comandos de deslocamento à esquerda; painel contextual do instrumento à direita, limitado na altura, sem obstruir toda a amostra. Resumos dos detalhes com alvo mínimo de 44 px; foco e contraste.
5. **Microestrutura:** o estado mecânico principal é legível em uma linha curta. Parâmetros técnicos e leitura constitutiva continuam em **Ajustes e leituras do ensaio**. Botões e alças existentes permanecem intactos para acessibilidade e compatibilidade.
6. **Ver:** **Combinar propriedades** aparece no desktop e no toque; Ctrl é atalho opcional. Pares não homologados continuam indisponíveis. Não se habilitam novos acoplamentos físicos.

### Intencionalmente preservado

- Os quatro níveis Objeto → Grãos → Rede → Centro e as transições de escala.
- Estado científico, motor J2 e FEM normalizado, campo eletrotérmico 1D, sombras, mapas, materiais e dados documentais do elemento.
- IDs de controle e caminhos de teste do 3D; acesso por click/touch, teclado E/Escape, sliders, redução de movimento e fallback sem WebGL.
- **Retirar carga** difere de **reiniciar ensaio**: o primeiro descarrega, o segundo reinicia a deformação didática quando oferecido.
- A pesquisa da Etapa 117 continua **documental**; esta mudança não calibra propriedades físicas por metal.

### Aceitação

- Na abertura da sala 3D, confirmar `details.open=false` em mapas e ações alternativas; fotografia da amostra sem encobrimento técnico.
- Ao selecionar prensa, aquecedor, fonte, luminária ou microscópio, o painel anterior recolhe. Acesso por mouse, touch e teclado.
- Em 320, 390, 768 e 1440 px, confirmar que botões, legendas e painel contextual não extravasam o palco e que a amostra permanece inspecionável.
- Aumentar/diminuir carga e alternar modo no 3D continua chamando o mesmo J2; teclas e alças de microestrutura não alteram o estado científico fora de Explorar.
- Abertura de leituras não afeta dados numéricos, convergência ou fontes; fechar painel não reseta experimento.
- Mudar de escala mantém os resultados permitidos; luz e sombra são representações conforme limitações do motor.

### Fora deste lote

- Substituição de todos os gestos da rede e do centro metálico; requer homologação separada dos acoplamentos.
- Migração definitiva de J2 e fontes visuais relativas para grandezas com unidades físicas; depende da pesquisa e calibração.
- Estudo de gestos em dispositivos físicos reais, que demanda validação posterior mesmo após regressões de browser.

## Verificações

`node --test tests/explore-scene-clean-contract.test.cjs`

Testes de navegador existentes em `tests/run-silm-lab3d-browser.mjs`, `tests/run-silm-lab3d-touch.mjs`, `tests/run-workshop-micro-main.mjs` e suítes de paridade dos painéis.
