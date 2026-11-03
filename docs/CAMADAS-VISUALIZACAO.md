# Camadas de visualização — Etapa 7 do Explorar

> **Status:** especificação de representação, interação e persistência.  
> **Escopo:** camadas da montagem livre e da estrutura cristalina no módulo Explorar, incluindo efeitos de propriedades e elementos auxiliares.  
> **Implementação:** esta etapa audita o sistema existente e define o contrato-alvo; não altera código, schema ou interface.

## 1. Objetivo

Definir o que cada camada comunica, quais elementos podem ser ocultados e quais estados devem permanecer independentes da visualização.

O SILM deve permitir observar a mesma amostra sob diferentes representações sem modificar suas coordenadas, estrutura, modelo científico, propriedades investigadas, medições ou cálculos.

**Princípio fundamental:** visibilidade é uma escolha de apresentação. Ela não liga ou desliga um fenômeno físico, não cria nem remove dados e não altera a amostra.

Esta etapa não cria um novo módulo. As camadas são recursos de apresentação dentro de Explorar. A navegação científica continua sendo exatamente Explorar, Medir e Calcular.

## 2. Vocabulário e categorias

| Categoria | O que representa | Exemplos |
|---|---|---|
| Estrutura científica representada | Geometria derivada da amostra e do modelo cristalográfico | Centros metálicos, célula unitária, rede extensa, vizinhos |
| Modelo representado | Visualização de um modelo científico ativo | Distribuição qualitativa de elétrons |
| Resposta da experiência | Sinais visuais do fenômeno ou da ação aplicada | Região aquecida, campo, luz incidente/refletida, atuador e deformação representada |
| Anotação e orientação | Informação explicativa que ajuda a ler a cena | Rótulos, legenda, eixos de referência, indicação de seleção |
| Interação e navegação | Controles usados para operar ou percorrer a representação | Câmera, zoom, pan, órbita, alças de fonte e seleção |
| Sobreposição de módulo | Elementos específicos de uma operação de outro módulo | Pontos de medição e marcas de cálculo |

As categorias não são necessariamente camadas SVG independentes. Uma representação pode ser desenhada no próprio elemento estrutural, enquanto outra usa uma sobreposição. A classificação deve considerar a função e a semântica, não apenas o elemento DOM ou o nome técnico da camada.

### 2.1 Três tipos de ação que não devem ser confundidos

- **Mudar a vista:** alternar entre célula unitária e rede extensa, trocar projeção, girar, aproximar ou deslocar a câmera.
- **Mudar a visibilidade:** exibir/ocultar uma informação representada sem alterar seu estado de domínio.
- **Aplicar um estímulo:** iniciar ou modificar uma experiência, por exemplo ligar calor, campo elétrico ou compressão.

O painel de aplicação de propriedades definido na Etapa 6 pertence ao terceiro tipo. Os controles de camadas pertencem ao segundo. A câmera pertence ao primeiro.

Não misturar os controles de aplicação de propriedades com os controles de visibilidade. Ocultar o desenho de um campo não deve desligar o campo; ocultar uma indicação térmica não pode desligar a fonte de calor.

## 3. Auditoria da implementação atual

### 3.1 Renderizador comum

`domain/silm/renderer-2d.js` mantém uma ordem central de camadas: `background`, `lattice`, `unitCell`, `neighbors`, `electrons`, `properties`, `structure`, `measurementOverlay`, `calculationOverlay`, `labels` e `selection`.

A função `layer(name, element, {camera})` registra a posição de desenho e se o elemento acompanha a transformação da câmera. **Ela organiza a composição, mas não define, por si só, se a camada é visível nem se pode ser ocultada.**

O renderizador também mantém camadas de seleção e rótulos que acompanham a câmera sem fazer parte das coordenadas científicas. A documentação do código declara que zoom, deslocamento e projeção não entram nas medições nem nos cálculos.

### 3.2 Montagem livre e estrutura cristalina

A montagem livre registra, entre outras, a representação da amostra, o modelo eletrônico e a sobreposição de propriedades. A estrutura cristalina acrescenta rede, célula unitária, vizinhos, rótulos, eixos e sobreposições próprias de Medir e Calcular.

As duas cenas compartilham o renderizador e a camada eletrônica, mas não possuem exatamente a mesma composição. A lista de opções disponível deve ser derivada do modo de estrutura e da experiência atual; não se deve apresentar uma opção que não tenha conteúdo naquela cena.

### 3.3 Controles já existentes no painel de camadas

Os testes `tests/suites/s080-explorar.cjs`, especialmente os casos de camadas, persistência e acessibilidade, confirmam estes comportamentos:

