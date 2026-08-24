import AppShell from "@/components/dashboard/AppShell";

export default function MasterLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AppShell>{children}</AppShell>;
}