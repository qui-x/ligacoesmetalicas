# Limitações conhecidas — 0.2.3

A referência fornecida já estava disponível como SIAB(4).zip e SIAB(3).zip, ambos idênticos, versão interna 1.0.0. A conferência desta revisão foi feita por leitura direta de fontes HTML/CSS/JS e integridade. Não se afirma identidade com outro arquivo pelo sufixo do nome. As diferenças deliberadas estão na matriz de paridade; a homologação humana continua pendente.

A validação executável usa Chromium headless 153.0.8010.0 com Playwright e axe. Firefox e WebKit não possuem executáveis instalados neste ambiente. Emulação de viewport/touch/safe areas, ARIA e focus trap não substitui teste em aparelhos físicos, VoiceOver, NVDA, TalkBack ou instalação PWA real. Safe areas são declaradas em CSS e inspecionadas; não houve hardware com notch.

Os testes de lifecycle verificam escopos, recursos gerenciados, listeners registrados após instrumentação e elementos/resíduos. Não medem heap ou listeners internos do navegador. O aviso específico de bloqueio de Service Worker é gerado pelo harness Playwright em contextos que bloqueiam SW; o teste PWA usa contexto separado com SW permitido. Demais erros, avisos e HTTP failures são conferidos na suite operacional.

A navegação restrita organiza uma atividade pedagógica local. A permissão explícita de destino é responsabilidade do domínio. Não constitui autenticação ou autorização de servidor. Dados do domínio, validação científica, formato de Caderno e captura/restauração continuam sendo fornecidos pelo produto.

Mudanças de layout com fonte ampliada podem aumentar a altura do header/banner e demandar rolagem, especialmente em landscape curto. A Base preserva o acesso a controles e launchers; não impõe uma investigação sem scroll.

Parar na 0.2.3 e aguardar homologação. Nenhum desenvolvimento de SILM, rebase ou mecânica científica foi realizado.
