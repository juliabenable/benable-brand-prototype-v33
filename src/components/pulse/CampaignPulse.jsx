import { useEffect, useRef, useState } from 'react';
import '../../styles/pulse.css';
import {
  VARIANTS, STAGE_LABELS, HUES, PHOTOS, CREW_META, CREW_BANNERS, CREW,
  TIMELINES, CASTING_TIMELINE, DAYS,
} from './pulseData.js';
import LiveStatus from './LiveStatus.jsx';
import { Lead, RecapTile, UpNextTile, PaceTile, LiveBarTile } from './tiles.jsx';
import CrewBar from './crewBar.jsx';
import PipelineBar, { PipelineFilterBar, PipelineFixedBar, PipelineMashBar, PipelineSlabBar, PipelineGradientBar, stageOf } from './pipelineBar.jsx';
import { LabsCrew, LabsRecap, LabsUpNext, LabsPace } from './labs.jsx';
import { AmineProgress, AmineProgress2, AmineTable, AmineRail } from './amine.jsx';

const BAR = { 0: 'band', 6: 'synth', 7: 'faces', 13: 'vitals' };

/*
  Campaign Pulse v28 — the surviving direction only:
    V · Gray + crew — photo crew table left, gray tile stack right
    W · Live bar    — V + continuous creators-live bar (from first live post)
    X · Call fixes  — W + D1 Katie welcome, D3 big review CTA / ready rows /
                      request-more (Julia+Katie call, Jul 23)
  Full A–W exploration archived in benable-brand-prototype-v27.
*/

// Survive captured-DOM remounts.
let persistedIdx = 2; // open on Day 9 — the dead middle is the thesis
let persistedVariant = 'A';

