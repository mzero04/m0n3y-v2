import { useState, useEffect } from 'react';
import { Modal } from '@/components/ui/Modal';
import type { Account } from '@/lib/types';
import { ACCOUNT_COLORS, ACCOUNT_TYPES } from '@/lib/constants';
import { generateId } from '@/lib/format';

interface AccountModalProps {
  open: boolean;
  onClose: () => void;
  editingAcc: Account | null;
  onSave: (acc: Account) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}

export function AccountModal({ open, onClose, editingAcc, onSave, onDelete }: AccountModalProps) {
  const [name, setName] = useState('');
  const [type, setType] = useState('Tabungan');
  const [colorId, setColorId] = useState('gold');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (open) {
      if (editingAcc) {
        setName(editingAcc.name);
        setType(editingAcc.type);
        setColorId(editingAcc.color_id);
      } else {
        setName('');
        setType('Tabungan');
        setColorId('gold');
      }
    }
  }, [open, editingAcc]);

  const handleSave = async () => {
    if (!name) return;
    setSaving(true);
    await onSave({
      id: editingAcc?.id ?? generateId(),
      name, type, color_id: colorId,
      sort_order: editingAcc?.sort_order ?? 0,
    });
    setSaving(false);
    onClose();
  };

  const handleDelete = async () => {
    if (!editingAcc) return;
    setSaving(true);
    await onDelete(editingAcc.id);
    setSaving(false);
    onClose();
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={editingAcc ? 'Edit Akun' : 'Tambah Akun'}
      footer={
        <>
          <button onClick={onClose} className="btn-secondary flex-1 max-md:w-full">Batal</button>
          {editingAcc && <button onClick={handleDelete} disabled={saving} className="btn-danger flex-1 max-md:w-full">Hapus</button>}
          <button onClick={handleSave} disabled={saving || !name} className="btn-primary flex-1 max-md:w-full">
            {saving ? 'Menyimpan...' : 'Simpan'}
          </button>
        </>
      }
    >
      <div className="mb-3.5">
        <label className="label-base">Nama Akun</label>
        <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Mandiri, Dana, OVO..." className="input-base" />
      </div>
      <div className="mb-3.5">
        <label className="label-base">Tipe Akun</label>
        <select value={type} onChange={(e) => setType(e.target.value)} className="input-base">
          {ACCOUNT_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
        </select>
      </div>
      <div>
        <label className="label-base">Warna</label>
        <div className="grid grid-cols-5 gap-2 mt-2">
          {Object.entries(ACCOUNT_COLORS).map(([id, c]) => (
            <button
              key={id}
              onClick={() => setColorId(id)}
              className={`h-9.5 rounded-lg cursor-pointer border-2 transition-all relative flex items-center justify-center
                ${colorId === id ? 'border-white shadow-[0_0_0_2px_#34D8A6]' : 'border-transparent'}`}
              style={{ background: c.bg, height: '38px' }}
            >
              {colorId === id && <span className="font-extrabold text-sm" style={{ color: c.text }}>✓</span>}
            </button>
          ))}
        </div>
      </div>
    </Modal>
  );
}
