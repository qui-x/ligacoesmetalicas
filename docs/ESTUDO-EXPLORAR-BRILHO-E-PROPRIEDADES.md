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

### Restrição de módulo a rever

O catálogo atual define `luster.requires='crystalline'`. Essa exigência é compreensível para o **diagrama atual**, que usa a rede para localizar o alvo da lanterna, mas **não é uma exigência física do brilho**: a resposta óptica de uma amostra metálica macroscópica pode ser observada antes da reconstrução de sua célula unitária. Com o corpo de prova de superfície validado, separar `surfaceAvailable` (sólido com superfície em escala 1) de `crystalAvailable` (rede homologada para escalas 3–4). **Não remover a guarda agora**, porque o renderizador atual depende da geometria cristalina; fazer a migração junto ao novo palco óptico e seus testes.

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

### Prova de conceito quantitativa, **fora** da aplicação

Interpolei linearmente `n(λ)` e `k(λ)` dos 49 pares experimentais de cada metal (Johnson & Christy 1972; arquivos `Au/Ag/Cu/nk/Johnson.yml` na fonte indicada) e apliquei `R=((n−1)²+k²)/((n+1)²+k²)` em **incidência normal**, interface ar–metal **lisa**, a temperatura de referência. A tabela é **aproximada**, não inclui textura, óxido, iluminante, câmera, espalhamento nem objetos reais.

| λ | Prata Ag | Ouro Au | Cobre Cu |
| --- | ---: | ---: | ---: |
| 450 nm (azul) | 98,0 % | 40,8 % | 53,8 % |
| 550 nm (verde) | 98,3 % | 79,2 % | 62,4 % |
| 650 nm (vermelho) | 99,0 % | 95,7 % | 93,5 % |

**Conclusão didática:** manter um feixe refletido da mesma cor e intensidade para todos os metais oculta uma diferença física central. Um observador não pode inferir esses valores diretamente da cor de um centro atômico desenhado.

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

---

## 7. Reorganização multiescala — 12/11/2026 (diretriz atual)

**Esta seção prevalece sobre os trechos históricos deste estudo que proponham uma bancada óptica independente ou a criação de mecânicas novas para objetos na escala 1.** A investigação é uma só; não deve criar segundos palcos, motores científicos ou painéis flutuantes. O PR #113 eliminou a minibancada. O PR #115 (rascunho) inicia o brilho diretamente na microestrutura.

### 7.1. Responsabilidade das quatro escalas

| Escala | Papel da propriedade | Intervenção prevista |
|---|---|---|
| 1. Objeto e componente | Contextualização visual na vida prática | **Somente atualizar imagens, referências e conexões** entre objetos, metal estudado e as próximas escalas. **Não implementar mecânicas novas**: serão produzidas separadamente pelo autor. |
| 2. Microestrutura | **Principal área de manipulação e demonstração de propriedades** | Aplicar campos, estímulos e deformações no **mesmo mapa de grãos**. Preservar zoom, seleção, navegação, geometria importada e controles inferiores. |
| 3. Rede e célula | Mecanismos coletivos que explicam a observação | Reutilizar motores existentes: deriva dos elétrons, difusão de energia, deslizamento de planos e propagação do campo. |
| 4. Centro metálico | Ambiente local e interações | Mostrar coordenação, vizinhos, vibração e rearranjo relativo. Não atribuir brilho, tensão, temperatura macroscópica ou condutividade a um átomo isolado. |

A escolha da propriedade continua no menu **Ver**; ao navegar pelas escalas ela permanece selecionada. Cada escala fornece uma visualização/gesto correspondente **sem reiniciar a investigação**. Manter os controles na barra inferior e a cena central predominante.

### 7.2. Propriedades na microestrutura

**Brilho — PR #115, primeiro incremento:** a lanterna e o observador controlam a mesma experiência óptica usada na rede. O acabamento atua sobre a superfície inteira, e não define uma refletância individual por grão. Distinguir **polido/fosco** (espalhamento qualitativo) de **preparação metalográfica/ataque** (revelação de grãos por contraste). Nunca inferir cor, fase, orientação, composição, rugosidade numérica ou espectro a partir da tesselação.

**Maleabilidade — próximo PR recomendado:** permitir comprimir o conjunto no mesmo mapa vetorial; transformar temporariamente os polígonos existentes, preservando topologia/identidade e permitindo restaurar. Indicar direção da carga e deslocamento/achatamento qualitativos. Não inventar tensão de escoamento, sistemas de deslizamento particulares, orientação cristalográfica nem plasticidade real de cada grão. Na rede, mostrar o deslizamento coletivo; no centro, apenas o rearranjo de vizinhos.

**Ductilidade — agrupar com maleabilidade no PR mecânico:** tracionar o mesmo corpo de prova esquemático, visualizar alongamento e comparar estado inicial/final. Não simular estricção, ruptura, porcentagem de alongamento ou curva tensão–deformação sem um modelo específico e dados homologados. O motor e o comando mecânicos devem ser compartilhados com a rede, sem sobrescrever a geometria ou a calibração de um mapa importado.

