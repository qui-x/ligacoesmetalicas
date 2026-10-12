# Limitações e diferenças residuais — Base 0.2.2

Esta entrega é candidata à homologação. As verificações desta rodada usam Chromium headless e emulação de viewport/toque; não equivalem a teste em dispositivos físicos.

| Limitação | Consequência | Situação |
|---|---|---|
| Firefox/Gecko e WebKit indisponíveis no ambiente | Não há validação 0.2.2 nesses motores | Motivo de lançamento registrado nos JSON desta rodada; evidências 0.2.1 são somente históricas |
| Safe areas e teclado virtual dependem do dispositivo | CSS `env(safe-area-inset-*)` e VisualViewport estão integrados, sem teste em hardware com recorte | Homologação física pendente |
| Sem sessão com leitor de tela real | Semântica, nomes, roles, foco, teclado e axe foram verificados | NVDA, VoiceOver e TalkBack não exercitados |
| Sem gesto físico ou instalação PWA pelo sistema | Toque e offline são emulados; instalação depende de `beforeinstallprompt` | Validar instalação e gestos no produto/dispositivo |
| Limpeza medida por escopos, DOM, overlays e listeners de raízes persistentes | Os cenários ensaiados não deixam recursos geridos ou listeners acrescentados | Não constitui prova universal de ausência de vazamento de heap |
| APIs executam código confiável do domínio | Hooks não cooperativos ou recursos criados fora de `ctx.scope` podem escapar à limpeza | Contrato de lifecycle mantido; não há isolamento de código malicioso |
| Storage pode estar indisponível | Preferências e dados passam a memória temporária | Aviso e fallback testados; sem sincronização remota |
| Lista móvel é registrada pelo produto | Muitos destinos ou rótulos excessivamente longos podem prejudicar a barra | Use um conjunto curto, normalmente três ou quatro itens |

Diferenças residuais deliberadas frente ao SIAB:

- A gaveta conserva seções abertas, sem os acordeões da referência; não há animação de entrada.
- Acessibilidade usa o modal existente da Base, aberto por Preferências ou pelo atalho desktop. Inicialização usa um select no drawer.
- Roteiros usam a rota plural e os motores da 0.2.1; Finalizar missão abre o formulário existente antes da validação.
- Temas não incluem editor de conteúdo, catálogo científico ou progressão. O marcador Revisado pode ser desmarcado.
- Caderno é opcional e tem hooks de integração. O editor de texto simples pertence somente à Demo.
- Tour é um hook/evento opcional, sem roteiro final; Montagens não foi implementado.
- O Modo Projetor amplia elementos estruturais. Ajustes de visualizações específicas pertencem ao domínio e não foram criados nesta rodada.
- Não há identidade ou dados científicos do SIAB no runtime. A migração antiga preservada lê somente preferências de interface.

As referências originais, SILM e Base 0.2.1 foram preservadas. O trabalho termina em 0.2.2 e aguarda homologação; SILM, seu rebase, mecânicas de metais e Base 0.3 não foram iniciados.
