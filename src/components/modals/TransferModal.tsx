import { useState, useEffect } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Calculator } from '@/components/ui/Calculator';
import type { Account, Transfer } from '@/lib/types';
import { todayISO, nowTime } from '@/lib/format';

interface TransferModalProps {
  open: boolean;
  onClose: () => void;
  accounts: Account[];
  editingTr: Transfer | null;
  onSave: (tr: Omit<Transfer, 'id'> & { id?: string }) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}

export function TransferModal({ open, onClose, accounts, editingTr, onSave, onDelete }: TransferModalProps) {
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [amount, setAmount] = useState('');
  const [note, setNote] = useState('');
  const [date, setDate] = useState(todayISO());
  const [time, setTime] = useState(nowTime());
  const [calcOpen, setCalcOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (open) {
      if (editingTr) {
        setFrom(editingTr.from_account);
        setTo(editingTr.to_account);
        setAmount(String(editingTr.amount));
        setNote(editingTr.note ?? '');
        setDate(editingTr.date);
        setTime(editingTr.time ?? '');
      } else {
        setFrom(accounts[0]?.name ?? '');
        setTo(accounts[1]?.name ?? accounts[0]?.name ?? '');
        setAmount('');
        setNote('');
        setDate(todayISO());
        setTime(nowTime());
      }
    }
  }, [open, editingTr, accounts]);

  const handleSave = async () => {
    if (!from || !to || !amount || from === to) return;
    setSaving(true);
    await onSave({
      id: editingTr?.id,
      from_account: from, to_account: to,
      amount: parseFloat(amount), note: note || null,
      date, time: time || null,
    });
    setSaving(false);
    onClose();
  };

  const handleDelete = async () => {
    if (!editingTr) return;
    setSaving(true);
    await onDelete(editingTr.id);
    setSaving(false);
    onClose();
  };

  return (
    <>
      <Modal
        open={open}
        onClose={onClose}
        title={editingTr ? 'Edit Transfer' : 'Transfer Antar Akun'}
        footer={
          <>
            <button onClick={onClose} className="btn-secondary flex-1 max-md:w-full">Batal</button>
            {editingTr && (
              <button onClick={handleDelete} disabled={saving} className="btn-danger flex-1 max-md:w-full">Hapus</button>
            )}
            <button onClick={handleSave} disabled={saving || !amount || from === to} className="btn-violet flex-1 max-md:w-full">
              {saving ? 'Memproses...' : 'Transfer'}
            </button>
          </>
        }
      >
        <div className="flex items-end gap-2.5 mb-3.5 max-md:flex-col max-md:gap-2">
          <div className="flex-1 max-md:w-full">
            <label className="label-base">Dari Akun</label>
            <select value={from} onChange={(e) => setFrom(e.target.value)} className="input-base">
              {accounts.map((a) => <option key={a.id} value={a.name}>{a.name}</option>)}
            </select>
          </div>
          <div className="text-[#9B8CFF] text-xl pb-2.5 flex-shrink-0 max-md:hidden">⇄</div>
          <div className="flex-1 max-md:w-full">
            <label className="label-base">Ke Akun</label>
            <select value={to} onChange={(e) => setTo(e.target.value)} className="input-base">
              {accounts.map((a) => <option key={a.id} value={a.name}>{a.name}</option>)}
            </select>
          </div>
        </div>

        {from === to && from !== '' && (
          <div className="text-[#FF6B6B] text-xs mb-3.5">Akun asal dan tujuan tidak boleh sama.</div>
        )}

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
          <label className="label-base">Catatan (opsional)</label>
          <input value={note} onChange={(e) => setNote(e.target.value)} placeholder="Top up e-wallet..." className="input-base" />
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

      {calcOpen && <Calculator onClose={() => setCalcOpen(false)} onInsert={(val) => setAmount(String(val))} />}
    </>
  );
}
