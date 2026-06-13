import { getAccountsWithBalances } from "@/lib/balances";
import { AccountsView } from "@/components/AccountsView";

export const dynamic = "force-dynamic";

export default async function AccountsPage() {
  const accounts = await getAccountsWithBalances();
  return <AccountsView accounts={accounts} />;
}
