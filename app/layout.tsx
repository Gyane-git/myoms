// This is a reference for your ROOT app/layout.tsx.
// If you already have one, don't overwrite it — just wrap your existing
// {children} with <GlobalProviders> so Ctrl+K search, toasts, and confirm
// dialogs are available on every page.

import GlobalProviders from "@/components/global/GlobalProviders";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <GlobalProviders>{children}</GlobalProviders>
      </body>
    </html>
  );
}