# SILM 0.12.2 — Medir e Calcular na nova interface

Esta correção de integração conclui uma dependência dos roteiros 0.13.0: os módulos Medir e Calcular passam a funcionar no laboratório da página principal. Não altera o schema 8 nem duplica as fórmulas.

Em Ver, selecione o módulo. Medir oferece distância, ângulo, parâmetro de rede e coordenação por seleção dos sítios da cena. A cota usa coordenadas cristalográficas, não pixels, e comprimentos podem ser exibidos em Å, pm e nm. Em ângulos, B é o vértice. Medidas absolutas exigem estrutura cristalina sem deformação.

Calcular utiliza o catálogo central de fórmulas para a estrutura corrente. Cada entrada explicita dado tabelado, medida do modelo, valor informado ou resultado anterior. Números com vírgula decimal são aceitos; valores não positivos ou não finitos são recusados. Dados mostra registros e proveniência; medições atuais podem ser reabertas na cena.

Montagem e organização ficam restritas a Explorar. Exportação JSON e restauração continuam usando o estado científico único. A interface anterior permanece acessível para propriedades e relatórios ainda não migrados.

Base consultada: 0.9.12, commit 76ef30bd9cb187bfeb98a66134e24322ec09cb74. O snapshot incorporado permanece 0.9.8; a correção upstream de retomada da Home será avaliada ao integrar os roteiros, sem importar atividades genéricas da demonstração.

Próximo marco: 0.13.0, roteiros experimentais conforme o prompt do projeto. Não iniciado nesta correção.

## Verificação

A suíte científica valida 118 elementos, 43 metais elegíveis e as fórmulas originais de Cu, Fe e Mg. A suíte de interface cobre as três estruturas, teclado para medir parâmetro de rede, troca de unidade sem mutação, entrada de origem medida, entrada manual com vírgula, rejeição de valor negativo, densidade com dependências e massa intervalar, histórico e reload. A suíte existente mantém a verificação de câmeras 2D/3D, JSON, cancelamento e docas responsivas.
