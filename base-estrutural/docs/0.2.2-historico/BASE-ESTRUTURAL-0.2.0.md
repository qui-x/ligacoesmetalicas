# Base Estrutural 0.2.0

Núcleo universal de aplicações interativas, derivado exclusivamente da Base Estrutural 0.1.0. O domínio químico original foi retirado do runtime. A versão fornece workspace, responsividade, acessibilidade, Manual, notificações, modais, armazenamento, lifecycle e suporte a módulos independentes. Entrega congelada para homologação; não constitui homologação externa.

## Executar

Na pasta extraída, execute `python3 -m http.server 8080` e abra `http://localhost:8080/`. A raiz abre a base vazia. `http://localhost:8080/?demo=1` abre a Demo Estrutural. Não há dependências de produção para instalar: os scripts e o polyfill são locais. Use HTTP local ou HTTPS; abrir por `file://` não valida PWA/offline.

A versão não contém uma distribuição HTML standalone. A unidade de entrega é a pasta completa, preservando caminhos relativos. Publicação e hospedagem não fazem parte desta entrega.

## Organização

| Local | Responsabilidade |
|---|---|
| `index.html`, `a11y.js` | Shell neutro e motor de preferências derivado da baseline |
| `js/core/` | Namespace, compatibilidade, escopo, identidade, tema, lifecycle e reset |
| `js/workspace/` | Docas, contexto e host DOM/SVG/Canvas/WebGL |
| `js/components/` | Modal e notificações |
| `js/manual/` | Registro, pesquisa e navegação do Manual |
| `js/storage/` | Migração seletiva e namespaces |
| `js/a11y/`, `js/responsive/` | Preferências, eventos e medições |
| `domain/entry.js` | Ponto de integração de módulos, fora do core |
| `domain/demo/` | Exemplo independente, sem ciência |
| `config/breakpoints.json` | Fonte única de breakpoints |
| `css/` | Tokens estruturais, tema e apresentação |
| `sw.js`, `manifest.webmanifest` | PWA e cache por escopo/versão |
| `scripts/` | Geração de layout e Service Worker |
| `tests/`, `docs/0.2.0/` | Testes reproduzíveis e evidências da migração |

A arquitetura continua sendo scripts clássicos ordenados em um namespace. Não foi introduzido framework. Componentes originalmente acoplados foram extraídos e parametrizados; os detalhes de preservação estão na auditoria.

## Interface

As ferramentas aparecem à esquerda e as informações contextuais à direita. Em até 900 px, os painéis funcionam como sheets com backdrop, foco contido e fundo inerte. Entre 901 e 1279 px, apenas uma doca permanece aberta. A partir de 1280 px, duas docas podem coexistir. O painel direito admite apresentações compacta, padrão, ampla e expansão interna.

O domínio fornece relevância através de `visible(context)` e `setContext(value)`. O core não interpreta os valores do contexto. A área central recebe um novo host a cada montagem; referências antigas ficam desconectadas.

“Reorganizar interface” fecha painéis, modais, overlays e notificações, restaura apresentação, rolagem e foco. Preserva os dados e o renderer do módulo. “Reiniciar módulo” chama o hook `reset` definido pelo próprio módulo. Desmontar não apaga seu armazenamento persistente.

## Preferências e persistência

Tema, contraste, escala de texto (75–200%), espaçamento, leitura, redução de movimento e visão de cores são estruturais. O módulo recebe esses estados e deve adaptar sua representação. O core não modifica pixels desenhados por um renderer externo.

Os namespaces estruturais e de domínio são separados. A migração lê apenas preferências antigas autorizadas; não converte experimentos ou dados científicos. Dados JSON inválidos retornam ao valor padrão e produzem log técnico. O domínio valida seu próprio schema. Falha de escrita usa memória da sessão e aviso neutro.

## PWA

O cache estrutural contém somente recursos usados pelo shell. A demo declara seus recursos adicionais, preparados após carga online. O uso offline depende de primeira carga completa, suporte do navegador e manutenção do cache pelo dispositivo. Instalação via menu pode variar por navegador.

Na atualização, somente caches da própria família e escopo são eliminados; caches de outros aplicativos são preservados. Alterações de distribuição exigem nova versão de cache e reconstrução de `sw.js`. O ZIP congelado não deve receber alterações sob o mesmo hash.

## Leitura complementar

- [Criar domínio](CRIAR-DOMINIO.md)
- [Contratos](CONTRATOS.md)
- [Auditoria de universalização](AUDITORIA-UNIVERSALIZACAO.md)
- [Testes, regressões e limitações](RELATORIO-TESTES.md)
- [Registro dos checkpoints](0.2.0/CHECKPOINTS.json)

A aprovação interna documentada permite entregar esta candidata. A próxima etapa depende da homologação do usuário. Nenhum SILM, domínio científico novo ou Base 0.3 foi iniciado.
