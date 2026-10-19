# SILM sobre a Base Demo SI 0.9.8

Entrada funcional de integração: servir a raiz do repositório por HTTP e abrir `/integracao/index.html`.
A distribuição principal em `/index.html` permanece independente.

## Implementado

- Shell, navegação, menu, preferências, docas e folhas inferiores da Base 0.9.8.
- Identidade SILM; módulos da demonstração e motor genérico não são inicializados.
- Modelo científico original schema 8 e renderizador comum 2D/3D do SILM 0.12.0.
- Seleção dos 43 metais habilitados, montagem livre, arraste/teclado, Desfazer, organização cristalina quando suportada, retorno à montagem livre, célula/rede, vizinhos, projeções 2D e 3D, órbita, câmera e elétrons.
- Investigação e vista salvas em namespace próprio `silm-base-integration`; a sessão original não é migrada automaticamente.
- Exportação/importação JSON, incluindo registros e proveniência; importação inválida é recusada antes de modificar o modelo.
- Dados científicos persistidos pelo serviço SILM, sem o limite de 8 KB do estado genérico de extensões.

## Limites desta etapa

Medir, Calcular, comparações, experiências de propriedades, atividades, relatórios e PWA/standalone ainda usam a distribuição principal. Estados importados conservam medidas, cálculos e propriedades, mas a entrada de integração ainda não oferece seus controles de edição. Limpar estrutura tem confirmação explícita e ainda não integra um histórico universal de Desfazer/Refazer. Não declarar paridade completa com a base.

## Origem e reprodução

`upstream/` contém arquivos copiados sem alterações do commit indicado em `base-lock.json`, com SHA-256 por arquivo e licença GPL-3.0. `src/` documenta o fonte TypeScript correspondente ao bundle upstream. Não editar o snapshot para adicionar ciência.

`npm run build:integration` verifica todos os hashes e gera `base-core.js` removendo somente a entrada de inicialização da demonstração. Um marcador inesperado interrompe o build. O produto inicializa os serviços compartilhados explicitamente em `adapter.js`. `compat.js` oferece apenas as portas de DOM, ciclo de vida, armazenamento da vista e anúncios necessárias aos renderizadores existentes; não carrega o shell antigo.

`npm run test:integration` executa o build verificado e os fluxos Chromium por HTTP. Requer Playwright e Chromium instalado; `SILM_CHROMIUM` aceita o caminho de um executável alternativo. Opcionalmente, `SILM_INTEGRATION_EVIDENCE` define a pasta de capturas. Firefox, Safari/WebKit, dispositivos reais, PWA e offline ainda precisam de homologação.
