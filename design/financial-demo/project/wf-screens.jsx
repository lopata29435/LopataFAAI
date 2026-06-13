// 7 supporting screens — consistent visual language with the dashboards.
// AddExpense · Transactions · Analytics · Goals · Budget · Accounts · Settings

// ─── Add Expense ────────────────────────────────────────────────
// Numpad-driven entry — focused single task. Material 3 bottom sheet vibe.
function AddExpenseScreen() {
  const num = (l) => (
    <div key={l} style={{
      flex: 1, aspectRatio: '1.6 / 1', borderRadius: 16, background: WF.card,
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      gap: 2,
    }}>
      <div style={{ fontSize: 22, fontWeight: 500, color: WF.text, fontFamily: WF.font }}>{l}</div>
    </div>
  );
  return (
    <WFScreen>
      <WFAppBar
        title="Новая трата"
        leading={<div style={{ width: 36, display: 'flex', justifyContent: 'center' }}><WFIcon size={20} bg={WF.blockDark} /></div>}
        trailing={<WFChip bg={WF.accentSoft} color={WF.accent}>Сохранить</WFChip>}
      />

      {/* Amount display */}
      <div style={{ padding: '24px 24px 8px', textAlign: 'center' }}>
        <WFAnnot>Сумма</WFAnnot>
        <div style={{ fontSize: 56, fontWeight: 600, color: WF.text, letterSpacing: -2, fontVariantNumeric: 'tabular-nums', marginTop: 4 }}>
          1 458 <span style={{ color: WF.textMute, fontSize: 32, fontWeight: 400 }}>₽</span>
        </div>
        <div style={{ display: 'inline-flex', gap: 6, padding: '4px 8px', borderRadius: 100, background: WF.block, marginTop: 8 }}>
          <WFIcon size={12} bg={WF.blockDark} />
          <span style={{ fontSize: 11, color: WF.textMute }}>RUB · перевести</span>
        </div>
      </div>

      {/* Category chips */}
      <div style={{ padding: '16px 16px 8px' }}>
        <WFAnnot style={{ marginLeft: 4 }}>Категория</WFAnnot>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 8 }}>
          {[
            ['Продукты', true,  WF.accent],
            ['Кафе',     false, WF.warm],
            ['Транспорт',false, '#7C9C8E'],
            ['Дом',      false, WF.blockDark],
            ['+',        false, WF.blockDark],
          ].map(([n, on, c], i) => (
            <div key={i} style={{
              display: 'flex', alignItems: 'center', gap: 6,
              padding: '8px 14px', borderRadius: 100,
              background: on ? WF.accentSoft : WF.card,
              border: on ? `1.5px solid ${WF.accent}` : `1px solid ${WF.divider}`,
            }}>
              {n !== '+' && <div style={{ width: 8, height: 8, borderRadius: 4, background: c }} />}
              <span style={{ fontSize: 13, fontWeight: 500, color: on ? WF.accent : WF.text }}>{n}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Account row */}
      <div style={{ padding: '8px 16px 14px' }}>
        <WFCard p={12} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 36, height: 24, background: WF.accent, borderRadius: 5 }} />
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 13, fontWeight: 500 }}>Карта Tinkoff · *4421</div>
            <div style={{ fontSize: 11, color: WF.textMute }}>142 300 ₽</div>
          </div>
          <WFIcon size={16} bg={WF.blockDark} />
        </WFCard>
      </div>

      {/* Numpad */}
      <div style={{ flex: 1, padding: '0 12px 8px', display: 'flex', flexDirection: 'column', gap: 8 }}>
        {[['1','2','3'],['4','5','6'],['7','8','9'],[',','0','⌫']].map((row, ri) => (
          <div key={ri} style={{ display: 'flex', gap: 8, flex: 1 }}>
            {row.map((k) => num(k))}
          </div>
        ))}
      </div>

      <WFBottomNav active={2} />
    </WFScreen>
  );
}

