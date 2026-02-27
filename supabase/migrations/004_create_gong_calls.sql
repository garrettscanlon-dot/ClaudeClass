-- Gong calls
CREATE TABLE gong_calls (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  gong_id TEXT UNIQUE NOT NULL,
  title TEXT,
  started_at TIMESTAMPTZ NOT NULL,
  duration_seconds INTEGER,
  owner_id UUID REFERENCES team_members(id),
  account_id UUID REFERENCES sf_accounts(id),
  participants JSONB,
  direction TEXT,
  transcript_summary TEXT,
  synced_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS
ALTER TABLE gong_calls ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Members see own calls" ON gong_calls
  FOR SELECT USING (
    owner_id = auth.uid()
    OR EXISTS (SELECT 1 FROM team_members WHERE id = auth.uid() AND role = 'lead')
  );

CREATE POLICY "Service role manages calls" ON gong_calls
  FOR ALL USING (auth.role() = 'service_role');
