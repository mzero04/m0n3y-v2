import { Plus, CreditCard, Trash2, Pencil } from 'lucide-react';
import { useState } from 'react';
import type { Budget, Transaction, Cicilan, Account, Category } from '@/lib/types';
import { formatRupiah, monthLabel } from '@/lib/format';
import { getBudgetProgress, getCicilanDueStatus } from '@/lib/compute';
import { CICILAN_TYPES } from '@/lib/constants';
import { ProgressBar, BudgetBarChart } from '@/components/ui/Charts';
import { EmptyState } from '@/components/ui/Feedback';

interface BudgetingProps {
  budgets: Budget[];
  transactions: Transaction[];
  cicilan: Cicilan[];
  accounts: Account[];
  categories: Category[];
  onAddBudget: () => void;
  onEditBudget: (category: string) => void;
  onDeleteBudget: (id: string) => void;
  onAddCicilan: () => void;
  onEditCicilan: (cic: Cicilan) => void;
  onPayCicilan: (cic: Cicilan) => void;
}

export function Budgeting({
  budgets, transactions, cicilan, accounts, categories,
  onAddBudget, onEditBudget, onDeleteBudget, onAddCicilan, onEditCicilan, onPayCicilan,
}: BudgetingProps) {
  const now = new Date();
  const progress = getBudgetProgress(budgets, transactions, now);
  const overCount = progress.filter((b) => b.over).length;
  const totalBudget = progress.reduce((s, b) => s + b.amount, 0);
  const totalSpent = progress.reduce((s, b) => s + b.spent, 0);

  const totalMonthlyCicilan = cicilan.reduce((s, c) => s + c.monthly_payment, 0);
  const totalDebt = cicilan.reduce((s, c) => s + c.total_debt, 0);

  const chartData = progress.slice(0, 6).map((b) => ({
    label: b.category.length > 10 ? b.category.slice(0, 8) + '..' : b.category,
    budget: b.amount, spent: b.spent,
  }));

  return (
    <div className="page-fade">
      <div className="flex justify-between items-end mb-7 gap-5 flex-wrap max-md:flex-col max-md:items-start max-md:gap-2.5 max-md:mb-4">
        <div>
          <h1 className="font-display text-[28px] max-md:text-xl font-bold tracking-tight">Budgeting</h1>
          <p className="text-[#8C9BBE] text-sm max-md:text-[13px] mt-1">Kendalikan pengeluaran agar tidak over budget</p>
        </div>
        <button onClick={onAddBudget} className="btn-primary">+ Atur Budget</button>
      </div>

      <div className="grid grid-cols-[1.4fr_1fr] gap-[18px] max-md:grid-cols-1 max-md:gap-3">
        <div className="card-base">
          <h3 className="font-display text-[15px] font-semibold mb-4 flex justify-between items-center">
            Progress Budget <span className="text-[#8C9BBE] text-xs font-normal">{monthLabel(now)}</span>
          </h3>
          {progress.length === 0 ? (
            <EmptyState text='Belum ada budget. Klik "Atur Budget" untuk mulai.' />
          ) : (
            <div className="flex flex-col gap-5">
              {progress.map((b) => {
                const variant = b.over ? 'over' : b.pct >= 80 ? 'warn' : 'ok';
                return (
                  <div key={b.id}>
                    <div className="flex justify-between items-baseline mb-2 max-md:flex-col max-md:items-start max-md:gap-1">
                      <div className="font-bold text-sm flex items-center gap-2">
                        {b.category}
                        <button
                          onClick={() => onEditBudget(b.category)}
                          className="text-[#8C9BBE] hover:text-[#34D8A6] transition-colors"
                          title="Edit budget"
                          aria-label={`Edit budget ${b.category}`}
                        >
                          <Pencil size={13} />
                        </button>
                        <button
                          onClick={() => {
                            if (confirm(`Hapus budget untuk "${b.category}"?`)) onDeleteBudget(b.id);
                          }}
                          className="text-[#8C9BBE] hover:text-[#FF6B6B] transition-colors"
                          title="Hapus budget"
                          aria-label={`Hapus budget ${b.category}`}
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                      <div className="text-[13px] text-[#8C9BBE]">
                        <b className="text-[#EAF0FB]">{formatRupiah(b.spent)}</b> / {formatRupiah(b.amount)}
                      </div>
                    </div>
                    <ProgressBar pct={b.pct} variant={variant} />
                    <div className={`text-[11.5px] font-bold mt-1.5 ${variant === 'over' ? 'text-[#FF6B6B]' : variant === 'warn' ? 'text-[#F2B84B]' : 'text-[#34D8A6]'}`}>
                      {variant === 'over' ? `Over budget ${formatRupiah(b.remaining * -1)}` : `Sisa ${formatRupiah(b.remaining)} (${(100 - b.pct).toFixed(0)}%)`}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="card-base">
          <h3 className="font-display text-[15px] font-semibold mb-4">Alokasi vs Realisasi</h3>
          <div className="h-[220px]">
            <BudgetBarChart data={chartData} />
          </div>
          <div className="bg-[#0F1A2E] border border-[#223252] rounded-xl p-4 mt-3.5 text-[13px] text-[#8C9BBE] leading-relaxed">
            {budgets.length === 0 ? 'Belum ada budget diatur.' : (
              <>Total Budget: <b className="text-[#EAF0FB]">{formatRupiah(totalBudget)}</b> · Terpakai: <b className="text-[#EAF0FB]">{formatRupiah(totalSpent)}</b> ({totalBudget > 0 ? ((totalSpent / totalBudget) * 100).toFixed(0) : 0}%)</>
            )}
            {overCount > 0 && <div className="text-[#FF6B6B] font-bold mt-1.5">{overCount} kategori over budget!</div>}
          </div>
        </div>
      </div>

      {/* Cicilan */}
      <div className="card-base mt-[18px]">
        <div className="flex items-center justify-between mb-2.5 gap-2 flex-wrap">
          <h3 className="font-display text-[15px] font-semibold mb-0">Cicilan & Pinjaman</h3>
          <button onClick={onAddCicilan} className="btn-primary btn-sm">+ Tambah</button>
        </div>
        <p className="text-xs text-[#8C9BBE] mb-3.5">Lacak kartu kredit, PayLater, KPR, dan pinjaman lainnya. Klik Bayar untuk langsung mencatat pembayaran sebagai transaksi.</p>
        {cicilan.length === 0 ? (
          <EmptyState text='Belum ada cicilan. Klik "+ Tambah" untuk mulai melacak.' />
        ) : (
          <div>
            {cicilan.map((c) => {
              const dueStatus = getCicilanDueStatus(c, now);
              const typeInfo = CICILAN_TYPES[c.type] ?? CICILAN_TYPES.lainnya;
              return (
                <div key={c.id} className="py-3.5 border-b border-[#223252] last:border-0">
                  <div className="flex items-center justify-between mb-2 gap-2 flex-wrap">
                    <div className="flex items-center gap-2 flex-wrap">
                      <CreditCard size={16} className="text-[#8C9BBE]" />
                      <span className="font-bold text-sm">{c.name}</span>
                      <span className={`text-[10.5px] px-2 py-0.5 rounded font-semibold ${typeInfo.badge}`}>{typeInfo.label}</span>
                      <span className={`text-[11px] font-semibold px-2 py-0.5 rounded
                        ${dueStatus === 'overdue' ? 'bg-[#5A2A2E] text-[#FF6B6B]' : dueStatus === 'soon' ? 'bg-[#5A4321] text-[#F2B84B]' : 'bg-[#182742] text-[#8C9BBE]'}`}>
                        Jatuh tempo tgl {c.due_day}
                      </span>
                    </div>
                    <div className="flex gap-1.5 items-center flex-shrink-0">
                      <button onClick={() => onPayCicilan(c)} className="btn-primary btn-sm">Bayar</button>
                      <button onClick={() => onEditCicilan(c)} className="btn-secondary btn-sm">Edit</button>
                    </div>
                  </div>
                  <div className="flex gap-3.5 text-[12.5px] text-[#8C9BBE] flex-wrap">
                    <span>Cicilan/bulan: <b className="text-[#EAF0FB]">{formatRupiah(c.monthly_payment)}</b></span>
                    <span>Total Hutang: <b className="text-[#EAF0FB]">{formatRupiah(c.total_debt)}</b></span>
                  </div>
                </div>
              );
            })}
            <div className="mt-3.5 pt-3.5 border-t border-[#223252]">
              <div className="flex justify-between text-[13.5px] mb-1.5">
                <span className="text-[#8C9BBE]">Total Kewajiban Bulanan</span>
                <span className="font-bold text-[#FF6B6B]">{formatRupiah(totalMonthlyCicilan)}</span>
              </div>
              <div className="flex justify-between text-[13.5px]">
                <span className="text-[#8C9BBE]">Total Sisa Hutang</span>
                <span className="font-bold">{formatRupiah(totalDebt)}</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
