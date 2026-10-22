# Estruturas cristalinas no SILM (série 0.5.x)

## 1. Da montagem à rede

```text
unidades metálicas → montagem coletiva livre (0.4.x) → organização cristalográfica → célula unitária → rede extensa (0.5.x)
```

A cristalografia opera sobre o mesmo `scientificState`: não existe `crystalState` nem motor paralelo. A transformação nunca troca o metal (Cu → montagem de Cu → CFC de Cu).

CCC, CFC e HC **não são módulos**. São estados científicos da estrutura metálica investigados dentro de Explorar, Medir e Calcular.

## 2. Estrutura vem do banco científico

O SILM não pede que o estudante escolha entre CCC, CFC e HC. A estrutura é a **estrutura de referência registrada** para o metal (`referenceStructure` no banco), com a condição e a fonte de cada registro. O código não decide pelo símbolo do elemento.

Para cada metal, `SILM.crystal.eligibility` confere:

1. a existência da estrutura de referência;
2. o tipo registrado (CCC, CFC ou HC; os demais ficam **indisponíveis para visualização**, nunca substituídos);
3. a fase sólida na condição de referência;
4. a coerência dos dados: grupo espacial (229, 225 ou 194), parâmetros de rede da simetria, e sítios fracionários expandidos pelas operações de simetria registradas, que precisam coincidir com a base do modelo, a menos da escolha de origem.

| Código de indisponibilidade | Significado |
|---|---|
| `REFERENCE_STRUCTURE_MISSING` | sem estrutura de referência registrada |
| `CRYSTAL_STRUCTURE_UNSUPPORTED` | estrutura registrada fora de CCC/CFC/HC (por exemplo, α-Mn, β-Sn, DHCP, romboédrica) |
| `REFERENCE_CONDITION_UNSUPPORTED` | condição de referência sem fase sólida |
| `DATA_CONFLICT` | dados inconsistentes com o modelo; bloqueado para revisão |

Mensagem exibida: *"Estrutura cristalina de referência registrada, mas ainda não disponível para visualização no SILM."* A investigação, a consulta e a montagem livre continuam disponíveis. A cobertura por metal está em [`COBERTURA-METAIS.md`](COBERTURA-METAIS.md): 48 metais com visualização (13 CCC, 14 CFC, 21 HC) e 9 investigáveis sem visualização cristalográfica. Na versão 0.15.0 foram homologados Ti, Cr, Co, Rb, Zr, Nb, Ru, Rh, Cd, Cs, Hf, Re, Os e Ir. Sistemas fora de CCC/CFC/HC permanecem bloqueados até a implementação de modelos geométricos específicos.

## 3. Os três modelos

| | CCC (BCC) | CFC (FCC) | HC (HCP) |
|---|---|---|---|
| Nome | cúbica de corpo centrado | cúbica de faces centradas | hexagonal compacta |
| Grupo espacial | Im-3m (nº 229) | Fm-3m (nº 225) | P6₃/mmc (nº 194) |
| Base (fracionária) | (0,0,0), (½,½,½) | (0,0,0), (0,½,½), (½,0,½), (½,½,0) | (0,0,0), (⅓,⅔,½) |
| Sítios desenhados na célula | 9: 8 vértices + 1 centro do corpo | 14: 8 vértices + 6 centros de face | 17: 12 vértices + 2 centros de base (camada A) + 3 internos (camada B) |
| Átomos efetivos na célula | 2 = 8 × 1/8 + 1 | 4 = 8 × 1/8 + 6 × 1/2 | 6 = 12 × 1/6 + 2 × 1/2 + 3 (prisma hexagonal) |
| Número de coordenação | 8 | 12 | 12 (6 no plano + 6 nos planos vizinhos) |
| Distância aos vizinhos | a√3/2 | a/√2 | a (no plano) e √(a²/3 + c²/4) |

