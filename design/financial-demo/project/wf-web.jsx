// Web / desktop dashboard. Sidebar + topbar + content grid. Dark Material 3.
// Width 1280, height 736 (inside Chrome window 1280x820).

function WebSidebarItem({ label, icon, active, sub }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 12,
      padding: '10px 14px', borderRadius: 12,
      background: active ? WF.accentSoft : 'transparent',
      cursor: 'pointer',
    }}>
      <div style={{
        width: 20, height: 20, borderRadius: 5,
        background: active ? WF.accent : WF.blockDark, flexShrink: 0,
      }} />
      <div style={{
        fontSize: 13, fontWeight: active ? 600 : 500,
        color: active ? WF.accent : WF.text, flex: 1,
      }}>{label}</div>
      {sub && (
        <div style={{
          fontSize: 10, color: WF.textMute, fontFamily: WF.mono,
        }}>{sub}</div>
      )}
    </div>
  );
}

function WebStat({ label, value, delta, deltaColor, sparkValues, sparkStroke }) {
  return (
    <WFCard p={20} style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      <WFAnnot>{label}</WFAnnot>
      <div style={{
        fontSize: 28, fontWeight: 600, color: WF.text,
        letterSpacing: -0.6, fontVariantNumeric: 'tabular-nums',
      }}>
        {value} <span style={{ fontSize: 14, color: WF.textMute, fontWeight: 400 }}>₽</span>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ fontSize: 12, color: deltaColor, fontWeight: 600 }}>{delta}</div>
        <WFSparkline w={80} h={28} values={sparkValues} stroke={sparkStroke} />
      </div>
    </WFCard>
  );
}

