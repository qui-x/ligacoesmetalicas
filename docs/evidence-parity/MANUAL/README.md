# Evidências — Etapa 7, Manual (MANUAL)

**Referência:** SIAB 1.0.0 (`acidosebases1.0.0@73848f0`): `data-tela="manual"` (`js/telas/manual.js`, `js/data/manual.js`).
**Alvo:** SILM 0.15.5: `data-view="manual"` (`integracao/unified-ui.js` `manual()`, conteúdo em `domain/silm/manual.js`).

## Capturas

- **Início do Manual**, nos 5 tamanhos, com `node scripts/parity-capture.cjs MANUAL '#/manual' '#/manual' --siab <SIAB>`.
- **Tópico** (`silm-topico-*`, "Medir") e **busca** (`silm-busca-*`, "caderno"), em 1366×768 e 390×844.

Zero rolagem lateral e zero erros de página.

## Elementos comparados

| SIAB | SILM antes | SILM agora |
|---|---|---|
| Barra: busca rotulada com "Buscar", "Voltar à bancada" e "Imprimir guia rápido" | "Manual do SILM" e um campo de busca com o fundo cinza padrão do navegador | Barra: "Buscar no Manual" com "Buscar", "Voltar à oficina" e "Imprimir guia rápido" (no tópico, "Imprimir tópico") |
| Apresentação: "MANUAL DO USUÁRIO", "Encontre seu próximo passo.", frase e "Começar a usar" | — | Igual, adaptado ("Uma dúvida na Oficina?…"); "Começar a usar" abre "Conheça a Oficina dos Metais" |
| "QUERO SABER" com três atalhos | — | "Como escolher um metal", "Como medir o parâmetro de rede", "Por que uma opção não aparece" |
| Grupos de categorias ("Investigue", "Prepare e registre", "Orientação", "Para ensinar") | 21 sanfonas sem agrupamento, filtradas enquanto se digita | Os mesmos quatro grupos, com os 23 tópicos em cartões "Consultar →" |
| Tópico: caminho de navegação, título, resumo, conteúdo, detalhes recolhíveis, "Veja também", fontes, voltar | O tópico se abria dentro da sanfona | Página própria (`#/manual?topico=<id>`): caminho "Manual / grupo / tópico", sobretítulo, título com foco, resumo, conteúdo, "Passo a passo", "Saiba mais" recolhível, "Veja também" e "Voltar ao Manual" |
| Resultados da busca e vazio | Filtro das sanfonas | "BUSCA NO MANUAL", "Resultados para “…”" ou "Nenhum resultado para “…”" com sugestão, lista e "Limpar busca" (`#/manual?busca=<termo>`) |
| Impressão do tópico e do guia rápido | — | "Imprimir tópico" imprime o artigo sem a barra; "Imprimir guia rápido" imprime todos os tópicos (título, resumo e passos) |

## Conteúdo (MANUAL-CONTENT)

- **Novos tópicos**, que documentam só comportamentos já existentes:
  - "Usar o Caderno": tipos, filtro, CSV, impressão, backup JSON e registros automáticos;
  - "Por que uma opção não aparece": módulo, estrutura cristalina, metal sem estrutura disponível, atividade em andamento e deformação aplicada, com os mesmos motivos que a interface mostra.
- **Marcadores removidos:** saíram os três detalhes "Documentação provisória" (MANUAL-CONTENT-12).
- **Cobertura:** os 23 tópicos cobrem a Oficina, metais, montagem, estruturas (com os metais sem visualização explicados), elétrons, propriedades, Explorar/Medir/Calcular, vista 2D/3D, atividades, Caderno, relatórios, Professor, acessibilidade, abertura, instalação offline e reinício.
- **Pendências:** Tour e Montagens prontas ganham tópico quando existirem (Etapas 9 e 10). Projetor e PWA têm tópicos parciais ("Instalação e uso offline"), a revisar na Etapa 12.

## Diferenças de domínio (N/A)

- **N/A — quantidade.** O SIAB tem 13 categorias e 52 tópicos. O SILM agrupa seus 23 tópicos nos mesmos quatro grupos, sem inventar conteúdo.
- **Pendência da Etapa 10 — "Iniciar tour da bancada" e ilustração das docas.** Entram com o tour.
- **N/A — índice lateral recolhível.** Os grupos do início fazem esse papel; cada tópico tem caminho de navegação e "Voltar ao Manual".

## Testes

`npm run test:parity` executa `tests/parity/manual.cjs` (TEST-MANUAL). O teste confere:

- o início nos 5 tamanhos: título, busca rotulada com "Buscar" visível, 3 atalhos, 4 grupos, todos os tópicos uma vez, 44 px, sem rolagem lateral;
- o tópico com caminho, foco no título, "Imprimir tópico" e "Veja também" válido;
- a impressão sem a barra;
- "Voltar ao Manual" e o Voltar do navegador;
- a busca com resultado e sem resultado, e "Limpar busca";
- o alias (`zoom` → vista);
- o endereço antigo (`#/manual/calcular`);
- o tópico inexistente;
- a ajuda contextual do painel Ver.
