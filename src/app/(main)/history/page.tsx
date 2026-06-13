import { getHistory, getFormData } from "@/lib/dashboard";
import { HistoryView } from "@/components/HistoryView";

export const dynamic = "force-dynamic";

export default async function HistoryPage() {
  const [rows, form] = await Promise.all([getHistory(), getFormData()]);
  return <HistoryView rows={rows} accounts={form.accountsForForms} categories={form.leafCategories} />;
}
