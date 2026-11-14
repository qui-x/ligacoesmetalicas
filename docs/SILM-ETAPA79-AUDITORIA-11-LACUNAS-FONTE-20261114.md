# SILM — Etapa 79: fechamento da rastreabilidade das 11 triagens de Co/Hf/Ta/Tc/Th/Zr

**14 de novembro de 2026 — adendo ao PR #152 (Etapa 78).**

## Resultado

A consulta aos sete metais permite dados nas **condições originais das fontes** e não exige CNTP. Nesta revisão, as **11 observações com fonte individual ausente** foram substituídas por referências históricas ou institucionais rastreáveis, por vezes com **valores diferentes** da triagem por terem amostras e temperaturas específicas. Isso não quer dizer que onze novos experimentos foram feitos, que as amostras são mutuamente comparáveis ou que a simulabilidade quantitativa dos sete metais esteja homologada.

### Condutividade térmica — avaliação institucional, valores a 300 K

Origem: C. Y. Ho, R. W. Powell, P. E. Liley (1974), *Thermal Conductivity of the Elements: A Comprehensive Review*, `J. Phys. Chem. Ref. Data`, 3, suplemento 1: https://srd.nist.gov/JPCRD/jpcrdS1Vol3.pdf

| Metal | k [W/(m K)] | T [K] | Tabela | Categoria e ressalva |
|---|---:|---:|---|---|
| Co | 100 | 300 | 46 | Recomendação a partir de amostras de alta pureza recozidas; incerteza ~±5% perto de T ambiente |
| Hf | 23,0 | 300 | 65 | Recomendação sobre amostras com impurezas Zr (~1–2%); original diz não conhecer medidas de Hf de alta pureza; incerteza ~10% |
| Ta | 57,5 | 300 | 153 | Referência avaliada para Ta bem recozido de alta pureza |
| Tc | 50,7 | 300 | 155 | Referência avaliada de Tc policristalino recozido; estudo Baker (1965) com impurezas totais ~0,015%, faixa experimental 298–838 K; incerteza ~10% perto de 300 K |
| Th | 54,0 | 300 | 163 | **Recomendação provisória**; dispersão experimental acentuada entre estudos históricos |
| Zr | 22,7 | 300 | 184 | Referência avaliada de Zr policristalino recozido de alta pureza; não é a amostra Zr702 da pesquisa mecânica |

**Unidades da fonte:** tabelas em `W cm⁻¹ K⁻¹`; multiplicação por **100** para `W m⁻¹ K⁻¹`. Todos os pontos listados a **300 K** foram tabulados sem asterisco de extrapolação. Não confundir recomendação tabulada com medição individual.

**Limitação de leitura:** o arquivo institucional PDF de 1974 excedeu o tamanho aceito pelo serviço de captura de tela; conferimos as linhas e notas das tabelas na versão textual indexada, **sem reivindicar verificação visual de cada página**. Antes de marcar uma transcrição como prova primária visual auditada, abrir PDF integral em fluxo capaz de renderizar as páginas.

### Resistividade elétrica — amostras e métodos NÃO equivalentes

| Metal | ρ [Ω m] | T [K] | Natureza do resultado |
|---|---:|---:|---|
| Hf | 3,62934 × 10⁻⁷ | 295 | **Derivado de dados para amostra específica**: ρ₀=4,23 µΩ cm; ρ(295 K)/ρ₀=8,58 ⇒ 36,2934 µΩ cm. Compilação Ho/Powell/Liley 1974, seção Hafnium; amostra impura |
| Ta | 1,40 × 10⁻⁷ | 293 | **Medido**, Ta-1, técnica estacionária; NBS Report 10326 (1970), tabela 6, valor do trabalho atual 14,0 × 10⁻⁸ Ω m |
| Tc | 1,78 × 10⁻⁷ | 298,15 | **Calculado de ajuste experimental** de tecnécio-99 fundido a arco, 1967. Não é ponto medido independente na temperatura escolhida |
| Th | 2,75 × 10⁻⁷ | 293 | **Observação histórica contaminada por ThO₂** (27,5 µΩ cm), Powell [1111] citado por Ho/Powell/Liley, seção Thorium; não representa Th metálico de alta pureza |
| Zr | 4,80 × 10⁻⁷ | 293 | **Medido em amostra histórica** `Zr 1a`, nominalmente 99,99% Zr, bastão de 3 mm recozido a 950 °C; NBS SP-302 (1968), tabela `Specifications of the Specimens of Zirconium` com referência a Kemp/Klemens/White (1956) |

Fontes individuais:
- Hf e Th, Ho/Powell/Liley (1974), seções `Hafnium` e `Thorium`: https://srd.nist.gov/JPCRD/jpcrdS1Vol3.pdf
- Ta, *Interim Report on the Thermodynamics of Chemical Species Important to Rocket Technology*, NBS Report 10326 (1970), Tabela 6: https://www.govinfo.gov/content/pkg/GOVPUB-C13-ecb1ff3081f263995459fd01817d7e23/pdf/GOVPUB-C13-ecb1ff3081f263995459fd01817d7e23.pdf
- Tc, *The electrical resistivity of technetium from 8.0° to 1700° K*, *J. Less-Common Metals*, 12(1), 29–35 (1967), DOI https://doi.org/10.1016/0022-5088(67)90065-3. Acesso ao resumo e à equação; texto integral não obtido.
- Zr, *Thermal Conductivity — Seventh Conference*, NBS Special Publication 302 (1968), especificação de corpos de prova: https://nvlpubs.nist.gov/nistpubs/Legacy/SP/nbsspecialpublication302.pdf

**Equação Tc do resumo experimental** (`T` em kelvins, `ρ` em µΩ cm):
```text
ρ(T) = -3.191 + 0.07844*T - 2.816e-5*T*T + 4.038e-9*T*T*T
ρ(298.15 K) ≈ 17.79966865 µΩ cm ≈ 1.78e-7 Ω m
```
O resumo anuncia erro experimental nominal da ordem de ±3–4%. Esse erro não certifica automaticamente o valor derivado na amostra de outro trabalho.

## Riscos e portões de homologação mantidos

1. Registros de referência são **específicos** da fonte. Valores experimentais, recomendações avaliadas, compilações, derivados de funções e amostras contaminadas apresentam notas diferentes.
2. O catálogo aponta `sourceURL` para as 35 referências das Etapas 78–79; **0 registros permanecem com fonte inteiramente ausente** neste catálogo. A rastreabilidade mínima **não** significa que toda fonte original foi lida integralmente. Os dados secundários Th de mecânica continuam pendentes, assim como fontes ópticas.
3. Nenhum dos 35 registros ganha `engineRelease=true` ou `calibrationApproved=true`. A mudança adotada pelo usuário é **deixar de exigir CNTP como requisito geral**, não permitir usar dados de uma amostra para outra indistintamente.
4. No painel existente `Explorar → Propriedades`, a categoria da fonte aparece ao lado do valor e da condição. O programa deve continuar selecionando os 7 metais e 5 categorias, sem abrir painel independente.
5. A próxima fase deve cruzar os dados com os parâmetros científicos dos motores, incluindo domínio de validade, tipo de superfície para óptica e amostras mecânicas; se houver discrepância, manter múltiplas fichas em vez de substituir silenciosamente valores.

**Resultado formal desta etapa:** 11 lacunas de *rastreabilidade de referência* preenchidas por referências identificáveis; **zero novas curvas completas homologadas para motores quantitativos**.
