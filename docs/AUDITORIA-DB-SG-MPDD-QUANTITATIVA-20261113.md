# SILM — Parte 13: portao quantitativo de Db e Sg via MPDD/OPTIMADE

**Data da auditoria:** 13/11/2026  
**Estado do catalogo nesta etapa:** 79/92 habilitados, 14 apenas estruturais; Db (105) e Sg (106) seguem **bloqueados**.

## Resultado da pesquisa

1. **Östlin e Vitos (2011)**, *Physical Review B* 84, 113104, DOI https://doi.org/10.1103/PhysRevB.84.113104: a sintese na tese de Östlin (KTH, 2015, §6.2) favorece **CCC/BCC** para Db e Sg no modelo EMTO/LDA escalar-relativistico. A Tabela 6.2 da tese fornece **1,71 para Db** e **1,74 para Sg** exclusivamente como razoes c/a de estruturas **HC alternativas**; esses valores nao podem dimensionar a CCC. A figura dos raios de Wigner-Seitz nao substitui a tabela numerica original.
2. **Gyanchandani e Sikka (2011)**, *Physical Review B* 83, 172101, DOI https://doi.org/10.1103/PhysRevB.83.172101, calculam estrutura e volumes de equilibrio de metais 6d. O artigo completo/tabela numerica de Db e Sg nao foi recuperado nesta auditoria.
3. **Atta-Fynn e Ray (2015)**, *Solid State Communications* 201, 88–94, DOI https://doi.org/10.1016/j.ssc.2014.10.025, comparam niveis de DFT e calculam constantes de rede. O resumo acessivel **nao permite vincular um valor numerico de Db/Sg a uma fase e nivel teorico especificos**.
4. **Krajewski (2024)**, tese *Efficient Materials Informatics between Rockets and Electrons*, https://arxiv.org/abs/2407.04648, descreve ingestao de estruturas dos elementos Lr–Rg no **MPDD**, citando os trabalhos de Gyanchandani e Sikka. Trata-se de **caminho de recuperacao secundario, nao comprovacao de identidade de cada registro**.
5. O **registro de provedor OPTIMADE** https://www.optimade.org/providers-dashboard/providers/mpdd.html documenta os campos de volume por atomo (_mpdd_atomicvolume, Å³), volume da estrutura (_mpdd_volume, Å³), grupo espacial (_mpdd_spacegroupn) e metadados de origem (_mpdd_metadata). A interface publica https://mpdd.org/ informa que a API OPTIMADE esta disponivel ao publico. Nesta sessao as requisicoes diretas aos registros de Db e Sg **nao puderam ser completadas**; nao ha novos parametros homologados.

## Rotina de auditoria quantitativa (somente leitura)

Arquivo: scripts/audit-db-sg-mpdd.mjs

Executar com Node 22+ em ambiente com acesso a internet:

    node scripts/audit-db-sg-mpdd.mjs

Se necessario, selecionar base alternativa por MPDD_OPTIMADE_BASE (raiz HTTPS do provedor).
O script consulta separadamente Db e Sg com filtro de elemento unico, periodicidade tridimensional, grupo espacial 229 e volume atomico disponivel. Cada registro passa por um controle de consistencia:

- **Nao misturar estruturas:** CCC = Im-3m (229), dois atomos por celula convencional; c/a da HC nao se aplica.
- **Conversao valida para CCC:** V_convencional = 2 × V_atomo; a = (2 × V_atomo)^(1/3), com V em Å³ e a em Å.
- **Checagem interna:** quando existem V_atomo e V_celula, conferir a razao V_celula/nsites contra V_atomo e exigir concordancia ate 1% antes de propor a derivacao.
- **A fonte MPDD e secundaria:** verificar o DOI, tabela, funcional, inclusao de spin-orbita, fase e minimo de energia no trabalho **primario** para cada identificador MPDD.
- **Paginacao:** se hasNextPage=true, a primeira pagina nao e uma busca exaustiva. Reconsultar paginas antes de concluir ausencia.
- **Criterio de saida:** qualquer estrutura encontrada e apenas "candidate-requires-primary-source-check"; o script nunca altera bundle.js, disponibilidade do metal, propriedades ou cache.

## Portao para eventual habilitacao

Para cada elemento, abrir ficha separada contendo:

- Identificador de registro e referencia primaria verificavel (DOI, tabela/pagina), estrutura CCC e grupo 229;
- Metodo numerico, funcional, relatividade, pressao e temperatura assumidas pelo calculo;
- V_atomo ou a numerico do mesmo metodo/fase, unidades, conversao reprodutivel, casas decimais coerentes com a fonte;
- Base (0,0,0) e (1/2,1/2,1/2), ligacoes com motor SILM.crystal e auditoria visual;
- evidenceType='computed', scope='structure-only', propriedades nao homologadas bloqueadas;
- Testes cientificos, E2E desktop/mobile (Chromium, Firefox, WebKit) e cache offline.

**Decisao atual:** Db e Sg continuam com silmEligibility.status='unavailable'. Estimativa de raio atomico/covalente de portal generalista **nao** substitui raio metalico ou volume de equilibrio. Nao usar analogia com Ta/W como se fosse o calculo relativistico dos superpesados.
