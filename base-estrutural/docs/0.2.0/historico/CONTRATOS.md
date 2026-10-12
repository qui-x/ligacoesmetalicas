# Contratos — 0.2.0

Este documento descreve a API implementada, sem prometer compatibilidade com versões futuras. Scripts são clássicos; `SimCore` é o namespace global. O ponto de extensão é `SimCore.registerDomain(module | null): Promise<context | null>`.

## Manifesto

| Campo | Tipo/condição | Comportamento |
|---|---|---|
| `id` | String obrigatória; `^[a-z][a-z0-9-]{0,63}$` | Identidade e namespace persistente |
| `nome`, `nomeCurto`, `versao`, `titulo`, `subtitulo` | Strings obrigatórias; subtítulo pode ser vazio | Identidade, cabeçalho e título do documento |
| `icone` | URL local opcional, mesma origem | Marca e favicon; fallback neutro |
| `tema` | Objeto de cores opcional | Tokens comuns ou objetos `light` e `dark` |
| `viewport.label` | String opcional | Nome acessível da região central |
| `painelEsquerdo`, `painelDireito` | PanelSpec opcional | Conteúdo das docas |
| `acoesSuperiores` | Array de ActionSpec | Botões ordenados por prioridade decrescente |
| `manual` | ManualData opcional | Conteúdo externo para o mecanismo do Manual |
| `recursos` | Até 100 URLs locais dentro do escopo PWA | Preparação de cache de arquivos do domínio |

Os objetos de registro são de código confiável, não entradas JSON arbitrárias. O validador verifica campos obrigatórios, formato do ID e tipos de hooks; não implementa um schema exaustivo de todas as callbacks. Erro no manifesto rejeita a Promise e mantém o domínio anterior. Erro durante montagem limpa o domínio, mostra mensagem neutra e resolve `null`.

## Lifecycle

| Operação | Assinatura | Ordem/responsabilidade |
|---|---|---|
| Inicializar | `init(ctx)` | Estado e dependências do módulo |
| Montar | `mount(ctx)` | Preencher host novo |
| Ativar | `activate(ctx)` | Habilitar interações; painéis/Manual/ações já registrados |
| Dimensionar | `resize(size, ctx)` | Uma chamada inicial e alterações da região |
| Reiniciar | `reset(ctx)` | Somente dados definidos pelo módulo |
| Desativar | `deactivate(ctx)` | Após tornar o escopo inativo |
| Destruir | `destroy(ctx)` | Soltar referências e integrações externas |

Hooks são opcionais e podem retornar Promise. Ordem de montagem: destruir anterior → criar escopo/host/contexto → identidade/tema → init → mount → painéis/Manual/ações → activate → resize inicial. Desmontagem: retirar referência atual → destruir escopo → deactivate → destroy → fechar serviços pertencentes ao módulo → limpar shell e host.

Registro, reset e unload são serializados. Não aguarde reentrada nessa mesma fila dentro de um hook. Requisições externas devem respeitar `signal`/`active`. Não há timeout que force o encerramento de um hook que nunca conclui. Durante operações pendentes, o código do módulo continua responsável por cooperar com a API.

Falhas em hooks, listeners/timers geridos e ações superiores encerram o módulo com estado seguro; erros de cleanup são registrados e a limpeza continua. Erros de ações do modal/Manual apresentam aviso neutro. Stacks não são incluídos na interface. Código externo não gerido não é interceptado universalmente.

## Contexto

