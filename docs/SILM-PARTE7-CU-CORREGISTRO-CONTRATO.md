# SILM — Parte 7: contrato de comparação corregistrada Cu / TrueEBSD

**Data:** 07/11/2026. **Estado:** verificador implementado e testado com dados exclusivamente sintéticos; **ainda não foi realizada comparação com o mapa TrueEBSD corrigido real.** Experimentos mantidos no PR #73 e fora da interface pública.

## Por que este contrato existe

O EBSD bruto P1700 tem grade 1031×547 e passo ~0,1 µm; o mapa alinhado apresentado pelo MTEX tem uma grade reamostrada (~0,050355 µm) e usa informações das imagens FSD/BSE. Comparar índices de pixel ou simplesmente redimensionar duas imagens confundiria diferenças da amostragem com diferenças da microestrutura. No exemplo da documentação [MTEX](https://mtex-toolbox.github.io/example_copper_2.html), os dados são corregistrados antes da análise dos vazios. A versão [example_copper.m](https://github.com/vtvivian/mtex-trueEbsd/blob/main/examples/example_copper.m) é um roteiro distinto e versionável; não supor que seus resultados sejam numericamente idênticos à página MTEX atual.

O validador `research/microstructure/validate_copper_correlative_pair.py` **não executa TrueEBSD** e **não corrige ou corregistra** os mapas. Ele só aceita *dois conjuntos de rótulos já transformados externamente* para uma **grade física comum**. A integridade do campo, da máscara e da transformação é verificada por contrato e necessita auditoria humana/experimental separada. O fornecimento de metadados preenchidos pelo operador não prova seu conteúdo.

## Entradas esperadas (somente em ambiente autorizado)

- `--metadata`: JSON de proveniência com `schema=silm.copper-correlative-pair.v1`, espécime P1700, DOI original e MD5 do HDF5 de origem; etapas distintas `raw-EBSD-reprojected` e `MTEX-TrueEBSD-corrected`; `commonGrid` (tamanho `shapeYX`, resolução `pixelSizeMicrometersYX`, origem `originMicrometersYX`), versão do TrueEBSD e procedência da exportação.
- `registration`: `samePhysicalFrame=true`, `appliedExternally=true`, método de corregistro diferente de `identity-assumed`, quadro físico de referência e SHA-256 do **registro externo da transformação retido para revisão**.
- `segmentation`: nome do algoritmo utilizado no bruto e no corrigido, limiares de desorientação e política de borda. Esta informação impede atribuir automaticamente todas as diferenças observadas à correção geométrica.
- `voidMask`: origem BSE, processamento `registered-BSE-threshold` e limiar normalizado explícito. A máscara **não pode ser substituída pelos pixels EBSD sem indexação**.
- `--raw-npz`: matrizes `grain_id` (inteiros, rótulos positivos para Cu), `indexed_cu` e `coverage` (booleanos).
- `--corrected-npz`: as mesmas matrizes **na exata mesma grade já corregistrada**, mais `bse_void` (booleano) derivado do BSE registrado. Por segurança, carregar os NPZ com `allow_pickle=False`.

As grades incompatíveis, rótulos inválidos, pontos de Cu fora da cobertura, máscara BSE sem procedência, origem/escala não declaradas, transformações não declaradas e hashes de origem inconsistentes devem ser recusados.

**Importante:** o SHA-256 não valida a qualidade do alinhamento. A correção precisa ser confrontada com resíduos, pontos de referência independentes e/ou o próprio campo de deslocamento TrueEBSD. O validador não interpreta um hash como prova de transformação correta.

## O que é comparado

- Pixels em interseção entre **duas máscaras Cu indexadas**, ambas com cobertura comprovada e fora da classe de vazio BSE;
- bordas de mudança de rótulo entre vizinhos da grade comum, usando somente pares de pixels elegíveis;
- correspondência descritiva das bordas a até um pixel da grade comum (precisão, revocação e F1), **não** uma precisão física experimental ou uma estatística homologada de grãos;
- contagem de pixels elegíveis e excluídos pela máscara BSE, sem classificar porcentagens químicas.

Os resultados mostram `registrationAssessment=metadata-declared; not independently verified`, `experimentalValidation=not-homologated` e `approvedForMain=false`. A saída exporta apenas agregados e advertências, **nunca arrays, imagens, polígonos ou máscaras**. Caso não haja contornos detectáveis em ambos os mapas, a métrica é indisponível (não inventar F1 ou precisão).

## Teste sintético e CI

- `tests/test_copper_correlative_pair.py` cria duas grades artificiais 24×24 com limites deslocados em um pixel, uma célula sem indexação e um pixel de BSE fictício;
- verifica aceitação somente com procedência completa, e recusa grades incompatíveis, máscara BSE sem fonte, hashes falsos, rótulos errados, coordenadas não justificadas e parâmetros ausentes;
- a workflow independente `.github/workflows/silm-copper-correlative-contract.yml` instala apenas bibliotecas numéricas e **não baixa HDF5 nem arquivos MATLAB de 1,5 GB**;
- os dados sintéticos são inteiramente fabricados e não devem ser apresentados como observações do material.

## O que falta para comparar dados realmente experimentais

1. Fixar commit/versão da referência MATLAB/MTEX e registrar comandos, opções, transformações e resíduos de cada etapa BC→FSD→BSE.
2. Reproduzir TrueEBSD por ambiente habilitado com MATLAB/MTEX ou obter exportação *autorizada* já corrigida da mesma amostra P1700, com escala, origem e máscara espacial rastreáveis.
3. Selecionar **a mesma área física** nos dois processamentos; aplicar/validar a transformação externa até alcançar uma grade comum, deixando claro quais pixels foram interpolados, modificados ou excluídos.
4. Exportar rótulos de grãos de cada etapa e máscara BSE alinhada para um ambiente de revisão seguro. Registrar método e parâmetros de segmentação e tratamento de regiões tocando o recorte.
5. Executar o portão comparativo, examinar erros/resíduos de alinhamento e segmentação, e somente depois calcular estatísticas científicas com amostragem e incerteza.
6. Resolver explicitamente licença e atribuição de imagens/dados/derivados antes de qualquer disponibilização pública.

**Não baixar automaticamente `example_copper_out.mat` de 1,5 GB nem publicar `copper29.h5oina`.** A licença de código Apache-2.0 do TrueEBSD não determina os direitos de redistribuição do dataset do Zenodo. Nenhum resultado dessa etapa autoriza valores de teor de Cu, distribuição populacional ASTM, volume de fases ou integração de mapas experimentais na interface pública.

**Fontes:** [MTEX TrueEBSD Cu](https://mtex-toolbox.github.io/example_copper_2.html), [repositório do código](https://github.com/vtvivian/mtex-trueEbsd), [dataset P1700](https://doi.org/10.5281/zenodo.16902083).
