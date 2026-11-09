/**
 * 4 · TASKS — the code, both sides at once: button_task (left) calls xQueueSend when it sees
 * a press; led_task (right) calls xQueueReceive and waits there until a press comes out.
 * Both name press_queue. Underneath, the same queue: a press goes in, comes out, the LED
 * blinks — lit in the code on the same frames.
 */
import React from 'react';
import { useCurrentFrame, useVideoConfig } from 'remotion';
import { CodeLine } from '../../components/CodeLine';
import { mono } from '../../components/Explainer';
import { Panel } from '../../components/Panel';
import type { Mark } from '../../components/pwm';
import { C, FONT } from '../../theme/palette';
import { after, Chip, LedCard, ledLevel, QueueRow, rise, rowWidth, Shell } from './parts';
import { buttonCode, FPS, ledCodeShort, RECV_SHORT, sceneDur, SEND_IF, TASKS as S } from './timeline';

const SCALE = 0.8;
const PIPE_TOP = 700;

const Code: React.FC<{ t: number; lines: string[]; lit: { line: number; at: number }[]; marks: (i: number) => Mark[]; accent: string }> = ({ t, lines, lit, marks, accent }) => (
  <pre style={{ margin: 0, fontFamily: FONT.mono, fontSize: 18, lineHeight: 1.5, color: '#cfd6ff' }}>
    {lines.map((l, i) => {
      const on = lit.find((x) => x.line === i && t >= x.at);
      return (
        <div key={i} style={{ minHeight: '1.5em' }}>
          <CodeLine text={l} t={t} litAt={on ? on.at : null} live={!!on} marks={marks(i)} accent={accent} />
        </div>
      );
    })}
  </pre>
);

export const Tasks: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;
  const sendLine = buttonCode.indexOf(SEND_IF);
  const recvLine = ledCodeShort.indexOf(RECV_SHORT);
  const handle = (line: number) => (i: number) => (i === line && t >= S.same ? [{ at: S.same, token: 'press_queue', strong: true }] : []);
  // two presses straight through: one as the send is named, one as "comes out" is said
  const items = [
    { label: '1', in: S.goesIn - 0.2, out: S.goesIn + 0.5 },
    { label: '2', in: S.comesOut - 0.7, out: S.comesOut },
  ];
  const pressT = items.map((i) => i.in - 0.1);
  const down = pressT.some((x) => t >= x && t < x + 0.25) ? 1 : 0;
  const recv = items.map((i) => i.out);
  const blinking = recv.some((r) => t >= r && t < r + 1.5);
  const asleep = t >= S.waits - 0.3 && !blinking ? 1 : 0;
  const W = rowWidth(5) * SCALE;
  return (
    <Shell frames={Math.round(sceneDur('tasks') * FPS)} kicker="The code · both sides at once" captions={S.captions} t={t}>
      <div style={{ position: 'absolute', left: 60, top: 110, width: 880, ...rise(after(t, S.left - 0.3)) }}>
        <Panel label="main/main.c · button_task" accent={C.cyan} right="sends">
          <Code t={t} lines={buttonCode} lit={[{ line: sendLine, at: S.send }]} marks={handle(sendLine)} accent={C.cyan} />
        </Panel>
      </div>
      <div style={{ position: 'absolute', left: 980, top: 110, width: 880, ...rise(after(t, S.right - 0.3)) }}>
        <Panel label="main/main.c · led_task" accent={C.amber} right="receives">
          <Code t={t} lines={ledCodeShort} lit={[{ line: recvLine, at: S.recv }]} marks={handle(recvLine)} accent={C.amber} />
        </Panel>
      </div>
      {/* the same queue, underneath */}
      <div style={{ position: 'absolute', left: 150, top: PIPE_TOP + 4, ...rise(after(t, S.left)) }}>
        <Chip name="button" glow={down} note={down ? 'a press' : undefined} />
      </div>
      <div style={{ position: 'absolute', left: (1920 - W) / 2, top: PIPE_TOP, ...rise(after(t, S.left)) }}>
        <div style={{ transform: `scale(${SCALE})`, transformOrigin: 'top left' }}>
          <QueueRow t={t} items={items} endsP={0.8} />
        </div>
      </div>
      <div style={{ position: 'absolute', left: 1440, top: PIPE_TOP + 4, ...rise(after(t, S.right)) }}>
        <Chip name="led" sleep={asleep} glow={blinking ? 1 : 0} note={asleep ? 'in xQueueReceive' : undefined} />
      </div>
      <div style={{ position: 'absolute', left: 1720, top: PIPE_TOP - 6, ...rise(after(t, S.right)) }}>
        <LedCard pin={2} on={ledLevel(t, recv)} size={70} />
      </div>
      <div style={{ position: 'absolute', left: 0, right: 0, top: PIPE_TOP + 150, textAlign: 'center', ...mono(24, C.amber, { fontWeight: 700 }), opacity: after(t, S.same) }}>
        one queue · <span style={{ color: '#fff' }}>press_queue</span> · named by both tasks
      </div>
    </Shell>
  );
};
