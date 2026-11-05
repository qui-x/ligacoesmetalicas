# SILM — Oficina dos Metais: aplicações cotidianas e escalas 1–4

**Branch:** `study/silm-coupled-properties-transport-20261104`  
**Limite:** escala 4; estados eletrônicos e magnéticos microscópicos de escala 5 ficam fora desta entrega.

## Fluxo

1. Selecionar um metal na Tabela Periódica.
2. Usar **Ver aplicações** para abrir a curadoria sem iniciar ou substituir uma investigação.
3. Escolher um componente que contenha o elemento.
4. **Investigar componente** inicia a investigação científica existente e prepara a estrutura cristalina quando elegível.
5. O painel preserva objeto, componente e materiais associados enquanto a cena científica mostra a estrutura.
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
| 1 | Objeto e componente | Localiza a peça que contém o metal. |
| 2 | Microestrutura | Esquema didático de grãos, não uma metalografia medida. |
| 3 | Rede e célula unitária | Geometria cristalográfica existente no banco do SILM. |
| 4 | Ambiente atômico | Um centro selecionado e vizinhos destacados na mesma rede. |

## Não regressão

- Não substituir estado científico, investigação, motores ou renderizador.
- Seleção de elemento prepara a descoberta; **Ver aplicações** fecha a tabela e abre a curadoria.
- Iniciar diretamente pela Tabela Periódica continua disponível.
- A escolha de componente cria contexto didático, não composição exata nem outro metal.
- Organização cristalina usa elegibilidade e métodos existentes; se indisponível, montagem livre permanece.
- Escalas 3/4 alteram somente representação (vista, célula, centro e vizinhos).
- Zoom/scroll não alteram coordenadas, medições, cálculos ou relógio físico.
- O painel fica fora do renderizador para que trocar referência não reconstrua a cena.

## Testes e homologação

`tests/workshop-explorer.test.mjs` valida cobertura, IDs únicos, integridade dos campos de aplicação e filtragem por elemento. O workflow executa sintaxe e testes em pushes à branch de estudo.

Ainda requer verificação visual em navegador: tabela → aplicações → componente → investigação; responsividade; troca de referências; escalas 3/4; montagem livre, medidas, cálculos e atividades orientadas.
