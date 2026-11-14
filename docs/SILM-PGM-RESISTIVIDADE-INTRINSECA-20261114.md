# SILM — Resistividade intrínseca Ru, Rh, Os e Ir (14/11/2026)

## Escopo
Continuação da pesquisa dos 65 metais e do catálogo de resistividade total no ponto de gelo do PR #137 (24 metais, 29 registros). Este lote acrescenta **quatro metais ainda ausentes (Ru, Rh, Os e Ir)** com **36 pontos tabulados avaliados de resistividade INTRÍNSECA** entre 230 e 300 K, incluindo valores selecionados em 273,15 K.

**Diferença científica fundamental:** resistividade intrínseca ρᵢ ≠ resistividade TOTAL ρtotal de uma amostra. A resistividade residual ρ₀ causada por impurezas/defeitos não está incluída. Aproximação de Matthiessen, quando válida: ρtotal≈ρᵢ+ρ₀. Não converter 1/ρᵢ em condutividade macroscópica de peça ou em parâmetro do Joule.

## Fontes primárias de avaliação bibliográfica, verificadas nas tabelas

- **Parte II, Rh e Ir:** J. W. Arblaster, Selected Electrical Resistivity Values for the Platinum Group of Metals Part II: Rhodium and Iridium, Johnson Matthey Technol. Rev. **60**(1), 4–11 (2016), DOI https://doi.org/10.1595/205651316X689855 . Tabelas I (Rh, p.5), II (Rh, p.6), IV (Ir, p.7), V (Ir, p.8). PDF consultado: https://pdfs.semanticscholar.org/e383/46590b596666adc25fc5f3d542d54ed79f1d.pdf .
- **Parte III, Ru e Os:** J. W. Arblaster, Selected Electrical Resistivity Values for the Platinum Group of Metals Part III: Ruthenium and Osmium, Johnson Matthey Technol. Rev. **60**(3), 179–185 (2016), DOI https://doi.org/10.1595/205651316X691618 . Tabelas I (Ru, p.180), II (Ru, p.181), IV (Os, p.182), V (Os, p.183). PDF consultado: https://pdfs.semanticscholar.org/8c54/ee0fd7cec0defa071baccfd8507630ff1070.pdf .

A precisão/erro citado do valor selecionado é a precisão de avaliação da fonte; os 36 valores NÃO são 36 novas medições diretas independentes.

## Valores selecionados em 273,15 K

| Metal | Estrutura | ρᵢ média (µΩ·cm) | ρᵢ ⟂ c | ρᵢ ∥ c | Desvio publicado |
|---|---|---:|---:|---:|---|
| Ru (44) | HC | 6,16 | 6,67 | 5,14 | ±0,05 |
| Rh (45) | CFC | 4,35 | não informado | não informado | ±0,04 |
| Os (76) | HC | 8,07 | 9,35 | 5,53 | não indicado |
| Ir (77) | CFC | 4,67 | não informado | não informado | ±0,05 |

Para metais HC, a média da avaliação segue ρᵢ,med=(2ρᵢ,⊥+ρᵢ,∥)/3, observadas as casas decimais publicadas. A avaliação do Os **não fornece as duas direções abaixo de 273,15 K** e essas células do catálogo são nulas.

## Curvas avaliadas publicadas, sem interpolação numérica
Unidade: µΩ·cm.

| T (K) | Ru | Rh | Os | Ir |
|---:|---:|---:|---:|---:|
| 230 | 4,91 | 3,51 | 6,57 | 3,82 |
| 240 | 5,20 | 3,71 | 6,92 | 4,02 |
| 250 | 5,49 | 3,90 | 7,26 | 4,21 |
| 260 | 5,78 | 4,10 | 7,61 | 4,41 |
| 270 | 6,07 | 4,29 | 7,76 | 4,61 |
| 273,15 | 6,16 | 4,35 | 8,07 | 4,67 |
| 280 | 6,37 | 4,48 | 8,38 | 4,80 |
| 290 | 6,67 | 4,68 | 8,82 | 5,00 |
| 300 | 6,96 | 4,87 | 9,25 | 5,20 |

A ligação dos pontos no gráfico da interface é auxílio visual **não corresponde a equação de interpolação**. Leitura da tabela apenas nas temperaturas explicitamente publicadas.

## Fronteira da homologação e integração

- Nenhuma fonte estabelece a pressão exata do espécime no momento da medição como 101325 Pa nem o ρ₀ da peça simulada. Portanto todos os registros são apenas referências, não valores homologados na CNTP.
- A interface apresenta uma seção própria **dentro do controle Elétrica já existente no módulo Explorar**, sem rota, miniaplicativo ou motor paralelo.
- A tabela original de resistividade TOTAL do PR #137 permanece intacta e separada por conceito. Um aluno pode investigar a variação térmica da contribuição intrínseca, mas a experiência de corrente continua qualitativa até ser fisicamente calibrável.
- Os arquivos novos não são importados pelo motor eletrotérmico, pelo solver térmico nem pelo cálculo de potência. Nenhuma condutividade macroscópica é derivada de ρᵢ.
- O cache offline inclui os dois arquivos novos e a CSS atualizada. Testes unitários de fonte, valores, anisotropia e condições, mais testes E2E em Chromium/Firefox/WebKit nas resoluções desktop/mobile.

**Próxima pesquisa:** selecionar outros elementos fora do conjunto de 28 metais elétricos documentados após esta etapa; registrar curvas específicas com fase e impurezas antes de considerar modelagem quantitativa Joule.
