# Contratos — Base Estrutural 0.2.3

O ponto de extensão é `SimCore.registerDomain(module | null): Promise<context | null>`. Scripts são clássicos e `SimCore` é o namespace global. Os objetos de registro são código confiável do domínio; o core valida tipos e IDs, mas não interpreta conteúdo de produto.

## Manifesto e lifecycle

O manifesto exige `id`, `nome`, `nomeCurto`, `versao`, `titulo` e `subtitulo`. `icone`, `tema`, `viewport`, `painelEsquerdo`, `painelDireito`, `acoesSuperiores`, `manual` e `recursos` são opcionais. Recursos PWA devem ser URLs locais same-origin dentro do escopo.

Hooks opcionais: `init(ctx)`, `mount(ctx)`, `activate(ctx)`, `resize(size,ctx)`, `reset(ctx)`, `deactivate(ctx)` e `destroy(ctx)`. A ordem é destruir anterior, criar escopo/contexto, identidade/tema, `init`, `mount`, painéis/Manual/ações, `activate`, resize inicial e `experience.ready()` chamado pelo core. O unload encerra serviços da experiência e o escopo antes de `deactivate`/`destroy`, depois limpa identidade e host. Registro, reset e unload são serializados; não aguarde reentrada nessa fila dentro de um hook.

## Contexto

`ctx` expõe `manifest`, `scope`, `storage`, `viewport`, `panels`, `setContext/getContext`, `accessibility`, `events`, `notify`, `modal`, `manual`, `theme`, `reset`, `experience`, `screens`, `modules`, `activity`, `themes`, `notebook`, `references`, `report` e `shell`. `screens.navigate(id,parameter,options)` encaminha ao roteador existente. `SimCore.router` é a API global; não existe `ctx.router`.

Escritas de UI/storage ficam inativas depois do unload. Use `ctx.scope.listen/timeout/interval/animation/observe/cleanup` e confira `scope.active` após `await`.

## Shell

O shell é registrado pelo domínio via `experience.configure`:

```js
context.experience.configure({
  home: {
    primary: [{ id: 'laboratorio', title: 'Laboratório', destination: 'laboratorio' }],
    support: [{ id: 'manual', title: 'Manual', destination: 'manual' }]
  },
  navigation: {
    desktop: [{ id: 'inicio', label: 'Início', icon: 'home' }],
    mobile: [{ id: 'inicio', label: 'Início', icon: 'home' }]
  },
  shell: {
    startup: { destinations: [{ id: 'inicio', label: 'Início' }] },
    resources: [{ id: 'tour', title: 'Iniciar tour', action({ shell }) {
      SimCore.emit('tour:requested', { shell });
    }}]
  }
});
```

Destinos são objetos ou IDs com `id`, `destination` (alias `route`), `parameter`, `label` (alias `title`), `icon`, `enabled`, `visible` (alias `visibility`) e `tooltip`. `destination` usa `id` por padrão. `enabled` e visibilidade aceitam booleano ou função que recebe `{ctx,experience,activity}`. Destinos sem tela registrada são omitidos. Destinos registrados mas desabilitados ficam sem `href`, com `role="link"`, `tabindex="0"`, `aria-disabled="true"` e explicação. O bloqueio é conferido de novo pelo roteador. `aria-current="page"` identifica a área atual; Tema mantém Aprender ativo.

`ctx.shell.registerResource`, `registerDesktop`, `registerBottom` e `registerTour` permitem extensões depois da configuração e retornam função de remoção. IDs duplicados são rejeitados. Um recurso tem `{id,title,icon,action,visibility}`; `action({ctx,experience,shell})` pode retornar Promise. Sem ação, um recurso pode declarar `destination`/`route`. `resourceId` opcional consulta permissões da atividade e ações são omitidas em navegação restrita, salvo `allowDuringActivity:true`. `shell.tour` ou `registerTour(action)` registram somente o hook: conteúdo e execução pertencem ao domínio. Ao desmontar, o core limpa os registros; contextos destruídos não conseguem adicionar novos itens.

