# Estímulo luminoso — contrato científico e funcional

> **Etapa:** 2 do aprofundamento de Explorar.  
> **Status:** especificação para desenvolvimento; não representa implementação concluída.  
> **Escopo:** superfície de um metal elementar puro, em fase sólida e sob condições declaradas. Não abrange ligas, revestimentos, oxidação ou outros sistemas multicomponentes.

## 1. Objetivo

O estímulo luminoso deve permitir que o estudante aplique luz à amostra metálica e observe como a superfície responde. A experiência deve evoluir da reflexão geométrica já existente para uma representação da resposta óptica dependente do comprimento de onda, usando dados de referência quando estiverem homologados.

A experiência precisa distinguir:

1. **Fonte:** espectro, direção e intensidade da luz incidente.
2. **Material:** resposta óptica do metal, dependente do comprimento de onda e das condições da amostra.
3. **Interação:** reflexão na interface entre o meio incidente e o metal.
4. **Cena:** representação visual dos feixes e da aparência resultante.
5. **Evidência:** dados experimentais, constantes ópticas derivadas ou aproximação qualitativa.
6. **Limitação:** o que o resultado não permite concluir.

A finalidade em Explorar é observar o fenômeno. A exibição de um espectro numérico, a leitura de refletância por instrumento e a produção de uma medida pertencem ao contrato futuro de Medir.

## 2. O que já existe no SILM

A implementação consultada na branch especificacoes-atuais contém:

- experiência de brilho metálico no catálogo de propriedades;
- controle para incidir e apagar a luz;
- lanterna móvel na cena;
- normal à superfície, feixe incidente e feixe refletido;
- ângulo ajustável entre 5° e 80° em relação à normal;
- relação geométrica θr = θi;
- representação opaca, sem feixe transmitido;
- texto que informa a ação e a observação;
- estado persistente que guarda se a luz está ligada, enquanto o ângulo da lanterna é transitório.

Essa implementação é **geométrica e qualitativa**. Não calcula a refletância espectral do elemento, não possui resposta óptica individual por metal e não deriva a cor de uma curva de dados.

### 2.1 Situação do banco verificada

Na versão consultada:

- o banco contém 118 elementos;
- 65 elementos estão habilitados para investigação;
- nenhum dos 118 possui propriedades preenchidas em elements[].properties;
- não existe campo ou conjunto homologado de constantes ópticas n(λ) e k(λ);
- sources.json contém fontes cristalográficas e gerais, mas ainda não contém registros próprios para os conjuntos ópticos aqui discutidos nem para os dados CIE.

Portanto, hoje o brilho pode ser explorado geometricamente, mas o SILM ainda não pode afirmar que a cor renderizada corresponde à resposta óptica específica do metal selecionado.

## 3. Fundamento físico

### 3.1 Constantes ópticas complexas

Para um material isotrópico, a resposta óptica pode ser descrita pelo índice de refração complexo:

\[
\tilde{N}(\lambda)=n(\lambda)+i\,k(\lambda)
\]

onde:

- n(λ) é o índice de refração;
- k(λ) é o coeficiente de extinção;
- λ é o comprimento de onda no vácuo.

O valor de k descreve a atenuação da onda no material. Não deve ser confundido com uma propriedade de brilho isolada.

A permissividade dielétrica complexa está relacionada a essas grandezas por:

\[
\tilde{\varepsilon}(\lambda)=\tilde{N}(\lambda)^2
\]

Para metais anisotrópicos ou para monocristais cuja resposta dependa da orientação, uma única curva escalar n,k pode ser insuficiente. Nesses casos, a descrição completa pode exigir um tensor dielétrico e a orientação cristalográfica da superfície.

### 3.2 Refletância em incidência normal

Para uma interface ideal entre ar/vácuo e um metal isotrópico, opaco e opticamente espesso, a refletância em incidência normal é:

\[
R(\lambda,0)=
\frac{[n(\lambda)-1]^2+k(\lambda)^2}
{[n(\lambda)+1]^2+k(\lambda)^2}
\]

