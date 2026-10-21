# SILM 0.14.6 — Tela inteira e controles integrados

## Objetivo

Fazer a estrutura cristalina configurada ocupar a tela inteira durante a exploração, preservando os controles centrais e o estado científico.

## Comportamento

- A área de visualização ocupa toda a janela do navegador, respeitando as áreas seguras dos dispositivos.
- O palco cristalográfico cresce até o maior tamanho possível para a proporção da tela, sem deformar as unidades.
- O mesmo botão **Expandir/Recolher** é incorporado à barra flutuante de zoom, enquadramento, centralização e rotação.
- Em celulares, o botão permanece acessível mesmo quando os outros controles estão recolhidos; na visualização expandida, os controles centrais ficam visíveis.
- A tecla `Escape` recolhe a visualização. A estrutura, as seleções e a representação configurada permanecem preservadas.

## Validação

Os testes de integração foram atualizados para conferir a posição do botão, o aumento do palco, a disponibilidade dos controles e a preservação do estado. A suíte de navegador ainda precisa ser executada para homologação.
