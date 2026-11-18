"use client";

import { useActionState } from "react";
import { LoaderCircle } from "lucide-react";
import { login, type LoginState } from "@/server/actions/auth";

export default function LoginForm() {
  const [state, action, pending] = useActionState<LoginState, FormData>(login, {});

  return (
    <form action={action} className="form">
      {state.error && (
        <div className="form-alert" role="alert">
          {state.error}
        </div>
      )}
      <div className="field">
        <label htmlFor="email">Email</label>
        <input
          id="email"
          name="email"
          type="email"
          autoComplete="username"
          required
          defaultValue={state.email}
          autoFocus
        />
      </div>
      <div className="field">
        <label htmlFor="password">Password</label>
        <input id="password" name="password" type="password" autoComplete="current-password" required />
      </div>
      <button className="btn btn-accent" type="submit" disabled={pending}>
        {pending && <LoaderCircle className="spin" size={16} aria-hidden="true" />}
        {pending ? "Signing in…" : "Sign in"}
      </button>
    </form>
  );
}
