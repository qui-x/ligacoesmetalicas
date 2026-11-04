# SILM — Especificação do acoplamento elétrico-mecânico (E+M)

**Status:** especificação científica e operacional — não implementada  
**Branch:** `study/silm-coupled-properties-transport-20261104`  
**Documentos de base:**
- `ESTUDO-INTERACOES-PROPRIEDADES-METALICAS.md`
- `MATRIZ-OPERACIONAL-INTERACOES-PROPRIEDADES.md`
- `ESPECIFICACAO-ACOPLAMENTO-ELETROTERMICO.md`
- `ESPECIFICACAO-ACOPLAMENTO-TERMOMECANICO.md`

---

## 1. Objetivo

Definir como a deformação mecânica afeta a resistência elétrica de uma amostra metálica e quais efeitos a corrente pode exercer sobre a deformação.

O modelo deve separar três mecanismos:

1. **Efeito geométrico (M → R):** comprimento e área transversal mudam com a deformação, alterando a resistência mesmo que a resistividade intrínseca permaneça constante.
2. **Efeito microestrutural (M → ρe):** deformação plástica pode criar/reorganizar discordâncias, lacunas, contornos e outros defeitos que modificam o espalhamento eletrônico e a resistividade intrínseca.
3. **Efeito eletroplástico (E → M):** a corrente pode modificar a resposta plástica por mecanismos térmicos e, em certas condições, por mecanismos não térmicos. Exige estudo experimental específico e permanece fora do primeiro motor E+M.

O primeiro acoplamento físico deve calcular os efeitos 1 e 2, desde que existam dados e uma geometria calibrada. O efeito 3 será um módulo de pesquisa separado e não será inferido a partir da simples coexistência de campo elétrico e deformação.

## 2. Distinções fundamentais

| Grandeza | O que representa | Pode mudar com a deformação? |
|---|---|---|
| Resistência elétrica R (Ω) | Oposição elétrica da amostra completa, dependente do material e da geometria | Sim: geometria e resistividade podem mudar |
| Resistividade elétrica ρe (Ω·m) | Propriedade intrínseca do material no estado/condição especificados | Sim: temperatura, composição e microestrutura podem mudar |
| Condutividade elétrica σe (S/m) | Inverso da resistividade, σe = 1/ρe | Sim, pela mudança de ρe |
| Comprimento L (m) | Dimensão entre terminais | Sim |
| Área A (m²) | Área transversal à corrente | Sim |
| Densidade de corrente J (A/m²) | Corrente por área transversal | Sim, inclusive por concentração local |

A interface e os resultados não devem usar “resistência” e “resistividade” como sinônimos. Um corpo pode apresentar maior resistência elétrica apenas por ficar mais longo e mais fino, mesmo que sua resistividade não tenha mudado.

## 3. Efeito geométrico da deformação sobre a resistência

Para uma amostra uniforme, isotrópica, com corrente longitudinal e seção aproximadamente uniforme:

```
R = ρe L / A
```

O estado mecânico atualiza a geometria efetiva. A resistência calculada deve usar o comprimento e a área da configuração deformada, não a geometria de referência.

Para pequenas variações:

```
ΔR/R ≈ Δρe/ρe + ΔL/L − ΔA/A
```

A expressão mostra três contribuições separáveis: resistividade intrínseca, comprimento e seção transversal.

### 3.1 Tração
- L tende a aumentar.
- A tende a diminuir.
- A resistência geométrica tende a aumentar.
- O resultado exato depende da deformação transversal/volume e da geometria.

### 3.2 Compressão
- L tende a diminuir no eixo de compressão.
- A transversal tende a aumentar.
- A resistência geométrica longitudinal tende a diminuir.
- A orientação dos terminais em relação ao carregamento importa.

### 3.3 Cuidado com o uso de fórmulas simplificadas
Para um material elástico isotrópico sob pequena deformação uniaxial, a variação geométrica pode ser aproximada usando a razão de Poisson. Para plasticidade metálica aproximadamente isocórica, o volume tende a ser conservado, mas a aproximação depende do material, porosidade, dano e estado de deformação.

Não codificar uma correção geométrica universal sem definir:
- direção da corrente;
- direção de carregamento;
- geometria da amostra;
- deformação axial e transversal;
- estado de deformação (elástico/plástico);
- mudança de volume, se relevante.

A representação atual do SILM altera coordenadas para visualização cristalina, mas não define seção elétrica, terminais nem volumes físicos. Logo, não pode ainda fornecer R ou J em unidades SI.

