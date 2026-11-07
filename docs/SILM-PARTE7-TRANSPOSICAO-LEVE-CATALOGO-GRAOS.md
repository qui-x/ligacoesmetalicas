# SILM — Parte 7 | Transposição leve do catálogo científico para a escala Grãos

**Data:** 07/11/2026. **Estágio:** implementação didática na branch de pesquisa (PR #73); **não converte bibliografia em micrografias experimentais**.

## Objetivo e decisão

Usar dados científicos **já catalogados** para dar significado investigativo ao percurso **Objeto → Grãos → Rede → Centro metálico**, sem exigir reconstrução EBSD/TrueEBSD e sem sobrecarregar a área central. A navegação mantém um **esquema de grãos genérico D0** e oferece informação contextual sob demanda no modal **Grãos → Dados → Estudos relacionados**.

O SILM não identifica a morfologia real dos grãos da aplicação ilustrada a partir do símbolo do metal. Forma e semente dos polígonos Voronoi são opções **didáticas independentes**, não resultados da literatura escolhida.

## Dados efetivamente transpostos

| Origem auditada | Uso no programa | Limite |
|---|---|---|
| 65 elementos e referências cristalográficas (`coverage-65.json`) | Rede de referência, fase, grupo espacial e fonte | Não implica mesma fase na liga ou no objeto |
| 65 contextos tecnológicos (`metal-atlas.js`) | Tipo de material, imagem ilustrativa e ressalva | Não é fotografia identificada de uma amostra real |
| 67 estudos/fontes candidatos de `coverage-65.json` | Título/identificação de material, técnica, conceitos investigados, advertência e URL clicável | Nem todos investigam grãos do metal puro; catalogados ≠ homologados |
| 20 ilustrações esquemáticas específicas | Repertório gráfico D0 já existente | Não derivam de contornos ou medições microscópicas |
| Procedimentos e análises preliminares Cu/Mg/Al | Preservados em `research/microstructure`, como evidência técnica em revisão | Não utilizados para gerar porcentagens, tamanho físico ou fases na interface |

A nova fonte em runtime é **`domain/silm/microstructure-study-context.js`**, construída a partir das 67 entradas e vinculada aos 65 símbolos por número atômico. O JavaScript inclui **apenas metadados textuais e links**, sem imagens ou arrays experimentais, e funciona offline com o PWA. Cada entrada continua `D0-literature-context-only`.

## Como o estudante observa

Ao investigar, por exemplo:
- **Cu:** a pesquisa sobre cobre policristalino (`EBSD+SEM`) aparece como estudo associado; os contornos no palco **não** são contornos da amostra P1700.
- **Mg:** a fonte sobre Mg–1Al/AZ31 aparece com a informação de que é **liga**. Não descreve a carcaça de notebook nem autoriza usar valores experimentais da liga no metal puro.
- **Fe:** estudos de aço e outros materiais que contêm ferro aparecem separados do modelo de ferro elementar, com classificação da amostra.
- **Ra/Ac e materiais compostos:** registros de minerais/radiomarcadores são apresentados como contexto relacionado ao elemento, **não** como microestrutura medida do metal elementar.

Para cada referência, a interface mostra **tipo de amostra**, **técnica de observação**, **até quatro conceitos** descritos por seu campo `supports`, uma ressalva e o link. Exemplos de conceitos: contornos de grão, orientação cristalográfica, identificação de fases, deformação e recristalização. A leitura é **descritiva**, não numericamente calibrada. Tópicos não catalogados são simplesmente omitidos, sem inventar conteúdo para preencher lacunas.

## Mecanismos de proteção

1. A lista inicia **recolhida** no modal Dados; a janela de desenho permanece integral.
2. A transposição é **independente de `microstructure-synthetic.js`**: clicar, abrir estudos, ampliar ou escolher tema não altera polígonos, semente, estrutura, propriedades ou estado de medição.
3. Todo gráfico D0 permanece `data-didactic-evidence-level="D0-schematic-conceptual"`, com `measurementStatus=unavailable` e sem escala física.
4. Um mapa segmentado **importado** permanece `imported-unverified`, mesmo que tenha estudo e escala declarados; nenhuma importação é D1/D2 automaticamente.
5. A amostra de liga, composto, superfície, nanopartícula ou radiomarcador **não** passa a representar o metal puro; toda referência conserva seu tipo de material e ressalva.
6. Nenhum teor de metal, fração de fases, tamanho ASTM, número de grãos ou área física é preenchido a partir de texto, cor, perfil ou estudo candidato.
7. Todos os títulos e comentários são inseridos com `textContent`, links são HTTPS e abertos com `noopener noreferrer`.
8. Testes cruzam os **67 registros**, todas as relações dos **65 elementos**, HTML, cache PWA e estados de interface. Auditoria em Chromium e Firefox; responsividade também avaliada em WebKit pela workflow existente.

## O que seria necessário para avançar além do D0

Para que um estudo influencie a **geometria específica do metal**, seria necessário documentar a condição da amostra, comprovar morfologia e tipo de processamento do material, estabelecer a representação qualitativa associada, revisar a imagem e suas permissões e registrar a correspondência com o caso de ensino. Para mostrar **medidas físicas**, exigir ainda escala, metodologia, amostragem e incertezas.

Portanto, a transposição leve **faz o catálogo científico informar o estudante**, sem fazê-lo parecer uma reconstrução experimental. O procedimento avançado MTEX/TrueEBSD continua disponível, mas não bloqueia a dimensão didática.

## Arquivos e conferência

- `domain/silm/microstructure-study-context.js`: metadados catalogados, rótulos e índices para 65 elementos.
- `domain/silm/microstructure-view.js`: painel recolhível em Dados (comportamento desktop/mobile).
- `domain/silm/workshop.css`: apresentação responsiva e acessível.
- `index.html` e `sw.js`: carregamento e cache offline.
- `tests/microstructure-study-context.test.cjs`: correspondência exata, classificação, tópicos e invariantes.
- `tests/run-workshop-micro-main.mjs`: interação real, fontes, abertura da lista e ausência de alteração geométrica e científica.

Documentos de suporte: [protocolo D0/D1/D2](SILM-PARTE7-PROTOCOLO-DIDATICO-CIENTIFICO.md) e [matriz de evidências dos 65](../research/microstructure/didactic-evidence-65.json).

**Conclusão:** há embasamento documental consultável para o **contexto** de todos os 65 elementos; há **zero** micrografias experimentais homologadas na interface e **zero** validações que permitam usar as 67 fontes para reproduzir automaticamente o formato real dos grãos.
