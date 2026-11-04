/**
 * FreeRTOS intro — every scene (STORYBOARD.md):
 *   Want   two LEDs + a button; one loop makes them wait for each other
 *   What   FreeRTOS · tasks · the scheduler shares the CPU · app_main is a task · two cores
 *   Map    14 videos in three rows
 *   Needs  a second LED on GPIO 19 · the Basic GPIO calls
 *   Go     "First up: tasks"
 */
import React from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from 'remotion';
import { Led } from '../../components/Gadgets';
import { C, FONT, GRAD_TEXT, hexA } from '../../theme/palette';
import { TactSwitch } from '../gpio-input/parts';
import { after, Bench, Chip, clamp01, fadeUp, GoCard, GREEN, IntroFrame, MapCards, mono, viewWeight } from '../intro/kit';
import { TwoRates, TwoRatesSmall } from '../intro/vignettes';
import { FAST_MS, FPS, GO, laneLevel, LOOP_MS, LOOP_READS, MAP, NEEDS, PRESSES, sceneDur, type SceneId, SLOW_MS, WANT, WHAT } from './timeline';

const useT = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  return frame / fps;
};
const frames = (id: SceneId) => Math.round(sceneDur(id) * FPS);
const RED = '#ff5470';
const TASK_COLOR = { fast: C.pink, slow: C.amber, button: C.cyan } as const;

// ── a lane: a level over a 4 s window, drawn up to `upTo` seconds ─────────

const WINDOW = 4;
const Lane: React.FC<{
  x: number;
  y: number;
  w: number;
  h?: number;
  label: string;
  color: string;
  level: (s: number) => number;
  upTo: number;
  ghost?: (s: number) => number;
}> = ({ x, y, w, h = 70, label, color, level, upTo, ghost }) => {
  const path = (f: (s: number) => number, until: number) => {
    const pts: string[] = [];
    const n = Math.floor(clamp01(until / WINDOW) * 400);
    for (let i = 0; i <= n; i++) {
      const s = (i / 400) * WINDOW;
      pts.push(`${i === 0 ? 'M' : 'L'} ${x + (s / WINDOW) * w} ${y + (f(s) ? 0 : h)}`);
    }
    return pts.join(' ');
  };
  return (
    <g>
      <text x={x - 18} y={y + h / 2 + 7} textAnchor="end" style={mono(20, color, { fontWeight: 700 })}>
        {label}
      </text>
      <line x1={x} y1={y + h} x2={x + w} y2={y + h} stroke={hexA(C.muted, 0.25)} />
      {ghost && <path d={path(ghost, WINDOW)} fill="none" stroke={hexA(color, 0.28)} strokeWidth={3} strokeDasharray="6 6" />}
      <path d={path(level, upTo)} fill="none" stroke={color} strokeWidth={4} style={{ filter: `drop-shadow(0 0 6px ${color})` }} />
    </g>
  );
};

// ── 1. want ────────────────────────────────────────────────────────────────

const LOOP_CODE = [
  'while (1) {',
  '    gpio_set_level(LED_FAST, 1);',
  '    vTaskDelay(pdMS_TO_TICKS(200));',
  '    gpio_set_level(LED_FAST, 0);',
  '    vTaskDelay(pdMS_TO_TICKS(200));',
  '    gpio_set_level(LED_SLOW, 1);',
  '    vTaskDelay(pdMS_TO_TICKS(500));',
  '    gpio_set_level(LED_SLOW, 0);',
  '    vTaskDelay(pdMS_TO_TICKS(500));',
  '    bool pressed = (gpio_get_level(BUTTON) == 0);',
  '}',
];
/** which line runs `ms` into the loop */
function loopLine(ms: number): number {
  const u = ms % LOOP_MS;
  if (u < FAST_MS) return 2;
  if (u < 2 * FAST_MS) return 4;
  if (u < 2 * FAST_MS + SLOW_MS) return 6;
  if (u < LOOP_MS - 10) return 8;
  return 9;
}

