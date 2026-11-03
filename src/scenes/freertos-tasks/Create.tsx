/**
 * 4 · xTaskCreate ① — opens in app_main (both calls, the first one is pulled
 * out), then the function (no brackets), the name (15 characters kept), the
 * stack (BYTES in ESP-IDF, ×4 vs words; what lives there; heap; scale; the
 * overflow — the trap everyone meets).
 */
import React from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from 'remotion';
import { CodeLine } from '../../components/CodeLine';
import { ease, Explainer, ExplainerArg, GREEN, inOut, mono, RED, VIEW_H as H, VIEW_W as W } from '../../components/Explainer';
import { Panel } from '../../components/Panel';
import { C, FONT, hexA } from '../../theme/palette';
import { after, Pill, SerialLog, StackBox, Verdict } from './parts';
import { CREATE as S, CREATE_CODE, FPS, IDLE_STACK, MAIN_CODE, MAIN_CREATE_LINE, MAIN_STACK, sceneDur, STACK } from './timeline';

/** the opening: app_main with both calls; the first is picked out, the rest fades, the panel lifts away */
const MainIntro: React.FC<{ t: number }> = ({ t }) => {
  const m = S.main;
  const cin = ease((t - m.show) / 0.6);
  const pick = ease((t - m.pick) / 0.5);
  const out = inOut((t - m.out) / 0.6);
  if (out >= 1) return null;
  return (
    <AbsoluteFill style={{ pointerEvents: 'none', zIndex: 11 /* above the backdrop's scrim, like Scene */ }}>
      <div style={{ position: 'absolute', left: 360, top: 250, width: 1200, height: 470, opacity: cin * (1 - out), transform: `translateY(${(1 - cin) * 24 - out * 120}px)` }}>
        <Panel label="main/main.c · app_main" accent={C.cyan} right="ESP-IDF">
          <pre style={{ margin: 0, fontFamily: FONT.mono, fontSize: 28, lineHeight: 1.6, color: '#cfd6ff' }}>
            {MAIN_CODE.map((l, i) => {
              const isCreate = i === MAIN_CREATE_LINE;
              const marks = i === MAIN_CREATE_LINE ? [{ token: 'xTaskCreate', at: m.two }, { token: '&fast', at: m.each, label: 'LED 1 · GPIO 2' }] : i === MAIN_CREATE_LINE + 1 ? [{ token: 'xTaskCreate', at: m.two + 0.25 }, { token: '&slow', at: m.each + 0.25, label: 'LED 2 · GPIO 19' }] : [];
              return (
                <div key={i} style={{ minHeight: '1.6em', opacity: isCreate ? 1 : 1 - 0.85 * pick }}>
                  <CodeLine text={l} t={t} litAt={isCreate ? m.pick : null} live={isCreate && t >= m.pick} marks={marks} row={marks.some((x) => x.label) ? 1 : 0} />
                </div>
              );
            })}
          </pre>
        </Panel>
      </div>
    </AbsoluteFill>
  );
};

/** all six cards; scenes pass the times at which each appears */
export const createArgs = (at: number[]): ExplainerArg[] => [
  { token: 'blink_task', at: at[0], title: 'function', value: 'blink_task', sub: 'passed, not called', color: C.amber },
  { token: '"blink_fast"', at: at[1], title: 'name', value: '"blink_fast"', sub: '≤ 15 characters', color: C.cyan },
  { token: '2048', at: at[2], title: 'stack', value: '2048 B', sub: 'bytes, not words', color: C.cyan },
  { token: '&fast', at: at[3], title: 'parameter', value: '&fast', sub: 'arrives as arg', color: C.amber },
  { token: '5', at: at[4], title: 'priority', value: '5', sub: '0 … 24', color: C.magenta },
  { token: 'NULL', at: at[5], title: 'handle', value: 'NULL', sub: 'or &handle', color: C.cyan },
];

export const Create: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;
  const V = S.views;
  return (
    <>
      <Explainer
        t={t}
        frames={Math.round(sceneDur('create') * FPS)}
        kicker="Making a task · xTaskCreate()"
        code={CREATE_CODE}
        codeSize={46}
        codeIn={S.main.out}
        cardW={280}
        cardGap={300}
        run={S.run}
        args={createArgs([...S.args, 999, 999, 999])}
        captions={S.captions}
        views={[
        { at: V.fn, component: FnView, active: [0], label: 'the function', accent: C.amber },
        { at: V.name, component: NameView, active: [1], label: 'the name · configMAX_TASK_NAME_LEN = 16', accent: C.cyan, right: () => 'tasks.c · prvInitialiseNewTask' },
        { at: V.bytes, component: BytesView, active: [2], label: 'the stack size', accent: C.cyan, right: () => 'task.h · "NUMBER OF BYTES"' },
        { at: V.holds, component: HoldsView, active: [2], label: "what's on a task's stack", accent: C.cyan },
        { at: V.scale, component: ScaleView, active: [2], label: 'for scale · defaults, in bytes', accent: C.cyan, right: () => 'menuconfig' },
        { at: V.overflow, component: OverflowView, active: [2], label: 'the trap · stack overflow', accent: RED, right: () => 'CONFIG_FREERTOS_CHECK_STACKOVERFLOW · checked at each task switch' },
      ]}
      />
      <MainIntro t={t} />
    </>
  );
};

