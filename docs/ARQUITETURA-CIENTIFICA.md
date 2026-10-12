# Arquitetura científica do SILM

> Atualizada na 0.8.0. Reconstruída na 0.4.0 a partir do código, porque o arquivo da 0.3.0 não constava do pacote recebido.

## 1. Princípio

O SILM e o SIAB são instrumentos científicos diferentes da mesma família: **mesma gramática operacional, motores científicos diferentes**. O núcleo herdado da Base Estrutural 0.2.4 fornece shell, navegação, docas, módulos, atividades, Manual, Professor, relatório, acessibilidade, storage, lifecycle e PWA. O domínio SILM fornece somente a ciência.

## 2. Camadas

```text
SILM CORE
├── data            domain/silm/data/ (JSON canônicos, bundle.js, evidências CIF) + data-api.js
├── state           domain/silm/state.js — scientificState único, schema 6
├── mechanics       domain/silm/assembly.js — contrato da cena e assistência (0.4.x)
│                   domain/silm/crystal.js — modelo cristalográfico CCC/CFC/HC, elegibilidade, vizinhança (0.5.x)
│                   domain/silm/properties.js — propriedades: elegibilidade, dados, transformações (0.7.x)
├── representation  domain/silm/assembly-view.js + assembly.css — 2D funcional da montagem livre (0.4.x)
│                   domain/silm/crystal-view.js — célula, rede e vizinhança pseudo-3D (0.5.x)
│                   domain/silm/electron-view.js — elétrons deslocalizados, canvas qualitativo (0.6.x)
│                   domain/silm/property-view.js — sobreposição e controles das experiências (0.7.x)
│                   domain/silm/exploration.js — Explorar: foco, camadas, comparação derivada (0.8.x)
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
   Viewport (Tabela/cartão/       Montagem (Resumo, Metal,        Ver (Observar, Camadas,     · Dados (Tabela,
   montagem/estrutura)            Estrutura, Propriedades,        Histórico, Relatório)
                                  Módulo)
```

- Componentes não se manipulam diretamente: a Tabela chama o serviço, e a interface observa o estado.
- A seleção de apresentação do Professor (`presentationSelection`) é independente do metal da investigação.
- Os dados do banco são imutáveis. A montagem é **representação didática**; a estrutura de referência é **dado tabelado**. Os dois rótulos aparecem lado a lado no painel Montagem → Estrutura. A organização cristalográfica usa a estrutura de referência do banco e marca as unidades completadas pelo SILM.

## 4. Laboratório e módulos

| Estado | Viewport |
|---|---|
| sem investigação | Tabela Periódica (seleção) |
| metal ativo, `structure = null` | cartão da investigação com **Iniciar montagem** (Explorar) |
| `structure.mode = free` | área de montagem: editável em Explorar; somente leitura em Medir e Calcular |
| `structure.mode = crystalline` | estrutura cristalina: vistas Célula/Rede, vizinhos e rótulos; organizar e voltar ao livre em Explorar |
| `electrons` ativo | camada eletrônica sobre a montagem ou a estrutura: mostrar/ocultar e movimento em todos os módulos; ativação somente em Explorar |
| `properties.active` | experiência sobre a mesma estrutura (campo, calor, compressão, tração, luz); operada em Explorar, acompanhada em Medir e Calcular |

Trocar de módulo altera apenas a perspectiva (`module.active`): não cria investigação, não apaga o metal e não apaga a montagem.

Explorar (0.8.x) é a perspectiva qualitativa integrada: o painel Observar acompanha o objeto em foco, Camadas reúne as camadas de apresentação e Comparar desenha cenas derivadas somente leitura. Foco, camadas de apresentação e modo de comparação ficam em `exploration.view`, fora do `scientificState` (ver `CONTRATO-EXPLORACAO.md`).

## 5. Roteiros e Missões

```text
Roteiro → activityContext → scientificState
Missão  → activityContext → scientificState
```

Uma atividade muda o contexto (módulo permitido, restrições), mas usa o mesmo contrato científico do Laboratório Livre. Não há estado paralelo. O conteúdo científico de Roteiros e Missões pertence às séries 0.13.x e 0.14.x.

## 6. Proveniência

Toda informação é classificada como dado tabelado (com fonte), calculado pelo SILM ou representação qualitativa ou didática. Até a 0.7.0 não há medidas nem cálculos interativos; o único valor calculado previsto nas propriedades é σ = 1/ρ, quando houver resistividade homologada. O modelo eletrônico é representação qualitativa; sua origem conceitual (convenção de valência e configuração do átomo neutro) vem do banco, com fonte. A montagem livre é representação didática, e suas posições não são medidas. Na estrutura cristalina, sítios, coordenação e distâncias vêm do banco (dado tabelado com fonte); a projeção na tela é representação.

## 7. Núcleo herdado

A auditoria (`scripts/audit-silm.py`) confere que os arquivos do núcleo permanecem idênticos aos da 0.3.0 recebida (`docs/evidence/NUCLEO-PRESERVADO.json`). Integrações declaradas: `js/experience/activity.js` (0.4.0, opção `session.resumeFree`, correção de origem 0.3.x); `js/workspace/workspace.js` e `js/core/domain.js` (0.5.0, painel direito com fontes Ver/Dados, correção de origem 0.1.x — paridade SIAB 1.0.0); `js/manual/manual.js` (0.8.0, link direto para tópico do Manual, correção de origem 0.1.x).
