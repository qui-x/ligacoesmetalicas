# SILM 0.13.0 — Roteiros Experimentais

Origem: SILM 0.12.3, commit 926ce21d2d9489bf569dd97848df7c2f4a1b8018, consolidação da série 0.12.x. SHA-512 real do manifesto SHA512SUMS.txt dessa origem: `239a36e1e2ef88da98e788b591ffd8e9e49de23719005dd1a7cf200d20cc240e9afb0504c0e44aa4fe29bc5c26a69b33158734eb208443e82ad734d5b0d20dfc`. Este hash identifica o manifesto versionado, não um ZIP inexistente.

A Base SI foi conferida e atualizada para 0.9.13, commit 463e242c21c451036644c9c79999cd20ffe8aa3c. O snapshot upstream permanece íntegro e verificado por base-lock.json.

Cinco roteiros compartilham o estado científico, as coordenadas, os renderizadores e os serviços de propriedades, medição e cálculo existentes. Cada roteiro usa um único módulo. A sessão orientada guarda a investigação livre e a restaura ao encerrar. Concluir não encerra a atividade. O catálogo guarda o marcador Concluído por ID e versão, permitindo refazer.

As portas exportadas de contexto guiado, menu e módulo da Base são adaptadas ao contexto científico do SILM. Não é inicializada a cena genérica da demonstração. A orientação ocupa a aba Roteiro do painel Montagem, incluindo o sheet móvel da Base.

Foi corrigida uma colisão de data-view: o roteador do produto opera apenas sobre páginas filhas de #conteudo e não oculta a cena cristalina ao trocar de página.

O relatório contextual apresenta dados reais, condições, fontes, medidas e cálculos com origens, nome/data editáveis e espaços para observação, interpretação e conclusão. Não inclui respostas-modelo. Impressão e leitura digital compartilham os mesmos dados.

Validação: catálogo e rejeições, cobertura dos 43 metais elegíveis, isolamento e retomada de sessões, estados active/completed/closed, cinco percursos reais nos três módulos, relatório/print, mobile 320/360/390 px, funcionamento offline e regressão do laboratório 2D/3D. Testes de navegador executados em Chromium; Safari/Firefox e dispositivos físicos não homologados nesta rodada.

A sequência para nesta versão. 0.14.0 (Missões e Aprender) não foi iniciada.