## 4. Efeito microestrutural sobre a resistividade

Defeitos cristalinos e elementos de liga podem contribuir para o espalhamento eletrônico. Uma decomposição útil, em condições nas quais a regra de Matthiessen seja uma aproximação razoável, é:

```
ρe(T, c, S) ≈ ρlattice(T) + ρsolute(c) + ρprecipitates
              + ρdislocations(S) + ρgrain-boundaries + ρvacancies
```

- T: temperatura.
- c: composição/solutos.
- S: estado microestrutural, incluindo densidade e configuração de defeitos.
- ρdislocations: contribuição associada às discordâncias e à sua configuração.

Esta soma é uma decomposição aproximada, não uma lei universal exata. As contribuições podem interagir e não são independentes em todos os materiais e faixas.

### 4.1 O que o SILM pode representar agora
O motor atual guarda a quantidade de deslizamentos plásticos na experiência. O campo elétrico em conjunto com a deformação aumenta qualitativamente o espalhamento associado aos defeitos que os deslizamentos deixam na rede.

Isso é um recurso didático sobre a contribuição microestrutural, não uma medição da densidade de discordâncias nem um cálculo da resistividade do metal. Um número de deslizamentos na representação não equivale a densidade física de discordâncias (m⁻²).

### 4.2 O que falta para um modelo material
Para calcular uma contribuição de resistividade por deformação, será necessário:
- densidade/configuração de discordâncias ou uma variável interna calibrada;
- relação material para ρdislocations(S);
- condição de temperatura;
- composição/fase e estado inicial;
- faixa de validade e fonte experimental;
- estado após recuperação, recozimento ou evolução microestrutural, caso esses processos sejam modelados.

Não substituir densidade de discordâncias por número de passos visuais sem calibração.

## 5. Resposta elétrica sob deformação

A condição elétrica deve ser explícita e independente da condição mecânica.

| Condição elétrica | Entrada prescrita | Resposta calculada |
|---|---|---|
| Tensão controlada | Diferença de potencial | Corrente, densidade de corrente e resistência equivalente |
| Corrente controlada | Corrente total/densidade de corrente | Diferença de potencial, campo e resistência equivalente |

A condição mecânica também deve escolher um controle:

| Condição mecânica | Entrada prescrita | Resposta calculada |
|---|---|---|
| Força/tensão mecânica | Força ou tensão | Deslocamento e deformação |
| Deslocamento/deformação | Deslocamento ou deformação | Força de reação e tensão |

Não prescrever ao mesmo tempo corrente e tensão independentes no circuito ideal, nem força e deslocamento independentes no mesmo grau de liberdade mecânico.

### 5.1 Sequência de cálculo proposta
1. Obter o estado de deformação e a geometria atual.
2. Atualizar L, A e a orientação dos terminais.
3. Atualizar o estado microestrutural S conforme o modelo mecânico.
4. Obter ρe(T,c,S) por dados/lei material ou assumir explicitamente o modo didático.
5. Resolver a condução elétrica para a tensão ou corrente prescrita.
6. Calcular R, V, I e J como grandezas de resposta.
7. Verificar conservação de corrente e consistência entre potência de entrada e dissipação.
8. Publicar os resultados separados: mudança geométrica e mudança intrínseca da resistividade.

### 5.2 Condição térmica na experiência E+M
Para estudar somente E+M, temperatura deve ser mantida fixa ou controlada (condição isotérmica idealizada). Caso a corrente gere aquecimento Joule relevante, o problema passa a ser E+T+M.

A primeira versão não pode atribuir a queda de resistência ao efeito microestrutural se a temperatura mudou e o efeito térmico não foi isolado.

O aquecimento Joule deve ser monitorado/contabilizado, mesmo que o campo térmico esteja controlado externamente. Se não for possível manter ou medir a história de temperatura, o resultado deve ser classificado como combinação E+T+M, não E+M isolado.

## 6. Eletroplasticidade: módulo de pesquisa separado

Eletroplasticidade é a alteração da resposta plástica associada à aplicação de corrente elétrica durante a deformação. O termo não deve ser aplicado a qualquer situação em que campo e deformação apareçam juntos.

### 6.1 Mecanismos investigados na literatura
- aquecimento Joule macroscópico;
- aquecimento local associado a concentração de corrente/defeitos;
- interação entre elétrons e discordâncias (força de vento de elétrons);
- efeitos magnetoplásticos e forças eletromecânicas;
- redistribuição local de carga/alteração de barreiras em defeitos;
- efeitos dependentes de pulsos, densidade de corrente e frequência.

