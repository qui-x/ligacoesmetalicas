# SILM — Etapa 75: evidências de processabilidade, sem homologação de motores

Data: 2026-11-14. Escopo: conferência cruzada com `SILM_matriz_cientifica_92_metais_etapa72_reconciliada.json`. Esta etapa **não altera catálogo, motores, CNTP, propriedades de cena nem os 230 perfis mecânicos anteriores**.

## Achados novos

| Metal | Evidência documental | Classificação |
|---|---|---|
| **Eu** | Ames Laboratory (1962), seção 6.5: extrusão à temperatura ambiente de tarugo de diâmetro 1 in em fio de 1/8 in, pressão nominal de **16.000 psi**; razão geométrica de áreas deduzida: **64:1** | Ensaio de **processabilidade**, não tensão de escoamento, maleabilidade intrínseca ou alongamento à ruptura |
| **Pm** | Battelle-Northwest (1965): alongamento **7%** para material fundido e **0,2%** para material deformado a frio, a **27 °C** | **Interpolação explícita** de Nd e Sm; **não** é tração experimental do Pm |
| **Y** | Bohlander (1959), tabela III: seis observações de três lotes, reduções de **40%, 90% ou 95%**, acompanhadas de trincas; impurezas O/F/Ca/Mg registradas | Ensaios de processamento com falha observada; **não** determinam limite universal nem redução segura |

## Reaproveitamento sem duplicação

- **Er:** laminação 30%, 40%, 50%, 60% e fratura acima de 60% nas condições da pesquisa de Chen et al. (2022), com recozimento intermediário, já pesquisada na Etapa 65; não criar perfis duplicados.
- **Nd:** a tração de metal fundido da tabela de Simmons (1959) já aparece em `v33-e21-nd-004`.
- **Lu:** segue sem ensaio pontual de alongamento à ruptura conferido; o registro anterior de **compressão** não é substituto.
- **Pm:** preservar separadamente a condutividade térmica **experimental condicional** de BNWL-1309 já identificada; o relatório de 1965 não a substitui.

## Portão para aplicação

Todos os registros ficam **referenceOnly**, `engineRelease=false` e `CNTPValidated=false`. O padrão SILM é **273,15 K e 101325 Pa**. Temperaturas descritas apenas como “room temperature” têm `temperatureK=null`; pressão ambiente desconhecida é `pressurePa=null`. Nunca converter redução por laminação ou extrusão em ductilidade, limite plástico de um metal, resposta Joule ou brilho.

Os textos dos relatórios PDF foram recuperados e confrontados, mas o acesso à **imagem** das páginas OSTI/IS-500 falhou nesta sessão. Por isso `sourcePdfImageChecked=false` e a etapa permanece documental, sujeita à revisão da transcrição visual das fontes.

## Fontes

1. Ames Laboratory, *Annual Summary Report*, IS-500, 1962, sec. 6.5: https://digital.library.unt.edu/ark:/67531/metadc1032788/m2/1/high_res_d/4758484.pdf
2. H. H. Van Tuyl, *Promethium Isotopic Power Data Sheets*, BNWL-C-45, 1965: https://www.osti.gov/servlets/purl/4588014
3. K. M. Bohlander, *Mechanical Fabrication of Rare Earth Metals*, AECU-4425, 1959, Table III: https://www.osti.gov/servlets/purl/4245097
4. Chen et al., *Materials* 15(4):1370, 2022 (Er): https://pmc.ncbi.nlm.nih.gov/articles/PMC8880798/
5. C. R. Simmons, *The Mechanical Properties of Yttrium, Scandium and the Rare Earth Metals*, AECU-4423, 1959: https://digital.library.unt.edu/ark:/67531/metadc1248886/m2/1/high_res_d/metadc1248886.pdf

## Próximo controle

Rever as páginas originais dos PDFs, buscar alongamento **medido** de Eu e Lu e manter o valor de Pm como estimativa declarada. Eventual exibição em **Explorar → Microestrutura** exige painel de fonte/condições, sem alterar motores físicos.