| Controle atual | Efeito observado | Interpretação correta |
|---|---|---|
| Centros | Altera o destaque visual dos centros (`data-centers=dim`) | Intensidade visual; os centros continuam sendo a amostra e não devem desaparecer por completo. |
| Célula unitária | Exibe/oculta o contorno e os planos da célula | Camada geométrica de referência, sem mudar a estrutura. |
| Rede | Alterna entre vista da célula e rede extensa | Modo de representação exclusivo, não um simples interruptor de visibilidade. |
| Vizinhos | Destaca vizinhos imediatos; quando necessário, seleciona uma unidade | Informação relacional dependente de uma unidade selecionada. |
| Elétrons | Mostra/oculta os marcadores do modelo eletrônico | Visibilidade da representação; ocultar não desativa o modelo. |
| Rótulos | Mostra/oculta rótulos das posições | Anotação da geometria. |
| Indicações da propriedade | Oculta/exibe a sobreposição `.silm-property-overlay` | Camada auxiliar; não altera parâmetros nem encerra a experiência. |

O teste existente verifica, por exemplo, que ocultar as indicações da propriedade não altera o nível de compressão. Também verifica o estado das camadas após recarregar e a exposição acessível da informação de visibilidade.

**Limite do comportamento atual:** os controles não estão todos semanticamente isolados. Algumas preferências estão no estado de visualização da exploração; outras permanecem em objetos de representação aninhados no estado científico por herança do schema 8. A seção 8 descreve essa dívida de organização.

## 4. Catálogo de camadas do Explorar

A tabela define o comportamento-alvo para cada grupo. "Ocultável" significa que a pessoa pode mudar sua apresentação sem alterar o estado científico.

| Camada ou grupo | Conteúdo | Visibilidade | Regra |
|---|---|---|---|
| Fundo | Superfície de fundo e enquadramento da cena | Não como camada de investigação | Deve permanecer para preservar contraste e orientação espacial. |
| Centros metálicos | Unidades que compõem a amostra | Destaque ajustável; não ocultar todos | A amostra deve continuar identificável. Reduzir destaque não significa remover unidades. |
| Estrutura | Geometria e representação dos centros | Obrigatória | A camada-base não pode ser desligada se isso apagar a amostra. |
| Célula unitária | Arestas e planos de referência cristalográfica | Ocultável | Ocultar a célula não altera a rede nem os parâmetros cristalográficos. |
| Rede extensa | Sítios que mostram a repetição periódica além da célula | Modo alternativo | Alterna com a vista de célula; não deve ser tratada como checkbox independente da célula. |
| Vizinhos | Destaque de vizinhos imediatos de uma unidade | Ocultável | Requer unidade selecionada; a relação vem da geometria do banco, não de linhas de ligação química. |
| Elétrons | Marcadores qualitativos de elétrons de valência deslocalizados | Ocultável | Ocultar não apaga o modelo, suas fontes conceituais nem a configuração da investigação. |
| Movimento eletrônico | Animação dos marcadores | Configuração visual separada | Movimento reduzido ou animação pausada não muda o modelo nem cria uma medida de velocidade. |
| Rótulos | Símbolos, identificadores e posições | Ocultável | A informação essencial deve continuar acessível por texto e descrição sem depender do rótulo desenhado. |
| Resposta da propriedade | Indicações visuais de campo, calor, luz, força e estado da experiência | Ocultável quando forem apenas sobreposições | A experiência, a fonte e os parâmetros continuam ativos mesmo que a indicação seja escondida. |
| Legendas e instruções | Explicações curtas e limites da representação | Recolhíveis ou ocultáveis quando redundantes | As limitações essenciais permanecem acessíveis no painel contextual e na descrição textual. |
| Seleção e foco | Anel de seleção e indicação do item ativo | Não como camada comum | Mantém a referência de interação e o contexto de foco. Não deve ser escondida enquanto for necessária para operar a cena. |
| Câmera e eixos | Zoom, pan, órbita e eixos de orientação | Controles recolhíveis; referências conforme vista | Alteram apenas a apresentação. Os eixos 3D não são rede cristalina nem escala de medida. |

### 4.1 Rede e célula são modos de vista

A vista da célula unitária e a vista da rede extensa são alternativas de enquadramento e composição. O rótulo de ação deve indicar o destino ("Mostrar rede" / "Mostrar só a célula") e o estado atual deve ser anunciado.

A célula unitária pode ser mostrada ou ocultada como referência em uma vista aplicável. Isso não equivale a trocar o modo célula/rede.

