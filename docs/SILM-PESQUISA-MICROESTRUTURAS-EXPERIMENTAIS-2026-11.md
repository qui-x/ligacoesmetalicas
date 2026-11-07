# SILM — Prospecção experimental de microestruturas (2026-11-07)

**Status:** pesquisa documental preliminar verificada em páginas de repositórios científicos; arquivos originais e direitos individuais pendentes de auditoria. Não é homologação nem autorização para incorporação automática ao SILM.

## Decisão e objetivo

A primeira etapa, gerador *esquemático* Voronoi com seed/perfis reprodutíveis, está separada desta investigação. A próxima etapa deve parametrizar **modelos estatísticos por material, liga, processo e condição**, sempre indicando limites de amostragem e procedência.

**Não confundir:**
1. **Grãos:** orientação, contorno, tamanho, vizinhança e textura (EBSD / microscopia calibrada com segmentação).
2. **Fases:** austenita, martensita, carbonetos etc. Percentual de fase depende de segmentação validada e metodologia de amostragem.
3. **Inclusões e precipitados:** objetos microestruturais que não são necessariamente grãos; composição por EDS se refere à região analisada, não a cada grão do metal.
4. **Elementos químicos:** composição local só quando houve medição composicional, como EDS/EPMA, com unidades (wt%/at%), calibração e incerteza.
5. **Estrutura cristalina:** CCC/CFC/HC do material ou da fase, não deduzível apenas pelo contraste da imagem.

## Fontes candidatas identificadas

| Material | Dataset e DOI | Evidência disponível | Aplicação possível no SILM | Restrições e verificações antes de uso |
|---|---|---|---|---|
| **Cu policristalino** | NPL/Tong et al., TrueEBSD, https://doi.org/10.5281/zenodo.16902083 | Mapa EBSD + imagens e metadados `copper29.h5oina` (~163,7 MB), script MTEX | Exemplo-piloto para **contornos e orientações de grãos**, caso calibração, licença e conversão sejam confirmadas | Verificar escalas do arquivo, limites de regiões, ocupação, orientação/ângulos, licença e se contornos podem ser derivados |
| **Mg — AZ31 e Mg–1Al** | Yang et al., https://doi.org/10.5281/zenodo.10225600; artigo https://doi.org/10.1038/s41524-024-01212-x | EBSD com **2640 grãos AZ31** e **1496 grãos Mg–1Al**, 31 variáveis; ECD em µm, vizinhança, contorno, condição de deformação | **Primeiro candidato para modelo estatístico por distribuição medida**, distinguindo liga e processamento | Planilhas não contêm necessariamente polígonos/posições para reconstruir a mesma imagem. Excluir grãos de borda `Near_edge` conforme método publicado; verificar direito de reutilização e filtros |
| **Ti–6Al–4V aditivo** | Unicamp, https://doi.org/10.25824/redu/GMDYI0 | Dados experimentais de EBSD, MEV, porosidade, dureza e tração; condições com e sem refusão | Comparar formação microestrutural, fase e propriedades **da liga e do processamento estudados** | **CC BY-NC 4.0** no repositório: avaliar compatibilidade/redistribuição antes de incluir assets no projeto GPL; separar grãos, fases e poros |
| **Ti–6Al–4V laminado** | Zeng/Quinta da Fonseca, https://doi.org/10.5281/zenodo.6554355 | Mapas EBSD em 9 temperaturas e 3 reduções principais; corte longitudinal e transversal, reconstrução de beta em parte dos casos | Textura e morfologia dependentes do estado termomecânico | ZIP de ~3,2 GB; licença específica, convenção de referência, parâmetros, taxas de amostragem e algoritmo de reconstrução a validar |
| **Ni puro** | RWTH Aachen, https://doi.org/10.5281/zenodo.21870683 | 4 arquivos OH5 de EBSD para Ni, com comparação 10/20 kV e filtragem de energia | **Segundo metal puro** para validar amostragem de contornos, após Cu | Arquivos individuais ~1,6 a 5,6 GB; distintos parâmetros de aquisição não representam condições de material diferentes; requisitos de extração e licença |
| **Aço — metalografia** | Fraunhofer, https://doi.org/10.24406/fordatis/258 | Imagens ópticas de aço em avaliação interlaboratorial de tipo de microestrutura e tamanho de grão; ZIP ~27,7 MB | Estudos de concordância de classificações e leitura qualitativa | Imagens e avaliação não equivalem a máscara individual de grãos nem fornecem teor químico; verificar licença e escala antes de qualquer medição |
| **Ferro fundido alto Cr** | Saarland University, https://doi.org/10.5281/zenodo.21931379 | 777 micrografias SEM da liga com 26% em massa Cr, 12 máscaras manuais correlacionadas e metadados com tamanho de pixel; até sete **classes de fase** | Futuro piloto de **frações de constituintes/fases**, nunca percentuais de elemento por tonalidade | Arquivo ~4,3 GB; classe segmentada é fase, não grão; direitos, identificação de constituintes e incerteza de segmentação |
| **Aço Ti-ULC — inclusões** | Montanuniversität Leoben, https://doi.org/10.5281/zenodo.20758431 | Imagens SEM/BSE e `eds.json` de **17 elementos em wt%**, pixel de 0,33 µm; rótulos de inclusões verdadeiras/falsas | Futuro módulo para **composição local de inclusões**, não composição de grãos | Dados de inclusões não podem ser tratados como fases cristalinas do aço nem gradientes químicos de seus grãos; requer revisão de semiquantificação EDS |

