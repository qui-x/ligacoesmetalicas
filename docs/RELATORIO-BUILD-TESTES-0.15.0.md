# Relatório de build e validação — SILM 0.15.0

## Escopo

Ampliação da cobertura experimental somente onde a referência pode ser associada a uma geometria já implementada, sem mapear silenciosamente estruturas incompatíveis.

## Alterações

- Adicionadas referências para 14 metais: Ti, Cr, Co, Rb, Zr, Nb, Ru, Rh, Cd, Cs, Hf, Re, Os e Ir.
- Atualizados bundle, cobertura gerada, testes de dados, documentos de estruturas cristalinas e proveniência.
- Condições de temperatura sem valor publicado permanecem qualitativas; não se inventou uma temperatura.
- Schema científico 8 preservado.

## Validação pendente

O build de CI deverá executar npm run build, npm run test:scientific, npm run audit e os testes de integração. A suíte completa de navegador não foi executada localmente nesta sessão. Os nove sistemas cristalográficos incompatíveis com CCC/CFC/HC permanecem sem visualização até a implementação e homologação dos modelos específicos.
