# SILM — Parte 7 | Auditoria real de versões MTEX e licença Zenodo do Cu P1700

**Data:** 07/11/2026. **Status:** código-fonte MATLAB rastreado por hash; metadados de licença do registro revisados; **nenhum mapa TrueEBSD experimental corrigido processado ou homologado**.

## 1. Evidência verificada por GitHub Actions

O workflow [#42343191699](https://github.com/qui-x/ligacoesmetalicas/actions/runs/42343191699) baixou **somente** dois scripts MATLAB pequenos e o JSON de metadados (não as imagens, o EBSD original nem o `example_copper_out.mat` de ~1,5 GB). A auditoria reproduzível está em `research/microstructure/audit_copper_mtex_sources.py`; um espelho compacto dos valores conferidos está em [`copper-mtex-source-verified.json`](../research/microstructure/copper-mtex-source-verified.json). Os arquivos-fonte dos autores não são redistribuídos pelo SILM.

| Origem | Referência imutável ou publicada | Bytes | MD5/SHA-256 verificados |
|---|---|---:|---|
| Zenodo [registro 16902083](https://zenodo.org/records/16902083) | `example_copper.m` publicado, MD5 declarado e conferido | 23.908 | MD5 `d6ddfa176463c989ee9721ea1f2ec8b4`; SHA-256 `76354919ba6d5c89f73778839aef2acf58944c5b805cff83c844ff2e3374de07` |
| GitHub [vtvivian/mtex-trueEbsd](https://github.com/vtvivian/mtex-trueEbsd) | commit fixo `c831df4843336c94983b1e897ccd409ea78634c5` | 26.798 | MD5 `50e0bfb79bdd997c31f0d0ad17835b42`; SHA-256 `853d7dd5d3dd94a20411638e5f17465b2e87aea8c487cc59a632014c7e26f31e` |

**Nova verificação estrutural (Actions #42343459602):** mesmo excluindo linhas vazias e linhas inteiramente comentadas, as sequências **não são iguais**. O comparador textual registrou **16 linhas não comentadas inseridas, nenhuma excluída e 58 linhas antigas versus 117 linhas novas em blocos substituídos**. Esse é um indicador verificável de alterações em linhas de código, mas **não uma contagem de mudanças semânticas**: comentários inline, reorganizações e formatação ainda podem afetar o resultado. Não declarar equivalência funcional nem identificar qual versão é mais correta somente com essa contagem.

**Conclusão:** os scripts diferem em bytes e tamanho. Ambos **mencionam** rotinas `pixelSizeMatch`, `calcShifts`, `undistort`, `calcGrains` e `boundaryContours`; nenhum menciona `trueEbsd2`. Isso **não** prova execução, equivalência de resultados ou semelhança de parâmetros. Já a [página MTEX atual](https://mtex-toolbox.github.io/example_copper_2.html) usa `trueEbsd2` e apresenta um roteiro de reconstrução de vazios com parâmetros explícitos. Logo há **três objetos distintos** a documentar: script depositado, revisão fixada do repositório e tutorial online atual.

**Política de reprodutibilidade:** para reproduzir o arquivo de saída publicado `example_copper_out.mat`, a **primeira** hipótese de referência é o `example_copper.m` depositado **no mesmo registro**. Comparar as versões fixadas antes de considerar o tutorial atual equivalente; não concluir que a saída depositada foi gerada pela revisão GitHub fixada ou pelo tutorial atual.

## 2. Informação nova sobre licença

A consulta efetiva ao endpoint de registro `https://zenodo.org/api/records/16902083` retornou no **campo legado `metadata.license.id`** o identificador `cc-by-4.0`; o campo `metadata.rights` veio ausente/nulo neste formato da API. Assim, a lacuna anterior não era prova de ausência de licença: **existe declaração de licença CC BY 4.0 na API do registro**.

O [Zenodo](https://help.zenodo.org/docs/deposit/describe-records/licenses/) explica o campo de licenças, e a [Creative Commons](https://creativecommons.org/licenses/by/4.0/) informa que a CC BY 4.0 permite compartilhar e adaptar obras licenciadas, observadas as condições de atribuição, link de licença, aviso de mudanças e restrições sobre direitos externos.

O SILM deve identificar autoria (Vivian Tong, Matthias Grabner e Manuel Petersmann, conforme o registro), título, DOI, licença CC BY 4.0 e alterações realizadas **quando reutilizar conteúdo efetivamente coberto**. É preciso confirmar escopo por arquivo, titularidade de imagens incorporadas, material de terceiros e obrigações pertinentes, sem supor que licença de software Apache-2.0 seja a mesma dos dados. **A auditoria não concedeu aprovação automática de publicação dos mapas derivados.**

## 3. Implicações científicas concretas

- EBSD bruto `copper29.h5oina` e mapa TrueEBSD corrigido não ocupam a mesma grade; primeiro é necessário obter o mapa corrigido **na área física correspondente** e as transformações verificadas.
- `trueEbsd2` do tutorial atual não pode ser tratado como rotina idêntica à cadeia `pixelSizeMatch → calcShifts → undistort` dos scripts versionados sem auditoria do algoritmo e dos parâmetros.
- A identificação de vazios com BSE deve continuar independente de pixels EBSD não indexados; não se inferem composição ou porcentagens de metal a partir dessas máscaras.
- O comparador do SILM só recebe mapas externos **já registrados numa grade comum**, com pontos independentes, máscaras, escala, versão da segmentação e auditoria manual. O teste sintético não demonstra alinhamento real nem mede tamanho médio ASTM.
- Até escolher a referência, obter os derivados autorizados e comparar mesmos campos, **nenhuma distribuição experimental de grãos** deve ser integrada à `main`, ao módulo `Grãos` ou aos cálculos do aplicativo.

## 4. Etapas seguintes

1. Comparar as **diferenças operacionais e parâmetros executados** do arquivo Zenodo com a revisão GitHub fixada e o tutorial `trueEbsd2` — usando fontes verificadas e sem republicar grandes blocos de código.
2. Selecionar uma sequência concreta com versão de MATLAB, MTEX e TrueEBSD, dependências e transformações registradas.
3. Obter uma exportação corrigida com controle de acesso e hash, mesmo campo físico, máscara BSE e resíduos da transformação. Não baixar automaticamente o arquivo `example_copper_out.mat` de 1,5 GB só para preencher essa lacuna.
4. Confrontar contornos sob método e amostragem equivalentes, separando efeitos do registro de diferenças nos algoritmos de segmentação.
5. Registrar créditos/licença por material derivado antes de disponibilizar imagens experimentalmente fundamentadas aos estudantes.

**Status do PR #73:** rascunho científico; nenhuma microestrutura experimental Cu homologada.