// ─── Transactions ───────────────────────────────────────────────
function TransactionsScreen() {
  return (
    <WFScreen>
      <WFAppBar
        title="История"
        leading={<MiniAvatar initial="А" />}
        trailing={<><WFCircle size={36} bg="transparent"><WFIcon size={20} bg={WF.blockDark} /></WFCircle><WFCircle size={36} bg="transparent"><WFIcon size={20} bg={WF.blockDark} /></WFCircle></>}
      />

      {/* Search */}
      <div style={{ padding: '4px 16px 12px' }}>
        <div style={{
          background: WF.card, borderRadius: 28, padding: '10px 16px',
          display: 'flex', alignItems: 'center', gap: 12,
          border: `1px solid ${WF.divider}`,
        }}>
          <WFIcon size={18} bg={WF.blockDark} />
          <div style={{ fontSize: 14, color: WF.textMute, flex: 1 }}>Поиск по тратам</div>
          <WFIcon size={18} bg={WF.blockDark} />
        </div>
      </div>

      {/* Filter chips */}
      <div style={{ padding: '0 16px 12px', display: 'flex', gap: 6, overflow: 'hidden' }}>
        <WFChip bg={WF.accent} color="#fff">Все</WFChip>
        <WFChip bg={WF.card} style={{ border: `1px solid ${WF.divider}` }}>Май</WFChip>
        <WFChip bg={WF.card} style={{ border: `1px solid ${WF.divider}` }}>Категория</WFChip>
        <WFChip bg={WF.card} style={{ border: `1px solid ${WF.divider}` }}>Счёт</WFChip>
      </div>

      {/* Day summary bar */}
      <div style={{ padding: '12px 20px', margin: '0 16px 12px', background: WF.accentSoft, borderRadius: 16, display: 'flex', justifyContent: 'space-between' }}>
        <div>
          <div style={{ fontSize: 11, color: WF.accent, fontWeight: 600 }}>МАЙ 25 · СЕГОДНЯ</div>
          <div style={{ fontSize: 13, color: WF.text, marginTop: 2 }}>3 операции</div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: 11, color: WF.textMute }}>Расход</div>
          <div style={{ fontSize: 16, fontWeight: 600, fontVariantNumeric: 'tabular-nums' }}>− 1 840 ₽</div>
        </div>
      </div>

      <div style={{ flex: 1, overflow: 'hidden' }}>
        <TxnRow category="Продукты · Tinkoff" label="Перекрёсток" amount="1 458 ₽" iconBg={WF.accentSoft} />
        <TxnRow category="Кафе · Наличные"   label="Кофейня «Утро»" amount="320 ₽"  iconBg={WF.warmSoft} />
        <TxnRow category="Транспорт · Tinkoff" label="Метро" amount="62 ₽" />

        <div style={{ padding: '12px 20px 6px', display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
          <div style={{ fontSize: 12, fontWeight: 600, color: WF.textMute, letterSpacing: 0.5 }}>МАЙ 24 · ВЧЕРА</div>
          <div style={{ fontSize: 12, color: WF.positive, fontWeight: 500 }}>+ 76 000 ₽</div>
        </div>
        <TxnRow category="Зарплата" label="ООО «Ромашка»" amount="76 000 ₽" sign="+" color={WF.positive} iconBg={WF.accentSoft} />
        <TxnRow category="Подписки" label="YouTube Premium" amount="299 ₽" iconBg={WF.warmSoft} />

        <div style={{ padding: '12px 20px 6px', fontSize: 12, fontWeight: 600, color: WF.textMute, letterSpacing: 0.5 }}>МАЙ 23</div>
        <TxnRow category="Продукты" label="ВкусВилл" amount="842 ₽" iconBg={WF.accentSoft} />
      </div>

      <WFBottomNav active={1} />
    </WFScreen>
  );
}