const FnView: React.FC<{ t: number }> = ({ t }) => {
  const s = S.fn;
  return (
    <div style={{ position: 'absolute', inset: 0, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 30, alignContent: 'center' }}>
      <div style={{ opacity: after(t, s.brackets) }}>
        <div style={mono(34, '#fff', { fontWeight: 700, marginBottom: 18 })}>
          xTaskCreate(<span style={{ color: C.amber }}>blink_task</span>, …)
        </div>
        <Verdict ok p={after(t, s.handing)} size={24}>
          hands the function over — FreeRTOS calls it later
        </Verdict>
      </div>
      <div style={{ opacity: after(t, s.calling) }}>
        <div style={mono(34, '#fff', { fontWeight: 700, marginBottom: 18 })}>
          xTaskCreate(<span style={{ color: RED }}>blink_task()</span>, …)
        </div>
        <Verdict ok={false} p={after(t, s.calling)} size={24}>
          calls it now, in app_main — and it never returns
        </Verdict>
      </div>
    </div>
  );
};

const Cells: React.FC<{ text: string; cut?: string; p: number; cutP?: number; y: number }> = ({ text, cut = '', p, cutP = 0, y }) => {
  const cells = Array.from({ length: 16 }, (_, i) => (i < text.length ? text[i] : i === text.length ? '\\0' : ''));
  const cw = 64;
  return (
    <g transform={`translate(40 ${y})`} opacity={p}>
      {cells.map((ch, i) => (
        <g key={i}>
          <rect x={i * cw} y={0} width={cw - 6} height={60} rx={6} fill={ch === '\\0' ? hexA(C.muted, 0.2) : ch ? hexA(C.cyan, 0.16) : 'rgba(255,255,255,.03)'} stroke={ch ? hexA(C.cyan, 0.7) : 'rgba(255,255,255,.14)'} />
          <text x={i * cw + (cw - 6) / 2} y={40} textAnchor="middle" style={mono(ch === '\\0' ? 20 : 28, ch === '\\0' ? C.muted : '#fff', { fontWeight: 700 })}>
            {ch}
          </text>
          <text x={i * cw + (cw - 6) / 2} y={82} textAnchor="middle" style={mono(13, C.muted)}>
            {i}
          </text>
        </g>
      ))}
      {cut && (
        <g opacity={cutP}>
          {cut.split('').map((ch, i) => (
            <g key={i}>
              <rect x={(16 + i) * cw} y={0} width={cw - 6} height={60} rx={6} fill={hexA(RED, 0.12)} stroke={RED} strokeDasharray="5 4" />
              <text x={(16 + i) * cw + (cw - 6) / 2} y={40} textAnchor="middle" style={mono(28, RED, { fontWeight: 700, textDecoration: 'line-through' })}>
                {ch}
              </text>
            </g>
          ))}
          <text x={16 * cw + 10} y={-14} style={mono(18, RED, { fontWeight: 700 })}>
            cut off
          </text>
        </g>
      )}
    </g>
  );
};

const NameView: React.FC<{ t: number }> = ({ t }) => {
  const s = S.name;
  return (
    <svg width={W} height={H} style={{ display: 'block', overflow: 'visible' }}>
      <text x={40} y={34} opacity={after(t, s.debug)} style={mono(22, C.muted)}>
        only for debugging: logs, task lists, error messages
      </text>
      <text x={40} y={92} opacity={after(t, s.show)} style={mono(20, C.cyan, { fontWeight: 700 })}>
        "blink_fast" · 10 characters ✓
      </text>
      <Cells text="blink_fast" p={after(t, s.show)} y={110} />
      <text x={40} y={268} opacity={after(t, s.fifteen)} style={mono(20, C.amber, { fontWeight: 700 })}>
        15 characters + the terminator = 16
      </text>
      <text x={40} y={330} opacity={after(t, s.example)} style={mono(20, C.ink, { fontWeight: 700 })}>
        Espressif's generic_gpio example: "gpio_task_example" · 17 characters
      </text>
      <Cells text="gpio_task_examp" cut="le" p={after(t, s.example)} cutP={after(t, s.loses)} y={350} />
    </svg>
  );
};

