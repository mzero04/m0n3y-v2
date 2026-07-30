import { Plus, Target, Repeat, Trash2, Bell, Edit, Check } from 'lucide-react';
import { useState } from 'react';
import type { SavingsGoal, RecurringTransaction, Transaction, Cicilan, Account } from '@/lib/types';
import { formatRupiah, formatDate, daysUntil } from '@/lib/format';
import { RECURRING_FREQUENCIES } from '@/lib/constants';
import { getRecurringDueStatus, getGoalsDueReminders } from '@/lib/compute';
import { EmptyState } from '@/components/ui/Feedback';
import { Modal } from '@/components/ui/Modal';

interface GoalsProps {
  savingsGoals: SavingsGoal[];
  recurring: RecurringTransaction[];
  cicilan: Cicilan[];
  accounts: Account[];
  transactions: Transaction[];
  onAddGoal: () => void;
  onEditGoal: (goal: SavingsGoal) => void;
  onDepositGoal: (goal: SavingsGoal, amount: number) => Promise<void>;
  onAddRecurring: () => void;
  onEditRecurring: (rec: RecurringTransaction) => void;
  onDeleteRecurring: (id: string) => void;
  onLogRecurring: (rec: RecurringTransaction) => void;
  onToggleRecurring: (rec: RecurringTransaction) => Promise<void>;
}

