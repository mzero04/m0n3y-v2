import { useState, useCallback, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useFinanceData } from '@/hooks/useFinanceData';
import { useIsMobile } from '@/hooks/useMediaQuery';
import type { PageId, Transaction, Account, Transfer, Cicilan, SavingsGoal, RecurringTransaction, Category } from '@/lib/types';
import { todayISO } from '@/lib/format';
import { getTotalBalance, getBudgetProgress, getGoalsDueReminders } from '@/lib/compute';
import {
  insertTransaction, updateTransaction, deleteTransaction,
  insertTransfer, deleteTransfer,
  insertAccount, updateAccount, deleteAccount,
  upsertBudget, deleteBudget, upsertOpeningBalance,
  insertCicilan, updateCicilan, deleteCicilan,
  insertSavingsGoal, updateSavingsGoal, deleteSavingsGoal,
  insertRecurring, updateRecurring, deleteRecurring,
  insertCategory, deleteCategory, updateCategorySort,
} from '@/hooks/useFinanceData';

import { Spinner } from '@/components/ui/Feedback';
import { AuthScreen } from '@/components/AuthScreen';
import { Sidebar, MobileTopBar } from '@/components/Navigation';
import { Fab } from '@/components/Fab';

import { Dashboard } from '@/pages/Dashboard';
import { Transactions } from '@/pages/Transactions';
import { Accounts } from '@/pages/Accounts';
import { TransferPage } from '@/pages/TransferPage';
import { Budgeting } from '@/pages/Budgeting';
import { Report } from '@/pages/Report';
import { Goals } from '@/pages/Goals';
import { Profile } from '@/pages/Profile';

import { TxModal } from '@/components/modals/TxModal';
import { TransferModal } from '@/components/modals/TransferModal';
import { AccountModal } from '@/components/modals/AccountModal';
import { BudgetModal } from '@/components/modals/BudgetModal';
import { CicilanModal } from '@/components/modals/CicilanModal';
import { GoalModal } from '@/components/modals/GoalModal';
import { RecurringModal } from '@/components/modals/RecurringModal';
import { CategoryModal } from '@/components/modals/CategoryModal';

