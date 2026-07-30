import { useMemo, useState } from 'react';
import {
  Sparkles, TrendingUp, TrendingDown, AlertTriangle, CheckCircle2,
  Wallet, PiggyBank, Target, Lightbulb, Activity, ShieldCheck, ArrowRight,
} from 'lucide-react';
import type {
  Account, Transaction, Transfer, OpeningBalance, Budget, Category, Cicilan, SavingsGoal, RecurringTransaction,
} from '@/lib/types';
import { formatRupiah, formatRupiahShort, monthKey } from '@/lib/format';
import {
  getTotalBalance, getMonthlyStats, getTrendData, getBudgetProgress, getMonthlyByCategory,
} from '@/lib/compute';

interface AdvisorProps {
  accounts: Account[];
  transactions: Transaction[];
  transfers: Transfer[];
  openingBalances: OpeningBalance[];
  budgets: Budget[];
  categories: Category[];
  cicilan: Cicilan[];
  savingsGoals: SavingsGoal[];
  recurring: RecurringTransaction[];
}

type Severity = 'good' | 'warn' | 'bad';

interface Insight {
  icon: typeof TrendingUp;
  title: string;
  detail: string;
  severity: Severity;
}

interface Recommendation {
  icon: typeof Lightbulb;
  title: string;
  detail: string;
  action: string;
}

