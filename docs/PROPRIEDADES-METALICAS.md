# Propriedades metálicas no SILM

> Série 0.7.x. Implementação: `domain/silm/properties.js` (catálogo, elegibilidade, dados, transformações e narrativas), `domain/silm/state.js` (contrato `properties`), `domain/silm/property-view.js` (sobreposição e controles), `crystal-view.js`, `assembly-view.js` e `electron-view.js` (representação) e `bootstrap.js` (painéis, Histórico e relatório).

## 1. Modelo adotado

Toda experiência segue:

```text
estrutura → comportamento → propriedade observada
```

- O estudante **age** sobre a estrutura (aplica campo, aquece, comprime, alonga, ilumina), **observa** a resposta e **interpreta**. Ver → Observar → Propriedades mostra três blocos curtos: *O que você alterou*, *O que aconteceu* e *Como interpretar*.
- A experiência atua sobre a **mesma investigação** e **não altera a estrutura científica**. Unidades, sítios, cristalografia e modelo eletrônico ficam intactos; deformação, aquecimento, campo e luz são estado da experiência aplicado à representação. Restaurar volta ao estado-base sem resetar a investigação nem trocar o metal.
- Há **uma experiência ativa por vez**. Trocar ou encerrar devolve as demais ao estado-base, sem resíduo.
- **Classificação** de toda informação: *Dado tabelado* (com fonte e condição), *Calculado pelo SILM* (ex.: σ = 1/ρ) ou *Representação qualitativa* (todas as experiências).
- Nenhuma propriedade é explicada **somente** pelo "mar de elétrons": a condução térmica envolve rede e elétrons, e a deformação envolve deslizamento de camadas mantido pela coesão coletiva.

## 2. Condutividade elétrica

| | |
|---|---|
| Requisito | estrutura com 2 ou mais unidades (montagem livre ou cristalina); ativa e mostra o modelo eletrônico, se necessário |
| Ação | **Aplicar campo elétrico** / **Remover campo** ("Aplicar campo elétrico" porque não há circuito, §29) |
| Sem campo | movimento eletrônico sem direção macroscópica preferencial (o mesmo da 0.6.x) |
| Com campo | ao passeio aleatório soma-se um viés coletivo **no sentido oposto ao do campo** (portadores negativos). Os marcadores que saem a jusante reentram a montante, num fluxo contínuo pela estrutura. Nem todos andam em linha reta: o teste 0.7-141 exige que uma parte se mova contra o viés a cada instante |
| Indicação | seta **E** na borda superior e seta tracejada "elétrons (média)" na borda inferior, fora da estrutura. Sem diagrama de circuito e sem setas por elétron |
| Movimento reduzido | representação estática; as duas setas e o texto mantêm a informação |
| Intensidade | **não** é proporcional à condutividade tabelada (§37); a mesma regra vale para todos os metais |

## 3. Condutividade térmica

| | |
|---|---|
| Requisito | estrutura cristalina organizada |
| Ação | **Aquecer região** (lado esquerdo, faixa hachurada "calor") / **Desligar fonte de calor**; **Avançar propagação** |
| Representação | cada centro recebe um nível de energia de 0 a 4, propagado por vizinhança a partir da região aquecida, em etapas discretas e determinísticas (até 4). O nível aparece em **anéis**: a quantidade de anéis indica o nível, não só a cor. Com movimento permitido, há também uma vibração cuja amplitude cresce com o nível |
| Movimento | a etapa avança sozinha a cada 0,9 s; com movimento reduzido, pelo botão Avançar propagação. A aba oculta pausa o avanço |
| Interpretação | a energia térmica é transferida pela vibração da rede **e** pelos elétrons deslocalizados. A velocidade dos elétrons não é usada como termômetro (§52) |
| Limites | valores limitados (sem fusão nem mudança de fase, mesmo com repetição); sem calor específico, sem equação de difusão completa, sem expansão térmica |

## 4. Maleabilidade

| | |
|---|---|
| Requisito | estrutura cristalina organizada |
| Ação | **Aplicar compressão** (3 etapas) |
| Representação | compressão vertical: a estrutura se achata, as camadas deslizam umas sobre as outras (cisalhamento) e a forma se espalha. É a **lâmina**, larga e baixa. Setas de compressão (para dentro) com rótulo. Os elétrons acompanham os centros deformados |
| Conceito | a ligação metálica não depende de pares direcionais rígidos entre átomos específicos |
| Não afirma | que todo metal pode ser achatado indefinidamente. A etapa 3 é o limite **didático**, e o texto diz que a deformação possível varia entre metais |

## 5. Ductilidade