A importância relativa depende do metal, composição, microestrutura, temperatura, densidade de corrente, forma de onda, duração, frequência, taxa de deformação e condições de dissipação térmica. A literatura não estabelece um mecanismo único que explique todo o conjunto de resultados.

### 6.2 Regra de separação térmico/atérmico
Para alegar um efeito eletroplástico não explicado apenas por aquecimento:
- registrar a temperatura espacial e temporal, não apenas temperatura média final;
- comparar ensaios com histórico de temperatura equivalente, com e sem corrente;
- manter iguais a geometria, taxa de deformação, condição de apoio e estado inicial;
- reportar densidade de corrente, forma de onda, amplitude, duração, frequência e duty cycle;
- incluir condição sem carga mecânica e condição sem corrente;
- quando a alegação depender de defeitos/discordâncias, usar evidência microestrutural compatível (por exemplo, caracterização cristalográfica ou microscopia adequada);
- documentar incerteza, repetição e faixa de validade.

A comparação “amostra com corrente mais quente” versus “amostra sem corrente” não isola eletroplasticidade: pode medir apenas o efeito térmico. Controles com temperatura pareada são fundamentais.

### 6.3 O que não inferir
- Não afirmar que corrente sempre reduz o escoamento.
- Não presumir efeito de mesma magnitude em todos os metais.
- Não supor que pulsos são sempre mais eficazes que corrente contínua.
- Não usar a intensidade visual atual como densidade de corrente.
- Não converter a animação de elétrons em força aplicada a discordâncias.
- Não chamar o efeito de Matthiessen (defeitos alterando resistividade) de eletroplasticidade.
- Não chamar aquecimento Joule seguido de amolecimento térmico de efeito atérmico.

### 6.4 Estado no SILM
Eletroplasticidade permanece bloqueada como simulação física. Pode ser uma futura atividade comparativa de pesquisa, com hipóteses e controles, mas não deve modificar o limiar de escoamento no motor atual.

## 7. Auditoria da implementação atual na main

Arquivos consultados no branch `main`:

### 7.1 `domain/silm/drive.js`
- Intensidade do campo elétrico entre 5% e 100%, normalizada e sem unidade.
- A opção `deformField` liga/desliga o campo na experiência de deformação.
- O estado é transitório.
- Não recebe volts, ampères, densidade de corrente, resistência ou forma de onda.

### 7.2 `domain/silm/electron-view.js`
- Representa marcadores de elétrons de forma qualitativa, sem número físico, velocidade real ou trajetória microscópica real.
- O transporte usa passeio aleatório com viés médio sob campo.
- `defectScatter(d) = 1 + 1.2d` e `defectDrift(d) = 1/(1+0.6d)`, com d normalizado pela fração de deslizamentos em relação ao limite visual.
- Esses fatores são didáticos e iguais para todos os metais; não calculam R ou ρe.

### 7.3 `domain/silm/deformation.js`
- Usa um sistema de deslizamento representativo por estrutura (CFC, CCC, HC).
- Orienta o cristal para uma condição didática favorável ao deslizamento.
- Usa carga normalizada e limiar fixo YIELD = 0,5.
- Deformação elástica visualmente exagerada até EPS_YIELD = 0,06 (6%).
- Máximo de quatro deslizamentos na representação.
- Não implementa encruamento, densidade real de discordâncias, curva tensão–deformação por metal ou fratura.

### 7.4 `domain/silm/properties.js`
- A propriedade elétrica aceita dados de condutividade ou resistividade com unidade, condições e fonte.
- A elegibilidade mantém a experiência qualitativa quando não há dado numérico homologado.
- Não há cálculo acoplado de geometria deformada → resistência/condutividade no estado atual.

### 7.5 Conclusão da auditoria
A experiência atual “deformação + corrente” ilustra qualitativamente a contribuição dos defeitos no espalhamento eletrônico. Ela não simula resistência variável, densidade de corrente real, força eletroplástica ou mudança do limiar de escoamento induzida por corrente.

## 8. Experiência E+M proposta

A experiência deve usar o painel único de condições e manter a seleção múltipla já prevista.

### 8.1 Condições mecânicas
- Compressão OU tração na primeira versão.
- Controle por força/tensão OU deslocamento/deformação.
- Geometria inicial e direção dos terminais.
- Estado de deformação elástica/plástica.
- Apoios e restrições compatíveis.

### 8.2 Condições elétricas
- Tensão OU corrente prescrita.
- Terminais e direção da corrente.
- Temperatura controlada/monitorada.
- Estado da resistividade inicial e disponibilidade de parâmetros por material.

