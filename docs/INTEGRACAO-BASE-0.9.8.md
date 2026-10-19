# Integração com a Base Demo Oficial — início

## Referências fixadas em 19/10/2026

- SILM de origem: 0.11.0, commit `1dcbf8da15ba01cba54f4ba10f22bc818e9f6f49`.
- Base de destino: 0.9.8, repositório https://github.com/quimicaifbacampusvca/baseparasimuladores, commit `cce03dfe9fbe06f47d1e012d702e1f8bf1490caa`.
- Base em execução no SILM: 0.3.1, conforme BUILD-INFO.json.
- O autor autorizou usar a base atual enquanto continua removendo o motor químico antigo. A limpeza não é pré-requisito para iniciar a integração.
- Estado deste checkpoint: levantamento e referência de migração. O runtime ainda NÃO foi migrado. Não alterar versaoBase nem declarar paridade nesta etapa.

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
