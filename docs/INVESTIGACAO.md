# Investigação

> Reconstruído na 0.4.0 a partir do prompt 0.3.0 e do código. O arquivo original não constava do pacote recebido.

## O que é

Uma **investigação** é uma sessão científica sobre **um único metal**. Ela tem identificador próprio (`inv-` + UUID), status (`new`, `active`, `paused`) e tipo (`free`, `route`, `mission`, `teacher`). Desde a 0.4.0, a investigação pode conter uma **montagem metálica** (`structure`).

## Criação

```text
Laboratório → Tabela Periódica → metal disponível → Iniciar investigação → scientificState criado
```

O primeiro clique apenas seleciona e mostra os dados; a investigação nasce por ação explícita. Um elemento indisponível não cria investigação, e o motivo é mostrado. A investigação começa com `structure = null`; a montagem é iniciada depois, com **Iniciar montagem**.

## Retomada

Ao recarregar, a investigação válida é retomada diretamente, no mesmo metal, no mesmo módulo e com a mesma montagem, sem abrir a Tabela e sem o diálogo "Retomar sessão?". Um estado inválido não quebra o aplicativo: aparece "A investigação anterior não pôde ser restaurada." e o Laboratório volta à seleção.

## Troca de metal

**Selecionar outro metal** nunca substitui a investigação em silêncio. O modal informa que a investigação atual será encerrada e, se houver, que a montagem será removida, sem converter unidades para o novo metal.

## Limpar, resetar e encerrar

| Ação | Mantém | Remove |
|---|---|---|
| Limpar estrutura | investigação, metal, módulo | montagem |
| Resetar investigação | metal, identidade da investigação, módulo | montagem, elétrons, medidas, cálculos, observações |
| Encerrar investigação | preferências e textos de relatório | investigação, metal, montagem |

Ações destrutivas pedem confirmação. Acessibilidade, tema e preferências globais nunca são apagados.
