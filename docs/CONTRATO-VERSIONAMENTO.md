# Contrato de versionamento do SILM

> Reconstruído na 0.4.0 a partir do prompt mestre da 0.1.1 (seções 6 a 10) e das regras de parada dos prompts 0.3.0 e 0.4.x. O arquivo original não constava do pacote 0.3.0 recebido.

## 1. Responsabilidades

Cada série `0.x.x` tem uma responsabilidade própria, definida em [`ROADMAP-SILM.md`](ROADMAP-SILM.md). A primeira versão de uma série (`0.x.0`) implementa **integralmente** essa responsabilidade, sem fragmentação artificial.

As versões de correção (`0.x.1`, `0.x.2`, …) ficam reservadas a problemas revelados pela homologação da `0.x.0`: bugs, regressões, persistência, mobile, acessibilidade e assim por diante.

## 2. Regra de não invasão

Uma versão não introduz, de forma silenciosa, funcionalidades que pertencem a outra série. Exemplo: uma reconstrução do modelo eletrônico (0.6.x) não pode aparecer escondida numa versão de Roteiros (0.13.x).

## 3. Correções tardias

Quando um domínio já fechado precisa ser corrigido numa build posterior, o changelog registra a **responsabilidade de origem**:

```text
Correção de origem 0.3.x — retomada direta do Laboratório Livre
```

Isso preserva a rastreabilidade histórica.

## 4. Critério de fechamento e parada

Cada versão termina quando o seu critério de aceite é cumprido e o checklist do prompt está verificado. Depois de entregar, **parar**: a série seguinte só começa após a homologação da versão atual, e a origem executável da série seguinte é sempre a versão homologada (nunca uma build intermediária).

## 5. Hashes e congelamento

Ao concluir uma versão:

1. gerar o ZIP da distribuição;
2. calcular o SHA-512 do ZIP;
3. registrar o hash fora do ZIP, no manifesto externo de entrega (o ZIP não pode conter o próprio hash);
4. congelar a versão: o ZIP entregue não é modificado.

O `BUILD-INFO.json` de cada versão registra a origem executável e o SHA-512 dela. O `SHA512SUMS.txt` dentro do ZIP lista o hash de cada arquivo da distribuição.

## 6. Versão do produto e versão do schema

`VERSION`, `package.json`, `BUILD-INFO.json`, o manifesto do domínio e o cache do service worker carregam a versão do produto (por exemplo, `0.4.0`). O `schemaVersion` do estado científico é independente (por exemplo, `3`) e só muda quando o contrato do estado muda, sempre com migração documentada.

## 7. Hierarquia das fontes

Em caso de conflito:

- arquitetura e infraestrutura → Base Estrutural 0.2.4;
- gramática de operação → SIAB (família de programas);
- identidade do SILM → SILM 0.1.0;
- ciência e mecânicas metálicas → séries próprias do SILM.
