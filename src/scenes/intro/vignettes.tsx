/**
 * Small looping hardware results for the map cards (and the "want" beats):
 * what each video in a section ends up doing on the bench.
 * Every one is a pure function of scene time `t`; `on` (0..1) = the card is lit,
 * and the motion only runs while it is.
 */
import React from 'react';
import { Led, Speaker } from '../../components/Gadgets';
import { C, FONT, hexA } from '../../theme/palette';
import { TactSwitch } from '../gpio-input/parts';
import { Chip, clamp01, GREEN, mono } from './kit';

const Row: React.FC<{ children: React.ReactNode; gap?: number }> = ({ children, gap = 34 }) => (
  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap }}>{children}</div>
);
const Col: React.FC<{ children: React.ReactNode; gap?: number }> = ({ children, gap = 8 }) => (
  <div style={{ display: 'grid', justifyItems: 'center', gap }}>{children}</div>
);

/** square wave: high for the first half of every `periodS` */
const sq = (t: number, periodS: number) => ((t % periodS) + periodS) % periodS < periodS / 2;

/** gpio: blink, 500 ms on / 500 ms off */
export const BlinkLed: React.FC<{ t: number; on: number; size?: number }> = ({ t, on, size = 180 }) => (
  <Col>
    <Led brightness={on > 0.5 && sq(t, 1) ? 1 : 0} size={size} />
    <Chip color={C.pink} size={17}>
      GPIO 2 · blink
    </Chip>
  </Col>
);

/** press-cycle: pressed for the middle 0.6 s of every 1.6 s */
const pressedAt = (t: number) => ((t % 1.6) + 1.6) % 1.6 > 0.6 && ((t % 1.6) + 1.6) % 1.6 < 1.2;

/** gpio-input: the LED follows the button; the log counts presses */
export const ButtonLed: React.FC<{ t: number; on: number }> = ({ t, on }) => {
  const live = on > 0.5;
  const pressed = live && pressedAt(t);
  const presses = live ? Math.max(0, Math.floor((t - 0.6) / 1.6) + 1) : 0;
  return (
    <Row>
      <Col>
        <svg width={90} height={90} viewBox="-45 -45 90 90">
          <TactSwitch x={0} y={0} press={pressed ? 1 : 0} size={64} />
        </svg>
        <Chip color={C.pink} size={15}>
          GPIO 18
        </Chip>
      </Col>
      <span style={mono(26, C.muted)}>→</span>
      <Col>
        <Led brightness={pressed ? 1 : 0} size={120} />
        <Chip color={C.pink} size={15}>
          GPIO 2
        </Chip>
      </Col>
      <div style={{ ...mono(17, GREEN), padding: '8px 12px', borderRadius: 8, background: '#0b0818', border: `1px solid ${hexA(GREEN, 0.3)}` }}>
        I button: presses: {Math.min(presses, 99)}
      </div>
    </Row>
  );
};

/** freertos-tasks: two LEDs, each at its own rate (200 ms and 500 ms halves) */
export const TwoRates: React.FC<{ t: number; on: number; size?: number; compact?: boolean }> = ({ t, on, size = 160, compact }) => (
  <Row gap={compact ? 18 : 60}>
    <Col gap={compact ? 2 : 8}>
      <Led brightness={on > 0.5 && sq(t, 0.4) ? 1 : 0} size={compact ? 64 : size} />
      <Chip color={C.pink} size={compact ? 12 : 16}>
        {compact ? '200 ms' : 'GPIO 2 · 200 ms'}
      </Chip>
    </Col>
    <Col gap={compact ? 2 : 8}>
      <Led brightness={on > 0.5 && sq(t, 1.0) ? 1 : 0} size={compact ? 64 : size} />
      <Chip color={C.pink} size={compact ? 12 : 16}>
        {compact ? '500 ms' : 'GPIO 19 · 500 ms'}
      </Chip>
    </Col>
  </Row>
);
export const TwoRatesSmall: React.FC<{ t: number; on: number }> = ({ t, on }) => <TwoRates t={t} on={on} compact />;

/** pwm: an LED breathing between dim and bright, and a speaker */
export const DimLed: React.FC<{ t: number; on: number; speaker?: boolean }> = ({ t, on, speaker = true }) => {
  const b = on > 0.5 ? 0.12 + 0.88 * (0.5 - 0.5 * Math.cos(t * 1.6)) : 0.35;
  return (
    <Row gap={50}>
      <Col>
        <Led brightness={b} size={160} />
        <Chip color={C.amber} size={16}>
          {Math.round(b * 100)}% on
        </Chip>
      </Col>
      {speaker && (
        <Col>
          <Speaker hz={440} level={on > 0.5 ? 0.8 : 0} t={t} size={96} />
          <Chip color={C.cyan} size={16}>
            440 Hz
          </Chip>
        </Col>
      )}
    </Row>
  );
};

/** just the dimming LED */
export const DimOnly: React.FC<{ t: number; on: number }> = ({ t, on }) => <DimLed t={t} on={on} speaker={false} />;

/** a speaker playing a note */
export const Note: React.FC<{ t: number; on: number }> = ({ t, on }) => (
  <Col>
    <Speaker hz={440} level={on > 0.5 ? 0.9 : 0} t={t} size={110} />
    <Chip color={C.cyan} size={16}>
      a note
    </Chip>
  </Col>
);

