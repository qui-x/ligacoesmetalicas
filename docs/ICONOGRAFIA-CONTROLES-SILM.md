# Padrão de iconografia e inventário de ações — SILM

Escopo: Oficina, menu, Visão geral, Tabela Periódica, microestrutura, Manual, missões, roteiros, Caderno, instrumentos científicos e ferramentas do professor.

## Decisão funcional
A biblioteca SVG de \`integracao/action-icons.js\` mapeia IDs estáveis e verbos de ações dinâmicas, sem substituir listeners ou depender de CDN. A folha \`integracao/action-icons.css\` acompanha os tokens de tema e acessibilidade.

**Só ícone**, com rótulo em \`aria-label\` e tooltip: fechar, voltar em controles compactos, desfazer, próximo/voltar do tour, alternar lista/grade, zoom e ajuste, expandir, pesquisa e renomear. No modo Leitura simples, o texto é mostrado.

**Ícone + texto**: iniciar, continuar, salvar, abrir em Foco, montar, calcular, copiar, importar/exportar, imprimir, ver relatórios, orientar/ajudar e operações de laboratório.

**Texto obrigatório mesmo com ícone**: excluir, remover, apagar, encerrar atividade, limpar estrutura e confirmações destrutivas. Ação irreversível nunca depende apenas de um pictograma.

**Não duplicar**: botões que já têm SVG, navegação de rede, Tabela Periódica, tabs, seletor de escala e controles de manipulação com símbolo incorporado.

## Inventário de módulos conferidos
- \`index.html\`: botões com IDs de menu, gavetas, Montagem, visualização, Dados, diálogo, tour e tabela.
- \`integracao/base-core.js\`: botões de navegação e tour criados depois do carregamento.
- \`integracao/structure-comparison.js\`: lista/grade, estrutura em foco, edição e remoção.
- \`domain/silm/workshop.js\` e \`microstructure-view.js\`: navegação de escalas, zoom e objeto de referência.
- \`domain/silm/periodic-table.js\`: explorar, investigar, limpar e fontes.
- \`integracao/scientific-tools.js\` e \`domain/silm/property-view.js\`: cálculo, propriedades, medições.
- \`integracao/route-ui.js\`, \`integracao/unified-ui.js\`, \`integracao/teacher-ui.js\`: atividades, Caderno, Manual, relatórios e ferramentas do professor.

O inventário dinâmico está disponível em \`SILMActionIcons.audit()\`: total de botões, padronizados, com SVG nativo e ainda textuais. Ícones não representam mudanças de motores científicos.

## Aceite
Teclado e foco preservados; nomes acessíveis inclusive ao trocar “Próximo” → “Concluir” e “Ver em lista” → “Ver em grade”; alvos de 44 px; temas claro/escuro, alto contraste, daltonismo e Leitura simples; nenhuma regressão de páginas e ações originais.