// ─── Analytics ──────────────────────────────────────────────────
function AnalyticsScreen() {
  const cats = [
    { n: 'Продукты', v: 32, c: WF.accent },
    { n: 'Кафе',     v: 18, c: WF.warm },
    { n: 'Транспорт',v: 14, c: '#7C9C8E' },
    { n: 'Дом',      v: 12, c: '#C8A47C' },
    { n: 'Прочее',   v: 24, c: WF.blockDark },
  ];
  return (
    <WFScreen>
      <WFAppBar
        title="Аналитика"
        leading={<MiniAvatar />}
        trailing={<WFChip bg={WF.block}>Экспорт</WFChip>}
      />

      {/* Month switcher */}
      <div style={{ padding: '0 20px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <WFCircle size={32} bg={WF.card} style={{ border: `1px solid ${WF.divider}` }}><WFIcon size={12} bg={WF.blockDark} /></WFCircle>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 17, fontWeight: 600 }}>Май 2026</div>
          <div style={{ fontSize: 11, color: WF.textMute }}>1 — 25 мая</div>
        </div>
        <WFCircle size={32} bg={WF.card} style={{ border: `1px solid ${WF.divider}` }}><WFIcon size={12} bg={WF.blockDark} /></WFCircle>
      </div>

      <div style={{ padding: '0 16px', flex: 1, display: 'flex', flexDirection: 'column', gap: 12, overflow: 'hidden' }}>
        {/* Donut + summary */}
        <WFCard p={16} style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
          <WFDonut
            size={120} thickness={18} segments={cats}
            center={<div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 9, color: WF.textMute }}>Всего</div>
              <div style={{ fontSize: 16, fontWeight: 600, letterSpacing: -0.3 }}>48 320 ₽</div>
            </div>}
          />
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 6 }}>
            {cats.slice(0,4).map((c) => (
              <div key={c.n} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <div style={{ width: 8, height: 8, borderRadius: 4, background: c.c }} />
                <div style={{ fontSize: 11, flex: 1 }}>{c.n}</div>
                <div style={{ fontSize: 11, color: WF.textMute, fontVariantNumeric: 'tabular-nums' }}>{c.v}%</div>
              </div>
            ))}
          </div>
        </WFCard>

        {/* Trend line */}
        <WFCard p={14}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 8 }}>
            <div style={{ fontSize: 13, fontWeight: 600 }}>Тренд расходов</div>
            <div style={{ fontSize: 11, color: WF.warm, fontWeight: 500 }}>+12% к апрелю</div>
          </div>
          <WFSparkline w={340} h={70} values={[3,5,4,7,5,9,8,11,9,12,10,14]} stroke={WF.warm} fill={WF.warmSoft} />
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 9, color: WF.textMute, fontFamily: WF.mono, marginTop: 4 }}>
            <span>1 мая</span><span>10</span><span>20</span><span>25 мая</span>
          </div>
        </WFCard>

        {/* Comparison bars */}
        <WFCard p={14} style={{ flex: 1 }}>
          <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 12 }}>Доход vs Расход · 6 мес</div>
          <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-around', height: 100 }}>
            {[
              { in: 78, out: 32, m: 'Дек' },
              { in: 60, out: 42, m: 'Янв' },
              { in: 70, out: 38, m: 'Фев' },
              { in: 65, out: 50, m: 'Мар' },
              { in: 68, out: 44, m: 'Апр' },
              { in: 85, out: 56, m: 'Май' },
            ].map((b, i) => (
              <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                <div style={{ display: 'flex', alignItems: 'flex-end', gap: 3 }}>
                  <WFBar h={b.in} w={9} bg={i === 5 ? WF.accent : WF.accentSoft} r={3} />
                  <WFBar h={b.out} w={9} bg={i === 5 ? WF.warm : WF.warmSoft} r={3} />
                </div>
                <div style={{ fontSize: 9, color: WF.textMute, fontFamily: WF.mono }}>{b.m}</div>
              </div>
            ))}
          </div>
        </WFCard>
      </div>

      <WFBottomNav active={3} />
    </WFScreen>
  );
}

