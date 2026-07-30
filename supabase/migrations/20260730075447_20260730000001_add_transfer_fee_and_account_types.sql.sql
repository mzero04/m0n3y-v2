/*
# Transfer admin fee + dynamic account types

## 1. transfers table — new columns
- `admin_fee` (numeric, default 0): biaya admin antar bank yang dikenakan saat transfer.
  Nilai > 0 akan otomatis dibuatkan sebagai transaksi pengeluaran (kategori "Biaya Admin")
  dari akun asal, sehingga masuk ke laporan pengeluaran.
- `fee_tx_id` (uuid, nullable): ID transaksi pengeluaran yang dibuat untuk biaya admin.
  Digunakan saat menghapus transfer agar transaksi biaya admin ikut dihapus.

## 2. New table: account_types
- Menyimpan daftar tipe akun kustom per user (mis. "Bank", "E-Wallet", "Tunai").
- Kolom: id (uuid PK), user_id (uuid, default auth.uid()), name (text), sort_order (int).
- Unique(user_id, name) agar tidak ada tipe ganda.
- RLS enabled, owner-scoped CRUD (4 policies, TO authenticated).

## Security
- RLS pada account_types, owner-scoped via auth.uid() = user_id.
- Tidak ada perubahan RLS pada transfers (kolom baru tetap diatur policy existing).
*/

-- ============ transfers: add admin_fee + fee_tx_id ============
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns
    WHERE table_name = 'transfers' AND column_name = 'admin_fee') THEN
    ALTER TABLE transfers ADD COLUMN admin_fee numeric NOT NULL DEFAULT 0;
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns
    WHERE table_name = 'transfers' AND column_name = 'fee_tx_id') THEN
    ALTER TABLE transfers ADD COLUMN fee_tx_id uuid;
  END IF;
END $$;

-- ============ account_types ============
CREATE TABLE IF NOT EXISTS account_types (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, name)
);

ALTER TABLE account_types ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_account_types" ON account_types;
CREATE POLICY "select_own_account_types" ON account_types FOR SELECT
  TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "insert_own_account_types" ON account_types;
CREATE POLICY "insert_own_account_types" ON account_types FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "update_own_account_types" ON account_types;
CREATE POLICY "update_own_account_types" ON account_types FOR UPDATE
  TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "delete_own_account_types" ON account_types;
CREATE POLICY "delete_own_account_types" ON account_types FOR DELETE
  TO authenticated USING (auth.uid() = user_id);