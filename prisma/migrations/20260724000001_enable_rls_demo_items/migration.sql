-- Prisma connects with a privileged role and bypasses RLS; this closes public
-- PostgREST/anon-key exposure of the demo table. No policies are defined yet —
-- add them if this table is ever queried through Supabase client libraries.
ALTER TABLE "demo_items" ENABLE ROW LEVEL SECURITY;
