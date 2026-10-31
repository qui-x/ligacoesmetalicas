# Evidências — Etapa 12, Menu, preferências, projetor e aplicativo (SHELL)

**Referência:** SIAB 1.0.0 (`acidosebases1.0.0@73848f0`): `#app-drawer` (`js/ui/gaveta.js`), `#startup-dialog` (`js/init/integracao.js`), `#about-dialog`, `js/init/pwa.js`.
**Alvo:** SILM 0.15.5: `#sidebar` (`integracao/index.html`), `shell()` em `integracao/adapter.js`, `integracao/pwa.js`, Base SI 0.9.17 (`setupMenuReview`).

## Capturas

- **Menu aberto** nos 5 tamanhos (`*-menu-*`), com zero rolagem lateral e zero erros de página.
- **Acessibilidade** aberta pelo botão do cabeçalho (`*-acessibilidade-*`), em 1366×768 e 390×844.
- **Convite de inicialização** na primeira visita sem destino (`*-inicializacao-*`), em 1366×768 e 390×844.
- **Sobre** (`*-sobre-*`), em 1366×768 e 390×844.

Essas capturas não usam o `parity-capture.cjs`, porque cada uma exige abrir o Menu ou uma janela antes. Os detalhes de cada captura estão em `capturas.json`.

## O que foi encontrado

- **Recursos da Base retirados:** ao adaptar a Base SI, o SILM retirou do Menu itens que a Base já trazia prontos: "Relatório" no menu da atividade, "Área do Professor", "Animação de abertura" e "Tela inicial".
- **Manual descrevendo o que não existia:**
  - o tópico "Animação de abertura" mandava desligar uma opção que não existia e citava um botão "Pular abertura" que também não existia;
  - o tópico "professor" descrevia "Gerar atividade" e "Expandir em tela cheia", que não existem na versão atual.
- **Acessibilidade no cabeçalho:** o botão abria o grupo, mas o foco ia para o "Fechar" do Menu, com o grupo fora da vista.
- **Abertura:** a animação só obedecia à preferência do sistema para reduzir movimento; "Reduzir animações" do próprio SILM não a omitia.

## Elementos comparados

| SIAB | SILM antes | SILM agora |
|---|---|---|
| Cabeçalho de 57 px (56 no celular), sem versão | 66 px (58 no celular), com a etiqueta "v0.15.5" | 57 px (56 no celular), sem versão. A Oficina mantém a altura aceita na Etapa 5 |
| Barra inferior com ícones de linha | Símbolos de texto (⌂ ▤ ▣ ▧) | Ícones de linha; a Oficina usa o cubo do Início, também no Menu |
| "Agora" em cartão: tela, contexto ("Seu contexto atual"; bancada com o módulo; Manual com categoria › tópico) e "Continuar" | Sem cartão; o contexto repetia o título ("Início / Início"); botão com 41 px | Cartão com "Seu contexto atual", "Oficina livre · Explorar" (ou a atividade) e "Investigue › Medir…"; "Continuar na oficina" ou "Continuar nesta tela", com 44 px |
| Ações com contorno, destinos sem contorno | Tudo sem contorno; "Navegar" e "Acessibilidade" maiores | Mesmo critério do SIAB: "Navegar", "Ideias para uma aula acessível", "Tela inicial", "Instalar aplicativo" e "Sobre o SILM" com contorno |
| Atividade: Sobre, Ajuda, Relatório, Finalizar, Encerrar | Sem "Relatório"; Ajuda abria o Manual genérico | "Relatório" abre o relatório da atividade; Ajuda abre o tópico das atividades |
| Professor: Área do Professor, Apoio pedagógico, Ideias para uma aula acessível | Sem "Área do Professor"; Apoio abria o Manual genérico | Os três itens; Apoio e "Como apresentar à turma" abrem o tópico do Professor |
| Acessibilidade no cabeçalho abre o grupo, com foco no grupo | Grupo aberto, mas foco no "Fechar" | Foco no grupo, que fica no topo do Menu |
| Acessibilidade: "Animação de abertura" | Ausente | "Animação de abertura — Ao abrir ou recarregar", que vale na próxima visita. "Reduzir animações" também omite a abertura |
| Abertura: "Toque ou aperte uma tecla para pular" | Sem aviso | Mesmo aviso sobre a animação oficial, sem alterar o arquivo da animação |
| "Tela inicial": janela "Como deseja iniciar?", que também aparece na primeira visita, com "Redefinir preferência" e "Agora não". Também no rodapé do Início | Ausente | Mesma janela, com Página inicial ou Oficina dos Metais. Aparece na primeira visita sem destino, depois da abertura; não aparece durante uma atividade nem quando o endereço já indica uma tela. Também em "Configurações de inicialização" no rodapé do Início |
| "Sobre o SIAB" em janela: nome, frase, versão, licença, atalhos | Página `#/sobre` com uma frase | Janela com nome, frase, versão, licença (GPL v3, Base SI 0.9.17) e atalhos; a página `#/sobre` mostra o mesmo conteúdo |
| Modo projetor: texto em 19 px | Só escondia os destinos do cabeçalho e alargava a página | Texto em 19 px (multiplicado pelo tamanho de texto escolhido), além do que já fazia |
| "Instalar app" sempre que instalável; sem pedido do navegador, abre as instruções | Aparecia só depois do pedido do navegador | Igual ao SIAB: sem pedido do navegador, abre "Instalação e uso offline" no Manual |

