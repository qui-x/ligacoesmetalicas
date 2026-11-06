# Contrato visual — ferramentas científicas inferiores (SILM)

Atualização: 05/11/2026 · Escopo: opção B (normalizar botões técnicos). Não modifica motores científicos, os manipuladores de clique nem a biblioteca global de ícones.

## Diagnóstico
\`domain/silm/assembly.css\` estabelece botões da câmera em 44 × 44 px, mas \`integracao/workspace-family.css\` os reduzia para 32, 30 e 28 px em media queries posteriores. No modo expandido (\`body.si-structure-expanded\`), o botão da rede/célula entra no mesmo conjunto e também sofre compressão. Isso causa tamanhos divergentes e desalinhamento na faixa inferior.

## Contrato aplicado
- Uma faixa inferior de **60 px** de altura, com **controles instrumentais de 44 × 44 px**; rolagem horizontal quando necessário, sem encolhimento dos botões.
- Os controles da câmera, criação rápida, navegação da rede (±a/±b/±c) e expandir/recolher compartilham alinhamento e área clicável. Seletor de projeção, leitura de zoom, vizinhos, rótulos e Mais conservam largura adequada ao conteúdo.
- Estados \`aria-pressed\` e \`aria-disabled\` não alteram o tamanho do controle. Ações ativas usam borda e fundo, com contraste, foco visível e cores derivadas dos temas.
- Ao expandir/recolher a rede, os controles permanecem na faixa inferior com o mesmo tamanho. Nenhuma alteração na organização cristalográfica, em seleção atômica ou nos mecanismos de navegação.
- Critérios verificáveis: 44 px de largura/altura, alinhamento de centros, faixa 60 px, estado expandido, preservação do snapshot e rolagem móvel.

## Fora do escopo
Revisão semântica de ícones já existentes, troca de glifos, reordenação das ferramentas ou exclusão automática da biblioteca global de ícones são intervenções separadas.
