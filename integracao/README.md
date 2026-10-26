# Interface integrada do SILM

A fonte da entrada é integracao/index.html; scripts/build-main-entry.cjs gera index.html com os caminhos da raiz. As duas URLs exibem o mesmo produto e usam a mesma persistência. completo.html encaminha à raiz e não carrega o shell antigo.

A Base SI 0.9.17 permanece íntegra em upstream, com hashes em base-lock.json. O boot da demonstração é substituído pelo adaptador científico. Home, painéis, preferências, caderno e componentes visuais são aproveitados da base; montagem, cristais, elétrons, propriedades, medidas e fórmulas vêm do domínio SILM.

Na 0.15.2, `workspace-family.js` registra as ferramentas científicas na API de visualizadores da Base e organiza Montagem → Módulo, Ver → família/ferramenta e Dados → consulta/documentos. Seus estilos usam a geometria responsiva e os tokens existentes. `npm run build:integration` também regenera o service worker para incluir os recursos da interface.

O [mapa de paridade](../docs/PARIDADE-BASE-SI-0.15.2.md) distingue os fluxos verificados das integrações restantes, incluindo Professor, histórico da sessão e conflitos nos documentos científicos próprios.

Missões e Roteiros compartilham createRouteSession; Temas não possuem outro laboratório. unified-ui.js reúne os conteúdos operacionais e os hubs na navegação da base. Os relatórios usam o mesmo componente com registros reais. A paleta e os tokens científicos estão em silm-theme.css.


O Caderno integrado usa `createJournalStore` e `journal-document-v1` da Base SI 0.9.17. A interface oferece tipos de registro, filtro, exclusão, importação validada, JSON, CSV e impressão. O registro científico pode identificar o metal ativo; a vinculação por tentativa aos relatórios permanece planejada para a 0.15.x.