export function Goals({
  savingsGoals, recurring, cicilan, accounts, transactions,
  onAddGoal, onEditGoal, onDepositGoal, onAddRecurring, onEditRecurring, onDeleteRecurring, onLogRecurring, onToggleRecurring,
}: GoalsProps) {
  const now = new Date();
  const [depositGoal, setDepositGoal] = useState<SavingsGoal | null>(null);
  const [depositAmount, setDepositAmount] = useState('');
  const [depositSaving, setDepositSaving] = useState(false);

  const reminders = getGoalsDueReminders(recurring, cicilan, now);

  const handleDeposit = async () => {
    if (!depositGoal || !depositAmount) return;
    setDepositSaving(true);
    await onDepositGoal(depositGoal, parseFloat(depositAmount));
    setDepositSaving(false);
    setDepositGoal(null);
    setDepositAmount('');
  };

  return (
    <div className="page-fade">
      <div className="flex justify-between items-end mb-7 gap-5 flex-wrap max-md:flex-col max-md:items-start max-md:gap-2.5 max-md:mb-4">
        <div>
          <h1 className="font-display text-[28px] max-md:text-xl font-bold tracking-tight">Target & Berulang</h1>
          <p className="text-[#8C9BBE] text-sm max-md:text-[13px] mt-1">Kejar target tabunganmu & jangan sampai lupa bayar tagihan</p>
        </div>
      </div>

      {/* Due reminders */}
      {reminders.length > 0 && (
        <div className="bg-[#5A2A2E] border border-[#FF6B6B] rounded-[14px] p-4 mb-[18px]">
          <h4 className="text-[13.5px] mb-2.5 text-[#ffb3b3] flex items-center gap-2 font-bold"><Bell size={16} /> Pengingat Jatuh Tempo</h4>
          {reminders.map((r, i) => (
            <div key={i} className="flex items-center justify-between gap-2.5 py-2 border-t border-[rgba(255,107,107,0.25)] first:border-0">
              <div>
                <div className="font-semibold text-sm">{r.name}</div>
                <div className="text-[11px] text-[#ffb3b3] mt-0.5">Jatuh tempo: {r.due}</div>
              </div>
              <div className="text-right flex-shrink-0">
                <div className="font-bold text-sm">{formatRupiah(r.amount)}</div>
                <div className={`text-[10.5px] font-bold ${r.status === 'overdue' ? 'text-[#FF6B6B]' : 'text-[#F2B84B]'}`}>
                  {r.status === 'overdue' ? 'Terlambat!' : 'Segera jatuh tempo'}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Savings goals */}
      <div className="card-base mb-[18px]">
        <div className="flex items-center justify-between mb-1">
          <h3 className="font-display text-[15px] font-semibold mb-0">Target Tabungan</h3>
          <button onClick={onAddGoal} className="btn-primary btn-sm">+ Tambah Target</button>
        </div>
        <p className="text-xs text-[#8C9BBE] my-2">Buat target tabungan (mis. Dana Darurat, Liburan, DP Rumah) dan catat setoranmu.</p>
        {savingsGoals.length === 0 ? (
          <EmptyState text='Belum ada target tabungan. Klik "+ Tambah Target" untuk mulai.' />
        ) : (
          <div className="grid grid-cols-3 gap-[18px] max-md:grid-cols-1 max-md:gap-3">
            {savingsGoals.map((g) => {
              const pct = g.target_amount > 0 ? (g.current_amount / g.target_amount) * 100 : 0;
              return (
                <div key={g.id} className="bg-[#182742] border border-[#223252] rounded-[14px] p-4 flex flex-col gap-2.5">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="text-xl">{g.icon}</span>
                      <span className="font-bold text-sm flex-1">{g.name}</span>
                    </div>
                    <button onClick={() => onEditGoal(g)} className="text-[#8C9BBE] hover:text-[#34D8A6] cursor-pointer"><Edit size={14} /></button>
                  </div>
                  <div className="flex justify-between text-[12.5px] text-[#8C9BBE]">
                    <span><b className="text-[#EAF0FB]">{formatRupiah(g.current_amount)}</b></span>
                    <span>{formatRupiah(g.target_amount)}</span>
                  </div>
                  <div className="h-2.5 rounded-md bg-[#0F1A2E] border border-[#223252] overflow-hidden">
                    <div className="h-full rounded-md bg-gradient-to-r from-[#34D8A6] to-[#5be8c0] transition-all duration-500" style={{ width: `${Math.min(pct, 100)}%` }} />
                  </div>
                  <div className="text-[11.5px] text-[#34D8A6] font-bold">{pct.toFixed(0)}% tercapai</div>
                  {g.target_date && (
                    <div className="text-[11.5px] text-[#8C9BBE]">Target: {formatDate(g.target_date)} ({daysUntil(g.target_date)} hari lagi)</div>
                  )}
                  <div className="flex gap-1.5 mt-1">
                    <button onClick={() => { setDepositGoal(g); setDepositAmount(''); }} className="btn-primary flex-1 text-xs py-1.5">Setor</button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Recurring */}
      <div className="card-base">
        <div className="flex items-center justify-between mb-1">
          <h3 className="font-display text-[15px] font-semibold mb-0">Transaksi Berulang & Tagihan</h3>
          <button onClick={onAddRecurring} className="btn-primary btn-sm">+ Tambah</button>
        </div>
        <p className="text-xs text-[#8C9BBE] my-2">Catat tagihan/transaksi rutin (langganan, cicilan, gaji) supaya kamu diingatkan saat jatuh tempo.</p>
        {recurring.length === 0 ? (
          <EmptyState text='Belum ada transaksi berulang. Klik "+ Tambah" untuk mulai.' />
        ) : (
          <div>
            {recurring.map((r) => {
              const status = getRecurringDueStatus(r);
              return (
                <div key={r.id} className="flex items-center gap-3 py-3.5 border-b border-[#223252] last:border-0">
                  <Repeat size={18} className="text-[#8C9BBE] flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="font-bold text-[13.5px]">{r.description}</div>
                    <div className="text-[11.5px] text-[#8C9BBE] mt-0.5">
                      {RECURRING_FREQUENCIES[r.frequency]} · {r.account} · {r.category} · Jatuh tempo {formatDate(r.next_due)}
                      <span className={`ml-1.5 inline-flex items-center px-2 py-0.5 rounded-full text-[10.5px] font-bold
                        ${status === 'overdue' ? 'bg-[#5A2A2E] text-[#FF6B6B]' : status === 'soon' ? 'bg-[#5A4321] text-[#F2B84B]' : ''}`}>
                        {status === 'overdue' ? 'Terlambat' : status === 'soon' ? 'Segera' : ''}
                      </span>
                    </div>
                  </div>
                  <div className={`font-bold text-[13.5px] whitespace-nowrap ${r.type === 'in' ? 'text-[#34D8A6]' : 'text-[#FF6B6B]'}`}>
                    {r.type === 'in' ? '+' : '-'}{formatRupiah(r.amount)}
                  </div>
                  <div className="flex gap-1 flex-shrink-0">
                    <button onClick={() => onLogRecurring(r)} className="btn-primary btn-sm" title="Catat sebagai transaksi">Catat</button>
                    <button onClick={() => onEditRecurring(r)} className="btn-secondary btn-sm" title="Edit"><Edit size={14} /></button>
                    <button
                      onClick={() => { if (confirm(`Hapus transaksi berulang "${r.description}"?`)) onDeleteRecurring(r.id); }}
                      className="btn-secondary btn-sm text-[#FF6B6B]"
                      title="Hapus"
                      aria-label={`Hapus ${r.description}`}
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Deposit modal */}
      <Modal
        open={!!depositGoal}
        onClose={() => setDepositGoal(null)}
        title={`Setor ke ${depositGoal?.name ?? ''}`}
        footer={
          <>
            <button onClick={() => setDepositGoal(null)} className="btn-secondary flex-1 max-md:w-full">Batal</button>
            <button onClick={handleDeposit} disabled={depositSaving || !depositAmount} className="btn-primary flex-1 max-md:w-full">
              {depositSaving ? 'Menyimpan...' : 'Setor'}
            </button>
          </>
        }
      >
        <div>
          <label className="label-base">Jumlah Setoran (Rp)</label>
          <input type="number" value={depositAmount} onChange={(e) => setDepositAmount(e.target.value)} placeholder="0" min="0" className="input-base" autoFocus />
          {depositGoal && (
            <p className="text-[11.5px] text-[#8C9BBE] mt-2">
              Saldo saat ini: {formatRupiah(depositGoal.current_amount)} / {formatRupiah(depositGoal.target_amount)}
            </p>
          )}
        </div>
      </Modal>
    </div>
  );
}