### 4.2 Modelo eletrônico: ativação, visibilidade e movimento

Três condições devem permanecer diferentes:

1. **Modelo ativo:** existe a definição do modelo eletrônico, com origem conceitual e configuração válidas.
2. **Marcadores visíveis:** a camada está desenhada.
3. **Movimento visual ativo:** os marcadores estão animados, quando permitido pelas preferências de movimento.

Ocultar marcadores não desativa o modelo eletrônico. Pausar a animação não equivale a retirar o campo elétrico e não modifica uma grandeza física. Preferência de movimento reduzido deve conservar a informação em uma representação estática.

Quando o modelo ainda não existe, a ação "Mostrar elétrons" pode iniciar o modelo, desde que as pré-condições sejam atendidas. Nesse caso, a ativação do modelo é uma operação de domínio separada da simples alternância de visibilidade e precisa ser identificada como tal.

### 4.3 Resposta da propriedade e fontes

A sobreposição visual da experiência deve poder ser ocultada sem alterar a propriedade principal ou o estímulo auxiliar. Exemplos:

- esconder a seta de campo não desliga o campo elétrico;
- esconder os sinais da fonte térmica não desliga o aquecimento;
- esconder o desenho da lanterna não encerra a experiência de reflexão;
- esconder a indicação do atuador não restaura a amostra.

O estado da experiência deve continuar legível por controles de domínio e informação textual. A camada visual não é a fonte de verdade do fenômeno.

Se uma representação for necessária para interpretar uma saída ou evitar uma ação ambígua, ela não poderá ser removida sem uma alternativa acessível equivalente.

### 4.4 Elementos que não pertencem ao painel de camadas

Não transformar em interruptores genéricos:

- alças de arrastar fontes ou atuadores;
- botões e controles de câmera;
- foco de teclado e contorno de foco;
- seleção necessária para identificar a unidade ativa;
- controles de zoom, pan e órbita;
- sobreposições de medição e cálculo que pertencem aos módulos Medir e Calcular.

A lista central do renderizador comporta camadas de medição e cálculo porque o renderizador é compartilhado. Isso não autoriza apresentá-las no painel de Explorar nem operar instrumentos fora de Medir.

## 5. Contrato de visibilidade

Toda camada ocultável deve cumprir as regras seguintes:

1. Alterar visibilidade não modifica coordenadas, composição, estrutura cristalográfica ou identidade da amostra.
2. Alterar visibilidade não inicia, restaura ou encerra uma experiência.
3. Alterar visibilidade não liga nem desliga fontes ou atuadores.
4. Alterar visibilidade não modifica parâmetros de propriedades nem os resultados de medições e cálculos.
5. Alterar visibilidade não deve entrar no Desfazer como se fosse uma alteração da amostra.
6. Ocultar uma camada remove apenas o desenho correspondente; não remove o dado ou o modelo que a originou.
7. Ao mostrar novamente, a camada deve refletir o estado atual do modelo, sem reconstruir uma experiência diferente.
8. A ordem de composição deve permanecer estável: ocultar uma camada não pode alterar a prioridade de interação ou fazer outro objeto receber indevidamente o clique.
9. A indisponibilidade contextual deve ser comunicada. Uma camada sem conteúdo na montagem livre, por exemplo, não deve aparecer como controle funcional.
10. A interface não pode usar a mesma ação para ocultar um efeito e desligar a fonte que o produz.

### 5.1 Dinâmica e desempenho

É necessário separar animação puramente visual de evolução do modelo:

- a animação dos marcadores eletrônicos pode ser pausada ou suspensa quando a camada estiver oculta, pois suas trajetórias são visuais e não constituem estado científico;
- uma fonte ou um motor físico ativo não deve ser desligado pelo simples fato de sua camada ter sido ocultada;
- a atualização do estado físico continua sob as regras do motor e do ciclo de vida da experiência;
- ao reaparecer, a representação deve consultar o estado atual, e não reproduzir uma sequência visual antiga como se fosse observação física.

Uma otimização futura poderá reduzir trabalho de desenho, mas não poderá mudar o resultado do modelo nem introduzir dependência do estado científico em relação à visibilidade.

## 6. Painel de camadas e organização da interface

O painel existente de camadas deve ser preservado como controle de apresentação, com rótulos mais precisos e agrupamento coerente. Ele não substitui o painel único de aplicação de propriedades especificado na Etapa 6.

A separação de responsabilidades será:

- **Painel de aplicação de propriedades:** escolhe a experiência principal e aplica apenas estímulos auxiliares homologados.
- **Painel de camadas:** controla a visibilidade e o destaque das representações disponíveis.
- **Controles da vista:** câmera, projeção, zoom, pan e órbita.

