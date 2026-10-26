# SILM — O Baile dos Elétrons: Jazz Club 1925
## Direção visual e arquitetura de protótipo
*26 de outubro de 2026 — documento de concepção, não implementação.*

### Referência gráfica aprovada
A ambição visual é **semelhante ao nível de apresentação de Liar's Bar**, produzido em Unity pela Curve Animation: personagens 3D estilizados e expressivos, cenografia volumétrica, enquadramento cinematográfico, sombras, materiais e iluminação quente, com ambientes relativamente contidos. É uma referência de **qualidade e linguagem de produção**, não autorização para reutilizar personagens, texturas, modelos, músicas, cenários ou interface do jogo. A identidade própria do SILM será **Art Déco / clube de jazz de 1925**, com contrastes dourado–cobre–vinho e silhuetas estilizadas de elétrons dançarinos.

Fontes sobre Liar's Bar:
- https://store.steampowered.com/app/3097560/Liars_Bar/
- https://steamdb.info/app/3097560/info/
- https://www.pcgamingwiki.com/wiki/Liar%27s_Bar

### Decisão criativa
**Modelo híbrido aprovado**: elétrons surgem como personagens dançarinos e se transformam, diante do usuário, em marcadores luminosos de uma distribuição eletrônica *qualitativa*. O ritmo musical controla **a dança, o som e os efeitos visuais**, nunca o fenômeno eletrônico. Não modelar elétrons orbitando centros metálicos; não inferir número de elétrons pela quantidade de avatares; não apresentar trajetórias como física quântica literal. Cada tela deverá explicitar a diferença entre a metáfora artística e o modelo científico.

### Motor a avaliar primeiro — Unity Web
O jogo de referência utiliza Unity. Para explorar o mesmo padrão de produção (rigging, animação, materiais, pós-processamento e iluminação), a opção preferencial para a **prova de conceito** é:
- **Unity 6.6 / Unity Web**, com C# e exportação IL2CPP → **WebAssembly**;
- **WebGL 2** como fallback de compatibilidade e **WebGPU** quando detectado, com testes em Firefox, Safari e Chromium;
- **URP** com iluminação majoritariamente *baked*, sombras selecionadas, materiais PBR, *reflection probes*, bloom sutil, fog e correção cromática — compatibilidade específica será verificada em protótipo;
- **Blender e scripts Python** para gerar e refinar salão, palco, bar, mobília, roupas, rigs e animações; importação de assets pela pipeline Unity;
- **WebAssembly adicional em Rust** não é necessário por padrão: Unity Web já gera Wasm. Só criar módulo próprio após perfilamento demonstrar gargalo específico de CPU;
- **Babylon.js** fica como alternativa caso o módulo Unity seja impraticável em peso, acessibilidade, compatibilidade ou integração. Qualidade gráfica depende de assets, materiais, luz, câmera e otimização; trocar de engine sozinho não reproduz visual de jogo.

A escolha definitiva do motor fica **condicionada a uma prova de conceito funcional no navegador**, não apenas a imagens estáticas.

Documentação oficial:
- https://docs.unity.com/en-us/engine/6000.6/manual/platform-specific/webgl/develop/class-player-settings-web-gl
- https://docs.unity.com/en-us/engine/6000.7/manual/whats-new/unity66
- https://docs.unity.com/en-us/engine/6000.5/manual/platform-specific/webgl/intro/browsercompatibility
- https://docs.unity.com/en-us/engine/6000.6/manual/webgl-deploying.html
- https://www.babylonjs.com/specifications/

### Integração com SILM
```
SILM atual (HTML/CSS/JS + motor científico)       — permanece como fonte de verdade
   └── comando voluntário "Abrir o baile"
         └── adaptador serializa snapshot científico válido e imutável
               └── Jazz Club Unity Web (módulo isolado, só carrega ao abrir)
                    ├── palco 3D e câmera cinematográfica
                    ├── cristais gerados a partir de posições científicas
                    ├── avatares e animação de dança
                    ├── transição dançarino → partícula qualitativa
                    ├── modo científico (sem cenografia excessiva)
                    └── controles de áudio, acessibilidade, qualidade e sair
```

Não reescrever `scientificState`, `representationState` ou o motor da Oficina. O SILM envia **cópia somente leitura** dos dados autorizados (elemento, estrutura, coordenadas e rótulos). O Unity não recebe referência a `model`, `storage`, `run` nem métodos mutáveis. Se houver comunicação por `postMessage`, validar origem, tipo e schema; comandos da cena não escrevem na investigação. A pista representa visualmente a geometria da estrutura selecionada; artistas e partículas podem ser instâncias muito mais numerosas que os centros científicos, e não podem ser confundidas com dados quantitativos.