Essa expressão mostra por que uma cor fixa atribuída manualmente ao elemento não é uma solução científica: a resposta muda com o comprimento de onda e depende dos dados ópticos do material.

### 3.3 Incidência oblíqua e polarização

Para uma incidência oblíqua, a reflexão deve ser calculada pelas relações de Fresnel com índice complexo. Para luz não polarizada, a refletância é a média das componentes s e p:

\[
R_{\mathrm{não\ polarizada}}=
\frac{|r_s|^2+|r_p|^2}{2}
\]

A direção do feixe refletido continua obedecendo à lei geométrica da reflexão especular. Já a fração de energia refletida depende de λ, ângulo, polarização e propriedades ópticas.

Na primeira implementação óptica, a fonte será considerada não polarizada. A polarização s/p poderá ser acrescentada depois, sem alterar o princípio do estímulo luminoso.

### 3.4 Reflexão não é emissão

A cor observada nesta experiência é consequência da luz incidente que a superfície reflete seletivamente. Não é emissão luminosa do metal por estar aquecido. A emissão térmica pertence a outro fenômeno e não deve ser misturada ao estímulo luminoso.

## 4. Fonte luminosa

A fonte deve ter espectro definido. "Luz branca" não é uma especificação espectral suficiente: fontes brancas diferentes podem produzir aparências distintas na mesma superfície.

### 4.1 Fonte branca de referência

Recomenda-se começar com o iluminante padrão CIE D65 como referência de luz do dia. Ele fornece uma distribuição espectral relativa definida e pode ser combinado com as funções de correspondência de cor da CIE.

D65 é uma referência colorimétrica, não uma afirmação de que a cena simula uma lâmpada ou um ambiente físico específico. A interface deve nomear a condição como "Luz branca de referência — D65".

### 4.2 Fonte monocromática

Após a fonte branca de referência, a especificação prevê uma fonte monocromática selecionável na faixa visível. Essa opção permite observar que a superfície responde de forma diferente conforme a cor/comprimento de onda incidente.

A fonte monocromática é um estímulo de Explorar, não um espectrofotômetro. A interface não deve apresentar a intensidade refletida como valor de medição. Uma leitura numérica ou curva espectral quantitativa pertence a Medir.

### 4.3 Controles propostos

| Controle | Comportamento requerido | Situação |
|---|---|---|
| Ligar/desligar | Aplica ou interrompe a incidência | Já existe |
| Posição da lanterna | Reposiciona a fonte na cena | Já existe |
| Ângulo de incidência | Controla a direção em relação à normal | Já existe; intervalo atual de 5°–80° |
| Incidência normal | Permite definir 0° como condição de referência | Ajuste necessário; o limite atual começa em 5° |
| Tipo de fonte | Alterna entre D65 e monocromática | Novo |
| Comprimento de onda | Escolhe λ para a fonte monocromática | Novo |
| Intensidade da fonte | Ajusta a potência relativa sem alterar a curva intrínseca do material | Novo; unidade didática normalizada, não potência física |
| Polarização | Mantém não polarizada na primeira versão | Extensão futura, não requisito inicial |

A configuração deve ser operável por toque, mouse e teclado. Não depender exclusivamente de arrastar um objeto com precisão. O ângulo pode continuar associado à lanterna, mas deve haver uma alternativa acessível por botões de incremento/decremento ou entrada numérica.

A intensidade da fonte não deve alterar n, k ou R do material no regime linear adotado. Ela altera a quantidade de luz incidente e, consequentemente, o brilho visual da cena.

## 5. Aparência colorimétrica

### 5.1 Como a cor deve ser derivada

A aparência colorimétrica não deve vir de uma tabela de cores por símbolo químico. Deve ser calculada a partir de:

- distribuição espectral da fonte S(λ);
- refletância espectral R(λ) do metal na geometria definida;
- funções de correspondência de cor do observador padrão CIE.

Para uma condição colorimétrica declarada:

\[
X=K\sum_\lambda S(\lambda)R(\lambda)\bar{x}(\lambda)\Delta\lambda
\]

