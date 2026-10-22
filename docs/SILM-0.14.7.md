# SILM 0.14.7 — Barra contextual e expansão da oficina

## Problema corrigido

Na versão 0.14.6, a região da estrutura recebia posicionamento fixo e uma camada de empilhamento acima dos controles vizinhos. Isso podia cobrir o cabeçalho científico e os botões usados para abrir os painéis contextuais.

## Novo comportamento

- A própria oficina (`#si-workspace`) é a camada em tela inteira, acima da barra global da plataforma.
- A barra global superior fica fora da área expandida, liberando a altura total do viewport.
- A barra da oficina — Foco, Visão geral e atalhos Montagem, Ver e Dados — permanece dentro da camada expandida e operável.
- A região da estrutura volta a ser um item flexível abaixo da barra contextual; a cena deixa de sobrepor controles que pertencem ao mesmo workspace.
- Os painéis contextuais abertos aparecem acima da estrutura e podem ser fechados normalmente.
- O botão Expandir/Recolher e a tecla `Escape` retornam ao layout normal sem recriar a investigação.

## Validação

Os testes foram atualizados para verificar que a oficina ocupa o viewport, que a cena começa abaixo da barra contextual e que os controles e painéis continuam acessíveis, inclusive em telas estreitas. A suíte de navegador ainda deve ser executada no CI para homologação.
