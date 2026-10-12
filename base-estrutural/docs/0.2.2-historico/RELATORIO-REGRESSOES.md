# Regressões e preservações — Base 0.2.2

Os 16 grupos da suite de regressão passaram nesta rodada em Chromium. A implementação conserva o roteador, os motores de atividades, módulos, Manual, relatórios, referências, storage, acessibilidade e modal da 0.2.1. Não há segundo roteador, sistema de painéis/mobile ou armazenamento paralelo.

| Arquivo preservado | Comparação de bytes |
|---|---|
| `js/navigation/router.js` | Idêntico à 0.2.1 |
| `js/experience/activity.js` | Idêntico à 0.2.1 |
| `js/experience/modules.js` | Idêntico à 0.2.1 |
| `js/experience/reports.js` | Idêntico à 0.2.1 |
| `js/experience/references.js` | Idêntico à 0.2.1 |
| `js/manual/manual.js` | Idêntico à 0.2.1 |
| `js/manual/registry.js` | Idêntico à 0.2.1 |
| `js/storage/storage.js` | Idêntico à 0.2.1 |
| `js/storage/migration.js` | Idêntico à 0.2.1 |
| `js/a11y/preferencias.js` | Idêntico à 0.2.1 |
| `js/components/modal.js` | Idêntico à 0.2.1 |

Mudanças de integração: `experience.js` compõe Temas/Caderno, projeta a hierarquia Home e evita que Escape da gaveta acione o retorno da atividade abaixo dela. `teacher.js` acrescenta somente o controle estrutural do Projetor. `domain.js` expõe Temas/Caderno e a fachada do shell protegida pelo contexto. `workspace.js` integra a inércia da bottom nav/banner aos sheets existentes. `responsive/layout.js` mede alturas por um observador compartilhado, com inicialização única.

Correções confirmadas durante a revisão:

- A seção Atividade não aparece na investigação livre.
- Agora preserva a rota e o parâmetro; Temas, Roteiros e Missões identificam o contexto selecionado.
- Mudanças de atividade atualizam os links permitidos; destinos bloqueados ficam semanticamente claros e não navegam.
- A gaveta abre à esquerda e reinicia sua rolagem ao abrir; atualizações em uma gaveta aberta preservam a posição.
- Fechamento/reabertura não deixa `aria-expanded` ou scroll-lock incorretos por evento `close` pendente.
- Temas oferecem investigação relacionada e IDs distintos para múltiplos links; marcar revisão mantém o foco.
- Caderno admite rota própria e encerra o render local; um domínio sem Caderno não registra essa tela.
- A bottom nav entra no cálculo do workspace; os launchers permanecem acessíveis em paisagem curta e sheets mantêm a navegação inerte.
- O Manual da Demo e os exemplos de domínio descrevem a API real; `experience.ready()` é chamado pelo core, sem chamada pelo `mount`.

Os dois ensaios de 20 ciclos terminam com `scopes:0` e `resources:0`. O ensaio herdado verifica ainda zero telas de domínio, modais transitórios, estilos Demo, overlays ou controles Demo. O ensaio de shell verifica zero listeners acrescentados às raízes persistentes após unload. Não se afirma medição de heap.

As pastas originais e ZIPs de Base 0.2.0, Base 0.2.1, SIAB congelado e SILM foram comparados com as entradas congeladas e permaneceram intactos. A nova distribuição guarda evidências antigas em `0.2.1-historico`; elas estão separadas das evidências atuais.
