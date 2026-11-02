/**
 * 1 · THE PROBLEM
 * "Say you want to dim a light. Or change the pitch of a sound."
 * "But an ESP32 pin is digital. 3.3 V, or zero. Nothing in between."
 * "So how do you get something in between?"
 */
import React from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from 'remotion';
import { EASE_OUT } from '../../components/anim';
import { CaptionLine } from '../../components/CodeToHardware';
import { Led, Slider, Speaker } from '../../components/Gadgets';
import { Panel } from '../../components/Panel';
import { Kicker, Scene } from '../../components/Type';
import { C, FONT, hexA } from '../../theme/palette';
import { PROBLEM as P, sceneDur, FPS } from './timeline';

const clamp01 = (x: number) => Math.min(1, Math.max(0, x));
/** eased 0..1 between a and b (seconds) */
const span = (t: number, a: number, b: number) => EASE_OUT(clamp01((t - a) / (b - a)));
const smooth = (t: number, a: number, b: number) => {
  const u = clamp01((t - a) / (b - a));
  return u * u * (3 - 2 * u);
};

export const Problem: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;

  // phase A — the wish
  const aIn = span(t, P.cardsIn, P.cardsIn + 0.7);
  const aOut = span(t, P.pinIn - 0.2, P.pinIn + 0.3);
  const dim = 1 - 0.78 * smooth(t, P.dim[0], P.dim[1]);
  const glide = smooth(t, P.pitch[0], P.pitch[1]);
  const hz = Math.round(P.pitchHz[0] * (P.pitchHz[1] / P.pitchHz[0]) ** glide);
  const sounding =
    clamp01((t - (P.pitch[0] - 0.2)) / 0.2) * (1 - clamp01((t - (P.pitch[1] + 0.2)) / 0.3));

  // phase B — the pin
  const bIn = span(t, P.pinIn, P.pinIn + 0.6);
  const high = t >= P.high && t < P.low;
  const mid = span(t, P.tryMid, P.tryMid + 0.45);
  const rejected = t >= P.reject;
  const shake = rejected ? Math.sin((t - P.reject) * 70) * 14 * Math.exp(-(t - P.reject) * 6) : 0;
  const ghostFade = rejected ? 1 - clamp01((t - P.reject - 0.7) / 0.5) : 1;

  return (
    <Scene durationInFrames={Math.round(sceneDur('problem') * FPS)}>
      <AbsoluteFill style={{ display: 'grid', placeItems: 'center' }}>
        <div style={{ position: 'absolute', top: 120, width: '100%', display: 'grid', placeItems: 'center' }}>
          <Kicker delay={0.1} accent="amber">
            The problem
          </Kicker>
        </div>

        {/* ── A: what we want ─────────────────────── */}
        {aOut < 1 && (
          <AbsoluteFill style={{ display: 'grid', placeItems: 'center', paddingTop: 60 }}>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '640px 640px',
              gap: 60,
              opacity: aIn * (1 - aOut),
              transform: `translateY(${(1 - aIn) * 30 - aOut * 40}px) scale(${1 - aOut * 0.04})`,
            }}
          >
            <Panel label="dim a light" accent={C.amber} style={{ height: 470 }}>
              <div style={{ display: 'grid', placeItems: 'center', gap: 26, paddingTop: 10 }}>
                <Led brightness={dim} size={220} />
                <Slider value={dim} width={440} accent={C.amber} left="off" right="full" />
                <Readout color={C.amber}>{Math.round(dim * 100)}%</Readout>
              </div>
            </Panel>
            <Panel label="change a sound" accent={C.cyan} style={{ height: 470 }}>
              <div style={{ display: 'grid', placeItems: 'center', gap: 26, paddingTop: 10 }}>
                <div style={{ width: 220, height: 220, display: 'grid', placeItems: 'center' }}>
                  <Speaker hz={hz} level={sounding} t={t} size={200} />
                </div>
                <Slider value={0.25 + 0.5 * glide} width={440} accent={C.cyan} left="low" right="high" />
                <Readout color={C.cyan}>{hz} Hz</Readout>
              </div>
            </Panel>
          </div>
          </AbsoluteFill>
        )}

        {/* ── B: what a pin can do ─────────────────── */}
        {bIn > 0 && (
          <AbsoluteFill style={{ display: 'grid', placeItems: 'center', paddingTop: 110 }}>
          <div
            style={{
              opacity: bIn,
              transform: `translateY(${(1 - bIn) * 30}px)`,
              display: 'grid',
              placeItems: 'center',
              gap: 40,
            }}
          >
            <Panel label="ESP32 · GPIO 2" accent={C.magenta} style={{ width: 1100, height: 420 }}>
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 260px',
                  alignItems: 'center',
                  height: '100%',
                  paddingBottom: 20,
                }}
              >
                <div style={{ display: 'grid', gap: 46, justifyItems: 'center' }}>
                  <div
                    style={{
                      display: 'flex',
                      gap: 26,
                      alignItems: 'center',
                      transform: `translateX(${shake}px)`,
                    }}
                  >
                    <Pill label="0 V" on={!high} color={C.cyan} />
                    <MidPill progress={mid} rejected={rejected} fade={ghostFade} />
                    <Pill label="3.3 V" on={high} color={C.amber} />
                  </div>
                  <div style={{ fontSize: 28, color: C.muted, height: 36 }}>
                    {rejected ? (
                      <span style={{ color: '#ff5470' }}>
                        ✕ a digital pin has no "in between"
                      </span>
                    ) : t >= P.high - 0.2 ? (
                      'digital: one or the other'
                    ) : null}
                  </div>
                </div>
                <div style={{ display: 'grid', placeItems: 'center' }}>
                  <Led brightness={high ? 1 : 0} size={220} />
                </div>
              </div>
            </Panel>
            <div style={{ height: 80, display: 'grid', placeItems: 'center' }}>
              <CaptionLine captions={[{ at: P.question, text: 'So how do you get something in between?' }]} t={t} size={44} />
            </div>
          </div>
          </AbsoluteFill>
        )}
      </AbsoluteFill>
    </Scene>
  );
};

