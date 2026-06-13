// Dark-mode overrides for the WF token object. Mutates in place so all
// components (which look up WF.* at render time) pick up the new values.
// Must run BEFORE any screen component is rendered.

Object.assign(window.WF, {
  bg:        '#0F1715',   // canvas behind device
  surface:   '#171F1D',   // screen background
  card:      '#1F2A28',   // elevated card
  block:     '#283532',   // placeholder block
  blockMid:  '#384844',
  blockDark: '#6E8480',   // strong placeholder (icons, etc.)
  text:      '#E8EFED',
  textMute:  '#9BAAA6',
  divider:   '#243230',
  accent:    '#83D5C6',   // M3 dark primary
  accentSoft:'#1F4A45',
  warm:      '#FFB59A',
  warmSoft:  '#4A2B1C',
  positive:  '#7DD9A0',
});
