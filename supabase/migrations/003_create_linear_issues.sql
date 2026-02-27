-- Linear issues
CREATE TABLE linear_issues (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  linear_id TEXT UNIQUE NOT NULL,
  identifier TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  status TEXT NOT NULL,
  status_type TEXT NOT NULL,
  priority INTEGER,
  priority_label TEXT,
  assignee_id UUID REFERENCES team_members(id),
  account_id UUID REFERENCES sf_accounts(id),
  project_name TEXT,
  labels TEXT[],
  due_date DATE,
  created_at TIMESTAMPTZ NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL,
  synced_at TIMESTAMPTZ DEFAULT NOW()
);

-- Manual overrides for Linear issue → account mapping
CREATE TABLE ticket_account_mappings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  linear_issue_id TEXT NOT NULL,
  account_id UUID REFERENCES sf_accounts(id) ON DELETE CASCADE,
  mapped_by UUID REFERENCES team_members(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS
ALTER TABLE linear_issues ENABLE ROW LEVEL SECURITY;
ALTER TABLE ticket_account_mappings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Members see own issues" ON linear_issues
  FOR SELECT USING (
    assignee_id = auth.uid()
    OR EXISTS (SELECT 1 FROM team_members WHERE id = auth.uid() AND role = 'lead')
  );

CREATE POLICY "Service role manages issues" ON linear_issues
  FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Members manage own mappings" ON ticket_account_mappings
  FOR ALL USING (
    mapped_by = auth.uid()
    OR EXISTS (SELECT 1 FROM team_members WHERE id = auth.uid() AND role = 'lead')
  );

CREATE POLICY "Service role manages mappings" ON ticket_account_mappings
  FOR ALL USING (auth.role() = 'service_role');
