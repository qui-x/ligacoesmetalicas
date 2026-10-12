# SILM 0.9.1 — Correção de homologação: cena prioritária no celular e no tablet

**Origem executável:** SILM 0.9.0 (`entregas/SILM-0.9.0.zip`, SHA-512 `691748fcdd31d4aa887a727bdabbd875def07651eb5a1efc8f83b8e300079a20e4e536c4289465330a1346f7a0898e3bdb3bce3eaf7aba90051e4010eb76dd1e`).

Pelo contrato de versionamento, as versões `0.x.1` corrigem o que a homologação da `0.x.0` revelou. Esta versão corrige um defeito apontado pelo autor, com captura de tela: "temos muito texto poluindo o mobile".

## Problema encontrado

Na faixa de 600 a 900 px (tablet, celular deitado e janelas estreitas), a cena da estrutura cristalina ficava com cerca de 185 px. A maior parte da área ia para sete blocos de texto abaixo dela:
- legenda dos elétrons;
- selo da célula;
- nota sobre a representação didática;
- "O sólido continua…";
- instruções de teclado;
- estado dos elétrons;
- linha de retorno.

Entre o cabeçalho e a cena, uma linha repetia "SILM — A Arquitetura dos Metais", que no SIAB não existe.

Com a fonte simplificada (Acessibilidade → Leitura), as esferas pequenas ficavam ovais. O símbolo herdava `overflow-wrap:anywhere` da Base e quebrava letra a letra ("F" / "e").

## Correções

1. **"Como ler esta cena".** Legendas, notas da representação e instruções de teclado ficam num bloco recolhível, com o resumo ＋/− da família, na cena cristalina e na montagem livre.
   - Fechado por padrão até 900 px e aberto no desktop.
   - A escolha do usuário fica lembrada como preferência de representação (`scene.notes`), fora do estado científico.
   - As instruções continuam no DOM: as unidades mantêm `aria-describedby`.
2. **Na cena ficam a estrutura, os controles e uma linha de retorno**, como na bancada do SIAB:
   - o estado dos elétrons e a observação da experiência compacta ficam só para leitores de tela até 900 px, pois repetiam a linha de retorno;
   - os metadados ocupam até duas linhas, com o texto integral no título.
3. **Sem linha de título repetida no celular e no tablet.** A área do espaço de trabalho vai para a cena. Os lançadores Montagem, Ver e Dados continuam fixos embaixo.
4. **Esferas sempre redondas.**
   - O símbolo não quebra (`white-space: nowrap`) e acompanha o diâmetro da esfera (`--unit-px`).
   - Abaixo de 16 px, o símbolo é omitido (`data-symbols="hidden"`). A unidade continua nomeada por `aria-label`.

5. **Botões do cartão do elemento sem quebra no meio da palavra.** No celular, "Iniciar investigação" aparecia como "investigaçã/o". Os rótulos quebram só entre palavras, e a ação principal ocupa a linha inteira quando falta espaço.

## Resultado (Fe cristalino, elétrons visíveis, 768 × 860 px, fonte simplificada)

| | 0.9.0 | 0.9.1 |
|---|---|---|
| Lado da cena | 185 px | 315 px |
| Blocos de texto visíveis abaixo da cena | 7 | 1 (linha de retorno) + resumo "Como ler esta cena" |
| Linha "SILM — A Arquitetura dos Metais" no espaço de trabalho | sim | não (só no desktop) |
| Esferas na rede extensa com fonte simplificada | ovais, "F/e" em duas linhas | redondas; símbolo omitido quando não cabe |

Testes: itens 0.9.1-01 a 0.9.1-05 (suíte `s096-cena-compacta.cjs`) e a regressão completa 0.4.x a 0.9.0.

## O que não muda

O schema científico continua 7, não há novas mecânicas e nenhuma série é antecipada. A paridade de família com o SIAB 1.0.0 continua em estudo e segue pela Base Estrutural 0.3.0. Isso inclui, por exemplo, ocultar a navegação inferior no Laboratório do celular, como faz o SIAB.

## Documentos

- [Relatório de build e testes](RELATORIO-BUILD-TESTES-0.9.1.md) · [Checklist](checklists/CHECKLIST-0.9.1.md) · [SILM 0.9.0](SILM-0.9.0.md)
