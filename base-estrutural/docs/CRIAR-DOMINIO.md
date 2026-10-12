# Criar um domínio na Base 0.2.4

Um domínio é um objeto produzido por uma factory. Carregue seu script antes de `domain/entry.js` e registre uma instância nova:

```js
await SimCore.registerDomain(CriarMeuDominio());
```

Para retirar o domínio: `await SimCore.registerDomain(null)`.

## Esqueleto

```js
window.CriarMeuDominio = () => {
  let ctx, output, value = 0;
  return {
    manifest: {
      id: 'meu-dominio', nome: 'Meu domínio', nomeCurto: 'Meu domínio',
      versao: '0.0.1', titulo: 'Minha experiência', subtitulo: 'Produto independente',
      viewport: { label: 'Área principal' }, recursos: ['domain/meu-dominio.js']
    },
    init(context) {
      ctx = context;
      ctx.experience.configure({
        home: {
          primary: [
            { id: 'laboratorio', title: 'Laboratório', destination: 'laboratorio', icon: 'lab' },
            { id: 'aprender', title: 'Aprender', destination: 'aprender', icon: 'learn' }
          ],
          support: [{ id: 'manual', title: 'Manual', destination: 'manual', icon: 'manual' }]
        },
        themes: [{ id: 'entrada', title: 'Entrada', description: 'Resumo', related: { routes: [], missions: [] } }],
        navigation: {
          desktop: [
            { id: 'inicio', label: 'Início', icon: 'home' },
            { id: 'aprender', label: 'Aprender', icon: 'learn' },
            { id: 'laboratorio', label: 'Laboratório', icon: 'lab' },
            { id: 'manual', label: 'Manual', icon: 'manual' }
          ],
          mobile: [
            { id: 'inicio', label: 'Início', icon: 'home' },
            { id: 'aprender', label: 'Aprender', icon: 'learn' },
            { id: 'laboratorio', label: 'Laboratório', icon: 'lab' }
          ]
        },
        shell: { startup: { destinations: [{ id: 'inicio', label: 'Início' }] } },
        modules: [{ id: 'explorar', title: 'Explorar', controls(host, local) {
          const button = document.createElement('button');
          button.className = 'secondary-btn'; button.type = 'button'; button.textContent = 'Acionar';
          local.scope.listen(button, 'click', () => { value++; draw(); }); host.append(button);
        }}],
        resources: [],
        routes: [], missions: [], report: { collect() { return { sections: [] }; } }
      });
    },
    mount() {
      output = document.createElement('output'); output.setAttribute('aria-live', 'polite');
      ctx.viewport.host.append(output); draw();
    },
    resize(size) { output?.setAttribute('data-size', `${size.width}×${size.height}`); },
    reset() { value = 0; draw(); },
    destroy() { output = null; ctx = null; }
  };
  function draw() { if (output) output.textContent = 'Ações: ' + value; }
};
```

## Regras do shell

1. Declare `home.primary` para Laboratório, Aprender, Missões, Roteiros Experimentais e Caderno quando registrado; use `home.support` para Manual e Professor. Relatórios é tela de apoio, não caminho principal.
2. Registre `navigation.desktop` e `navigation.mobile` somente com destinos válidos. A Base renderiza o estado ativo e verifica restrições da atividade.
3. Use `shell.resources` para ações locais (tour, instalação, ajuda). Um tour pode ser somente um evento de hook; não coloque conteúdo genérico no core.
4. Para startup, registre destinos seguros. O fallback é Início. O Modo Projetor é estrutural e não deve mudar dados do domínio.
5. Use `themes` para um registro neutro de temas, com `related.content/investigations/routes/missions`. O marcador registra somente revisão, sem gamificação.
6. Use `notebook` somente se o produto tiver contrato próprio de registro; o core não define formato de anotação.

## Integração segura

Renderize no `ctx.viewport.host` e nos painéis recebidos. O core chama `experience.ready()` depois de `mount`; o domínio não deve chamá-lo. Use `ctx.scope` para listeners, timers, observers, animações e cleanup. Após `await`, confirme `ctx.scope.active`. Guarde dados no namespace do domínio, não nas chaves do core. Registre o Manual em `manifest.manual` ou `ctx.manual.register`. Abra modais com `ctx.modal.open` e notificações com `ctx.notify`. Relatório e Professor entram na configuração da experiência.

## Caderno, recursos e início opcional

Acrescente `notebook` à configuração inicial; chame `experience.configure` uma única vez. A rota escolhida deve aparecer nos registros de navegação desktop/mobile quando for utilizada:

```js
notebook: {
  id: 'registros', route: 'caderno', title: 'Caderno', icon: 'notebook',
  available: true, state: 'available',
  render(host, local) {
    const label = document.createElement('label');
    label.textContent = 'Anotação';
    const input = document.createElement('textarea');
    input.value = local.storage.get('minha-anotacao', '');
    label.append(input); host.append(label);
    local.scope.listen(input, 'input', () => local.storage.set('minha-anotacao', input.value));
  }
}
```

Sem `notebook`, ou com `available:false`, a Base não cria essa tela. Para integração com outro editor, use `open(local)` no lugar de `render`. O formato de armazenamento continua pertencendo ao domínio.

Recursos podem entrar em `shell.resources` ou ser registrados depois da configuração, no `init`:

```js
ctx.shell.registerResource({
  id: 'ajuda-local', title: 'Ajuda do produto', icon: 'info', visibility: true,
  action({ctx}) { ctx.notify('Orientação fornecida pelo domínio.'); }
});
ctx.shell.registerTour(() => SimCore.emit('tour:requested', {domain: ctx.manifest.id}));
```