\[
Y=K\sum_\lambda S(\lambda)R(\lambda)\bar{y}(\lambda)\Delta\lambda
\]

\[
Z=K\sum_\lambda S(\lambda)R(\lambda)\bar{z}(\lambda)\Delta\lambda
\]

com normalização:

\[
K=\frac{100}{\sum_\lambda S(\lambda)\bar{y}(\lambda)\Delta\lambda}
\]

Os valores XYZ são convertidos para o espaço de exibição sRGB. O resultado deve ser identificado como uma **estimativa colorimétrica para a fonte, o observador e a geometria declarados**, não como uma medição de cor da amostra real.

### 5.2 Condição padrão proposta

Para a primeira referência visual:

- iluminante: CIE D65;
- observador: CIE 1931, 2°;
- funções de correspondência: tabela oficial CIE;
- geometria de referência: incidência normal para o cálculo-base;
- material: metal elementar, sólido, idealizado, liso e opticamente espesso;
- ambiente: sem camada de óxido, revestimento ou contaminação modelada;
- saída: prévia sRGB, com indicação de que o monitor pode limitar a reprodução de cores espectrais.

A cena interativa poderá depois usar o ângulo real da lanterna para ajustar a refletância de Fresnel. A cor de referência e a cor na cena precisam informar suas condições para não parecerem o mesmo tipo de resultado quando não forem.

### 5.3 Limites do display

A conversão para sRGB é uma adaptação de uma resposta espectral a um dispositivo de exibição. Cores fora do gamut do monitor podem ser comprimidas ou recortadas; comprimentos de onda extremos não são reproduzidos exatamente por pixels RGB.

O SILM deve preservar o resultado colorimétrico calculado e separar esse resultado da aproximação visual no monitor. Não prometer fidelidade fotográfica em qualquer dispositivo.

## 6. Condições da superfície e hipótese de modelo

A primeira versão espectral adotará uma superfície idealizada:

- metal elementar puro;
- fase sólida;
- superfície plana, lisa, limpa e não revestida;
- amostra opticamente espessa;
- resposta isotrópica ou efetiva policristalina quando essa aproximação estiver documentada;
- temperatura correspondente à condição dos dados ópticos.

Essa hipótese é necessária porque rugosidade, contaminação, óxidos, filmes finos e orientação cristalográfica podem alterar a resposta observada. Esses efeitos não devem ser simulados com parâmetros arbitrários nesta etapa.

Se a fonte experimental descreve filme fino, substrato, espessura, atmosfera ou preparação superficial, tais condições precisam ser preservadas nos metadados. O SILM não pode chamar esse registro simplesmente de "metal maciço" sem documentar a aproximação feita ao utilizá-lo.

Para uma camada fina com transmissão ou interferência relevante, a fórmula de interface semi-infinita não basta: seria necessário um modelo de múltiplas interfaces e espessura. Essa situação fica fora do primeiro escopo.

## 7. Dados ópticos necessários

### 7.1 Regra de proveniência

Cada conjunto óptico precisa conter valores, unidades, faixa espectral, condições da amostra e fonte rastreável. Uma curva incompleta não pode ser preenchida com valores inventados, nem extrapolada para a região visível sem validação.

Os dados devem guardar a grade original da publicação. A interpolação para a grade de cálculo deve ser determinística, documentada e confinada ao intervalo medido.

### 7.2 Estrutura de dados proposta

Recomenda-se manter os conjuntos ópticos em arquivo próprio, separado do registro principal de elementos, por exemplo:

- domain/silm/data/optical-constants.json

Cada conjunto deverá identificar:

