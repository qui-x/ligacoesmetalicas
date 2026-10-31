# Paridade SIAB 1.0.0 × SILM — índice de execução

Este documento é a porta de entrada da auditoria. O plano detalhado e operacional, com tarefas identificadas, critérios de aceite, testes e evidências, está em:

**[PLANO-OPERACIONAL-PARIDADE-SIAB-SILM.md](PLANO-OPERACIONAL-PARIDADE-SIAB-SILM.md)**

## Referências fixadas

| Projeto | Repositório / branch |
|---|---|
| Referência de interface | `qui-x/acidobase` · `acidosebases1.0.0` · SIAB 1.0.0 |
| Aplicativo-alvo | `qui-x/ligacoesmetalicas` · `refactor/silm-copy-slim-20261030` |

O SIAB define a referência de arquitetura, navegação, hierarquia, interação, acessibilidade, responsividade e organização de conteúdo. O conteúdo e as regras científicas permanecem específicos do SILM. Não copiar experiências ácido-base nem inventar equivalentes metálicos.

## Ordem obrigatória

1. Início
2. Aprender / Temas
3. Missões
4. Roteiros Experimentais
5. Oficina dos Metais — Foco → Montagem → Ver → Dados → Visão geral
6. Caderno
7. Manual

Depois das telas principais: Montagens prontas, Tour, Área do Professor, apoio pedagógico, Preferências/Acessibilidade, Modo projetor e Aplicativo. Relatórios são uma tela contextual e serão auditados a partir das atividades e de Dados.

**Regra de avanço:** concluir e registrar a tela atual antes de começar a seguinte. Alterações preliminares em telas futuras permanecem provisórias até sua etapa.

## Situação inicial da auditoria

| Área | Situação identificada no código | Próxima ação prevista |
|---|---|---|
| Início | Primeira rodada aplicada; ainda sem homologação visual | Revalidar hero, cartões, contagens, retomar atividade, rodapé, teclado e mobile |
| Aprender | Lista/detalhe existentes; conteúdo e estados precisam de comparação | Comparar lista, detalhe, ação Investigar e conteúdo relacionado |
| Missões | Catálogo e sessões existentes | Comparar problema, objetivos, evidências, conclusão, restrições e refazer |
| Roteiros | Catálogo e sessões existentes | Comparar detalhe, identificação, requisitos, preparação e retomada |
| Oficina | Workspace e painéis implementados; Visão geral recebeu rodada preliminar | Auditar na ordem Foco, Montagem, Ver, Dados e Visão geral |
| Caderno | Integração desabilitada no bootstrap | Implementar registros científicos, filtros, detalhe, CSV, impressão, backup e exclusão |
| Manual | 3 categorias e 21 tópicos registrados na auditoria | Ampliar arquitetura de busca/índice/artigo e completar conteúdo do SILM |
| Relatórios | Captura contextual e campos autorais básicos | Comparar modos, seções, tabelas, dados, edição, impressão e arquivo |
| Área do Professor | Formulário, prévia e JSON existem | Completar biblioteca CRUD, permissões, guia, impressão e modo projetor |
| Menu e recursos | Drawer e preferências existem | Comparar contexto, destinos, foco, acessibilidade, projetor, inicialização e PWA |

Os números acima são fotografia dos arquivos auditados, não metas de quantidade. A paridade é funcional e de organização; não exige copiar número de temas, missões, roteiros ou artigos do SIAB.

## Critérios mínimos para marcar uma tela como concluída

- Estrutura, hierarquia e densidade visual comparadas na mesma dimensão de tela.
- Navegação, ações, estados vazios/ativos/indisponíveis, retorno e persistência verificados.
- Teclado, leitor de tela, foco, alvos de toque e layouts mobile testados.
- Testes automatizados pertinentes executados.
- Capturas SIAB/SILM e resumo dos testes registrados em `docs/evidence-parity/<ID-da-tela>/`.
- Diferenças de domínio justificadas e registradas como `N/A`, sem forçar equivalências científicas.

O plano operacional contém o checklist executável de cada tela, critérios comuns, comandos de teste, arquivos relevantes, evidências requeridas e bloco de aceite a duplicar ao concluir cada etapa.

## Escopo excluído

Clube de Jazz, jukebox, áudio, Blender, Babylon.js e recursos internos do Jazz permanecem fora desta auditoria. O símbolo institucional do SILM pode permanecer no Início; isso não inclui um atalho para o Clube de Jazz.

## Estado de integração

A documentação e as alterações de interface estão na branch de trabalho e na PR #18. A branch não foi integrada a `main`. Build, testes completos e validação visual ainda são necessários antes de qualquer merge ou publicação.
