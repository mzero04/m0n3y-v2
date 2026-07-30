import { useState, useRef } from 'react';
import { TrendChart, DonutChart } from '@/components/ui/Charts';
import type { Account, Transaction, Transfer, OpeningBalance, Budget, Category } from '@/lib/types';
import { formatRupiah, formatRupiahShort, formatDate, formatTime } from '@/lib/format';
import { ACCOUNT_COLORS } from '@/lib/constants';
import {
  getTotalBalance, getMonthlyStats, getMonthlyByCategory, getTrendData,
  getAccountBalance, getBudgetProgress,
} from '@/lib/compute';
import type { PageId } from '@/lib/types';

interface DashboardProps {
  accounts: Account[];
  transactions: Transaction[];
  transfers: Transfer[];
  openingBalances: OpeningBalance[];
  budgets: Budget[];
  categories: Category[];
  fullName: string;
  onNavigate: (page: PageId) => void;
  onAddTx: () => void;
  onTransfer: () => void;
}

const CATEGORY_COLORS = ['#34D8A6', '#FF6B6B', '#F2B84B', '#9B8CFF', '#3aa8ff', '#ff8a3d', '#7fe06b', '#ffb05c', '#d9dee8', '#aab3c4'];

export function Dashboard({
  accounts, transactions, transfers, openingBalances, budgets, categories,
  fullName, onNavigate, onAddTx, onTransfer,
}: DashboardProps) {
  const [carouselIdx, setCarouselIdx] = useState(0);
  const carouselRef = useRef<HTMLDivElement>(null);
  const now = new Date();
  const totalBalance = getTotalBalance(accounts, transactions, transfers, openingBalances);
  const stats = getMonthlyStats(transactions, now);
  const budgetProgress = getBudgetProgress(budgets, transactions, now);
  const overBudgetCount = budgetProgress.filter((b) => b.over).length;
  const trend = getTrendData(transactions, 12);
  const expCats = getMonthlyByCategory(transactions, now, 'out').slice(0, 6);
  const recentTx = transactions.slice(0, 8);
  const greeting = (() => {
    const h = now.getHours();
    if (h < 11) return 'Selamat Pagi';
    if (h < 15) return 'Selamat Siang';
    if (h < 18) return 'Selamat Sore';
    return 'Selamat Malam';
  })();

  const donutData = expCats.map((c, i) => ({
    label: c.category,
    value: c.amount,
    color: CATEGORY_COLORS[i % CATEGORY_COLORS.length],
  }));

  const handleCarouselScroll = () => {
    if (!carouselRef.current) return;
    const scrollLeft = carouselRef.current.scrollLeft;
    const cardWidth = carouselRef.current.offsetWidth * 0.82;
    setCarouselIdx(Math.round(scrollLeft / cardWidth));
  };

  return (
    <div className="page-fade">
      <div className="flex justify-between items-end mb-7 gap-5 flex-wrap max-md:flex-col max-md:items-start max-md:gap-2.5 max-md:mb-4">
        <div>
          <h1 className="font-display text-[28px] max-md:text-xl font-bold tracking-tight">{greeting}, {fullName || 'Pengguna'}!</h1>
          <p className="text-[#8C9BBE] text-sm max-md:text-[13px] mt-1">Ringkasan keuangan bulan ini</p>
        </div>
        <div className="flex gap-2.5 max-md:hidden">
          <button onClick={onTransfer} className="btn-violet">⇄ Transfer</button>
          <button onClick={onAddTx} className="btn-primary">+ Transaksi</button>
        </div>
      </div>

      {/* Stats carousel */}
      <div className="grid grid-cols-4 gap-[18px] mb-5 max-md:flex max-md:flex-nowrap max-md:overflow-x-auto max-md:scroll-snap-x max-md:[scroll-snap-type:x_mandatory] max-md:gap-3 max-md:-mx-3.5 max-md:px-3.5 max-md:scrollbar-none"
        ref={carouselRef}
        onScroll={handleCarouselScroll}
      >
        <StatCard label="Total Saldo" value={formatRupiah(totalBalance)} icon="💰" variant="balance" sub="Saldo semua akun" mobileFlex />
        <StatCard label="Pemasukan Bulan Ini" value={formatRupiah(stats.income)} icon="📈" variant="income" sub={`${stats.count} transaksi`} mobileFlex />
        <StatCard label="Pengeluaran Bulan Ini" value={formatRupiah(stats.expense)} icon="📉" variant="expense" sub={stats.net >= 0 ? 'Surplus' : 'Defisit'} mobileFlex />
        <StatCard label="Status Budget" value={overBudgetCount > 0 ? `${overBudgetCount} Over` : 'Aman'} icon="🎯" variant="default" sub={`${budgets.length} kategori diatur`} mobileFlex />
      </div>

      {/* Carousel dots (mobile) */}
      <div className="hidden max-md:flex justify-center gap-1.5 -mt-2 mb-4">
        {[0, 1, 2, 3].map((i) => (
          <span key={i} className={`h-1.5 rounded-full transition-all ${carouselIdx === i ? 'w-4 bg-[#34D8A6]' : 'w-1.5 bg-[#223252]'}`} />
        ))}
      </div>

      {/* Accounts */}
      <div className="flex items-center justify-between mb-3">
        <div className="font-display text-[15px] font-semibold text-[#8C9BBE]">Akun Kamu</div>
        <span className="bg-[#0d2e23] text-[#34D8A6] border border-[#1C5B49] inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11.5px] font-bold">● Real-time</span>
      </div>
      <div className="flex gap-4 overflow-x-auto pb-1.5 mb-[22px] max-md:gap-3">
        {accounts.map((acc) => {
          const color = ACCOUNT_COLORS[acc.color_id] ?? ACCOUNT_COLORS.gold;
          const balance = getAccountBalance(acc.name, transactions, transfers, openingBalances);
          return (
            <div key={acc.id} className="min-w-[220px] max-md:min-w-[160px] rounded-[18px] p-5 max-md:p-4 flex-shrink-0 overflow-hidden relative font-display"
              style={{ background: color.bg, color: color.text }}>
              <div className="absolute -right-8 -top-8 w-[140px] h-[140px] rounded-full bg-white/15" />
              <div className="text-xs font-bold opacity-80 relative">{acc.name}</div>
              <div className="text-[19px] max-md:text-base font-extrabold mt-7 max-md:mt-5 relative">{formatRupiah(balance)}</div>
              <div className="text-[10px] mt-0.5 opacity-65 font-sans font-semibold relative">{acc.type}</div>
            </div>
          );
        })}
        {accounts.length === 0 && (
          <div className="text-[#8C9BBE] text-sm py-5">Belum ada akun. Tambahkan dari halaman Akun Bank.</div>
        )}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-[1.4fr_1fr] gap-[18px] max-md:grid-cols-1 max-md:gap-3">
        <div className="card-base">
          <h3 className="font-display text-[15px] font-semibold mb-4 flex justify-between items-center">
            Pemasukan vs Pengeluaran <span className="text-[#8C9BBE] text-xs font-normal">12 bulan</span>
          </h3>
          <div className="h-[280px] max-md:h-[200px]">
            <TrendChart data={trend} />
          </div>
        </div>
        <div className="card-base">
          <h3 className="font-display text-[15px] font-semibold mb-4 flex justify-between items-center">
            Pengeluaran per Kategori <span className="text-[#8C9BBE] text-xs font-normal">bulan ini</span>
          </h3>
          <div className="h-[180px]">
            <DonutChart data={donutData} />
          </div>
          <div className="flex flex-col gap-2.5 mt-3.5">
            {donutData.map((d) => (
              <div key={d.label} className="flex items-center justify-between text-[13px]">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full" style={{ background: d.color }} />
                  {d.label}
                </div>
                <span className="font-semibold">{formatRupiahShort(d.value)}</span>
              </div>
            ))}
            {donutData.length === 0 && <div className="text-[#8C9BBE] text-xs">Belum ada pengeluaran bulan ini.</div>}
          </div>
        </div>
      </div>

      {/* Recent transactions */}
      <div className="card-base mt-[18px]">
        <h3 className="font-display text-[15px] font-semibold mb-4 flex justify-between items-center">
          Transaksi Terbaru
          <span className="text-[#34D8A6] text-xs font-normal cursor-pointer" onClick={() => onNavigate('transactions')}>Lihat semua →</span>
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full text-[13.5px] max-md:text-[12.5px] max-md:min-w-[480px]">
            <thead>
              <tr className="text-left text-[#8C9BBE] font-semibold text-[11.5px] uppercase tracking-wide">
                <th className="pb-2 pt-0 px-2.5 border-b border-[#223252]">Tanggal</th>
                <th className="pb-2 pt-0 px-2.5 border-b border-[#223252]">Deskripsi</th>
                <th className="pb-2 pt-0 px-2.5 border-b border-[#223252]">Akun</th>
                <th className="pb-2 pt-0 px-2.5 border-b border-[#223252]">Kategori</th>
                <th className="pb-2 pt-0 px-2.5 border-b border-[#223252]">Jumlah</th>
              </tr>
            </thead>
            <tbody>
              {recentTx.map((t) => (
                <tr key={t.id} className="border-b border-[#223252] last:border-0">
                  <td className="px-2.5 py-2.5">{formatDate(t.date)}{t.time && <div className="text-[10px] text-[#8C9BBE]">{formatTime(t.time)}</div>}</td>
                  <td className="px-2.5 py-2.5">{t.description}</td>
                  <td className="px-2.5 py-2.5">{t.account}</td>
                  <td className="px-2.5 py-2.5">
                    <span className={t.type === 'in' ? 'tag-in' : 'tag-out'}>{t.category}</span>
                  </td>
                  <td className={`px-2.5 py-2.5 font-bold ${t.type === 'in' ? 'text-[#34D8A6]' : 'text-[#FF6B6B]'}`}>
                    {t.type === 'in' ? '+' : '-'}{formatRupiah(t.amount)}
                  </td>
                </tr>
              ))}
              {recentTx.length === 0 && (
                <tr><td colSpan={5} className="text-center py-8 text-[#8C9BBE]">Belum ada transaksi.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function StatCard({ label, value, icon, variant, sub, mobileFlex }: {
  label: string; value: string; icon: string;
  variant: 'income' | 'expense' | 'balance' | 'default';
  sub: string; mobileFlex?: boolean;
}) {
  const borderColor = {
    income: 'shadow-[inset_3px_0_0_#34D8A6]',
    expense: 'shadow-[inset_3px_0_0_#FF6B6B]',
    balance: 'shadow-[inset_3px_0_0_#F2B84B]',
    default: '',
  };
  return (
    <div className={`card-base ${borderColor[variant]} ${mobileFlex ? 'max-md:flex-0 max-md:min-w-[82%] max-md:scroll-snap-center max-md:flex-shrink-0' : ''}`}>
      <div className="text-[#8C9BBE] text-[13px] max-md:text-xs font-semibold">{icon} {label}</div>
      <div className="font-display text-[26px] max-md:text-[19px] font-bold mt-2.5 max-md:mt-2 tracking-tight">{value}</div>
      <div className="text-[12.5px] max-md:text-[11px] mt-2 font-semibold text-[#8C9BBE]">{sub}</div>
    </div>
  );
}
