-- AI-derived health scores per account per week
CREATE TABLE health_scores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id UUID REFERENCES sf_accounts(id) ON DELETE CASCADE,
  week_of DATE NOT NULL,
  score INTEGER NOT NULL CHECK (score BETWEEN 0 AND 100),
  status TEXT NOT NULL CHECK (status IN ('red', 'yellow', 'green')),
  previous_score INTEGER,
  delta INTEGER,
  signals JSONB NOT NULL,
  reasoning TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(account_id, week_of)
);

-- Weekly AI analysis per team member
CREATE TABLE weekly_analyses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  member_id UUID REFERENCES team_members(id) ON DELETE CASCADE,
  week_of DATE NOT NULL,
  top_risk_account_id UUID REFERENCES sf_accounts(id),
  top_risk_reasoning TEXT,
  priorities JSONB NOT NULL,
  slack_draft TEXT NOT NULL,
  summary_stats JSONB,
  portfolio_snapshot JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(member_id, week_of)
);

-- Team-level weekly rollup
CREATE TABLE team_rollups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  week_of DATE NOT NULL UNIQUE,
  top_risks JSONB NOT NULL,
  team_priorities JSONB NOT NULL,
  patterns JSONB,
  team_slack_draft TEXT NOT NULL,
  summary_stats JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Sync log for tracking API sync status
CREATE TABLE sync_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  source TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('started', 'completed', 'failed')),
  records_synced INTEGER DEFAULT 0,
  error_message TEXT,
  started_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ
);

-- RLS for analysis tables
ALTER TABLE health_scores ENABLE ROW LEVEL SECURITY;
ALTER TABLE weekly_analyses ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_rollups ENABLE ROW LEVEL SECURITY;
ALTER TABLE sync_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Members see own health scores" ON health_scores
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM sf_accounts
      WHERE sf_accounts.id = health_scores.account_id
      AND (sf_accounts.owner_id = auth.uid()
           OR EXISTS (SELECT 1 FROM team_members WHERE id = auth.uid() AND role = 'lead'))
    )
  );

CREATE POLICY "Service role manages health scores" ON health_scores
  FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Members see own analyses" ON weekly_analyses
  FOR SELECT USING (
    member_id = auth.uid()
    OR EXISTS (SELECT 1 FROM team_members WHERE id = auth.uid() AND role = 'lead')
  );

CREATE POLICY "Service role manages analyses" ON weekly_analyses
  FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Leads see team rollups" ON team_rollups
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM team_members WHERE id = auth.uid() AND role = 'lead')
  );

CREATE POLICY "Service role manages rollups" ON team_rollups
  FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Leads see sync logs" ON sync_logs
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM team_members WHERE id = auth.uid() AND role = 'lead')
  );

CREATE POLICY "Service role manages sync logs" ON sync_logs
  FOR ALL USING (auth.role() = 'service_role');
