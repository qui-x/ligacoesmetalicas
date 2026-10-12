# SILM 0.6.0 — Modelo Eletrônico e Elétrons Deslocalizados

**Origem executável:** SILM 0.5.0 (`entregas/SILM-0.5.0.zip`, SHA-512 `e55d962314bd39be18b0ae4f76d6ee8a57a07739015076332a99ee8738d4fcf6b59ffebbb0cdbdc52c9b85c52019959f8f85654eeaf0923fca11ec0cf5cedc10`), sem build intermediária. A regra de parada do prompt (§157: aguardar homologação antes da 0.7.x) foi dispensada pelo autor, que pediu a execução contínua das séries até a 0.17.x. Cada versão é entregue e congelada separadamente.

## Critério de aceite (§155)

> O SILM representa de forma didaticamente coerente os elétrons de valência como uma distribuição coletiva deslocalizada pela estrutura metálica, sem duplicá-los em órbitas atômicas individuais, sem tratá-los como pares localizados entre centros metálicos e sem confundir mobilidade eletrônica qualitativa com corrente elétrica.

## O que esta versão implementa

1. **Modelo eletrônico formal** no `scientificState` (schema 5): `electrons` deixa de ser sempre `null` e passa a ser um `delocalized-electron-model` qualitativo, ligado ao metal e à estrutura. Ver [`MODELO-ELETRONICO.md`](MODELO-ELETRONICO.md).
2. **Valência como origem conceitual:** o modelo registra as fontes da convenção de valência e da configuração eletrônica do banco. Não há contagem por grupo nem contagem visual literal.
3. **Transição átomo isolado → estrutura:** esquema conceitual em Ver e transição curta ao adicionar unidade com elétrons visíveis. A transição é omitida com movimento reduzido.
4. **Representação coletiva** num canvas único, com 24 a 150 marcadores (até 80 em telas pequenas), sobre montagem livre, célula e rede extensa. O contorno da célula não é parede.
5. **Movimento qualitativo** por passeio aleatório isotrópico: sem direção predominante, sem órbitas, sem setas e sem corrente.
6. **Mostrar/Ocultar elétrons** e **Movimento eletrônico** (alternância), na barra do Modelo eletrônico e em Montagem → Estrutura. Ocultar muda só `representation.visible`.
7. **Persistência e reload:** o modelo e a configuração são restaurados; as posições dos marcadores não são estado. Migração 4 → 5 sem perda.
8. **Movimento reduzido** (do sistema ou da Acessibilidade do SILM): representação estática equivalente, sem laço de animação. A aba oculta pausa o laço.
9. **Acessibilidade:** marcadores fora da ordem de tabulação e da árvore acessível; estado legível ("Elétrons visíveis · movimento visual ativo" ou "representação estática"); descrição no rótulo da cena; contorno de contraste além do ciano; alto contraste e modos de visão de cores verificados.
10. **Limitações explícitas** na interface, no Manual, no relatório e em [`LIMITACOES-MODELO-ELETRONICO.md`](LIMITACOES-MODELO-ELETRONICO.md).

## Decisões registradas

1. **Ativar ≠ mostrar.** A primeira vez que se usa Mostrar elétrons em Explorar, o modelo é criado. Depois disso, ocultar e mostrar só alteram a representação. Medir e Calcular podem mostrar e ocultar, mas não ativam o modelo (§97–99).
2. **Mínimo de duas unidades.** Uma unidade isolada não forma uma distribuição coletiva. Se Desfazer ou Voltar à montagem livre deixar menos de duas unidades, o modelo é removido com aviso no Histórico e na cena.
3. **`particles` fora do estado.** O exemplo do prompt (§18) lista `particles`, mas §78 a §81 definem que as posições não são estado científico. O contrato guarda só o modelo e a configuração, e o validador recusa `particles` e `electronCountReal` (§104).
4. **Mesma regra para CCC, CFC e HC** (§72–73): a região acompanha os centros desenhados, sem comportamento eletrônico próprio de cada estrutura.
5. **Distribuição estática determinística:** para a mesma estrutura, a imagem estática é sempre a mesma (gerador com semente), o que facilita a comparação em sala e em capturas.
6. **Layout em coluna lateral (melhoria da cena):** em contêineres com 900 px ou mais, as informações da cena (estado, legenda, instruções, mensagens) ficam numa coluna à direita, e a cena usa toda a altura disponível. Motivo: a barra de elétrons reduziria a cena abaixo do mínimo com texto em 150%. No celular, o estado textual da barra fica disponível só para leitor de tela, e a barra cabe numa linha.
7. **Sem rótulo de carga:** o caráter positivo dos centros é indicado por um anel interno discreto, explicado na legenda. Não há `Cu⁺` nem `δ+` (§75–76).

## Fronteira com a 0.7.x (não implementado)

Corrente, diferença de potencial, circuito, bateria, campo aplicado, condutividade, resistividade, temperatura dinâmica, condução térmica, maleabilidade, ductilidade, brilho e deformação. O teste 0.6-MOD confere que não há controles desse tipo.

## Revisão

A revisão foi feita contra o checklist §156 ([`checklists/CHECKLIST-0.6.0.md`](checklists/CHECKLIST-0.6.0.md)), com a suíte de navegador completa (regressão 0.4 e 0.5 incluída) e com a inspeção das capturas. A primeira execução revelou três problemas de modelo e representação, já corrigidos:

- **Marcadores lentos demais:** pareciam tremer em torno de um centro. A velocidade e a persistência de direção foram aumentadas, e o teste 0.6-112 passou a exigir a visita a vários centros.
- **Distribuição estática acumulada em torno da primeira unidade:** a distribuição era herdada da montagem em construção. Agora é refeita quando a estrutura muda.
- **Cena pequena demais em 320/360 px e com texto em 150%:** resolvido pela decisão 6.

## Documentos

- [Modelo eletrônico](MODELO-ELETRONICO.md) · [Limitações do modelo eletrônico](LIMITACOES-MODELO-ELETRONICO.md)
- [Estado científico (schema 5)](SCIENTIFIC-STATE.md) · [Arquitetura científica](ARQUITETURA-CIENTIFICA.md) · [Roadmap](ROADMAP-SILM.md)
- [Relatório de build e testes](RELATORIO-BUILD-TESTES-0.6.0.md) · [Checklist](checklists/CHECKLIST-0.6.0.md)
