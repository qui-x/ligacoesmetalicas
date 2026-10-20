# SILM 0.14.0 — A Arquitetura dos Metais

Simulador Interativo de Ligações Metálicas sobre a Base SI 0.9.13. A interface reúne a Home e a navegação da base com o motor científico do SILM, identidade ouro/grafite e dados com fontes.

## Usar

Abra index.html por um servidor estático. A Home oferece Laboratório, Aprender, Missões e Roteiros Experimentais. O menu também dá acesso ao manual operacional, à tabela para apresentação, ao caderno e ao relatório da investigação livre. O endereço completo.html é mantido como encaminhamento compatível, sem iniciar outro aplicativo.

O laboratório utiliza Montagem, Ver e Dados. Investigue metais elegíveis, organize estruturas CCC/CFC/HC, compare célula/rede/vizinhança e representações 2D/3D. Os mesmos serviços oferecem elétrons deslocalizados, cinco propriedades qualitativas, Medir e Calcular com origens explícitas. Dados ausentes não recebem valores inventados.

## Atividades e conteúdos

- Seis missões científicas independentes nos módulos Explorar, Medir e Calcular.
- Cinco roteiros experimentais com orientações, contexto restrito e relatório.
- Sete temas conceituais não lineares com missões, roteiros e fontes relacionados.

Concluir mantém a bancada aberta. Encerrar restaura a investigação livre. Atividades concluídas continuam acessíveis/refazíveis; tentativas anteriores não dispensam evidências na nova execução. Há retomada, marcadores Concluído e uso offline após carregamento completo. Não há recompensas ou porcentagem gamificada.

## Persistência e validação

O estado científico permanece no schema 8. Uma sessão antiga válida é recuperada quando a nova está vazia, preservando o original. JSON de investigações continua disponível em Dados. Cores e acessibilidade não alteram valores científicos.

`npm test` executa validação científica, contratos dos roteiros/missões/temas e integração de navegador. Playwright/Chromium precisam estar disponíveis no ambiente. `npm run build:integration` verifica o snapshot upstream e gera a entrada principal.

## Documentação

[0.14.0](docs/SILM-0.14.0.md) · [Missões](docs/MISSOES.md) · [Contrato de Missões](docs/CONTRATO-MISSOES.md) · [Temas](docs/APRENDER-TEMAS.md) · [Contrato de Temas](docs/CONTRATO-TEMAS.md) · [Auditoria](docs/AUDITORIA-GAMIFICACAO-0.14.0.md) · [Roteiros](docs/ROTEIROS-EXPERIMENTAIS.md) · [Cobertura](docs/COBERTURA-ROTEIROS.md).

Esta etapa não finaliza a Área do Professor, o Manual nem a ampliação dos relatórios da 0.15.x. Testes desta rodada executados em Chromium; outros navegadores e dispositivos físicos ainda requerem homologação. Licença GPL-3.0.

Quando existem sessões antiga e atual distintas, Dados oferece Exportar investigação antiga (JSON). O original e a sessão atual permanecem intactos; a importação posterior usa o fluxo de confirmação do mesmo aplicativo.
