# SILM — Homologação computacional do Frâncio e triagem dos actinídeos Z=100–103
Data: 13/11/2026.

## Fr (Z=87) — aprovado para investigação **estrutural computacional**
- **Modelo cadastrado:** CFC (fcc), grupo espacial Fm-3m nº 225, quatro sítios convencionais.
- **Fonte numérica:** Robles-Navarro, Jerabek e Schwerdtfeger (2024), *Angewandte Chemie International Edition* 63, DOI [10.1002/anie.202313679](https://doi.org/10.1002/anie.202313679). Tabela 1, Fr/PBE-D3(BJ): distância otimizada entre primeiros vizinhos da fase fcc `R_fcc = 5,367 Å`. O parâmetro cadastrado **não foi copiado de um experimento**: `a=b=c=√2×R_fcc=7,590084… Å`, exibido com três casas decimais (`7,590 Å`). `kind=CALCULATED`, `evidenceType=computed`.
- **Fonte de contexto científico:** Robles-Navarro e Schwerdtfeger (2026), *Physical Chemistry Chemical Physics* 28, 6703–6710, DOI [10.1039/D5CP04548G](https://doi.org/10.1039/D5CP04548G). Modelo relativístico PAW/PBEsol com acoplamento spin–órbita e efeitos vibracionais. Indica disputa de estabilidade entre HC, CFC e empilhamentos compactos, com CCC ligeiramente menos estável em regime de baixa temperatura. **Não utilizar seus resultados PBEsol como se fossem os dados PBE-D3 de 2024.**
- **Limites:** não existe determinação de célula do Fr macroscópico por difração; a referência é um sólido teórico de cálculo, idealizado no limite de baixa temperatura/0 K. A pressão exata da otimização não está tabulada no excerto usado; fica ausente. Não declarar a fase CFC como única estrutura ambiente, não simular propriedades do Fr a partir de analogia com césio e não confundir os resultados atômicos de Fr com sua rede cristalina.
- **Escopo liberado:** Explorar estrutura (CFC, Rede e Centro), com fontes/condições. Propriedades específicas, Medir, Calcular e roteiros dependentes de perfis físicos continuam bloqueados pela política `structure-only`.

## Fm (100), Md (101), No (102) e Lr (103) — auditoria documental, sem liberação estrutural

- A publicação Sato *et al.* (2018), *JACS* 140, 14609–14613, DOI [10.1021/jacs.8b09068](https://doi.org/10.1021/jacs.8b09068), mede potenciais de primeira ionização desses quatro elementos em regime átomo a átomo. Tem métodos relativísticos para estados atômicos/íons. **Não** constitui determinação ou predição de uma estrutura cristalina de metal elementar a granel.
- Não foi localizada nesta triagem uma fonte reprodutível com **estrutura metálica completa** desses quatro: grupo espacial, seis parâmetros, base fracionária e condições/premissas do cálculo. Por isso continuam `INSUFFICIENT_VALIDATED_DATA` e não serão liberados só porque existe informação eletrônica ou raio atômico.
- **Próxima investigação:** procurar trabalhos de energia total/estado sólido de actinídeos finais, bases DFT confiáveis (AFLOW/OQMD/Materials Project quando houver uma entrada **do elemento puro**) e literatura experimental de deposição. Auditar estado fundamental, relatividade, configurações de valência, magnetismo e coexistência de fases para cada elemento. Não usar valores genéricos de calculadoras periódicas como evidência de célula.
- O bloqueio de superpesados Z=104–116 não é alterado por este PR.

## Contrato de validação

Fonte concreta e rastreável; elemento puro distinguido de composto; método e condição explicados; geometria completa; validação de grupo espacial, sítios, tamanho, distâncias e célula; testes em Chromium, Firefox e WebKit nas escalas 3 e 4; **origem computacional visível** na interface do Manual; bloqueio de propriedades específicas sem dados individualmente homologados.

A política geral está em `docs/POLITICA-EVIDENCIAS-COMPUTACIONAIS.md`. Este registro não implica homologação experimental ou aplicação a CNTP.
