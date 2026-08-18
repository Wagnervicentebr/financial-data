-- Prisma connects with a privileged role and bypasses RLS; this closes public
-- PostgREST/anon-key exposure of the new auth tables. No policies are defined
-- yet — add them if these tables are ever queried through Supabase client
-- libraries. verification_tokens is included alongside the 4 tables the task
-- names explicitly, since it is also a new table exposed via the anon key and
-- deserves the same protection as users/accounts/sessions/password_reset_tokens.
ALTER TABLE "users" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "accounts" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "sessions" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "verification_tokens" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "password_reset_tokens" ENABLE ROW LEVEL SECURITY;
