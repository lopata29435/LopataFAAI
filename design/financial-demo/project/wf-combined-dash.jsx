// V5 — combined dashboard: V3 (goals-forward motivating hero) + V4 (dense data)
// Hero goal card · stat grid · bar chart · goals strip · recent txns.

function DashV5() {
  return (
    <WFScreen>
      <WFAppBar
        title="Привет, Алиса"
        sub="Май 2026 · семья «Иваненко»"
        leading={<MiniAvatar initial="А" />}
        trailing={
          <>
            <WFChip bg={WF.block} color={WF.text}>RUB</WFChip>
            <div style={{ width: 36, display:'flex', justifyContent:'center' }}><WFIcon size={20} bg={WF.blockDark} /></div>
          </>
        }
      />

      <div style={{ padding: '4px 12px 12px', flex: 1, display: 'flex', flexDirection: 'column', gap: 10, overflow: 'hidden' }}>

        {/* ── Hero goal card (motivating) ── */}
        <WFCard p={18} bg={WF.warmSoft} style={{ position: 'relative', overflow: 'hidden' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <WFAnnot style={{ color: WF.warm }}>Ближайшая цель · 30 дней</WFAnnot>
              <div style={{ fontSize: 20, fontWeight: 600, marginTop: 4, color: WF.text }}>Новый ноутбук</div>
            </div>
            <div style={{
              padding: '4px 10px', borderRadius: 100, background: 'rgba(255,181,154,0.18)',
              fontSize: 11, color: WF.warm, fontWeight: 600,
            }}>66%</div>
          </div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, marginTop: 14, marginBottom: 6, fontVariantNumeric: 'tabular-nums' }}>
            <div style={{ fontSize: 26, fontWeight: 600, color: WF.text, letterSpacing: -0.6 }}>92 000</div>
            <div style={{ fontSize: 13, color: WF.textMute }}>/ 140 000 ₽</div>
          </div>
          <WFProgress value={92/140} h={8} bg="rgba(255,255,255,0.08)" fill={WF.warm} />
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 10 }}>
            <div style={{ fontSize: 11, color: WF.textMute }}>осталось 48 000 ₽</div>
            <div style={{ fontSize: 11, color: WF.warm, fontWeight: 600 }}>+ пополнить</div>
          </div>
        </WFCard>

        {/* ── Stats grid 2×2 ── */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
          {[
            { l: 'Баланс',    v: '284 670', s: '+4,6%',  c: WF.positive, line: [5,4,7,6,8,7,11,9,12,14], stroke: WF.positive },
            { l: 'Доход',     v: '128 000', s: '+12%',   c: WF.positive, line: [2,3,5,4,7,6,9],           stroke: WF.accent },
            { l: 'Расход',    v: '48 320',  s: '−8%',    c: WF.warm,     line: [9,7,8,6,5,7,4],           stroke: WF.warm },
            { l: 'Инвестиции', v: '52 410', s: '+2,1%',  c: WF.positive, line: [3,4,4,5,4,5,6],           stroke: WF.accent },
          ].map((s) => (
            <WFCard key={s.l} p={12} style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <WFAnnot>{s.l}</WFAnnot>
              <div style={{ fontSize: 17, fontWeight: 600, color: WF.text, fontVariantNumeric: 'tabular-nums' }}>
                {s.v} <span style={{ fontSize: 11, color: WF.textMute, fontWeight: 400 }}>₽</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ fontSize: 11, color: s.c, fontWeight: 500 }}>{s.s}</div>
                <WFSparkline w={50} h={18} values={s.line} stroke={s.stroke} />
              </div>
            </WFCard>
          ))}
        </div>

        {/* ── Daily spending bars ── */}
        <WFCard p={14}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: WF.text }}>Траты за 7 дней</div>
            <div style={{ fontSize: 11, color: WF.textMute }}>сред. 1 240 ₽</div>
          </div>
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: 8, height: 52, justifyContent: 'space-between' }}>
            {[28, 42, 18, 52, 38, 60, 32].map((h, i) => (
              <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 5, flex: 1 }}>
                <WFBar h={h} w="100%" bg={i === 5 ? WF.accent : WF.block} r={4} />
                <div style={{ fontSize: 9, color: WF.textMute, fontFamily: WF.mono }}>{['П','В','С','Ч','П','С','В'][i]}</div>
              </div>
            ))}
          </div>
        </WFCard>

        {/* ── Goals strip — compact horizontal cards ── */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0 4px 8px', alignItems: 'baseline' }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: WF.text }}>Копилки</div>
            <div style={{ fontSize: 11, color: WF.accent, fontWeight: 600 }}>4 цели →</div>
          </div>
          <div style={{ display: 'flex', gap: 8, overflow: 'hidden' }}>
            {[
              { n: 'Отпуск',   p: 0.32, c: WF.warm,      v: '38к/120к' },
              { n: 'Подушка',  p: 0.72, c: '#7C9C8E',    v: '215к/300к' },
              { n: 'Курсы',    p: 0.13, c: '#C8A47C',    v: '8к/60к' },
            ].map((g) => (
              <WFCard key={g.n} p={12} style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                  <WFCircle size={22} bg={WF.card} style={{ border: `2px solid ${g.c}`, boxSizing: 'border-box' }} />
                  <div style={{ fontSize: 12, fontWeight: 500, color: WF.text, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{g.n}</div>
                </div>
                <WFProgress value={g.p} fill={g.c} h={4} bg={WF.block} />
                <div style={{ fontSize: 10, color: WF.textMute, fontFamily: WF.mono, marginTop: 6 }}>{g.v}</div>
              </WFCard>
            ))}
          </div>
        </div>

        {/* ── Recent transactions — compact ── */}
        <div style={{ flex: 1, overflow: 'hidden' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0 4px 4px', alignItems: 'baseline' }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: WF.text }}>Сегодня</div>
            <div style={{ fontSize: 11, color: WF.warm, fontWeight: 500 }}>− 1 840 ₽</div>
          </div>
          <TxnRow category="Кафе" label="Кофейня «Утро»" amount="320 ₽" iconBg={WF.warmSoft} />
          <TxnRow category="Продукты" label="Перекрёсток" amount="1 458 ₽" iconBg={WF.accentSoft} />
        </div>
      </div>

      <WFBottomNav active={0} />
    </WFScreen>
  );
}

Object.assign(window, { DashV5 });
