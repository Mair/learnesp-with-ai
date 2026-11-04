/**
 * Basic GPIO intro — every scene (STORYBOARD.md):
 *   Want   the board, an LED, a button: by the end you switch one and read the other
 *   What   GPIO = general-purpose input/output · output sets 3.3 V / 0 V · input reads · two levels
 *   Map    gpio → gpio-input
 *   Needs  the parts, ESP-IDF v6, a checklist
 *   Go     "First up: GPIO output"
 */
import React from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from 'remotion';
import { Led } from '../../components/Gadgets';
import { C, GRAD_TEXT, hexA } from '../../theme/palette';
import { TactSwitch } from '../gpio-input/parts';
import { after, Bench, Checklist, Chip, clamp01, fadeUp, GoCard, GREEN, IntroFrame, MapCards, mono, PartsList, Terminal, viewWeight } from '../intro/kit';
import { BlinkLed, ButtonLed } from '../intro/vignettes';
import { FPS, GO, MAP, NEEDS, sceneDur, type SceneId, WANT, WHAT } from './timeline';

const useT = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  return frame / fps;
};
const frames = (id: SceneId) => Math.round(sceneDur(id) * FPS);
const DEMOS = [BlinkLed, ButtonLed];

// ── 1. want ────────────────────────────────────────────────────────────────

export const Want: React.FC = () => {
  const t = useT();
  const W = WANT;
  const blinkOn = (t >= W.blink && t < W.blink + 0.5) || (t >= W.blink + 1 && t < W.blink + 1.5);
  const pressed = t >= W.press + 0.2 && t < W.press + 1.4;
  const read = after(t, W.press + 0.2, 0.3);
  const dim = after(t, W.dim, 0.6);
  const BX = 660;
  const BY = 150;
  const S = 1.05;
  return (
    <IntroFrame frames={frames('want')} t={t} kicker="Basic GPIO" captions={W.captions}>
      <Bench
        x={BX}
        y={BY}
        scale={S}
        t={t}
        moduleIn={after(t, W.board, 0.6)}
        dim={dim}
        sweep={clamp01((t - W.pins) / 1.4)}
        items={[
          { kind: 'led', pin: 24, gpio: 2, gx: 470, gy: 560, show: after(t, W.led, 0.6), state: blinkOn ? 1 : 0, label: 'LED', resistor: true },
          { kind: 'button', pin: 30, gpio: 18, gx: 530, gy: 330, show: after(t, W.button, 0.6), state: pressed ? 1 : 0, label: 'button' },
        ]}
      />
      {/* the read: 1 → 0 */}
      <div style={{ position: 'absolute', left: BX + 600 * S, top: BY + 310 * S, ...fadeUp(read * (1 - dim)) }}>
        <Chip color={GREEN} size={26}>
          reads {pressed ? '0 · pressed' : '1'}
        </Chip>
      </div>
    </IntroFrame>
  );
};

// ── 2. what it is ──────────────────────────────────────────────────────────

/** view A: the pins + GPIO spelled out */
const Spelled: React.FC<{ t: number }> = ({ t }) => {
  const W = WHAT;
  const g = after(t, W.gpio, 0.6);
  const sp = after(t, W.spell, 0.5);
  const words: [string, string][] = [
    ['G', 'eneral-'],
    ['P', 'urpose '],
    ['I', 'nput / '],
    ['O', 'utput'],
  ];
  return (
    <AbsoluteFill>
      <Bench x={250} y={190} scale={1.05} t={t} items={[]} sweep={clamp01((t - W.sweep) / 1.6)} />
      <div style={{ position: 'absolute', left: 900, top: 330, display: 'grid', gap: 26 }}>
        <div style={{ ...GRAD_TEXT, fontSize: 190, fontWeight: 800, letterSpacing: '.06em', lineHeight: 1, ...fadeUp(g, 20) }}>GPIO</div>
        <div style={{ fontSize: 48, fontWeight: 600, color: C.ink, ...fadeUp(sp, 12) }}>
          {words.map(([a, b], i) => {
            const p = after(t, W.spell + 0.18 * i, 0.3);
            return (
              <span key={a} style={{ opacity: 0.25 + 0.75 * p }}>
                <span style={{ color: C.cyan, fontWeight: 800 }}>{a}</span>
                {b}
              </span>
            );
          })}
        </div>
        <div style={{ ...mono(24, C.muted), opacity: after(t, W.spell + 1.2, 0.5) }}>the pins your code controls</div>
      </div>
    </AbsoluteFill>
  );
};

