# Diferenças residuais — Base 0.2.4

Os quatro desvios funcionais desta rodada foram resolvidos. Permanecem adaptações próprias da Base universal:

| Item | Diferença preservada | Efeito |
|---|---|---|
| Animação da gaveta | Base 250 ms/ease-out; referência 260 ms/cubic-bezier | Sem impedimento funcional; redução de movimento preservada |
| Conteúdo e identidade | A Base contém uma Demo neutra | O domínio fornece conteúdo, identidade e dados |
| Preferências | Conjunto de acessibilidade já existente na Base | Recursos de produto adicionais da referência não são obrigatórios no core |
| Inicialização | A confirmação usa Salvar no componente estrutural existente | Atende ao fluxo solicitado e preserva uma única preferência |
| Caderno e tour | Integrações opcionais; tour permanece somente hook | O domínio define seu conteúdo |
| Modal a 320 px e fonte 150% | Título e rótulo Fechar podem quebrar em mais linhas; há rolagem vertical até as ações | Controles operáveis por teclado/toque, verificados; preservado conforme a regra de não refazer estética |
| Roteiro sem validate | Sem conclusão formal | Conserva continuidade e encerramento; domínio pode fornecer validate quando necessário |

Essas diferenças não exigem outra rodada estrutural para iniciar o trabalho de domínio. Os limites de homologação por motor/dispositivo estão em LIMITACOES-CONHECIDAS.md. Nenhum refinamento estético adicional foi introduzido.
