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

## 3. Arquitetura revista: dois níveis e ativação direta como no SIAB

**Correção de desenho após a discussão:** a proposta anterior de criar uma faixa
`Estrutura / Elétrons / Propriedades` **como terceiro nível clicável está rejeitada**.
No SIAB, os botões `Partículas / Espécies / Equações / Transferência de próton`
ficam **logo abaixo** de `Observar / Medir / Analisar`. Clicar em uma opção
seleciona e exibe **imediatamente** a ferramenta ou representação correspondente.
No SIAB, isso não significa executar automaticamente uma medição ou reação:
`SIAB.selecionarVer(id)` ativa `state.verTab` e `SIAB.renderVer()`; uma ação
experimental, como mergulhar a fita, exige seu gesto instrumental próprio.

**Paridade correta para o SILM:**

```text
Ver · Investigar
[ Explorar ] [ Medir ] [ Calcular ]      ← módulo científico (primeira faixa)
[ Centros ] [ Vizinhos ] [ Célula/Rede ] [ Elétrons ] [ Campo ] [ Calor ] ...
             ↑ botão direto de ferramenta (segunda faixa)
      [ conteúdo/condições da ferramenta selecionada ]
A cena central permanece visível e recebe o efeito ou os próximos cliques.
```

Não existe uma faixa intermediária de `Estrutura / Elétrons / Propriedades`.
Esses termos continuam úteis **apenas como categorias de documentação**, não
como etapas obrigatórias ou abas. Assim, clicar no botão inferior já escolhe
a funcionalidade que corresponde àquele módulo.

### 3.1 Tipos de botão direto — não confundir ativar com simular

| Tipo | Exemplo em Explorar | Efeito imediato do clique | O que não se deve fazer |
|---|---|---|---|
| Alternador visual | Centros, Elétrons, Vizinhos, Célula/Rede | Liga/desliga representação e informa estado `aria-pressed` | Criar medição ou modificar metal sem intenção |
| Estímulo físico/didático | Campo, Calor, Luz, Compressão, Tração | Ativa/desativa condição no motor existente, com motivo se indisponível | Simular propriedade não homologada para o metal atual |
| Preparação de interação | Selecionar centro, Inspecionar grão | Ativa a ferramenta e sinaliza o que o próximo toque **na cena** fará | Marcar uma seleção falsa no menu sem vínculo com o palco |
| Ferramenta com parâmetros | Joule, combinação de propriedades | Seleciona a ferramenta e apresenta controles necessários (condições/alimentação), sem nova escolha de categoria | Ligar tensão/corrente arbitrariamente antes de configurar parâmetros |

**Regra:** o clique seleciona a funcionalidade diretamente; se a mecânica
exigir um segundo gesto na cena, ele é a **operação experimental**, não um
terceiro nível de navegação. Esta distinção é idêntica à do SIAB: abrir
`pH` revela o instrumento, mas medir exige usar a fita/pHmetro.

### 3.2 Faixa de ferramentas do Explorar — proposta direta

| Botão visível sob Explorar | Motor/ação já disponível | Feedback necessário |
|---|---|---|
| **Centros** | destaque de centros da representação | estados e identificação na cena |
| **Vizinhos** | `setCrystalRepresentation({neighbors})` | vizinhos do centro selecionado |
| **Célula/Rede** | `setCrystalRepresentation({view,unitCell})` | transição na visualização |
| **Elétrons** | `quickActions.toggleElectrons()` | aparição + movimento juntos; ligado/desligado |
| **Campo** | `quickActions.toggleProperty('electrical')` | condição elétrica e resposta do modelo |
| **Calor** | `quickActions.toggleProperty('thermal')` | fonte, resposta e desligamento; resfriamento pendente |
| **Compressão** | `quickActions.toggleProperty('malleability')` | deformação, se aplicável |
| **Tração** | `quickActions.toggleProperty('ductility')` | deformação, se aplicável |
| **Luz** | `quickActions.toggleProperty('luster')` | resposta óptica qualitativa |
| **Joule** | `quickActions.beginJoule()` e ações específicas | controles de alimentação, condições, passo temporal |

