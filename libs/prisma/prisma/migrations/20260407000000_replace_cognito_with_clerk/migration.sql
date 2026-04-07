-- Migration already applied manually (cognitoSub -> clerkUserId)
-- Kept as no-op for shadow database compatibility
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='users' AND column_name='cognitoSub') THEN
    ALTER TABLE "users" RENAME COLUMN "cognitoSub" TO "clerkUserId";
    ALTER INDEX IF EXISTS "users_cognitoSub_key" RENAME TO "users_clerkUserId_key";
    ALTER INDEX IF EXISTS "users_cognitoSub_idx" RENAME TO "users_clerkUserId_idx";
  END IF;
END $$;
