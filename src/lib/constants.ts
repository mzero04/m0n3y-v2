export const ACCOUNT_COLORS: Record<string, { bg: string; text: string; label: string }> = {
  gold: { bg: 'linear-gradient(135deg,#ffce54,#ffb938)', text: '#0b1220', label: 'Gold' },
  orange: { bg: 'linear-gradient(135deg,#ffb05c,#ff8a3d)', text: '#2b1300', label: 'Orange' },
  green: { bg: 'linear-gradient(135deg,#bff36a,#7fe06b)', text: '#0b1220', label: 'Green' },
  blue: { bg: 'linear-gradient(135deg,#86d7ff,#3aa8ff)', text: '#06203b', label: 'Blue' },
  silver: { bg: 'linear-gradient(135deg,#d9dee8,#aab3c4)', text: '#1b2433', label: 'Silver' },
};

export const ACCOUNT_TYPES = ['Bank', 'E-Wallet', 'Tunai', 'Kartu Kredit', 'Investasi', 'Lainnya'];

export const CICILAN_TYPES: Record<string, { label: string; badge: string }> = {
  kredit: { label: 'Kartu Kredit', badge: 'bg-[#1a2e4a] text-[#5C9DFF]' },
  paylater: { label: 'PayLater', badge: 'bg-[#2e1a3f] text-[#C77DFF]' },
  cicilan: { label: 'Cicilan', badge: 'bg-[#1C5B49] text-[#34D8A6]' },
  pinjaman: { label: 'Pinjaman', badge: 'bg-[#5A4321] text-[#F2B84B]' },
  lainnya: { label: 'Lainnya', badge: 'bg-[#182742] text-[#8C9BBE]' },
};

export const DEFAULT_CATEGORIES_IN = [
  'Gaji', 'Bonus', 'Uang Saku', 'Investasi', 'Penjualan', 'Freelance', 'Lainnya',
];

export const DEFAULT_CATEGORIES_OUT = [
  'Makan & Minum', 'Belanja', 'Transportasi', 'Hiburan', 'Kesehatan', 'Pendidikan',
  'Tagihan', 'Sewa/ Kos', 'Pulsa/ Data', 'Perawatan', 'Hewan Peliharaan', 'Lainnya',
];

export const DEFAULT_ACCOUNTS: { id: string; name: string; type: string; color_id: string; sort_order: number }[] = [
  { id: 'tunai', name: 'Tunai', type: 'Tunai', color_id: 'green', sort_order: 0 },
  { id: 'bank_bca', name: 'Bank BCA', type: 'Tabungan', color_id: 'blue', sort_order: 1 },
  { id: 'gopay', name: 'GoPay', type: 'E-Wallet', color_id: 'silver', sort_order: 2 },
];

export const SAVINGS_ICONS = ['🎯', '🚗', '🏠', '✈️', '💍', '📱', '💻', '🏖️', '🎁', '💰', '🎓', '🏥'];

export const RECURRING_FREQUENCIES: Record<string, string> = {
  weekly: 'Mingguan',
  monthly: 'Bulanan',
  yearly: 'Tahunan',
};

export const MONTH_NAMES = [
  'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
  'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember',
];

export const PAGE_META = [
  { id: 'dashboard', label: 'Dashboard', icon: 'layout-dashboard' },
  { id: 'transactions', label: 'Transaksi', icon: 'list' },
  { id: 'accounts', label: 'Akun Bank', icon: 'credit-card', hideMobile: true },
  { id: 'transfer', label: 'Transfer', icon: 'arrow-left-right' },
  { id: 'budget', label: 'Budgeting', icon: 'piggy-bank', badge: true },
  { id: 'report', label: 'Laporan', icon: 'file-text', hideMobile: true },
  { id: 'goals', label: 'Target & Berulang', icon: 'target', hideMobile: true, badge: true },
  { id: 'profile', label: 'Profil', icon: 'user', hideMobile: true },
] as const;
