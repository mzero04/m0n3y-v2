import { useState, useEffect, useRef } from 'react';

interface CalculatorProps {
  onInsert: (value: number) => void;
  onClose: () => void;
}

export function Calculator({ onInsert, onClose }: CalculatorProps) {
  const [display, setDisplay] = useState('0');
  const [prev, setPrev] = useState<number | null>(null);
  const [op, setOp] = useState<string | null>(null);
  const [resetNext, setResetNext] = useState(false);
  const [pressedKey, setPressedKey] = useState<string | null>(null);
  const pressTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const inputDigit = (d: string) => {
    if (resetNext) {
      setDisplay(d);
      setResetNext(false);
    } else {
      setDisplay(display === '0' ? d : display + d);
    }
  };

  const inputDecimal = () => {
    if (resetNext) {
      setDisplay('0.');
      setResetNext(false);
    } else if (!display.includes('.')) {
      setDisplay(display + '.');
    }
  };

  const doOp = (newOp: string) => {
    const current = parseFloat(display);
    if (prev === null) {
      setPrev(current);
    } else if (op) {
      const result = compute(prev, current, op);
      setPrev(result);
      setDisplay(String(result));
    }
    setOp(newOp);
    setResetNext(true);
  };

  const compute = (a: number, b: number, op: string): number => {
    switch (op) {
      case '+': return a + b;
      case '-': return a - b;
      case '×': return a * b;
      case '÷': return b !== 0 ? a / b : 0;
      default: return b;
    }
  };

  const equals = () => {
    if (op !== null && prev !== null) {
      const current = parseFloat(display);
      const result = compute(prev, current, op);
      setDisplay(String(result));
      setPrev(null);
      setOp(null);
      setResetNext(true);
    }
  };

  const clear = () => {
    setDisplay('0');
    setPrev(null);
    setOp(null);
    setResetNext(false);
  };

  const backspace = () => {
    if (resetNext) return;
    setDisplay(display.length > 1 ? display.slice(0, -1) : '0');
  };

  const handleInsert = () => {
    onInsert(parseFloat(display) || 0);
    onClose();
  };

  const flashKey = (key: string) => {
    setPressedKey(key);
    if (pressTimer.current) clearTimeout(pressTimer.current);
    pressTimer.current = setTimeout(() => setPressedKey(null), 120);
  };

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement)?.tagName;
      if (tag === 'INPUT' || tag === 'SELECT' || tag === 'TEXTAREA') return;
      const k = e.key;
      if (/^[0-9]$/.test(k)) {
        e.preventDefault();
        inputDigit(k);
        flashKey(k);
      } else if (k === '.' || k === ',') {
        e.preventDefault();
        inputDecimal();
        flashKey('.');
      } else if (k === '+') {
        e.preventDefault();
        doOp('+');
        flashKey('+');
      } else if (k === '-') {
        e.preventDefault();
        doOp('-');
        flashKey('-');
      } else if (k === '*') {
        e.preventDefault();
        doOp('×');
        flashKey('×');
      } else if (k === '/') {
        e.preventDefault();
        doOp('÷');
        flashKey('÷');
      } else if (k === 'Enter' || k === '=') {
        e.preventDefault();
        equals();
        flashKey('=');
      } else if (k === 'Backspace') {
        e.preventDefault();
        backspace();
        flashKey('backspace');
      } else if (k === 'Escape') {
        e.preventDefault();
        onClose();
      } else if (k === 'c' || k === 'C') {
        e.preventDefault();
        clear();
        flashKey('C');
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [display, prev, op, resetNext]);

  const keyBtn = (key: string, base: string) =>
    `h-12 rounded-[10px] border text-base font-semibold cursor-pointer transition-colors ${
      pressedKey === key ? 'bg-[#223252] border-[#34D8A6]' : base
    }`;
  const numBtn = (key: string) =>
    `h-12 rounded-[10px] bg-[#0F1A2E] border border-[#223252] text-base font-semibold cursor-pointer transition-colors hover:border-[#34D8A6] ${
      pressedKey === key ? 'bg-[#223252] border-[#34D8A6]' : ''
    }`;

  return (
    <div className="fixed inset-0 bg-[rgba(5,9,18,0.75)] backdrop-blur-[3px] z-[200] flex items-center justify-center max-md:items-end" onClick={onClose}>
      <div className="bg-[#182742] border border-[#223252] rounded-[18px] p-6 w-[320px] max-md:w-full max-md:rounded-t-[20px] max-md:rounded-b-none" onClick={(e) => e.stopPropagation()}>
        <div className="bg-[#0F1A2E] border border-[#223252] rounded-[10px] p-4 text-right font-display text-[26px] font-bold mb-3.5 min-h-[34px] overflow-x-auto whitespace-nowrap">
          {display}
        </div>
        <div className="grid grid-cols-4 gap-2">
          <button onClick={clear} className={keyBtn('C', 'bg-[#0F1A2E] border-[#223252] text-[#FF6B6B] hover:border-[#34D8A6]')}>C</button>
          <button onClick={backspace} className={keyBtn('backspace', 'bg-[#0F1A2E] border-[#223252] text-[#FF6B6B] hover:border-[#34D8A6]')}>⌫</button>
          <button onClick={() => doOp('÷')} className={keyBtn('÷', 'bg-[#0F1A2E] border-[#223252] text-[#34D8A6] hover:border-[#34D8A6]')}>÷</button>
          <button onClick={() => doOp('×')} className={keyBtn('×', 'bg-[#0F1A2E] border-[#223252] text-[#34D8A6] hover:border-[#34D8A6]')}>×</button>
          {['7', '8', '9'].map((d) => (
            <button key={d} onClick={() => inputDigit(d)} className={numBtn(d)}>{d}</button>
          ))}
          <button onClick={() => doOp('-')} className={keyBtn('-', 'bg-[#0F1A2E] border-[#223252] text-[#34D8A6] hover:border-[#34D8A6]')}>-</button>
          {['4', '5', '6'].map((d) => (
            <button key={d} onClick={() => inputDigit(d)} className={numBtn(d)}>{d}</button>
          ))}
          <button onClick={() => doOp('+')} className={keyBtn('+', 'bg-[#0F1A2E] border-[#223252] text-[#34D8A6] hover:border-[#34D8A6]')}>+</button>
          {['1', '2', '3'].map((d) => (
            <button key={d} onClick={() => inputDigit(d)} className={numBtn(d)}>{d}</button>
          ))}
          <button onClick={equals} className={`h-12 rounded-[10px] bg-[#34D8A6] text-[#06281f] border border-[#34D8A6] text-base font-bold cursor-pointer row-span-2 transition-colors ${pressedKey === '=' ? 'brightness-125' : ''}`}>=</button>
          <button onClick={() => inputDigit('0')} className={`${numBtn('0')} col-span-2`}>0</button>
          <button onClick={inputDecimal} className={numBtn('.')}>.</button>
        </div>
        <p className="text-[#8C9BBE] text-[11px] text-center mt-3 hidden md:block">
          Ketik angka & operator via keyboard · Enter = · Esc untuk tutup
        </p>
        <button onClick={handleInsert} className="btn-primary w-full mt-3.5">Sisipkan</button>
      </div>
    </div>
  );
}