// ─── Goals / Copilki ────────────────────────────────────────────
function GoalsScreen() {
  const goals = [
    { n: 'Отпуск в Грузии', cur: 38000, t: 120000, c: WF.warm, d: 'окт 2026', m: '+ 5 000 ₽ / мес' },
    { n: 'Новый ноутбук',   cur: 92000, t: 140000, c: WF.accent, d: 'июнь 2026', m: '+ 10 000 ₽ / мес' },
    { n: 'Подушка безопасности', cur: 215000, t: 300000, c: '#7C9C8E', d: 'дек 2026', m: '+ 8 000 ₽ / мес' },
    { n: 'Курсы английского', cur: 8000, t: 60000, c: '#C8A47C', d: 'авг 2026', m: '+ 5 000 ₽ / мес' },
  ];
  return (
    <WFScreen>
      <WFAppBar
        title="Копилки"
        sub="4 цели · в копилках 353к ₽"
        leading={<MiniAvatar />}
        trailing={<WFChip bg={WF.accent} color="#fff">+ Новая</WFChip>}
        large
      />

      <div style={{ padding: '8px 16px 12px', flex: 1, display: 'flex', flexDirection: 'column', gap: 12, overflow: 'hidden' }}>
        {/* Filter pills */}
        <div style={{ display: 'flex', gap: 6 }}>
          <WFChip bg={WF.accentSoft} color={WF.accent}>Активные · 4</WFChip>
          <WFChip bg={WF.card} style={{ border: `1px solid ${WF.divider}` }}>Завершённые</WFChip>
          <WFChip bg={WF.card} style={{ border: `1px solid ${WF.divider}` }}>Общие</WFChip>
        </div>

        {goals.map((g) => (
          <WFCard key={g.n} p={16}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <WFCircle size={36} bg={WF.card} style={{ border: `3px solid ${g.c}`, boxSizing: 'border-box' }} />
                <div>
                  <div style={{ fontSize: 14, fontWeight: 600 }}>{g.n}</div>
                  <div style={{ fontSize: 11, color: WF.textMute, fontFamily: WF.mono }}>цель · {g.d}</div>
                </div>
              </div>
              <div style={{ fontSize: 11, color: g.c, fontWeight: 600 }}>{Math.round(g.cur/g.t*100)}%</div>
            </div>

            <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, fontVariantNumeric: 'tabular-nums', marginBottom: 8 }}>
              <div style={{ fontSize: 22, fontWeight: 600 }}>{g.cur.toLocaleString('ru')}</div>
              <div style={{ fontSize: 13, color: WF.textMute }}>/ {g.t.toLocaleString('ru')} ₽</div>
            </div>
            <WFProgress value={g.cur/g.t} fill={g.c} h={8} />

            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 10 }}>
              <div style={{ fontSize: 11, color: WF.textMute }}>{g.m}</div>
              <div style={{ fontSize: 11, color: g.c, fontWeight: 600 }}>+ пополнить</div>
            </div>
          </WFCard>
        ))}
      </div>

      <WFBottomNav active={2} />
    </WFScreen>
  );
}

// ─── Budget ─────────────────────────────────────────────────────
function BudgetScreen() {
  const cats = [
    { n: 'Продукты',  spent: 15400, lim: 20000, c: WF.accent },
    { n: 'Кафе и рест.', spent: 8700, lim: 7000, c: WF.warm },
    { n: 'Транспорт', spent: 6200,  lim: 8000, c: '#7C9C8E' },
    { n: 'Развлечения', spent: 5800, lim: 10000, c: '#C8A47C' },
    { n: 'Дом',       spent: 4200,  lim: 12000, c: WF.blockDark },
    { n: 'Здоровье',  spent: 2100,  lim: 5000,  c: '#A789C8' },
  ];
  const totSpent = cats.reduce((a, c) => a + c.spent, 0);
  const totLim = cats.reduce((a, c) => a + c.lim, 0);
  return (
    <WFScreen>
      <WFAppBar
        title="Бюджет"
        sub="Май 2026"
        leading={<MiniAvatar />}
        trailing={<WFCircle size={36}><WFIcon size={18} bg={WF.blockDark} /></WFCircle>}
      />

      {/* Hero — overall budget ring */}
      <div style={{ padding: '4px 16px 16px' }}>
        <WFCard p={20} style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
          <div style={{ position: 'relative' }}>
            <WFDonut
              size={130} thickness={14}
              segments={[
                { value: totSpent, color: WF.accent },
                { value: Math.max(0, totLim - totSpent), color: WF.block },
              ]}
              center={<div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 22, fontWeight: 600, letterSpacing: -0.5 }}>{Math.round(totSpent/totLim*100)}%</div>
                <div style={{ fontSize: 9, color: WF.textMute, fontFamily: WF.mono }}>лимита</div>
              </div>}
            />
          </div>
          <div style={{ flex: 1 }}>
            <WFAnnot>Потрачено</WFAnnot>
            <div style={{ fontSize: 22, fontWeight: 600, fontVariantNumeric: 'tabular-nums' }}>
              {totSpent.toLocaleString('ru')} ₽
            </div>
            <div style={{ fontSize: 11, color: WF.textMute, marginTop: 2 }}>из {totLim.toLocaleString('ru')} ₽</div>
            <div style={{ marginTop: 10, padding: '6px 10px', background: WF.accentSoft, borderRadius: 8, fontSize: 11, color: WF.accent, fontWeight: 600, display: 'inline-block' }}>
              осталось 19 600 ₽
            </div>
          </div>
        </WFCard>
      </div>

      {/* Category list */}
      <div style={{ padding: '0 16px', flex: 1, overflow: 'hidden' }}>
        <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 10, padding: '0 4px' }}>Лимиты по категориям</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {cats.map((c) => {
            const pct = c.spent / c.lim;
            const over = pct > 1;
            return (
              <WFCard key={c.n} p={12}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
                  <WFCircle size={28} bg={WF.card} style={{ border: `2px solid ${c.c}` }} />
                  <div style={{ flex: 1, fontSize: 13, fontWeight: 500 }}>{c.n}</div>
                  <div style={{ fontSize: 12, color: over ? WF.warm : WF.text, fontWeight: 600, fontVariantNumeric: 'tabular-nums' }}>
                    {c.spent.toLocaleString('ru')} / {c.lim.toLocaleString('ru')}
                  </div>
                </div>
                <WFProgress value={Math.min(1, pct)} fill={over ? WF.warm : c.c} h={6} />
                {over && (
                  <div style={{ fontSize: 10, color: WF.warm, marginTop: 4, fontWeight: 600 }}>
                    превышен на {(c.spent - c.lim).toLocaleString('ru')} ₽
                  </div>
                )}
              </WFCard>
            );
          })}
        </div>
      </div>

      <WFBottomNav active={3} />
    </WFScreen>
  );
}

