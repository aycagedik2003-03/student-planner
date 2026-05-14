/* Staymate Mobile — 8 screens */
const { useState: uS, useEffect: uE } = React;

const PEOPLE = [
  { name: 'Zofia',   age: 24, hue: 1, vibe: 'Plant-mom · early bird',     loc: 'Mokotów, Warsaw',     match: 96, rent: 1850, room: 'sunny corner room', tags: ['plant','coffee','moon'], tint: 'rose' },
  { name: 'Kasia',   age: 27, hue: 2, vibe: 'Studio music · soft jazz',   loc: 'Kazimierz, Kraków',   match: 92, rent: 1620, room: 'bright loft + balcony', tags: ['music','coffee'], tint: 'turq' },
  { name: 'Marta',   age: 22, hue: 3, vibe: 'Quiet weeknights · matcha',  loc: 'Praga, Warsaw',       match: 91, rent: 1490, room: 'cozy parquet room', tags: ['plant','moon'], tint: 'rose' },
  { name: 'Ola',     age: 29, hue: 4, vibe: 'Designer · slow mornings',   loc: 'Wrzeszcz, Gdańsk',    match: 89, rent: 2100, room: 'sea-light studio', tags: ['coffee','plant'], tint: 'turq' },
  { name: 'Hania',   age: 25, hue: 5, vibe: 'Reads at 11pm · soft girl',  loc: 'Stare Miasto, Wrocław', match: 88, rent: 1700, room: 'warm wood room', tags: ['moon','plant'], tint: 'rose' },
  { name: 'Iga',     age: 23, hue: 0, vibe: 'Yoga + soft synth',          loc: 'Powiśle, Warsaw',     match: 86, rent: 1880, room: 'minimalist white room', tags: ['music','moon'], tint: 'turq' },
];

