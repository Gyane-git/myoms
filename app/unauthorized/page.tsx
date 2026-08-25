"use client";

import { ShieldAlert } from "lucide-react";
import StatusScreen from "@/components/StatusScreen";

export default function UnauthorizedPage() {
  return (
    <StatusScreen
      code="403"
      icon={ShieldAlert}
      title="You don't have access"
      message="Your account doesn't have permission to view this page. If you think this is a mistake, contact your system administrator."
      primaryAction={{ label: "Go to dashboard", href: "/dashboard" }}
      secondaryAction={{ label: "Sign in as a different user", href: "/login" }}
    />
  );
}