### 8.3 Resultados
- Comprimento e área transversal antes/depois.
- Resistência geométrica estimada.
- Resistividade intrínseca antes/depois, se o modelo microestrutural estiver parametrizado.
- Resistência total da amostra.
- Corrente e tensão de resposta.
- Densidade de corrente média e distribuição local, quando a geometria permitir.
- Contribuição relativa geométrica e microestrutural, sem somar grandezas incompatíveis.
- Aviso explícito quando o resultado for didático e normalizado.

### 8.4 Modos de demonstração
1. **Somente geometria:** deformar mantendo ρe constante; mostrar como L e A alteram R.
2. **Somente microestrutura:** manter geometria constante ou corrigir a geometria, variar o estado de defeitos com relação material; mostrar alteração intrínseca de ρe.
3. **Geometria + microestrutura:** acoplar os dois efeitos e mostrar as contribuições separadas.
4. **Pesquisa eletroplástica (bloqueada):** apenas quando houver dados e controles experimentais suficientes para alterar legitimamente a resposta mecânica por corrente.

## 9. Contrato conceitual do estado E+M

    type ElectricalControl = "voltage" | "current";
    type MechanicalControl = "force-stress" | "displacement-strain";
    type LoadMode = "compression" | "tension";
    type MaterialMode = "qualitative" | "parameterized" | "quantitative";

    interface ElectromechanicalExperiment {
      electrical: {
        control: ElectricalControl;
        value?: number;
        unit?: string;
        temperatureMode: "isothermal" | "coupled-thermal";
      };
      mechanical: {
        control: MechanicalControl;
        mode: LoadMode;
        value?: number;
        unit?: string;
        direction?: [number, number, number];
      };
      geometry: {
        referenceLength?: number;
        currentLength?: number;
        referenceArea?: number;
        currentArea?: number;
        unit?: string;
        calibrated: boolean;
      };
      microstructure: {
        stateModel: "none" | "dislocation-density" | "didactic-slip-count";
        dislocationDensity?: number;
        modelSource?: string;
      };
      materialMode: MaterialMode;
      results: {
        geometricResistanceChange?: number;
        intrinsicResistivityChange?: number;
        totalResistance?: number;
        current?: number;
        voltage?: number;
        currentDensity?: number;
      };
      electroplasticity: {
        enabled: false;
        reason: "requires-experimental-validation";
      };
    }

O tipo é um contrato conceitual e não deve ser copiado como estrutura definitiva sem alinhar unidades e dados ao esquema científico. Grandezas calculadas devem ficar separadas das entradas. A temperatura deve ser armazenada como condição de controle/resultado, nunca presumida constante sem monitoramento.

## 10. Testes de aceitação

### 10.1 Geometria
- [ ] Com deformação nula, L e A permanecem na geometria de referência.
- [ ] Ao alongar com ρe fixa, o aumento geométrico de R segue R = ρe L/A.
- [ ] Ao comprimir longitudinalmente com a área atualizada, o efeito geométrico acompanha a geometria.
- [ ] A área transversal nunca é estimada sem declarar o modelo de deformação transversal.
- [ ] Rotacionar a orientação dos terminais altera o caminho elétrico de forma coerente.

### 10.2 Microestrutura
- [ ] Sem deformação plástica, a contribuição por defeitos permanece no estado inicial.
- [ ] A deformação plástica atualiza o estado interno de defeitos somente segundo uma lei declarada.
- [ ] Sem dado/calibração, o modelo não apresenta Δρ em Ω·m.
- [ ] Separar a mudança de R geométrica da mudança de ρ intrínseca.
- [ ] Não associar diretamente quatro passos visuais a uma densidade real de discordâncias.

### 10.3 Circuito
- [ ] Sob tensão prescrita, aumento de R reduz a corrente.
- [ ] Sob corrente prescrita, aumento de R eleva a tensão necessária.
- [ ] Corrente é conservada nos terminais.
- [ ] A densidade de corrente usa a área atual e não a área de referência.
- [ ] A potência elétrica é contabilizada e não pode ser negativa em dissipação passiva.

### 10.4 Isolamento dos mecanismos
- [ ] Com temperatura pareada e resistividade microestrutural constante, a experiência mostra apenas efeito geométrico.
- [ ] Com geometria mantida/corrigida, mudança de ρ vem apenas da variável microestrutural.
- [ ] A experiência E+M isoterma não transfere aquecimento Joule para mudança de limite de escoamento.
- [ ] Eletroplasticidade permanece desligada sem ensaio/parametrização.
- [ ] Comparar corrente ligada/desligada com histórico térmico equivalente antes de atribuir efeito atérmico.

