"use client";

import { useEffect, useRef } from "react";

type UseIdleTimerOptions = {
  /** ms of inactivity before the warning fires. Default 14 min. */
  idleTimeout?: number;
  /** ms the warning stays up before auto-logout. Default 60s. */
  warningDuration?: number;
  onWarn: () => void;
  onTimeout: () => void;
  /** Pause tracking entirely (e.g. while the warning modal itself is open, still allow "Stay signed in" to reset). */
  disabled?: boolean;
};

const ACTIVITY_EVENTS: (keyof WindowEventMap)[] = [
  "mousemove",
  "mousedown",
  "keydown",
  "scroll",
  "touchstart",
];

export function useIdleTimer({
  idleTimeout = 14 * 60 * 1000,
  warningDuration = 60 * 1000,
  onWarn,
  onTimeout,
  disabled = false,
}: UseIdleTimerOptions) {
  const warnTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const logoutTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clear = () => {
    if (warnTimer.current) clearTimeout(warnTimer.current);
    if (logoutTimer.current) clearTimeout(logoutTimer.current);
  };

  const reset = () => {
    clear();
    if (disabled) return;
    warnTimer.current = setTimeout(() => {
      onWarn();
      logoutTimer.current = setTimeout(onTimeout, warningDuration);
    }, idleTimeout);
  };

  useEffect(() => {
    if (disabled) {
      clear();
      return;
    }
    reset();
    ACTIVITY_EVENTS.forEach((evt) => window.addEventListener(evt, reset));
    return () => {
      clear();
      ACTIVITY_EVENTS.forEach((evt) => window.removeEventListener(evt, reset));
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [disabled, idleTimeout, warningDuration]);

  return { reset };
}