export const Want: React.FC = () => {
  const t = useT();
  const W = WANT;
  const one = t >= W.loop;
  const s0 = one ? W.loop : W.fast;
  const s = Math.max(0, t - s0);
  const sw = s % WINDOW;
  const benchOp = 1 - after(t, W.loop, 0.5);
  const codeOp = after(t, W.loop, 0.5);
  const dim = after(t, W.dim, 0.6);
  const lanesIn = after(t, W.fast - 0.2, 0.5);
  const ms = s * 1000;
  const live = one ? loopLine(ms) : -1;
  const LX = 1060;
  const LW = 720;
  return (
    <IntroFrame frames={frames('want')} t={t} kicker="FreeRTOS" captions={W.captions}>
      <AbsoluteFill style={{ opacity: benchOp }}>
        <Bench
          x={150}
          y={190}
          scale={0.95}
          t={t}
          moduleIn={after(t, W.board, 0.6)}
          items={[
            { kind: 'led', pin: 24, gpio: 2, gx: 470, gy: 560, show: after(t, W.fast, 0.5), state: laneLevel('fast', sw, false), label: 'fast', resistor: true },
            { kind: 'led', pin: 31, gpio: 19, gx: 560, gy: 110, show: after(t, W.slow, 0.5), state: laneLevel('slow', sw, false), label: 'slow', resistor: true },
            { kind: 'button', pin: 30, gpio: 18, gx: 560, gy: 400, show: after(t, W.button, 0.5), state: laneLevel('button', sw, false) ? 0 : 1, label: 'button' },
          ]}
        />
      </AbsoluteFill>
      {/* the one loop */}
      <div style={{ position: 'absolute', left: 110, top: 230, width: 720, opacity: codeOp * (1 - 0.6 * dim), ...fadeUp(codeOp) }}>
        <div style={mono(17, C.cyan, { letterSpacing: '.2em', marginBottom: 12 })}>ONE LOOP · APP_MAIN</div>
        <div style={{ borderRadius: 16, padding: '18px 22px', background: hexA('#0a0420', 0.85), border: '1px solid rgba(255,255,255,.1)' }}>
          {LOOP_CODE.map((l, i) => (
            <div
              key={i}
              style={mono(21, i === live ? C.ink : hexA('#cfd6ff', 0.6), {
                whiteSpace: 'pre',
                lineHeight: 1.75,
                background: i === live ? hexA(C.amber, 0.16) : 'transparent',
                borderLeft: `3px solid ${i === live ? C.amber : 'transparent'}`,
                paddingLeft: 8,
              })}
            >
              {l}
            </div>
          ))}
        </div>
      </div>
      {/* lanes */}
      <div style={{ position: 'absolute', left: LX - 220, top: 230, ...mono(17, one ? RED : GREEN, { letterSpacing: '.2em' }), opacity: lanesIn * (1 - 0.6 * dim) }}>
        {one ? 'ONE LOOP · WHAT YOU GET' : 'WANTED'}
      </div>
      <svg width={1920} height={1080} style={{ position: 'absolute', left: 0, top: 0, opacity: lanesIn * (1 - 0.6 * dim) }}>
        <Lane x={LX} y={300} w={LW} label="GPIO 2" color={TASK_COLOR.fast} level={(x) => laneLevel('fast', x, one)} upTo={sw} ghost={one ? (x) => laneLevel('fast', x, false) : undefined} />
        <Lane x={LX} y={430} w={LW} label="GPIO 19" color={TASK_COLOR.slow} level={(x) => laneLevel('slow', x, one)} upTo={sw} ghost={one ? (x) => laneLevel('slow', x, false) : undefined} />
        <Lane x={LX} y={560} w={LW} label="GPIO 18" color={TASK_COLOR.button} level={(x) => laneLevel('button', x, false)} upTo={sw} />
        {one &&
          LOOP_READS.map((r) => (
            <g key={r} opacity={sw >= r ? 1 : 0}>
              <line x1={LX + (r / WINDOW) * LW} y1={545} x2={LX + (r / WINDOW) * LW} y2={645} stroke={C.ink} strokeDasharray="4 4" />
              <text x={LX + (r / WINDOW) * LW} y={672} textAnchor="middle" style={mono(16, C.muted)}>
                read
              </text>
            </g>
          ))}
        {one &&
          PRESSES.map(([a, b], i) => {
            const caught = LOOP_READS.some((r) => r >= a && r < b);
            const mx = LX + (((a + b) / 2) / WINDOW) * LW;
            return (
              <text key={i} x={mx} y={535} textAnchor="middle" opacity={sw >= b ? 1 : 0} style={mono(22, caught ? GREEN : RED, { fontWeight: 800 })}>
                {caught ? '✓ seen' : '✗ missed'}
              </text>
            );
          })}
        <text x={LX} y={720} style={mono(16, C.muted)}>
          0 s
        </text>
        <text x={LX + LW} y={720} textAnchor="end" style={mono(16, C.muted)}>
          4 s · real time
        </text>
      </svg>
      {one && (
        <div style={{ position: 'absolute', left: LX, top: 760, ...fadeUp(after(t, W.holds, 0.4)), opacity: after(t, W.holds, 0.4) * (1 - 0.6 * dim) }}>
          <Chip color={RED} size={24}>
            one round: 200 + 200 + 500 + 500 = 1400 ms
          </Chip>
        </div>
      )}
    </IntroFrame>
  );
};

