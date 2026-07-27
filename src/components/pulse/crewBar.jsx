import { CREW, PHOTOS, STAGE_LABELS, PCT, FCAST } from './pulseData.js';

/* buckets: rows needing the brand pull out into an amber "Awaiting you"
   bucket; casting slots render as a dashed ghost; the rest sit in their
   stage bucket on the pale→deep green ramp. */
function buckets(scene, ready) {
  const crew = CREW[scene.day] || [];
  const g = { ghost: [], act: [], stages: STAGE_LABELS.map(() => []) };
  crew.forEach((c) => {
    if (c.mystery) g.ghost.push(c);
    else if (c.action || ready) g.act.push(c);
    else g.stages[c.stage].push(c);
  });
  return g;
}

/* daily ops intensity, one value per campaign day (demo data) */
const INTENSITY = [2, 4, 3, 1, 2, 1, 3, 2, 4, 1, 1, 2, 3, 2, 5, 4, 2, 3, 1, 2, 4, 5, 3, 2, 1, 2, 3, 2, 4, 5];
const THINGS = { 1: 12, 3: 31, 9: 38, 16: 47, 22: 52, 30: 61 };

export default function CrewBar({ mode, scene, ready }) {
  const g = buckets(scene, ready);
  const segs = [];
  if (g.ghost.length) segs.push({ cls: 'cb-ghost', n: g.ghost.length, label: 'Casting…', rows: g.ghost });
  g.stages.forEach((rows, i) => {
    if (rows.length) segs.push({ cls: `cb-g${i}`, n: rows.length, label: STAGE_LABELS[i], rows });
  });
  if (g.act.length) segs.push({ cls: 'cb-amber', n: g.act.length, label: 'Awaiting you', rows: g.act });
  const total = segs.reduce((a, s) => a + s.n, 0) || 1;

  return (
    <div className={`cb cb--${mode}`}>
      {mode === 'synth' && (
        <div className="cb-top">
          <span className="cb-pct">{PCT[scene.day]}</span>
          <span className="cb-pct-label">complete</span>
          <span className="cb-fcast">{FCAST[scene.day]}</span>
        </div>
      )}
      <div className={mode === 'faces' ? 'cb-band cb-band--faces' : 'cb-band'}>
        {segs.map((s) => (
          <div key={s.label} className={`cb-seg ${s.cls}`} style={{ flexGrow: s.n / total }} title={`${s.n} ${s.label}`}>
            {mode === 'faces'
              ? s.rows.map((c, i) => (c.mystery || !PHOTOS[c.name]
                  ? <span key={i} className="cb-face cb-face--ghost">?</span>
                  : <img key={i} className="cb-face" src={PHOTOS[c.name]} alt={c.name} />))
              : <span className="cb-count">{s.n} {mode === 'band' ? s.label.toLowerCase() : ''}</span>}
          </div>
        ))}
      </div>
      {mode === 'vitals' && (
        <>
          <div className="cb-garden">
            {INTENSITY.map((v, i) => {
              const past = i < scene.day;
              const cls = past ? `cb-cell cb-c${v}` : 'cb-cell';
              return <i key={i} className={i === scene.day - 1 ? `${cls} cb-today` : cls} />;
            })}
          </div>
          <div className="cb-caption">
            {segs.map((s2, i) => (
              <span key={s2.label} className={s2.cls === 'cb-amber' ? 'cb-cap-amber' : ''}>
                {i > 0 && ' · '}{s2.n} {s2.label.toLowerCase()}
              </span>
            ))}
            {' · '}{THINGS[scene.day]} things done so far · day {scene.day} of 30
          </div>
        </>
      )}
      {mode !== 'band' && mode !== 'vitals' && (
        <div className="cb-axis">
          {segs.map((s) => (
            <div key={s.label} className="cb-axis-item" style={{ flexGrow: s.n / total }}>
              <b className={s.cls === 'cb-amber' ? 'cb-axis-amber' : ''}>{s.n}</b>
              <span>{s.label}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
