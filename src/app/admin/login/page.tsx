import type { Metadata } from "next";
import LoginForm from "@/components/admin/LoginForm";
import "@/styles/admin.css";

export const metadata: Metadata = {
  title: "Sign in",
  robots: { index: false, follow: false },
};

export default function LoginPage() {
  return (
    <main id="main" className="login">
      <div className="login-art" aria-hidden="true">
        <span />
        <span />
      </div>
      <div className="login-panel">
        <div>
          <p className="eyebrow">
            <span className="split-mark" aria-hidden="true" /> The Desk
          </p>
          <h1 style={{ marginTop: "var(--space-4)" }}>Sign in to manage your portfolio</h1>
        </div>
        <LoginForm />
        <p className="field-hint">
          Private area. There is no public sign-up; accounts are created with <code>npm run admin:create</code>.
        </p>
      </div>
    </main>
  );
}
