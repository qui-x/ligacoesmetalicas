# SILM — Simulador Interativo de Ligações Metálicas

O SILM é um simulador para estudar a **ligação metálica**:

- montar e organizar estruturas cristalinas de metais reais (CFC, CCC, HC e outras);
- observar os elétrons deslocalizados;
- experimentar as propriedades metálicas: condução elétrica e térmica, maleabilidade, ductilidade e brilho;
- medir, calcular e registrar tudo no Caderno e no relatório.

Os dados científicos vêm de fontes registradas, e o SILM não inventa valores que faltam.

Esta branch (`main`) contém **só a aplicação**: os arquivos que o site carrega.

## 1. Usar pela internet (mais fácil)

Abra **<https://qui-x.github.io/ligacoesmetalicas/>** num navegador atual (Chrome, Edge, Firefox ou Safari), no computador ou no celular.

- **Instalar como aplicativo:** Menu (☰) → **Instalar aplicativo**. Depois da primeira visita completa, o SILM funciona **sem internet**.
- **Atualizações:** quando sai uma versão nova, aparece o aviso **"Nova versão do SILM instalada"**. Toque em **Recarregar**; os dados salvos continuam.

## 2. Executar no seu computador

### Passo 1 — Baixar

- **Com Git:** `git clone https://github.com/qui-x/ligacoesmetalicas.git`
- **Sem Git:** no GitHub, botão **Code → Download ZIP**, depois descompacte.

### Passo 2 — Abrir

**Jeito recomendado: com um servidor local.** Assim funcionam todos os recursos, inclusive o modo offline e "Instalar aplicativo". Dentro da pasta do projeto, rode um destes comandos:

```bash
python3 -m http.server 8000      # se você tem Python
npx serve .                      # se você tem Node.js
```

Depois abra **<http://localhost:8000/>** no navegador. Com `npx serve`, use o endereço que ele mostrar.

**Jeito rápido: abrir o arquivo direto.** Dê dois cliques em `index.html`. O simulador funciona, mas sem o modo offline e sem "Instalar aplicativo", porque o navegador não permite isso em arquivos locais (`file://`).

Não é preciso instalar nada além do navegador: não há etapa de compilação para usar o programa.

## 3. Primeiros passos no programa

1. Na página inicial, escolha **Oficina dos Metais**. O **Manual** (no Menu) explica cada parte.
2. No Menu, abra **Montagens prontas** e comece pelo cobre (CFC), pelo ferro (CCC) ou pelo magnésio (HC). Você também pode escolher qualquer metal disponível em **Montagem → Preparo**.
3. Use **Ver** para observar:
   - célula e rede;
   - vizinhos;
   - elétrons;
   - projeções 2D e 3D;
   - propriedades metálicas.
4. Use **Dados** para ver as medições, os cálculos, o histórico, os dados do metal e o relatório.
5. Use **Visão geral** para comparar as estruturas recentes e tocar numa delas para abri-la no Foco.

## 4. Onde ficam os seus dados

Investigações, Caderno e relatórios ficam guardados **no próprio navegador**, no computador ou celular que você usa. Nada é enviado para servidores.

Para levar o trabalho para outro aparelho, exporte:

- a investigação em **Dados**;
- o Caderno no próprio **Caderno**.

Limpar os dados do site no navegador apaga esses registros.

## 5. O que há nesta pasta

| Arquivo ou pasta | Para que serve |
|---|---|
| `index.html` | Entrada do programa |
| `completo.html` | Endereço antigo, que leva ao `index.html` |
| `sw.js` | Modo offline (service worker) e aviso de nova versão |
| `manifest.webmanifest`, `favicon-*.svg`, `assets/` | Ícones e dados para instalar como aplicativo |
| `integracao/` | Interface: páginas, painéis Montagem/Ver/Dados, Caderno, Manual |
| `domain/silm/` | Motor científico: estruturas cristalinas, elétrons, propriedades, medições, cálculos e banco de dados dos metais (`domain/silm/data/`) |
| `LICENSE` | Licença GPL-3.0 |

## 6. Desenvolvimento, especificações e testes

O projeto completo continua na branch **[`especificacoes-atuais`](https://github.com/qui-x/ligacoesmetalicas/tree/especificacoes-atuais)**. Ela tem tudo o que saiu da `main`:

- especificações, contratos e planos (`docs/`);
- fontes dos dados, scripts de build e testes automáticos;
- evidências de paridade com o SIAB e histórico de versões (`CHANGELOG.md`);
- o Clube de Jazz e Metais (`jazz-club/`).

Para desenvolver a partir dela (é preciso ter o Node.js 22 ou mais novo):

```bash
git checkout especificacoes-atuais
npm ci                # instala as ferramentas de teste
npm run build         # gera os dados, a entrada e o sw.js
npm test              # testes científicos, rotas, aprendizagem e integração
npm run test:parity   # telas comparadas com o SIAB (navegador)
```

Para publicar uma versão nova na `main`, leve à `main` só os arquivos da aplicação, os mesmos da tabela acima. Sempre gere o `sw.js` antes, com `npm run build`; senão, o aviso de nova versão não aparece para quem já tem o SILM instalado.

## Licença

GPL-3.0. Veja `LICENSE`.
