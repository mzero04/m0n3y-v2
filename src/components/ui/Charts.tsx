import { useEffect, useRef, useState } from 'react';

interface TrendChartProps {
  data: { label: string; income: number; expense: number }[];
}

export function TrendChart({ data }: TrendChartProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState({ width: 720, height: 280 });

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const ro = new ResizeObserver((entries) => {
      const cr = entries[0].contentRect;
      setSize({ width: Math.max(cr.width, 240), height: Math.max(cr.height, 180) });
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const { width, height } = size;
  const padding = { top: 28, right: 16, bottom: 30, left: 52 };
  const chartW = Math.max(width - padding.left - padding.right, 10);
  const chartH = Math.max(height - padding.top - padding.bottom, 10);

  const maxVal = Math.max(...data.flatMap((d) => [d.income, d.expense]), 1);
  const slot = chartW / data.length;
  const barWidth = Math.min(slot * 0.32, 26);
  const gap = slot * 0.05;
  const fontSize = Math.max(8, Math.min(11, slot * 0.16));

  const fmt = (val: number) =>
    val >= 1_000_000 ? `${(val / 1_000_000).toFixed(val % 1_000_000 === 0 ? 0 : 1)}jt`
    : val >= 1000 ? `${(val / 1000).toFixed(0)}rb` : `${val}`;

  return (
    <div ref={containerRef} className="w-full h-full">
      <svg viewBox={`0 0 ${width} ${height}`} width={width} height={height} className="block">
        <defs>
          <linearGradient id="grad-income" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#34D8A6" />
            <stop offset="100%" stopColor="#1ea87c" />
          </linearGradient>
          <linearGradient id="grad-expense" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#FF6B6B" />
            <stop offset="100%" stopColor="#e04f4f" />
          </linearGradient>
        </defs>
        {[0, 0.25, 0.5, 0.75, 1].map((p) => {
          const y = padding.top + chartH * (1 - p);
          const val = Math.round(maxVal * p);
          return (
            <g key={p}>
              <line x1={padding.left} y1={y} x2={width - padding.right} y2={y} stroke="#223252" strokeWidth="0.5" strokeDasharray={p === 0 ? '0' : '3 3'} />
              <text x={padding.left - 8} y={y + fontSize / 3} fill="#8C9BBE" fontSize={fontSize} textAnchor="end">{fmt(val)}</text>
            </g>
          );
        })}
        {data.map((d, i) => {
          const centerX = padding.left + i * slot + slot / 2;
          const incomeH = (d.income / maxVal) * chartH;
          const expenseH = (d.expense / maxVal) * chartH;
          const incomeX = centerX - barWidth - gap / 2;
          const expenseX = centerX + gap / 2;
          return (
            <g key={i}>
              <rect x={incomeX} y={padding.top + chartH - incomeH} width={barWidth} height={incomeH} fill="url(#grad-income)" rx="3" opacity="0.92" />
              <rect x={expenseX} y={padding.top + chartH - expenseH} width={barWidth} height={expenseH} fill="url(#grad-expense)" rx="3" opacity="0.92" />
              <text x={centerX} y={height - padding.bottom + 18} fill="#8C9BBE" fontSize={fontSize} textAnchor="middle">{d.label}</text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}

interface DonutChartProps {
  data: { label: string; value: number; color: string }[];
}

export function DonutChart({ data }: DonutChartProps) {
  const total = data.reduce((s, d) => s + d.value, 0);
  if (total === 0 || data.length === 0) {
    return <div className="flex items-center justify-center h-full text-[#8C9BBE] text-sm">Belum ada data</div>;
  }

  const radius = 70;
  const circumference = 2 * Math.PI * radius;
  let offset = 0;

  return (
    <div className="flex items-center justify-center h-full relative">
      <svg width="180" height="180" viewBox="0 0 180 180">
        <circle cx="90" cy="90" r={radius} fill="none" stroke="#223252" strokeWidth="20" />
        {data.map((d, i) => {
          const pct = d.value / total;
          const dash = pct * circumference;
          const circle = (
            <circle
              key={i}
              cx="90" cy="90" r={radius}
              fill="none"
              stroke={d.color}
              strokeWidth="20"
              strokeDasharray={`${dash} ${circumference - dash}`}
              strokeDashoffset={-offset}
              transform="rotate(-90 90 90)"
            />
          );
          offset += dash;
          return circle;
        })}
      </svg>
      <div className="absolute text-center">
        <div className="text-[#8C9BBE] text-xs">Total</div>
        <div className="font-display font-bold text-sm">
          {total >= 1_000_000 ? `${(total / 1_000_000).toFixed(1)}jt` : `${(total / 1000).toFixed(0)}rb`}
        </div>
      </div>
    </div>
  );
}

interface BarChartProps {
  data: { label: string; budget: number; spent: number }[];
}

export function BudgetBarChart({ data }: BarChartProps) {
  const width = 500;
  const height = 200;
  const padding = { top: 15, right: 15, bottom: 40, left: 60 };
  const chartW = width - padding.left - padding.right;
  const chartH = height - padding.top - padding.bottom;
  const maxVal = Math.max(...data.flatMap((d) => [d.budget, d.spent]), 1);
  const barWidth = chartW / data.length / 3;

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-full">
      {[0, 0.5, 1].map((p) => {
        const y = padding.top + chartH * (1 - p);
        return (
          <g key={p}>
            <line x1={padding.left} y1={y} x2={width - padding.right} y2={y} stroke="#223252" strokeWidth="0.5" />
            <text x={padding.left - 8} y={y + 4} fill="#8C9BBE" fontSize="9" textAnchor="end">
              {Math.round(maxVal * p / 1000)}rb
            </text>
          </g>
        );
      })}
      {data.map((d, i) => {
        const x = padding.left + (i / data.length) * chartW + barWidth / 2;
        const budgetH = (d.budget / maxVal) * chartH;
        const spentH = (d.spent / maxVal) * chartH;
        const label = d.label.length > 10 ? d.label.slice(0, 8) + '..' : d.label;
        return (
          <g key={i}>
            <rect x={x} y={padding.top + chartH - budgetH} width={barWidth} height={budgetH} fill="#223252" rx="2" />
            <rect x={x + barWidth + 2} y={padding.top + chartH - spentH} width={barWidth} height={spentH} fill={d.spent > d.budget ? '#FF6B6B' : '#34D8A6'} rx="2" />
            <text x={x + barWidth} y={height - padding.bottom + 14} fill="#8C9BBE" fontSize="8" textAnchor="middle">{label}</text>
          </g>
        );
      })}
    </svg>
  );
}

interface ProgressBarProps {
  pct: number;
  variant: 'ok' | 'warn' | 'over';
}

export function ProgressBar({ pct, variant }: ProgressBarProps) {
  const colors = {
    ok: 'from-[#34D8A6] to-[#5be8c0]',
    warn: 'from-[#F2B84B] to-[#f7d27a]',
    over: 'from-[#FF6B6B] to-[#ff9a9a]',
  };
  return (
    <div className="h-2.5 rounded-md bg-[#0F1A2E] border border-[#223252] overflow-hidden">
      <div
        className={`h-full rounded-md bg-gradient-to-r ${colors[variant]} transition-all duration-500`}
        style={{ width: `${Math.min(pct, 100)}%` }}
      />
    </div>
  );
}
