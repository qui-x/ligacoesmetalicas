# SILM — Etapa 76: Eu e Lu, dureza e deformação; rastreabilidade sem extrapolação

**Data:** 14/11/2026. **Status:** pesquisa documental. **Condições-padrão SILM:** 273,15 K e 101325 Pa. Nada aqui é homologado quantitativamente nessas condições.

## Resultado validado por consulta à Tabela I (página impressa 9), Simmons, AECU-4423 (1959)

| Metal | Dureza por pirâmide de diamante, carga 10 kg | Condição do metal | Aplicação permitida |
|---|---:|---|---|
| Eu | 17 DPH | como preparado (Ames/Daane); recozimento não informado | ficha descritiva, referência condicional |
| Lu | 118 DPH | como preparado, destilado e fundido por arco | ficha descritiva, referência condicional |
| Lu | 77 DPH | recozido sob vácuo (~900 °C, duração não descrita) | comparar **amostras do estudo**, sem motor de deformação |

A diminuição relativa da dureza de Lu após o recozimento na tabela é ~34,7%, apenas comparação entre duas observações, **não** porcentagem de ductilidade, redução de tensões, propriedade universal do metal ou parâmetro de velocidade de recozimento. A fonte é uma **síntese de medidas do Ames**, e o estudo original de Daane não foi reaberto neste lote. Foram conferidas visualmente a tabela e as notas no PDF de Simmons.

## Qualitativo de Eu confirmado por laboratório

A ficha oficial de manuseio do Ames Laboratory registra que Eu pode passar por extrusão, trefilação por martelamento/swaging e laminação a frio, sob proteção contra o ar; também recomenda alívio de tensões entre 275 e 300°C durante cerca de 8h em condições de controle atmosférico. Isso **não** estabelece alongamento à ruptura nem curva tensão–deformação para o SILM. Foi conferida visualmente a página do documento.

## Confronto com os registros existentes

- A matriz Etapa 72 já inclui módulo de Young condicional **18,2 GPa (Eu)** e **68,6 GPa (Lu)**, corroborados pela Tabela 11 do *CRC Handbook* 84ª ed., página impressa 4-119. Não cadastrar como novos valores. A captura da tabela do CRC pelo navegador falhou devido ao tamanho do PDF; seu texto tabular foi inspecionado, com limite de validação visual documentado.
- A mesma tabela CRC tem **traços** para alongamento uniforme de Eu e Lu; **17% refere-se a Sm**, não a Lu. Não atribuir um dado ao elemento errado pela disposição de colunas.
- A Etapa 38 guardava candidato de fornecedor para Lu (`~15%` alongamento, `~275 MPa` UTS) **sem amostra, método ou temperatura primários**. Não elevar a medição homologada.
- A Etapa 64 já possui Lu fundido em **compressão**, plasticidade de **12%**, documento histórico Savitskii 1963. Não é tração nem alongamento à ruptura e **não foi duplicado**.
- A Etapa 75 reuniu extrusão de Eu e interpolação de Pm; esta etapa se limita à dureza e processo, sem reaproveitar porcentagens como limites materiais.
- O PR #145 de compressão está na `main`; PR #146 do motor de superfície segue separado.

## Contrato científico para a microestrutura

1. Controle de deformação: exibir sinais qualitativos de alteração de grãos e endurecimento por deformação **somente quando a mecânica geral for didaticamente calibrada**, nunca a partir de uma regra universal dureza → deformação.
2. Recozimento: como exemplo histórico, mostrar diferença de condição de preparo de Lu, sem interpretar 118→77 DPH como uma lei para toda temperatura e duração.
3. Aparência de Eu: separar oxidação de superfície da deformação interna; proteger o modelo contra o falso encadeamento `dureza -> brilho`.
4. Interface: legendas `experimental histórico`, `compilação`, `candidato de fornecedor` e `não homologado na CNTP`. Não inserir números de dureza como velocidades ou deformações calculadas.
5. Medir/Calcular: nenhum registro desta etapa habilita força absoluta, tensão ou deformação de ruptura na ausência de geometria, curva constitutiva e amostra controlada.

## Fontes

- Simmons, C. R. (1959), *The Mechanical Properties of Yttrium, Scandium, and the Rare Earth Metals*, AECU-4423, Tabela I p. 9: https://digital.library.unt.edu/ark:/67531/metadc1248886/m2/1/high_res_d/metadc1248886.pdf
- Ames Laboratory, *Recommended Handling Procedures for: Europium*, seções IV-VI: https://www.ameslab.gov/sites/default/files/inline-files/Handl_Proced%3DEuropium%20%281%29.pdf
- *CRC Handbook of Chemistry and Physics*, 84th ed., K. A. Gschneidner, Table 11, p. 4-119: https://fap.if.usp.br/~jhsevero/Fisica_Experimental_C_Semestral_2022/crc.pdf

**Integridade:** 3 observações novas de dureza, nenhuma medição nova de alongamento em tração para Eu/Lu, nenhum campo `engineRelease=true`, nenhum merge automático.
