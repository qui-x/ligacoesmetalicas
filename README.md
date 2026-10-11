# SILM 0.3.0 — A Arquitetura dos Metais

SILM 0.3.0 mantém o banco científico da 0.2.1 e acrescenta uma investigação persistente sobre um único metal. Selecione um elemento disponível na Tabela e use **Iniciar investigação**. A estrutura metálica ainda não é montada.

## Executar e testar

Sirva esta pasta por HTTP ou HTTPS. `npm run build` valida banco e estado e gera os recursos locais. `npm run test:scientific` valida dados, busca, migração e lifecycle; `npm run audit` confere a distribuição; `npm run test:030` executa a suíte Playwright quando os navegadores estão instalados.

## Banco de dados

- `domain/silm/data/elements.json`: registro canônico dos 118 elementos e proveniência por campo.
- `domain/silm/data/sources.json`: referências científicas utilizadas.
- `domain/silm/data/evidence/cif/`: registros cristalográficos preservados com hashes SHA-256.
- `scripts/validate-scientific-data.cjs`: validação bloqueante do build.
- `domain/silm/state.js` e `scripts/validate-scientific-state.cjs`: serviço único e validação bloqueante do estado.

## Documentação e evidências

- `docs/SILM-0.3.0.md`, `docs/SCIENTIFIC-STATE.md` e `docs/INVESTIGACAO.md`
- `docs/SILM-0.2.1.md`
- `docs/SILM-0.2.0.md` — escopo e dados de referência da implementação inicial.
- `docs/SCHEMA-DADOS-CIENTIFICOS.md`
- `docs/COBERTURA-METAIS.md`
- `docs/AUDITORIA-FONTES-0.2.0.md`
- `docs/FONTES-E-PROVENIENCIA.md`
- `docs/ARQUITETURA-CIENTIFICA.md`
- `docs/AREA-DO-PROFESSOR-0.2.0.md`
- `docs/RELATORIO-BUILD-TESTES-0.3.0.md`
- `docs/evidence-0.3.0/` — relatórios automatizados e capturas reais.

Os resultados e limites da homologação desta versão constam no relatório. A série 0.4.x aguarda homologação da 0.3.0.
