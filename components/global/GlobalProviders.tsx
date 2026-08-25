"use client";

import { ToastProvider } from "@/components/global/ToastProvider";
import { ConfirmProvider } from "@/components/global/ConfirmProvider";
import CommandPalette from "@/components/global/CommandPalette";

export default function GlobalProviders({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ToastProvider>
      <ConfirmProvider>
        {children}
        <CommandPalette />
      </ConfirmProvider>
    </ToastProvider>
  );
}