// ─── Accounts & cards ───────────────────────────────────────────
function AccountsScreen() {
  const cards = [
    { name: 'Tinkoff Black', bal: '142 300', last: '4421', c: WF.accent, type: 'Дебетовая' },
    { name: 'Наличные',      bal: '38 200',  last: '—',    c: WF.warm,   type: 'Кошелёк' },
    { name: 'Сбер вклад',    bal: '104 170', last: '8812', c: '#7C9C8E', type: 'Депозит · 12%' },
  ];
  return (
    <WFScreen>
      <WFAppBar
        title="Счета"
        sub="3 счёта · 284 670 ₽"
        leading={<MiniAvatar />}
        trailing={<WFChip bg={WF.accent} color="#fff">+ Добавить</WFChip>}
        large
      />

      <div style={{ padding: '8px 16px', flex: 1, display: 'flex', flexDirection: 'column', gap: 14, overflow: 'hidden' }}>
        {cards.map((c) => (
          <WFCard key={c.name} p={0} style={{ overflow: 'hidden' }}>
            {/* Card face */}
            <div style={{
              background: c.c, color: '#fff', padding: 18,
              display: 'flex', flexDirection: 'column', gap: 10,
              position: 'relative',
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <div style={{ fontSize: 11, opacity: 0.75 }}>{c.type}</div>
                  <div style={{ fontSize: 16, fontWeight: 600, marginTop: 2 }}>{c.name}</div>
                </div>
                <div style={{ width: 40, height: 26, background: 'rgba(255,255,255,0.25)', borderRadius: 4 }} />
              </div>
              <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between' }}>
                <div style={{ fontSize: 26, fontWeight: 600, fontVariantNumeric: 'tabular-nums', letterSpacing: -0.5 }}>
                  {c.bal} ₽
                </div>
                <div style={{ fontSize: 12, fontFamily: WF.mono, opacity: 0.85 }}>•••• {c.last}</div>
              </div>
            </div>
            {/* Actions row */}
            <div style={{ display: 'flex', borderTop: `1px solid ${WF.divider}` }}>
              {['Пополнить', 'Перевод', 'История'].map((a) => (
                <div key={a} style={{
                  flex: 1, padding: '12px 0', textAlign: 'center',
                  fontSize: 12, fontWeight: 500, color: WF.text,
                  borderRight: a !== 'История' ? `1px solid ${WF.divider}` : 'none',
                }}>{a}</div>
              ))}
            </div>
          </WFCard>
        ))}

        {/* Investments shortcut */}
        <WFCard p={14} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <WFCircle size={40} bg={WF.accentSoft}><WFIcon size={20} bg={WF.accent} /></WFCircle>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 13, fontWeight: 600 }}>Инвестиции</div>
            <div style={{ fontSize: 11, color: WF.textMute }}>52 410 ₽ · +2,1% за месяц</div>
          </div>
          <WFIcon size={16} bg={WF.blockDark} />
        </WFCard>
      </div>

      <WFBottomNav active={0} />
    </WFScreen>
  );
}

