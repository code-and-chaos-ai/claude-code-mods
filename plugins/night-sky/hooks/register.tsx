import type { Register, ThemeSetArgs } from 'claude-code'

// ── Night sky ──────────────────────────────────────────────────────────────────────────────────────────────────
// A theme for the Claude Code desktop app. The whole sky turns slowly about a pole far off the top-left corner, the
// Milky Way breathes and gathers into star clouds, stars twinkle in groups by size, four shooting stars run on their
// own clocks, Orion stands in the right-hand strip (Betelgeuse warm, Rigel ice-blue, the belt brighter, the nebula a
// pink pulse), and hills and pines sit dark along the bottom. Frosted glass over the panels; your messages in frosted
// rose on the right, Claude's in frosted night blue.
//
// Lessons baked in (the desktop app is strict about a scene's CSS): no `transform-box`, no `@media` aspect-ratio
// rules (either one silently drops the whole animation block), and no blur filters (soft shapes are radial
// gradients). The scene stays well under 131,072 characters.

const W = 1600
const H = 1000
// the sky is drawn past every edge, so turning it never shows a corner
const X0 = -260
const X1 = 1860
const Y0 = -260
const Y1 = 1260

let seed = 20261114
const rnd = (): number => {
  seed = (seed * 1664525 + 1013904223) >>> 0
  return seed / 4294967296
}
const gauss = (): number => (rnd() + rnd() + rnd() + rnd() - 2) / 2
const f = (n: number): string => (Math.round(n * 10) / 10).toString()

// smooth value noise, so the Milky Way gathers into clouds and gaps instead of an even spray
function hash(x: number, y: number): number {
  let h = (Math.imul(x | 0, 73856093) ^ Math.imul(y | 0, 19349663) ^ 0x5bd1e995) | 0
  h = Math.imul(h ^ (h >>> 13), 0x5bd1e995)
  return ((h ^ (h >>> 15)) >>> 0) / 4294967296
}
function noise(x: number, y: number, s: number): number {
  const gx = Math.floor(x / s)
  const gy = Math.floor(y / s)
  const sm = (t: number) => t * t * (3 - 2 * t)
  const fx = sm(x / s - gx)
  const fy = sm(y / s - gy)
  const a = hash(gx, gy) * (1 - fx) + hash(gx + 1, gy) * fx
  const b = hash(gx, gy + 1) * (1 - fx) + hash(gx + 1, gy + 1) * fx
  return a * (1 - fy) + b * fy
}

// the Milky Way runs from the upper left down to the lower right
const BAND = { x0: -200, y0: 80, x1: 1800, y1: 920 }
const ANG = Math.atan2(BAND.y1 - BAND.y0, BAND.x1 - BAND.x0)
const bandAt = (t: number): [number, number] => [BAND.x0 + (BAND.x1 - BAND.x0) * t, BAND.y0 + (BAND.y1 - BAND.y0) * t]
const across = (x: number, y: number, d: number): [number, number] => [x - d * Math.sin(ANG), y + d * Math.cos(ANG)]
const density = (x: number, y: number): number => 0.25 + 0.75 * noise(x, y, 170) * (0.6 + 0.4 * noise(x + 999, y, 60))

const TINTS = ['#ffffff', '#f4f7ff', '#e6eeff', '#dfe8ff', '#fff6ea']
const tw = (p: number): string => (rnd() < p ? ` class="t${1 + Math.floor(rnd() * 6)}"` : '')

function field(): string {
  const out: string[] = []
  for (let i = 0; i < 380; i++) {
    const x = X0 + rnd() * (X1 - X0)
    const y = Y0 + rnd() * (Y1 - Y0)
    const r = 0.35 + rnd() * rnd() * 1.1
    out.push(`<circle cx="${f(x)}" cy="${f(y)}" r="${f(r)}" fill="${TINTS[Math.floor(rnd() * TINTS.length)]}" opacity="${f(0.18 + rnd() * 0.5)}"${tw(0.3)}/>`)
  }
  return out.join('')
}

