import { getGoals } from "@/lib/goals";
import { GoalsView } from "@/components/GoalsView";

export const dynamic = "force-dynamic";

export default async function GoalsPage() {
  const goals = await getGoals();
  return <GoalsView goals={goals} />;
}