// ─── Settings ───────────────────────────────────────────────────
function SettingsScreen() {
  const Row = ({ label, value, last }) => (
    <div style={{
      display: 'flex', alignItems: 'center', padding: '14px 16px', gap: 14,
      borderBottom: last ? 'none' : `1px solid ${WF.divider}`,
    }}>
      <WFCircle size={36} bg={WF.block}><WFIcon size={16} bg={WF.blockDark} /></WFCircle>
      <div style={{ flex: 1, fontSize: 14, color: WF.text }}>{label}</div>
      {value && <div style={{ fontSize: 12, color: WF.textMute }}>{value}</div>}
      <WFIcon size={14} bg={WF.blockMid} />
    </div>
  );
  const Group = ({ title, children }) => (
    <div style={{ marginBottom: 16 }}>
      <div style={{ padding: '8px 20px', fontSize: 11, color: WF.textMute, fontWeight: 600, letterSpacing: 0.5, textTransform: 'uppercase' }}>{title}</div>
      <WFCard p={0} style={{ marginInline: 16 }}>{children}</WFCard>
    </div>
  );
  return (
    <WFScreen>
      <WFAppBar title="Профиль" leading={<MiniAvatar />} />

      {/* Profile hero */}
      <div style={{ padding: '0 20px 16px', display: 'flex', alignItems: 'center', gap: 14 }}>
        <WFCircle size={64} bg={WF.accentSoft}>
          <div style={{ fontSize: 22, fontWeight: 600, color: WF.accent }}>А</div>
        </WFCircle>
        <div>
          <div style={{ fontSize: 17, fontWeight: 600 }}>Алиса Иваненко</div>
          <div style={{ fontSize: 12, color: WF.textMute }}>alisa@iva.me · Premium</div>
        </div>
      </div>

      {/* Family group hero */}
      <div style={{ padding: '0 16px 8px' }}>
        <WFCard p={16} bg={WF.accentSoft}>
          <WFAnnot style={{ color: WF.accent }}>Совместный бюджет</WFAnnot>
          <div style={{ fontSize: 15, fontWeight: 600, marginTop: 4 }}>Семья «Иваненко» · 3 чел.</div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 10 }}>
            <div style={{ display: 'flex' }}>
              {['А','М','К'].map((l, i) => (
                <WFCircle key={i} size={28} bg={['#fff', WF.warmSoft, WF.block][i]} style={{ marginLeft: i ? -8 : 0, border: '2px solid #fff' }}>
                  <div style={{ fontSize: 11, fontWeight: 600, color: WF.text }}>{l}</div>
                </WFCircle>
              ))}
            </div>
            <div style={{ fontSize: 12, color: WF.accent, fontWeight: 600 }}>Настроить →</div>
          </div>
        </WFCard>
      </div>

      <div style={{ flex: 1, overflow: 'hidden', paddingTop: 8 }}>
        <Group title="Финансы">
          <Row label="Валюты и курсы" value="RUB · USD · GEL" />
          <Row label="Категории" value="12 шт." />
          <Row label="Регулярные платежи" value="6 активных" />
          <Row label="Импорт из банка" value="3 подключения" last />
        </Group>
        <Group title="Приложение">
          <Row label="Уведомления" value="Вкл" />
          <Row label="Внешний вид" value="Светлая · Material You" />
          <Row label="Безопасность" value="Face ID" last />
        </Group>
      </div>

      <WFBottomNav active={4} />
    </WFScreen>
  );
}

Object.assign(window, {
  AddExpenseScreen, TransactionsScreen, AnalyticsScreen,
  GoalsScreen, BudgetScreen, AccountsScreen, SettingsScreen,
});