| API | Resultado/contrato |
|---|---|
| `manifest`, `scope`, `storage` | Manifesto, recursos geridos, namespace do ID |
| `viewport.host` | Elemento exclusivo da montagem; invalidado no unload |
| `viewport.size` | Snapshot `{width,height,pixelRatio}` em pixels CSS + DPR |
| `viewport.onInput(fn)` | Recebe `{type,event,x,y,pointerType}`; retorna cleanup |
| `viewport.overlay(element)` | Overlay gerido pelo escopo; retorna função de remoção |
| `panels.set('left'|'right', spec)` | Registra/substitui painel |
| `panels.open(side)`, `panels.close(side)` | Solicita abertura/fechamento conforme contexto/rota |
| `setContext(value)`, `getContext()` | Estado opaco de relevância; atualiza painéis e ações |
| `accessibility.state` | Estado atual, com aliases `colorVision` e `reducedMotion` |
| `events.on(type, fn)` | Listener no barramento; `fn` recebe `detail`; cleanup automático |
| `events.emit(type, detail)` | Emite `domain:<id>:<type>` |
| `notify(message, options)` | Notificação de propriedade do domínio |
| `modal.open(options)` | `{element, result: Promise, close(value)}` |
| `manual.register(data)` | Substitui conteúdo do Manual |
| `theme.set(theme)` | Substitui apenas tokens temáticos |
| `reset()` | Solicita reset do domínio atualmente ativo |

Métodos que alteram UI e escrita de storage tornam-se inativos após unload. Leituras de storage permanecem possíveis. Não reutilize contexto destruído; `ctx.reset()` encaminha ao domínio atual, por isso deve ser chamado somente por ações de contexto ativo. O contrato não isola código malicioso: módulos executam no mesmo contexto JavaScript.

Entradas do viewport: pointerdown/move/up/cancel e keydown/keyup; `event` é o evento nativo. Coordenadas são relativas à região central, não ao espaço interno transformado do renderer. O módulo deve converter coordenadas, decidir `preventDefault` e tratar seus controles internos. Eventos não são automaticamente restringidos a um canvas.

## Escopo

| Método | Contrato |
|---|---|
| `listen(target,type,fn,options)` | Adiciona listener protegido; retorna remoção |
| `on(type,fn)` | Listener de EventTarget do core; recebe evento CustomEvent |
| `timeout(fn,ms)`, `interval(fn,ms)` | Retornam cancelamento |
| `animation(fn)` | Loop RAF; recebe timestamp; retorna cancelamento |
| `observe(observer,target,options)` | Observa e registra `disconnect`; callback é fornecida pelo módulo |
| `webgl(gl)` | Solicita `WEBGL_lose_context` na limpeza, quando disponível |
| `cleanup(fn)` | Registra função síncrona de liberação; retorna função idempotente |
| `active`, `signal`, `size` | Estado, AbortSignal e recursos registrados |
| `destroy()` | Idempotente; cancela e executa limpezas |

Não são interceptados listeners, timers, workers, bibliotecas ou observers criados fora dessas APIs. Promises arbitrárias não são canceláveis; cheque `active` após concluir e use AbortSignal quando suportado. Cleanup assíncrono não é aguardado por `scope.destroy`; use os hooks assíncronos quando necessário. A medição de memória valida os cenários documentados, não todos os módulos possíveis.

## Painéis e ações

`PanelSpec = {title, presentation?, visible?(context), render?(host, localCtx), sections?: [{id,title,visible?(context),render(host,localCtx)}]}`.

`presentation` admite `compact`, `standard` e `wide`; a UI controla `fullscreen`. Se houver seções, elas substituem o render principal. A primeira seção disponível é selecionada; tabs aparecem quando existem duas ou mais. `render` é síncrono e pode retornar cleanup. Mudar contexto recria o conteúdo e encerra o escopo local anterior. Evite chamar `setContext` durante a própria renderização.

`ActionSpec = {id,label,tooltip?,priority?,visible?(context),enabled?(context),pressed?(context),run(ctx)}`. IDs únicos dentro do manifesto; use identificadores simples adequados a DOM. O botão fica desabilitado durante Promise retornada por `run`. Não há ícones ou payload científico pré-definidos. Prioridade ordena a barra, sem eliminar ações automaticamente.

## Tema e acessibilidade

Tokens aceitos: `primary`, `onPrimary`, `secondary`, `accent`, `surface`, `background`, `text`, `border`, `scientificAccent`, `textAccent`. Valores devem ser cores CSS válidas. Tokens desconhecidos são ignorados; não é permitido alterar raio, geometria, foco ou breakpoints pela API de tema. Os dois acentos específicos ficam disponíveis como `--scientific-accent` e `--text-accent`; ao usar, forneça fallback CSS. Alto contraste prevalece sobre o tema do módulo.

