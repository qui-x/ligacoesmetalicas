# SILM — Estudo científico e redesenho mecânico do módulo Explorar

**Data:** 11/11/2026 · **Status:** proposta técnica para discussão, não aprovada como implementação óptica final.  
**Base:** PR #96, herdado do PR #95. **Não alterar a `main` nesta etapa.**

## 1. Diagnóstico do que o programa realmente faz

Arquivos inspecionados: `domain/silm/properties.js`, `property-view.js`, `crystal-view.js`, `thermal.js`, `drive.js`, `deformation.js`, `integracao/metallic-experience.js`, `workspace-family.js`.

| Propriedade | Entrada atual | Mecânica efetiva | Lacuna entre gesto, grandeza e explicação |
| --- | --- | --- | --- |
| Elétrica | Ver → campo; arrastar alça E | Deriva média visual com intensidade **relativa**; combinação eletrotérmica de Joule em malha separada | Os dados tabelados de condutividade não parametrizam a deriva; evitar rotular o controle de campo como tensão/corrente reais fora do ensaio |
| Térmica | Ver → fonte; arrastar e ligar/desligar aquecedor | Difusão no grafo de vizinhos, coeficiente didático comum; retorno ao ambiente | **Inconsistência:** `thermal.js` inclui `COOLING=.18`, mas os textos em `properties.js` afirmam “sem perdas para o ambiente”/conservação total após desligamento |
| Maleabilidade | Ver → prensa; arraste/teclado | Compressão com deformação elástica exagerada e passos de deslizamento | Não significa que todos os metais possuam mesma maleabilidade; não interpretar número de passos como tensão ou deformação real |
| Ductilidade | Ver → garra; arraste/teclado | Tração com retorno elástico e passos permanentes de deslizamento | Não reproduz curva tensão–deformação, fratura, taxas reais, efeitos de temperatura ou defeitos individuais |
| Brilho | Ver → luz; arrastar lanterna | Normal vertical, feixes espelhados `θᵣ=θᵢ`; centros de maior coordenada z recebem realce | **Principal problema:** apenas a geometria da reflexão, praticamente sem dependência do metal, superfície, espectro, observador ou orientação física |

### Diagnóstico especial: a luz hoje é um *esquema geométrico*

- `drive.js` fornece ângulo de 5–80° e lei `θᵣ=θᵢ`, válida também para vidros e outras superfícies lisas; não determina refletância.
- `crystal-view.js` usa os centros de maior **z cristalográfico** para inferir a “superfície”, calcula a média das posições projetadas e fixa a normal **vertical na tela**. Isso não equivale à normal verdadeira de uma face do objeto quando se gira a câmera ou escolhe outra orientação cristalina.
- `property-view.js` desenha uma linha incidente e outra refletida com a mesma cor/intensidade; nenhum `n(λ)`, `k(λ)`, `R(λ,θ)` ou distribuição direcional de espalhamento é usado.
- `properties.js` afirma que a superfície “reflete a maior parte da luz visível” em toda experiência: afirmação **excessivamente universal** sem validação do metal, da superfície e do comprimento de onda.
- O realce de centros cristalográficos não representa o brilho de uma superfície macroscópica; falta distinguir **rede volumétrica, superfície e corpo de prova**.
- Existe um corpo de prova **didático para deformação** em `deformation.js`/`crystal-view.js`; ainda não há um modelo geral de superfície óptica parametrizado, independente da rede.

## 2. Modelo didático correto para brilho metálico

**Pergunta investigativa:** “Por que esta superfície metálica reflete a luz desse modo, e como material, comprimento de onda, acabamento, orientação da luz e do observador afetam a aparência?”

Separar quatro mecanismos:

