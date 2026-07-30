import { useState, useMemo } from 'react';
import { Download, Plus, RotateCcw, Pencil, Trash2 } from 'lucide-react';
import type { Transaction, Account, Category } from '@/lib/types';
import { formatRupiah, formatDate, formatTime } from '@/lib/format';
import { exportCSV, exportExcel, exportPDF } from '@/lib/export';
import { monthKey } from '@/lib/format';
import { EmptyState } from '@/components/ui/Feedback';

interface TransactionsProps {
  transactions: Transaction[];
  accounts: Account[];
  categories: Category[];
  onAddTx: () => void;
  onEditTx: (tx: Transaction) => void;
  onDeleteTx: (id: string) => void;
}

type QuickFilter = 'thisMonth' | 'lastMonth' | '3m' | 'year' | 'all' | 'custom';

export function Transactions({ transactions, accounts, categories, onAddTx, onEditTx, onDeleteTx }: TransactionsProps) {
  const [quickFilter, setQuickFilter] = useState<QuickFilter>('thisMonth');
  const [customFrom, setCustomFrom] = useState('');
  const [customTo, setCustomTo] = useState('');
  const [fAcc, setFAcc] = useState('');
  const [fType, setFType] = useState('');
  const [fCat, setFCat] = useState('');
  const [fSearch, setFSearch] = useState('');
  const [fAmountMin, setFAmountMin] = useState('');
  const [fAmountMax, setFAmountMax] = useState('');
  const [fSort, setFSort] = useState('newest');
  const [exportOpen, setExportOpen] = useState(false);

  const now = new Date();

  const filtered = useMemo(() => {
    let result = [...transactions];

    // Quick filter
    if (quickFilter === 'thisMonth') {
      const key = monthKey(now);
      result = result.filter((t) => monthKey(new Date(t.date)) === key);
    } else if (quickFilter === 'lastMonth') {
      const lm = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      const key = monthKey(lm);
      result = result.filter((t) => monthKey(new Date(t.date)) === key);
    } else if (quickFilter === '3m') {
      const threeMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 2, 1);
      result = result.filter((t) => new Date(t.date) >= threeMonthsAgo);
    } else if (quickFilter === 'year') {
      const y = now.getFullYear();
      result = result.filter((t) => new Date(t.date).getFullYear() === y);
    } else if (quickFilter === 'custom') {
      if (customFrom) result = result.filter((t) => t.date >= customFrom);
      if (customTo) result = result.filter((t) => t.date <= customTo);
    }

    if (fAcc) result = result.filter((t) => t.account === fAcc);
    if (fType) result = result.filter((t) => t.type === fType);
    if (fCat) result = result.filter((t) => t.category === fCat);
    if (fSearch) {
      const q = fSearch.toLowerCase();
      result = result.filter((t) =>
        t.description.toLowerCase().includes(q) ||
        t.category.toLowerCase().includes(q) ||
        t.account.toLowerCase().includes(q),
      );
    }
    if (fAmountMin) result = result.filter((t) => t.amount >= parseFloat(fAmountMin));
    if (fAmountMax) result = result.filter((t) => t.amount <= parseFloat(fAmountMax));

    switch (fSort) {
      case 'oldest': result.sort((a, b) => a.date.localeCompare(b.date)); break;
      case 'amount_desc': result.sort((a, b) => b.amount - a.amount); break;
      case 'amount_asc': result.sort((a, b) => a.amount - b.amount); break;
      default: result.sort((a, b) => b.date.localeCompare(a.date));
    }
    return result;
  }, [transactions, quickFilter, customFrom, customTo, fAcc, fType, fCat, fSearch, fAmountMin, fAmountMax, fSort, now]);

  const summary = useMemo(() => {
    const income = filtered.filter((t) => t.type === 'in').reduce((s, t) => s + t.amount, 0);
    const expense = filtered.filter((t) => t.type === 'out').reduce((s, t) => s + t.amount, 0);
    return { count: filtered.length, income, expense, net: income - expense };
  }, [filtered]);

  const resetFilters = () => {
    setQuickFilter('thisMonth'); setCustomFrom(''); setCustomTo('');
    setFAcc(''); setFType(''); setFCat(''); setFSearch('');
    setFAmountMin(''); setFAmountMax(''); setFSort('newest');
  };

  const outCategories = categories.filter((c) => c.type === 'out').map((c) => c.name);
  const inCategories = categories.filter((c) => c.type === 'in').map((c) => c.name);
  const allCats = [...new Set([...outCategories, ...inCategories])];

  return (
    <div className="page-fade">
      <div className="flex justify-between items-end mb-7 gap-5 flex-wrap max-md:flex-col max-md:items-start max-md:gap-2.5 max-md:mb-4">
        <div>
          <h1 className="font-display text-[28px] max-md:text-xl font-bold tracking-tight">Transaksi</h1>
          <p className="text-[#8C9BBE] text-sm max-md:text-[13px] mt-1">Semua riwayat pemasukan & pengeluaran</p>
        </div>
        <div className="flex gap-2.5">
          <div className="relative">
            <button onClick={() => setExportOpen(!exportOpen)} className="btn-secondary">
              <Download size={16} /> Export
            </button>
            {exportOpen && (
              <div className="absolute top-full right-0 mt-1.5 bg-[#131F36] border border-[#223252] rounded-[10px] p-1.5 min-w-[170px] z-[60] shadow-xl">
                {[
                  { label: 'CSV (.csv)', fn: () => exportCSV(filtered) },
                  { label: 'Excel (.csv)', fn: () => exportExcel(filtered) },
                  { label: 'PDF (.pdf)', fn: () => exportPDF(filtered) },
                ].map((opt) => (
                  <div key={opt.label} onClick={() => { opt.fn(); setExportOpen(false); }}
                    className="px-3 py-2 rounded-[7px] text-[13px] cursor-pointer font-semibold text-[#EAF0FB] hover:bg-[#182742] hover:text-[#34D8A6] whitespace-nowrap">
                    {opt.label}
                  </div>
                ))}
              </div>
            )}
          </div>
          <button onClick={onAddTx} className="btn-primary max-md:flex-1">+ Transaksi</button>
        </div>
      </div>

      {/* Quick filters */}
      <div className="flex gap-1.5 flex-wrap mb-3.5">
        {([
          { k: 'thisMonth', l: 'Bulan Ini' }, { k: 'lastMonth', l: 'Bulan Lalu' },
          { k: '3m', l: '3 Bulan' }, { k: 'year', l: 'Tahun Ini' },
          { k: 'all', l: 'Semua' }, { k: 'custom', l: 'Rentang Kustom' },
        ] as { k: QuickFilter; l: string }[]).map((f) => (
          <button key={f.k} onClick={() => setQuickFilter(f.k)}
            className={`px-3 py-1.5 rounded-full text-xs cursor-pointer border transition-all whitespace-nowrap
              ${quickFilter === f.k ? 'bg-[#1C5B49] border-[#34D8A6] text-[#34D8A6]' : 'bg-[#182742] border-[#223252] text-[#8C9BBE]'}`}>
            {f.l}
          </button>
        ))}
      </div>

      {quickFilter === 'custom' && (
        <div className="flex gap-2.5 mb-3.5 flex-wrap max-md:grid max-md:grid-cols-2">
          <input type="date" value={customFrom} onChange={(e) => setCustomFrom(e.target.value)} className="input-base max-w-[180px] max-md:max-w-none" placeholder="Dari" />
          <input type="date" value={customTo} onChange={(e) => setCustomTo(e.target.value)} className="input-base max-w-[180px] max-md:max-w-none" placeholder="Sampai" />
        </div>
      )}

      {/* Filters */}
      <div className="flex gap-2.5 mb-4 flex-wrap max-md:grid max-md:grid-cols-2">
        <select value={fAcc} onChange={(e) => setFAcc(e.target.value)} className="input-base max-w-[160px] max-md:max-w-none">
          <option value="">Semua Akun</option>
          {accounts.map((a) => <option key={a.id} value={a.name}>{a.name}</option>)}
        </select>
        <select value={fType} onChange={(e) => setFType(e.target.value)} className="input-base max-w-[160px] max-md:max-w-none">
          <option value="">Semua Tipe</option>
          <option value="in">Pemasukan</option>
          <option value="out">Pengeluaran</option>
        </select>
        <select value={fCat} onChange={(e) => setFCat(e.target.value)} className="input-base max-w-[160px] max-md:max-w-none">
          <option value="">Semua Kategori</option>
          {allCats.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>
        <input value={fSearch} onChange={(e) => setFSearch(e.target.value)} placeholder="Cari deskripsi, kategori, akun..." className="input-base flex-1 min-w-[200px] max-md:col-span-2" />
      </div>
      <div className="flex gap-2.5 mb-4 flex-wrap max-md:grid max-md:grid-cols-2">
        <input type="number" value={fAmountMin} onChange={(e) => setFAmountMin(e.target.value)} placeholder="Nominal min (Rp)" min="0" className="input-base max-w-[160px] max-md:max-w-none" />
        <input type="number" value={fAmountMax} onChange={(e) => setFAmountMax(e.target.value)} placeholder="Nominal maks (Rp)" min="0" className="input-base max-w-[160px] max-md:max-w-none" />
        <select value={fSort} onChange={(e) => setFSort(e.target.value)} className="input-base max-w-[160px] max-md:max-w-none">
          <option value="newest">Terbaru dulu</option>
          <option value="oldest">Terlama dulu</option>
          <option value="amount_desc">Nominal terbesar</option>
          <option value="amount_asc">Nominal terkecil</option>
        </select>
        <button onClick={resetFilters} className="btn-secondary"><RotateCcw size={14} /> Reset</button>
      </div>

      {/* Summary */}
      <div className="card-base mb-[18px]">
        <h3 className="font-display text-[15px] font-semibold mb-3.5">Ringkasan Hasil Filter</h3>
        <div className="grid grid-cols-4 gap-3.5 max-md:grid-cols-2">
          <div className="bg-[#0F1A2E] border border-[#223252] rounded-xl p-3.5">
            <div className="text-[11.5px] text-[#8C9BBE] font-semibold mb-1.5">Jumlah Transaksi</div>
            <div className="font-display text-lg font-bold">{summary.count}</div>
          </div>
          <div className="bg-[#0F1A2E] border border-[#223252] rounded-xl p-3.5">
            <div className="text-[11.5px] text-[#8C9BBE] font-semibold mb-1.5">Total Pemasukan</div>
            <div className="font-display text-lg font-bold text-[#34D8A6]">{formatRupiah(summary.income)}</div>
          </div>
          <div className="bg-[#0F1A2E] border border-[#223252] rounded-xl p-3.5">
            <div className="text-[11.5px] text-[#8C9BBE] font-semibold mb-1.5">Total Pengeluaran</div>
            <div className="font-display text-lg font-bold text-[#FF6B6B]">{formatRupiah(summary.expense)}</div>
          </div>
          <div className="bg-[#0F1A2E] border border-[#223252] rounded-xl p-3.5">
            <div className="text-[11.5px] text-[#8C9BBE] font-semibold mb-1.5">Selisih</div>
            <div className="font-display text-lg font-bold">{formatRupiah(summary.net)}</div>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="card-base overflow-hidden max-md:p-0">
        <div className="overflow-x-auto max-md:p-3.5">
          <table className="w-full text-[13.5px] max-md:text-[12.5px] max-md:min-w-[480px]">
            <thead>
              <tr className="text-left text-[#8C9BBE] font-semibold text-[11.5px] uppercase tracking-wide">
                <th className="pb-2 pt-0 px-2.5 border-b border-[#223252]">Tanggal</th>
                <th className="pb-2 pt-0 px-2.5 border-b border-[#223252]">Deskripsi</th>
                <th className="pb-2 pt-0 px-2.5 border-b border-[#223252]">Akun</th>
                <th className="pb-2 pt-0 px-2.5 border-b border-[#223252]">Kategori</th>
                <th className="pb-2 pt-0 px-2.5 border-b border-[#223252]">Jumlah</th>
                <th className="pb-2 pt-0 px-2.5 border-b border-[#223252]"></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((t) => (
                <tr key={t.id} className="border-b border-[#223252] last:border-0 hover:bg-[#182742]">
                  <td className="px-2.5 py-2.5">{formatDate(t.date)}{t.time && <div className="text-[10px] text-[#8C9BBE]">{formatTime(t.time)}</div>}</td>
                  <td className="px-2.5 py-2.5">{t.description}</td>
                  <td className="px-2.5 py-2.5">{t.account}</td>
                  <td className="px-2.5 py-2.5"><span className={t.type === 'in' ? 'tag-in' : 'tag-out'}>{t.category}</span></td>
                  <td className={`px-2.5 py-2.5 font-bold ${t.type === 'in' ? 'text-[#34D8A6]' : 'text-[#FF6B6B]'}`}>{t.type === 'in' ? '+' : '-'}{formatRupiah(t.amount)}</td>
                  <td className="px-2.5 py-2.5">
                    <div className="flex items-center gap-2">
                      <button onClick={() => onEditTx(t)} className="text-[#8C9BBE] hover:text-[#34D8A6] transition-colors" title="Edit transaksi" aria-label="Edit transaksi">
                        <Pencil size={14} />
                      </button>
                      <button onClick={() => { if (confirm('Hapus transaksi ini?')) onDeleteTx(t.id); }} className="text-[#8C9BBE] hover:text-[#FF6B6B] transition-colors" title="Hapus transaksi" aria-label="Hapus transaksi">
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filtered.length === 0 && <EmptyState text="Tidak ada transaksi yang cocok." />}
        </div>
      </div>
    </div>
  );
}
