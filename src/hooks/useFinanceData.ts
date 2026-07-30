import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import type {
  Account, Category, Transaction, Transfer, Budget,
  OpeningBalance, Cicilan, SavingsGoal, RecurringTransaction, AccountType,
} from '@/lib/types';
import { DEFAULT_CATEGORIES_IN, DEFAULT_CATEGORIES_OUT, DEFAULT_ACCOUNTS } from '@/lib/constants';
import { generateId } from '@/lib/format';

export interface FinanceData {
  accounts: Account[];
  categories: Category[];
  transactions: Transaction[];
  transfers: Transfer[];
  budgets: Budget[];
  openingBalances: OpeningBalance[];
  cicilan: Cicilan[];
  savingsGoals: SavingsGoal[];
  recurring: RecurringTransaction[];
  accountTypes: AccountType[];
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

export function useFinanceData(userId: string | null): FinanceData {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [transfers, setTransfers] = useState<Transfer[]>([]);
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [openingBalances, setOpeningBalances] = useState<OpeningBalance[]>([]);
  const [cicilan, setCicilan] = useState<Cicilan[]>([]);
  const [savingsGoals, setSavingsGoals] = useState<SavingsGoal[]>([]);
  const [recurring, setRecurring] = useState<RecurringTransaction[]>([]);
  const [accountTypes, setAccountTypes] = useState<AccountType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAll = useCallback(async () => {
    if (!userId) {
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const [acc, cat, tx, tr, bud, ob, cic, sg, rec, at] = await Promise.all([
        supabase.from('accounts').select('*').order('sort_order'),
        supabase.from('categories').select('*').order('sort_order'),
        supabase.from('transactions').select('*').order('date', { ascending: false }),
        supabase.from('transfers').select('*').order('date', { ascending: false }),
        supabase.from('budgets').select('*'),
        supabase.from('opening_balances').select('*'),
        supabase.from('cicilan').select('*').order('created_at'),
        supabase.from('savings_goals').select('*').order('created_at'),
        supabase.from('recurring_transactions').select('*').order('next_due'),
        supabase.from('account_types').select('*').order('sort_order'),
      ]);

      if (acc.error) throw acc.error;
      if (cat.error) throw cat.error;
      if (tx.error) throw tx.error;
      if (tr.error) throw tr.error;
      if (bud.error) throw bud.error;
      if (ob.error) throw ob.error;
      if (cic.error) throw cic.error;
      if (sg.error) throw sg.error;
      if (rec.error) throw rec.error;
      if (at.error) throw at.error;

      if ((acc.data ?? []).length === 0) {
        await seedDefaultAccounts(userId);
        const { data: seededAcc } = await supabase.from('accounts').select('*').order('sort_order');
        setAccounts((seededAcc ?? []) as Account[]);
      } else {
        setAccounts((acc.data ?? []) as Account[]);
      }

      if ((cat.data ?? []).length === 0) {
        await seedDefaultCategories(userId);
        const { data: seededCat } = await supabase.from('categories').select('*').order('sort_order');
        setCategories((seededCat ?? []) as Category[]);
      } else {
        setCategories((cat.data ?? []) as Category[]);
      }
      setTransactions((tx.data ?? []) as Transaction[]);
      setTransfers((tr.data ?? []) as Transfer[]);
      setBudgets((bud.data ?? []) as Budget[]);
      setOpeningBalances((ob.data ?? []) as OpeningBalance[]);
      setCicilan((cic.data ?? []) as Cicilan[]);
      setSavingsGoals((sg.data ?? []) as SavingsGoal[]);
      setRecurring((rec.data ?? []) as RecurringTransaction[]);
      setAccountTypes((at.data ?? []) as AccountType[]);

      if ((at.data ?? []).length === 0) {
        await seedDefaultAccountTypes(userId);
        const { data: seededAt } = await supabase.from('account_types').select('*').order('sort_order');
        setAccountTypes((seededAt ?? []) as AccountType[]);
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Gagal memuat data');
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  const refetch = useCallback(() => { fetchAll(); }, [fetchAll]);

  return {
    accounts, categories, transactions, transfers, budgets,
    openingBalances, cicilan, savingsGoals, recurring, accountTypes,
    loading, error, refetch,
  };
}

async function seedDefaultAccountTypes(userId: string) {
  const names = ['Bank', 'E-Wallet', 'Tunai', 'Kartu Kredit', 'Investasi', 'Lainnya'];
  const rows = names.map((name, i) => ({ user_id: userId, name, sort_order: i }));
  await supabase.from('account_types').insert(rows);
}

async function seedDefaultAccounts(userId: string) {
  const rows = DEFAULT_ACCOUNTS.map((a) => ({
    id: a.id, user_id: userId, name: a.name, type: a.type,
    color_id: a.color_id, sort_order: a.sort_order,
  }));
  await supabase.from('accounts').insert(rows);
}

async function seedDefaultCategories(userId: string) {
  const rows = [
    ...DEFAULT_CATEGORIES_IN.map((name, i) => ({ user_id: userId, type: 'in' as const, name, color: '#34D8A6', is_default: true, sort_order: i })),
    ...DEFAULT_CATEGORIES_OUT.map((name, i) => ({ user_id: userId, type: 'out' as const, name, color: '#FF6B6B', is_default: true, sort_order: i })),
  ];
  await supabase.from('categories').insert(rows);
}

// ─── Account helpers ─────────────────────────────────
export async function insertAccount(userId: string, acc: Omit<Account, 'id'> & { id?: string }) {
  const row = { ...acc, user_id: userId, id: acc.id ?? generateId() };
  const { data, error } = await supabase.from('accounts').insert(row).select().single();
  return { data, error };
}

export async function updateAccount(id: string, updates: Partial<Account>) {
  const { data, error } = await supabase.from('accounts').update({ ...updates, updated_at: new Date().toISOString() }).eq('id', id).select().single();
  return { data, error };
}

export async function deleteAccount(id: string) {
  const { error } = await supabase.from('accounts').delete().eq('id', id);
  return { error };
}

// ─── Transaction helpers ─────────────────────────────
export async function insertTransaction(userId: string, tx: Omit<Transaction, 'id'>) {
  const { data, error } = await supabase.from('transactions').insert({ ...tx, user_id: userId }).select().single();
  return { data, error };
}

export async function updateTransaction(id: string, updates: Partial<Transaction>) {
  const { data, error } = await supabase.from('transactions').update(updates).eq('id', id).select().single();
  return { data, error };
}


export async function deleteTransaction(id: string) {
  const { error } = await supabase.from('transactions').delete().eq('id', id);
  return { error };
}

// ─── Transfer helpers ────────────────────────────────
export async function insertTransferWithFee(
  userId: string,
  tr: { from_account: string; to_account: string; amount: number; admin_fee: number; note: string | null; date: string; time: string | null },
) {
  let feeTxId: string | null = null;
  if (tr.admin_fee > 0) {
    const { data: feeTx, error: feeErr } = await supabase.from('transactions').insert({
      user_id: userId,
      type: 'out',
      description: `Biaya Admin Transfer: ${tr.from_account} → ${tr.to_account}`,
      amount: tr.admin_fee,
      account: tr.from_account,
      category: 'Biaya Admin',
      date: tr.date,
      time: tr.time,
    }).select().single();
    if (feeErr) return { data: null, error: feeErr };
    feeTxId = (feeTx as Transaction).id;
  }
  const { data, error } = await supabase.from('transfers').insert({
    user_id: userId,
    from_account: tr.from_account,
    to_account: tr.to_account,
    amount: tr.amount,
    admin_fee: tr.admin_fee,
    fee_tx_id: feeTxId,
    note: tr.note,
    date: tr.date,
    time: tr.time,
  }).select().single();
  if (error && feeTxId) {
    await supabase.from('transactions').delete().eq('id', feeTxId);
  }
  return { data, error };
}

export async function deleteTransferWithFee(transfer: Transfer) {
  if (transfer.fee_tx_id) {
    await supabase.from('transactions').delete().eq('id', transfer.fee_tx_id);
  }
  const { error } = await supabase.from('transfers').delete().eq('id', transfer.id);
  return { error };
}

export async function insertTransfer(userId: string, tr: Omit<Transfer, 'id'>) {
  const { data, error } = await supabase.from('transfers').insert({ ...tr, user_id: userId }).select().single();
  return { data, error };
}

export async function deleteTransfer(id: string) {
  const { error } = await supabase.from('transfers').delete().eq('id', id);
  return { error };
}

// ─── Budget helpers ──────────────────────────────────
export async function upsertBudget(userId: string, category: string, amount: number) {
  const { data, error } = await supabase
    .from('budgets')
    .upsert({ user_id: userId, category, amount, updated_at: new Date().toISOString() }, { onConflict: 'user_id,category' })
    .select().single();
  return { data, error };
}

export async function deleteBudget(id: string) {
  const { error } = await supabase.from('budgets').delete().eq('id', id);
  return { error };
}

// ─── Opening balance helpers ─────────────────────────
export async function upsertOpeningBalance(userId: string, account: string, amount: number) {
  const { data, error } = await supabase
    .from('opening_balances')
    .upsert({ user_id: userId, account, amount, updated_at: new Date().toISOString() }, { onConflict: 'user_id,account' })
    .select().single();
  return { data, error };
}

// ─── Cicilan helpers ─────────────────────────────────
export async function insertCicilan(userId: string, c: Omit<Cicilan, 'id'>) {
  const { data, error } = await supabase.from('cicilan').insert({ ...c, user_id: userId }).select().single();
  return { data, error };
}

export async function updateCicilan(id: string, updates: Partial<Cicilan>) {
  const { data, error } = await supabase.from('cicilan').update(updates).eq('id', id).select().single();
  return { data, error };
}

export async function deleteCicilan(id: string) {
  const { error } = await supabase.from('cicilan').delete().eq('id', id);
  return { error };
}

// ─── Savings goal helpers ────────────────────────────
export async function insertSavingsGoal(userId: string, g: Omit<SavingsGoal, 'id'>) {
  const { data, error } = await supabase.from('savings_goals').insert({ ...g, user_id: userId }).select().single();
  return { data, error };
}

export async function updateSavingsGoal(id: string, updates: Partial<SavingsGoal>) {
  const { data, error } = await supabase.from('savings_goals').update(updates).eq('id', id).select().single();
  return { data, error };
}

export async function deleteSavingsGoal(id: string) {
  const { error } = await supabase.from('savings_goals').delete().eq('id', id);
  return { error };
}

// ─── Recurring helpers ───────────────────────────────
export async function insertRecurring(userId: string, r: Omit<RecurringTransaction, 'id'>) {
  const { data, error } = await supabase.from('recurring_transactions').insert({ ...r, user_id: userId }).select().single();
  return { data, error };
}

export async function updateRecurring(id: string, updates: Partial<RecurringTransaction>) {
  const { data, error } = await supabase.from('recurring_transactions').update(updates).eq('id', id).select().single();
  return { data, error };
}

export async function deleteRecurring(id: string) {
  const { error } = await supabase.from('recurring_transactions').delete().eq('id', id);
  return { error };
}

// ─── Category helpers ────────────────────────────────
export async function insertCategory(userId: string, cat: { type: 'in' | 'out'; name: string }) {
  const { data, error } = await supabase.from('categories').insert({ ...cat, user_id: userId, is_default: false }).select().single();
  return { data, error };
}

export async function deleteCategory(id: string) {
  const { error } = await supabase.from('categories').delete().eq('id', id);
  return { error };
}

export async function updateCategorySort(id: string, sortOrder: number) {
  const { error } = await supabase.from('categories').update({ sort_order: sortOrder }).eq('id', id);
  return { error };
}

// ─── Account type helpers ───────────────────────────
export async function insertAccountType(userId: string, name: string) {
  const { data, error } = await supabase.from('account_types').insert({ user_id: userId, name }).select().single();
  return { data, error };
}

export async function deleteAccountType(id: string) {
  const { error } = await supabase.from('account_types').delete().eq('id', id);
  return { error };
}
