"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { OPERATOR } from "@/data/demo";

// Demo sign-in. There is no credential check and nothing is sent anywhere;
// the form exists because operator identity is recorded on every receipt.
export function SignInForm() {
  const router = useRouter();
  const [email, setEmail] = useState(OPERATOR);
  const [passphrase, setPassphrase] = useState("passphrase");

  const submit = (e: FormEvent) => {
    e.preventDefault();
    router.push("/pipeline/");
  };

  return (
    <form className="login__form" onSubmit={submit}>
      <h2>Sign in</h2>
      <p>Operator identity is recorded on every receipt you write.</p>
      <label className="login__label" htmlFor="operator-email">Operator email</label>
      <input
        id="operator-email"
        className="login__input"
        type="email"
        autoComplete="username"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <label className="login__label" htmlFor="operator-passphrase">Passphrase</label>
      <input
        id="operator-passphrase"
        className="login__input"
        type="password"
        autoComplete="current-password"
        value={passphrase}
        onChange={(e) => setPassphrase(e.target.value)}
      />
      <button type="submit" className="login__submit">Enter the control room</button>
      <div className="login__notice" role="status">
        <span className="login__notice-dot" aria-hidden="true" />
        <span>Signing key rotation is due in 9 days.</span>
      </div>
    </form>
  );
}
