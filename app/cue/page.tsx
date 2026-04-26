import * as React from 'react';
import type { Metadata } from 'next';
import { CueGlobalStyles, Section, Board } from './_components/Canvas';
import { MobileFeed } from './_components/MobileFeed';
import { MobileProfile } from './_components/MobileProfile';
import { MobileInbox } from './_components/MobileInbox';
import { MobileProjectDetail } from './_components/MobileProjectDetail';
import { MobileRoster } from './_components/MobileRoster';
import { WebClientDash } from './_components/WebClientDash';
import { WebProjectDetail } from './_components/WebProjectDetail';

export const metadata: Metadata = {
  title: 'Cue · Dancers Platform',
  description:
    'K-pop dance industry — casting, crew, and project flow. Mobile for dancers/choreographers, Web for clients.',
};

export default function CueDesignShowcase() {
  return (
    <>
      <CueGlobalStyles />
      <main className="cue-canvas">
        <header className="cue-canvas-header">
          <div className="eyebrow">Design Handoff · Cue</div>
          <h1>
            Cue<span style={{ color: '#D9FF3C' }}>.</span> Dancers Platform
          </h1>
          <p className="sub">
            K-pop dance industry — casting, crew &amp; project flow. Mobile (dark) for dancers and
            choreographers in the studio. Web (light) for clients and multi-project management.
          </p>
        </header>

        <Section
          id="mobile"
          label="01 · MOBILE"
          title="Dancers & Choreographers"
          desc="Dark, photo-forward. Used in studio, on set, between calls."
        >
          <Board label="01 · Casting feed">
            <MobileFeed />
          </Board>
          <Board label="02 · Dancer profile">
            <MobileProfile />
          </Board>
          <Board label="03 · Inbox · received & sent offers">
            <MobileInbox />
          </Board>
          <Board label="04 · Project · subprojects timeline">
            <MobileProjectDetail />
          </Board>
          <Board label="05 · Choreographer · roster & applicants">
            <MobileRoster />
          </Board>
        </Section>

        <Section
          id="web"
          label="02 · WEB"
          title="Clients & Choreographer workspace"
          desc="Light, dense, multi-project. Tables, calendars, side-by-side negotiation."
        >
          <Board label="06 · Client dashboard · projects across productions" variant="web">
            <WebClientDash />
          </Board>
          <Board label="07 · Project detail · subprojects + roster + pay negotiation" variant="web">
            <WebProjectDetail />
          </Board>
        </Section>
      </main>
    </>
  );
}
