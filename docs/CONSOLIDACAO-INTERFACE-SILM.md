# Consolidação da interface — 0.12.1

A entrada principal index.html utiliza a nova Base SI. Ela é gerada a partir de integracao/index.html por scripts/build-main-entry.cjs, evitando divergência de caminhos. completo.html preserva integralmente a interface científica anterior.

## Aproveitamento das duas interfaces

| Origem | Recurso aproveitado | Situação |
|---|---|---|
| Base SI | Navegação, docas responsivas, acessibilidade e preferências | Entrada principal |
| SILM | Ouro/grafite, símbolo e tema A Arquitetura dos Metais | Adaptados aos tokens da Base SI |
| SILM | Banco científico, montagem, cristais e representações 2D/3D | Mesmos serviços, sem duplicar cálculos |
| SILM | Medir, Calcular, propriedades, atividades e relatórios | Preservados em completo.html; migração pendente |
| SILM | Abertura animada e seletor periódico | Preservados na interface anterior; adaptação pendente |

O armazenamento da nova interface permanece separado para não sobrescrever sessões anteriores. Investigações podem ser transferidas por JSON. Nenhuma exclusão de localStorage é necessária.

Base verificada em 19/10/2026: 0.9.11, commit e087c9214ca5eaeb3ac5ba00923295bd9d53f3b7. O snapshot permanece 0.9.8: tour, presets e feedback novos precisam de adaptação ao domínio SILM antes de incorporar seus controles.

Validação: suíte de integração executada na entrada principal, com montagem, cristais, câmeras 2D/3D, persistência, exportação/importação e painéis móveis. O service worker muda o cache para 0.12.1 e inclui recursos das duas interfaces.
