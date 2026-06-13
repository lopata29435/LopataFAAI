// Wireframe primitives — clean low-poly blocks, Material 3-inspired.
// Used by all dashboard + screen components. Globals attached at bottom.

const WF = {
  bg: '#F4F1ED',          // canvas behind phone (matches DC bg roughly)
  surface: '#FAFAF7',     // screen background
  card: '#FFFFFF',
  block: '#E8E6E2',       // primary placeholder block
  blockMid: '#D3D0CA',
  blockDark: '#A7A39B',
  text: '#1F1D1B',
  textMute: '#6E6B66',
  divider: '#ECEAE5',
  accent: '#006A60',      // Material teal — primary
  accentSoft: '#CDE8E1',
  warm: '#E07A4A',        // orange — savings / goals motivator
  warmSoft: '#FBE4D6',
  positive: '#3D8C5E',
  font: 'Roboto, system-ui, sans-serif',
  mono: '"JetBrains Mono", "SF Mono", ui-monospace, monospace',
};

// Plain rectangle block — text/image placeholder.
function WFBlock({ w = '100%', h = 12, r = 4, bg = WF.block, style = {}, children }) {
  return (
    <div style={{
      width: w, height: h, background: bg, borderRadius: r,
      flexShrink: 0, ...style,
    }}>{children}</div>
  );
}

// Circle — icon / avatar.
function WFCircle({ size = 40, bg = WF.block, style = {}, children }) {
  return (
    <div style={{
      width: size, height: size, borderRadius: size, background: bg,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      flexShrink: 0, ...style,
    }}>{children}</div>
  );
}

// A line of text rendered as a gray bar (placeholder).
function WFLine({ w = 80, h = 10, bg = WF.block, style = {} }) {
  return <WFBlock w={w} h={h} r={h / 2} bg={bg} style={style} />;
}

// Small pill — chip / tag / filter.
function WFChip({ children, bg = WF.block, color = WF.text, style = {} }) {
  return (
    <div style={{
      padding: '6px 12px', borderRadius: 100, background: bg, color,
      fontSize: 12, fontWeight: 500, fontFamily: WF.font,
      whiteSpace: 'nowrap', display: 'inline-flex', alignItems: 'center', gap: 6,
      ...style,
    }}>{children}</div>
  );
}

// White card container with optional rounded corners + padding.
function WFCard({ children, p = 16, r = 20, bg = WF.card, style = {} }) {
  return (
    <div style={{
      background: bg, borderRadius: r, padding: p,
      ...style,
    }}>{children}</div>
  );
}

// Tiny icon placeholder square (rounded).
function WFIcon({ size = 20, bg = WF.blockMid, r, style = {} }) {
  return (
    <div style={{
      width: size, height: size, borderRadius: r ?? size * 0.28,
      background: bg, flexShrink: 0, ...style,
    }} />
  );
}

// Progress bar (linear).
function WFProgress({ value = 0.5, h = 6, bg = WF.divider, fill = WF.accent, r = 100, style = {} }) {
  return (
    <div style={{ width: '100%', height: h, background: bg, borderRadius: r, overflow: 'hidden', ...style }}>
      <div style={{ width: `${Math.min(100, value * 100)}%`, height: '100%', background: fill, borderRadius: r }} />
    </div>
  );
}

// Donut chart — segmented ring, pure CSS conic-gradient.
function WFDonut({ size = 160, thickness = 22, segments = [], center, label }) {
  // segments = [{value, color}]
  const total = segments.reduce((a, s) => a + s.value, 0) || 1;
  let acc = 0;
  const stops = segments.map((s) => {
    const start = (acc / total) * 360;
    acc += s.value;
    const end = (acc / total) * 360;
    return `${s.color} ${start}deg ${end}deg`;
  }).join(', ');
  return (
    <div style={{
      width: size, height: size, borderRadius: size,
      background: `conic-gradient(${stops})`,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      position: 'relative', flexShrink: 0,
    }}>
      <div style={{
        width: size - thickness * 2, height: size - thickness * 2,
        borderRadius: size, background: WF.card,
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        gap: 4,
      }}>
        {center}
        {label && <div style={{ fontSize: 11, color: WF.textMute, fontFamily: WF.font }}>{label}</div>}
      </div>
    </div>
  );
}

// Vertical bar (for bar charts).
function WFBar({ h = 40, w = 12, bg = WF.accent, r = 4, style = {} }) {
  return <div style={{ width: w, height: h, background: bg, borderRadius: r, flexShrink: 0, ...style }} />;
}

