"use client";

import { useEffect, useState } from "react";
import Image from "next/image";

type LoadingScreenProps = {
  /** Controlled progress 0–100. Omit to auto-simulate a natural boot sequence. */
  progress?: number;
  /** Small status line under the progress bar, e.g. "Connecting to workspace…" */
  label?: string;
};

const AUTO_STEPS = [
  { at: 0, label: "Starting BIZ" },
  { at: 20, label: "Authenticating session" },
  { at: 45, label: "Syncing company data" },
  { at: 70, label: "Loading modules" },
  { at: 92, label: "Almost there" },
];

export default function LoadingScreen({
  progress,
  label,
}: LoadingScreenProps) {
  const [autoProgress, setAutoProgress] = useState(0);
  const isControlled = typeof progress === "number";

  useEffect(() => {
    if (isControlled) return;
    let raf: ReturnType<typeof setTimeout>;
    const tick = () => {
      setAutoProgress((p) => {
        if (p >= 96) return p;
        const remaining = 96 - p;
        const next = p + Math.max(0.4, remaining * 0.06);
        return Math.min(96, next);
      });
      raf = setTimeout(tick, 90);
    };
    raf = setTimeout(tick, 90);
    return () => clearTimeout(raf);
  }, [isControlled]);

  const value = isControlled ? progress! : autoProgress;
  const statusLabel =
    label ??
    [...AUTO_STEPS].reverse().find((s) => value >= s.at)?.label ??
    "Starting BIZ";

  return (
    <div className="biz-loading" role="status" aria-live="polite">
      <div className="biz-loading__stage">
        <svg
          className="biz-loading__circuits"
          viewBox="0 0 400 300"
          preserveAspectRatio="xMidYMid meet"
          aria-hidden="true"
        >
          {[70, 110, 150].map((y, i) => (
            <g key={y}>
              <line
                x1="0"
                y1={y}
                x2="150"
                y2={y}
                className="biz-loading__wire"
                style={{ animationDelay: `${i * 0.35}s` }}
              />
              <circle
                cx="150"
                cy={y}
                r="5"
                className="biz-loading__node"
                style={{ animationDelay: `${i * 0.35}s` }}
              />
              <circle
                r="3.2"
                className="biz-loading__pulse"
                style={{ animationDelay: `${i * 0.35}s` }}
              >
                <animateMotion
                  dur="1.8s"
                  repeatCount="indefinite"
                  begin={`${i * 0.35}s`}
                  path={`M0,${y} L150,${y}`}
                />
              </circle>
            </g>
          ))}
        </svg>

        <div className="biz-loading__mark">
          <Image
            src="/biz-logo.png"
            alt="BIZ — Business Integration System"
            width={280}
            height={280}
            priority
            className="biz-loading__logo"
          />
        </div>
      </div>

      <div className="biz-loading__bar-track">
        <div
          className="biz-loading__bar-fill"
          style={{ width: `${value}%` }}
        />
      </div>

      <div className="biz-loading__status">
        <span>{statusLabel}</span>
        <span className="biz-loading__pct">{Math.round(value)}%</span>
      </div>

      <style jsx>{`
        .biz-loading {
          --biz-bg: #faf9f6;
          --biz-navy: #1c2b48;
          --biz-gold: #c79a45;
          --biz-gold-light: #e7c583;
          --biz-muted: #8890a0;

          position: fixed;
          inset: 0;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 28px;
          background: var(--biz-bg);
          z-index: 9999;
        }

        .biz-loading__stage {
          position: relative;
          width: min(280px, 60vw);
          height: min(280px, 60vw);
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .biz-loading__circuits {
          position: absolute;
          inset: -30% -10% -30% -60%;
          width: 220%;
          height: 160%;
          overflow: visible;
        }

        .biz-loading__wire {
          stroke: var(--biz-gold-light);
          stroke-width: 1.5;
          opacity: 0;
          animation: biz-wire-in 0.6s ease-out forwards;
        }

        .biz-loading__node {
          fill: var(--biz-bg);
          stroke: var(--biz-gold);
          stroke-width: 2;
          opacity: 0;
          animation: biz-wire-in 0.6s ease-out forwards;
        }

        .biz-loading__pulse {
          fill: var(--biz-gold);
          opacity: 0.9;
        }

        .biz-loading__mark {
          position: relative;
          z-index: 1;
          animation: biz-fade-up 0.7s ease-out both;
        }

        .biz-loading__logo {
          width: 100%;
          height: auto;
          animation: biz-breathe 3.2s ease-in-out infinite;
        }

        .biz-loading__bar-track {
          width: min(280px, 60vw);
          height: 3px;
          border-radius: 999px;
          background: rgba(28, 43, 72, 0.1);
          overflow: hidden;
        }

        .biz-loading__bar-fill {
          height: 100%;
          border-radius: 999px;
          background: linear-gradient(
            90deg,
            var(--biz-gold) 0%,
            var(--biz-gold-light) 100%
          );
          transition: width 0.3s ease-out;
        }

        .biz-loading__status {
          display: flex;
          align-items: center;
          gap: 10px;
          font-family: ui-sans-serif, system-ui, -apple-system, sans-serif;
          font-size: 11px;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          color: var(--biz-muted);
        }

        .biz-loading__pct {
          color: var(--biz-navy);
          font-variant-numeric: tabular-nums;
          min-width: 2.6em;
        }

        @keyframes biz-wire-in {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        @keyframes biz-fade-up {
          from {
            opacity: 0;
            transform: translateY(8px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes biz-breathe {
          0%,
          100% {
            filter: drop-shadow(0 0 0 rgba(199, 154, 69, 0));
          }
          50% {
            filter: drop-shadow(0 0 18px rgba(199, 154, 69, 0.25));
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .biz-loading__logo,
          .biz-loading__wire,
          .biz-loading__node,
          .biz-loading__mark {
            animation: none !important;
            opacity: 1 !important;
          }
          .biz-loading__pulse {
            display: none;
          }
        }
      `}</style>
    </div>
  );
}