"use client";

import { createContext, useCallback, useContext, useState } from "react";
import { AlertTriangle } from "lucide-react";

type ConfirmOptions = {
  title: string;
  description?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  destructive?: boolean;
};

type ConfirmContextValue = (options: ConfirmOptions) => Promise<boolean>;

const ConfirmContext = createContext<ConfirmContextValue | null>(null);

type PendingConfirm = ConfirmOptions & {
  resolve: (value: boolean) => void;
};

export function ConfirmProvider({ children }: { children: React.ReactNode }) {
  const [pending, setPending] = useState<PendingConfirm | null>(null);

  const confirm = useCallback((options: ConfirmOptions) => {
    return new Promise<boolean>((resolve) => {
      setPending({ ...options, resolve });
    });
  }, []);

  const close = (result: boolean) => {
    pending?.resolve(result);
    setPending(null);
  };

  return (
    <ConfirmContext.Provider value={confirm}>
      {children}

      {pending && (
        <div className="biz-confirm-overlay" onClick={() => close(false)}>
          <div
            className="biz-confirm-dialog"
            role="alertdialog"
            aria-modal="true"
            onClick={(e) => e.stopPropagation()}
          >
            <div
              className="biz-confirm-dialog__icon"
              data-destructive={pending.destructive ? "true" : "false"}
            >
              <AlertTriangle size={18} />
            </div>
            <h2 className="biz-confirm-dialog__title">{pending.title}</h2>
            {pending.description && (
              <p className="biz-confirm-dialog__description">
                {pending.description}
              </p>
            )}
            <div className="biz-confirm-dialog__actions">
              <button
                className="biz-confirm-dialog__btn biz-confirm-dialog__btn--cancel"
                onClick={() => close(false)}
              >
                {pending.cancelLabel ?? "Cancel"}
              </button>
              <button
                className="biz-confirm-dialog__btn biz-confirm-dialog__btn--confirm"
                data-destructive={pending.destructive ? "true" : "false"}
                onClick={() => close(true)}
                autoFocus
              >
                {pending.confirmLabel ?? "Confirm"}
              </button>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        .biz-confirm-overlay {
          position: fixed;
          inset: 0;
          background: rgba(19, 31, 54, 0.45);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 10001;
          padding: 20px;
          animation: biz-fade-in 0.15s ease-out;
        }
        .biz-confirm-dialog {
          width: 100%;
          max-width: 360px;
          background: #fff;
          border-radius: 10px;
          padding: 22px;
          box-shadow: 0 20px 50px rgba(19, 31, 54, 0.25);
          animation: biz-pop-in 0.16s ease-out;
        }
        .biz-confirm-dialog__icon {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 36px;
          height: 36px;
          border-radius: 999px;
          background: #fbf5ea;
          color: #c79a45;
          margin-bottom: 12px;
        }
        .biz-confirm-dialog__icon[data-destructive="true"] {
          background: #fdf2f1;
          color: #c0392b;
        }
        .biz-confirm-dialog__title {
          margin: 0 0 6px;
          font-family: Georgia, "Times New Roman", serif;
          font-size: 17px;
          font-weight: 600;
          color: #1c2b48;
        }
        .biz-confirm-dialog__description {
          margin: 0 0 18px;
          font-family: ui-sans-serif, system-ui, -apple-system, sans-serif;
          font-size: 13px;
          line-height: 1.55;
          color: #5a6274;
        }
        .biz-confirm-dialog__actions {
          display: flex;
          justify-content: flex-end;
          gap: 8px;
        }
        .biz-confirm-dialog__btn {
          padding: 8px 16px;
          border-radius: 6px;
          font-family: ui-sans-serif, system-ui, -apple-system, sans-serif;
          font-size: 13px;
          font-weight: 500;
          cursor: pointer;
          border: 1px solid transparent;
        }
        .biz-confirm-dialog__btn--cancel {
          background: transparent;
          border-color: rgba(28, 43, 72, 0.16);
          color: #1c2b48;
        }
        .biz-confirm-dialog__btn--cancel:hover {
          background: rgba(28, 43, 72, 0.05);
        }
        .biz-confirm-dialog__btn--confirm {
          background: #1c2b48;
          color: #fff;
        }
        .biz-confirm-dialog__btn--confirm[data-destructive="true"] {
          background: #c0392b;
        }
        .biz-confirm-dialog__btn--confirm:hover {
          opacity: 0.92;
        }
        @keyframes biz-fade-in {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
        @keyframes biz-pop-in {
          from {
            opacity: 0;
            transform: scale(0.97);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
      `}</style>
    </ConfirmContext.Provider>
  );
}

export function useConfirm() {
  const ctx = useContext(ConfirmContext);
  if (!ctx) {
    throw new Error("useConfirm must be used within <ConfirmProvider>");
  }
  return ctx;
}