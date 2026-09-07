"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { Clock } from "lucide-react";
import { useIdleTimer } from "@/lib/useIdleTimer";

const WARNING_SECONDS = 60;

// Auth pages shouldn't run the idle timer — nothing to time out yet.
const EXEMPT_PREFIXES = ["/login", "/forgot-password", "/unauthorized", "/select-fiscal-year", "/select-company"];

export default function IdleTimeoutWarning() {
  const pathname = usePathname();
  const [warning, setWarning] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(WARNING_SECONDS);
  const countdownRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const disabled = EXEMPT_PREFIXES.some((p) => pathname?.startsWith(p));

  const stopCountdown = () => {
    if (countdownRef.current) clearInterval(countdownRef.current);
  };

  const handleTimeout = () => {
    stopCountdown();
    // Replace with your real sign-out call, e.g.:
    // await authFetch("/api/auth/logout", { method: "POST" });
    if (typeof window !== "undefined") {
      window.location.href = "/login?reason=idle";
    }
  };

  const { reset } = useIdleTimer({
    idleTimeout: 14 * 60 * 1000, // warn at 14 min idle
    warningDuration: WARNING_SECONDS * 1000, // 60s to respond
    disabled,
    onWarn: () => {
      setSecondsLeft(WARNING_SECONDS);
      setWarning(true);
      countdownRef.current = setInterval(() => {
        setSecondsLeft((s) => {
          if (s <= 1) {
            stopCountdown();
            return 0;
          }
          return s - 1;
        });
      }, 1000);
    },
    onTimeout: handleTimeout,
  });

  useEffect(() => stopCountdown, []);

  const staysignedIn = () => {
    stopCountdown();
    setWarning(false);
    reset();
  };

  if (!warning) return null;

  return (
    <div className="biz-idle-overlay">
      <div className="biz-idle-dialog" role="alertdialog" aria-modal="true">
        <div className="biz-idle-dialog__icon">
          <Clock size={18} />
        </div>
        <h2 className="biz-idle-dialog__title">Still there?</h2>
        <p className="biz-idle-dialog__description">
          You've been inactive for a while. For your account's security,
          you'll be signed out in <strong>{secondsLeft}s</strong> unless you
          stay signed in.
        </p>
        <div className="biz-idle-dialog__actions">
          <button
            className="biz-idle-dialog__btn biz-idle-dialog__btn--secondary"
            onClick={handleTimeout}
          >
            Sign out now
          </button>
          <button
            className="biz-idle-dialog__btn biz-idle-dialog__btn--primary"
            onClick={staysignedIn}
            autoFocus
          >
            Stay signed in
          </button>
        </div>
      </div>

      <style jsx>{`
        .biz-idle-overlay {
          position: fixed;
          inset: 0;
          background: rgba(19, 31, 54, 0.5);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 10003;
          padding: 20px;
        }
        .biz-idle-dialog {
          width: 100%;
          max-width: 360px;
          background: #fff;
          border-radius: 10px;
          padding: 22px;
          box-shadow: 0 20px 50px rgba(19, 31, 54, 0.28);
        }
        .biz-idle-dialog__icon {
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
        .biz-idle-dialog__title {
          margin: 0 0 6px;
          font-family: Georgia, "Times New Roman", serif;
          font-size: 17px;
          font-weight: 600;
          color: #1c2b48;
        }
        .biz-idle-dialog__description {
          margin: 0 0 18px;
          font-family: ui-sans-serif, system-ui, -apple-system, sans-serif;
          font-size: 13px;
          line-height: 1.55;
          color: #5a6274;
        }
        .biz-idle-dialog__description strong {
          color: #c0392b;
          font-variant-numeric: tabular-nums;
        }
        .biz-idle-dialog__actions {
          display: flex;
          justify-content: flex-end;
          gap: 8px;
        }
        .biz-idle-dialog__btn {
          padding: 8px 16px;
          border-radius: 6px;
          font-family: ui-sans-serif, system-ui, -apple-system, sans-serif;
          font-size: 13px;
          font-weight: 500;
          cursor: pointer;
          border: 1px solid transparent;
        }
        .biz-idle-dialog__btn--secondary {
          background: transparent;
          border-color: rgba(28, 43, 72, 0.16);
          color: #1c2b48;
        }
        .biz-idle-dialog__btn--secondary:hover {
          background: rgba(28, 43, 72, 0.05);
        }
        .biz-idle-dialog__btn--primary {
          background: #1c2b48;
          color: #fff;
        }
        .biz-idle-dialog__btn--primary:hover {
          opacity: 0.92;
        }
      `}</style>
    </div>
  );
}