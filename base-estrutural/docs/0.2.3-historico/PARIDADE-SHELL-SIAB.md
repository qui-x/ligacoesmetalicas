# Paridade de shell — Base 0.2.3 e SIAB fornecido

Referência inspecionada: **SIAB 1.0.0**, arquivo **SIAB(4).zip**, já enviado pelo usuário. SIAB(3).zip é byte a byte idêntico. Origem executável da Base: 0.2.2; esta edição documental mantém o runtime da candidata 0.2.3. SHA-512 e fontes lidas em CONFERENCIA-REFERENCIA-SIAB.md e evidence/CONFERENCIA-REFERENCIA-SIAB.json.

A menção SIAB(9).zip do prompt foi a origem do pedido desnecessário de reenvio. Após a correção do usuário, a referência é o arquivo já fornecido, identificado pelo conteúdo e hash real.

## Fidelidade operacional conferida

| Item | Observação no SIAB fornecido | Base 0.2.3 | Resultado |
|---|---|---|---|
| Header mobile | stylesiab.css mantém access-btn com 44 px e oculta somente seu texto | Ícone/nome acessível e target 44 px, testados em 320/360/390 | Comportamento atendido |
| Gaveta | Dialog à esquerda, min(360px,88vw), scroll, fechamento e backdrop | Uma gaveta para desktop/mobile, foco/trap/Escape e retorno | Estrutura equivalente |
| Navegar | gaveta.js inicializa disclosure expandido até 900 px, recolhido acima | Mesmo estado inicial e preservação na página | Comportamento atendido |
| Acessibilidade | a11y-toggle expansível, controles ligados a A11Y.estado/definir | Controles na gaveta e modal compartilhando o motor herdado | Comportamento atendido |
| Animação | Entrada lateral .26 s, cubic-bezier; motion e sistema removem efeitos | Entrada .25 s ease-out, mesmas condições de redução | Diferença de 10 ms e curva registrada |
| Restrição | activity-ui.js oculta nav desktop/bottom e seções gerais; Menu da atividade | Contexto reduzido, ajuda/relatório/saída/acessibilidade | Comportamento atendido |
| Marca restrita | Marca aponta para a rota da atividade, sem voltar ao Início | Marca fica inerte/sem href | Ambos impedem atalho ao Início; interação diferente |
| Ajuda | SIAB.ajuda.contextual usa tópico do Manual e evita link geral durante restrição | Definição/Professor e tópico relacionado na modal existente | Equivalência de finalidade; conteúdo do domínio |
| Espaço inferior | investigacao.css declara bottom-h zero no estado restrito | Layout mede nav oculta e zera reserva; matriz mobile confirma | Requisito atendido na Base |
| Finalização | finalizar mantém atividade e abre seu relatório; restrição deriva da configuração ativa | completed libera navegação geral; Refazer e Encerrar usam motor herdado | Diferença exigida pelo prompt 0.2.3 |
| Saída | Encerrar remove contexto da atividade e permite navegação geral | Restauração automática testada, sem reload | Comportamento atendido |
| Banner | index.html coloca faixa entre header e main | Mesma posição, com região acessível nomeada | Estrutura equivalente |
| Home | Laboratório, Aprender, Missões, Roteiros Experimentais, Caderno | Mesma hierarquia; Caderno depende do registro | Comportamento atendido |
| Apoio | Manual/Professor e botão Configurações de inicialização | Apoios e acesso à preferência compartilhada | Hierarquia equivalente |
| Startup | Home/gaveta abrem diálogo comum, chave siab_inicializacao | Home abre select da gaveta, chave existente do core | Estado compartilhado; apresentação adaptada |
| Relatório | Serviço da atividade/bancada, fora dos cinco caminhos principais | Serviço contextual opcional, fora dos principais | Hierarquia equivalente |
| Sobre | Menu → Aplicativo → Sobre o SIAB | Menu → Aplicativo → Sobre do domínio | Hierarquia equivalente |
| Labels | Roteiros Experimentais nas superfícies principais | Mesmos labels, IDs roteiros preservados | Atendido |
| Caderno/recursos | Ferramentas e registros específicos do SIAB | Integrações opcionais e Demo neutra | Adaptação deliberada ao núcleo universal |
| Preferências de produto | SIAB inclui som/vibração, abertura e integração Libras | Preserva controles existentes da Base; sem copiar recursos científicos | Fora do escopo desta extração |

Método: leitura direta das fontes da referência e comparação com a implementação da Base; resultados de execução da Base estão no RELATORIO-TESTES.md. Nenhuma nova bateria do navegador foi executada sobre o SIAB nesta revisão. Não se declara igualdade integral de interfaces, conteúdo ou motores científicos. Diferenças acima são explícitas, e a homologação humana permanece pendente.