/** gpio-interrupts: press → the pin interrupts → a waiting task wakes */
export const PressBolt: React.FC<{ t: number; on: number }> = ({ t, on }) => {
  const live = on > 0.5;
  const u = ((t % 1.6) + 1.6) % 1.6;
  const pressed = live && u > 0.6 && u < 1.2;
  const flash = live ? clamp01(1 - (u - 0.6) / 0.5) * (u >= 0.6 ? 1 : 0) : 0;
  return (
    <Row gap={22}>
      <svg width={90} height={90} viewBox="-45 -45 90 90">
        <TactSwitch x={0} y={0} press={pressed ? 1 : 0} size={64} />
      </svg>
      <svg width={60} height={80} viewBox="0 0 60 80">
        <path d="M 34 2 L 10 44 L 28 44 L 20 78 L 50 30 L 32 30 L 42 2 Z" fill={C.amber} opacity={0.25 + 0.75 * flash} style={{ filter: `drop-shadow(0 0 ${14 * flash}px ${C.amber})` }} />
      </svg>
      <div
        style={{
          ...mono(18, flash > 0.2 ? '#0a0420' : C.ink, { fontWeight: 700, whiteSpace: 'nowrap' }),
          padding: '10px 14px',
          borderRadius: 10,
          background: flash > 0.2 ? GREEN : hexA(C.purple, 0.3),
          border: `1px solid ${hexA(GREEN, 0.5)}`,
        }}
      >
        {flash > 0.2 ? 'task: wakes' : 'task: waiting'}
      </div>
    </Row>
  );
};

/** adc: a knob turns, and the reading 0 … 4095 follows */
export const Knob: React.FC<{ t: number; on: number }> = ({ t, on }) => {
  const v = on > 0.5 ? 0.5 - 0.5 * Math.cos(t * 1.1) : 0.5;
  const a = ((-135 + 270 * v) * Math.PI) / 180;
  const raw = Math.round(v * 4095);
  return (
    <Row gap={40}>
      <svg width={100} height={100} viewBox="-50 -50 100 100">
        <circle r={42} fill="#2a5aa8" stroke="#4b7bd0" strokeWidth={2} />
        <circle r={28} fill="#d9dde3" stroke="#8a919c" strokeWidth={2} />
        <line x1={0} y1={0} x2={24 * Math.sin(a)} y2={-24 * Math.cos(a)} stroke="#1a1c20" strokeWidth={6} strokeLinecap="round" />
      </svg>
      <Col gap={4}>
        <span style={mono(48, C.amber, { fontWeight: 800 })}>{String(raw).padStart(4, ' ')}</span>
        <span style={mono(16, C.muted)}>0 … 4095</span>
      </Col>
    </Row>
  );
};

/** dac: a number becomes a voltage on GPIO 25 */
export const VoltOut: React.FC<{ t: number; on: number; value?: number }> = ({ on, value = 128 }) => {
  const v = value;
  const p = clamp01(on);
  const volts = (3.3 * v) / 255;
  return (
    <Row gap={16}>
      <span style={mono(36, C.cyan, { fontWeight: 800 })}>{v}</span>
      <span style={mono(26, C.muted)}>→</span>
      <div style={{ width: 38, height: 100, borderRadius: 8, border: `2px solid ${hexA(C.amber, 0.7)}`, position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: `${(v / 255) * 100 * p}%`, background: `linear-gradient(0deg, ${C.amber}, ${hexA(C.amber, 0.4)})` }} />
      </div>
      <Col gap={4}>
        <span style={mono(28, C.amber, { fontWeight: 800, whiteSpace: 'nowrap' })}>≈ {volts.toFixed(2)} V</span>
        <span style={mono(16, C.muted)}>GPIO 25</span>
      </Col>
    </Row>
  );
};

/** a needle swinging: "read a voltage" */
export const Needle: React.FC<{ t: number; on: number }> = ({ t, on }) => {
  const v = on > 0.5 ? 0.5 - 0.45 * Math.cos(t * 1.1) : 0.5;
  const a = ((-60 + 120 * v) * Math.PI) / 180;
  return (
    <Col>
      <svg width={140} height={96} viewBox="-70 -60 140 96">
        <rect x={-66} y={-56} width={132} height={90} rx={10} fill="#141026" stroke={hexA(C.amber, 0.7)} strokeWidth={2} />
        <path d="M -44 10 A 50 50 0 0 1 44 10" fill="none" stroke={hexA(C.muted, 0.6)} strokeWidth={3} />
        <line x1={0} y1={22} x2={50 * Math.sin(a)} y2={22 - 50 * Math.cos(a)} stroke={C.amber} strokeWidth={3} strokeLinecap="round" />
      </svg>
      <Chip color={C.amber} size={16}>
        {(v * 3.3).toFixed(2)} V
      </Chip>
    </Col>
  );
};

export const Label: React.FC<{ children: React.ReactNode; color?: string }> = ({ children, color = C.ink }) => (
  <div style={{ fontFamily: FONT.sans, fontSize: 26, fontWeight: 600, color, textAlign: 'center' }}>{children}</div>
);
