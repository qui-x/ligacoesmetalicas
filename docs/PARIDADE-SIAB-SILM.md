# Matriz de paridade de telas — SIAB 1.0.0 × SILM

## Referência e regra de adaptação

- Referência visual e de interação: repositório `qui-x/acidobase`, branch `acidosebases1.0.0` (SIAB 1.0.0).
- Projeto-alvo: `qui-x/ligacoesmetalicas`, programa principal SILM.
- O SIAB é a referência de arquitetura de interface, navegação, organização, densidade de informação, acessibilidade e responsividade.
- Conteúdo, termos, instrumentos e comportamentos químicos do SIAB não são copiados. Cada tela é adaptada à investigação de estruturas e propriedades metálicas.
- Dados, modelos, limitações e cálculos científicos do SILM permanecem sob autoridade do domínio SILM. Não se substitui uma estrutura sem suporte por CCC, CFC ou HC.
- Cada tela será concluída antes de avançar para a seguinte. A comparação deve ocorrer na ordem visível da navegação, sem priorizar telas por conveniência técnica.

## Ordem confirmada nos menus

A navegação principal dos dois programas apresenta a mesma sequência:

| Ordem | SIAB | SILM | Estado da etapa |
|---:|---|---|---|
| 1 | Início | Início | Primeira rodada aplicada; validação visual pendente |
| 2 | Aprender / Temas | Aprender / Temas | Aguardando a etapa |
| 3 | Missões | Missões | Aguardando a etapa |
| 4 | Roteiros Experimentais | Roteiros Experimentais | Aguardando a etapa |
| 5 | Laboratório | Oficina dos Metais | Aguardando a etapa principal da Oficina |
| 6 | Caderno | Caderno | Aguardando a etapa |
| 7 | Manual | Manual | Aguardando a etapa |

Dentro da etapa 5, a comparação será feita nesta ordem: **Foco → Montagem → Ver → Dados → Visão geral**. A Visão geral já recebeu uma primeira rodada de ajustes antes da definição desta sequência; será revisitada e homologada quando chegarmos à Oficina.

Depois das sete telas principais, passaremos aos itens secundários, respeitando a ordem em que aparecem nos respectivos menus: Montagens prontas, Tour da bancada, Área do Professor, apoio pedagógico/apresentação à turma e preferências, acessibilidade e modo projetor. Relatórios serão comparados no contexto em que são acessados pela investigação e pelo painel Dados.

## Critérios por tela, na ordem de trabalho

| Tela / área | Referência SIAB | Situação SILM observada | Direção de paridade | Estado |
|---|---|---|---|---|
| **1. Início** | Sobretítulo, título com destaque, lema, símbolo institucional, frase de seção, caminho principal em destaque, quatro caminhos secundários e área de apoio | Estrutura dos caminhos já era equivalente, mas o hero tinha um link para o Clube de Jazz no lugar do símbolo estático; faltavam o lema e a frase de seção | Preservar a identidade SILM; replicar hierarquia do hero, lema, seção, cartões e apoio. Manter os recursos SILM de retomada de atividade e resumo da investigação | **Primeira rodada aplicada; validação visual pendente** |
| 2. Aprender / Temas | Lista compacta, detalhe, ação para investigar e conteúdos relacionados | Lista/detalhe existem, com conteúdo específico do domínio | Alinhar hierarquia, estados de revisão, ação principal e itens relacionados | Aguardando a etapa |
| 3. Missões | Lista, problema, objetivo/regras, evidências, perguntas e conclusão | Catálogo e execução existem; conteúdo pedagógico aparece em blocos próprios do SILM | Replicar a organização didática sem copiar problemas, respostas ou conceitos ácido-base | Aguardando a etapa |
| 4. Roteiros Experimentais | Catálogo, detalhe estruturado, identificação e início da bancada | Catálogo e execução existem; comparar completude e hierarquia do detalhe | Replicar etapas e campos úteis, respeitando um único módulo por roteiro | Aguardando a etapa |
| 5a. Oficina — Foco | Workspace central, painéis laterais, barra de contexto e ações | Foco, Montagem, Ver, Dados e barra de ações existem; integração usa camada própria sobre Base SI 0.9.17 | Comparar densidade, estados, foco, ações, persistência e comportamento responsivo | Aguardando a etapa |
| 5b. Oficina — Montagem | Prateleira, preparo, objetos e módulos em grupos recolhíveis | Dock com Resumo, Preparo, Unidades, Módulo e Roteiro | Reproduzir navegação contextual, estados recolhíveis e foco; manter controles científicos próprios do SILM | Aguardando a etapa |
| 5c. Oficina — Ver | Famílias de visualização e detalhe contextual | Famílias de estrutura, elétrons, propriedades, instrumentos e cálculos | Reduzir texto introdutório; uma ação por vez; detalhes junto da visualização correspondente | Aguardando a etapa |
| 5d. Oficina — Dados | Consultas organizadas em painel próprio e retorno ao catálogo | Dados do metal, medições/cálculos e arquivos | Replicar navegação catálogo → detalhe → voltar, mantendo proveniência científica | Aguardando a etapa |
| 5e. Oficina — Visão geral | Título curto, ações/hint, grade e rolagem do workspace | Primeira rodada aplicada: controles compactos, aviso breve, metadados resumidos e fontes/limites recolhidos | Preservar uma única área de rolagem; adaptar a grade ao número de metais e ao tamanho da tela | **Implementada; revisão na etapa da Oficina** |
| 6. Caderno | Filtros, anotações, registros de prática, CSV, impressão e exclusão | Wrapper genérico existe, mas a configuração do Caderno permanece desativada no bootstrap | Ativar e implementar o Caderno científico do SILM, sem copiar substâncias ou leituras ácido-base | Aguardando a etapa — lacuna funcional |
| 7. Manual | Busca, hero, atalhos, categorias, artigos, etapas, detalhes e fontes | Manual operacional mínimo, com conteúdo em desenvolvimento | Replicar arquitetura de consulta e aprofundamento, reescrevendo todo o conteúdo para o SILM | Aguardando a etapa — lacuna de conteúdo |
| Relatórios (contextual) | Relatório vinculado à atividade, com dados, interpretação e impressão | Relatório básico com Observações, Análise e Conclusão e captura contextual | Comparar campos, seções, dados, impressão e persistência; adaptar às grandezas metálicas | Aguardando a revisão contextual |
| Recursos secundários | Montagens prontas, Tour, Professor, apoio pedagógico e preferências | Recursos acessíveis pelo menu, página inicial ou ferramentas próprias | Comparar cada entrada e destino na ordem do menu secundário após a navegação principal | Aguardando as etapas secundárias |

