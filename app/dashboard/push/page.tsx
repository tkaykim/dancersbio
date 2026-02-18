'use client';

import { useEffect, useState, useRef } from 'react';
import { useAuth } from '@/lib/auth-context';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Bell, Send, Loader2, Smartphone, Users, AlertCircle, RefreshCw } from 'lucide-react';
import { Capacitor } from '@capacitor/core';
import {
  isPushSupported,
  requestPushPermission,
  getFCMToken,
} from '@/lib/push-notifications';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

interface TokenRow {
  user_id: string;
  email: string | null;
  name: string | null;
  platform: string;
  updated_at: string;
}

interface Stats {
  memberCount: number;
  totalTokens: number;
  tokens: TokenRow[];
}

export default function DashboardPushPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [stats, setStats] = useState<Stats | null>(null);
  const [myTokens, setMyTokens] = useState<{ platform: string; updated_at: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [statsError, setStatsError] = useState<string | null>(null);
  const [sending, setSending] = useState(false);
  const [sendResult, setSendResult] = useState<string | null>(null);
  const [form, setForm] = useState({ title: '테스트 알림', body: '푸시가 정상 동작합니다.', targetUserId: '' });
  const [registering, setRegistering] = useState(false);
  const [registerStatus, setRegisterStatus] = useState<string | null>(null);
  const statsFetchedRef = useRef(false);

  const isNativeApp = typeof window !== 'undefined' && Capacitor.isNativePlatform();

  useEffect(() => {
    if (!authLoading && !user) router.push('/auth/signin');
  }, [user, authLoading, router]);

  useEffect(() => {
    if (!user) return;

    const fetchStats = async () => {
      setStatsError(null);
      if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
        setStatsError('NEXT_PUBLIC_SUPABASE_URL 또는 ANON_KEY가 설정되지 않았습니다.');
        setLoading(false);
        return;
      }

      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) {
        if (!statsFetchedRef.current) {
          statsFetchedRef.current = true;
          setTimeout(() => fetchStats(), 800);
          return;
        }
        setStatsError('세션을 불러올 수 없습니다. 페이지를 새로고침하거나 다시 로그인해 주세요.');
        setLoading(false);
        return;
      }

      try {
        const res = await fetch(`${SUPABASE_URL}/functions/v1/get-push-stats`, {
          headers: {
            Authorization: `Bearer ${session.access_token}`,
            apikey: SUPABASE_ANON_KEY,
            'Content-Type': 'application/json',
          },
        });
        const data = await res.json().catch(() => ({}));
        if (res.ok) {
          setStats(data);
          setStatsError(null);
        } else {
          setStatsError(data?.error || `조회 실패 (${res.status})`);
        }
      } catch (e) {
        setStatsError(e instanceof Error ? e.message : '네트워크 오류');
      }
      setLoading(false);
    };

    const fetchMyTokens = async () => {
      const { data } = await supabase.from('push_tokens').select('platform, updated_at').eq('user_id', user!.id);
      setMyTokens(data ?? []);
    };

    statsFetchedRef.current = false;
    fetchStats();
    fetchMyTokens();
  }, [user]);

  const refetchMyTokensAndStats = async () => {
    if (!user) return;
    const { data } = await supabase.from('push_tokens').select('platform, updated_at').eq('user_id', user.id);
    setMyTokens(data ?? []);
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.access_token && SUPABASE_URL) {
      const res = await fetch(`${SUPABASE_URL}/functions/v1/get-push-stats`, {
        headers: { Authorization: `Bearer ${session.access_token}`, apikey: SUPABASE_ANON_KEY, 'Content-Type': 'application/json' },
      });
      if (res.ok) setStats(await res.json());
    }
  };

  const registerThisDevice = async () => {
    if (!user?.id) return;
    setRegistering(true);
    setRegisterStatus(null);
    try {
      if (!Capacitor.isNativePlatform()) {
        setRegisterStatus('이 기능은 앱에서만 가능합니다. Android/iOS 앱을 열어주세요.');
        return;
      }
      const supported = await isPushSupported();
      if (!supported) {
        setRegisterStatus('이 기기에서 푸시를 지원하지 않습니다.');
        return;
      }
      const granted = await requestPushPermission();
      if (!granted) {
        setRegisterStatus('알림 권한이 필요합니다. 설정 → 앱 → 알림에서 허용 후 다시 시도해 주세요.');
        return;
      }
      const token = await getFCMToken();
      if (!token) {
        setRegisterStatus('FCM 토큰을 받지 못했습니다. 잠시 후 다시 시도하거나 앱을 재시작해 주세요.');
        return;
      }
      const platform = Capacitor.getPlatform() === 'ios' ? 'ios' : Capacitor.getPlatform() === 'android' ? 'android' : 'web';
      const { error } = await supabase.from('push_tokens').upsert(
        { user_id: user.id, token, platform, updated_at: new Date().toISOString() },
        { onConflict: 'user_id,platform' }
      );
      if (error) {
        setRegisterStatus(`저장 실패: ${error.message}`);
        return;
      }
      setRegisterStatus('등록 완료되었습니다.');
      await refetchMyTokensAndStats();
    } catch (e) {
      setRegisterStatus(e instanceof Error ? e.message : '오류가 발생했습니다.');
    } finally {
      setRegistering(false);
    }
  };

  const sendTest = async (mode: 'me' | 'user' | 'all') => {
    setSending(true);
    setSendResult(null);

    const { data: { session } } = await supabase.auth.getSession();
    const token = session?.access_token ?? SUPABASE_ANON_KEY;

    const body: { title: string; body: string; user_id?: string } = {
      title: form.title,
      body: form.body,
    };
    if (mode === 'me') body.user_id = user!.id;
    else if (mode === 'user' && form.targetUserId) body.user_id = form.targetUserId;

    const res = await fetch(`${SUPABASE_URL}/functions/v1/send-push`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
        apikey: SUPABASE_ANON_KEY,
      },
      body: JSON.stringify(body),
    });

    const data = await res.json().catch(() => ({}));
    if (res.ok) {
      setSendResult(`발송 완료: ${data.sent ?? 0}건 (대상 ${data.total ?? 0}건)`);
    } else {
      setSendResult(`실패: ${data.error ?? res.statusText}`);
    }
    setSending(false);
  };

  if (authLoading || !user) return null;

  return (
    <div className="min-h-screen bg-background text-foreground pb-24">
      <header className="sticky top-0 bg-background/90 backdrop-blur border-b border-neutral-800 z-10">
        <div className="flex items-center gap-3 px-4 py-4">
          <Link href="/my/settings" className="p-2 -ml-2 rounded-lg hover:bg-white/5">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div className="flex items-center gap-2">
            <Bell className="w-5 h-5 text-primary" />
            <h1 className="text-lg font-bold">푸시 알림</h1>
          </div>
        </div>
      </header>

      <div className="p-4 space-y-6">
        {/* 통계 */}
        <section className="bg-neutral-900/50 border border-neutral-800 rounded-xl p-4">
          <h2 className="text-sm font-bold text-white/80 mb-3 flex items-center gap-2">
            <Users className="w-4 h-4" /> 푸시 연결 현황
          </h2>
          {statsError && (
            <div className="mb-3 p-3 bg-amber-500/10 border border-amber-500/30 rounded-lg flex items-start gap-2 text-amber-200 text-sm">
              <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <span>{statsError}</span>
            </div>
          )}
          {loading ? (
            <div className="flex items-center gap-2 text-white/50">
              <Loader2 className="w-4 h-4 animate-spin" /> 로딩 중...
            </div>
          ) : stats ? (
            <div className="space-y-2">
              <p className="text-2xl font-bold text-primary">{stats.memberCount}명</p>
              <p className="text-sm text-white/50">푸시에 연결된 회원 · 등록 기기 {stats.totalTokens}대</p>
              {stats.totalTokens === 0 && (
                <p className="text-xs text-white/40 mt-2">앱(Android/iOS)에서 로그인 후 알림을 허용하면 여기에 표시됩니다.</p>
              )}
            </div>
          ) : !statsError ? (
            <p className="text-sm text-white/50">데이터를 불러올 수 없습니다.</p>
          ) : null}
        </section>

        {/* 내 기기 */}
        <section className="bg-neutral-900/50 border border-neutral-800 rounded-xl p-4">
          <h2 className="text-sm font-bold text-white/80 mb-3 flex items-center gap-2">
            <Smartphone className="w-4 h-4" /> 내 기기
          </h2>
          {myTokens.length === 0 ? (
            <p className="text-sm text-white/50 mb-3">앱에서 알림을 허용하면 여기에 표시됩니다.</p>
          ) : (
            <ul className="space-y-2 mb-3">
              {myTokens.map((t, i) => (
                <li key={i} className="text-sm text-white/80 flex justify-between">
                  <span className="capitalize">{t.platform}</span>
                  <span className="text-white/40 text-xs">
                    {t.updated_at ? new Date(t.updated_at).toLocaleString('ko') : '-'}
                  </span>
                </li>
              ))}
            </ul>
          )}
          {isNativeApp && (
            <>
              <button
                type="button"
                onClick={registerThisDevice}
                disabled={registering}
                className="w-full py-3 bg-primary/20 text-primary border border-primary/50 rounded-xl font-semibold flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {registering ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
                {registering ? '등록 중...' : '지금 이 기기 등록'}
              </button>
              {registerStatus && (
                <p className={`mt-2 text-sm ${registerStatus.startsWith('등록 완료') ? 'text-primary' : 'text-amber-400'}`}>
                  {registerStatus}
                </p>
              )}
            </>
          )}
          {!isNativeApp && (
            <p className="text-xs text-white/40">푸시 등록은 Android/iOS 앱에서만 가능합니다.</p>
          )}
        </section>

        {/* 토큰 연결 계정 목록 */}
        {stats && stats.tokens.length > 0 && (
          <section className="bg-neutral-900/50 border border-neutral-800 rounded-xl p-4">
            <h2 className="text-sm font-bold text-white/80 mb-3">연결된 계정 목록</h2>
            <div className="overflow-x-auto -mx-4 px-4">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="text-white/50 border-b border-neutral-800">
                    <th className="py-2 pr-2">계정</th>
                    <th className="py-2 pr-2">플랫폼</th>
                    <th className="py-2">최종 등록</th>
                  </tr>
                </thead>
                <tbody>
                  {stats.tokens.map((t, i) => (
                    <tr key={i} className="border-b border-neutral-800/50">
                      <td className="py-2 pr-2">
                        <span className="text-white/90">{t.email ?? t.name ?? t.user_id.slice(0, 8)}</span>
                      </td>
                      <td className="py-2 pr-2 capitalize text-white/70">{t.platform}</td>
                      <td className="py-2 text-white/50 text-xs">
                        {t.updated_at ? new Date(t.updated_at).toLocaleString('ko') : '-'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        )}

        {/* 테스트 발송 */}
        <section className="bg-neutral-900/50 border border-neutral-800 rounded-xl p-4">
          <h2 className="text-sm font-bold text-white/80 mb-3 flex items-center gap-2">
            <Send className="w-4 h-4" /> 테스트 발송
          </h2>
          <div className="space-y-3">
            <input
              type="text"
              placeholder="제목"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              className="w-full px-4 py-3 bg-neutral-800 border border-neutral-700 rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-primary"
            />
            <textarea
              placeholder="내용"
              value={form.body}
              onChange={(e) => setForm({ ...form, body: e.target.value })}
              rows={2}
              className="w-full px-4 py-3 bg-neutral-800 border border-neutral-700 rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-primary resize-none"
            />
            {stats && stats.tokens.length > 0 && (
              <div>
                <label className="block text-xs text-white/50 mb-1">특정 회원에게만 보내기 (선택)</label>
                <select
                  value={form.targetUserId}
                  onChange={(e) => setForm({ ...form, targetUserId: e.target.value })}
                  className="w-full px-4 py-3 bg-neutral-800 border border-neutral-700 rounded-lg text-white focus:outline-none focus:border-primary"
                >
                  <option value="">나에게만</option>
                  {stats.tokens
                    .filter((t) => t.user_id !== user?.id)
                    .reduce((acc: TokenRow[], t) => {
                      if (!acc.some((x) => x.user_id === t.user_id)) acc.push(t);
                      return acc;
                    }, [])
                    .map((t) => (
                      <option key={t.user_id} value={t.user_id}>
                        {t.email ?? t.name ?? t.user_id.slice(0, 8)}
                      </option>
                    ))}
                </select>
              </div>
            )}
            <div className="flex flex-col gap-2 pt-2">
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => sendTest('me')}
                  disabled={sending}
                  className="flex-1 py-3 bg-primary text-black font-semibold rounded-xl flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                  나에게
                </button>
                {stats && stats.memberCount > 0 && (
                  <button
                    type="button"
                    onClick={() => sendTest('user')}
                    disabled={sending || !form.targetUserId}
                    className="flex-1 py-3 bg-neutral-700 text-white font-semibold rounded-xl flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                    선택 회원
                  </button>
                )}
              </div>
              {stats && stats.memberCount > 0 && (
                <button
                  type="button"
                  onClick={() => sendTest('all')}
                  disabled={sending}
                  className="w-full py-3 bg-amber-600/80 text-white font-semibold rounded-xl flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                  전체에게 보내기
                </button>
              )}
            </div>
            {sendResult && (
              <p className={`text-sm ${sendResult.startsWith('실패') ? 'text-red-400' : 'text-primary'}`}>
                {sendResult}
              </p>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