**Condutividade térmica — PR seguinte:** posicionar fonte numa região da microestrutura, iniciar/parar, ver um **campo térmico relativo** atravessando os grãos e resfriar ao desligar a fonte. Cor térmica precisa de legenda distinta da cor dos grãos. Na ausência de dados de interface, não aplicar bloqueio ou resistência térmica fictícia a cada contorno; utilizar coeficientes didáticos iguais ou uma projeção conceitual do controlador térmico existente. Na rede, difusão entre vizinhos e participação de elétrons/vibrações; no centro, vibração local ilustrativa. Efeito Joule deve compartilhar a mesma sessão e o mesmo balanço de energia, jamais um segundo relógio/solver independente.

**Condutividade elétrica — PR seguinte:** contatos nas bordas do mapa, direção do campo e continuidade do transporte. Destacar contornos como **possíveis regiões de espalhamento**, não como resistores individuais com valor inventado. Quantificar efeitos de contorno somente se houver caracterização de material/condição, comprimento característico e coeficientes do modelo. Na rede, deriva coletiva e colisões qualitativas; no centro, coordenação e comportamento coletivo da ligação, sem trilhas determinadas para um elétron. Os módulos elétrico+térmico usam o **mesmo Joule** já implementado.

### 7.3. Contratos científicos e de interface

- **Estado único:** manter o estado central de propriedades e os controladores compartilhados de luz, temperatura, deformação e eletrotermia; camadas da microestrutura são representações, não novas investigações.
- **Mapa intacto:** zoom, pan, semente, grão selecionado e polígonos de referência/importados permanecem imutáveis sob overlays óptico, elétrico e térmico; deformação visual deve ser reversível e guardar origem intacta.
- **Proveniência:** distinguir esquema D0, estudo contextual de literatura, mapa importado não homologado e dados quantitativos medidos/homologados. Não converter uma imagem de objeto em micrografia nem um grão sintético em prova de propriedades.
- **Semântica da cor:** só usar paleta de **composição** para dados químicos calibrados (ex.: mapa EDS), e paleta de **orientação** para EBSD com legenda. Tom mais escuro não equivale universalmente a maior concentração.
- **Realismo sem números falsos:** a mesma classe de interação pode existir nos 65 elementos sólidos habilitados, mas parâmetros e grandezas precisam ser ligados ao metal e às condições reais apenas quando registrados e validados.
- **Sem nova UI paralela:** ativar propriedade em Ver; manipular em cena; ações em barra inferior única; orientação pedagógica no Manual/roteiros/missões existentes; nada de nova janela ou segundo mini-simulador.
- **Escala 1 reservada:** apenas substituir imagens dos itens por fontes identificadas e metadados corretos, melhorar transições de navegação e manter referência a objetos/metais. **Nenhuma mecânica interativa nova para esta escala nesta etapa.**

### 7.4. Sequência e testes

1. Concluir e reconciliar PR #115 com a main atual, validando mobile e os três navegadores antes de merge.
2. PR mecânico: maleabilidade + ductilidade, com transformações visuais reversíveis no mesmo mapa e vínculo didático com rede/centro.
3. PR térmico: aquecedor, campo adimensional, difusão e resfriamento coerentes com o controlador já presente.
4. PR elétrico/Joule: campo, contatos, contornos explicativos e uma única sessão eletrotérmica.
5. PR de travessia de escalas e Manual/missões; manter a escala 1 limitada às imagens e aos vínculos contextuais.
6. Atualização de imagens de objetos licenciadas e verificáveis; a implementação interativa própria da escala 1 permanece fora deste escopo.

**Critérios obrigatórios para cada PR:** Chromium, Firefox e WebKit; testes em 320/390/768/1366/1920 px; teclado, toque, contraste, redução de movimento; controles de 44 px; nenhuma perda de seleção, câmera, semente ou medidas; preservar cache offline, dados importados, outras propriedades e mudança de escala; capturas reais da propriedade em uso, não somente cliques aprovados.

### 7.5. Referências para limites físicos

- ASM International, *Plastic Deformation Structures* (2005): https://doi.org/10.31399/asm.hb.v14a.a0004018
- Bakonyi (2021), análise do efeito de contornos em Cu/Ni: https://link.springer.com/article/10.1140/epjp/s13360-021-01303-4
- Mayadas e Shatzkes (1970), modelo de espalhamento em contornos sob condições específicas: https://doi.org/10.1103/PhysRevB.1.1382
- Oxford Instruments, natureza dos mapas EBSD e distinção de tamanho, contornos, fase e orientação: https://www.ebsd.com/ebsd-techniques/displaying-ebsd-data
- Leica, preparo e contraste metalográficos: https://www.leica-microsystems.com/science-lab/industrial/metallography-an-introduction/

**Decisão:** escala 2 é o foco da investigação das propriedades; escala 3 explica mecanismos coletivos; escala 4 explica ambientes locais. Escala 1: imagens e vínculos contextuais apenas, até a interação independente estar pronta.
