import { getHoldings } from "@/lib/investments";
import { InvestmentsView } from "@/components/InvestmentsView";

export const dynamic = "force-dynamic";

export default async function InvestmentsPage() {
  const holdings = await getHoldings();
  return <InvestmentsView holdings={holdings} />;
}
