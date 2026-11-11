# SILM — Parte 9 · Estudo da mecânica do **Explorar** a partir do SIAB

**Estado:** diagnóstico e proposta operacional para discussão. **Não é implantação de funcionalidades nem homologação.**  
**Referências verificadas:** SIAB `qui-x/acidobase`, branch `acidosebases1.0.0` e SILM `qui-x/ligacoesmetalicas`, `main`, em 10/11/2026.  
**Escopo:** apenas a organização de `Ver → Explorar`; não mover a Travessia (escalas), o seletor científico ou os demais módulos, e não editar as fórmulas.

## 1. O que efetivamente torna o SIAB interativo

### 1.1 Separação entre representação e manipulação
- `js/ui/ver-investigacao.js`: `VER_SECTIONS` define representações e ferramentas concretas. **Observar** contém *Partículas, Espécies, Equações e Transferência de próton*; **Medir** contém pH/temperatura/condutividade; **Analisar** contém gráfico, derivada, distribuição, histórico e tabela. A filtragem usa `SIAB.verDisponivel` e as permissões de `ActivityContext`.
- `js/telas/bancada.js`: a manipulação física/didática ocorre na bancada: adicionar gotas, agitar, selecionar recipiente, alterar preparo; o mecanismo de alterações e desfazer não pertence às abas do Ver. Uma ação na bancada modifica o estado e todos os painéis usam o mesmo resultado científico.
- `js/ui/lupa.js`: a observação microscópica usa espécies derivadas da **mesma solução química**, com opção linear/logarítmica, seleção de espécie e animações de difusão, transferência de próton e reação quando aplicáveis; não substitui a química por uma animação independente. Ações de destaque não adulteram a concentração. Respeita a redução de movimento.
- `js/ui/equacao.js`: a representação simbólica deriva do mesmo estado e permite destacar a espécie já reconhecida na lupa.
- `js/ui/ver-investigacao.js` e `js/telas/bancada.js`: tocar em um componente da equação, tabela ou legenda atualiza `state.destaque`; essa identificação transita entre representações. A escolha `verLastTabs` é lembrada por família, assim como foco e seleção.
- `js/simulation/instrumentos.js`: medir é **executar um procedimento**, registrar leitura, técnica, resolução, contexto e validade, não apenas mostrar um número em tempo real.

**Síntese:** o SIAB articula **gesto experimental → estado científico único → representações coerentes → leitura/registro**. A atratividade não resulta do número de abas, mas de uma ação repercutir nas escalas sem criar um segundo modelo.

### 1.2 O que NÃO copiar literalmente
- `Observar / Medir / Analisar` no SIAB são famílias do menu `Investigar`; não são os módulos científicos do SILM. A correspondência é **de comportamento**, não de nomenclatura.
- A animação de transferência de próton pertence às reações ácido-base; não é adequado simulá-la como vínculo eletrônico localizado entre dois metais. Os elétrons deslocalizados exigem representação coletiva.
- Os eventos do SIAB não legitimam inventar trajetórias reais de átomos, percentuais de fases metalográficas ou resultados de laboratório quando o SILM dispõe apenas de representação didática.

## 2. Inventário verificado do Explorar no SILM

| Componente | Já disponível | Limite atual |
|---|---|---|
| Travessia Objeto → Grãos → Rede → Centro, lupa com avanço por duplo clique/Ctrl+clique | Sim (`workshop.js`, `lens-controller.js`, `adapter.js`) | Transporta foco **relativo**, não identidade científica contínua de grão para sítio |
| Seleção de centro na rede, vizinhos, célula/rede | Sim (`crystal-view.js`, `workspace-family.js`) | É preciso partir de estrutura elegível; não há medição física apenas por destacar |
| Mostrar/ocultar mar de elétrons com movimento | Sim, ação compartilhada (`quickActions.toggleElectrons`) | Modelo coletivo qualitativo; não tem seleção de elétron como partícula individual |
| Campo elétrico, fonte de calor, compressão, tração e luz | Sim, por condições e elegibilidade (`crystal-view.js`, `workspace-family.js`) | Intensidades, disponibilidade e respostas dependem do motor existente e do metal |
| Efeito Joule, alimentação, passos de ensaio e leituras da resposta | Sim onde homologado (`crystal-view.js`) | Não sugerir que funciona para qualquer metal/configuração |
| Seleção conjunta de propriedades por Ctrl+clique / comando touch | Sim; conjunto e elegibilidade vêm do estado científico | Somente pares homologados; não ativar combinações arbitrárias |
| `Observar` | Ativo: lista de botões concretos para centros, rede, elétrons e propriedades | Agrupa tarefas diferentes sob um nome genérico e acumula comandos |
| `Camadas` | Ativo: reduz destaques, rótulos, legendas e sobreposições sem alterar ciência | É uma **preferência de apresentação**, não uma família de investigação |
| `Comparar` | Quatro cartões informativos de montagem, célula/rede, elétrons e propriedade | O próprio código diz que as cenas A/B **não** estão conectadas. Não existe comparação dinâmica real de duas cenas |

