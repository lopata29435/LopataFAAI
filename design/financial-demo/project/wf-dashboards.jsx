// 4 dashboard variations. Each is the full content area of the Android frame.
// V1 Balance Hero · V2 Charts Forward · V3 Goals First · V4 Dense Data
//
// Style: clean wireframe blocks, Material 3 hierarchy. One accent (teal) for
// primary state, warm orange for goals/motivation. Otherwise grayscale.

// ─── shared bits ────────────────────────────────────────────────
function MiniAvatar({ initial = 'А' }) {
  return (
    <WFCircle size={36} bg={WF.accentSoft}>
      <div style={{ fontSize: 14, fontWeight: 600, color: WF.accent, fontFamily: WF.font }}>{initial}</div>
    </WFCircle>
  );
}

function TxnRow({ category, label, amount, sign = '−', color = WF.text, iconBg = WF.block }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 16px' }}>
      <WFCircle size={40} bg={iconBg}>
        <WFIcon size={18} bg={WF.blockDark} />
      </WFCircle>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 14, fontWeight: 500, color: WF.text }}>{label}</div>
        <div style={{ fontSize: 12, color: WF.textMute }}>{category}</div>
      </div>
      <div style={{ fontSize: 14, fontWeight: 600, color, fontVariantNumeric: 'tabular-nums' }}>
        {sign}{amount}
      </div>
    </div>
  );
}

