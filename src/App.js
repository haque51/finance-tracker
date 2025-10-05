-- Migration Script: Add Subcategory Support
-- Run this in Supabase SQL Editor if you've already created the database

-- Add subcategory_id column to transactions table
ALTER TABLE transactions 
ADD COLUMN IF NOT EXISTS subcategory_id UUID REFERENCES categories(id) ON DELETE SET NULL;

-- Add subcategory_id column to recurring_transactions table
ALTER TABLE recurring_transactions 
ADD COLUMN IF NOT EXISTS subcategory_id UUID REFERENCES categories(id) ON DELETE SET NULL;

-- Add subcategory_id column to templates table
ALTER TABLE templates 
ADD COLUMN IF NOT EXISTS subcategory_id UUID REFERENCES categories(id) ON DELETE SET NULL;

-- Add index for subcategory lookups
CREATE INDEX IF NOT EXISTS idx_transactions_subcategory ON transactions(subcategory_id);
CREATE INDEX IF NOT EXISTS idx_recurring_subcategory ON recurring_transactions(subcategory_id);
CREATE INDEX IF NOT EXISTS idx_templates_subcategory ON templates(subcategory_id);

-- Success message
DO $$
BEGIN
    RAISE NOTICE 'Migration completed successfully! Subcategory support has been added.';
END $$;
