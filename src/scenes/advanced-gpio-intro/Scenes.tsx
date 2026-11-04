/**
 * Advanced GPIO intro — every scene (STORYBOARD.md):
 *   Want   so far on/off + asking; now dim · note · catch · read · make
 *   What   peripherals: hardware behind the pins, set up, then on its own
 *   Map    pwm → gpio-interrupts → adc → dac
 *   Needs  LED · button · speaker · potentiometer; both earlier sections
 *   Go     "First up: PWM"
 */
import React from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from 'remotion';
import { C, GRAD_TEXT, hexA } from '../../theme/palette';
import { after, Bench, Checklist, Chip, clamp01, fadeUp, GoCard, GREEN, IntroFrame, MapCards, mono, PartsList } from '../intro/kit';
import { DimLed, DimOnly, Knob, Label, Needle, Note, PressBolt, VoltOut } from '../intro/vignettes';
import { FPS, GO, MAP, NEEDS, sceneDur, type SceneId, WANT, WHAT } from './timeline';

const useT = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  return frame / fps;
};
const frames = (id: SceneId) => Math.round(sceneDur(id) * FPS);
const DEMOS = [DimLed, PressBolt, Knob, VoltOut];

// ── 1. want ────────────────────────────────────────────────────────────────

export const Want: React.FC = () => {
  const t = useT();
  const W = WANT;
  const benchOp = 1 - after(t, W.row, 0.5);
  const on = t >= W.onOff && Math.floor((t - W.onOff) / 0.5) % 2 === 0 ? 1 : 0;
  const polls = t >= W.asking ? Math.floor((t - W.asking) / 0.4) + 1 : 0;
  const dim = after(t, W.dim, 0.6);
  const vignettes: { C: React.FC<{ t: number; on: number }>; label: string }[] = [
    { C: DimOnly, label: 'dim a light' },
    { C: Note, label: 'play a note' },
    { C: PressBolt, label: 'catch a press' },
    { C: Needle, label: 'read a voltage' },
    { C: VoltOut, label: 'make a voltage' },
  ];
  return (
    <IntroFrame frames={frames('want')} t={t} kicker="Advanced GPIO" captions={W.captions}>
      <AbsoluteFill style={{ opacity: benchOp }}>
        <Bench
          x={480}
          y={170}
          scale={1.0}
          t={t}
          moduleIn={after(t, W.board, 0.6)}
          items={[
            { kind: 'led', pin: 24, gpio: 2, gx: 470, gy: 560, show: after(t, W.board + 0.3, 0.5), state: on, label: 'on · off · on · off', resistor: true },
            { kind: 'button', pin: 30, gpio: 18, gx: 560, gy: 330, show: after(t, W.board + 0.3, 0.5), state: 0, label: 'button' },
          ]}
        />
        {/* the polling loop, asking again and again */}
        <div style={{ position: 'absolute', left: 1150, top: 380, display: 'grid', gap: 10 }}>
          {Array.from({ length: Math.min(polls, 6) }, (_, k) => {
            const i = polls - 1 - k;
            return (
              <div key={i} style={{ ...mono(22, C.cyan), opacity: Math.max(0.15, 1 - k * 0.2) }}>
                gpio_get_level(BUTTON)? → 1
              </div>
            );
          })}
        </div>
      </AbsoluteFill>
      <div style={{ position: 'absolute', top: 330, width: '100%', display: 'flex', justifyContent: 'center', gap: 20, opacity: 1 - 0.65 * dim }}>
        {vignettes.map(({ C: V, label }, i) => {
          const p = after(t, W.wants[i], 0.4);
          return (
            <div
              key={label}
              style={{
                ...fadeUp(p, 20),
                minWidth: 270,
                height: 340,
                boxSizing: 'border-box',
                padding: '22px 18px',
                borderRadius: 18,
                background: hexA(C.purple, 0.14),
                border: `1px solid ${hexA(C.cyan, 0.25 + 0.4 * p)}`,
                display: 'grid',
                gridTemplateRows: '1fr auto',
                justifyItems: 'center',
                alignItems: 'center',
              }}
            >
              <V t={t - W.wants[i]} on={p} />
              <Label>{label}</Label>
            </div>
          );
        })}
      </div>
    </IntroFrame>
  );
};

// ── 2. what it is ──────────────────────────────────────────────────────────

const BLOCKS = [
  { name: 'LED controller', job: 'makes pulses', pin: 'GPIO 2' },
  { name: 'GPIO interrupt', job: 'watches a pin', pin: 'GPIO 18' },
  { name: 'ADC', job: 'measures a voltage', pin: 'an ADC pin' },
  { name: 'DAC', job: 'makes a voltage', pin: 'GPIO 25' },
];

