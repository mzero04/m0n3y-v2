export function formatRupiah(n: number | null | undefined): string {
  if (n === null || n === undefined || isNaN(n)) return 'Rp 0';
  return 'Rp ' + Math.round(n).toLocaleString('id-ID');
}

export function formatRupiahShort(n: number | null | undefined): string {
  if (n === null || n === undefined || isNaN(n)) return 'Rp 0';
  const abs = Math.abs(n);
  const sign = n < 0 ? '-' : '';
  if (abs >= 1_000_000_000) return `${sign}Rp ${(abs / 1_000_000_000).toFixed(1)}M`;
  if (abs >= 1_000_000) return `${sign}Rp ${(abs / 1_000_000).toFixed(1)}jt`;
  if (abs >= 1_000) return `${sign}Rp ${(abs / 1_000).toFixed(0)}rb`;
  return `${sign}Rp ${abs}`;
}

export function formatDate(iso: string | null | undefined): string {
  if (!iso) return '-';
  const d = new Date(iso);
  if (isNaN(d.getTime())) return iso;
  return d.toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' });
}

export function formatDateShort(iso: string | null | undefined): string {
  if (!iso) return '-';
  const d = new Date(iso);
  if (isNaN(d.getTime())) return iso;
  return d.toLocaleDateString('id-ID', { day: '2-digit', month: '2-digit' });
}

export function formatTime(t: string | null | undefined): string {
  if (!t) return '';
  const parts = t.split(':');
  if (parts.length < 2) return t;
  let h = parseInt(parts[0], 10);
  const m = parts[1];
  const ampm = h >= 12 ? 'PM' : 'AM';
  h = h % 12 || 12;
  return `${h}:${m} ${ampm}`;
}

export function todayISO(): string {
  return new Date().toISOString().split('T')[0];
}

export function nowTime(): string {
  const d = new Date();
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
}

export function monthKey(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
}

export function monthLabel(d: Date): string {
  const names = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
    'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
  return `${names[d.getMonth()]} ${d.getFullYear()}`;
}

export function daysUntil(iso: string): number {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const target = new Date(iso);
  target.setHours(0, 0, 0, 0);
  return Math.ceil((target.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
}

export function generateId(): string {
  return `acc_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}
