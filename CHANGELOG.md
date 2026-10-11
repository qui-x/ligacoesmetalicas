# Registro de alterações

## SILM 0.3.0 — Estado Científico e Laboratório Livre

- Estado científico formal schema 2, com investigação de um metal, ID, status, datas e módulo ativo; dados tabelados continuam no banco local.
- Início explícito pela Tabela compartilhada; troca de metal com confirmação. A seleção de apresentação do Professor continua independente e sua ação Investigar utiliza o mesmo serviço.
- Persistência e retomada pelo storage da Base, migração mínima da seleção provisória 0.2.1 e recuperação de dados inválidos.
- Reset preserva metal e investigação; encerramento retorna à seleção. Painéis, viewport e relatório estrutural refletem o estado único.
- Validador científico do estado, documentação e testes de navegador/mobile/offline. Nenhuma rede, átomo, elétron, ferramenta de medição ou cálculo foi implementado.

## SILM 0.2.1 — Correções após homologação

- Homologação automatizada da versão 0.2.0 encontrou ausência de título principal na superfície da Tabela e retorno de foco ausente ao fechar a apresentação do Professor.
- Corrigido o título da Tabela para nível 1 e o retorno explícito de foco ao botão que abriu a apresentação.
- Mantido o mesmo banco, elegibilidade e comportamento científico da 0.2.0; nenhuma mecânica nova foi iniciada.
- Testes automatizados passaram em Chromium e Firefox. WebKit ficou indisponível por dependências de sistema ausentes; leitor de tela físico e projetor requerem verificação manual.
- Gerado novo pacote SILM 0.2.1. O ZIP congelado 0.2.0 não foi alterado.

## SILM 0.2.0 — Banco Científico, Fontes e Seleção de Metais

- Banco local/offline dos 118 elementos, com identidade, posição periódica e categoria documentadas.
- Registro formal de fontes e proveniência por campo; pesos atômicos CIAAW, configuração neutra NIST e estruturas cristalinas experimentais com condições e parâmetros.
- Critério verificável de elegibilidade: 43 metais com conjunto mínimo; demais metais visíveis com código e justificativa. Todos Z ≥ 104 permanecem visíveis e indisponíveis.
- Tabela Periódica com busca por nome, símbolo e número atômico, seleção única, painel científico e referências legíveis.
- Área do Professor reutiliza o mesmo componente e dataset em apresentação ampliada, com solicitação opcional de tela cheia nativa e estado pedagógico separado do estado científico.
- Validador estrutural do banco, testes negativos e documentação científica.
- Nenhuma estrutura visual, liga, dinâmica eletrônica, cálculo ou experimento de propriedade foi implementado.

## SILM 0.1.1

Fundação de interface, navegação e identidade. Consulte o histórico em `docs/SILM-0.1.1.md`.
