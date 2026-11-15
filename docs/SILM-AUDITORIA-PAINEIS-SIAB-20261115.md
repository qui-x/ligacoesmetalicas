# Auditoria de paridade SIAB × SILM — painéis Montagem, Ver e Dados

Data: 15/11/2026  
Referência: SIAB (repositório `qui-x/acidobase`, ramo `acidosebases1.0.0`).

## Fontes concretas de implementação

- SIAB: [`js/ui/workspace.js`](https://github.com/qui-x/acidobase/blob/acidosebases1.0.0/js/ui/workspace.js), especialmente `sections`, `applyLeft`, `sync`, `apply`, `geometry`, `open`, `close`, `init`.
- SIAB: [`js/ui/ver-investigacao.js`](https://github.com/qui-x/acidobase/blob/acidosebases1.0.0/js/ui/ver-investigacao.js), `VER_SECTIONS`, `verDisponivel`, `renderVer` e restauração de foco.
- SIAB: [`js/ui/modulos.js`](https://github.com/qui-x/acidobase/blob/acidosebases1.0.0/js/ui/modulos.js), cartões com `aria-expanded`, conteúdo contextual e somente um aberto por vez.
- SIAB: [`css/workspace.css`](https://github.com/qui-x/acidobase/blob/acidosebases1.0.0/css/workspace.css), geometria dos painéis, folha móvel e deslocamento útil do palco.
- SILM: `integracao/base-core.js`, `integracao/adapter.js`, `integracao/workspace-family.js`, `integracao/scientific-tools.js`, `integracao/workspace-family.css` e `index.html`.

## Mapeamento funcional, não literal

| Função | SIAB real | Adaptação no SILM |
|---|---|---|
| Montagem | Resumo, Preparo, Objetos/Recipientes, Módulo, Missão | Resumo, Preparo (metal e início), Unidades (inserir/organizar/localizar), Módulo, Roteiro |
| Módulos | Cartões expansíveis com somente um aberto, controles filtrados por ActivityContext | Preserva três cartões; mudança científica permanece em `SILM.model.setModule`; descrições condensadas |
| Ver | Família → ferramenta → conteúdo; disponibilidade filtrada pelo módulo/permissões | Ferramentas físicas diretas do módulo; segundo nível de visualizações recolhível para reduzir excesso simultâneo |
| Dados | Histórico, Tabela, Relatório no mesmo painel contextual | Metal e propriedades, Medições e cálculos, Arquivos, Relatório e Caderno |
| Estado e foco | `sync`, `apply`, `open/close`, `save`, foco restaurado | `BaseDemoSI` controla docas e foco; SILM não cria estado de ciência paralelo |
| Geometria | Insets medidos no palco; mobile como bottom-sheet | Colunas realmente reservadas no desktop pela cena científica de rede/estrutura; bottom-sheet no mobile |
| Permissões | `groupAllowed`, `verDisponivel`, ActivityContext | `moduleAllows`, sessões/roteiros, `lockedModule` e disponibilidade científica |

### Não copiar literalmente

- Recipientes, reagentes, pH e ações de titulação pertencem ao SIAB, **não** ao motor do SILM.
- No SILM, o módulo Explorar aplica fenômenos no palco físico; Medir e Calcular têm ferramentas científicas próprias.
- Dados do metal precisam continuar distinguindo observação do modelo, informação tabelada e previsão computacional, com condições originais de referência; não converter automaticamente à CNTP.
- A seleção de unidades e a navegação entre sítios são da cena do SILM; não substituir pelo gerenciamento de tubos do SIAB.
- A grade espacial SILM preserva o conteúdo central com docas abertas; o SIAB usa padding/insets medidos para esse resultado.

## Modificações incorporadas nesta etapa

1. A Montagem segue a organização comprovada do SIAB: `Preparo` fica responsável pelo metal/início e `Unidades` pela construção/organização. O resumo mostra os dados sem reproduzir a mesma informação em dois parágrafos.
2. A aba `Módulo` permanece em Montagem, como no SIAB. Os cartões continuam expansíveis; descrições de uma frase e estado ativo.
3. No `Ver`, controles adicionais de exibição/comparação que duplicavam o catálogo são eliminados. O catálogo existente aparece no segundo nível, em `Mais visualizações`, mantendo seus IDs e `BaseDemoSI`.
4. Em `Dados`, opções do catálogo e links ao Relatório/Caderno tornam-se compactos; fichas científicas, registros, fontes e arquivos permanecem acessíveis por navegação progressiva.
5. Inventário de unidades remove a legenda idêntica sob cada unidade, mantém rótulos acessíveis e o comando `focusUnit`.
6. Os testes Playwright verificam hierarquia, contagem, navegação, exclusão mútua de docas, largura reservada, acessibilidade e preservação de fontes abertas.

## Homologação a concluir

- Verificar nas três engines Chromium, Firefox e WebKit as ações reais de Montagem → Preparo → Unidades, troca de módulos, expansão de visualizações e consulta de Dados.
- Exercitar fluxos de Medir e Calcular com registros efetivos e ida/volta do relatório, sem regressões de foco.
- Testar roteiro bloqueado e a elegibilidade de materiais sem estrutura disponível.
- Manter o PR em rascunho até os workflows da versão final passarem.
