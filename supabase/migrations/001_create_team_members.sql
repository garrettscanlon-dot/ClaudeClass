-- Team members table — maps Supabase Auth users to external system IDs
CREATE TABLE team_members (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'member' CHECK (role IN ('member', 'lead')),
  salesforce_user_id TEXT,
  linear_user_id TEXT,
  gong_user_id TEXT,
  slack_user_id TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS
ALTER TABLE team_members ENABLE ROW LEVEL SECURITY;

-- Members can read their own row; leads can read all
CREATE POLICY "Members read own row" ON team_members
  FOR SELECT USING (
    id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM team_members tm WHERE tm.id = auth.uid() AND tm.role = 'lead'
    )
  );

-- Only service role can insert/update (admin operations)
CREATE POLICY "Service role manages members" ON team_members
  FOR ALL USING (auth.role() = 'service_role');