function App() {
  const auth = useAuth();
  const data = useFinanceData(auth.user?.id ?? null);
  const isMobile = useIsMobile();

  const [currentPage, setCurrentPage] = useState<PageId>('dashboard');

  // Modal states
  const [txModal, setTxModal] = useState(false);
  const [editingTx, setEditingTx] = useState<Transaction | null>(null);
  const [transferModal, setTransferModal] = useState(false);
  const [editingTr, setEditingTr] = useState<Transfer | null>(null);
  const [accModal, setAccModal] = useState(false);
  const [editingAcc, setEditingAcc] = useState<Account | null>(null);
  const [budgetModal, setBudgetModal] = useState(false);
  const [cicilanModal, setCicilanModal] = useState(false);
  const [editingCic, setEditingCic] = useState<Cicilan | null>(null);
  const [goalModal, setGoalModal] = useState(false);
  const [editingGoal, setEditingGoal] = useState<SavingsGoal | null>(null);
  const [recurringModal, setRecurringModal] = useState(false);
  const [editingRec, setEditingRec] = useState<RecurringTransaction | null>(null);
  const [categoryModal, setCategoryModal] = useState(false);
  const [categoryModalType, setCategoryModalType] = useState<'in' | 'out'>('out');

  const now = new Date();
  const totalBalance = getTotalBalance(data.accounts, data.transactions, data.transfers, data.openingBalances);
  const budgetProgress = getBudgetProgress(data.budgets, data.transactions, now);
  const overBudgetCount = budgetProgress.filter((b) => b.over).length;
  const goalsDueCount = getGoalsDueReminders(data.recurring, data.cicilan, now).length;

  // Scroll to top on page change
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [currentPage]);

  // ─── Handlers ─────────────────────────────────────────
  const handleNavigate = useCallback((page: PageId) => setCurrentPage(page), []);

  const openTxModal = useCallback(() => { setEditingTx(null); setTxModal(true); }, []);
  const openEditTx = useCallback((tx: Transaction) => { setEditingTx(tx); setTxModal(true); }, []);
  const handleSaveTx = useCallback(async (tx: Omit<Transaction, 'id'> & { id?: string }) => {
    if (tx.id) {
      const { error } = await updateTransaction(tx.id, { type: tx.type, description: tx.description, amount: tx.amount, account: tx.account, category: tx.category, date: tx.date, time: tx.time });
      if (error) { alert('Gagal menyimpan transaksi: ' + error.message); return; }
    } else {
      const { error } = await insertTransaction(auth.user!.id, { type: tx.type, description: tx.description, amount: tx.amount, account: tx.account, category: tx.category, date: tx.date, time: tx.time });
      if (error) { alert('Gagal menyimpan transaksi: ' + error.message); return; }
    }
    data.refetch();
  }, [data, auth.user]);

  const handleDeleteTx = useCallback(async (id: string) => {
    const { error } = await deleteTransaction(id);
    if (error) { alert('Gagal menghapus transaksi: ' + error.message); return; }
    data.refetch();
  }, [data]);

  const openTransferModal = useCallback(() => { setEditingTr(null); setTransferModal(true); }, []);
  const handleSaveTransfer = useCallback(async (tr: Omit<Transfer, 'id'> & { id?: string }) => {
    if (tr.id) {
      await deleteTransfer(tr.id);
      const { error } = await insertTransfer(auth.user!.id, { from_account: tr.from_account, to_account: tr.to_account, amount: tr.amount, note: tr.note, date: tr.date, time: tr.time });
      if (error) { alert('Gagal menyimpan transfer: ' + error.message); return; }
    } else {
      const { error } = await insertTransfer(auth.user!.id, { from_account: tr.from_account, to_account: tr.to_account, amount: tr.amount, note: tr.note, date: tr.date, time: tr.time });
      if (error) { alert('Gagal menyimpan transfer: ' + error.message); return; }
    }
    data.refetch();
  }, [data, auth.user]);

  const handleDeleteTransfer = useCallback(async (id: string) => {
    await deleteTransfer(id);
    data.refetch();
  }, [data]);

  const openAccModal = useCallback(() => { setEditingAcc(null); setAccModal(true); }, []);
  const openEditAcc = useCallback((acc: Account) => { setEditingAcc(acc); setAccModal(true); }, []);
  const handleSaveAccount = useCallback(async (acc: Account) => {
    if (editingAcc) {
      const { error } = await updateAccount(acc.id, { name: acc.name, type: acc.type, color_id: acc.color_id });
      if (error) { alert('Gagal menyimpan akun: ' + error.message); return; }
    } else {
      const { error } = await insertAccount(auth.user!.id, acc);
      if (error) { alert('Gagal menyimpan akun: ' + error.message); return; }
    }
    data.refetch();
  }, [data, editingAcc, auth.user]);

  const handleDeleteAccount = useCallback(async (id: string) => {
    await deleteAccount(id);
    data.refetch();
  }, [data]);

  const handleSetOpeningBalance = useCallback(async (accountName: string, amount: number) => {
    const { error } = await upsertOpeningBalance(auth.user!.id, accountName, amount);
    if (error) { alert('Gagal menyimpan saldo awal: ' + error.message); return; }
    data.refetch();
  }, [data, auth.user]);

  const [editingBudgetCategory, setEditingBudgetCategory] = useState<string | null>(null);
  const openBudgetModal = useCallback(() => { setEditingBudgetCategory(null); setBudgetModal(true); }, []);
  const openEditBudget = useCallback((category: string) => { setEditingBudgetCategory(category); setBudgetModal(true); }, []);
  const handleSaveBudget = useCallback(async (category: string, amount: number) => {
    const { error } = await upsertBudget(auth.user!.id, category, amount);
    if (error) { alert('Gagal menyimpan budget: ' + error.message); return; }
    data.refetch();
  }, [data, auth.user]);
  const handleDeleteBudget = useCallback(async (id: string) => {
    const { error } = await deleteBudget(id);
    if (error) { alert('Gagal menghapus budget: ' + error.message); return; }
    data.refetch();
  }, [data]);

  const openCicilanModal = useCallback(() => { setEditingCic(null); setCicilanModal(true); }, []);
  const openEditCicilan = useCallback((cic: Cicilan) => { setEditingCic(cic); setCicilanModal(true); }, []);
  const handleSaveCicilan = useCallback(async (cic: Omit<Cicilan, 'id'> & { id?: string }) => {
    if (cic.id) {
      const { error } = await updateCicilan(cic.id, { name: cic.name, type: cic.type, total_debt: cic.total_debt, monthly_payment: cic.monthly_payment, due_day: cic.due_day, account_id: cic.account_id });
      if (error) { alert('Gagal menyimpan cicilan: ' + error.message); return; }
    } else {
      const { error } = await insertCicilan(auth.user!.id, { name: cic.name, type: cic.type, total_debt: cic.total_debt, monthly_payment: cic.monthly_payment, due_day: cic.due_day, account_id: cic.account_id });
      if (error) { alert('Gagal menyimpan cicilan: ' + error.message); return; }
    }
    data.refetch();
  }, [data, auth.user]);
  const handleDeleteCicilan = useCallback(async (id: string) => {
    await deleteCicilan(id);
    data.refetch();
  }, [data]);

  const handlePayCicilan = useCallback(async (cic: Cicilan) => {
    const acc = data.accounts.find((a) => a.id === cic.account_id);
    const { error } = await insertTransaction(auth.user!.id, {
      type: 'out',
      description: `Bayar cicilan: ${cic.name}`,
      amount: cic.monthly_payment,
      account: acc?.name ?? data.accounts[0]?.name ?? '',
      category: 'Tagihan',
      date: todayISO(),
      time: null,
    });
    if (error) { alert('Gagal mencatat pembayaran cicilan: ' + error.message); return; }
    data.refetch();
  }, [data, auth.user]);

  const openGoalModal = useCallback(() => { setEditingGoal(null); setGoalModal(true); }, []);
  const openEditGoal = useCallback((goal: SavingsGoal) => { setEditingGoal(goal); setGoalModal(true); }, []);
  const handleSaveGoal = useCallback(async (goal: Omit<SavingsGoal, 'id'> & { id?: string }) => {
    if (goal.id) {
      const { error } = await updateSavingsGoal(goal.id, { name: goal.name, icon: goal.icon, target_amount: goal.target_amount, current_amount: goal.current_amount, target_date: goal.target_date });
      if (error) { alert('Gagal menyimpan target: ' + error.message); return; }
    } else {
      const { error } = await insertSavingsGoal(auth.user!.id, { name: goal.name, icon: goal.icon, target_amount: goal.target_amount, current_amount: goal.current_amount, target_date: goal.target_date });
      if (error) { alert('Gagal menyimpan target: ' + error.message); return; }
    }
    data.refetch();
  }, [data, auth.user]);
  const handleDeleteGoal = useCallback(async (id: string) => {
    await deleteSavingsGoal(id);
    data.refetch();
  }, [data]);

  const handleDepositGoal = useCallback(async (goal: SavingsGoal, amount: number) => {
    await updateSavingsGoal(goal.id, { current_amount: goal.current_amount + amount });
    data.refetch();
  }, [data]);

  const openRecurringModal = useCallback(() => { setEditingRec(null); setRecurringModal(true); }, []);
  const openEditRecurring = useCallback((rec: RecurringTransaction) => { setEditingRec(rec); setRecurringModal(true); }, []);
  const handleSaveRecurring = useCallback(async (rec: Omit<RecurringTransaction, 'id'> & { id?: string }) => {
    if (rec.id) {
      const { error } = await updateRecurring(rec.id, { type: rec.type, description: rec.description, amount: rec.amount, account: rec.account, category: rec.category, frequency: rec.frequency, next_due: rec.next_due, active: rec.active });
      if (error) { alert('Gagal menyimpan transaksi berulang: ' + error.message); return; }
    } else {
      const { error } = await insertRecurring(auth.user!.id, { type: rec.type, description: rec.description, amount: rec.amount, account: rec.account, category: rec.category, frequency: rec.frequency, next_due: rec.next_due, active: rec.active });
      if (error) { alert('Gagal menyimpan transaksi berulang: ' + error.message); return; }
    }
    data.refetch();
  }, [data, auth.user]);
  const handleDeleteRecurring = useCallback(async (id: string) => {
    const { error } = await deleteRecurring(id);
    if (error) { alert('Gagal menghapus transaksi berulang: ' + error.message); return; }
    data.refetch();
  }, [data]);

  const handleLogRecurring = useCallback(async (rec: RecurringTransaction) => {
    const { error: txErr } = await insertTransaction(auth.user!.id, {
      type: rec.type, description: rec.description, amount: rec.amount,
      account: rec.account, category: rec.category,
      date: todayISO(), time: null,
    });
    if (txErr) { alert('Gagal mencatat transaksi berulang: ' + txErr.message); return; }
    const next = new Date(rec.next_due);
    if (rec.frequency === 'weekly') next.setDate(next.getDate() + 7);
    else if (rec.frequency === 'monthly') next.setMonth(next.getMonth() + 1);
    else if (rec.frequency === 'yearly') next.setFullYear(next.getFullYear() + 1);
    await updateRecurring(rec.id, { next_due: next.toISOString().split('T')[0] });
    data.refetch();
  }, [data, auth.user]);

  const handleToggleRecurring = useCallback(async (rec: RecurringTransaction) => {
    await updateRecurring(rec.id, { active: !rec.active });
    data.refetch();
  }, [data]);

  const openCategoryModal = useCallback((type: 'in' | 'out' = 'out') => { setCategoryModalType(type); setCategoryModal(true); }, []);
  const handleAddCategory = useCallback(async (type: 'in' | 'out', name: string): Promise<boolean> => {
    const exists = data.categories.find((c) => c.type === type && c.name.toLowerCase() === name.toLowerCase());
    if (exists) return false;
    const { error } = await insertCategory(auth.user!.id, { type, name });
    if (error) return false;
    data.refetch();
    return true;
  }, [data, auth.user]);

  const handleDeleteCategory = useCallback(async (id: string) => {
    await deleteCategory(id);
    data.refetch();
  }, [data]);

  const handleReorderCategory = useCallback(async (id: string, direction: 'up' | 'down', type: 'in' | 'out') => {
    const cats = data.categories.filter((c) => c.type === type).sort((a, b) => a.sort_order - b.sort_order);
    const idx = cats.findIndex((c) => c.id === id);
    if (idx < 0) return;
    const swapIdx = direction === 'up' ? idx - 1 : idx + 1;
    if (swapIdx < 0 || swapIdx >= cats.length) return;
    const a = cats[idx];
    const b = cats[swapIdx];
    await updateCategorySort(a.id, b.sort_order);
    await updateCategorySort(b.id, a.sort_order);
    data.refetch();
  }, [data]);

  // ─── Render ───────────────────────────────────────────
  if (auth.loading || (auth.session && data.loading)) {
    return <Spinner text="Memuat Catatan Keuangan..." />;
  }

  if (!auth.session) {
    return <AuthScreen onSignIn={auth.signIn} onSignUp={auth.signUp} onResetPassword={auth.resetPassword} />;
  }

  if (data.error) {
    return (
      <div className="fixed inset-0 flex items-center justify-center p-8">
        <div className="max-w-md text-center">
          <h2 className="font-display text-xl font-bold mb-3 text-[#FF6B6B]">Gagal Memuat Data</h2>
          <p className="text-[#8C9BBE] text-sm mb-4">{data.error}</p>
          <button onClick={data.refetch} className="btn-primary">Coba Lagi</button>
        </div>
      </div>
    );
  }

  const profile = {
    id: auth.user?.id ?? '',
    email: auth.user?.email ?? '',
    fullName: auth.fullName,
    avatarUrl: auth.avatarUrl,
  };

  return (
    <div className="flex min-h-screen">
      <Sidebar
        currentPage={currentPage}
        onNavigate={handleNavigate}
        fullName={auth.fullName}
        email={auth.user?.email ?? ''}
        avatarUrl={auth.avatarUrl}
        totalBalance={totalBalance}
        onSignOut={auth.signOut}
        budgetOverCount={overBudgetCount}
        goalsDueCount={goalsDueCount}
      />

      {isMobile && (
        <MobileTopBar
          totalBalance={totalBalance}
          fullName={auth.fullName}
          avatarUrl={auth.avatarUrl}
          onSignOut={auth.signOut}
        />
      )}

      <main className="flex-1 min-w-0 p-8 max-md:p-3.5 max-md:pt-[72px] max-md:pb-[calc(80px+env(safe-area-inset-bottom))]">
        {currentPage === 'dashboard' && (
          <Dashboard
            accounts={data.accounts}
            transactions={data.transactions}
            transfers={data.transfers}
            openingBalances={data.openingBalances}
            budgets={data.budgets}
            categories={data.categories}
            fullName={auth.fullName}
            onNavigate={handleNavigate}
            onAddTx={openTxModal}
            onTransfer={openTransferModal}
          />
        )}
        {currentPage === 'transactions' && (
          <Transactions
            transactions={data.transactions}
            accounts={data.accounts}
            categories={data.categories}
            onAddTx={openTxModal}
            onEditTx={openEditTx}
            onDeleteTx={handleDeleteTx}
          />
        )}
        {currentPage === 'accounts' && (
          <Accounts
            accounts={data.accounts}
            transactions={data.transactions}
            transfers={data.transfers}
            openingBalances={data.openingBalances}
            onAddAccount={openAccModal}
            onEditAccount={openEditAcc}
            onTransfer={openTransferModal}
            onSetOpeningBalance={handleSetOpeningBalance}
          />
        )}
        {currentPage === 'transfer' && (
          <TransferPage
            transfers={data.transfers}
            accounts={data.accounts}
            onAddTransfer={openTransferModal}
            onDeleteTransfer={handleDeleteTransfer}
          />
        )}
        {currentPage === 'budget' && (
          <Budgeting
            budgets={data.budgets}
            transactions={data.transactions}
            cicilan={data.cicilan}
            accounts={data.accounts}
            categories={data.categories}
            onAddBudget={openBudgetModal}
            onEditBudget={openEditBudget}
            onDeleteBudget={handleDeleteBudget}
            onAddCicilan={openCicilanModal}
            onEditCicilan={openEditCicilan}
            onPayCicilan={handlePayCicilan}
          />
        )}
        {currentPage === 'report' && (
          <Report
            transactions={data.transactions}
            accounts={data.accounts}
            budgets={data.budgets}
            cicilan={data.cicilan}
            savingsGoals={data.savingsGoals}
          />
        )}
        {currentPage === 'goals' && (
          <Goals
            savingsGoals={data.savingsGoals}
            recurring={data.recurring}
            cicilan={data.cicilan}
            accounts={data.accounts}
            transactions={data.transactions}
            onAddGoal={openGoalModal}
            onEditGoal={openEditGoal}
            onDepositGoal={handleDepositGoal}
            onAddRecurring={openRecurringModal}
            onEditRecurring={openEditRecurring}
            onDeleteRecurring={handleDeleteRecurring}
            onLogRecurring={handleLogRecurring}
            onToggleRecurring={handleToggleRecurring}
          />
        )}
        {currentPage === 'profile' && (
          <Profile
            profile={profile}
            categories={data.categories}
            onSaveName={auth.updateProfile}
            onUploadAvatar={auth.uploadAvatar}
            onResetPassword={auth.resetPassword}
            onAddCategory={handleAddCategory}
            onDeleteCategory={handleDeleteCategory}
            onReorderCategory={handleReorderCategory}
          />
        )}
      </main>

      {/* FAB (mobile only) */}
      {isMobile && currentPage === 'dashboard' && (
        <Fab onAddTx={openTxModal} onTransfer={openTransferModal} />
      )}

      {/* Modals */}
      <TxModal
        open={txModal}
        onClose={() => setTxModal(false)}
        accounts={data.accounts}
        categories={data.categories}
        editingTx={editingTx}
        onSave={handleSaveTx}
        onDelete={handleDeleteTx}
        onAddCategory={() => openCategoryModal('in')}
      />
      <TransferModal
        open={transferModal}
        onClose={() => setTransferModal(false)}
        accounts={data.accounts}
        editingTr={editingTr}
        onSave={handleSaveTransfer}
        onDelete={handleDeleteTransfer}
      />
      <AccountModal
        open={accModal}
        onClose={() => setAccModal(false)}
        editingAcc={editingAcc}
        onSave={handleSaveAccount}
        onDelete={handleDeleteAccount}
      />
      <BudgetModal
        open={budgetModal}
        onClose={() => setBudgetModal(false)}
        categories={data.categories}
        budgets={data.budgets}
        editCategory={editingBudgetCategory}
        onSave={handleSaveBudget}
        onDelete={handleDeleteBudget}
        onAddCategory={() => openCategoryModal('out')}
      />
      <CicilanModal
        open={cicilanModal}
        onClose={() => setCicilanModal(false)}
        accounts={data.accounts}
        editingCic={editingCic}
        onSave={handleSaveCicilan}
        onDelete={handleDeleteCicilan}
      />
      <GoalModal
        open={goalModal}
        onClose={() => setGoalModal(false)}
        editingGoal={editingGoal}
        onSave={handleSaveGoal}
        onDelete={handleDeleteGoal}
      />
      <RecurringModal
        open={recurringModal}
        onClose={() => setRecurringModal(false)}
        accounts={data.accounts}
        categories={data.categories}
        editingRec={editingRec}
        onSave={handleSaveRecurring}
        onDelete={handleDeleteRecurring}
      />
      <CategoryModal
        open={categoryModal}
        onClose={() => setCategoryModal(false)}
        defaultType={categoryModalType}
        onSave={handleAddCategory}
      />
    </div>
  );
}

export default App;
