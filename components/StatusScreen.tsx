"use client";

import Image from "next/image";
import type { LucideIcon } from "lucide-react";

type StatusAction = {
  label: string;
  href?: string;
  onClick?: () => void;
};

type StatusScreenProps = {
  code?: string;
  icon: LucideIcon;
  title: string;
  message: string;
  primaryAction: StatusAction;
  secondaryAction?: StatusAction;
};

export default function StatusScreen({
  code,
  icon: Icon,
  title,
  message,
  primaryAction,
  secondaryAction,
}: StatusScreenProps) {
  return (
    <div className="biz-status">
      <Image
        src="/biz-logo.png"
        alt="BIZ — Business Integration System"
        width={72}
        height={72}
        className="biz-status__logo"
      />

      <div className="biz-status__icon">
        <Icon size={22} strokeWidth={1.75} />
      </div>

      {code && <p className="biz-status__code">{code}</p>}

      <h1 className="biz-status__title">{title}</h1>
      <p className="biz-status__message">{message}</p>

      <div className="biz-status__actions">
        {primaryAction.href ? (
          <a href={primaryAction.href} className="biz-status__btn biz-status__btn--primary">
            {primaryAction.label}
          </a>
        ) : (
          <button onClick={primaryAction.onClick} className="biz-status__btn biz-status__btn--primary">
            {primaryAction.label}
          </button>
        )}

        {secondaryAction &&
          (secondaryAction.href ? (
            <a href={secondaryAction.href} className="biz-status__btn biz-status__btn--secondary">
              {secondaryAction.label}
            </a>
          ) : (
            <button onClick={secondaryAction.onClick} className="biz-status__btn biz-status__btn--secondary">
              {secondaryAction.label}
            </button>
          ))}
      </div>

      <style jsx>{`
        .biz-status {
          --biz-bg: #faf9f6;
          --biz-navy: #1c2b48;
          --biz-gold: #c79a45;
          --biz-gold-light: #e7c583;
          --biz-muted: #8890a0;

          min-height: 100vh;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 14px;
          padding: 24px;
          background: var(--biz-bg);
          text-align: center;
        }

        .biz-status__logo {
          width: 56px;
          height: auto;
          opacity: 0.9;
          margin-bottom: 6px;
        }

        .biz-status__icon {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 44px;
          height: 44px;
          border-radius: 999px;
          border: 1.5px solid var(--biz-gold);
          color: var(--biz-gold);
          margin-bottom: 4px;
        }

        .biz-status__code {
          margin: 0;
          font-family: ui-sans-serif, system-ui, -apple-system, sans-serif;
          font-size: 11px;
          font-weight: 600;
          letter-spacing: 0.18em;
          text-transform: uppercase;
          color: var(--biz-gold);
        }

        .biz-status__title {
          margin: 0;
          font-family: Georgia, "Times New Roman", serif;
          font-size: clamp(22px, 3vw, 28px);
          font-weight: 600;
          color: var(--biz-navy);
        }

        .biz-status__message {
          margin: 0;
          max-width: 380px;
          font-family: ui-sans-serif, system-ui, -apple-system, sans-serif;
          font-size: 14px;
          line-height: 1.6;
          color: var(--biz-muted);
        }

        .biz-status__actions {
          display: flex;
          gap: 10px;
          margin-top: 18px;
          flex-wrap: wrap;
          justify-content: center;
        }

        .biz-status__btn {
          font-family: ui-sans-serif, system-ui, -apple-system, sans-serif;
          font-size: 13px;
          font-weight: 500;
          padding: 9px 20px;
          border-radius: 6px;
          cursor: pointer;
          border: 1px solid transparent;
          transition: opacity 0.15s ease, background 0.15s ease;
        }

        .biz-status__btn--primary {
          background: var(--biz-navy);
          color: #fff;
        }
        .biz-status__btn--primary:hover {
          opacity: 0.9;
        }

        .biz-status__btn--secondary {
          background: transparent;
          border-color: rgba(28, 43, 72, 0.2);
          color: var(--biz-navy);
        }
        .biz-status__btn--secondary:hover {
          background: rgba(28, 43, 72, 0.05);
        }
      `}</style>
    </div>
  );
}