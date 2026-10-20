# Auditoria semântica de gamificação — 0.14.0

Escopo: código de produto, modelos persistidos, interface, estilos, documentação e testes, incluindo o frontend anteriormente servido em completo.html. A entrada antiga agora redireciona para o mesmo aplicativo. Não foi encontrado um sistema ativo de pontuação/recompensa no SILM anterior; a etapa impede sua reintrodução e trata campos antigos isolados. Não há conceito ativo de Trilhas nem liberação sequencial de temas.

| Ocorrência pesquisada | Classificação e tratamento |
|---|---|
| score no índice do manual | Relevância técnica de busca; preservada |
| points nas medidas, SVG e geometria | Pontos/cartesianos/vértices; preservados |
| level/levels em calor ou nível de apresentação | Propagação térmica ou estado de interface; preservados |
| badge/status-badge/element-badge | Disponibilidade do elemento ou estado técnico, sem recompensa; preservados |
| record/readings e registros | Dados científicos/documentação; preservados |
| progress 0/1 na porta da Base | Compatibilidade do critério ativo/concluído; não é pontuação nem percentual de aprendizagem |
| XP, rank, streak, medal e progressPercent | Não utilizados como dados de produto |

A migração remove apenas chaves isoladas de recompensa nos namespaces reconhecidos do SILM: score, points, xp, level, rank, streak, medals, badges e progressPercent. Ela não varre outros aplicativos nem remove campos científicos de coordenadas. Sessões válidas são restauradas com lista explícita de campos, descartando metadados extras de recompensa; documentos científicos incompatíveis continuam preservados e não são reescritos silenciosamente.

Aprender persiste exclusivamente ID/versão de temas concluídos. Atividades persistem ID/versão, contexto, status e snapshots científicos necessários à retomada. Os testes semeiam recompensas antigas e verificam sua ausência, a preservação da investigação e a permanência do marcador Concluído ao refazer. Documentos históricos que negam gamificação permanecem como histórico, sem criar um recurso ativo.
