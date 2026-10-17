# Identidade visual oficial do SILM

**Origem:** pacote `SILM_LOGO_E_ANIMACAO_OFICIAL_CORRIGIDO.zip` ("SILM — Identidade e animação oficial"), fornecido pelo autor do projeto e integrado na 0.9.0.

## Regra de identidade (do pacote)

> A animação deve convergir para a mesma geometria do símbolo mestre. O fundo escuro não faz parte da marca institucional principal; ele pertence apenas à variante de ícone/aplicação.

O símbolo é uma **estrutura cúbica metálica**:
- duas faces quadradas e quatro conexões de profundidade;
- oito vértices dourados e um centro metálico interno;
- um **fluxo eletrônico** azul deslocalizado que atravessa o conjunto.

É uma marca, não um modelo cristalográfico: não indica estrutura CCC, CFC nem HC, nem trajetórias de elétrons.

## Onde cada variante é usada

| Variante | Arquivo no SILM | Uso |
|---|---|---|
| Símbolo mestre (transparente, 256×240) | `assets/silm-simbolo.svg` | Cabeçalho (marca), estado vazio da área central, diálogo Sobre e ícone padrão da identidade (`js/core/identity.js`) |
| Ícone de aplicação (container grafite `#1f2329`, 256×256) | `assets/silm-icone.svg`, `favicon-dark.svg`, `favicon-light.svg` | Favicon e ícone SVG do manifesto PWA |
| Logo vertical (símbolo + SILM + nome + tema) | `assets/silm-logo-vertical.svg` | Material institucional sobre fundo claro (o texto é escuro) |
| PNG 192 e 512 | `assets/icon-192.png`, `assets/icon-512.png` | Manifesto (`purpose: any`), gerados do ícone de aplicação com cantos transparentes |
| PNG maskable 512 | `assets/icon-maskable-512.png` | Manifesto (`purpose: maskable`): fundo grafite sem cantos e símbolo a 80% dentro da zona segura |
| PNG 180 | `assets/apple-touch-icon.png` | iOS: fundo grafite sem transparência (o sistema aplica a própria máscara) |

O SIAB usa o mesmo princípio: o símbolo transparente aparece no cabeçalho (`.header-brand`), na abertura e no diálogo de inicialização. O SILM, como programa da mesma família, segue essa regra.

Os PNG são gerados pelo Chromium a partir dos SVG oficiais, sem redesenho.

## Abertura

| Arquivo | Papel |
|---|---|
| `domain/silm/abertura/silm-opening.js` | Cópia íntegra do pacote (API `SILMOpening.mount`) |
| `domain/silm/abertura/silm-opening.css` | Cópia íntegra do pacote (etapas: estrutura, condutividade elétrica, condutividade térmica, deslizamento, brilho, consolidação, identidade) |
| `domain/silm/abertura.js` | Adaptador ao contrato da família SIAB |
| `domain/silm/abertura.css` | Regras de integração e a correção descrita abaixo |

**Contrato de família**, o mesmo do SIAB (`js/ui/abertura.js`), implementado desde a 0.10.1 pela camada de abertura da Base Estrutural (`SimCore.opening`, `js/a11y/opening.js`):

| Situação | Comportamento |
|---|---|
| Ao abrir ou recarregar | Toca uma vez, antes do primeiro desenho. A decisão é tomada no `<head>` pelo portão da Base (`js/a11y/opening-gate.js`); `domain/silm/prelude.js` só migra, uma vez, a preferência antiga do SILM |
| Pular | Toque, clique, qualquer tecla ou o botão **Pular abertura** |
| Pular pelo teclado | O foco vai ao conteúdo da tela atual |
| Reduzir animações (sistema ou preferência) | Não aparece |
| Preferência desligada | Não aparece. Fica em Acessibilidade → Aparência → Animação de abertura e é salva no armazenamento do núcleo (`opening`) |
| Leitores de tela | A camada é decorativa (`aria-hidden`) e o botão fica fora da ordem de Tab, porque qualquer tecla a encerra |
| Proteção | Uma regra CSS independente torna a camada inerte e invisível em 7 s, contados do início do ciclo, mesmo sem o controlador |

A duração oficial é de **6,1 s**, definida no pacote. O SIAB usa cerca de 3,6 s, com o mesmo contrato de pular.

### Correção aplicada sem editar o pacote

No Chromium, quando um filtro SVG (`filter="url(#silmThermalGlow)"`) é aplicado a um **grupo** cujos filhos estão todos transparentes, aparece um quadrado preto na origem do SVG, no canto superior esquerdo do símbolo. O defeito também ocorre no arquivo autônomo do pacote (`SILM_ANIMACAO_OFICIAL_AUTONOMA.html`).

`domain/silm/abertura.css` desliga o filtro do grupo e o aplica a cada círculo da onda de calor. O resultado visual da onda é o mesmo, e o teste 0.9-ID1 verifica a correção. Recomenda-se aplicar a mesma mudança na fonte oficial do pacote.

## Integridade dos arquivos oficiais (SHA-256)

| Arquivo do pacote | SHA-256 |
|---|---|
| `animacao/silm-opening.js` | `73a0c65ca0d7defe0669e8f8df891a8debea205b168336337704b63daf3d9b69` |
| `animacao/silm-opening.css` | `c9436bf26582566e15cc1ffe13af1faf08bb68c32851fefbf0b461fb6686e6f8` |
| `logo/silm-icone-aplicacao.svg` | `15a417fbf0eaeeda13d0d5492cd44bb5157a3784afbf5b6b2e99a0e996b15ea5` |
| `logo/silm-logo-oficial-simbolo.svg` | `b9af1175e401f06b8aec2583b89a8c626a823bb6c88be8b9174ffeaf4721a766` |
| `logo/silm-logo-oficial-vertical.svg` | `3569ac1a23e5d380122d7f3326ab39c5bfe99281f24518b84c144b6dcc3e0968` |

A auditoria confere que as cópias no SILM têm exatamente esses hashes.