// ── 2. what it is ──────────────────────────────────────────────────────────

const Hero: React.FC<{ t: number }> = ({ t }) => {
  const h = after(t, WHAT.hero, 0.6);
  const b = after(t, WHAT.badge, 0.4);
  return (
    <AbsoluteFill style={{ display: 'grid', placeItems: 'center', alignContent: 'center', gap: 34 }}>
      <div style={{ ...GRAD_TEXT, fontSize: 200, fontWeight: 800, letterSpacing: '.04em', lineHeight: 1, ...fadeUp(h, 24) }}>FreeRTOS</div>
      <div style={{ fontSize: 40, color: C.ink, ...fadeUp(h) }}>a small operating system</div>
      <div style={fadeUp(b)}>
        <Chip color={C.cyan} size={30}>
          built into ESP-IDF
        </Chip>
      </div>
    </AbsoluteFill>
  );
};

type Slice = { a: number; b: number; task: keyof typeof TASK_COLOR };
/** a simplified CPU timeline: each task runs briefly, then waits; idle in between */
function cpuSlices(offset = 0): Slice[] {
  const seq: (keyof typeof TASK_COLOR)[] = ['fast', 'button', 'slow', 'button', 'fast', 'button', 'fast', 'slow', 'button', 'fast'];
  return seq.map((task, i) => ({ a: offset + i * 0.1 + 0.02, b: offset + i * 0.1 + 0.06, task }));
}

const CpuLane: React.FC<{ x: number; y: number; w: number; slices: Slice[]; draw: number; label: string; h?: number }> = ({ x, y, w, slices, draw, label, h = 64 }) => (
  <g>
    <text x={x - 18} y={y + h / 2 + 8} textAnchor="end" style={mono(22, C.ink, { fontWeight: 700 })}>
      {label}
    </text>
    <rect x={x} y={y} width={w} height={h} rx={8} fill={hexA(C.muted, 0.08)} stroke={hexA(C.muted, 0.3)} />
    {slices.map((sl, i) => {
      const p = clamp01((draw - sl.a) / (sl.b - sl.a));
      if (p <= 0) return null;
      return <rect key={i} x={x + sl.a * w} y={y + 6} width={(sl.b - sl.a) * w * p} height={h - 12} rx={5} fill={TASK_COLOR[sl.task]} opacity={0.9} />;
    })}
  </g>
);