## Itens do plano

- **MENU-01:** cabeçalho, abertura e fechamento, fundo escurecido, largura de 360 px, foco no "Fechar" e retorno do foco ao botão do Menu com Escape (TEST-SHELL nos 5 tamanhos).
- **MENU-02:** ordem Início → Aprender → Missões → Roteiros → Oficina → Caderno → Manual.
- **MENU-03:** "Agora" com contexto e "Continuar".
- **MENU-04:** "Relatório" e Ajuda no tópico certo. O menu da atividade respeita a navegação restrita das atividades (Etapas 3 e 4).
- **MENU-05:** `[~]` "Recursos" (Montagens prontas e Tour) entra com as Etapas 9 e 10. Hoje não há destino real, e o plano proíbe controle sem ação.
- **MENU-06:** "Área do Professor" no grupo Professor.
- **MENU-07:** destino ativo (`aria-current`), Escape e fechamento ao escolher um destino.
- **A11Y-01 a 04:** o painel da Base já tinha tema, contraste, texto, espaçamento, movimento, leitura simples, visão de cores e restaurar padrões; a Etapa 12 acrescentou "Animação de abertura". Som, vibração e Libras aparecem como indisponíveis, não como controles falsos.
- **A11Y-05:** acessibilidade direta pelo cabeçalho.
- **A11Y-06:** `npm run test:a11y` e revisão de foco e nomes acessíveis pelo TEST-SHELL.
- **APP-01:** projetor liga e desliga, fica salvo, amplia o texto e volta ao normal. Durante uma atividade, a Base não deixa mudar o projetor. O SIAB só bloqueia em atividade restrita, que o SILM ainda não tem (Etapa 11).
- **APP-02:** tela inicial, redefinição e primeira visita.
- **APP-03:** instalação e aviso de nova versão. O SILM avisa a nova versão como notificação; o SIAB põe também um botão "Recarregar".
- **APP-04:** Sobre, versão e atalhos para o Manual.
- **APP-05:** abertura opcional, que se pula com toque ou tecla e respeita "Reduzir animações".
- **APP-06:** aviso de armazenamento e conflito entre abas da Base, cobertos por `notebook-backup` e `durable-storage`.

## Diferenças de domínio (N/A)

- **N/A — "Referências e créditos".** O SILM não tem um tópico único de referências: as fontes aparecem por dado, em Dados e na Área do Professor. O Sobre leva ao Manual e a "Alcance e limites do modelo".
- **N/A — uma terceira opção de tela inicial.** O SIAB oferece duas opções (Página inicial e Laboratório); o SILM oferece as equivalentes.

## Testes

`npm run test:parity` executa `tests/parity/shell.cjs` (TEST-SHELL). O teste confere:

- nos 5 tamanhos: cabeçalho, barra inferior, ordem e itens do Menu, alvos de 44 px e Escape;
- acessibilidade direta;
- a animação de abertura desligada na próxima visita, e também com "Reduzir animações";
- o "Agora" na Oficina e no Manual;
- o Sobre (janela, Escape e página);
- o projetor;
- a instalação sem pedido do navegador;
- a tela inicial: convite, escolha salva, entrada com destino, redefinir, "Agora não" e rodapé do Início;
- o "Relatório" e a Ajuda no menu da atividade.
