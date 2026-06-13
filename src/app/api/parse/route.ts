import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { getDb, schema } from "@/db";
import { isAiEnabled, parseExpenseText } from "@/lib/lemonade";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  if (!isAiEnabled()) {
    return NextResponse.json({ disabled: true, error: "AI parsing is disabled" }, { status: 501 });
  }
  const body = await req.json().catch(() => null);
  const text = body?.text;
  if (!text || typeof text !== "string") {
    return NextResponse.json({ error: "text is required" }, { status: 400 });
  }

  const db = getDb();
  const cats = await db
    .select({ name: schema.categories.name })
    .from(schema.categories)
    .where(eq(schema.categories.isArchived, false));

  try {
    const parsed = await parseExpenseText(text, cats.map((c) => c.name));
    return NextResponse.json({ parsed });
  } catch (e) {
    const message = e instanceof Error ? e.message : "parse failed";
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
