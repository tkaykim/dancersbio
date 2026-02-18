'use client';

import { createContext, useCallback, useContext, useState } from 'react';

export interface ToastItem {
  id: string;
  title: string;
  body?: string;
  link?: string;
}

type ToastContextValue = {
  toasts: ToastItem[];
  showToast: (title: string, body?: string, link?: string) => void;
  dismissToast: (id: string) => void;
};

const ToastContext = createContext<ToastContextValue | null>(null);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const showToast = useCallback((title: string, body?: string, link?: string) => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
    setToasts((prev) => [...prev, { id, title, body, link }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  }, []);

  const dismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ toasts, showToast, dismissToast }}>
      {children}
      <ToastList />
    </ToastContext.Provider>
  );
}

function ToastList() {
  const ctx = useContext(ToastContext);
  if (!ctx) return null;
  const { toasts, dismissToast } = ctx;
  if (toasts.length === 0) return null;
  return (
    <div className="fixed top-0 left-0 right-0 z-[9999] flex flex-col gap-2 p-3 pointer-events-none safe-area-inset-top">
      <div className="flex flex-col gap-2 pointer-events-auto">
        {toasts.map((t) => (
          <div
            key={t.id}
            role="alert"
            className="bg-neutral-800 border border-neutral-600 rounded-xl shadow-lg p-4 max-w-[calc(100vw-24px)] animate-in slide-in-from-top-2 duration-200"
          >
            <div className="flex justify-between items-start gap-2">
              <div className="min-w-0 flex-1">
                <p className="font-semibold text-white text-sm">{t.title}</p>
                {t.body && (
                  <p className="text-white/80 text-xs mt-0.5 line-clamp-2">{t.body}</p>
                )}
              </div>
              <button
                type="button"
                onClick={() => dismissToast(t.id)}
                className="flex-shrink-0 text-white/50 hover:text-white text-sm p-1 -m-1"
                aria-label="닫기"
              >
                ✕
              </button>
            </div>
            {t.link && (
              <a
                href={t.link}
                className="mt-2 block text-primary text-xs font-medium"
                onClick={() => dismissToast(t.id)}
              >
                보기
              </a>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) return { showToast: () => {}, dismissToast: () => {}, toasts: [] };
  return ctx;
}
