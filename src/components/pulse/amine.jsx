import { CREW, PCT, FCAST, PHOTOS, TIMELINES, CASTING_TIMELINE, STAGE_LABELS } from './pulseData.js';
import { stageOf } from './pipelineBar.jsx';
import LiveStatus from './LiveStatus.jsx';
import { RecapTile } from './tiles.jsx';

/* A · Amine — the designer's cohort-funnel page (benable-cohort-funnel repo,
   Figma 11603:48887) rebuilt on v32's states: DAYS scrubber, CREW rows,
   LiveStatus registers, banners and stage filtering all stay; every visual
   value below is lifted from Amine's build (see its NOTES.md).
   Casting has no place in his 7-stage funnel, so it renders as a leading
   hatched block — his "Exited" treatment, mirrored to the start. */

const B = import.meta.env.BASE_URL;
const AIC = {
  group: `${B}labs/group.svg`,
  invites: `${B}labs/invites.svg`,
  insight: `${B}labs/insight.svg`,
  plus: `${B}labs/plus.svg`,
  chevron: `${B}labs/chevron.svg`,
  check: `${B}labs/check-circle.svg`,
  dotAll: `${B}labs/dot-all.svg`,
  paceStrip: `${B}labs/pace-strip.jpg`,
};

/* Amine's 7-stage ramp — stages 1-4 Figma-exact, 5-7 his extrapolation;
   ink clears 4.5:1 on every fill (his contrast fix). */
export const AM_STAGES = [
  { label: 'Invited', fill: '#d8efe2', ink: '#06301f', off: 'invites go out on approval' },
  { label: 'Accepted', fill: '#b2e0c7', ink: '#06301f', off: 'as invites are accepted' },
  { label: 'Order placed', fill: '#7ac299', ink: '#06301f', off: 'after orders are placed' },
  { label: 'Order received', fill: '#4da673', ink: '#06301f', off: 'once packages land' },
  { label: 'Draft submitted', fill: '#1f7a50', ink: '#ffffff', off: 'after filming' },
  { label: 'Content published', fill: '#14603d', ink: '#ffffff', off: 'after our checks' },
  { label: 'Thanked', fill: '#0d4830', ink: '#ffffff', off: 'after posts go live' },
];

/* One derivation for the whole page, from CREW — bar, chips and table agree. */
export function amFunnel(scene) {
  const rows = CREW[scene.day] || [];
  const named = rows.filter((c) => !c.mystery);
  const casting = rows.length - named.length;
  const ready = scene.day === 3;

  const counts = AM_STAGES.map(() => 0);
  const needs = AM_STAGES.map(() => 0);
  const who = AM_STAGES.map(() => []);
  named.forEach((c) => {
    const s = stageOf(c, scene.day);
    counts[s] += 1;
    who[s].push(c.name);
    if (c.action) needs[s] += 1;
  });
  if (ready) needs[0] = counts[0]; // the whole shortlist waits on the brand

  const reached = (i) => named.filter((c) => stageOf(c, scene.day) >= i).length;
  return { rows, named, casting, counts, needs, who, reached, flagged: needs.reduce((a, b) => a + b, 0) };
}

function Tip({ title, summary, rows }) {
  return (
    <span className="am-tip" role="tooltip">
      <b className="am-tip-title">{title}</b>
      <span className="am-tip-sub">{summary}</span>
      {rows && rows.length > 0 && (
        <>
          <i className="am-tip-rule" />
          <span className="am-tip-rows">
            {rows.map((r) => <span key={r}>{r}</span>)}
          </span>
        </>
      )}
    </span>
  );
}

/* ---- stat row: "Your campaign progress N%" + schedule note (Tony) ------ */
export function AmineStat({ scene }) {
  const wrapped = scene.day === 30;
  return (
    <div className="am-stat">
      <div className="am-stat-left">
        <span className="am-stat-big">{PCT[scene.day]}</span>
        <span className="am-stat-cap">your campaign progress</span>
      </div>
      <div className="am-stat-note">
        <span aria-hidden>{wrapped ? '🎉' : '🚀'}</span>
        <span>
          {wrapped
            ? 'Wrapped 37 days ahead of average'
            : 'Campaign on schedule, up to 4 weeks faster than industry average'}
        </span>
      </div>
    </div>
  );
}