| | |
|---|---|
| Requisito | estrutura cristalina organizada |
| Ação | **Alongar** (3 etapas) |
| Representação | tração ao longo do eixo vertical: a estrutura se alonga, se estreita e se reorganiza por deslizamento. É o **fio**, alto e fino. Setas de tração (para fora) com rótulo. A forma é oposta à da lâmina: o teste 0.7-151 compara as razões altura/largura |
| Não é | "puxar uma fileira de átomos" nem um fio real com número arbitrário de átomos |

## 6. Brilho metálico

| | |
|---|---|
| Requisito | estrutura cristalina organizada |
| Ação | **Incidir luz** / **Apagar luz** |
| Representação | feixe incidente (hachurado) e feixe refletido sobre a face superior da estrutura; as unidades da superfície recebem realce e contorno |
| Interpretação | os elétrons deslocalizados próximos da superfície respondem à luz e a reemitem, o que produz alta reflexão (modelo qualitativo) |
| Limites | não é espelho perfeito nem espectro; a **cor própria** de cada metal (ouro, cobre) não é representada, por falta de dados ópticos homologados (§75–76) |

## 7. Estrutura cristalina e montagem livre

- CCC, CFC e HC usam as **mesmas regras**: o SILM não afirma "CFC conduz mais" nem diferenças semelhantes sem modelo ou dados (§81).
- A experiência nunca troca a estrutura de referência (§83). O teste 0.7-144 confere a estrutura inalterada nas cinco experiências.
- Na **montagem livre**, só a condutividade elétrica fica disponível, para observação básica. As demais exigem a geometria cristalina (§84–85).
- Voltar à montagem livre encerra uma experiência de rede ativa. Se Desfazer remover o modelo eletrônico, a experiência elétrica também é encerrada.

## 8. Dados

Ver [`CONTRATO-PROPRIEDADES.md`](CONTRATO-PROPRIEDADES.md) e [`FONTES-E-PROVENIENCIA.md`](FONTES-E-PROVENIENCIA.md).

- Nesta versão o banco **não** traz valores homologados de condutividade elétrica, resistividade ou condutividade térmica. O SILM informa "Não homologado no banco do SILM para este metal; nenhum valor típico é usado" (`PROPERTY_DATA_MISSING`) e não preenche a lacuna (§87).
- O contrato já aceita os dados quando forem homologados: valor, unidade, condições e fonte (e, se houver, pureza e anisotropia). Resistividade gera σ = 1/ρ classificado como *Calculado pelo SILM*.
- Mostrar um valor do banco **não** é medição (§129): instrumentos são da série 0.9.x.

## 9. Elegibilidade por propriedade

`SILM.properties.eligibility(elemento)` retorna, para cada propriedade, `available` (experiência e dado tabelado), `qualitative` (só experiência) ou `unavailable` (com motivo):

| Motivo | Quando |
|---|---|
| `MODEL_NOT_APPLICABLE` | experiência de rede em metal cuja estrutura de referência não tem visualização cristalina no SILM (ex.: Mn, Sn) |
| `REFERENCE_PHASE_UNSUPPORTED` | sem fase sólida de referência registrada (Hg) |
| `LIQUID_AT_REFERENCE_CONDITION` | dado de fase homologado indica líquido na condição de referência (regra pronta; nenhum metal do banco tem esse dado nesta versão) |
| `METAL_NOT_INVESTIGABLE` | metal não habilitado para investigação |
| `PROPERTY_DATA_MISSING` | (para o dado numérico) valor não homologado |
| `INSUFFICIENT_VALIDATION` | (nota nas mecânicas) o comportamento mecânico real do metal não está homologado; a experiência mostra o mecanismo didático |

**Mercúrio:** continua classificado como metal. A limitação pertence à propriedade, à fase e à condição (§15). Sem fase sólida de referência homologada, deformação de sólido, condução pela rede e superfície sólida ficam indisponíveis. A cobertura por metal está em [`COBERTURA-METAIS.md`](COBERTURA-METAIS.md).

## 10. Limitações declaradas (§183–187)

- O movimento visual dos elétrons sob campo é uma representação qualitativa e não corresponde diretamente à velocidade real dos portadores de carga.
- A transferência térmica apresentada é qualitativa e não constitui solução quantitativa da equação de transporte de calor.
- A deformação é uma representação didática e não reproduz uma curva tensão-deformação real do material (maleabilidade e ductilidade).
- A reflexão de luz é uma representação qualitativa do comportamento óptico metálico e não um cálculo espectroscópico completo.

Fora desta série: resistividade em função da temperatura, Lei de Ohm, bandas, nível de Fermi, magnetismo, dureza, tenacidade, corrosão, oxidação, módulo de Young, tensão de escoamento, ensaios quantitativos e ligas.
