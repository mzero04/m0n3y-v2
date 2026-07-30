import type { Transaction, Account, Budget, Cicilan, SavingsGoal } from '@/lib/types';
import { formatRupiah, formatDate, monthLabel } from '@/lib/format';
import { getMonthlyByCategory, getMonthlyStats } from '@/lib/compute';

function downloadFile(content: string, filename: string, mime: string) {
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export function exportCSV(transactions: Transaction[]) {
  const headers = ['Tanggal', 'Jam', 'Tipe', 'Deskripsi', 'Akun', 'Kategori', 'Jumlah'];
  const rows = transactions.map((t) => [
    t.date, t.time ?? '', t.type === 'in' ? 'Pemasukan' : 'Pengeluaran',
    t.description, t.account, t.category, String(t.amount),
  ]);
  const csv = [headers, ...rows].map((r) => r.map((c) => `"${c}"`).join(',')).join('\n');
  downloadFile('\ufeff' + csv, `transaksi_${new Date().toISOString().split('T')[0]}.csv`, 'text/csv;charset=utf-8');
}

export function exportExcel(transactions: Transaction[]) {
  const rows = transactions.map((t) => ({
    Tanggal: t.date, Jam: t.time ?? '',
    Tipe: t.type === 'in' ? 'Pemasukan' : 'Pengeluaran',
    Deskripsi: t.description, Akun: t.account,
    Kategori: t.category, Jumlah: t.amount,
  }));
  const ws = jsonToSheet(rows);
  const csv = sheetToCSV(ws);
  downloadFile('\ufeff' + csv, `transaksi_${new Date().toISOString().split('T')[0]}.csv`, 'application/vnd.ms-excel;charset=utf-8');
}

function jsonToSheet(rows: Record<string, unknown>[]) {
  if (rows.length === 0) return { headers: [], data: [] };
  const headers = Object.keys(rows[0]);
  const data = rows.map((r) => headers.map((h) => r[h]));
  return { headers, data };
}

function sheetToCSV(ws: { headers: string[]; data: unknown[][] }) {
  const lines = [ws.headers, ...ws.data].map((r) => r.map((c) => `"${String(c)}"`).join(','));
  return lines.join('\n');
}

export function exportPDF(transactions: Transaction[]) {
  const win = window.open('', '_blank');
  if (!win) return;
  const html = `
<!DOCTYPE html><html><head><meta charset="utf-8"><title>Transaksi</title>
<style>body{font-family:Arial,sans-serif;padding:30px;}h1{font-size:18px;}
table{width:100%;border-collapse:collapse;margin-top:15px;font-size:12px;}
th{background:#34D8A6;color:#06281f;padding:8px;text-align:left;}
td{padding:7px;border-bottom:1px solid #ddd;}
</style></head><body><h1>Daftar Transaksi</h1>
<table><thead><tr><th>Tanggal</th><th>Deskripsi</th><th>Akun</th><th>Kategori</th><th>Tipe</th><th>Jumlah</th></tr></thead>
<tbody>${transactions.map((t) => `<tr><td>${formatDate(t.date)}</td><td>${t.description}</td><td>${t.account}</td><td>${t.category}</td><td>${t.type === 'in' ? 'Pemasukan' : 'Pengeluaran'}</td><td>${formatRupiah(t.amount)}</td></tr>`).join('')}</tbody>
</table></body></html>`;
  win.document.write(html);
  win.document.close();
  win.print();
}

export function exportReportPDF(
  date: Date,
  transactions: Transaction[],
  accounts: Account[],
  budgets: Budget[],
  cicilan: Cicilan[],
  savingsGoals: SavingsGoal[],
) {
  const win = window.open('', '_blank');
  if (!win) return;
  const stats = getMonthlyStats(transactions, date);
  const expCats = getMonthlyByCategory(transactions, date, 'out');
  const incCats = getMonthlyByCategory(transactions, date, 'in');
  const html = `
<!DOCTYPE html><html><head><meta charset="utf-8"><title>Laporan ${monthLabel(date)}</title>
<style>body{font-family:Arial,sans-serif;padding:30px;max-width:700px;margin:0 auto;}
h1{font-size:20px;color:#0B1220;}h2{font-size:15px;margin-top:25px;}
.stat{display:inline-block;margin-right:20px;padding:10px 15px;border-radius:8px;background:#f0f0f0;}
table{width:100%;border-collapse:collapse;margin-top:10px;font-size:12px;}
th{background:#34D8A6;color:#06281f;padding:8px;text-align:left;}td{padding:7px;border-bottom:1px solid #ddd;}
</style></head><body><h1>Laporan Keuangan — ${monthLabel(date)}</h1>
<div style="margin:15px 0;">
<span class="stat"><b>Pemasukan:</b> ${formatRupiah(stats.income)}</span>
<span class="stat"><b>Pengeluaran:</b> ${formatRupiah(stats.expense)}</span>
<span class="stat"><b>Selisih:</b> ${formatRupiah(stats.net)}</span>
</div>
<h2>Pengeluaran per Kategori</h2><table><tbody>
${expCats.map((c) => `<tr><td>${c.category}</td><td>${formatRupiah(c.amount)}</td></tr>`).join('')}
</tbody></table>
<h2>Pemasukan per Kategori</h2><table><tbody>
${incCats.map((c) => `<tr><td>${c.category}</td><td>${formatRupiah(c.amount)}</td></tr>`).join('')}
</tbody></table>
</body></html>`;
  win.document.write(html);
  win.document.close();
  win.print();
}