1. **Direção geométrica:** superfície lisa → direção especular pela lei da reflexão, que **não distingue** o metal de outro material.
2. **Resposta espectral do material:** a refletância depende das constantes ópticas complexas `N(λ)=n(λ)+ik(λ)`; para interface ideal ar–metal em incidência normal, `R(λ)=((n−1)²+k²)/((n+1)²+k²)`. Em incidência oblíqua, usar Fresnel com polarizações `s,p`, nunca simplesmente manter a mesma intensidade.
3. **Cor refletida:** depende do espectro de iluminação × `R(λ)` e da resposta do observador; ouro/cobre não são “cores de um elétron”, mas materiais com quedas de refletância no visível associadas a transições entre bandas. Prata costuma manter refletância elevada e mais uniforme na região visível.
4. **Acabamento e ambiente:** superfície polida concentra luz perto da direção especular; rugosa espalha em mais direções; oxidação ou filme superficial podem alterar espectro e espalhamento. **Rugosidade não transforma a intrínseca `R(λ)` do metal em outro valor arbitrário**: separar refletância do material, espalhamento angular e possível camada superficial.

**Condições de validade:** sólido opaco (não película fina); superfície opticamente lisa e homogênea para fórmula simples; temperatura de referência do dataset; incidência de ar; `n,k` experimentais com fonte. Não atribuir ao corpus inteiro de metais números inferidos por tonalidade visual ou condutividade elétrica DC.

### Conjunto científico inicial verificável

