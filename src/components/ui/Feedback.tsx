interface SpinnerProps {
  text?: string;
}

export function Spinner({ text = 'Memuat...' }: SpinnerProps) {
  return (
    <div className="fixed inset-0 bg-[#0B1220] flex flex-col items-center justify-center gap-3.5 z-[999]">
      <div className="w-[34px] h-[34px] rounded-full border-[3px] border-[#223252] border-t-[#34D8A6] animate-spin" />
      <div className="text-[#8C9BBE] text-sm">{text}</div>
    </div>
  );
}

interface EmptyStateProps {
  text: string;
}

export function EmptyState({ text }: EmptyStateProps) {
  return (
    <div className="text-center py-8 px-5 text-[#8C9BBE] text-[13.5px]">{text}</div>
  );
}

interface StatusBoxProps {
  type: 'error' | 'warn' | 'success' | 'info';
  text: string;
}

export function StatusBox({ type, text }: StatusBoxProps) {
  const styles = {
    error: 'bg-[#5A2A2E] border-[#FF6B6B] text-[#ffb3b3]',
    warn: 'bg-[#5A4321] border-[#F2B84B] text-[#ffe5a0]',
    success: 'bg-[#1C5B49] border-[#34D8A6] text-[#a0ffe0]',
    info: 'bg-[#182742] border-[#223252] text-[#8C9BBE]',
  };
  return (
    <div className={`rounded-[10px] px-3.5 py-3 text-[13px] border ${styles[type]} leading-relaxed`}>
      {text}
    </div>
  );
}
