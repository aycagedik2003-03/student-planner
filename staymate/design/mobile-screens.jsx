/* Staymate Mobile — screens */
const { useState: uS, useEffect: uE, useContext: uC } = React;

// ── Sample data ───────────────────────────────────────────────────────────────
const PEOPLE = [
  { name:'Zofia',  age:24, hue:1, vibe:'Plant-mom · early bird',    loc:'Mokotów, Warsaw',      match:96, rent:1850, room:'sunny corner room',      tags:['plant','coffee','moon'], tint:'rose'   },
  { name:'Kasia',  age:27, hue:2, vibe:'Studio music · soft jazz',  loc:'Kazimierz, Kraków',    match:92, rent:1620, room:'bright loft + balcony',  tags:['music','coffee'],       tint:'turq'   },
  { name:'Marta',  age:22, hue:3, vibe:'Quiet weeknights · matcha', loc:'Praga, Warsaw',        match:91, rent:1490, room:'cosy parquet room',       tags:['plant','moon'],         tint:'rose'   },
  { name:'Ola',    age:29, hue:4, vibe:'Designer · slow mornings',  loc:'Wrzeszcz, Gdańsk',     match:89, rent:2100, room:'sea-light studio',        tags:['coffee','plant'],       tint:'violet' },
  { name:'Hania',  age:25, hue:5, vibe:'Reads at 11pm · soft girl', loc:'Stare Miasto, Wrocław',match:88, rent:1700, room:'warm wood room',          tags:['moon','plant'],         tint:'rose'   },
  { name:'Iga',    age:23, hue:0, vibe:'Yoga + soft synth',         loc:'Powiśle, Warsaw',      match:86, rent:1880, room:'minimalist white room',   tags:['music','moon'],         tint:'turq'   },
];

const LISTINGS_DATA = [
  { id:'l1', title:'Cosy 2-room near Old Town',   city:'Kraków',  district:'Kazimierz',    rooms:2, m2:48, rent:2200, tint:'rose'   },
  { id:'l2', title:'Bright studio with balcony',  city:'Warsaw',  district:'Mokotów',      rooms:1, m2:32, rent:1800, tint:'turq'   },
  { id:'l3', title:'Sunny corner apt, pet ok',    city:'Kraków',  district:'Stare Miasto', rooms:3, m2:65, rent:3100, tint:'violet' },
  { id:'l4', title:'Minimalist loft downtown',    city:'Warsaw',  district:'Śródmieście',  rooms:2, m2:54, rent:2600, tint:'rose'   },
  { id:'l5', title:'Plant-friendly flat',         city:'Wrocław', district:'Nadodrze',     rooms:2, m2:51, rent:2000, tint:'turq'   },
  { id:'l6', title:'Designer studio, sea light',  city:'Gdańsk',  district:'Wrzeszcz',     rooms:1, m2:38, rent:2400, tint:'violet' },
];

