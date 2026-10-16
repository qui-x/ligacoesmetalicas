# SILM 0.10.0 — Módulo Calcular

**Origem executável:** SILM 0.9.1 (`entregas/SILM-0.9.1.zip`, SHA-512 `c0ebba7d3e60b05062781a5bff882610c56fde3789eacf843926e2df6bdae314e91fd2838fc7b12cc4962f93a54d5051696205a3718329b87d42635a7bb27546`). A 0.9.1 é a correção de homologação da 0.9.0 pedida pelo autor; o prompt da série cita a 0.9.0 homologada. A regra de parada (§26) foi dispensada pelo autor, que pediu a execução contínua das séries até a 0.17.x.

## Objetivo (§2)

> estrutura científica → medidas / dados válidos → relação matemática → resultado interpretável. Não criar calculadora genérica.

## O que esta versão implementa

1. **Catálogo central de fórmulas** (`SILM.formulas`). Treze fórmulas com id, nome, expressão legível, equivalente falado, aplicabilidade, entradas exigidas com origens permitidas, unidade de saída, modelo, referências e notas. Nenhum componente de interface contém fórmula. Ver [`FORMULAS-CRISTALOGRAFICAS.md`](FORMULAS-CRISTALOGRAFICAS.md).
2. **Cálculos da série (§6–§13):**
   - número efetivo de átomos com decomposição geométrica;
   - volume da célula (`a³`; prisma hexagonal `(3√3/2)·a²·c`);
   - raio ↔ parâmetro (CCC e CFC; HC pela menor distância entre vizinhos, sem fórmula cúbica);
   - fator de empacotamento de esferas rígidas, com intermediários;
   - densidade teórica `ρ = n·M/(N_A·V)`, com análise dimensional;
   - `c/a` no HC, com o ideal √(8/3) como referência geométrica.
3. **Quatro origens de valor (§3)** em todas as entradas: Dado tabelado, Medida do modelo, Valor informado e Calculado pelo SILM. Há ainda as constantes definidas. O SILM nunca troca uma medida por um valor tabelado sem mostrar.
4. **Serviço de constantes (§14)** com valor, unidade e fonte: N_A exato do SI 2019, Å³ → cm³ e (c/a)ideal. **Conversões centralizadas (§15):** pm, nm, nm³, cm³, m³ e kg/m³. Ver [`CONSTANTES-CIENTIFICAS.md`](CONSTANTES-CIENTIFICAS.md).
5. **Interface (§16–§18):** Ver → Calcular mostra só os cálculos compatíveis com a estrutura e permite uma operação por vez. A estrutura continua visível, com destaque da geometria do cálculo. As fórmulas aparecem em notação matemática com equivalente acessível. O modo assistido mostra a origem de cada valor, e o campo informado é numérico, com vírgula decimal. Ver [`MODULO-CALCULAR.md`](MODULO-CALCULAR.md).
6. **Dados → Cálculos (§19–§20):** reabrir, remover e limpar. Um cálculo alimenta outro por referência (`dependsOn`), sem planilha reativa, e registros antigos nunca são recalculados em silêncio.
7. **Comparação com referência (§12):** o parâmetro calculado aparece ao lado do valor tabelado, sem chamar a diferença de erro experimental.
8. **Schema 8:** `scientificState.calculations[]`, com migração 7 → 8 e validação que recalcula cada registro. Ver [`CONTRATO-CALCULOS.md`](CONTRATO-CALCULOS.md) e [`SCIENTIFIC-STATE.md`](SCIENTIFIC-STATE.md).

## Decisões registradas

1. **Célula do HC: prisma hexagonal convencional** (3 células primitivas), com `n = 6` e `V = (3√3/2)·a²·c`. A célula primitiva não é usada, para não misturar definições (§7, §8).
2. **Raio no HC pela menor distância entre vizinhos**, `r = ½·mín(a, √(a²/3 + c²/4))`. Essa forma vale para qualquer c/a e não supõe o empilhamento ideal. A relação inversa `r → a` no HC exigiria fixar c/a e não é oferecida.
3. **Massa molar = peso atômico padrão (CIAAW) em g/mol.** Quando o peso padrão é um intervalo (por exemplo, Mg), a densidade também é um intervalo. Nenhum valor central é inventado.
4. **Sem densidade experimental para comparar.** O banco não traz densidade medida com fonte, e o SILM não registra dados de memória. A comparação lado a lado existe hoje para o parâmetro `a`.
5. **Apresentação com 4 algarismos significativos**, sem regra sofisticada de significativos sem homologação (§21). Os valores canônicos são guardados sem arredondamento.
6. **Mesmas pré-condições das medidas:** sem estrutura, montagem livre ou deformação aplicada, não há cálculo absoluto, e o motivo fica à vista.
7. **Uma definição para cada número:** o (c/a)ideal vem do modelo cristalográfico (`SILM.crystal`) e o serviço de constantes o reexporta. A auditoria recusa constantes repetidas fora do serviço.
8. **A fonte da constante de Avogadro** (`src-bipm-si-2019`) foi conferida pelo IUPAC Gold Book, porque o PDF da BIPM estava bloqueado na rede do ambiente. Isso está registrado nas notas da fonte.
9. **Invariante de série anterior atualizada sem perder a intenção:** 0.9-MIG passa a verificar a migração da 0.8.x até o schema atual (como a 0.7-MIG desde a 0.9.0), em vez de fixar o número 7.

## Paridade de família

A revisão estética e de interação SILM × SIAB, pedida pelo autor nesta série, está em andamento com ele, item por item. As mudanças aprovadas entram na Base Estrutural 0.3.0, um produto entregue diretamente ao autor e mantido fora deste repositório, e o SILM as adota numa versão posterior como correção de origem declarada. Esta versão não muda a interface herdada.

## Documentos

- [Módulo Calcular](MODULO-CALCULAR.md) · [Contrato dos cálculos](CONTRATO-CALCULOS.md) · [Fórmulas cristalográficas](FORMULAS-CRISTALOGRAFICAS.md) · [Constantes científicas](CONSTANTES-CIENTIFICAS.md)
- [Arquitetura científica](ARQUITETURA-CIENTIFICA.md) · [Fontes e proveniência](FONTES-E-PROVENIENCIA.md) · [Roadmap](ROADMAP-SILM.md) · [Estado científico (schema 8)](SCIENTIFIC-STATE.md)
- [Relatório de build e testes](RELATORIO-BUILD-TESTES-0.10.0.md) · [Checklist](checklists/CHECKLIST-0.10.0.md)
