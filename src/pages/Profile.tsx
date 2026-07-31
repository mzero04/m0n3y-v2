import { useState } from 'react';
import { Trash2, Plus, ChevronUp, ChevronDown, Bell, BellOff, AlertTriangle, Clock } from 'lucide-react';
import type { Category, UserProfile, AccountType, Account, NotificationSettings } from '@/lib/types';
import { StatusBox } from '@/components/ui/Feedback';

interface ProfileProps {
  profile: UserProfile;
  categories: Category[];
  accountTypes: AccountType[];
  accounts: Account[];
  notifSettings: NotificationSettings;
  notifLoading: boolean;
  notifPermission: NotificationPermission | 'unsupported';
  onUpdateNotif: (partial: Partial<NotificationSettings>) => Promise<void>;
  onRequestNotifPermission: () => Promise<boolean>;
  onSaveName: (name: string) => Promise<{ error: { message: string } | null }>;
  onUploadAvatar: (file: File) => Promise<string | null>;
  onResetPassword: (email: string) => Promise<{ error: { message: string } | null }>;
  onAddCategory: (type: 'in' | 'out', name: string) => Promise<boolean>;
  onDeleteCategory: (id: string) => Promise<void>;
  onReorderCategory: (id: string, direction: 'up' | 'down', type: 'in' | 'out') => Promise<void>;
  onAddAccountType: (name: string) => Promise<boolean>;
  onDeleteAccountType: (id: string) => Promise<void>;
}