**Au, Ag, Cu:** Johnson & Christy, *Optical Constants of the Noble Metals*, *Physical Review B* 6 (1972), DOI [10.1103/PhysRevB.6.4370](https://doi.org/10.1103/PhysRevB.6.4370). Séries `n,k` tabuladas também no projeto [refractiveindex.info-database](https://github.com/polyanskiy/refractiveindex.info-database/tree/main/database/data/main), que declara os arquivos CC0. **Implementar primeiro apenas esses três metais com dados verificáveis**, e depois ampliar, sem generalizar o espectro aos demais. Antes de calcular cor RGB final, definir iluminante e integração colorimétrica (observador padrão).

**Outros metais:** indicar “Modelo óptico qualitativo — sem constantes espectrais homologadas” até validar fontes, condições, superfície e intervalo de `λ`. O metal deve poder ser investigado visualmente, mas o gráfico quantitativo e percentuais permanecem indisponíveis.

## 3. Proposta de mecânica de investigação óptica

**Cenário primário: superfície do metal** — manter a Oficina, a barra inferior única e a navegação de escalas no topo. Em vez de um feixe sempre lançado sobre centros atômicos:
- Renderizar **corpo de prova opaco** de aparência metálica no centro (superfície geométrica separada da célula/rede). A forma pode seguir a abstração macroscópica já planejada; não tratar o plano cristalográfico selecionado como superfície livre automaticamente.
- Uma **luminária manipulável** no palco; arraste/touch ou teclado altera **posição e orientação**. Um pequeno marcador orienta a normal local verdadeira. Sem menus repetidos de luz e câmera.
- **Posição do observador** deve importar: mover a câmera ou o observador muda se o reflexo é visto, sem alterar o `R(λ)` intrínseco do material.
- Duas condições de acabamento: **polido** e **rugoso**, inicialmente como **dispersão angular qualitativa explicitamente rotulada**, sem exibir `Ra` ou números inventados. Oxidação só depois de validação de um modelo/material específico.
- Para Au/Ag/Cu, um **iluminante neutro** e um **seletor de `λ`** em modo avançado; atualização do brilho/espectro e exibição de `R(λ)` somente com dados homologados. Modo branco integra o espectro, não é “todos os comprimentos de onda iguais em RGB”.
- O desenho didático do ângulo deve ser **opcional** (“Mostrar trajetórias”); a experiência por padrão mostra o reflexo e a superfície. Nenhum feixe atravessando corpo opaco; não afirmar isso para películas finas.
- Em escalas 3–4, exibir **modelo conceitual da resposta coletiva eletrônica**, com rótulo “não representa trajetórias individuais nem cálculo de bandas”; não deslocar a luminária para um átomo da rede nem pintar os centros como se fossem o espelho.

**Três camadas de leitura**, sem competir com a cena:
1. **Observação:** o que muda na imagem quando lanterna/observador/acabamento/λ mudam?
2. **Explicação:** se a direção espelhada não é exclusiva do metal, por que o metal apresenta alta reflexão?
3. **Dados:** `R(λ)` e procedência quando disponíveis; explicitar quando for somente qualitativo.

## 4. Outros fenômenos: gestos e ciência

| Experiência | Gesto central | Resposta visual | Limite obrigatório |
| --- | --- | --- | --- |
| Elétrica | arrastar alça de campo/contatos | sentido de campo + deriva média dos elétrons | intensidade **relativa**, sem “corrente em ampères” inventada |
| Térmica | posicionar fonte, ligar/desligar, deixar evoluir | mapa de temperatura + resfriamento após desligamento | coeficientes didáticos; **corrigir texto do balanço com ambiente** |
| Maleabilidade | pressionar corpo de prova, soltar | regime elástico/reversão ou passos de deslizamento | não equivale a classificação quantitativa de maleabilidade |
| Ductilidade | tracionar corpo de prova, soltar | alongamento e deslizamento; possível mudança de seção didática | não inventar ruptura nem limites metal-específicos |
| Brilho | mover luz + observador; acabamento; opcional `λ` | reflexo, direção e resposta espectral validada | distinguir lei de reflexão, (R(λ)), rugosidade e camada de óxido |

A combinação de propriedades exige semântica própria: **elétrica+térmica** já tem motor Joule; **deformação+elétrica** tem espalhamento qualitativo; **óptica+térmica/deformação** só poderá ser parametrizada depois de fonte e testes. Não inferir espectro óptico a partir do coeficiente de condução térmica ou deformação didática.

## 5. Sequência de engenharia, sem regressões

**Etapa E1 — já autorizável:** corrigir afirmações textuais inconsistentes (térmica e brilho) e testar sem alterar motores. Manter o visual do brilho identificado como **esquema geométrico provisório**.

**Etapa E2 — proposta:** separar `OpticalSurface` de `CrystalGeometry` e `Camera`; vetor de reflexão `r=d−2(d·n)n` para direção `d` incidente e normal unitária `n`; confirmar invariância à câmera, faces e orientação. Criar protótipo de corpo de prova e luminária móvel, sem dados ópticos fingidos.

**Etapa E3 — proposta:** incorporar séries `n,k` de Au/Ag/Cu com unidades, condições e fonte; cálculo Fresnel normal e oblíquo, sem extrapolar fora dos dados; validar limites de `R\in[0,1]`, monotonia do interpolador quando pertinente e amostras contra literatura. A aparência RGB só depois de teste colorimétrico.

**Etapa E4 — proposta:** acabamento polido/rugoso com **perfil de espalhamento qualitativo e explicitado**; tratar óxidos apenas com estudo específico; modo teclado, touch e movimento reduzido.

**Etapa E5 — validação cruzada:** escalas 1→4, View geral/Foco, 320–1920 px, ampliação de texto 150%, Chromium/Firefox/WebKit. Toda troca de luz, ângulo, acabamento ou câmera deve preservar metal, átomos, medições, fórmulas, investigações e estados das outras propriedades.

## 6. Fontes científicas

- Johnson, P. B.; Christy, R. W. (1972). [*Optical Constants of the Noble Metals*](https://doi.org/10.1103/PhysRevB.6.4370). Dados espectrais de Au, Ag, Cu.
- Stenzel, O.; Wilbrandt, S. (2026). [*Some Basic Considerations on the Reflectance of Smooth Metal Surfaces: Fresnel’s Formula and More*](https://doi.org/10.3390/coatings16020236). Interface ar–metal, `n+ik`, Fresnel e limites do modelo.
- [*Photorealistic modelling of metals from first principles*](https://www.nature.com/articles/s41524-019-0266-0) (2019). Cor de metais, refletância visível e transições entre bandas.
- Vorburger, T. V.; Marx, E.; Lettieri, T. R. (1993). [*Regimes of Surface Roughness Measurable with Light Scattering*](https://www.nist.gov/publications/regimes-surface-roughness-measurable-light-scattering). Rugosidade e distribuição angular de luz espalhada.
- Roos, A.; Bergkvist, M.; Ribbing, C. G. (1989). [*Optical scattering from oxidized metals. 1*](https://doi.org/10.1364/AO.28.001360). Camadas oxidadas e espalhamento.

**Decisão pendente:** avaliar a solução **superfície/observador primeiro**, sem preservar o diagrama de dois feixes como vista principal. Não integrar motor espectral novo sem homologação dos dados e da representação didática.