function milkyWay(): string {
  const out: string[] = []
  // the glow: soft clouds strung along the band, each as bright as the noise says
  for (let i = 0; i < 46; i++) {
    const [bx, by] = bandAt(i / 45)
    const [x, y] = across(bx, by, 70 * gauss())
    const d = density(x, y)
    const tint = d > 0.72 ? 'cw' : d > 0.5 ? 'cm' : 'cc'
    // soft by its own gradient, not a blur filter: a blur is redrawn every frame of the turn and stops the motion
    out.push(`<ellipse cx="${f(x)}" cy="${f(y)}" rx="${f(150 + 170 * d)}" ry="${f(55 + 70 * d)}" transform="rotate(${f((ANG * 180) / Math.PI)} ${f(x)} ${f(y)})" fill="url(#${tint})" opacity="${f(0.04 + 0.15 * d * d)}"/>`)
  }
  // the dust: tiny stars, thick where the clouds are, thin in the gaps
  let placed = 0
  while (placed < 620) {
    const [bx, by] = bandAt(rnd())
    const [x, y] = across(bx, by, (rnd() < 0.3 ? 190 : 95) * gauss())
    if (rnd() > density(x, y)) continue
    placed++
    out.push(`<circle cx="${f(x)}" cy="${f(y)}" r="${f(0.3 + rnd() * 0.7)}" fill="#eef2ff" opacity="${f(0.25 + rnd() * 0.55)}"${tw(0.18)}/>`)
  }
  // dark dust lanes through the brightest stretch
  out.push(
    `<g transform="rotate(${f((ANG * 180) / Math.PI)} 800 500)" fill="url(#lane)">` +
      `<ellipse cx="780" cy="512" rx="540" ry="24" opacity=".6"/><ellipse cx="420" cy="498" rx="230" ry="15" opacity=".45"/>` +
      `<ellipse cx="1140" cy="520" rx="270" ry="16" opacity=".4"/></g>`,
  )
  return out.join('')
}

function bold(): string {
  const out: string[] = []
  for (let i = 0; i < 38; i++) {
    let x = X0 + rnd() * (X1 - X0)
    let y = Y0 + rnd() * (Y1 - Y0)
    if (rnd() < 0.4) [x, y] = across(...bandAt(rnd()), 90 * gauss())
    const halo = 14 + rnd() * 16
    const warm = rnd() < 0.05
    out.push(
      `<g class="g${1 + Math.floor(rnd() * 3)}"><circle cx="${f(x)}" cy="${f(y)}" r="${f(halo)}" fill="url(#${warm ? 'gw' : 'gb'})"/>` +
        `<circle cx="${f(x)}" cy="${f(y)}" r="${f(0.9 + rnd() * 1.1)}" fill="#fff"/></g>`,
    )
  }
  return out.join('')
}

const ORION: Array<[string, number, number, number, string]> = [
  ['Betelgeuse', 70, 70, 2.6, 'gw'],
  ['Bellatrix', 262, 96, 1.7, 'gb'],
  ['Meissa', 168, 20, 1.1, 'gb'],
  ['Alnitak', 132, 262, 1.9, 'gb'],
  ['Alnilam', 172, 246, 2.0, 'gb'],
  ['Mintaka', 212, 231, 1.8, 'gb'],
  ['Saiph', 108, 438, 1.6, 'gb'],
  ['Rigel', 292, 416, 2.7, 'gi'],
]
const ORION_LINES: Array<[number, number]> = [[0, 2], [2, 1], [0, 3], [1, 5], [3, 4], [4, 5], [3, 6], [5, 7]]