export default function CampaignPulse() {
  const [idx, setIdx] = useState(persistedIdx);
  const [variant, setVariant] = useState(
    VARIANTS.some((v) => v.key === persistedVariant) ? persistedVariant : 'A',
  );
  const [openCrew, setOpenCrew] = useState(() => new Set());
  const [stageFilter, setStageFilter] = useState(null);
  const rootRef = useRef(null);
  const scene = DAYS[idx];

  useEffect(() => { persistedIdx = idx; }, [idx]);
  useEffect(() => { persistedVariant = variant; }, [variant]);
  useEffect(() => { setStageFilter(null); }, [idx, variant]);

  const toggleCrew = (k) =>
    setOpenCrew((prev) => {
      const next = new Set(prev);
      if (next.has(k)) next.delete(k); else next.add(k);
      return next;
    });

  // The crew view replaces the Dashboard tab's own content.
  useEffect(() => {
    const wrap = rootRef.current?.parentElement;
    const column = wrap?.classList.contains('cp-host') ? wrap.parentElement : wrap;
    if (!column) return undefined;
    column.classList.add('cp-crew-mode');
    return () => column.classList.remove('cp-crew-mode');
  }, []);

  // Y · Labs skin: grey #f9fafb fills the whole pane below the tabs (the
  // stage shell, full-bleed to the sidebar); the tabs strip stays white.
  useEffect(() => {
    const wrap = rootRef.current?.parentElement;
    const column = wrap?.classList.contains('cp-host') ? wrap.parentElement : wrap;
    const pane = column?.parentElement;
    if (!column || !['Y', 'Z', 'A', 'B', 'C'].includes(variant)) return undefined;
    column.classList.add('cp-crew-mode--labs');
    pane?.classList.add('cp-labs-pane');
    return () => {
      column.classList.remove('cp-crew-mode--labs');
      pane?.classList.remove('cp-labs-pane');
    };
  }, [variant]);

  useEffect(() => {
    const onKey = (e) => {
      if (e.target.closest?.('input, textarea')) return;
      if (e.key === 'ArrowRight') setIdx((i) => Math.min(i + 1, DAYS.length - 1));
      if (e.key === 'ArrowLeft') setIdx((i) => Math.max(i - 1, 0));
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  const banner = CREW_BANNERS[scene.day];
  const callMode = ['X', 'P', 'Q', 'R', 'S', 'T', 'U', 'Y', 'Z', 'A', 'B', 'C'].includes(variant) || !!BAR[variant];
  const crewRows = (CREW[scene.day] || []).filter((c) => {
    if (!['Q', 'S', 'T', 'U', 'Y', 'Z', 'A', 'B', 'C'].includes(variant) || stageFilter == null) return true;
    if (stageFilter === 'casting') return !!c.mystery;
    if (stageFilter === 'needs') return !c.mystery && (!!c.action || scene.day === 3);
    return !c.mystery && stageOf(c, scene.day) === stageFilter;
  });

  return (
    <div className={`cp-root cp-root--${variant.toLowerCase()}`} ref={rootRef}>
      <div className="cp-crew" key={`${variant}-${scene.day}`}>
        <Lead scene={scene} />
      </div>
      {BAR[variant] && <CrewBar mode={BAR[variant]} scene={scene} ready={scene.day === 3} />}
      {variant === 'P' && <PipelineBar scene={scene} />}
      {variant === 'Q' && <PipelineFilterBar scene={scene} filter={stageFilter} onFilter={setStageFilter} />}
      {variant === 'R' && <PipelineFixedBar scene={scene} />}
      {variant === 'S' && <PipelineMashBar scene={scene} filter={stageFilter} onFilter={setStageFilter} />}
      {variant === 'T' && <PipelineSlabBar scene={scene} filter={stageFilter} onFilter={setStageFilter} />}
      {variant === 'U' && <PipelineSlabBar scene={scene} filter={stageFilter} onFilter={setStageFilter} palette="green" seeall />}
      {variant === 'Y' && <PipelineSlabBar scene={scene} filter={stageFilter} onFilter={setStageFilter} palette="green" seeall />}
      {variant === 'Z' && <PipelineGradientBar scene={scene} filter={stageFilter} onFilter={setStageFilter} />}
      {variant === 'A' && <AmineProgress scene={scene} filter={stageFilter} onFilter={setStageFilter} />}
      {['B', 'C'].includes(variant) && <AmineProgress2 scene={scene} filter={stageFilter} onFilter={setStageFilter} />}
      <div className="cp-crew2" key={`b-${variant}-${scene.day}`}>
        <div className="cp-crew-cols cp-crew-cols--left">
          <div className="cp-crew-left">
            {banner && variant !== 'C' && (
              <div className={`cp-crew-banner cp-crew-banner--${banner.tone}`}>
                <span className="cp-crew-banner-dot" />
                <span className="cp-crew-banner-text">{banner.text}</span>
                {callMode && scene.day === 3 && (
                  <button type="button" className="cp-action-cta cp-banner-cta">Review 6 creators →</button>
                )}
              </div>
            )}
            {callMode && scene.day === 1 && (
              <div className="cp-katie-card" style={{ marginBottom: 16 }}>
                <div className="cp-katie">K</div>
                <div>
                  <div className="cp-katie-note">“Welcome in! My team is out casting your crew right now — your first picks land in about two days.”</div>
                  <div className="cp-katie-byline">Katie · for your Benable team</div>
                </div>
              </div>
            )}
            {['A', 'B', 'C'].includes(variant) ? (
              <AmineTable
                scene={scene}
                rows={crewRows}
                filter={stageFilter}
                onFilter={setStageFilter}
                openCrew={openCrew}
                toggleCrew={toggleCrew}
              />
            ) : ['Y', 'Z'].includes(variant) ? (
              <LabsCrew rows={crewRows} day={scene.day} openCrew={openCrew} toggleCrew={toggleCrew} />
            ) : (<>
            <div className="cp-crew-card">
              {crewRows.map((c, i) => {
                const meta = CREW_META[c.name];
                const rowKey = `${scene.day}-${c.name}-${i}`;
                const open = openCrew.has(rowKey);
                const timeline = c.mystery ? CASTING_TIMELINE : TIMELINES[c.name] || [];
                const ready = callMode && scene.day === 3 && !c.mystery;
                return (
                  <div key={rowKey} className={c.action ? 'cp-crew-item cp-crew-item--action' : ready ? 'cp-crew-item cp-crew-item--ready' : 'cp-crew-item'}>
                    <button type="button" className="cp-crew-row" style={{ animationDelay: `${0.05 * i}s` }} onClick={() => toggleCrew(rowKey)}>
                      {!c.mystery && PHOTOS[c.name] ? (
                        <div className="cp-crew-avatar cp-crew-avatar--photo"><img src={PHOTOS[c.name]} alt={c.name} /></div>
                      ) : (
                        <div className={c.mystery ? 'cp-crew-avatar cp-crew-avatar--mystery' : 'cp-crew-avatar'} style={c.mystery ? {} : { background: HUES[c.name] }}>
                          {c.mystery ? '?' : c.name[0]}
                        </div>
                      )}
                      <div className="cp-crew-main">
                        <div className="cp-crew-toprow">
                          <span className="cp-crew-name">{c.handle || c.name}</span>
                          {meta && <span className="cp-crew-meta">{meta.fol} · {meta.plat}</span>}
                        </div>
                        <div className="cp-crew-statusline"><LiveStatus status={c.status} /></div>
                      </div>
                      {c.action && (
                        <span className="cp-action-cta" role="button" onClick={(e) => e.stopPropagation()}>{c.action.cta}</span>
                      )}
                      <div className="cp-crew-right">
                        <div className="cp-bars">
                          {STAGE_LABELS.map((s, si) => (
                            <span key={s} title={s} className={si < c.stage ? 'cp-bar cp-bar--done' : si === c.stage ? 'cp-bar cp-bar--now' : 'cp-bar'} />
                          ))}
                        </div>
                        <span className={ready ? 'cp-crew-stagelabel cp-crew-stagelabel--ready' : 'cp-crew-stagelabel'}>
                          {ready ? '● Ready to review' : c.mystery ? 'Sourcing' : STAGE_LABELS[c.stage]}
                        </span>
                      </div>
                      <span className={open ? 'cp-caret cp-caret--open' : 'cp-caret'}>▸</span>
                    </button>
                    {open && (
                      <div className="cp-crew-history">
                        {timeline.map((st, si) => {
                          const state = c.mystery
                            ? (st.live ? 'now' : st.when ? 'done' : 'next')
                            : si < c.stage ? 'done' : si === c.stage ? 'now' : 'next';
                          return (
                            <div key={si} className={`cp-hist-step cp-hist-step--${state}`} style={{ animationDelay: `${0.05 * si}s` }}>
                              <span className="cp-hist-dot">{state === 'done' ? '✓' : ''}</span>
                              <div className="cp-hist-body">
                                <div className="cp-hist-top">
                                  <span className="cp-hist-label">{c.mystery ? st.label : STAGE_LABELS[si]}</span>
                                  <span className="cp-hist-when">{state === 'done' ? (st.when || 'done') : state === 'now' ? 'right now' : (st.eta || 'up next')}</span>
                                </div>
                                <div className="cp-hist-detail">{st.detail}</div>
                                {state === 'now' && <div className="cp-hist-live"><LiveStatus status={c.status} /></div>}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
              {callMode && scene.day === 3 && (
                <button type="button" className="cp-request-more">
                  ＋ Request more creators
                  <span className="cp-request-more-sub"> — tell us what to tweak and we’ll re-match</span>
                </button>
              )}
            </div>
            <div className="cp-crew-legend">{STAGE_LABELS.join(' · ')}</div>
            </>)}
          </div>

          <aside className="cp-tile-stack cp-tile-stack--gray">
            {['A', 'B', 'C'].includes(variant) ? (
              <AmineRail scene={scene} />
            ) : ['Y', 'Z'].includes(variant) ? (
              <>
                <LabsRecap scene={scene} />
                <LabsUpNext scene={scene} />
                <LabsPace scene={scene} />
              </>
            ) : (
              <>
                {(variant === 'W' || (callMode && variant !== '13')) && <LiveBarTile scene={scene} />}
                <RecapTile scene={scene} />
                <UpNextTile scene={scene} />
                <PaceTile scene={scene} />
              </>
            )}
          </aside>
        </div>
      </div>

      {/* demo scrubber — presenter control, not product UI */}
      <nav className="cp-scrubber" aria-label="Demo controls">
        <span className="cp-scrub-tag">PULSE DEMO</span>
        <button type="button" className="cp-scrub-arrow" disabled={idx === 0} onClick={() => setIdx(idx - 1)}>←</button>
        {DAYS.map((d, i) => (
          <button type="button" key={d.day} className={i === idx ? 'cp-scrub-day cp-scrub-day--active' : 'cp-scrub-day'} onClick={() => setIdx(i)}>
            {i === idx ? d.scrubLabel : `D${d.day}`}
          </button>
        ))}
        <button type="button" className="cp-scrub-arrow" disabled={idx === DAYS.length - 1} onClick={() => setIdx(idx + 1)}>→</button>
        <span className="cp-scrub-sep" />
        <span className="cp-scrub-tag">STYLE</span>
        {VARIANTS.map((v) => (
          <button type="button" key={v.key} title={v.name} className={variant === v.key ? 'cp-scrub-day cp-scrub-day--active' : 'cp-scrub-day'} onClick={() => setVariant(v.key)}>
            {variant === v.key ? `${v.key} · ${v.name}` : v.key}
          </button>
        ))}
      </nav>
    </div>
  );
}
