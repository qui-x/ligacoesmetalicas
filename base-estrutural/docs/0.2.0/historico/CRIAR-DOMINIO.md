# Criar um domínio

Um domínio é um objeto com `manifest` e hooks opcionais. Carregue seu script por `domain/entry.js`, depois de `SimCore.ready`, e chame `SimCore.registerDomain(objeto)`. Não edite `js/core` para inserir conteúdo. O manifesto usa os nomes em português descritos abaixo; aliases em inglês não são reconhecidos.

## Exemplo mínimo completo

Crie `domain/exemplo.js` com o conteúdo abaixo. Trata-se de um exemplo documental; a distribuição executável utiliza apenas a Demo Estrutural e a base vazia.

```js
window.CriarExemplo = () => {
  let ctx, output, value = 0;
  function draw() {
    output.textContent = 'Ações: ' + value;
    ctx.storage.set('value', value);
    ctx.setContext({ value });
  }
  function increment() { value++; draw(); }
  return {
    manifest: {
      id: 'exemplo', nome: 'Exemplo', nomeCurto: 'Exemplo',
      versao: '0.0.1', titulo: 'Meu espaço', subtitulo: 'Módulo independente',
      tema: {
        light: { primary: '#286049', accent: '#1c5c45' },
        dark: { primary: '#346552', accent: '#a2dec9' }
      },
      viewport: { label: 'Área interativa do exemplo' },
      recursos: ['domain/exemplo.js'],
      acoesSuperiores: [{
        id: 'increment', label: 'Acionar', priority: 10,
        tooltip: 'Acionar o exemplo', run: increment
      }],
      painelEsquerdo: {
        title: 'Ferramentas',
        render(host, local) {
          const button = document.createElement('button');
          button.type = 'button'; button.className = 'secondary-btn';
          button.textContent = 'Acionar';
          local.scope.listen(button, 'click', increment);
          host.append(button);
        }
      },
      painelDireito: {
        title: 'Informações',
        render(host, local) {
          host.textContent = 'Ações: ' + (local.getContext()?.value || 0);
        }
      },
      manual: {
        sections: [{ id: 'inicio', title: 'Início' }],
        topics: [{ id: 'usar', category: 'inicio', title: 'Como usar',
          summary: 'Explore o espaço.', keywords: ['acionar'],
          steps: ['Abra Ferramentas.', 'Use Acionar.'],
          actions: [{ label: 'Abrir ferramentas', run(c) {
            location.hash = '#/workspace';
            c.scope.timeout(() => c.panels.open('left'), 0);
          }}]
        }]
      }
    },
    init(context) {
      ctx = context;
      const saved = ctx.storage.get('value', 0);
      value = Number.isSafeInteger(saved) && saved >= 0 ? saved : 0;
    },
    mount() {
      output = document.createElement('output');
      output.setAttribute('aria-live', 'polite');
      ctx.viewport.host.append(output);
      ctx.viewport.onInput(({ type, event }) => {
        if (type === 'keydown' && event.key === 'Enter') {
          event.preventDefault(); increment();
        }
      });
      draw();
    },
    activate() { ctx.notify('Módulo disponível.', { type: 'info' }); },
    resize(size) { /* size.width, size.height, size.pixelRatio */ },
    reset() { value = 0; draw(); },
    deactivate() { /* Interrompa integrações externas, se houver. */ },
    destroy() { output = null; ctx = null; }
  };
};
```

Carregue o arquivo com uma tag `script` antes de `domain/entry.js`, ou adapte o carregador sequencial desse arquivo. Na entrada, após a carga, use:

```js
await SimCore.registerDomain(CriarExemplo());
```

Para retirar o domínio:

```js
await SimCore.registerDomain(null);
```

Cada montagem deve usar uma nova instância produzida pela factory. O exemplo real `domain/demo/bootstrap.js` demonstra também SVG, estilo próprio, modal, tema, storage e limpeza.

## Renderers e recursos externos

Anexe Canvas, SVG ou DOM somente em `ctx.viewport.host`. Para Canvas/WebGL, ajuste o buffer ao tamanho CSS e `pixelRatio` no hook `resize`. O core entrega dimensões, não configura o renderer.

Use `ctx.scope.animation`, `interval`, `timeout`, `listen` e `observe` para recursos canceláveis. Use `ctx.scope.webgl(gl)` para liberar o contexto WebGL. Registre `ctx.scope.cleanup(() => renderer.dispose())` para bibliotecas externas. Para requisições, passe `ctx.scope.signal` ao `fetch`; após qualquer `await`, confira `ctx.scope.active` antes de desenhar.

Em painéis, use o `scope` de `local`, fornecido a `render(host, local)`. Esse escopo é encerrado a cada nova renderização do painel, inclusive após mudança de contexto. A callback de renderização é síncrona; pode retornar uma função de limpeza adicional. Não guarde o host antigo nem utilize diretamente listeners globais sem cleanup.

CSS do domínio deve ficar em seu diretório, com seletores próprios. Carregue a folha em `mount` e remova-a em `scope.cleanup`, como na demo. Use tokens temáticos; não substitua medidas estruturais.

## Acessibilidade e serviços

Consulte `ctx.accessibility.state` e assine `ctx.events.on('a11y:changed', state => ...)`. Respeite `reducedMotion`, contraste, escala e visão de cores no renderer; ofereça alternativa textual e teclado. Revise contraste quando fornecer cores próprias.

`ctx.notify('Texto', { type: 'success' })` apresenta uma notificação. `ctx.modal.open({ title, content, actions })` abre um diálogo gerido. `ctx.manual.register(data)` substitui o Manual do módulo. `ctx.storage` já possui namespace pelo ID: não use diretamente chaves estruturais.

Separe reset de dados, reset de apresentação e destruição. `reset` pertence ao módulo; `SimCore.resetStructure()` reorganiza a interface. `destroy` deve liberar referências externas, objetos de renderer e estado transitório. Não aguarde uma chamada a `registerDomain`, `unload` ou `reset` de dentro de um hook que já ocupa a fila de lifecycle: isso causaria espera circular. Dispare a próxima operação após o hook terminar.

## Antes de integrar um domínio real

Execute os testes de base vazia e demo, repita mount/reset/unload, teste o Manual e painéis em 320 px e fonte 150%, e examine o console. A validação científica pertence ao módulo e deve ser feita separadamente. Esta versão não inclui um domínio científico real.