function orion(): string {
  const p = ORION
  const lines = ORION_LINES.map(([a, b]) => {
    const s = p[a]
    const t = p[b]
    return s && t ? `<line x1="${s[1]}" y1="${s[2]}" x2="${t[1]}" y2="${t[2]}"/>` : ''
  }).join('')
  const stars = p
    .map(([name, x, y, r, glow], i) => {
      const belt = i >= 3 && i <= 5
      const halo = r * (belt ? 13 : glow === 'gw' || glow === 'gi' ? 16 : 11)
      const core = glow === 'gw' ? '#ffd2a8' : glow === 'gi' ? '#e3eeff' : '#fff'
      return `<g class="${belt ? 'belt' : 'g2'}"><title>${name}</title><circle cx="${x}" cy="${y}" r="${f(halo)}" fill="url(#${glow})"/><circle cx="${x}" cy="${y}" r="${r}" fill="${core}"/></g>`
    })
    .join('')
  const sword =
    `<circle cx="168" cy="300" r=".9" fill="#fff" opacity=".8"/><circle cx="170" cy="338" r=".8" fill="#fff" opacity=".7"/>` +
    `<circle cx="169" cy="318" r="16" fill="url(#neb)" class="neb"/><circle cx="169" cy="318" r="1.1" fill="#fff"/>`
  return `<g id="orion" transform="translate(1290 255) scale(.8)"><g stroke="#cfdcff" stroke-width=".6" opacity=".14" fill="none">${lines}</g>${sword}${stars}</g>`
}

