/**
 * 7 · gpio_get_level(BUTTON) — reading it.
 *   ret       int, not esp_err_t → nothing to check; ESP_ERROR_CHECK(1) would abort
 *   snap      a snapshot at the moment of the call: a press between two reads is missed
 *   compare   active low → pressed = (gpio_get_level(BUTTON) == 0)
 *
 * FACTS: driver/gpio.h l.144–155; gpio.c l.252–255; esp_err.h; gpio_ll.h l.537.
 */
import React from 'react';
import { useCurrentFrame, useVideoConfig } from 'remotion';
import { Explainer, GREEN, mono, RED, VIEW_W as W } from '../../components/Explainer';
import { C, FONT, hexA } from '../../theme/palette';
import { after, Pill, Read as R, Verdict, VTrace } from './parts';
import { FPS, READ as S, sceneDur, VDD } from './timeline';

const ARG_COLOR = [C.amber, C.pink];

export const Read: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;
  const V = S.views;
  return (
    <Explainer
      t={t}
      frames={Math.round(sceneDur('read') * FPS)}
      kicker="Reading it · gpio_get_level()"
      code={S.code}
      run={S.run}
      args={S.args.map((a, i) => ({ ...a, color: ARG_COLOR[i] }))}
      captions={S.captions}
      views={[
        { at: V.ret, component: RetView, active: [0], label: 'what it returns · driver/gpio.h', accent: C.amber, right: () => 'int gpio_get_level(gpio_num_t gpio_num);' },
        { at: V.snap, component: SnapView, active: [0], label: 'a snapshot · GPIO 18', accent: C.magenta, right: () => 'illustration · one read per call' },
        { at: V.compare, component: CompareView, active: [0, 1], label: 'the answer you mean', accent: C.cyan },
      ]}
    />
  );
};

const RetView: React.FC<{ t: number }> = ({ t }) => {
  const r = S.ret;
  const plain = after(t, r.plain);
  const notErr = after(t, r.notErr);
  const wrap = after(t, r.wrap);
  const fail = after(t, r.fail);
  return (
    <div style={{ position: 'absolute', inset: 0, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 50, alignItems: 'center', padding: '0 30px' }}>
      <div style={{ display: 'grid', gap: 18, ...mono(26, '#cfd6ff') }}>
        <div style={{ opacity: notErr, color: C.muted }}>
          <span style={{ color: C.cyan }}>esp_err_t</span> gpio_set_level(…);
          <div style={{ fontSize: 19, marginTop: 4 }}>an error code: ESP_OK or a failure</div>
        </div>
        <div style={{ opacity: plain, padding: '10px 14px', borderLeft: `4px solid ${C.amber}`, background: `linear-gradient(90deg, ${hexA(C.amber, 0.14)}, transparent)` }}>
          <span style={{ color: C.amber, fontWeight: 800 }}>int</span> gpio_get_level(…);
          <div style={{ fontSize: 19, marginTop: 4, color: C.ink }}>the level itself: 1 or 0 — nothing to check</div>
        </div>
      </div>
      <div style={{ display: 'grid', gap: 18, opacity: wrap, transform: `translateY(${(1 - wrap) * 14}px)` }}>
        <div style={{ position: 'relative', ...mono(26, '#fff'), padding: '10px 16px', borderLeft: `4px solid ${RED}`, background: `linear-gradient(90deg, ${hexA(RED, 0.12)}, transparent)` }}>
          ESP_ERROR_CHECK(gpio_get_level(BUTTON));
          <span style={{ position: 'absolute', left: 16, right: 16, top: '52%', height: 3, background: RED, boxShadow: `0 0 8px ${RED}` }} />
        </div>
        <div style={{ opacity: fail, ...mono(24, C.ink), lineHeight: 1.6 }}>
          released → returns <b style={{ color: C.amber }}>1</b>
          <br />1 ≠ ESP_OK (0) → <b style={{ color: RED }}>abort()</b>
        </div>
        <Verdict ok={false} p={fail} size={22}>
          a released button would crash the program
        </Verdict>
      </div>
    </div>
  );
};

const SnapView: React.FC<{ t: number }> = ({ t }) => {
  const s = S.snap;
  const [a, b] = s.press;
  const s0 = S.views.snap;
  const s1 = s0 + 7.2;
  const vAt = (x: number) => (x >= a && x < b ? 0 : VDD);
  const reads: R[] = s.reads.map((x) => ({ s: x, val: 1 }));
  const L = 150;
  const xOf = (x: number) => L + ((x - s0) / (s1 - s0)) * (W - 20 - L);
  const missed = after(t, s.remember);
  return (
    <div style={{ position: 'absolute', inset: 0 }}>
      <VTrace W={W} H={380} s0={s0} s1={s1} vAt={vAt} upTo={t} bands={0.5} reads={reads} />
      {/* the press that slips between the reads */}
      {t >= a && (
        <div style={{ position: 'absolute', left: xOf(a) - 60, width: xOf(b) - xOf(a) + 120, top: 348, textAlign: 'center', ...mono(20, C.cyan, { fontWeight: 700 }) }}>
          a press
        </div>
      )}
      <div style={{ position: 'absolute', left: 150, top: 410, display: 'flex', gap: 30, alignItems: 'center' }}>
        <span style={{ opacity: after(t, s.moment), fontSize: 24, color: C.ink }}>
          each <span style={mono(24, C.amber)}>●</span> = one call: the level at that instant
        </span>
        <span style={{ opacity: after(t, s.wait) }}>
          <Pill color={C.muted} size={20}>
            doesn't wait for a press
          </Pill>
        </span>
        <span style={{ opacity: missed }}>
          <Pill color={RED} size={20}>
            doesn't remember one: 1 … 1 → missed
          </Pill>
        </span>
      </div>
    </div>
  );
};

const CompareView: React.FC<{ t: number }> = ({ t }) => {
  const c = S.compare;
  const zero = after(t, c.zero);
  const cmp = after(t, c.compare);
  const mean = after(t, c.mean);
  const row = (state: string, lvl: number, res: boolean, p: number) => (
    <div style={{ opacity: p, display: 'grid', gridTemplateColumns: '220px 120px 300px 1fr', alignItems: 'center', ...mono(30, C.ink), padding: '10px 20px', borderRadius: 12, border: '1px solid rgba(255,255,255,.12)' }}>
      <span style={{ color: C.muted }}>{state}</span>
      <span style={{ color: lvl ? C.amber : C.cyan, fontWeight: 800 }}>→ {lvl}</span>
      <span>
        {lvl} == 0
      </span>
      <span style={{ color: res ? GREEN : C.muted, fontWeight: 800 }}>→ pressed = {res ? 'true' : 'false'}</span>
    </div>
  );
  return (
    <div style={{ position: 'absolute', inset: 0, display: 'grid', alignContent: 'center', gap: 20, padding: '0 50px' }}>
      <div style={{ opacity: cmp, fontFamily: FONT.mono, fontSize: 34, color: '#fff', padding: '12px 18px', borderLeft: `4px solid ${C.cyan}`, background: `linear-gradient(90deg, ${hexA(C.cyan, 0.16)}, transparent)` }}>
        bool pressed = (gpio_get_level(BUTTON) <b style={{ color: C.amber }}>== 0</b>);
      </div>
      {row('released', 1, false, zero)}
      {row('pressed', 0, true, zero)}
      <div style={{ opacity: mean, fontSize: 24, color: C.muted }}>pull-up + button to GND = "active low": 0 means pressed</div>
    </div>
  );
};
