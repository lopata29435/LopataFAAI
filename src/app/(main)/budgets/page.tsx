import { getBudgets } from "@/lib/budgets";
import { getFormData } from "@/lib/dashboard";
import { BudgetsView } from "@/components/BudgetsView";

export const dynamic = "force-dynamic";

export default async function BudgetsPage() {
  const [budgets, form] = await Promise.all([getBudgets(), getFormData()]);
  return <BudgetsView budgets={budgets} categories={form.leafCategories.filter((c) => c.kind === "expense")} />;
}
