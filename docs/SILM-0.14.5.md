# SILM 0.14.5 — Visualização expandida da estrutura metálica

## Objetivo

Permitir que uma estrutura cristalina previamente organizada na Oficina dos Metais seja ampliada para ocupar praticamente toda a área visível, para observação detalhada e apresentação em sala.

## Uso

1. Abra Montagem, selecione um metal elegível e inicie a investigação.
2. Construa a montagem e use **Organizar estrutura** para formar a estrutura cristalina de referência.
3. Na barra superior da Oficina, use **Expandir**. O botão é habilitado somente quando há uma estrutura cristalina organizada e com unidades.
4. A estrutura passa a ocupar a área visível, mantendo a projeção atual 2D/3D, a seleção, as camadas, a câmera e o conteúdo científico.
5. Para voltar, use **Voltar** no canto superior da cena ou pressione **Esc**. O painel de origem e os controles de navegação permanecem disponíveis ao sair.

## Comportamento e compatibilidade

- A expansão reaproveita a mesma instância da cena e não cria uma nova estrutura, sessão ou cópia do estado.
- As docas são recolhidas ao abrir o modo expandido para evitar que painéis cubram a estrutura.
- A cena é redimensionada a partir do contêiner, com atualização do palco em desktop, celular e orientação paisagem.
- Os controles respeitam foco de teclado, rótulos acessíveis, tecla Esc e áreas seguras de dispositivos móveis.
- O modo expandido é uma apresentação da vista existente: não modifica posições atômicas, cristalografia, cálculos, medições, nem o schema científico 8.
- A rota de produto `#/ambiente` e os contratos da Base SI 0.9.17 permanecem inalterados.

## Validação

Foram acrescentadas verificações de integração para botão desabilitado antes da organização, ativação depois da organização, dimensões ampliadas, saída por Esc e invariância do estado científico em desktop e celular. A execução automatizada deve ser confirmada conforme o [relatório de build e testes](RELATORIO-BUILD-TESTES-0.14.5.md).