As fontes acima foram verificadas por páginas oficiais e resumos dos respectivos repositórios. **Não houve inspeção integral dos arquivos experimentais** nesta rodada. Nenhum arquivo bruto foi inserido no repositório.

## Prioridade da auditoria experimental

**P1 — Magnésio AZ31/Mg–1Al.** Poucos MB de tabelas contendo várias milhares de caracterizações individuais. Permite validar o pipeline de estatísticas com `ECD`, distribuição, condições de deformação, vizinhos e filtros. Não inventar uma imagem espacial de EBSD correspondente aos registros agregados.

**P2 — Cobre puro NPL.** Fonte EBSD de metal elementar, útil para contornos reais, calibrar leitura/extração de dados e testar preservação da origem em imagens renderizadas. Conferir formato HDF5 `.h5oina` antes de prometer importação.

**P3 — Amostras Ti–6Al–4V, Unicamp + Manchester.** Verificar estado, método, textura, microestrutura e relação com propriedades. O conjunto Unicamp é CC BY-NC; não incorporar material licenciado na distribuição sem analisar as condições de uso.

**P4 — Ni puro e aços.** Aumentar diversidade de metais puros e fases/sistemas complexos; evitar comparar condições distintas como se fossem propriedades intrínsecas do elemento.

**P5 — Dados composicionais de inclusões.** Usar as medições de EDS no futuro para diferenciar concentração verdadeira e contraste visual. Não mapear essas composições para grãos sem correspondência espacial medida.

## Contrato mínimo por conjunto apto a integração

- Material: símbolo de **elemento principal**, composição da liga (at%/wt%), fase(s), identificador da amostra, origem de fabricação, processamento e estado.
- Imagem ou mapa: técnica (EBSD/SEM/BSE/optical), formato bruto, orientação do corte, resolução, distância física por pixel e método/artefato da calibração.
- Segmentação: grão/fase/inclusão **explicitamente tipado**, método de extração, critério de limiar/contorno, contagem, bordas, defeitos, qualidade.
- Estatísticas: nome científico, unidade, população, número de amostras, filtros, distribuição, incerteza, referência e condição de contorno.
- Licenciamento: licença exata, atribuição, permissão de redistribuição, eventuais restrições NC/ND e autores; manter um manifesto de direitos.
- Proveniência técnica: DOI/URL, arquivo, versão, hash de integridade, parâmetros e script reexecutável, resultado testado. Registrar quem fez a homologação.
- Saída: JSON versionado de `metadados` e `medidas` e artefatos otimizados para o browser, sem expor arquivos de GB na PWA; dados brutos preservados fora do `main`.

## Roteiro de execução

1. Conferir licença, metadados, integridade e unidades de uma fonte P1. Separar os dois grupos de Mg e estados de deformação.
2. Extrair estatísticas reproduzíveis: distribuição de ECD, quartis, variabilidade e vizinhos, registrando filtros e tamanho da amostra. Reproduzir os cálculos via script e GitHub Actions (artefato; revisão antes de publicar).
3. Comparar resultados com o artigo de origem, registrar divergências e limites de validade.
4. Criar **perfil estatisticamente fundamentado** como opção separada de `esquemático`; permitir várias sementes que preservem apenas as distribuições e restrições validadas. Nunca chamar o desenho sintético de micrografia experimental.
5. Realizar piloto Cu com contornos EBSD para rastrear a geometria real e comparar modelo sintético versus experimental.
6. Expandir para metais e ligas adicionais por critérios científicos explícitos. Não prometer percentuais de cobertura antes de auditar a disponibilidade das fontes.
7. Medir/Calcular: abrir somente métricas e equações com suporte científico, incerteza documentada e rastreabilidade.

## Referências e fontes dos dados

- NPL / cobre EBSD: https://zenodo.org/records/16902083
- Yang et al., magnésio: https://zenodo.org/records/10225600
- Fujii/Hassui, UNICAMP Ti6Al4V: https://redu.unicamp.br/dataset.xhtml?persistentId=doi:10.25824/redu/GMDYI0
- Zeng et al., Ti6Al4V laminado: https://zenodo.org/records/6554355
- Berners et al., Ni: https://zenodo.org/records/21870683
- Fraunhofer IWM aço: https://fordatis.fraunhofer.de/handle/fordatis/321?locale=en
- Bachmann et al., ferro fundido alto Cr: https://zenodo.org/records/21931379
- Musi et al., inclusões em aço: https://zenodo.org/records/20758431

**Nota:** este documento é uma triagem de fontes, não uma liberação de uso de dados. Revisar metadados e licenças arquivo a arquivo antes de integrar dados/figuras ao código público.