const Tasks: React.FC<{ t: number }> = ({ t }) => {
  const W = WHAT;
  const running = t >= W.fast;
  const u = Math.max(0, t - W.fast);
  const boxes: { key: keyof typeof TASK_COLOR; title: string; loop: string[]; ind: React.ReactNode }[] = [
    { key: 'fast', title: 'fast LED task', loop: ['on · wait 200', 'off · wait 200'], ind: <Led brightness={running ? laneLevel('fast', u, false) : 0} size={110} /> },
    { key: 'slow', title: 'slow LED task', loop: ['on · wait 500', 'off · wait 500'], ind: <Led brightness={running ? laneLevel('slow', u, false) : 0} size={110} /> },
    {
      key: 'button',
      title: 'button task',
      loop: ['read the button', 'wait 10'],
      ind: (
        <svg width={90} height={90} viewBox="-45 -45 90 90">
          <TactSwitch x={0} y={0} press={running && Math.floor(u / 1.3) % 2 === 1 ? 1 : 0} size={64} />
        </svg>
      ),
    },
  ];
  const draw = clamp01((t - W.cpu) / 3);
  return (
    <AbsoluteFill>
      <div style={{ position: 'absolute', top: 150, width: '100%', display: 'flex', justifyContent: 'center', gap: 40 }}>
        {boxes.map((b, i) => {
          const p = after(t, W.tasks + 0.15 * i, 0.4);
          const lp = after(t, W.ownLoop, 0.4);
          return (
            <div
              key={b.key}
              style={{
                ...fadeUp(p, 20),
                width: 460,
                height: 250,
                boxSizing: 'border-box',
                borderRadius: 18,
                padding: '20px 24px',
                background: `linear-gradient(165deg, ${hexA(TASK_COLOR[b.key], 0.12)}, ${hexA('#0a0420', 0.85)})`,
                border: `2px solid ${hexA(TASK_COLOR[b.key], 0.6)}`,
                display: 'grid',
                gridTemplateColumns: '1fr 120px',
                alignItems: 'center',
              }}
            >
              <div style={{ display: 'grid', gap: 14 }}>
                <div style={{ fontSize: 32, fontWeight: 700, color: TASK_COLOR[b.key] }}>{b.title}</div>
                <div style={{ ...mono(19, C.ink), opacity: lp, lineHeight: 1.5 }}>
                  while (1) {'{'}
                  {b.loop.map((l) => (
                    <div key={l} style={{ paddingLeft: 26, whiteSpace: 'nowrap' }}>
                      {l}
                    </div>
                  ))}
                  {'}'}
                </div>
              </div>
              <div style={{ display: 'grid', placeItems: 'center' }}>{b.ind}</div>
            </div>
          );
        })}
      </div>
      <svg width={1920} height={1080} style={{ position: 'absolute', left: 0, top: 0, opacity: after(t, W.cpu - 0.3, 0.4) }}>
        <text x={260} y={520} style={mono(17, C.cyan, { letterSpacing: '.2em' })}>
          THE SCHEDULER SHARES ONE CPU · SIMPLIFIED
        </text>
        <CpuLane x={260} y={550} w={1400} slices={cpuSlices()} draw={draw} label="CPU" />
        <g opacity={after(t, W.waits, 0.4)}>
          <text x={260 + 0.06 * 1400 + 8} y={660} style={mono(18, C.muted)}>
            ↑ a task waits → another runs · gaps = nothing to do (idle)
          </text>
        </g>
      </svg>
      <div style={{ position: 'absolute', top: 720, width: '100%', display: 'flex', justifyContent: 'center', gap: 30, opacity: after(t, W.cpu, 0.4) }}>
        {(Object.keys(TASK_COLOR) as (keyof typeof TASK_COLOR)[]).map((k) => (
          <span key={k} style={{ display: 'flex', alignItems: 'center', gap: 10, ...mono(20, C.ink) }}>
            <span style={{ width: 22, height: 22, borderRadius: 5, background: TASK_COLOR[k] }} />
            {k === 'fast' ? 'fast LED' : k === 'slow' ? 'slow LED' : 'button'}
          </span>
        ))}
      </div>
      <div style={{ position: 'absolute', top: 800, width: '100%', display: 'grid', placeItems: 'center', ...fadeUp(after(t, W.fast, 0.4)) }}>
        <Chip color={GREEN} size={26}>
          each LED at its own rate · the button never missed
        </Chip>
      </div>
    </AbsoluteFill>
  );
};

