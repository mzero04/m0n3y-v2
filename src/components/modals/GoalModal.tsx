import { useState, useEffect } from 'react';
import { Modal } from '@/components/ui/Modal';
import type { SavingsGoal } from '@/lib/types';
import { SAVINGS_ICONS } from '@/lib/constants';
import { todayISO } from '@/lib/format';

interface GoalModalProps {
  open: boolean;
  onClose: () => void;
  editingGoal: SavingsGoal | null;
  onSave: (goal: Omit<SavingsGoal, 'id'> & { id?: string }) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}

export function GoalModal({ open, onClose, editingGoal, onSave, onDelete }: GoalModalProps) {
  const [name, setName] = useState('');
  const [icon, setIcon] = useState('🎯');
  const [targetAmount, setTargetAmount] = useState('');
  const [currentAmount, setCurrentAmount] = useState('');
  const [targetDate, setTargetDate] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (open) {
      if (editingGoal) {
        setName(editingGoal.name);
        setIcon(editingGoal.icon);
        setTargetAmount(String(editingGoal.target_amount));
        setCurrentAmount(String(editingGoal.current_amount));
        setTargetDate(editingGoal.target_date ?? '');
      } else {
        setName(''); setIcon('🎯');
        setTargetAmount(''); setCurrentAmount('');
        setTargetDate('');
      }
    }
  }, [open, editingGoal]);

  const handleSave = async () => {
    if (!name || !targetAmount) return;
    setSaving(true);
    await onSave({
      id: editingGoal?.id,
      name, icon,
      target_amount: parseFloat(targetAmount) || 0,
      current_amount: parseFloat(currentAmount) || 0,
      target_date: targetDate || null,
    });
    setSaving(false);
    onClose();
  };

  const handleDelete = async () => {
    if (!editingGoal) return;
    setSaving(true);
    await onDelete(editingGoal.id);
    setSaving(false);
    onClose();
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={editingGoal ? 'Edit Target Tabungan' : 'Tambah Target Tabungan'}
      footer={
        <>
          <button onClick={onClose} className="btn-secondary flex-1 max-md:w-full">Batal</button>
          {editingGoal && <button onClick={handleDelete} disabled={saving} className="btn-danger flex-1 max-md:w-full">Hapus</button>}
          <button onClick={handleSave} disabled={saving || !name || !targetAmount} className="btn-primary flex-1 max-md:w-full">
            {saving ? 'Menyimpan...' : 'Simpan'}
          </button>
        </>
      }
    >
      <div className="mb-3.5">
        <label className="label-base">Nama Target</label>
        <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Dana Darurat, Liburan, DP Rumah..." className="input-base" />
      </div>
      <div className="mb-3.5">
        <label className="label-base">Ikon</label>
        <div className="flex flex-wrap gap-1.5 mt-2">
          {SAVINGS_ICONS.map((ic) => (
            <button
              key={ic}
              onClick={() => setIcon(ic)}
              className={`w-10 h-10 rounded-[10px] text-lg cursor-pointer border-2 transition-all
                ${icon === ic ? 'border-[#34D8A6] bg-[#182742]' : 'border-[#223252] bg-[#0F1A2E]'}`}
            >{ic}</button>
          ))}
        </div>
      </div>
      <div className="flex gap-2 mb-3.5">
        <div className="flex-1">
          <label className="label-base">Target (Rp)</label>
          <input type="number" value={targetAmount} onChange={(e) => setTargetAmount(e.target.value)} placeholder="0" min="0" className="input-base" />
        </div>
        <div className="flex-1">
          <label className="label-base">Saat Ini (Rp)</label>
          <input type="number" value={currentAmount} onChange={(e) => setCurrentAmount(e.target.value)} placeholder="0" min="0" className="input-base" />
        </div>
      </div>
      <div>
        <label className="label-base">Target Tanggal (opsional)</label>
        <input type="date" value={targetDate} onChange={(e) => setTargetDate(e.target.value)} min={todayISO()} className="input-base" />
      </div>
    </Modal>
  );
}
