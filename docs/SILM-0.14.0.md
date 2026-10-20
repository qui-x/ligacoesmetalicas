# SILM 0.14.0 — Interface unificada, Missões e Temas

Origem: 0.13.0, commit 10241bbe52a7ddd958bee700cd9f5a6dc7f04883. SHA-512 real do manifesto SHA512SUMS.txt da origem: `79143d58c1a127f1738d4d9b3946fd5319806b3e4b24dc6eb5087bce6d1c6ae527275e4aeefb7a414e3e8c53e7ad33328594e7317c4686941a0d2534ecf25a85`. O hash identifica esse manifesto, não um ZIP.

Base conferida: SI 0.9.13, commit 463e242c21c451036644c9c79999cd20ffe8aa3c. Sem atualização upstream posterior na conferência desta etapa. O snapshot continua íntegro.

A Home recupera a estrutura visual da Base SI e seus quatro caminhos: Laboratório, Aprender, Missões e Roteiros Experimentais. O motor metálico e os registros científicos permanecem os mesmos. A entrada completo.html agora encaminha à interface única; a sessão científica antiga válida continua sendo recuperada sem apagar o original.

Seis missões independentes cobrem montagem/cristalografia, vizinhança, elétrons, propriedade elétrica, parâmetro de rede e fator de empacotamento. Usam o mesmo ciclo active/completed/closed dos roteiros e o mesmo armazenamento de sessão. Concluir não encerra; refazer não remove o marcador histórico. Somente ferramentas pertinentes são oferecidas. A missão de elétrons admite a representação estática equivalente quando o movimento reduzido está ativo.

Sete temas conceituais são hubs não lineares com conteúdos curtos, relações com Missões/Roteiros e fontes centrais. Os marcadores individuais guardam somente ID e versão. Marcadores antigos compatíveis são migrados. Não há pontuação, desbloqueio ou percentual global.

O manual operacional existente, a tabela para apresentação, o caderno da Base e o relatório científico compartilhado ficam dentro da mesma navegação. Essa reconexão não representa a conclusão editorial/funcional da série 0.15.x. Não foi criado um segundo laboratório.

Validação: serviços científicos existentes, roteiros, missões, temas, referências inválidas, migração e remoção de campos de recompensa, navegação antiga, identidade da investigação livre, campos de relatório, mobile 320/360/390, texto 150/200% e offline em Chromium. Outros motores de navegador e dispositivos físicos ainda não foram homologados nesta rodada.

A etapa termina na 0.14.0. A 0.15.0 não foi iniciada.

Quando existem sessões antiga e atual distintas, Dados oferece Exportar investigação antiga (JSON). O original e a sessão atual permanecem intactos; a importação posterior usa o fluxo de confirmação do mesmo aplicativo.
