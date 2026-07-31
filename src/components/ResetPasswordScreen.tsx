import { useState } from 'react';
import { ShieldCheck, Lock, Eye, EyeOff } from 'lucide-react';
import { StatusBox } from '@/components/ui/Feedback';

interface ResetPasswordScreenProps {
  onUpdatePassword: (password: string) => Promise<{ error: { message: string } | null }>;
  onBackToLogin: () => void;
}

export function ResetPasswordScreen({ onUpdatePassword, onBackToLogin }: ResetPasswordScreenProps) {
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [show, setShow] = useState(false);
  const [status, setStatus] = useState<{ type: 'error' | 'success' | 'info'; text: string } | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    setStatus(null);
    if (password.length < 6) {
      setStatus({ type: 'error', text: 'Password baru minimal 6 karakter.' });
      return;
    }
    if (password !== confirm) {
      setStatus({ type: 'error', text: 'Konfirmasi password tidak cocok.' });
      return;
    }
    setLoading(true);
    const { error } = await onUpdatePassword(password);
    setLoading(false);
    if (error) {
      setStatus({ type: 'error', text: error.message });
    } else {
      setStatus({ type: 'success', text: 'Password berhasil diubah! Kamu akan masuk otomatis.' });
      setTimeout(onBackToLogin, 2000);
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center z-[200]
                    bg-[radial-gradient(900px_700px_at_50%_30%,#0e1f3e,#0B1220_70%)]
                    max-md:p-0">
      <div className="w-[420px] max-w-[92vw] max-md:w-full max-md:max-w-full
                      bg-[#131F36] border border-[#223252] rounded-[22px] max-md:rounded-none
                      p-9 max-md:min-h-screen max-md:flex max-md:flex-col max-md:justify-center max-md:p-6">
        <div className="flex items-center gap-2.5 mb-1.5 font-display font-extrabold text-2xl max-md:text-xl">
          <span className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-gradient-to-br from-[#34D8A6] to-[#1ea87c] text-[#0F1A2E]">
            <ShieldCheck size={18} />
          </span>
          Atur Password Baru
        </div>
        <p className="text-[#8C9BBE] text-[13.5px] mb-[22px]">
          Kamu sudah memverifikasi lewat email. Buat password baru untuk akunmu.
        </p>

        {status && <div className="mb-3.5"><StatusBox type={status.type} text={status.text} /></div>}

        <div className="mb-3.5">
          <label className="label-base">Password Baru</label>
          <div className="relative">
            <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8C9BBE] pointer-events-none" />
            <input
              type={show ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Minimal 6 karakter"
              className="input-base pl-9 pr-10"
            />
            <button
              type="button"
              onClick={() => setShow((s) => !s)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[#8C9BBE] hover:text-[#EAF0FB] cursor-pointer"
            >
              {show ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
        </div>

        <div className="mb-2.5">
          <label className="label-base">Konfirmasi Password</label>
          <div className="relative">
            <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8C9BBE] pointer-events-none" />
            <input
              type={show ? 'text' : 'password'}
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
              placeholder="Ulangi password baru"
              className="input-base pl-9"
            />
          </div>
        </div>

        <button onClick={handleSubmit} disabled={loading} className="btn-primary w-full mt-1">
          {loading ? 'Menyimpan...' : 'Simpan Password Baru'}
        </button>

        <div className="mt-4 p-3 rounded-xl bg-[#182742] border border-[#223252]">
          <p className="text-[11.5px] text-[#8C9BBE] leading-relaxed">
            <b className="text-[#EAF0FB]">Tips keamanan:</b> gunakan kombinasi huruf besar, kecil, angka, dan simbol. Jangan gunakan password yang sama dengan akun lain.
          </p>
        </div>
      </div>
    </div>
  );
}
