# SILM 0.12.3 — Consolidação da integração

## Arquitetura

A Base SI foi atualizada da 0.9.8 para a 0.9.12, commit 76ef30bd9cb187bfeb98a66134e24322ec09cb74. Os arquivos upstream são copiados sem modificações e conferidos por SHA-256. base-core.js é gerado sem inicializar a cena de demonstração. index.html é gerado da entrada de produto.

O estado científico continua único, schema 8, implementado em domain/silm/state.js. O adaptador conecta componentes do SILM ao shell da Base. metallic-experience.js liga controles de propriedades e tabela periódica; scientific-tools.js liga Medir e Calcular. Nenhuma fórmula ou propriedade física foi duplicada na plataforma.

## Comportamento

- Cinco experiências originais: campo elétrico, propagação térmica, compressão, alongamento e reflexão qualitativa. Estado-base, restauração, elegibilidade e limites vêm dos serviços originais.
- Os sítios científicos são preservados pelas transformações visuais. Medidas de referência ficam indisponíveis enquanto há deformação.
- Tabela periódica original com 118 elementos, busca, teclado, fontes e elegibilidade. Escolha de outro metal conserva a confirmação de substituição da investigação.
- Controle do movimento eletrônico; movimento reduzido permanece respeitado.
- Dados do metal: massa molar, configuração eletrônica, convenção de valência, parâmetros cristalográficos, condições e fontes legíveis. Ausências de dados são explícitas. Nenhum valor típico foi acrescentado.
- Cópia de sessão antiga válida apenas se o novo armazenamento está vazio; original e sessões novas existentes são preservados.

## Cores

O arquivo silm-theme.css reúne a identidade ouro/grafite e os tokens científicos. Ele adapta claro/escuro da Base para os elétrons, calor, luz e medições, preservando o alto contraste e as cores forçadas do sistema. As regras conflitantes foram removidas do CSS de layout. Filtros de simulação de visão de cores usam os SVGs locais da Base.

## Limites

Relatórios, abertura animada e atividades anteriores permanecem na interface anterior até migração específica. Não foram ativados presets nem atividades genéricas da demonstração sobre o motor científico. Esta versão não inicia os roteiros 0.13.0. Validação de dispositivos físicos e outros motores de navegador continua pendente.

## Verificação

Suíte de integração em Chromium: montagem, Desfazer, cristais CFC/CCC/HC, câmeras 2D/3D, medições, cálculos, origens, JSON e persistência. Casos adicionais cobrem as cinco propriedades sem modificar sítios, restauração, cores claro/escuro, alto contraste, tabela periódica e cópia da sessão antiga. Painéis responsivos verificados em 320, 390, 768 e 1440 px.
