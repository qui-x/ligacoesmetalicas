# SILM 0.9.0 — Módulo Medir

**Origem executável:** SILM 0.8.0 (`entregas/SILM-0.8.0.zip`, SHA-512 `29f762209ab42d0e9a9adf7bcfdcaf8887fa44cd60128ef3a1031618570f0dd5df305c719104e478c03b681e4f963fb7c59af4480014ac3ff1516bf028719ed9`), sem build intermediária. A regra de parada (§23) foi dispensada pelo autor, que pediu a execução contínua das séries até a 0.17.x.

## Objetivo (§2)

> Implementar o módulo **Medir** usando o mesmo `scientificState`. O módulo deve produzir **medições do modelo**, e não simplesmente repetir valores do banco científico.

## O que esta versão implementa

1. **Ver → Medir.** Quatro instrumentos com modelo quantitativo:
   - **Distância** (A → B);
   - **Ângulo** (A → vértice B → C);
   - **Parâmetro de rede** (`a` nos cúbicos; `a` e `c` no HC, como ação de medição sobre uma aresta);
   - **Vizinhança e coordenação** (um centro; a cena destaca os mesmos vizinhos que a contagem).

   Ver [`MODULO-MEDIR.md`](MODULO-MEDIR.md).
2. **Valores das coordenadas científicas.** Os sítios viram coordenadas cartesianas em Å a partir dos parâmetros tabelados. Zoom, redimensionamento e projeção não mudam o resultado.
3. **Cota de medição**, e não ligação M—M: linha tracejada com terminais, arco no ângulo e marcadores com as letras A, B e C.
4. **Unidades Å, pm e nm**, com conversão exata e centralizada. O valor persistido é sempre o número canônico em Å. Ver [`INSTRUMENTOS-E-UNIDADES.md`](INSTRUMENTOS-E-UNIDADES.md).
5. **Resolução explícita** de 0,001 Å, 0,1° e 1 (contagem), sem `±`: resolução não é incerteza.
6. **Dados → Medições:** registros rastreáveis com rever, remover e limpar. Limpar medições não limpa a estrutura.
7. **Contexto histórico:** uma medição de um estado anterior da estrutura é marcada e nunca recalculada em silêncio.
8. **Schema 7:** `scientificState.measurements[]`, com validação que recalcula cada registro. Ver [`CONTRATO-MEDICOES.md`](CONTRATO-MEDICOES.md) e [`SCIENTIFIC-STATE.md`](SCIENTIFIC-STATE.md).
9. **Identidade oficial do SILM** (pacote do autor), com o contrato de abertura da família SIAB:
   - símbolo mestre no cabeçalho, no estado vazio e no Sobre;
   - ícone de aplicação no favicon e no PWA;
   - abertura oficial.

   Ver [`IDENTIDADE-VISUAL.md`](IDENTIDADE-VISUAL.md).

## Decisões registradas

1. **Montagem livre não tem escala física** (§4). Os instrumentos ficam indisponíveis com o motivo à vista. Nenhum pixel nem coordenada normalizada é convertido em comprimento.
2. **Pontos guardados como sítios científicos** (célula + base), além do `unitId`. A medição continua verificável depois do reload e o validador consegue recalculá-la.
3. **Deformação ativa** (maleabilidade ou ductilidade aplicadas) suspende os instrumentos. As medidas usam a estrutura de referência e não a forma deformada qualitativa.
4. **Instrumento e pontos em escolha são transitórios.** O reload cancela a medição incompleta (§16). A unidade de apresentação é preferência de representação (`measure.view`).
5. **Sem instrumentos sem modelo** (§7): não há termômetro, amperímetro nem multímetro.
6. **Integração do pacote oficial sem editá-lo.** Os arquivos do pacote estão íntegros. A adaptação ao contrato da família e a correção de um artefato do Chromium (quadrado preto do filtro térmico) ficam em `domain/silm/abertura.js` e `abertura.css`.
7. **Correção de origem 0.1.x: rota inicial direta.** Ao abrir `#/inicio`, `#/aprender` ou outra tela do domínio diretamente (inclusive pelo atalho do PWA, cujo `start_url` é `#/inicio`), a Base mostrava "Tela não encontrada. A navegação foi recuperada.". O roteador navegava antes de o domínio registrar as telas. A navegação de inicialização agora é silenciosa, e uma rota inexistente durante o uso continua avisando. São integrações declaradas: `js/navigation/router.js` e `js/init/app.js`. O item 0.9-ID5 verifica a correção.
8. **Invariantes de séries anteriores atualizadas sem perder a intenção:**
   - 0.7-MIG passa a verificar a migração até o schema atual;
   - 0.8-11 verifica que foco, camadas e comparação não entram no estado científico, em vez de fixar o número 6.

## Paridade de família e Base Estrutural

O autor pediu, durante esta série, um estudo mais profundo da interface do SIAB 1.0.0, para que o SILM tenha a mesma dinâmica, e o enriquecimento da Base Estrutural com a estrutura consolidada do SIAB, de forma neutra.

Esse trabalho é de fundação e não do módulo Medir:
- segue como **Base Estrutural 0.3.0**, em `base-estrutural/`;
- o SILM adota essa Base como correção de origem 0.1.x, declarada na build seguinte.

## Documentos

- [Módulo Medir](MODULO-MEDIR.md) · [Contrato das medições](CONTRATO-MEDICOES.md) · [Instrumentos e unidades](INSTRUMENTOS-E-UNIDADES.md) · [Identidade visual](IDENTIDADE-VISUAL.md)
- [Arquitetura científica](ARQUITETURA-CIENTIFICA.md) · [Roadmap](ROADMAP-SILM.md) · [Estado científico (schema 7)](SCIENTIFIC-STATE.md)
- [Relatório de build e testes](RELATORIO-BUILD-TESTES-0.9.0.md) · [Checklist](checklists/CHECKLIST-0.9.0.md)
