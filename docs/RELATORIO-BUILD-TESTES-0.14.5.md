# Relatório de build e testes — SILM 0.14.5

## Escopo desta rodada

Implementação do modo de visualização expandida para estruturas cristalinas organizadas, reusando a cena configurada na Oficina dos Metais.

## Alterações e verificações estáticas

- Botão **Expandir** na barra superior, desabilitado antes da configuração da estrutura cristalina.
- Modo expandido em camada fixa, ocupando a área visível e preservando a cena atual.
- Saída pelo botão **Voltar** ou pela tecla Esc, com restauração de foco.
- Regras responsivas para telas estreitas, orientação paisagem e áreas seguras do dispositivo.
- Testes de integração acrescentados para disponibilidade do botão, dimensões, responsividade e estado científico antes/depois.
- Manifesto SHA-512, versão, metadados do pacote, PWA e changelog atualizados.

## Limite da validação

**Os testes automatizados não foram executados nesta sessão.** Para homologar no checkout, executar:

1. `npm run build:integration`
2. `npm run audit`
3. `npm test`

O sucesso do build/deploy do GitHub Pages não substitui os testes de interação no Chromium nem a verificação em aparelhos reais.
