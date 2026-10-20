# Contrato de Missões

O registro domain/silm/missions.js declara ID, versão, título, subtítulo, conceito, descrição, módulo único, objetivos, metais elegíveis, ferramentas, estado inicial, critério, temas relacionados e fontes. A validação estrutural é compartilhada com Roteiros e a validação de referências é cruzada com Temas.

SILM.activities reúne Missões e Roteiros. createRouteSession é mantido como API compatível da 0.13, agora com type=mission|route. Não existe outro estado químico, renderizador ou calculador. O documento route.session mantém compatibilidade com sessões da 0.13 e usa uma lista explícita de campos persistidos.

A missão de montagem pode editar a estrutura mantendo metal e módulo fixos. As demais ferramentas seguem o contrato allowedTools. Critérios observam estado e registros válidos, não tempo, cliques ou abertura de painéis. Somente uma atividade restrita pode estar aberta. completed continua diferente de closed. O estado livre e a câmera são restaurados ao encerrar.

O fator de empacotamento usa as fórmulas centrais e dependências de cálculos; não há constantes numéricas introduzidas pelo catálogo. Registros antigos não concluem uma nova tentativa. Campos de recompensa desconhecidos não são mantidos ao restaurar uma sessão válida.
