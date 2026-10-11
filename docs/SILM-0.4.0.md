# SILM 0.4.0 — Formação e Montagem da Estrutura Metálica

**Série:** 0.4.x · **Origem executável:** SILM 0.3.0 · **Schema científico:** 3 · **Modelo da estrutura:** 1

## Critério de aceite

> O SILM permite construir manualmente uma montagem metálica persistente e acessível, formada por múltiplas unidades do metal selecionado, sem representar a ligação como pares isolados e sem antecipar a geometria cristalográfica das séries seguintes.

## O que esta versão implementa

| Responsabilidade da série 0.4.x | Onde |
|---|---|
| Estrutura metálica como objeto científico persistente | `scientificState.structure` (`domain/silm/state.js`) |
| Criação da montagem (**Iniciar montagem**) | viewport e painel Elementos |
| Unidades metálicas do metal ativo | `structure.units[]`, sem elemento próprio |
| Adição manual (**+ Adicionar unidade**) | barra da área de montagem e painel Elementos |
| Movimentação e posicionamento | arrasto (Pointer Events), toque/clique no destino, setas |
| Assistência de posicionamento | `SILM.assembly.resolve` (`domain/silm/assembly.js`) |
| Prevenção de sobreposição | espaçamento mínimo do contrato da cena |
| Formação coletiva | uma única montagem; destaque coletivo por região, sem linhas |
| Seleção de unidade | clique, toque, Enter/Espaço; uma por vez |
| Desfazer | adição e movimento; histórico operacional de 30 ações |
| Limpar estrutura | `structure → null`, mantendo investigação, metal e módulo |
| Reset integrado | reset da investigação remove a montagem e preserva o metal |
| Persistência e retomada | storage da Base; reload, troca de tela e offline |
| Renderização 2D inicial | `domain/silm/assembly-view.js` e `assembly.css` |
| Integração ao scientificState | serviço único; Roteiros e Missões usarão o mesmo contrato |

## Decisões registradas

1. **Cena quadrada normalizada.** Posições `x` e `y` entre 0 e 1, com área segura de 0,06 em cada borda. A cena se adapta ao espaço disponível sem distorção, e o estado não guarda pixels.
2. **Unidade sem elemento próprio.** A identidade química de toda unidade é `scientificState.metal`. Por isso é impossível representar mistura ou liga; o validador recusa unidades com `atomicNumber`, `symbol`, `element` ou `metal`.
3. **Assistência sem rede cristalina.** A unidade nova aparece perto do conjunto, numa espiral de ângulo áureo, que não tem periodicidade. O ajuste de destino ocupado procura o ponto livre mais próximo. Nenhum dos dois gera CCC, CFC, HC, hexágonos ou cubos.
4. **Medir e Calcular mostram a montagem sem editá-la.** Explorar é o módulo de construção nesta etapa. Trocar de módulo nunca apaga a estrutura.
5. **Desfazer não é persistido.** Após recarregar, o histórico começa vazio; o estado científico final é restaurado integralmente. O histórico não entra no relatório.
6. **Uma escrita por gesto.** Durante o arrasto e as repetições de seta, a posição muda só na interface. O estado é gravado ao soltar o ponteiro ou a tecla, e as repetições do mesmo gesto viram uma única ação desfazível.
7. **Remoção individual não é mecânica central.** A ação principal é **Limpar estrutura**, com confirmação quando há unidades. A adição pode ser desfeita.
8. **Concluir montagem** é uma marcação do usuário (status `assembled`), disponível com duas ou mais unidades. Não é um estado cristalográfico, e qualquer edição devolve a montagem a `assembling`.

## Correção de origem 0.3.x — retomada direta

Ao abrir ou recarregar, o motor de atividades da Base exibia **Retomar sessão?** também para o Laboratório Livre. Nos dois botões a investigação continuava a mesma, contrariando a regra da 0.3.0: uma investigação válida é retomada diretamente (0.3.0, §52–53).

A Base agora aceita a opção de domínio `session.resumeFree: 'direct'`. O SILM a ativa, e a sessão livre é retomada sem diálogo e sem mudar a tela aberta. Roteiros, Missões e atividades do Professor continuam perguntando. A alteração em `js/experience/activity.js` é a única mudança no núcleo herdado e está declarada na auditoria.

