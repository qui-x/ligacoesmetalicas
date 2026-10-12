# Diferenças residuais — 0.2.3 Correções

| Item | SIAB fornecido e Base | Motivo |
|---|---|---|
| Nome da referência | Arquivo disponível SIAB(4).zip, idêntico ao SIAB(3), versão interna 1.0.0; prompt citava SIAB(9) | Identificação alinhada à correção do usuário, preservando hash real |
| Marca restrita | SIAB leva à atividade; Base deixa a marca inerte | Requisito comum: impedir atalho ao Início |
| Animação | SIAB 260 ms/cubic-bezier; Base 250 ms/ease-out | Animação curta solicitada, com reduced motion em ambos |
| Finalização | SIAB mantém contexto configurado e abre relatório; Base libera a navegação quando completed | Regra explícita da rodada 0.2.3, mantendo o motor herdado |
| Ajuda | SIAB seleciona tópico por ferramenta; Base recebe ajuda/Manual relacionado do domínio | Core neutro, sem catálogo científico |
| Inicialização | SIAB abre modal própria; Base usa o select já existente na gaveta | Home e Menu compartilham a mesma preferência, sem novo storage |
| Preferências | SIAB inclui recursos específicos adicionais | Base mantém seu motor e conjunto existente conforme escopo |
| Identidade e conteúdo | Base/Demo neutras | Conteúdo científico e identidade de cada produto ficam no domínio |
| Caderno, recursos e tour | Contratos opcionais; tour somente hook | Sem impor editor, registro científico ou tour definitivo |

A referência fornecida foi conferida. O pedido de reenvio foi retirado. Homologação humana e limites de motores/dispositivos continuam documentados em LIMITACOES-CONHECIDAS.md.
