import { useState, useEffect } from 'react';
import { Modal } from '@/components/ui/Modal';
import type { Account, Cicilan } from '@/lib/types';
import { CICILAN_TYPES } from '@/lib/constants';

interface CicilanModalProps {
  open: boolean;
  onClose: () => void;
  accounts: Account[];
  editingCic: Cicilan | null;
  onSave: (cic: Omit<Cicilan, 'id'> & { id?: string }) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}

export function CicilanModal({ open, onClose, accounts, editingCic, onSave, onDelete }: CicilanModalProps) {
  const [name, setName] = useState('');
  const [type, setType] = useState('lainnya');
  const [totalDebt, setTotalDebt] = useState('');
  const [monthlyPayment, setMonthlyPayment] = useState('');
  const [dueDay, setDueDay] = useState('15');
  const [accountId, setAccountId] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (open) {
      if (editingCic) {
        setName(editingCic.name);
        setType(editingCic.type);
        setTotalDebt(String(editingCic.total_debt));
        setMonthlyPayment(String(editingCic.monthly_payment));
        setDueDay(String(editingCic.due_day));
        setAccountId(editingCic.account_id ?? '');
      } else {
        setName(''); setType('lainnya');
        setTotalDebt(''); setMonthlyPayment('');
        setDueDay('15'); setAccountId('');
      }
    }
  }, [open, editingCic]);

  const handleSave = async () => {
    if (!name) return;
    setSaving(true);
    await onSave({
      id: editingCic?.id,
      name, type,
      total_debt: parseFloat(totalDebt) || 0,
      monthly_payment: parseFloat(monthlyPayment) || 0,
      due_day: parseInt(dueDay) || 15,
      account_id: accountId || null,
    });
    setSaving(false);
    onClose();
  };

  const handleDelete = async () => {
    if (!editingCic) return;
    setSaving(true);
    await onDelete(editingCic.id);
    setSaving(false);
    onClose();
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={editingCic ? 'Edit Cicilan' : 'Tambah Cicilan/Pinjaman'}
      footer={
        <>
          <button onClick={onClose} className="btn-secondary flex-1 max-md:w-full">Batal</button>
          {editingCic && <button onClick={handleDelete} disabled={saving} className="btn-danger flex-1 max-md:w-full">Hapus</button>}
          <button onClick={handleSave} disabled={saving || !name} className="btn-primary flex-1 max-md:w-full">
            {saving ? 'Menyimpan...' : 'Simpan'}
          </button>
        </>
      }
    >
      <div className="mb-3.5">
        <label className="label-base">Nama</label>
        <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Kartu Kredit BCA, PayLater Shopee..." className="input-base" />
      </div>
      <div className="mb-3.5">
        <label className="label-base">Tipe</label>
        <select value={type} onChange={(e) => setType(e.target.value)} className="input-base">
          {Object.entries(CICILAN_TYPES).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
        </select>
      </div>
      <div className="flex gap-2 mb-3.5">
        <div className="flex-1">
          <label className="label-base">Total Hutang (Rp)</label>
          <input type="number" value={totalDebt} onChange={(e) => setTotalDebt(e.target.value)} placeholder="0" min="0" className="input-base" />
        </div>
        <div className="flex-1">
          <label className="label-base">Cicilan/Bulan (Rp)</label>
          <input type="number" value={monthlyPayment} onChange={(e) => setMonthlyPayment(e.target.value)} placeholder="0" min="0" className="input-base" />
        </div>
      </div>
      <div className="flex gap-2 mb-3.5">
        <div className="flex-1">
          <label className="label-base">Jatuh Tempo (tgl)</label>
          <input type="number" value={dueDay} onChange={(e) => setDueDay(e.target.value)} min="1" max="31" className="input-base" />
        </div>
        <div className="flex-1">
          <label className="label-base">Akun Pembayaran</label>
          <select value={accountId} onChange={(e) => setAccountId(e.target.value)} className="input-base">
            <option value="">— Pilih akun —</option>
            {accounts.map((a) => <option key={a.id} value={a.id}>{a.name}</option>)}
          </select>
        </div>
      </div>
    </Modal>
  );
}