export function Advisor({
  accounts, transactions, transfers, openingBalances, budgets, cicilan, savingsGoals, recurring,
}: AdvisorProps) {
  const [activeTab, setActiveTab] = useState<'overview' | 'insights' | 'tips'>('overview');

  const analysis = useMemo(() => analyzeFinances({
    accounts, transactions, transfers, openingBalances, budgets, cicilan, savingsGoals, recurring,
  }), [accounts, transactions, transfers, openingBalances, budgets, cicilan, savingsGoals, recurring]);

  return (
    <div className="page-fade">
      <div className="flex justify-between items-end mb-6 gap-4 flex-wrap max-md:flex-col max-md:items-start max-md:gap-2 max-md:mb-4">
        <div>
          <h1 className="font-display text-[28px] max-md:text-xl font-bold tracking-tight flex items-center gap-2.5">
            <span className="inline-flex items-center justify-center w-9 h-9 max-md:w-7 max-md:h-7 rounded-xl bg-gradient-to-br from-[#34D8A6] to-[#1ea87c] text-[#0F1A2E]">
              <Sparkles size={20} />
            </span>
            Asisten AI
          </h1>
          <p className="text-[#8C9BBE] text-sm max-md:text-[13px] mt-1">Analisis cerdas & saran personal untuk keuanganmu</p>
        </div>
      </div>

      {/* Health Score */}
      <div className="card-base relative overflow-hidden">
        <div className="absolute -right-10 -top-10 w-40 h-40 rounded-full bg-[#34D8A6]/8" />
        <div className="absolute -right-4 top-8 w-24 h-24 rounded-full bg-[#34D8A6]/5" />
        <div className="relative grid grid-cols-[auto_1fr] gap-6 max-md:gap-4 items-center">
          <HealthScoreRing score={analysis.healthScore} />
          <div>
            <h3 className="font-display text-[16px] font-semibold flex items-center gap-2">
              <Activity size={18} className="text-[#34D8A6]" /> Skor Kesehatan Keuangan
            </h3>
            <p className="text-sm text-[#8C9BBE] mt-1.5 leading-relaxed">{analysis.healthVerdict}</p>
            <div className="flex flex-wrap gap-2 mt-3">
              {analysis.scoreBreakdown.map((s) => (
                <div key={s.label} className="flex items-center gap-1.5 px-2.5 py-1 bg-[#182742] rounded-md text-[11.5px] font-semibold">
                  <span className={s.color}>{s.label}</span>
                  <span className="text-[#8C9BBE]">{s.value}/100</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-4 gap-[14px] mt-[18px] max-md:grid-cols-2 max-md:gap-3">
        <QuickStat icon={Wallet} label="Saldo Total" value={formatRupiahShort(analysis.totalBalance)} color="#F2B84B" />
        <QuickStat icon={TrendingUp} label="Pemasukan (Bulan Ini)" value={formatRupiahShort(analysis.thisMonth.income)} color="#34D8A6" />
        <QuickStat icon={TrendingDown} label="Pengeluaran (Bulan Ini)" value={formatRupiahShort(analysis.thisMonth.expense)} color="#FF6B6B" />
        <QuickStat icon={PiggyBank} label="Rasio Tabungan" value={`${analysis.savingsRate.toFixed(0)}%`} color="#9B8CFF" />
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mt-[18px] p-1 bg-[#131F36] rounded-xl border border-[#223252] w-fit max-md:w-full">
        {([
          { id: 'overview', label: 'Ringkasan' },
          { id: 'insights', label: 'Insight' },
          { id: 'tips', label: 'Saran' },
        ] as const).map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2 rounded-lg text-[13px] font-semibold transition-all max-md:flex-1 ${
              activeTab === tab.id ? 'bg-[#34D8A6] text-[#0F1A2E]' : 'text-[#8C9BBE] hover:text-[#EAF0FB]'
            }`}
          >
            {tab.label}
            {tab.id === 'insights' && analysis.insights.length > 0 && (
              <span className="ml-1.5 inline-flex items-center justify-center w-4 h-4 rounded-full text-[9px] bg-current/20">
                {analysis.insights.length}
              </span>
            )}
            {tab.id === 'tips' && analysis.recommendations.length > 0 && (
              <span className="ml-1.5 inline-flex items-center justify-center w-4 h-4 rounded-full text-[9px] bg-current/20">
                {analysis.recommendations.length}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="mt-[18px]">
        {activeTab === 'overview' && (
          <OverviewTab analysis={analysis} />
        )}
        {activeTab === 'insights' && (
          <div className="grid grid-cols-2 gap-[14px] max-md:grid-cols-1 max-md:gap-3">
            {analysis.insights.length > 0 ? analysis.insights.map((ins, i) => (
              <InsightCard key={i} insight={ins} />
            )) : (
              <div className="col-span-full card-base text-center py-10">
                <CheckCircle2 size={36} className="mx-auto text-[#34D8A6] mb-3" />
                <p className="font-display font-semibold text-[15px]">Keuanganmu terlihat sehat!</p>
                <p className="text-[#8C9BBE] text-sm mt-1">Belum ada temuan yang perlu perhatian khusus. Pertahankan terus!</p>
              </div>
            )}
          </div>
        )}
        {activeTab === 'tips' && (
          <div className="space-y-3">
            {analysis.recommendations.length > 0 ? analysis.recommendations.map((rec, i) => (
              <RecommendationCard key={i} rec={rec} index={i + 1} />
            )) : (
              <div className="card-base text-center py-10">
                <Lightbulb size={36} className="mx-auto text-[#F2B84b] mb-3" />
                <p className="font-display font-semibold text-[15px]">Saatnya mulai mencatat!</p>
                <p className="text-[#8C9BBE] text-sm mt-1">Tambahkan transaksi, anggaran, dan target tabungan untuk mendapatkan saran personal.</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Components ──────────────────────────────────────────

function HealthScoreRing({ score }: { score: number }) {
  const radius = 42;
  const circ = 2 * Math.PI * radius;
  const offset = circ - (score / 100) * circ;
  const color = score >= 75 ? '#34D8A6' : score >= 50 ? '#F2B84B' : '#FF6B6B';
  return (
    <div className="relative w-[110px] h-[110px] max-md:w-[90px] max-md:h-[90px] flex-shrink-0">
      <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
        <circle cx="50" cy="50" r={radius} fill="none" stroke="#223252" strokeWidth="7" />
        <circle
          cx="50" cy="50" r={radius} fill="none" stroke={color} strokeWidth="7"
          strokeLinecap="round" strokeDasharray={circ} strokeDashoffset={offset}
          style={{ transition: 'stroke-dashoffset 0.8s ease' }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="font-display text-[28px] max-md:text-[22px] font-extrabold" style={{ color }}>{score}</span>
        <span className="text-[9px] text-[#8C9BBE] font-semibold uppercase tracking-wide">dari 100</span>
      </div>
    </div>
  );
}

function QuickStat({ icon: Icon, label, value, color }: { icon: typeof Wallet; label: string; value: string; color: string }) {
  return (
    <div className="card-base">
      <div className="flex items-center gap-2 mb-2">
        <span className="inline-flex items-center justify-center w-7 h-7 rounded-lg" style={{ background: `${color}1a`, color }}>
          <Icon size={15} />
        </span>
      </div>
      <div className="font-display text-[18px] max-md:text-[15px] font-bold tracking-tight">{value}</div>
      <div className="text-[11px] max-md:text-[10px] text-[#8C9BBE] font-semibold mt-0.5">{label}</div>
    </div>
  );
}

function InsightCard({ insight }: { insight: Insight }) {
  const colors: Record<Severity, { bg: string; border: string; icon: string }> = {
    good: { bg: 'bg-[#34D8A6]/8', border: 'border-[#34D8A6]/30', icon: 'text-[#34D8A6]' },
    warn: { bg: 'bg-[#F2B84B]/8', border: 'border-[#F2B84B]/30', icon: 'text-[#F2B84B]' },
    bad: { bg: 'bg-[#FF6B6B]/8', border: 'border-[#FF6B6B]/30', icon: 'text-[#FF6B6B]' },
  };
  const c = colors[insight.severity];
  const Icon = insight.icon;
  return (
    <div className={`rounded-2xl border p-4 ${c.bg} ${c.border}`}>
      <div className="flex items-start gap-3">
        <span className={`flex-shrink-0 ${c.icon}`}><Icon size={20} /></span>
        <div>
          <h4 className="font-display text-[14px] font-semibold">{insight.title}</h4>
          <p className="text-[12.5px] text-[#B8C5E0] mt-1 leading-relaxed">{insight.detail}</p>
        </div>
      </div>
    </div>
  );
}

function RecommendationCard({ rec, index }: { rec: Recommendation; index: number }) {
  const Icon = rec.icon;
  return (
    <div className="card-base flex items-start gap-4 max-md:gap-3">
      <span className="flex-shrink-0 inline-flex items-center justify-center w-9 h-9 rounded-xl bg-gradient-to-br from-[#9B8CFF]/30 to-[#34D8A6]/20 text-[#9B8CFF] font-display font-bold text-sm">
        {index}
      </span>
      <div className="flex-1">
        <h4 className="font-display text-[14px] font-semibold flex items-center gap-2">
          <Icon size={16} className="text-[#F2B84B]" /> {rec.title}
        </h4>
        <p className="text-[12.5px] text-[#B8C5E0] mt-1 leading-relaxed">{rec.detail}</p>
        <div className="flex items-center gap-1.5 mt-2.5 text-[12px] font-semibold text-[#34D8A6]">
          <ArrowRight size={13} /> {rec.action}
        </div>
      </div>
    </div>
  );
}

function OverviewTab({ analysis }: { analysis: AnalysisResult }) {
  return (
    <div className="grid grid-cols-2 gap-[14px] max-md:grid-cols-1 max-md:gap-3">
      {/* Spending breakdown */}
      <div className="card-base">
        <h3 className="font-display text-[15px] font-semibold mb-3 flex items-center gap-2">
          <TrendingDown size={17} className="text-[#FF6B6B]" /> Pengeluaran Terbesar Bulan Ini
        </h3>
        <div className="space-y-2.5">
          {analysis.topCategories.map((c, i) => (
            <div key={c.category}>
              <div className="flex justify-between text-[12.5px] mb-1">
                <span className="font-semibold">{i + 1}. {c.category}</span>
                <span className="text-[#8C9BBE]">{formatRupiah(c.amount)}</span>
              </div>
              <div className="h-1.5 rounded-full bg-[#223252] overflow-hidden">
                <div className="h-full rounded-full bg-gradient-to-r from-[#FF6B6B] to-[#e04f4f]" style={{ width: `${c.pct}%` }} />
              </div>
            </div>
          ))}
          {analysis.topCategories.length === 0 && (
            <p className="text-[#8C9BBE] text-xs py-4 text-center">Belum ada pengeluaran bulan ini.</p>
          )}
        </div>
      </div>

      {/* Budget status */}
      <div className="card-base">
        <h3 className="font-display text-[15px] font-semibold mb-3 flex items-center gap-2">
          <Target size={17} className="text-[#34D8A6]" /> Status Anggaran
        </h3>
        <div className="space-y-2.5">
          {analysis.budgetStatus.map((b) => (
            <div key={b.category} className="flex items-center justify-between text-[12.5px]">
              <span className="font-semibold flex items-center gap-1.5">
                {b.over ? <AlertTriangle size={13} className="text-[#FF6B6B]" /> : <CheckCircle2 size={13} className="text-[#34D8A6]" />}
                {b.category}
              </span>
              <span className={b.over ? 'text-[#FF6B6B] font-bold' : 'text-[#8C9BBE]'}>
                {formatRupiahShort(b.spent)} / {formatRupiahShort(b.budget)}
              </span>
            </div>
          ))}
          {analysis.budgetStatus.length === 0 && (
            <p className="text-[#8C9BBE] text-xs py-4 text-center">Belum ada anggaran. Buat di halaman Anggaran.</p>
          )}
        </div>
      </div>

      {/* Trend */}
      <div className="card-base col-span-2 max-md:col-span-1">
        <h3 className="font-display text-[15px] font-semibold mb-3 flex items-center gap-2">
          <TrendingUp size={17} className="text-[#34D8A6]" /> Tren 3 Bulan Terakhir
        </h3>
        <div className="grid grid-cols-3 gap-3">
          {analysis.last3Months.map((m) => (
            <div key={m.label} className="bg-[#182742] rounded-xl p-3 text-center">
              <div className="text-[11px] text-[#8C9BBE] font-semibold uppercase">{m.label}</div>
              <div className="font-display text-[16px] font-bold mt-1.5" style={{ color: m.net >= 0 ? '#34D8A6' : '#FF6B6B' }}>
                {m.net >= 0 ? '+' : ''}{formatRupiahShort(m.net)}
              </div>
              <div className="text-[10px] text-[#8C9BBE] mt-1">
                <span className="text-[#34D8A6]">+{formatRupiahShort(m.income)}</span> · <span className="text-[#FF6B6B]">-{formatRupiahShort(m.expense)}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Goals & obligations */}
      <div className="card-base col-span-2 max-md:col-span-1">
        <h3 className="font-display text-[15px] font-semibold mb-3 flex items-center gap-2">
          <ShieldCheck size={17} className="text-[#9B8CFF]" /> Target & Kewajiban
        </h3>
        <div className="grid grid-cols-2 gap-3 max-md:grid-cols-1">
          <div className="bg-[#182742] rounded-xl p-3.5">
            <div className="text-[11px] text-[#8C9BBE] font-semibold uppercase">Target Tabungan</div>
            <div className="font-display text-[17px] font-bold mt-1.5">{analysis.goalsSummary.active} aktif</div>
            <div className="text-[11px] text-[#8C9BBE] mt-1">
              Total {formatRupiahShort(analysis.goalsSummary.totalTarget)} · Tercapai {analysis.goalsSummary.avgProgress.toFixed(0)}%
            </div>
          </div>
          <div className="bg-[#182742] rounded-xl p-3.5">
            <div className="text-[11px] text-[#8C9BBE] font-semibold uppercase">Cicilan Aktif</div>
            <div className="font-display text-[17px] font-bold mt-1.5">{analysis.cicilanSummary.count} cicilan</div>
            <div className="text-[11px] text-[#8C9BBE] mt-1">
              Bulanan {formatRupiahShort(analysis.cicilanSummary.monthlyTotal)}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Analysis engine ─────────────────────────────────────

interface AnalysisResult {
  healthScore: number;
  healthVerdict: string;
  scoreBreakdown: { label: string; value: number; color: string }[];
  totalBalance: number;
  thisMonth: { income: number; expense: number; net: number };
  savingsRate: number;
  topCategories: { category: string; amount: number; pct: number }[];
  budgetStatus: { category: string; spent: number; budget: number; over: boolean }[];
  last3Months: { label: string; income: number; expense: number; net: number }[];
  goalsSummary: { active: number; totalTarget: number; avgProgress: number };
  cicilanSummary: { count: number; monthlyTotal: number };
  insights: Insight[];
  recommendations: Recommendation[];
}

function analyzeFinances(data: {
  accounts: Account[]; transactions: Transaction[]; transfers: Transfer[]; openingBalances: OpeningBalance[];
  budgets: Budget[]; cicilan: Cicilan[]; savingsGoals: SavingsGoal[]; recurring: RecurringTransaction[];
}): AnalysisResult {
  const now = new Date();
  const totalBalance = getTotalBalance(data.accounts, data.transactions, data.transfers, data.openingBalances);
  const thisMonth = getMonthlyStats(data.transactions, now);
  const trend = getTrendData(data.transactions, 3);
  const last3Months = trend.map((t) => ({ label: t.label, income: t.income, expense: t.expense, net: t.net }));
  const monthCatOut = getMonthlyByCategory(data.transactions, now, 'out');
  const totalExpense = monthCatOut.reduce((s, c) => s + c.amount, 0) || 1;
  const topCategories = monthCatOut.slice(0, 5).map((c) => ({
    category: c.category, amount: c.amount, pct: Math.round((c.amount / totalExpense) * 100),
  }));

  const budgetProgress = getBudgetProgress(data.budgets, data.transactions, now);
  const budgetStatus = budgetProgress.map((b) => ({
    category: b.category, spent: b.spent, budget: b.amount, over: b.over,
  }));

  const savingsRate = thisMonth.income > 0
    ? Math.max(0, ((thisMonth.income - thisMonth.expense) / thisMonth.income) * 100)
    : 0;

  const activeGoals = data.savingsGoals;
  const goalsSummary = {
    active: activeGoals.length,
    totalTarget: activeGoals.reduce((s, g) => s + g.target_amount, 0),
    avgProgress: activeGoals.length > 0
      ? activeGoals.reduce((s, g) => s + (g.target_amount > 0 ? (g.current_amount / g.target_amount) * 100 : 0), 0) / activeGoals.length
      : 0,
  };

  const cicilanSummary = {
    count: data.cicilan.length,
    monthlyTotal: data.cicilan.reduce((s, c) => s + c.monthly_payment, 0),
  };

  // ── Scoring (0-100) across 4 dimensions ──
  const insights: Insight[] = [];
  const recommendations: Recommendation[] = [];

  // 1. Savings rate (30 pts)
  let savingsScore = 0;
  if (thisMonth.income > 0) {
    if (savingsRate >= 30) savingsScore = 30;
    else if (savingsRate >= 20) savingsScore = 24;
    else if (savingsRate >= 10) savingsScore = 16;
    else if (savingsRate > 0) savingsScore = 8;
    else savingsScore = 0;

    if (savingsRate < 10) {
      insights.push({
        icon: PiggyBank, severity: 'bad',
        title: 'Rasio tabungan rendah',
        detail: `Bulan ini kamu hanya menabung ${savingsRate.toFixed(0)}% dari pemasukan. Idealnya minimal 20% untuk ketahanan finansial.`,
      });
      recommendations.push({
        icon: PiggyBank,
        title: 'Terapkan aturan 50/30/20',
        detail: 'Alokasikan 50% untuk kebutuhan, 30% untuk keinginan, dan 20% untuk tabungan/investasi. Mulai dengan menabung otomatis di awal bulan.',
        action: 'Buat target tabungan di halaman Target',
      });
    } else if (savingsRate >= 20) {
      insights.push({
        icon: CheckCircle2, severity: 'good',
        title: 'Rasio tabungan sehat',
        detail: `Kamu berhasil menabung ${savingsRate.toFixed(0)}% dari pemasukan bulan ini. Pertahankan!`,
      });
    }
  } else {
    savingsScore = 15;
  }

  // 2. Budget adherence (25 pts)
  let budgetScore = 0;
  if (data.budgets.length > 0) {
    const overCount = budgetProgress.filter((b) => b.over).length;
    const adherence = 1 - (overCount / data.budgets.length);
    budgetScore = Math.round(adherence * 25);
    if (overCount > 0) {
      const overList = budgetProgress.filter((b) => b.over);
      insights.push({
        icon: AlertTriangle, severity: 'warn',
        title: `${overCount} anggaran terlampaui`,
        detail: `Kategori ${overList.map((b) => b.category).join(', ')} sudah melebihi batas anggaran bulan ini.`,
      });
      recommendations.push({
        icon: Target,
        title: 'Tinjau anggaran kategori yang boros',
        detail: `Pertimbangkan untuk menambah anggaran jika memang wajar, atau kurangi pengeluaran di kategori ${overList[0].category} bulan depan.`,
        action: 'Sesuaikan anggaran di halaman Anggaran',
      });
    } else {
      insights.push({
        icon: CheckCircle2, severity: 'good',
        title: 'Anggaran terkendali',
        detail: 'Semua kategori masih dalam batas anggaran bulan ini. Bagus!',
      });
    }
  } else {
    budgetScore = 12;
    recommendations.push({
      icon: Target,
      title: 'Buat anggaran bulanan',
      detail: 'Anggaran membantu kamu mengontrol pengeluaran per kategori. Mulai dengan kategori yang paling sering kamu gunakan.',
      action: 'Ke halaman Anggaran untuk mulai',
    });
  }

  // 3. Expense vs income trend (25 pts)
  let trendScore = 0;
  const avgIncome = trend.reduce((s, t) => s + t.income, 0) / (trend.length || 1);
  const avgExpense = trend.reduce((s, t) => s + t.expense, 0) / (trend.length || 1);
  if (avgIncome > 0) {
    const expenseRatio = avgExpense / avgIncome;
    if (expenseRatio <= 0.7) trendScore = 25;
    else if (expenseRatio <= 0.85) trendScore = 18;
    else if (expenseRatio <= 1) trendScore = 10;
    else trendScore = 4;

    if (expenseRatio > 1) {
      insights.push({
        icon: TrendingDown, severity: 'bad',
        title: 'Pengeluaran melebihi pemasukan',
        detail: `Rata-rata 3 bulan terakhir, pengeluaran (${formatRupiahShort(avgExpense)}) lebih besar dari pemasukan (${formatRupiahShort(avgIncome)}). Ini berpotensi mengikis saldo.`,
      });
      recommendations.push({
        icon: TrendingDown,
        title: 'Kurangi pengeluaran non-esensial',
        detail: 'Tinjau kategori pengeluaran terbesarmu dan cari yang bisa dipangkas. Fokus pada kebutuhan, bukan keinginan.',
        action: 'Lihat detail di halaman Laporan',
      });
    }
  } else {
    trendScore = 10;
  }

  // 4. Emergency fund / balance stability (20 pts)
  let stabilityScore = 0;
  const avgExpenseForFund = avgExpense || thisMonth.expense;
  if (avgExpenseForFund > 0 && totalBalance > 0) {
    const monthsCovered = totalBalance / avgExpenseForFund;
    if (monthsCovered >= 6) stabilityScore = 20;
    else if (monthsCovered >= 3) stabilityScore = 15;
    else if (monthsCovered >= 1) stabilityScore = 8;
    else stabilityScore = 3;

    if (monthsCovered < 3) {
      insights.push({
        icon: ShieldCheck, severity: 'warn',
        title: 'Dana darurat kurang',
        detail: `Saldo saat ini cukup untuk ${monthsCovered.toFixed(1)} bulan pengeluaran. Idealnya simpan dana darurat 3-6 kali pengeluaran bulanan.`,
      });
      recommendations.push({
        icon: ShieldCheck,
        title: 'Bangun dana darurat',
        detail: `Targetkan menabung ${formatRupiahShort(avgExpenseForFund * 3)} agar punya cadangan 3 bulan. Taruh di akun terpisah supaya tidak terpakai sehari-hari.`,
        action: 'Buat target "Dana Darurat" di halaman Target',
      });
    }
  } else if (totalBalance > 0) {
    stabilityScore = 8;
  } else {
    stabilityScore = 0;
  }

  // Top spending category insight
  if (topCategories.length > 0 && topCategories[0].pct >= 40) {
    insights.push({
      icon: TrendingDown, severity: 'warn',
      title: `Pengeluaran ${topCategories[0].category} dominan`,
      detail: `${topCategories[0].category} menyerap ${topCategories[0].pct}% dari pengeluaran bulan ini. Cek apakah ada yang bisa dioptimalkan.`,
    });
  }

  // Cicilan burden
  if (cicilanSummary.monthlyTotal > 0 && thisMonth.income > 0) {
    const burden = (cicilanSummary.monthlyTotal / thisMonth.income) * 100;
    if (burden > 30) {
      insights.push({
        icon: AlertTriangle, severity: 'bad',
        title: 'Beban cicilan tinggi',
        detail: `Cicilan bulanan (${formatRupiahShort(cicilanSummary.monthlyTotal)}) menyerap ${burden.toFixed(0)}% dari pemasukan. Idealnya di bawah 30%.`,
      });
      recommendations.push({
        icon: ShieldCheck,
        title: 'Prioritaskan pelunasan cicilan',
        detail: 'Gunakan metode bola salju (lunasi cicilan terkecil dulu) atau metode avalanche (cicilan bunga tertinggi dulu) untuk mempercepat bebas utang.',
        action: 'Kelola cicilan di halaman Target & Berulang',
      });
    }
  }

  // Goals progress
  if (goalsSummary.active > 0 && goalsSummary.avgProgress < 25) {
    recommendations.push({
      icon: Target,
      title: 'Semangat menabung untuk target',
      detail: `Rata-rata pencapaian target tabunganmu baru ${goalsSummary.avgProgress.toFixed(0)}%. Setoran kecil tapi rutin akan membantu mencapai target lebih cepat.`,
      action: 'Setor ke target di halaman Target',
    });
  }

  const healthScore = Math.round(savingsScore + budgetScore + trendScore + stabilityScore);
  const healthVerdict = healthScore >= 75
    ? 'Keuanganmu dalam kondisi sangat sehat. Pertahankan kebiasaan baik ini!'
    : healthScore >= 50
    ? 'Keuanganmu cukup sehat, tapi masih ada ruang untuk perbaikan. Lihat saran di bawah.'
    : 'Keuanganmu perlu perhatian. Mulai langkah kecil dari saran berikut untuk memperbaikinya.';

  const scoreBreakdown = [
    { label: 'Tabungan', value: savingsScore, color: 'text-[#34D8A6]' },
    { label: 'Anggaran', value: budgetScore, color: 'text-[#9B8CFF]' },
    { label: 'Tren', value: trendScore, color: 'text-[#F2B84B]' },
    { label: 'Stabilitas', value: stabilityScore, color: 'text-[#34D8A6]' },
  ];

  return {
    healthScore, healthVerdict, scoreBreakdown,
    totalBalance, thisMonth, savingsRate,
    topCategories, budgetStatus, last3Months,
    goalsSummary, cicilanSummary,
    insights, recommendations,
  };
}
