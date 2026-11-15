# SILM · Etapa 84B — CPFEM e revisão futura dos menus

**Situação: ramo de desenvolvimento, PR #172 em rascunho. NÃO integrar à main até revisão de Montagem, Ver e Dados.**

## Separação dos motores

- crystal-slip.js: geometria cristalográfica e fator de Schmid.
- crystal-plasticity.js: lei incremental de um cristal hipotético isolado.
- polycrystal-cpfem.js: equilíbrio global FEM 2D em um policristal Voronoi sintético, com orientação distinta por grão.
- specimen-j2.js: motor isotrópico publicado; continua ativo e independente.
- mechanical-qualification.js: barreira de calibração experimental. Um registro de tensão de escoamento não define Young, Poisson ou encruamento.
- polycrystal-preview.js: adaptador de apresentação **removível**, prévia opt-in via parâmetro de URL cpfem-preview=1 no ramo; não cadastra ação nos menus.
- mechanics-action-contract.js: mapa de ações e prioridades **candidatas**, sem alterar menus existentes.

## Formulação e validade

A malha usa triângulos CST de pequenas deformações, deformação plana (epsilon_zz = 0, mas sigma_zz não necessariamente zero) e equilíbrio das forças internas por Newton, tangente material numérica e PCG. Cada triângulo recebe a orientação de um grão gerado por Voronoi e usa a lei local de plasticidade cristalográfica. O deslocamento é prescrito sobre um contato localizado, com histórico incremental e opção de descarregamento.

Orientações, parâmetros, formatos dos grãos e carga são **hipotéticos/relativos**. O resultado não é EBSD medido, nem a propriedade do metal investigado, nem simulador industrial validado. Sem grandes deformações, rotação da rede cristalina, anisotropia elástica, contornos intergranulares especiais, encruamento latente, efeitos não-Schmid completos, estricção ou ruptura. Rejeitar casos não convergidos e mapear como **não amostrados** os grãos sem pontos de integração.

Ao ativar a prévia no ramo, a visualização pode usar o campo CPFEM para deslocamento e sombreamento didático, sem editar o estado científico, o J2 ou a óptica intrínseca. O J2 é restaurado ao desligar a sobreposição.

Dados laboratoriais devem ser mantidos em suas condições originais (amostra, temperatura, pressão, composição, fase e ensaio); não converter automaticamente para CNTP nem combinar parâmetros de experimentos incompatíveis.

## Proposta para revisão de prioridades e acesso

| Menu candidato | Ação candidata | Uso |
|---|---|---|
| Montagem | Escolher corpo de prova | Preparação do objeto e geometria |
| Montagem | Preparar policristal sintético | Gerador e sementes reproduzíveis |
| Ver | Aplicar carga | Ação principal de tração ou compressão |
| Ver | Executar CPFEM hipotético | Prévia avançada, sujeita a validação |
| Ver | Visualizar campos | Deslocamento/plasticidade em coobservação |
| Dados | Proveniência e calibração | Condições, modelo e limites |
| Dados | Resposta do grão | Resultados do modelo e lacunas de amostragem |
| Dados | Comparar J2 e CPFEM | Nunca fundir parâmetros sem validação |

**O proprietário definitivo da ação, rótulos, posição, ícones, ordem, atalhos e disponibilidade devem ser homologados na reformulação.** Os valores priorityCandidate do contrato são apenas sugestões técnicas. Nenhum botão do protótipo será adicionado diretamente aos menus atuais.

## Critérios para promover a PR

- CI científico, regressões e 3 navegadores verdes, incluindo testes do opt-in.
- Equilíbrio, carregamento, descarregamento e dependência da orientação verificados com limites de pequenas deformações.
- Testes de sensibilidade a malha, verificações de energia/trabalho e validação comparativa.
- Bloqueio de dados importados não homologados e ausência de alimentação automática do J2.
- Performance aceitável em celular; acessibilidade, tema escuro/claro, movimento reduzido e cache offline.
- Revisão da distribuição das ações entre Montagem, Ver e Dados, com foco no palco da microestrutura e sem controles redundantes.
- Decisão explícita de aprovação antes de merge; até lá a PR permanece em rascunho.

## Desenvolvimento posterior

Plasticidade cristalográfica global e J2 continuam modelos distintos. A calibração por material pertence a um marco específico. Grandes deformações, estricção e ruptura exigem formulação de deformação finita, métodos de regularização de localização e dados experimentais de falha; **não estão implementadas** nesta etapa.

## Auditoria adicional da etapa 84B (desenvolvimento)

- O relatório numérico `energy` distingue **energia elástica armazenada** (contração tridimensional tensorial de `sigma : epsilon_e`, incluindo `sigma_zz`), **energia de encruamento isotrópico** (H vezes deslizamento acumulado ao quadrado sobre 2) e **dissipação plástica acumulada** (soma de CRSS por sistema multiplicada pelo deslizamento absoluto). Todas são integrais dos triângulos, em **unidades relativas** do modelo.
- As reações `topY`, `bottomY`, `contactX`, `netFx`, `netFy` e `freeResidual` permitem auditar equilíbrio global e o tratamento dos graus de liberdade prescritos. Elas não são forças em newtons.
- O teste `verifyAffinePatch` confere a interpolação de deformação afim constante e a conversão de cisalhamento de engenharia na malha CST. **Não** comprova convergência de malha ou validade física por material.
- O campo `energyBalanceStatus: NOT_EVALUATED_EXTERNAL_WORK` deixa explícito que o trabalho externo histórico ainda não foi integrado. Portanto, a soma de energias **não** deve ser descrita como balanço experimental fechado.
- As condições de carga ficam identificadas em `loadCase`: modo, posição, largura, amplitude de deslocamento prescrito e número de incrementos. Uma mudança de deslocamento, descarregamento ou contato **invalida** a prévia existente, evitando resultados com configurações antigas.
- Os resultados são apenas da prévia técnica, disponibilizada em opt-in no ramo; não alimentam automaticamente Dados, Ver, Montagem, propriedades dos metais nem o solucionador J2.

**Ainda pendente antes de qualquer merge:** análise da sensibilidade a diferentes refinamentos de malha, trabalho externo incremental e comparação quantitativa de soluções com referências independentes, além da homologação de UX dos três menus.
