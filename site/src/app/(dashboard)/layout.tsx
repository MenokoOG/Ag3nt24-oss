import type { ReactNode } from "react";
import { DashboardStateProvider } from "@/components/dashboard/DashboardState";
import { Shell } from "@/components/dashboard/Shell";

// The five dashboard screens share this layout. Route-group layouts persist
// across navigation, so the demo session state in the provider survives
// moving between Pipeline, Roster activation, Queue, Telemetry and Ledger.
export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <DashboardStateProvider>
      <Shell>{children}</Shell>
    </DashboardStateProvider>
  );
}
