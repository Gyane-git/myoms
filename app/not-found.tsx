"use client";

import { Compass } from "lucide-react";
import StatusScreen from "@/components/StatusScreen";

export default function NotFound() {
  return (
    <StatusScreen
      code="404"
      icon={Compass}
      title="This page doesn't exist"
      message="The page you're looking for may have been moved, renamed, or never existed. Check the address, or head back to the dashboard."
      primaryAction={{ label: "Go to dashboard", href: "/dashboard" }}
      secondaryAction={{ label: "Go back", onClick: () => history.back() }}
    />
  );
}