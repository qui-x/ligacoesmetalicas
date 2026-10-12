# Auditoria de universalização

## Origem e rastreabilidade

Origem exclusiva: `BASE-ESTRUTURAL-0.1.0.zip`. SHA-512:

```
830912e48c136088b8dcfba0817c42ab3cd4daca834ff05636b02670f45efda9fed4a00b86e05f123f16251c020ca570c825b0e5a209ab72b5784c720b830b9d
```

A 0.2.0 foi criada em pasta independente. O ZIP 0.1.0 foi reverificado ao concluir a compatibilidade. Nenhum arquivo da origem congelada foi sobrescrito. SIAB original e SILQ-Metálicas não foram utilizados como fonte de implementação da 0.2.0 e não foram modificados. A origem histórica contém ciência; essa presença no arquivo congelado não é dependência do novo runtime.

O prompt completo foi executado por checkpoints. O rascunho que precedeu esse prompt foi separado e uma cópia íntegra foi restaurada antes da fase 1. `0.2.0/CHECKPOINTS.json` contém datas, testes e hash do runtime de cada gate. Os registros iniciais são históricos, não uma alegação de que a mesma árvore final existia em todas as fases.

## Inventários verificáveis

| Arquivo | Conteúdo |
|---|---|
| `0.2.0/INVENTARIO-ORIGEM.csv` | Classificação A/B/C/D/E dos 307 arquivos originais e hashes |
| `0.2.0/MAPA-ORIGEM.json` | Índice de dependências globais, estado, eventos, seletores e funções em 78 arquivos |
| `0.2.0/FASE-1.md` | Análise de responsabilidades e decisões anterior à neutralização |
| `0.2.0/REMOVIDOS.json` | 289 caminhos excluídos da cópia depois do checkpoint 2; alguns receberam substitutos neutros posteriores |
| `0.2.0/DESTINO-ORIGEM.csv` | Situação final de cada caminho original: mantido, adaptado ou fora da distribuição |
| `0.2.0/AUDITORIA-TERMOS.json` | Todas as ocorrências dos termos pesquisados no runtime e sua classificação |
| `0.2.0/MEMORIA.json` | Medição original da fase 18 |
| `0.2.0/evidence/` | Resultados atuais e capturas de compatibilidade |

O índice estático utiliza padrões lexicais. Não é uma prova formal de todas as dependências dinâmicas, callbacks anônimas ou campos calculados. Decisões de remoção combinaram inspeção de responsabilidade, árvore de scripts, testes da cópia original e testes após neutralização. Nenhum módulo foi classificado como morto só pela ausência de import ES.

## Destino dos subsistemas

| Subsistema original | Decisão na 0.2.0 |
|---|---|
| A11Y: memória, URL, saneamento, filtros e aplicação HTML | Mantido e adaptado: chave neutra, preferências preservadas, parâmetros externos mantidos |
| Compatibilidade, `dialog-polyfill`, licenças | Polyfill e licenças preservados; inicialização e seletor de falha neutralizados |
| Workspace: open/close/apply/geometry/refresh | Extraído e parametrizado em docas neutras, foco, sheets, insets e apresentações |
| Grupos, seletores e contexto científico das docas | Retirados; callbacks do módulo controlam conteúdo e relevância |
| Cabeçalho, ações, identidade e ícones | Shell neutro; manifesto externo fornece identidade e callbacks |
| Mobile associado a recipientes e dosagem | Retirado; conservados contratos de sheet, safe area, alvo de toque e região central |
| Estado global e loja associados a bancadas | Retirados; core expõe apenas infraestrutura e eventos |
| Renderer de bancada, instrumentos, gráficos científicos, partículas | Retirados; host sem renderer obrigatório com contrato de dimensão/entrada |
| Manual: busca normalizada e ordenada | Algoritmo derivado preservado, com registro de conteúdo externo |
| Manual: navegação, cards, foco, acordeões, índice e impressão | Parametrizados; nenhum tópico original no runtime |
| Manual: geradores, diagramas e conteúdo científico | Retirados |
| Utilitários de notificação e modal | Extraídos com título, conteúdo, ações e ownership por domínio |
| Persistência com contingência em memória | Adaptada por namespace; schema científico não incorporado |
| Migração de dados e estado científico | Retirada; somente preferências estruturais autorizadas são lidas |
| PWA/SW e manifesto | Cache por escopo/versão mantido como arquitetura; identidade, recursos e namespace neutralizados |
| Controles, tipografia, foco e famílias de botão | Regras estruturais extraídas; cores e geometria separadas |
| CSS de ciência, seletores e dimensões específicas | Retirados; breakpoints neutros centralizados |
| Dados químicos, motores, catálogos, relatórios e sequências pedagógicas | Fora da distribuição 0.2.0 |
| Documentação e testes científicos da baseline | Permanecem no ZIP 0.1.0; evidência atual possui diretório próprio |
| CHANGELOG | Histórico preservado e entrada 0.2.0 acrescentada |

O runtime não carrega motores, dados, relatórios, missões, instrumentos ou manuais químicos. A demo utiliza apenas três blocos SVG e um contador. Não há lógica específica de outro simulador no core.

## CSS, DOM e termos

A auditoria procura os termos do prompt, variantes em português/inglês e namespaces legados em JS, HTML, CSS, SVG e manifesto, excluindo documentação, scripts de desenvolvimento e testes. As 13 ocorrências atuais são nomes técnicos de “Base” ou referências explícitas de migração. Não há ocorrência científica não classificada. `backdrop` designa uma superfície de UI; não significa gotejamento.

Verificação DOM cobre IDs duplicados, referências `aria-controls`, labels, painéis/contexto, troca de host, ações registradas e caminhos de scripts/estilos. Testes visuais e funcionais exercitam renderização real, porque localizar texto por regex não garante funcionamento.

Os tokens estruturais ficam em `tokens-structure.css`; os temáticos em `theme.css`. A API só aceita cores da whitelist. `config/breakpoints.json` é a fonte para marcadores CSS e `js/core/breakpoints.js`.

## Preservação e limites

A preservação é da infraestrutura e dos seus comportamentos documentados, não equivalência pixel a pixel da aplicação científica. A remoção do domínio altera deliberadamente textos, ferramentas, identidade e quantidade de telas. Não foi introduzido framework nem importado código SILM/SILQ.

Recursos geridos são encerrados pelo lifecycle. A responsabilidade por código externo que ignore o escopo permanece com o domínio. Memória foi medida em ciclos reais controlados; não se afirma ausência universal de vazamentos para módulos ainda inexistentes.

A consolidação e o hash do ZIP são externos para evitar autorreferência. A etapa de congelamento ocorre após os testes finais das fases 23–25, respeitando a exigência da fase 22 de consolidar somente após aprovação interna. Nenhuma modificação do ZIP é autorizada por esta auditoria depois de congelado.
