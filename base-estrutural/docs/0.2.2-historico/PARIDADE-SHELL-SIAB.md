# Paridade de shell — SIAB congelado e Base Estrutural 0.2.2

Referência obrigatória: `SIAB(4).zip`, extraído em `references/SIAB-4/SIAB` fora desta distribuição. Origem executável: Base Estrutural 0.2.1 congelada. A comparação abaixo usa o HTML, CSS e comportamento implementado da referência; não afirma igualdade de conteúdo, identidade visual ou motores científicos.

Fontes inspecionadas: `index.html`, `css/stylesiab.css`, `css/workspace.css`, `js/ui/gaveta.js`, `js/ui/activity-ui.js`, `js/ui/workspace.js` e os registros de telas/inicialização do SIAB. Nenhum desses arquivos foi alterado. A integridade das referências está registrada em `evidence/INTEGRIDADE-ORIGENS.json`.

| Item | SIAB congelado | Base 0.2.2 | Paridade | Diferença | Justificativa |
|---|---|---|---|---|---|
| Hambúrguer | Ícone à esquerda da marca; controla `app-drawer` | Ícone, nome acessível, tooltip, `aria-controls` e `aria-expanded` | Estrutural | IDs do core preservados | Compatibilidade com a Base |
| Gaveta | Dialog fixado à esquerda, largura `min(360px,88vw)`, rolagem e backdrop | Mesmo lado e largura; fechamento explícito, Escape, clique/toque fora, trap e retorno de foco | Estrutural | Seções abertas, sem acordeões ou animação de entrada | Evitar estado e animação adicionais; respeitar redução de movimento |
| Marca | Ao lado do hambúrguer, antes da navegação | Mesma posição; identidade registrada pelo domínio | Estrutural | Marca e cores neutras/Demo | Identidade e ciência pertencem ao produto |
| Navegação desktop | Início, Aprender, Missões, Roteiros Experimentais, Laboratório, Caderno, Manual | Mesma ordem na Demo, por registros | Estrutural | Rótulo curto Roteiros; quebra de linha em desktop estreito | Contrato neutro e espaço disponível com fonte ampliada |
| Bottom navigation | Início, Aprender, Laboratório, Caderno até 900 px | Mesmo conjunto na Demo e breakpoint herdado; registro configurável | Estrutural | Pode ser outro conjunto curto no produto | Não obrigar todos os domínios a usar Caderno |
| Início | Caminhos pedagógicos com Laboratório em destaque e apoios secundários | Laboratório destacado; Aprender, Missões, Roteiros; Manual e Professor em Apoio | Hierárquica | Textos e ilustrações demonstrativos | Nenhum conteúdo científico no core |
| Laboratório | Workspace e módulos Explorar, Medir, Calcular | Workspace e módulos herdados, preservados na Demo | Operacional | Blocos e contador de ações | Demonstração neutra dos contratos |
| Aprender | Cards de Temas e entrada para relacionados | Registro genérico `themes`, cards, rota Aprender | Estrutural | Dois Temas neutros: Percursos e Registros | O domínio fornece o conteúdo |
| Tema | Hub de conteúdo e atividades relacionadas | Conteúdo, investigação, Roteiro e Missão; marcador Revisado reversível | Estrutural | Sem catálogo, progressão ou motor de conteúdo científico | Marcador simples conforme o escopo |
| Missões | Caminho principal, atividade e conclusão | Caminho principal e motor 0.2.1 preservado | Operacional | Definição e validação fornecidas pelo domínio | Sem pontos, ranking ou nova engine |
| Roteiros | Caminho principal e investigação guiada | Caminho principal e motor 0.2.1 preservado | Operacional | IDs de rota plural herdados da Base | Preservar URLs e arquitetura existente |
| Manual | Destino da navegação e apoio/contexto | Destino desktop/gaveta, apoio no Início, acesso durante restrição | Operacional | Motor e tela do Manual 0.2.1 | Não criar outro mecanismo de Manual |
| Caderno | Tela e registros do produto | Contrato opcional com disponibilidade, rota, título, ícone, estado e hooks | Contratual | Editor simples somente na Demo; nenhum modelo imposto | O produto define seus registros; SILM não foi modificado |
| Professor | Apoio pedagógico, seção própria na gaveta | Apoio no Início, seção Professor e tela herdada | Operacional | Sem guia docente final de conteúdo | Reutilizar serialização/importação existentes |
| Sobre | Menu → Aplicativo → Sobre | Mesmo caminho; nome, versão, descrição, modelo, referências, créditos, licenças e Manual | Operacional | Modal existente da Base | Preservar o serviço 0.2.1 |
| Relatório | Serviço da investigação/atividade | Painel Informações do Laboratório e atividade → Relatório; rota técnica preservada | Hierárquica | Não é card principal do Início | Correção obrigatória desta rodada |
| Recursos | Montagens, Tour e outros recursos do produto | Seção registrável `{id,title,icon,action,visibility}`; tour opcional | Contratual | Nenhuma montagem científica ou tour final | A Base fornece somente o hook |
| Preferências | Acessibilidade, Inicialização, Apresentação | Acessibilidade, destino inicial e Modo Projetor na mesma seção | Estrutural | Acessibilidade abre o modal herdado; startup usa select | Reutilizar motores e storage existentes |
| Atividade ativa | Contexto da atividade no menu | Tipo, título, módulo, navegação e status; Continuar, Ajuda, Relatório e Encerrar; Finalizar para Missão | Operacional | Finalizar abre o formulário de evidência/conclusão existente | Não contornar validação da Missão |
| Navegação restrita | Limita navegação e recursos da atividade | Roteador existente e links `aria-disabled`, sem `href`; ajuda, Manual, acessibilidade e saída disponíveis | Operacional | Preferências estruturais continuam acessíveis | Não bloquear ajustes de acessibilidade; sem autenticação |
| Banner | Entre header e main | Fora do header, antes de main, com medidas próprias | Estrutural | Controles e rótulos herdados da Base | Evitar reescrever a engine da atividade |
| Projetor | Ampliação estrutural e acesso pelo Professor | Tipografia ampliada, redução do subtítulo, ajustes de área e acesso pelo Professor | Estrutural | Não transforma ou amplia dados científicos específicos | Projeção do shell, sem renderer de domínio no core |
| Inicialização | Preferência persistida e destinos conhecidos do SIAB | Destinos elegíveis registrados; core.storage; fallback Início; link direto preservado | Contratual | Namespace neutro e fallback Laboratório quando não há Home | Não criar armazenamento paralelo |
| Aplicativo | Instalar quando possível, Sobre e versão | Mesma seção; instalação condicionada à capacidade PWA, Sobre e versão | Estrutural | Reorganizar interface e Reiniciar investigação herdados | Preservar ações existentes da Base |
| Mobile e sheets | Workspace ajustado, safe areas e inércia durante painéis | Bottom nav e banner entram no cálculo; sheets existentes tornam navegação inerte | Operacional | Sem nova engine mobile; rótulo da barra oculto em paisagem curta | Preservar viewport e acesso aos launchers |

A paridade implementada é de posição, hierarquia e operação. As diferenças explícitas de apresentação e integração estão em `LIMITACOES-CONHECIDAS.md`; os resultados observados estão em `RELATORIO-TESTES.md`. Homologação humana e validação nos motores indisponíveis continuam pendentes.
