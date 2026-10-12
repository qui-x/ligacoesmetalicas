# Base Estrutural 0.2.4 — Fechamento Final antes do SILM

Origem executável: Base Estrutural 0.2.3, pacote BASE-ESTRUTURAL-0.2.3-CORRECOES.zip. Referência comportamental congelada: SIAB(9).zip. Os hashes reais constam em BUILD-INFO.json. A origem, a referência e o SILM permanecem preservados.

## As quatro correções

| Correção | Resultado |
|---|---|
| Concluir e encerrar | Concluir mantém contexto restrito e abre o relatório. Encerrar remove o contexto anterior e restaura a navegação. O marcador de missão e os relatórios anteriores permanecem salvos. |
| Inicialização | Home e Menu abrem Como deseja iniciar? com destinos elegíveis do domínio, opção padrão, Salvar e cancelamento sem escrita. Uma única preferência estrutural. |
| Marca | Estado normal mantém o destino original. Restrita ativa retorna à atividade; concluída retorna ao relatório quando disponível. Teclado e foco preservados. |
| Referência | Documentos e metadados atuais identificam SIAB(9).zip com o SHA-512 conferido. Registros históricos conservam sua proveniência. |

## Estados e contexto

active e restarted representam a tentativa em execução. completed representa um resultado concluído com contexto ainda ativo. Encerrar arquiva a sessão: o histórico recebe closedAt, preservando status completed; se não houve conclusão, recebe status closed. A investigação livre restaurada não mantém o activityContext anterior. Esse modelo evita apagar o resultado ao encerrar.

Missões continuam acessíveis e podem ser refeitas, sem score, ranking ou gamificação persistente. O novo sessionId isola a tentativa dos dados e relatórios anteriores. Roteiros usam conclusão formal somente quando o domínio fornece validate.

## Integração preservada

O patch usa activity, shell, router, modal, storage e report existentes. Não cria outro roteador, focus trap, overlay, chave de inicialização ou motor de acessibilidade. A marca e a modal usam os estilos existentes. A notificação de conclusão recebeu apenas semântica de região nomeada.

A validação cobre teclado, fonte 150%, temas, contraste, redução de movimento, 320/360/390 px, landscape, tablet, PWA e lifecycle. Resultados e limites estão em RELATORIO-TESTES.md e LIMITACOES-CONHECIDAS.md.

Regra de parada: entregar e congelar a 0.2.4. Não iniciar automaticamente SILM, rebase ou Base 0.2.5.
