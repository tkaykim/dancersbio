'use client';

import { Capacitor } from '@capacitor/core';
import { FirebaseMessaging } from '@capacitor-firebase/messaging';

const isNative = () => Capacitor.isNativePlatform();

export async function isPushSupported(): Promise<boolean> {
  if (!isNative()) return false;
  try {
    const { isSupported } = await FirebaseMessaging.isSupported();
    return isSupported;
  } catch {
    return false;
  }
}

export async function checkPushPermission(): Promise<'granted' | 'denied' | 'prompt' | 'prompt-with-rationale'> {
  if (!isNative()) return 'denied';
  const { receive } = await FirebaseMessaging.checkPermissions();
  return receive as 'granted' | 'denied' | 'prompt' | 'prompt-with-rationale';
}

export async function requestPushPermission(): Promise<boolean> {
  if (!isNative()) return false;
  const { receive } = await FirebaseMessaging.requestPermissions();
  return receive === 'granted';
}

export async function getFCMToken(): Promise<string | null> {
  if (!isNative()) return null;
  try {
    const { token } = await FirebaseMessaging.getToken();
    return token;
  } catch {
    return null;
  }
}

export async function deleteFCMToken(): Promise<void> {
  if (!isNative()) return;
  await FirebaseMessaging.deleteToken();
}

export type NotificationPayload = {
  title?: string;
  body?: string;
  data?: Record<string, unknown>;
};

export function addPushListeners(callbacks: {
  onToken?: (token: string) => void;
  onNotificationReceived?: (notification: NotificationPayload) => void;
  onNotificationActionPerformed?: (notification: NotificationPayload & { actionId?: string }) => void;
}): () => void {
  if (!isNative()) return () => {};

  const removers: Array<() => Promise<void>> = [];

  FirebaseMessaging.addListener('tokenReceived', (event) => {
    callbacks.onToken?.(event.token);
  }).then((h) => removers.push(h.remove));

  FirebaseMessaging.addListener('notificationReceived', (event) => {
    callbacks.onNotificationReceived?.({
      title: event.notification.title,
      body: event.notification.body,
      data: event.notification.data as Record<string, unknown> | undefined,
    });
  }).then((h) => removers.push(h.remove));

  FirebaseMessaging.addListener('notificationActionPerformed', (event) => {
    callbacks.onNotificationActionPerformed?.({
      title: event.notification.title,
      body: event.notification.body,
      data: event.notification.data as Record<string, unknown> | undefined,
      actionId: event.actionId,
    });
  }).then((h) => removers.push(h.remove));

  return () => {
    removers.forEach((r) => r());
  };
}
