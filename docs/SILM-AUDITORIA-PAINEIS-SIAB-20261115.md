# SILM — Auditoria funcional e remodelação das docas Montagem, Ver e Dados

**Data:** 15/11/2026 · **Branch:** `fix/silm-paridade-dados-montagem-20261115` · **PR:** #167 (rascunho, sem merge).

## Referências reais: SIAB × SILM

- SIAB: [workspace.js](https://github.com/qui-x/acidobase/blob/acidosebases1.0.0/js/ui/workspace.js), [ver-investigacao.js](https://github.com/qui-x/acidobase/blob/acidosebases1.0.0/js/ui/ver-investigacao.js), [modulos.js](https://github.com/qui-x/acidobase/blob/acidosebases1.0.0/js/ui/modulos.js), [workspace.css](https://github.com/qui-x/acidobase/blob/acidosebases1.0.0/css/workspace.css).
- SILM: `index.html`, `integracao/base-core.js` (estado das docas, foco e armazenamento), `integracao/adapter.js` (investigação e cena), `integracao/workspace-family.js` (Ver e navegação), `integracao/scientific-tools.js` (Medir e Calcular), `domain/silm/state.js` (estado científico) e `integracao/workspace-family.css`.
- **Não copiar os recipientes do SIAB.** No SILM, o objeto cotidiano é uma referência didática e a estrutura é um modelo cristalográfico; não existe correspondência automática entre cada átomo renderizado e a metalografia real do produto.

## Regra de propriedade da interface

**Montagem prepara e define contexto; Ver manipula e observa; Dados documenta e apresenta resultados.**
Nenhuma doca deve oferecer novamente uma operação cujo estado já é determinado por outra etapa.

### Doca Montagem

| Recurso auditado | Decisão | Justificativa e destino |
|---|---|---|
| Escolher metal / Tabela Periódica | **Manter em Preparo** | Entrada manual, pesquisa por símbolo e acessibilidade; não recria estrutura durante uma simples consulta |
| Iniciar investigação | **Manter contextual** | Ao escolher um objeto, a investigação já iniciou. Nesse contexto a ação muda para **Nova montagem livre**, preservando confirmação de substituição |
| Montagens prontas | **Secundário** | Link para biblioteca de estruturas já existe; deixar em Outras opções |
| Adicionar centro metálico / Organizar em rede | **Somente montagem livre** | São comandos de autoria manual, não pré-requisitos para investigar objetos |
| Editar disposição livre | **Secundário em Preparo** | Permite retornar intencionalmente à montagem inicial, sem disponibilizar botões inúteis na estrutura já organizada |
| Aba Unidades | **Remover** | A cena já apresenta os centros e oferece foco, vizinhança e navegação. Lista de unidades no painel duplicava esse espaço, e na escala Objeto/Grãos ficava desativada |
| Módulo | **Manter** | Três cartões Explorar/Medir/Calcular, com uma escolha científica verdadeira; seletor HTML legado segue oculto como adaptador |
| Resumo | **Somente contexto** | Metal, objeto (quando presente), estrutura e módulo. Excluir contagens de medições/cálculos e tabelas de propriedades, que pertencem a Dados |
| Roteiro | **Somente atividade guiada** | Mostra a orientação quando a sessão existe; nunca duplica as ferramentas de Ver |

**Preparação automática do objeto:** `investigateWorkshopReference()` utiliza `ensureWorkshopCrystal()` para construir o modelo de referência com `beginAssembly/addUnit/organize` do motor existente. O objeto continua inicialmente na escala 1. Elegibilidade e proveniência da geometria são preservadas; uma estrutura ausente não pode ser inventada. A montagem livre continua existente como modo científico independente.

**Persistência:** a categoria legada `objetos` em preferências antigas de workspace é migrada para `preparo`, sem corromper estado ou reabrir uma aba inexistente.

### Doca Ver

| Recurso auditado | Decisão | Justificativa e destino |
|---|---|---|
| Elétrons, cinco propriedades e comandos estruturais | **Manter contextual** | Fenômenos reais e ações permitidas na escala e módulo ativos, sem alterar dados de referência |
| Ferramentas diretas de Medir | **Manter** | Um único seletor visual: escolha do instrumento na faixa de Ver; seleção dos pontos na cena; unidade/andamento no contexto |
| Fórmulas diretas de Calcular | **Manter** | Escolha na faixa de Ver; entradas e origem dos valores no contexto do cálculo |
| Segundo seletor de instrumentos / fórmulas | **Ocultar** | Espelho de compatibilidade fica no DOM, sem duas escolhas simultâneas no painel |
| Premissas de cada fórmula | **Recolher** | Informação científica indispensável permanece acessível sob demanda, sem repetição da expressão já mostrada |
| Ajustes de exibição | **Manter secundário** | Sobreposições de propriedade, rótulos e legendas; não alteram o modelo científico |
| Destacar centros com segundo estado paralelo | **Remover do catálogo** | Identificação de centros já tem ação direta; um segundo interruptor tinha estado independente e comportamento confuso |
| Comparações A/B apenas textuais | **Remover do catálogo** | Não exibem duas cenas nem medições comparáveis; não devem ser anunciadas como ferramenta visual implementada |
| Instrumentos/cálculos cadastrados como “outra visualização” | **Remover do catálogo** | Já estão disponíveis diretamente no módulo correto |
| Troca de módulo dentro de Ver | **Remover** | Propriedade exclusiva de Montagem → Módulo |

A navegação da rede, câmera, controles de propriedades locais e Travessia permanecem na **área da cena**. Ver não deve reproduzir as mesmas ações em outro lugar por conveniência de layout.

### Doca Dados

| Recurso auditado | Decisão | Justificativa e destino |
|---|---|---|
| Metal e propriedades | **Manter** | Dados de referência, elegibilidade, fase/composição quando registrada, unidades, fontes, condições experimentais e distinção entre medição, estimativa e previsão computacional |
| Medições e cálculos | **Manter** | Resultados registrados nesta investigação com procedência e histórico, não valores fictícios da câmera |
| Arquivos / importar-exportar JSON | **Manter** | Persistência, transporte de investigação e retorno seguro |
| Relatório / Caderno | **Manter como acesso direto** | Documentos específicos, sem gerar relatórios dentro de Montagem |
| Cabeçalho repetido “Dados científicos e fontes” | **Remover** | O conteúdo “Metal e propriedades” já possui sua hierarquia interna |
| Valores numéricos em Montagem/Ver | **Não duplicar** | O resultado de uma ação pode aparecer como aviso transitório em Ver, mas seu registro e fontes ficam em Dados |

**Regra científica transversal:** usar as condições originais das fontes (temperatura, pressão, composição, fase, pureza, processo, ensaio), sem converter automaticamente para CNTP. Não misturar inferência da imagem do objeto com evidência experimental ou valor de literatura.

## Acessibilidade, estado e integração

- `BaseDemoSI` continua dono do abre/fecha, exclusão mútua, foco, mobile bottom-sheet e preferências.
- `SILM.model` continua sendo o único estado científico. A retirada de um controle de UI **não remove** `addUnit`, `organize`, `restoreFree`, `setModule`, `addMeasurement` ou `addCalculation`.
- O palco ocupa a coluna central reservada, sem sobreposição das docas em desktop, e sem scroll global no celular.
- IDs legados de seletores necessários ao controlador sobrevivem ocultos; o usuário só encontra o comando correto em cada local.
- Não copiar visuais do SIAB literalmente: reaproveitar hierarquia, apresentação progressiva, foco e estados de disponibilidade.

## Contratos de regressão

1. Escolher objeto homologado prepara o modelo estrutural **sem clique em Adicionar centro**, preserva escala Objeto e seus metadados.
2. Selecionar metal + iniciar montagem livre expõe operações de autoria apenas em Preparo.
3. Alternar para estrutura cristalina recolhe a edição livre; voltar a ela é uma ação intencional.
4. Uma só escolha de módulo, localizada em Montagem, atualiza a disponibilidade de Ver e mantém intactos dados científicos da investigação.
5. Alternar Montagem / Ver / Dados não oculta a cena, nem desloca controles para fora do viewport ou muda o modelo.
6. Abrir fontes em Dados e produzir uma mudança de estado não deve fechar o detalhe consultado.
7. A documentação de relatório e o fluxo de roteiros devem continuar funcionando após a remoção das abas obsoletas.
8. Testar Chromium, Firefox e WebKit, desktop e mobile, cache offline, microestrutura/atlas e auditoria permanente.

## Restrições de homologação

A implementação permanece no PR #167 **sem merge** até completar testes de paridade, roteiros, microestrutura, responsividade, dados e offline. Verificar novamente a `main` antes da integração, pois as mecânicas de plasticidade (PR #172) e o lote de referências (PR #171) estão em desenvolvimento paralelo.
