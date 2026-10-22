# Auditoria de homologação cristalográfica — SILM 0.15.1

Data: 22/10/2026. Escopo: metais alcalinos, alcalinoterrosos, metais de transição, lantanídeos e actinídeos, com inventário dos registros estruturais que já existem no banco.

## Resultado do inventário

O banco atual contém 57 metais com investigação habilitada e 57 registros de estrutura de referência. A elegibilidade do renderizador reconhece 48 estruturas visualizáveis nos modelos já implementados (13 CCC, 14 CFC e 21 HC). Nove registros experimentais não são visualizáveis pelos modelos atuais: Mn (cúbica complexa, α-Mn), Sn (tetragonal, β-Sn), La/Pr/Nd (DHCP), Sm/Bi (romboédricos), Np (ortorrômbico) e Pu (monoclínico). Esses registros não devem ser convertidos artificialmente em CCC, CFC ou HC.

## Famílias solicitadas

| Família | Estado no banco | Lacunas identificadas |
|---|---|---|
| Alcalinos | Li, Na, Rb e Cs homologados para investigação/estrutura | K e Fr ainda sem referência homologada no banco |
| Alcalinoterrosos | Be, Mg, Ca, Sr e Ba homologados | Ra sem referência homologada no banco |
| Metais de transição | Maior cobertura atual; estruturas CCC/CFC/HC e Mn complexo já registrado | Tc e Hg sem referência homologada; Mn requer modelo próprio. Superpesados permanecem bloqueados |
| Lantanídeos | La–Lu, exceto Pm, possuem registros estruturais | La/Pr/Nd (DHCP) e Sm (romboédrica) requerem modelos próprios; Pm sem referência homologada |
| Actinídeos | Np e Pu têm referências registradas | Np (ortorrômbica) e Pu (monoclínica) requerem modelos próprios; Ac, Th, Pa, U e Am–Lr precisam de pesquisa individual |

Essas lacunas significam ausência de registro homologado neste banco ou ausência de modelo visual compatível — não significam que a ciência desconheça necessariamente a estrutura.

## Proveniência e evidência

Todos os 57 registros atuais apontam para uma fonte cadastrada e estão classificados como experimentais. Contudo, apenas 37 fontes de estruturas apontam para um arquivo de evidência local; 20 dependem de referências bibliográficas ou compilações externas sem cópia local. A próxima revisão deve fechar essa lacuna, priorizando arquivos CIF/registro COD e artigo primário, preservando autoria e licença.

Fontes de referência para a pesquisa: [Crystallography Open Database (COD)](https://cod.psdi.org/), de acesso aberto; [NIST Inorganic Crystal Structure Database (ICSD)](https://icsd.nist.gov/), base curada com acesso por assinatura; e [IUCr — bases cristalográficas](https://www.iucr.org/what-we-do/digital-standards/data/databases), catálogo de bases primárias e secundárias.

## Critérios de homologação

1. Confirmar elemento puro, fase e condição de temperatura/pressão.
2. Manter a fonte rastreável e registrar o arquivo CIF quando disponível.
3. Conferir grupo espacial, parâmetros de rede, sítios fracionários e simetria.
4. Habilitar visualização somente quando o tipo corresponde a um modelo implementado e passa a validação geométrica.
5. Manter estruturas incompatíveis registradas, mas bloqueadas, até implementar e testar o modelo específico.

## Sequência 0.15.x

- 0.15.1: teste automatizado dos 57 registros existentes, com validação de geometria, sítios e coordenação para CCC/CFC/HC.
- 0.15.2: fechar evidência local e revisar fontes dos 20 registros sem snapshot local.
- 0.15.3+: pesquisar K, Hg, Tc, Pm, Ra e os actinídeos restantes; depois desenvolver modelos próprios para DHCP, romboédrica, α-Mn, β-Sn, ortorrômbica e monoclínica.