## Primeira rodada — Início

Alterações feitas na branch de trabalho:

- O link de entrada do Clube de Jazz deixou de ocupar o espaço do hero. O símbolo do SILM aparece agora como imagem institucional estática, em correspondência com o símbolo do SIAB. Os arquivos e a implementação interna do Clube de Jazz não foram alterados.
- Foi incluído o lema adaptado ao domínio: **“Monte. Observe. Meça. Calcule.”**
- A seção “Escolha seu próximo passo” recebeu a frase “Da curiosidade à descoberta”.
- Os metadados dos cartões usam frases curtas e contagens gramaticalmente adaptadas: temas para explorar, desafios para resolver e investigações guiadas.
- O rodapé concentra Manual, Área do Professor e Preferências. O atalho de Relatório foi retirado do Início; o acesso contextual permanece em Dados.
- O cartão de retomada da atividade e o resumo da investigação selecionada foram preservados por serem recursos próprios do SILM, úteis à continuidade do trabalho e não equivalentes a gamificação.

A rodada foi conferida no código. A validação visual em navegador e nos tamanhos desktop/tablet/celular ainda está pendente; por isso, a tela não está marcada como homologada.

## Rodada anterior — Oficina → Visão geral

Esta rodada ocorreu antes de fixarmos a sequência de trabalho. As alterações permanecem na branch, mas a conferência final será feita quando chegarmos à Oficina:

- Cabeçalho reduzido para “Estruturas recentes”.
- Controles encurtados para “Propriedade”, “Intensidade”, “Restaurar”, “Elétrons” e “Movimento”.
- Aviso geral reduzido e limites gerais colocados em seção recolhível.
- Cartões identificam metal e estrutura sem repetir legendas longas.
- Fontes e limites específicos ficam em detalhes recolhidos.
- Removida a rolagem interna limitada a 70vh para que o workspace controle a rolagem.

## Critério de conclusão de cada tela

Uma tela só avança de etapa depois de comparar e verificar:

1. Hierarquia e densidade de informação.
2. Organização e alinhamento dos componentes.
3. Navegação, estados, ações e retorno.
4. Teclado, leitor de tela, foco e alvos de toque.
5. Layout responsivo em desktop, tablet, celular e orientação paisagem, quando aplicável.
6. Persistência e comportamento funcional que pertencem à tela.

A semelhança de texto não basta: é preciso alinhar estrutura e comportamento. Nenhuma informação científica validada pode ser removida apenas para reduzir a tela.

## Fora do escopo desta rodada

O Clube de Jazz, jukebox, áudio, Blender, Babylon.js e seus recursos internos permanecem adiados. O trabalho atual limita-se ao programa principal SILM e à interface principal. O símbolo institucional continua na tela inicial, mas sem atalho para o Clube de Jazz.
