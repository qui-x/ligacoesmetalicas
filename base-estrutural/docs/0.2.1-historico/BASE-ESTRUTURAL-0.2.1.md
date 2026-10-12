# Base Estrutural 0.2.1 — Recuperação da Paridade Operacional

## Origem e objetivo

Esta distribuição parte de uma cópia da Base Estrutural 0.2.0 fornecida. O SIAB congelado anexado nesta rodada foi examinado como referência de navegação, cartões de módulos, atividades, sessão, Professor, Sobre e relatório. A Base 0.2.0, o SIAB e o SILM 0.1.0 permaneceram congelados. Seus hashes e a conferência dos arquivos constam em `BUILD-INFO.json` e `evidence/ORIGENS-PRESERVADAS.json`.

A Base conhece experiências pedagógicas, mas não interpreta o conteúdo científico. Ela oferece Laboratório, Roteiro, Missão, Professor, sessão e relatório como estruturas configuráveis. Nenhum catálogo, motor, propriedade quantitativa ou estado de bancada foi importado.

## Organização

| Arquivo / diretório | Responsabilidade |
|---|---|
| `js/navigation/router.js` | Registro de telas, rotas, histórico, foco, ativação e liberação |
| `js/experience/common.js` | Elementos e ícones estruturais, formulários e confirmação pelo modal existente |
| `js/experience/modules.js` | Módulos registráveis, cartões recolhíveis, disponibilidade e seleção única |
| `js/experience/activity.js` | Roteiros, Missões, contexto, restrições, confirmação, sessão e retomada |
| `js/experience/teacher.js` | Configuração serializável de atividade, importação, revisão e modo aluno |
| `js/experience/reports.js` | Metadados, contribuição do domínio, redação e impressão |
| `js/experience/references.js` | Registro e apresentação de referências |
| `js/experience/experience.js` | Composição dos serviços, Início, listas/detalhes, banner e Sobre |
| `css/experience.css` | Apresentação reutilizável das novas mecânicas |
| `domain/demo/` | Conteúdo neutro que demonstra os contratos sem editar o core |

## Navegação e estado

O domínio permanece montado ao trocar de tela; sair do Laboratório preserva seu renderer e seu estado. Cada tela recebe um escopo temporário, destruído ao sair. `deactivate` e `destroy` da tela liberam integrações adicionais; o próximo acesso renderiza um host novo. Formulários que precisam sobreviver à troca de tela devem salvar seus dados pelos serviços ou pelo domínio.

O roteador mantém rotas de hash, suporta voltar/avançar do navegador e escolhe o foco de entrada. O Manual retorna à tela de origem. O endereço legado `#/workspace` é aceito como alias de `#/laboratorio`. Rotas inválidas voltam a uma tela disponível com aviso operacional.

A Base vazia continua operacional. A Demo é ativada com `?demo=1`; ela registra seus caminhos explicitamente. Um produto pode omitir Roteiros, Missões ou Professor, ou registrar uma tela adicional, por exemplo Aprender. Não existe catálogo obrigatório.

## Módulos e atividades

Explorar, Medir e Calcular são nomes registrados pela Demo, não uma lista científica codificada no core. Cada cartão pode expandir, recolher, mostrar selo, tooltip, ativo e indisponível. Somente um módulo fica ativo. Os controles são renderizados com escopo próprio.

Cada roteiro pertence a um único módulo. A missão pode declarar módulos permitidos, módulo inicial e recursos. A Base valida as referências e gerencia o estado operacional; a callback do domínio decide se as evidências permitem concluir. Há apenas um marcador de conclusão e a possibilidade de refazer, sem pontos ou ranking.

A navegação restrita permite o Laboratório, o Manual, o relatório da sessão atual e o detalhe da própria atividade. Acessibilidade, Sobre e saída segura continuam acessíveis. Mudar o hash não contorna a navegação prevista. Recursos são liberados por ID; o domínio consulta `ctx.activity.allowsResource(id)` antes de executar suas ações. Restrições pedagógicas no cliente não são um sistema de segurança ou de autenticação.

## Sessão

Metadados estruturais ficam no namespace do domínio: identidade, tipo, ID, módulo, horário, restrições, navegação e estado. O estado específico é capturado e restaurado pelas callbacks do domínio. A Demo salva contagem e anotação separadamente dos metadados.

Ao recarregar, a interface oferece Retomar ou Começar outra sessão. A oferta não bloqueia a fila de lifecycle: desmontar o domínio ainda funciona com o diálogo aberto. A investigação livre anterior é preservada ao entrar em uma atividade e pode ser restaurada ao sair, inclusive após reload. Reiniciar requer confirmação pela interface. Tema, acessibilidade e redação do relatório são preservados.

Até 30 metadados de sessões anteriores aparecem no histórico. Os relatórios textuais e os dados de domínio usam chaves próprias e não são automaticamente expurgados junto com essa lista; um produto com armazenamento prolongado deve definir sua política de retenção. Na indisponibilidade de armazenamento, o fallback em memória da Base continua funcionando com aviso.

## Professor, referências e relatório

A Área do Professor permite título, instruções, identificação, módulo, recursos e navegação. A configuração contém dados JSON, sem closures. Pode ser baixada, importada, revisada e aberta como aluno. O schema rejeita módulos e recursos desconhecidos; a interface apresenta texto escapado. Não há servidor, conta de aluno, sincronização ou compartilhamento por token nesta rodada.

Sobre reúne identidade, versão, descrição, modelo fornecido pelo domínio, referências, licenças e acesso ao Manual. O registro de referências organiza tipo, autores, ano, fonte, URL e notas, sem julgar a ciência.

O relatório acrescenta produto, versão, atividade, data/horário, identificação, módulo e sessão. O domínio fornece seções, tabelas e renderers. Observações, análise e conclusão são editáveis; a impressão utiliza a mesma redação, com controles removidos. Data e horário seguem o ambiente do navegador. Snapshots históricos arquivam textos e tabelas serializáveis; renderers dependem do código e do estado do domínio.

## Preservações e mudanças controladas

O motor de acessibilidade, storage, Manual/registro/busca/impressão, notificações, modal, viewport e contratos básicos de domínio foram reutilizados. No Manual, somente os dois handlers de abrir/voltar passam a delegar ao roteador geral. Não houve reconstrução do mecanismo moderno.

A montagem do domínio ganha o contexto de experiência; o teardown libera telas e serviços antes de concluir a limpeza. O reset estrutural utiliza o roteador. O painel sincroniza seu título com o botão que o abre. Contêineres neutros substituem `aside`, pois os painéis alternam entre região e diálogo no mobile. Tokens de spacing, raio, foco e breakpoints originais permanecem preservados.

O CSS inclui safe areas nas novas superfícies e permite que a paleta de cores forçadas do sistema prevaleça sobre o alto contraste do aplicativo. O Service Worker usa `simcore@<escopo>::0.2.1`, inclui recursos locais e só remove caches anteriores do mesmo escopo. A preparação do domínio reutiliza o pré-cache, inclusive offline.

## Limites

Consulte `RELATORIO-TESTES.md` para cobertura efetiva, `RELATORIO-REGRESSOES.md` para preservações/correções e `PARIDADE-SIAB.md` para diferenças. A implementação entrega a paridade estrutural especificada, não todas as funcionalidades científicas e de exportação do SIAB.

A rodada termina na Base 0.2.1. Nenhuma atualização do SILM ou mecânica científica foi iniciada. O ZIP congelado não deve ser sobrescrito depois da homologação.
