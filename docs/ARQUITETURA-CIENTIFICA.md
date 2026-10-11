# Arquitetura científica do SILM

> Atualizada na 0.4.0 e reconstruída a partir do código, porque o arquivo da 0.3.0 não constava do pacote recebido.

## 1. Princípio

O SILM e o SIAB são instrumentos científicos diferentes da mesma família: **mesma gramática operacional, motores científicos diferentes**. O núcleo herdado da Base Estrutural 0.2.4 fornece shell, navegação, docas, módulos, atividades, Manual, Professor, relatório, acessibilidade, storage, lifecycle e PWA. O domínio SILM fornece somente a ciência.

## 2. Camadas

```text
SILM CORE
├── data            domain/silm/data/ (JSON canônicos, bundle.js, evidências CIF) + data-api.js
├── state           domain/silm/state.js — scientificState único, schema 3
├── mechanics       domain/silm/assembly.js — contrato da cena e assistência (0.4.x)
├── representation  domain/silm/assembly-view.js + assembly.css — 2D funcional (0.4.x)
│                   domain/silm/periodic-table.js + presentation.js — Tabela (0.2.x)
├── measurements    reservado (0.9.x)
├── calculations    reservado (0.10.x)
└── pedagogy        domain/silm/manual.js; Aprender, Roteiros e Missões configurados em bootstrap.js
```

`domain/silm/bootstrap.js` conecta essas camadas ao ciclo de vida da Base (`init`, `mount`, `activate`, `resize`, `reset`, `deactivate`, `destroy`) e define os painéis, os módulos, o relatório e as telas.

## 3. Fluxo de dados

```text
Tabela Periódica ──(Iniciar investigação)──┐
Área do Professor ─(Investigar este metal)─┤
                                           ▼
                           scientificState (serviço único)
                                           │ eventos domain:silm:*
              ┌────────────────────────────┼─────────────────────────────┐
              ▼                            ▼                             ▼
   Viewport (Tabela/cartão/       Painel Elementos                Painel Informações
   montagem 2D)                   (identidade + controles)        (montagem + dados tabelados)
```

- Componentes não se manipulam diretamente: a Tabela chama o serviço, e a interface observa o estado.
- A seleção de apresentação do Professor (`presentationSelection`) é independente do metal da investigação.
- Os dados do banco são imutáveis. A montagem é **representação didática**; a estrutura de referência é **dado tabelado**. Os dois rótulos aparecem lado a lado no painel Informações.

## 4. Laboratório e módulos

| Estado | Viewport |
|---|---|
| sem investigação | Tabela Periódica (seleção) |
| metal ativo, `structure = null` | cartão da investigação com **Iniciar montagem** (Explorar) |
| `structure` existente | área de montagem: editável em Explorar; somente leitura em Medir e Calcular |

Trocar de módulo altera apenas a perspectiva (`module.active`): não cria investigação, não apaga o metal e não apaga a montagem.

## 5. Roteiros e Missões

```text
Roteiro → activityContext → scientificState
Missão  → activityContext → scientificState
```

Uma atividade muda o contexto (módulo permitido, restrições), mas usa o mesmo contrato científico do Laboratório Livre. Não há estado paralelo. O conteúdo científico de Roteiros e Missões pertence às séries 0.13.x e 0.14.x.

## 6. Proveniência

Toda informação é classificada como dado tabelado (com fonte), calculado pelo SILM ou representação qualitativa ou didática. Na 0.4.0 não há resultados calculados. A montagem é representação didática, e suas posições não são medidas.

## 7. Núcleo herdado

A auditoria (`scripts/audit-silm.py`) confere que os arquivos do núcleo permanecem idênticos aos da 0.3.0 recebida (`docs/evidence/NUCLEO-PRESERVADO.json`). A única integração declarada na 0.4.0 é `js/experience/activity.js`: a opção de domínio `session.resumeFree: 'direct'`, correção de origem 0.3.x.
