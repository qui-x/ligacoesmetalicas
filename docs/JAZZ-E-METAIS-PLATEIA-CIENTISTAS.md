# Jazz e Metais — Plateia de cientistas (direção de personagens 3D)
*Especificação criativa e técnica v1.0, 26 de outubro de 2026*

**Identidade vigente:** Jazz e Metais — Espetáculo de Propriedades das Terras Raras. **Motor visual:** Blender para assets/rig/animação, Babylon.js para renderização web. **Escopo:** personagens convidados na plateia; a companhia de 17 terras raras continua protagonista no palco. Trabalhar apenas em `feature/baile-eletrons-jazz-1925`.

## 1. Natureza da plateia: encontro científico imaginário
O clube é ambientado artisticamente em 1925. Os convidados constituem uma **galeria histórica atemporal**: alguns já haviam falecido em 1925; outras descobertas só seriam publicadas depois. **Não afirmar que essas pessoas se encontraram em um clube**, nem inventar depoimentos como citações autênticas. Legenda de entrada: *“Encontro imaginário de pesquisadores de diferentes épocas, inspirado na história dos metais e dos cristais.”*

A ambientação mantém jazz e figurinos da década de 1920; as legendas exibem o **ano verdadeiro do trabalho científico**.

## 2. Elenco principal da plateia
| Personagem | Associação científica | Marco / temporalidade | Posição de cena |
|---|---|---|---|
| Paul Drude | Modelo clássico de condução de elétrons em metais | 1900; falecido em 1906 — homenagem anacrônica | Mesa da condução |
| Hendrik Antoon Lorentz | Teoria eletrônica clássica | ~1904–1909 | Mesa da condução |
| Arnold Sommerfeld | Aprimoramento quântico da teoria eletrônica dos metais | contribuições de 1927–1928, posteriores ao cenário | Mesa da condução |
| Max von Laue | Difração de raios X em cristais | 1912, Nobel 1914 | Mesa cristalográfica |
| William Henry Bragg | Estrutura cristalina por raios X | 1913–1915, Nobel 1915 | Mesa cristalográfica |
| William Lawrence Bragg | Lei de Bragg e estrutura cristalina | 1912–1915, Nobel 1915 | Mesa cristalográfica |
| Felix Bloch | Elétrons em potenciais cristalinos periódicos | 1928, posterior ao cenário | Mesa das teorias quânticas |
| William Hume-Rothery | Regras e estudos de solubilidade/formação de ligas | trabalhos de ligas com relevância posterior a 1925 | Mesa das ligas |

**Fidelidade histórica:** os cientistas são representados por **interpretações artísticas**, identificadas pelo nome, e não reconstruções fotográficas certificadas. Cada personagem deverá ter foto de referência verificada, proveniência, condições de uso e revisão visual humana. Não utilizar retratos encontrados em buscadores sem checar licença. Arquivar metadata/licença, jamais embarcar arquivos de fonte sem permissão explícita.

## 3. Direção artística: qualidade inspirada em Liar's Bar, sem copiar
**Protagonistas de primeiro plano:** 8 personagens de destaque (não figurantes genéricos). O olhar aproximado deve mostrar:
- **Rostos:** estrutura de crânio distinta, queixo, nariz, testa, pálpebras/olhos, sobrancelhas, rugas discretas, variações de idade, cabelo, barba/bigode ou óculos somente quando justificados por referência. Nada de personagens idênticos com cabeças apenas recoloridas.
- **Vestuário de 1925:** cortes bem modelados de paletó/terno, colete, lapela, gravata, relógio de bolso, texturas de lã/linho/couro; *evitar fantasiar cientistas como caricatura de jaleco*. Determinar roupa com referência e direção de arte.
- **Materiais:** PBR correto (base color/roughness/metalness, normal maps), tecidos sem brilho plástico, olhos com reflexos sutis, cabelo com massas e mechas; color grading consistente com luz âmbar.
- **Animação:** idle respirando, pequenos movimentos de cabeça, olhos direcionados ao palco, reação a apresentações, aplausos discretos, anotações em cartões e diálogo sem fala atribuída; aleatorização suave de ciclos. Sem exageros cômicos.
- **Personalidade de cena** sem inferir comportamento verdadeiro: observador, reflexivo, atento. O personagem exibe informação científica ao ser selecionado.
- **Performance:** versões LOD0/LOD1/LOD2 e silhuetas legíveis em dispositivos móveis; rig e texturas compartilhados quando possível; conservar o primeiro plano com a melhor qualidade.