**Diagnóstico:** a divisão atual `Observar / Camadas / Comparar` separa sobretudo modos de apresentação; não representa o ciclo experimental. Isso cria três camadas de escolha para alcançar o mesmo gesto e faz `Comparar` parecer mais potente do que é.

## 3. Proposta de arquitetura do Ver

A hierarquia científica atual permanece `Ver → [Explorar | Medir | Calcular]`. Para **Explorar**, substituir as antigas famílias pela tríade temática:

1. **Estrutura** — *o que constitui o metal e como os centros se organizam?*
2. **Elétrons** — *como representamos os elétrons de valência deslocalizados?*
3. **Propriedades** — *o que acontece quando aplicamos uma condição externa?*

Esses nomes são concretos como `Partículas / Espécies / Equações` no SIAB; não são novos estados científicos. O estudante não precisa escolher uma aba extra `Observar` para finalmente acessar `Estrutura`.

### 3.1 Estrutura: o fenômeno é o foco, não a caixa de camadas
- Ferramentas de cena: `Identificar centros`, `Mostrar vizinhos`, `Mostrar/ocultar célula`, `Alternar célula e rede`. Os comandos são os já existentes. O clique no centro aciona `setCrystalRepresentation({selectedUnitId})` / navegação por vizinho, nunca uma seleção falsa apenas em CSS.
- A Travessia e a lente continuam acima e sobre a cena (escala Objeto/Grãos/Rede/Centro); **não duplicar** botões de escala no Ver.
- Um bloco discreto `Exibição` (recolhível) concentra `rótulos`, `legenda`, `destaque de centros` e `sobreposição da propriedade`, usando o estado persistido que hoje está em Camadas. O modo de apresentação não deve mudar a montagem.
- Ao selecionar um centro, destacar coerentemente seu papel e os vizinhos, inclusive em tela e leitores de tela. Respeitar o que a geometria realmente determina.

### 3.2 Elétrons: um único gesto científico e uma única apresentação
- Ferramenta primária: `Mar de elétrons`, ligando/desligando **aparição e movimento juntos**, como decidido na Oficina.
- Mensagem didática contextual curta: elétrons de valência deslocalizados; **não** representar pares de ligações localizadas nem interpretar a animação como rastreamento real de elétrons.
- Futura ação de destaque: `Mostrar resposta eletrônica à condição aplicada`, **somente após** ser vinculada ao motor de propriedades e seus estados reais; nunca alterar fisicamente o modelo ao mudar apenas o modo de visualização.
- O mesmo estado visual (ativo/desligado) aparece na paleta de ações e em Ver, sem comandos paralelos divergentes.

### 3.3 Propriedades: estímulo → resposta → contexto, no próprio palco
Apresentar ferramentas por **fenômeno**, não por opções de CSS:

| Ferramenta | Estímulo ou gesto que já existe | Evidência visual/contextual | Requisito |
|---|---|---|---|
| Elétrica | Ativar campo elétrico | resposta didática e estado de campo no modelo | elegibilidade elétrica |
| Térmica | Ligar fonte de calor | resposta na estrutura e indicação térmica | elegibilidade térmica; testar remoção da fonte e resfriamento |
| Mecânica | Compressão ou tração | deformação conforme modelo implementado | estrutura e propriedades elegíveis |
| Óptica | Incidir luz | brilho metálico qualitativo | elegibilidade óptica |
| Conjugadas | Ctrl+clique ou `Selecionar várias` | efeitos explicitamente homologados | não habilitar pares arbitrários |
| Joule | Alimentação, condição e passo temporal | balanço e pistas térmico-elétricas disponíveis | não expor como universal |

- O clique na ferramenta **ativa o estímulo na cena existente**. O menu informa estado `ligado/desligado`, motivo de bloqueio e acesso a controles complementares quando já existirem no motor. Os ajustes de estímulo ficam associados à experiência, não enterrados em um painel genérico de visualização.
- No celular, gesto equivalente ao Ctrl+clique é `Selecionar várias` com aplicação explícita; nunca depender de teclado físico.
- Os registros só aparecem em Dados se o mecanismo de medida/cálculo realmente os tiver criado. A observação qualitativa não se transforma automaticamente em número experimental.
- Remover fonte de calor e observar o retorno térmico só pode ser anunciado como mecânica **quando o resfriamento estiver implementado e testado**.

## 4. O que acontece com Camadas e Comparar

**Camadas**: não é descartada; passa a ser preferência contextual `Exibição` dentro de Estrutura/Elétrons/Propriedades, compartilhada, sem uma aba científica inteira.

