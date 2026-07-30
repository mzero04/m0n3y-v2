import { useState, useEffect, useMemo } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Calculator } from '@/components/ui/Calculator';
import type { Account, Category, Transaction, TxType } from '@/lib/types';
import { todayISO, nowTime } from '@/lib/format';

interface TxModalProps {
  open: boolean;
  onClose: () => void;
  accounts: Account[];
  categories: Category[];
  editingTx: Transaction | null;
  onSave: (tx: Omit<Transaction, 'id'> & { id?: string }) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
  onAddCategory: () => void;
}

export function TxModal({
  open, onClose, accounts, categories, editingTx, onSave, onDelete, onAddCategory,
}: TxModalProps) {
  const [type, setType] = useState<TxType>('in');
  const [desc, setDesc] = useState('');
  const [amount, setAmount] = useState('');
  const [account, setAccount] = useState('');
  const [category, setCategory] = useState('');
  const [date, setDate] = useState(todayISO());
  const [time, setTime] = useState(nowTime());
  const [calcOpen, setCalcOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (open) {
      if (editingTx) {
        setType(editingTx.type);
        setDesc(editingTx.description);
        setAmount(String(editingTx.amount));
        setAccount(editingTx.account);
        setCategory(editingTx.category);
        setDate(editingTx.date);
        setTime(editingTx.time ?? '');
      } else {
        setType('in');
        setDesc('');
        setAmount('');
        setAccount(accounts[0]?.name ?? '');
        setDate(todayISO());
        setTime(nowTime());
        setCategory('');
      }
    }
  }, [open, editingTx, accounts]);

  const filteredCategories = useMemo(() => categories.filter((c) => c.type === type), [categories, type]);

  useEffect(() => {
    if (filteredCategories.length > 0) {
      setCategory((prev) => {
        const stillValid = filteredCategories.find((c) => c.name === prev);
        return stillValid ? prev : filteredCategories[0].name;
      });
    }
  }, [filteredCategories, open]);

  const effectiveCategory = category && filteredCategories.find((c) => c.name === category)
    ? category
    : filteredCategories[0]?.name ?? '';
  const effectiveAccount = account || accounts[0]?.name || '';

  const handleSave = async () => {
    if (!desc || !amount || !effectiveAccount || !effectiveCategory) {
      alert('Mohon lengkapi deskripsi, jumlah, akun, dan kategori.');
      return;
    }
    setSaving(true);
    try {
      await onSave({
        id: editingTx?.id,
        type, description: desc, amount: parseFloat(amount),
        account: effectiveAccount, category: effectiveCategory,
        date, time: time || null,
      });
      onClose();
    } catch (e) {
      alert('Gagal menyimpan transaksi: ' + (e instanceof Error ? e.message : 'Terjadi kesalahan'));
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!editingTx) return;
    setSaving(true);
    await onDelete(editingTx.id);
    setSaving(false);
    onClose();
  };

  return (
    <>
      <Modal
        open={open}
        onClose={onClose}
        title={editingTx ? 'Edit Transaksi' : 'Tambah Transaksi'}
        footer={
          <>
            <button onClick={onClose} className="btn-secondary flex-1 max-md:w-full">Batal</button>
            {editingTx && (
              <button onClick={handleDelete} disabled={saving} className="btn-danger flex-1 max-md:w-full">
                Hapus
              </button>
            )}
            <button onClick={handleSave} disabled={saving || !desc || !amount} className="btn-primary flex-1 max-md:w-full">
              {saving ? 'Menyimpan...' : 'Simpan'}
            </button>
          </>
        }
      >
        <div className="flex gap-2 mb-3.5">
          <button
            onClick={() => setType('in')}
            className={`flex-1 text-center py-2.5 rounded-[9px] border font-bold text-sm cursor-pointer transition-all
              ${type === 'in' ? 'bg-[#1C5B49] text-[#34D8A6] border-[#34D8A6]' : 'border-[#223252] text-[#8C9BBE]'}`}
          >Pemasukan</button>
          <button
            onClick={() => setType('out')}
            className={`flex-1 text-center py-2.5 rounded-[9px] border font-bold text-sm cursor-pointer transition-all
              ${type === 'out' ? 'bg-[#5A2A2E] text-[#FF6B6B] border-[#FF6B6B]' : 'border-[#223252] text-[#8C9BBE]'}`}
          >Pengeluaran</button>
        </div>

        <div className="mb-3.5">
          <label className="label-base">Deskripsi</label>
          <input value={desc} onChange={(e) => setDesc(e.target.value)} placeholder="Gaji bulanan, Beli kopi..." className="input-base" />
        </div>

        <div className="flex gap-2 mb-3.5">
          <div className="flex-1">
            <label className="label-base">Jumlah (Rp)</label>
            <input type="number" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="0" min="0" className="input-base" />
          </div>
          <button type="button" onClick={() => setCalcOpen(true)} className="self-end h-[42px] w-[44px] rounded-[9px] bg-[#0F1A2E] border border-[#223252] text-base cursor-pointer flex items-center justify-center hover:border-[#34D8A6]">
            🧮
          </button>
        </div>

        <div className="mb-3.5">
          <label className="label-base">Akun</label>
          <select value={effectiveAccount} onChange={(e) => setAccount(e.target.value)} className="input-base">
            {accounts.map((a) => <option key={a.id} value={a.name}>{a.name}</option>)}
          </select>
        </div>

        <div className="flex gap-2 mb-3.5">
          <div className="flex-1">
            <label className="label-base">Kategori</label>
            <select value={effectiveCategory} onChange={(e) => setCategory(e.target.value)} className="input-base">
              {filteredCategories.map((c) => <option key={c.id} value={c.name}>{c.name}</option>)}
            </select>
          </div>
          <button type="button" onClick={onAddCategory} className="self-end h-[42px] px-3.5 rounded-[9px] bg-[#0F1A2E] border border-[#223252] text-[#34D8A6] text-[13px] font-bold cursor-pointer whitespace-nowrap hover:border-[#34D8A6]">
            + Baru
          </button>
        </div>

        <div className="flex gap-2">
          <div className="flex-1">
            <label className="label-base">Tanggal</label>
            <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="input-base" />
          </div>
          <div className="flex-1">
            <label className="label-base">Jam</label>
            <input type="time" value={time} onChange={(e) => setTime(e.target.value)} className="input-base" />
          </div>
        </div>
      </Modal>

      {calcOpen && (
        <Calculator
          onClose={() => setCalcOpen(false)}
          onInsert={(val) => setAmount(String(val))}
        />
      )}
    </>
  );
}
