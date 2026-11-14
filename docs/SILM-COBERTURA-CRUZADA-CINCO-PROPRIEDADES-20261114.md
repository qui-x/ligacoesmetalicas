# SILM — Cobertura cruzada das cinco propriedades metálicas (14/11/2026)

## Resultado e universo

A pesquisa científica chegou à **Etapa 72**, cujo arquivo `SILM_matriz_cientifica_92_metais_etapa72_reconciliada.json` abrange **92 metais** classificados como metálicos pelo SILM. **Etapa 72 não significa 72 elementos.** O usuário definiu uma seleção de **72 metais** como universo de interesse, mas sua lista de símbolos **não está identificada nos documentos consolidados**. É proibido escolher os sete extras em relação à pesquisa antiga de 65 sem critério fornecido; o resultado próprio do grupo de 72 só pode ser calculado após identificar exatamente seus membros.

Na base publicada `domain/silm/data/bundle.js`, há 118 elementos, 92 classificados como metálicos, **79 investigáveis** e **13 bloqueados**; entre os 79 ativos há **14 limitados à estrutura** e 65 com escopo geral de investigação. Isso não equivale a ter 65 perfis quantitativos completos.

## Matriz com critérios explícitos (contagem sobre 92)

| Indicador | Metais | Critério do cruzamento |
|---|---:|---|
| Resistividade elétrica total | **69** | Pelo menos um valor candidato, inclusive triagem histórica sem fonte individual rastreada |
| Condutividade térmica | **78** | Pelo menos um valor candidato, incluindo dados estimados ou compilados |
| Ductilidade — alongamento percentual pontual na ruptura | **48** | Pelo menos um perfil de tração com alongamento percentual numérico |
| Ductilidade — apenas limite adicional | **1** | Cr, limite estrito separado, não valor de ensaio pontual |
| Compressão com deformação numérica | **3** | Co, Ta, Lu; experimento específico, não valor universal de maleabilidade |
| Histórico numérico de laminação | **5** | Er, Hf, Tc, Th, Zr; **não** é limite de maleabilidade |
| Brilho — candidato de R550 para metal puro | **59** | Refletância pontual em 550 nm; dados condicionais de superfície/modelo |
| Cinco categorias, aceitando compressão **ou** laminação | **7** | Co, Er, Hf, Ta, Tc, Th e Zr, **não homologados** |
| Cinco categorias, exigindo **compressão** (sem contar laminação) | **2** | Co e Ta, **não homologados** |
| Cinco propriedades físicas completas na mesma amostra/fase e CNTP | **0** | Nenhuma homologação integral a 273,15 K/101325 Pa |

### Qualidade dos 7 cruzamentos amplos

- **Co:** ensaios de compressão policristalina condicionados à microestrutura; temperatura e fase efetiva incompletas; térmica de triagem.
- **Er, Hf:** valores de **laminação** descrevem processamento, não limite máximo ou coeficiente universal de maleabilidade.
- **Ta:** valores de compressão e tração condicionais, sem amostras/temperaturas/pressões reconciliadas com todos os dados elétricos, térmicos e ópticos.
- **Tc:** laminação em relatório primário histórico descreve um processamento específico; condutividade térmica anterior é triagem, e espectro óptico de Tc não certifica CNTP.
- **Th:** registros de laminação e mecânica vieram de reprodução de livro, **original pendente de conferência** (Etapa 65). NÃO promover a registro validado.
- **Zr:** laminação de **Zr702 comercialmente puro** depende de impurezas e rota de processamento; não é uma propriedade quantitativa universal do Zr elementar.

**Regra de física:** Dureza e módulo de Young não são maleabilidade; laminação não é maleabilidade máxima; resistividade intrínseca não é resistividade total; R550 de superfície ideal não mede brilho real da peça. Mesmo uma medida na temperatura de referência SILM não comprova pressão, fase ou pureza da amostra. Dados condicionais nunca passam ao motor Joule, térmico, óptico ou mecânico sem os contratos respectivos.

## Origem e rastreabilidade

- Matriz científica de pesquisa **Etapa 72**, arquivo de biblioteca `SILM_matriz_cientifica_92_metais_etapa72_reconciliada.json` (14/11/2026), com 92 metais, 317 observações documentais e 230 perfis mecânicos preservados.
- `SILM_relatorio_fechamento_pesquisa_etapa70.md`: 92/79/13; 69 resistividades, 78 dados térmicos, 59 candidatos ópticos, 49 com ponto ou limite mecânico na matriz antiga.
- `domain/silm/data/bundle.js` (main): inventário estrutural; nenhuma propriedade numérica da matriz deve entrar automaticamente em `properties`.
- PRs #135, #136, #137, #138, #140, #142 e #143: pesquisas documentais condicionais, óptica Tc, elétrica, mecânica e auditoria de 30 arquivos YAML originais.
- Entrega externa: `SILM_auditoria_cinco_propriedades_92_metais.xlsx`, planilha com 92 linhas, fontes e coluna editável `Selecionado 72?`, com contagens automatizadas para a seleção nominal do usuário.

## Próxima pesquisa

O gargalo **não** são só os valores elétricos ou ópticos. É preciso ampliar e qualificar **ensaios reais de deformação plástica** de metais específicos (compressão, conformabilidade sob condições explícitas, limites de falha) sem substituí-los por alongamento, dureza ou laminação. Também auditar as referências primárias dos valores térmicos e elétricos herdados de triagem. Manter `CNTP` rigoroso: **273,15 K e 101325 Pa**.

Esta alteração é **somente documental**: não altera motores, não muda elegibilidade de elementos, não promove nenhuma das cinco propriedades a parâmetro físico.