**HC.** A origem foi colocada num átomo da camada A, a convenção de livros-texto. Ela é equivalente, por translação, aos sítios 2c (⅓, ⅔, ¼) registrados no banco. As proporções do prisma usam a razão c/a do metal. Quando c/a se afasta mais de 2% do ideal √(8/3) ≈ 1,633, o painel Ver informa que os 6 vizinhos dos planos adjacentes não ficam exatamente à mesma distância que os 6 do mesmo plano. Exemplos: Be (1,568) e Zn (1,856). O empilhamento ABAB fica perceptível: as unidades da camada B têm anel interno tracejado e, com rótulos ativos, letras A e B.

## 4. Célula unitária

A célula unitária é a **unidade geométrica repetitiva da rede**, não uma molécula. A vista "Célula" mostra contorno discreto e tracejado: as 12 arestas do cubo ou o prisma hexagonal, com planos de base translúcidos. As unidades permanecem visíveis, e um aviso lembra que o sólido continua em todas as direções.

Mostrar ou ocultar a célula é camada de representação: não muda a estrutura científica nem o `updatedAt` da estrutura. O leitor de tela recebe "Célula unitária visível/oculta" no nome da área e no indicador.

## 5. Rede extensa

A vista "Rede" desenha um bloco maior que a célula (3 × 3 × 3 células cúbicas ou o equivalente hexagonal) num único grupo SVG decorativo, com cerca de 100 a 170 círculos, e não milhares de nós. Há esmaecimento radial e recorte nas bordas para sugerir continuidade além da área visível. As unidades do estudante continuam destacadas e selecionáveis dentro dela.

## 6. Organizar estrutura

**Organizar estrutura** é uma *reorganização didática segundo a estrutura cristalográfica de referência*, não uma "simulação de cristalização". Antes de aplicar, um diálogo explica o que vai acontecer.

- As unidades existentes são reaproveitadas (mesmo ID, mesma origem `manual` ou `assisted`). Cada uma vai para o sítio mais próximo da sua posição na cena, por pareamento guloso determinístico.
- Se houver menos unidades que sítios na célula, o SILM completa a célula com unidades marcadas `placement: "crystallographic"`. A interface e o relatório contam separadamente "do estudante" e "completadas pelo SILM".
- Unidades além da célula ocupam sítios das células vizinhas, sem descarte.
- A transição dura cerca de 450 ms. Com redução de movimento (preferência do sistema ou do SILM), o estado final é aplicado diretamente.

**Voltar à montagem livre** restaura exatamente a montagem anterior, guardada em `crystallography.freeUnits`. As unidades completadas saem. Organizar de novo produz a mesma correspondência.

## 7. Vizinhança e coordenação

Com uma unidade selecionada, **Mostrar vizinhos** destaca os N sítios mais próximos (N = coordenação do modelo), calculados em 3D a partir dos parâmetros tabelados. Vizinhos que são unidades recebem halo pontilhado e contorno; vizinhos fora das unidades desenhadas aparecem como anéis tracejados.

Não há barras nem linhas de ligação. O número de coordenação é classificado como **resultado do modelo cristalográfico**, não como medição do estudante. O anúncio informa a quantidade: "12 vizinhos imediatos destacados".

## 8. Representação e escala

- Pseudo-3D ortográfica com profundidade (ordem e escala) para oclusão. Os ângulos de vista por estrutura (CCC −20°/16°, CFC −11°/17°, HC −10°/16°) foram escolhidos por busca numérica para maximizar a separação projetada entre os sítios da célula.
- Esferas reduzidas (diâmetro ≈ 30% da distância entre vizinhos), sem escala física absoluta. As proporções da célula vêm dos parâmetros tabelados.
- Os parâmetros de rede aparecem sempre com a condição de referência.
- O 3D científico definitivo pertence à série 0.12.x.

## 9. Limitações do modelo

- A representação cristalográfica é um modelo didático da organização periódica do sólido metálico.
- A célula unitária representa a unidade repetitiva da rede, não uma molécula metálica independente.
- Linhas de ligação localizadas não são utilizadas porque o modelo do SILM não representa a ligação metálica como pares isolados M—M.
- A visualização desta série não inclui ainda elétrons deslocalizados.
- Parâmetros cristalográficos dependem das condições de referência registradas no banco científico.
- O contorno da célula é geométrico: suas arestas não representam ligações.
