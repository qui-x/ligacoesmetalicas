# SILM — Parte 5: seleção de grãos e mapas de composição de ligas
Data: 2026-11-05 · Status: contrato científico e primeiro protótipo didático.

## Objetivo
Na escala 2, ao selecionar um grão/área de uma liga metálica, apresentar seus elementos identificados, o elemento mais abundante **naquela região analisada** quando a evidência permitir e a distribuição do elemento em foco. Nunca reduzir a liga à identidade de um único elemento nem confundir grão, fase, precipitado e contorno.

## Semântica científica
- Um grão é uma região de orientação cristalográfica relativamente uniforme; sua composição pode ter vários elementos.
- Para identificar **elementos** e concentrações usar análise química espacial (ex.: SEM–EDS/EPMA). EBSD identifica orientações/fases e limites de grão; usar EDS+EBSD alinhados quando houver ambos.
- Contraste do mapa: **dentro do mesmo elemento e mesma amostra**, tom progressivamente mais escuro = maior sinal/concentração relativa. Não comparar tons de elementos diferentes como se tivessem a mesma escala absoluta.
- Mapa EDS de intensidade não é automaticamente composição em massa ou atômica. Só exibir **% em massa** ou **% atômica** se a fonte trouxer quantificação calibrada e unidade. Valores não medidos não são inventados.
- Contornos e inclusões podem ter enriquecimento mais localizado que o grão; a interface deve permitir uma região de interesse além de um grão inteiro quando existirem dados espaciais.
- **Metal puro de referência** do banco SILM != **liga ou fase em observação**. Ao navegar da escala 2 à rede atômica, identificar a qual fase corresponde o modelo, sem extrapolar a estrutura do elemento puro para toda a liga.
- Toda micrografia experimental precisa ter identificação da amostra, composição nominal, processo/tratamento, técnica, referência completa, licença, resolução/escala calibrada e origem da segmentação.

## Modos de evidência
1. `quantitative`: mapa químico com composição por região, unidade `wt_pct` ou `at_pct`, fonte e faixa de incerteza quando houver.
2. `qualitative`: mapa elementar de intensidade relativa/níveis (baixo, médio, alto) com fonte; **não** informar porcentagens.
3. `didactic`: grãos e composição inteiramente simulados, marca d’água/aviso permanente, **sem** barra de escala física.
4. `unavailable`: manter a seleção do grão, indicar que a composição não foi determinada e nunca preencher dados por palpite.

## Comportamento de interface
- Cena central ocupa o espaço disponível. Navegação de escalas permanece na faixa superior e zoom/seleção/concentração na barra inferior.
- Clique/Enter/Espaço em um grão: contorno de seleção de alto contraste + identificação da região; quando houver mapa, elementos detectados, predominância **regional**, intensidade relativa/percentual conforme evidência.
- Ação 'Mapa' alterna entre contornos e distribuição; selecionar A/B ou elemento real muda a cor/escala em TODA a cena; não altera dados científicos persistidos.
- Cores/tons distintos por elemento. **Mais escuro = mais do elemento selecionado**, com legenda explícita; o nível deve ser expresso também em texto e/ou padrões, nunca somente cor. Compatível com tema claro/escuro, daltonismo, alto contraste, teclado e toque.
- Se a região tiver valores semelhantes, declarar mistura sem predomínio inequívoco. Se o elemento não tiver sinal, declarar “não detectado” somente quando o método/limite de detecção sustentar isso; caso contrário “sem dado”.
- A experiência de laboratório livre, a geometria cristalina, as propriedades simultâneas e o histórico de investigação NÃO devem mudar ao alternar modos de apresentação.

## Primeiro protótipo implementável, sem falsificação de evidência
O visualizador de Voronoi existente não representa segmentação experimental. Ele pode ter uma demonstração independente de **liga A–B genérica**, com diferenças de intensidade **simuladas** entre regiões, apenas onde o programa estiver estudando um objeto de liga. Os rótulos A/B não são elementos químicos reais. Para mapas medidos, um futuro componente deve renderizar **a imagem original e sua segmentação alinhada**, e jamais ligar números experimentais a polígonos gerados aleatoriamente.

## Formato proposto para futuros mapas experimentais
```json
{
  "sampleId": "id-estavel",
  "label": "Amostra comprovada",
  "kind": "quantitative",
  "sourceId": "referencia-bibliografica",
  "imagePath": "assets/microstructures/amostra.webp",
  "segmentationPath": "assets/microstructures/amostra-segmentacao.json",
  "physicalScale": { "length": 50, "unit": "µm", "pixels": 220 },
  "techniques": ["SEM", "EDS", "EBSD"],
  "elements": ["Al", "Si", "Rb"],
  "measurementUnit": "wt_pct",
  "regions": [
    { "id": "r1", "kind": "grain", "composition": {"Al": 88.1, "Si": 11.9}, "sourceMeasured": true }
  ],
  "notes": "Valores de exemplo para o schema; proibido publicar como dados reais."
}
```

## Critérios de aceite
- Sem percentuais/escala sem medição; sem mistura aleatória publicada como experimento.
- Seleção por mouse, toque e teclado; contorno de alto contraste e estado por texto; reversível.
- Em amostra homogênea, nenhum mosaico de segregação fictícia.
- Validação da proveniência por região e unidades; fontes existentes na ficha.
- Navegação superior e toolbar inferior preservadas, sem perder o campo central.

## Fontes metodológicas
- Oxford Instruments, What information does EBSD provide?: https://www.ebsd.com/ebsd-applications/what-information-does-ebsd-provide
- Oxford Instruments, EBSD Integration with EDS: https://www.ebsd.com/ebsd-techniques/integration-with-eds
- Newbury & Bright (1998), Compositional Mapping by SEM/EDS — Facts and Artifacts: https://doi.org/10.1017/S1431927600020924
- EDS-PhaSe, mapeamento elementar e normalização da intensidade: https://www.osti.gov/pages/servlets/purl/2234285
