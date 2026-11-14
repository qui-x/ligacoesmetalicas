# SILM — NIST NCNR: seis condutividades térmicas a 295 K

Data: 13/11/2026. Registro documental somente-leitura, sem parametrização física de calor no motor.

## Fonte e estado de validação

NIST Center for Neutron Research, "Reference Tables", seção "Physical properties of selected metals at 295K":
https://www.nist.gov/ncnr/neutron-instruments/sample-environment/sample-mounting/reference-tables

A página declara como referências de compilação:
- G. K. White, Experimental Techniques in Low-Temperature Physics, 3rd edition, Oxford University Press (1979).
- Robert C. Weast (ed.), CRC Handbook of Chemistry and Physics, 56th edition (1975).

Esta é uma **tabela institucional de valores de referência compilados**, não uma nova medida experimental individual de laboratório com amostra, pureza e tratamento metalúrgico informados. A página NIST é fonte rastreável da compilação, mas a identidade da amostra de cada valor e sua pressão experimental não estão especificadas; não se pode classificar cada valor como P1 primário.

## Dados transcritos (exatamente 295 K)

| Elemento | Símbolo | Condutividade térmica [W/(m·K)] |
|---|---|---:|
| Alumínio | Al | 235 |
| Cádmio | Cd | 97 |
| Cobre | Cu | 400 |
| Ouro | Au | 317 |
| Índio | In | 87 |
| Chumbo | Pb | 35 |

Não incluir os valores "stainless steel 304" e "brass (70 Cu 30 Zn)" da mesma tabela como valores de metal elementar, porque são ligas. Ferro (Fe) **não** tem entrada nessa tabela NIST; não copiar a condutividade do cobre para ferro ou qualquer outro elemento.

## Limites e interpretação

- A temperatura da tabela é **295 K**, ou 21,85 °C; a CNTP clássica definida no SILM é **273,15 K e 101325 Pa**.
- A pressão de ensaio/compilação não é documentada numericamente. Não presumir 1 atm.
- Nenhum valor é transportado de 295 K para 273,15 K automaticamente. Não extrapolar sem modelo validado por metal e faixa de temperatura.
- A tabela não informa fase, pureza, defeitos ou condutividade direcional. Esses seis valores não parametrizam sozinhos um material metalúrgico específico.
- O dado é **um resumo pontual de k**, não uma curva k(T), nem difusividade térmica, calor específico ou entrada suficiente para um solver acoplado com Joule.

## Integração ao programa

- Dados em domain/silm/data/research-thermal-nist-295k.js; registros congelados e imutáveis por número atômico.
- Controles do **módulo Explorar → Condutividade térmica** em domain/silm/property-view.js, exibindo somente o valor do metal selecionado quando houver correspondência. Sem nova janela, rota ou aplicação paralela.
- Cada leitura apresenta temperatura 295 K, unidade W/(m·K), fonte clicável e aviso **não homologado na CNTP**.
- Metadados: CNTPhomologated=false, referenceOnly=true, engineRelease=false, sourcePressurePa=null.
- Nenhuma alteração científica em domain/silm/thermal.js, domain/silm/electrothermal.js, domain/silm/material-engine.js para assimilação de k; a experiência de calor permanece qualitativa/relativa nas condições previstas.
- Arquivos JS adicionados ao cache offline e testes estáticos + mobile/desktop Chromium/Firefox/WebKit.

**Etapa seguinte:** recuperar valores ρe(T) e k(T) com funções e intervalos de temperatura documentados para metal/amostra/fase; a fonte de 295 K aqui não substitui um ponto 273,15 K.