/* ---- the cohort funnel bar --------------------------------------------- */
export function AmineFunnelBar({ scene, filter, onFilter }) {
  const f = amFunnel(scene);
  const total = f.rows.length || 1;
  const filtering = filter != null;

  return (
    <div className="am-bar" role="group" aria-label={`Creator funnel: ${PCT[scene.day]} through`}>
      {f.casting > 0 && (
        <>
          <div
            className={`am-segwrap${filtering && filter !== 'casting' ? ' am-dim' : ''}`}
            style={{ flexGrow: f.casting, flexBasis: 44 }}
          >
            <button
              type="button"
              className={`am-seg am-seg--hatch${filter === 'casting' ? ' am-seg--active' : ''}`}
              style={{ borderRadius: '100px 6px 6px 100px' }}
              aria-pressed={filter === 'casting'}
              onClick={() => onFilter(filter === 'casting' ? null : 'casting')}
            >
              <span className="am-count" style={{ color: '#808080' }}>{f.casting}</span>
              <Tip title="Casting…" summary={`${f.casting} of ${total} here · being cast right now`} />
            </button>
          </div>
          {/* 20px separation = 3px gap + 14px rule + 3px gap, per the source */}
          <div aria-hidden className="am-rule"><span /></div>
        </>
      )}
      {AM_STAGES.map((s, i) => {
        const n = f.counts[i];
        const empty = n === 0;
        const active = filter === i;
        const flaggedGlow = filter === 'needs' && f.needs[i] > 0;
        const left = i === 0 && f.casting === 0 ? 100 : 6;
        const right = i === AM_STAGES.length - 1 ? 100 : 6;
        return (
          <div
            key={s.label}
            className={`am-segwrap${filtering && !active && !flaggedGlow ? ' am-dim' : ''}`}
            style={empty ? { flexGrow: 0, flexBasis: 14, flexShrink: 0 } : { flexGrow: n, flexBasis: 44 }}
          >
            <button
              type="button"
              disabled={empty}
              aria-pressed={empty ? undefined : active}
              className={`am-seg${empty ? ' am-seg--sliver' : ''}${active ? ' am-seg--active' : ''}${flaggedGlow ? ' am-seg--glow' : ''}`}
              style={{ background: empty ? undefined : s.fill, borderRadius: `${left}px ${right}px ${right}px ${left}px` }}
              onClick={empty ? undefined : () => onFilter(active ? null : i)}
            >
              {!empty && <span className="am-count" style={{ color: s.ink }}>{n}</span>}
              {!empty && (
                <Tip
                  title={s.label}
                  summary={`${n} of ${f.named.length} here · ${Math.round((f.reached(i) / (f.named.length || 1)) * 100)}% reached this stage or beyond`}
                  rows={f.who[i]}
                />
              )}
            </button>
            {f.needs[i] > 0 && <span aria-hidden className="am-badge">{f.needs[i]}</span>}
          </div>
        );
      })}
    </div>
  );
}

/* ---- the chip row ------------------------------------------------------ */
function Chip({ label, count, dot, selected, empty, onClick }) {
  return (
    <button
      type="button"
      aria-pressed={selected}
      className={`am-chip${selected ? ' am-chip--sel' : ''}${empty ? ' am-chip--empty' : ''}`}
      onClick={empty ? undefined : onClick}
    >
      <span className="am-chip-l">{dot}<span className="am-chip-label">{label}</span></span>
      <span className="am-chip-count">{count}</span>
    </button>
  );
}

function Dot({ color, hollow }) {
  return (
    <span
      aria-hidden
      className="am-dot"
      style={hollow ? { border: `1.5px dashed ${color}`, opacity: 0.8 } : { background: color }}
    />
  );
}

export function AmineChips({ scene, filter, onFilter }) {
  const f = amFunnel(scene);
  return (
    <div className="am-chips">
      <div className="am-chips-row">
        <Chip
          label="All creators"
          count={f.rows.length}
          selected={filter == null}
          onClick={() => onFilter(null)}
          dot={<img src={AIC.dotAll} alt="" className="am-dot-img" />}
        />
        {AM_STAGES.map((s, i) => (
          <Chip
            key={s.label}
            label={s.label}
            count={f.counts[i]}
            empty={f.counts[i] === 0}
            selected={filter === i}
            onClick={() => onFilter(filter === i ? null : i)}
            dot={<Dot color={s.fill} hollow={f.counts[i] === 0} />}
          />
        ))}
      </div>
      {/* Meta chips cut across stages, so they sit on their own row. */}
      <div className="am-chips-row">
        <Chip
          label="Needs you"
          count={f.flagged}
          empty={f.flagged === 0}
          selected={filter === 'needs'}
          onClick={() => onFilter(filter === 'needs' ? null : 'needs')}
          dot={<Dot color="#e0900f" hollow={f.flagged === 0} />}
        />
        {f.casting > 0 && (
          <Chip
            label="Casting…"
            count={f.casting}
            selected={filter === 'casting'}
            onClick={() => onFilter(filter === 'casting' ? null : 'casting')}
            dot={<Dot color="#b4b8b4" />}
          />
        )}
      </div>
    </div>
  );
}

