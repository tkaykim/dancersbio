'use client';

import { useEffect, useRef } from 'react';
import { Capacitor } from '@capacitor/core';
import { useAuth } from '@/lib/auth-context';
import { supabase } from '@/lib/supabase';
import {
  isPushSupported,
  requestPushPermission,
  getFCMToken,
  addPushListeners,
  deleteFCMToken,
  type NotificationPayload,
} from '@/lib/push-notifications';

function usePushSetup() {
  const { user } = useAuth();
  const savedTokenRef = useRef<string | null>(null);

  useEffect(() => {
    if (!Capacitor.isNativePlatform()) return;

    let removeListeners: (() => void) | undefined;

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

    const setup = async () => {
      const supported = await isPushSupported();
      if (!supported) return;

      const granted = await requestPushPermission();
      if (!granted) return;

      if (!user?.id) return;

      let token = await getFCMToken();
      if (token) {
        savedTokenRef.current = token;
        await saveTokenToSupabase(token, user.id);
      }

      // FCM 토큰이 나중에 올 수 있음 (재시도 2회)
      const retryGetToken = async (attempt: number) => {
        if (attempt > 2) return;
        const t = await getFCMToken();
        if (t && user?.id) {
          savedTokenRef.current = t;
          await saveTokenToSupabase(t, user.id);
        } else if (user?.id) {
          setTimeout(() => retryGetToken(attempt + 1), 2000 * attempt);
        }
      };
      setTimeout(() => retryGetToken(1), 2000);
      setTimeout(() => retryGetToken(2), 5000);

      removeListeners = addPushListeners({
        onToken: async (newToken) => {
          savedTokenRef.current = newToken;
          if (user?.id) await saveTokenToSupabase(newToken, user.id);
        },
        onNotificationReceived: (_notification) => {
          // 앱이 포그라운드일 때 알림 수신 (필요 시 처리)
        },
        onNotificationActionPerformed: (payload) => {
          const link = (payload.data as { link?: string })?.link;
          if (link && typeof window !== 'undefined') {
            window.location.href = link;
          }
        },
      });
    };

    if (user?.id) setup();

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
