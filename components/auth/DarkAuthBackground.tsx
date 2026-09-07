"use client";

import {
  TrendingUp,
  PieChart,
  Users,
  Settings,
  FileText,
} from "lucide-react";

const HEX_ICONS = [
  { Icon: TrendingUp, top: "12%", left: "8%", delay: "0s" },
  { Icon: PieChart, top: "28%", left: "16%", delay: "0.4s" },
  { Icon: Users, top: "46%", left: "7%", delay: "0.8s" },
  { Icon: Settings, top: "64%", left: "15%", delay: "1.2s" },
  { Icon: FileText, top: "80%", left: "8%", delay: "1.6s" },
];

export default function DarkAuthBackground() {
  return (
    <div className="biz-bg" aria-hidden="true">
      <div className="biz-bg__dotmap" />

      {HEX_ICONS.map(({ Icon, top, left, delay }, i) => (
        <div
          key={i}
          className="biz-bg__hex"
          style={{ top, left, animationDelay: delay }}
        >
          <svg viewBox="0 0 100 100" className="biz-bg__hex-shape">
            <polygon points="50,3 95,25 95,75 50,97 5,75 5,25" />
          </svg>
          <Icon size={22} className="biz-bg__hex-icon" strokeWidth={1.6} />
        </div>
      ))}

      <svg
        className="biz-bg__skyline"
        viewBox="0 0 600 300"
        preserveAspectRatio="xMaxYMax slice"
      >
        {[
          [420, 90, 40, 210],
          [465, 130, 55, 170],
          [525, 60, 45, 240],
          [575, 150, 35, 150],
          [355, 160, 30, 140],
        ].map(([x, y, w, h], i) => (
          <rect key={i} x={x} y={y} width={w} height={h} className="biz-bg__building" />
        ))}
      </svg>

      <svg
        className="biz-bg__waves biz-bg__waves--back"
        viewBox="0 0 1440 320"
        preserveAspectRatio="none"
      >
        <path
          d="M0,160 C320,260 720,60 1440,180 L1440,320 L0,320 Z"
          className="biz-bg__wave-fill biz-bg__wave-fill--back"
        />
      </svg>
      <svg
        className="biz-bg__waves biz-bg__waves--front"
        viewBox="0 0 1440 320"
        preserveAspectRatio="none"
      >
        <path
          d="M0,220 C400,120 900,280 1440,200 L1440,320 L0,320 Z"
          className="biz-bg__wave-fill biz-bg__wave-fill--front"
        />
      </svg>

      <style jsx>{`
        .biz-bg {
          position: absolute;
          inset: 0;
          overflow: hidden;
          background: radial-gradient(
              ellipse at 30% 20%,
              rgba(199, 154, 69, 0.08) 0%,
              transparent 55%
            ),
            linear-gradient(160deg, #0f1b30 0%, #16233d 45%, #1c2b48 100%);
        }

        .biz-bg__dotmap {
          position: absolute;
          inset: 0;
          background-image: radial-gradient(
            rgba(231, 197, 131, 0.16) 1px,
            transparent 1px
          );
          background-size: 22px 22px;
          -webkit-mask-image: radial-gradient(
            ellipse 60% 55% at 55% 40%,
            black 30%,
            transparent 75%
          );
          mask-image: radial-gradient(
            ellipse 60% 55% at 55% 40%,
            black 30%,
            transparent 75%
          );
        }

        .biz-bg__hex {
          position: absolute;
          width: 64px;
          height: 64px;
          display: flex;
          align-items: center;
          justify-content: center;
          animation: biz-float 5s ease-in-out infinite;
        }
        .biz-bg__hex-shape {
          position: absolute;
          inset: 0;
          fill: rgba(255, 255, 255, 0.035);
          stroke: rgba(231, 197, 131, 0.3);
          stroke-width: 1.5;
        }
        .biz-bg__hex-icon {
          position: relative;
          color: rgba(231, 197, 131, 0.55);
        }

        .biz-bg__skyline {
          position: absolute;
          right: 0;
          bottom: 8%;
          width: min(520px, 42vw);
          height: auto;
          opacity: 0.16;
        }
        .biz-bg__building {
          fill: #e7c583;
        }

        .biz-bg__waves {
          position: absolute;
          left: 0;
          bottom: 0;
          width: 100%;
          height: 34vh;
          min-height: 220px;
        }
        .biz-bg__waves--back {
          opacity: 0.9;
          animation: biz-wave-drift 14s ease-in-out infinite;
        }
        .biz-bg__waves--front {
          opacity: 1;
          animation: biz-wave-drift 10s ease-in-out infinite reverse;
        }
        .biz-bg__wave-fill--back {
          fill: url(#biz-wave-gradient-back);
        }
        .biz-bg__wave-fill--front {
          fill: url(#biz-wave-gradient-front);
        }

        @keyframes biz-float {
          0%,
          100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-10px);
          }
        }
        @keyframes biz-wave-drift {
          0%,
          100% {
            transform: translateX(0);
          }
          50% {
            transform: translateX(-2.5%);
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .biz-bg__hex,
          .biz-bg__waves--back,
          .biz-bg__waves--front {
            animation: none !important;
          }
        }
      `}</style>

      {/* gradient defs for the waves, kept outside styled-jsx since SVG <defs> need real markup */}
      <svg width="0" height="0" style={{ position: "absolute" }}>
        <defs>
          <linearGradient id="biz-wave-gradient-back" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#1c2b48" />
            <stop offset="100%" stopColor="#0f1b30" />
          </linearGradient>
          <linearGradient id="biz-wave-gradient-front" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#0f1b30" />
            <stop offset="55%" stopColor="#152441" />
            <stop offset="100%" stopColor="#c79a45" stopOpacity="0.35" />
          </linearGradient>
        </defs>
      </svg>
    </div>
  );
}