/** view B: one pin, two modes */
const Modes: React.FC<{ t: number }> = ({ t }) => {
  const W = WHAT;
  const outOn = after(t, W.out, 0.4);
  const inOn = after(t, W.in, 0.4);
  const mode = t >= W.in ? 'input' : t >= W.out ? 'output' : null;
  // output: high at "high", low at "low", then a slow 1 s toggle
  let level = 0;
  if (t >= W.high && t < W.low) level = 1;
  else if (t >= W.low + 1) level = Math.floor(t - W.low) % 2 === 1 ? 1 : 0;
  // input: pressed from "reads" for 1.2 s, then every 2 s
  const u = t - W.reads;
  const pressed = u >= 0 && (u < 1.2 || (u % 2 > 0.4 && u % 2 < 1.4));
  const panel = (on: number, active: boolean): React.CSSProperties => ({
    position: 'absolute',
    top: 420,
    width: 700,
    height: 400,
    boxSizing: 'border-box',
    borderRadius: 20,
    padding: '26px 30px',
    background: `linear-gradient(165deg, ${hexA(C.purple, 0.1 + 0.12 * on)}, ${hexA('#0a0420', 0.85)})`,
    border: `${active ? 2 : 1}px solid ${active ? hexA(C.cyan, 0.8) : 'rgba(255,255,255,.1)'}`,
    opacity: 0.35 + 0.65 * on,
  });
  return (
    <AbsoluteFill>
      {/* the pin + its mode switch */}
      <div style={{ position: 'absolute', top: 150, width: '100%', display: 'grid', justifyItems: 'center', gap: 22 }}>
        <div style={{ ...mono(34, C.pink, { fontWeight: 800 }), padding: '14px 34px', borderRadius: 14, border: `2px solid ${C.pink}`, background: hexA(C.pink, 0.12), boxShadow: `0 0 30px ${hexA(C.pink, 0.4)}` }}>
          a GPIO pin
        </div>
        <div style={{ display: 'flex', gap: 0, borderRadius: 12, overflow: 'hidden', border: `1px solid ${hexA(C.cyan, 0.5)}`, opacity: after(t, W.pick, 0.4) }}>
          {(['output', 'input'] as const).map((m) => (
            <span key={m} style={{ ...mono(28, mode === m ? '#0a0420' : C.cyan, { fontWeight: 700 }), padding: '10px 36px', background: mode === m ? C.cyan : 'transparent' }}>
              {m}
            </span>
          ))}
        </div>
      </div>
      {/* output */}
      <div style={{ ...panel(outOn, mode === 'output'), left: 220 }}>
        <div style={mono(18, C.cyan, { letterSpacing: '.2em' })}>OUTPUT · YOUR CODE SETS IT</div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 26, marginTop: 40, whiteSpace: 'nowrap' }}>
          <div style={{ display: 'grid', gap: 12, justifyItems: 'center' }}>
            <span style={mono(22, C.muted)}>your code</span>
            <Chip color={C.amber} size={30}>
              {level ? '1' : '0'}
            </Chip>
          </div>
          <span style={mono(36, C.muted)}>→</span>
          <div style={{ display: 'grid', gap: 12, justifyItems: 'center' }}>
            <span style={mono(22, C.muted)}>the pin</span>
            <span style={mono(40, level ? C.amber : C.muted, { fontWeight: 800 })}>{level ? '3.3 V' : '0 V'}</span>
          </div>
          <span style={mono(36, C.muted)}>→</span>
          <Led brightness={outOn > 0.5 ? level : 0} size={170} />
        </div>
        <div style={{ ...mono(24, C.ink), textAlign: 'center', marginTop: 30, opacity: after(t, W.high, 0.4) }}>
          high = <b style={{ color: C.amber }}>3.3 V</b> · low = <b style={{ color: C.amber }}>0 V</b>
        </div>
      </div>
      {/* input */}
      <div style={{ ...panel(inOn, mode === 'input'), left: 1000 }}>
        <div style={mono(18, C.cyan, { letterSpacing: '.2em' })}>INPUT · YOUR CODE READS IT</div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 26, marginTop: 50, whiteSpace: 'nowrap' }}>
          <svg width={130} height={130} viewBox="-65 -65 130 130">
            <TactSwitch x={0} y={0} press={inOn > 0.5 && pressed ? 1 : 0} size={96} />
          </svg>
          <span style={mono(36, C.muted)}>→</span>
          <div style={{ display: 'grid', gap: 12, justifyItems: 'center' }}>
            <span style={mono(22, C.muted)}>the pin</span>
            <span style={mono(40, C.ink, { fontWeight: 800 })}>{inOn > 0.5 && pressed ? '0 V' : '3.3 V'}</span>
          </div>
          <span style={mono(36, C.muted)}>→</span>
          <div style={{ display: 'grid', gap: 12, justifyItems: 'center' }}>
            <span style={mono(22, C.muted)}>your code</span>
            <Chip color={GREEN} size={30} p={0.4 + 0.6 * after(t, W.reads, 0.3)}>
              {inOn > 0.5 && pressed ? '0' : '1'}
            </Chip>
          </div>
        </div>
        <div style={{ ...mono(24, C.ink), textAlign: 'center', marginTop: 56, opacity: after(t, W.reads, 0.4) }}>
          it reads <b style={{ color: GREEN }}>1</b> or <b style={{ color: GREEN }}>0</b>
        </div>
      </div>
    </AbsoluteFill>
  );
};

