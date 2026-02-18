'use client';

import { useEffect, useRef } from 'react';
import { Capacitor } from '@capacitor/core';
import { useAuth } from '@/lib/auth-context';
import { supabase } from '@/lib/supabase';
import {
  checkPushPermission,
  requestPushPermission,
  getFCMToken,
  addPushListeners,
  deleteFCMToken,
} from '@/lib/push-notifications';

function usePushSetup() {
  const { user } = useAuth();
  const savedTokenRef = useRef<string | null>(null);
  const userIdRef = useRef<string | null>(null);

  async function saveTokenToSupabase(token: string, userId: string) {
    const platform = Capacitor.getPlatform() === 'ios' ? 'ios' : Capacitor.getPlatform() === 'android' ? 'android' : 'web';
    const { error } = await supabase.from('push_tokens').upsert(
      { user_id: userId, token, platform, updated_at: new Date().toISOString() },
      { onConflict: 'user_id,platform' }
    );
    if (error && typeof window !== 'undefined') {
      console.warn('[Push] 토큰 저장 실패:', error.message);
    }
  }

  useEffect(() => {
    userIdRef.current = user?.id ?? null;
  }, [user?.id]);

  // 1) 네이티브 진입 시 토큰 수신 리스너 등록(토큰이 비동기로 올 수 있음) + 권한 확인 후 getFCMToken 시도
  useEffect(() => {
    if (!Capacitor.isNativePlatform()) return;

    const removeListeners = addPushListeners({
      onToken: (token) => {
        savedTokenRef.current = token;
        const uid = userIdRef.current;
        if (uid) saveTokenToSupabase(token, uid);
      },
      onNotificationReceived: () => {},
      onNotificationActionPerformed: () => {},
    });

    const requestAndGetToken = async (): Promise<boolean> => {
      const status = await checkPushPermission();
      if (status === 'granted') {
        const token = await getFCMToken();
        if (token) savedTokenRef.current = token;
        return true;
      }
      if (status === 'denied') return false;
      const granted = await requestPushPermission();
      if (granted) {
        const token = await getFCMToken();
        if (token) savedTokenRef.current = token;
      }
      return granted;
    };

    const id2Ref = { current: null as ReturnType<typeof setTimeout> | null };
    const id1 = setTimeout(() => {
      requestAndGetToken().then((ok) => {
        if (!ok) id2Ref.current = setTimeout(requestAndGetToken, 3500);
      });
    }, 1800);

    return () => {
      removeListeners();
      clearTimeout(id1);
      if (id2Ref.current != null) clearTimeout(id2Ref.current);
    };
  }, []);

  // 2) 로그인 시 ref에 있는 토큰을 DB에 저장 + 재시도
  useEffect(() => {
    if (!Capacitor.isNativePlatform() || !user?.id) return;

    let removeListeners: (() => void) | undefined;

    const setupForUser = async () => {
      let token = savedTokenRef.current ?? (await getFCMToken());
      if (token) {
        savedTokenRef.current = token;
        await saveTokenToSupabase(token, user.id);
      }
      const retryGetToken = async (attempt: number) => {
        if (attempt > 5) return;
        const t = savedTokenRef.current ?? (await getFCMToken());
        if (t) {
          savedTokenRef.current = t;
          await saveTokenToSupabase(t, user.id);
        } else {
          setTimeout(() => retryGetToken(attempt + 1), 1500 * attempt);
        }
      };
      setTimeout(() => retryGetToken(1), 1000);
      setTimeout(() => retryGetToken(2), 3000);
      setTimeout(() => retryGetToken(3), 6000);
      setTimeout(() => retryGetToken(4), 10000);

      removeListeners = addPushListeners({
        onToken: async (newToken) => {
          savedTokenRef.current = newToken;
          await saveTokenToSupabase(newToken, user.id);
        },
        onNotificationReceived: () => {},
        onNotificationActionPerformed: (payload) => {
          const link = (payload.data as { link?: string })?.link;
          if (link && typeof window !== 'undefined') {
            window.location.href = link;
          }
        },
      });
    };

    setupForUser();

    return () => {
      removeListeners?.();
    };
  }, [user?.id]);

  // 로그인 직후 이미 발급된 토큰이 있으면 저장
  useEffect(() => {
    if (!Capacitor.isNativePlatform() || !user?.id || !savedTokenRef.current) return;
    const platform = Capacitor.getPlatform() === 'ios' ? 'ios' : Capacitor.getPlatform() === 'android' ? 'android' : 'web';
    supabase
      .from('push_tokens')
      .upsert(
        { user_id: user.id, token: savedTokenRef.current, platform, updated_at: new Date().toISOString() },
        { onConflict: 'user_id,platform' }
      )
      .then(({ error }) => {
        if (error) console.warn('[Push] 토큰 저장 실패:', error.message);
      });
  }, [user?.id]);

  // 로그아웃 시에만 토큰 삭제 및 DB에서 제거 (초기 로딩 시 user null 제외)
  const prevUserRef = useRef(user?.id);
  useEffect(() => {
    if (!Capacitor.isNativePlatform()) return;
    const hadUser = prevUserRef.current != null;
    const hasUser = user?.id != null;
    prevUserRef.current = user?.id ?? undefined;
    if (!hadUser || hasUser) return;

    const cleanup = async () => {
      if (savedTokenRef.current) {
        try {
          await supabase.from('push_tokens').delete().eq('token', savedTokenRef.current);
        } catch (_) {}
        savedTokenRef.current = null;
      }
      await deleteFCMToken();
    };
    cleanup();
  }, [user?.id]);
}

export default function PushNotificationProvider({ children }: { children: React.ReactNode }) {
  usePushSetup();
  return <>{children}</>;
}
