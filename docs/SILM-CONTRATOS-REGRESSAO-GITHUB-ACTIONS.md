# SILM — Contratos obrigatórios de regressão (09/11/2026)

## Objetivo
Evitar que cada atualização da interface (lente, navegação, responsividade, módulos) reintroduza falhas em mecânicas já homologadas. Não é possível provar ausência de todos os defeitos; o GitHub Actions passa a verificar uma **matriz permanente dos estados críticos** em todo PR para a `main` e todo commit publicado na `main`, sem filtro de caminhos.

## Testes automatizados
- `tests/run-cross-regressions.mjs`: **6 tamanhos de tela × 4 escalas × 2 modos** (48 verificações por navegador) em Chromium, Firefox e WebKit, mais cenário CSS adversarial (reintroduz temporariamente a antiga regra responsável pelo Foco sobreposto). Confere exclusão entre Foco/Visão geral, largura do gerenciamento, cartões e comandos alcançáveis, estado `aria-pressed`, barra científica de Rede/Centro, scroll global e preservação de metal, investigação, módulo, propriedades, eletrônica, medições e estrutura durante a alternância.
- **Painéis**: abre e fecha Montagem, Ver e Dados em celular e desktop e compara os estados científicos.
- `tests/interface-safety.test.mjs`: trava estática para regras CSS que ressuscitam Foco oculto, contrato de ocultação do shell e inclusão de arquivos essenciais no cache offline da PWA.
- **Testes científicos de Node**: `node --test tests/*.test.*` obrigatórios no job `Contratos científicos e interface`, mesmo em alterações de arquivos que anteriormente não disparavam o workflow da microestrutura.
- Mantém `run-periodic-responsive.mjs`, `run-four-scales-responsive.mjs` e `run-responsive-audit.mjs` nos três navegadores. Evidências e métricas em artefatos por engine.

## Portão único no GitHub Actions
O job estável **`Portão de regressões SILM`** depende da conclusão bem-sucedida do job científico e dos três navegadores. Uma falha reprova o workflow, com registro do motivo e artefatos de tela. Não usamos `continue-on-error`, `|| true` ou filtragem de caminhos para esses testes.

**Importante:** um check que falha no GitHub Actions só impede efetivamente o *merge* quando a `main` está protegida por uma branch protection/ruleset com o check obrigatório. O usuário/admin precisa configurar em **Settings → Rules → Rulesets** (ou Branch protection), selecionando `main` e **Require status checks to pass**, check **`Portão de regressões SILM`**. É recomendável também exigir PR antes de merge e desabilitar bypass para os colaboradores pertinentes. A API do GitHub não disponibilizou acesso de escrita à proteção de branch nesta integração, e a consulta a rulesets não retornou regras ativas na revisão de 09/11/2026.

## Política de atualização
1. Nova mecânica entra em branch e PR, com critérios de aceite específicos.
2. Regressão encontrada gera caso de teste permanente (preferencialmente com reprodução adversarial), não apenas CSS novo.
3. **O teste tem de falhar na versão defeituosa** e passar após a correção.
4. Revisar módulos compartilhados e contratos de estado antes de alterar a `main`.
5. Conferir publicação e cache PWA; uma mudança visual estrutural exige atualização do identificador `BUILD` em `sw.js`.
6. Capturas auxiliam a revisão humana, mas a automação mede dimensões e estados reais, não apenas compara screenshots por pixels.

## Limites
O contrato não substitui revisão científica de novos materiais, revisão de direitos dos dados, testes manuais de acessibilidade real, desempenho em hardware limitado ou validação de experiências novas ainda sem caso de teste. Ele deve ser expandido em cada novo marco.
