# SILM — Base SI 0.9.13 integrada

A entrada principal utiliza os serviços científicos originais do SILM para montagem, cristais 2D/3D, elétrons, cinco propriedades, Medir e Calcular. A tabela periódica original conserva os 118 elementos e a elegibilidade dos 43 metais. Dados apresenta referências e fontes.

A paleta e os tokens científicos são adaptados em silm-theme.css, com temas claro/escuro e alto contraste. O upstream permanece íntegro e fixado em base-lock.json; o gerador remove apenas o boot da demonstração.

Uma sessão válida da interface anterior é copiada apenas quando a nova não possui sessão salva. O original é preservado. Exportação e importação JSON permanecem disponíveis. Relatórios e atividades anteriores ainda não migrados estão em ../completo.html.

Versão 0.13.0. Consulte ../docs/SILM-0.12.3.md.

Roteiros oficiais em domain/silm/routes.js usam um único módulo e o estado científico do laboratório. O adaptador reutiliza as portas de contexto e os painéis da Base, sem iniciar as atividades genéricas de demonstração. Relatórios contextuais têm campos editáveis e impressão equivalente.
