import { type ReactNode } from 'react';
import { X } from 'lucide-react';

interface SheetProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
}

export function Sheet({ open, onClose, title, children }: SheetProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[500] flex flex-col justify-end" onClick={onClose}>
      <div className="absolute inset-0 bg-[rgba(5,9,18,0.7)] backdrop-blur-[3px]" />
      <div
        className="relative bg-[#182742] rounded-t-[20px] border border-[#223252]
                   p-6 pb-8 z-1 max-h-[80vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="w-9 h-1 rounded bg-[#223252] mx-auto mb-5" />
        {title && <h3 className="font-bold text-[15px] mb-3.5">{title}</h3>}
        {children}
      </div>
    </div>
  );
}

interface DrawerProps {
  open: boolean;
  onClose: () => void;
  children: ReactNode;
}

export function Drawer({ open, onClose, children }: DrawerProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[500] flex flex-col justify-end md:hidden" onClick={onClose}>
      <div className="absolute inset-0 bg-[rgba(5,9,18,0.7)] backdrop-blur-[3px]" />
      <div
        className="relative bg-[#182742] rounded-t-[20px] border border-[#223252]
                   p-6 pb-8 z-1"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="w-9 h-1 rounded bg-[#223252] mx-auto mb-5" />
        {children}
      </div>
    </div>
  );
}

export function CloseButton({ onClose }: { onClose: () => void }) {
  return (
    <button onClick={onClose} className="self-end text-[#8C9BBE]">
      <X size={20} />
    </button>
  );
}