/** view C: two levels, nothing in between */
const TwoLevels: React.FC<{ t: number }> = ({ t }) => {
  const W = WHAT;
  const draw = clamp01((t - W.wave) / 1.6);
  const nb = after(t, W.between, 0.4);
  const dg = after(t, W.digital, 0.5);
  const X0 = 360;
  const X1 = 1560;
  const HI = 330;
  const LO = 650;
  const pts: string[] = [];
  const edges = [0, 0.14, 0.3, 0.38, 0.56, 0.7, 0.84, 1];
  let y = HI;
  pts.push(`M ${X0} ${y}`);
  for (let i = 1; i < edges.length; i++) {
    const x = X0 + (X1 - X0) * edges[i];
    pts.push(`H ${x}`);
    if (i < edges.length - 1) {
      y = y === HI ? LO : HI;
      pts.push(`V ${y}`);
    }
  }
  return (
    <AbsoluteFill>
      <svg width={1920} height={1080} style={{ position: 'absolute' }}>
        {[
          [HI, '3.3 V · high · 1'],
          [LO, '0 V · low · 0'],
        ].map(([yy, l]) => (
          <g key={l as string}>
            <line x1={X0 - 20} y1={yy as number} x2={X1 + 20} y2={yy as number} stroke={hexA(C.muted, 0.3)} strokeDasharray="6 8" />
            <text x={X0 - 36} y={(yy as number) + 8} textAnchor="end" style={mono(24, C.ink, { fontWeight: 700 })}>
              {l}
            </text>
          </g>
        ))}
        <path d={pts.join(' ')} fill="none" stroke={C.magenta} strokeWidth={6} pathLength={1} strokeDasharray={`${draw} 1`} style={{ filter: `drop-shadow(0 0 10px ${C.magenta})` }} />
        <g opacity={nb}>
          <rect x={X0} y={HI + 70} width={X1 - X0} height={LO - HI - 140} fill={hexA('#ff5470', 0.08)} stroke={hexA('#ff5470', 0.5)} strokeDasharray="8 8" />
          <rect x={(X0 + X1) / 2 - 210} y={(HI + LO) / 2 - 30} width={420} height={60} rx={12} fill="#1a0b2a" stroke={hexA('#ff5470', 0.6)} />
          <text x={(X0 + X1) / 2} y={(HI + LO) / 2 + 11} textAnchor="middle" style={mono(32, '#ff5470', { fontWeight: 700 })}>
            nothing in between
          </text>
        </g>
      </svg>
      <div style={{ position: 'absolute', top: 760, width: '100%', textAlign: 'center', ...GRAD_TEXT, fontSize: 110, fontWeight: 800, letterSpacing: '.05em', opacity: dg, transform: `scale(${0.94 + 0.06 * dg})` }}>
        digital
      </div>
    </AbsoluteFill>
  );
};

export const What: React.FC = () => {
  const t = useT();
  const views = [Spelled, Modes, TwoLevels];
  return (
    <IntroFrame frames={frames('what')} t={t} kicker="What GPIO is" captions={WHAT.captions}>
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
    <IntroFrame frames={frames('map')} t={t} kicker="Basic GPIO · two videos" captions={MAP.captions}>
      <MapCards t={t} cards={MAP.cards} inAt={MAP.in} cols={2} w={700} h={560} gap={60} top={210} demos={DEMOS} />
    </IntroFrame>
  );
};

// ── 4. needs ───────────────────────────────────────────────────────────────

export const Needs: React.FC = () => {
  const t = useT();
  const N = NEEDS;
  return (
    <IntroFrame frames={frames('needs')} t={t} kicker="What you need" captions={N.captions}>
      <PartsList t={t} items={N.items} top={140} w={230} />
      <div style={{ position: 'absolute', left: 200, top: 650, ...fadeUp(after(t, N.terminalIn, 0.5)) }}>
        <Terminal t={t} lines={N.terminal} w={760} />
        <div style={{ ...mono(20, C.muted), marginTop: 10 }}>ESP-IDF v6 · build · flash · watch the log</div>
      </div>
      <Checklist t={t} items={N.check} style={{ position: 'absolute', left: 1080, top: 680 }} size={30} />
    </IntroFrame>
  );
};

// ── 5. go ──────────────────────────────────────────────────────────────────

export const Go: React.FC = () => {
  const t = useT();
  const card = MAP.cards[GO.card];
  return (
    <IntroFrame frames={frames('go')} t={t}>
      <GoCard t={t} at={GO.line} n={GO.card + 1} card={card} demo={DEMOS[GO.card]} nextLabel={GO.nextLabel} />
    </IntroFrame>
  );
};

export const SCENE_COMPONENTS: Record<SceneId, React.FC> = { want: Want, what: What, map: Map, needs: Needs, go: Go };
