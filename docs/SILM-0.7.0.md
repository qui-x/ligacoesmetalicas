# SILM 0.7.0 — Propriedades Metálicas

**Origem executável:** SILM 0.6.0 (`entregas/SILM-0.6.0.zip`, SHA-512 `f6f56fe8a894e041330f5ad0aecd350171266d3759a09b968fe128f83035d0c737b532f2ea524d8e9f790f80485fa55b50cca9bae6ee1a2d3bb97e2bb6411e66`), sem build intermediária. A regra de parada (§194) foi dispensada pelo autor, que pediu a execução contínua das séries até a 0.17.x. Cada versão é entregue e congelada separadamente.

## Critério de aceite (§192)

> O SILM permite investigar qualitativamente propriedades metálicas relacionando estrutura e modelo eletrônico a comportamentos observáveis, distingue claramente representações didáticas de dados tabelados e não atribui mecanicamente a todos os metais comportamentos que não estejam cientificamente homologados.

## O que esta versão implementa

1. **Cinco experiências qualitativas**, cada uma com ação própria e uma ativa por vez:
   - condutividade elétrica: aplicar campo elétrico;
   - condutividade térmica: aquecer região e propagação em etapas;
   - maleabilidade: compressão até a lâmina;
   - ductilidade: tração até o fio;
   - brilho metálico: incidir luz.

   Ver [`PROPRIEDADES-METALICAS.md`](PROPRIEDADES-METALICAS.md).
2. **Elegibilidade por propriedade**, calculada do banco para cada metal (`available`, `qualitative` ou `unavailable`, com motivo), com cobertura gerada em [`COBERTURA-METAIS.md`](COBERTURA-METAIS.md):
   - 43 metais com a experiência elétrica;
   - 34 com as experiências de rede;
   - Mn, Sn e outros sem visualização cristalina ficam só com a elétrica;
   - Hg fica sem fase sólida de referência.
3. **Estado das experiências no mesmo `scientificState`** (schema 6, `properties`), com migração 5 → 6 sem perda. As experiências não alteram estrutura, cristalografia nem elétrons. Ver [`CONTRATO-PROPRIEDADES.md`](CONTRATO-PROPRIEDADES.md).
4. **Restaurar** (estado-base da experiência) e **Encerrar experiência**, sem resetar a investigação nem trocar o metal. Os resets gerais (limpar, resetar, encerrar, trocar de metal) limpam as propriedades.
5. **Interface:**
   - Montagem → Propriedades: lista com motivos e, com uma experiência ativa, somente os controles dela;
   - barra da experiência ao lado da cena (desktop e tablet);
   - Ver → Observar → Propriedades: O que você alterou, O que aconteceu, Como interpretar; natureza dos dados, condição e limitação;
   - Dados → Tabela, Histórico, relatório e tópico "Propriedades metálicas" no Manual.
6. **Acessibilidade:**
   - estado textual para cada experiência (também no rótulo da cena);
   - níveis térmicos pela quantidade de anéis, não só pela cor;
   - setas com rótulo;
   - movimento reduzido com equivalente estático;
   - teclado, 150%, alto contraste e visão de cores verificados.
7. **Desempenho:** um único laço contínuo (o da camada eletrônica). A propagação térmica usa um temporizador limpo na troca de vista e pausado com a aba oculta.

## Decisões registradas

1. **Dados de propriedades não homologados nesta versão.** O banco recebido tem `properties: {}` para todos os elementos. Este ambiente não teve acesso às fontes primárias (a rede bloqueou as consultas), e o SILM não registra valores de memória nem "valores típicos" (§87, §139). Por isso a 0.7.0 entrega as experiências qualitativas completas e declara a lacuna (`PROPERTY_DATA_MISSING`). O contrato, o validador e a classificação (inclusive σ = 1/ρ como calculado) já estão prontos para a curadoria. Ela pode ser feita quando o autor fornecer ou autorizar a consulta das fontes; a proposta é fazê-la na série 0.17.x (validação científica), ou antes, como correção de dados.
2. **Mercúrio.** O banco não registra a fase do Hg com fonte. O motivo usado é `REFERENCE_PHASE_UNSUPPORTED`: não há fase sólida de referência homologada. Isso impede deformação de sólido sem afirmar que o Hg não é metal. A regra `LIQUID_AT_REFERENCE_CONDITION` está implementada e testada; ela vale assim que o dado `phaseAtReference` for homologado.
3. **Ductilidade vertical.** Na primeira versão, o fio horizontal tinha, na projeção, quase a mesma silhueta da lâmina. O §69 proíbe "a mesma animação com outro rótulo", então a tração passou para o eixo vertical: a lâmina fica larga e baixa, e o fio alto e fino. As setas têm rótulo.
4. **Experiências de rede exigem a estrutura cristalina; a elétrica, não** (§84–85).
5. **Mesmas regras para CCC, CFC e HC** (§81). A intensidade do campo não varia com a condutividade (§37).
6. **Reload retoma a experiência** (parâmetros persistidos) e recalcula a geometria. Não se salvam quadros (§107–108).
7. **Mobile:** os controles ficam em Montagem → Propriedades (folha inferior), e a cena fica livre (§109–111). As etapas são botões; não há gestos de dois dedos (§113).

## Revisão

A revisão foi feita contra o checklist §193 ([`checklists/CHECKLIST-0.7.0.md`](checklists/CHECKLIST-0.7.0.md)), com a suíte completa de navegador e a inspeção das capturas de cada experiência. Corrigido durante a revisão:

- anéis térmicos que se fundiam num halo único;
- propagação térmica rápida demais;
- feixe de luz rente à borda;
- silhuetas parecidas de lâmina e fio (decisão 3).
- abas da Montagem quebrando palavras no celular, com cinco abas: os rótulos ficam inteiros e as abas passam para uma segunda linha;
- excesso transitório de marcadores eletrônicos antes de a cena ter tamanho conhecido: a densidade-alvo agora vale de imediato.

Testes de regressão atualizados porque o escopo da série mudou (o invariante de cada um foi mantido):

- 0.4-124: a ponta das setas da sobreposição passou de `path` para `polygon`. O teste antigo segue igual e continua garantindo que não há linhas M—M.
- 0.5-PAR: as abas de paridade (Resumo, Metal, Estrutura … Módulo) continuam na mesma ordem, e a 0.7 insere Propriedades antes de Módulo (§21).
- 0.6-109: a migração da 0.5 agora chega ao schema vigente.
- 0.6-MOD: a fronteira da 0.6 ("nenhum Aplicar") deu lugar à fronteira que continua valendo: sem voltagem, circuito ou instrumentos.

Itens reexecutados depois de correção aparecem no relatório de testes. O executor mescla os resultados.

## Documentos

- [Propriedades metálicas](PROPRIEDADES-METALICAS.md) · [Contrato das propriedades](CONTRATO-PROPRIEDADES.md) · [Fontes e proveniência](FONTES-E-PROVENIENCIA.md) · [Cobertura dos metais](COBERTURA-METAIS.md)
- [Estado científico (schema 6)](SCIENTIFIC-STATE.md) · [Arquitetura científica](ARQUITETURA-CIENTIFICA.md) · [Roadmap](ROADMAP-SILM.md)
- [Relatório de build e testes](RELATORIO-BUILD-TESTES-0.7.0.md) · [Checklist](checklists/CHECKLIST-0.7.0.md)
