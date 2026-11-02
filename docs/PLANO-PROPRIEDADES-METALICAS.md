# Plano — Propriedades metálicas com mecânica contínua

Proposta de 02/11/2026, a partir do pedido do autor: "atualmente ela está meio movimenta barrinha e o desenho se mexe, precisamos de mais fluidez nessas mecânicas". O plano também avalia as quatro sugestões enviadas: mar de elétrons, massa-mola com escoamento, PBR e ligas.

Status: **P1 implementada** (maleabilidade e ductilidade). P2 a P6 continuam como proposta.

**Decisões do autor (02/11/2026):**
- Começar por maleabilidade e ductilidade (P1).
- Fonte dos sistemas de deslizamento: Callister & Rethwisch. **Pendente:** o autor confere no livro a edição, o número da tabela e a página, e esses dados entram no registro `src-callister-rethwisch` de `sources.json`.
- Comparar metais com dados reais fica para uma etapa própria (P5).
- Sem barras deslizantes. Elas destoavam da estética, então a força passou a vir da prensa (ou da garra) arrastada na cena, e a intensidade da comparação virou botões segmentados.

---

## 1. Como as propriedades funcionam hoje

| Propriedade | Como funciona hoje (`properties.js`, `property-view.js`, `crystal-view.js`) | O que falta |
|---|---|---|
| Maleabilidade | O botão "Aplicar compressão" tem 3 etapas. Cada etapa aplica uma transformação afim à estrutura inteira (achata, alarga e inclina tudo junto). | O desenho **salta** de uma etapa para outra. Não se vê nenhum plano deslizar: a estrutura inteira se deforma de modo uniforme, o que se parece mais com deformação **elástica** que com deformação **plástica**. Também não existe "soltar e ver o que ficou". |
| Ductilidade | O mesmo esquema, com 3 etapas de alongamento. | Os mesmos problemas. |
| Condutividade térmica | Os botões "Aquecer região" e "Avançar propagação" têm 4 etapas. A difusão é calculada no grafo de vizinhos, e a fonte de calor fica fixa à esquerda. | O tempo só anda quando o aluno clica. Não dá para escolher onde aquecer nem ver o calor se espalhar sozinho até o equilíbrio. |
| Condutividade elétrica | Um botão liga e desliga o campo. Os elétrons fazem um passeio aleatório e, com o campo, ganham uma deriva. A animação já é contínua, num canvas com `requestAnimationFrame`. | O campo só tem dois estados, ligado ou desligado. Não há intensidade nem medida qualitativa de fluxo. |
| Brilho metálico | Um botão liga e desliga a luz. Os feixes de entrada e saída são desenhados em posições fixas. | Não dá para mudar o ângulo, e o feixe refletido não acompanha a lei da reflexão. |

**Dado do banco:** nenhum dos 118 elementos tem valor numérico de propriedade (`properties: {}`). Por isso, hoje, toda experiência de propriedade é **qualitativa**: ela mostra o mecanismo, não a resposta de um metal específico.

## 2. Princípios que continuam valendo

1. **Mecanismo não é dado do metal.**
   - Os coeficientes da simulação (rigidez, limiar, difusão) são **didáticos e únicos**, iguais para todos os metais, e aparecem declarados nos limites do modelo.
   - Diferenças entre metais só entram com um dado registrado no banco (valor, unidade, condição e fonte) e validado pelo autor.
   - Nenhum "valor típico" é inventado.
2. **A estrutura científica não muda.** A experiência é um estado da representação. O que fica de uma deformação plástica é guardado como resultado da experiência, nunca como uma nova estrutura de referência do metal.
3. **Acessibilidade.**
   - Tudo o que se faz arrastando também se faz por teclado (setas) e por botões.
   - O texto narra o que aconteceu, para que a animação nunca seja a única informação.
   - Com movimento reduzido, a cena mostra estados estáticos.
4. **Determinístico e testável.** A simulação usa passo de tempo fixo e semente fixa, e os testes conferem invariantes físicos (seção 5).

## 3. Mecânica comum: o que dá a fluidez

- **Laço de simulação:** a física avança em passo fixo (por exemplo, 1/120 s), e o desenho é interpolado a cada quadro. O laço pausa com a aba oculta e não roda com movimento reduzido.
- **Entrada contínua na cena:**
  - cada experiência ganha uma **ferramenta** que o aluno arrasta (martelo/prensa, garras de tração, fonte de calor, lanterna, polos do campo), com alça visível e alvo de 44 px;
  - a intensidade vai de 0 a 100 %, em vez de etapas de 0 a 3;
  - a alternativa sem arrastar é um controle deslizante com setas.
- **Soltar tem significado:** a parte elástica volta, e a parte plástica permanece (maleabilidade e ductilidade).
- **O que é salvo:** só os resultados (deslizamentos acumulados e as escolhas do aluno), nunca o estado transitório de cada quadro.

