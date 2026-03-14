ALTER TABLE organizations ADD COLUMN delivery_methods TEXT;
ALTER TABLE organizations ADD COLUMN delivery_instructions TEXT;
ALTER TABLE needs ADD COLUMN delivery_methods TEXT;
ALTER TABLE needs ADD COLUMN delivery_instructions TEXT;
