# Módulo Explorar — investigação qualitativa integrada

> Série 0.8.x. Explorar é a perspectiva qualitativa do Laboratório sobre o mesmo objeto científico. Contrato: [`CONTRATO-EXPLORACAO.md`](CONTRATO-EXPLORACAO.md).

## 1. Princípio

Explorar **não** é um novo estado científico nem uma coleção de submódulos. Ele organiza, sobre o mesmo `scientificState`, as mecânicas já implementadas:

| Série | Mecânica reutilizada |
|---|---|
| 0.2.x–0.3.x | metal, investigação, Tabela Periódica |
| 0.4.x | montagem livre (adicionar, selecionar, mover, desfazer, assistência, limpar) |
| 0.5.x | organização cristalográfica, célula, rede, vizinhança, rótulos |
| 0.6.x | modelo eletrônico, elétrons deslocalizados, movimento, movimento reduzido |
| 0.7.x | propriedades (campo elétrico, calor, compressão, tração, luz) |

Nenhum motor foi reimplementado: há uma única camada eletrônica ativa por cena e uma experiência de propriedade por vez.

## 2. Estados da experiência (§6)

| Estado | O que o Explorar oferece |
|---|---|
| sem metal | Tabela Periódica e Iniciar investigação |
| metal, sem estrutura | Iniciar montagem (prioridade) |
| montagem livre | adicionar, selecionar, mover, desfazer, assistência, limpar, organizar (quando elegível), elétrons, condutividade elétrica |
| estrutura cristalina | célula, rede, vizinhos, rótulos, elétrons, propriedades, camadas, pseudo-3D |
| propriedade ativa | somente os controles da propriedade atual |

O fluxo natural (metal → montar → organizar → célula/rede → elétrons → propriedades) **não é bloqueado**. Por exemplo, a condutividade elétrica pode ser investigada direto na montagem livre.

## 3. Grupos (não são módulos)

- **Montagem** (painel esquerdo): Resumo, Metal, Estrutura, Propriedades, Módulo.
- **Ver** (painel direito):
  - **Observar**: painel contextual;
  - **Camadas**;
  - **Comparar**.
- **Dados**: Tabela, Histórico, Relatório.

## 4. Painel de observação contextual (Ver → Observar)

Uma barra de foco (Síntese, Centro, Célula/Montagem, Elétrons, Propriedade) muda o conteúdo conforme o objeto científico:

| Foco | Conteúdo |
|---|---|
| Síntese | metal, módulo, estrutura, elétrons e propriedade da investigação atual |
| Centro | elemento e configuração; posição da unidade na célula; coordenação; vizinhos imediatos e distância entre vizinhos (calculada pelo SILM a partir do parâmetro de rede tabelado) |
| Célula / Montagem | tipo, grupo espacial, condição, parâmetros, coordenação, átomos efetivos, fonte e limitações; propriedades disponíveis para a estrutura |
| Elétrons | modelo eletrônico, origem conceitual, classificação qualitativa, esquema átomo → estrutura e limitações |
| Propriedade | O que você alterou / O que aconteceu / Como interpretar, dados, condição e limitação |

O foco acompanha a última ação. Escolhido no painel, ele prevalece enquanto estiver disponível.

## 5. Camadas (Ver → Camadas)

Centros metálicos, célula unitária, rede extensa, vizinhos, elétrons, rótulos e indicações da propriedade, com o estado lido por leitor de tela ("Camadas visíveis: …"). Só aparecem as aplicáveis. As camadas reutilizam os estados da 0.5.x e da 0.6.x.

## 6. Comparação qualitativa (Ver → Comparar)

Livre × cristalina, célula × rede, elétrons ocultos × visíveis, antes × depois da propriedade. As cenas A e B são derivadas e somente leitura. No desktop ficam lado a lado; no celular há alternância A/B. A comparação nunca escreve no estado científico.

## 7. Indicador de estado

A linha de identificação da cena resume metal, estrutura e, quando houver, a propriedade em estudo (por exemplo: "CFC · cúbica de faces centradas · 14 unidades · Brilho metálico em estudo"). Não há painel de controle pesado.

## 8. Continuidade

Trocar Explorar → Medir → Calcular → Explorar, ir ao Manual ou ao Professor e recarregar preservam investigação, metal, estrutura, cristalografia, elétrons e propriedade. Medir e Calcular continuam sem instrumentos e sem cálculos (séries 0.9.x e 0.10.x).

## 9. Fora desta série

Renderer 2D definitivo (0.11.x), 3D (0.12.x), conteúdo de Roteiros e Missões (0.13.x–0.14.x), relatório final (0.15.x), instrumentos (0.9.x) e cálculos (0.10.x).