| Campo | Conteúdo |
|---|---|
| id | Identificador estável do conjunto |
| atomicNumber | Elemento a que a curva pertence |
| material | Elementar puro, sem misturar com ligas nesta etapa |
| sourceId | Fonte registrada em sources.json |
| evidenceType | Experimental, avaliado ou calculado |
| spectralAxis | Energia (eV) ou comprimento de onda (nm), como publicado |
| points | Pares ordenados de n e k para cada ponto espectral |
| conditions.temperature | Temperatura da amostra |
| conditions.phase | Fase e estado físico |
| conditions.sampleForm | Filme, bulk ou monocristal |
| conditions.thickness | Espessura, quando informada |
| conditions.substrate | Substrato, quando aplicável |
| conditions.surfacePreparation | Preparação superficial, se descrita |
| conditions.atmosphere | Atmosfera durante a medição |
| orientation | Policristal, orientação cristalina ou tensor |
| uncertainty | Incertezas publicadas ou observação de que não foram informadas |
| notes | Limitações, método de obtenção e observações curatoriais |

Um elemento poderá possuir mais de um conjunto óptico, pois diferentes fontes, preparações e condições não devem ser fundidas numa única curva.

### 7.3 Validação do banco

O validador deverá recusar:

- fonte inexistente;
- número atômico incompatível;
- pontos sem n ou k;
- valores não finitos ou negativos;
- eixo espectral sem unidade;
- pontos duplicados ou fora de ordem;
- ausência de condição ou metadado mínimo de amostra;
- curvas que não cobrem a faixa necessária para a operação solicitada;
- extrapolação silenciosa;
- mistura entre dado experimental, calculado e qualitativo.

A presença de uma curva não significa que todo ângulo, orientação ou condição esteja homologado. A elegibilidade precisa informar exatamente qual aproximação pode ser usada.

## 8. Fontes científicas e cobertura inicial

### 8.1 Dados experimentais de Johnson e Christy

Dois trabalhos fornecem um ponto de partida consistente:

| Fonte | Metais cobertos | Condições principais |
|---|---|---|
| Johnson & Christy (1972) | Cu, Ag e Au | n e k obtidos de reflexão e transmissão em filmes finos evaporados; temperatura ambiente; 0,5–6,5 eV; filmes de 185–500 Å; erro estimado em n e k inferior a 0,02 na maior parte da faixa. |
| Johnson & Christy (1974) | Ti, V, Cr, Mn, Fe, Co, Ni e Pd | n e k em filmes policristalinos finos evaporados; temperatura ambiente; 0,5–6,5 eV; erro em n e k inferior a 2% na maior parte da faixa; alguns metais oxidam rapidamente e foram medidos sob atmosfera de nitrogênio. |

Os onze elementos — Cu, Ag, Au, Ti, V, Cr, Mn, Fe, Co, Ni e Pd — estão habilitados para investigação no banco atual do SILM. Isso forma uma primeira lista candidata para curadoria.

A faixa de 0,5–6,5 eV inclui a região visível, mas a curadoria ainda precisa transcrever e conferir as tabelas, preservar as condições de cada metal e validar os dados antes de habilitar a coloração no programa.

### 8.2 Compilações de Weaver e colaboradores

A obra Optical Properties of Metals, de J. H. Weaver, C. Krafka, D. W. Lynch e E. E. Koch (Physics Data, 1981), é uma compilação importante:

- Parte I: metais de transição;
- Parte II: metais nobres, alumínio, escândio, ítrio, lantanídeos e actinídeos;
- reúne literatura de múltiplos autores, técnicas, condições e formas de amostra;
- apresenta constantes ópticas e revisões dos dados publicados.

É uma fonte de busca e comparação valiosa, mas não deve ser importada como se todas as curvas tivessem sido medidas pelo mesmo método e sob a mesma condição. Cada conjunto exige avaliação da amostra, da técnica, da faixa espectral, da preparação superficial e das incertezas.

### 8.3 Estudo sistemático de Prandini, Rignanese e Marzari (2019)

O trabalho Photorealistic modelling of metals from first principles (npj Computational Materials, 5, 129, 2019) compara refletividades simuladas e experimentais de 18 metais elementares:

Li, K, Cs, Al, Be, Os, Rh, Ir, Pd, Cu, Au, Ag, V, Nb, Ta, Cr, Mo e W.

