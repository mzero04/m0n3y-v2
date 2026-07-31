import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import type { NotificationSettings } from '@/lib/types';

const DEFAULT_SETTINGS: NotificationSettings = {
  remind_enabled: true,
  remind_hour: 22,
  remind_minute: 0,
  daily_limit_enabled: false,
  daily_limit_amount: 500000,
  daily_limit_notify: true,
};

export interface UseNotificationSettings {
  settings: NotificationSettings;
  loading: boolean;
  saving: boolean;
  update: (partial: Partial<NotificationSettings>) => Promise<void>;
  requestPermission: () => Promise<boolean>;
  permission: NotificationPermission | 'unsupported';
}

export function useNotificationSettings(userId: string | null): UseNotificationSettings {
  const [settings, setSettings] = useState<NotificationSettings>(DEFAULT_SETTINGS);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [permission, setPermission] = useState<NotificationPermission | 'unsupported'>(
    typeof Notification !== 'undefined' ? Notification.permission : 'unsupported'
  );

  const load = useCallback(async () => {
    if (!userId) { setLoading(false); return; }
    try {
      const { data, error } = await supabase
        .from('notification_settings')
        .select('remind_enabled, remind_hour, remind_minute, daily_limit_enabled, daily_limit_amount, daily_limit_notify')
        .eq('user_id', userId)
        .maybeSingle();

      if (error) throw error;
      if (data) {
        setSettings(data as NotificationSettings);
      } else {
        const { data: inserted, error: insErr } = await supabase
          .from('notification_settings')
          .insert({ user_id: userId, ...DEFAULT_SETTINGS })
          .select('remind_enabled, remind_hour, remind_minute, daily_limit_enabled, daily_limit_amount, daily_limit_notify')
          .maybeSingle();
        if (insErr) throw insErr;
        if (inserted) setSettings(inserted as NotificationSettings);
      }
    } catch {
      setSettings(DEFAULT_SETTINGS);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => { load(); }, [load]);

  const update = useCallback(async (partial: Partial<NotificationSettings>) => {
    if (!userId) return;
    setSaving(true);
    const next = { ...settings, ...partial };
    setSettings(next);
    try {
      const { error } = await supabase
        .from('notification_settings')
        .update({ ...partial, updated_at: new Date().toISOString() })
        .eq('user_id', userId);
      if (error) {
        setSettings(settings);
      }
    } catch {
      setSettings(settings);
    } finally {
      setSaving(false);
    }
  }, [userId, settings]);

  const requestPermission = useCallback(async (): Promise<boolean> => {
    if (typeof Notification === 'undefined') return false;
    if (Notification.permission === 'granted') { setPermission('granted'); return true; }
    const result = await Notification.requestPermission();
    setPermission(result);
    return result === 'granted';
  }, []);

  return { settings, loading, saving, update, requestPermission, permission };
}