**Qualidade-alvo**, a validar por comparação visual com capturas da própria cena: rostos reconhecíveis a partir de referências históricas confiáveis, materiais não artificiais, mãos articuladas, profundidade/oclusão 3D, reflexos e sombras plausíveis, postura natural ao sentar, sem clipping em roupas e mesas. Os modelos procedurais gerados automaticamente são **placeholders de bloqueio** até receberem modelagem/escultura, retopologia, textura e rigging artísticos.

## 4. Planejamento de animações
| Gesto | Gatilho visual | Efeito |
|---|---|---|
| `idle_seated` | padrão, intensidade variável | respiração, micro-rotação, piscar |
| `look_stage` | abertura de qualquer ato | giro sutil de cabeça e olhos |
| `applause_soft` | encerramento do ato (opt-in movimento) | aplauso breve com mãos |
| `review_notes` | ato científico correlato | consulta de cartão, gesto de anotação |
| `reaction_subtle` | transição de figurino → rede | mudança da direção do olhar |
| `greet` | personagem selecionado | saudação contida, sem gestual teatral |

**Todo som é opt-in.** O modo `prefers-reduced-motion` usa poses estáticas e textos; a reação científica nunca substitui legenda acessível.

## 5. Mesas e relações com atos
- **Condução e elétrons:** Drude, Lorentz, Sommerfeld; ato de propriedades elétricas.
- **Cristalografia:** Max von Laue e os dois Bragg; alternância CCC/CFC/HC/DHCP/romboédrica quando modelos disponíveis.
- **Ligas e materiais:** Hume-Rothery; aplicações e composições.
- **Teoria quântica dos sólidos:** Bloch; distinção entre analogia do “mar de elétrons” e modelos quânticos modernos.

**Importante:** a presença dos cientistas no clube não significa que sejam pesquisadores específicos das terras raras. Suas contribuições fundamentam a compreensão dos metais, ligas ou redes cristalinas.

## 6. Pipeline de produção — sem Unity
```text
Retratos históricos e fontes verificadas + concept sheets aprovados
   ↓
Blender: sculpt de cabeça e mãos → retopologia → UV → material PBR
   ↓
Rig humanoide compartilhado + shape keys faciais + animações em NLA
   ↓
GLB por personagem (LOD0, LOD1, LOD2) + texturas otimizadas
   ↓
GitHub Actions: Blender headless exporta/valida assets, empacota artefatos
   ↓
Babylon.js: scene loader, animation groups, luz, sombras, câmera, LOD
   ↓
Menu de cientistas com cartão didático + biografia + ano + fontes
```
A cena `JazzClubAudience` mantém estado próprio e transitório; não recebe acesso de escrita à montagem científica do SILM. Selecionar cientista mostra painel de texto, sem alterar `scientificState`.

## 7. Revisão e critérios de aceite
1. Oito convidados identificáveis, sem variações repetitivas de rosto; nome/função/ano/fontes em cartões.
2. Ambiência histórica identificável, mas **encontro declarado fictício**.
3. Retratos usados como referências com licença/proveniência auditadas. Nada do jogo Liar's Bar é reutilizado.
4. Pelo menos três animações por cientista funcionando em Babylon.js (idle, atenção e reação) e configurações reduced-motion.
5. Oito personagens não travam cena móvel; ajustar LOD/texturas mediante perfilamento real.
6. Aparência final aprovada em close, plano médio e plano geral, em Chromium/Firefox/WebKit, desktop/mobile.
7. Integridade do SILM mantida antes/depois do clube.

## 8. Referências científicas
- Drude, *Zur Elektronentheorie der Metalle* (1900): https://doi.org/10.1002/andp.19003060312
- Hoddeson, Baym & Eckert, *The development of the quantum-mechanical electron theory of metals: 1928–1933*, Reviews of Modern Physics 59, 287 (1987): https://doi.org/10.1103/RevModPhys.59.287
- Nobel Foundation, Max von Laue: https://www.nobelprize.org/prizes/physics/1914/laue/biographical/
- Nobel Foundation, William Henry Bragg: https://www.nobelprize.org/prizes/physics/1915/wh-bragg/facts/
- IUCr, William Lawrence Bragg: https://www.iucr.org/what-we-do/awards-and-prizes/nobel-prize/w.l.bragg
- University of Cambridge, Hume-Rothery rules: https://www.phase-trans.msm.cam.ac.uk/2004/titanium/hume.rothery.html
- Babylon.js Blender animated character guide: https://doc.babylonjs.com/features/featuresDeepDive/animation/animatedCharacter