Esse estudo demonstra a relação entre resposta espectral e aparência: vários metais têm refletividade alta e pouco variável no visível, enquanto Os e Cs apresentam tendências espectrais que produzem tonalidades características. Também demonstra que a aproximação DFT-PBE pode deslocar estruturas espectrais de Au, Cu e Ag em relação ao experimento, portanto uma curva teórica não deve ser tratada automaticamente como dado experimental.

O artigo é referência metodológica e mapa de cobertura, mas sua seção de disponibilidade informa que os dados de suporte são fornecidos pelos autores mediante solicitação. As curvas publicadas não devem ser tratadas como um arquivo tabular pronto para importação. Para uso numérico, é necessário recuperar a fonte experimental indicada no artigo, obter os dados dos autores ou realizar uma curadoria independente.

### 8.4 Dados CIE

Para converter espectro em cor, o SILM deverá registrar e validar os dados da International Commission on Illumination:

- funções de correspondência CIE 1931, observador de 2°, em passos de 1 nm;
- distribuição espectral do iluminante padrão D65, em passos de 1 nm;
- identificação da edição, tabela, unidade, checksum e DOI de cada conjunto.

Esses dados são referências de colorimetria, não propriedades do metal. Devem ser versionados separadamente dos conjuntos de n e k.

## 9. Etapas de evolução da experiência luminosa

| Etapa | Escopo | Critério de conclusão |
|---|---|---|
| L0 — Geometria | Luz, lanterna, normal, incidência e reflexão especular | Preservar o comportamento atual; ajustar a incidência normal para 0° e validar teclado/toque. |
| L1 — Resposta espectral | Carregar n(λ), k(λ) homologados e calcular refletância | Curvas validadas, interpolação sem extrapolação e Fresnel testado. |
| L2 — Aparência colorimétrica | D65 + CIE 1931 2° + conversão XYZ/sRGB | Cor derivada de dados e condição explicitamente identificada. |
| L3 — Fonte selecionável | D65 e fonte monocromática | Alterar o espectro incidente e observar a resposta sem transformar a cena em instrumento de Medir. |
| L4 — Renderização de superfície | Aparência com resposta especular e condições controladas | Integrar a refletância à renderização sem usar metalness ou cores fixas como substitutos dos dados. |

As etapas L1 e L2 devem começar pelos conjuntos de Johnson e Christy, com os onze metais candidatos. A ampliação da cobertura dependerá da curadoria das compilações e fontes primárias restantes.

## 10. Regras de interface e comportamento

- A lanterna deve continuar sendo o objeto visual que define a direção da fonte.
- A normal da superfície deve permanecer visível enquanto a reflexão estiver ativa.
- As marcações de θi e θr devem continuar legíveis e coerentes com a geometria real da cena.
- A fonte branca de referência deve ser identificada como D65, e não apenas como "branca".
- A fonte monocromática deve exibir o comprimento de onda selecionado e a unidade nm.
- O controle de intensidade deve ser independente do comprimento de onda e da resposta intrínseca do metal.
- Quando houver dados ópticos válidos, a aparência deve ser calculada; quando não houver, a interface deve manter a reflexão geométrica neutra e informar que a resposta espectral daquele metal não está homologada.
- Não atribuir cores aproximadas manualmente a elementos sem dados.
- Não usar somente cor para indicar direção, incidência, intensidade ou estado.
- O texto contextual deve separar ação, observação, interpretação e limitação.
- A animação deve respeitar a preferência de movimento reduzido.

## 11. Critérios de aceitação

- [ ] A experiência luminosa continua dentro de Explorar.
- [ ] A luz é uma fonte/estímulo, não uma nova dimensão ou módulo.
- [ ] A geometria da reflexão é validada para incidência normal e oblíqua.
- [ ] O ângulo de 0° é permitido e representa incidência normal.
- [ ] Os dados n e k mantêm fonte, condição, faixa e natureza da evidência.
- [ ] Não há cor fixa por elemento.
- [ ] O cálculo espectral não extrapola dados.
- [ ] A resposta colorimétrica usa iluminante e observador identificados.
- [ ] O display sRGB é descrito como prévia limitada pelo dispositivo.
- [ ] Superfície ideal, espessura, orientação e temperatura são declaradas.
- [ ] Dados calculados teoricamente não são rotulados como experimentais.
- [ ] Ausência de dados não bloqueia a reflexão geométrica já existente.
- [ ] Explorar não apresenta leitura numérica de refletância como se fosse uma medição.
- [ ] A troca para Medir ou Calcular suspende a fonte e mantém a investigação.

