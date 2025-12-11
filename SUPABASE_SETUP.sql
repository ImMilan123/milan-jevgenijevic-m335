-- ============================================
-- BudgetBuddy - Supabase Database Setup
-- ============================================
-- Run this SQL in your Supabase SQL Editor
-- to set up the database for BudgetBuddy

-- ============================================
-- 1. Create expenses table
-- ============================================

CREATE TABLE expenses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  amount NUMERIC NOT NULL CHECK (amount >= 0),
  category TEXT NOT NULL CHECK (category IN ('Food', 'Transport', 'Shopping', 'Entertainment', 'Health', 'Bills', 'Other')),
  date DATE NOT NULL,
  receipt_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  user_id UUID
);

-- ============================================
-- 2. Create indexes for better performance
-- ============================================

CREATE INDEX idx_expenses_date ON expenses(date DESC);
CREATE INDEX idx_expenses_category ON expenses(category);
CREATE INDEX idx_expenses_created_at ON expenses(created_at DESC);

-- ============================================
-- 3. Create updated_at trigger
-- ============================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_expenses_updated_at
  BEFORE UPDATE ON expenses
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- 4. Enable Row Level Security (RLS)
-- ============================================

ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;

-- ============================================
-- 5. Create RLS Policies
-- ============================================

-- Policy for development: Allow all operations
-- ⚠️ WARNING: This allows anyone to read/write data
-- For production, implement proper authentication

CREATE POLICY "Enable all operations for development" ON expenses
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- ============================================
-- Alternative: Production RLS Policies
-- ============================================
-- Uncomment these for production with Supabase Auth
-- First, remove the development policy above

/*
-- Policy: Users can view their own expenses
CREATE POLICY "Users can view own expenses" ON expenses
  FOR SELECT
  USING (auth.uid() = user_id);

-- Policy: Users can create their own expenses
CREATE POLICY "Users can create own expenses" ON expenses
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Policy: Users can update their own expenses
CREATE POLICY "Users can update own expenses" ON expenses
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Policy: Users can delete their own expenses
CREATE POLICY "Users can delete own expenses" ON expenses
  FOR DELETE
  USING (auth.uid() = user_id);
*/

-- ============================================
-- 6. Insert sample data (optional for testing)
-- ============================================

INSERT INTO expenses (title, amount, category, date) VALUES
  ('Grocery Shopping', 85.50, 'Food', '2024-12-01'),
  ('Uber Ride', 22.00, 'Transport', '2024-12-02'),
  ('Coffee', 4.50, 'Food', '2024-12-03'),
  ('Movie Tickets', 35.00, 'Entertainment', '2024-12-04'),
  ('Pharmacy', 18.90, 'Health', '2024-12-05'),
  ('Electricity Bill', 120.00, 'Bills', '2024-12-06'),
  ('Clothing Store', 95.00, 'Shopping', '2024-12-07'),
  ('Restaurant Dinner', 67.50, 'Food', '2024-12-08');

-- ============================================
-- 7. Create storage bucket for receipts
-- ============================================

-- Note: Storage buckets must be created via Supabase UI
-- Go to Storage > New bucket > Name: "receipts" > Make public: YES

-- ============================================
-- 8. Verify setup
-- ============================================

-- Check if table was created successfully
SELECT * FROM expenses LIMIT 5;

-- Check table structure
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'expenses'
ORDER BY ordinal_position;

-- ============================================
-- Useful Queries for Development
-- ============================================

-- Get all expenses ordered by date
-- SELECT * FROM expenses ORDER BY date DESC;

-- Get expenses by category
-- SELECT category, COUNT(*), SUM(amount) FROM expenses GROUP BY category;

-- Get monthly totals
-- SELECT 
--   DATE_TRUNC('month', date) as month,
--   COUNT(*) as transaction_count,
--   SUM(amount) as total_amount
-- FROM expenses
-- GROUP BY month
-- ORDER BY month DESC;

-- Delete all expenses (careful!)
-- DELETE FROM expenses;

-- ============================================
-- End of Setup Script
-- ============================================

