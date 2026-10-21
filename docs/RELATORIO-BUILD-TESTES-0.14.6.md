# Relatório de build e testes — SILM 0.14.6

## Escopo

Reformulação da expansão: viewport completo, controles centrais mantidos e botão de expansão/recolhimento integrado à barra flutuante.

## Alterações

- Removido o botão independente de retorno.
- O controle existente alterna estado e rótulo e é movido para a barra da câmera quando a estrutura cristalina está pronta.
- A área da cena ocupa a janela, oculta a coluna lateral de notas e mantém a proporção do palco.
- Layout responsivo mantém o acesso ao botão em telas compactas.
- Testes de integração atualizados para verificar a localização do botão, a disponibilidade dos controles, as dimensões e a preservação do estado científico.

## Limite da validação

A suíte de navegador não foi executada nesta sessão. A conclusão do deploy não substitui os testes funcionais; executar `npm run build:integration`, `npm run audit` e `npm test` para homologar.
