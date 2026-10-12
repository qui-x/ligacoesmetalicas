# Base Estrutural 0.2.4

Fechamento da Base antes do desenvolvimento do SILM. Cópia independente da Base 0.2.3, com quatro correções: conclusão de atividade restrita, modal de inicialização, marca contextual e identificação documental da referência **SIAB(9).zip**. Conteúdo e mecânicas científicas pertencem aos domínios.

## Abrir

Sirva esta pasta por HTTPS ou execute dentro dela:

```sh
python3 -m http.server 8080
```

- Base vazia: http://localhost:8080/
- Demo estrutural: http://localhost:8080/?demo=1

O ZIP contém o projeto completo, documentação, testes e capturas; não é um patch que depende de extrair versões anteriores.

## Operação corrigida

Concluir uma missão valida e salva o resultado, abre o relatório quando registrado e mantém o contexto restrito. Somente Encerrar atividade remove esse contexto e restaura a navegação. O marcador de conclusão e o relatório permanecem salvos, e Refazer cria outra sessão.

Configurações de inicialização na Home e Inicialização em Menu → Preferências abrem a mesma modal. Salvar confirma a escolha; Cancelar, Fechar e Escape preservam a preferência anterior. Destinos elegíveis vêm do domínio e usam o armazenamento estrutural existente.

A marca abre Início no estado normal. Em atividade restrita, retorna à sessão atual; após a conclusão, retorna ao relatório quando disponível. Mantém teclado e foco visível.

## Testar

```sh
npm ci
npx playwright install chromium firefox webkit
npm run build
npm test
npm run audit
```

As cinco suítes gravam seus resultados em tests/results. O harness aceita PLAYWRIGHT_MODULE, AXE_MODULE, CHROMIUM_EXECUTABLE, CHROMIUM_LIBS, FIREFOX_DISABLE_SANDBOX, TEST_ENGINES, TEST_FILTER e TEST_OUTPUT. A validação entregue usa os ambientes e versões informados em docs/RELATORIO-TESTES.md.

## Documentação incluída

| Arquivo | Conteúdo |
|---|---|
| docs/BASE-ESTRUTURAL-0.2.4.md | Escopo e fechamento |
| docs/CONTRATOS.md | Atividades, marca, inicialização e lifecycle |
| docs/CRIAR-DOMINIO.md | Registro de opções e integração do domínio |
| docs/PARIDADE-SHELL-SIAB.md | Quatro correções e paridade operacional |
| docs/RELATORIO-TESTES.md | Resultados, cobertura e ambiente |
| docs/RELATORIO-REGRESSOES.md | Preservação dos fluxos aprovados |
| docs/CAPTURAS-0.2.4.md | Índice das evidências visuais |
| docs/ARQUIVOS-ALTERADOS.md | Diferenças contra a origem 0.2.3 |
| docs/LIMITACOES-CONHECIDAS.md | Limites da validação |
| BUILD-INFO.json | Versão, origem e hashes |

Ponto de extensão: SimCore.registerDomain(factory()). Licença GNU GPL v3; licença BSD do dialog-polyfill preservada. A execução termina na 0.2.4. O SILM e os pacotes anteriores permanecem preservados.