// Sparkline — simple SVG line.
function WFSparkline({ w = 100, h = 32, values = [3, 5, 4, 7, 6, 9, 8, 11], stroke = WF.accent, fill }) {
  const max = Math.max(...values, 1);
  const min = Math.min(...values, 0);
  const pts = values.map((v, i) => {
    const x = (i / (values.length - 1)) * w;
    const y = h - ((v - min) / (max - min || 1)) * h;
    return `${x.toFixed(1)},${y.toFixed(1)}`;
  }).join(' ');
  const area = `0,${h} ${pts} ${w},${h}`;
  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} style={{ display: 'block' }}>
      {fill && <polygon points={area} fill={fill} />}
      <polyline points={pts} fill="none" stroke={stroke} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

// Top app bar — mimics Material 3 small style, but customizable.
function WFAppBar({ title, leading, trailing, large = false, sub }) {
  return (
    <div style={{ background: WF.surface, padding: '0 4px', flexShrink: 0 }}>
      <div style={{
        height: 56, display: 'flex', alignItems: 'center', gap: 4, padding: '0 4px',
      }}>
        <div style={{ width: 48, height: 48, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          {leading ?? <WFCircle size={28} bg={WF.block} />}
        </div>
        {!large && (
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{
              fontSize: 20, fontWeight: 500, color: WF.text,
              fontFamily: WF.font, lineHeight: 1.2,
            }}>{title}</div>
            {sub && <div style={{ fontSize: 12, color: WF.textMute, fontFamily: WF.font }}>{sub}</div>}
          </div>
        )}
        {large && <div style={{ flex: 1 }} />}
        <div style={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          {trailing}
        </div>
      </div>
      {large && (
        <div style={{ padding: '8px 20px 18px' }}>
          <div style={{ fontSize: 28, fontWeight: 500, color: WF.text, fontFamily: WF.font, letterSpacing: -0.3 }}>{title}</div>
          {sub && <div style={{ fontSize: 13, color: WF.textMute, marginTop: 4, fontFamily: WF.font }}>{sub}</div>}
        </div>
      )}
    </div>
  );
}

// Material 3 bottom nav — 5 destinations, active = teal pill.
function WFBottomNav({ active = 0, labels = ['Главная', 'История', '', 'Аналитика', 'Профиль'] }) {
  return (
    <div style={{
      background: WF.surface, padding: '12px 8px 16px',
      display: 'flex', justifyContent: 'space-around', alignItems: 'center',
      borderTop: `1px solid ${WF.divider}`,
      flexShrink: 0,
    }}>
      {labels.map((l, i) => {
        const isFab = l === '';
        if (isFab) {
          return (
            <div key={i} style={{
              width: 56, height: 56, borderRadius: 18, background: WF.accent,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 2px 8px rgba(0,106,96,0.25)',
              marginTop: -12,
            }}>
              <div style={{ width: 18, height: 2, background: '#fff', position: 'absolute' }} />
              <div style={{ width: 2, height: 18, background: '#fff' }} />
            </div>
          );
        }
        const isActive = i === active;
        return (
          <div key={i} style={{
            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4,
            flex: 1,
          }}>
            <div style={{
              padding: '4px 18px', borderRadius: 100,
              background: isActive ? WF.accentSoft : 'transparent',
            }}>
              <div style={{
                width: 22, height: 22, borderRadius: 6,
                background: isActive ? WF.accent : WF.blockDark,
              }} />
            </div>
            <div style={{
              fontSize: 11, fontFamily: WF.font, color: isActive ? WF.text : WF.textMute,
              fontWeight: isActive ? 600 : 400,
            }}>{l}</div>
          </div>
        );
      })}
    </div>
  );
}

// Annotation label — monospace caption (helpful for wireframes).
function WFAnnot({ children, style = {} }) {
  return (
    <span style={{
      fontFamily: WF.mono, fontSize: 10, color: WF.textMute,
      letterSpacing: 0.5, textTransform: 'uppercase', ...style,
    }}>{children}</span>
  );
}

// Section header within a screen.
function WFSection({ title, action, style = {}, children, gap = 12 }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap, ...style }}>
      {title && (
        <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', padding: '0 4px' }}>
          <div style={{ fontSize: 14, fontWeight: 600, color: WF.text, fontFamily: WF.font }}>{title}</div>
          {action && <div style={{ fontSize: 12, color: WF.accent, fontFamily: WF.font, fontWeight: 500 }}>{action}</div>}
        </div>
      )}
      {children}
    </div>
  );
}

// Container that fills the AndroidDevice content area with our surface bg.
function WFScreen({ children, scroll = true, p = 0, style = {} }) {
  return (
    <div style={{
      background: WF.surface, height: '100%',
      display: 'flex', flexDirection: 'column',
      fontFamily: WF.font, color: WF.text,
      ...style,
    }}>
      {children}
    </div>
  );
}

Object.assign(window, {
  WF, WFBlock, WFCircle, WFLine, WFChip, WFCard, WFIcon,
  WFProgress, WFDonut, WFBar, WFSparkline,
  WFAppBar, WFBottomNav, WFAnnot, WFSection, WFScreen,
});
