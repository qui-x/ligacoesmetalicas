# SILM — Integração científica da Etapa 65 (14/11/2026)

## Objetivo e escopo

A matriz consolidada `SILM_matriz_cientifica_etapa65_pesquisa.json` contém **230 perfis mecânicos para 65 elementos**, preservados das etapas anteriores, e é mais recente que a matriz Etapa 57 (211 perfis), a qual fundamentou a integração do PR #135. A Etapa 65 não acrescenta novos ensaios: a diferença acumulada é de **19 perfis**, oriundos das etapas 58 a 64. Esta operação integra somente esses acréscimos, mantendo os 138 registros de referência condicionais do PR #135 e os 12 ensaios Fe do NIST já publicados, sem alterar o motor numérico.

### Auditoria dos 19 perfis adicionais

| Natureza da evidência | Perfis | Critério de exibição |
|---|---:|---|
| Primários quantitativos, texto completo e condições conferidos: **Bi** | 2 | Mostrar em Explorar → Ductilidade, com 293 e 423 K explícitos |
| Quantitativos condicionais/documentais: **Co 2, Pu 2, Lu 1** | 5 | Mostrar com advertência detalhada da fonte, fase, caráter de limite e amostra |
| Tório **Th**, tabela universitária reproduzida por site de terceiro | 9 | **Não promover como valores conferidos**: rastrear em seção expansível “pendente de original”, sem inserir na lista numérica validada |
| Bi, mecanismo qualitativo a 298/423 K | 2 | Mostrar descrição sem alongamento inventado |
| Plutônio **α-Pu**, limite estrito de alongamento inferior a 0,1% | 1 | Mostrar como limite **<0,1%**, nunca como valor pontual |
| **Total** | **19** | **0 homologados em CNTP; 0 em motor** |

## Verificação primária independente dos dois novos perfis Bi

Meiqi Yu et al., *Tensile Properties of Bi Alloys and a Case Study for Alloy Design in Their Application to High Temperature Solders*, *Materials Transactions* 58(2), 140–147 (2017). DOI https://doi.org/10.2320/matertrans.MA201605. Texto primário aberto: https://www.jstage.jst.go.jp/article/matertrans/58/2/58_MA201605/_html/-char/en .

O artigo usa Bi metálico puro como **amostra de referência** diante das ligas Bi-Cu/Ag/Zn; não transferir os números das ligas para o metal elementar. Bi de alimentação 99,99%, fundido a 773 K, moldado e resfriado; corpo de prova de diâmetro 6 mm e comprimento útil 20 mm; taxa inicial `3,4×10⁻⁴ s⁻¹`, ensaio em **ar**. O texto do estudo fundamenta as duas linhas:

| Amostra | T ensaio | Escoamento 0,2% | Resistência máxima | Alongamento à ruptura |
|---|---:|---:|---:|---:|
| Bi elementar fundido | **293 K** | **7,5 MPa** | **12 MPa** | **0,7%** |
| Bi elementar fundido | **423 K** | **3,8 MPa** | **4,2 MPa** | **15,4%** |

O aumento de alongamento com a temperatura **é um resultado dessas amostras** e não autoriza interpolação automática entre 293 e 423 K, nem extrapolação para **273,15 K**. A pureza do precursor não equivale a pureza final certificada da peça, e a fonte não estabelece 101325 Pa exatamente.

## Outras evidências quantitativas condicionais, sem reclassificações artificiais

- **Co**: dois valores 4% e 8% de alongamento, reproduzidos por patente histórica https://patents.google.com/patent/US6921422B2/en ; **fase do ensaio não verificada**, e não podem ser chamados de valores de Co-HC por inferência.
- **Pu-β**: Dahlgren (1969), resumo editorial, relata alongamento **até 680%** do metal elementar na fase β. É máximo relatado sem série experimental completa; não é valor médio ou constante de Pu-α.
- **Pu-α**: revisão técnica do Los Alamos sobre Merz (1971/73) informa até **8% em tração** para peça extrudada/recristalizada de grão fino (1–3 µm), em temperatura ambiente não quantificada. Não generalizar para todo α-Pu.
- **Lu**: Savitskii, Terekhova e Naumkin (1963), Tabela XIII, p.136, relata **12% de plasticidade em compressão** para Lu fundido: https://ufn.ru/ufn63/ufn63_1/ufn631f.pdf . A tabela foi inspecionada historicamente, mas a temperatura numérica, a fase efetiva, a pureza e a taxa não estão completas. Não reclassificar como alongamento na ruptura.
- **α-Pu (Ianniello, 1964)**: <0,1% no resumo editorial é **limite estrito**, não 0,1% exato, zero, ou estimativa de outra fase.
- **Bi (Yanaka, 2018)**: mecanismos de maclação/escorregamento em monocristais a 298/423 K, sem percentual de ruptura recuperado. Contextual apenas.
- **Th**: nove perfis de extração/redução e recozimento/laminação têm números transcritos da Tabela 7.3 de livro Murty–Charit, mas a edição e a referência experimental original ainda **não** foram confrontadas. O programa os rastreia como **pendentes** sem exibi-los como evidências quantitativas verificadas. Não considerar nove novos estudos independentes.

## Aplicação no SILM

- Novo catálogo somente leitura `domain/silm/data/research-evidence-stage65.js`, com identificador original de cada um dos 19 perfis, amostra, fonte, temperatura, evidência, qualificador, categoria e nível de revisão.
- Mesma UI preexistente `domain/silm/research-evidence-panel.js` no módulo **Explorar → Ductilidade / Maleabilidade**; sem janela, aplicativo separado ou alteração da cena/microestrutura.
- Exibir 7 condicionais numéricos com suas advertências, 3 registros de contexto/limites em detalhes, 9 pendentes em detalhes de auditoria; não misturar categoria de limitação com a de ensaio numérico.
- Priorizar dados primários Bi nas consultas; preservar Fe NIST e outros 138 registros de Etapa 57. IDs independentes sem duplicações.
- **Bloqueios científicos imutáveis**: `CNTPhomologated=false`, `referenceOnly=true`, `engineRelease=false`. Módulos material-engine, electrothermal, thermal e data/bundle **não recebem** números desses registros.
- A referência do SILM é 273,15 K/101325 Pa; pesquisa experimental não é certificação automática nessa condição.
- Cache offline atualizado com o novo catálogo.

## Contratos/testes

1. `tests/stage65-mechanical-evidence.test.mjs`: contagem 19=7+9+3, fonte Bi e temperatura, Co histórico sem fase, Pu máximo ≠ média e α limite <0,1, Lu compressão ≠ tração, Th pendente.
2. `tests/run-stage65-mechanical-evidence.mjs`: E2E real em viewport desktop e mobile, **Chromium/Firefox/WebKit**, assegurando que painel e experimentos anteriores permanecem funcionais e não há calibração de motor.
3. Rotinas existentes continuam cobrindo scripts Fe NIST, contratos da Etapa 57, óptica e condução térmica, cache, regressões de microestrutura e roteiro.

## Próximos lotes científicos

A Etapa 65 contém **230 perfis totais**, mas isso não significa 230 resultados aptos para uso numérico em CNTP. Há **49/65 elementos com evidência de alongamento à ruptura pontual ou limite**, e **59/65 com candidatos R550 ópticos** (incluindo fontes secundárias e cálculos); faltam 16 e 6 respectivamente. A ampliação dos valores consultáveis deve priorizar materiais/condições verificadas e a eventual obtenção dos anexos primários ainda não recuperados; não se deve promover a simulação os registros categorizados como pendentes.