// a dark horizon: two ranges of rolling hills and a few pines
function horizon(): string {
  const far = `<path d="M0 1000 L0 944 C140 926 260 940 400 922 C560 902 700 932 860 918 C1020 904 1160 928 1320 912 C1440 900 1530 916 1600 908 L1600 1000 Z" fill="#070a18"/>`
  const near = `<path d="M0 1000 L0 962 C160 950 300 966 460 948 C620 932 760 958 940 950 C1120 942 1260 960 1420 946 C1500 940 1560 950 1600 946 L1600 1000 Z" fill="#04060e"/>`
  const pine = (x: number, y: number, h: number) =>
    `<path d="M${x} ${y - h} L${x - h * 0.22} ${y - h * 0.55} L${x - h * 0.12} ${y - h * 0.55} L${x - h * 0.3} ${y - h * 0.18} L${x - h * 0.08} ${y - h * 0.18} L${x - h * 0.08} ${y} L${x + h * 0.08} ${y} L${x + h * 0.08} ${y - h * 0.18} L${x + h * 0.3} ${y - h * 0.18} L${x + h * 0.12} ${y - h * 0.55} L${x + h * 0.22} ${y - h * 0.55} Z"/>`
  const pines = [[150, 954, 46], [178, 956, 34], [1300, 952, 50], [1334, 954, 38], [1362, 951, 28]]
    .map(([x, y, h]) => pine(x as number, y as number, h as number)).join('')
  return `${far}<g fill="#04060e">${near}${pines}</g>`
}
// shooting stars: a glowing head and a fading tail, each on its own path, angle, clock and length of streak
const METEORS: Array<[number, number, number, number, number, number, number]> = [
  // start x, y, travel dx, dy, cycle s, delay s, width
  [1260, 140, -560, 320, 17, 4, 1.6],
  [640, 90, -420, 190, 29, 13, 1.2],
  [1510, 300, -340, 265, 23, 9, 1.4],
  [990, 40, -470, 350, 37, 21, 1.1],
]
function meteors(): string {
  return METEORS.map(([x, y, dx, dy, , , w], i) => {
    const len = Math.hypot(dx, dy)
    const tx = x - (dx / len) * 150
    const ty = y - (dy / len) * 150
    return (
      `<linearGradient id="mt${i}" gradientUnits="userSpaceOnUse" x1="${f(tx)}" y1="${f(ty)}" x2="${x}" y2="${y}">` +
      `<stop offset="0" stop-color="#cfe0ff" stop-opacity="0"/><stop offset="1" stop-color="#ffffff" stop-opacity=".95"/></linearGradient>` +
      `<g class="m${i}"><line x1="${f(tx)}" y1="${f(ty)}" x2="${x}" y2="${y}" stroke="url(#mt${i})" stroke-width="${w}" stroke-linecap="round"/>` +
      `<circle cx="${x}" cy="${y}" r="9" fill="url(#gb)"/><circle cx="${x}" cy="${y}" r="${f(w * 1.1)}" fill="#fff"/></g>`
    )
  }).join('')
}
function meteorStyle(): string {
  return METEORS.map(([, , dx, dy, cycle, delay], i) => {
    const run = (1.3 / cycle) * 100 // every streak lasts about 1.3 s, whatever its cycle
    return (
      `@keyframes mk${i}{0%{transform:translate(0,0);opacity:0}${f(run * 0.12)}%{opacity:1}${f(run * 0.7)}%{opacity:.9}` +
      `${f(run)}%{transform:translate(${dx}px,${dy}px);opacity:0}100%{transform:translate(${dx}px,${dy}px);opacity:0}}` +
      `.m${i}{opacity:0;animation:mk${i} ${cycle}s linear ${delay}s infinite}`
    )
  }).join('')
}
const SCENE =
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" preserveAspectRatio="xMidYMid slice">` +
  `<style>` +
  `.sky{transform-origin:-160px -220px;animation:turn 140s steps(700) infinite alternate}` +
  `@keyframes turn{from{transform:rotate(-3deg)}to{transform:rotate(3deg)}}` +
  `@keyframes tw{0%,100%{opacity:1}50%{opacity:.25}}@keyframes gl{0%,100%{opacity:1}50%{opacity:.6}}` +
  `@keyframes bl{0%,100%{opacity:1}50%{opacity:.8}}` +
  `@keyframes sh{0%{transform:translate(0,0);opacity:0}1%{opacity:1}5%{transform:translate(-520px,300px);opacity:0}100%{transform:translate(-520px,300px);opacity:0}}` +
  `.t1{animation:tw 3.1s ease-in-out infinite}.t2{animation:tw 4.7s ease-in-out -1.2s infinite}.t3{animation:tw 5.9s ease-in-out -2.9s infinite}` +
  `.t4{animation:tw 7.3s ease-in-out -.6s infinite}.t5{animation:tw 2.6s ease-in-out -1.7s infinite}.t6{animation:tw 9.1s ease-in-out -4.4s infinite}` +
  `.g1{animation:gl 6s ease-in-out infinite}.g2{animation:gl 8.5s ease-in-out -3s infinite}.g3{animation:gl 11s ease-in-out -6s infinite}` +
  `.belt{animation:bl 7s ease-in-out infinite}.neb{animation:nb 6s ease-in-out infinite}` +
  meteorStyle() +
  `.mw{animation:mwb 26s ease-in-out infinite}@keyframes mwb{0%,100%{opacity:1}50%{opacity:.7}}` +
  `@keyframes nb{0%,100%{opacity:1}50%{opacity:.3}}` +
  
  `</style><defs>` +
  `<linearGradient id="sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#03050d"/><stop offset=".55" stop-color="#081028"/><stop offset="1" stop-color="#141e48"/></linearGradient>` +
  `<radialGradient id="hz" cx=".5" cy="1.1" r=".7"><stop offset="0" stop-color="#34407e" stop-opacity=".6"/><stop offset="1" stop-color="#34407e" stop-opacity="0"/></radialGradient>` +
  `<radialGradient id="gb"><stop offset="0" stop-color="#eef3ff" stop-opacity="1"/><stop offset=".3" stop-color="#b9cdff" stop-opacity=".45"/><stop offset="1" stop-color="#b9cdff" stop-opacity="0"/></radialGradient>` +
  `<radialGradient id="gi"><stop offset="0" stop-color="#f0f6ff" stop-opacity="1"/><stop offset=".3" stop-color="#9fc0ff" stop-opacity=".5"/><stop offset="1" stop-color="#9fc0ff" stop-opacity="0"/></radialGradient>` +
  `<radialGradient id="gw"><stop offset="0" stop-color="#ffe2c2" stop-opacity="1"/><stop offset=".3" stop-color="#ff9d5c" stop-opacity=".5"/><stop offset="1" stop-color="#ff9d5c" stop-opacity="0"/></radialGradient>` +
  `<radialGradient id="neb"><stop offset="0" stop-color="#ff6fae" stop-opacity=".55"/><stop offset=".5" stop-color="#d04f9a" stop-opacity=".18"/><stop offset="1" stop-color="#d04f9a" stop-opacity="0"/></radialGradient>` +
  `<linearGradient id="trail" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#fff" stop-opacity="0"/><stop offset="1" stop-color="#fff" stop-opacity=".9"/></linearGradient>` +
  `<radialGradient id="cw"><stop offset="0" stop-color="#fff0de"/><stop offset=".45" stop-color="#fff0de" stop-opacity=".45"/><stop offset="1" stop-color="#fff0de" stop-opacity="0"/></radialGradient>` +
  `<radialGradient id="cm"><stop offset="0" stop-color="#e4e9ff"/><stop offset=".45" stop-color="#e4e9ff" stop-opacity=".45"/><stop offset="1" stop-color="#e4e9ff" stop-opacity="0"/></radialGradient>` +
  `<radialGradient id="cc"><stop offset="0" stop-color="#9fb0ff"/><stop offset=".45" stop-color="#9fb0ff" stop-opacity=".45"/><stop offset="1" stop-color="#9fb0ff" stop-opacity="0"/></radialGradient>` +
  `<radialGradient id="lane"><stop offset="0" stop-color="#03050d"/><stop offset=".5" stop-color="#03050d" stop-opacity=".6"/><stop offset="1" stop-color="#03050d" stop-opacity="0"/></radialGradient>` +
  `</defs>` +
  `<rect width="${W}" height="${H}" fill="url(#sky)"/>` +
  `<g class="sky"><g class="mw">${milkyWay()}</g>${field()}${bold()}${orion()}</g>` +
  `<rect width="${W}" height="${H}" fill="url(#hz)"/>` +
  meteors() +
  horizon() +
  `</svg>`