const Chain: React.FC<{ t: number }> = ({ t }) => {
  const steps = ['ESP-IDF startup', 'FreeRTOS scheduler', 'task "main"', 'app_main()'];
  return (
    <AbsoluteFill style={{ display: 'grid', placeItems: 'center', alignContent: 'center', gap: 60 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 22 }}>
        {steps.map((s, i) => {
          const p = after(t, WHAT.chain[i], 0.4);
          const last = i === steps.length - 1;
          return (
            <React.Fragment key={s}>
              {i > 0 && <span style={{ ...mono(40, C.muted), opacity: p }}>→</span>}
              <span
                style={{
                  ...mono(34, last ? C.amber : i === 2 ? C.cyan : C.ink, { fontWeight: 700 }),
                  padding: '18px 28px',
                  borderRadius: 14,
                  border: `2px solid ${hexA(last ? C.amber : i === 2 ? C.cyan : C.muted, 0.7)}`,
                  background: hexA(last ? C.amber : C.purple, 0.12),
                  ...fadeUp(p, 14),
                }}
              >
                {s}
              </span>
            </React.Fragment>
          );
        })}
      </div>
      <div style={{ fontSize: 44, fontWeight: 600, color: C.ink, ...fadeUp(after(t, WHAT.chain[3] + 0.3, 0.5)) }}>
        your <span style={{ fontFamily: FONT.mono, color: C.amber }}>app_main</span> is already a task
      </div>
    </AbsoluteFill>
  );
};

const Cores: React.FC<{ t: number }> = ({ t }) => {
  const draw = clamp01((t - WHAT.views[3]) / 3);
  const c0 = cpuSlices();
  const c1: Slice[] = [0.04, 0.24, 0.4, 0.63, 0.81].map((a, i) => ({ a, b: a + 0.07, task: (['slow', 'button', 'slow', 'fast', 'button'] as const)[i] }));
  const band = after(t, WHAT.same, 0.4);
  const X = 260;
  const Wd = 1400;
  // CPU 0 runs 0.42–0.46 (fast), CPU 1 runs 0.40–0.47 (slow): both at once
  const both = 0.42;
  return (
    <AbsoluteFill>
      <svg width={1920} height={1080} style={{ position: 'absolute' }}>
        <text x={X} y={300} style={mono(17, C.cyan, { letterSpacing: '.2em' })}>
          TWO CORES · SIMPLIFIED
        </text>
        <CpuLane x={X} y={340} w={Wd} slices={c0} draw={draw} label="CPU 0" />
        <CpuLane x={X} y={460} w={Wd} slices={c1} draw={after(t, WHAT.cores, 0.2) * draw} label="CPU 1" />
        <g opacity={band}>
          <rect x={X + both * Wd - 10} y={320} width={0.04 * Wd + 20} height={224} rx={10} fill="none" stroke={GREEN} strokeWidth={3} strokeDasharray="8 6" />
          <text x={X + (both + 0.02) * Wd} y={590} textAnchor="middle" style={mono(24, GREEN, { fontWeight: 700 })}>
            same moment
          </text>
        </g>
      </svg>
      <div style={{ position: 'absolute', top: 680, width: '100%', textAlign: 'center', ...GRAD_TEXT, fontSize: 90, fontWeight: 800, ...fadeUp(after(t, WHAT.cores, 0.5)) }}>
        two cores
      </div>
    </AbsoluteFill>
  );
};

