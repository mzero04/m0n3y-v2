import { useState } from 'react';
import { ChevronLeft, ChevronRight, Download, FileText } from 'lucide-react';
import type { Transaction, Account, Budget, Cicilan, SavingsGoal } from '@/lib/types';
import { formatRupiah, formatRupiahShort, monthLabel, monthKey } from '@/lib/format';
import { getMonthlyStats, getMonthlyByCategory, getTrendData } from '@/lib/compute';
import { TrendChart } from '@/components/ui/Charts';
import { exportCSV, exportReportPDF } from '@/lib/export';
import { EmptyState } from '@/components/ui/Feedback';

interface ReportProps {
  transactions: Transaction[];
  accounts: Account[];
  budgets: Budget[];
  cicilan: Cicilan[];
  savingsGoals: SavingsGoal[];
}

const CATEGORY_COLORS = ['#34D8A6', '#FF6B6B', '#F2B84B', '#9B8CFF', '#3aa8ff', '#ff8a3d', '#7fe06b', '#ffb05c'];

export function Report({ transactions, accounts, budgets, cicilan, savingsGoals }: ReportProps) {
  const [date, setDate] = useState(new Date());

  const prevMonth = () => setDate(new Date(date.getFullYear(), date.getMonth() - 1, 1));
  const nextMonth = () => setDate(new Date(date.getMonth() < 11 ? new Date(date.getFullYear(), date.getMonth() + 1, 1) : date));
  const canGoNext = monthKey(date) !== monthKey(new Date());

  const stats = getMonthlyStats(transactions, date);
  const expCats = getMonthlyByCategory(transactions, date, 'out');
  const incCats = getMonthlyByCategory(transactions, date, 'in');
  const trend = getTrendData(transactions, 12);
  const savingRatio = stats.income > 0 ? (stats.net / stats.income) * 100 : 0;

  const monthTx = transactions.filter((t) => monthKey(new Date(t.date)) === monthKey(date));
  const maxExp = Math.max(...expCats.map((c) => c.amount), 1);

  return (
    <div className="page-fade">
      <div className="flex justify-between items-end mb-7 gap-5 flex-wrap max-md:flex-col max-md:items-start max-md:gap-2.5 max-md:mb-4">
        <div>
          <h1 className="font-display text-[28px] max-md:text-xl font-bold tracking-tight">Laporan</h1>
          <p className="text-[#8C9BBE] text-sm max-md:text-[13px] mt-1">Rekap keuangan bulanan per kategori</p>
        </div>
        <div className="flex gap-2.5 max-md:w-full">
          <button onClick={() => exportCSV(monthTx)} className="btn-secondary max-md:flex-1"><Download size={16} /> Export CSV</button>
          <button onClick={() => exportReportPDF(date, transactions, accounts, budgets, cicilan, savingsGoals)} className="btn-primary max-md:flex-1"><FileText size={16} /> Export PDF</button>
        </div>
      </div>

      {/* Month nav */}
      <div className="flex items-center justify-between mb-5">
        <button onClick={prevMonth} className="bg-[#182742] border border-[#223252] text-[#EAF0FB] w-9 h-9 rounded-[10px] flex items-center justify-center cursor-pointer transition-all hover:border-[#34D8A6] hover:text-[#34D8A6]">
          <ChevronLeft size={18} />
        </button>
        <div className="font-display text-[17px] font-bold">{monthLabel(date)}</div>
        <button onClick={nextMonth} disabled={!canGoNext} className="bg-[#182742] border border-[#223252] text-[#EAF0FB] w-9 h-9 rounded-[10px] flex items-center justify-center cursor-pointer transition-all hover:border-[#34D8A6] hover:text-[#34D8A6] disabled:opacity-30 disabled:cursor-not-allowed">
          <ChevronRight size={18} />
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-[18px] mb-5 max-md:grid-cols-1 max-md:gap-3">
        <div className="card-base shadow-[inset_3px_0_0_#34D8A6]">
          <div className="text-[#8C9BBE] text-[13px] font-semibold">Pemasukan</div>
          <div className="font-display text-[26px] max-md:text-xl font-bold mt-2.5 text-[#34D8A6]">{formatRupiah(stats.income)}</div>
        </div>
        <div className="card-base shadow-[inset_3px_0_0_#FF6B6B]">
          <div className="text-[#8C9BBE] text-[13px] font-semibold">Pengeluaran</div>
          <div className="font-display text-[26px] max-md:text-xl font-bold mt-2.5 text-[#FF6B6B]">{formatRupiah(stats.expense)}</div>
        </div>
        <div className="card-base">
          <div className="text-[#8C9BBE] text-[13px] font-semibold">Selisih</div>
          <div className="font-display text-[22px] font-bold mt-2.5">{formatRupiah(stats.net)}</div>
        </div>
        <div className="card-base">
          <div className="text-[#8C9BBE] text-[13px] font-semibold">Rasio Tabungan</div>
          <div className="font-display text-xl font-bold mt-2.5">{savingRatio.toFixed(0)}%</div>
          <div className={`text-[11.5px] font-bold mt-1 ${savingRatio >= 20 ? 'text-[#34D8A6]' : savingRatio >= 10 ? 'text-[#F2B84B]' : 'text-[#FF6B6B]'}`}>
            {savingRatio >= 20 ? 'Bagus' : savingRatio >= 10 ? 'Cukup' : 'Perlu ditingkatkan'}
          </div>
        </div>
      </div>

      {/* Category breakdown */}
      <div className="grid grid-cols-2 gap-[18px] max-md:grid-cols-1 max-md:gap-3">
        <div className="card-base">
          <h3 className="font-display text-[15px] font-semibold mb-3">Pengeluaran per Kategori</h3>
          {expCats.length === 0 ? <EmptyState text="Tidak ada pengeluaran bulan ini." /> : (
            <div className="mt-3">
              {expCats.map((c, i) => (
                <div key={c.category} className="flex justify-between items-start py-2.5 border-b border-[#223252] last:border-0 gap-2">
                  <div className="flex items-center gap-2 flex-1 min-w-0 text-[13.5px]">
                    <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: CATEGORY_COLORS[i % CATEGORY_COLORS.length] }} />
                    {c.category}
                  </div>
                  <div className="text-right flex-shrink-0">
                    <div className="font-bold text-[13.5px]">{formatRupiah(c.amount)}</div>
                    <div className="text-[11px] text-[#8C9BBE] mt-0.5">{((c.amount / stats.expense) * 100).toFixed(0)}%</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        <div className="card-base">
          <h3 className="font-display text-[15px] font-semibold mb-3">Pemasukan per Kategori</h3>
          {incCats.length === 0 ? <EmptyState text="Tidak ada pemasukan bulan ini." /> : (
            <div className="mt-3">
              {incCats.map((c, i) => (
                <div key={c.category} className="flex justify-between items-start py-2.5 border-b border-[#223252] last:border-0 gap-2">
                  <div className="flex items-center gap-2 flex-1 min-w-0 text-[13.5px]">
                    <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: CATEGORY_COLORS[i % CATEGORY_COLORS.length] }} />
                    {c.category}
                  </div>
                  <div className="text-right flex-shrink-0">
                    <div className="font-bold text-[13.5px]">{formatRupiah(c.amount)}</div>
                    <div className="text-[11px] text-[#8C9BBE] mt-0.5">{stats.income > 0 ? ((c.amount / stats.income) * 100).toFixed(0) : 0}%</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Trend chart */}
      <div className="card-base mt-[18px]">
        <div className="flex justify-between items-center mb-5 flex-wrap gap-2">
          <h3 className="font-display text-[15px] font-semibold">Tren Pemasukan vs Pengeluaran</h3>
          <div className="flex items-center gap-4 text-xs">
            <span className="flex items-center gap-1.5 text-[#8C9BBE]">
              <span className="w-2.5 h-2.5 rounded-sm" style={{ background: '#34D8A6' }} /> Pemasukan
            </span>
            <span className="flex items-center gap-1.5 text-[#8C9BBE]">
              <span className="w-2.5 h-2.5 rounded-sm" style={{ background: '#FF6B6B' }} /> Pengeluaran
            </span>
            <span className="text-[#8C9BBE]">12 bulan terakhir</span>
          </div>
        </div>
        <div className="h-[340px] max-md:h-[260px]">
          <TrendChart data={trend} />
        </div>
      </div>
    </div>
  );
}
