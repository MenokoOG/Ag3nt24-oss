import type { Metadata } from "next";
import { RosterActivation } from "@/components/dashboard/RosterActivation";

export const metadata: Metadata = { title: "HADES — Roster activation" };

export default function RosterPage() {
  return <RosterActivation />;
}
