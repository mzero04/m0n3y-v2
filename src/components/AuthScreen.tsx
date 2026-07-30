import { useState } from 'react';
import { StatusBox } from '@/components/ui/Feedback';

interface AuthScreenProps {
  onSignIn: (email: string, password: string) => Promise<{ error: { message: string } | null }>;
  onSignUp: (email: string, password: string, fullName: string) => Promise<{ error: { message: string } | null }>;
  onResetPassword: (email: string) => Promise<{ error: { message: string } | null }>;
}

export function AuthScreen({ onSignIn, onSignUp, onResetPassword }: AuthScreenProps) {
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [status, setStatus] = useState<{ type: 'error' | 'success' | 'info'; text: string } | null>(null);
  const [loading, setLoading] = useState(false);
  const [forgotMode, setForgotMode] = useState(false);

  const handleSubmit = async () => {
    setStatus(null);
    if (forgotMode) {
      if (!email) { setStatus({ type: 'error', text: 'Masukkan email kamu.' }); return; }
      setLoading(true);
      const { error } = await onResetPassword(email);
      setLoading(false);
      if (error) {
        setStatus({ type: 'error', text: error.message });
      } else {
        setStatus({ type: 'success', text: 'Link reset password telah dikirim ke email kamu.' });
      }
      return;
    }

    if (!email || !password) { setStatus({ type: 'error', text: 'Email dan password wajib diisi.' }); return; }
    if (mode === 'register' && !fullName) { setStatus({ type: 'error', text: 'Nama lengkap wajib diisi.' }); return; }
    if (password.length < 6) { setStatus({ type: 'error', text: 'Password minimal 6 karakter.' }); return; }

    setLoading(true);
    if (mode === 'login') {
      const { error } = await onSignIn(email, password);
      if (error) setStatus({ type: 'error', text: error.message === 'Invalid login credentials' ? 'Email atau password salah.' : error.message });
    } else {
      const { error } = await onSignUp(email, password, fullName);
      if (error) {
        setStatus({ type: 'error', text: error.message });
      } else {
        setStatus({ type: 'success', text: 'Akun berhasil dibuat! Silakan masuk.' });
        setMode('login');
      }
    }
    setLoading(false);
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center z-[200]
                    bg-[radial-gradient(900px_700px_at_50%_30%,#0e1f3e,#0B1220_70%)]
                    max-md:p-0">
      <div className="w-[420px] max-w-[92vw] max-md:w-full max-md:max-w-full
                      bg-[#131F36] border border-[#223252] rounded-[22px] max-md:rounded-none
                      p-9 max-md:min-h-screen max-md:flex max-md:flex-col max-md:justify-center max-md:p-6">
        <div className="flex items-center gap-2.5 mb-1.5 font-display font-extrabold text-2xl max-md:text-xl">
          <div className="w-2.5 h-2.5 rounded bg-gradient-to-br from-[#34D8A6] to-[#F2B84B]" />
          {forgotMode ? 'Reset Password' : 'Selamat Datang!'}
        </div>
        <p className="text-[#8C9BBE] text-[13.5px] mb-[22px]">
          {forgotMode
            ? 'Masukkan email kamu dan kami akan mengirim link untuk reset password.'
            : 'Masuk atau daftar untuk mengakses data keuanganmu dari perangkat manapun.'}
        </p>

        {!forgotMode && (
          <div className="flex gap-1.5 bg-[#0F1A2E] rounded-[10px] p-1 mb-[22px]">
            <button
              onClick={() => { setMode('login'); setStatus(null); }}
              className={`flex-1 text-center py-2.5 rounded-[7px] font-bold text-[13px] transition-all cursor-pointer
                ${mode === 'login' ? 'bg-[#182742] text-[#34D8A6]' : 'text-[#8C9BBE]'}`}
            >Masuk</button>
            <button
              onClick={() => { setMode('register'); setStatus(null); }}
              className={`flex-1 text-center py-2.5 rounded-[7px] font-bold text-[13px] transition-all cursor-pointer
                ${mode === 'register' ? 'bg-[#182742] text-[#34D8A6]' : 'text-[#8C9BBE]'}`}
            >Daftar</button>
          </div>
        )}

        {status && <div className="mb-3.5"><StatusBox type={status.type} text={status.text} /></div>}

        {mode === 'register' && !forgotMode && (
          <div className="mb-3.5">
            <label className="label-base">Nama Lengkap</label>
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Nama kamu, misal: Budi Santoso"
              className="input-base"
            />
          </div>
        )}

        <div className="mb-3.5">
          <label className="label-base">Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="email@kamu.com"
            className="input-base"
          />
        </div>

        {!forgotMode && (
          <div className="mb-2.5">
            <label className="label-base">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
              placeholder="Minimal 6 karakter"
              className="input-base"
            />
          </div>
        )}

        {!forgotMode && mode === 'login' && (
          <div className="text-right -mt-2 mb-2.5">
            <span className="text-xs text-[#34D8A6] cursor-pointer" onClick={() => { setForgotMode(true); setStatus(null); }}>
              Lupa password?
            </span>
          </div>
        )}

        <button onClick={handleSubmit} disabled={loading} className="btn-primary w-full mt-1">
          {loading ? 'Memproses...' : forgotMode ? 'Kirim Link Reset' : mode === 'login' ? 'Masuk' : 'Daftar'}
        </button>

        {forgotMode ? (
          <div className="text-center mt-3.5">
            <span className="text-xs text-[#8C9BBE] cursor-pointer" onClick={() => { setForgotMode(false); setStatus(null); }}>
              Kembali ke login
            </span>
          </div>
        ) : (
          <div className="text-center mt-3.5">
            <span className="text-[12.5px] text-[#8C9BBE]">
              {mode === 'login' ? 'Belum punya akun? ' : 'Sudah punya akun? '}
              <span
                className="text-[#34D8A6] cursor-pointer"
                onClick={() => { setMode(mode === 'login' ? 'register' : 'login'); setStatus(null); }}
              >
                {mode === 'login' ? 'Daftar' : 'Masuk'}
              </span>
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