const BytesView: React.FC<{ t: number }> = ({ t }) => {
  const s = S.bytes;
  const maxW = 1150;
  const bar = (bytes: number) => (bytes / 8192) * maxW;
  const rows = [
    { at: s.bytes, k: 'ESP-IDF', v: '2048 → 2048 bytes', b: 2048, c: C.cyan },
    { at: s.words, k: 'vanilla FreeRTOS', v: '2048 words × 4 bytes = 8192 bytes', b: 8192, c: C.muted },
  ];
  const four = after(t, s.four);
  const pop = 1 + 0.25 * Math.exp(-Math.max(0, t - s.four) * 3) * (four > 0 ? 1 : 0);
  return (
    <div style={{ position: 'absolute', inset: 0, display: 'grid', gridTemplateColumns: '1fr 300px', gap: 30, alignContent: 'center', alignItems: 'center' }}>
      <div style={{ display: 'grid', gap: 30 }}>
        <div style={{ ...mono(40, '#fff', { fontWeight: 800 }), opacity: after(t, s.n) }}>
          {STACK} <span style={{ color: C.cyan, opacity: after(t, s.bytes) }}>bytes</span>
        </div>
        {rows.map((r, i) => (
          <div key={i} style={{ display: 'grid', gridTemplateColumns: '240px 1fr', alignItems: 'center', gap: 20, opacity: after(t, i ? s.vanilla : r.at) }}>
            <div style={mono(22, r.c, { fontWeight: 700 })}>{r.k}</div>
            <div style={{ display: 'grid', gap: 6 }}>
              <div style={{ width: (bar(r.b) - 320) * after(t, r.at, 0.8), height: 34, borderRadius: 8, background: hexA(r.c, 0.3), border: `2px solid ${r.c}` }} />
              <div style={{ ...mono(20, C.ink), opacity: after(t, r.at) }}>{r.v}</div>
            </div>
          </div>
        ))}
        <div style={{ opacity: after(t, s.word4), ...mono(22, C.amber, { fontWeight: 700 }) }}>1 word = 32 bits = 4 bytes</div>
      </div>
      {/* the emphatic ×4 */}
      <div style={{ display: 'grid', justifyItems: 'center', gap: 12, opacity: four, transform: `scale(${pop})` }}>
        <div style={{ ...mono(130, C.amber, { fontWeight: 800, lineHeight: 1 }), textShadow: `0 0 40px ${hexA(C.amber, 0.7)}` }}>×4</div>
        <div style={{ ...mono(22, '#fff', { fontWeight: 700 }), textAlign: 'center' }}>four times as much memory</div>
        <div style={{ opacity: after(t, s.same), ...mono(18, C.muted), textAlign: 'center' }}>same number · four times the stack</div>
      </div>
    </div>
  );
};

const HoldsView: React.FC<{ t: number }> = ({ t }) => {
  const s = S.holds;
  return (
    <div style={{ position: 'absolute', inset: 0, display: 'grid', gridTemplateColumns: '420px 1fr', gap: 40, alignItems: 'center' }}>
      <StackBox
        title="blink_fast's stack"
        size="2048 bytes · grows down"
        h={390}
        fill={1}
        rows={[
          { text: 'const blink_t *b', sub: 'local variables', color: C.amber, p: after(t, s.locals) },
          { text: 'gpio_set_level(…)', sub: 'function calls', color: C.cyan, p: after(t, s.calls) },
          { text: 'saved registers', sub: 'while switched out', color: C.magenta, p: after(t, s.regs) },
        ]}
      />
      <div style={{ display: 'grid', gap: 24 }}>
        <div style={{ opacity: after(t, s.regs), ...mono(22, C.ink) }}>switched out → its registers wait here,
          <br />so it carries on exactly where it stopped</div>
        <div style={{ opacity: after(t, s.heap), display: 'flex', alignItems: 'center', gap: 16 }}>
          <div style={{ ...mono(22, C.ink, { fontWeight: 700 }), padding: '14px 20px', borderRadius: 12, border: `1px solid ${hexA(C.cyan, 0.6)}`, background: hexA(C.cyan, 0.08) }}>
            the heap · internal RAM
          </div>
          <span style={mono(26, C.cyan)}>→</span>
          <div style={mono(22, C.cyan, { fontWeight: 700 })}>2048 bytes, when xTaskCreate runs</div>
        </div>
      </div>
    </div>
  );
};

