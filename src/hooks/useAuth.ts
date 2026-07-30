import { useState, useEffect, useCallback } from 'react';
import type { Session, User } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';

export interface AuthState {
  session: Session | null;
  user: User | null;
  loading: boolean;
  fullName: string;
  avatarUrl: string | null;
}

export function useAuth() {
  const [state, setState] = useState<AuthState>({
    session: null,
    user: null,
    loading: true,
    fullName: '',
    avatarUrl: null,
  });

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      const user = session?.user ?? null;
      const fullName = (user?.user_metadata?.full_name as string) ?? '';
      const avatarUrl = (user?.user_metadata?.avatar_url as string) ?? null;
      setState({ session, user, loading: false, fullName, avatarUrl });
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      (async () => {
        const user = session?.user ?? null;
        const fullName = (user?.user_metadata?.full_name as string) ?? '';
        const avatarUrl = (user?.user_metadata?.avatar_url as string) ?? null;
        setState({ session, user, loading: false, fullName, avatarUrl });
      })();
    });

    return () => subscription.unsubscribe();
  }, []);

  const signIn = useCallback(async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    return { error };
  }, []);

  const signUp = useCallback(async (email: string, password: string, fullName: string) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: fullName } },
    });
    return { data, error };
  }, []);

  const signOut = useCallback(async () => {
    await supabase.auth.signOut();
  }, []);

  const resetPassword = useCallback(async (email: string) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email);
    return { error };
  }, []);

  const updateProfile = useCallback(async (fullName: string) => {
    const { error } = await supabase.auth.updateUser({
      data: { full_name: fullName },
    });
    if (!error) {
      setState((s) => ({ ...s, fullName }));
    }
    return { error };
  }, []);

  const uploadAvatar = useCallback(async (file: File): Promise<string | null> => {
    const user = state.user;
    if (!user) return null;
    const ext = file.name.split('.').pop()?.toLowerCase() ?? 'jpg';
    const path = `${user.id}/avatar.${ext}`;
    const { error: upErr } = await supabase.storage
      .from('avatars')
      .upload(path, file, { upsert: true });
    if (upErr) throw upErr;
    const { data: pub } = supabase.storage.from('avatars').getPublicUrl(path);
    const url = `${pub.publicUrl}?t=${Date.now()}`;
    const { error: metaErr } = await supabase.auth.updateUser({
      data: { avatar_url: url },
    });
    if (metaErr) throw metaErr;
    setState((s) => ({ ...s, avatarUrl: url }));
    return url;
  }, [state.user]);

  return {
    ...state,
    signIn,
    signUp,
    signOut,
    resetPassword,
    updateProfile,
    uploadAvatar,
  };
}