// ─── V1 · Balance Hero ──────────────────────────────────────────
// Massive balance, horizontal account chips, then transaction list.
function DashV1() {
  return (
    <WFScreen>
      <WFAppBar
        title="Привет, Алиса"
        sub="Май 2026"
        leading={<MiniAvatar initial="А" />}
        trailing={<><WFCircle size={36} bg="transparent"><WFIcon size={20} bg={WF.blockDark} r={4} /></WFCircle></>}
      />

      {/* Hero balance */}
      <div style={{ padding: '8px 20px 24px' }}>
        <WFAnnot>Общий баланс</WFAnnot>
        <div style={{
          fontSize: 44, fontWeight: 600, color: WF.text, letterSpacing: -1.2,
          fontVariantNumeric: 'tabular-nums', marginTop: 6,
        }}>
          284 670 <span style={{ fontSize: 22, color: WF.textMute, fontWeight: 400 }}>₽</span>
        </div>
        <div style={{ display: 'flex', gap: 16, marginTop: 8, alignItems: 'center' }}>
          <div style={{ fontSize: 13, color: WF.positive, fontWeight: 500 }}>+ 12 400 ₽ за месяц</div>
          <WFSparkline w={70} h={20} values={[2,3,5,4,7,6,9,8,11]} />
        </div>
      </div>

      {/* Quick actions */}
      <div style={{ display: 'flex', gap: 8, padding: '0 16px', marginBottom: 20 }}>
        {['Добавить', 'Перевод', 'Цели', 'Бюджет'].map((l, i) => (
          <div key={l} style={{
            flex: 1, background: WF.card, padding: '12px 8px',
            borderRadius: 16, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8,
          }}>
            <WFCircle size={32} bg={i === 0 ? WF.accentSoft : WF.block}>
              <WFIcon size={16} bg={i === 0 ? WF.accent : WF.blockDark} />
            </WFCircle>
            <div style={{ fontSize: 11, color: WF.text, fontWeight: 500 }}>{l}</div>
          </div>
        ))}
      </div>

      {/* Accounts horizontal scroll (faked, no scroll). */}
      <div style={{ padding: '0 16px 16px' }}>
        <WFSection title="Счета" action="Все →">
          <div style={{ display: 'flex', gap: 10, overflow: 'hidden' }}>
            {[
              { name: 'Карта Tinkoff', bal: '142 300', accent: WF.accent },
              { name: 'Наличные', bal: '38 200', accent: WF.warm },
              { name: 'Сбер вклад', bal: '104 170', accent: WF.blockDark },
            ].map((a, i) => (
              <div key={i} style={{
                minWidth: 150, background: WF.card, padding: 14, borderRadius: 16,
                display: 'flex', flexDirection: 'column', gap: 8,
              }}>
                <div style={{ width: 28, height: 18, background: a.accent, borderRadius: 4 }} />
                <div style={{ fontSize: 11, color: WF.textMute }}>{a.name}</div>
                <div style={{ fontSize: 16, fontWeight: 600, color: WF.text, fontVariantNumeric: 'tabular-nums' }}>
                  {a.bal} ₽
                </div>
              </div>
            ))}
          </div>
        </WFSection>
      </div>

      {/* Transactions */}
      <div style={{ flex: 1, padding: '0 0 8px', overflow: 'hidden' }}>
        <div style={{ padding: '0 20px', display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 8 }}>
          <div style={{ fontSize: 14, fontWeight: 600 }}>Сегодня</div>
          <div style={{ fontSize: 12, color: WF.textMute }}>− 1 840 ₽</div>
        </div>
        <TxnRow category="Кафе" label="Кофейня «Утро»" amount="320 ₽" iconBg={WF.warmSoft} />
        <TxnRow category="Транспорт" label="Метро" amount="62 ₽" />
        <TxnRow category="Продукты" label="Перекрёсток" amount="1 458 ₽" iconBg={WF.accentSoft} />
        <div style={{ padding: '0 20px', display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', margin: '8px 0' }}>
          <div style={{ fontSize: 14, fontWeight: 600 }}>Вчера</div>
          <div style={{ fontSize: 12, color: WF.positive }}>+ 76 000 ₽</div>
        </div>
        <TxnRow category="Зарплата" label="ООО «Ромашка»" amount="76 000 ₽" sign="+" color={WF.positive} iconBg={WF.accentSoft} />
      </div>

      <WFBottomNav active={0} />
    </WFScreen>
  );
}

// ─── V2 · Charts Forward ────────────────────────────────────────
// Donut hero, category bars, less narrative text. Data-viz forward.
function DashV2() {
  const cats = [
    { name: 'Продукты',  v: 32, color: WF.accent },
    { name: 'Кафе',      v: 18, color: WF.warm },
    { name: 'Транспорт', v: 14, color: '#7C9C8E' },
    { name: 'Развлечения', v: 12, color: '#C8A47C' },
    { name: 'Остальное', v: 24, color: WF.blockDark },
  ];
  return (
    <WFScreen>
      <WFAppBar
        title="Май"
        sub="расход / доход"
        leading={<WFCircle size={36} bg={WF.block}><WFIcon size={16} bg={WF.blockDark} /></WFCircle>}
        trailing={<><div style={{ width: 36, height: 36, display:'flex', alignItems:'center', justifyContent:'center' }}><WFIcon size={20} bg={WF.blockDark} /></div></>}
      />

      {/* Month picker chips */}
      <div style={{ padding: '4px 16px 16px', display: 'flex', gap: 8, overflow: 'hidden' }}>
        {['Март', 'Апр', 'Май', 'Июнь'].map((m, i) => (
          <WFChip key={m} bg={i === 2 ? WF.accent : WF.block} color={i === 2 ? '#fff' : WF.text}>{m}</WFChip>
        ))}
      </div>

      {/* Donut chart hero */}
      <div style={{ padding: '0 20px 20px', display: 'flex', justifyContent: 'center' }}>
        <WFCard p={20} style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
          <WFDonut
            size={190} thickness={26} segments={cats}
            center={
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 11, color: WF.textMute, fontFamily: WF.font }}>Потрачено</div>
                <div style={{ fontSize: 26, fontWeight: 600, color: WF.text, letterSpacing: -0.5, fontVariantNumeric: 'tabular-nums' }}>
                  48 320
                </div>
                <div style={{ fontSize: 12, color: WF.textMute }}>из 70 000 ₽</div>
              </div>
            }
          />
          {/* legend */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px 16px', width: '100%' }}>
            {cats.slice(0, 4).map((c) => (
              <div key={c.name} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <div style={{ width: 8, height: 8, borderRadius: 4, background: c.color }} />
                <div style={{ fontSize: 12, color: WF.text, flex: 1 }}>{c.name}</div>
                <div style={{ fontSize: 12, color: WF.textMute, fontVariantNumeric: 'tabular-nums' }}>{c.v}%</div>
              </div>
            ))}
          </div>
        </WFCard>
      </div>

      {/* Category bars */}
      <div style={{ flex: 1, padding: '0 20px', overflow: 'hidden' }}>
        <WFSection title="По категориям" action="Все →">
          {cats.slice(0, 4).map((c) => (
            <div key={c.name} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <WFCircle size={36} bg={WF.card} style={{ border: `2px solid ${c.color}` }} />
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                  <div style={{ fontSize: 13, fontWeight: 500 }}>{c.name}</div>
                  <div style={{ fontSize: 12, color: WF.textMute, fontVariantNumeric: 'tabular-nums' }}>
                    {(c.v * 220).toLocaleString('ru')} ₽
                  </div>
                </div>
                <WFProgress value={c.v / 40} fill={c.color} />
              </div>
            </div>
          ))}
        </WFSection>
      </div>

      <WFBottomNav active={3} />
    </WFScreen>
  );
}

// ─── V3 · Goals First ───────────────────────────────────────────
// Motivating layout — copilki up top, then compact balance + recent.
function DashV3() {
  const goals = [
    { name: 'Отпуск в Грузии', cur: 38000, target: 120000, color: WF.warm, days: 84 },
    { name: 'Новый ноутбук',    cur: 92000, target: 140000, color: WF.accent, days: 30 },
    { name: 'Подушка', cur: 215000, target: 300000, color: '#7C9C8E', days: 180 },
  ];
  return (
    <WFScreen>
      <WFAppBar
        title="Мои цели"
        sub="3 активных копилки"
        leading={<MiniAvatar initial="А" />}
        trailing={<><WFCircle size={36} bg="transparent"><WFIcon size={20} bg={WF.blockDark} r={4} /></WFCircle></>}
      />

      {/* Hero goal — closest to finish */}
      <div style={{ padding: '4px 16px 16px' }}>
        <WFCard p={20} bg={WF.warmSoft} style={{ position: 'relative', overflow: 'hidden' }}>
          <WFAnnot style={{ color: WF.warm }}>Ближайшая цель · 30 дней</WFAnnot>
          <div style={{ fontSize: 20, fontWeight: 600, marginTop: 4, marginBottom: 16 }}>Новый ноутбук</div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, marginBottom: 4, fontVariantNumeric: 'tabular-nums' }}>
            <div style={{ fontSize: 28, fontWeight: 600, color: WF.text }}>92 000</div>
            <div style={{ fontSize: 14, color: WF.textMute }}>/ 140 000 ₽</div>
          </div>
          <WFProgress value={92/140} h={10} bg="#fff" fill={WF.warm} />
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 8 }}>
            <div style={{ fontSize: 12, color: WF.textMute }}>осталось 48 000 ₽</div>
            <div style={{ fontSize: 12, color: WF.warm, fontWeight: 600 }}>+ пополнить</div>
          </div>
        </WFCard>
      </div>

      {/* Other goals — compact rows */}
      <div style={{ padding: '0 20px 8px' }}>
        <WFSection title="Все копилки" action="+ Новая">
          {goals.filter((_, i) => i !== 1).map((g) => (
            <div key={g.name} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '8px 0' }}>
              <WFCircle size={42} bg={WF.card} style={{ border: `3px solid ${g.color}`, boxSizing: 'border-box' }} />
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                  <div style={{ fontSize: 13, fontWeight: 500 }}>{g.name}</div>
                  <div style={{ fontSize: 12, color: WF.textMute, fontVariantNumeric: 'tabular-nums' }}>
                    {(g.cur/1000).toFixed(0)}к / {(g.target/1000).toFixed(0)}к ₽
                  </div>
                </div>
                <WFProgress value={g.cur/g.target} fill={g.color} h={4} />
              </div>
            </div>
          ))}
        </WFSection>
      </div>

      {/* Balance compact strip */}
      <div style={{ padding: '12px 20px', margin: '8px 16px 12px', background: WF.card, borderRadius: 20, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <WFAnnot>Свободный остаток</WFAnnot>
          <div style={{ fontSize: 22, fontWeight: 600, fontVariantNumeric: 'tabular-nums', marginTop: 2 }}>61 540 ₽</div>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <WFCircle size={40} bg={WF.accentSoft}><WFIcon size={18} bg={WF.accent} /></WFCircle>
          <WFCircle size={40} bg={WF.block}><WFIcon size={18} bg={WF.blockDark} /></WFCircle>
        </div>
      </div>

      {/* Recent quick list */}
      <div style={{ flex: 1, padding: '0 4px 4px', overflow: 'hidden' }}>
        <div style={{ padding: '0 20px', fontSize: 14, fontWeight: 600, marginBottom: 8 }}>Последние траты</div>
        <TxnRow category="Кафе" label="Кофейня «Утро»" amount="320 ₽" iconBg={WF.warmSoft} />
        <TxnRow category="Продукты" label="Перекрёсток" amount="1 458 ₽" iconBg={WF.accentSoft} />
      </div>

      <WFBottomNav active={2} />
    </WFScreen>
  );
}