// =========================================================
// 1) SPLASH
// =========================================================
const Splash = ({ onCta, onSignin }) => {
  const t = useT(); const tr = useTr();
  return (
    <div style={{ position: 'absolute', inset: 0, background: t.bg, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      {/* Aurora */}
      <div style={{ position: 'absolute', width: 360, height: 360, borderRadius: '50%', filter: 'blur(70px)', background: 'radial-gradient(circle, #00CFC8 0%, transparent 70%)', opacity: 0.45, top: -60, left: -80 }}/>
      <div style={{ position: 'absolute', width: 360, height: 360, borderRadius: '50%', filter: 'blur(70px)', background: 'radial-gradient(circle, #FF9ACD 0%, transparent 70%)', opacity: 0.45, bottom: -60, right: -80 }}/>
      <div style={{ position: 'absolute', width: 200, height: 200, borderRadius: '50%', filter: 'blur(50px)', background: 'radial-gradient(circle, #FF9ACD 0%, transparent 70%)', opacity: 0.3, top: '40%', left: '20%' }}/>

      <div style={{ position: 'relative', flex: 1, display: 'flex', flexDirection: 'column', padding: '70px 24px 28px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <I.Logo s={26} />
          <span style={{ fontSize: 18, fontWeight: 700, letterSpacing: '-0.02em' }}>staymate</span>
        </div>

        {/* Floating profile cards */}
        <div style={{ position: 'relative', height: 320, marginTop: 32 }}>
          <div style={{
            position: 'absolute', top: 24, left: 14, width: 170, height: 220,
            borderRadius: 26, background: t.card, border: `1px solid ${t.line}`,
            transform: 'rotate(-7deg)', padding: 12, boxShadow: '0 18px 40px -16px rgba(0,207,200,0.4)',
          }}>
            <Ph tint="rose" style={{ height: 130, borderRadius: 18 }} />
            <div style={{ marginTop: 10, fontSize: 13, fontWeight: 700 }}>Zofia, 24</div>
            <div style={{ fontSize: 11, color: t.soft }}>Mokotów · 96% ✿</div>
            <div style={{ marginTop: 6, display: 'flex', gap: 4 }}>
              <span style={{ width: 18, height: 18, borderRadius: 6, background: '#FFE0EF', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><I.Plant s={11} c="#F06EB1" /></span>
              <span style={{ width: 18, height: 18, borderRadius: 6, background: '#E6FBFA', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><I.Coffee s={11} c="#00A8A2" /></span>
            </div>
          </div>
          <div style={{
            position: 'absolute', top: 4, right: 10, width: 180, height: 240,
            borderRadius: 28, padding: 12, transform: 'rotate(6deg)',
            background: t.card, border: `1px solid ${t.line}`,
            boxShadow: '0 22px 48px -18px rgba(255,154,205,0.45)',
          }}>
            <Ph tint="turq" style={{ height: 150, borderRadius: 20 }} />
            <div style={{ marginTop: 10, fontSize: 13, fontWeight: 700 }}>Kasia, 27</div>
            <div style={{ fontSize: 11, color: t.soft }}>Kazimierz · 92% ✿</div>
            <div style={{ marginTop: 6, display: 'flex', gap: 4 }}>
              <span style={{ width: 18, height: 18, borderRadius: 6, background: '#E6FBFA', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><I.Music s={11} c="#00A8A2" /></span>
            </div>
          </div>
          <div style={{
            position: 'absolute', bottom: 6, left: '34%', padding: '8px 12px',
            borderRadius: 999, background: t.card, border: `1px solid ${t.line}`,
            display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, fontWeight: 600,
            boxShadow: '0 10px 24px -12px rgba(31,41,55,0.2)',
          }}>
            <span style={{ width: 6, height: 6, borderRadius: 999, background: '#00CFC8' }}/>
            128 new this week
          </div>
        </div>

        <div style={{ marginTop: 'auto' }}>
          <span style={{ display: 'inline-block', fontFamily: 'JetBrains Mono', fontSize: 10, letterSpacing: '0.16em', textTransform: 'uppercase', color: t.soft, padding: '5px 11px', borderRadius: 999, border: `1px solid ${t.line}`, background: t.card }}>
            {tr.splash_eyebrow}
          </span>
          <h1 style={{
            margin: '14px 0 10px', fontFamily: 'Plus Jakarta Sans', fontWeight: 800,
            fontSize: 40, lineHeight: 1.02, letterSpacing: '-0.035em', whiteSpace: 'pre-line', color: t.ink,
          }}>{tr.splash_title}</h1>
          <p style={{ margin: 0, fontSize: 14.5, lineHeight: 1.5, color: t.soft, maxWidth: 280 }}>{tr.splash_sub}</p>

          <div style={{ display: 'flex', gap: 10, marginTop: 22 }}>
            <Pill variant="grad" size="lg" onClick={onCta} style={{ flex: 1 }}>{tr.splash_cta} <I.Arrow s={14} /></Pill>
          </div>
          <button onClick={onSignin} style={{
            background: 'none', border: 'none', color: t.soft, fontSize: 13, fontWeight: 500,
            marginTop: 14, padding: 10, width: '100%', cursor: 'pointer', fontFamily: 'inherit',
          }}>{tr.splash_signin}</button>
        </div>
      </div>
    </div>
  );
};

// =========================================================
// 2) LOGIN
// =========================================================
const Login = ({ onBack, onContinue }) => {
  const t = useT(); const tr = useTr();
  const [mode, setMode] = uS('email');
  const [v, setV] = uS('');
  return (
    <div style={{ position: 'absolute', inset: 0, background: t.bg, display: 'flex', flexDirection: 'column', padding: '64px 22px 26px' }}>
      <button onClick={onBack} style={{ width: 38, height: 38, borderRadius: 999, background: t.card, border: `1px solid ${t.line}`, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
        <I.Back s={16} c={t.ink} />
      </button>
      <h1 style={{ margin: '34px 0 6px', fontSize: 32, fontWeight: 800, letterSpacing: '-0.03em', lineHeight: 1.1 }}>{tr.login_title}</h1>
      <p style={{ margin: 0, fontSize: 14, color: t.soft }}>{tr.login_sub}</p>

      {/* Mode tabs */}
      <div style={{ display: 'flex', background: t.bgSoft, borderRadius: 14, padding: 4, marginTop: 24, position: 'relative' }}>
        <div style={{
          position: 'absolute', top: 4, bottom: 4,
          left: mode === 'email' ? 4 : '50%',
          right: mode === 'email' ? '50%' : 4,
          background: t.card, borderRadius: 11, border: `1px solid ${t.line}`,
          transition: 'all .25s ease',
        }}/>
        {['email','phone'].map(m => (
          <button key={m} onClick={() => setMode(m)} style={{
            flex: 1, height: 36, background: 'none', border: 'none', cursor: 'pointer',
            position: 'relative', fontFamily: 'inherit', fontSize: 13, fontWeight: 600,
            color: mode === m ? t.ink : t.mute,
          }}>{m === 'email' ? tr.login_email : tr.login_phone}</button>
        ))}
      </div>

      <div style={{ marginTop: 14, position: 'relative' }}>
        <input value={v} onChange={e => setV(e.target.value)} placeholder={mode === 'email' ? 'mira@staymate.app' : '+48 ___ ___ ___'} style={{
          width: '100%', height: 54, borderRadius: 16,
          border: `1px solid ${t.line}`, background: t.card,
          padding: '0 18px', fontSize: 15, color: t.ink, fontFamily: 'inherit',
          outline: 'none', boxSizing: 'border-box',
        }}/>
      </div>

      <Pill variant="grad" size="lg" onClick={onContinue} style={{ marginTop: 14, width: '100%' }}>
        {tr.login_continue} <I.Arrow s={14} />
      </Pill>

      {/* OR */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, margin: '22px 0 14px' }}>
        <div style={{ flex: 1, height: 1, background: t.line }}/>
        <span style={{ fontSize: 11, color: t.mute, fontFamily: 'JetBrains Mono', letterSpacing: '0.12em', textTransform: 'uppercase' }}>{tr.login_or}</span>
        <div style={{ flex: 1, height: 1, background: t.line }}/>
      </div>

      <div style={{ display: 'flex', gap: 10 }}>
        {['  Apple','G  Google','f  Facebook'].map(s => (
          <button key={s} style={{
            flex: 1, height: 50, borderRadius: 14, background: t.card,
            border: `1px solid ${t.line}`, fontSize: 13, fontWeight: 600, color: t.ink,
            fontFamily: 'inherit', cursor: 'pointer',
          }}>{s}</button>
        ))}
      </div>

      <p style={{ marginTop: 'auto', fontSize: 11, lineHeight: 1.5, color: t.mute, textAlign: 'center' }}>{tr.login_terms}</p>
    </div>
  );
};

// =========================================================
// 3) HOME (3 variations)
// =========================================================
const HomeA = ({ onPerson, onSearch, tab, setTab }) => {
  const t = useT(); const tr = useTr();
  const filters = ['Plant friends','Early birds','No smoke','Pet ok','Quiet','LGBTQ+'];
  return (
    <div style={{ position: 'absolute', inset: 0, background: t.bg, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
      <div className="nice-scroll" style={{ flex: 1, overflowY: 'auto', paddingTop: 56, paddingBottom: 110 }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 18px' }}>
          <div>
            <div style={{ fontFamily: 'JetBrains Mono', fontSize: 10, letterSpacing: '0.14em', textTransform: 'uppercase', color: t.soft }}>{tr.home_hi}</div>
            <h1 style={{ margin: '4px 0 0', fontSize: 26, fontWeight: 800, letterSpacing: '-0.025em', lineHeight: 1.1 }}>{tr.home_q}</h1>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button style={{ width: 40, height: 40, borderRadius: 999, background: t.card, border: `1px solid ${t.line}`, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', position: 'relative' }}>
              <I.Bell s={18} c={t.soft} />
              <span style={{ position: 'absolute', top: 9, right: 10, width: 7, height: 7, borderRadius: 999, background: '#FF9ACD', boxShadow: '0 0 0 2px '+t.bg }}/>
            </button>
          </div>
        </div>

        {/* Search shortcut */}
        <button onClick={onSearch} style={{
          display: 'flex', alignItems: 'center', gap: 10,
          width: 'calc(100% - 36px)', margin: '14px 18px 0',
          height: 50, padding: '0 16px', borderRadius: 16,
          background: t.bgSoft, border: `1px solid ${t.line}`,
          color: t.mute, fontFamily: 'inherit', fontSize: 14, cursor: 'pointer',
        }}>
          <I.Search s={18} c={t.mute} />
          <span style={{ flex: 1, textAlign: 'left' }}>{tr.search_ph}</span>
          <span style={{ background: t.card, border: `1px solid ${t.line}`, padding: '4px 8px', borderRadius: 8, fontFamily: 'JetBrains Mono', fontSize: 10, color: t.soft }}>⌘K</span>
        </button>

        {/* Quick filters */}
        <SectionTitle title={tr.home_quick} />
        <div style={{ display: 'flex', gap: 7, padding: '0 18px', overflowX: 'auto' }} className="nice-scroll">
          {filters.map((f, i) => <Chip key={f} active={i === 0}>{f}</Chip>)}
        </div>

        {/* Featured banner */}
        <div style={{ padding: '0 18px', marginTop: 18 }}>
          <Card padding={0} style={{
            position: 'relative', overflow: 'hidden', borderRadius: 24,
            backgroundImage: 'linear-gradient(135deg, #00CFC8 0%, #6BD8E8 45%, #FF9ACD 100%)',
            border: 'none', color: 'white', minHeight: 132,
          }}>
            <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(120px circle at 100% 0%, rgba(255,255,255,0.35), transparent)' }}/>
            <div style={{ position: 'relative', padding: 18 }}>
              <div style={{ fontFamily: 'JetBrains Mono', fontSize: 9.5, letterSpacing: '0.16em', textTransform: 'uppercase', opacity: 0.85 }}>vibe quiz · 2 min</div>
              <div style={{ marginTop: 6, fontSize: 22, fontWeight: 700, letterSpacing: '-0.02em', lineHeight: 1.15, maxWidth: 200 }}>Get 3× better matches in 2 minutes.</div>
              <Pill variant="ghost" size="sm" style={{ marginTop: 12, background: 'white', color: '#1F2937', border: 'none' }}>Start quiz <I.Arrow s={12} /></Pill>
            </div>
            <div style={{ position: 'absolute', right: 14, bottom: 14, display: 'flex' }}>
              {[0,1,2].map(i => (
                <div key={i} style={{ width: 30, height: 30, borderRadius: 999, marginLeft: -8, background: ['#FFE0EF','#CCF6F4','#FFC4DF'][i], border: '2px solid white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12 }}>
                  {['🌿','☕','🌙'][i]}
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Today's matches */}
        <SectionTitle title={tr.home_today} action={{ label: tr.home_seeAll }} />
        <div style={{ display: 'flex', gap: 12, overflowX: 'auto', padding: '0 18px 4px' }} className="nice-scroll">
          {PEOPLE.slice(0, 6).map(p => (
            <button key={p.name} onClick={() => onPerson(p)} style={{
              flexShrink: 0, width: 168, background: t.card, borderRadius: 22,
              border: `1px solid ${t.line}`, padding: 10, textAlign: 'left',
              cursor: 'pointer', fontFamily: 'inherit', color: t.ink,
            }}>
              <Ph tint={p.tint} style={{ height: 188, borderRadius: 16, position: 'relative' }}>
                <div style={{ position: 'absolute', top: 8, left: 8, padding: '4px 8px', borderRadius: 999, background: 'rgba(255,255,255,0.85)', backdropFilter: 'blur(8px)', fontSize: 10.5, fontWeight: 700, color: '#00A8A2' }}>
                  {p.match}% match
                </div>
                <div style={{ position: 'absolute', top: 8, right: 8, width: 26, height: 26, borderRadius: 999, background: 'rgba(255,255,255,0.85)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <I.Heart s={13} c="#F06EB1" />
                </div>
              </Ph>
              <div style={{ padding: '10px 6px 4px' }}>
                <div style={{ fontSize: 14, fontWeight: 700, letterSpacing: '-0.01em' }}>{p.name}, {p.age}</div>
                <div style={{ fontSize: 11.5, color: t.soft, marginTop: 2 }}>{p.loc.split(',')[0]}</div>
                <div style={{ fontSize: 12.5, fontWeight: 600, color: t.ink, marginTop: 6 }}>{p.rent} zł<span style={{ color: t.mute, fontSize: 11, fontWeight: 400 }}>/mo</span></div>
              </div>
            </button>
          ))}
        </div>

        {/* Vibe row */}
        <SectionTitle title="Browse by vibe" />
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, padding: '0 18px' }}>
          {[
            { l: 'Slow mornings', sub: '32 people', icon: '☕', g: 'linear-gradient(135deg,#FFE0EF,#FFC4DF)' },
            { l: 'Plant household', sub: '28 people', icon: '🌿', g: 'linear-gradient(135deg,#CCF6F4,#99EDE9)' },
            { l: 'Pet-friendly', sub: '24 people', icon: '🐈', g: 'linear-gradient(135deg,#FFE0EF,#CCF6F4)' },
            { l: 'Quiet weeknights', sub: '41 people', icon: '🌙', g: 'linear-gradient(135deg,#E6FBFA,#FFE0EF)' },
          ].map(v => (
            <div key={v.l} style={{ borderRadius: 18, padding: 14, backgroundImage: v.g, border: `1px solid ${t.line}`, minHeight: 92 }}>
              <div style={{ fontSize: 22 }}>{v.icon}</div>
              <div style={{ marginTop: 8, fontSize: 13.5, fontWeight: 700, color: '#1F2937', letterSpacing: '-0.01em' }}>{v.l}</div>
              <div style={{ fontSize: 11, color: 'rgba(31,41,55,0.55)' }}>{v.sub}</div>
            </div>
          ))}
        </div>
      </div>
      <TabBar tab={tab} setTab={setTab} />
    </div>
  );
};

// Home variation B: Stack (Tinder-like swipe)
const HomeB = ({ onPerson, tab, setTab }) => {
  const t = useT();
  const [idx, setIdx] = uS(0);
  const p = PEOPLE[idx % PEOPLE.length];
  const next = PEOPLE[(idx + 1) % PEOPLE.length];
  return (
    <div style={{ position: 'absolute', inset: 0, background: t.bg, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      <div style={{ flex: 1, padding: '56px 18px 110px', display: 'flex', flexDirection: 'column' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <div style={{ fontFamily: 'JetBrains Mono', fontSize: 10, letterSpacing: '0.14em', textTransform: 'uppercase', color: t.soft }}>discover · stack</div>
            <h1 style={{ margin: '4px 0 0', fontSize: 24, fontWeight: 800, letterSpacing: '-0.025em' }}>For you, today</h1>
          </div>
          <button style={{ width: 40, height: 40, borderRadius: 999, background: t.card, border: `1px solid ${t.line}`, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
            <I.Filter s={16} c={t.soft} />
          </button>
        </div>

        {/* Card stack */}
        <div style={{ position: 'relative', flex: 1, marginTop: 18 }}>
          {/* back card */}
          <Card padding={0} style={{ position: 'absolute', inset: 0, transform: 'scale(0.94) translateY(14px)', borderRadius: 28, overflow: 'hidden', opacity: 0.5 }}>
            <Ph tint={next.tint} style={{ height: '100%', borderRadius: 0 }} />
          </Card>
          {/* front card */}
          <Card padding={0} style={{ position: 'absolute', inset: 0, borderRadius: 28, overflow: 'hidden', boxShadow: '0 24px 50px -20px rgba(31,41,55,0.25)' }}>
            <Ph tint={p.tint} style={{ height: '70%', borderRadius: 0 }}>
              <div style={{ position: 'absolute', top: 14, left: 14, right: 14, display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ padding: '6px 10px', borderRadius: 999, background: 'rgba(255,255,255,0.85)', backdropFilter: 'blur(8px)', fontSize: 11, fontWeight: 700, color: '#00A8A2' }}>{p.match}% match</span>
                <span style={{ padding: '6px 10px', borderRadius: 999, background: 'rgba(255,255,255,0.85)', backdropFilter: 'blur(8px)', fontSize: 11, fontWeight: 600, color: '#1F2937', display: 'flex', alignItems: 'center', gap: 4 }}>
                  <I.Pin s={10} c="#1F2937"/>{p.loc.split(',')[0]}
                </span>
              </div>
              <div style={{ position: 'absolute', bottom: 14, left: 14, right: 14, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', color: 'white', textShadow: '0 2px 12px rgba(0,0,0,0.3)' }}>
                <div>
                  <div style={{ fontSize: 26, fontWeight: 800, letterSpacing: '-0.02em' }}>{p.name}, {p.age}</div>
                  <div style={{ fontSize: 13, opacity: 0.95 }}>{p.vibe}</div>
                </div>
              </div>
            </Ph>
            <div style={{ padding: 14, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <div style={{ fontSize: 13.5, fontWeight: 700 }}>{p.rent} zł<span style={{ color: t.mute, fontSize: 11.5, fontWeight: 400 }}>/mo</span></div>
                <div style={{ fontSize: 11.5, color: t.soft }}>{p.room}</div>
              </div>
              <button onClick={() => onPerson(p)} style={{
                fontSize: 12, fontWeight: 700, color: '#00A8A2', border: 'none', background: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4, fontFamily: 'inherit',
              }}>See profile <I.Arrow s={12} c="#00A8A2"/></button>
            </div>
          </Card>
        </div>

        {/* Action row */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: 18, marginTop: 14 }}>
          <CircleAction icon={<I.X s={20} c="#F06EB1"/>} bg="white" border onClick={() => setIdx(i => i+1)} />
          <CircleAction icon={<I.Heart s={22} c="white" filled/>} grad onClick={() => setIdx(i => i+1)} big />
          <CircleAction icon={<I.Sparkle s={18} c="#00A8A2"/>} bg="white" border />
        </div>
      </div>
      <TabBar tab={tab} setTab={setTab} />
    </div>
  );
};
const CircleAction = ({ icon, bg, grad, border, onClick, big }) => {
  const t = useT();
  const sz = big ? 64 : 52;
  return (
    <button onClick={onClick} style={{
      width: sz, height: sz, borderRadius: 999,
      background: grad ? 'linear-gradient(110deg, #00CFC8 0%, #FF9ACD 100%)' : (bg || t.card),
      border: border ? `1px solid ${t.line}` : 'none',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      cursor: 'pointer', boxShadow: grad ? '0 14px 28px -12px rgba(255,154,205,0.65)' : '0 8px 18px -10px rgba(31,41,55,0.18)',
    }}>{icon}</button>
  );
};

// Home variation C: Map-first
const HomeC = ({ onPerson, tab, setTab }) => {
  const t = useT();
  return (
    <div style={{ position: 'absolute', inset: 0, background: t.bg, overflow: 'hidden' }}>
      {/* Map placeholder */}
      <div style={{ position: 'absolute', inset: 0,
        background: t.dark === '#0E0F12' ? '#16181D' : '#F0EFEC',
        backgroundImage: `
          radial-gradient(circle at 20% 30%, rgba(0,207,200,0.12) 0%, transparent 25%),
          radial-gradient(circle at 70% 60%, rgba(255,154,205,0.12) 0%, transparent 25%),
          repeating-linear-gradient(0deg, ${t.line} 0 1px, transparent 1px 60px),
          repeating-linear-gradient(90deg, ${t.line} 0 1px, transparent 1px 60px)`,
      }}>
        {/* Roads */}
        <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}>
          <path d="M-10 220 Q 100 170 180 230 T 420 280" stroke={t.line} strokeWidth="6" fill="none"/>
          <path d="M60 -10 Q 110 200 50 400 T 90 800" stroke={t.line} strokeWidth="4" fill="none"/>
          <path d="M-10 480 Q 200 400 320 520 T 600 480" stroke={t.line} strokeWidth="5" fill="none"/>
        </svg>
      </div>

      {/* Top search */}
      <div style={{ position: 'absolute', top: 56, left: 14, right: 14, display: 'flex', gap: 8 }}>
        <div style={{
          flex: 1, height: 46, borderRadius: 16,
          background: 'rgba(255,255,255,0.9)', backdropFilter: 'blur(14px)',
          border: `1px solid ${t.line}`, display: 'flex', alignItems: 'center', gap: 10, padding: '0 14px',
          fontSize: 13, color: t.soft,
        }}>
          <I.Search s={16} c={t.soft}/> <span style={{ flex: 1 }}>Mokotów, Warsaw</span>
          <I.Filter s={14} c={t.soft}/>
        </div>
      </div>

      {/* Map pins */}
      {PEOPLE.slice(0, 5).map((p, i) => {
        const pos = [{ l: '24%', tp: '34%' },{ l: '62%', tp: '28%' },{ l: '46%', tp: '46%' },{ l: '72%', tp: '52%' },{ l: '20%', tp: '58%' }][i];
        return (
          <button key={p.name} onClick={() => onPerson(p)} style={{
            position: 'absolute', left: pos.l, top: pos.tp, transform: 'translate(-50%,-50%)',
            display: 'flex', alignItems: 'center', gap: 6,
            background: 'white', borderRadius: 999, border: 'none',
            padding: '4px 10px 4px 4px', cursor: 'pointer',
            boxShadow: '0 6px 18px -8px rgba(31,41,55,0.3), 0 0 0 2px rgba(0,207,200,0.18)',
            fontFamily: 'inherit',
          }}>
            <Avatar size={28} hue={p.hue} label={p.name[0]} />
            <span style={{ fontSize: 12, fontWeight: 700, color: '#1F2937' }}>{p.rent}zł</span>
          </button>
        );
      })}

      {/* Bottom sheet */}
      <div style={{
        position: 'absolute', left: 0, right: 0, bottom: 0,
        background: t.bg, borderTopLeftRadius: 28, borderTopRightRadius: 28,
        padding: '12px 18px 100px', boxShadow: '0 -10px 30px -8px rgba(31,41,55,0.12)',
      }}>
        <div style={{ width: 36, height: 4, borderRadius: 999, background: t.line, margin: '4px auto 12px' }}/>
        <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between' }}>
          <h3 style={{ margin: 0, fontSize: 18, fontWeight: 800, letterSpacing: '-0.02em' }}>5 in Mokotów</h3>
          <span style={{ fontSize: 12, color: t.soft }}>avg 1,820 zł</span>
        </div>
        <div style={{ display: 'flex', gap: 10, marginTop: 12, overflowX: 'auto' }} className="nice-scroll">
          {PEOPLE.slice(0, 4).map(p => (
            <button key={p.name} onClick={() => onPerson(p)} style={{
              flexShrink: 0, width: 152, background: t.card, borderRadius: 18,
              border: `1px solid ${t.line}`, padding: 8, fontFamily: 'inherit', cursor: 'pointer', textAlign: 'left', color: t.ink,
            }}>
              <Ph tint={p.tint} style={{ height: 88, borderRadius: 12 }}/>
              <div style={{ marginTop: 8, fontSize: 12.5, fontWeight: 700 }}>{p.name}, {p.age}</div>
              <div style={{ fontSize: 11, color: t.soft }}>{p.match}% · {p.rent}zł</div>
            </button>
          ))}
        </div>
      </div>

      <TabBar tab={tab} setTab={setTab} />
    </div>
  );
};

// =========================================================
// 4) SEARCH + FILTERS
// =========================================================
const SearchScreen = ({ onPerson, onBack, tab, setTab }) => {
  const t = useT(); const tr = useTr();
  const [q, setQ] = uS('Mokotów');
  return (
    <div style={{ position: 'absolute', inset: 0, background: t.bg, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
      <div className="nice-scroll" style={{ flex: 1, overflowY: 'auto', paddingTop: 56, paddingBottom: 110 }}>
        <div style={{ padding: '0 18px' }}>
          <button onClick={onBack} style={{ width: 36, height: 36, borderRadius: 999, background: t.card, border: `1px solid ${t.line}`, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
            <I.Back s={15} c={t.ink} />
          </button>
          <h1 style={{ margin: '14px 0 12px', fontSize: 30, fontWeight: 800, letterSpacing: '-0.03em' }}>{tr.search_title}</h1>

          {/* Big search input */}
          <div style={{ position: 'relative' }}>
            <I.Search s={18} c={t.soft} />
            <input value={q} onChange={e => setQ(e.target.value)} placeholder={tr.search_ph} style={{
              width: '100%', height: 54, borderRadius: 18, border: `1px solid ${t.line}`,
              background: t.bgSoft, padding: '0 18px 0 44px', fontSize: 15, fontFamily: 'inherit',
              color: t.ink, outline: 'none', boxSizing: 'border-box',
            }}/>
            <div style={{ position: 'absolute', left: 16, top: 18, pointerEvents: 'none' }}>
              <I.Search s={18} c={t.mute}/>
            </div>
          </div>

          {/* Filter row */}
          <div style={{ display: 'flex', gap: 7, marginTop: 14, overflowX: 'auto' }} className="nice-scroll">
            <Chip active icon={<I.Filter s={11}/>}>{tr.search_filters} · 3</Chip>
            <Chip>1 200 – 2 000 zł</Chip>
            <Chip>Female</Chip>
            <Chip>Plant ok</Chip>
            <Chip>Non-smoker</Chip>
          </div>
        </div>

        {/* Filter sliders block */}
        <div style={{ padding: '0 18px', marginTop: 22 }}>
          <Card padding={16}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: 12.5, fontWeight: 600 }}>Budget · 1 200 – 2 000 zł</span>
              <span style={{ fontFamily: 'JetBrains Mono', fontSize: 10, color: t.mute }}>monthly</span>
            </div>
            <div style={{ position: 'relative', height: 4, marginTop: 14, background: t.line, borderRadius: 999 }}>
              <div style={{ position: 'absolute', left: '20%', right: '35%', top: 0, bottom: 0, background: 'linear-gradient(90deg, #00CFC8, #FF9ACD)', borderRadius: 999 }}/>
              <div style={{ position: 'absolute', left: '20%', top: '50%', transform: 'translate(-50%,-50%)', width: 16, height: 16, background: 'white', border: '2px solid #00CFC8', borderRadius: 999 }}/>
              <div style={{ position: 'absolute', right: '35%', top: '50%', transform: 'translate(50%,-50%)', width: 16, height: 16, background: 'white', border: '2px solid #FF9ACD', borderRadius: 999 }}/>
            </div>
          </Card>
        </div>

        {/* Results */}
        <SectionTitle title="42 results" action={{ label: tr.search_sort }} />
        <div style={{ padding: '0 18px', display: 'flex', flexDirection: 'column', gap: 10 }}>
          {PEOPLE.map(p => (
            <button key={p.name} onClick={() => onPerson(p)} style={{
              display: 'flex', alignItems: 'center', gap: 12, padding: 10,
              background: t.card, border: `1px solid ${t.line}`, borderRadius: 18,
              fontFamily: 'inherit', cursor: 'pointer', textAlign: 'left', color: t.ink,
            }}>
              <Ph tint={p.tint} style={{ width: 76, height: 76, borderRadius: 14, flexShrink: 0 }}/>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                  <span style={{ fontSize: 14.5, fontWeight: 700, letterSpacing: '-0.01em' }}>{p.name}, {p.age}</span>
                  <span style={{ fontSize: 11.5, fontWeight: 700, color: '#00A8A2' }}>{p.match}%</span>
                </div>
                <div style={{ fontSize: 11.5, color: t.soft, marginTop: 1 }}>{p.vibe}</div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 6 }}>
                  <span style={{ fontSize: 11, color: t.mute, display: 'flex', alignItems: 'center', gap: 3 }}>
                    <I.Pin s={10}/> {p.loc.split(',')[0]}
                  </span>
                  <span style={{ fontSize: 13, fontWeight: 700 }}>{p.rent} zł</span>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>
      <TabBar tab={tab} setTab={setTab} />
    </div>
  );
};

// =========================================================
// 5) DETAIL
// =========================================================
const Detail = ({ person, onBack, onChat, onBook }) => {
  const t = useT(); const tr = useTr();
  const p = person || PEOPLE[0];
  const tagIcons = { plant: <I.Plant s={12}/>, coffee: <I.Coffee s={12}/>, music: <I.Music s={12}/>, moon: <I.Moon s={12}/> };
  const tagLabels = { plant: 'plant friend', coffee: 'slow mornings', music: 'music', moon: 'quiet nights' };
  return (
    <div style={{ position: 'absolute', inset: 0, background: t.bg, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
      <div className="nice-scroll" style={{ flex: 1, overflowY: 'auto' }}>
        {/* Hero */}
        <Ph tint={p.tint} style={{ height: 360, borderRadius: 0, position: 'relative' }}>
          <button onClick={onBack} style={{
            position: 'absolute', top: 56, left: 16, width: 38, height: 38, borderRadius: 999,
            background: 'rgba(255,255,255,0.85)', backdropFilter: 'blur(10px)',
            border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
          }}><I.Back s={16} c="#1F2937"/></button>
          <button style={{
            position: 'absolute', top: 56, right: 16, width: 38, height: 38, borderRadius: 999,
            background: 'rgba(255,255,255,0.85)', backdropFilter: 'blur(10px)',
            border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
          }}><I.Heart s={16} c="#F06EB1"/></button>
          {/* photo dots */}
          <div style={{ position: 'absolute', bottom: 16, left: '50%', transform: 'translateX(-50%)', display: 'flex', gap: 5 }}>
            {[0,1,2,3].map(i => (
              <span key={i} style={{ width: i===0 ? 18 : 6, height: 6, borderRadius: 999, background: i===0 ? 'white' : 'rgba(255,255,255,0.5)' }}/>
            ))}
          </div>
        </Ph>

        <div style={{ padding: '20px 18px 130px' }}>
          {/* Name row */}
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 10 }}>
            <div>
              <h1 style={{ margin: 0, fontSize: 28, fontWeight: 800, letterSpacing: '-0.025em', lineHeight: 1.1 }}>{p.name}, {p.age}</h1>
              <div style={{ fontSize: 13, color: t.soft, marginTop: 4, display: 'flex', alignItems: 'center', gap: 5 }}>
                <I.Pin s={12}/> {p.loc}
              </div>
            </div>
            <div style={{ padding: '6px 12px', borderRadius: 999, backgroundImage: 'linear-gradient(110deg,#E6FBFA,#FFE0EF)', fontSize: 12, fontWeight: 700, color: '#00A8A2', display: 'flex', alignItems: 'center', gap: 4 }}>
              <I.Sparkle s={11} c="#00A8A2"/> {p.match}% match
            </div>
          </div>

          {/* Vibe pills */}
          <div style={{ display: 'flex', gap: 7, marginTop: 12, flexWrap: 'wrap' }}>
            {p.tags.map(tag => (
              <span key={tag} style={{
                display: 'inline-flex', alignItems: 'center', gap: 5,
                padding: '6px 11px', borderRadius: 999, background: t.bgSoft,
                fontSize: 11.5, fontWeight: 500, color: t.ink, border: `1px solid ${t.line}`,
              }}>
                {tagIcons[tag]} {tagLabels[tag]}
              </span>
            ))}
          </div>

          {/* About */}
          <div style={{ fontFamily: 'JetBrains Mono', fontSize: 10, letterSpacing: '0.16em', textTransform: 'uppercase', color: t.mute, marginTop: 22 }}>{tr.detail_about}</div>
          <p style={{ margin: '6px 0 0', fontSize: 14, lineHeight: 1.55, color: t.ink }}>
            Designer working from home most days. Love a quiet kitchen, pour-over Sundays, and a tidy entryway. Pet-friendly (one fluffy cat 🐈‍⬛). Looking for someone calm, considerate, and into plants.
          </p>

          {/* Compatibility */}
          <div style={{ marginTop: 20, padding: 16, borderRadius: 20, border: `1px solid ${t.line}`, background: t.bgSoft }}>
            <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 10 }}>Compatibility breakdown</div>
            {[
              { l: 'Sleep schedule', v: 0.96, c: '#00CFC8' },
              { l: 'Cleanliness', v: 0.92, c: '#00CFC8' },
              { l: 'Noise level', v: 0.88, c: '#FF9ACD' },
              { l: 'Social vibe', v: 0.78, c: '#FF9ACD' },
            ].map(b => (
              <div key={b.l} style={{ marginBottom: 8 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11.5 }}>
                  <span style={{ color: t.soft }}>{b.l}</span>
                  <span style={{ fontWeight: 700, color: t.ink }}>{Math.round(b.v*100)}%</span>
                </div>
                <div style={{ height: 5, marginTop: 4, background: t.line, borderRadius: 999, overflow: 'hidden' }}>
                  <div style={{ width: (b.v*100)+'%', height: '100%', background: b.c, borderRadius: 999 }}/>
                </div>
              </div>
            ))}
          </div>

          {/* Room */}
          <div style={{ fontFamily: 'JetBrains Mono', fontSize: 10, letterSpacing: '0.16em', textTransform: 'uppercase', color: t.mute, marginTop: 24 }}>{tr.detail_room}</div>
          <h3 style={{ margin: '6px 0 4px', fontSize: 18, fontWeight: 700, letterSpacing: '-0.015em' }}>{p.room}</h3>
          <div style={{ fontSize: 13, color: t.soft }}>{p.rent} zł/month · all bills inc. · 4mo deposit</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginTop: 12 }}>
            <Ph tint="turq" style={{ aspectRatio: '1/1' }}/>
            <Ph tint="rose" style={{ aspectRatio: '1/1' }}/>
          </div>

          {/* House rules */}
          <div style={{ fontFamily: 'JetBrains Mono', fontSize: 10, letterSpacing: '0.16em', textTransform: 'uppercase', color: t.mute, marginTop: 24 }}>{tr.detail_house}</div>
          <div style={{ marginTop: 8, display: 'flex', flexDirection: 'column', gap: 8 }}>
            {['No smoking inside','Quiet after 22:00','Cats welcome, dogs no','Splitting groceries: separately'].map(r => (
              <div key={r} style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 13.5 }}>
                <span style={{ width: 22, height: 22, borderRadius: 999, background: '#E6FBFA', color: '#00A8A2', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><I.Check s={12} c="#00A8A2"/></span>
                {r}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom CTA */}
      <div style={{
        position: 'absolute', left: 0, right: 0, bottom: 0,
        padding: '14px 18px 28px', background: t.bg,
        borderTop: `1px solid ${t.line}`, display: 'flex', gap: 10,
      }}>
        <Pill variant="ghost" size="lg" onClick={onChat} style={{ flexShrink: 0, paddingLeft: 18, paddingRight: 18 }}>
          <I.Chat s={16}/> {tr.detail_msg}
        </Pill>
        <Pill variant="grad" size="lg" onClick={onBook} style={{ flex: 1 }}>{tr.detail_book} <I.Arrow s={14}/></Pill>
      </div>
    </div>
  );
};

// =========================================================
// 6) CHAT
// =========================================================
const Chat = ({ person, onBack, tab, setTab }) => {
  const t = useT(); const tr = useTr();
  const p = person || PEOPLE[0];
  const [text, setText] = uS('');
  const msgs = [
    { from: 'them', text: 'Hey! Saw your profile — we\'re a 96% match 🌿' },
    { from: 'them', text: 'Are you still looking for May?' },
    { from: 'me',   text: 'Yes! And the room photos look gorgeous ✿' },
    { from: 'me',   text: 'Could we do a video walk-through this week?' },
    { from: 'them', text: 'Of course. Thursday 7pm work?' },
    { from: 'them', text: 'I\'ll show you the kitchen, the cat, and the balcony 🐈' },
  ];
  return (
    <div style={{ position: 'absolute', inset: 0, background: t.bg, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      {/* Header */}
      <div style={{
        paddingTop: 54, padding: '54px 14px 12px',
        borderBottom: `1px solid ${t.line}`, background: t.bg,
        display: 'flex', alignItems: 'center', gap: 10,
      }}>
        <button onClick={onBack} style={{ width: 36, height: 36, borderRadius: 999, background: t.card, border: `1px solid ${t.line}`, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
          <I.Back s={15} c={t.ink}/>
        </button>
        <Avatar size={36} hue={p.hue} label={p.name[0]} ring />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 14.5, fontWeight: 700, letterSpacing: '-0.01em' }}>{p.name}</div>
          <div style={{ fontSize: 11, color: '#00A8A2' }}>● online · {tr.chat_typing}</div>
        </div>
        <button style={{ width: 36, height: 36, borderRadius: 999, background: t.card, border: `1px solid ${t.line}`, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
          <I.Sparkle s={15} c={t.soft}/>
        </button>
      </div>

      {/* Messages */}
      <div className="nice-scroll" style={{ flex: 1, overflowY: 'auto', padding: '16px 14px 12px', display: 'flex', flexDirection: 'column', gap: 8 }}>
        {/* Match banner */}
        <div style={{
          alignSelf: 'center', padding: '8px 14px', borderRadius: 999,
          background: 'linear-gradient(110deg, #E6FBFA, #FFE0EF)',
          fontSize: 11.5, fontWeight: 600, color: '#1F2937',
          display: 'flex', alignItems: 'center', gap: 6,
          marginBottom: 8,
        }}>
          <I.Sparkle s={12} c="#00A8A2"/> You matched with {p.name} · {p.match}%
        </div>

        {msgs.map((m, i) => (
          <div key={i} style={{
            alignSelf: m.from === 'me' ? 'flex-end' : 'flex-start',
            maxWidth: '78%',
            padding: '10px 14px',
            borderRadius: 20,
            borderBottomRightRadius: m.from === 'me' ? 6 : 20,
            borderBottomLeftRadius: m.from === 'me' ? 20 : 6,
            background: m.from === 'me' ? 'linear-gradient(110deg, #00CFC8, #FF9ACD)' : t.bgSoft,
            color: m.from === 'me' ? 'white' : t.ink,
            fontSize: 14, lineHeight: 1.4,
          }}>{m.text}</div>
        ))}

        {/* Typing */}
        <div style={{ alignSelf: 'flex-start', padding: '10px 14px', borderRadius: 20, borderBottomLeftRadius: 6, background: t.bgSoft, display: 'flex', gap: 4 }}>
          {[0,1,2].map(i => (
            <span key={i} style={{ width: 6, height: 6, borderRadius: 999, background: t.mute, animation: `bounce 1.2s ${i*0.15}s infinite` }}/>
          ))}
        </div>
      </div>

      {/* Input */}
      <div style={{ padding: '10px 12px 26px', borderTop: `1px solid ${t.line}`, background: t.bg }}>
        <div style={{
          display: 'flex', alignItems: 'center', gap: 8,
          background: t.bgSoft, borderRadius: 999, padding: 5, paddingLeft: 16,
        }}>
          <input value={text} onChange={e => setText(e.target.value)} placeholder={tr.chat_input} style={{
            flex: 1, height: 38, border: 'none', outline: 'none', background: 'transparent',
            fontSize: 14, color: t.ink, fontFamily: 'inherit',
          }}/>
          <button style={{
            width: 38, height: 38, borderRadius: 999, border: 'none',
            background: 'linear-gradient(110deg,#00CFC8,#FF9ACD)', color: 'white',
            display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
          }}><I.Send s={16} c="white"/></button>
        </div>
      </div>
      <style>{`@keyframes bounce { 0%,80%,100% { transform: translateY(0); opacity: 0.4 } 40% { transform: translateY(-3px); opacity: 1 } }`}</style>
    </div>
  );
};

// =========================================================
// 7) MATCHES
// =========================================================
const Matches = ({ onPerson, tab, setTab }) => {
  const t = useT(); const tr = useTr();
  return (
    <div style={{ position: 'absolute', inset: 0, background: t.bg, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      <div className="nice-scroll" style={{ flex: 1, overflowY: 'auto', paddingTop: 56, paddingBottom: 110 }}>
        <div style={{ padding: '0 18px' }}>
          <h1 style={{ margin: 0, fontSize: 30, fontWeight: 800, letterSpacing: '-0.03em' }}>{tr.matches_title}</h1>
          <p style={{ margin: '4px 0 0', fontSize: 13.5, color: t.soft }}>{tr.matches_sub}</p>
        </div>

        {/* New today */}
        <SectionTitle title="New this week" action={{ label: 'View 12' }}/>
        <div style={{ display: 'flex', gap: 10, padding: '0 18px', overflowX: 'auto' }} className="nice-scroll">
          {PEOPLE.slice(0,5).map(p => (
            <button key={p.name} onClick={() => onPerson(p)} style={{
              flexShrink: 0, width: 88, background: 'none', border: 'none', cursor: 'pointer',
              fontFamily: 'inherit', textAlign: 'center', color: t.ink,
            }}>
              <Avatar size={70} hue={p.hue} label={p.name[0]} ring/>
              <div style={{ fontSize: 12, fontWeight: 600, marginTop: 6 }}>{p.name}</div>
              <div style={{ fontSize: 10.5, color: '#00A8A2', fontWeight: 700 }}>{p.match}%</div>
            </button>
          ))}
        </div>

        <SectionTitle title="Conversations"/>
        <div style={{ padding: '0 6px', display: 'flex', flexDirection: 'column' }}>
          {PEOPLE.slice(0,5).map((p, i) => (
            <button key={p.name} onClick={() => onPerson(p)} style={{
              display: 'flex', alignItems: 'center', gap: 12, padding: '10px 12px',
              background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit', textAlign: 'left', color: t.ink,
            }}>
              <Avatar size={48} hue={p.hue} label={p.name[0]} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                  <span style={{ fontSize: 14.5, fontWeight: 700 }}>{p.name}</span>
                  <span style={{ fontSize: 10.5, color: t.mute }}>{['12m','1h','3h','yesterday','2d'][i]}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 2 }}>
                  <span style={{ fontSize: 12.5, color: t.soft, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 200 }}>
                    {['Thursday 7pm work? ✿','Sounds good — sending you the link','See you Saturday!','I\'ll bring the matcha 🌿','Sure, let me check'][i]}
                  </span>
                  {i < 2 && <span style={{ minWidth: 18, height: 18, padding: '0 6px', background: 'linear-gradient(110deg,#00CFC8,#FF9ACD)', borderRadius: 999, color: 'white', fontSize: 10.5, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{[2,1][i]}</span>}
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

// =========================================================
// 8) PROFILE
// =========================================================
const Profile = ({ tab, setTab }) => {
  const t = useT(); const tr = useTr();
  return (
    <div style={{ position: 'absolute', inset: 0, background: t.bg, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      <div className="nice-scroll" style={{ flex: 1, overflowY: 'auto', paddingTop: 56, paddingBottom: 110 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0 18px' }}>
          <h1 style={{ margin: 0, fontSize: 30, fontWeight: 800, letterSpacing: '-0.03em' }}>{tr.profile_title}</h1>
          <button style={{ width: 38, height: 38, borderRadius: 999, background: t.card, border: `1px solid ${t.line}`, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
            <I.Settings s={16} c={t.soft}/>
          </button>
        </div>

        {/* Profile card */}
        <div style={{ padding: '18px 18px 0' }}>
          <Card padding={0} style={{ overflow: 'hidden' }}>
            <Ph tint="rose" style={{ height: 100, borderRadius: 0 }}/>
            <div style={{ padding: 16, display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', marginTop: -36 }}>
              <Avatar size={72} hue={1} label="M" ring />
              <h3 style={{ margin: '10px 0 2px', fontSize: 19, fontWeight: 800, letterSpacing: '-0.02em' }}>Mira Adeyemi, 25</h3>
              <p style={{ margin: 0, fontSize: 12.5, color: t.soft }}>Designer · Warsaw · ✿ verified</p>
              <div style={{ display: 'flex', gap: 7, marginTop: 12, flexWrap: 'wrap', justifyContent: 'center' }}>
                {['plant friend','slow mornings','quiet nights'].map(g => (
                  <span key={g} style={{ padding: '5px 10px', borderRadius: 999, fontSize: 11.5, fontWeight: 500, background: t.bgSoft, border: `1px solid ${t.line}` }}>{g}</span>
                ))}
              </div>
              <Pill variant="ghost" size="sm" style={{ marginTop: 14 }}>{tr.profile_edit}</Pill>
            </div>
          </Card>
        </div>

        {/* Stats */}
        <div style={{ padding: '14px 18px 0', display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8 }}>
          {[{ k: '24', l: 'matches' },{ k: '96%', l: 'avg fit' },{ k: '4.9★', l: 'rating' }].map(s => (
            <div key={s.l} style={{ background: t.bgSoft, borderRadius: 16, padding: 14, textAlign: 'center', border: `1px solid ${t.line}` }}>
              <div style={{ fontSize: 22, fontWeight: 800, letterSpacing: '-0.02em' }}>{s.k}</div>
              <div style={{ fontSize: 10.5, color: t.soft, fontFamily: 'JetBrains Mono', letterSpacing: '0.1em', textTransform: 'uppercase', marginTop: 2 }}>{s.l}</div>
            </div>
          ))}
        </div>

        {/* Settings list */}
        <SectionTitle title="Settings"/>
        <div style={{ padding: '0 18px' }}>
          <Card padding={0}>
            {[
              { l: 'Vibe quiz', sub: 'Last updated 2 weeks ago', icon: '🌿' },
              { l: 'Verification', sub: 'ID + selfie verified ✓', icon: '✓' },
              { l: 'Deposit & payments', sub: 'Stripe linked', icon: '€' },
              { l: 'Notifications', sub: 'Quiet hours 22:00 – 08:00', icon: '◔' },
              { l: 'Language', sub: 'English / Polski', icon: '🌐' },
            ].map((r, i, arr) => (
              <div key={r.l} style={{
                display: 'flex', alignItems: 'center', gap: 14, padding: '14px 16px',
                borderBottom: i < arr.length-1 ? `1px solid ${t.line}` : 'none',
              }}>
                <div style={{ width: 36, height: 36, borderRadius: 12, background: t.bgSoft, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16 }}>{r.icon}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13.5, fontWeight: 600 }}>{r.l}</div>
                  <div style={{ fontSize: 11.5, color: t.soft, marginTop: 1 }}>{r.sub}</div>
                </div>
                <I.Arrow s={13} c={t.mute}/>
              </div>
            ))}
          </Card>
        </div>

        <p style={{ textAlign: 'center', margin: '24px 0 0', fontSize: 11, color: t.mute, fontFamily: 'JetBrains Mono', letterSpacing: '0.1em' }}>v 2.4.1 · made in Lisbon ✿</p>
      </div>
      <TabBar tab={tab} setTab={setTab}/>
    </div>
  );
};

Object.assign(window, { PEOPLE, Splash, Login, HomeA, HomeB, HomeC, SearchScreen, Detail, Chat, Matches, Profile });