export function AmineProgress({ scene, filter, onFilter }) {
  return (
    <div className="am-progress">
      <AmineStat scene={scene} />
      <AmineFunnelBar scene={scene} filter={filter} onFilter={onFilter} />
      <AmineChips scene={scene} filter={filter} onFilter={onFilter} />
    </div>
  );
}

/* ---- V2 · the stage rail (Figma 11638:139353) --------------------------
   Equal-width columns carry the reading in the label + hint underneath, so
   there is no chip row; the amber badge is a button and does what V1's
   "Needs you" chip does. Fills are his V2 ramp (two moved for contrast,
   see his NOTES §7); hints are the frame's copy verbatim. The frame's
   leading "Casting…" column (#dbeee3) — which he dropped for lack of a
   casting state — comes back here, since v32 has one. */
/* Hint = what's happening NOW in that stage (Julia, Jul 27); the stage label
   above it is what has already happened. Empty stages keep a forward-looking
   line (no-zeros rule). Voice: "Katie's team", never "Benable Team". */
const AM2_RAIL = [
  { fill: '#b9dfcb', ink: '#06301f', hint: (n) => (n ? 'Creators are reviewing your invites' : 'invites go out on approval') },
  { fill: '#8fceae', ink: '#06301f', hint: (n) => (n ? (n === 1 ? '1 placing an order now' : `${n} placing orders now`) : 'waiting on replies') },
  { fill: '#5fb98c', ink: '#06301f', hint: (n) => (n ? `${n} ${n === 1 ? 'package' : 'packages'} on the way` : 'nothing in transit') },
  { fill: '#30aa70', ink: '#06301f', hint: (n) => (n ? `${n} creating content` : 'once packages land') },
  { fill: '#17864f', ink: '#ffffff', hint: (n) => (n ? 'Katie’s team is verifying quality' : 'after filming') },
  { fill: '#1a6f4c', ink: '#ffffff', hint: (n) => (n ? `${n} ${n === 1 ? 'post' : 'posts'} now live!` : 'after our checks') },
  { fill: '#124a33', ink: '#ffffff', hint: (n) => (n ? 'All done!' : 'after posts go live') },
];

function RailColumn({ label, hint, count, fill, hatchClass, ink, radius, disabled, selected, dimmed, highlighted, badge, onActivate, onBadge, tip }) {
  return (
    <div className={`am2-col${dimmed ? ' am-dim' : ''}`}>
      <button
        type="button"
        disabled={disabled}
        aria-pressed={disabled ? undefined : selected}
        className={`am2-bar${hatchClass ? ` ${hatchClass}` : ''}${selected ? ' am-seg--active' : ''}${highlighted ? ' am-seg--glow' : ''}`}
        style={{ background: fill, borderRadius: `${radius.left}px ${radius.right}px ${radius.right}px ${radius.left}px` }}
        onClick={disabled ? undefined : onActivate}
      >
        <span className="am2-count" style={{ color: ink }}>{count}</span>
        {tip}
      </button>
      {badge > 0 && (
        <button
          type="button"
          className="am-badge am2-badge"
          aria-label={`${badge} ${badge === 1 ? 'creator needs' : 'creators need'} you in ${label}`}
          onClick={onBadge}
        >
          {badge}
        </button>
      )}
      <div className="am2-leg">
        <p className="am2-label">{label}</p>
        <p className="am2-hint">{hint}</p>
      </div>
    </div>
  );
}