const ScaleView: React.FC<{ t: number }> = ({ t }) => {
  const s = S.scale;
  const maxW = 1000;
  const rows = [
    { at: s.main, k: 'main · app_main', b: MAIN_STACK, sub: '3584 + 512', c: C.muted },
    { at: s.ours, k: 'blink_fast · yours', b: STACK, sub: 'what you asked for', c: C.cyan },
    { at: s.idle, k: 'IDLE · idle task', b: IDLE_STACK, sub: 'CONFIG_FREERTOS_IDLE_TASK_STACKSIZE', c: C.muted },
  ];
  return (
    <div style={{ position: 'absolute', inset: 0, display: 'grid', alignContent: 'center', gap: 30 }}>
      {rows.map((r, i) => (
        <div key={i} style={{ display: 'grid', gridTemplateColumns: '300px 1fr', alignItems: 'center', gap: 20, opacity: after(t, r.at) }}>
          <div style={mono(22, r.c === C.cyan ? C.cyan : C.ink, { fontWeight: 700 })}>{r.k}</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 18 }}>
            <div style={{ width: (r.b / MAIN_STACK) * maxW * after(t, r.at, 0.8), height: 40, borderRadius: 8, background: hexA(r.c, 0.3), border: `2px solid ${r.c}` }} />
            <div style={mono(24, '#fff', { fontWeight: 700 })}>{r.b}</div>
            <div style={mono(16, C.muted)}>{r.sub}</div>
          </div>
        </div>
      ))}
    </div>
  );
};

const OverflowView: React.FC<{ t: number }> = ({ t }) => {
  const s = S.overflow;
  // the stack fills call by call from "too small" until "past the end"
  const grow = after(t, s.small, s.past - s.small);
  const past = after(t, s.past);
  const hit = after(t, s.catches);
  const fix = after(t, s.fix);
  const red = past > 0.5;
  return (
    <div style={{ position: 'absolute', inset: 0, display: 'grid', gridTemplateColumns: '420px 1fr', gap: 40, alignItems: 'center' }}>
      <div style={{ position: 'relative' }}>
        <StackBox
          title={fix > 0.5 ? 'a bigger stack' : 'a stack that\'s too small'}
          size={fix > 0.5 ? '4096 bytes — room to grow' : '2048 bytes'}
          h={fix > 0.5 ? 460 : 370}
          color={fix > 0.5 ? GREEN : red ? RED : C.cyan}
          rows={[
            { text: 'locals', color: C.amber },
            { text: 'gpio_set_level(…)', sub: 'a call', color: C.cyan },
            { text: 'a deeper call', color: C.cyan, p: grow > 0.25 ? 1 : 0 },
            { text: 'printf(…) — a big one', color: C.cyan, p: grow > 0.5 ? 1 : 0 },
            { text: 'and another', color: C.cyan, p: grow > 0.75 ? 1 : 0 },
            { text: 'and another', color: red && fix < 0.5 ? RED : C.cyan, p: past > 0.5 ? 1 : 0 },
          ]}
          bottom={
            <div style={{ position: 'absolute', left: 0, right: 0, bottom: 0, height: 44, display: 'grid', placeItems: 'center', background: hexA(fix > 0.5 ? GREEN : red ? RED : C.muted, 0.25), borderTop: `2px dashed ${fix > 0.5 ? GREEN : red ? RED : C.muted}`, ...mono(17, fix > 0.5 ? GREEN : red ? RED : C.muted, { fontWeight: 700 }) }}>
              {fix > 0.5 ? 'the end · untouched' : hit > 0.5 ? 'the end · overwritten!' : red ? '↓ past the end ↓' : 'the end of the stack'}
            </div>
          }
        />
      </div>
      <div style={{ display: 'grid', gap: 18 }}>
        <div style={{ opacity: after(t, s.trap), ...mono(30, '#fff', { fontWeight: 800 }) }}>
          the trap: <span style={{ color: RED, opacity: after(t, s.overflow) }}>stack overflow</span>
        </div>
        <div style={{ opacity: after(t, s.check), ...mono(21, C.ink) }}>at every task switch, FreeRTOS checks the end of each stack</div>
        <div style={{ opacity: after(t, s.prints - 0.2) }}>
          <SerialLog t={t} size={18} label="idf.py monitor" lines={[{ at: s.prints, text: '***ERROR*** A stack overflow in task blink_fast has been detected.', color: RED }]} />
        </div>
        <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
          <div style={{ opacity: after(t, s.restarts) }}>
            <Verdict ok={false} p={after(t, s.restarts)} size={22}>
              panic → the chip restarts
            </Verdict>
          </div>
          <div style={{ opacity: after(t, s.reboots) }}>
            <Pill color={RED} size={18}>
              … and again, and again
            </Pill>
          </div>
        </div>
        <div style={{ opacity: after(t, s.outgrown), ...mono(20, C.ink) }}>this message = the task has outgrown its stack</div>
        <div style={{ opacity: fix, transform: `translateY(${(1 - fix) * 10}px)` }}>
          <Verdict ok p={fix} size={24}>
            the fix: xTaskCreate(…, <b style={{ color: GREEN }}>4096</b>, …) — a bigger stack
          </Verdict>
        </div>
      </div>
    </div>
  );
};
