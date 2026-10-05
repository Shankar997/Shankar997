// Generates every SVG panel used by README.md from the config below.
// Run:  node scripts/build-assets.mjs
// If assets/shankar-character.(jpg|jpeg|png|webp) exists, it is embedded into the
// VISUAL.MAP panel of assets/hero.svg; otherwise a vector silhouette is used.
// (GitHub blocks external/relative files inside SVGs, so the photo must be inlined.)

import { existsSync, mkdirSync, readFileSync, statSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const ASSETS = join(ROOT, 'assets');

// ─── Brand tokens ────────────────────────────────────────────────────────────
const C = {
  bg: '#111820',
  bg2: '#171D27',
  surface: '#202630',
  text: '#F2F2EE',
  muted: '#A8ADB5',
  accent: '#FF9A3D',
  highlight: '#FFC56B',
  purple: '#443B52',
  line: '#2A313C',
};
const MONO = `'JetBrains Mono','SFMono-Regular',Menlo,Consolas,'Liberation Mono',monospace`;
const SANS = `Inter,'Segoe UI',-apple-system,BlinkMacSystemFont,system-ui,Helvetica,Arial,sans-serif`;

// ─── Content ─────────────────────────────────────────────────────────────────
const profile = {
  name: 'Shankar',
  role: 'Frontend Developer',
  experience: '6+ Years',
  status: 'Available for opportunities',
  stack: ['React.js', 'Next.js', 'TypeScript', 'JavaScript', 'Tailwind CSS', 'REST APIs'],
  focus: ['Scalable Frontend Architecture', 'Performance Optimization', 'Interactive UI', 'AI-powered Applications'],
  projects: ['Sobhaverse', 'Magical Moments Photography', 'Grillmasters'],
};

const techStack = [
  { title: 'Frontend', note: '// interfaces', items: ['React.js', 'Next.js', 'TypeScript', 'JavaScript', 'Tailwind CSS'] },
  { title: 'State & Data', note: '// data flow', items: ['Redux Toolkit', 'Zustand', 'React Query', 'REST APIs'] },
  { title: 'Animation & UI', note: '// motion', items: ['Framer Motion', 'GSAP', 'Three.js', 'Shadcn/ui'] },
  { title: 'DevOps / Cloud', note: '// ship', items: ['Git', 'GitHub', 'Docker', 'Vercel', 'Azure'] },
  { title: 'AI', note: '// intelligence', items: ['AI APIs', 'LLM Integration', 'AI Applications', 'AI-assisted Dev'] },
];

const capabilities = [
  ['Scalable Frontend', 'Architecture', 'Modular structure and clear boundaries that keep codebases maintainable.'],
  ['High-performance', 'React Apps', 'Lean renders, code-splitting and fast, responsive interactions.'],
  ['Next.js', 'Development', 'Server rendering, routing and SEO-friendly production pages.'],
  ['API', 'Integration', 'REST APIs, auth flows and server state with React Query.'],
  ['Responsive', 'UI / UX', 'Careful layouts that hold up on every screen size.'],
  ['Reusable Component', 'Systems', 'Composable, consistent building blocks shared across products.'],
  ['Interactive', 'Animations', 'Purposeful motion with Framer Motion, GSAP and Three.js.'],
  ['AI-powered', 'Web Applications', 'LLM and AI API integration inside real product flows.'],
];

const projects = [
  {
    name: 'Sobhaverse',
    kind: 'orbit',
    desc: 'Next.js-based interactive digital experience with modern animations, API integration and responsive UI.',
    tags: ['Next.js', 'Animation', 'APIs'],
  },
  {
    name: 'Magical Moments Photography',
    kind: 'photo',
    domain: 'magicalphotos.net',
    desc: 'Wedding and family photography website showcasing professional photography services.',
    tags: ['WordPress', 'Responsive Design', 'SEO'],
  },
  {
    name: 'Grillmasters',
    kind: 'site',
    domain: 'grillmasters.in',
    desc: 'Restaurant brand site with a clean, conversion-focused responsive UI.',
    tags: ['HTML5', 'CSS3', 'Bootstrap 4', 'Responsive Design'],
  },
];

const buttons = [
  { file: 'btn-portfolio.svg', label: 'Portfolio', icon: 'globe' },
  { file: 'btn-github.svg', label: 'GitHub', icon: 'github' },
  { file: 'btn-linkedin.svg', label: 'LinkedIn', icon: 'linkedin' },
  { file: 'btn-email.svg', label: 'Email', icon: 'mail' },
];

// ─── Helpers ─────────────────────────────────────────────────────────────────
const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const monoW = (str, size) => str.length * size * 0.6;

function wrap(text, maxChars) {
  const lines = [];
  let cur = '';
  for (const word of text.split(' ')) {
    if ((cur + ' ' + word).trim().length > maxChars) {
      lines.push(cur);
      cur = word;
    } else cur = (cur + ' ' + word).trim();
  }
  if (cur) lines.push(cur);
  return lines;
}

const baseStyle = `
  .mono{font-family:${MONO}}
  .sans{font-family:${SANS}}
  .fade{opacity:0;animation:fade .6s ease-out forwards}
  @keyframes fade{from{opacity:0;transform:translateY(4px)}to{opacity:1;transform:none}}
  .pulse{animation:pulse 2.4s ease-in-out infinite}
  @keyframes pulse{0%,100%{opacity:1}50%{opacity:.35}}
  .blink{animation:blink 1.1s steps(1) infinite}
  @keyframes blink{50%{opacity:0}}
  @media (prefers-reduced-motion: reduce){*{animation:none!important;opacity:1!important}}
`;

const sharedDefs = (id) => `
  <pattern id="${id}-dots" width="18" height="18" patternUnits="userSpaceOnUse">
    <circle cx="1" cy="1" r="0.9" fill="${C.muted}" opacity="0.09"/>
  </pattern>
  <radialGradient id="${id}-purple" cx="0.85" cy="0" r="0.75">
    <stop offset="0" stop-color="${C.purple}" stop-opacity="0.55"/>
    <stop offset="1" stop-color="${C.purple}" stop-opacity="0"/>
  </radialGradient>
  <radialGradient id="${id}-amber" cx="0.1" cy="1" r="0.7">
    <stop offset="0" stop-color="${C.accent}" stop-opacity="0.10"/>
    <stop offset="1" stop-color="${C.accent}" stop-opacity="0"/>
  </radialGradient>`;

// Window frame shared by every panel: dark glass body, dot grid, glow, title bar.
function windowFrame({ id, w, h, title, right = '' }) {
  return `
  <rect x="0.5" y="0.5" width="${w - 1}" height="${h - 1}" rx="16" fill="${C.bg}" stroke="${C.surface}"/>
  <rect x="0.5" y="0.5" width="${w - 1}" height="${h - 1}" rx="16" fill="url(#${id}-dots)"/>
  <rect x="0.5" y="0.5" width="${w - 1}" height="${h - 1}" rx="16" fill="url(#${id}-purple)"/>
  <rect x="0.5" y="0.5" width="${w - 1}" height="${h - 1}" rx="16" fill="url(#${id}-amber)"/>
  <line x1="0" y1="40" x2="${w}" y2="40" stroke="${C.surface}"/>
  <circle cx="22" cy="20" r="4.5" fill="${C.purple}"/>
  <circle cx="38" cy="20" r="4.5" fill="${C.line}"/>
  <circle cx="54" cy="20" r="4.5" fill="${C.accent}" opacity="0.85"/>
  <text x="${w / 2}" y="24.5" text-anchor="middle" class="mono" font-size="11.5" fill="${C.muted}" letter-spacing="0.4">${esc(title)}</text>
  ${right}`;
}

function svg({ w, h, id, label, body, extraDefs = '', extraStyle = '' }) {
  return `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" role="img" aria-labelledby="${id}-t">
<title id="${id}-t">${esc(label)}</title>
<style>${baseStyle}${extraStyle}</style>
<defs>${sharedDefs(id)}${extraDefs}</defs>
${body}
</svg>
`;
}

function save(name, content) {
  writeFileSync(join(ASSETS, name), content);
  console.log(`  ✓ assets/${name}  ${(Buffer.byteLength(content) / 1024).toFixed(1)} KB`);
}

// ─── HERO ────────────────────────────────────────────────────────────────────
function findCharacter() {
  for (const ext of ['jpg', 'jpeg', 'webp', 'png']) {
    const p = join(ASSETS, `shankar-character.${ext}`);
    if (existsSync(p)) return { p, ext };
  }
  return null;
}

// Frame for the VISUAL.MAP image area
const F = { x: 36, y: 104, w: 368, h: 456 };

function characterVector() {
  // Stylised developer bust: dark figure, warm rim light on the right, cool on the left.
  const cx = 220;
  const head = `M${cx - 50} 262 C${cx - 52} 214 ${cx - 26} 190 ${cx} 190 C${cx + 28} 190 ${cx + 52} 214 ${cx + 50} 262 C${cx + 48} 300 ${cx + 26} 330 ${cx} 330 C${cx - 26} 330 ${cx - 48} 300 ${cx - 50} 262 Z`;
  const hair = `M${cx - 52} 250 C${cx - 60} 200 ${cx - 30} 178 ${cx + 2} 178 C${cx + 40} 176 ${cx + 62} 204 ${cx + 52} 252 C${cx + 44} 228 ${cx + 30} 216 ${cx + 6} 214 C${cx - 18} 213 ${cx - 40} 224 ${cx - 52} 250 Z`;
  const body = `M48 ${F.y + F.h} C56 470 92 420 150 400 C176 391 192 380 196 352 L244 352 C248 380 264 391 290 400 C348 420 384 470 392 ${F.y + F.h} Z`;
  const neck = `M196 318 L196 360 C208 372 232 372 244 360 L244 318 Z`;
  const shape = (fill, dx, extra = '') => `
      <g transform="translate(${dx} 0)" ${extra}>
        <path d="${body}" fill="${fill}"/><path d="${neck}" fill="${fill}"/>
        <path d="${head}" fill="${fill}"/><path d="${hair}" fill="${fill}"/>
      </g>`;
  return `
    <g>
      ${shape(C.purple, -5, 'filter="url(#h-soft)" opacity="0.9"')}
      ${shape('url(#h-rim)', 6, 'filter="url(#h-soft)"')}
      ${shape('url(#h-figure)', 0)}
      <!-- collar / hoodie seam -->
      <path d="M172 404 C196 430 244 430 268 404" fill="none" stroke="${C.surface}" stroke-width="2"/>
      <path d="M220 428 L220 ${F.y + F.h}" stroke="${C.surface}" stroke-width="1.5"/>
      <!-- glasses catching the screen light -->
      <g fill="none" stroke="${C.highlight}" stroke-width="1.6" opacity="0.75">
        <rect x="182" y="252" width="32" height="20" rx="6"/>
        <rect x="226" y="252" width="32" height="20" rx="6"/>
        <path d="M214 260 L226 260"/>
      </g>
      <rect x="186" y="256" width="24" height="3" rx="1.5" fill="${C.highlight}" opacity="0.35"/>
      <rect x="230" y="256" width="24" height="3" rx="1.5" fill="${C.highlight}" opacity="0.35"/>
    </g>`;
}

function characterImage({ p, ext }) {
  const kb = statSync(p).size / 1024;
  if (kb > 350) console.warn(`  ! ${p} is ${kb.toFixed(0)} KB — compress it (aim for < 250 KB) so the README loads fast.`);
  const mime = ext === 'jpg' ? 'jpeg' : ext;
  const data = readFileSync(p).toString('base64');
  return `<image x="${F.x}" y="${F.y}" width="${F.w}" height="${F.h}" preserveAspectRatio="xMidYMid slice" href="data:image/${mime};base64,${data}" xlink:href="data:image/${mime};base64,${data}"/>`;
}

function buildHero() {
  const W = 1000, H = 600;
  const char = findCharacter();
  const k = 13.5; // terminal font size
  const lx = 464;  // terminal left
  const vx = 612;  // value column
  let d = 0.15;    // animation delay counter
  const step = () => (d += 0.07).toFixed(2);
  const L = (y, inner, extra = '') =>
    `<text x="${lx}" y="${y}" class="mono fade" font-size="${k}" style="animation-delay:${step()}s" ${extra}>${inner}</text>`;

  const prompt = (y, cmd, cursor = false) => {
    const pre = 'shankar@developer:~# ';
    const cur = cursor
      ? `<rect x="${lx + monoW(pre, k) + 2}" y="${y - 12}" width="8" height="15" fill="${C.accent}" class="blink"/>`
      : '';
    return `${L(y, `<tspan fill="${C.accent}">shankar@developer</tspan><tspan fill="${C.muted}">:</tspan><tspan fill="${C.highlight}">~</tspan><tspan fill="${C.muted}"># </tspan><tspan fill="${C.text}">${esc(cmd)}</tspan>`)}${cur}`;
  };

  const kv = (y, key, val, valFill = C.text, weight = 400, dot = false) => {
    const keyStr = `> ${key}`;
    const start = lx + monoW(keyStr, k) + 8;
    const vxx = dot ? vx + 16 : vx;
    return `
      ${L(y, `<tspan fill="${C.accent}">&gt; </tspan><tspan fill="${C.muted}">${esc(key)}</tspan>`)}
      <line x1="${start}" y1="${y - 4}" x2="${vx - 10}" y2="${y - 4}" stroke="${C.purple}" stroke-width="1.6" stroke-linecap="round" stroke-dasharray="0.1 5"/>
      ${dot ? `<circle cx="${vx + 4}" cy="${y - 4.5}" r="4" fill="${C.highlight}" class="pulse"/>` : ''}
      <text x="${vxx}" y="${y}" class="mono fade" font-size="${k}" fill="${valFill}" font-weight="${weight}" style="animation-delay:${step()}s">${esc(val)}</text>`;
  };

  const block = (x, y, title, items, bullet = false) => {
    const head = `<text x="${x}" y="${y}" class="mono fade" font-size="11.5" letter-spacing="1.6" style="animation-delay:${step()}s"><tspan fill="${C.accent}">&gt; ${esc(title.toUpperCase())}</tspan><tspan fill="${C.muted}" opacity="0.55">  [${String(items.length).padStart(2, '0')}]</tspan></text>`;
    const rows = items
      .map((it, i) => {
        const glyph = bullet ? '•' : i === items.length - 1 ? '└─' : '├─';
        const gFill = bullet ? C.accent : '#5C5470';
        return `<text x="${x}" y="${y + 24 + i * 20}" class="mono fade" font-size="13" style="animation-delay:${step()}s"><tspan fill="${gFill}">${glyph} </tspan><tspan fill="${C.text}" opacity="0.92">${esc(it)}</tspan></text>`;
      })
      .join('\n');
    return head + rows;
  };

  const corner = (x, y, sx, sy) =>
    `<path d="M${x} ${y + sy * 16} L${x} ${y} L${x + sx * 16} ${y}" fill="none" stroke="${C.accent}" stroke-width="1.5" opacity="0.8"/>`;

  const extraDefs = `
    <clipPath id="h-frame"><rect x="${F.x}" y="${F.y}" width="${F.w}" height="${F.h}" rx="8"/></clipPath>
    <radialGradient id="h-key" cx="0.72" cy="0.55" r="0.65">
      <stop offset="0" stop-color="${C.accent}" stop-opacity="0.42"/>
      <stop offset="0.55" stop-color="${C.accent}" stop-opacity="0.08"/>
      <stop offset="1" stop-color="${C.accent}" stop-opacity="0"/>
    </radialGradient>
    <linearGradient id="h-rim" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="${C.highlight}"/>
      <stop offset="1" stop-color="${C.accent}" stop-opacity="0.6"/>
    </linearGradient>
    <linearGradient id="h-figure" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0" stop-color="#0C1117"/>
      <stop offset="0.7" stop-color="#151B24"/>
      <stop offset="1" stop-color="#2A2622"/>
    </linearGradient>
    <linearGradient id="h-vignette" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="${C.bg}" stop-opacity="0.35"/>
      <stop offset="0.45" stop-color="${C.bg}" stop-opacity="0"/>
      <stop offset="1" stop-color="${C.bg}" stop-opacity="0.85"/>
    </linearGradient>
    <linearGradient id="h-scan" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0" stop-color="${C.accent}" stop-opacity="0"/>
      <stop offset="0.5" stop-color="${C.highlight}" stop-opacity="0.55"/>
      <stop offset="1" stop-color="${C.accent}" stop-opacity="0"/>
    </linearGradient>
    <linearGradient id="h-grade" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0" stop-color="${C.purple}" stop-opacity="0.35"/>
      <stop offset="1" stop-color="${C.accent}" stop-opacity="0.18"/>
    </linearGradient>
    <filter id="h-soft" x="-20%" y="-20%" width="140%" height="140%"><feGaussianBlur stdDeviation="2.4"/></filter>
    <filter id="h-fog" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="22"/></filter>`;

  const extraStyle = `
    .scan{animation:scan 7s linear infinite}
    @keyframes scan{from{transform:translateY(0)}to{transform:translateY(${F.h}px)}}
    .drift{animation:drift 14s ease-in-out infinite alternate}
    @keyframes drift{from{transform:translateX(-24px)}to{transform:translateX(24px)}}
    .spin{transform-origin:220px 262px;animation:spin 40s linear infinite}
    @keyframes spin{to{transform:rotate(360deg)}}`;

  const visual = `
  <!-- LEFT · VISUAL.MAP -->
  <rect x="20" y="60" width="400" height="520" rx="12" fill="${C.bg2}" fill-opacity="0.75" stroke="${C.surface}"/>
  <text x="38" y="88" class="mono" font-size="11" letter-spacing="2.6" fill="${C.accent}">VISUAL.MAP</text>
  <text x="402" y="88" text-anchor="end" class="mono" font-size="10.5" letter-spacing="1.4" fill="${C.muted}" opacity="0.7">FRAME 01/01 · <tspan fill="${C.accent}" class="pulse">● REC</tspan></text>
  <g clip-path="url(#h-frame)">
    <rect x="${F.x}" y="${F.y}" width="${F.w}" height="${F.h}" fill="#0D1218"/>
    <rect x="${F.x}" y="${F.y}" width="${F.w}" height="${F.h}" fill="url(#h-dots)"/>
    <rect x="${F.x}" y="${F.y}" width="${F.w}" height="${F.h}" fill="url(#h-key)"/>
    ${char ? characterImage(char) : characterVector()}
    ${char ? `<rect x="${F.x}" y="${F.y}" width="${F.w}" height="${F.h}" fill="url(#h-grade)" style="mix-blend-mode:soft-light"/>` : ''}
    <g class="drift" filter="url(#h-fog)">
      <ellipse cx="160" cy="${F.y + F.h - 30}" rx="190" ry="40" fill="${C.muted}" opacity="0.16"/>
      <ellipse cx="320" cy="${F.y + F.h - 90}" rx="140" ry="28" fill="${C.highlight}" opacity="0.08"/>
    </g>
    <rect x="${F.x}" y="${F.y}" width="${F.w}" height="${F.h}" fill="url(#h-vignette)"/>
    <rect x="${F.x}" y="${F.y}" width="${F.w}" height="2" fill="url(#h-scan)" class="scan"/>
  </g>
  ${char ? '' : `<circle cx="220" cy="262" r="104" fill="none" stroke="${C.accent}" stroke-opacity="0.28" stroke-dasharray="2 7" class="spin"/>`}
  ${corner(F.x, F.y, 1, 1)}${corner(F.x + F.w, F.y, -1, 1)}${corner(F.x, F.y + F.h, 1, -1)}${corner(F.x + F.w, F.y + F.h, -1, -1)}
  <text x="${F.x + 14}" y="${F.y + F.h - 16}" class="mono" font-size="10.5" letter-spacing="1.3" fill="${C.text}" opacity="0.85">SUBJECT <tspan fill="${C.accent}">SHANKAR</tspan>  ·  FRONTEND DEV</text>
  <text x="${F.x + F.w - 14}" y="${F.y + 22}" text-anchor="end" class="mono" font-size="10" letter-spacing="1.2" fill="${C.muted}" opacity="0.75">ID · SHK-997</text>`;

  const terminal = `
  <!-- RIGHT · TERMINAL -->
  <rect x="440" y="60" width="540" height="520" rx="12" fill="${C.bg2}" fill-opacity="0.6" stroke="${C.surface}"/>
  <text x="956" y="88" text-anchor="end" class="mono" font-size="10.5" letter-spacing="1.4" fill="${C.muted}" opacity="0.6">TTY/01 · zsh</text>
  ${prompt(100, './profile.sh')}
  ${L(124, `<tspan fill="${C.muted}" opacity="0.7">  loading modules </tspan><tspan fill="#5C5470">··········· </tspan><tspan fill="${C.highlight}">done</tspan>`)}
  ${kv(160, 'Name', profile.name, C.text, 700)}
  ${kv(184, 'Role', profile.role)}
  ${kv(208, 'Experience', profile.experience, C.highlight)}
  <line x1="${lx}" y1="230" x2="956" y2="230" stroke="${C.surface}"/>
  ${block(lx, 258, 'Stack', profile.stack)}
  ${block(690, 258, 'Projects', profile.projects, true)}
  ${block(690, 368, 'Focus', profile.focus)}
  <line x1="${lx}" y1="508" x2="956" y2="508" stroke="${C.surface}"/>
  ${kv(536, 'Status', profile.status, C.text, 400, true)}
  ${prompt(562, '', true)}`;

  const right = `<text x="${W - 20}" y="24" text-anchor="end" class="mono" font-size="10.5" letter-spacing="1.5" fill="${C.muted}"><tspan fill="${C.highlight}" class="pulse">●</tspan> SYS.ONLINE</text>`;

  const body = windowFrame({ id: 'h', w: W, h: H, title: 'shankar@developer — ~/profile', right }) + visual + terminal;
  const label = `Developer workspace panel. Left: VISUAL.MAP portrait of Shankar. Right: terminal running profile.sh — Name: Shankar; Role: ${profile.role}; Experience: ${profile.experience}; Stack: ${profile.stack.join(', ')}; Focus: ${profile.focus.join(', ')}; Projects: ${profile.projects.join(', ')}; Status: ${profile.status}.`;
  save('hero.svg', svg({ w: W, h: H, id: 'h', label, body, extraDefs, extraStyle }));
  console.log(char ? `    (embedded ${char.p})` : '    (no assets/shankar-character.* found — using vector silhouette)');
}

// ─── TECH STACK ──────────────────────────────────────────────────────────────
function buildStack() {
  const W = 1000, cols = 3, gap = 16, pad = 20;
  const chipH = 28, chipGap = 8, fs = 12;
  const lines = Math.ceil(techStack.length / cols);
  // A short last line stretches its cards to fill the full width.
  const layout = techStack.map((cat, idx) => {
    const line = Math.floor(idx / cols), col = idx % cols;
    const perLine = Math.min(cols, techStack.length - line * cols);
    const cw = (W - pad * 2 - gap * (perLine - 1)) / perLine;
    let x = 0, row = 0;
    const chips = cat.items.map((t) => {
      const w = monoW(t, fs) + 30;
      if (x + w > cw - 32) { x = 0; row++; }
      const c = { t, x, row, w };
      x += w + chipGap;
      return c;
    });
    return { ...cat, chips, rows: row + 1, line, col, cw };
  });
  const cardH = [...Array(lines).keys()].map(
    (l) => 72 + Math.max(...layout.filter((c) => c.line === l).map((c) => c.rows)) * (chipH + chipGap) + 8);
  const lineY = cardH.map((_, l) => 60 + cardH.slice(0, l).reduce((a, h) => a + h + gap, 0));
  const H = lineY[lines - 1] + cardH[lines - 1] + 20;

  let i = 0;
  const cards = layout.map((cat, idx) => {
    const { line, col, cw } = cat;
    const x = pad + col * (cw + gap);
    const y = lineY[line];
    const chips = cat.chips.map((c) => {
      const cx = x + 16 + c.x, cy = y + 66 + c.row * (chipH + chipGap);
      return `<g class="fade" style="animation-delay:${(0.1 + i++ * 0.03).toFixed(2)}s">
        <rect x="${cx}" y="${cy}" width="${c.w}" height="${chipH}" rx="${chipH / 2}" fill="${C.surface}" stroke="${C.line}"/>
        <circle cx="${cx + 13}" cy="${cy + chipH / 2}" r="3" fill="${C.accent}"/>
        <text x="${cx + 22}" y="${cy + 18.5}" class="mono" font-size="${fs}" fill="${C.text}">${esc(c.t)}</text>
      </g>`;
    }).join('');
    return `
    <rect x="${x}" y="${y}" width="${cw}" height="${cardH[line]}" rx="12" fill="${C.bg2}" fill-opacity="0.7" stroke="${C.surface}"/>
    <text x="${x + 16}" y="${y + 30}" class="mono" font-size="11" letter-spacing="1.5" fill="${C.accent}">${String(idx + 1).padStart(2, '0')}</text>
    <text x="${x + 42}" y="${y + 31}" class="sans" font-size="15.5" font-weight="600" fill="${C.text}">${esc(cat.title)}</text>
    <text x="${x + cw - 16}" y="${y + 30}" text-anchor="end" class="mono" font-size="10.5" fill="${C.muted}" opacity="0.6">${esc(cat.note)}</text>
    <line x1="${x + 16}" y1="${y + 46}" x2="${x + cw - 16}" y2="${y + 46}" stroke="${C.surface}"/>
    ${chips}`;
  }).join('');

  const body = windowFrame({ id: 's', w: W, h: H, title: '~/stack — tree --depth 2' }) + cards;
  const label = 'Tech stack. ' + techStack.map((c) => `${c.title}: ${c.items.join(', ')}`).join('. ') + '.';
  save('tech-stack.svg', svg({ w: W, h: H, id: 's', label, body }));
}

// ─── CAPABILITIES ────────────────────────────────────────────────────────────
function buildCapabilities() {
  const W = 1000, cols = 4, gap = 14, pad = 20;
  const cw = (W - pad * 2 - gap * (cols - 1)) / cols;
  const ch = 150;
  const H = 60 + ch * 2 + gap + 20;
  const tiles = capabilities.map(([t1, t2, desc], idx) => {
    const col = idx % cols, line = Math.floor(idx / cols);
    const x = pad + col * (cw + gap), y = 60 + line * (ch + gap);
    const dl = wrap(desc, 32);
    return `<g class="fade" style="animation-delay:${(0.1 + idx * 0.06).toFixed(2)}s">
      <rect x="${x}" y="${y}" width="${cw}" height="${ch}" rx="12" fill="${C.bg2}" fill-opacity="0.7" stroke="${C.surface}"/>
      <rect x="${x}" y="${y + 18}" width="2.5" height="20" rx="1.25" fill="${C.accent}"/>
      <text x="${x + 16}" y="${y + 33}" class="mono" font-size="11" letter-spacing="1.5" fill="${C.accent}">${String(idx + 1).padStart(2, '0')}</text>
      <text x="${x + cw - 16}" y="${y + 33}" text-anchor="end" class="mono" font-size="11" fill="#5C5470">&lt;/&gt;</text>
      <text x="${x + 16}" y="${y + 62}" class="sans" font-size="15" font-weight="600" fill="${C.text}">${esc(t1)}</text>
      <text x="${x + 16}" y="${y + 82}" class="sans" font-size="15" font-weight="600" fill="${C.highlight}">${esc(t2)}</text>
      ${dl.map((l, j) => `<text x="${x + 16}" y="${y + 108 + j * 17}" class="sans" font-size="12" fill="${C.muted}">${esc(l)}</text>`).join('')}
    </g>`;
  }).join('');
  const body = windowFrame({ id: 'c', w: W, h: H, title: '~/capabilities — what I do' }) + tiles;
  const label = 'What I do: ' + capabilities.map(([a, b]) => `${a} ${b}`).join(', ') + '.';
  save('capabilities.svg', svg({ w: W, h: H, id: 'c', label, body }));
}

// ─── PROJECTS ────────────────────────────────────────────────────────────────
function mock(kind, x, y, w, h) {
  const cx = x + w / 2, cy = y + h / 2;
  if (kind === 'orbit') {
    return `
      <circle cx="${cx}" cy="${cy}" r="34" fill="url(#p-orb)"/>
      <ellipse cx="${cx}" cy="${cy}" rx="78" ry="22" fill="none" stroke="${C.accent}" stroke-opacity="0.55" transform="rotate(-14 ${cx} ${cy})"/>
      <ellipse cx="${cx}" cy="${cy}" rx="60" ry="46" fill="none" stroke="${C.muted}" stroke-opacity="0.25" stroke-dasharray="2 5"/>
      <g class="orbit" style="transform-origin:${cx}px ${cy}px"><circle cx="${cx + 52}" cy="${cy - 10}" r="4.5" fill="${C.highlight}"/></g>
      <circle cx="${cx - 72}" cy="${cy + 20}" r="3" fill="${C.accent}" opacity="0.8"/>`;
  }
  if (kind === 'photo') {
    // Stacked photo prints + a lens / aperture ring
    const print = (px, py, rot, warm) => `
      <g transform="rotate(${rot} ${px + 40} ${py + 48})">
        <rect x="${px}" y="${py}" width="80" height="96" rx="4" fill="${C.text}" opacity="0.92"/>
        <rect x="${px + 6}" y="${py + 6}" width="68" height="66" rx="2" fill="${warm ? 'url(#p-photo)' : C.surface}"/>
        <circle cx="${px + 52}" cy="${py + 24}" r="6" fill="${C.highlight}" opacity="${warm ? 0.9 : 0.3}"/>
        <path d="M${px + 6} ${py + 72} L${px + 28} ${py + 44} L${px + 44} ${py + 60} L${px + 56} ${py + 50} L${px + 74} ${py + 72} Z" fill="#0D1218" opacity="0.75"/>
      </g>`;
    const lx = cx + 64, ly = cy;
    return `
      ${print(cx - 112, y + 22, -8, false)}
      ${print(cx - 66, y + 16, 4, true)}
      <circle cx="${lx}" cy="${ly}" r="34" fill="none" stroke="${C.accent}" stroke-opacity="0.6" stroke-width="1.5"/>
      <circle cx="${lx}" cy="${ly}" r="24" fill="${C.surface}" stroke="${C.line}"/>
      <g class="orbit" style="transform-origin:${lx}px ${ly}px" fill="none" stroke="${C.highlight}" stroke-opacity="0.7" stroke-width="1.3">
        ${[0, 60, 120, 180, 240, 300].map((a) => `<path d="M${lx} ${ly - 20} L${lx + 9} ${ly - 4}" transform="rotate(${a} ${lx} ${ly})"/>`).join('')}
      </g>
      <circle cx="${lx}" cy="${ly}" r="7" fill="${C.accent}" opacity="0.85"/>`;
  }
  // site — restaurant landing page wireframe with CTA
  const sx = cx - 96, sy = y + 14, sw = 192, sh = h - 28;
  const flame = `M0 -16 C6 -8 10 -4 10 3 C10 10 5 14 0 14 C-5 14 -10 10 -10 3 C-10 -2 -6 -5 -4 -10 C-2 -5 0 -4 2 -3 C3 -8 1 -12 0 -16 Z`;
  return `
    <rect x="${sx}" y="${sy}" width="${sw}" height="${sh}" rx="8" fill="${C.surface}" stroke="${C.line}"/>
    <circle cx="${sx + 12}" cy="${sy + 11}" r="2.5" fill="${C.purple}"/><circle cx="${sx + 20}" cy="${sy + 11}" r="2.5" fill="${C.line}"/>
    ${[0, 1, 2].map((i) => `<rect x="${sx + sw - 74 + i * 22}" y="${sy + 9}" width="16" height="4" rx="2" fill="${C.muted}" opacity="0.3"/>`).join('')}
    <line x1="${sx}" y1="${sy + 22}" x2="${sx + sw}" y2="${sy + 22}" stroke="${C.line}"/>
    <rect x="${sx + 14}" y="${sy + 36}" width="92" height="9" rx="4.5" fill="${C.text}" opacity="0.85"/>
    <rect x="${sx + 14}" y="${sy + 51}" width="70" height="5" rx="2.5" fill="${C.muted}" opacity="0.35"/>
    <rect x="${sx + 14}" y="${sy + 61}" width="80" height="5" rx="2.5" fill="${C.muted}" opacity="0.35"/>
    <rect x="${sx + 14}" y="${sy + 76}" width="54" height="16" rx="8" fill="${C.accent}" class="pulse"/>
    <g transform="translate(${sx + 148} ${sy + 58})">
      <circle r="26" fill="url(#p-orb)" opacity="0.18"/>
      <path d="${flame}" fill="url(#p-orb)" transform="scale(1.5)"/>
    </g>`;
}

function buildProjects() {
  const W = 1000, cols = 3, gap = 16, pad = 20;
  const cw = (W - pad * 2 - gap * (cols - 1)) / cols;
  // Lay tags out first so every card can share the tallest card's height.
  const tagLayout = projects.map((p) => {
    let tx = 0, row = 0;
    const out = p.tags.map((t) => {
      const w = monoW(t, 11) + 20;
      if (tx && tx + w > cw - 36) { tx = 0; row++; }
      const r = { t, x: tx, row, w };
      tx += w + 6;
      return r;
    });
    return { out, rows: row + 1 };
  });
  const tagRows = Math.max(...tagLayout.map((l) => l.rows));
  const ch = 312 + tagRows * 30;
  const H = 60 + ch + 20;
  const cards = projects.map((p, idx) => {
    const x = pad + idx * (cw + gap), y = 60;
    const vis = { x: x + 12, y: y + 12, w: cw - 24, h: 130 };
    const dl = wrap(p.desc, 38);
    const tagTop = y + ch - 16 - tagRows * 30;
    const tags = tagLayout[idx].out.map((r) => `
        <rect x="${x + 18 + r.x}" y="${tagTop + r.row * 30}" width="${r.w}" height="24" rx="12" fill="none" stroke="${C.line}"/>
        <text x="${x + 28 + r.x}" y="${tagTop + r.row * 30 + 16}" class="mono" font-size="11" fill="${C.muted}">${esc(r.t)}</text>`).join('');
    const titleSize = p.name.length > 20 ? 17 : 19;
    return `<g class="fade" style="animation-delay:${(0.1 + idx * 0.12).toFixed(2)}s">
      <rect x="${x}" y="${y}" width="${cw}" height="${ch}" rx="14" fill="${C.bg2}" fill-opacity="0.75" stroke="${C.surface}"/>
      <rect x="${vis.x}" y="${vis.y}" width="${vis.w}" height="${vis.h}" rx="9" fill="#0D1218" stroke="${C.surface}"/>
      <rect x="${vis.x}" y="${vis.y}" width="${vis.w}" height="${vis.h}" rx="9" fill="url(#p-dots)"/>
      <rect x="${vis.x}" y="${vis.y}" width="${vis.w}" height="${vis.h}" rx="9" fill="url(#p-glow)"/>
      <clipPath id="p-clip${idx}"><rect x="${vis.x}" y="${vis.y}" width="${vis.w}" height="${vis.h}" rx="9"/></clipPath>
      <g clip-path="url(#p-clip${idx})">${mock(p.kind, vis.x, vis.y, vis.w, vis.h)}</g>
      <text x="${x + 18}" y="${y + 172}" class="mono" font-size="11" letter-spacing="1.5" fill="${C.accent}">PROJECT ${String(idx + 1).padStart(2, '0')}</text>
      <text x="${x + cw - 18}" y="${y + 172}" text-anchor="end" class="mono" font-size="11" fill="${p.domain ? C.highlight : C.muted}" opacity="${p.domain ? 0.85 : 0.6}">${p.domain ? esc(p.domain) + ' ' : ''}↗</text>
      <text x="${x + 18}" y="${y + 198}" class="sans" font-size="${titleSize}" font-weight="650" fill="${C.text}">${esc(p.name)}</text>
      ${dl.map((l, j) => `<text x="${x + 18}" y="${y + 224 + j * 18}" class="sans" font-size="12.5" fill="${C.muted}">${esc(l)}</text>`).join('')}
      ${tags}
    </g>`;
  }).join('');
  const extraDefs = `
    <radialGradient id="p-orb" cx="0.35" cy="0.3" r="0.8">
      <stop offset="0" stop-color="${C.highlight}"/><stop offset="0.6" stop-color="${C.accent}"/><stop offset="1" stop-color="${C.purple}"/>
    </radialGradient>
    <linearGradient id="p-photo" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="${C.accent}"/><stop offset="1" stop-color="${C.purple}"/>
    </linearGradient>
    <radialGradient id="p-glow" cx="0.5" cy="0.6" r="0.6">
      <stop offset="0" stop-color="${C.accent}" stop-opacity="0.16"/><stop offset="1" stop-color="${C.accent}" stop-opacity="0"/>
    </radialGradient>`;
  const extraStyle = `.orbit{animation:orbit 9s linear infinite}@keyframes orbit{to{transform:rotate(360deg)}}`;
  const body = windowFrame({ id: 'p', w: W, h: H, title: '~/projects — featured' }) + cards;
  const label = 'Featured projects. ' + projects.map((p) => `${p.name}: ${p.desc}`).join(' ');
  save('projects.svg', svg({ w: W, h: H, id: 'p', label, body, extraDefs, extraStyle }));
}

// ─── CONTACT BUTTONS ─────────────────────────────────────────────────────────
const icons = {
  globe: `<circle cx="0" cy="0" r="8" fill="none" stroke="${C.accent}" stroke-width="1.6"/><ellipse cx="0" cy="0" rx="3.6" ry="8" fill="none" stroke="${C.accent}" stroke-width="1.4"/><path d="M-8 0 H8" stroke="${C.accent}" stroke-width="1.4"/>`,
  github: `<path transform="translate(-8 -8)" fill="${C.accent}" d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z"/>`,
  linkedin: `<rect x="-8" y="-8" width="16" height="16" rx="3" fill="none" stroke="${C.accent}" stroke-width="1.6"/><text x="0" y="4.2" text-anchor="middle" font-family="${SANS}" font-size="10" font-weight="700" fill="${C.accent}">in</text>`,
  mail: `<rect x="-8.5" y="-6" width="17" height="12" rx="2" fill="none" stroke="${C.accent}" stroke-width="1.6"/><path d="M-8 -5 L0 1 L8 -5" fill="none" stroke="${C.accent}" stroke-width="1.6"/>`,
};

function buildButtons() {
  for (const b of buttons) {
    const W = 168, H = 44;
    const body = `
  <rect x="0.5" y="0.5" width="${W - 1}" height="${H - 1}" rx="10" fill="${C.bg2}" stroke="${C.surface}"/>
  <rect x="0.5" y="0.5" width="${W - 1}" height="${H - 1}" rx="10" fill="url(#b-amber)"/>
  <g transform="translate(26 22)">${icons[b.icon]}</g>
  <text x="46" y="27" class="sans" font-size="14" font-weight="600" fill="${C.text}">${esc(b.label)}</text>
  <text x="${W - 18}" y="27" text-anchor="end" class="mono" font-size="13" fill="${C.accent}">↗</text>`;
    save(b.file, svg({ w: W, h: H, id: 'b', label: b.label, body }));
  }
}

// ─── Run ─────────────────────────────────────────────────────────────────────
mkdirSync(ASSETS, { recursive: true });
console.log('Building README assets…');
buildHero();
buildStack();
buildCapabilities();
buildProjects();
buildButtons();
console.log('Done.');
