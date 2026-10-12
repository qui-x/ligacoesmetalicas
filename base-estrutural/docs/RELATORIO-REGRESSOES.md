# Regressões e preservações — Base 0.2.4

**52 grupos aprovados**, em cinco suítes completas sem filtro. **48 análises axe, zero violações detectadas**. 56 contextos com diagnóstico de console/HTTP sem erros críticos ou respostas de falha.

| Área | Verificação |
|---|---|
| Navegação e histórico | Percursos por links, estado ativo, hashes, voltar/avançar e foco |
| Drawer | Hierarquia, disclosure Navegar, animação, reduced motion, Escape, backdrop e foco |
| Acessibilidade | Motor único, controles do header/gaveta/modal, fonte 150%, contraste, temas e cores forçadas |
| Atividade | Livre, restrita, conclusão, retomada, refazer e encerramento |
| Conteúdo | Aprender/Temas, Manual, Professor, Sobre e referências |
| Relatórios | Captura de dados, edição, histórico e impressão |
| Caderno e recursos | Contratos opcionais, visibilidade, hooks e remoção no unload |
| Modo Projetor | Preferência compartilhada e acesso do Professor |
| Mobile | Viewports de 320 px a desktop, retrato/paisagem, banner, viewport e bottom nav |
| PWA | Atualização, escopo, cache alheio e recargas offline |
| Storage | Persistência, retomada e contingência em memória |
| Lifecycle | Repetição de ciclos e ausência de escopos/diálogos/listeners residuais monitorados |

Os 51 arquivos de runtime da rodada final foram comparados por SHA-512 antes e depois dos testes. Todos os arquivos de origem monitorados permaneceram idênticos; a Base 0.2.3, a referência SIAB(9).zip e o SILM não foram alterados. Nenhum arquivo CSS foi modificado em relação à origem executável.

As quatro mudanças deliberadas estão em BASE-ESTRUTURAL-0.2.4.md. Limitações de ambiente e diferenças não impeditivas estão em LIMITACOES-CONHECIDAS.md e DIFERENCAS-RESIDUAIS.md.