### Etapas da experiência
1. **Entrada**: abrir apenas por ação do usuário; sem autoplay. Uma câmera próxima revela o palco, iluminação e dançarinos.
2. **Baile**: três ou mais personagens originais estilizados, animações sincronizadas musicalmente, expressões corporais, controle de câmera e detalhes materiais.
3. **Revelação**: transição contínua da forma das silhuetas para pontos luminosos; mostrar explicação textual sobre o limite da metáfora.
4. **Modelo científico**: destacar os centros metálicos e a deslocalização coletiva; remover coreografia, figurino e elementos interpretáveis como trajetória física.
5. **Exploração**: câmera orbitável com controles de zoom/reset, seleção de centros e alternância artística/científica.
6. **Saída**: restaurar foco, parar som/frames e liberar recursos. Snapshot da investigação permanece idêntico.

### Direção de arte — Liar's Bar como régua, não cópia
- **Cenografia**: salão compacto e detalhado; balcão, pequenos camarotes, instrumentos de jazz, pista Art Déco, iluminação quente e áreas de sombra. Na passagem científica, a cenografia recua para tornar a rede legível.
- **Personagens**: elétrons próprios, estilizados com silhuetas legíveis, acessórios discretos de 1925, expressões corporais, passos de Charleston como *coreografia* e materiais metálico-luminosos.
- **Câmeras**: enquadramento cinematográfico aproximado para personalidades, plano geral para estrutura, órbita controlada para investigação.
- **Materialidade**: metal escovado, latão, madeira, tecido, vidro e brilho dos avatares. Priorizar textura/normal/roughness e iluminação coerente, não um número indiscriminado de efeitos.
- **Som**: composição/gravacão original ou com licença expressa, reprodução somente após interação e com mute.
- **Oclusão/profundidade**: dançarinos, instrumentos e elementos arquitetônicos devem compartilhar uma cena 3D real, não uma projeção 2D simulada.

### Restrições relevantes
- O SILM é estático/PWA, opera também offline e em dispositivos móveis; uma build Unity Web pode ficar grande, consumir muita memória e impor mais tempo de carregamento.
- Carregamento **sob demanda**, sem importar a build Unity na inicialização da Home ou Oficina.
- Oferecer preset **cinematográfico (desktop)**, **equilibrado** e **econômico (mobile)**. Reduzir sombras dinâmicas, pós-processamento, resolução interna e personagens em dispositivos limitados.
- Respeitar `prefers-reduced-motion` e os controles próprios do SILM; fornecer narrativa textual equivalente; teclado e botão de sair sempre disponíveis.
- A aplicação em Unity Web deve ser testada em Chromium, Firefox e Safari/WebKit. Compatibilidade de versões recentes não prova desempenho suficiente.
- Em hospedagem estática (GitHub Pages), validar MIME e compressão da build WebAssembly; pode ser necessário o modo *Decompression Fallback* ou outra configuração/estratégia de publicação, com impacto em tamanho e carregamento.
- Alvo de avaliação inicial, **não homologado**: aproximadamente 60 fps desktop e 30 fps mobile em cenário representativo; a qualidade final dependerá de perfilamento e dispositivos medidos.
- A build Web não deve carregar música automaticamente. Service workers/cache do clube serão planejados para não colidir com o Service Worker existente do SILM.

### Prova de conceito, critérios de aceite
1. Uma cena Unity Web standalone hospedável estaticamente com salão, três avatares e uma câmera.
2. Materiais PBR e iluminação com ambiência próxima da referência (sem assets do jogo).
3. Receber snapshot de geometria cristalográfica de teste, construir posições e demonstrar que a cena não altera dados científicos.
4. Transição contínua dançarinos → partículas qualitativas; orbitabilidade e oclusão 3D durante a transição.
5. Sem áudio antes de ação; controles de pausar, reduzir movimento, qualidade, fechar.
6. Testes de tamanho da build, inicialização, fps, consumo de memória e comportamentos do WebGL2/WebGPU.
7. Escolher Unity definitivamente se os requisitos web/mobile/offline e visuais forem atingidos; caso contrário, comparar com protótipo equivalente em Babylon.js.

### Delimitação do trabalho paralelo
Fazer alterações neste recurso **somente na branch** `feature/baile-eletrons-jazz-1925`. A outra frente de trabalho pode atualizar as estruturas metálicas na `main`. Antes de integrar, trazer as mudanças científicas recentes da `main`, resolver conflitos no adaptador e executar todos os testes. Não afirmar que o easter egg está pronto enquanto não existir uma build executável e verificada.