function WebDashboard() {
  const cats = [
    { n: 'Продукты',  v: 32, c: WF.accent },
    { n: 'Кафе',      v: 18, c: WF.warm },
    { n: 'Транспорт', v: 14, c: '#7C9C8E' },
    { n: 'Дом',       v: 12, c: '#C8A47C' },
    { n: 'Прочее',    v: 24, c: WF.blockDark },
  ];
  return (
    <div style={{
      width: '100%', height: '100%',
      display: 'flex',
      background: WF.bg, color: WF.text,
      fontFamily: WF.font, overflow: 'hidden',
    }}>
      {/* ───── Sidebar ───── */}
      <div style={{
        width: 240, padding: '20px 14px 16px',
        background: WF.surface, borderRight: `1px solid ${WF.divider}`,
        display: 'flex', flexDirection: 'column', gap: 6,
        flexShrink: 0,
      }}>
        {/* Logo / product */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '4px 8px 18px' }}>
          <div style={{
            width: 32, height: 32, borderRadius: 10, background: WF.accent,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <div style={{ fontSize: 16, fontWeight: 700, color: WF.bg }}>₽</div>
          </div>
          <div>
            <div style={{ fontSize: 14, fontWeight: 600, letterSpacing: -0.3 }}>Копилка</div>
            <div style={{ fontSize: 10, color: WF.textMute, fontFamily: WF.mono }}>Personal finance</div>
          </div>
        </div>

        <WebSidebarItem label="Главная" active />
        <WebSidebarItem label="История" sub="142" />
        <WebSidebarItem label="Аналитика" />
        <WebSidebarItem label="Бюджет" sub="68%" />
        <WebSidebarItem label="Копилки" sub="4" />
        <WebSidebarItem label="Счета" sub="3" />
        <WebSidebarItem label="Инвестиции" />
        <WebSidebarItem label="Подписки" sub="6" />

        <div style={{ flex: 1 }} />

        {/* Family group card */}
        <div style={{
          padding: 14, borderRadius: 14, background: WF.card,
          display: 'flex', flexDirection: 'column', gap: 10,
        }}>
          <WFAnnot>Совместный бюджет</WFAnnot>
          <div style={{ fontSize: 13, fontWeight: 600 }}>Семья «Иваненко»</div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex' }}>
              {[['А', WF.accentSoft, WF.accent], ['М', WF.warmSoft, WF.warm], ['К', WF.block, WF.text]].map(([l, bg, fg], i) => (
                <WFCircle key={i} size={26} bg={bg} style={{ marginLeft: i ? -8 : 0, border: `2px solid ${WF.card}` }}>
                  <div style={{ fontSize: 11, fontWeight: 600, color: fg }}>{l}</div>
                </WFCircle>
              ))}
            </div>
            <div style={{ fontSize: 11, color: WF.accent, fontWeight: 600 }}>3 чел →</div>
          </div>
        </div>

        <WebSidebarItem label="Настройки" />
      </div>

      {/* ───── Main column ───── */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>

        {/* Top bar */}
        <div style={{
          height: 68, padding: '0 28px',
          display: 'flex', alignItems: 'center', gap: 20,
          borderBottom: `1px solid ${WF.divider}`,
          flexShrink: 0,
        }}>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 19, fontWeight: 600, letterSpacing: -0.3 }}>Привет, Алиса</div>
            <div style={{ fontSize: 11, color: WF.textMute, fontFamily: WF.mono }}>понедельник, 25 мая 2026</div>
          </div>

          {/* Search */}
          <div style={{
            width: 320, height: 38, borderRadius: 100, background: WF.surface,
            display: 'flex', alignItems: 'center', gap: 10, padding: '0 16px',
            border: `1px solid ${WF.divider}`,
          }}>
            <WFIcon size={16} bg={WF.blockDark} />
            <div style={{ fontSize: 12, color: WF.textMute, flex: 1 }}>Поиск по тратам, категориям…</div>
            <WFChip bg={WF.block} color={WF.textMute} style={{ fontSize: 10, padding: '2px 8px' }}>⌘K</WFChip>
          </div>

          <WFChip bg={WF.block} color={WF.text}>RUB</WFChip>

          <div style={{
            display: 'flex', alignItems: 'center', gap: 6,
            padding: '6px 12px 6px 6px', borderRadius: 100,
            background: WF.accent, color: WF.bg, fontWeight: 600, fontSize: 12,
          }}>
            <WFCircle size={24} bg="rgba(0,0,0,0.15)">
              <div style={{ fontSize: 14, color: WF.bg, fontWeight: 700, marginTop: -1 }}>+</div>
            </WFCircle>
            Новая трата
          </div>

          <WFCircle size={36} bg={WF.accentSoft}>
            <div style={{ fontSize: 13, fontWeight: 600, color: WF.accent }}>А</div>
          </WFCircle>
        </div>

        {/* Scroll body */}
        <div style={{ flex: 1, overflow: 'hidden', padding: '20px 28px' }}>

          {/* ── Stat row: 4 cards ── */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 16 }}>
            <WebStat
              label="Чистые активы" value="284 670" delta="↑ 4,6% к апрелю"
              deltaColor={WF.positive} sparkValues={[5,4,7,6,8,7,11,9,12,14]} sparkStroke={WF.positive}
            />
            <WebStat
              label="Доход · май" value="128 000" delta="↑ 12%"
              deltaColor={WF.positive} sparkValues={[2,3,5,4,7,6,9]} sparkStroke={WF.accent}
            />
            <WebStat
              label="Расход · май" value="48 320" delta="↓ 8%"
              deltaColor={WF.warm} sparkValues={[9,7,8,6,5,7,4]} sparkStroke={WF.warm}
            />
            <WebStat
              label="Инвестиции" value="52 410" delta="↑ 2,1%"
              deltaColor={WF.positive} sparkValues={[3,4,4,5,4,5,6,7]} sparkStroke={WF.accent}
            />
          </div>

          {/* ── 3-column grid: trend (wide) + donut + budget ── */}
          <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr 1fr', gap: 16, marginBottom: 16 }}>

            {/* Trend chart */}
            <WFCard p={20}>
              <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 14 }}>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 600, color: WF.text }}>Доход vs Расход</div>
                  <div style={{ fontSize: 11, color: WF.textMute, marginTop: 2 }}>последние 6 месяцев</div>
                </div>
                <div style={{ display: 'flex', gap: 10, fontSize: 11 }}>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, color: WF.textMute }}>
                    <div style={{ width: 8, height: 8, borderRadius: 4, background: WF.accent }} />Доход
                  </span>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, color: WF.textMute }}>
                    <div style={{ width: 8, height: 8, borderRadius: 4, background: WF.warm }} />Расход
                  </span>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-around', height: 130 }}>
                {[
                  { in: 78, out: 32, m: 'Дек' },
                  { in: 60, out: 42, m: 'Янв' },
                  { in: 70, out: 38, m: 'Фев' },
                  { in: 65, out: 50, m: 'Мар' },
                  { in: 68, out: 44, m: 'Апр' },
                  { in: 100, out: 56, m: 'Май' },
                ].map((b, i) => (
                  <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
                    <div style={{ display: 'flex', alignItems: 'flex-end', gap: 4 }}>
                      <WFBar h={b.in} w={14} bg={i === 5 ? WF.accent : WF.accentSoft} r={4} />
                      <WFBar h={b.out} w={14} bg={i === 5 ? WF.warm : WF.warmSoft} r={4} />
                    </div>
                    <div style={{
                      fontSize: 10, color: i === 5 ? WF.text : WF.textMute,
                      fontWeight: i === 5 ? 600 : 400, fontFamily: WF.mono,
                    }}>{b.m}</div>
                  </div>
                ))}
              </div>
            </WFCard>

            {/* Donut categories */}
            <WFCard p={20}>
              <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 14 }}>
                <div style={{ fontSize: 14, fontWeight: 600, color: WF.text }}>Категории</div>
                <div style={{ fontSize: 11, color: WF.accent, fontWeight: 600 }}>Все →</div>
              </div>
              <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 12 }}>
                <WFDonut
                  size={140} thickness={16} segments={cats}
                  center={
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ fontSize: 10, color: WF.textMute, fontFamily: WF.mono }}>Всего</div>
                      <div style={{ fontSize: 18, fontWeight: 600, color: WF.text, letterSpacing: -0.3 }}>48 320</div>
                    </div>
                  }
                />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {cats.slice(0, 3).map((c) => (
                  <div key={c.n} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <div style={{ width: 8, height: 8, borderRadius: 4, background: c.c }} />
                    <div style={{ fontSize: 12, color: WF.text, flex: 1 }}>{c.n}</div>
                    <div style={{ fontSize: 11, color: WF.textMute, fontVariantNumeric: 'tabular-nums' }}>{c.v}%</div>
                  </div>
                ))}
              </div>
            </WFCard>

            {/* Budget progress */}
            <WFCard p={20}>
              <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 14 }}>
                <div style={{ fontSize: 14, fontWeight: 600, color: WF.text }}>Бюджет</div>
                <div style={{ fontSize: 11, color: WF.accent, fontWeight: 600 }}>Лимиты →</div>
              </div>
              <div style={{ textAlign: 'center', marginBottom: 14 }}>
                <div style={{ fontSize: 32, fontWeight: 600, color: WF.text, letterSpacing: -0.6, fontVariantNumeric: 'tabular-nums' }}>68%</div>
                <div style={{ fontSize: 11, color: WF.textMute, fontFamily: WF.mono }}>израсходовано лимита</div>
              </div>
              {[
                { n: 'Продукты', p: 0.77, c: WF.accent },
                { n: 'Кафе',     p: 1.24, c: WF.warm, over: true },
                { n: 'Транспорт',p: 0.78, c: '#7C9C8E' },
              ].map((b) => (
                <div key={b.n} style={{ marginBottom: 10 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, marginBottom: 4 }}>
                    <span>{b.n}</span>
                    <span style={{ color: b.over ? WF.warm : WF.textMute, fontWeight: b.over ? 600 : 400, fontVariantNumeric: 'tabular-nums' }}>
                      {Math.round(b.p * 100)}%
                    </span>
                  </div>
                  <WFProgress value={Math.min(1, b.p)} fill={b.over ? WF.warm : b.c} h={4} bg={WF.block} />
                </div>
              ))}
            </WFCard>
          </div>

          {/* ── Bottom row: transactions + goals ── */}
          <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: 16 }}>

            {/* Transactions */}
            <WFCard p={20}>
              <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 14 }}>
                <div style={{ fontSize: 14, fontWeight: 600, color: WF.text }}>Последние транзакции</div>
                <div style={{ display: 'flex', gap: 6 }}>
                  <WFChip bg={WF.accentSoft} color={WF.accent}>Все</WFChip>
                  <WFChip bg={WF.block} color={WF.textMute}>Расход</WFChip>
                  <WFChip bg={WF.block} color={WF.textMute}>Доход</WFChip>
                </div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                {[
                  { d: '25 мая · 14:32', n: 'Кофейня «Утро»',  c: 'Кафе · Tinkoff',       a: '− 320 ₽',    col: WF.text,     ic: WF.warmSoft },
                  { d: '25 мая · 09:15', n: 'Перекрёсток',     c: 'Продукты · Tinkoff',   a: '− 1 458 ₽',  col: WF.text,     ic: WF.accentSoft },
                  { d: '25 мая · 08:42', n: 'Метро',           c: 'Транспорт · Tinkoff',  a: '− 62 ₽',     col: WF.text,     ic: WF.block },
                  { d: '24 мая · 11:00', n: 'ООО «Ромашка»',   c: 'Зарплата · Сбер',      a: '+ 76 000 ₽', col: WF.positive, ic: WF.accentSoft },
                  { d: '24 мая · 22:00', n: 'YouTube Premium', c: 'Подписки · Tinkoff',   a: '− 299 ₽',    col: WF.text,     ic: WF.warmSoft },
                  { d: '23 мая · 19:30', n: 'ВкусВилл',        c: 'Продукты · Tinkoff',   a: '− 842 ₽',    col: WF.text,     ic: WF.accentSoft },
                ].map((t, i) => (
                  <div key={i} style={{
                    display: 'flex', alignItems: 'center', gap: 14, padding: '10px 0',
                    borderTop: i ? `1px solid ${WF.divider}` : 'none',
                  }}>
                    <WFCircle size={36} bg={t.ic}><WFIcon size={16} bg={WF.blockDark} /></WFCircle>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 13, fontWeight: 500, color: WF.text }}>{t.n}</div>
                      <div style={{ fontSize: 11, color: WF.textMute, fontFamily: WF.mono, marginTop: 2 }}>{t.c}</div>
                    </div>
                    <div style={{ fontSize: 11, color: WF.textMute, fontFamily: WF.mono }}>{t.d}</div>
                    <div style={{ fontSize: 14, fontWeight: 600, color: t.col, fontVariantNumeric: 'tabular-nums', minWidth: 90, textAlign: 'right' }}>
                      {t.a}
                    </div>
                  </div>
                ))}
              </div>
            </WFCard>

            {/* Goals column */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {/* Hero goal */}
              <WFCard p={20} bg={WF.warmSoft}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <WFAnnot style={{ color: WF.warm }}>Ближайшая цель · 30 дней</WFAnnot>
                    <div style={{ fontSize: 17, fontWeight: 600, marginTop: 4, color: WF.text }}>Новый ноутбук</div>
                  </div>
                  <div style={{ padding: '4px 10px', borderRadius: 100, background: 'rgba(255,181,154,0.18)', fontSize: 11, color: WF.warm, fontWeight: 600 }}>66%</div>
                </div>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, marginTop: 14, marginBottom: 8, fontVariantNumeric: 'tabular-nums' }}>
                  <div style={{ fontSize: 22, fontWeight: 600, color: WF.text, letterSpacing: -0.4 }}>92 000</div>
                  <div style={{ fontSize: 12, color: WF.textMute }}>/ 140 000 ₽</div>
                </div>
                <WFProgress value={92/140} h={8} bg="rgba(255,255,255,0.08)" fill={WF.warm} />
              </WFCard>

              {/* Other goals compact */}
              <WFCard p={20}>
                <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 14 }}>
                  <div style={{ fontSize: 14, fontWeight: 600, color: WF.text }}>Копилки</div>
                  <div style={{ fontSize: 11, color: WF.accent, fontWeight: 600 }}>+ Новая</div>
                </div>
                {[
                  { n: 'Отпуск в Грузии',     cur: 38, t: 120, c: WF.warm },
                  { n: 'Подушка безопасности', cur: 215, t: 300, c: '#7C9C8E' },
                  { n: 'Курсы английского',    cur: 8,   t: 60,  c: '#C8A47C' },
                ].map((g) => (
                  <div key={g.n} style={{ marginBottom: 10 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <WFCircle size={22} bg={WF.card} style={{ border: `2px solid ${g.c}`, boxSizing: 'border-box' }} />
                        <div style={{ fontSize: 12, fontWeight: 500, color: WF.text }}>{g.n}</div>
                      </div>
                      <div style={{ fontSize: 11, color: WF.textMute, fontVariantNumeric: 'tabular-nums' }}>{g.cur}к / {g.t}к</div>
                    </div>
                    <WFProgress value={g.cur/g.t} fill={g.c} h={4} bg={WF.block} />
                  </div>
                ))}
              </WFCard>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

Object.assign(window, { WebDashboard });