// ═══════════════════════════════════════════════════════════════
// 1) SPLASH — diagonal photo collage + chat bubbles + logo medallion
// ═══════════════════════════════════════════════════════════════
const Splash = ({ onCta, onSignin }) => {
  const t = useT(); const tr = useTr();
  const { lang } = uC(ThemeCtx);
  const [activeLang, setActiveLang] = uS(lang || 'en');

  // Photo collage panels — three diagonal slices
  const panels = [
    {
      clip: 'polygon(0 0, 46% 0, 32% 100%, 0 100%)',
      bg: 'linear-gradient(160deg, #1a2035 0%, #0d1525 100%)',
    },
    {
      clip: 'polygon(42% 0, 74% 0, 60% 100%, 28% 100%)',
      bg: 'linear-gradient(160deg, #5E3DB8 0%, #3A1E8A 100%)',
    },
    {
      clip: 'polygon(70% 0, 100% 0, 100% 100%, 56% 100%)',
      bg: 'linear-gradient(160deg, #1FBFCC 0%, #0E9AAB 100%)',
    },
  ];

  const COLLAGE_H = '52%';

  return (
    <div style={{ position: 'absolute', inset: 0, background: t.bg, overflow: 'hidden' }}>

      {/* ── Photo collage (top 52%) ── */}
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: COLLAGE_H, overflow: 'hidden' }}>
        {panels.map((p, i) => (
          <div key={i} style={{
            position: 'absolute', inset: 0,
            clipPath: p.clip,
            backgroundImage: p.bg,
          }}>
            {/* subtle texture overlay */}
            <div style={{ position: 'absolute', inset: 0, backgroundImage: 'repeating-linear-gradient(45deg, rgba(255,255,255,0.04) 0 4px, transparent 4px 12px)' }}/>
          </div>
        ))}

        {/* City pin chips */}
        <div style={{ position: 'absolute', top: '18%', left: '12%', zIndex: 6, display: 'flex', alignItems: 'center', gap: 5, background: 'rgba(255,255,255,0.92)', backdropFilter: 'blur(10px)', borderRadius: 999, padding: '5px 11px', boxShadow: '0 3px 10px rgba(0,0,0,0.14)' }}>
          <I.Pin s={10} c="#0F172A"/>
          <span style={{ fontSize: 11.5, fontWeight: 700, color: '#0F172A' }}>Kraków</span>
        </div>
        <div style={{ position: 'absolute', top: '30%', right: '10%', zIndex: 6, display: 'flex', alignItems: 'center', gap: 5, background: 'rgba(255,255,255,0.92)', backdropFilter: 'blur(10px)', borderRadius: 999, padding: '5px 11px', boxShadow: '0 3px 10px rgba(0,0,0,0.14)' }}>
          <I.Pin s={10} c="#0F172A"/>
          <span style={{ fontSize: 11.5, fontWeight: 700, color: '#0F172A' }}>Wrocław</span>
        </div>

        {/* Chat bubble — them */}
        <div style={{
          position: 'absolute', top: '36%', left: 14, zIndex: 7,
          background: 'white', borderRadius: '16px 16px 16px 4px',
          padding: '9px 13px', maxWidth: 158, lineHeight: 1.35,
          fontSize: 12, fontWeight: 500, color: '#0F172A',
          boxShadow: '0 5px 16px rgba(0,0,0,0.15)',
        }}>Hey 👋 looking for roommate?</div>

        {/* Chat bubble — me */}
        <div style={{
          position: 'absolute', top: '28%', right: 14, zIndex: 7,
          backgroundImage: GRAD,
          borderRadius: '16px 16px 4px 16px',
          padding: '9px 13px', maxWidth: 150, lineHeight: 1.35,
          fontSize: 12, fontWeight: 500, color: 'white',
          boxShadow: '0 5px 16px rgba(31,191,204,0.35)',
        }}>Hi there! 🙂 Yes me too!</div>
      </div>

      {/* ── Logo medallion — at the transition point ── */}
      <div style={{ position: 'absolute', top: 'calc(52% - 40px)', left: '50%', transform: 'translateX(-50%)', zIndex: 10 }}>
        <div style={{
          width: 80, height: 80, borderRadius: 26,
          background: 'white',
          boxShadow: '0 0 0 6px rgba(255,255,255,0.7), 0 12px 36px rgba(0,0,0,0.22)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <I.Logo s={48}/>
        </div>
      </div>

      {/* ── Bottom section ── */}
      <div style={{
        position: 'absolute', top: '52%', left: 0, right: 0, bottom: 0,
        background: t.bg,
        display: 'flex', flexDirection: 'column',
        padding: '54px 22px 24px',
        alignItems: 'stretch',
      }}>
        {/* Logotype */}
        <div style={{ textAlign: 'center', marginBottom: 6 }}>
          <span style={{ fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif", fontSize: 30, fontWeight: 800, letterSpacing: '-0.025em', color: t.ink }}>roomski</span>
        </div>

        {/* Tagline */}
        <p style={{ textAlign: 'center', margin: '0 0 22px', fontSize: 14, lineHeight: 1.55, color: t.soft }}>
          {tr.splash_sub}
        </p>

        {/* CTA */}
        <Pill variant="grad" size="lg" onClick={onCta} style={{ width: '100%', marginBottom: 10 }}>
          {tr.splash_cta} <I.Arrow s={14} c="white"/>
        </Pill>

        {/* Sign in */}
        <button onClick={onSignin} style={{ background: 'none', border: 'none', color: t.mute, fontSize: 13, fontWeight: 500, padding: '10px', cursor: 'pointer', fontFamily: 'inherit', marginBottom: 16 }}>
          {tr.splash_signin}
        </button>

        {/* EN | PL compact segmented control */}
        <div style={{ display: 'flex', justifyContent: 'center' }}>
          <div style={{ display: 'flex', background: t.bgSoft, borderRadius: 12, padding: 3, border: `1px solid ${t.line}` }}>
            {(['en', 'pl']).map(l => (
              <button key={l} onClick={() => setActiveLang(l)} style={{
                padding: '7px 20px', borderRadius: 9, border: 'none', cursor: 'pointer',
                fontFamily: 'inherit', fontSize: 12, fontWeight: 700,
                background: activeLang === l ? t.card : 'transparent',
                color: activeLang === l ? t.ink : t.mute,
                boxShadow: activeLang === l ? '0 1px 5px rgba(0,0,0,0.10)' : 'none',
                transition: 'all .18s',
              }}>{l.toUpperCase()}</button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════
// 2) LOGIN
// ═══════════════════════════════════════════════════════════════
const Login = ({ onBack, onContinue }) => {
  const t = useT(); const tr = useTr();
  const [mode, setMode] = uS('email');
  const [v, setV] = uS('');
  return (
    <div style={{ position: 'absolute', inset: 0, background: t.bg, display: 'flex', flexDirection: 'column', padding: '64px 22px 26px' }}>
      <button onClick={onBack} style={{ width: 40, height: 40, borderRadius: 999, background: t.bgSoft, border: `1px solid ${t.line}`, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
        <I.Back s={16} c={t.ink}/>
      </button>
      <h1 style={{ margin: '32px 0 6px', fontFamily: "'Plus Jakarta Sans',system-ui,sans-serif", fontSize: 32, fontWeight: 800, letterSpacing: '-0.03em', lineHeight: 1.1, color: t.ink }}>{tr.login_title}</h1>
      <p style={{ margin: 0, fontSize: 14, color: t.soft }}>{tr.login_sub}</p>

      {/* Tab toggle */}
      <div style={{ position: 'relative', display: 'flex', background: t.bgSoft, borderRadius: 14, padding: 4, marginTop: 24 }}>
        <div style={{ position: 'absolute', top: 4, bottom: 4, left: mode === 'email' ? 4 : '50%', right: mode === 'email' ? '50%' : 4, background: t.card, borderRadius: 11, border: `1px solid ${t.line}`, transition: 'all .22s ease' }}/>
        {['email', 'phone'].map(m => (
          <button key={m} onClick={() => setMode(m)} style={{ flex: 1, height: 36, background: 'none', border: 'none', cursor: 'pointer', position: 'relative', fontFamily: 'inherit', fontSize: 13, fontWeight: 600, color: mode === m ? t.ink : t.mute }}>
            {m === 'email' ? tr.login_email : tr.login_phone}
          </button>
        ))}
      </div>

      <input value={v} onChange={e => setV(e.target.value)} placeholder={mode === 'email' ? 'mira@roomski.app' : '+48 ___ ___ ___'} style={{ marginTop: 12, width: '100%', height: 54, borderRadius: 16, border: `1px solid ${t.line}`, background: t.card, padding: '0 18px', fontSize: 15, color: t.ink, fontFamily: 'inherit', outline: 'none', boxSizing: 'border-box' }}/>

      <Pill variant="grad" size="lg" onClick={onContinue} style={{ marginTop: 14, width: '100%' }}>
        {tr.login_continue} <I.Arrow s={14} c="white"/>
      </Pill>

      <div style={{ display: 'flex', alignItems: 'center', gap: 10, margin: '22px 0 14px' }}>
        <div style={{ flex: 1, height: 1, background: t.line }}/>
        <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 10, color: t.mute, letterSpacing: '0.12em', textTransform: 'uppercase' }}>{tr.login_or}</span>
        <div style={{ flex: 1, height: 1, background: t.line }}/>
      </div>

      <div style={{ display: 'flex', gap: 8 }}>
        {['Apple', 'Google', 'Facebook'].map(s => (
          <button key={s} style={{ flex: 1, height: 50, borderRadius: 14, background: t.card, border: `1px solid ${t.line}`, fontSize: 12.5, fontWeight: 600, color: t.ink, fontFamily: 'inherit', cursor: 'pointer' }}>{s}</button>
        ))}
      </div>

      <p style={{ marginTop: 'auto', fontSize: 11, lineHeight: 1.5, color: t.mute, textAlign: 'center' }}>{tr.login_terms}</p>
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════
// 3) HOME (3 variations)
// ═══════════════════════════════════════════════════════════════
const HomeA = ({ onPerson, onSearch, tab, setTab }) => {
  const t = useT(); const tr = useTr();
  const filters = ['Plant friends', 'Early birds', 'No smoke', 'Pet ok', 'Quiet', 'LGBTQ+'];
  return (
    <div style={{ position: 'absolute', inset: 0, background: t.bg, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
      <div className="nice-scroll" style={{ flex: 1, overflowY: 'auto', paddingTop: 56, paddingBottom: 110 }}>

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 18px' }}>
          <div>
            <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 10, letterSpacing: '0.14em', textTransform: 'uppercase', color: t.soft }}>{tr.home_hi}</div>
            <h1 style={{ margin: '4px 0 0', fontFamily: "'Plus Jakarta Sans',system-ui,sans-serif", fontSize: 26, fontWeight: 800, letterSpacing: '-0.025em', lineHeight: 1.1, color: t.ink }}>{tr.home_q}</h1>
          </div>
          <button style={{ width: 40, height: 40, borderRadius: 999, background: t.card, border: `1px solid ${t.line}`, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', position: 'relative' }}>
            <I.Bell s={18} c={t.soft}/>
            <span style={{ position: 'absolute', top: 9, right: 10, width: 7, height: 7, borderRadius: 999, backgroundImage: GRAD, boxShadow: '0 0 0 2px ' + t.bg }}/>
          </button>
        </div>

        {/* Search shortcut */}
        <button onClick={onSearch} style={{ display: 'flex', alignItems: 'center', gap: 10, width: 'calc(100% - 36px)', margin: '14px 18px 0', height: 50, padding: '0 16px', borderRadius: 16, background: t.bgSoft, border: `1px solid ${t.line}`, color: t.mute, fontFamily: 'inherit', fontSize: 14, cursor: 'pointer' }}>
          <I.Search s={16} c={t.mute}/> <span style={{ flex: 1, textAlign: 'left' }}>{tr.search_ph}</span>
          <span style={{ background: t.card, border: `1px solid ${t.line}`, padding: '4px 8px', borderRadius: 8, fontFamily: 'JetBrains Mono, monospace', fontSize: 10, color: t.soft }}>⌘K</span>
        </button>

        {/* Quick filters */}
        <SectionTitle title={tr.home_quick}/>
        <div style={{ display: 'flex', gap: 7, padding: '0 18px', overflowX: 'auto' }} className="nice-scroll">
          {filters.map((f, i) => <Chip key={f} active={i === 0}>{f}</Chip>)}
        </div>

        {/* Featured banner */}
        <div style={{ padding: '0 18px', marginTop: 18 }}>
          <div style={{ position: 'relative', overflow: 'hidden', borderRadius: 24, backgroundImage: GRAD, minHeight: 136 }}>
            <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(120px circle at 100% 0%, rgba(255,255,255,0.28), transparent)' }}/>
            <div style={{ position: 'relative', padding: 20 }}>
              <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 9.5, letterSpacing: '0.16em', textTransform: 'uppercase', opacity: 0.85, color: 'white' }}>vibe quiz · 2 min</div>
              <div style={{ marginTop: 7, fontSize: 22, fontWeight: 700, letterSpacing: '-0.02em', lineHeight: 1.15, color: 'white', maxWidth: 200 }}>Get 3× better matches in 2 minutes.</div>
              <Pill variant="ghost" size="sm" style={{ marginTop: 14, background: 'white', color: '#0F172A', border: 'none' }}>Start quiz <I.Arrow s={12} c="#0F172A"/></Pill>
            </div>
            <div style={{ position: 'absolute', right: 14, bottom: 14, display: 'flex' }}>
              {['🌿', '☕', '🌙'].map((e, i) => (
                <div key={i} style={{ width: 30, height: 30, borderRadius: 999, marginLeft: -8, background: 'rgba(255,255,255,0.25)', border: '2px solid rgba(255,255,255,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12 }}>{e}</div>
              ))}
            </div>
          </div>
        </div>

        {/* Today's matches */}
        <SectionTitle title={tr.home_today} action={{ label: tr.home_seeAll }}/>
        <div style={{ display: 'flex', gap: 12, overflowX: 'auto', padding: '0 18px 4px' }} className="nice-scroll">
          {PEOPLE.slice(0, 6).map(p => (
            <button key={p.name} onClick={() => onPerson(p)} style={{ flexShrink: 0, width: 168, background: t.card, borderRadius: 22, border: `1px solid ${t.line}`, padding: 10, textAlign: 'left', cursor: 'pointer', fontFamily: 'inherit', color: t.ink }}>
              <Ph tint={p.tint} style={{ height: 188, borderRadius: 16, position: 'relative' }}>
                <div style={{ position: 'absolute', top: 8, left: 8, padding: '4px 8px', borderRadius: 999, background: 'rgba(255,255,255,0.88)', backdropFilter: 'blur(8px)', fontSize: 10.5, fontWeight: 700, color: BRAND.tealDk }}>
                  {p.match}% match
                </div>
                <div style={{ position: 'absolute', top: 8, right: 8, width: 28, height: 28, borderRadius: 999, background: 'rgba(255,255,255,0.88)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <I.Heart s={13} c={BRAND.magenta}/>
                </div>
              </Ph>
              <div style={{ padding: '10px 4px 4px' }}>
                <div style={{ fontSize: 14, fontWeight: 700, letterSpacing: '-0.01em', color: t.ink }}>{p.name}, {p.age}</div>
                <div style={{ fontSize: 11.5, color: t.soft, marginTop: 2 }}>{p.loc.split(',')[0]}</div>
                <div style={{ fontSize: 13, fontWeight: 700, color: t.ink, marginTop: 6 }}>{p.rent} <span style={{ color: t.mute, fontSize: 11, fontWeight: 400 }}>zł/mo</span></div>
              </div>
            </button>
          ))}
        </div>

        {/* Vibe grid */}
        <SectionTitle title="Browse by vibe"/>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, padding: '0 18px' }}>
          {[
            { l: 'Slow mornings', sub: '32 people', icon: '☕', g: `linear-gradient(135deg, ${BRAND.magentaLt}, #FFC4DF)` },
            { l: 'Plant household', sub: '28 people', icon: '🌿', g: `linear-gradient(135deg, ${BRAND.tealLt}, #B3EEF0)` },
            { l: 'Pet-friendly', sub: '24 people', icon: '🐈', g: `linear-gradient(135deg, ${BRAND.magentaLt}, ${BRAND.tealLt})` },
            { l: 'Quiet weeknights', sub: '41 people', icon: '🌙', g: `linear-gradient(135deg, ${BRAND.tealLt}, ${BRAND.violetLt})` },
          ].map(v => (
            <div key={v.l} style={{ borderRadius: 18, padding: 14, backgroundImage: v.g, border: `1px solid ${t.line}`, minHeight: 92 }}>
              <div style={{ fontSize: 22 }}>{v.icon}</div>
              <div style={{ marginTop: 8, fontSize: 13.5, fontWeight: 700, color: t.ink, letterSpacing: '-0.01em' }}>{v.l}</div>
              <div style={{ fontSize: 11, color: t.soft }}>{v.sub}</div>
            </div>
          ))}
        </div>
      </div>
      <TabBar tab={tab} setTab={setTab}/>
    </div>
  );
};

// Home B: Swipe stack
const HomeB = ({ onPerson, tab, setTab }) => {
  const t = useT();
  const [idx, setIdx] = uS(0);
  const p = PEOPLE[idx % PEOPLE.length];
  const next = PEOPLE[(idx + 1) % PEOPLE.length];
  const CircleBtn = ({ children, grad, border, onClick, big }) => {
    const sz = big ? 64 : 52;
    return (
      <button onClick={onClick} style={{ width: sz, height: sz, borderRadius: 999, backgroundImage: grad ? GRAD : 'none', background: grad ? undefined : t.card, border: border ? `1px solid ${t.line}` : 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', boxShadow: grad ? '0 14px 28px -12px rgba(142,92,217,0.55)' : '0 8px 18px -10px rgba(15,23,42,0.18)' }}>
        {children}
      </button>
    );
  };
  return (
    <div style={{ position: 'absolute', inset: 0, background: t.bg, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      <div style={{ flex: 1, padding: '56px 18px 110px', display: 'flex', flexDirection: 'column' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 10, letterSpacing: '0.14em', textTransform: 'uppercase', color: t.soft }}>discover · stack</div>
            <h1 style={{ margin: '4px 0 0', fontFamily: "'Plus Jakarta Sans',system-ui,sans-serif", fontSize: 24, fontWeight: 800, letterSpacing: '-0.025em', color: t.ink }}>For you, today</h1>
          </div>
          <button style={{ width: 40, height: 40, borderRadius: 999, background: t.card, border: `1px solid ${t.line}`, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}><I.Filter s={16} c={t.soft}/></button>
        </div>
        <div style={{ position: 'relative', flex: 1, marginTop: 18 }}>
          {/* back card */}
          <div style={{ position: 'absolute', inset: 0, transform: 'scale(0.94) translateY(14px)', borderRadius: 28, overflow: 'hidden', opacity: 0.5, background: t.card, border: `1px solid ${t.line}` }}>
            <Ph tint={next.tint} style={{ height: '100%', borderRadius: 0 }}/>
          </div>
          {/* front card */}
          <div style={{ position: 'absolute', inset: 0, borderRadius: 28, overflow: 'hidden', background: t.card, border: `1px solid ${t.line}`, boxShadow: '0 24px 50px -20px rgba(15,23,42,0.25)' }}>
            <Ph tint={p.tint} style={{ height: '70%', borderRadius: 0 }}>
              <div style={{ position: 'absolute', top: 14, left: 14, right: 14, display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ padding: '6px 10px', borderRadius: 999, background: 'rgba(255,255,255,0.88)', backdropFilter: 'blur(8px)', fontSize: 11, fontWeight: 700, color: BRAND.tealDk }}>{p.match}% match</span>
                <span style={{ padding: '6px 10px', borderRadius: 999, background: 'rgba(255,255,255,0.88)', backdropFilter: 'blur(8px)', fontSize: 11, fontWeight: 600, color: t.ink, display: 'flex', alignItems: 'center', gap: 4 }}><I.Pin s={10} c={t.ink}/>{p.loc.split(',')[0]}</span>
              </div>
              <div style={{ position: 'absolute', bottom: 14, left: 14, color: 'white', textShadow: '0 2px 12px rgba(0,0,0,0.3)' }}>
                <div style={{ fontSize: 26, fontWeight: 800, letterSpacing: '-0.02em' }}>{p.name}, {p.age}</div>
                <div style={{ fontSize: 13, opacity: 0.95 }}>{p.vibe}</div>
              </div>
            </Ph>
            <div style={{ padding: 14, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <div style={{ fontSize: 13.5, fontWeight: 700, color: t.ink }}>{p.rent} zł<span style={{ color: t.mute, fontSize: 11.5, fontWeight: 400 }}>/mo</span></div>
                <div style={{ fontSize: 11.5, color: t.soft }}>{p.room}</div>
              </div>
              <button onClick={() => onPerson(p)} style={{ fontSize: 12, fontWeight: 700, color: BRAND.teal, border: 'none', background: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4, fontFamily: 'inherit' }}>See profile <I.Arrow s={12} c={BRAND.teal}/></button>
            </div>
          </div>
        </div>
        <div style={{ display: 'flex', justifyContent: 'center', gap: 18, marginTop: 14 }}>
          <CircleBtn border onClick={() => setIdx(i => i+1)}><I.X s={20} c={BRAND.magenta}/></CircleBtn>
          <CircleBtn grad onClick={() => setIdx(i => i+1)} big><I.Heart s={22} c="white" filled/></CircleBtn>
          <CircleBtn border><I.Sparkle s={18} c={BRAND.teal}/></CircleBtn>
        </div>
      </div>
      <TabBar tab={tab} setTab={setTab}/>
    </div>
  );
};

// Home C: Map-first
const HomeC = ({ onPerson, tab, setTab }) => {
  const t = useT();
  return (
    <div style={{ position: 'absolute', inset: 0, background: t.bg, overflow: 'hidden' }}>
      <div style={{ position: 'absolute', inset: 0, background: t.bgSoft, backgroundImage: `radial-gradient(circle at 20% 30%, rgba(31,191,204,0.10) 0%, transparent 25%), radial-gradient(circle at 70% 60%, rgba(142,92,217,0.10) 0%, transparent 25%), repeating-linear-gradient(0deg, ${t.line} 0 1px, transparent 1px 60px), repeating-linear-gradient(90deg, ${t.line} 0 1px, transparent 1px 60px)` }}>
        <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}>
          <path d="M-10 220 Q 100 170 180 230 T 420 280" stroke={t.line} strokeWidth="6" fill="none"/>
          <path d="M60 -10 Q 110 200 50 400 T 90 800" stroke={t.line} strokeWidth="4" fill="none"/>
        </svg>
      </div>
      <div style={{ position: 'absolute', top: 56, left: 14, right: 14, display: 'flex', gap: 8 }}>
        <div style={{ flex: 1, height: 46, borderRadius: 16, background: 'rgba(255,255,255,0.9)', backdropFilter: 'blur(14px)', border: `1px solid ${t.line}`, display: 'flex', alignItems: 'center', gap: 10, padding: '0 14px', fontSize: 13, color: t.soft }}>
          <I.Search s={16} c={t.soft}/> <span style={{ flex: 1 }}>Mokotów, Warsaw</span> <I.Filter s={14} c={t.soft}/>
        </div>
      </div>
      {PEOPLE.slice(0, 5).map((p, i) => {
        const pos = [{ l:'24%',tp:'34%' },{ l:'62%',tp:'28%' },{ l:'46%',tp:'46%' },{ l:'72%',tp:'52%' },{ l:'20%',tp:'58%' }][i];
        return (
          <button key={p.name} onClick={() => onPerson(p)} style={{ position: 'absolute', left: pos.l, top: pos.tp, transform: 'translate(-50%,-50%)', display: 'flex', alignItems: 'center', gap: 6, background: 'white', borderRadius: 999, border: 'none', padding: '4px 10px 4px 4px', cursor: 'pointer', boxShadow: `0 6px 18px -8px rgba(15,23,42,0.3), 0 0 0 2px rgba(31,191,204,0.18)`, fontFamily: 'inherit' }}>
            <Avatar size={28} hue={p.hue} label={p.name[0]}/>
            <span style={{ fontSize: 12, fontWeight: 700, color: t.ink }}>{p.rent}zł</span>
          </button>
        );
      })}
      <div style={{ position: 'absolute', left: 0, right: 0, bottom: 0, background: t.bg, borderTopLeftRadius: 28, borderTopRightRadius: 28, padding: '12px 18px 100px', boxShadow: '0 -10px 30px -8px rgba(15,23,42,0.12)' }}>
        <div style={{ width: 36, height: 4, borderRadius: 999, background: t.line, margin: '4px auto 12px' }}/>
        <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between' }}>
          <h3 style={{ margin: 0, fontSize: 18, fontWeight: 800, letterSpacing: '-0.02em', color: t.ink }}>5 in Mokotów</h3>
          <span style={{ fontSize: 12, color: t.soft }}>avg 1,820 zł</span>
        </div>
        <div style={{ display: 'flex', gap: 10, marginTop: 12, overflowX: 'auto' }} className="nice-scroll">
          {PEOPLE.slice(0, 4).map(p => (
            <button key={p.name} onClick={() => onPerson(p)} style={{ flexShrink: 0, width: 152, background: t.card, borderRadius: 18, border: `1px solid ${t.line}`, padding: 8, fontFamily: 'inherit', cursor: 'pointer', textAlign: 'left', color: t.ink }}>
              <Ph tint={p.tint} style={{ height: 88, borderRadius: 12 }}/>
              <div style={{ marginTop: 8, fontSize: 12.5, fontWeight: 700, color: t.ink }}>{p.name}, {p.age}</div>
              <div style={{ fontSize: 11, color: t.soft }}>{p.match}% · {p.rent}zł</div>
            </button>
          ))}
        </div>
      </div>
      <TabBar tab={tab} setTab={setTab}/>
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════
// 4) LISTINGS — redesigned
// ═══════════════════════════════════════════════════════════════
const SearchScreen = ({ onPerson, onBack, tab, setTab }) => {
  const t = useT(); const tr = useTr();
  const [city, setCity] = uS('');
  const [saved, setSaved] = uS(new Set());
  const CITIES = ['Kraków', 'Warsaw', 'Wrocław', 'Gdańsk', 'Poznań'];
  const filtered = city ? LISTINGS_DATA.filter(l => l.city === city) : LISTINGS_DATA;

  const toggleSave = (id) => setSaved(prev => {
    const n = new Set(prev);
    n.has(id) ? n.delete(id) : n.add(id);
    return n;
  });

  return (
    <div style={{ position: 'absolute', inset: 0, background: t.bg, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
      <div className="nice-scroll" style={{ flex: 1, overflowY: 'auto', paddingTop: 56, paddingBottom: 110 }}>

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', padding: '0 18px 14px' }}>
          <h1 style={{ margin: 0, fontFamily: "'Plus Jakarta Sans',system-ui,sans-serif", fontSize: 30, fontWeight: 800, letterSpacing: '-0.03em', color: t.ink }}>{tr.search_title}</h1>
          <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 11, color: t.mute }}>{filtered.length} {tr.listings_count}</span>
        </div>

        {/* City tabs — flat pills, horizontal scroll */}
        <div style={{ display: 'flex', gap: 7, padding: '0 18px 12px', overflowX: 'auto' }} className="nice-scroll">
          {[null, ...CITIES].map(c => {
            const active = c === null ? city === '' : city === c;
            return (
              <button key={c ?? '__all'} onClick={() => setCity(c ?? '')} style={{
                flexShrink: 0, height: 34, padding: '0 14px', borderRadius: 999,
                background: active ? t.ink : t.card,
                border: `1px solid ${active ? t.ink : t.line}`,
                color: active ? t.bg : t.soft,
                fontSize: 12, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit',
              }}>{c ?? tr.listings_all}</button>
            );
          })}
        </div>

        {/* Filter strip */}
        <div style={{ display: 'flex', gap: 7, padding: '0 18px 16px', overflowX: 'auto' }} className="nice-scroll">
          <Chip icon={<I.Filter s={11}/>}>{tr.search_filters} · 2</Chip>
          <Chip style={{ background: BRAND.tealLt, color: BRAND.tealDk, border: `1px solid rgba(31,191,204,0.3)` }}>1500–3000 PLN</Chip>
          <Chip style={{ background: BRAND.violetLt, color: BRAND.violetDk, border: `1px solid rgba(142,92,217,0.3)` }}>1–2 rooms</Chip>
        </div>

        {/* Empty state */}
        {filtered.length === 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '64px 18px 32px' }}>
            <div style={{ width: 72, height: 72, borderRadius: 22, background: t.bgSoft, border: `1px solid ${t.line}`, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 18 }}>
              <I.Home s={30} c={t.mute}/>
            </div>
            <div style={{ fontSize: 17, fontWeight: 700, color: t.ink, marginBottom: 6 }}>{tr.listings_empty}</div>
            <div style={{ fontSize: 13, color: t.soft, textAlign: 'center' }}>{tr.listings_emptySub}</div>
          </div>
        ) : (
          /* Listing cards */
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12, padding: '0 18px' }}>
            {filtered.map(l => (
              <div key={l.id} style={{ background: t.card, borderRadius: 22, border: `1px solid ${t.line}`, overflow: 'hidden', cursor: 'pointer', boxShadow: '0 2px 10px rgba(15,23,42,0.05)' }}>
                {/* Photo */}
                <Ph tint={l.tint} style={{ height: 168, borderRadius: 0, position: 'relative' }}>
                  {/* City pin chip */}
                  <div style={{ position: 'absolute', top: 10, left: 10, display: 'flex', alignItems: 'center', gap: 4, background: 'rgba(255,255,255,0.90)', backdropFilter: 'blur(8px)', borderRadius: 999, padding: '4px 10px', boxShadow: '0 2px 8px rgba(0,0,0,0.10)' }}>
                    <I.Pin s={10} c={t.ink}/>
                    <span style={{ fontSize: 11, fontWeight: 700, color: t.ink }}>{l.city}</span>
                  </div>
                  {/* Save button */}
                  <button onClick={() => toggleSave(l.id)} style={{ position: 'absolute', top: 10, right: 10, width: 34, height: 34, borderRadius: 999, background: 'rgba(255,255,255,0.90)', backdropFilter: 'blur(8px)', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', boxShadow: '0 2px 8px rgba(0,0,0,0.10)' }}>
                    <I.Heart s={14} c={saved.has(l.id) ? BRAND.magenta : t.mute} filled={saved.has(l.id)}/>
                  </button>
                </Ph>
                {/* Info */}
                <div style={{ padding: '14px 16px 16px' }}>
                  <div style={{ fontSize: 15.5, fontWeight: 700, letterSpacing: '-0.01em', color: t.ink, marginBottom: 4 }}>{l.title}</div>
                  <div style={{ fontSize: 12.5, color: t.soft, marginBottom: 12 }}>{l.rooms} rooms · {l.m2} m² · {l.district}</div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span style={{ fontSize: 18, fontWeight: 800, letterSpacing: '-0.025em', color: t.ink }}>
                      {l.rent} <span style={{ fontSize: 12, fontWeight: 500, color: t.mute }}>zł/mo</span>
                    </span>
                    <Pill variant="ghost" size="sm">View <I.Arrow s={11} c={t.ink}/></Pill>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        <div style={{ height: 8 }}/>
      </div>
      <TabBar tab={tab} setTab={setTab}/>
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════
// 5) DETAIL
// ═══════════════════════════════════════════════════════════════
const Detail = ({ person, onBack, onChat, onBook }) => {
  const t = useT(); const tr = useTr();
  const p = person || PEOPLE[0];
  const tagIcons = { plant: <I.Plant s={12}/>, coffee: <I.Coffee s={12}/>, music: <I.Music s={12}/>, moon: <I.Moon s={12}/> };
  const tagLabels = { plant: 'plant friend', coffee: 'slow mornings', music: 'music', moon: 'quiet nights' };
  return (
    <div style={{ position: 'absolute', inset: 0, background: t.bg, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
      <div className="nice-scroll" style={{ flex: 1, overflowY: 'auto' }}>
        <Ph tint={p.tint} style={{ height: 360, borderRadius: 0, position: 'relative' }}>
          <button onClick={onBack} style={{ position: 'absolute', top: 56, left: 16, width: 38, height: 38, borderRadius: 999, background: 'rgba(255,255,255,0.88)', backdropFilter: 'blur(10px)', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}><I.Back s={16} c="#1F2937"/></button>
          <button style={{ position: 'absolute', top: 56, right: 16, width: 38, height: 38, borderRadius: 999, background: 'rgba(255,255,255,0.88)', backdropFilter: 'blur(10px)', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}><I.Heart s={16} c={BRAND.magenta}/></button>
          <div style={{ position: 'absolute', bottom: 16, left: '50%', transform: 'translateX(-50%)', display: 'flex', gap: 5 }}>
            {[0,1,2,3].map(i => <span key={i} style={{ width: i===0?18:6, height: 6, borderRadius: 999, background: i===0?'white':'rgba(255,255,255,0.5)' }}/>)}
          </div>
        </Ph>
        <div style={{ padding: '20px 18px 130px' }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 10 }}>
            <div>
              <h1 style={{ margin: 0, fontFamily: "'Plus Jakarta Sans',system-ui,sans-serif", fontSize: 28, fontWeight: 800, letterSpacing: '-0.025em', lineHeight: 1.1, color: t.ink }}>{p.name}, {p.age}</h1>
              <div style={{ fontSize: 13, color: t.soft, marginTop: 4, display: 'flex', alignItems: 'center', gap: 5 }}><I.Pin s={12}/> {p.loc}</div>
            </div>
            <div style={{ padding: '6px 12px', borderRadius: 999, backgroundImage: `linear-gradient(110deg, ${BRAND.tealLt}, ${BRAND.magentaLt})`, fontSize: 12, fontWeight: 700, color: BRAND.tealDk, display: 'flex', alignItems: 'center', gap: 4 }}>
              <I.Sparkle s={11} c={BRAND.tealDk}/> {p.match}% match
            </div>
          </div>
          <div style={{ display: 'flex', gap: 7, marginTop: 12, flexWrap: 'wrap' }}>
            {p.tags.map(tag => (
              <span key={tag} style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '6px 11px', borderRadius: 999, background: t.bgSoft, fontSize: 11.5, fontWeight: 500, color: t.ink, border: `1px solid ${t.line}` }}>
                {tagIcons[tag]} {tagLabels[tag]}
              </span>
            ))}
          </div>
          <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 10, letterSpacing: '0.16em', textTransform: 'uppercase', color: t.mute, marginTop: 22 }}>{tr.detail_about}</div>
          <p style={{ margin: '6px 0 0', fontSize: 14, lineHeight: 1.55, color: t.ink }}>Designer working from home most days. Love a quiet kitchen, pour-over Sundays, and a tidy entryway. Pet-friendly (one fluffy cat 🐈‍⬛). Looking for someone calm, considerate, and into plants.</p>
          <div style={{ marginTop: 20, padding: 16, borderRadius: 20, border: `1px solid ${t.line}`, background: t.bgSoft }}>
            <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 10, color: t.ink }}>Compatibility breakdown</div>
            {[{ l:'Sleep schedule',v:0.96,c:BRAND.teal },{ l:'Cleanliness',v:0.92,c:BRAND.teal },{ l:'Noise level',v:0.88,c:BRAND.violet },{ l:'Social vibe',v:0.78,c:BRAND.magenta }].map(b => (
              <div key={b.l} style={{ marginBottom: 8 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11.5, marginBottom: 4 }}>
                  <span style={{ color: t.soft }}>{b.l}</span>
                  <span style={{ fontWeight: 700, color: t.ink }}>{Math.round(b.v*100)}%</span>
                </div>
                <div style={{ height: 5, background: t.line, borderRadius: 999, overflow: 'hidden' }}>
                  <div style={{ width: `${b.v*100}%`, height: '100%', background: b.c, borderRadius: 999 }}/>
                </div>
              </div>
            ))}
          </div>
          <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 10, letterSpacing: '0.16em', textTransform: 'uppercase', color: t.mute, marginTop: 24 }}>{tr.detail_room}</div>
          <h3 style={{ margin: '6px 0 4px', fontSize: 18, fontWeight: 700, letterSpacing: '-0.015em', color: t.ink }}>{p.room}</h3>
          <div style={{ fontSize: 13, color: t.soft }}>{p.rent} zł/month · all bills inc. · 4mo deposit</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginTop: 12 }}>
            <Ph tint="turq" style={{ aspectRatio: '1/1' }}/>
            <Ph tint="violet" style={{ aspectRatio: '1/1' }}/>
          </div>
          <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 10, letterSpacing: '0.16em', textTransform: 'uppercase', color: t.mute, marginTop: 24 }}>{tr.detail_house}</div>
          <div style={{ marginTop: 8, display: 'flex', flexDirection: 'column', gap: 8 }}>
            {['No smoking inside','Quiet after 22:00','Cats welcome, dogs no','Splitting groceries: separately'].map(r => (
              <div key={r} style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 13.5, color: t.ink }}>
                <span style={{ width: 22, height: 22, borderRadius: 999, background: BRAND.tealLt, color: BRAND.tealDk, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}><I.Check s={12} c={BRAND.tealDk}/></span>
                {r}
              </div>
            ))}
          </div>
        </div>
      </div>
      <div style={{ position: 'absolute', left: 0, right: 0, bottom: 0, padding: '14px 18px 28px', background: t.bg, borderTop: `1px solid ${t.line}`, display: 'flex', gap: 10 }}>
        <Pill variant="ghost" size="lg" onClick={onChat} style={{ flexShrink: 0, paddingLeft: 18, paddingRight: 18 }}><I.Chat s={16}/> {tr.detail_msg}</Pill>
        <Pill variant="grad" size="lg" onClick={onBook} style={{ flex: 1 }}>{tr.detail_book} <I.Arrow s={14} c="white"/></Pill>
      </div>
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════
// 6) CHAT
// ═══════════════════════════════════════════════════════════════
const Chat = ({ person, onBack, tab, setTab }) => {
  const t = useT(); const tr = useTr();
  const p = person || PEOPLE[0];
  const [text, setText] = uS('');
  const msgs = [
    { from:'them', text:"Hey! Saw your profile — we're a 96% match 🌿" },
    { from:'them', text:'Are you still looking for May?' },
    { from:'me',   text:'Yes! And the room photos look gorgeous ✿' },
    { from:'me',   text:'Could we do a video walk-through this week?' },
    { from:'them', text:'Of course. Thursday 7pm work?' },
    { from:'them', text:"I'll show you the kitchen, the cat, and the balcony 🐈" },
  ];
  return (
    <div style={{ position: 'absolute', inset: 0, background: t.bg, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      <div style={{ paddingTop: 54, padding: '54px 14px 12px', borderBottom: `1px solid ${t.line}`, background: t.bg, display: 'flex', alignItems: 'center', gap: 10 }}>
        <button onClick={onBack} style={{ width: 36, height: 36, borderRadius: 999, background: t.bgSoft, border: `1px solid ${t.line}`, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}><I.Back s={15} c={t.ink}/></button>
        <Avatar size={36} hue={p.hue} label={p.name[0]} ring/>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 14.5, fontWeight: 700, letterSpacing: '-0.01em', color: t.ink }}>{p.name}</div>
          <div style={{ fontSize: 11, color: BRAND.teal }}>● online · {tr.chat_typing}</div>
        </div>
        <button style={{ width: 36, height: 36, borderRadius: 999, background: t.bgSoft, border: `1px solid ${t.line}`, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}><I.Sparkle s={15} c={t.soft}/></button>
      </div>
      <div className="nice-scroll" style={{ flex: 1, overflowY: 'auto', padding: '16px 14px 12px', display: 'flex', flexDirection: 'column', gap: 8 }}>
        <div style={{ alignSelf: 'center', padding: '8px 14px', borderRadius: 999, backgroundImage: `linear-gradient(110deg, ${BRAND.tealLt}, ${BRAND.magentaLt})`, fontSize: 11.5, fontWeight: 600, color: t.ink, display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
          <I.Sparkle s={12} c={BRAND.tealDk}/> You matched with {p.name} · {p.match}%
        </div>
        {msgs.map((m, i) => (
          <div key={i} style={{ alignSelf: m.from==='me'?'flex-end':'flex-start', maxWidth: '78%', padding: '10px 14px', borderRadius: 20, borderBottomRightRadius: m.from==='me'?6:20, borderBottomLeftRadius: m.from==='me'?20:6, backgroundImage: m.from==='me'?GRAD:undefined, background: m.from==='me'?undefined:t.bgSoft, color: m.from==='me'?'white':t.ink, fontSize: 14, lineHeight: 1.4 }}>{m.text}</div>
        ))}
        <div style={{ alignSelf: 'flex-start', padding: '10px 14px', borderRadius: 20, borderBottomLeftRadius: 6, background: t.bgSoft, display: 'flex', gap: 4 }}>
          {[0,1,2].map(i => <span key={i} style={{ width: 6, height: 6, borderRadius: 999, background: t.mute, animation: `bounce 1.2s ${i*0.15}s infinite` }}/>)}
        </div>
      </div>
      <div style={{ padding: '10px 12px 26px', borderTop: `1px solid ${t.line}`, background: t.bg }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: t.bgSoft, borderRadius: 999, padding: 5, paddingLeft: 16 }}>
          <input value={text} onChange={e => setText(e.target.value)} placeholder={tr.chat_input} style={{ flex: 1, height: 38, border: 'none', outline: 'none', background: 'transparent', fontSize: 14, color: t.ink, fontFamily: 'inherit' }}/>
          <button style={{ width: 38, height: 38, borderRadius: 999, border: 'none', backgroundImage: GRAD, color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}><I.Send s={16} c="white"/></button>
        </div>
      </div>
      <style>{`@keyframes bounce{0%,80%,100%{transform:translateY(0);opacity:0.4}40%{transform:translateY(-3px);opacity:1}}`}</style>
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════
// 7) MATCHES
// ═══════════════════════════════════════════════════════════════
const Matches = ({ onPerson, tab, setTab }) => {
  const t = useT(); const tr = useTr();
  return (
    <div style={{ position: 'absolute', inset: 0, background: t.bg, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      <div className="nice-scroll" style={{ flex: 1, overflowY: 'auto', paddingTop: 56, paddingBottom: 110 }}>
        <div style={{ padding: '0 18px' }}>
          <h1 style={{ margin: 0, fontFamily: "'Plus Jakarta Sans',system-ui,sans-serif", fontSize: 30, fontWeight: 800, letterSpacing: '-0.03em', color: t.ink }}>{tr.matches_title}</h1>
          <p style={{ margin: '4px 0 0', fontSize: 13.5, color: t.soft }}>{tr.matches_sub}</p>
        </div>
        <SectionTitle title="New this week" action={{ label: 'View 12' }}/>
        <div style={{ display: 'flex', gap: 10, padding: '0 18px', overflowX: 'auto' }} className="nice-scroll">
          {PEOPLE.slice(0, 5).map(p => (
            <button key={p.name} onClick={() => onPerson(p)} style={{ flexShrink: 0, width: 88, background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit', textAlign: 'center', color: t.ink }}>
              <Avatar size={70} hue={p.hue} label={p.name[0]} ring/>
              <div style={{ fontSize: 12, fontWeight: 600, marginTop: 6, color: t.ink }}>{p.name}</div>
              <div style={{ fontSize: 10.5, color: BRAND.teal, fontWeight: 700 }}>{p.match}%</div>
            </button>
          ))}
        </div>
        <SectionTitle title="Conversations"/>
        <div style={{ padding: '0 6px', display: 'flex', flexDirection: 'column' }}>
          {PEOPLE.slice(0, 5).map((p, i) => (
            <button key={p.name} onClick={() => onPerson(p)} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 12px', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit', textAlign: 'left', color: t.ink }}>
              <Avatar size={48} hue={p.hue} label={p.name[0]}/>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                  <span style={{ fontSize: 14.5, fontWeight: 700, color: t.ink }}>{p.name}</span>
                  <span style={{ fontSize: 10.5, color: t.mute }}>{['12m','1h','3h','yesterday','2d'][i]}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 2 }}>
                  <span style={{ fontSize: 12.5, color: t.soft, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 200 }}>
                    {['Thursday 7pm work? ✿','Sounds good — sending link','See you Saturday!','Bringing matcha 🌿','Sure, let me check'][i]}
                  </span>
                  {i < 2 && <span style={{ minWidth: 18, height: 18, padding: '0 6px', backgroundImage: GRAD, borderRadius: 999, color: 'white', fontSize: 10.5, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{[2,1][i]}</span>}
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>
      <TabBar tab={tab} setTab={setTab}/>
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════
// 8) PROFILE — redesigned per spec
// ═══════════════════════════════════════════════════════════════
const Profile = ({ tab, setTab }) => {
  const t = useT(); const tr = useTr();
  const { lang } = uC(ThemeCtx);
  const [activeLang, setActiveLang] = uS(lang || 'en');

  const TRAITS = ['Night owl', 'Tidy', 'Social', 'Plant lover', 'Coffee ritual', 'Quiet nights', 'Remote work', 'Non-smoker'];
  const TRAIT_COUNT = TRAITS.length;

  const bars = [
    { l: 'Sleep schedule', v: 0.96, c: BRAND.teal   },
    { l: 'Cleanliness',    v: 0.92, c: BRAND.teal   },
    { l: 'Noise level',    v: 0.78, c: BRAND.violet },
    { l: 'Social vibe',    v: 0.85, c: BRAND.violet },
  ];

  return (
    <div style={{ position: 'absolute', inset: 0, background: t.bg, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
      <div className="nice-scroll" style={{ flex: 1, overflowY: 'auto', paddingTop: 56, paddingBottom: 110 }}>

        {/* 1. Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 18px 20px' }}>
          <h1 style={{ margin: 0, fontFamily: "'Plus Jakarta Sans',system-ui,sans-serif", fontSize: 26, fontWeight: 800, letterSpacing: '-0.025em', color: t.ink }}>{tr.profile_title}</h1>
          <button style={{ background: 'none', border: 'none', color: BRAND.teal, fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}>{tr.profile_edit}</button>
        </div>

        {/* 2. Hero — avatar + halo + chips */}
        <div style={{ padding: '0 18px 22px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>

          {/* Halo + avatar wrapper */}
          <div style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 14 }}>
            {/* Subtle ellipse halo */}
            <div style={{ position: 'absolute', width: 200, height: 100, borderRadius: '50%', background: `rgba(142,92,217,0.18)`, filter: 'blur(22px)', top: -10, left: '50%', transform: 'translateX(-50%)', pointerEvents: 'none' }}/>
            {/* Avatar */}
            <div style={{ position: 'relative' }}>
              <div style={{ width: 96, height: 96, borderRadius: '50%', backgroundImage: GRAD, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: 38, fontWeight: 800, boxShadow: '0 8px 28px rgba(31,191,204,0.35)' }}>M</div>
              {/* Verified badge */}
              <div style={{ position: 'absolute', bottom: 2, right: 2, width: 26, height: 26, borderRadius: '50%', background: '#10B981', border: '2.5px solid white', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <I.Check s={11} c="white"/>
              </div>
            </div>
          </div>

          {/* Name + location */}
          <div style={{ textAlign: 'center', marginBottom: 12 }}>
            <div style={{ fontFamily: "'Plus Jakarta Sans',system-ui,sans-serif", fontSize: 22, fontWeight: 800, letterSpacing: '-0.02em', color: t.ink }}>Mira Adeyemi</div>
            <div style={{ fontSize: 13, fontWeight: 500, color: t.mute, marginTop: 3 }}>Warsaw · 25</div>
          </div>

          {/* Status chips — single row */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ background: BRAND.tealLt, borderRadius: 999, padding: '6px 13px', fontSize: 12, fontWeight: 600, color: BRAND.tealDk }}>
              ✦ {tr.profile_quiz}
            </div>
            <div style={{ width: 4, height: 4, borderRadius: '50%', background: t.mute }}/>
            <div style={{ background: BRAND.violetLt, borderRadius: 999, padding: '6px 13px', fontSize: 12, fontWeight: 600, color: BRAND.violetDk || BRAND.violet }}>
              {TRAIT_COUNT} {tr.profile_traits}
            </div>
          </div>

          {/* Verify ghost button */}
          <button style={{ marginTop: 14, display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', background: t.card, borderRadius: 14, border: `1.5px solid ${BRAND.violet}`, padding: '13px 16px', cursor: 'pointer', fontFamily: 'inherit' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
              <I.GradCap s={16} c={t.ink}/>
              <span style={{ fontSize: 13, fontWeight: 600, color: t.ink }}>{tr.profile_verify}</span>
            </div>
            <I.Arrow s={14} c={t.mute}/>
          </button>
        </div>

        {/* 3. Stats row */}
        <div style={{ padding: '0 18px 22px' }}>
          <div style={{ display: 'flex', alignItems: 'stretch', background: t.bgSoft, borderRadius: 16, border: `1px solid ${t.line}`, overflow: 'hidden' }}>
            {[{ k:'24', l:'MATCHES' }, { k:'96%', l:'AVG FIT' }, { k:'4.9★', l:'RATING' }].map((s, i) => [
              <div key={s.l} style={{ flex: 1, textAlign: 'center', padding: '18px 8px' }}>
                <div style={{ fontFamily: "'Plus Jakarta Sans',system-ui,sans-serif", fontSize: 20, fontWeight: 800, letterSpacing: '-0.02em', color: t.ink }}>{s.k}</div>
                <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 9, fontWeight: 500, letterSpacing: '0.16em', textTransform: 'uppercase', color: t.mute, marginTop: 4 }}>{s.l}</div>
              </div>,
              i < 2 && <div key={`d${i}`} style={{ width: 1, background: t.line, margin: '14px 0' }}/>,
            ])}
          </div>
        </div>

        {/* 4. Traits — text only, no emoji, no raw keys */}
        <SectionTitle title="Featured traits"/>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, padding: '0 18px 22px' }}>
          {TRAITS.map(trait => (
            <span key={trait} style={{ background: t.card, border: `1px solid ${t.line}`, borderRadius: 999, padding: '8px 14px', fontSize: 13, fontWeight: 500, color: t.ink }}>
              {trait}
            </span>
          ))}
        </div>

        {/* 5. Lifestyle breakdown */}
        <SectionTitle title="Lifestyle"/>
        <div style={{ padding: '0 18px 22px' }}>
          <Card>
            {bars.map((b, i) => (
              <div key={b.l} style={{ marginBottom: i < bars.length - 1 ? 14 : 0 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12.5, marginBottom: 7 }}>
                  <span style={{ fontWeight: 500, color: t.soft }}>{b.l}</span>
                  <span style={{ fontWeight: 700, color: t.ink }}>{Math.round(b.v * 100)}%</span>
                </div>
                <div style={{ height: 5, background: t.line, borderRadius: 999, overflow: 'hidden' }}>
                  <div style={{ width: `${b.v*100}%`, height: '100%', background: b.c, borderRadius: 999 }}/>
                </div>
              </div>
            ))}
          </Card>
        </div>

        {/* 6. Settings rows */}
        <SectionTitle title="Settings"/>
        <div style={{ padding: '0 18px 22px' }}>
          <Card padding={0}>
            {[
              { l:'Vibe quiz', sub:'Last updated 2 weeks ago', icon:'🌿' },
              { l:'Verification', sub:'ID + selfie verified ✓', icon:'✓' },
              { l:'Deposit & payments', sub:'Stripe linked', icon:'€' },
              { l:'Notifications', sub:'Quiet hours 22:00–08:00', icon:'◔' },
            ].map((r, i, arr) => (
              <div key={r.l} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '14px 16px', borderBottom: i < arr.length - 1 ? `1px solid ${t.line}` : 'none' }}>
                <div style={{ width: 36, height: 36, borderRadius: 12, background: t.bgSoft, border: `1px solid ${t.line}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16 }}>{r.icon}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13.5, fontWeight: 600, color: t.ink }}>{r.l}</div>
                  <div style={{ fontSize: 11.5, color: t.soft, marginTop: 1 }}>{r.sub}</div>
                </div>
                <I.Arrow s={13} c={t.mute}/>
              </div>
            ))}
          </Card>
        </div>

        {/* 7. Language selector — compact EN | PL segmented */}
        <div style={{ padding: '0 18px 26px', display: 'flex', flexDirection: 'column', gap: 8 }}>
          <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 10, fontWeight: 500, letterSpacing: '0.16em', textTransform: 'uppercase', color: t.mute }}>Language</div>
          <div style={{ display: 'flex', background: t.bgSoft, borderRadius: 14, padding: 4, border: `1px solid ${t.line}`, width: 'fit-content' }}>
            {(['en', 'pl']).map(l => (
              <button key={l} onClick={() => setActiveLang(l)} style={{
                padding: '8px 24px', borderRadius: 10, border: 'none', cursor: 'pointer',
                fontFamily: 'inherit', fontSize: 13, fontWeight: 700,
                background: activeLang === l ? t.card : 'transparent',
                color: activeLang === l ? t.ink : t.mute,
                boxShadow: activeLang === l ? '0 1px 5px rgba(15,23,42,0.10)' : 'none',
                transition: 'all .18s',
              }}>{l.toUpperCase()}</button>
            ))}
          </div>
        </div>

        {/* 8. CTA */}
        <div style={{ padding: '0 18px 32px' }}>
          <Pill variant="grad" size="lg" style={{ width: '100%' }}>
            {tr.profile_see} <I.Arrow s={14} c="white"/>
          </Pill>
        </div>

        <p style={{ textAlign: 'center', margin: 0, paddingBottom: 8, fontSize: 11, color: t.mute, fontFamily: 'JetBrains Mono, monospace', letterSpacing: '0.1em' }}>v 2.5.0 · made with ✿</p>
      </div>
      <TabBar tab={tab} setTab={setTab}/>
    </div>
  );
};

Object.assign(window, { PEOPLE, LISTINGS_DATA, Splash, Login, HomeA, HomeB, HomeC, SearchScreen, Detail, Chat, Matches, Profile });
