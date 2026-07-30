import { type ReactNode, useEffect } from 'react';
import { X } from 'lucide-react';

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  footer?: ReactNode;
}

export function Modal({ open, onClose, title, children, footer }: ModalProps) {
  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [open]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 bg-[rgba(5,9,18,0.75)] backdrop-blur-[3px] z-[100] flex items-center justify-center max-md:items-end"
      onClick={onClose}
    >
      <div
        className="bg-[#182742] border border-[#223252] rounded-[18px] max-md:rounded-t-[20px] max-md:rounded-b-none
                   p-7 max-md:p-5 max-md:pb-[calc(20px+env(safe-area-inset-bottom))]
                   w-[440px] max-md:w-full max-w-[92vw] max-md:max-w-full
                   max-h-[88vh] max-md:max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-[18px]">
          <h2 className="font-display text-[19px] max-md:text-[17px] font-bold">{title}</h2>
          <button onClick={onClose} className="text-[#8C9BBE] hover:text-[#FF6B6B] transition-colors">
            <X size={20} />
          </button>
        </div>
        {children}
        {footer && <div className="flex gap-2.5 mt-5 max-md:flex-col">{footer}</div>}
      </div>
    </div>
  );
}
