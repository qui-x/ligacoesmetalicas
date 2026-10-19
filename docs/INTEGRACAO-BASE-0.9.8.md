# Integração com a Base Demo Oficial — início

## Referências fixadas em 19/10/2026

- SILM de origem: 0.11.0, commit `1dcbf8da15ba01cba54f4ba10f22bc818e9f6f49`.
- Base de destino: 0.9.8, repositório https://github.com/quimicaifbacampusvca/baseparasimuladores, commit `cce03dfe9fbe06f47d1e012d702e1f8bf1490caa`.
- Base em execução no SILM: 0.3.1, conforme BUILD-INFO.json.
- O autor autorizou usar a base atual enquanto continua removendo o motor químico antigo. A limpeza não é pré-requisito para iniciar a integração.
- Estado atual: primeira entrada funcional em `integracao/index.html`, com shell da Base 0.9.8 e domínio científico do SILM 0.12.0. A distribuição principal ainda usa a base anterior. Não alterar versaoBase da distribuição nem declarar paridade completa nesta etapa.

## Compatibilidade observada no código

| Área | SILM atual | Base de destino | Encaminhamento |
|---|---|---|---|
| Inicialização e interface | bootstrap.js usa SimCore.ExperienceUI, createScope e notifications | src/app.ts inicializa BaseDemoSI e seus subsistemas | Criar adaptador de ciclo de vida; não substituir scripts diretamente |
| Estado científico | domain/silm/state.js, schema 8, investigação, estrutura, propriedades, medidas e cálculos | ExtensionContext.state com validação e persistência em extensions.ts | Manter a autoridade do serviço científico; definir ponte de persistência antes de ativar |
| Tamanho do estado | investigação científica e históricos compostos | safeJSON limita a serialização a 8192 caracteres | Medir estados reais; não truncar nem copiar toda a investigação sem validação |
| Cena | montagem livre e cristalina, renderer 2D e câmera | SceneEntity genérica, posição e tamanho em percentuais | Cena da base não fornece escala científica; coordenadas visuais não substituem geometria cristalográfica |
| Instrumentos | medidas com origem e contexto científico | InstrumentReading contém label, value e unit | Preservar proveniência no domínio; leitura genérica é somente apresentação |
| Histórico | ações do modelo científico | comandos add, update, remove e clear em SceneStore | Mapear atomicidade e Desfazer/Refazer antes de permitir manipulação simultânea |
| Identidade e módulos | SILM, Explorar/Medir/Calcular | manifest e configuração de módulos | Declarar identidade e capacidades; não carregar a demonstração como ciência do SILM |
| Persistência | migrações do schema científico até 8 | sessão da extensão restaurada por versão exata | Importação explícita e reversível; preservar sessão original e não resetar investigação ao trocar versão |
| Docas e mobile | integração antiga da família | Montagem, Ver e Dados, folhas inferiores | Usar os contratos da base e validar com a cena científica real |

## Sequência de implementação

1. Preparar entrada de integração com a identidade SILM e adaptador de ciclo de vida.
2. Conectar cena e renderizador 2D mantendo um único scientificState.
3. Integrar ferramentas, instrumentos e cálculos sem perda de origem, unidades ou histórico.
4. Migrar sessões com validação e recuperação; validar Desfazer/Refazer.
5. Integrar docas, navegação, mobile e acessibilidade.
6. Rever build, PWA, offline e atualização antes de substituir a distribuição publicada.

A base de referência deve permanecer sem alterações de domínio. Resíduos do motor antigo serão inventariados por dependência real; não serão removidos automaticamente nem adotados como modelo científico do SILM. Atualizações posteriores do upstream exigem comparação de commits.

## Validação inicial

- `npm run test:scientific` no SILM 0.11.0: PASS — 118 elementos, 43 metais, 78 fontes e 101 casos inválidos no validador de estado; cálculos de Fe/Cu/Mg e migrações aprovados.
- Os testes desta etapa não demonstram integração funcional nem homologação de navegador.

## Primeira entrada funcional

A branch acrescenta `integracao/index.html` para testar a adoção da base atual sem substituir a distribuição principal. O código upstream fica íntegro em `integracao/upstream`, com revisão e hashes em `integracao/base-lock.json`.

O produto inicializa navegação, menu, preferências, workspace e componentes da base. O estado e os renderizadores continuam sendo os do domínio SILM. A demonstração genérica não é inicializada. A porta `compat.js` fornece somente serviços mínimos de apresentação para o renderer herdado.

A integração funcional contempla seleção de metal, montagem livre, movimentação, Desfazer, organização cristalina, retorno à montagem, célula/rede, vizinhos, câmera, projeções, elétrons e importação/exportação de investigação. Dados científicos têm persistência própria, sem serialização no estado de 8 KB das extensões genéricas. A sessão da distribuição completa permanece independente.

Limitações e instruções de reprodução: `integracao/README.md`. A próxima etapa será conectar os fluxos Medir e Calcular às docas e registros da base; estes recursos continuam disponíveis na distribuição principal.

## Consolidação com a representação 3D

A revisão de 19/10/2026 reaproveita a implementação da branch `claude/optimistic-cerf-167d72` (commit `b0927cebf890ac123ee49fc79c9b31c432f1bdba`). A porta de representação desta entrada foi ampliada para a versão 2: modo 2D/3D, câmera de órbita, perspectivas e retorno ao 2D em caso de falha. A ciência continua no mesmo schema 8.

Foi corrigida a gravação da câmera durante o reenquadramento de planos 3D: ela usa `crystal3d` e não sobrescreve `crystal`. A suíte de integração verifica a preservação independente das câmeras.
