# PRD — Monday Morning Playbook

## Overview
**Monday Morning Playbook** is a weekly digest and prioritization tool that gives Partner Success Consultants a single, ready-to-act briefing every Monday morning — consolidating account health, activity signals, open tasks, and recommended actions across their entire portfolio.

---

## Problem Statement
PSCs lose 45–60 minutes every Monday manually aggregating data before they can prioritize their week. This creates delayed responses to at-risk accounts, missed expansion opportunities, and reactive rather than proactive partner management.

---

## Goals & Success Metrics

| Goal | Metric | Target |
|------|--------|--------|
| Reduce Monday ramp time | Time from login to first action | < 10 minutes |
| Improve at-risk detection | At-risk accounts flagged before churn | 80% catch rate |
| Drive expansion pipeline | Expansion opps surfaced per week | +20% vs. baseline |
| User adoption | Weekly active usage | 80% of licensed seats |

---

## User Stories & Features

### P0 — Must Have

**1. Weekly Account Digest**
- Auto-generated every Monday at 7:00 AM (user's timezone)
- Surfaces top 5–10 accounts requiring action, ranked by urgency
- Delivered via in-app and Slack

**2. Account Health Snapshot**
- Aggregates signals from Looker (product usage, W/W performance), Salesforce (open opps, churn flags, contract dates), Linear (open implementation cases), and Gong (last contact, call sentiment)
- Standardized health score (Red / Yellow / Green) per account — consistent definitions across the team, replacing ad hoc vibes-based assessment
- Delta from last week (trending up/down)

**3. Priority Queue**
- Smart-ranked action list: renewals due, QBRs needed, at-risk flags, expansion signals
- One-click access to account detail and CRM record
- Mark items as "done" or "snooze"

**4. Integrations (Core)**
- Analytics: Looker
- CRM: Salesforce
- Project management: Linear
- Conversation intelligence: Gong
- Communication: Slack

### P1 — Should Have

**5. Recommended Actions**
- AI-generated suggested next steps per account ("Schedule EBR," "Flag for churn risk," "Share new feature with Champion")
- Reasoning shown: "Usage down 40% this month"

**6. Portfolio Summary**
- MRR at risk, MRR up for renewal (30/60/90 days), open expansion pipeline
- Week-over-week comparison

**7. Slack Digest Draft**
- Auto-drafts the weekly `#psc-team` post: 1 key finding + 3 priorities
- PSC reviews, edits, and posts — no blank page, no manual assembly

**8. Meeting Prep Mode**
- Pull up a specific account before a call: recent Gong calls, open Linear tickets, Salesforce activity, key contacts

### P2 — Nice to Have
- Mobile app with push notifications
- Manager view: team portfolio rollup
- Custom alert thresholds per account tier

---

## Out of Scope (v1)
- Full CRM replacement
- Billing or contract management
- Outreach/sequencing automation

---

## Technical Requirements
- OAuth-based integrations (no data stored beyond signals)
- Digest generated via scheduled job (Mon 7 AM local time)
- SOC 2 Type II compliant data handling
- SSO support (Okta, Google)

---

## Decisions Log

| # | Question | Decision |
|---|----------|----------|
| 1 | Digest format | Structured card format (not AI narrative) |
| 2 | Health score weighting | Standardized definitions across the team — not custom per account tier. Replaces current vibes-based assessment with consistent, signal-driven criteria |
| 3 | Broken integration handling | Proceed with partial data; surface a visible warning in the digest output identifying which integration is unavailable |

---

## Open Questions
*None — all questions resolved.*
