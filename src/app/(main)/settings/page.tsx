import { auth, signOut } from "@/auth";

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  let session = null;
  try {
    session = await auth();
  } catch {
    // auth disabled
  }
  const u = session?.user as { name?: string | null; email?: string | null } | undefined;
  const name = u?.name || u?.email || "Я";
  const email = u?.email || "—";
  const authOn = process.env.AUTH_ENABLED === "true";

  return (
    <>
      <h1 className="page-title">Профиль</h1>

      <div className="card">
        <div className="row" style={{ gap: 12 }}>
          <span className="avatar" style={{ width: 48, height: 48, fontSize: 20 }}>
            {name.charAt(0).toUpperCase()}
          </span>
          <div>
            <div style={{ fontWeight: 600, fontSize: 16 }}>{name}</div>
            <div className="muted small">{email}</div>
          </div>
        </div>
      </div>

      <div className="card mt">
        <div className="set-row">
          <span>Базовая валюта</span>
          <span className="muted">{process.env.BASE_CURRENCY ?? "RUB"}</span>
        </div>
        <div className="set-row">
          <span>Вход</span>
          <span className="muted">{authOn ? "ZITADEL (включён)" : "выключен"}</span>
        </div>
        <div className="set-row">
          <span>Семейный бюджет</span>
          <span className="muted">скоро</span>
        </div>
        <div className="set-row">
          <span>Версия</span>
          <span className="muted mono">Phase 2</span>
        </div>
      </div>

      {authOn && (
        <form
          action={async () => {
            "use server";
            await signOut({ redirectTo: "/api/auth/signin" });
          }}
        >
          <button type="submit" className="btn btn-danger mt" style={{ width: "100%" }}>
            Выйти
          </button>
        </form>
      )}
    </>
  );
}