## 4. Avaliação das sugestões, propriedade por propriedade

### 4.1 Mar de elétrons e condutividade (elétrica e térmica)

**Sugestão:** usar grafo ou autômato celular e um sistema de partículas.

**Avaliação:** o SILM já tem as duas peças.

- O **grafo de vizinhos** vem da geometria cristalina do banco.
- A **camada de partículas** está em `electron-view.js`: um passeio aleatório isotrópico, com deriva sob campo.

**O que muda:**

- **Elétrica.**
  - A intensidade do campo passa a ser contínua (0–100 %, sem unidade), ajustada pelos polos ou pela seta E.
  - A deriva média fica proporcional à intensidade, como uma lei de Ohm qualitativa (v_d ∝ E), e o passeio aleatório continua.
  - Um indicador qualitativo de fluxo mostra os elétrons que atravessam uma seção.
- **Térmica.**
  - A equação do calor discreta passa a rodar **no tempo** sobre o grafo de vizinhos: dTᵢ/dt = D · Σⱼ (Tⱼ − Tᵢ).
  - O aluno encosta a fonte em qualquer ponto, e o calor se espalha continuamente.
  - Sem fonte, a estrutura tende ao equilíbrio: a temperatura fica uniforme e a energia total se conserva.
  - Os níveis aparecem em cor **e** em anéis, nunca só em cor.
- **Correções conceituais**, que vão para os textos do SILM:
  - Os elétrons **não** atravessam o metal "quase instantaneamente". A velocidade de deriva é pequena; o que se estabelece rapidamente é o campo. O SILM já avisa que a velocidade visual não é a real, e esse aviso continua.
  - "Coeficiente de atenuação linear" não descreve a condução de calor, que é **difusão**. Usaremos a equação do calor, com um D didático único.
- **Comparar metais**, por exemplo cobre × ferro, só será possível com condutividade elétrica e térmica registradas com fonte (por exemplo, o CRC Handbook) e validadas pelo autor.

### 4.2 Maleabilidade e ductilidade

**Sugestão:** massa-mola (Verlet) com limite de escoamento que reescreve a posição de repouso da mola.

**Avaliação:**

- O sistema massa-mola é uma boa base para a parte **elástica**.
- Reescrever a posição de repouso de cada mola, porém, deixaria a rede **desordenada** (amorfa), e não é isso que acontece num metal.
- A deformação plástica acontece por **deslizamento de planos cristalinos inteiros**, em passos de um vetor da rede (o vetor de Burgers, b). Depois de cada passo, a rede volta a ser a mesma rede, e é por isso que a ligação "não se rompe": a vizinhança se refaz.
- Mostrar exatamente isso é mais fiel à ciência e também mais bonito de ver.

**Proposta híbrida:**

1. **Elástico.** Arrastar a prensa ou as garras comprime ou estica a estrutura, e soltar faz tudo voltar.
   - Implementado como um oscilador amortecido, em passo fixo, para a deformação elástica uniforme.
   - Num cristal perfeito sob carga uniforme, a deformação elástica é uniforme. Por isso, molas por átomo não acrescentariam ciência nesta escala.
2. **Plástico.**
   - Quando o esforço passa de um **limiar didático único**, o bloco acima de um plano de deslizamento avança **um passo b**, com animação contínua, e esse passo permanece.
   - Repetir o esforço gera degraus: com compressão, a estrutura vira uma lâmina; com tração, vira um fio.
   - b é a distância entre vizinhos na direção compacta, calculada da geometria do banco.
3. **Sistemas de deslizamento por estrutura.**
   - CFC: {111}⟨110⟩. CCC: {110}⟨111⟩. HC: basal (0001)⟨11-20⟩.
   - São conhecimento de livro-texto, mas, pela regra do SILM, **precisam de fonte registrada** no banco. Proposta: a tabela de sistemas de deslizamento de Callister & Rethwisch, *Ciência e Engenharia de Materiais: uma introdução*. A edição, a tabela e a página ficam **a conferir pelo autor**.
4. **O que não entra sem dado.**
   - O limite de escoamento de cada metal não está no banco.
   - Afirmações como "HC é menos dúctil" dependem de fonte.
   - Até haver fonte, a experiência mostra só o **mecanismo**; o aviso INSUFFICIENT_VALIDATION continua.
5. **Estruturas do modelo geral** (α-Mn, β-Sn, romboédrica etc.): a experiência continua indisponível (DEFORMATION_MODEL_NOT_APPLICABLE).

### 4.3 Brilho metálico

**Sugestão:** PBR, com *metalness* e F₀.

**Avaliação:**

- PBR é uma técnica de computação gráfica para gerar imagens realistas. Ela exige WebGL e valores de F₀ por metal, que vêm de dados ópticos (índices n e k).
- A cena do SILM não usa WebGL, e o banco não tem dados ópticos.

**Proposta:**

