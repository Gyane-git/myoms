"use client";

import { useEffect } from "react";
import { AlertTriangle } from "lucide-react";
import StatusScreen from "@/components/StatusScreen";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Send to your logging/monitoring service here.
    console.error(error);
  }, [error]);

  return (
    <StatusScreen
      code="Something went wrong"
      icon={AlertTriangle}
      title="Unexpected error"
      message={
        error.digest
          ? `An error occurred while loading this page. Reference: ${error.digest}`
          : "An error occurred while loading this page. Try again, and if it keeps happening, let your admin know."
      }
      primaryAction={{ label: "Try again", onClick: reset }}
      secondaryAction={{ label: "Go to dashboard", href: "/dashboard" }}
    />
  );
}