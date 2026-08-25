"use client";

import Image from "next/image";

export default function AuthLayout({
  eyebrow,
  title,
  subtitle,
  children,
  footer,
}: {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
}) {
  return (
    <div className="biz-auth">
      <div className="biz-auth__panel">
        <svg
          className="biz-auth__circuits"
          viewBox="0 0 300 220"
          preserveAspectRatio="xMidYMid slice"
          aria-hidden="true"
        >
          {[40, 80, 120].map((y) => (
            <g key={y}>
              <line x1="0" y1={y} x2="120" y2={y} className="biz-auth__wire" />
              <circle cx="120" cy={y} r="4" className="biz-auth__node" />
            </g>
          ))}
        </svg>

        <div className="biz-auth__brand">
          <Image
            src="/biz-logo.png"
            alt="BIZ — Business Integration System"
            width={64}
            height={64}
          />
        </div>

        <div className="biz-auth__copy">
          <h2>Business Integration System</h2>
          <p>One workspace for your accounts, sales, purchase and inventory.</p>
        </div>
      </div>

      <div className="biz-auth__form-side">
        <div className="biz-auth__card">
          {eyebrow && <span className="biz-auth__eyebrow">{eyebrow}</span>}
          <h1 className="biz-auth__title">{title}</h1>
          {subtitle && <p className="biz-auth__subtitle">{subtitle}</p>}

          <div className="biz-auth__body">{children}</div>

          {footer && <div className="biz-auth__footer">{footer}</div>}
        </div>
      </div>

      <style jsx>{`
        .biz-auth {
          --biz-bg: #faf9f6;
          --biz-navy: #1c2b48;
          --biz-navy-deep: #131f36;
          --biz-gold: #c79a45;
          --biz-gold-light: #e7c583;
          --biz-muted: #8890a0;
          --biz-border: rgba(28, 43, 72, 0.12);

          min-height: 100vh;
          display: grid;
          grid-template-columns: 1fr;
        }

        @media (min-width: 900px) {
          .biz-auth {
            grid-template-columns: 1fr 1fr;
          }
        }

        .biz-auth__panel {
          display: none;
          position: relative;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 28px;
          padding: 48px;
          background: linear-gradient(160deg, var(--biz-navy) 0%, var(--biz-navy-deep) 100%);
          overflow: hidden;
        }

        @media (min-width: 900px) {
          .biz-auth__panel {
            display: flex;
          }
        }

        .biz-auth__circuits {
          position: absolute;
          left: -10%;
          top: 8%;
          width: 60%;
          height: 60%;
          opacity: 0.35;
        }
        .biz-auth__wire {
          stroke: var(--biz-gold-light);
          stroke-width: 1.2;
        }
        .biz-auth__node {
          fill: var(--biz-navy);
          stroke: var(--biz-gold);
          stroke-width: 1.5;
        }

        .biz-auth__brand {
          position: relative;
          z-index: 1;
          background: var(--biz-bg);
          border-radius: 16px;
          padding: 14px;
        }

        .biz-auth__copy {
          position: relative;
          z-index: 1;
          text-align: center;
          max-width: 320px;
        }
        .biz-auth__copy h2 {
          margin: 0 0 8px;
          font-family: Georgia, "Times New Roman", serif;
          font-size: 20px;
          color: #fff;
          letter-spacing: 0.02em;
        }
        .biz-auth__copy p {
          margin: 0;
          font-family: ui-sans-serif, system-ui, -apple-system, sans-serif;
          font-size: 13px;
          line-height: 1.6;
          color: rgba(255, 255, 255, 0.65);
        }

        .biz-auth__form-side {
          display: flex;
          align-items: center;
          justify-content: center;
          background: var(--biz-bg);
          padding: 32px 20px;
        }

        .biz-auth__card {
          width: 100%;
          max-width: 360px;
        }

        .biz-auth__eyebrow {
          display: inline-block;
          font-family: ui-sans-serif, system-ui, -apple-system, sans-serif;
          font-size: 11px;
          font-weight: 600;
          letter-spacing: 0.16em;
          text-transform: uppercase;
          color: var(--biz-gold);
          margin-bottom: 10px;
        }

        .biz-auth__title {
          margin: 0 0 6px;
          font-family: Georgia, "Times New Roman", serif;
          font-size: 26px;
          font-weight: 600;
          color: var(--biz-navy);
        }

        .biz-auth__subtitle {
          margin: 0 0 24px;
          font-family: ui-sans-serif, system-ui, -apple-system, sans-serif;
          font-size: 13.5px;
          color: var(--biz-muted);
        }

        .biz-auth__body {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .biz-auth__footer {
          margin-top: 22px;
          padding-top: 18px;
          border-top: 1px solid var(--biz-border);
          font-family: ui-sans-serif, system-ui, -apple-system, sans-serif;
          font-size: 13px;
          color: var(--biz-muted);
          text-align: center;
        }
      `}</style>
    </div>
  );
}