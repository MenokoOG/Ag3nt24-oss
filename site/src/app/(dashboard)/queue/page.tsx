import type { Metadata } from "next";
import { AuthorizationQueue } from "@/components/dashboard/AuthorizationQueue";

export const metadata: Metadata = { title: "HADES — Authorization queue" };

export default function QueuePage() {
  return <AuthorizationQueue />;
}