export function AmineRailBar({ scene, filter, onFilter }) {
  const f = amFunnel(scene);
  const total = f.rows.length || 1;
  const filtering = filter != null;
  const last = AM_STAGES.length - 1;

  return (
    <div className="am2-rail" role="group" aria-label={`Creator funnel: ${PCT[scene.day]} through`}>
      {f.casting > 0 && (
        <RailColumn
          label="Casting…"
          hint={f.named.length ? 'Rematching you with creators' : 'Matching you with creators'}
          count={f.casting}
          fill="#dbeee3"
          ink="#06301f"
          radius={{ left: 74, right: 4 }}
          selected={filter === 'casting'}
          dimmed={filtering && filter !== 'casting'}
          onActivate={() => onFilter(filter === 'casting' ? null : 'casting')}
          tip={<Tip title="Casting…" summary={`${f.casting} of ${total} here · being cast right now`} />}
        />
      )}
      {AM_STAGES.map((s, i) => {
        const n = f.counts[i];
        const empty = n === 0;
        const active = filter === i;
        const rail = AM2_RAIL[i];
        return (
          <RailColumn
            key={s.label}
            label={s.label}
            hint={rail.hint(n, f.named.length)}
            count={n}
            fill={empty ? undefined : rail.fill}
            hatchClass={empty ? 'am-seg--sliver' : ''}
            ink={empty ? '#808080' : rail.ink}
            radius={{ left: i === 0 && f.casting === 0 ? 74 : 4, right: i === last ? 100 : 4 }}
            disabled={empty}
            selected={active}
            dimmed={filtering && !active && !(filter === 'needs' && f.needs[i] > 0)}
            highlighted={filter === 'needs' && f.needs[i] > 0}
            badge={f.needs[i]}
            onActivate={() => onFilter(active ? null : i)}
            onBadge={() => onFilter(filter === 'needs' ? null : 'needs')}
            tip={!empty && (
              <Tip
                title={s.label}
                summary={`${n} of ${f.named.length} here · ${Math.round((f.reached(i) / (f.named.length || 1)) * 100)}% reached this stage or beyond`}
                rows={f.who[i]}
              />
            )}
          />
        );
      })}
    </div>
  );
}

export function AmineProgress2({ scene, filter, onFilter }) {
  return (
    <div className="am-progress">
      <AmineStat scene={scene} />
      <AmineRailBar scene={scene} filter={filter} onFilter={onFilter} />
    </div>
  );
}

/* ---- creators table ---------------------------------------------------- */
export const AM_FILTER_LABEL = (filter) =>
  filter === 'needs' ? 'Needs you' : filter === 'casting' ? 'Casting…' : AM_STAGES[filter]?.label;

export function AmineTable({ scene, rows, filter, onFilter, openCrew, toggleCrew }) {
  const cohort = (CREW[scene.day] || []).length;
  const filtered = filter != null;

  return (
    <section className="am-card am-table" aria-label="Creators">
      <div className="am-card-head">
        <div className="am-head-l">
          <span className="am-symtile"><img src={AIC.group} alt="" /></span>
          <div>
            <p className="am-card-title">Creators</p>
            <p className="am-card-sub">
              {filtered ? `${rows.length} of ${cohort} creators` : `${cohort} creator${cohort === 1 ? '' : 's'}`}
            </p>
          </div>
        </div>
        {filtered && (
          <button type="button" className="am-showall" onClick={() => onFilter(null)}>
            Show all <span aria-hidden>✕</span>
          </button>
        )}
      </div>

      <div className="am-cols" aria-hidden>
        <span>CREATOR</span><span>LATEST UPDATE</span><span>STAGE</span><span />
      </div>

      {rows.length === 0 ? (
        <div className="am-empty">
          <p className="am-empty-title">Nobody is in {AM_FILTER_LABEL(filter) ?? 'this filter'} right now</p>
          <p className="am-empty-sub">The stage is empty at the moment. Clear the filter to see the rest of the cohort.</p>
          <button type="button" className="am-showall am-empty-btn" onClick={() => onFilter(null)}>
            Show all creators
          </button>
        </div>
      ) : (
        rows.map((c, i) => {
          const rowKey = `${scene.day}-${c.name}-${i}`;
          const open = openCrew.has(rowKey);
          const timeline = c.mystery ? CASTING_TIMELINE : TIMELINES[c.name] || [];
          const reached = c.mystery ? -1 : stageOf(c, scene.day);
          const flaggedRow = !c.mystery && (!!c.action || scene.day === 3);
          return (
            <div key={rowKey} className="am-item">
              <button type="button" className="am-row" onClick={() => toggleCrew(rowKey)} aria-expanded={open}>
                <span className="am-who">
                  {!c.mystery && PHOTOS[c.name] ? (
                    <span className="am-avatar"><img src={PHOTOS[c.name]} alt="" /></span>
                  ) : (
                    <span className="am-avatar am-avatar--mystery">?</span>
                  )}
                  <span className="am-names">
                    <span className="am-name">
                      {c.name}
                      {!c.mystery && <img src={AIC.check} alt="Verified" className="am-verified" />}
                    </span>
                    <span className="am-handle">{c.mystery ? 'sourcing now' : c.handle}</span>
                  </span>
                </span>
                <span className={`am-update${flaggedRow ? ' am-update--flag' : ''}`}>
                  {flaggedRow && <span aria-hidden>⚑ </span>}
                  <LiveStatus status={c.status} />
                </span>
                <span className="am-dashes" role="img" aria-label={c.mystery ? 'Casting' : `Stage ${reached + 1} of ${AM_STAGES.length}: ${AM_STAGES[reached].label}`}>
                  {AM_STAGES.map((s, si) => (
                    <i key={s.label} style={{ background: si <= reached ? '#7a5cfa' : '#e3e3e3' }} />
                  ))}
                </span>
                <span className="am-chev">
                  <img src={AIC.chevron} alt="" style={{ rotate: open ? '270deg' : '90deg' }} />
                </span>
              </button>
              {open && (
                <div className="am-hist">
                  <p className="am-hist-title">Stage history</p>
                  <div className="cp-crew-history am-hist-body">
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
                </div>
              )}
            </div>
          );
        })
      )}

      <div className="am-foot">
        <button type="button" className="am-more">
          <span className="am-more-plus"><img src={AIC.plus} alt="" /></span>
          Request more
        </button>
      </div>
    </section>
  );
}

