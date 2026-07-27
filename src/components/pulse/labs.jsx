import { PHOTOS, HUES, STAGE_LABELS, TIMELINES, CASTING_TIMELINE } from './pulseData.js';
import LiveStatus from './LiveStatus.jsx';

/* Y · Labs skin — Figma "Design Labs" 11603-48887. U's tracking bar stays;
   everything below follows the Figma card system: page bg #f9fafb, white
   cards w/ #e3e3e3 borders + 12px radius, icon-chip headers (#f5f3fc),
   a real Creators table (CREATOR / LATEST UPDATE / STAGE columns, verified
   badge #0c8ee9), and restyled While-you-were-away / Up next / The pace. */

function Head({ icon, title, sub, divider }) {
  return (
    <div className={divider ? 'lb-head lb-head--div' : 'lb-head'}>
      <span className="lb-chip">{icon}</span>
      <div>
        <div className="lb-title">{title}</div>
        {sub && <div className="lb-sub">{sub}</div>}
      </div>
    </div>
  );
}

export function LabsCrew({ rows, day, openCrew, toggleCrew }) {
  return (
    <div className="lb-card">
      <Head icon="👥" title="Creators" sub={`${rows.length} creator${rows.length === 1 ? '' : 's'}`} />
      <div className="lb-cols">
        <span>Creator</span><span>Latest update</span><span>Stage</span><span />
      </div>
      {rows.map((c, i) => {
        const rowKey = `${day}-${c.name}-${i}`;
        const open = openCrew.has(rowKey);
        const timeline = c.mystery ? CASTING_TIMELINE : TIMELINES[c.name] || [];
        return (
          <div key={rowKey} className="lb-item">
            <button type="button" className="lb-row" onClick={() => toggleCrew(rowKey)}>
              <div className="lb-who">
                {!c.mystery && PHOTOS[c.name] ? (
                  <div className="cp-crew-avatar cp-crew-avatar--photo lb-avatar"><img src={PHOTOS[c.name]} alt={c.name} /></div>
                ) : (
                  <div className={c.mystery ? 'cp-crew-avatar cp-crew-avatar--mystery lb-avatar' : 'cp-crew-avatar lb-avatar'} style={c.mystery ? {} : { background: HUES[c.name] }}>
                    {c.mystery ? '?' : c.name[0]}
                  </div>
                )}
                <div className="lb-names">
                  <div className="lb-name">{c.name}{!c.mystery && <i className="lb-verified">✓</i>}</div>
                  <div className="lb-handle">{c.mystery ? 'sourcing now' : c.handle}</div>
                </div>
              </div>
              <div className="lb-update"><LiveStatus status={c.status} /></div>
              <div className="lb-bars">
                {STAGE_LABELS.map((s, si) => (
                  <span key={s} title={s} className={c.mystery ? 'lb-bar' : si < c.stage ? 'lb-bar lb-bar--done' : si === c.stage ? 'lb-bar lb-bar--now' : 'lb-bar'} />
                ))}
              </div>
              <span className={open ? 'lb-chev lb-chev--open' : 'lb-chev'}>⌄</span>
            </button>
            {open && (
              <div className="cp-crew-history lb-history">
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
      <button type="button" className="lb-more">＋ Request more</button>
    </div>
  );
}

export function LabsRecap({ scene }) {
  const { recap } = scene;
  return (
    <div className="lb-card">
      <Head icon="✦" title="While you were away" sub={`Since, ${recap.since.replace(/^since /, '')}`} divider />
      <div className="lb-list">
        {recap.items.map((it, i) => (
          <div key={i} className="lb-li">
            <span className="lb-li-emoji">{it.emoji}</span>
            <p><strong>{it.bold}</strong>{it.rest}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export function LabsUpNext({ scene }) {
  return (
    <div className="lb-card">
      <Head icon="✦" title="Up next" divider />
      <div className="lb-list">
        {scene.upNext.map((u, i) => (
          <div key={i} className="lb-li">
            <span className="lb-li-emoji">{u.emoji}</span>
            <p><strong>{u.text}</strong> <span className="lb-eta">— {u.eta}</span></p>
          </div>
        ))}
      </div>
    </div>
  );
}

export function LabsPace({ scene }) {
  const { race } = scene;
  return (
    <div className="lb-card">
      <Head icon="📈" title="The pace" sub={`Day ${scene.day} out of 30`} divider />
      <div className="lb-race">
        <div className="lb-race-row"><span>Your campaign</span><span className="lb-race-day">Day {scene.day}</span></div>
        <div className="lb-track"><i className="lb-fill lb-fill--you" style={{ width: `${race.you}%` }} /></div>
        <div className="lb-race-row"><span>Industry average</span></div>
        <div className="lb-track"><i className="lb-fill lb-fill--them" style={{ width: `${race.them}%` }} /></div>
        <div className="lb-pill" dangerouslySetInnerHTML={{ __html: race.caption }} />
      </div>
    </div>
  );
}
