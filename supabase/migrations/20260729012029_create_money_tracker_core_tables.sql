/*
# Money Tracker - Core Tables

Membuat skema database untuk aplikasi pencatatan keuangan multi-user.
Setiap user memiliki data terpisah via user_id dan RLS policies.

Tables: accounts, categories, transactions, transfers, budgets, 
opening_balances, cicilan, savings_goals, recurring_transactions

Security: RLS enabled on all tables, owner-scoped (auth.uid() = user_id),
4 policies per table, user_id DEFAULT auth.uid().
*/

-- ============ ACCOUNTS ============
CREATE TABLE IF NOT EXISTS accounts (
  id text PRIMARY KEY,
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL,
  type text NOT NULL DEFAULT 'Tabungan',
  color_id text NOT NULL DEFAULT 'gold',
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE accounts ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_accounts" ON accounts;
CREATE POLICY "select_own_accounts" ON accounts FOR SELECT
  TO authenticated USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "insert_own_accounts" ON accounts;
CREATE POLICY "insert_own_accounts" ON accounts FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "update_own_accounts" ON accounts;
CREATE POLICY "update_own_accounts" ON accounts FOR UPDATE
  TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "delete_own_accounts" ON accounts;
CREATE POLICY "delete_own_accounts" ON accounts FOR DELETE
  TO authenticated USING (auth.uid() = user_id);

-- ============ CATEGORIES ============
CREATE TABLE IF NOT EXISTS categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  type text NOT NULL CHECK (type IN ('in','out')),
  name text NOT NULL,
  color text,
  is_default boolean NOT NULL DEFAULT false,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, type, name)
);

ALTER TABLE categories ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_categories" ON categories;
CREATE POLICY "select_own_categories" ON categories FOR SELECT
  TO authenticated USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "insert_own_categories" ON categories;
CREATE POLICY "insert_own_categories" ON categories FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "update_own_categories" ON categories;
CREATE POLICY "update_own_categories" ON categories FOR UPDATE
  TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "delete_own_categories" ON categories;
CREATE POLICY "delete_own_categories" ON categories FOR DELETE
  TO authenticated USING (auth.uid() = user_id);

-- ============ TRANSACTIONS ============
CREATE TABLE IF NOT EXISTS transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  type text NOT NULL CHECK (type IN ('in','out')),
  description text NOT NULL,
  amount numeric NOT NULL DEFAULT 0,
  account text NOT NULL,
  category text NOT NULL,
  date date NOT NULL,
  time time,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_transactions" ON transactions;
CREATE POLICY "select_own_transactions" ON transactions FOR SELECT
  TO authenticated USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "insert_own_transactions" ON transactions;
CREATE POLICY "insert_own_transactions" ON transactions FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "update_own_transactions" ON transactions;
CREATE POLICY "update_own_transactions" ON transactions FOR UPDATE
  TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "delete_own_transactions" ON transactions;
CREATE POLICY "delete_own_transactions" ON transactions FOR DELETE
  TO authenticated USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_transactions_user_date ON transactions(user_id, date DESC);
CREATE INDEX IF NOT EXISTS idx_transactions_user_account ON transactions(user_id, account);
CREATE INDEX IF NOT EXISTS idx_transactions_user_category ON transactions(user_id, category);

-- ============ TRANSFERS ============
CREATE TABLE IF NOT EXISTS transfers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  from_account text NOT NULL,
  to_account text NOT NULL,
  amount numeric NOT NULL DEFAULT 0,
  note text,
  date date NOT NULL,
  time time,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE transfers ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_transfers" ON transfers;
CREATE POLICY "select_own_transfers" ON transfers FOR SELECT
  TO authenticated USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "insert_own_transfers" ON transfers;
CREATE POLICY "insert_own_transfers" ON transfers FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "update_own_transfers" ON transfers;
CREATE POLICY "update_own_transfers" ON transfers FOR UPDATE
  TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "delete_own_transfers" ON transfers;
CREATE POLICY "delete_own_transfers" ON transfers FOR DELETE
  TO authenticated USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_transfers_user_date ON transfers(user_id, date DESC);

-- ============ BUDGETS ============
CREATE TABLE IF NOT EXISTS budgets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  category text NOT NULL,
  amount numeric NOT NULL DEFAULT 0,
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id, category)
);

ALTER TABLE budgets ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_budgets" ON budgets;
CREATE POLICY "select_own_budgets" ON budgets FOR SELECT
  TO authenticated USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "insert_own_budgets" ON budgets;
