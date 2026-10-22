# SILM 0.15.1 — A Arquitetura dos Metais

A página inicial oferece a Oficina dos Metais como espaço de manipulação das estruturas e mantém o card do Caderno com a contagem de registros. A versão 0.15.1 amplia a cobertura experimental: 57 metais podem ser investigados e 48 têm visualização cristalográfica em CCC, CFC ou HC ([notas da versão](docs/SILM-0.15.1.md)). Os nove metais com estruturas fora desses modelos continuam sinalizados, sem substituição artificial. A correção de tela inteira e menus contextuais está documentada em [0.14.7](docs/SILM-0.14.7.md). O Caderno reúne anotações com título, conclusões de missões/roteiros e referências reabríveis a relatórios. A interface integrada usa o snapshot da Base SI 0.9.17; o motor científico, os dados e o schema 8 do SILM continuam separados e preservados.

Simulador Interativo de Ligações Metálicas sobre a Base SI 0.9.17. A interface reúne a Home e a navegação da base com o motor científico do SILM, identidade ouro/grafite e dados com fontes.

## Usar

Abra index.html por um servidor estático. A página inicial oferece Oficina dos Metais, Aprender, Missões, Roteiros Experimentais e Caderno. O menu também dá acesso ao manual operacional, à tabela para apresentação, ao caderno e ao relatório da investigação livre. O endereço completo.html é mantido como encaminhamento compatível, sem iniciar outro aplicativo.

A Oficina dos Metais utiliza Montagem, Ver e Dados. Investigue metais elegíveis, organize estruturas CCC/CFC/HC, compare célula/rede/vizinhança e representações 2D/3D. Depois de organizar uma estrutura cristalina, use **Expandir** para abrir a mesma cena em uma área ampliada; pressione Esc ou use Voltar para retornar. Essa visualização não cria outra montagem nem altera os dados científicos. Os mesmos serviços oferecem elétrons deslocalizados, cinco propriedades qualitativas, Medir e Calcular com origens explícitas. Dados ausentes não recebem valores inventados.

## Atividades e conteúdos

- Seis missões científicas independentes nos módulos Explorar, Medir e Calcular.
- Cinco roteiros experimentais com orientações, contexto restrito e relatório.
- Sete temas conceituais não lineares com missões, roteiros e fontes relacionados.

Concluir mantém a bancada aberta. Encerrar restaura a investigação livre. Atividades concluídas continuam acessíveis/refazíveis; tentativas anteriores não dispensam evidências na nova execução. Há retomada, marcadores Concluído e uso offline após carregamento completo. Não há recompensas ou porcentagem gamificada.

## Persistência e validação

O estado científico permanece no schema 8. Uma sessão antiga válida é recuperada quando a nova está vazia, preservando o original. JSON de investigações continua disponível em Dados. Cores e acessibilidade não alteram valores científicos.

`npm test` executa validação científica, contratos dos roteiros/missões/temas e integração de navegador. Playwright/Chromium precisam estar disponíveis no ambiente. `npm run build:integration` verifica o snapshot upstream e gera a entrada principal.

## Documentação

[0.15.1](docs/SILM-0.15.1.md) · [Relatório desta rodada](docs/RELATORIO-BUILD-TESTES-0.15.1.md) · [0.14.7](docs/SILM-0.14.7.md) · [0.14.4](docs/SILM-0.14.4.md) · [0.14.0](docs/SILM-0.14.0.md) · [Missões](docs/MISSOES.md) · [Contrato de Missões](docs/CONTRATO-MISSOES.md) · [Temas](docs/APRENDER-TEMAS.md) · [Contrato de Temas](docs/CONTRATO-TEMAS.md) · [Auditoria](docs/AUDITORIA-GAMIFICACAO-0.14.0.md) · [Roteiros](docs/ROTEIROS-EXPERIMENTAIS.md) · [Cobertura](docs/COBERTURA-ROTEIROS.md).

A Área do Professor, o Manual e a ampliação dos relatórios da 0.15.x continuam em desenvolvimento. A execução automatizada dos testes desta rodada ainda precisa ser confirmada; outros navegadores e dispositivos físicos também requerem homologação. Licença GPL-3.0.

Quando existem sessões antiga e atual distintas, Dados oferece Exportar investigação antiga (JSON). O original e a sessão atual permanecem intactos; a importação posterior usa o fluxo de confirmação do mesmo aplicativo.


## Caderno didático — 0.14.4

O Caderno registra observações, hipóteses e conclusões com título. Conclusões de missões/roteiros entram automaticamente na linha do tempo; relatórios podem ser vinculados e reabertos pelo próprio registro. Há filtros por tipo, atividade e relatório, exclusão confirmada, importação validada de JSON, exportação JSON/CSV e impressão. O contrato de armazenamento de notas da Base SI continua preservado.
