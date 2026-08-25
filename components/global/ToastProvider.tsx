"use client";

import {
  createContext,
  useCallback,
  useContext,
  useRef,
  useState,
} from "react";
import { CheckCircle2, XCircle, Info, AlertTriangle, X } from "lucide-react";

type ToastVariant = "success" | "error" | "info" | "warning";

type Toast = {
  id: number;
  variant: ToastVariant;
  title: string;
  description?: string;
};

type ToastOptions = {
  title: string;
  description?: string;
  duration?: number; // ms, default 4000
};

type ToastContextValue = {
  success: (opts: ToastOptions | string) => void;
  error: (opts: ToastOptions | string) => void;
  info: (opts: ToastOptions | string) => void;
  warning: (opts: ToastOptions | string) => void;
};

const ToastContext = createContext<ToastContextValue | null>(null);

const VARIANT_META: Record<
  ToastVariant,
  { icon: typeof CheckCircle2; color: string; bg: string }
> = {
  success: { icon: CheckCircle2, color: "#2f9e5c", bg: "#f0faf4" },
  error: { icon: XCircle, color: "#c0392b", bg: "#fdf2f1" },
  info: { icon: Info, color: "#1c2b48", bg: "#f2f4f8" },
  warning: { icon: AlertTriangle, color: "#c79a45", bg: "#fbf5ea" },
};

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const idRef = useRef(0);

  const remove = useCallback((id: number) => {
    setToasts((t) => t.filter((toast) => toast.id !== id));
  }, []);

  const push = useCallback(
    (variant: ToastVariant, opts: ToastOptions | string) => {
      const normalized: ToastOptions =
        typeof opts === "string" ? { title: opts } : opts;
      const id = ++idRef.current;
      setToasts((t) => [
        ...t,
        {
          id,
          variant,
          title: normalized.title,
          description: normalized.description,
        },
      ]);
      const duration = normalized.duration ?? 4000;
      setTimeout(() => remove(id), duration);
    },
    [remove]
  );

  const value: ToastContextValue = {
    success: (opts) => push("success", opts),
    error: (opts) => push("error", opts),
    info: (opts) => push("info", opts),
    warning: (opts) => push("warning", opts),
  };

  return (
    <ToastContext.Provider value={value}>
      {children}

      <div className="biz-toast-stack">
        {toasts.map((toast) => {
          const meta = VARIANT_META[toast.variant];
          const Icon = meta.icon;
          return (
            <div
              key={toast.id}
              className="biz-toast"
              style={{ background: meta.bg, borderColor: meta.color }}
              role="status"
            >
              <Icon size={17} style={{ color: meta.color, flexShrink: 0 }} />
              <div className="biz-toast__body">
                <p className="biz-toast__title">{toast.title}</p>
                {toast.description && (
                  <p className="biz-toast__description">{toast.description}</p>
                )}
              </div>
              <button
                className="biz-toast__close"
                onClick={() => remove(toast.id)}
                aria-label="Dismiss"
              >
                <X size={14} />
              </button>
            </div>
          );
        })}
      </div>

      <style jsx>{`
        .biz-toast-stack {
          position: fixed;
          bottom: 20px;
          right: 20px;
          z-index: 10000;
          display: flex;
          flex-direction: column;
          gap: 8px;
          width: min(340px, calc(100vw - 32px));
        }
        .biz-toast {
          display: flex;
          align-items: flex-start;
          gap: 10px;
          padding: 12px 12px;
          border: 1px solid;
          border-radius: 8px;
          box-shadow: 0 8px 24px rgba(28, 43, 72, 0.12);
          animation: biz-toast-in 0.2s ease-out;
        }
        .biz-toast__body {
          flex: 1;
          min-width: 0;
        }
        .biz-toast__title {
          margin: 0;
          font-family: ui-sans-serif, system-ui, -apple-system, sans-serif;
          font-size: 13.5px;
          font-weight: 600;
          color: #1c2b48;
        }
        .biz-toast__description {
          margin: 2px 0 0;
          font-family: ui-sans-serif, system-ui, -apple-system, sans-serif;
          font-size: 12.5px;
          color: #5a6274;
          line-height: 1.4;
        }
        .biz-toast__close {
          background: none;
          border: none;
          padding: 2px;
          cursor: pointer;
          color: #8890a0;
          flex-shrink: 0;
        }
        .biz-toast__close:hover {
          color: #1c2b48;
        }
        @keyframes biz-toast-in {
          from {
            opacity: 0;
            transform: translateY(6px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    throw new Error("useToast must be used within <ToastProvider>");
  }
  return ctx;
}