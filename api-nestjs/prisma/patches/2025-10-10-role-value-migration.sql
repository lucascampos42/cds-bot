-- Remapeia valores antigos do enum Role para os novos valores antes do db push
-- Execução segura: se não houver linhas com os valores antigos, nada será alterado

UPDATE "users" SET "role" = 'CLIENT' WHERE "role" = 'CLIENTE';
UPDATE "users" SET "role" = 'USER'   WHERE "role" = 'FUNCIONARIO';
UPDATE "users" SET "role" = 'ADMIN'  WHERE "role" = 'GERENTE';
UPDATE "users" SET "role" = 'ADMIN'  WHERE "role" = 'SUPERADMIN';

-- Opcional: registrar quantas linhas foram afetadas (apenas informativo)
-- SELECT 'CLIENTE->CLIENT' AS change, COUNT(*) FROM "users" WHERE "role" = 'CLIENT';
-- SELECT 'FUNCIONARIO->USER' AS change, COUNT(*) FROM "users" WHERE "role" = 'USER';
-- SELECT 'GERENTE->ADMIN' AS change, COUNT(*) FROM "users" WHERE "role" = 'ADMIN';
-- SELECT 'SUPERADMIN->ADMIN' AS change, COUNT(*) FROM "users" WHERE "role" = 'ADMIN';