### 10.5 Interface
- [ ] O painel mostra condições elétricas e mecânicas em grupos distintos.
- [ ] Clique simples, Ctrl/Cmd e toque preservam a mesma seleção lógica.
- [ ] Aplicar não inicia uma combinação não suportada.
- [ ] Resultados didáticos não usam unidades físicas falsas.
- [ ] A interface não chama os controles atuais de tensão, corrente, força ou densidade real.

## 11. Fases de implementação

**Fase A — demonstração geométrica**
- Geometria de amostra simples com comprimento e seção definidos.
- Deformação prescrita (tração ou compressão).
- Resistividade mantida constante.
- Calcular somente a mudança de resistência geométrica.
- Modo didático sem unidade se a geometria não for calibrada.

**Fase B — contribuição microestrutural**
- Criar variável interna microestrutural calibrada.
- Adicionar relação ρdislocations(S), com fonte e faixa.
- Mostrar resistência total e parcelas geométrica/intrínseca.
- Fazer testes de repetibilidade e estado inicial.

**Fase C — circuito acoplado**
- Resolver tensão/corrente conforme condição de contorno.
- Atualizar J pela geometria deformada.
- Incorporar balanço de potência.
- Monitorar Joule e decidir explicitamente se o experimento permanece isotérmico.

**Fase D — pesquisa eletroplástica**
- Criar protocolo comparativo com histórico de temperatura pareado.
- Registrar densidade de corrente e forma de onda.
- Obter curvas tensão–deformação com e sem corrente.
- Homologar modelo constitutivo por material/estrutura.
- Manter mecanismos candidatos separados e declarar incerteza.

## 12. Decisões a congelar antes da implementação

1. A primeira versão E+M será isotérmica e demonstrará mudança de resistência por geometria, sem alterar o limiar mecânico por corrente.
2. O segundo modo poderá incluir contribuição microestrutural apenas quando houver variável interna e relação material homologadas.
3. A densidade de defeitos não será inferida diretamente do número de marcadores eletrônicos ou passos visuais.
4. Corrente/tensão e força/deslocamento terão controles mutuamente exclusivos.
5. A experiência atual deformação + corrente continuará rotulada como ilustração didática de espalhamento em defeitos, e não eletroplasticidade.
6. Eletroplasticidade será uma etapa de pesquisa distinta, exigindo controles térmicos equivalentes e parâmetros por material.
7. Se aquecimento Joule produzir variação térmica relevante, a experiência passa a ser E+T+M e não E+M isolado.

## 13. Referências consultadas

1. Dash, A. et al. “Electroplasticity of Metals and Ceramics: Current Status”. *Annual Review of Materials Research*, 55, 151–174, 2025. DOI: 10.1146/annurev-matsci-081720-111526. https://www.annualreviews.org/content/journals/10.1146/annurev-matsci-081720-111526 — mecanismos eletromecânicos além do aquecimento Joule e forças sobre átomos/discordâncias.
2. Niu, H. T. et al. “Electroplasticity of metallic materials: Electroplastic effect, mechanism, and models”. *Materials Today*, 97, artigo 103355, agosto de 2026. DOI: 10.1016/j.mattod.2026.103355. https://doi.org/10.1016/j.mattod.2026.103355 — dependência do material/microestrutura, modelos constitutivos e necessidade de desacoplar mecanismos experimentais.
3. Barakathulla, A. et al. “Conductivity of Cast Aluminium Alloys: A Review”. *International Journal of Metalcasting*, publicado em 18 março 2026. DOI: 10.1007/s40962-026-01931-5. https://link.springer.com/article/10.1007/s40962-026-01931-5 — contribuições de solutos, precipitados, discordâncias, contornos de grão e lacunas à resistividade; trade-off entre resistência mecânica e condutividade em ligas de alumínio.
4. Callister, W. D.; Rethwisch, D. G. *Materials Science and Engineering: An Introduction*, 9ª ed. — geometria de resistência, defeitos cristalinos e regra de Matthiessen. Consulta acadêmica registrada no documento de estudo geral do SILM.

**Decisão de segurança científica:** E+M inicial deve mostrar como geometria e estado microestrutural afetam a resposta elétrica, com cada contribuição isolada. Não ativar eletroplasticidade nem alterar diretamente o limiar de escoamento com corrente até que os dados e controles experimentais sejam suficientes.