export const What: React.FC = () => {
  const t = useT();
  const W = WHAT;
  const job = after(t, W.job, 0.4);
  const word = after(t, W.word, 0.5);
  const own = after(t, W.own, 0.4);
  const LX = 1120;
  const LW = 640;
  // lanes: progress over 7 s from "set"
  const prog = clamp01((t - W.setup) / 7);
  const SETUP = 0.16;
  const wave: string[] = [];
  if (t >= W.own) {
    const n = Math.floor(prog * 300);
    for (let i = Math.floor(SETUP * 300); i <= n; i++) {
      const u = i / 300;
      const hi = Math.floor(u * 40) % 2 === 0;
      wave.push(`${wave.length ? 'L' : 'M'} ${LX + u * LW} ${hi ? 560 : 610}`);
    }
  }
  const freeOp = after(t, W.free, 0.4);
  return (
    <IntroFrame frames={frames('what')} t={t} kicker="What a peripheral is" captions={W.captions}>
      <Bench x={130} y={230} scale={0.88} t={t} items={[]} hot={[24, 30, 10]} />
      <svg width={1920} height={1080} style={{ position: 'absolute', left: 0, top: 0 }}>
        {BLOCKS.map((b, i) => {
          const p = after(t, W.blocks[i], 0.4);
          const y = 260 + i * 150;
          return <path key={b.name} d={`M ${130 + 326 * 0.88} ${y + 50} H 560`} stroke={hexA(C.cyan, 0.5)} strokeWidth={3} strokeDasharray="6 6" opacity={p} />;
        })}
      </svg>
      {BLOCKS.map((b, i) => {
        const p = after(t, W.blocks[i], 0.4);
        const lit = i === 0 ? own : 0;
        return (
          <div
            key={b.name}
            style={{
              position: 'absolute',
              left: 560,
              top: 260 + i * 150,
              width: 420,
              height: 110,
              boxSizing: 'border-box',
              padding: '14px 22px',
              borderRadius: 16,
              background: `linear-gradient(165deg, ${hexA(C.cyan, 0.08 + 0.2 * lit)}, ${hexA('#0a0420', 0.85)})`,
              border: `${lit > 0.5 ? 2 : 1}px solid ${hexA(C.cyan, 0.35 + 0.6 * lit)}`,
              boxShadow: lit > 0.01 ? `0 0 ${40 * lit}px ${hexA(C.cyan, 0.35)}` : undefined,
              ...fadeUp(p, 14),
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
              <span style={{ fontSize: 30, fontWeight: 700, color: C.ink }}>{b.name}</span>
              <span style={mono(17, C.pink)}>{b.pin}</span>
            </div>
            <div style={{ fontSize: 24, color: C.muted, opacity: job }}>{b.job}</div>
          </div>
        );
      })}
      <div style={{ position: 'absolute', left: LX - 60, top: 200, ...GRAD_TEXT, fontSize: 96, fontWeight: 800, ...fadeUp(word, 18) }}>peripherals</div>
      <svg width={1920} height={1080} style={{ position: 'absolute', left: 0, top: 0, opacity: after(t, W.setup - 0.3, 0.4) }}>
        <text x={LX} y={420} style={mono(17, C.cyan, { letterSpacing: '.2em' })}>
          YOUR CODE
        </text>
        <rect x={LX} y={440} width={LW} height={60} rx={8} fill={hexA(C.muted, 0.08)} stroke={hexA(C.muted, 0.3)} />
        <rect x={LX + 4} y={446} width={Math.max(0, Math.min(prog, SETUP) * LW - 8)} height={48} rx={6} fill={C.amber} />
        {prog > 0.05 && (
          <text x={LX + 14} y={478} style={mono(17, '#0a0420', { fontWeight: 800 })}>
            set up
          </text>
        )}
        {[0.3, 0.48, 0.66, 0.84].map((a) => {
          const p = clamp01((t - W.free - (a - 0.3) * 3) / 0.4);
          return <rect key={a} x={LX + a * LW} y={446} width={0.1 * LW * p} height={48} rx={6} fill={GREEN} opacity={0.85} />;
        })}
        <text x={LX + 0.3 * LW} y={530} style={mono(18, GREEN, { fontWeight: 700 })} opacity={freeOp}>
          free: something else
        </text>
        <text x={LX} y={655} style={mono(17, C.magenta, { letterSpacing: '.2em' })} opacity={own}>
          LED CONTROLLER · ON ITS OWN
        </text>
        <path d={wave.join(' ')} fill="none" stroke={C.magenta} strokeWidth={4} style={{ filter: `drop-shadow(0 0 6px ${C.magenta})` }} />
      </svg>
    </IntroFrame>
  );
};

// ── 3. map ─────────────────────────────────────────────────────────────────

export const Map: React.FC = () => {
  const t = useT();
  return (
    <IntroFrame frames={frames('map')} t={t} kicker="Advanced GPIO · four videos" captions={MAP.captions}>
      <MapCards t={t} cards={MAP.cards} inAt={MAP.in} cols={4} w={405} h={560} gap={26} top={200} demos={DEMOS} />
    </IntroFrame>
  );
};

// ── 4. needs ───────────────────────────────────────────────────────────────

export const Needs: React.FC = () => {
  const t = useT();
  const N = NEEDS;
  return (
    <IntroFrame frames={frames('needs')} t={t} kicker="What you need" captions={N.captions}>
      <PartsList t={t} items={N.items} top={160} w={300} />
      <Checklist t={t} items={N.sections} style={{ position: 'absolute', left: 560, top: 500 }} size={34} />
      <div style={{ position: 'absolute', left: 560, top: 660, ...fadeUp(after(t, N.queue, 0.4)) }}>
        <Chip color={C.cyan} size={24}>
          GPIO interrupts → a task + a queue → needs FreeRTOS
        </Chip>
      </div>
    </IntroFrame>
  );
};

// ── 5. go ──────────────────────────────────────────────────────────────────

export const Go: React.FC = () => {
  const t = useT();
  return (
    <IntroFrame frames={frames('go')} t={t}>
      <GoCard t={t} at={GO.line} n={1} card={MAP.cards[GO.card]} demo={DimLed} nextLabel={GO.nextLabel} />
    </IntroFrame>
  );
};

export const SCENE_COMPONENTS: Record<SceneId, React.FC> = { want: Want, what: What, map: Map, needs: Needs, go: Go };