const LOOK: ThemeSetArgs = {
  // night blue with a hint of rose: the glass tint colors the side panels
  backdrop: { scene: 'night-sky', glass: { blur: 14, tint: '#1a1638', opacity: 0.42 } },
}

// frosted bubbles (8-digit hex = color + see-through): Claude's night blue; yours deep rose, drawn by this mod in
// place of the app's own (whose color is a faint gray of the theme and can't be set on its own)
const CLAUDE_BUBBLE = '#16244f66'
const YOUR_BUBBLE = '#6b2350a6'

// set at start, and again on your first message after a load (a resumed session may not start afresh)
let isSet = false

export const register: Register = on => {
  on('session.start', async ($, e, next) => {
    const set = await $.theme.set(LOOK)
    isSet = true
    if (!set.isDrawn) $.ui.status(set.reason)
    return next(e)
  })

  on('prompt.submit', async ($, e, next) => {
    if (!isSet) {
      isSet = true
      const set = await $.theme.set(LOOK)
      if (!set.isDrawn) $.ui.status(set.reason)
    }
    return next(e)
  })

  on('ui.render', { component: 'Backdrop' }, ($, e, next) => {
    if (e.surface !== 'desktop' && e.surface !== 'mobile') return next(e)
    const { Svg } = $.ui.resolve(e)
    return <Svg source={SCENE} alt="A night sky turning slowly: the Milky Way, glowing stars, Orion, shooting stars, dark hills" isInteractive />
  })

  on('ui.render', { component: 'UserMessage' }, ($, e, next) => {
    // your own words only: not a background task's notice, not another agent's or session's message
    if (e.surface !== 'desktop' || e.props.task !== undefined || e.props.from !== undefined) return next(e)
    const { Box, Text } = $.ui.resolve(e)
    return (
      <Box flexDirection="row" width="100%">
        {/* the spacer keeps at least a fifth free on the left; the bubble is as wide as your words, up to the rest */}
        <Box flexGrow={1} minWidth="20%" />
        <Box flexShrink={1} backgroundColor={YOUR_BUBBLE} borderStyle="round" borderColor="#d77fb1" paddingX={1}>
          <Text>{e.props.text}</Text>
        </Box>
      </Box>
    )
  })

  on('ui.render', { component: 'AssistantMessage' }, async ($, e, next) => {
    if (e.surface !== 'desktop') return next(e)
    const { Box } = $.ui.resolve(e)
    const row = await next(e)
    return <Box backgroundColor={CLAUDE_BUBBLE} borderStyle="round" borderColor="#5d74c4" paddingX={1}>{row}</Box>
  })
}