O exemplo de tour registra somente um evento, sem passos ou conteúdo. Recursos com visibilidade falsa não aparecem. Ações auxiliares são omitidas na atividade restrita, salvo allowDuringActivity:true e permissões de recurso/destino compatíveis.

Em `shell.startup.destinations`, registre apenas destinos existentes e seguros, como Início, Aprender e Laboratório. A escolha do usuário usa `SimCore.storage.core`, chave startup; o domínio não precisa escrever `localStorage`. O Projetor é controlado por `ctx.shell.setProjector(true|false)` e não deve alterar dados da investigação.

## Checklist

- IDs estáveis, sem duplicatas; referências a módulos/recursos existentes.
- Navegação em hash, voltar/avançar, retorno de foco, Escape e drawer.
- 320, 360 e 390 px, tablet, paisagem, fonte 150%, contraste forçado e redução de movimento.
- Atividade restrita com bloqueio, relatório, continuidade e saída segura.
- Reload com retomada, reset confirmado, unload, offline e storage indisponível.
- `npm run build`, `npm test` e `npm run audit` sem falhas.

O exemplo executável completo é `domain/demo/bootstrap.js`; ele permanece neutro e serve apenas como demonstração dos contratos.

## Home e Caderno

Inclua `{id:'caderno', title:'Caderno', destination:'caderno', icon:'notebook'}` em `home.primary` junto do registro `notebook`. Se a rota do Caderno for diferente, use a mesma rota no card e na navegação. Sem registro de tela, o card e os destinos da gaveta/barras não aparecem. A Base acrescenta o acesso secundário Configurações de inicialização automaticamente na Home configurada.

## Ajuda contextual e atividade restrita

O domínio fornece orientação no registro existente da atividade:

```js
routes: [{
  id: 'percorrer', title: 'Meu percurso', module: 'explorar', navigation: 'restricted',
  instructions: 'Registre o resultado da ação.', objective: 'Documentar uma observação.',
  help: {
    tips: ['Confira o registro antes de sair.'],
    explanations: 'O domínio explica o significado do resultado.',
    manualTopic: 'meu-topico'
  }
}]
```

Registre `meu-topico` no Manual do manifesto. A modal Ajuda da atividade reutiliza seu texto, passos e detalhes sem abrir o Manual completo. Para orientação por contexto, `contextualHelp(activityContext, ctx)` pode retornar o mesmo objeto; não chame hooks de navegação ou crie outro Manual nesse callback. Nas atividades do Professor, as instruções já existentes são apresentadas automaticamente.

Em `navigation:'restricted'`, as barras gerais somem e a marca retorna ao contexto da atividade, mantendo a sessão. O Menu da atividade mantém Continuar, Ajuda, Relatório se disponível, Finalizar missão pelo formulário existente, Encerrar e Acessibilidade. Somente quando necessário declare uma permissão extra na definição: `allowedDestinations:[{id:'manual', parameter:'meu-topico', label:'Orientação autorizada'}]`. Isso autoriza o tópico exato, sem autorizar a raiz do Manual. `navigation:'free'` conserva o Menu e a navegação gerais.

Concluir (`ctx.activity.finish()`) salva o status completed e abre o relatório quando registrado, mantendo o contexto e a navegação restrita. Encerrar (`ctx.activity.exit()`) arquiva e remove esse contexto, restaura a sessão livre e libera barras e marca sem reload. O marcador de missão concluída e o relatório permanecem salvos. Refazer cria uma nova sessão. Para um roteiro com conclusão formal, forneça `validate({activity,fields,context})`, retornando true ou `{ok:true}`; sem validate, o roteiro mantém seu fluxo de continuidade e encerramento. Ofereça relatórios através de `report:{collect(){ return {sections:[...]}; }}`. Sem report, o Menu da atividade e a ajuda não mostram seu botão. Mantenha Relatório fora de home.primary e exponha um acesso no painel de dados do Laboratório quando aplicável.

Escolha três ou quatro destinos válidos em `navigation.mobile`, como Início, Aprender, Laboratório e Caderno se existir. Use o rótulo Roteiros Experimentais para `roteiros`; não altere IDs internos. Em `shell.startup.destinations`, declare destinos existentes e elegíveis, por exemplo Início, Aprender e Laboratório. Home e drawer compartilham a preferência; links diretos têm precedência e o fallback é Início ou Laboratório sem Home.

## Inicialização elegível e modal compartilhada

O domínio fornece as opções à configuração já existente:

```js
shell: { startup: { destinations: [
  { id: 'inicio', label: 'Início' },
  { id: 'minha-tela', label: 'Minha tela', enabled: () => recursoDisponivel }
] } }
```

Registre `minha-tela` antes de a experiência ficar pronta. Destinos iniciais são IDs de rota simples, sem parâmetro. `visible`/`visibility` e `enabled` aceitam booleanos ou funções. Nenhuma lista de Laboratório/Aprender é imposta pelo core; o fallback estrutural continua disponível como opção padrão. A Home e Inicialização no Menu abrem a mesma modal. Só Salvar persiste; os três modos de cancelar preservam a preferência. Ao iniciar, um destino removido ou indisponível usa Início, ou Laboratório sem Home. Links diretos continuam prioritários.

A marca de atividade restrita leva ao Laboratório da sessão atual; após concluir, leva ao seu relatório quando disponível. O clique também serve para devolver foco à área principal. Ao encerrar, ela volta ao comportamento normal. Não intercepte esse fluxo com outro roteador ou destrua o contexto dentro de `validate`.
