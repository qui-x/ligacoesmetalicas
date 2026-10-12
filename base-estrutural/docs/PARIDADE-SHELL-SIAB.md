# Paridade operacional — Base 0.2.4 e SIAB(9).zip

Referência congelada: SIAB(9).zip, versão interna 1.0.0. A identificação por conteúdo foi confirmada expressamente no prompt 0.2.4 e o SHA-512 foi conferido. Método: leitura de fontes da referência e execução dos testes da Base. Não se declara uma nova homologação do SIAB em navegador.

## Quatro pontos resolvidos

| Ponto | Referência | Base 0.2.4 | Estado |
|---|---|---|---|
| Conclusão restrita | Concluir abre relatório e conserva atividade/restrição até encerrar | completed mantém contexto e relatório; exit restaura livre e preserva resultado | Resolvido |
| Configurações de inicialização | Modal acessível a partir de Home e Menu | Mesma modal estrutural nos dois acessos; Salvar e cancelamento; preferência única | Resolvido |
| Marca contextual | Marca retorna à atividade durante restrição | Link ao contexto ativo ou relatório concluído, com teclado e foco | Resolvido |
| Referência documental | SIAB(9).zip e hash indicado | Identificação atual padronizada, hash preservado | Resolvido |

## Estrutura preservada

| Superfície | Resultado |
|---|---|
| Cabeçalho mobile | Acessibilidade e botão de Menu continuam operáveis a 320, 360 e 390 px |
| Drawer | Mesma gaveta, animação de 250 ms, disclosures, foco, Escape e retorno ao acionador |
| Navegação geral | Desktop e bottom nav acompanham restrição e breakpoint; sem reserva inferior quando ocultas |
| Menu da atividade | Contexto, identificação, módulo, status, ajuda, relatório opcional, saída e acessibilidade |
| Banner | Permanece externo ao cabeçalho |
| Home | Laboratório, Aprender, Missões, Roteiros Experimentais e Caderno opcional; Manual e Professor como apoio |
| Módulos | Explorar, Medir e Calcular da Demo mantêm seleção e dados |
| Recursos e Projetor | Registros existentes preservados |
| Ajuda | Orientação fornecida pelo domínio, sem acesso implícito ao Manual completo |
| Relatório | Serviço contextual com edição, impressão e histórico existentes |
| PWA, storage e lifecycle | Regressões repetidas nesta versão |

Adaptações sem impedimento estrutural estão em DIFERENCAS-RESIDUAIS.md. O core continua neutro e não incorpora conteúdo científico da referência.
