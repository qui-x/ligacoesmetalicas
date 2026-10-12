# Critérios de aceite — Base Estrutural 0.2.0

Aprovação interna para entrega; homologação externa pendente. A fase 22 (ZIP/hash) é executada somente após as verificações finais, para congelar exatamente os bytes aprovados.

| Critério do prompt | Resultado | Evidência |
|---|---|---|
| Funciona sem domínio | SIM | Compatibilidade e ACEITE-FINAL fase 24 |
| Core conhece ácidos/bases ou metais | NÃO | Auditoria de termos e ausência de motores/dados |
| Workspace e acessibilidade | SIM | Regressões 3/7/8/13 e compatibilidade |
| Mobile | SIM, emulação | Matriz 320–1440, touch e landscape |
| Manual como mecanismo | SIM | Regressão 9 e recuperação do Manual |
| Notificações e modais | SIM | Regressões 10/15 e demo |
| PWA/offline | SIM, quando suportado | Update real e reload offline do core/demo |
| Storage estrutural | SIM | Regressões 11/16 e preferências persistentes |
| Adicionar domínio sem editar core | SIM | Demo externa e segundo domínio mínimo de teste |
| Remover domínio sem resíduos geridos | SIM | Regressões 4/18, cancelamento efetivo e destroy final |
| Tema próprio do domínio | SIM | Regressão 6 e identidade/tema da demo |
| Hospedar DOM/SVG/Canvas/WebGL | SIM | Demo SVG; Canvas e WebGL reais nos testes |
| Acessibilidade consultável pelo domínio | SIM | Contexto, eventos e preferências do sistema |
| Domínio controla sua ciência | SIM | Core recebe renderers/contexto opaco, sem schema científico |
| Neutralidade científica | SIM no runtime auditado | Inventários e classificação de todas as ocorrências pesquisadas |

“Sem resíduos” refere-se a DOM e recursos transitórios registrados no contrato; armazenamento persistente e cache de arquivos podem permanecer deliberadamente. O contrato não captura recursos globais que um módulo crie sem registrar limpeza.

A ciência original não foi apenas ocultada: seus módulos, dados e pré-cache foram retirados da distribuição. A documentação histórica e a migração seletiva são as únicas referências intencionais ao produto de origem fora do nome técnico “Base”.

## Encerramento

Não há importação de SILQ-Metálicas, início de SILM, gráficos científicos, motor físico específico, conteúdo pedagógico científico ou easter egg. O segundo domínio existe apenas dentro do teste de isolamento. A 0.2.0 termina no pacote para homologação. Não foi iniciada uma versão 0.3.
