import { getAnalytics } from "@/lib/dashboard";

export const dynamic = "force-dynamic";

const fmt = (minor: number) => (minor / 100).toLocaleString("ru-RU", { maximumFractionDigits: 0 });

function Donut({ segments }: { segments: { pct: number; color: string }[] }) {
  let acc = 0;
  const stops =
    segments.length === 0
      ? "var(--block) 0deg 360deg"
      : segments
          .map((s) => {
            const a = acc * 360;
            acc += s.pct;
            return `${s.color} ${a.toFixed(1)}deg ${(acc * 360).toFixed(1)}deg`;
          })
          .join(", ");
  return <div className="donut" style={{ background: `conic-gradient(${stops})` }} />;
}

export default async function AnalyticsPage() {
  const { monthCategories, monthExpense, trend } = await getAnalytics();
  const trendMax = Math.max(...trend.flatMap((t) => [t.incomeMinor, t.expenseMinor]), 1);

  return (
    <>
      <h1 className="page-title">Аналитика</h1>

      <div className="dash-cols">
        {/* Categories donut */}
        <div className="card">
          <div className="card-head">
            <span className="t">Категории · месяц</span>
            <span className="muted small">{fmt(monthExpense)} ₽</span>
          </div>
          {monthCategories.length === 0 ? (
            <div className="muted small">Пока нет расходов в этом месяце.</div>
          ) : (
            <>
              <div className="donut-wrap">
                <Donut segments={monthCategories} />
                <div className="donut-center">
                  <div className="annot">Всего</div>
                  <div className="num" style={{ fontSize: 18, fontWeight: 600 }}>{fmt(monthExpense)}</div>
                </div>
              </div>
              <div className="legend">
                {monthCategories.map((c) => (
                  <div className="legend-row" key={c.name}>
                    <span className="legend-dot" style={{ background: c.color }} />
                    <span className="grow">{(c.icon ? c.icon + " " : "") + c.name}</span>
                    <span className="muted num small">{Math.round(c.pct * 100)}%</span>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>

        {/* 6-month income vs expense */}
        <div className="card">
          <div className="card-head">
            <span className="t">Доход vs Расход</span>
            <span className="muted small">6 месяцев</span>
          </div>
          <div className="trend">
            {trend.map((m, i) => (
              <div className="trend-col" key={i}>
                <div className="trend-bars">
                  <div className="tb in" style={{ height: `${Math.round((m.incomeMinor / trendMax) * 110)}px` }} />
                  <div className="tb out" style={{ height: `${Math.round((m.expenseMinor / trendMax) * 110)}px` }} />
                </div>
                <div className="d">{m.label}</div>
              </div>
            ))}
          </div>
          <div className="legend-inline">
            <span><span className="legend-dot" style={{ background: "var(--accent)" }} /> Доход</span>
            <span><span className="legend-dot" style={{ background: "var(--warm)" }} /> Расход</span>
          </div>
        </div>
      </div>

      {/* Category breakdown list */}
      <div className="card mt">
        <div className="card-head">
          <span className="t">По категориям</span>
        </div>
        {monthCategories.length === 0 ? (
          <div className="muted small">Нет данных.</div>
        ) : (
          monthCategories.map((c) => (
            <div className="cat-row" key={c.name}>
              <span className="cat-dot" style={{ background: "transparent", border: `2px solid ${c.color}` }} />
              <div className="meta">
                <div className="line1">
                  <span className="name">{(c.icon ? c.icon + " " : "") + c.name}</span>
                  <span className="amt num">{fmt(c.valueMinor)} ₽</span>
                </div>
                <div className="progress">
                  <span style={{ width: `${Math.round(c.pct * 100)}%`, background: c.color }} />
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </>
  );
}
