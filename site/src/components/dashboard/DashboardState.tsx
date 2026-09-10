"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { DEFAULT_TEAM, GATES, OPERATOR, type Decision, type GateRequest } from "@/data/demo";

// Demo-only session state. Lives in a client context under the (dashboard)
// route group so it survives navigation between the five screens. It is not
// persisted: a reload starts a fresh session, and sign-out clears it.
type Decided = Record<string, Decision>;

type State = {
  operator: string;
  team: readonly number[];
  decided: Decided;
  openGates: readonly GateRequest[];
  toggleSlot: (slot: number) => void;
  clearTeam: () => void;
  decide: (id: string, decision: Decision) => void;
  signOut: () => void;
};

const Ctx = createContext<State | null>(null);

export function DashboardStateProvider({ children }: { children: ReactNode }) {
  const [team, setTeam] = useState<readonly number[]>(DEFAULT_TEAM);
  const [decided, setDecided] = useState<Decided>({});

  const toggleSlot = useCallback((slot: number) => {
    setTeam((t) => (t.includes(slot) ? t.filter((x) => x !== slot) : [...t, slot].sort((a, b) => a - b)));
  }, []);
  const clearTeam = useCallback(() => setTeam([]), []);
  const decide = useCallback((id: string, decision: Decision) => {
    // A denied ACL verdict blocks approval. Deny stays available: fail closed.
    const gate = GATES.find((g) => g.id === id);
    if (!gate) return;
    if (decision === "APPROVE" && gate.aclVerdict === "denied") return;
    setDecided((d) => ({ ...d, [id]: decision }));
  }, []);
  const signOut = useCallback(() => {
    setTeam(DEFAULT_TEAM);
    setDecided({});
  }, []);

  const value = useMemo<State>(
    () => ({
      operator: OPERATOR,
      team,
      decided,
      openGates: GATES.filter((g) => !decided[g.id]),
      toggleSlot,
      clearTeam,
      decide,
      signOut,
    }),
    [team, decided, toggleSlot, clearTeam, decide, signOut],
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useDashboard(): State {
  const v = useContext(Ctx);
  if (!v) throw new Error("useDashboard must be used inside DashboardStateProvider");
  return v;
}

/** Scroll to top on screen change; the prototype does this on every view switch. */
export function useScrollTop(dep: unknown) {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [dep]);
}
