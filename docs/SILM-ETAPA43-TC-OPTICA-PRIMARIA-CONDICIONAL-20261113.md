# SILM — Primeiro lote óptico condicionado: Tc(0001), pesquisa Etapa 43

Data: 13/11/2026. Condição de referência do SILM: 273,15 K / 101325 Pa. **Este lote NÃO homologa nenhum parâmetro óptico na CNTP.**

## Origem primária e tipo de amostra

Antonov, V. N.; Kirillova, M. M.; Krasovskii, E. E.; Ponosov, Yu. S. "Electron structure and optical properties of technetium", Soviet Physics JETP **67**(9), 1842–1845 (1988), **Tabela I, página 1843**. Documento: https://jetp.ras.ru/cgi-bin/dn/e_067_09_1842.pdf

O artigo apresenta as constantes n e k **experimentais** do 99Tc metálico em filme fino de 120 nm com orientação basal Tc(0001), estrutura hexagonal compacta; medição por polarimetria de Beattie em câmara de vácuo. A temperatura efetiva de MEDIÇÃO não foi informada numericamente. A preparação em substrato inicialmente resfriado não autoriza atribuir temperatura criogênica à medição óptica. Pressão de MEDIÇÃO não foi informada em Pa. A precisão citada para n,k de 2–3% não é barra estatística calibrada para a refletância.

## Dados n,k reaproveitados da matriz de pesquisa Etapa 43

| Comprimento de onda (nm) | n experimental | k experimental |
|---|---:|---:|
| 500 | 3,24 | 4,11 |
| 510 | 3,26 | 4,13 |
| 520 | 3,30 | 4,14 |
| 530 | 3,32 | 4,17 |
| 540 | 3,34 | 4,18 |
| 550 | **3,36** | **4,21** |
| 560 | 3,39 | 4,23 |
| 570 | 3,42 | 4,25 |
| 580 | 3,44 | 4,26 |
| 590 | 3,46 | 4,28 |
| 600 | 3,47 | 4,29 |

Para incidência normal, a refletância calculada para interface ideal ar–metal semi-infinita é R = ((n−1)² + k²) / ((n+1)² + k²) = **0,6341234343**, ou **63,41% em 550 nm**. **R não foi medido diretamente nessa faixa pelo estudo.** Esta relação pressupõe superfície lisa, geometria de Fresnel e ausência de óxidos e filmes adicionais. R(550) sozinho não estabelece brilho visual, intensidade percebida ou cor de objetos cotidianos.

## Uso integrado no módulo Explorar

- Registro em \`domain/silm/data/material-profile-tc-experimental-1988.js\` no **mesmo mecanismo geral já usado pelo Cu**. Não há segundo motor ou tela de aplicações.
- O controle **Brilho metálico** mostra somente o canal 550 nm quando os canais da interface são 450, 550 e 650 nm; em 450 e 650 não há dados de Tc recuperados no intervalo 500–600, por isso aparecem como **"Sem medição nesta faixa"**, sem extrapolação nem percentuais artificiais. Os três canais originais de Cu permanecem.
- O aluno pode investigar ângulos permitidos pelo modelo genérico de Fresnel; resultados não são medições de ângulo pela publicação. Interpolação de n,k só dentro de 500–600 nm.
- Link para a referência original no próprio controle.
- Fonte sem DOI cadastrado: registrar URL https verificável, título, autores, ano e Tabela I, sem criar DOI fictício.
- \`materialEngine.optical(43,550,0)\` fornece R **somente como referência óptica condicional**; \`materialEngine.opticalForReference(43,550)\` deve responder **CONDITIONS_UNVERIFIED**. As rotinas de cor de objetos, microrrede, eletricidade, calor, microestrutura e cache científico de outros elementos não recebem valor novo.

## Térmica e elétrica — decisão da auditoria anterior

A etapa 30 relatou 65 candidatos térmicos (64 sem temperatura experimental individual; Po estimado a 300 K) e 64 resistividades candidatas (Ac sem número; intervalos de 40 a 293 K, 5 a 273 K, 2 a 295 K ou não informados). A revisão foi integral quanto à integridade matemática, mas **parcial quanto às publicações primárias**, sem parâmetro novo aprovado a exatamente 273,15 K e 101325 Pa.

**NÃO** transferir esses candidatos para \`material-profile-registry.js\` como dados CNTP, \`material-engine.js\` como calibração Joule ou \`domain/silm/thermal.js\` como condutividade medida. Referências de outros materiais exigem pureza, fase e curva T ou ponto no intervalo correto e condição de pressão. Uma ficha térmica do NIST próxima de 295 K continua não sendo uma medição a 273,15 K.

A matriz óptica da etapa 58 conserva 59/65 candidatos elementares R550, mas **apenas este conjunto Tc aqui foi habilitado como consulta quantitativa condicional nesta integração**, além do exemplo Cu já existente; nenhum dos outros candidatos é promovido.

## Portões e validação

- Testes científicos: Tc R550 n=3,36 k=4,21, R=0,6341234343, limites 500–600, proibição de 450/650, estado CNTP rejeitado; Cu permanece ativo.
- UI e acessibilidade: painel existente \`domain/silm/property-view.js\`, rótulos legíveis e fonte externa, aparência clara/escura e mobile.
- E2E em Chromium, Firefox, WebKit e viewport desktop/mobile.
- Cache offline inclui o novo arquivo JS e atualização explícita do BUILD.

**Próximo bloco:** auditoria primária por metal e temperatura de condutividade elétrica/resistividade e térmica da matriz de 65; somente então publicar perfis compatíveis com condições do motor.