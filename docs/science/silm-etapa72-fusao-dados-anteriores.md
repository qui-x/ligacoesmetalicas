# SILM — Etapa 72: reconciliação das matrizes históricas de propriedades

Data 2026-11-14. **Pesquisa documental; não libera calibrações dos motores.**

## Dados recuperados de arquivos reais

- Planilha `silm_pesquisa_65_v08.xlsx`: 65 candidatos de condutividade térmica; 64 de resistividade, além das 64 condutividades derivadas.
- Confronto com `SILM_auditoria_cientifica_etapa30.xlsx`: os 65 valores térmicos e as 64 resistividades da triagem coincidem.
- Código `domain/silm/data/research-electrical-icepoint.js` na `main`: 29 observações de resistividade a 273,15 K para 24 metais (NBS/Matula/Chi), com 29 derivadas σ=1/ρ.
- Código `domain/silm/data/research-thermal-nist-295k.js`: 6 dados de k a 295 K (Al, Cd, Cu, Au, In, Pb).
- Planilha da Etapa 30: 58 registros de R550 para metal puro + 1 registro somente de liga Pu–Ga; Tc elementar soma 1 (Antonov et al., JETP 1988). Total de candidatos puros: 59.
- 230 perfis mecânicos anteriores preservados.

**Total de 317 observações documentais recuperadas**, não 317 ensaios independentes. Os 317 registros incluem cálculos derivados, candidatos de triagem sem fonte original individual e fontes alternativas por metal.

## Cobertura no arquivo reconciliado de 92 metais

| Propriedade | Metais com valor candidato |
|---|---:|
| Condutividade térmica (campo geral) | 78/92 |
| Resistividade elétrica (campo geral) | 69/92 |
| Condutividade elétrica (campo geral) | 69/92 |
| Módulo de Young | 19/92 |
| Refletância R550 do metal puro | 59/92 |

**Importante:** os totais não indicam cobertura experimental com prova em CNTP. O Hg tem referências térmicas *separadas por fase*, não preenchidas no campo geral. Os 12 superpesados bloqueados continuam sem dados homologados; Rf, embora estruturalmente disponível, segue sem condutividade térmica numérica rastreável.

## Política de integridade
- Dados de triagem foram marcados `LEGACY_SCREENING_SOURCE_UNTRACED`; não atribuídos a uma fonte primária inexistente.
- Ao ter dados NBS, Matula ou Chi a 273,15 K, esses são preferidos como referência documental, **não homologados em CNTP**, pois P individual e preparação não foram verificadas.
- Valores NIST a 295 K não são valores a 273,15 K.
- As unidades de resistividade `µΩ·cm` e `Ω·m` são normalizadas em `si_value` e `si_unit`, sem alterar a informação original.
- O registro de Pu–Ga **não** foi atribuído ao plutônio elementar.
- R550 de Tc foi derivado de n e k medidos em filme de 120 nm; não é uma medida direta de brilho.
- A óptica foi auditada matematicamente pelo modelo Fresnel nas 51 linhas com n,k da planilha de etapa 30.
- **Nenhum motor quantitativo ou eligibility foi alterado**, nem dados foram homologados novos em CNTP.

## Arquivos de trabalho
O arquivo completo de matriz JSON, CSVs, XLSX e gerador é entregue em anexo na conversa da Etapa 72. A presente nota documenta a revisão no PR #141; **não importa os registros para a interface publicada**.

## Próxima prioridade
Auditar fontes individuais dos candidatos de triagem, especialmente os que serão usados quantitativamente na aula. Não repetir pesquisa se a fonte já estiver nos arquivos originais; não substituir dados condicionais por médias genéricas.