A exposição final de cada botão dependerá do contexto: **não mostrar como
habilitado um comando sem cena elegível, estrutura preparada ou capacidade
científica correspondente**. `Objeto`, `Grãos`, `Rede` e `Centro`
continuam controlados pela **Travessia**, não são duplicados na faixa.

O ato de destacar um centro na cena e as opções de exibição (rótulos,
legenda, sobreposições) devem seguir o estado existente; ficam como ajustes
locais da ferramenta, sem obrigar o usuário a abrir o antigo grupo `Camadas`.

### 3.3 Como será a interação responsiva

- **Desktop:** uma faixa de botões diretos logo abaixo de Explorar, com ícone,
  rótulo curto, indicador de ativo e quebra de linha somente quando necessário.
- **Mobile:** os mesmos botões diretos numa faixa **horizontal rolável**,
  com alvos mínimos de 44 × 44 px. O módulo permanece fixo no topo do menu
  `Ver`; o gesto horizontal não desloca a Oficina nem o palco.
- **Teclado:** setas/Home/End entre itens; Enter/Espaço selecionam/acionam,
  foco mantido após atualização e estados `aria-pressed` corretos.
- **Ctrl + clique** para propriedades conjugadas quando houver capacidade;
  o mobile oferece `Selecionar várias` sem exigir teclado físico.
- Roteiros/missões continuam determinando disponibilidade. Ao trocar de
  módulo, o estado científico persiste e o menu recorda a última ferramenta
  elegível, como no SIAB. Ferramentas não elegíveis devem informar o porquê.
- A **paleta inferior** pode repetir atalhos úteis, mas ambos acionam o
  **mesmo comando**, sem duplicação nem divergência de estado.

### 3.4 Medir e Calcular seguem o mesmo padrão

**Medir →** botões diretos `Distância`, `Ângulo`, `Parâmetro`,
`Coordenação`. O primeiro clique arma a ferramenta; selecionar pontos
cristalográficos na cena é o gesto instrumental; só então há registro
de leitura com origem, unidade e validade.

**Calcular →** botões diretos das fórmulas disponíveis (contagem, volume,
densidade, empacotamento etc.). O clique abre imediatamente a fórmula
com entradas já verificadas, proveniência, restrições e possibilidade de
cálculo; o botão não inventa valores experimentais.

**A finalidade é a mesma:** dois níveis visuais para chegar à ferramenta,
e gestos científicos posteriores apenas quando efetivamente necessários.

## 4. O que acontece com Camadas e Comparar

**Camadas**: não é descartada; passa a ajustes locais de exibição (rótulos, destaques, legenda e sobreposições) associados às ferramentas diretas. Não pode virar uma terceira faixa de escolha.

**Comparar**: retirar da faixa de ferramentas como se fosse uma experiência dinâmica pronta. No curto prazo, os cartões existentes ficam acessíveis como `Informação comparativa (conceitual)` ou em Dados, com a identificação explícita de que A/B **não são duas cenas independentes**. Não criar falsa impressão de experimento comparativo.

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

**P1 — Paridade de navegação, sem tocar na ciência.** Catalogar as ações existentes e implementar **duas faixas apenas**: `Ver → [Explorar/Medir/Calcular] → [botões diretos da ferramenta]`. Eliminar `Observar/Camadas/Comparar` como intermediários e **não criar** `Estrutura/Elétrons/Propriedades` como abas. Manter controles de exibição associados às ferramentas e comparações conceituais identificadas. Preservar paleta inferior e estado científico único. **Testes:** contagem de ferramentas por família, botão ativo, permissões, navegação teclado/touch, nenhum objeto científico alterado pela troca de aba.

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

**Recomendação revista:** adotar **seleção direta da ferramenta na segunda faixa de Ver**, sem terceira camada de categorias. `Estrutura`, `Elétrons` e `Propriedades` são apenas taxonomia de planejamento, não botões intermediários. Não recriar a bancada SIAB nem transferir automaticamente para metalurgia seus símbolos e reações. A etapa inicial precisa primeiro estabelecer **paridade de gesto, estado e feedback** usando os mecanismos científicos do SILM. Este documento é deliberadamente um estudo de desenho; **não autoriza afirmar que P1–P5 já foram programadas**.
