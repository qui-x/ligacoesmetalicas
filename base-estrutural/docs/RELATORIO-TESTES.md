# Relatório de testes — Base Estrutural 0.2.4

**52 grupos aprovados**, em cinco suítes completas sem filtro. **48 análises axe, zero violações detectadas**. 56 contextos com diagnóstico de console/HTTP sem erros críticos ou respostas de falha.

## Ambiente real

| Motor | Versão | Resultado |
|---|---|---|
| chromium | 153.0.8010.0 | Executado |
| firefox | — | Executável indisponível; não homologado |
| webkit | — | Executável indisponível; não homologado |

O comando npm test executou as cinco suítes sequencialmente. Playwright Core 1.63.0 e axe 4.13.0 foram usados via PLAYWRIGHT_MODULE/AXE_MODULE, com o Chromium local. As versões declaradas herdadas no package-lock.json são Playwright 1.62.1 e @axe-core/playwright 4.10.2; não foi executado npm ci nesta rodada. O log contém um aviso do npm sobre http-proxy do ambiente, sem falha de comando; os diagnósticos do aplicativo permaneceram limpos.

## Suítes

| Suíte | Início UTC | Grupos | Estado |
|---|---|---:|---|
| shell | 2026-10-09T00:35:50.040Z | 16 | PASS |
| operational | 2026-10-09T00:36:17.203Z | 10 | PASS |
| regression | 2026-10-09T00:36:42.696Z | 16 | PASS |
| closing | 2026-10-09T00:37:04.920Z | 9 | PASS |
| visual | 2026-10-09T00:37:27.292Z | 1 | PASS |

## Cobertura das quatro correções

- Missão restrita: conclusão validada, abertura automática do relatório, sessionId/identificação/título/módulo preservados, navegação geral oculta e Menu da atividade mantido.
- Encerrar após concluir: contexto anterior removido, navegação/marca normais restauradas, histórico completed com closedAt e marcador persistido após reload. Refazer cria uma nova sessão e preserva relatório anterior.
- Retomada de sessão concluída: relatório atualizado com os dados restaurados e restrição mantida.
- Roteiro com validate: mesmo fluxo de conclusão e encerramento. Missão sem report: nenhuma rota/botão de relatório inválida.
- Modal de inicialização: Home e Menu, mesma modal e única chave simcore_core_v1_startup; salvar/recarregar, Escape/Cancelar/Fechar sem escrita, foco, opções elegíveis e fallback para destino removido, oculto, desabilitado ou inexistente.
- Marca: comportamento normal, atividade ativa, clique repetido no destino e atividade concluída; teclado, foco visível e nenhuma reinicialização da sessão.
- Mobile: fluxos a 320×568, 360×740, 390×844, 844×390 e tablet 768×1024 com fonte 150%, temas, contraste e reduced motion. Verificados limites de viewport, rolagem, foco e recuperação da bottom nav.
- Referência documental: nome canônico SIAB(9).zip e SHA-512 conferidos; auditoria distingue documentos atuais de históricos preservados.

## Regressões

Percursos da Home, Aprender/Temas, Missões, Laboratório/Explorar/Medir/Calcular, Roteiros, Manual, Professor, Sobre, Projetor e retorno ao Início. Drawer/disclosures, acessibilidade no header mobile, preferências compartilhadas, Caderno opcional, recursos, temas, impressão e relatório contextual preservados.

PWA: atualização de Service Worker, remoção de cache antigo do próprio escopo, preservação de cache alheio, recarga e retomada offline. Storage bloqueado mantém a contingência em memória. Lifecycle: ciclos de navegação/registro/unload e 20 aberturas/cancelamentos da nova modal, sem crescimento de escopos/listeners monitorados nem diálogos após unload.

## Ajustes encontrados durante a validação

A retomada de um relatório já presente na URL exigia refresh após restaurar a sessão concluída; foi corrigida e testada novamente. A notificação de conclusão recebeu uma região acessível nomeada, mantendo seu anúncio e aparência. A rodada completa registrada nesta entrega ocorreu depois dessas correções.

## Resultados por grupo