## Convenções adotadas do SIAB 1.0.0

O contrato do SILM (prompt mestre, §48) manda reutilizar o comportamento estrutural quando há equivalente no SIAB. Por isso a montagem segue:

- **↶ Desfazer** com nome acessível "Desfazer última ação", dica "Desfazer: <ação>" ou "Nada para desfazer" e anúncio "Desfeito: <ação>.";
- mensagens de ação que terminam com "Use Desfazer para voltar.";
- ação principal com glifo **+** (como "+ Tubo com água");
- rótulo de contexto **MÓDULO · EXPLORAR** e link de ajuda **?** para o tópico do Manual.

A comparação completa e o plano de alinhamento da família estão em [`PARIDADE-SIAB-1.0.0.md`](PARIDADE-SIAB-1.0.0.md).

## Fora do escopo (séries seguintes)

CCC, CFC, HC, célula unitária, coordenação, vizinhos, parâmetro de rede, distâncias reais, elétrons, mar eletrônico, condução, maleabilidade, ductilidade, brilho, medidas, cálculos e 3D científico. A 0.4.0 prepara o estado: `referenceStructureId` existe e permanece `null`, e as unidades guardam posições que a 0.5.x poderá migrar.

## Limitações do modelo

- A montagem livre da série 0.4.x é uma representação didática de construção coletiva e não representa ainda a geometria cristalográfica real do metal.
- As distâncias visuais não correspondem ainda a distâncias interatômicas reais.
- A assistência de posicionamento é um mecanismo de interface e não uma simulação de forças interatômicas.

## Origem e lacunas do pacote recebido

| Item | Valor |
|---|---|
| SHA-512 declarado para `SILM-0.3.0.zip` (prompt 0.4.x) | `8378edfad55cc912fdfd55d83eb623292ca6dba10ae3d3e7e69b1dd02b93cdc936190703f4afe70a609038a4fe73c23c21a8138fda8cf86ac54d98eb20db97a2` |
| SHA-512 do arquivo recebido (`SILM.zip`) | `8c1422de85b0e6da41d3e75c6e3197104c2cc9a214a00ecf5f0e2af2b2b71dc7bdebf66215e2710b19047efa12ae787e66a13262bbb54b6045ee9d654a19c7c2` |

Os hashes diferem. O pacote recebido não contém as pastas `docs/` e `tests/` citadas no README da 0.3.0, e o `SHA512SUMS.txt` dele ainda era o da 0.2.1. O código executável parece íntegro: 139 arquivos coincidem com esse manifesto, e os 16 que diferem são arquivos de versão e do domínio compatíveis com as mudanças descritas no CHANGELOG da 0.3.0.

Por isso, nesta versão:

- `docs/SCIENTIFIC-STATE.md`, `ARQUITETURA-CIENTIFICA.md`, `ROADMAP-SILM.md`, `CONTRATO-VERSIONAMENTO.md` e `INVESTIGACAO.md` foram **reconstruídos** a partir dos prompts e do código;
- `tests/scientific-data.cjs` foi reescrito;
- a evidência de preservação do núcleo (`docs/evidence/NUCLEO-PRESERVADO.json`) foi refeita com os hashes da 0.3.0 recebida.

Os demais documentos históricos (0.1.1 a 0.3.0) não foram recriados, para não fabricar registros.

## Arquivos

**Novos:** `domain/silm/assembly.js`, `domain/silm/assembly-view.js`, `domain/silm/assembly.css`, `tests/support.cjs`, `tests/scientific-data.cjs`, `tests/silm040.cjs`, documentos desta pasta e `docs/evidence-0.4.0/`.

**Alterados:** `domain/silm/state.js`, `domain/silm/bootstrap.js`, `domain/silm/manual.js`, `index.html`, `js/experience/activity.js` (correção de origem 0.3.x), `scripts/validate-scientific-state.cjs`, `scripts/sw-template.js`, `scripts/audit-silm.py`, `sw.js`, `VERSION`, `package.json`, `package-lock.json`, `BUILD-INFO.json`, `CHANGELOG.md`, `README.md`, `SHA512SUMS.txt`.

Resultados dos testes: [`RELATORIO-BUILD-TESTES-0.4.0.md`](RELATORIO-BUILD-TESTES-0.4.0.md).
