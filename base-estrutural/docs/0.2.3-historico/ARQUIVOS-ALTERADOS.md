# Arquivos alterados/adicionados — Base 0.2.3 Correções

Comparação do pacote completo contra a Base 0.2.2 congelada. Somente a cópia independente 0.2.3 — Correções foi editada nesta revisão. O histórico conserva os nomes, hashes e evidências reais. Os pacotes anteriores e o SILM estão preservados.

Resumo: 102 adicionados, 54 modificados e 10 retirados desta posição. Dependências instaladas, caches e tests/results temporários ficam fora do ZIP. A tabela reúne a implementação 0.2.3 e sua revisão documental.

| Estado nesta cópia | Arquivo |
|---|---|
| Modificado | BUILD-INFO.json |
| Modificado | CHANGELOG.md |
| Modificado | README.md |
| Modificado | VERSION |
| Modificado | css/shell.css |
| Adicionado | docs/0.2.2-historico/ACEITE-BASE-0.2.1.md |
| Adicionado | docs/0.2.2-historico/ACEITE-BASE-0.2.2.md |
| Adicionado | docs/0.2.2-historico/ARQUIVOS-ALTERADOS.md |
| Adicionado | docs/0.2.2-historico/BASE-ESTRUTURAL-0.2.0.md |
| Adicionado | docs/0.2.2-historico/BASE-ESTRUTURAL-0.2.1.md |
| Adicionado | docs/0.2.2-historico/BASE-ESTRUTURAL-0.2.2.md |
| Adicionado | docs/0.2.2-historico/CONTRATOS.md |
| Adicionado | docs/0.2.2-historico/CRIAR-DOMINIO.md |
| Adicionado | docs/0.2.2-historico/DIFERENCAS-RESIDUAIS.md |
| Adicionado | docs/0.2.2-historico/LIMITACOES-CONHECIDAS.md |
| Adicionado | docs/0.2.2-historico/PARIDADE-SHELL-SIAB.md |
| Adicionado | docs/0.2.2-historico/PARIDADE-SIAB.md |
| Adicionado | docs/0.2.2-historico/RELATORIO-REGRESSOES.md |
| Adicionado | docs/0.2.2-historico/RELATORIO-TESTES.md |
| Adicionado | docs/0.2.2-historico/evidence/AUDITORIA-NEUTRALIDADE.json |
| Adicionado | docs/0.2.2-historico/evidence/INTEGRIDADE-ORIGENS.json |
| Adicionado | docs/0.2.2-historico/evidence/INVENTARIO-ARQUIVOS.json |
| Adicionado | docs/0.2.2-historico/evidence/regression/REGRESSOES-BASE-0.2.2.json |
| Adicionado | docs/0.2.2-historico/evidence/regression/chromium-a11y-axe.json |
| Adicionado | docs/0.2.2-historico/evidence/regression/chromium-contraste-150.png |
| Adicionado | docs/0.2.2-historico/evidence/regression/chromium-dark-axe.json |
| Adicionado | docs/0.2.2-historico/evidence/regression/chromium-inicio.png |
| Adicionado | docs/0.2.2-historico/evidence/regression/chromium-laboratorio.png |
| Adicionado | docs/0.2.2-historico/evidence/regression/chromium-light-axe.json |
| Adicionado | docs/0.2.2-historico/evidence/regression/chromium-manual-axe.json |
| Adicionado | docs/0.2.2-historico/evidence/regression/chromium-missao.png |
| Adicionado | docs/0.2.2-historico/evidence/regression/chromium-mobile-inicio.png |
| Adicionado | docs/0.2.2-historico/evidence/regression/chromium-mobile-modulos-axe.json |
| Adicionado | docs/0.2.2-historico/evidence/regression/chromium-mobile-modulos.png |
| Adicionado | docs/0.2.2-historico/evidence/regression/chromium-mobile-professor.png |
| Adicionado | docs/0.2.2-historico/evidence/regression/chromium-professor-axe.json |
| Adicionado | docs/0.2.2-historico/evidence/regression/chromium-professor.png |
| Adicionado | docs/0.2.2-historico/evidence/regression/chromium-relatorio-axe.json |
| Adicionado | docs/0.2.2-historico/evidence/regression/chromium-relatorio-impressao.png |
| Adicionado | docs/0.2.2-historico/evidence/regression/chromium-relatorio.png |
| Adicionado | docs/0.2.2-historico/evidence/regression/chromium-sobre.png |
| Adicionado | docs/0.2.2-historico/evidence/regression/forced-colors-axe.json |
| Adicionado | docs/0.2.2-historico/evidence/regression/forced-colors.png |
| Adicionado | docs/0.2.2-historico/evidence/regression/offline.png |
| Adicionado | docs/0.2.2-historico/evidence/shell/TESTES-BASE-0.2.2.json |
| Adicionado | docs/0.2.2-historico/evidence/shell/chromium-a11y-axe.json |
| Adicionado | docs/0.2.2-historico/evidence/shell/chromium-aprender-axe.json |
| Adicionado | docs/0.2.2-historico/evidence/shell/chromium-aprender.png |
| Adicionado | docs/0.2.2-historico/evidence/shell/chromium-caderno.png |
| Adicionado | docs/0.2.2-historico/evidence/shell/chromium-dark-aprender-axe.json |
| Adicionado | docs/0.2.2-historico/evidence/shell/chromium-dark-caderno-axe.json |
| Adicionado | docs/0.2.2-historico/evidence/shell/chromium-dark-drawer-axe.json |
| Adicionado | docs/0.2.2-historico/evidence/shell/chromium-dark-tema-axe.json |
| Adicionado | docs/0.2.2-historico/evidence/shell/chromium-drawer-150-axe.json |
| Adicionado | docs/0.2.2-historico/evidence/shell/chromium-drawer.png |
| Adicionado | docs/0.2.2-historico/evidence/shell/chromium-inicio-axe.json |
| Adicionado | docs/0.2.2-historico/evidence/shell/chromium-inicio.png |
| Adicionado | docs/0.2.2-historico/evidence/shell/chromium-light-aprender-axe.json |
| Adicionado | docs/0.2.2-historico/evidence/shell/chromium-light-caderno-axe.json |
| Adicionado | docs/0.2.2-historico/evidence/shell/chromium-light-drawer-axe.json |
| Adicionado | docs/0.2.2-historico/evidence/shell/chromium-light-tema-axe.json |
| Adicionado | docs/0.2.2-historico/evidence/shell/chromium-mobile-aprender.png |
| Adicionado | docs/0.2.2-historico/evidence/shell/chromium-mobile-atividade-drawer-axe.json |
| Adicionado | docs/0.2.2-historico/evidence/shell/chromium-mobile-atividade-drawer.png |
| Adicionado | docs/0.2.2-historico/evidence/shell/chromium-mobile-atividade.png |
| Adicionado | docs/0.2.2-historico/evidence/shell/chromium-mobile-axe.json |
| Adicionado | docs/0.2.2-historico/evidence/shell/chromium-mobile-drawer.png |
| Adicionado | docs/0.2.2-historico/evidence/shell/chromium-mobile-inicio.png |
| Adicionado | docs/0.2.2-historico/evidence/shell/chromium-mobile-laboratorio.png |
| Adicionado | docs/0.2.2-historico/evidence/shell/chromium-mobile-professor-axe.json |
| Adicionado | docs/0.2.2-historico/evidence/shell/chromium-tema.png |
| Retirado desta posição | docs/ACEITE-BASE-0.2.1.md |
| Retirado desta posição | docs/ACEITE-BASE-0.2.2.md |
| Adicionado | docs/ACEITE-BASE-0.2.3.md |
| Modificado | docs/ARQUIVOS-ALTERADOS.md |
| Retirado desta posição | docs/BASE-ESTRUTURAL-0.2.0.md |
| Retirado desta posição | docs/BASE-ESTRUTURAL-0.2.1.md |
| Retirado desta posição | docs/BASE-ESTRUTURAL-0.2.2.md |
| Adicionado | docs/BASE-ESTRUTURAL-0.2.3.md |
| Adicionado | docs/CONFERENCIA-REFERENCIA-SIAB.md |
| Modificado | docs/CONTRATOS.md |
| Modificado | docs/CRIAR-DOMINIO.md |
| Modificado | docs/DIFERENCAS-RESIDUAIS.md |
| Modificado | docs/LIMITACOES-CONHECIDAS.md |
| Modificado | docs/PARIDADE-SHELL-SIAB.md |
| Retirado desta posição | docs/PARIDADE-SIAB.md |
| Modificado | docs/RELATORIO-REGRESSOES.md |
| Modificado | docs/RELATORIO-TESTES.md |
| Modificado | docs/evidence/AUDITORIA-NEUTRALIDADE.json |
| Adicionado | docs/evidence/CONFERENCIA-REFERENCIA-SIAB.json |
| Modificado | docs/evidence/INTEGRIDADE-ORIGENS.json |
| Modificado | docs/evidence/INVENTARIO-ARQUIVOS.json |
| Adicionado | docs/evidence/RUNTIME-INALTERADO-CORRECOES.json |
| Adicionado | docs/evidence/operational/OPERACAO-BASE-0.2.3.json |
| Adicionado | docs/evidence/operational/chromium-ajuda-contextual-axe.json |
| Adicionado | docs/evidence/operational/chromium-drawer-a11y-150-axe.json |
| Adicionado | docs/evidence/operational/chromium-drawer-normal.png |
| Adicionado | docs/evidence/operational/chromium-menu-atividade-axe.json |
| Adicionado | docs/evidence/operational/chromium-menu-atividade.png |
| Adicionado | docs/evidence/operational/chromium-mobile-header-acessibilidade.png |
| Adicionado | docs/evidence/operational/chromium-mobile-header-restrito-axe.json |
| Adicionado | docs/evidence/operational/chromium-mobile-menu-atividade.png |
| Retirado desta posição | docs/evidence/regression/REGRESSOES-BASE-0.2.2.json |
| Adicionado | docs/evidence/regression/REGRESSOES-BASE-0.2.3.json |
| Modificado | docs/evidence/regression/chromium-contraste-150.png |
| Modificado | docs/evidence/regression/chromium-inicio.png |
| Modificado | docs/evidence/regression/chromium-laboratorio.png |
| Modificado | docs/evidence/regression/chromium-missao.png |
| Modificado | docs/evidence/regression/chromium-mobile-inicio.png |
| Modificado | docs/evidence/regression/chromium-mobile-modulos.png |
| Modificado | docs/evidence/regression/chromium-mobile-professor.png |
| Modificado | docs/evidence/regression/chromium-professor.png |
| Modificado | docs/evidence/regression/chromium-relatorio-impressao.png |
| Modificado | docs/evidence/regression/chromium-relatorio.png |
| Modificado | docs/evidence/regression/chromium-sobre.png |
| Modificado | docs/evidence/regression/forced-colors.png |
| Modificado | docs/evidence/regression/offline.png |
| Retirado desta posição | docs/evidence/shell/TESTES-BASE-0.2.2.json |
| Adicionado | docs/evidence/shell/TESTES-BASE-0.2.3.json |
| Modificado | docs/evidence/shell/chromium-aprender.png |
| Modificado | docs/evidence/shell/chromium-caderno.png |
| Modificado | docs/evidence/shell/chromium-drawer.png |
| Modificado | docs/evidence/shell/chromium-inicio.png |
| Modificado | docs/evidence/shell/chromium-mobile-aprender.png |
| Modificado | docs/evidence/shell/chromium-mobile-atividade-drawer.png |
| Modificado | docs/evidence/shell/chromium-mobile-atividade.png |
| Modificado | docs/evidence/shell/chromium-mobile-drawer.png |
| Modificado | docs/evidence/shell/chromium-mobile-inicio.png |
| Modificado | docs/evidence/shell/chromium-mobile-laboratorio.png |
| Modificado | docs/evidence/shell/chromium-tema.png |
| Adicionado | docs/evidence/visual/CAPTURAS-BASE-0.2.3.json |
| Adicionado | docs/evidence/visual/chromium-acessibilidade-150-desktop-axe.json |
| Adicionado | docs/evidence/visual/chromium-acessibilidade-150-desktop.png |
| Adicionado | docs/evidence/visual/chromium-drawer-normal.png |
| Adicionado | docs/evidence/visual/chromium-menu-atividade.png |
| Adicionado | docs/evidence/visual/chromium-mobile-acessibilidade-150-320-axe.json |
| Adicionado | docs/evidence/visual/chromium-mobile-acessibilidade-150-320.png |
| Adicionado | docs/evidence/visual/chromium-mobile-acessibilidade-150-360-axe.json |
| Adicionado | docs/evidence/visual/chromium-mobile-acessibilidade-150-360.png |
| Adicionado | docs/evidence/visual/chromium-mobile-acessibilidade-150-390-axe.json |
| Adicionado | docs/evidence/visual/chromium-mobile-acessibilidade-150-390.png |
| Adicionado | docs/evidence/visual/chromium-mobile-acessibilidade-150-844-axe.json |
| Adicionado | docs/evidence/visual/chromium-mobile-acessibilidade-150-844.png |
| Modificado | domain/demo/bootstrap.js |
| Modificado | domain/demo/manual.js |
| Modificado | index.html |
| Modificado | js/a11y/preferencias.js |
| Modificado | js/core/namespace.js |
| Modificado | js/experience/experience.js |
| Modificado | js/experience/shell.js |
| Modificado | js/navigation/router.js |
| Modificado | manifest.webmanifest |
| Modificado | package-lock.json |
| Modificado | package.json |
| Modificado | scripts/audit-runtime.py |
| Modificado | scripts/sw-template.js |
| Modificado | sw.js |
| Retirado desta posição | tests/base022.cjs |
| Adicionado | tests/base023.cjs |
| Adicionado | tests/capturas023.cjs |
| Adicionado | tests/operational023.cjs |
| Adicionado | tests/origem-0.2.2/base022.cjs |
| Adicionado | tests/origem-0.2.2/browser.cjs |
| Adicionado | tests/origem-0.2.2/regressions022.cjs |
| Retirado desta posição | tests/regressions022.cjs |
| Adicionado | tests/regressions023.cjs |

Hashes por arquivo: evidence/INVENTARIO-ARQUIVOS.json, excluindo seu próprio arquivo para evitar autorreferência. SHA-512 do ZIP no checksum externo.

## Revisão documental 0.2.3 — Correções

Sem mudança de runtime, testes ou capturas. Documentos/metadados corrigidos nesta revisão:

- BUILD-INFO.json
- CHANGELOG.md
- README.md
- docs/ACEITE-BASE-0.2.3.md
- docs/BASE-ESTRUTURAL-0.2.3.md
- docs/CONFERENCIA-REFERENCIA-SIAB.md
- docs/DIFERENCAS-RESIDUAIS.md
- docs/LIMITACOES-CONHECIDAS.md
- docs/PARIDADE-SHELL-SIAB.md
- docs/RELATORIO-REGRESSOES.md
- docs/RELATORIO-TESTES.md
- docs/evidence/CONFERENCIA-REFERENCIA-SIAB.json
- docs/evidence/INTEGRIDADE-ORIGENS.json
- docs/evidence/RUNTIME-INALTERADO-CORRECOES.json
- docs/ARQUIVOS-ALTERADOS.md
- docs/evidence/INVENTARIO-ARQUIVOS.json (recalculado)
