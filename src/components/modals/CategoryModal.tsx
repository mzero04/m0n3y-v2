import { useState, useEffect } from 'react';
import { Modal } from '@/components/ui/Modal';
import type { Category, TxType } from '@/lib/types';

interface CategoryModalProps {
  open: boolean;
  onClose: () => void;
  defaultType?: TxType;
  onSave: (type: TxType, name: string) => Promise<boolean>;
}

export function CategoryModal({ open, onClose, defaultType = 'out', onSave }: CategoryModalProps) {
  const [type, setType] = useState<TxType>(defaultType);
  const [name, setName] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (open) {
      setType(defaultType);
      setName('');
      setError('');
    }
  }, [open, defaultType]);

  const handleSave = async () => {
    if (!name) return;
    setSaving(true);
    setError('');
    const success = await onSave(type, name);
    setSaving(false);
    if (success) {
      onClose();
    } else {
      setError('Kategori dengan nama ini sudah ada.');
    }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Tambah Kategori"
      footer={
        <>
          <button onClick={onClose} className="btn-secondary flex-1 max-md:w-full">Batal</button>
          <button onClick={handleSave} disabled={saving || !name} className="btn-primary flex-1 max-md:w-full">
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
        <label className="label-base">Nama Kategori</label>
        <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Misal: Hobi, Donasi..." className="input-base" />
      </div>
      {error && <div className="text-[#FF6B6B] text-xs mb-2">{error}</div>}
    </Modal>
  );
}