/* ---- right rail -------------------------------------------------------- */
function RailCard({ icon, title, subtitle, children, pad }) {
  return (
    <section className="am-card">
      <div className="am-card-head">
        <div className="am-head-l">
          <span className="am-symtile"><img src={icon} alt="" /></span>
          <div>
            <p className="am-card-title">{title}</p>
            {subtitle && <p className="am-card-sub">{subtitle}</p>}
          </div>
        </div>
      </div>
      <div className={pad || 'am-card-body'}>{children}</div>
    </section>
  );
}

function NoteRow({ emoji, strong, rest, last }) {
  return (
    <div className={`am-note${last ? ' am-note--last' : ''}`}>
      <span className="am-note-emoji" aria-hidden>{emoji}</span>
      <p className="am-note-text">
        <strong>{strong}</strong>
        {rest && <span>{rest}</span>}
      </p>
    </div>
  );
}

function Meter({ label, trailing, pct, fill }) {
  return (
    <div className="am-meter">
      <div className="am-meter-top">
        <span className="am-meter-label">{label}</span>
        {trailing && <span className="am-meter-day">{trailing}</span>}
      </div>
      <div className="am-meter-track" role="meter" aria-label={label} aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100}>
        <i style={{ width: `calc(${pct}% - 2px)`, background: fill }} />
      </div>
    </div>
  );
}

export function AmineRail({ scene, zeroRecap = false }) {
  const { recap, race } = scene;
  return (
    <aside className="am-rail">
      {zeroRecap ? (
        <RecapTile scene={scene} />
      ) : (
        <RailCard
          icon={AIC.invites}
          title="While you were away"
          subtitle={<>Since, <b className="am-sub-b">{recap.since.replace(/^since /, '')}</b></>}
        >
          {recap.items.map((it, i) => (
            <NoteRow key={it.bold} emoji={it.emoji} strong={it.bold} rest={it.rest} last={i === recap.items.length - 1} />
          ))}
        </RailCard>
      )}

      <RailCard icon={AIC.invites} title="Up next">
        {scene.upNext.map((u, i) => (
          <NoteRow key={u.text} emoji={u.emoji} strong={u.text} rest={` — ${u.eta}`} last={i === scene.upNext.length - 1} />
        ))}
      </RailCard>

      <RailCard icon={AIC.insight} title="The pace" subtitle={`Day ${scene.day} out of 30`} pad="am-pace-body">
        <Meter label="Your campaign" trailing={`Day ${scene.day}`} pct={race.you} fill="#815aff" />
        <div style={{ height: 10 }} />
        <Meter label="Industry average" pct={race.them} fill="#c4c4c4" />
        <div className="am-pace-strip">
          <span aria-hidden className="am-pace-img">
            <img src={AIC.paceStrip} alt="" />
            <i />
          </span>
          <p className="am-pace-caption" dangerouslySetInnerHTML={{ __html: race.caption }} />
        </div>
      </RailCard>
    </aside>
  );
}
