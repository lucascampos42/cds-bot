-- Add missing values to Postgres enum "Role" to align with Prisma schema
-- Safe to run multiple times thanks to IF NOT EXISTS
DO $$
BEGIN
  BEGIN
    ALTER TYPE "Role" ADD VALUE IF NOT EXISTS 'CLIENT';
  EXCEPTION WHEN others THEN NULL;
  END;

  BEGIN
    ALTER TYPE "Role" ADD VALUE IF NOT EXISTS 'USER';
  EXCEPTION WHEN others THEN NULL;
  END;
END;
$$;