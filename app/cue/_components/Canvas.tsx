'use client';

import * as React from 'react';
import { CUE } from './tokens';

export function CueGlobalStyles() {
  return (
    <>
      <link
        rel="stylesheet"
        href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Instrument+Serif:ital@0;1&family=JetBrains+Mono:wght@400;500&display=swap"
      />
      <style>{`
        .cue * { box-sizing: border-box; }
        .cue { font-family: ${CUE.sans}; -webkit-font-smoothing: antialiased; color: ${CUE.ink}; }
        .cue button { font-family: inherit; cursor: pointer; border: none; background: none; color: inherit; padding: 0; }
        .cue input, .cue textarea { font-family: inherit; color: inherit; background: transparent; border: none; outline: none; }
        .cue ::-webkit-scrollbar { display: none; }
        .cue { scrollbar-width: none; }
        @keyframes cue-pulse { 0%,100% { opacity: 1 } 50% { opacity: 0.4 } }
        @keyframes cue-fadein { from { opacity: 0; transform: translateY(4px) } to { opacity: 1; transform: none } }
        @keyframes cue-slideup { from { opacity: 0; transform: translateY(12px) } to { opacity: 1; transform: none } }

        .cue-canvas { background: #1a1a17; min-height: 100vh; color: ${CUE.ink}; font-family: ${CUE.sans}; padding: 48px 32px 80px; }
        .cue-canvas-header { max-width: 1400px; margin: 0 auto 48px; }
        .cue-canvas h1 { font-family: ${CUE.serif}; font-style: italic; font-size: 48px; line-height: 1; letter-spacing: -1px; margin: 0; }
        .cue-canvas .eyebrow { font-size: 11px; letter-spacing: 1.6px; color: ${CUE.ink3}; text-transform: uppercase; margin-bottom: 12px; }
        .cue-canvas .sub { color: ${CUE.ink2}; font-size: 15px; line-height: 1.6; max-width: 720px; margin-top: 14px; }
        .cue-section { max-width: 1400px; margin: 0 auto 64px; }
        .cue-section-header { margin-bottom: 24px; }
        .cue-section-header .label { font-family: ${CUE.mono}; font-size: 11px; color: ${CUE.ink3}; letter-spacing: 1.4px; text-transform: uppercase; }
        .cue-section-header .title { font-family: ${CUE.serif}; font-style: italic; font-size: 32px; letter-spacing: -0.6px; margin-top: 6px; }
        .cue-section-header .desc { color: ${CUE.ink2}; font-size: 13px; margin-top: 6px; max-width: 640px; }
        .cue-board-row { display: flex; gap: 32px; flex-wrap: wrap; align-items: flex-start; }
        .cue-board { display: flex; flex-direction: column; gap: 10px; }
        .cue-board .label { font-family: ${CUE.mono}; font-size: 10px; color: ${CUE.ink3}; letter-spacing: 1.2px; text-transform: uppercase; }
        .cue-board .frame { box-shadow: 0 30px 80px rgba(0,0,0,0.55), 0 0 0 1px rgba(255,250,235,0.06); border-radius: 38px; overflow: hidden; }
        .cue-board.web .frame { border-radius: 12px; }
      `}</style>
    </>
  );
}

export function Section({
  id,
  label,
  title,
  desc,
  children,
}: {
  id: string;
  label: string;
  title: string;
  desc?: string;
  children: React.ReactNode;
}) {
  return (
    <section id={id} className="cue-section">
      <header className="cue-section-header">
        <div className="label">{label}</div>
        <div className="title">{title}</div>
        {desc && <div className="desc">{desc}</div>}
      </header>
      <div className="cue-board-row">{children}</div>
    </section>
  );
}

export function Board({
  label,
  variant = 'mobile',
  children,
}: {
  label: string;
  variant?: 'mobile' | 'web';
  children: React.ReactNode;
}) {
  return (
    <div className={`cue-board ${variant}`}>
      <div className="label">{label}</div>
      <div className="frame">{children}</div>
    </div>
  );
}