Esses grupos podem ocupar regiões contextuais da interface já existente. Não criam novos módulos, submódulos ou rotas de navegação.

### 6.1 Organização recomendada

O painel de camadas deverá agrupar opções por função, nesta ordem:

1. **Estrutura:** centros, célula unitária, rede e vizinhos.
2. **Modelos:** elétrons e movimento eletrônico.
3. **Indicações:** resposta da propriedade, rótulos e legendas.

A lista deve ser contextual: na montagem livre não se oferece rede extensa, célula unitária ou vizinhos cristalográficos. Na estrutura cristalina, as opções de célula/rede e vizinhos só aparecem quando forem aplicáveis.

O painel deve permanecer curto, com rótulos objetivos, ícones discretos e descrições breves. Opções avançadas podem ser recolhidas; o estado essencial não deve depender de cor ou animação.

### 6.2 Interação e acessibilidade

- Usar controles com estado explícito (`aria-pressed` ou semântica equivalente).
- Anunciar a mudança de estado de maneira breve, por exemplo: "Rótulos ocultos" ou "Vista da rede extensa".
- Expor um resumo textual de quais camadas estão visíveis.
- Manter foco visível, navegação por teclado e operação por toque.
- Se um controle focado for ocultado por uma mudança de contexto, mover o foco para uma posição previsível.
- A descrição acessível da cena deve continuar identificando a amostra e a estrutura mesmo com rótulos visuais ocultos.
- As legendas e descrições não devem duplicar textos extensos ou competir com a área principal.
- Preferência de movimento reduzido deve manter a mesma informação em modo estático.
- O estado de seleção deve ser expresso sem depender apenas de contorno ou cor.

## 7. Persistência e escopo das preferências

Preferências de representação devem ser separadas do estado científico. Elas podem ser persistidas para melhorar a continuidade da interface, mas não devem integrar registros de propriedades físicas, medições ou cálculos.

### 7.1 Auditoria da distribuição atual

A implementação consultada mantém partes do estado de visualização em locais distintos:

| Local atual | Conteúdo |
|---|---|
| `exploration.view` | Foco, comparação, destaque dos centros e visibilidade das indicações da propriedade. |
| `representation.view` | Projeção, câmera 2D/3D, zoom, deslocamento e órbita, ligado à investigação e com versão própria. |
| `scientificState.structure.crystallography.representation` | Vista célula/rede, célula unitária, vizinhos, rótulos e unidade selecionada, herdados do schema 8. |
| `scientificState.electrons.representation` | Visibilidade e movimento dos marcadores eletrônicos, junto ao modelo eletrônico. |

Os comentários de domínio classificam a vista, as camadas, a seleção e a visibilidade/movimento dos elétrons como representação, sem alteração da estrutura física nem dos parâmetros da experiência. Entretanto, parte dessa configuração continua aninhada no objeto persistido como `scientificState`.

### 7.2 Contrato-alvo

A arquitetura futura deve consolidar preferências de apresentação em um estado de representação próprio, versionado e ligado à investigação. Esse estado deve conter, por responsabilidade:

- modo de vista (célula ou rede);
- visibilidade e destaque das camadas;
- foco e unidade selecionada para inspeção;
- estado de exibição e animação dos marcadores eletrônicos;
- projeção, câmera e enquadramento;
- comparação visual;
- preferências auxiliares de anotação.

O estado científico permanece responsável por metal, amostra, geometria, estrutura de referência, existência e proveniência dos modelos, condições e parâmetros das experiências, medições e cálculos.

A divisão semântica deve ser preservada mesmo antes de uma migração de schema. A consolidação não autoriza remover campos antigos sem migração versionada e testes de abertura de investigações existentes.

### 7.3 Migração

Uma migração futura deverá:

1. ler os campos antigos e a preferência já separada em `exploration.view` e `representation.view`;
2. compor o estado de apresentação canônico sem perder as preferências válidas;
3. validar identificador da investigação, tipos, enums e valores booleanos;
4. descartar apenas valores inválidos ou incompatíveis, voltando a padrões seguros;
5. manter a origem conceitual e a ativação dos modelos científicos;
6. garantir que registros antigos, medições e cálculos abram sem alteração;
7. não reescrever o histórico de uma experiência como efeito colateral da migração.

Nenhuma mudança de schema ou persistência foi realizada nesta etapa.

## 8. Integração com comparação, Medir e Calcular

A comparação qualitativa deve continuar sendo derivada de uma cópia do estado e somente leitura. Suas cenas não podem criar IDs duplicados, controles interativos adicionais ou novos motores de animação.