// ─── V4 · Dense Data ────────────────────────────────────────────
// Many cards at once — maximalist info dashboard for power users.
function DashV4() {
  return (
    <WFScreen>
      <WFAppBar
        title="Дашборд"
        sub="Май 2026 · семья «Иваненко»"
        leading={<MiniAvatar initial="А" />}
        trailing={
          <>
            <WFChip bg={WF.block}>RUB</WFChip>
            <div style={{ width: 36, display:'flex', justifyContent:'center' }}><WFIcon size={20} bg={WF.blockDark} /></div>
          </>
        }
      />

      <div style={{ padding: '4px 12px 12px', flex: 1, display: 'flex', flexDirection: 'column', gap: 10, overflow: 'hidden' }}>
        {/* Big balance row */}
        <WFCard p={14} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <WFAnnot>Чистые активы</WFAnnot>
            <div style={{ fontSize: 26, fontWeight: 600, letterSpacing: -0.5, fontVariantNumeric: 'tabular-nums' }}>
              284 670 ₽
            </div>
            <div style={{ fontSize: 11, color: WF.positive, fontWeight: 500, marginTop: 2 }}>↑ 4,6% к апрелю</div>
          </div>
          <WFSparkline w={90} h={44} values={[5,4,7,6,8,7,11,9,12,14]} fill={WF.accentSoft} />
        </WFCard>

        {/* 2×2 stat grid */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
          {[
            { l: 'Доход', v: '128 000', s: '+12%', c: WF.positive, fill: WF.accentSoft, line: [2,3,5,4,7,6,9] },
            { l: 'Расход', v: '48 320',  s: '−8%',  c: WF.warm,     fill: WF.warmSoft,    line: [9,7,8,6,5,7,4] },
            { l: 'В копилках', v: '345к', s: '3 цели', c: WF.text,  fill: WF.block,       line: [2,3,3,4,5,5,6] },
            { l: 'Инвестиции',  v: '52к',   s: '+2,1%', c: WF.positive, fill: WF.divider, line: [3,4,4,5,4,5,6] },
          ].map((s) => (
            <WFCard key={s.l} p={12} style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <WFAnnot>{s.l}</WFAnnot>
              <div style={{ fontSize: 18, fontWeight: 600, fontVariantNumeric: 'tabular-nums' }}>{s.v} <span style={{ fontSize: 12, color: WF.textMute, fontWeight: 400 }}>₽</span></div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ fontSize: 11, color: s.c, fontWeight: 500 }}>{s.s}</div>
                <WFSparkline w={50} h={18} values={s.line} stroke={s.c} />
              </div>
            </WFCard>
          ))}
        </div>

        {/* Bar chart row — daily spend last 7 days */}
        <WFCard p={14}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
            <div style={{ fontSize: 13, fontWeight: 600 }}>Траты за 7 дней</div>
            <div style={{ fontSize: 11, color: WF.textMute }}>сред. 1 240 ₽/день</div>
          </div>
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: 8, height: 60, justifyContent: 'space-between' }}>
            {[28, 42, 18, 52, 38, 60, 32].map((h, i) => (
              <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, flex: 1 }}>
                <WFBar h={h} w="100%" bg={i === 5 ? WF.accent : WF.block} r={4} />
                <div style={{ fontSize: 9, color: WF.textMute, fontFamily: WF.mono }}>{['П','В','С','Ч','П','С','В'][i]}</div>
              </div>
            ))}
          </div>
        </WFCard>

        {/* Top categories compact */}
        <WFCard p={14} style={{ flex: 1, overflow: 'hidden' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
            <div style={{ fontSize: 13, fontWeight: 600 }}>Топ категорий</div>
            <div style={{ fontSize: 11, color: WF.accent, fontWeight: 600 }}>Все →</div>
          </div>
          {[
            { n: 'Продукты',    v: 15400, p: 0.65, c: WF.accent },
            { n: 'Кафе и рест', v:  8700, p: 0.37, c: WF.warm },
            { n: 'Транспорт',   v:  6200, p: 0.26, c: '#7C9C8E' },
          ].map((c) => (
            <div key={c.n} style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
              <WFCircle size={28} bg={WF.card} style={{ border: `2px solid ${c.c}` }} />
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 3 }}>
                  <span style={{ fontWeight: 500 }}>{c.n}</span>
                  <span style={{ color: WF.textMute, fontVariantNumeric: 'tabular-nums' }}>{c.v.toLocaleString('ru')} ₽</span>
                </div>
                <WFProgress value={c.p} fill={c.c} h={4} />
              </div>
            </div>
          ))}
        </WFCard>
      </div>

      <WFBottomNav active={0} />
    </WFScreen>
  );
}

Object.assign(window, { DashV1, DashV2, DashV3, DashV4, TxnRow, MiniAvatar });
