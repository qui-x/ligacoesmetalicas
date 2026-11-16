# SILM — Etapa 87: instrumentos interativos no laboratório 3D

**Status:** protótipo em PR #181, dependente de #179 (sala) e #180 (ponte mecânica). Não integrado na `main`; não altera o CPFEM da #172.

## Experiência

Na sala navegável, um clique diretamente sobre a projeção 3D de um equipamento abre seus controles contextuais. O mesmo instrumento pode ser escolhido apontando o retículo e pressionando **E**. Quando o clique não corresponde a equipamento, o usuário continua podendo navegar com o mouse. Esc fecha o painel do instrumento; um novo Esc fecha a sala.

- **Prensa:** escolha entre compressão e tração, intensidade de carga relativa de 0 a 1 em passos de 0,1 e retirada da carga. A troca de modo obriga a recalcular o campo convergido com `SILM.specimenJ2.active` mesmo quando o valor de carga permanece o mesmo. Somente o campo J2 convergido substitui o anterior.
- **Aquecedor:** fonte externa do modelo `SILM.electrothermal`; sem corrente, a potência Joule permanece nula.
- **Fonte elétrica:** alimentação relativa de 5% a 100% em passos de 5%; a mudança alimenta o mesmo resolvedor que computa corrente, potência Joule e calor.
- **Luminária:** liga/desliga a luz local do shader WebGL.
- **Microscópio:** permite entrar na microestrutura existente e depois voltar à sala com câmera, carga, controles e histórico numérico transitório preservados.

Não são criados comandos redundantes em Montagem, Ver e Dados. Os controles do próprio instrumento pertencem somente ao protótipo 3D. O conteúdo do painel é texto sem injeção HTML, com botões e controles nativos para teclado e leitores de tela.

## Melhorias dos modelos

`lab3d-geometry.js` define modelos 3D procedurais originais — superfícies triangulares de cilindros e toros com normais geométricas — para fuso, volante e cabeçote da prensa, ocular do microscópio, comandos do aquecedor e bornes da fonte elétrica. A malha J2 deformável continua separada e unchanged; o renderer usa transformações de escala com correção de normais para escalas não uniformes.

A representação é de **fidelidade intermediária**. Não há ativos GLB, animação mecânica baseada em colisões entre componentes, iluminação espectral/PBR material-específica, traçado de sombras reais, modelo de prensa calibrado ou instrumento físico certificado. Toda a experiência é uma prévia didática.

## Interação no espaço

O módulo `lab3d-instruments.js` calcula a direção do raio de clique pela câmera, tamanho do canvas e campo de visão utilizado pelo renderer. A seleção identifica a primeira esfera de alcance do equipamento no raio, com distância máxima limitada a 4,6 unidades de sala. O botão E utiliza o raio central e o mesmo cadastro de instrumentos. A seleção de hotspots não mede contato físico entre corpos.

Os testes incluem posição projetada dos cinco instrumentos, prevenção de seleção atrás da câmera, ordem por profundidade, normais e triângulos finitos. Playwright verifica clique direto, controle J2 por carga e modo, ligar/desligar aquecedor, alimentação elétrica, tecla E e Escape, continuidade de intensidade pela passagem ao microscópio, além da invariância do estado científico.

## Critérios de avanço

- Homologar a interação 3D em desktop e toque em aparelhos reais.
- Testar disponibilidade efetiva de WebGL em Firefox com aceleração; o runner CI ainda executa o fallback.
- Substituir gradualmente os modelos básicos por modelos autorais GLB/PBR com materiais e proporções revisados.
- Validar fonte, condição e unidades de cada dado material **antes de aplicar coeficientes dimensionais a qualquer elemento**; nunca assumir CNTP como condição padrão ou transferir dados de um metal para outro.
- Só considerar merge após revisar o fluxo Montagem/Ver/Dados, a reconciliação das branches e os portões de validação.

A versão experimental não pretende representar plasticidade finita, estricção ou ruptura.
