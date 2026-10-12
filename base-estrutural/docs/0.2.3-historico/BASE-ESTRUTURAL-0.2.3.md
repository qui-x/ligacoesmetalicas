# Base Estrutural 0.2.3 — Fidelidade Operacional Final ao SIAB

Cópia incremental independente da Base Estrutural 0.2.2, com origem e SHA-512 em BUILD-INFO.json. O projeto implementa as correções operacionais do prompt recebido. A referência já fornecida pelo usuário foi conferida diretamente: SIAB 1.0.0 em SIAB(4).zip, idêntico ao SIAB(3).zip. Esta correção documental substitui o pedido desnecessário de reenvio por identificação e SHA-512 do arquivo efetivamente inspecionado. A homologação humana permanece pendente.

## Fidelidade operacional implementada

| Superfície | Comportamento 0.2.3 |
|---|---|
| Header mobile | Hambúrguer, marca e ícone Acessibilidade visíveis em 320/360/390 px; targets de 44 px; foco e safe areas |
| Acessibilidade | Controle expansível na gaveta e modal herdada compartilham motor, estado, eventos e storage |
| Drawer normal | Agora, Navegar expansível, Recursos, Professor, Preferências e Aplicativo, conforme registros disponíveis |
| Atividade restrita | Menu da atividade com contexto, Continuar, Ajuda, Relatório quando aplicável, Finalizar missão e Encerrar |
| Ajuda | Instruções, objetivos, procedimento, condições, dicas e explicações do domínio; texto de tópico relacionado do Manual na modal existente |
| Nav desktop | Oculta durante restrição efetiva; retorna após completed ou saída |
| Bottom nav | Oculta durante restrição; altura medida e padding inferior retornam a zero; restauração sem reload |
| Marca | Inerte e sem href durante restrição; caminho normal restaurado ao concluir/encerrar |
| Navegar | aria-expanded/controls, teclado/touch, início mobile expandido e desktop recolhido; escolha preservada nesta página |
| Animação | Entrada lateral de 250 ms, desativada pelo ajuste de movimento ou pelo sistema |
| Home | Laboratório, Aprender, Missões, Roteiros Experimentais e Caderno registrado; Manual/Professor em Apoio |
| Inicialização | Acesso secundário na Home abre a mesma preferência da gaveta |
| Roteiros Experimentais | Label atualizado; IDs/URLs roteiros preservados |

## Arquitetura preservada

O patch adapta shell, apresentação da ajuda, Home, controles de preferências e textos de configuração da Demo. O lifecycle, o contexto, o workspace, o layout responsivo, a identidade, o motor A11Y, Roteiros/Missões, Professor, relatórios, Caderno e Manual permanecem os serviços existentes. O único ajuste no roteador é o texto da mensagem de restrição; a regra continua sendo `experience.allowsRoute`.

Não há novo roteador, motor mobile, storage, catálogo científico, modelo de metais, sistema de pontos ou tour definitivo. A Demo continua usando blocos, contador e textos neutros. O CSS adiciona apenas layout de header, disclosures, controles da gaveta e animação curta.

## Contexto de atividade

A restrição efetiva usa navigationMode e status sem mudar o schema salvo. Concluir mantém sessão e relatório e libera a navegação geral. Refazer reativa a restrição através do motor herdado. Encerrar preserva o relatório, retorna à investigação livre e restaura o menu. A atividade concluída continua identificada; para substituí-la, use Encerrar, conforme o motor existente.

O Manual completo fica indisponível durante restrição por padrão. Ajuda lê somente o tópico relacionado para a modal de atividade. Um domínio pode declarar uma permissão explícita para uma rota/parâmetro em allowedDestinations; links, hashes e histórico continuam sujeitos ao mesmo guard.

## Referências e congelamento

BUILD-INFO.json identifica a referência efetivamente conferida, SIAB(4).zip, versão interna 1.0.0, e registra seu SHA-512 real. A menção SIAB(9).zip do prompt fica somente como rastreabilidade da divergência de nome. A orientação posterior do usuário foi usar os arquivos já fornecidos. Documentos históricos mantêm sua proveniência.

O ZIP da candidata possui um SHA-512 externo; incluir o próprio hash dentro do ZIP criaria autorreferência. Integridade das entradas e arquivos fora do escopo está em docs/evidence/INTEGRIDADE-ORIGENS.json. A lista de alterações e limitações acompanha esta distribuição.

## Regra de parada

Parar em 0.2.3. Aguardar homologação humana. Não iniciar 0.2.4, SILM, rebase ou mecânicas científicas.
