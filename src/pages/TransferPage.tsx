import { ArrowLeftRight, Pencil, Trash2 } from 'lucide-react';
import type { Transfer, Account } from '@/lib/types';
import { formatRupiah, formatDate } from '@/lib/format';
import { EmptyState } from '@/components/ui/Feedback';

interface TransferPageProps {
  transfers: Transfer[];
  accounts: Account[];
  onAddTransfer: () => void;
  onEditTransfer: (tr: Transfer) => void;
  onDeleteTransfer: (id: string) => Promise<void>;
}

export function TransferPage({ transfers, accounts, onAddTransfer, onEditTransfer, onDeleteTransfer }: TransferPageProps) {
  return (
    <div className="page-fade">
      <div className="flex justify-between items-end mb-7 gap-5 flex-wrap max-md:flex-col max-md:items-start max-md:gap-2.5 max-md:mb-4">
        <div>
          <h1 className="font-display text-[28px] max-md:text-xl font-bold tracking-tight">Transfer Antar Akun</h1>
          <p className="text-[#8C9BBE] text-sm max-md:text-[13px] mt-1">Pindahkan saldo tanpa mempengaruhi laporan</p>
        </div>
        <button onClick={onAddTransfer} className="btn-violet"><ArrowLeftRight size={16} /> Transfer Baru</button>
      </div>

      <div className="grid grid-cols-[1.4fr_1fr] gap-[18px] max-md:grid-cols-1 max-md:gap-3">
        <div className="card-base">
          <h3 className="font-display text-[15px] font-semibold mb-4">Riwayat Transfer</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-[13.5px] max-md:text-[12.5px] max-md:min-w-[480px]">
              <thead>
                <tr className="text-left text-[#8C9BBE] font-semibold text-[11.5px] uppercase tracking-wide">
                  <th className="pb-2 pt-0 px-2.5 border-b border-[#223252]">Tanggal</th>
                  <th className="pb-2 pt-0 px-2.5 border-b border-[#223252]">Dari</th>
                  <th className="pb-2 pt-0 px-2.5 border-b border-[#223252]">Ke</th>
                  <th className="pb-2 pt-0 px-2.5 border-b border-[#223252]">Catatan</th>
                  <th className="pb-2 pt-0 px-2.5 border-b border-[#223252]">Jumlah</th>
                  <th className="pb-2 pt-0 px-2.5 border-b border-[#223252]">Biaya Admin</th>
                  <th className="pb-2 pt-0 px-2.5 border-b border-[#223252]"></th>
                </tr>
              </thead>
              <tbody>
                {transfers.map((t) => (
                  <tr key={t.id} className="border-b border-[#223252] last:border-0">
                    <td className="px-2.5 py-2.5">{formatDate(t.date)}</td>
                    <td className="px-2.5 py-2.5">{t.from_account}</td>
                    <td className="px-2.5 py-2.5">{t.to_account}</td>
                    <td className="px-2.5 py-2.5 text-[#8C9BBE]">{t.note ?? '-'}</td>
                    <td className="px-2.5 py-2.5 font-bold text-[#9B8CFF]">{formatRupiah(t.amount)}</td>
                    <td className="px-2.5 py-2.5 font-semibold text-[#FF6B6B]">{t.admin_fee ? formatRupiah(t.admin_fee) : '-'}</td>
                    <td className="px-2.5 py-2.5">
                      <div className="flex items-center gap-2.5">
                        <button onClick={() => onEditTransfer(t)} className="text-[#8C9BBE] hover:text-[#34D8A6] transition-colors cursor-pointer" title="Edit transfer" aria-label="Edit transfer">
                          <Pencil size={14} />
                        </button>
                        <button onClick={() => onDeleteTransfer(t.id)} className="text-[#8C9BBE] hover:text-[#FF6B6B] transition-colors cursor-pointer" title="Hapus transfer" aria-label="Hapus transfer">
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {transfers.length === 0 && <EmptyState text="Belum ada transfer." />}
          </div>
        </div>

        <div className="card-base">
          <h3 className="font-display text-[15px] font-semibold mb-4">Cara Kerja Transfer</h3>
          <div className="bg-[#0F1A2E] border border-[#223252] rounded-xl p-4 text-[13.5px] text-[#8C9BBE] leading-7">
            Transfer memindahkan saldo antar akun. Saldo akun asal <b className="text-[#EAF0FB]">berkurang</b>, akun tujuan <b className="text-[#EAF0FB]">bertambah</b>.
            Transfer <b className="text-[#EAF0FB]">tidak muncul</b> di laporan pemasukan/pengeluaran karena uang tetap milikmu.
            Namun <b className="text-[#FF6B6B]">biaya admin</b> antar bank akan otomatis tercatat sebagai pengeluaran dengan kategori “Biaya Admin”.
          </div>
          <div className="mt-4">
            <div className="text-xs text-[#8C9BBE] font-semibold mb-2">Jumlah Akun: {accounts.length}</div>
            <div className="flex flex-wrap gap-1.5">
              {accounts.map((a) => <span key={a.id} className="tag-tr">{a.name}</span>)}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
