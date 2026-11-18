import type { Metadata } from "next";
import { Suspense } from "react";
import AdminShell from "@/components/admin/AdminShell";
import { requireAdmin } from "@/server/auth/session";
import { getUnreadCount } from "@/server/dal/admin";
import "@/styles/admin.css";

/** The admin reads the session on every request, so it may block on navigation. */
export const instant = false;

export const metadata: Metadata = {
  title: { default: "Admin", template: "%s — Admin" },
  robots: { index: false, follow: false },
};

async function Gate({ children }: { children: React.ReactNode }) {
  // Coarse gate; every page/action/DAL call also calls requireAdmin().
  const session = await requireAdmin();
  const unread = await getUnreadCount();
  return (
    <AdminShell user={session.user} unread={unread}>
      {children}
    </AdminShell>
  );
}

function Loading() {
  return (
    <div className="login" aria-busy="true">
      <p className="mono muted" style={{ margin: "auto" }}>
        Loading the desk…
      </p>
    </div>
  );
}

export default function PanelLayout({ children }: LayoutProps<"/admin">) {
  return (
    <Suspense fallback={<Loading />}>
      <Gate>{children}</Gate>
    </Suspense>
  );
}
