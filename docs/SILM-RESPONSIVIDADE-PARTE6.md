# SILM — contrato de responsividade (Parte 6)

Estado: auditoria em andamento, sem homologação de navegadores. Este documento estabelece critérios verificáveis, não presume que telas já estejam aprovadas.

## Objetivo

As quatro escalas da Oficina dos Metais (aplicação macroscópica, grãos, rede e elétrons), a visão geral, a tabela periódica, os painéis Explorar/Medir/Calcular e as configurações de acessibilidade devem funcionar em tamanhos de janela variados, inclusive com zoom ou mudança de orientação.

A arquitetura permanece: navegação de escalas no topo do foco, desenho científico prioritário no centro e faixa única de controles abaixo. Nunca usar encolhimento de botões para simular responsividade; permitir rolagem horizontal **somente dentro da faixa de controles**.

## Matriz mínima de larguras e alturas

| Perfil | Viewport CSS (largura × altura) | Objetivo |
|---|---|---|
| Celular compacto | 320 × 568 | Largura mínima e ações de toque |
| Celular pequeno | 360 × 640 | Conteúdo, escalas e barra inferior |
| Celular padrão | 390 × 844 | Teste principal em retrato |
| Celular grande | 414 × 896 | Estabilidade ao mudar dimensões |
| Celular em paisagem | 844 × 390 | Baixa altura e teclado/controles |
| Tablet retrato | 768 × 1024 | Painéis em folha inferior |
| Tablet paisagem | 1024 × 768 | Transição para docas desktop |
| Notebook compacto | 1280 × 720 | Altura limitada, tela ampla |
| Notebook | 1366 × 768 | Docas e palco central |
| Desktop | 1440 × 900 | Visões e painéis simultâneos |
| Monitor Full HD | 1920 × 1080 | Centralização sem esticar imagens |
| Monitor QHD | 2560 × 1440 | Limites máximos, sem texto ilegível |

Os testes de largura não dispensam testes de 200% de zoom e de aumento de fonte; em zoom, a *largura de CSS efetiva* pode atravessar outro breakpoint.

## Parâmetros de verificação

1. **Enquadramento global:** sem rolagem horizontal da página, sem componentes perdidos por `overflow:hidden`; permitir scroll apenas em regiões apropriadas.
2. **Hierarquia espacial:** escalas acima, palco como principal área disponível, ferramentas abaixo, sem overlays cobrindo a estrutura quando não solicitados.
3. **Controles:** alvos de toque visíveis com ~44 × 44 px nas telas compactas; rótulos acessíveis, estado de seleção preservado e possibilidade de rolar a barra sem mover o palco.
4. **Docas e menus:** desktop com painéis independentes; até 900 px, folhas inferiores com cabeçalho fixo, conteúdo rolável e botão de fechar.
5. **Visão geral:** alternância lista/grade sem voltar involuntariamente ao Foco, miniaturas inteiras, geometria visual dominante, nenhuma coluna mínima desktop em telefone.
6. **Escalas:** imagem de aplicação carregada e contida; grãos em proporção do quadro; rede e elétrons sem deformação nem perda de seleção.
7. **Diálogos:** tabela periódica, ajuda, relatórios e configurações inteiros no viewport, com navegação por teclado.
8. **Altura curta:** comportamento de paisagem em celular e notebook de 720 px; não depender apenas de `max-width`.
9. **Acessibilidade:** modo claro/escuro/alto contraste, filtros de visão de cores, preferência por reduzir movimento, fonte ampliada, foco visível.
10. **Compatibilidade:** executar matriz em Chromium, Firefox e WebKit antes de homologar; conferir PWA sem cache antigo.

## Critérios objetivos de aprovação

- `document.documentElement.scrollWidth <= window.innerWidth + 4` na Oficina, exceto quando um componente tenha rolagem local justificada.
- A área visível do palco e o seletor de escalas ficam dentro da largura da janela.
- Controles principais não são ocultados apenas porque não cabem na faixa; seu contêiner pode rolar horizontalmente.
- As caixas de diálogo nunca ultrapassam a largura do viewport.
- Nenhuma alteração de layout modifica dados científicos, projetos ou cálculos do motor.
- Matriz automatizada + inspeção manual de imagens em browsers; não declarar homologação sem ambas.

## Ordem de execução

1. Inventário CSS/JS e detecção de conflitos entre breakpoints.
2. Correções conservadoras nas barras, cartões, palco e modais.
3. Testes automatizados por viewport em duas engines disponíveis no CI atual.
4. Adição de WebKit à homologação; exame manual de telas e interações reais.
5. Integração na `main` somente após validação e revisão de regressão.
