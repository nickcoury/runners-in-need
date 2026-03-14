CREATE INDEX IF NOT EXISTS idx_needs_status ON needs(status);
CREATE INDEX IF NOT EXISTS idx_needs_org_id ON needs(org_id);
CREATE INDEX IF NOT EXISTS idx_pledges_need_id ON pledges(need_id);
CREATE INDEX IF NOT EXISTS idx_pledges_donor_id ON pledges(donor_id);
CREATE INDEX IF NOT EXISTS idx_messages_pledge_id ON messages(pledge_id);
CREATE INDEX IF NOT EXISTS idx_organizer_requests_user_id ON organizer_requests(user_id);
