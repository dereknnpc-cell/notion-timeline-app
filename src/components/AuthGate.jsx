import React, { useEffect, useState } from 'react';
import { LogIn, LogOut, Users, Copy } from 'lucide-react';
import { supabase, isCloudEnabled } from '../lib/supabase.js';
import { t } from '../i18n.js';
import { Card, Button, TextField } from './UI.jsx';

export function AuthGate({ lang, children }) {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(isCloudEnabled);
  const [family, setFamily] = useState(null);

  useEffect(() => {
    if (!supabase) return;
    let mounted = true;
    supabase.auth.getSession().then(({ data }) => {
      if (mounted) { setSession(data.session); setLoading(false); }
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => {
      setSession(s); if (!s) setFamily(null);
    });
    return () => { mounted = false; sub.subscription.unsubscribe(); };
  }, []);

  useEffect(() => {
    if (!session) return;
    (async () => {
      const { data } = await supabase
        .from('family_members')
        .select('family_id, display_name, families(name)')
        .eq('user_id', session.user.id)
        .limit(1)
        .maybeSingle();
      if (data) setFamily({ id: data.family_id, name: data.families?.name, displayName: data.display_name });
    })();
  }, [session?.user?.id]);

  if (!isCloudEnabled) {
    return (
      <>
        <OfflineBanner lang={lang} />
        {children({ session: null, family: null, signOut: null })}
      </>
    );
  }

  if (loading) return <Splash>{lang === 'zh' ? '載入中...' : 'Loading...'}</Splash>;

  if (!session) return <SignIn lang={lang} />;

  if (!family) return <FamilyOnboarding lang={lang} session={session} onReady={setFamily} />;

  return children({
    session,
    family,
    signOut: () => supabase.auth.signOut(),
  });
}

function Splash({ children }) {
  return <div className="min-h-screen flex items-center justify-center text-slate-500">{children}</div>;
}

function OfflineBanner({ lang }) {
  return (
    <div className="bg-amber-100 text-amber-800 text-xs px-4 py-2 text-center">
      {lang === 'zh'
        ? '雲端未設定 (VITE_SUPABASE_URL/ANON_KEY)，目前資料只存在這台瀏覽器。'
        : 'Cloud disabled (set VITE_SUPABASE_URL + VITE_SUPABASE_ANON_KEY). Data is local only.'}
    </div>
  );
}

function SignIn({ lang }) {
  const onGoogle = async () => {
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: window.location.origin },
    });
  };
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-6">
      <Card className="p-8 max-w-md w-full text-center">
        <h1 className="text-2xl font-bold mb-2">{t('appTitle', lang)}</h1>
        <p className="text-sm text-slate-500 mb-6">
          {lang === 'zh' ? '請登入以同步家庭資料' : 'Sign in to sync family data'}
        </p>
        <button onClick={onGoogle}
          className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg bg-white border border-slate-300 hover:bg-slate-50 transition-colors font-medium">
          <GoogleIcon />
          {lang === 'zh' ? '使用 Google 登入' : 'Continue with Google'}
        </button>
      </Card>
    </div>
  );
}