As camadas de medição e cálculo permanecem vinculadas aos seus módulos. Ocultar uma camada de apresentação não pode remover registros ou alterar a geometria científica usada por um instrumento ou fórmula.

A câmera transforma apenas a representação no palco. Coordenadas, distâncias, parâmetros de rede e demais entradas científicas são derivados das coordenadas e dados do domínio, nunca de pixels.

## 9. Testes exigidos

A implementação futura deverá testar:

- alternância de cada camada visível/oculta sem alteração de coordenadas ou propriedades;
- ocultação das indicações sem desligar fontes ou atuadores;
- ocultação dos elétrons sem desativar o modelo ou apagar sua proveniência;
- pausa do movimento visual sem alterar a configuração científica do modelo;
- reexibição de uma camada refletindo o estado atual;
- alternância célula/rede sem alterar distâncias, parâmetros ou unidades;
- vizinhos exigindo seleção válida e sem criar ligações químicas;
- camadas indisponíveis não apresentadas como controles funcionais;
- câmera e projeção sem alteração de medições e cálculos;
- persistência e sanitização de preferências válidas/inválidas;
- migração dos estados antigos sem perda de investigação;
- comparação somente leitura sem IDs duplicados ou animações extras;
- foco, teclado, leitor de tela, toque e movimento reduzido;
- ausência de informação codificada exclusivamente por cor ou movimento.

### 9.1 Testes de invariância científica

Para comprovar que a visualização não altera o fenômeno, comparar a projeção científica do estado antes e depois da alternância, excluindo apenas os campos de representação que ainda estão aninhados no schema 8.

Devem permanecer idênticos:
- metal e investigação;
- coordenadas e identidade das unidades;
- tipo, proveniência e parâmetros da estrutura cristalina;
- parâmetros da experiência principal e dos estímulos auxiliares;
- resultados e registros de medições e cálculos.

O teste não deve simplesmente comparar o JSON completo, porque o estado atual ainda inclui preferências de representação em objetos aninhados. Também não deve ignorar qualquer campo sem justificativa: a lista de exclusões precisa ser explícita e limitada a representação.

## 10. Critérios de aceitação da Etapa 7

- [ ] Cada camada possui função e semântica documentadas.
- [ ] Modo de vista, visibilidade, ativação de modelo e aplicação de estímulo são ações distintas.
- [ ] A camada-base da amostra não pode ser removida de forma que a cena perca sua identificação.
- [ ] Centros podem ter destaque reduzido sem desaparecer como amostra.
- [ ] Célula e rede são modos de vista; célula unitária, rótulos e vizinhos são opções de apresentação separadas.
- [ ] Ocultar elétrons não desativa o modelo eletrônico.
- [ ] Ocultar indicações não altera fontes, atuadores ou parâmetros da experiência.
- [ ] Câmera e controles de interação não são misturados às camadas científicas.
- [ ] Medir e Calcular mantêm suas sobreposições e controles restritos aos módulos correspondentes.
- [ ] O painel de camadas permanece separado semanticamente do painel de aplicação de propriedades.
- [ ] Preferências de representação têm origem canônica e não são confundidas com dados experimentais.
- [ ] A migração do schema antigo tem plano próprio e preserva investigações existentes.
- [ ] Testes de invariância, acessibilidade, persistência e comparação estão definidos.

## 11. Referências internas auditadas

- `domain/silm/renderer-2d.js` — ordem de composição, câmera e camadas comuns.
- `domain/silm/crystal-view.js` — camadas da estrutura cristalina, sobreposições e eixos.
- `domain/silm/assembly-view.js` — camadas da montagem livre.
- `domain/silm/representation.js` — preferências de câmera e projeção separadas do estado científico.
- `domain/silm/exploration.js` — foco, camadas auxiliares e comparação.
- `domain/silm/state.js` e `domain/silm/bootstrap.js` — estado de representação herdado do schema 8, operações de visibilidade e seus limites.
- `tests/suites/s080-explorar.cjs` — alternância de camadas, persistência e acessibilidade.

## 12. Limites desta entrega

A Etapa 7 conclui a especificação das camadas, de seu significado e de sua separação em relação ao estado científico. Não houve alteração de código, migração de schema, redesenho do painel, execução de testes ou publicação na branch `main`.

A Etapa 8 — [Motor científico](MOTOR-CIENTIFICO.md) — está especificada. A próxima etapa do aprofundamento é a **Etapa 9 — Registro de experiências**: definir como guardar uma execução reproduzível sem registrar cada quadro de animação.
