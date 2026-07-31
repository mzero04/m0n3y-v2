import { useEffect, useRef } from 'react';
import type { NotificationSettings, Transaction } from '@/lib/types';
import { supabase } from '@/lib/supabase';

interface NotificationManagerArgs {
  userId: string | null;
  settings: NotificationSettings;
  settingsLoading: boolean;
  transactions: Transaction[];
  requestPermission: () => Promise<boolean>;
}

export function useNotificationManager({
  userId, settings, settingsLoading, transactions, requestPermission,
}: NotificationManagerArgs) {
  const firedRemindRef = useRef<string | null>(null);
  const firedLimitRef = useRef<string | null>(null);
  const settingsRef = useRef(settings);
  const txRef = useRef(transactions);
  settingsRef.current = settings;
  txRef.current = transactions;

  useEffect(() => {
    if (!userId || settingsLoading || typeof Notification === 'undefined') return;
    if (!settings.remind_enabled && !settings.daily_limit_enabled) return;

    const check = async () => {
      const s = settingsRef.current;
      const now = new Date();
      const todayKey = now.toISOString().split('T')[0];

      // ── Daily reminder: haven't logged today ──
      if (s.remind_enabled && Notification.permission === 'granted') {
        const remindTime = s.remind_hour * 60 + s.remind_minute;
        const nowTime = now.getHours() * 60 + now.getMinutes();
        if (nowTime >= remindTime && firedRemindRef.current !== todayKey) {
          const hasTxToday = txRef.current.some((t) => t.date === todayKey);
          if (!hasTxToday) {
            const hourStr = `${String(s.remind_hour).padStart(2, '0')}:${String(s.remind_minute).padStart(2, '0')}`;
            new Notification('Pengingat Catat Transaksi', {
              body: `Sudah jam ${hourStr} dan kamu belum mencatat transaksi hari ini. Jangan lupa catat pemasukan & pengeluaranmu!`,
              icon: '/favicon.ico',
              tag: `remind-${todayKey}`,
            });
            firedRemindRef.current = todayKey;
            await supabase
              .from('notification_settings')
              .update({ last_reminded_date: todayKey, updated_at: new Date().toISOString() })
              .eq('user_id', userId);
          }
        }
      }

      // ── Daily spending limit alert ──
      if (s.daily_limit_enabled && s.daily_limit_notify && s.daily_limit_amount > 0 && Notification.permission === 'granted') {
        if (firedLimitRef.current !== todayKey) {
          const spentToday = txRef.current
            .filter((t) => t.date === todayKey && t.type === 'out')
            .reduce((sum, t) => sum + t.amount, 0);
          if (spentToday >= s.daily_limit_amount) {
            const fmt = (n: number) => 'Rp ' + Math.round(n).toLocaleString('id-ID');
            new Notification('Batas Pengeluaran Harian Terlampaui', {
              body: `Pengeluaranmu hari ini mencapai ${fmt(spentToday)}, melebihi batas ${fmt(s.daily_limit_amount)}. Pertimbangkan untuk mengendalikan pengeluaran.`,
              icon: '/favicon.ico',
              tag: `limit-${todayKey}`,
            });
            firedLimitRef.current = todayKey;
            await supabase
              .from('notification_settings')
              .update({ last_limit_alert_date: todayKey, updated_at: new Date().toISOString() })
              .eq('user_id', userId);
          }
        }
      }
    };

    check();
    const interval = setInterval(check, 60_000);
    return () => clearInterval(interval);
  }, [userId, settingsLoading, settings.remind_enabled, settings.daily_limit_enabled, requestPermission]);
}