CREATE POLICY "insert_own_budgets" ON budgets FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "update_own_budgets" ON budgets;
CREATE POLICY "update_own_budgets" ON budgets FOR UPDATE
  TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "delete_own_budgets" ON budgets;
CREATE POLICY "delete_own_budgets" ON budgets FOR DELETE
  TO authenticated USING (auth.uid() = user_id);

-- ============ OPENING_BALANCES ============
CREATE TABLE IF NOT EXISTS opening_balances (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  account text NOT NULL,
  amount numeric NOT NULL DEFAULT 0,
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id, account)
);

ALTER TABLE opening_balances ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_opening_balances" ON opening_balances;
CREATE POLICY "select_own_opening_balances" ON opening_balances FOR SELECT
  TO authenticated USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "insert_own_opening_balances" ON opening_balances;
CREATE POLICY "insert_own_opening_balances" ON opening_balances FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "update_own_opening_balances" ON opening_balances;
CREATE POLICY "update_own_opening_balances" ON opening_balances FOR UPDATE
  TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "delete_own_opening_balances" ON opening_balances;
CREATE POLICY "delete_own_opening_balances" ON opening_balances FOR DELETE
  TO authenticated USING (auth.uid() = user_id);

-- ============ CICILAN ============
CREATE TABLE IF NOT EXISTS cicilan (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL,
  type text NOT NULL DEFAULT 'lainnya',
  total_debt numeric NOT NULL DEFAULT 0,
  monthly_payment numeric NOT NULL DEFAULT 0,
  due_day integer NOT NULL DEFAULT 15 CHECK (due_day >= 1 AND due_day <= 31),
  account_id text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE cicilan ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_cicilan" ON cicilan;
CREATE POLICY "select_own_cicilan" ON cicilan FOR SELECT
  TO authenticated USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "insert_own_cicilan" ON cicilan;
CREATE POLICY "insert_own_cicilan" ON cicilan FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "update_own_cicilan" ON cicilan;
CREATE POLICY "update_own_cicilan" ON cicilan FOR UPDATE
  TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "delete_own_cicilan" ON cicilan;
CREATE POLICY "delete_own_cicilan" ON cicilan FOR DELETE
  TO authenticated USING (auth.uid() = user_id);

-- ============ SAVINGS_GOALS ============
CREATE TABLE IF NOT EXISTS savings_goals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL,
  icon text DEFAULT '🎯',
  target_amount numeric NOT NULL DEFAULT 0,
  current_amount numeric NOT NULL DEFAULT 0,
  target_date date,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE savings_goals ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_savings_goals" ON savings_goals;
CREATE POLICY "select_own_savings_goals" ON savings_goals FOR SELECT
  TO authenticated USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "insert_own_savings_goals" ON savings_goals;
CREATE POLICY "insert_own_savings_goals" ON savings_goals FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "update_own_savings_goals" ON savings_goals;
CREATE POLICY "update_own_savings_goals" ON savings_goals FOR UPDATE
  TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "delete_own_savings_goals" ON savings_goals;
CREATE POLICY "delete_own_savings_goals" ON savings_goals FOR DELETE
  TO authenticated USING (auth.uid() = user_id);

-- ============ RECURRING_TRANSACTIONS ============
CREATE TABLE IF NOT EXISTS recurring_transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  type text NOT NULL CHECK (type IN ('in','out')),
  description text NOT NULL,
  amount numeric NOT NULL DEFAULT 0,
  account text NOT NULL,
  category text NOT NULL,
  frequency text NOT NULL DEFAULT 'monthly' CHECK (frequency IN ('weekly','monthly','yearly')),
  next_due date NOT NULL,
  active boolean NOT NULL DEFAULT true,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE recurring_transactions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_recurring" ON recurring_transactions;
CREATE POLICY "select_own_recurring" ON recurring_transactions FOR SELECT
  TO authenticated USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "insert_own_recurring" ON recurring_transactions;
CREATE POLICY "insert_own_recurring" ON recurring_transactions FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "update_own_recurring" ON recurring_transactions;
CREATE POLICY "update_own_recurring" ON recurring_transactions FOR UPDATE
  TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "delete_own_recurring" ON recurring_transactions;
CREATE POLICY "delete_own_recurring" ON recurring_transactions FOR DELETE
  TO authenticated USING (auth.uid() = user_id);