**Comparar**: retirar de *primeiro nível* do Explorar. No curto prazo, os cartões existentes ficam acessíveis como `Informação comparativa (conceitual)` ou em Dados, com a identificação explícita de que A/B **não são duas cenas independentes**. Não criar falsa impressão de experimento comparativo.

**Comparação dinâmica futura** (depende de motor/registro): `Registrar referência` → `Aplicar estímulo` → `Alternar antes/depois`, usando duas **apresentações do mesmo ensaio e do mesmo contexto científico**. A implementação exige snapshot/identidade de metal e estrutura, condições, proveniência e política de invalidação quando a geometria mudar. Em tela pequena, alternância A/B é preferível a dois palcos minúsculos.

## 5. Contrato obrigatório de uma ferramenta: gesto e ciência

Nenhum botão novo deve entrar no Ver sem cinco elementos verificáveis:

1. **Alvo** — onde o usuário atua: centro, rede, objeto, fonte, controle temporal, etc.;
2. **Ação** — o método existente ou motor novo que realmente muda o estado ou o foco;
3. **Resposta** — efeito visível no palco e indicação acessível do estado ativo;
4. **Limite** — condição de elegibilidade, escala válida, interpretação didática e motivo de bloqueio;
5. **Rastreabilidade** — o que é apenas uma representação versus medida/cálculo persistido em Dados.

O padrão de navegação SIAB deve ser preservado: seleção por teclado, foco após rerender, última ferramenta selecionada, filtros de roteiro/missão, modo de movimento reduzido, contraste e alvos de pelo menos 44px.

## 6. Plano de execução, em PRs separados

**P1 — Paridade de navegação, sem tocar na ciência.** Catalogar as ações existentes e reorganizar `Ver → Explorar` em `Estrutura / Elétrons / Propriedades`. Remover a aba Camadas, convertendo seus switches em grupo secundário. Reclassificar as comparações como informativas. Preservar a paleta inferior e o estado único. **Testes:** contagem de ferramentas por família, botão ativo, permissões, navegação teclado/touch, nenhum objeto científico alterado pela troca de aba.

**P2 — Seleção interligada com o palco.** A ferramenta selecionada em Ver deve levar o foco/realce ao centro ou à representação atual; o clique real na cena deve atualizar a descrição e o comando correspondente. Para mudanças de escala, só transferir a posição relativa, sem inventar correspondência entre grão e átomo. **Testes:** foco, vizinhos, troca de escala, zoom da lupa, acessibilidade.

**P3 — Estímulos e respostas.** Consolidar o comando de propriedades entre Ver e a paleta inferior; validar combinações elétrico/térmico/mecânico/óptico já existentes, condições e desligamento. Priorizar a regressão de resfriamento. **Testes:** um metal elegível e um inelegível por propriedade, Ctrl e toque, condição térmica reversível, ausência de novos cálculos falsos.

**P4 — Comparação real, quando o motor suportar.** Snapshot de referência, antes/depois, metadados de condições e invalidação. **Não** manter a aba Comparar como se já fosse uma simulação A/B.

**P5 — Consolidar Medir e Calcular no mesmo padrão.** Em Medir, instrumentos `Distância / Ângulo / Parâmetro de rede / Coordenação`, com seleções geométricas reais; em Calcular, fórmulas do catálogo `SILM.formulas`, origem das entradas e registros. Não copiar fórmulas, não inventar escala física para montagem livre.

## 7. Homologação mínima

- Desktop e mobile 320/390/768/1366; texto 150%, touch, teclado, redução de animações, claro/escuro/alto contraste.
- Chromium, Firefox e WebKit: nenhum menu fora da tela; voltar, expandir, fechar, retorno do foco.
- Entrar por Tabela → Objeto → Grãos → Rede → Centro usando o mesmo ensaio, inclusive lupa; Ver aberto/fechado não pode mexer no contexto, centro selecionado ou distância.
- Repetir troca Explorar → Medir → Calcular → Explorar, mantendo módulos, evidências e histórico sem mutações físicas.
- Uma ação de elétrons e uma de propriedade devem afetar a cena; um destaque meramente visual não deve criar medição/cálculo.
- Escolha de propriedade indisponível permanece bloqueada com justificativa científica.
- Só declarar conclusão quando os testes de regressão e o teste visual manual das capturas reais passarem.

## 8. Decisão de implementação

**Recomendação:** adotar **Estrutura / Elétrons / Propriedades** como famílias candidatas do Explorar; não recriar a bancada SIAB nem transferir automaticamente para metalurgia seus símbolos e reações. A etapa inicial precisa primeiro estabelecer **paridade de gesto, estado e feedback** usando os mecanismos científicos do SILM. Este documento é deliberadamente um estudo de desenho; **não autoriza afirmar que P1–P5 já foram programadas**.
