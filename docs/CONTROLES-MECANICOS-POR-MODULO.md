# SILM — Controles e mecânicas por módulo

> Plano operacional, iniciado em 11/11/2026. Base científica: motores existentes em `domain/silm/{properties,thermal,deformation,drive,electrothermal,measurements,calculations,crystal}.js`. A interface não pode criar resultados físicos paralelos.

## Contrato comum

- **Explorar:** o gesto modifica preparação, estímulo ou apresentação do sistema. Somente este módulo altera a montagem ou ativa estímulos das propriedades.
- **Medir:** o gesto identifica sítios e pares/trios geométricos da **mesma** estrutura cristalina. A medição depende das coordenadas cartesianas do motor, não de pixels/zoom/câmera; nenhuma propriedade é ativada por selecionar um ponto.
- **Calcular:** o gesto seleciona a relação cristalográfica, escolhe a procedência das entradas e executa a fórmula do catálogo oficial. Resultados e dependências são persistidos no estado da investigação.
- As três operações pertencem à **mesma investigação**; mudar módulo não altera metal, estrutura, medições ou cálculos armazenados. A seleção incompleta de um instrumento é descartada ao sair de Medir.
- Câmera, projeção e navegação são **comuns**, não devem ser duplicadas em cada módulo; escala 4 (Centro) não deve introduzir célula fictícia.
- Montagem livre não fornece escala física absoluta. Medir/Calcular exigem estrutura cristalina validada; deformação em curso pode impedir medida de referência. Rótulos diferenciam **dado tabelado**, **medida do modelo**, **calculado pelo SILM** e **informado pelo estudante**.

## Matriz operacional

| Módulo | Controle principal | Mecânica na cena | Resposta ou registro | Limite científico |
|---|---|---|---|---|
| Explorar | Adicionar/organizar unidades (Montagem) | Posicionar centros no modelo livre; organizar sítios pela referência cristalográfica | Estrutura e histórico de edição | Organizar não inventa geometria sem dados homologados |
| Explorar | Mar de elétrons (Ver) | Exibir/ocultar representação e movimento coletivo | Estado visual sincronizado | Não são trajetórias eletrônicas quânticas |
| Explorar | Fonte/campo elétrico | Acionar fluxo e manipular controle de intensidade no palco | Efeito elétrico/representação correspondente | Grandezas relativas em ensaios qualitativos |
| Explorar | Calor/fonte térmica | Aplicar estímulo e observar propagação e resfriamento | Estado térmico do motor | Não apresentar temperaturas físicas arbitrárias |
| Explorar | Prensa/tração | Deslocar o manipulador na geometria A1 | Resposta geométrica por deformação | Deslizamento didático, não plasticidade multiescala completa |
| Explorar | Lanterna | Direcionar feixe e ângulo no palco | Reflexão/brilho observáveis | Modelo de reflexão, sem espectro real previsto |
| Explorar | Efeito Joule | Ativar ensaio; alterar tensão/corrente, fronteira térmica e avançar intervalo | Campo/leituras/balanço de energia | Ensaios em grandezas relativas, no mesmo motor eletrotérmico |
| Medir | Régua (2 centros A–B) | Marcar segmento entre sítios científicos | Distância em Å, pm ou nm | Valor independe da câmera |
| Medir | Goniômetro (A–B–C) | Marcar três centros, B como vértice | Ângulo em graus | Não aceitar posições coincidentes |
| Medir | Parâmetro da rede (A–B) | Selecionar dois sítios equivalentes numa aresta | Parâmetro a, b ou c | Não confundir vetor arbitrário com aresta |
| Medir | Contador de coordenação (1 centro) | Selecionar centro e destacar camada de vizinhos | Número de coordenação e critério de distância | Dependência da estrutura e da camada analisada |
| Calcular | Número efetivo de átomos | Destacar frações dos sítios nos limites da célula | n | Contagem da célula adotada, inclusive prisma HC convencional |
| Calcular | Volume da célula | Destacar arestas/vetores da célula | V com parâmetros e ângulos | A geometria geral usa os seis parâmetros |
| Calcular | Raio metálico | Destacar distâncias de contato quando modelo permitir | r | Modelo de esferas rígidas declarado |
| Calcular | Parâmetro a partir de r | Mostrar contato geométrico relevante | a | Relação específica CCC/CFC |
| Calcular | Fator de empacotamento | Destacar frações dos centros; relacionar n, r e V | FE | Não é fração da densidade eletrônica |
| Calcular | Densidade teórica | Relacionar massa da célula e seu volume | ρ | Célula ideal, N_A do SI |
| Calcular | Razão c/a (HC) | Destacar arestas dos eixos basal/vertical | c/a | Valor ideal é referência geométrica, não propriedade universal |

## Hierarquia de interface

1. **Escalas no topo**, uma cena central ampla, uma barra inferior única para câmera e navegação.
2. **Ver → Explorar:** ações visuais e estímulos com efeito perceptível; parâmetros específicos junto aos manipuladores/ensaio. Evitar um segundo seletor de propriedades.
3. **Ver → Medir:** instrumentos diretos; instrumento ativo mostra qual sítio escolher (A, B, C), marcadores na cena, desfazer/cancelar seleção e resultado. Ctrl/teclado e toque compartilham os mesmos eventos do motor.
4. **Ver → Calcular:** fórmulas diretas; destacar na cena as entidades da expressão (frações, arestas ou contatos). Formulário mantém as origens e dependências; **medidas válidas da investigação têm preferência inicial**, sem impedir escolha manual.
5. **Dados:** fonte, precisão, condições, registros e proveniência. Não poluir a área central com fichas textuais.

## Aceitação e regressões

- 320–1920 px, 150% de texto, Chromium/Firefox/WebKit, áreas de toque ≥44 px; sem overflow global.
- Trocar módulo limpa apenas a seleção transitória, nunca registros científicos.
- Escapar/cancelar seleção, desfazer um ponto e interagir por teclado não apagam a investigação.
- Calcular volume/raio/contagem seleciona o destaque geométrico apropriado; mudar câmera não muda nenhum resultado.
- Preferência por medida do modelo usa somente medida **válida no contexto atual**; não usa medida antiga ou de outra estrutura.
- Rotas, missões e bloqueios de módulo continuam restringindo a disponibilidade; o usuário não consegue iniciar estímulos em Medir/Calcular.

## Implementação

**Primeira entrega nesta branch:** orientação contextual de seleção em Medir, comandos de desfazer/cancelar, limpeza na troca de módulo, instrução acessível na cena, visualização da família geométrica da fórmula em Calcular, e preferência não obrigatória por medidas válidas. Não há nova simulação científica nem merge automático.

**Próximas entregas:** instrumentar visualmente cada efeito no palco em Explorar; transições coerentes escala 1→4; tornar a proveniência e o encadeamento das fórmulas mais visuais; auditoria de gestos mouse/touch/caneta/teclado e contratos de Roteiros/Missões.
