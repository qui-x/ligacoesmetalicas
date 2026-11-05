# SILM — Oficina dos Metais: aplicações cotidianas e escalas 1–4

**Branch:** `study/silm-coupled-properties-transport-20261104`  
**Limite:** escala 4; estados eletrônicos e magnéticos microscópicos de escala 5 ficam fora desta entrega.

## Fluxo

1. Selecionar um metal na Tabela Periódica.
2. Usar **Ver aplicações** para abrir a curadoria sem iniciar ou substituir uma investigação.
3. Escolher um componente que contenha o elemento.
4. **Investigar componente** inicia a investigação científica existente na escala do objeto, sem construir a rede antes da hora.
5. Ao avançar para a escala 3, a estrutura cristalina é preparada pelo motor existente; a escala 4 destaca um centro e seus vizinhos.
6. O painel preserva objeto, componente e materiais associados enquanto a cena científica aparece apenas nas escalas 3–4.
6. As escalas 1–4 mudam a observação, não trocam o metal nem criam um segundo estado físico.

O botão legado **Iniciar investigação** mantém o início direto. Montagem livre, Explorar/Medir/Calcular, montagens prontas, roteiros, missões e instrumentos continuam nos fluxos originais.

## Curadoria inicial

- **Cobre:** enrolamentos de motor elétrico; conexão de latão (Cu–Zn).
- **Ferro:** parafuso de aço; núcleo de transformador em aço elétrico Fe–Si.
- **Magnésio:** carcaça de equipamento portátil; componente automotivo leve.
- **Lantânio:** liga armazenadora de hidrogênio em bateria NiMH; liga pirofórica em pedra de isqueiro.

Os cartões distinguem o componente que contém o elemento dos demais materiais. Não atribuem percentuais, pureza, grau de liga ou composição de marca; as formulações variam conforme produto e especificação.

## Escalas

| Escala | Representação | Comportamento |
|---|---|---|
| 1 | Objeto e componente | Localiza a peça que contém o metal; é o ponto de entrada da investigação. |
| 2 | Microestrutura | Esquema didático de grãos, não uma metalografia medida. |
| 3 | Rede e célula unitária | A rede é preparada sob demanda pela geometria cristalográfica existente no banco do SILM. |
| 4 | Ambiente atômico | Um centro selecionado e vizinhos destacados na mesma rede; trocar o foco não reinicia a amostra. |

## Não regressão

- Não substituir estado científico, investigação, motores ou renderizador.
- Seleção de elemento prepara a descoberta; **Ver aplicações** fecha a tabela e abre a curadoria.
- Iniciar diretamente pela Tabela Periódica continua disponível. Se uma investigação já estiver ativa, selecionar outro metal mostra a nova curadoria como pendente; a troca só ocorre após a confirmação existente, e o cancelamento retorna ao metal que já estava em estudo.
- A escolha de componente cria contexto didático, não composição exata nem outro metal.
- Organização cristalina usa elegibilidade e métodos existentes; se indisponível, montagem livre permanece.
- Escalas 1/2 mantêm o contexto do objeto e ocultam o palco cristalino; as escalas 3/4 revelam a cena existente, sem substituir motores ou estado científico.
- A rede é montada somente no avanço à escala 3, não no clique inicial do objeto.
- Escalas 3/4 alteram somente representação (vista, célula, centro e vizinhos).
- Zoom/scroll não alteram coordenadas, medições, cálculos ou relógio físico.
- O painel fica fora do renderizador para que trocar referência não reconstrua a cena.

## Testes e homologação

`tests/workshop-explorer.test.mjs` valida cobertura, IDs únicos, integridade dos campos de aplicação e filtragem por elemento. O workflow executa sintaxe e testes em pushes à branch de estudo.

Ainda requer verificação visual em navegador: tabela → aplicações → componente → investigação; responsividade; troca de referências; escalas 3/4; montagem livre, medidas, cálculos e atividades orientadas.


## Escala 2 — visualização microestrutural ampliada (fase inicial)
- O pequeno esquema estático da escala 2 foi substituído por um palco vetorial ampliado de grãos e contornos.
- Zoom de 100% a 400% (passos de 25%), ajuste ao quadro, roda do mouse e deslocamento por arraste quando ampliado; grãos podem ser destacados por clique ou teclado.
- Cabeçalho e legendas compactos; composição detalhada permanece acessível na escala 1, sem repetir blocos de texto ao observar os grãos.
- O diagrama é **deliberadamente genérico**, com regiões de Voronoi ilustrativas; **não** é micrografia real, EBSD, medida de tamanho de grão, mapa de fases nem descrição de microestrutura específica de Fe, Cu, Mg ou qualquer outra liga.
- O mesmo mapa ilustrativo pode ser exibido para os metais investigáveis, até que referências experimentais específicas sejam verificadas e homologadas; não usar variação estética como alegação científica.
- A interação visual não altera o snapshot científico, a composição, a rede cristalográfica, o centro selecionado, os instrumentos ou o relógio.
- Critérios de regressão: campo amplo no desktop e mobile; destaque de grão; zoom e retorno; escalas 3/4 e investigação direta intactas.
