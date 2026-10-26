# Jazz e Metais — Motor funcional de dança 01

**26/10/2026 · Ramificação:** `feature/baile-eletrons-jazz-1925`  
**Objetivo:** priorizar coreografias e sincronização musical, adiando escultura de acabamento e os rigs cinematográficos. **`main` não modificada.**

## A implementação Babylon.js nesta branch
- `jazz-club/web/dance.html`: cena independente, tela inteira, controles acessíveis de formação, BPM, intensidade, música, movimento reduzido, câmera, pausa e tela cheia.
- `jazz-club/web/src/dance-core.js`: cálculos **determinísticos e sem renderizador** para 3 protagonistas (Euria/Eu, Céria/Ce, Gádia/Gd), com 5 formações (trio, dueto + solista, roda, linha Charleston e troca). Passos de Charleston, swing, laterais e pivôs, poses de cabeça/braços/cotovelos/quadris/pernas/joelhos e alternância a cada 32 tempos.
- `jazz-club/web/src/dance.js`: cena Babylon.js de ensaio com modelos articulados **provisórios** e ornamentos nos trajes alusivos a CCC, CFC e HC. Mantém renderização cênica e visualização científica separadas; ornamentações NÃO representam movimento físico de elétrons.
- Música: importação local de MP3, OGG ou WAV, inicia somente por clique; Web Audio Analyser alimenta **energia de movimento** sem enviar áudio a servidor. Ensaio silencioso disponível. JSON opcional informa BPM, início do primeiro tempo, seções, intensidade, formação. `exemplo-ensaio-120bpm.json` é **modelo genérico**, não sincronização com uma composição aprovada.
- Formações manuais interpolam posições por quatro tempos; a forma automática segue frases de 32 tempos ou usa marcações explícitas por seção importadas do JSON.
- `jazz-club/web/vite.config.js`: build multipágina `index.html` (inspeção Sommerfeld) e `dance.html` (pista).
- `jazz-club/web/tests/dance-core.test.mjs`: testes puros (formações, tempo, interpolação, colisão de raízes, modo reduzido, leitura de marcações).
- `jazz-club/web/tests/dance-browser.mjs`: smoke-test de renderização Babylon no Chromium após `npm run build`. Checa movimento de 3 dançarinos, formações, pausa, carregamento de marcadores, desktop e mobile.
- `.github/workflows/jazz-dance-functional.yml`: CI independente da exportação Blender, para o protótipo de dança. Cria artefato ZIP do Vite build e screenshots **se** execução e testes concluírem com sucesso.

## Conferência local adicional nesta rodada
Foi produzida uma **prévia offline baseada no WebGL2 original da POC do projeto**, NÃO uma compilação Babylon. Foi utilizado o conteúdo de `SILM-Jazz-e-Metais-POC-02`, com 3 faixas de ensaio preexistentes: `euria-swing.mp3`, `ceria-stride.mp3`, `gadia-hex.mp3`. São **músicas antigas de teste**, não as últimas faixas aprovadas na conversa de composição.

A prévia WebGL2 recebeu controle de formação, BPM, expressividade, pausa, áudio opcional e fallback Canvas2D. No Chromium do ambiente não foi permitida navegação localhost nem a criação de contexto WebGL real; um teste do HTML inserido diretamente no navegador confirmou funcionamento dos controles em Canvas2D, troca de dueto/roda, 138 BPM, intensidade 91%, inexistência de erros JavaScript, modo móvel 390px sem transbordamento horizontal. Isso **não** demonstra sucesso do Babylon ou da WebGL2 real.

## Execução da cena Babylon no próprio repositório
```bash
cd jazz-club/web
npm install
npm run test:dance
npm run dev
# abra /dance.html no endereço local exibido pelo Vite
```

Para validar a cena final em Chromium (depende de WebGL funcional):
```bash
npm run build
npx playwright install chromium
npm run qa:dance
```

## Exemplo de marcadores por seção
```json
{
  "title": "Ensaio original",
  "bpm": 120,
  "beatOffset": 0,
  "events": [
    {"beat": 0, "section": "Abertura", "formation": "trio", "energy": 0.5},
    {"beat": 32, "section": "Dueto", "formation": "pares", "energy": 0.7}
  ]
}
```
Conectar o andamento e as entradas **às faixas aprovadas** será a etapa de integração musical; tempos e seções do exemplo acima são placeholders de ensaio e não uma análise das faixas aprovadas.

## Estado real
**Implementado e versionado** na branch: motor de coreografia, cena Babylon, UI e testes automatizados.  
**Verificado nesta sessão:** a prévia independente WebGL2/Canvas2D na modalidade Canvas2D (sem erros e desktop/mobile); formato dos áudios de ensaio preexistentes; sintaxe JavaScript da POC.  
**Ainda não comprovado:** execução de GitHub Actions do workflow novo (nenhum run confirmado), build/npm da nova cena Babylon, GPU WebGL 3D, testes de navegador do arquivo gerado na CI e streaming das novas faixas aprovadas. Não declarar como pronto para `main` até os testes.

**Próximo critério funcional:** confirmar o workflow de dança e obter capturas reais Babylon com animações, depois ampliar repertório/coreografias em conjunto, antes de aumentar resolução dos modelos.
