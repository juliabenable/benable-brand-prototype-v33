import { CREW } from './pulseData.js';

/* Harmonized tiles — one anatomy: head (title + meta) · body · closer. */

export function Lead({ scene }) {
  return (
    <div className="cp-lead">
      <h2 className="cp-lead-headline">{scene.headline}</h2>
      <span className="cp-lead-updated">{scene.updated}</span>
    </div>
  );
}

export function RecapTile({ scene }) {
  return (
    <div className="cp-recap-card">
      <div className="cp-recap-head">
        <span className="cp-recap-title">👋 While you were away</span>
        <span className="cp-recap-since">{scene.recap.since}</span>
      </div>
      <div className="cp-recap-body">
        {scene.recap.items.map((it, i) => (
          <div className="cp-recap-item" key={it.bold} style={{ animationDelay: `${0.07 * i}s` }}>
            <span className="cp-recap-emoji">{it.emoji}</span>
            <span className="cp-recap-text"><strong>{it.bold}</strong>{it.rest}</span>
          </div>
        ))}
      </div>
      {scene.recap.closer.clear ? (
        <div className="cp-recap-closer cp-recap-closer--clear">✅ {scene.recap.closer.text}</div>
      ) : (
        <div className="cp-recap-closer">
          <span>{scene.recap.closer.text}</span>
          <button type="button" className="cp-action-cta">{scene.recap.closer.cta}</button>
        </div>
      )}
    </div>
  );
}

export function UpNextTile({ scene }) {
  return (
    <div className="cp-recap-card">
      <div className="cp-recap-head"><span className="cp-recap-title">⏭️ Up next</span></div>
      <div className="cp-recap-body">
        {scene.upNext.map((u, i) => (
          <div className="cp-recap-item" key={u.text} style={{ animationDelay: `${0.07 * i}s` }}>
            <span className="cp-recap-emoji">{u.emoji}</span>
            <span className="cp-recap-text">
              <strong>{u.text}</strong>
              {u.eta && <span className="cp-tile-eta"> — {u.eta}</span>}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

export function PaceTile({ scene }) {
  return (
    <div className="cp-recap-card">
      <div className="cp-recap-head">
        <span className="cp-recap-title">🏁 The pace</span>
        <span className="cp-recap-since">day {scene.day} of 30</span>
      </div>
      <div className="cp-recap-body">
        <div className="cp-race-meta"><span>Your campaign</span><span className="cp-race-day">day {scene.day}</span></div>
        <div className="cp-track"><div className="cp-fill cp-fill--you" style={{ width: `${scene.race.you}%` }} /></div>
        <div className="cp-race-meta"><span>Industry average</span></div>
        <div className="cp-track"><div className="cp-fill cp-fill--them" style={{ width: `${scene.race.them}%` }} /></div>
        <p className="cp-race-caption" dangerouslySetInnerHTML={{ __html: scene.race.caption }} />
      </div>
    </div>
  );
}

/* Appears only once the first creator is live — continuous fill. */
export function LiveBarTile({ scene }) {
  const crew = CREW[scene.day] || [];
  const live = crew.filter((c) => c.stage === 5).length;
  const total = crew.length;
  if (!live) return null;
  return (
    <div className="cp-recap-card">
      <div className="cp-recap-head">
        <span className="cp-recap-title">📣 Creators live</span>
        <span className="cp-recap-since">{live} of {total}</span>
      </div>
      <div className="cp-recap-body">
        <div className="cp-livebar">
          <div className="cp-livebar-fill" style={{ width: `${(live / total) * 100}%` }} />
        </div>
        <p className="cp-livebar-cap">{live === total ? 'Everyone’s live 🎉' : `${total - live} more to come`}</p>
      </div>
    </div>
  );
}