- Uma **lanterna arrastável** muda o ângulo de incidência de modo contínuo.
- O feixe refletido segue a **lei da reflexão** (θᵣ = θᵢ). Isso é física geral, não um dado do metal.
- Não há feixe transmitido: a luz não atravessa o metal, porque é absorvida numa camada muito fina da superfície.
- A cor própria do metal (ouro, cobre) só entra numa fase futura, com dado óptico de fonte registrada (refletância espectral).
- **Refinamento do texto:** em vez de "absorvem e reemitem", dizer "os elétrons livres oscilam com o campo da luz e reirradiam". O texto atual do SILM ("respondem à luz incidente e a reemitem") já está próximo disso.

### 4.4 Ligas metálicas e enrijecimento (solução sólida)

**Sugestão:** nós de impureza com rigidez diferente.

**Avaliação:** é **conteúdo novo**. O banco só tem elementos puros. Faltam:

- a escolha das ligas;
- a composição;
- a estrutura da solução sólida;
- o tipo da solução (substitucional ou intersticial);
- as fontes de tudo isso.

Carbono no ferro, por exemplo, forma solução **intersticial** com um não metal, que está fora do banco atual.

**Proposta, numa fase posterior e com conteúdo e fontes do autor:**

- Átomos de soluto **substitucionais**, com o raio do modelo do próprio elemento (derivado do banco), distorcem a vizinhança.
- Essa distorção aumenta o limiar local de deslizamento, o que é qualitativo e coerente com a seção 4.2.

## 5. Como vamos testar a física

| Experiência | Invariantes conferidos nos testes |
|---|---|
| Térmica | Sem fonte, a soma das temperaturas se conserva. A temperatura tende ao equilíbrio uniforme (diferença máxima decrescente). Nenhum valor sai do intervalo [0, 1]. |
| Elástico | Depois de soltar, as posições voltam ao repouso dentro de uma tolerância, e não sobra deslizamento. |
| Plástico | Cada deslizamento é um múltiplo inteiro de b. Depois do passo, todo centro coincide com um sítio da rede (a rede é a mesma). |
| Elétrica | Sem campo, a deriva média é nula, dentro de uma tolerância estatística com semente fixa. Com campo, a deriva tem o sentido oposto a E e cresce com a intensidade. |
| Brilho | O ângulo de reflexão é igual ao de incidência, e não há feixe transmitido. |
| Interface | Arrastar, teclado e botões dão o mesmo resultado. Testes nos 5 tamanhos de tela, com movimento reduzido (estados estáticos e texto) e sem rolagem lateral. |

## 6. Etapas propostas

| Etapa | Conteúdo | Depende do autor? |
|---|---|---|
| **P1** | Laço contínuo comum. Maleabilidade e ductilidade com molas (elástico) e deslizamento de planos em passos de b (plástico). | Sim: confirmar a fonte dos sistemas de deslizamento. |
| **P2** | Condução térmica contínua (equação do calor no grafo e fonte arrastável). | Não. |
| **P3** | Condução elétrica com intensidade contínua e indicador de fluxo. | Não. |
| **P4** | Brilho com lanterna arrastável e lei da reflexão. | Não. |
| **P5** | Comparar metais com dados reais (condutividades). | Sim: dados com fonte. |
| **P6** | Ligas (solução sólida substitucional). | Sim: conteúdo e fontes. |

Cada etapa traz os testes da seção 5, a atualização do Manual ("Propriedades metálicas"), os textos de limites do modelo e o registro no CHANGELOG.

## 7. Como a P1 ficou (registro de implementação)

- **Módulo:** `domain/silm/deformation.js`. Ele reúne os sistemas de deslizamento, b, os planos, a orientação de ensaio alinhada à câmera, a fatia da amostra e o controlador contínuo (um por modelo).
- **Estado guardado:** só o número de deslizamentos, até 4 (`properties.malleability.compression` e `properties.ductility.elongation`). A carga, a deformação elástica e as animações não são salvas.
- **Interação:**
  - arrastar a alça da prensa (ou da garra) na cena;
  - pelo teclado, com a alça em foco: setas, Home e End;
  - pelos botões "Comprimir até deslizar" e "Puxar até deslizar", que registram um deslizamento e animam carga → deslizamento → retorno elástico;
  - com movimento reduzido, os estados finais aparecem sem animação.
- **Cena:**
  - a amostra da vista Rede é uma fatia fina do cristal no plano do deslizamento, e as unidades da célula fora dela ficam esmaecidas;
  - os planos já deslizados aparecem em tracejado, e os blocos em tons alternados;
  - a câmera enquadra a forma de referência e as formas extremas, sem "respirar";
  - o contorno da célula sai durante a deformação.
- **Desempenho:** 60 quadros por segundo. O controlador lê o estado uma vez por quadro, porque cada leitura de `model.state` copia o estado inteiro.
- **Testes:** `tests/deformation.cjs`, com os invariantes da seção 5 para Cu, Fe, Mg, Al, W e Ti.
