import { Plus, ArrowLeftRight, Settings } from 'lucide-react';
import { useState } from 'react';
import type { Account, Transaction, Transfer, OpeningBalance } from '@/lib/types';
import { formatRupiah } from '@/lib/format';
import { ACCOUNT_COLORS } from '@/lib/constants';
import { getAccountBalance } from '@/lib/compute';
import { Modal } from '@/components/ui/Modal';

interface AccountsProps {
  accounts: Account[];
  transactions: Transaction[];
  transfers: Transfer[];
  openingBalances: OpeningBalance[];
  onAddAccount: () => void;
  onEditAccount: (acc: Account) => void;
  onTransfer: () => void;
  onSetOpeningBalance: (accountName: string, amount: number) => Promise<void>;
}

export function Accounts({
  accounts, transactions, transfers, openingBalances,
  onAddAccount, onEditAccount, onTransfer, onSetOpeningBalance,
}: AccountsProps) {
  const [obModal, setObModal] = useState(false);
  const [obAccount, setObAccount] = useState('');
  const [obAmount, setObAmount] = useState('');
  const [obSaving, setObSaving] = useState(false);

  const handleOpenOb = (accountName: string) => {
    setObAccount(accountName);
    const existing = openingBalances.find((o) => o.account === accountName);
    setObAmount(existing ? String(existing.amount) : '');
    setObModal(true);
  };

  const handleSaveOb = async () => {
    setObSaving(true);
    await onSetOpeningBalance(obAccount, parseFloat(obAmount) || 0);
    setObSaving(false);
    setObModal(false);
  };

  return (
    <div className="page-fade">
      <div className="flex justify-between items-end mb-7 gap-5 flex-wrap max-md:flex-col max-md:items-start max-md:gap-2.5 max-md:mb-4">
        <div>
          <h1 className="font-display text-[28px] max-md:text-xl font-bold tracking-tight">Akun Bank</h1>
          <p className="text-[#8C9BBE] text-sm max-md:text-[13px] mt-1">Kelola & pantau semua akunmu</p>
        </div>
        <div className="flex gap-2.5 max-md:w-full">
          <button onClick={onTransfer} className="btn-violet max-md:flex-1">⇄ Transfer</button>
          <button onClick={() => handleOpenOb(accounts[0]?.name ?? '')} className="btn-secondary max-md:flex-1"><Settings size={16} /> Saldo Awal</button>
          <button onClick={onAddAccount} className="btn-primary max-md:flex-1">+ Tambah Akun</button>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-[18px] max-md:grid-cols-1 max-md:gap-3">
        {accounts.map((acc) => {
          const color = ACCOUNT_COLORS[acc.color_id] ?? ACCOUNT_COLORS.gold;
          const balance = getAccountBalance(acc.name, transactions, transfers, openingBalances);
          return (
            <div key={acc.id} className="bg-[#131F36] border border-[#223252] rounded-2xl overflow-hidden">
              <div className="p-4 relative overflow-hidden" style={{ background: color.bg, color: color.text }}>
                <div className="absolute -right-6 -top-6 w-24 h-24 rounded-full bg-white/15" />
                <div className="relative flex justify-between items-start">
                  <div>
                    <div className="text-xs font-bold opacity-80">{acc.name}</div>
                    <span className="inline-block px-2 py-0.5 rounded-full text-[10px] font-bold bg-black/15 mt-1">{acc.type}</span>
                  </div>
                </div>
                <div className="relative font-display text-xl font-extrabold mt-5">{formatRupiah(balance)}</div>
              </div>
              <div className="flex gap-2 p-2.5 border-t border-[#223252] bg-[#0F1A2E]">
                <button onClick={() => onEditAccount(acc)} className="btn-secondary flex-1 text-xs py-2">Edit</button>
                <button onClick={() => handleOpenOb(acc.name)} className="btn-secondary flex-1 text-xs py-2">Saldo Awal</button>
              </div>
            </div>
          );
        })}
        <button onClick={onAddAccount}
          className="bg-[#131F36] border-2 border-dashed border-[#223252] rounded-2xl flex flex-col items-center justify-center gap-2.5 p-8 cursor-pointer transition-all text-[#8C9BBE] font-semibold text-sm min-h-[180px] hover:border-[#34D8A6] hover:text-[#34D8A6] hover:bg-[#182742]">
          <Plus size={28} className="opacity-50" />
          Tambah Akun Baru
        </button>
      </div>

      <Modal
        open={obModal}
        onClose={() => setObModal(false)}
        title="Atur Saldo Awal"
        footer={
          <>
            <button onClick={() => setObModal(false)} className="btn-secondary flex-1 max-md:w-full">Batal</button>
            <button onClick={handleSaveOb} disabled={obSaving} className="btn-primary flex-1 max-md:w-full">
              {obSaving ? 'Menyimpan...' : 'Simpan'}
            </button>
          </>
        }
      >
        <div className="mb-3.5">
          <label className="label-base">Akun</label>
          <select value={obAccount} onChange={(e) => setObAccount(e.target.value)} className="input-base">
            {accounts.map((a) => <option key={a.id} value={a.name}>{a.name}</option>)}
          </select>
        </div>
        <div>
          <label className="label-base">Saldo Awal (Rp)</label>
          <input type="number" value={obAmount} onChange={(e) => setObAmount(e.target.value)} placeholder="0" className="input-base" />
          <p className="text-[11.5px] text-[#8C9BBE] mt-2">Saldo awal adalah jumlah uang di akun ini sebelum kamu mulai mencatat transaksi.</p>
        </div>
      </Modal>
    </div>
  );
}
