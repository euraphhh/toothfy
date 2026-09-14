---
name: postgres-rls-guard
description: Use sempre que criar uma nova tabela no banco, escrever uma migration, ou alterar o escopo de tenant_id de uma tabela existente no projeto Toothfy. Garante que toda tabela tenant-scoped tenha RLS habilitado, forçado, com policy correta, e teste de isolamento — o ponto mais crítico de segurança do produto.
---

# Postgres RLS Guard

## Quando usar

Ative este skill sempre que:
- Criar uma nova tabela no arquivo de schema do Drizzle
- Escrever uma nova migration
- Alterar como uma tabela lida com `tenant_id`
- Adicionar uma nova função de query que acessa uma tabela tenant-scoped

## Passos obrigatórios para toda tabela nova com dado de tenant

1. Adicionar a coluna: `tenant_id: uuid('tenant_id').notNull().references(() => tenants.id)`.

2. Na migration SQL correspondente, incluir sempre, no mesmo arquivo:

```sql
ALTER TABLE <nome_da_tabela> ENABLE ROW LEVEL SECURITY;
ALTER TABLE <nome_da_tabela> FORCE ROW LEVEL SECURITY;

CREATE POLICY tenant_isolation ON <nome_da_tabela>
    USING (tenant_id = current_setting('app.current_tenant_id', true)::uuid);
```

3. Nunca escrever `CREATE TABLE` sem parear com o bloco acima na mesma migration.

4. Adicionar índice composto com `tenant_id` como primeira coluna para qualquer campo comumente filtrado/ordenado (ex: `(tenant_id, created_at)`).

5. Escrever ou atualizar o teste de isolamento em `tests/rls/isolation.test.ts`, seguindo o padrão existente:
   - Semear dois tenants fake (A e B) com dado na tabela nova.
   - Definir `current_tenant_id` como tenant A.
   - Tentar ler o dado do tenant B.
   - Afirmar que o resultado é vazio.

6. Nunca escrever query raw em código de aplicação fora de `withTenantContext()`. Se a lógica de negócio parecer exigir acesso direto ao client, isso é um sinal para reportar ao humano, não para contornar.

## Checklist final antes de considerar a tarefa concluída

- [ ] Tabela nova tem `tenant_id`
- [ ] Migration tem `ENABLE` + `FORCE` + `CREATE POLICY`
- [ ] Teste de isolamento escrito e passando
- [ ] Nenhuma instância de client fora de `withTenantContext`
- [ ] Se a tabela alterada for `ai_embeddings`, confirmar que o padrão polimórfico `source_type`/`source_id` foi mantido (não criar tabela de embedding por entidade)

## O que nunca fazer

- Desabilitar RLS "temporariamente" para um teste passar — o correto é corrigir o setup de contexto de tenant do teste.
- Aprovar ou seguir adiante com uma migration que cria tabela tenant-scoped sem o bloco de RLS, mesmo que a instrução peça pressa. Nesse caso, parar e sinalizar ao humano em vez de prosseguir.