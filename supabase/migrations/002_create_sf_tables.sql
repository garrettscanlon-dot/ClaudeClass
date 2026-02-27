-- Salesforce accounts
CREATE TABLE sf_accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  salesforce_id TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  owner_id UUID REFERENCES team_members(id),
  salesforce_owner_id TEXT NOT NULL,
  account_type TEXT,
  mrr NUMERIC(12,2),
  arr NUMERIC(12,2),
  industry TEXT,
  last_activity_date DATE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  synced_at TIMESTAMPTZ DEFAULT NOW()
);

-- Salesforce opportunities (renewals, expansion)
CREATE TABLE sf_opportunities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  salesforce_id TEXT UNIQUE NOT NULL,
  account_id UUID REFERENCES sf_accounts(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  stage TEXT NOT NULL,
  amount NUMERIC(12,2),
  close_date DATE,
  opp_type TEXT,
  probability INTEGER,
  next_step TEXT,
  synced_at TIMESTAMPTZ DEFAULT NOW()
);

-- Salesforce activities/tasks
CREATE TABLE sf_activities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  salesforce_id TEXT UNIQUE NOT NULL,
  account_id UUID REFERENCES sf_accounts(id) ON DELETE CASCADE,
  owner_id UUID REFERENCES team_members(id),
  subject TEXT,
  status TEXT,
  priority TEXT,
  activity_date DATE,
  description TEXT,
  activity_type TEXT,
  synced_at TIMESTAMPTZ DEFAULT NOW()
);

-- Salesforce contacts
CREATE TABLE sf_contacts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  salesforce_id TEXT UNIQUE NOT NULL,
  account_id UUID REFERENCES sf_accounts(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  email TEXT,
  title TEXT,
  is_champion BOOLEAN DEFAULT FALSE,
  last_contacted DATE,
  synced_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS for all SF tables
ALTER TABLE sf_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE sf_opportunities ENABLE ROW LEVEL SECURITY;
ALTER TABLE sf_activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE sf_contacts ENABLE ROW LEVEL SECURITY;

-- Accounts: members see own, leads see all
CREATE POLICY "Members see own accounts" ON sf_accounts
  FOR SELECT USING (
    owner_id = auth.uid()
    OR EXISTS (SELECT 1 FROM team_members WHERE id = auth.uid() AND role = 'lead')
  );

CREATE POLICY "Service role manages accounts" ON sf_accounts
  FOR ALL USING (auth.role() = 'service_role');

-- Opportunities: via account ownership
CREATE POLICY "Members see own opps" ON sf_opportunities
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM sf_accounts
      WHERE sf_accounts.id = sf_opportunities.account_id
      AND (sf_accounts.owner_id = auth.uid()
           OR EXISTS (SELECT 1 FROM team_members WHERE id = auth.uid() AND role = 'lead'))
    )
  );

CREATE POLICY "Service role manages opps" ON sf_opportunities
  FOR ALL USING (auth.role() = 'service_role');

-- Activities: via account ownership
CREATE POLICY "Members see own activities" ON sf_activities
  FOR SELECT USING (
    owner_id = auth.uid()
    OR EXISTS (SELECT 1 FROM team_members WHERE id = auth.uid() AND role = 'lead')
  );

CREATE POLICY "Service role manages activities" ON sf_activities
  FOR ALL USING (auth.role() = 'service_role');

-- Contacts: via account ownership
CREATE POLICY "Members see own contacts" ON sf_contacts
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM sf_accounts
      WHERE sf_accounts.id = sf_contacts.account_id
      AND (sf_accounts.owner_id = auth.uid()
           OR EXISTS (SELECT 1 FROM team_members WHERE id = auth.uid() AND role = 'lead'))
    )
  );

CREATE POLICY "Service role manages contacts" ON sf_contacts
  FOR ALL USING (auth.role() = 'service_role');