export const What: React.FC = () => {
  const t = useT();
  const views = [Hero, Tasks, Chain, Cores];
  return (
    <IntroFrame frames={frames('what')} t={t} kicker="What FreeRTOS is" captions={WHAT.captions}>
      {views.map((V, i) => {
        const op = viewWeight(t, WHAT.views, i);
        if (op <= 0.001) return null;
        return (
          <AbsoluteFill key={i} style={{ opacity: op }}>
            <V t={t} />
          </AbsoluteFill>
        );
      })}
    </IntroFrame>
  );
};

// ── 3. map ─────────────────────────────────────────────────────────────────

export const Map: React.FC = () => {
  const t = useT();
  return (
    <IntroFrame frames={frames('map')} t={t} kicker="FreeRTOS · fourteen videos" captions={MAP.captions}>
      <MapCards t={t} cards={MAP.cards} inAt={MAP.in} cols={6} rowSizes={MAP.rowSizes} w={272} h={212} gap={20} top={150} compact arrows={false} demos={[TwoRatesSmall]} />
    </IntroFrame>
  );
};

// ── 4. needs ───────────────────────────────────────────────────────────────

export const Needs: React.FC = () => {
  const t = useT();
  const N = NEEDS;
  const u = Math.max(0, t - N.led2) % WINDOW;
  const calls = ['gpio_set_direction', 'gpio_set_level', 'gpio_get_level'];
  const what = ['set a pin’s direction', 'write a level', 'read one'];
  return (
    <IntroFrame frames={frames('needs')} t={t} kicker="What you need" captions={N.captions}>
      <Bench
        x={180}
        y={190}
        scale={0.95}
        t={t}
        moduleIn={after(t, N.board, 0.5)}
        items={[
          { kind: 'led', pin: 24, gpio: 2, gx: 470, gy: 560, show: 1, state: laneLevel('fast', u, false), label: 'LED 1', resistor: true },
          { kind: 'led', pin: 31, gpio: 19, gx: 560, gy: 110, show: after(t, N.led2, 0.6), state: t > N.led2 ? laneLevel('slow', u, false) : 0, label: 'LED 2 · new', resistor: true },
          { kind: 'button', pin: 30, gpio: 18, gx: 560, gy: 400, show: 1, state: 0, label: 'button' },
        ]}
      />
      <div style={{ position: 'absolute', left: 1060, top: 330, display: 'grid', gap: 22 }}>
        <div style={{ ...mono(18, C.cyan, { letterSpacing: '.2em' }), opacity: after(t, N.heading, 0.4) }}>FROM BASIC GPIO</div>
        {calls.map((c, i) => {
          const p = after(t, N.calls[i], 0.4);
          return (
            <div key={c} style={{ display: 'flex', alignItems: 'center', gap: 18, ...fadeUp(p, 12) }}>
              <span style={{ width: 34, height: 34, borderRadius: 8, border: `2px solid ${GREEN}`, display: 'grid', placeItems: 'center', color: GREEN, fontSize: 24, fontWeight: 800 }}>✓</span>
              <span style={mono(28, C.cyan, { fontWeight: 700 })}>{c}</span>
              <span style={{ fontSize: 24, color: C.muted }}>{what[i]}</span>
            </div>
          );
        })}
      </div>
    </IntroFrame>
  );
};

// ── 5. go ──────────────────────────────────────────────────────────────────

export const Go: React.FC = () => {
  const t = useT();
  return (
    <IntroFrame frames={frames('go')} t={t}>
      <GoCard t={t} at={GO.line} n={1} card={MAP.cards[GO.card]} demo={TwoRates} nextLabel={GO.nextLabel} />
    </IntroFrame>
  );
};

export const SCENE_COMPONENTS: Record<SceneId, React.FC> = { want: Want, what: What, map: Map, needs: Needs, go: Go };
