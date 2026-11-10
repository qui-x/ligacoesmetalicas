# SILM · Parte 8 — Contrato único de composição mobile

**Escopo:** branch `design/silm-parte8-lente-travessia-20261109`, PR #83 (draft). **Base:** conteúdo da Oficina com explicações extensas migradas para o Manual. **Data:** 10/11/2026.

## Diagnóstico reproduzível

Nas larguras de 320–414 px, o mesmo componente recebe regras concorrentes em `integracao/upstream/mobile-contract.css`, `integracao/workspace-family.css`, `domain/silm/workshop.css`, `domain/silm/lens.css`, `integracao/integration.css` e `integracao/mobile-icon-fit.css`. A cascata produz: diferenças de alinhamento entre Foco, Travessia, imagem e rodapé; molduras aninhadas; dimensões impostas que variam entre escalas; informações do Objeto quebrando em várias linhas; e uma faixa científica de Rede/Centro com comportamento diferente da Oficina visual.

A auditoria cromática e a medição de alvos de 44 px são necessárias, mas **não demonstram continuidade espacial**. Passar nos testes antigos não torna o enquadramento visual aceitável.

## Estrutura imutável da Oficina mobile

```text
┌─────────────────────────────────────┐
│ 1. Identidade da aplicação           │ cabeçalho do aplicativo
├─────────────────────────────────────┤
│ 2. Foco / Visão geral + módulos      │ contextual, altura previsível
├─────────────────────────────────────┤
│ 3. Objeto | Grãos | Rede | Centro     │ quatro escalas, mesma posição
├─────────────────────────────────────┤
│ 4. Palco da mesma investigação       │ maior região, mídia prioritária
│    imagem / polígonos / rede / célula │ contexto curto, sem bibliografia
│    identificação e ações breves      │ rolagem apenas quando necessário
├─────────────────────────────────────┤
│ 5. Montagem | Ver | Dados            │ rodapé único e protegido
└─────────────────────────────────────┘
```

A lente permanece opcional, vinculada à faixa da Travessia. Rede/Centro podem usar a faixa instrumental **única existente** sem duplicá-la sobre o canvas. A área Foco não deve coexistir com Visão geral. As cinco zonas pertencem à mesma linha vertical; nenhuma é um novo painel lateral.

## Regras geométricas e científicas

| Região | Contrato |
| --- | --- |
| Cabeçalho do aplicativo | Não redefinir lógica de menu, atalhos ou identidade; respeitar safe areas e fonte ampliada. |
| Foco/Visão geral | Área de toque ≥44px, sem quebra dos dois botões; seus recuos horizontais seguem o mesmo gutter da Travessia. |
| Travessia | Quatro botões proporcionais, na mesma linha, com rótulos curtos e ≥44px. Lente em célula auxiliar já existente. Sem overflow global. |
| Palco Objeto | Evitar cartões externos aninhados; imagem inteira visível com `object-fit:contain` (nunca distorcer/cortar a evidência ilustrativa). Evitar a folga artificial entre moldura e imagem. Nome, componente, Manual e seleção de outras aplicações compõem contexto curto, sem sobreposição. |
| Palco Grãos | Um mapa SVG predominante; não deformar contornos; seleção, ausência de escala física, zoom e ajuste acessíveis. Não mostrar estudos ou segunda ilustração no palco. |
| Palco Rede/Centro | Mesma largura e relação de altura; tela científica ocupa a área central, sem notas sobre a geometria. Faixa científica já existente continua horizontal e rolável, sem comprimir ícones. |
| Rodapé | `Montagem / Ver / Dados` é a única faixa fixa de acesso às docas; largura interna e bordas alinhadas ao topo, sem sobrepor a mídia. |
| Acessibilidade | Alvos ≥44px em retrato e texto 150%; nomes acessíveis e foco visível; visão de alto contraste, leitura simples e movimento reduzido. |
| Manual | Composição, fontes, cores, estudos e limites detalhados; não duplicar metadados no palco. Aviso operacional de escala física permanece visível. |

**Sem alteração:** metal/investigação, módulo, propriedades, estrutura cristalina, semente e polígonos do mapa de grãos, medições, cálculos, lente, zoom ou seleção. Uma troca de escala é navegação de apresentação e não um experimento novo.

## Etapas de execução

- [x] P8-M0 · Auditar cascata, DOM, capturas Objeto/Grãos/Rede/Centro e consolidar contrato de composição.
- [x] P8-M1 · Adicionar camada final `integracao/mobile-layout-unificado.css`, coordenando gutter comum e removendo molduras internas redundantes.
- [x] P8-M2 · Ajustar composição da escala Objeto e da identificação da escala Grãos, com imagem prioritária e ações agrupadas.
- [x] P8-M3 · Harmonizar enquadramento Rede/Centro, a faixa instrumental e o rodapé, sem mover controles científicos.
- [x] P8-M4 · Estender regressões a 320, 360, 390, 400 e 414 px, horizontal, rotação, Foco/Visão geral e painel aberto.
- [x] P8-M7 · Distribuir o espaço vertical no Objeto em retrato (320–414 px), preservando `object-fit:contain` e delimitando a lente aos pixels reais da fotografia. Testes com geometria do enquadramento e da lente.
- [x] P8-M8 · Preencher faixas de enquadramento com camada fotográfica difusa *meramente decorativa* (mesma imagem em cache), sem recortar a fotografia central, sem capturar eventos da lente e sem exibi-la em alto contraste.
- [ ] P8-M5 · Conferir capturas finais em Chromium, Firefox e WebKit; homologar também leitura 150% e alto contraste; corrigir se necessário.
- [ ] P8-M6 · Revisão visual em aparelho real, sem merge automático.

## Critérios de aceite verificáveis

1. **Alinhamento:** as bordas esquerda/direita de Foco, Travessia e palco interno têm o mesmo gutter, tolerância de 3 px em retrato 320–414; o rodapé usa o mesmo padding interno.
2. **Continuidade:** quatro escalas na mesma faixa, mesmo espaço horizontal; barra científica da Rede/Centro não move os lançadores nem sobrepõe a figura.
3. **Tela íntegra:** `scrollWidth <= innerWidth + 5px`; nenhuma sobreposição entre faixa fixa e controles; qualquer conteúdo longo rola somente na região prevista.
4. **Figura preservada:** foto carregada, sem estiramento ou recorte obrigatório; enquadramento de Objeto cresce em telas altas e a lente coincide com a região visível da imagem; mapa de grãos ≥190 px de altura no retrato de 568px ou mais; canvas científico visível em Rede/Centro.
5. **Acessibilidade:** botão acionável ≥44px e SVG 20px; teclado, alto contraste e fonte ampliada sem amputar rótulos nem ocultar a barra inferior.
6. **Ciência:** snapshot de metal, estrutura, módulo, propriedades, medições, cálculos e contexto mantém integridade ao alternar a Travessia, abrir/fechar docas e o Manual.
7. **CI:** suites de lente, quatro escalas, microestrutura, prévia didática e portão de regressões completas, sem falha.

## Política de integração

**NÃO** modificar nem mesclar na `main` até a homologação visual. O PR #83 continua rascunho e é a trilha experimental. O teste em navegador real complementa — não substitui — as medições do GitHub Actions.
