# Módulo Explorar — investigação qualitativa integrada

> **Referência histórica:** este documento registra a organização visual e a perspectiva de investigação introduzidas na série 0.8.x. Para as regras operacionais atuais — ciclo de vida das experiências, estímulos, combinações, autorização por módulo e estado transitório — consulte o [Contrato operacional do Explorar](CONTRATO-OPERACIONAL-EXPLORAR.md). O contrato visual anterior permanece disponível em [CONTRATO-EXPLORACAO.md](CONTRATO-EXPLORACAO.md).

## Especificações aprofundadas

- [Contrato operacional do Explorar](CONTRATO-OPERACIONAL-EXPLORAR.md) — regras comuns de experiência, fontes, ferramentas, coexistência e autorização.
- [Estímulo luminoso](ESTIMULO-LUMINOSO.md) — reflexão, resposta espectral, cor derivada de dados e validação científica.
- [Estímulo térmico](ESTIMULO-TERMICO.md) — fonte, condução pela estrutura, capacidade térmica, troca com o ambiente, resfriamento e balanço de energia.
- [Estímulo elétrico](ESTIMULO-ELETRICO.md) — campo aplicado, deriva dos elétrons, corrente convencional, espalhamento e aquecimento Joule.

## 1. Princípio

Explorar **não** é um novo estado científico nem uma coleção de submódulos. Ele organiza, sobre o mesmo estado científico, as mecânicas já implementadas:

| Série | Mecânica reutilizada |
|---|---|
| 0.2.x–0.3.x | metal, investigação, Tabela Periódica |
| 0.4.x | montagem livre (adicionar, selecionar, mover, desfazer, assistência, limpar) |
| 0.5.x | organização cristalográfica, célula, rede, vizinhança, rótulos |
| 0.6.x | modelo eletrônico, elétrons deslocalizados, movimento, movimento reduzido |
| 0.7.x em diante | propriedades e experiências qualitativas: campo elétrico, calor, compressão, tração e luz |

Nenhum motor deve ser duplicado para reorganizar a experiência: há uma única camada eletrônica ativa por cena e uma experiência principal de propriedade por vez. Combinações auxiliares só são permitidas quando possuem acoplamento definido e validado, conforme o contrato operacional.

## 2. Estados da experiência (referência visual 0.8.x)

| Estado | O que o Explorar oferece |
|---|---|
| sem metal | Tabela Periódica e Iniciar investigação |
| metal, sem estrutura | Iniciar montagem (prioridade) |
| montagem livre | adicionar, selecionar, mover, desfazer, assistência, limpar, organizar (quando elegível), elétrons e experiências compatíveis |
| estrutura cristalina | célula, rede, vizinhos, rótulos, elétrons, propriedades, camadas e pseudo-3D |
| propriedade ativa | controles da experiência principal e dos estímulos auxiliares explicitamente permitidos |

O fluxo natural (metal → montar → organizar → célula/rede → elétrons → propriedades) **não é bloqueado**. A disponibilidade de cada experiência depende da elegibilidade do metal, da fase e da estrutura.

## 3. Grupos (não são módulos)

- **Montagem** (painel esquerdo): Resumo, Metal, Estrutura, Propriedades e Módulo.
- **Ver** (painel direito):
  - **Observar**: painel contextual;
  - **Camadas**;
  - **Comparar**.
- **Dados**: Tabela, Histórico e Relatório.

Esses grupos organizam a interface. A navegação científica principal permanece limitada a Explorar, Medir e Calcular.

## 4. Painel de observação contextual (Ver → Observar)

Uma barra de foco (Síntese, Centro, Célula/Montagem, Elétrons, Propriedade) muda o conteúdo conforme o objeto científico:

| Foco | Conteúdo |
|---|---|
| Síntese | metal, módulo, estrutura, elétrons e propriedade da investigação atual |
| Centro | elemento e configuração; posição da unidade na célula; coordenação; vizinhos imediatos e distância entre vizinhos calculada a partir do parâmetro de rede de referência |
| Célula / Montagem | tipo, grupo espacial, condição, parâmetros, coordenação, átomos efetivos, fonte e limitações; propriedades disponíveis para a estrutura |
| Elétrons | modelo eletrônico, origem conceitual, classificação qualitativa, esquema átomo → estrutura e limitações |
| Propriedade | O que você alterou / O que aconteceu / Como interpretar, evidência, condição e limitação |

O foco acompanha a última ação. Escolhido no painel, ele prevalece enquanto estiver disponível.

## 5. Camadas (Ver → Camadas)

Centros metálicos, célula unitária, rede extensa, vizinhos, elétrons, rótulos e indicações da propriedade, com o estado lido por leitor de tela ("Camadas visíveis: …"). Só aparecem as camadas aplicáveis. Sua visibilidade não deve alterar o estado científico nem acionar uma ferramenta de outro módulo.

## 6. Comparação qualitativa (Ver → Comparar)

Livre × cristalina, célula × rede, elétrons ocultos × visíveis, antes × depois da propriedade. As cenas A e B são derivadas e somente leitura. No desktop ficam lado a lado; no celular há alternância A/B. A comparação nunca escreve no estado científico e não é uma medição.

## 7. Indicador de estado

A linha de identificação da cena resume metal, estrutura e, quando houver, a propriedade em estudo (por exemplo: "CFC · cúbica de faces centradas · 14 unidades · Brilho metálico em estudo"). A interface deve priorizar informação contextual curta, sem duplicar explicações extensas.

## 8. Continuidade entre módulos

Trocar Explorar → Medir → Calcular → Explorar preserva investigação, metal, estrutura, cristalografia, elétrons e registros. Cada módulo habilita somente as operações que lhe pertencem. A cena e os dados podem permanecer consultáveis em modo somente leitura; fontes, atuadores, instrumentos e operações de cálculo não devem executar ações fora do módulo autorizado.

As regras de suspensão dos motores transitórios, preservação de uma experiência ativa e autorização no domínio são definidas no [Contrato operacional do Explorar](CONTRATO-OPERACIONAL-EXPLORAR.md), que prevalece sobre este recorte histórico.

## 9. Limite deste documento

As referências de série e o recorte de funcionalidades desta página descrevem a evolução visual iniciada em 0.8.x. Não devem ser usados como roadmap atual de Medir, Calcular ou dos motores científicos. Para requisitos operacionais vigentes, prevalecem os contratos específicos de cada módulo.