Escolha um conjunto curto para `navigation.mobile`, normalmente três ou quatro destinos. O core aplica rótulos, estado ativo, targets de pelo menos 44 px e safe areas; ele não transforma uma lista arbitrariamente longa em uma navegação móvel adequada.

`ctx.shell` fornece `open/close`, `setStartup`, `setProjector` e `projector`, além dos registros protegidos. `SimCore.shell` fornece também snapshots `desktop`/`bottom`, `resolveInitialHash` e funções internas de renderização. O startup persistido é um destino simples e cai em Início se não for registrado; sem Home, o fallback neutro é Laboratório. Links diretos para outras telas têm precedência. O Modo Projetor altera somente estado estrutural (`data-projetor`, storage e layout), amplia a tipografia e reduz informação secundária. Professor pode omitir seu acesso na gaveta com `shell.projectorFromTeacher:false`.

## Aprender/Temas

```js
context.experience.configure({
  themes: [{
    id: 'meu-tema', title: 'Meu Tema', subtitle: 'Entrada', description: 'Resumo',
    icon: 'learn', state: 'available',
    related: {
      content: [{title:'Orientação',destination:'manual',parameter:'inicio'}],
      investigations: [{title:'Investigar',destination:'laboratorio'}],
      routes: ['roteiro-1'], missions: ['missao-1']
    }
  }]
});
```

IDs são únicos e válidos. Os aliases `titulo`, `subtitulo`, `descricao`, `icone`, `estado` e `conteudosRelacionados` são aceitos; neste último, `conteudo`, `investigacoes`, `roteiros` e `missoes` correspondem aos campos em inglês. `state:'disabled'` mantém o registro visível como indisponível, inclusive em link direto. Conteúdo relacionado admite `title`, `destination`, `parameter` ou `href` HTTP(S); investigações admitem `title`, `destination`, `parameter`. Roteiros e Missões usam IDs de atividades já registradas, e referências inexistentes são ignoradas.

`themes.list/get/register/toggle/completed` são estruturais; o único estado criado pelo marcador é `learning.theme.<id>` no namespace do domínio. A tela `aprender` lista cards; `tema/<id>` renderiza o hub e seus links relacionados. Marcar preserva foco e atualiza `aria-pressed`. Não existe pontuação ou progressão obrigatória.

## Caderno opcional

`notebook: {id,title,route?,icon?,description?,state?,enabled?,available?,render?,open?}` registra disponibilidade, rota, identidade e integração. A rota padrão é `caderno`; `enabled:false`, `available:false` ou `state:'disabled'` não registram a tela. `id` identifica o contrato e `route` identifica a navegação; registre a rota escolhida nas barras. Aliases `titulo`, `rota`, `icone`, `descricao` e `estado` são aceitos.

`render(host, local)` pode ser assíncrono e retornar cleanup; o escopo local gerencia a limpeza mesmo se a tela tiver sido fechada durante o `await`. Sem render, `open(local)` gera o botão de abertura. Sem ambos, aparece um estado vazio neutro. `ctx.notebook.current` retorna a configuração; `available` indica disponibilidade. O formato dos registros e qualquer persistência são responsabilidade do domínio.

## Atividades e navegação restrita

`activity.register('route'|'mission', definition)` exige módulo existente, IDs de recursos conhecidos e navegação `free` ou `restricted`. `activity.start`, `finish`, `restart`, `exit`, `save`, `offerResume` e `current` gerenciam metadados da sessão; dados do produto ficam em `options.session.capture/restore`. O snapshot `activity.current` representa o activityContext; `navigationMode` deriva de `definition.navigation` e conserva os valores `free` e `restricted` no storage. O shell consulta `experience.restricted` para a restrição efetiva: atividade não livre, navigationMode restrito e status diferente de completed/interrupted.

