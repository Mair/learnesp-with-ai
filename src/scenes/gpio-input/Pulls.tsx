/**
 * 10 · SECOND KNOB — pull-up vs pull-down.
 *   split   pull-up + button to GND (active low) beside pull-down + button to 3.3 V (active high)
 *   both    GPIO_PULLUP_PULLDOWN: 45 k / 45 k divider → 1.65 V → the undefined band
 *
 * FACTS: gpio_types.h l.116–121; datasheet RPU = RPD = 45 kΩ, VIH/VIL.
 */
import React from 'react';
import { useCurrentFrame, useVideoConfig } from 'remotion';
import { GREEN, mono, RED } from '../../components/Explainer';
import { C, hexA } from '../../theme/palette';
import { after, BIG_W, InputPin, pinState, ViewStage, VTrace } from './parts';
import { downAt, FPS, PULLS as S, sceneDur, VDD } from './timeline';

export const Pulls: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;
  const V = S.views;
  return (
    <ViewStage
      t={t}
      frames={Math.round(sceneDur('pulls') * FPS)}
      kicker="Second knob · pull-up or pull-down"
      accent="cyan"
      captions={S.captions}
      views={[
        { at: V.split, component: SplitView, label: 'same button, flipped', accent: C.cyan, right: () => 'GPIO_PULLUP_ONLY  vs  GPIO_PULLDOWN_ONLY' },
        { at: V.both, component: BothView, label: 'GPIO_PULLUP_PULLDOWN on a button?', accent: RED },
      ]}
    />
  );
};

const Side: React.FC<{ t: number; up: boolean; p: number }> = ({ t, up, p }) => {
  const s = S.split;
  const down = downAt(s.presses, t);
  const st = pinState({ wpu: up ? 1 : 0, wpd: up ? 0 : 1, press: down ? 1 : 0, to: up ? 'gnd' : 'vcc' });
  const reading = st.v > VDD / 2 ? 1 : 0;
  const rel = after(t, s.released);
  const pr = after(t, s.pressed);
  const cell = (k: string, v: number, q: number, col: string) => (
    <div style={{ opacity: q, display: 'grid', gridTemplateColumns: '170px 70px', ...mono(28, C.ink) }}>
      <span style={{ color: C.muted }}>{k}</span>
      <b style={{ color: col }}>{v}</b>
    </div>
  );
  return (
    <div style={{ display: 'grid', justifyItems: 'center', gap: 10, opacity: p }}>
      <div style={mono(24, up ? C.amber : C.cyan, { fontWeight: 700 })}>{up ? 'GPIO_PULLUP_ONLY · button to GND' : 'GPIO_PULLDOWN_ONLY · button to 3.3 V'}</div>
      <InputPin ie={1} wpu={up ? 1 : 0} wpd={up ? 0 : 1} press={down ? 1 : 0} to={up ? 'gnd' : 'vcc'} v={st.v} reading={reading} width={740} />
      <div style={{ display: 'grid', gap: 6 }}>
        {cell('released', up ? 1 : 0, up ? 1 : rel, up ? C.amber : C.cyan)}
        {cell('pressed', up ? 0 : 1, up ? 1 : pr, up ? C.cyan : C.amber)}
        <div style={{ opacity: up ? 1 : pr, ...mono(22, C.muted) }}>pressed = (level == {up ? 0 : 1})</div>
      </div>
    </div>
  );
};

const SplitView: React.FC<{ t: number }> = ({ t }) => {
  const s = S.split;
  return (
    <div style={{ position: 'absolute', inset: 0 }}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 30, paddingTop: 10 }}>
        <Side t={t} up p={1} />
        <Side t={t} up={false} p={after(t, s.vcc)} />
      </div>
      <div style={{ position: 'absolute', left: 0, right: 0, bottom: 0, display: 'flex', justifyContent: 'center', gap: 40, fontSize: 26 }}>
        <span style={{ opacity: after(t, s.same), color: GREEN }}>same 45 kΩ · same ~73 µA</span>
        <span style={{ opacity: after(t, s.opposite), color: C.ink }}>
          opposite logic: <b style={{ color: C.amber }}>active low</b> vs <b style={{ color: C.cyan }}>active high</b>
        </span>
      </div>
    </div>
  );
};

const BothView: React.FC<{ t: number }> = ({ t }) => {
  const b = S.both;
  const st = pinState({ wpu: 1, wpd: 1, press: 0 });
  const half = after(t, b.v165);
  return (
    <div style={{ position: 'absolute', inset: 0, display: 'grid', gridTemplateColumns: '780px 1fr', gap: 20, alignItems: 'center' }}>
      <div style={{ opacity: after(t, b.never) }}>
        <InputPin ie={1} wpu={1} wpd={1} press={0} v={st.v} reading={null} width={760} />
        <div style={{ opacity: after(t, b.split), ...mono(24, C.ink), textAlign: 'center', marginTop: 10 }}>
          3.3 V × 45 k ÷ (45 k + 45 k) = <b style={{ color: RED }}>1.65 V</b>
        </div>
      </div>
      <div style={{ opacity: half }}>
        <VTrace W={BIG_W - 820} H={420} s0={0} s1={1} vAt={() => VDD / 2} bands={1} />
        <div style={{ ...mono(24, RED, { fontWeight: 700 }), textAlign: 'center', opacity: after(t, b.zone), padding: '8px 0', borderRadius: 10, background: hexA(RED, 0.08) }}>
          ✗ right in the undefined band
        </div>
      </div>
    </div>
  );
};
