# Consolidação das branches — 19/10/2026

## Origens revistas

| Origem | Commit revisto | Aproveitamento |
|---|---|---|
| main | 1dcbf8da15ba01cba54f4ba10f22bc818e9f6f49 | SILM 0.11.0 e correções anteriores preservados |
| integracao/base-0.9.8 | 23772b103a0c7625ef72c102fcbe0972d97d24ca | Snapshot verificável da base atual, shell de integração e testes próprios |
| claude/optimistic-cerf-167d72 | b0927cebf890ac123ee49fc79c9b31c432f1bdba | Representação 3D, migração da câmera, controles, testes e documentação da 0.12.x |

A branch 3D estava marcada como em verificação. A falha registrada na auditoria era a ausência de `RELATORIO-BUILD-TESTES-0.12.0.md`. O relatório foi gerado a partir da execução consolidada, sem reutilizar como resultado atual a evidência histórica da branch.

## Ajustes da consolidação

- Corrigido o reenquadramento 3D: a câmera vai para `crystal3d`, sem sobrescrever a câmera 2D `crystal`.
- A porta da nova base foi adaptada ao representationState v2, incluindo órbita, planos, perspectiva, retorno ao 2D e restauração do foco.
- A suíte da nova base verifica que reenquadrar um plano 3D preserva a câmera 2D.
- Corrigido o ajuste vertical da tabela periódica: os paddings e os dez intervalos da grade são descontados e o espaço entre blocos foi reduzido de 10 para 8 px, eliminando o excedente de 3 px encontrado no tablet de 1024 px.
- Banco científico, serviço de estado (schema 8), medições e fórmulas de cálculo não foram alterados.
- Testes aceitam um Chromium alternativo e argumentos explícitos; o servidor usa o mesmo endereço IPv4 ao escutar e ao navegar.

## Entradas do produto

A distribuição completa continua em `index.html`, na série 0.12.0. A entrada `integracao/index.html` usa a Base Demo SI 0.9.8 com investigação e representação 2D/3D, em armazenamento separado. Medir, Calcular, propriedades, atividades e relatórios ainda não foram portados integralmente para essa entrada; permanecem na distribuição completa.

A atualização de main foi autorizada diretamente pelo autor. As branches de origem são preservadas. Não foi criada tag nem gerado novo pacote ZIP de release nesta consolidação.

## Validação

- Build da distribuição e build da integração: PASS.
- Suíte de navegador da distribuição: 238 aprovados, 0 reprovados, 0 erros de console.
- Após corrigir o ajuste da tabela, o teste 0.10.1-R06 foi reexecutado em 1920×1080, 1366×800, 1024×768, 768×1024 e 390×844; os resultados foram mesclados pelo executor da suíte.
- Suíte da nova base: PASS, incluindo órbita sem alterar a ciência, independência entre câmeras 2D/3D, importação acima de 8 KB, persistência e fluxo responsivo.
- Auditoria: 38 aprovadas, 0 reprovadas. O relatório obrigatório da 0.12.0 está presente.
- Gecko/WebKit e dispositivos físicos continuam pendentes; a migração integral para a nova base não é declarada concluída.

Evidências: `RELATORIO-BUILD-TESTES-0.12.0.md`, `evidence-0.12.0/RESULTADOS-NAVEGADOR-0.12.0.json` e `evidence/AUDITORIA-SILM.json`.