| Estado | Navegação geral | Gaveta | Rotas e marca |
|---|---|---|---|
| Livre / sem atividade | Desktop e bottom nav conforme breakpoint | Menu completo, com atividade se houver | Destinos registrados; marca volta ao Início |
| Restrita ativa / reiniciada | Desktop e bottom nav ocultas; altura inferior zero | Menu da atividade: contexto, ações, ajuda e acessibilidade | Laboratório, detalhe da atividade e relatório atual quando fornecido; marca inerte |
| Concluída / encerrada | Retorna automaticamente, sem reload | Menu completo | Navegação geral restabelecida |

Concluir mantém o snapshot e o relatório, conforme o motor herdado. `navigationMode` armazenado pode continuar restricted, mas o shell deixa de aplicar a restrição após completed. Recursos e módulo da tentativa continuam pertencendo ao motor existente; para substituir a atividade, use Encerrar. Refazer inicia uma nova tentativa restrita pelo mesmo motor.

`allowedDestinations` opcional na definição autoriza destinos adicionais explicitamente. Uma string autoriza somente a raiz daquele ID; um objeto `{id, destination?, parameter?, label?, icon?}` autoriza exatamente a combinação rota/parâmetro. O Manual completo não é implicitamente permitido. O bloqueio continua no roteador existente, inclusive para hashes, histórico e links diretos.

A ajuda usa `definition.help`: `{instructions?, objective?, procedure?, conditions?, tips?, explanations?, manualTopic?}`. Sem esses campos, usa os textos existentes da atividade. `manualTopic` apresenta somente texto, passos e detalhes do tópico registrado na mesma modal de atividade; não inclui índice, busca, ações ou navegação do Manual. Opcionalmente `contextualHelp(activityContext, ctx)` na configuração fornece esse objeto para o contexto atual, incluindo atividades do Professor. As instruções serializadas do Professor funcionam como fallback, sem mudar seu schema JSON.

## Manual, acessibilidade e relatórios

`manual.register` aceita seções e tópicos de texto, com links internos `[[id|rótulo]]`; não há HTML arbitrário. `modal.open` devolve `{element,result,close}` e aplica foco/trap. Acessibilidade mantém tema, contraste, escala, espaçamento, movimento, leitura e visão de cores. O botão do cabeçalho abre a seção expansível da mesma gaveta, também no mobile e em restrição. A modal legada `SimCore.accessibility.open()` continua disponível. Ambas usam `renderControls` e o mesmo `A11Y.estado/definir`, evento e storage. Os controles montados devolvem cleanup e sincronizam mudanças feitas em qualquer superfície. Não existe segundo motor.

Navegar e Acessibilidade são disclosures com button, aria-expanded e aria-controls. Navegar inicia expandido até 900 px e recolhido acima disso, preservando a escolha nesta página mesmo após resize/rotas. A gaveta entra pela esquerda em 250 ms; a preferência motion ou prefers-reduced-motion elimina a animação. O foco permanece no disclosure ao expandir/recolher; Escape, backdrop e Fechar devolvem foco ao acionador.

A Home permite Caderno em home.primary quando sua rota foi registrada; destinos ausentes são omitidos. Configurações de inicialização abre a preferência já existente em Menu → Preferências, usando exclusivamente a chave core startup. Não cria nova tela nem novo armazenamento. `report.collect` devolve seções/tabelas serializáveis; a UI cuida de edição, metadados e impressão.

## Storage, PWA e build

Namespaces: `simcore_core_v1_` para preferências estruturais, `simcore_domain_<id>_v1_` para o domínio e `simcore_a11y_v1` para acessibilidade. `get`, `set`, `remove` e `clear` são JSON; `set` retorna `false` quando somente a memória foi usada. A migração SIAB lê somente preferências de interface antigas.

O Service Worker usa `simcore@<scope>::0.2.3` e um cache de domínio separado. Depois de alterar referências estruturais, execute `npm run build`; as fontes são `config/breakpoints.json` e `scripts/sw-template.js`.
