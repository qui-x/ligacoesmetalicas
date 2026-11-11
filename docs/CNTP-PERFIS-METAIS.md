# Contrato científico SILM — CNTP e perfis materiais

**Situação: implementado como contrato de validação; não equivale à homologação das 65 propriedades.**

## Condição de referência do projeto

- **CNTP didática BR:** `T = 273.15 K` (0 °C) e `P = 101325 Pa` (1 atm). ID permanente `CNTP_BR_0C_1ATM`.
- **STP IUPAC atual:** `T = 273.15 K`, `P = 100000 Pa` (1 bar). ID separado `STP_IUPAC_0C_1BAR`.
- A sigla isolada CNTP **não é suficiente** para aceitar um novo registro: salvar os dois números e a convenção.
- Os dados pesquisados para os próximos metais serão avaliados quanto à **CNTP BR**, mas a temperatura/pressão da **fonte original** sempre permanecem junto ao valor.
- Não transformar um valor a 293–298 K em resultado a 273,15 K nem converter 100 kPa em 101,325 kPa sem modelo, incerteza e justificativa científica.

Fontes: IUPAC Gold Book, [condições-padrão de gases](https://goldbook.iupac.org/terms/view/S05910) (273,15 K / 100 kPa), e [material didático do IFRS](https://ingresso.ifrs.edu.br/2023/wp-content/uploads/sites/31/2022/12/Respostas-aos-recursos-do-gabarito-das-provas-objetivas.pdf) (uso brasileiro de CNTP: 273,15 K / 101325 Pa).

## Regras por propriedade

1. **Elétrica:** resistividade ou condutividade com unidade, temperatura, orientação quando anisotrópica, fase, composição/pureza, tratamento e fonte.
2. **Térmica:** condutividade/difusividade/capacidade térmica são grandezas diferentes; não inferir uma da outra sem massa específica e capacidade térmica corretas.
3. **Mecânica:** distinguir regime de ensaio, temperatura, deformação, direção, estrutura, composição e condições de preparação; não equiparar maleabilidade/ductilidade a um único número universal.
4. **Óptica:** `n(λ),k(λ)` com intervalo espectral, superfície e estado de oxidação, estado da amostra, polarização e condições da fonte. CNTP termodinâmica **não determina o acabamento óptico**.
5. **Cristalografia:** fase precisa ser compatível com a temperatura do perfil, não basta que o elemento tenha uma estrutura cadastrada na Oficina.

**Atenção especial ao Sn:** o bundle atual inclui β-Sn tetragonal como estrutura metálica de referência, mas a fase α-Sn é a forma termodinamicamente estável do estanho puro abaixo de aproximadamente 13,2 °C, portanto a **0 °C**. A transformação β→α pode ser cineticamente lenta e a fase β pode persistir metaestavelmente. Não generalizar os parâmetros de β-Sn para uma suposta referência CNTP sem análise de fase e histórico da amostra. Referência: [OECD/NEA — Chemical Thermodynamics of Tin](https://www.oecd.org/content/dam/oecd/en/publications/reports/2012/12/chemical-thermodynamics-of-tin-volume-12_g1g39522/9789264992061-en.pdf) e [Universidade de Maryland — Tin Pests](https://calce.umd.edu/tin-pests).

## Esquema de entrada futura

O motor **não exige reescrita** quando chegar o perfil pesquisado: basta incluir um arquivo por elemento, chamando `SILM.materialProfiles.register(...)`, antes de `material-engine.js`. Exemplo ilustrativo de estrutura; **não contém valores físicos fictícios**:

```js
SILM.materialProfiles.register({
 atomicNumber: /* Z validado */, element: /* símbolo validado */,
 properties: {
  thermal: {
   evidence:'TABULATED',
   value: /* número extraído e verificado da fonte */,
   unit: /* unidade compatível com a grandeza */,
   source:{title:/* publicação original */,doi:/* se houver */},
   conditions:{
    basis:'CNTP_BR_0C_1ATM',
    temperatureK:273.15,pressurePa:101325,
    phase:/* fase homogênea e origem */,
    purity:/* composição e estado da amostra */
   }
  }
 }
});
```

Campos obrigatórios validados atualmente: número atômico, símbolo, tipo de evidência, valor + unidade (quando tabelado), fonte, `basis`, temperatura e pressão. A validação de **fase, direção, tratamento e pureza** permanece uma etapa científica adicional obrigatória antes de acionar previsões individuais; um valor com CNTP correta não certifica automaticamente essas condições.

## Protótipo Cu que já está no repositório

- `domain/silm/data/material-profile-demo-cu.js` contém a fonte de Johnson e Christy (1972), registrada como **SOURCE_REPORTED**, com temperatura ambiente e T/P exatas não identificadas no cadastro. O artigo descreve filmes finos evaporados e medidas à temperatura ambiente, **não CNTP**.
- `SILM.materialEngine.optical(29,lambdaNm,angulo)` demonstra apenas a resposta de Fresnel **nas condições da fonte experimental**, com aviso explícito na interface; isto não é uma previsão a 0 °C.
- `SILM.materialEngine.opticalForReference(29,lambdaNm,angulo)` exige a condição CNTP. Enquanto faltar uma fonte ou transformação validada, devolve `CONDITIONS_UNVERIFIED` **sem refletância numérica**.
- Para qualquer outro metal, continuam apenas as capacidades qualitativas permitidas pelos validadores atuais: **nunca utilizar os dados do cobre**.

## Evolução

Quando o levantamento dos dados em CNTP chegar, homologar **um metal por vez**: estrutura e fase; propriedades e unidade; fonte e incerteza; compatibilidade T/P; limites das experiências; testes de regressão por motor; comparação entre os dados e os efeitos da cena. Toda propriedade sem evidência suficiente permanece qualitativa ou indisponível para cálculo numérico.
