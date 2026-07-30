import { useState } from 'react';
import { Plus, ArrowLeftRight, Receipt } from 'lucide-react';

interface FabProps {
  onAddTx: () => void;
  onTransfer: () => void;
}

export function Fab({ onAddTx, onTransfer }: FabProps) {
  const [open, setOpen] = useState(false);

  return (
    <>
      {open && (
        <div
          className="fixed inset-0 z-[43] bg-[rgba(5,9,18,0.5)] backdrop-blur-[4px] md:hidden"
          onClick={() => setOpen(false)}
        />
      )}
      <div
        className={`fixed right-[18px] bottom-[calc(86px+env(safe-area-inset-bottom))] z-[44] flex flex-col items-end gap-3 md:hidden
          ${open ? '' : ''}`}
      >
        {/* Transfer action */}
        <div
          className={`flex items-center gap-2.5 transition-all duration-200
            ${open ? 'opacity-100 translate-y-0 pointer-events-auto' : 'opacity-0 translate-y-4 scale-90 pointer-events-none'}`}
          style={{ transitionDelay: open ? '70ms' : '0ms' }}
        >
          <span className="bg-[#131F36] border border-[#223252] px-3 py-1.5 rounded-full text-[13px] font-bold text-[#EAF0FB] whitespace-nowrap shadow-lg">
            Transfer
          </span>
          <button
            onClick={() => { setOpen(false); onTransfer(); }}
            className="w-[46px] h-[46px] rounded-full border-none flex items-center justify-center cursor-pointer shadow-lg flex-shrink-0"
            style={{ background: 'linear-gradient(135deg,#7B5AF5,#9B6DFF)' }}
            aria-label="Transfer antar akun"
          >
            <ArrowLeftRight size={20} color="#fff" />
          </button>
        </div>

        {/* Transaction action */}
        <div
          className={`flex items-center gap-2.5 transition-all duration-200
            ${open ? 'opacity-100 translate-y-0 pointer-events-auto' : 'opacity-0 translate-y-4 scale-90 pointer-events-none'}`}
          style={{ transitionDelay: open ? '0ms' : '0ms' }}
        >
          <span className="bg-[#131F36] border border-[#223252] px-3 py-1.5 rounded-full text-[13px] font-bold text-[#EAF0FB] whitespace-nowrap shadow-lg">
            Transaksi
          </span>
          <button
            onClick={() => { setOpen(false); onAddTx(); }}
            className="w-[46px] h-[46px] rounded-full border-none flex items-center justify-center cursor-pointer shadow-lg flex-shrink-0"
            style={{ background: 'linear-gradient(135deg,#34D8A6,#28b98a)' }}
            aria-label="Tambah transaksi"
          >
            <Receipt size={20} color="#06281f" />
          </button>
        </div>

        {/* Main FAB */}
        <button
          onClick={() => setOpen(!open)}
          className="w-[58px] h-[58px] rounded-full border-none flex items-center justify-center cursor-pointer flex-shrink-0 transition-transform"
          style={{
            background: 'linear-gradient(135deg,#34D8A6,#28b98a)',
            boxShadow: '0 8px 24px -4px rgba(52,216,166,0.55), 0 2px 8px rgba(0,0,0,0.3)',
            transform: open ? 'rotate(45deg)' : 'rotate(0deg)',
            transition: 'transform 0.25s cubic-bezier(0.34,1.56,0.64,1)',
          }}
          aria-label="Buka aksi"
        >
          <Plus size={26} color="#06281f" strokeWidth={2.5} />
        </button>
      </div>
    </>
  );
}
