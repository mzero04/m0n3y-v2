import { useState, useEffect, useMemo } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Calculator } from '@/components/ui/Calculator';
import type { Category, Budget } from '@/lib/types';

interface BudgetModalProps {
  open: boolean;
  onClose: () => void;
  categories: Category[];
  budgets: Budget[];
  editCategory: string | null;
  onSave: (category: string, amount: number) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
  onAddCategory: () => void;
}

export function BudgetModal({ open, onClose, categories, budgets, editCategory, onSave, onDelete, onAddCategory }: BudgetModalProps) {
  const [category, setCategory] = useState('');
  const [amount, setAmount] = useState('');
  const [calcOpen, setCalcOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  const outCategories = useMemo(() => categories.filter((c) => c.type === 'out'), [categories]);

  useEffect(() => {
    if (open && outCategories.length > 0) {
      setCategory(editCategory ?? outCategories[0].name);
      setAmount('');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, editCategory]);

  const editingBudget = budgets.find((b) => b.category === category);
  useEffect(() => {
    if (editingBudget) {
      setAmount(String(editingBudget.amount));
    }
  }, [editingBudget]);

  const handleSave = async () => {
    if (!category || !amount) return;
    setSaving(true);
    await onSave(category, parseFloat(amount));
    setSaving(false);
    onClose();
  };

  const handleDelete = async () => {
    if (!editingBudget) return;
    setSaving(true);
    await onDelete(editingBudget.id);
    setSaving(false);
    onClose();
  };

  return (
    <>
      <Modal
        open={open}
        onClose={onClose}
        title={editCategory ? 'Edit Budget' : 'Atur Budget Kategori'}
        footer={
          <>
            <button onClick={onClose} className="btn-secondary flex-1 max-md:w-full">Batal</button>
            {editingBudget && <button onClick={handleDelete} disabled={saving} className="btn-danger flex-1 max-md:w-full">Hapus</button>}
            <button onClick={handleSave} disabled={saving || !amount} className="btn-primary flex-1 max-md:w-full">
              {saving ? 'Menyimpan...' : 'Simpan'}
            </button>
          </>
        }
      >
        <div className="flex gap-2 mb-3.5">
          <div className="flex-1">
            <label className="label-base">Kategori</label>
            <select value={category} onChange={(e) => setCategory(e.target.value)} className="input-base">
              {outCategories.map((c) => <option key={c.id} value={c.name}>{c.name}</option>)}
            </select>
          </div>
          <button type="button" onClick={onAddCategory} className="self-end h-[42px] px-3.5 rounded-[9px] bg-[#0F1A2E] border border-[#223252] text-[#34D8A6] text-[13px] font-bold cursor-pointer whitespace-nowrap hover:border-[#34D8A6]">
            + Baru
          </button>
        </div>
        <div className="flex gap-2">
          <div className="flex-1">
            <label className="label-base">Batas Bulanan (Rp)</label>
            <input type="number" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="0" min="0" className="input-base" />
          </div>
          <button type="button" onClick={() => setCalcOpen(true)} className="self-end h-[42px] w-[44px] rounded-[9px] bg-[#0F1A2E] border border-[#223252] text-base cursor-pointer flex items-center justify-center hover:border-[#34D8A6]">
            🧮
          </button>
        </div>
      </Modal>
      {calcOpen && <Calculator onClose={() => setCalcOpen(false)} onInsert={(val) => setAmount(String(val))} />}
    </>
  );
}