| Suíte | Grupo | Estado |
|---|---|---|
| shell | chromium · shell desktop e hierarquia de início | PASS |
| shell | chromium · gaveta, foco, contexto e preferências estruturais | PASS |
| shell | chromium · Aprender, temas, relacionados e marcador simples | PASS |
| shell | chromium · atividade e shell restrito | PASS |
| shell | chromium · mobile bottom nav, safe area e drawer | PASS |
| shell | chromium · acessibilidade e ciclo de vida | PASS |
| shell | chromium · percurso completo por links, histórico e Tema como hub | PASS |
| shell | chromium · teclado, clique externo, scroll e gaveta a 150% | PASS |
| shell | chromium · startup removido, links diretos e Projetor no Professor | PASS |
| shell | chromium · API de recursos, visibilidade, tour e domínio destruído | PASS |
| shell | chromium · Caderno opcional, rota configurável e registro do domínio | PASS |
| shell | chromium · drawer da missão, estados bloqueados, ajuda, relatório e finalização | PASS |
| shell | chromium · matriz mobile de 320 a tablet, fonte 150% e sheets | PASS |
| shell | chromium · atividade mobile, banner, viewport e saída segura | PASS |
| shell | chromium · novas superfícies, contraste, spacing e movimento reduzido | PASS |
| shell | contrato · domínio legado sem experiência continua carregável | PASS |
| operational | 0.2.4 · header mobile normal e restrito, targets e foco a 150% | PASS |
| operational | 0.2.4 · disclosures por teclado, mouse, touch e estado na sessão | PASS |
| operational | 0.2.4 · acessibilidade bidirecional, storage, URL e workspace | PASS |
| operational | drawer-enter | PASS |
| operational | 0.2.4 · atividade livre conserva menu e navegação gerais | PASS |
| operational | 0.2.4 · Menu da atividade, ajuda contextual e recuperação de altura | PASS |
| operational | 0.2.4 · permissão explícita, relatório opcional e instruções do Professor | PASS |
| operational | 0.2.4 · Home canônica, Caderno opcional e mesma inicialização | PASS |
| operational | 0.2.4 · nomenclatura em Home, nav, drawer, área e Manual | PASS |
| operational | 0.2.4 · ciclos finalizar, refazer, encerrar e limpar controles | PASS |
| regression | chromium · 1–3 navegação, início, foco e histórico | PASS |
| regression | chromium · 4 módulos, seleção única e preservação do workspace | PASS |
| regression | chromium · 5 e 7 roteiro, cancelamento, módulo e retorno à investigação livre | PASS |
| regression | chromium · 6 e 8 missão, restrições, conclusão e nova tentativa | PASS |
| regression | chromium · 9 sessão, reload e restauração pelo domínio | PASS |
| regression | chromium · 10 Professor, serialização, importação e permissões | PASS |
| regression | chromium · 11 Sobre, referências, Manual e retorno de foco | PASS |
| regression | chromium · 12 relatório, edição, histórico e impressão equivalente | PASS |
| regression | chromium · acessibilidade, temas, fonte 150%, contraste e modais | PASS |
| regression | chromium · mobile portrait/landscape e todas as telas a 150% | PASS |
| regression | chromium · regressão de lifecycle, 20 ciclos e ausência de resíduos | PASS |
| regression | chromium · reset confirmado, preferências e unload com retomada pendente | PASS |
| regression | chromium · contratos de derivação, tela customizada e falhas recuperáveis | PASS |
| regression | PWA · atualização, isolamento de caches e retomada offline | PASS |
| regression | Armazenamento bloqueado e sessão em memória | PASS |
| regression | Cores forçadas e redução de movimento | PASS |
| closing | 0.2.4 · concluir, guardar contexto, encerrar e refazer missão | PASS |
| closing | 0.2.4 · retomada da sessão concluída preserva relatório e restrição | PASS |
| closing | 0.2.4 · marca normal, ativa e concluída com teclado e foco | PASS |
| closing | 0.2.4 · modal única, três cancelamentos, Salvar, reload e storage único | PASS |
| closing | 0.2.4 · destinos registrados, removidos, ocultos, indisponíveis e fallback | PASS |
| closing | 0.2.4 · roteiro com conclusão formal mantém contexto até Encerrar | PASS |
| closing | 0.2.4 · relatório opcional e encerramento sem conclusão | PASS |
| closing | 0.2.4 · quatro fluxos em mobile, tablet, landscape e fonte 150% | PASS |
| closing | 0.2.4 · modal, cancelamento e lifecycle em 20 ciclos | PASS |
| visual | 0.2.4 · controles expandidos em desktop/mobile, fonte 150% e contraste | PASS |

## Evidências e limites

Resultados e capturas em docs/evidence; índice visual em CAPTURAS-0.2.4.md. As datas são as das execuções reais desta versão. Auditorias de neutralidade, referência e precache acompanham as evidências. Limites de motores, aparelhos e leitores de tela: LIMITACOES-CONHECIDAS.md. Nenhuma diferença estrutural impeditiva foi identificada nos fluxos executados.
