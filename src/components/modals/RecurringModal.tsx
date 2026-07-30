import { useState, useEffect, useMemo } from 'react';
import { Modal } from '@/components/ui/Modal';
import type { Account, Category, RecurringTransaction, TxType } from '@/lib/types';
import { RECURRING_FREQUENCIES } from '@/lib/constants';
import { todayISO } from '@/lib/format';

interface RecurringModalProps {
  open: boolean;
  onClose: () => void;
  accounts: Account[];
  categories: Category[];
  editingRec: RecurringTransaction | null;
  onSave: (rec: Omit<RecurringTransaction, 'id'> & { id?: string }) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}

export function RecurringModal({ open, onClose, accounts, categories, editingRec, onSave, onDelete }: RecurringModalProps) {
  const [type, setType] = useState<TxType>('out');
  const [desc, setDesc] = useState('');
  const [amount, setAmount] = useState('');
  const [account, setAccount] = useState('');
  const [category, setCategory] = useState('');
  const [frequency, setFrequency] = useState('monthly');
  const [nextDue, setNextDue] = useState(todayISO());
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (open) {
      if (editingRec) {
        setType(editingRec.type);
        setDesc(editingRec.description);
        setAmount(String(editingRec.amount));
        setAccount(editingRec.account);
        setCategory(editingRec.category);
        setFrequency(editingRec.frequency);
        setNextDue(editingRec.next_due);
      } else {
        setType('out'); setDesc(''); setAmount('');
        setAccount(accounts[0]?.name ?? '');
        setFrequency('monthly');
        setNextDue(todayISO());
        setCategory('');
      }
    }
  }, [open, editingRec, accounts]);

  const filteredCategories = useMemo(() => categories.filter((c) => c.type === type), [categories, type]);
  useEffect(() => {
    if (filteredCategories.length > 0 && !filteredCategories.find((c) => c.name === category)) {
      setCategory(filteredCategories[0].name);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filteredCategories]);

  const handleSave = async () => {
    if (!desc || !amount || !account || !category) return;
    setSaving(true);
    await onSave({
      id: editingRec?.id,
      type, description: desc, amount: parseFloat(amount),
      account, category, frequency,
      next_due: nextDue, active: editingRec?.active ?? true,
    });
    setSaving(false);
    onClose();
  };

  const handleDelete = async () => {
    if (!editingRec) return;
    setSaving(true);
    await onDelete(editingRec.id);
    setSaving(false);
    onClose();
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={editingRec ? 'Edit Transaksi Berulang' : 'Tambah Transaksi Berulang'}
      footer={
        <>
          <button onClick={onClose} className="btn-secondary flex-1 max-md:w-full">Batal</button>
          {editingRec && <button onClick={handleDelete} disabled={saving} className="btn-danger flex-1 max-md:w-full">Hapus</button>}
          <button onClick={handleSave} disabled={saving || !desc || !amount} className="btn-primary flex-1 max-md:w-full">
            {saving ? 'Menyimpan...' : 'Simpan'}
          </button>
        </>
      }
    >
      <div className="flex gap-2 mb-3.5">
        <button onClick={() => setType('in')} className={`flex-1 text-center py-2.5 rounded-[9px] border font-bold text-sm cursor-pointer transition-all ${type === 'in' ? 'bg-[#1C5B49] text-[#34D8A6] border-[#34D8A6]' : 'border-[#223252] text-[#8C9BBE]'}`}>Pemasukan</button>
        <button onClick={() => setType('out')} className={`flex-1 text-center py-2.5 rounded-[9px] border font-bold text-sm cursor-pointer transition-all ${type === 'out' ? 'bg-[#5A2A2E] text-[#FF6B6B] border-[#FF6B6B]' : 'border-[#223252] text-[#8C9BBE]'}`}>Pengeluaran</button>
      </div>
      <div className="mb-3.5">
        <label className="label-base">Deskripsi</label>
        <input value={desc} onChange={(e) => setDesc(e.target.value)} placeholder="Langganan Netflix, Cicilan motor..." className="input-base" />
      </div>
      <div className="mb-3.5">
        <label className="label-base">Jumlah (Rp)</label>
        <input type="number" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="0" min="0" className="input-base" />
      </div>
      <div className="mb-3.5">
        <label className="label-base">Akun</label>
        <select value={account} onChange={(e) => setAccount(e.target.value)} className="input-base">
          {accounts.map((a) => <option key={a.id} value={a.name}>{a.name}</option>)}
        </select>
      </div>
      <div className="mb-3.5">
        <label className="label-base">Kategori</label>
        <select value={category} onChange={(e) => setCategory(e.target.value)} className="input-base">
          {filteredCategories.map((c) => <option key={c.id} value={c.name}>{c.name}</option>)}
        </select>
      </div>
      <div className="flex gap-2 mb-3.5">
        <div className="flex-1">
          <label className="label-base">Frekuensi</label>
          <select value={frequency} onChange={(e) => setFrequency(e.target.value)} className="input-base">
            {Object.entries(RECURRING_FREQUENCIES).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
          </select>
        </div>
        <div className="flex-1">
          <label className="label-base">Jatuh Tempo Berikutnya</label>
          <input type="date" value={nextDue} onChange={(e) => setNextDue(e.target.value)} className="input-base" />
        </div>
      </div>
    </Modal>
  );
}
