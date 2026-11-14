# SILM — Auditoria óptica de 58 metais, Etapa 65

**Data:** 14/11/2026. **Origem:** matriz de pesquisa silm_65_pesquisa_v17.json, preservada até a Etapa 65. **CNTP SILM:** 273,15 K e 101325 Pa. **Homologações nesta etapa:** nenhuma.

## Inventário recuperado

A pesquisa anterior registrava **59/65 metais com candidato de refletância em 550 nm**. Um deles é Tc, já tratado experimentalmente pela Etapa 43 e integrado ao programa no PR #136. Esta entrega normaliza **59 fichas de 58 metais diferentes** sem duplicar Tc; há duas fichas de Am em substratos diferentes.

| Tipo de evidência antiga | Fichas | Grau de confirmação deste lote |
|---|---:|---|
| n,k de banco público, compêndio ou modelo: R calculado por Fresnel | **51** | Fórmula conferida; condições de fonte individual ainda não auditadas |
| R diretamente tabulada por fonte secundária de Sn | **1** | Não possui n,k nem garantia da fase α/β na referência CNTP |
| Leitura gráfica aproximada de Pr, Sm, Eu, Yb e duas amostras de Am | **6** | Faixa visual, não desvio-padrão ou medida exata |
| Interpolação de tabela de Hf monocristalino (4,2 K, E paralelo ao eixo c) | **1** | Fonte criogênica condicionada |
| **Total do novo catálogo** | **59** | **58 metais; 0 perfis liberados ao motor** |

Com Tc experimental publicado anteriormente, há candidatos documentais de **59 elementos**. **Ac, Pa, Np, Pu, Po e Ra** continuam sem refletância quantitativa admissível de metal elementar. Pu–Ga (0,5% Ga) é **liga** e não é convertido em dado de Pu puro.

## Métodos e limites

Para constantes n,k de um metal e interface ideal na incidência normal, R = ((n−1)²+k²)/((n+1)²+k²). A auditoria verificou **51/51 consistências aritméticas**. Isso NÃO confirma experimentalmente a temperatura, a pressão, a fase, o estado superficial ou a pureza de cada dataset. Não se deriva uma curva espectral de um único ponto a 550 nm; não se confunde a refletância ideal com brilho visual ou cor real do objeto.

Parte dos registros vem do repositório refractiveindex.info, descrito por Polyanskiy (2024), Scientific Data 11, artigo 94: https://doi.org/10.1038/s41597-023-02898-2 e https://github.com/polyanskiy/refractiveindex.info-database. O repositório compila datasets experimentais, modelos, fichas de fabricantes e referências. Outros registros vêm de Weaver (compilação histórica), AIP Handbook, patente para Ru/Re e dados minerais de Sn.

**Importante:** recuperar e preservar uma ficha da matriz anterior não equivale a revisar o arquivo primário em cada uma dessas 58 entradas. Por isso todos os perfis são **candidatos de pesquisa** e a ficha deve explicitar sua fonte, amostra e incerteza de interpretação. Os dados de Sc, Y e das terras raras a 4,2 K não são medidas CNTP. R lida de gráfico é uma estimativa visual e sua faixa NÃO é incerteza instrumental.

## Integração ao SILM

O catálogo imutável em domain/silm/data/research-optical-candidates-stage65.js guarda os 59 registros: ID, metal, origem, condição, amostra, n/k quando conhecidos, R550, status, erros de interpretação e link. O componente domain/silm/research-optical-candidates-panel.js apresenta a consulta **no controle já existente Explorar → Brilho metálico**, sem outro aplicativo ou tela. Para as duas amostras de Am, há um seletor. Cu e Tc conservam seus perfis ópticos próprios no motor; qualquer divergência bibliográfica permanece visível, não é normalizada por média arbitrária.

Todos os dados adicionais mantêm: referenceOnly=true; engineRelease=false; sourceOriginalChecked=false; temperatureAtCNTPVerified=false; pressureAtCNTPVerified=false. Nenhum valor entra no motor de brilho, na cena, nas cores, na microestrutura ou nos cálculos de outras propriedades. O service worker inclui os dois arquivos novos, com BUILD atualizado para uso offline.

## Portões

- Teste unitário: 58 metais, 59 fichas; classes 51+1+6+1, Fresnel 51/51, IDs únicos, sem Tc duplicado, Pu-Ga excluído, duas amostras Am, nenhum dado CNTP.
- Teste em navegador: Cu, Tc, Li, Pr, Hf, Sn, Am, Pu e Ac; seleção da fonte de Am; viewport desktop e mobile em Chromium, Firefox e WebKit.
- Regressões de microestrutura, roteiros, offline, painel de dados mecânicos e módulos elétrico/térmico.

**Próximo lote científico:** conferir diretamente cada arquivo YAML do refractiveindex.info e cada tabela AIP/Weaver para identificar dados experimentais, modelos de dispersão e características de amostra. Somente após essa checagem perfis realmente sustentados poderão alimentar o motor óptico condicional, SEM homologação automática na CNTP.
