# Evidências — Etapa 1, Início (HOME)

**Referência:** SIAB 1.0.0, `qui-x/acidobase`, branch `acidosebases1.0.0`, commit `73848f0`, tela `data-tela="inicio"`.
**Alvo:** SILM 0.15.5, tela `data-view="inicio"` (fonte em `integracao/index.html`).

## Capturas

As capturas foram feitas com `node scripts/parity-capture.cjs HOME '#/inicio' '#/inicio' --siab <pasta do SIAB>`. Nos dois programas: mesmo tamanho, movimento reduzido e abertura desligada.

| Tamanho | SIAB | SILM |
|---|---|---|
| 1366×768 | `siab-1366x768.jpg` | `silm-1366x768.jpg` |
| 1024×768 | `siab-1024x768.jpg` | `silm-1024x768.jpg` |
| 390×844 | `siab-390x844.jpg` | `silm-390x844.jpg` |
| 320×640 | `siab-320x640.jpg` | `silm-320x640.jpg` |
| 844×390 (paisagem) | `siab-844x390.jpg` | `silm-844x390.jpg` |

`capturas.json` registra a rolagem lateral e os erros de página de cada captura: zero em todas.

## Elementos comparados

| SIAB | SILM antes | SILM agora |
|---|---|---|
| Sobretítulo com o nome completo ("SIMULADOR INTERATIVO DE ÁCIDOS E BASES") | "SILM · A ARQUITETURA DOS METAIS" | "SIMULADOR INTERATIVO DE LIGAÇÕES METÁLICAS" |
| Título curto, com a segunda parte em destaque ("A química *das cores*") | "Ligações Metálicas. *Uma investigação coletiva.*" (5 linhas em 320 px) | "A arquitetura *dos metais*", frase que já era do sobretítulo do autor (2 linhas em 320 px) |
| Lema em quatro verbos | "Monte. Observe. Meça. Calcule." | Mantido |
| Símbolo institucional decorativo | Símbolo do SILM | Mantido, sem link (plano §9) |
| "Escolha seu próximo passo" + "Da curiosidade à descoberta" | Igual | Mantido |
| Cartão em destaque (Laboratório): ícone à esquerda, etiqueta à direita, convite, título, descrição, faixa de cores e botão "Entrar no laboratório →" | Etiqueta colada ao ícone; botão "Abrir oficina" | Etiqueta à direita; botão "Entrar na oficina →" |
| 4 cartões secundários: ícone desenhado à esquerda, seta à direita, contagem em peso normal | Ícones em caracteres (▤ ◇ ☷ ▧), seta "↗" colada ao ícone, contagem em negrito | Ícones desenhados (os mesmos do menu lateral), seta "→" à direita, contagem em peso normal |
| Contagens vivas e Caderno com 0, 1 ou mais registros | Já dinâmicas | Mantidas; o resumo da investigação passou a concordar no singular ("1 unidade salva") |
| Rodapé: Manual de uso, Área do Professor, Configurações de inicialização | Manual de uso, Área do Professor, Preferências | Mantido (o plano manda conservar Preferências) |
| Botão "Acessibilidade" do cabeçalho com contorno e fundo transparente | Fundo cinza padrão do navegador (parecia desativado) | Contorno e fundo transparente |
| Recuo acima do hero: 34 px (16 px até 900 px) | 79 px (55 do `main` + 24) | 34 px / 16 px |
| Foco: na abertura fica no documento; ao trocar de tela, rola ao topo e vai ao título | O título recebia o foco já na abertura e a página não voltava ao topo | Igual ao SIAB |
| Marca do cabeçalho sempre leva ao Início | Durante uma atividade levava à atividade, embora o nome acessível seja "SILM, início" | Sempre leva ao Início |

## Extensões do SILM preservadas (HOME-07)

- **Retomada da atividade.** Antes, ela nunca aparecia: durante uma missão ou roteiro, o Início redirecionava para a atividade.
  - Agora o Início faz parte das telas permitidas na atividade, junto com a Oficina, a própria atividade, os relatórios e o Manual. O cartão "Atividade em andamento" aparece com "Retomar atividade" e "Voltar à oficina".
  - As outras telas continuam voltando para a atividade. Agora isso vem com um aviso que explica o motivo.
- **Resumo da investigação.** Mostra o metal e as unidades salvas na Oficina.

## Diferenças de domínio e pendências (N/A)

- **N/A — contagens.** O SIAB tem 14 temas, 19 desafios e 35 investigações; o SILM tem 7, 6 e 5. A paridade é de comportamento, não de quantidade (plano §1).
- **N/A — botão "Configurações de inicialização" do rodapé do SIAB.** O plano manda manter Preferências. A escolha da tela inicial do SILM fica no menu lateral (Etapa 12).
- **Pendência da Etapa 12 (cabeçalho e navegação):**
  - o cabeçalho do SILM é 10 px mais alto;
  - há a pílula de versão;
  - a barra inferior do celular usa caracteres (⌂ ▤ ▣ ▧) no lugar de ícones desenhados;
  - o ícone da Oficina no menu lateral ainda é um tubo de ensaio.

## Testes

- `npm run test:parity` (`tests/parity/home.cjs`, TEST-HOME) confere:
  - a estrutura e a ordem nos 5 tamanhos;
  - seta e etiqueta à direita;
  - ícones desenhados;
  - alvos de 44 px no rodapé;
  - nenhum atalho para o clube;
  - nenhuma rolagem lateral;
  - contagens e concordância;
  - o Caderno com 0, 1 e 2 registros;
  - o resumo da investigação;
  - a retomada durante a missão e o retorno;
  - a marca levando ao Início;
  - o desvio das telas fora do contexto;
  - o destino dos 8 links;
  - o foco na abertura e na troca de tela;
  - a ordem do Tab.
- `tests/routes-browser.cjs` foi atualizado para o novo retorno: marca → Início → "Retomar atividade" → roteiro.
- As baterias gerais da etapa estão no registro de aceite do plano (seção 8).