export function Profile({
  profile, categories, accountTypes, accounts,
  notifSettings, notifLoading, notifPermission, onUpdateNotif, onRequestNotifPermission,
  onSaveName, onUploadAvatar, onResetPassword,
  onAddCategory, onDeleteCategory, onReorderCategory, onAddAccountType, onDeleteAccountType,
}: ProfileProps) {
  const [fullName, setFullName] = useState(profile.fullName);
  const [nameStatus, setNameStatus] = useState<{ type: 'error' | 'success'; text: string } | null>(null);
  const [avatarStatus, setAvatarStatus] = useState<{ type: 'error' | 'success'; text: string } | null>(null);
  const [passStatus, setPassStatus] = useState<{ type: 'error' | 'success'; text: string } | null>(null);
  const [savingName, setSavingName] = useState(false);
  const [newCatIn, setNewCatIn] = useState('');
  const [newCatOut, setNewCatOut] = useState('');
  const [newType, setNewType] = useState('');

  const inCats = categories.filter((c) => c.type === 'in').sort((a, b) => a.sort_order - b.sort_order);
  const outCats = categories.filter((c) => c.type === 'out').sort((a, b) => a.sort_order - b.sort_order);

  const handleSaveName = async () => {
    if (!fullName) return;
    setSavingName(true);
    const { error } = await onSaveName(fullName);
    setSavingName(false);
    setNameStatus(error ? { type: 'error', text: error.message } : { type: 'success', text: 'Nama berhasil disimpan.' });
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      setAvatarStatus({ type: 'error', text: 'Ukuran file maksimal 2MB.' });
      return;
    }
    setAvatarStatus({ type: 'success', text: 'Mengunggah foto...' });
    try {
      await onUploadAvatar(file);
      setAvatarStatus({ type: 'success', text: 'Foto profil berhasil diperbarui.' });
    } catch {
      setAvatarStatus({ type: 'error', text: 'Gagal mengunggah foto. Coba lagi.' });
    }
  };

  const handleResetPassword = async () => {
    setPassStatus({ type: 'success', text: 'Mengirim link...' });
    const { error } = await onResetPassword(profile.email);
    setPassStatus(error ? { type: 'error', text: error.message } : { type: 'success', text: 'Link reset password telah dikirim ke email kamu.' });
  };

  const handleAddCat = async (type: 'in' | 'out') => {
    const name = type === 'in' ? newCatIn : newCatOut;
    if (!name) return;
    const ok = await onAddCategory(type, name);
    if (ok) {
      if (type === 'in') setNewCatIn(''); else setNewCatOut('');
    }
  };

  const handleAddType = async () => {
    if (!newType) return;
    const ok = await onAddAccountType(newType);
    if (ok) setNewType('');
  };

  const formatLimit = (n: number) => 'Rp ' + Math.round(n).toLocaleString('id-ID');

  const handleDeleteType = (id: string, name: string) => {
    const inUse = accounts.filter((a) => a.type === name).length;
    if (inUse > 0) {
      alert(`Tipe akun "${name}" sedang dipakai oleh ${inUse} akun. Ubah tipe akun tersebut sebelum menghapus.`);
      return;
    }
    onDeleteAccountType(id);
  };

  const renderAvatar = () => {
    if (profile.avatarUrl) {
      return <div className="w-[76px] h-[76px] rounded-full bg-cover bg-center border-2 border-[#223252] flex-shrink-0" style={{ backgroundImage: `url(${profile.avatarUrl})` }} />;
    }
    return (
      <div className="w-[76px] h-[76px] rounded-full bg-[#182742] border-2 border-[#223252] flex items-center justify-center text-2xl font-extrabold text-[#34D8A6] flex-shrink-0">
        {(profile.fullName || '?').charAt(0).toUpperCase()}
      </div>
    );
  };

  const renderCategoryList = (cats: Category[], type: 'in' | 'out') => (
    <div className="mt-3">
      <div className="flex gap-2 mb-3">
        <input
          type="text"
          value={type === 'in' ? newCatIn : newCatOut}
          onChange={(e) => type === 'in' ? setNewCatIn(e.target.value) : setNewCatOut(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleAddCat(type)}
          placeholder="Tambah kategori baru..."
          className="input-base flex-1"
        />
        <button onClick={() => handleAddCat(type)} className="btn-primary btn-sm"><Plus size={14} /> Tambah</button>
      </div>
      <div className="flex flex-col gap-1">
        {cats.map((c, i) => (
          <div key={c.id} className="flex items-center justify-between py-2 px-1 bg-[#182742] rounded-md mb-0.5">
            <div className="flex items-center gap-2 text-[13.5px]">
              <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: c.color ?? (type === 'in' ? '#34D8A6' : '#FF6B6B') }} />
              {c.name}
              {c.is_default && <span className="text-[10px] text-[#8C9BBE] font-semibold ml-1">(bawaan)</span>}
            </div>
            <div className="flex gap-1">
              <button onClick={() => onReorderCategory(c.id, 'up', type)} disabled={i === 0} className="text-[#8C9BBE] hover:text-[#34D8A6] disabled:opacity-30 cursor-pointer"><ChevronUp size={16} /></button>
              <button onClick={() => onReorderCategory(c.id, 'down', type)} disabled={i === cats.length - 1} className="text-[#8C9BBE] hover:text-[#34D8A6] disabled:opacity-30 cursor-pointer"><ChevronDown size={16} /></button>
              {!c.is_default && (
                <button onClick={() => onDeleteCategory(c.id)} className="text-[#8C9BBE] hover:text-[#FF6B6B] cursor-pointer ml-1"><Trash2 size={14} /></button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="page-fade">
      <div className="flex justify-between items-end mb-7 gap-5 flex-wrap max-md:flex-col max-md:items-start max-md:gap-2.5 max-md:mb-4">
        <div>
          <h1 className="font-display text-[28px] max-md:text-xl font-bold tracking-tight">Profil</h1>
          <p className="text-[#8C9BBE] text-sm max-md:text-[13px] mt-1">Kelola informasi akun kamu</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-[18px] max-md:grid-cols-1 max-md:gap-3">
        {/* Avatar */}
        <div className="card-base">
          <h3 className="font-display text-[15px] font-semibold mb-3.5">Foto Profil</h3>
          <div className="flex items-center gap-[18px] mt-3.5">
            {renderAvatar()}
            <div className="flex-1">
              <input type="file" accept="image/*" className="hidden" id="avatarFileInput" onChange={handleAvatarUpload} />
              <button onClick={() => document.getElementById('avatarFileInput')?.click()} className="btn-secondary btn-sm">Pilih Foto Baru</button>
              <p className="text-[11.5px] text-[#8C9BBE] mt-2 leading-relaxed">JPG/PNG, maks 2MB. Foto akan langsung ter-upload setelah dipilih.</p>
            </div>
          </div>
          {avatarStatus && <div className="mt-3"><StatusBox type={avatarStatus.type} text={avatarStatus.text} /></div>}
        </div>

        {/* Name */}
        <div className="card-base">
          <h3 className="font-display text-[15px] font-semibold mb-3.5">Nama Lengkap</h3>
          <div className="mt-3.5">
            <label className="label-base">Nama yang ditampilkan</label>
            <input type="text" value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="Nama lengkap kamu" className="input-base" />
          </div>
          <button onClick={handleSaveName} disabled={savingName} className="btn-primary btn-sm mt-3" style={{ width: 'auto', padding: '9px 20px' }}>
            {savingName ? 'Menyimpan...' : 'Simpan Nama'}
          </button>
          {nameStatus && <div className="mt-3"><StatusBox type={nameStatus.type} text={nameStatus.text} /></div>}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-[18px] mt-[18px] max-md:grid-cols-1 max-md:gap-3">
        {/* Email */}
        <div className="card-base">
          <h3 className="font-display text-[15px] font-semibold mb-3">Email Akun</h3>
          <p className="text-sm text-[#EAF0FB] mt-3 font-semibold">{profile.email}</p>
          <p className="text-xs text-[#8C9BBE] mt-1.5">Email tidak bisa diganti langsung dari sini demi keamanan akun.</p>
        </div>

        {/* Password reset */}
        <div className="card-base">
          <h3 className="font-display text-[15px] font-semibold mb-3">Ganti Password</h3>
          <p className="text-[12.5px] text-[#8C9BBE] mt-2.5 leading-relaxed">Demi keamanan, kami akan mengirim link verifikasi ke emailmu. Klik link itu untuk mengatur password baru.</p>
          <button onClick={handleResetPassword} className="btn-secondary btn-sm mt-3" style={{ width: 'auto', padding: '9px 20px' }}>Kirim Link Ganti Password</button>
          {passStatus && <div className="mt-3"><StatusBox type={passStatus.type} text={passStatus.text} /></div>}
        </div>
      </div>

      {/* Categories */}
      <div className="grid grid-cols-2 gap-[18px] mt-[18px] max-md:grid-cols-1 max-md:gap-3">
        <div className="card-base">
          <h3 className="font-display text-[15px] font-semibold">Kategori Pemasukan</h3>
          <p className="text-xs text-[#8C9BBE] mt-2">Atur urutan pakai panah. Kategori bawaan tidak bisa dihapus, hanya kategori buatanmu sendiri.</p>
          {renderCategoryList(inCats, 'in')}
        </div>
        <div className="card-base">
          <h3 className="font-display text-[15px] font-semibold">Kategori Pengeluaran</h3>
          <p className="text-xs text-[#8C9BBE] mt-2">Atur urutan pakai panah. Kategori bawaan tidak bisa dihapus, hanya kategori buatanmu sendiri.</p>
          {renderCategoryList(outCats, 'out')}
        </div>
      </div>

      {/* Notification Settings */}
      <div className="card-base mt-[18px]">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-display text-[15px] font-semibold flex items-center gap-2">
            <Bell size={16} className="text-[#9B8CFF]" /> Notifikasi & Pengingat
          </h3>
          {notifPermission === 'granted' && (
            <span className="text-[10px] font-semibold text-[#34D8A6] bg-[#34D8A6]/10 px-2 py-0.5 rounded-full">AKTIF</span>
          )}
        </div>

        {notifLoading ? (
          <p className="text-[#8C9BBE] text-sm py-4">Memuat pengaturan...</p>
        ) : (
          <>
            {notifPermission !== 'granted' && notifPermission !== 'unsupported' && (
              <div className="mb-4 p-3.5 rounded-xl bg-[#F2B84B]/8 border border-[#F2B84B]/30 flex items-start gap-3">
                <BellOff size={18} className="text-[#F2B84B] flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="text-[12.5px] text-[#EAF0FB] font-semibold">Notifikasi browser belum diaktifkan</p>
                  <p className="text-[11.5px] text-[#8C9BBE] mt-0.5 leading-relaxed">Aktifkan agar pengingat & peringatan bisa muncul di layarmu.</p>
                  <button onClick={onRequestNotifPermission} className="btn-primary btn-sm mt-2.5" style={{ width: 'auto', padding: '7px 16px' }}>Aktifkan Notifikasi</button>
                </div>
              </div>
            )}
            {notifPermission === 'unsupported' && (
              <div className="mb-4 p-3 rounded-xl bg-[#182742]">
                <p className="text-[11.5px] text-[#8C9BBE]">Browser kamu tidak mendukung notifikasi. Pengingat tidak akan berfungsi.</p>
              </div>
            )}

            <div className="space-y-4">
              {/* Reminder toggle */}
              <div className="flex items-start justify-between gap-4 p-3.5 rounded-xl bg-[#182742]">
                <div className="flex items-start gap-3 flex-1">
                  <Clock size={18} className="text-[#34D8A6] flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-[13.5px] font-semibold">Pengingat Harian</p>
                    <p className="text-[11.5px] text-[#8C9BBE] mt-0.5 leading-relaxed">Beri tahu kamu jika belum mencatat transaksi pada jam yang ditentukan.</p>
                  </div>
                </div>
                <ToggleSwitch checked={notifSettings.remind_enabled} onChange={(v) => onUpdateNotif({ remind_enabled: v })} />
              </div>

              {notifSettings.remind_enabled && (
                <div className="flex items-center gap-3 pl-11 max-md:pl-0 max-md:flex-wrap max-md:pt-1">
                  <span className="text-[12px] text-[#8C9BBE] font-semibold">Kirim pengingat jam:</span>
                  <div className="flex items-center gap-2">
                    <select
                      value={notifSettings.remind_hour}
                      onChange={(e) => onUpdateNotif({ remind_hour: parseInt(e.target.value, 10) })}
                      className="input-base w-[72px] text-center py-2 max-md:py-2.5"
                    >
                      {Array.from({ length: 24 }, (_, i) => <option key={i} value={i}>{String(i).padStart(2, '0')}</option>)}
                    </select>
                    <span className="text-[#8C9BBE] font-bold">:</span>
                    <select
                      value={notifSettings.remind_minute}
                      onChange={(e) => onUpdateNotif({ remind_minute: parseInt(e.target.value, 10) })}
                      className="input-base w-[72px] text-center py-2 max-md:py-2.5"
                    >
                      {[0, 15, 30, 45].map((m) => <option key={m} value={m}>{String(m).padStart(2, '0')}</option>)}
                    </select>
                    <span className="text-[11px] text-[#8C9BBE]">WIB</span>
                  </div>
                </div>
              )}

              {/* Daily limit toggle */}
              <div className="flex items-start justify-between gap-4 p-3.5 rounded-xl bg-[#182742]">
                <div className="flex items-start gap-3 flex-1">
                  <AlertTriangle size={18} className="text-[#FF6B6B] flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-[13.5px] font-semibold">Batas Pengeluaran Harian</p>
                    <p className="text-[11.5px] text-[#8C9BBE] mt-0.5 leading-relaxed">Kirim peringatan jika total pengeluaran hari ini melebihi batas yang kamu tetapkan.</p>
                  </div>
                </div>
                <ToggleSwitch checked={notifSettings.daily_limit_enabled} onChange={(v) => onUpdateNotif({ daily_limit_enabled: v })} />
              </div>

              {notifSettings.daily_limit_enabled && (
                <div className="pl-11 max-md:pl-0 space-y-3">
                  <div className="flex items-center gap-3 max-md:flex-wrap">
                    <span className="text-[12px] text-[#8C9BBE] font-semibold">Batas harian:</span>
                    <input
                      type="number"
                      value={notifSettings.daily_limit_amount}
                      onChange={(e) => onUpdateNotif({ daily_limit_amount: Math.max(0, parseInt(e.target.value, 10) || 0) })}
                      className="input-base w-[160px] py-2 max-md:py-2.5"
                      step={50000}
                      min={0}
                      inputMode="numeric"
                    />
                    <span className="text-[12px] text-[#8C9BBE]">IDR</span>
                  </div>
                  <div className="text-[11px] text-[#8C9BBE]">Saat ini: {formatLimit(notifSettings.daily_limit_amount)} per hari</div>
                  <div className="flex items-center gap-3">
                    <ToggleSwitch checked={notifSettings.daily_limit_notify} onChange={(v) => onUpdateNotif({ daily_limit_notify: v })} />
                    <span className="text-[12px] text-[#B8C5E0]">Tampilkan notifikasi saat batas terlampaui</span>
                  </div>
                </div>
              )}
            </div>

            <div className="mt-4 p-3 rounded-xl bg-[#131F36] border border-[#223252]">
              <p className="text-[11px] text-[#8C9BBE] leading-relaxed">
                Notifikasi hanya muncul saat aplikasi terbuka di browser. Pastikan tab ini tetap aktif agar pengingat berfungsi.
              </p>
            </div>
          </>
        )}
      </div>

      {/* Account Types */}
      <div className="card-base mt-[18px]">
        <h3 className="font-display text-[15px] font-semibold">Tipe Akun Bank</h3>
        <p className="text-xs text-[#8C9BBE] mt-2">Kelola daftar tipe akun yang tersedia saat menambah akun bank baru. Tipe yang sedang dipakai akun tidak bisa dihapus.</p>
        <div className="mt-3">
          <div className="flex gap-2 mb-3">
            <input
              type="text"
              value={newType}
              onChange={(e) => setNewType(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAddType()}
              placeholder="Tambah tipe akun baru (mis. Bank, E-Wallet)..."
              className="input-base flex-1"
            />
            <button onClick={handleAddType} className="btn-primary btn-sm"><Plus size={14} /> Tambah</button>
          </div>
          <div className="flex flex-wrap gap-2">
            {accountTypes.map((t) => {
              const inUse = accounts.filter((a) => a.type === t.name).length;
              return (
                <div key={t.id} className="flex items-center gap-2 py-1.5 px-3 bg-[#182742] rounded-md text-[13px]">
                  {t.name}
                  {inUse > 0 && <span className="text-[10px] text-[#8C9BBE] font-semibold">({inUse} akun)</span>}
                  <button onClick={() => handleDeleteType(t.id, t.name)} className="text-[#8C9BBE] hover:text-[#FF6B6B] cursor-pointer ml-1"><Trash2 size={13} /></button>
                </div>
              );
            })}
            {accountTypes.length === 0 && <div className="text-[#8C9BBE] text-xs">Belum ada tipe akun.</div>}
          </div>
        </div>
      </div>
    </div>
  );
}

function ToggleSwitch({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className={`relative w-[52px] h-[30px] rounded-full transition-colors flex-shrink-0 cursor-pointer touch-manipulation select-none ${
        checked ? 'bg-[#34D8A6]' : 'bg-[#223252]'
      }`}
    >
      <span
        className={`absolute top-[3px] left-[3px] w-6 h-6 rounded-full bg-white transition-transform shadow-sm ${
          checked ? 'translate-x-[22px]' : ''
        }`}
      />
    </button>
  );
}
