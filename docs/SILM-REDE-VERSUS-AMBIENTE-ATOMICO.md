# SILM — Rede cristalina × ambiente atômico (proposta de revisão)

**Status:** especificação em discussão. Nenhum comportamento publicado foi alterado por este documento.

## 1. Diagnóstico da main (2026-11-06)

- A Oficina declara quatro escalas: objeto, microestrutura, rede/célula e ambiente atômico em `domain/silm/workshop.js`.
- `integracao/adapter.js#setWorkshopScale` usa, nas escalas 3 e 4, **a mesma rede cristalina** com `view:'lattice'` e `unitCell:true`.
- A escala 4 seleciona a primeira unidade ou mantém a unidade previamente selecionada, ativa `neighbors:true` e move o foco para o centro. A escala 3 normalmente desliga os vizinhos.
- `domain/silm/crystal-view.js` compartilha motor, navegação, cena 2D/3D e camada eletrônica nas duas escalas.
- Portanto o projeto ainda não oferece um contrato de interação visual e científico realmente distinto para a quarta escala.

## 2. Diferença epistemológica

### Rede e célula: a organização do sólido

Objeto: periodicidade, parâmetros de rede, sítios cristalográficos, empilhamentos, orientação, distâncias coletivas, deformação, transporte e relação estrutura–propriedade.

Pergunta orientadora: **como muitos centros metálicos se organizam e interagem no sólido?**

Visual: muitas células/sítios conectados pela repetição do padrão. A célula unitária pode ser realçada; a rede continua além da janela. Distribuição eletrônica coletiva, quando ativada, sem representar pares covalentes.

### Entorno atômico: o centro no interior da rede

Objeto: um **centro metálico pertencente à rede**, sua primeira/segunda vizinhança, número de coordenação, distâncias locais, simetria de entorno e efeito qualitativo de perturbações.

Pergunta orientadora: **quais são os vizinhos deste centro e como o entorno se relaciona com o sólido?**

Visual: zoom progressivo e centralização **do sítio escolhido**, centro nítido, primeira vizinhança evidente, rede externa atenuada — nunca apagada do modelo. Não criar um átomo fisicamente isolado ao tocar na escala 4. Célula unitária pode aparecer como referência contextual, não dominar a cena. Navegar entre centros não deve mudar propriedades nem montar uma rede alternativa.

### Átomo neutro isolado: consulta conceitual distinta

A configuração eletrônica `[gás nobre]...`, níveis e subníveis de referência são dados do **átomo neutro isolado**. Eles podem ser oferecidos numa aba/cartão `Átomo isolado (referência)`, claramente identificada como comparação conceitual; não são a distribuição eletrônica literal do centro no metal.

No sólido, elétrons de condução têm caráter deslocalizado. Não usar trajetórias orbitais tipo Bohr, atribuição simplista de `M+` para todos os metais, nem dividir o mar de elétrons em nuvens individuais exclusivas de cada centro. Representações qualitativas devem apresentar rótulo e limites do modelo.

## 3. Contrato proposto de interface

1. Navegação superior: manter quatro escalas e sua ordem. Rótulo expandido da quarta: **Entorno atômico**; abreviação acessível `Átomo` permitida em telas estreitas.
2. Cena na escala 3: foco na amostra e rede; controles de navegação na barra inferior; modo de visualização da célula e projeção.
3. Transição 3 → 4: manter metal, estrutura cristalina, propriedades, orientação quando útil e centro já selecionado; se não houver seleção, usar um sítio central visualmente representativo, preferindo centro inteiramente rodeado por vizinhos.
4. Cena na escala 4: enquadramento local do centro selecionado; primeira coordenação enfatizada; contexto cristalino atenuado. Abrir um painel compacto de informações científicas do sítio: símbolo, coordenadas/site, coordenação e distâncias somente quando derivadas do banco/modelo validado.
5. Troca de centro: clique/toque no sítio ou controles de navegação já existentes deslocam **o destaque/foco da própria rede**, não inserem marcadores irreais nem removem a estrutura.
6. Ação `Átomo isolado — referência`: abre comparação explicitamente separada; não altera a estrutura, propriedades, centro ou escala atual.
7. Retorno 4 → 3: recuperar enquadramento global da rede sem perder a seleção científica, se possível. Alternar visão 2D/3D e temas acessíveis em ambas.
8. O que pertence ao módulo `Medir` (números verificados) e `Calcular` (fórmulas/derivações) não aparece como resultado numérico inventado na visualização `Explorar`.

## 4. Regras científicas

- CCC/BCC: coordenação ideal 8; CFC/FCC e HC/HCP: 12 (para arranjos ideais homogêneos). Outros tipos devem usar seus próprios dados e modelos, sem pressupor esses três valores.
- Número de coordenação não é número de elétrons nem valência química. A primeira camada de coordenação não define, sozinha, a condutividade.
- Para ligas e grãos com composição mista: a identificação do elemento de um sítio depende de uma atribuição de ocupação **explícita e fundamentada**; um gradiente de cor de concentração por região não determina automaticamente a identidade de todos os átomos.
- Se faltarem dados de coordenação/sítio, mostrar `indisponível` ou `modelo ilustrativo`, jamais deduzir número arbitrário.
- Manter estado científico e estado de câmera separados; ampliar, selecionar ou ocultar camadas não deve mudar propriedades físico-químicas.

## 5. Implementação incremental sugerida (ainda não executada)

1. Separar um estado visual `focusScope = lattice | local`, sem duplicar `structure` ou motor de propriedades.
2. Introduzir `localEnvironment` somente como projeção da geometria: `selectedSite`, `neighbors`, `coordination`, `distances`, `provenance`.
3. Adicionar perfil de câmera de entorno local ao estado de representação, com migração compatível do esquema de persistência existente.
4. Reorganizar os comandos de tela e a seção de consulta do átomo isolado sem quebrar `Explorar/Medir/Calcular` nem a barra única.
5. Criar testes Playwright/Node para transições 3↔4, persistência da seleção, diferenciação visual, coordenação ideal CCC/CFC/HC, acessibilidade e viewport pequeno/altura curta.
6. Submeter mudanças de motor/UI em PR específico; não integrar sem a homologação de responsividade e teste científico.

## 6. Critérios de aceite

- A escala 3 tem uma vista coletiva dominante, enquanto a 4 mostra um centro e sua vizinhança sem fingir independência da rede.
- O mesmo elemento/sítio persiste quando o usuário troca a escala; os demais centros continuam referenciáveis.
- Não há salto inexplicável entre composição de grão, estrutura e entorno atômico.
- `Átomo isolado` aparece claramente como **referência** e não como a estrutura eletrônica literal do sólido.
- Retornar à escala 3 preserva a investigação e não recalcula propriedades.
- Todas as ações funcionam em mobile/desktop e modo de alto contraste, com foco e rótulos acessíveis.

## 7. Referências de suporte

- OpenStax, *University Physics Volume 3*, §9.3, Bonding in Crystalline Solids: https://openstax.org/books/university-physics-volume-3/pages/9-3-bonding-in-crystalline-solids
- OpenStax, *Chemistry: Atoms First 2e*, §10.5, The Solid State of Matter: https://openstax.org/books/chemistry-atoms-first-2e/pages/10-5-the-solid-state-of-matter
- LibreTexts, *Crystal Structures of Metals*, coordenação BCC/FCC/HCP: https://chem.libretexts.org/Courses/Lafayette_College/CHEM_212_213%3A_Inorganic_Chemistry_%28Nataro%29/03%3A_Solid_state/3.03%3A_Crystal_Structures_of_Metals
