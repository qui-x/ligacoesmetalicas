# Base Estrutural 0.2.2

## Escopo

Esta rodada parte da Base Executável 0.2.1 congelada e trata somente shell, navegação, hierarquia, acessibilidade estrutural e integração neutra. Não inicia SILM, rebase, mecânicas de metais ou Base 0.3.

## Decisões de shell

- O header contém hamburger à esquerda da marca, navegação desktop registrada, ações do domínio e Acessibilidade. O Manual aparece na navegação; seu botão legado permanece oculto para compatibilidade.
- O banner de atividade fica imediatamente depois do header e antes de `main`.
- A gaveta é um `dialog` fixado à esquerda, com largura `min(360px,88vw)`, foco retornável, Escape, trap, clique fora e safe areas. Suas seções são Atividade em andamento, Agora, Navegar, Recursos, Professor, Preferências e Aplicativo; as seções condicionais aparecem somente quando disponíveis.
- A navegação desktop e a bottom navigation móvel são projeções de registros do domínio. O estado ativo usa `aria-current`; destinos ausentes ficam desabilitados sem serem ocultados silenciosamente.
- `--header-h`, `--activity-h`, `--bottom-h` e as alturas da barra e dos launchers são medidos por um `ResizeObserver` estrutural compartilhado, evitando que o workspace seja coberto. Em paisagem curta, o rótulo da barra é ocultado e os launchers permanecem acessíveis.
- A preferência `simcore_core_v1_startup` escolhe a tela inicial; entradas inválidas ou ausentes caem em Início. `simcore_core_v1_projector` mantém o Modo Projetor estrutural.

## Navegação e experiências

`SimCore.createExperience` agora compõe `createThemes` e `createNotebook`. O domínio registra:

- `home.primary` e `home.support` para hierarquia explícita;
- `themes[]` com `id`, `title`, `subtitle`, `description`, `icon`, `state` e `related`;
- `notebook` opcional com apenas contrato de disponibilidade/renderização;
- `navigation.desktop`, `navigation.mobile` e `shell.resources`;
- as rotas `aprender`, `tema/<id>` e, quando configurado, `caderno`.

O marcador de Tema grava apenas `learning.theme.<id>` no namespace do domínio. Não há pontos, ranking, progresso obrigatório ou gamificação.

## Referência e diferenças

`docs/PARIDADE-SHELL-SIAB.md` registra a matriz observada no SIAB congelado e as diferenças necessárias para manter os contratos neutros da Base. A Base usa a linguagem visual e a topologia da referência, mas não copia conteúdo de domínio.

## Preservação

Os artefatos de 0.2.1 permanecem em `docs/0.2.1-historico/`, `tests/origem-0.2.1/` quando aplicável e na pasta original externa. A cópia 0.2.2 não escreve nesses alvos.