`accessibility.state` contém `theme`, `contrast`, `fontScale`, `spacing`, `motion`, `reading`, `colorblind`, `colorVision`, `reducedMotion`. Este último combina preferência da aplicação e preferência do sistema. O motor mantém parâmetros de URL e preferências locais, preservando parâmetros externos como `demo`.

Eventos relevantes: `a11y:changed` (estado), `theme:changed` ({theme,contrast}), `viewport:resize` (dimensões), `panel:opened/closed` ({side}), `core:reset` ({}), `domain:mounted/destroyed` ({id}), `reset:requested` ({id}), `storage:unavailable` ({prefix}). `core:ready` ocorre após a inicialização estrutural; o carregador padrão pode registrar o módulo depois.

## Manual

```js
{
  sections: [{id, title}],
  topics: [{
    id, category, title, summary, purpose, content,
    keywords: [], steps: [], details: [{title,text}],
    actions: [{label,run(ctx)}], related: []
  }],
  aliases: {apelido: 'id-do-topico'}
}
```

`category` referencia a seção, IDs de tópicos são únicos e contêm letras minúsculas, números ou hífens. Arrays textuais vazios são preenchidos com defaults; conteúdo é texto escapado. `[[id|rótulo]]` cria link interno validado. Não há HTML arbitrário nos textos do Manual. `content` é um parágrafo de texto, não um renderer. Busca ignora acentos, usa palavras-chave e ordenação derivada da baseline. Rotas são `#/manual` e `#/manual/<id>`. Sem registro, exibe estado neutro.

## Modais e notificações

Modal: `{title,content,actions?,size?,dismissible?,owner?}`. `content` aceita texto, Node ou função síncrona `(host)=>void`. `size` é `standard` ou `wide`; cada ação `{id,label,primary?,intent?,run()}` pode retornar `false` para manter aberto. `dismissible:false` exige uma ação de saída. A abertura substitui o modal anterior. Há trap, Escape quando permitido e retorno de foco. O contexto define ownership automaticamente.

Notificação: `{type:'info'|'success'|'warning'|'error',duration?}`. Padrão 5000 ms; positivo tem mínimo 1000 ms; zero permanece até fechar/substituir. Há uma notificação visível por vez e anúncio ARIA. Texto não é interpretado como HTML. Unload remove serviços do domínio; reset estrutural remove todos os serviços transitórios.

## Storage e migração

| Família | Chave/prefixo |
|---|---|
| Acessibilidade | `simcore_a11y_v1` |
| Preferências do core | `simcore_core_v1_` |
| Dados do domínio | `simcore_domain_<id>_v1_` |
| Migração única | `simcore_migration_v1` |

`get(key,fallback=null)`, `set(key,value): boolean`, `remove(key)`, `clear()`. As chaves fornecidas são codificadas e prefixadas. Os valores precisam ser serializáveis em JSON. `set` retorna false quando persistiu apenas na memória. `clear` não toca outros namespaces. Corrompimento de JSON recupera fallback com log; validação de tipos de negócio cabe ao domínio.

Migração explícita lê `siab_a11y_prefs` (apenas theme, contrast, fontScale, spacing, motion, reading, colorblind) e `siab_workspace_v1` (left/right transformados em booleanos). Não sobrescreve preferências neutras existentes, não escreve/apaga chaves antigas e não migra dados científicos. Falha de migração registra diagnóstico e a inicialização usa padrões.

## PWA e build

`manifest.webmanifest` identifica a Base, de forma estática e neutra. Troca de título/ícone de domínio afeta o documento em execução, não a identidade já instalada do PWA. Um produto derivado pode editar seu manifesto de distribuição fora do core.

Cache: `simcore@<scope>::0.2.0`, recursos de módulos em sufixo `::domains`. Só recursos same-origin no escopo são aceitos. `scripts/build-sw.cjs` extrai o pre-cache do HTML; execute após adicionar/remover dependências estruturais. `scripts/build-layout.cjs` aplica `config/breakpoints.json` ao JS e marcadores CSS. Não edite apenas os arquivos gerados.
