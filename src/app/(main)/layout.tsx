import { getFormData } from "@/lib/dashboard";
import { isAiEnabled } from "@/lib/lemonade";
import { auth } from "@/auth";
import { AppShell } from "@/components/AppShell";

export const dynamic = "force-dynamic";

export default async function MainLayout({ children }: { children: React.ReactNode }) {
  const { accountsForForms, leafCategories } = await getFormData();

  let userName = "Я";
  try {
    const session = await auth();
    const u = session?.user as { name?: string | null; email?: string | null } | undefined;
    userName = u?.name || u?.email || "Я";
  } catch {
    // auth disabled or no session — keep default
  }

  const today = new Date().toLocaleDateString("ru-RU", { weekday: "long", day: "numeric", month: "long" });

  return (
    <AppShell
      accounts={accountsForForms}
      categories={leafCategories}
      aiEnabled={isAiEnabled()}
      userName={userName}
      today={today}
    >
      {children}
    </AppShell>
  );
}
