import { getDashboard } from "@/lib/dashboard";
import { TxList } from "@/components/TxList";

export const dynamic = "force-dynamic";

const fmt = (minor: number) => (minor / 100).toLocaleString("ru-RU", { maximumFractionDigits: 0 });
const toneColor: Record<string, string> = {
  positive: "var(--positive)",
  warm: "var(--warm)",
  neutral: "var(--text-mute)",
};

function Spark({ values, stroke }: { values: number[]; stroke: string }) {
  const w = 50;
  const h = 18;
  if (values.length < 2) return null;
  const max = Math.max(...values, 1);
  const min = Math.min(...values, 0);
  const pts = values
    .map((v, i) => `${((i / (values.length - 1)) * w).toFixed(1)},${(h - ((v - min) / (max - min || 1)) * h).toFixed(1)}`)
    .join(" ");
  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} style={{ display: "block" }}>
      <polyline points={pts} fill="none" stroke={stroke} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export default async function Dashboard() {
  const { stats, spend7, topCategories, recent, accountsForForms, leafCategories } = await getDashboard(
    process.env.BASE_CURRENCY ?? "RUB",
  );

  const monthLabel = new Date().toLocaleDateString("ru-RU", { month: "long", year: "numeric" });
  const month = monthLabel.charAt(0).toUpperCase() + monthLabel.slice(1);
  const barMax = Math.max(...spend7.map((s) => s.valueMinor), 1);
  const hotIdx = spend7.reduce((best, s, i, arr) => (s.valueMinor > arr[best].valueMinor ? i : best), 0);
  const avg7 = Math.round(spend7.reduce((a, s) => a + s.valueMinor, 0) / 7);

  return (
    <>
      <header className="appbar mobile-only">
        <div className="avatar">Я</div>
        <div className="grow">
          <div className="title">Привет</div>
          <div className="sub">{month}</div>
        </div>
        <span className="chip">RUB</span>
      </header>

      <div className="dash">
        <section className="hero">
          <div className="annot warm">Цели · копилки</div>
          <div className="big">Поставь первую цель</div>
          <div className="muted" style={{ fontSize: 13, marginTop: 6 }}>
            Будем копить вместе и подсвечивать ближайшую цель прямо здесь.
          </div>
          <div className="cta">+ Создать копилку</div>
        </section>

        <div className="stat-grid">
          {stats.map((s) => (
            <div className="stat-card" key={s.label}>
              <div className="annot">{s.label}</div>
              <div className="v num">
                {fmt(s.valueMinor)} <small>₽</small>
              </div>
              <div className="foot">
                {s.deltaPct != null ? (
                  <span className="delta" style={{ color: toneColor[s.tone] }}>
                    {s.deltaPct > 0 ? "+" : ""}
                    {s.deltaPct}%
                  </span>
                ) : (
                  <span />
                )}
                {s.spark.length > 1 && <Spark values={s.spark} stroke={toneColor[s.tone]} />}
              </div>
            </div>
          ))}
        </div>

        <div className="dash-cols">
          <div className="card">
            <div className="card-head">
              <span className="t">Траты за 7 дней</span>
              <span className="muted small">сред. {fmt(avg7)} ₽/день</span>
            </div>
            <div className="bars">
              {spend7.map((s, i) => (
                <div className="col" key={i}>
                  <div
                    className={"bar" + (i === hotIdx && s.valueMinor > 0 ? " hot" : "")}
                    style={{ height: `${Math.max(4, Math.round((s.valueMinor / barMax) * 52))}px` }}
                  />
                  <div className="d">{s.label}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="card">
            <div className="card-head">
              <span className="t">Топ категорий</span>
              <span className="muted small">этот месяц</span>
            </div>
            {topCategories.length === 0 ? (
              <div className="muted small">Пока нет расходов в этом месяце.</div>
            ) : (
              topCategories.map((c) => (
                <div className="cat-row" key={c.name}>
                  <span className="cat-dot">{c.icon ?? "•"}</span>
                  <div className="meta">
                    <div className="line1">
                      <span className="name">{c.name}</span>
                      <span className="amt num">{fmt(c.valueMinor)} ₽</span>
                    </div>
                    <div className="progress">
                      <span style={{ width: `${Math.round(c.pct * 100)}%` }} />
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <div>
          <div className="day-head">
            <span className="t">Последние операции</span>
          </div>
          <div className="card">
            <TxList rows={recent} accounts={accountsForForms} categories={leafCategories} />
          </div>
        </div>
      </div>
    </>
  );
}
