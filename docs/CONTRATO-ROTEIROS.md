# Contrato dos roteiros SILM

O registro em domain/silm/routes.js declara ID, versão, título, subtítulo, módulo único, descrição, objetivos, pré-requisitos, metais elegíveis, requisito estrutural, ferramentas, estado inicial, orientações, critério, campos de relatório e fontes. O validador rejeita IDs duplicados, módulos múltiplos/secundários, ferramentas inexistentes ou incompatíveis, critérios desconhecidos, fontes ausentes e metais inelegíveis.

A sessão em domain/silm/route-session.js usa o mesmo createScientificState; não possui outro motor, renderizador ou serviço de cálculo. Os snapshots servem para persistência e restauração. O documento route.session guarda o contexto e checkpoints validados pelo schema científico 8. A investigação livre e a câmera são restauradas ao encerrar. Dados incompatíveis não são substituídos silenciosamente.

activityContext possui type=route, id, version e status=active|completed|closed. completed mantém ferramentas de revisão, relatório e bancada. Somente encerramento explícito restaura a navegação normal. A conclusão é derivada de evidências observadas e registros válidos da tentativa corrente, não de tempo, pontuação ou cliques.

As portas guidedActivityContext, menuActivity, menuActivityProgress, advanceActivityFromMenu, clearGuidedReturn e endGuidedActivity da Base são adaptadas ao contexto científico. Assim, menu, painel contextual e módulo trabalham sobre a mesma sessão sem inicializar atividades genéricas. Links #/roteiros?item=ID são validados pelo catálogo e usam a mesma sessão; não criam outro engine. A Área do Professor completa fica para a etapa própria.

Observações têm limite de 10.000 caracteres por campo e são inseridas como texto, sem interpretar HTML. Relatórios mostram o checkpoint real da atividade com referências e origens. Registros de tentativas anteriores não são usados para habilitar conclusão de novas tentativas. Só uma atividade restrita pode permanecer aberta.
