# SILM — Etapa 77: contrato constitutivo para tração e compressão

**14/11/2026.** Escopo: ponte entre a pesquisa de propriedades (Etapas 72–76) e os controles já existentes de `Explorar → Maleabilidade / Ductilidade`. Esta etapa **não homologa nenhum metal quantitativamente**, não substitui os controladores de deslizamento e não altera o formato de estado persistido.

## Reaproveitamento da main

- `domain/silm/deformation.js`: o controlador geral de deformação já utiliza o mesmo modelo, limites de quatro passos e mesma investigação para microestrutura, rede e célula.
- `domain/silm/microstructure-view.js`: transforma graficamente o conjunto de grãos (fonte esquemática sem escala `µm` e sem EBSD). Mantemos a seleção, o zoom, a interatividade e os controles existentes.
- `domain/silm/material-profile-registry.js`: perfis imutáveis por número atômico. A Etapa 77 apenas consulta `profile.mechanical?.malleability/ductility`; não registra valores fictícios de metais.
- `domain/silm/reference-conditions.js`: referência brasileira da pesquisa do SILM em **273,15 K e 101325 Pa**.

## Núcleo matemático implementado

Uma **redução uniaxial, de pequenas deformações**, do problema elastoplástico com encruamento isotrópico linear. Para incremento do valor de deformação total `ε(n+1)`:

```text
sigma_trial = E * (epsilon_next - epsilon_plastic_previous)
f_trial = abs(sigma_trial) - (sigma_y0 + H * alpha_previous)
if f_trial <= 0:
    sigma = sigma_trial; delta_gamma=0
else:
    delta_gamma = f_trial / (E+H)
    epsilon_plastic_next = epsilon_plastic_previous + sign(sigma_trial)*delta_gamma
    alpha_next = alpha_previous + delta_gamma
    sigma = E*(epsilon_next - epsilon_plastic_next)
```

Onde `E` é o módulo de Young, `σy0` é o início do escoamento na condição da amostra, `H` a taxa de encruamento linear e `α` a deformação plástica acumulada. A deformação **máxima permitida numericamente** por este protótipo é `abs(ε) <= 0,10`, escolhida como domínio de **pequenas deformações**; não é falha mecânica de nenhum metal. O algoritmo **nunca prevê fratura**. O estado `initialState` mantém `σ=ε=εp=α=0`.

**Limitações:** 1D (não calcula tensores 3D, elasticidade anisotrópica, não modela maclação, velocidade de deformação, temperatura, nucleação de discordâncias ou recristalização). A redução de um J2 isotrópico não é plasticidade cristalina de CCC/CFC/HC. Para curvas reais será necessário adaptar ao material, à microestrutura e ao ensaio.

A saída `visualEnvelope` é separada das unidades físicas. Utiliza deformação plástica ilustrativa `Fp=diag(exp(-ε/2), exp(-ε/2), exp(ε))` para mostrar um corte bidimensional da microestrutura, com `det(Fp)=1`. `ε` aqui é gerado apenas pelo **passo didático**, e não é identificável como deformação medida; o `scaleOutOfPlane` representa a profundidade não desenhada.

## Portão de liberação para curvas de metais

Somente `SILM.materialProfiles.get(Z).mechanical.[malleability|ductility]` pode fornecer um perfil.

1. Exige `evidence='EXPERIMENTAL_CALIBRATED'`, `engineRelease=true`, `calibrationApproved=true`, `sourceOriginalChecked=true` e `CNTPValidated=true`.
2. Exige fonte com título, autores, ano, identificação da amostra, DOI/URL; e dados de calibração rastreáveis.
3. Exige amostra com **fase**, formato, composição/pureza descrita, histórico de processamento, orientação e lote.
4. Exige **parâmetros físicos separados** `youngModulusPa`, `yieldStressPa`, `hardeningModulusPa` válidos e `verifiedModes` incluindo explicitamente compressão ou tração.
5. Confere condições junto de `SILM.referenceConditions.compare`. Valores de temperatura/pressão desconhecidos, dados a 295/300 K ou outra pressão não são declarados CNTP por extrapolação.
6. Sem qualquer um dos requisitos, retorna `NO_CALIBRATED_STRESS_STRAIN_CURVE` / `PROFILE_NOT_APPROVED`, jamais valores substitutos de Cu ou de fontes secundárias.

**Nenhum dos registros das Etapas 65, 72, 73, 75 ou 76 é liberado para este algoritmo.** Dureza não substitui limite de escoamento; redução de laminação não substitui deformação de ruptura; compressão não substitui ensaio de tração.

## Integração e acessibilidade

- Carregado em `index.html` antes de `deformation.js`, preservando a ordem científica e o estado `schemaVersion=8`.
- O controlador expõe `reading().constitutive`, uma avaliação **somente leitura** da possibilidade de cálculo para o metal e a propriedade ativos. Isso não mapeia força relativa (0–100%) para MPa.
- O desenho da microestrutura consulta `visualEnvelope` para o mesmo `step` e `load` do controlador; seu status informa a falta de curva homologada. Não aparece painel externo ou fluxo paralelo.
- `sw.js` inclui o módulo para utilização offline e revisão da chave de cache.

## Testes a executar

O arquivo `tests/stage77-constitutive-contract.test.cjs` confere:

- nenhum valor sob ausência de perfil e bloqueio para fontes/condições incompletas;
- elasticidade, início de escoamento, encruamento, descarregamento e inversão de carga com **parâmetros fictícios de teste**, explicitamente não atribuídos ao cobre ou outro metal;
- simetria tração/compressão no benchmark isotrópico e rejeição de domínio inválido;
- conservação de volume ilustrativa e integração com HTML, SW, controlador e microestrutura.

A etapa inclui workflow próprio de auditoria; a aprovação não equivale à validação de curvas reais de todos os metais.

## Referências metodológicas

- Sandia National Laboratories, **LAMÉ — J2 Plasticity Model** (algoritmo preditor-corretor e retorno radial): https://www.sandia.gov/files/sierra/SM_LAME_5_28/main/models/j2_plasticity.html
- ASM, **Elements of Metallurgy and Engineering Alloys — Deformation Processes**, seção Cold Working (encruamento e grãos deformados): https://materialsdata.nist.gov/bitstream/handle/11115/178/Deformation%20Processes.pdf

## Próxima etapa

Pesquisar parâmetros `E`, `σy`, `H` do **mesmo ensaio e mesma amostra** em condições aferidas; calibrar e testar curvas reais antes de qualquer aplicação aos metais. Implementar depois efeitos de taxa, temperatura, geometria de corpo de prova, múltiplos mecanismos cristalinos e condições de falha, um por vez.