function FamilyOnboarding({ lang, session, onReady }) {
  const [mode, setMode] = useState('create');
  const [displayName, setDisplayName] = useState(session.user.user_metadata?.full_name ?? '');
  const [familyName, setFamilyName] = useState(
    (session.user.user_metadata?.full_name?.split(' ')[0] ?? 'My') + (lang === 'zh' ? ' 的家庭' : "'s family"));
  const [inviteCode, setInviteCode] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const create = async () => {
    setBusy(true); setError('');
    const { data, error } = await supabase.rpc('create_family', {
      family_name: familyName, member_display_name: displayName,
    });
    setBusy(false);
    if (error) { setError(error.message); return; }
    onReady({ id: data, name: familyName, displayName });
  };

  const join = async () => {
    setBusy(true); setError('');
    const { data, error } = await supabase.rpc('join_family', {
      family_uuid: inviteCode.trim(), member_display_name: displayName,
    });
    if (error) { setBusy(false); setError(error.message); return; }
    const { data: fam } = await supabase
      .from('families').select('name').eq('id', data).single();
    setBusy(false);
    onReady({ id: data, name: fam?.name ?? '', displayName });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-6">
      <Card className="p-6 max-w-md w-full">
        <h2 className="text-lg font-bold mb-1 flex items-center gap-2">
          <Users className="w-5 h-5 text-blue-500" />
          {lang === 'zh' ? '加入或建立家庭群組' : 'Create or join a family group'}
        </h2>
        <p className="text-xs text-slate-500 mb-4">
          {lang === 'zh' ? '群組內成員共用所有信用卡與交易資料' : 'Members of a group share all cards and transactions.'}
        </p>

        <div className="flex gap-2 mb-4 text-sm">
          <button onClick={() => setMode('create')}
            className={`flex-1 px-3 py-2 rounded-lg ${mode === 'create' ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-700'}`}>
            {lang === 'zh' ? '建立新家庭' : 'Create'}
          </button>
          <button onClick={() => setMode('join')}
            className={`flex-1 px-3 py-2 rounded-lg ${mode === 'join' ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-700'}`}>
            {lang === 'zh' ? '加入家庭' : 'Join'}
          </button>
        </div>

        <div className="space-y-3">
          <TextField label={lang === 'zh' ? '你的顯示名稱' : 'Your display name'}
            value={displayName} onChange={setDisplayName} />
          {mode === 'create' ? (
            <TextField label={lang === 'zh' ? '家庭名稱' : 'Family name'}
              value={familyName} onChange={setFamilyName} />
          ) : (
            <TextField label={lang === 'zh' ? '邀請碼 (UUID)' : 'Invite code (UUID)'}
              value={inviteCode} onChange={setInviteCode}
              placeholder="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx" />
          )}
        </div>

        {error && <div className="mt-3 text-sm text-rose-600">{error}</div>}

        <div className="mt-4 flex justify-end">
          <Button onClick={mode === 'create' ? create : join} disabled={busy}>
            {busy ? '...' : mode === 'create' ? (lang === 'zh' ? '建立' : 'Create') : (lang === 'zh' ? '加入' : 'Join')}
          </Button>
        </div>
      </Card>
    </div>
  );
}

export function UserBadge({ lang, session, family, signOut }) {
  const [copied, setCopied] = useState(false);
  if (!session || !family) return null;
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(family.id);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      prompt(lang === 'zh' ? '請複製邀請碼：' : 'Copy invite code:', family.id);
    }
  };
  return (
    <div className="flex items-center gap-2 text-xs text-slate-300">
      <span className="hidden md:inline">{family.displayName ?? session.user.email}</span>
      <button onClick={copy}
        className="flex items-center gap-1 bg-white/10 hover:bg-white/20 px-2 py-1 rounded"
        title={lang === 'zh' ? '複製家庭邀請碼' : 'Copy family invite code'}>
        <Copy className="w-3 h-3" />
        {copied ? (lang === 'zh' ? '已複製' : 'Copied') : (lang === 'zh' ? '邀請碼' : 'Invite')}
      </button>
      <button onClick={signOut}
        className="flex items-center gap-1 bg-white/10 hover:bg-white/20 px-2 py-1 rounded">
        <LogOut className="w-3 h-3" />
        {lang === 'zh' ? '登出' : 'Sign out'}
      </button>
    </div>
  );
}

function GoogleIcon() {
  return (
    <svg className="w-5 h-5" viewBox="0 0 48 48" aria-hidden="true">
      <path fill="#FFC107" d="M43.6 20.5h-1.9V20H24v8h11.3c-1.6 4.5-5.9 7.7-11.3 7.7-6.6 0-12-5.4-12-12s5.4-12 12-12c3 0 5.7 1.1 7.8 3l5.7-5.7C33.6 5.8 29.1 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.2-.1-2.4-.4-3.5z"/>
      <path fill="#FF3D00" d="m6.3 14.7 6.6 4.8c1.8-4.4 6.1-7.5 11.1-7.5 3 0 5.7 1.1 7.8 3l5.7-5.7C33.6 5.8 29.1 4 24 4 16.3 4 9.7 8.4 6.3 14.7z"/>
      <path fill="#4CAF50" d="M24 44c5 0 9.6-1.9 13.1-5l-6-5.1c-2 1.4-4.5 2.2-7.1 2.2-5.3 0-9.7-3.4-11.3-8.1l-6.6 5.1C9.6 39.5 16.2 44 24 44z"/>
      <path fill="#1976D2" d="M43.6 20.5h-1.9V20H24v8h11.3c-.8 2.2-2.2 4.1-4.2 5.4l6 5.1C40.9 35.8 44 30.4 44 24c0-1.2-.1-2.4-.4-3.5z"/>
    </svg>
  );
}
