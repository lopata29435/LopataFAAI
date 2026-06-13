import { z } from "zod";

const ParsedExpense = z.object({
  amount: z.number().nullable().optional(),
  currency: z.string().optional(),
  type: z.enum(["expense", "income"]).optional(),
  category: z.string().nullable().optional(),
  note: z.string().nullable().optional(),
  date: z.string().nullable().optional(),
});
export type ParsedExpense = z.infer<typeof ParsedExpense>;

export function isAiEnabled(): boolean {
  return !!process.env.LEMONADE_BASE_URL;
}

/**
 * Parse a free-text expense line via Lemonade Server (OpenAI-compatible).
 * Throws if AI is disabled or the call fails — callers decide how to degrade.
 */
export async function parseExpenseText(text: string, categoryNames: string[]): Promise<ParsedExpense> {
  const base = process.env.LEMONADE_BASE_URL;
  if (!base) throw new Error("AI disabled");
  const model = process.env.LEMONADE_MODEL || "Qwen3-Coder-30B-A3B-Instruct-GGUF";
  const today = new Date().toISOString().slice(0, 10);

  const system = [
    "Ты парсер бытовых расходов и доходов. Вход — короткая фраза на русском.",
    "Верни СТРОГО один JSON-объект, без markdown и пояснений.",
    "Поля:",
    "- amount: число в основной валютной единице (без знака валюты), либо null;",
    "- currency: ISO-код валюты, по умолчанию RUB;",
    "- type: 'expense' или 'income';",
    "- category: ближайшая по смыслу из СПИСКА ниже (точное название) или null;",
    `- note: краткое описание или null;`,
    `- date: дата в формате YYYY-MM-DD (сегодня = ${today}; учитывай «вчера», «позавчера» и т.п.).`,
    "СПИСОК категорий: " + categoryNames.join("; "),
  ].join("\n");

  const res = await fetch(`${base}/chat/completions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: "Bearer lemonade",
    },
    body: JSON.stringify({
      model,
      temperature: 0,
      max_tokens: 300,
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: system },
        { role: "user", content: text },
      ],
    }),
    signal: AbortSignal.timeout(30_000),
  });

  if (!res.ok) throw new Error(`Lemonade HTTP ${res.status}`);
  const data = await res.json();
  const content: string = data?.choices?.[0]?.message?.content ?? "{}";

  let obj: unknown;
  try {
    obj = JSON.parse(content);
  } catch {
    obj = JSON.parse(content.replace(/```json|```/g, "").trim());
  }
  return ParsedExpense.parse(obj);
}