## 12. Pendências antes de implementar L1

1. Transcrever os conjuntos espectrais de Johnson e Christy e conferir cada valor com a tabela original.
2. Verificar a permissão de reutilização e atribuição para os dados que serão armazenados publicamente.
3. Registrar os artigos e datasets CIE em sources.json, com DOI, URL, licença e data de acesso.
4. Definir o schema de optical-constants.json e ampliar o validador do banco.
5. Homologar os metadados de amostra e a hipótese de isotropia ou policristalinidade por conjunto.
6. Testar Fresnel para valores de referência e limites de incidência.
7. Testar a transformação XYZ/sRGB com casos de cor de referência e verificar o comportamento de gamut.
8. Só então habilitar a resposta espectral para os elementos cujas curvas tenham sido aprovadas.

## 13. Referências

1. JOHNSON, P. B.; CHRISTY, R. W. Optical Constants of the Noble Metals. Physical Review B, v. 6, p. 4370–4379, 1972. DOI: 10.1103/PhysRevB.6.4370. Dados de n e k para Cu, Ag e Au, obtidos por medidas de reflexão e transmissão em filmes finos à temperatura ambiente.
2. JOHNSON, P. B.; CHRISTY, R. W. Optical constants of transition metals: Ti, V, Cr, Mn, Fe, Co, Ni, and Pd. Physical Review B, v. 9, p. 5056–5070, 1974. DOI: 10.1103/PhysRevB.9.5056. Dados de n e k em filmes policristalinos finos à temperatura ambiente.
3. WEAVER, J. H.; KRAFKA, C.; LYNCH, D. W.; KOCH, E. E. Optical Properties of Metals. Part I: The Transition Metals. Physics Data 18-1. Karlsruhe: Fachinformationszentrum, 1981.
4. WEAVER, J. H.; KRAFKA, C.; LYNCH, D. W.; KOCH, E. E. Optical Properties of Metals. Part II: Noble Metals, Aluminum, Scandium, Yttrium, the Lanthanides and the Actinides. Physics Data 18-2. Karlsruhe: Fachinformationszentrum, 1981.
5. PRANDINI, G.; RIGNANESE, G.-M.; MARZARI, N. Photorealistic modelling of metals from first principles. npj Computational Materials, v. 5, art. 129, 2019. DOI: 10.1038/s41524-019-0266-0.
6. CIE. CIE 1931 colour-matching functions, 2 degree observer. Dataset oficial em passos de 1 nm. DOI: 10.25039/CIE.DS.xvudnb9b.
7. CIE. CIE standard illuminant D65. Dataset oficial em passos de 1 nm. DOI: 10.25039/CIE.DS.hjfjmt59.
8. ISO/CIE 11664-1:2019. Colorimetry — Part 1: CIE standard colorimetric observers. DOI: 10.25039/DS11664-1.2019.
9. ISO/CIE 11664-2:2022. Colorimetry — Part 2: CIE standard illuminants.

Links de consulta:
- https://doi.org/10.1103/PhysRevB.6.4370
- https://doi.org/10.1103/PhysRevB.9.5056
- https://doi.org/10.1038/s41524-019-0266-0
- https://www.cie.co.at/datatable/cie-1931-colour-matching-functions-2-degree-observer
- https://www.cie.co.at/datatable/cie-standard-illuminant-d65
- https://www.iso.org/standard/77215.html

## 14. Próxima etapa

A Etapa 3 deve aprofundar o **estímulo térmico**, incluindo fonte, posição, intensidade, difusão, dissipação para o ambiente, resposta da rede e distinção entre aquecimento, equilíbrio térmico e resfriamento.
