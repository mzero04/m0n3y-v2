import type { Transaction, Transfer, Account, OpeningBalance, Budget, Cicilan, SavingsGoal, RecurringTransaction } from '@/lib/types';
import { monthKey } from '@/lib/format';

export function getAccountBalance(
  accountName: string,
  transactions: Transaction[],
  transfers: Transfer[],
  openingBalances: OpeningBalance[],
): number {
  const opening = openingBalances.find((o) => o.account === accountName)?.amount ?? 0;
  const txSum = transactions
    .filter((t) => t.account === accountName)
    .reduce((sum, t) => sum + (t.type === 'in' ? t.amount : -t.amount), 0);
  const trOut = transfers
    .filter((t) => t.from_account === accountName)
    .reduce((sum, t) => sum - t.amount, 0);
  const trIn = transfers
    .filter((t) => t.to_account === accountName)
    .reduce((sum, t) => sum + t.amount, 0);
  return opening + txSum + trOut + trIn;
}

export function getTotalBalance(
  accounts: Account[],
  transactions: Transaction[],
  transfers: Transfer[],
  openingBalances: OpeningBalance[],
): number {
  return accounts.reduce(
    (sum, acc) => sum + getAccountBalance(acc.name, transactions, transfers, openingBalances),
    0,
  );
}

export function getMonthlyStats(transactions: Transaction[], date: Date) {
  const key = monthKey(date);
  const monthTx = transactions.filter((t) => monthKey(new Date(t.date)) === key);
  const income = monthTx.filter((t) => t.type === 'in').reduce((s, t) => s + t.amount, 0);
  const expense = monthTx.filter((t) => t.type === 'out').reduce((s, t) => s + t.amount, 0);
  return { income, expense, net: income - expense, count: monthTx.length };
}

export function getMonthlyByCategory(transactions: Transaction[], date: Date, type: 'in' | 'out') {
  const key = monthKey(date);
  const monthTx = transactions.filter(
    (t) => t.type === type && monthKey(new Date(t.date)) === key,
  );
  const map = new Map<string, number>();
  for (const t of monthTx) {
    map.set(t.category, (map.get(t.category) ?? 0) + t.amount);
  }
  return Array.from(map.entries())
    .map(([category, amount]) => ({ category, amount }))
    .sort((a, b) => b.amount - a.amount);
}

export function getBudgetProgress(budgets: Budget[], transactions: Transaction[], date: Date) {
  const key = monthKey(date);
  const monthExpense = transactions.filter(
    (t) => t.type === 'out' && monthKey(new Date(t.date)) === key,
  );
  return budgets.map((b) => {
    const spent = monthExpense
      .filter((t) => t.category === b.category)
      .reduce((s, t) => s + t.amount, 0);
    const pct = b.amount > 0 ? (spent / b.amount) * 100 : 0;
    return { ...b, spent, pct, remaining: b.amount - spent, over: spent > b.amount };
  });
}

export function getTrendData(transactions: Transaction[], months = 12) {
  const now = new Date();
  const result: { label: string; income: number; expense: number; net: number }[] = [];
  for (let i = months - 1; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const stats = getMonthlyStats(transactions, d);
    const label = d.toLocaleDateString('id-ID', { month: 'short' });
    result.push({ label, income: stats.income, expense: stats.expense, net: stats.net });
  }
  return result;
}

export function getCicilanDueStatus(cic: Cicilan, date: Date): 'normal' | 'soon' | 'overdue' {
  const today = date.getDate();
  if (today > cic.due_day) return 'overdue';
  if (cic.due_day - today <= 3) return 'soon';
  return 'normal';
}

export function getRecurringDueStatus(r: RecurringTransaction): 'normal' | 'soon' | 'overdue' {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const due = new Date(r.next_due);
  due.setHours(0, 0, 0, 0);
  const diff = Math.ceil((due.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
  if (diff < 0) return 'overdue';
  if (diff <= 3) return 'soon';
  return 'normal';
}

export function getGoalsDueReminders(recurring: RecurringTransaction[], cicilan: Cicilan[], date: Date) {
  const reminders: { name: string; amount: number; type: string; due: string; status: 'soon' | 'overdue' }[] = [];
  for (const r of recurring) {
    if (!r.active) continue;
    const status = getRecurringDueStatus(r);
    if (status !== 'normal') {
      reminders.push({ name: r.description, amount: r.amount, type: r.type, due: r.next_due, status });
    }
  }
  for (const c of cicilan) {
    const status = getCicilanDueStatus(c, date);
    if (status !== 'normal') {
      reminders.push({
        name: c.name,
        amount: c.monthly_payment,
        type: 'out',
        due: `${c.due_day} ${date.toLocaleDateString('id-ID', { month: 'long' })}`,
        status,
      });
    }
  }
  return reminders.sort((a, b) => (a.status === 'overdue' ? -1 : 1));
}