const Readout: React.FC<{ children: React.ReactNode; color: string }> = ({ children, color }) => (
  <div
    style={{
      fontFamily: FONT.mono,
      fontSize: 38,
      color,
      textShadow: `0 0 18px ${hexA(color, 0.6)}`,
      fontVariantNumeric: 'tabular-nums',
    }}
  >
    {children}
  </div>
);

const Pill: React.FC<{ label: string; on: boolean; color: string }> = ({ label, on, color }) => (
  <div
    style={{
      width: 200,
      padding: '22px 0',
      textAlign: 'center',
      borderRadius: 18,
      fontFamily: FONT.mono,
      fontSize: 46,
      fontWeight: 700,
      color: on ? '#fff' : hexA('#ffffff', 0.3),
      background: on ? hexA(color, 0.28) : 'rgba(255,255,255,.04)',
      border: `2px solid ${on ? color : 'rgba(255,255,255,.12)'}`,
      boxShadow: on ? `0 0 40px ${hexA(color, 0.55)}, inset 0 0 24px ${hexA(color, 0.3)}` : 'none',
      textShadow: on ? `0 0 16px ${color}` : 'none',
    }}
  >
    {label}
  </div>
);

/** the value we'd like — 1.65 V — slides in, then gets struck out */
const MidPill: React.FC<{ progress: number; rejected: boolean; fade: number }> = ({
  progress,
  rejected,
  fade,
}) => {
  const red = '#ff5470';
  return (
    <div
      style={{
        position: 'relative',
        width: 200,
        padding: '22px 0',
        textAlign: 'center',
        borderRadius: 18,
        fontFamily: FONT.mono,
        fontSize: 46,
        fontWeight: 700,
        border: `2px dashed ${rejected ? red : hexA('#ffffff', 0.35)}`,
        color: rejected ? red : hexA('#ffffff', 0.75),
        opacity: progress * (rejected ? Math.max(fade, 0.35) : 1),
        transform: `translateY(${(1 - progress) * -40}px)`,
      }}
    >
      1.65 V
      {rejected && (
        <div
          style={{
            position: 'absolute',
            left: 14,
            right: 14,
            top: '50%',
            height: 4,
            background: red,
            boxShadow: `0 0 12px ${red}`,
            transform: 'rotate(-12deg)',
          }}
        />
      )}
    </div>
  );
};
