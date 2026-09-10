import type { Metadata } from "next";
import { SignInForm } from "@/components/dashboard/SignInForm";
import { asset } from "@/lib/asset";

export const metadata: Metadata = { title: "HADES — Sign in" };

export default function SignInPage() {
  return (
    <div className="dash">
      <div className="login">
        <div className="login__art">
          <div className="login__flare" aria-hidden="true" />
          <div className="login__brand">
            <img src={asset("/assets/hades-mark.png")} alt="" />
            <strong>HADES</strong>
            <span className="login__brand-tag">control room</span>
          </div>
          <div className="login__copy">
            <img
              src={asset("/assets/hades-emblem.png")}
              alt="HADES emblem: an operator pressing a gold signature seal at a gate between a legacy estate and a receipt chain"
              className="login__emblem"
            />
            <h1 className="login__title">Nothing changes state before the signature.</h1>
            <p>You are signing on behalf of a person, not a process. Every decision you make here writes exactly one receipt, hash-chained to the one before it.</p>
          </div>
          <div className="login__owner">classHuman AI LLC · Apache-2.0 · #WDVACHAI26</div>
        </div>
        <div className="login__form-wrap">
          <SignInForm />
        </div>
      </div>
    </div>
  );
}
