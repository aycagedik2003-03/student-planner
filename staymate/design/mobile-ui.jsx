/* Staymate Mobile — UI primitives, icons, theme */
const { useState, useEffect, useRef, useMemo, createContext, useContext } = React;

// ===== Theme context =====
const ThemeCtx = createContext({ dark: false, lang: 'en' });

const T = {
  // Light
  L: {
    bg: '#FFFFFF', bgSoft: '#FAFAFA', card: '#FFFFFF',
    ink: '#1F2937', soft: '#4B5563', mute: '#9CA3AF',
    line: 'rgba(31,41,55,0.08)', lineSoft: 'rgba(31,41,55,0.05)',
    cream: '#FFFBF7',
    brandA: '#00CFC8', brandB: '#FF9ACD',
    chipBg: '#FFFFFF',
  },
  // Dark
  D: {
    bg: '#0E0F12', bgSoft: '#16181D', card: '#1A1C22',
    ink: '#F4F4F5', soft: '#D1D5DB', mute: '#7B8088',
    line: 'rgba(255,255,255,0.08)', lineSoft: 'rgba(255,255,255,0.04)',
    cream: '#1E1A20',
    brandA: '#34E0DA', brandB: '#FFA8D4',
    chipBg: '#22252B',
  },
};
const useT = () => {
  const { dark } = useContext(ThemeCtx);
  return dark ? T.D : T.L;
};
const useLang = () => useContext(ThemeCtx).lang;

// ===== Copy: EN + PL =====
const COPY = {
  en: {
    splash_eyebrow: 'NEW · Spring \'26',
    splash_title: 'Find your\nsoft roommate.',
    splash_sub: 'Vibe-matched, deposit-protected, drama-free.',
    splash_cta: 'Get started',
    splash_signin: 'I have an account',
    onb1_title: 'Match the vibe,\nnot just the rent.',
    onb1_sub: 'Tell us your sleep schedule, your noise level, your snack tier. We do the math.',
    login_title: 'Welcome back ✿',
    login_sub: 'Log in to find your people.',
    login_email: 'Email',
    login_phone: 'Phone',
    login_continue: 'Continue',
    login_or: 'or continue with',
    login_terms: 'By continuing you agree to our Terms & soft house rules.',
    home_hi: 'hi mira',
    home_q: 'Who fits your home?',
    home_today: 'Today\'s 6 matches',
    home_seeAll: 'See all',
    home_quick: 'Quick filters',
    nav_home: 'Home', nav_search: 'Search', nav_match: 'Matches', nav_chat: 'Chat', nav_me: 'Me',
    search_title: 'Search',
    search_ph: 'Warsaw, Mokotów, near metro…',
    search_sort: 'Sort by',
    search_filters: 'Filters',
    detail_about: 'about',
    detail_room: 'the room',
    detail_house: 'house rules',
    detail_book: 'Send a request',
    detail_msg: 'Message',
    chat_typing: 'typing…',
    chat_input: 'Message Zofia',
    matches_title: 'Matches',
    matches_sub: 'People who match your vibe & timing.',
    profile_title: 'Profile',
    profile_edit: 'Edit profile',
  },
  pl: {
    splash_eyebrow: 'NOWOŚĆ · Wiosna \'26',
    splash_title: 'Znajdź swojego\nidealnego soblokatora.',
    splash_sub: 'Dopasowani vibe-em, kaucja chroniona, bez dramy.',
    splash_cta: 'Zaczynamy',
    splash_signin: 'Mam już konto',
    onb1_title: 'Dopasuj vibe,\nnie tylko czynsz.',
    onb1_sub: 'Powiedz nam o swoim śnie, hałasie, ulubionych przekąskach. My liczymy.',
    login_title: 'Witaj z powrotem ✿',
    login_sub: 'Zaloguj się i znajdź swoich ludzi.',
    login_email: 'Email',
    login_phone: 'Telefon',
    login_continue: 'Dalej',
    login_or: 'albo zaloguj przez',
    login_terms: 'Klikając akceptujesz Regulamin i miłe zasady domowe.',
    home_hi: 'cześć mira',
    home_q: 'Kto pasuje do twojego domu?',
    home_today: 'Dzisiejsze 6 dopasowań',
    home_seeAll: 'Pokaż wszystkie',
    home_quick: 'Szybkie filtry',
    nav_home: 'Start', nav_search: 'Szukaj', nav_match: 'Mecze', nav_chat: 'Chat', nav_me: 'Ja',
    search_title: 'Szukaj',
    search_ph: 'Warszawa, Mokotów, przy metrze…',
    search_sort: 'Sortuj',
    search_filters: 'Filtry',
    detail_about: 'o mnie',
    detail_room: 'pokój',
    detail_house: 'zasady domu',
    detail_book: 'Wyślij prośbę',
    detail_msg: 'Wiadomość',
    chat_typing: 'pisze…',
    chat_input: 'Napisz do Zofii',
    matches_title: 'Mecze',
    matches_sub: 'Osoby pasujące do twojego vibe i terminów.',
    profile_title: 'Profil',
    profile_edit: 'Edytuj profil',
  },
};
const useTr = () => COPY[useLang()] || COPY.en;

// ===== Icons (minimal stroke) =====
const I = {
  Logo: ({ s = 22 }) => (
    <svg width={s} height={s} viewBox="0 0 32 32" fill="none">
      <defs>
        <linearGradient id="lg-mlogo" x1="0" y1="0" x2="32" y2="32" gradientUnits="userSpaceOnUse">
          <stop stopColor="#00CFC8" /><stop offset="1" stopColor="#FF9ACD" />
        </linearGradient>
      </defs>
      <path d="M16 3c4 4 7 7 7 12a7 7 0 1 1-14 0c0-5 3-8 7-12z" fill="url(#lg-mlogo)" />
      <circle cx="16" cy="16" r="2.4" fill="white" />
    </svg>
  ),
  Search: ({ s = 18, c = 'currentColor' }) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></svg>,
  Home: ({ s = 22, c = 'currentColor', filled = false }) => filled
    ? <svg width={s} height={s} viewBox="0 0 24 24" fill={c}><path d="M12 3 3 11h2v9h5v-6h4v6h5v-9h2z"/></svg>
    : <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="m3 11 9-7 9 7"/><path d="M5 10v10h14V10"/><path d="M10 20v-6h4v6"/></svg>,
  Heart: ({ s = 22, c = 'currentColor', filled = false }) => <svg width={s} height={s} viewBox="0 0 24 24" fill={filled ? c : 'none'} stroke={c} strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><path d="M20.8 8.6a5.4 5.4 0 0 0-9.3-3 5.4 5.4 0 0 0-9.3 3c0 6.5 9.3 11.5 9.3 11.5s9.3-5 9.3-11.5z"/></svg>,
  Chat: ({ s = 22, c = 'currentColor' }) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12a8 8 0 0 1-11.5 7.2L4 21l1.8-5.5A8 8 0 1 1 21 12z"/></svg>,
  User: ({ s = 22, c = 'currentColor' }) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/></svg>,
  Sparkle: ({ s = 16, c = 'currentColor' }) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><path d="M12 3v4M12 17v4M3 12h4M17 12h4M5.5 5.5l2.8 2.8M15.7 15.7l2.8 2.8M18.5 5.5l-2.8 2.8M8.3 15.7l-2.8 2.8"/></svg>,
  Pin: ({ s = 14, c = 'currentColor' }) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-7.5 8-13a8 8 0 1 0-16 0c0 5.5 8 13 8 13z"/><circle cx="12" cy="9" r="2.6"/></svg>,
  Star: ({ s = 14, c = 'currentColor', filled = true }) => <svg width={s} height={s} viewBox="0 0 24 24" fill={filled ? c : 'none'} stroke={c} strokeWidth="1.6" strokeLinejoin="round"><path d="m12 3 2.7 5.5 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.8 1-6.1L3.2 9.4l6.1-.9z"/></svg>,
  Bell: ({ s = 20, c = 'currentColor' }) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><path d="M6 9a6 6 0 1 1 12 0c0 5 2 6 2 6H4s2-1 2-6z"/><path d="M10 19a2 2 0 0 0 4 0"/></svg>,
  Filter: ({ s = 16, c = 'currentColor' }) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><path d="M4 5h16M7 12h10M10 19h4"/></svg>,
  Plus: ({ s = 18, c = 'currentColor' }) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2" strokeLinecap="round"><path d="M12 5v14M5 12h14"/></svg>,
  Arrow: ({ s = 16, c = 'currentColor' }) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="m13 5 7 7-7 7"/></svg>,
  Back: ({ s = 18, c = 'currentColor' }) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5"/><path d="m12 19-7-7 7-7"/></svg>,
  Send: ({ s = 18, c = 'currentColor' }) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="m4 12 17-9-6 18-3-7z"/><path d="m12 14 4-5"/></svg>,
  Check: ({ s = 14, c = 'currentColor' }) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="m5 12 5 5L20 7"/></svg>,
  X: ({ s = 16, c = 'currentColor' }) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2" strokeLinecap="round"><path d="M6 6l12 12M18 6 6 18"/></svg>,
  Coffee: ({ s = 14, c = 'currentColor' }) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M4 9h13v6a4 4 0 0 1-4 4H8a4 4 0 0 1-4-4z"/><path d="M17 11h2a2 2 0 0 1 0 4h-2"/><path d="M8 3v2M11 3v2M14 3v2"/></svg>,
  Plant: ({ s = 14, c = 'currentColor' }) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M12 14c0-5 3-8 8-9-1 5-4 8-8 9z"/><path d="M12 14c0-5-3-8-8-9 1 5 4 8 8 9z"/><path d="M12 14v6"/></svg>,
  Moon: ({ s = 14, c = 'currentColor' }) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M21 13a9 9 0 1 1-10-10 7 7 0 0 0 10 10z"/></svg>,
  Music: ({ s = 14, c = 'currentColor' }) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/><path d="M9 18V6l12-2v12"/></svg>,
  Settings: ({ s = 18, c = 'currentColor' }) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19 12c0-.4 0-.8-.1-1.2l2-1.6-2-3.4-2.4.9c-.6-.5-1.3-.9-2.1-1.2L14 3h-4l-.4 2.5a7 7 0 0 0-2.1 1.2L5.1 5.8l-2 3.4 2 1.6c-.1.4-.1.8-.1 1.2 0 .4 0 .8.1 1.2l-2 1.6 2 3.4 2.4-.9c.6.5 1.3.9 2.1 1.2L10 21h4l.4-2.5c.8-.3 1.5-.7 2.1-1.2l2.4.9 2-3.4-2-1.6c.1-.4.1-.8.1-1.2z"/></svg>,
  Globe: ({ s = 16, c = 'currentColor' }) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c3 3 3 15 0 18M12 3c-3 3-3 15 0 18"/></svg>,
};

// ===== Avatar (gradient) =====
const Avatar = ({ size = 40, hue = 0, label = '', ring = false }) => {
  const grads = [
    'linear-gradient(135deg,#00CFC8,#33D9D3)',
    'linear-gradient(135deg,#FF9ACD,#F06EB1)',
    'linear-gradient(135deg,#FFC4DF,#00CFC8)',
    'linear-gradient(135deg,#33D9D3,#FFB37A)',
    'linear-gradient(135deg,#C9A8FF,#FF9ACD)',
    'linear-gradient(135deg,#7DE0CC,#FFC4DF)',
  ];
  return (
    <div style={{
      width: size, height: size, borderRadius: '50%',
      background: grads[hue % grads.length],
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      color: 'white', fontWeight: 600, fontSize: size * 0.36,
      boxShadow: ring ? '0 0 0 2.5px white, 0 0 0 4.5px #00CFC8' : 'none',
      flexShrink: 0,
    }}>{label}</div>
  );
};

// ===== Photo Placeholder =====
const Ph = ({ tint = 'turq', label, style = {}, children }) => {
  const tints = {
    turq: 'linear-gradient(135deg, rgba(0,207,200,0.22) 0%, rgba(255,154,205,0.10) 100%)',
    rose: 'linear-gradient(135deg, rgba(255,154,205,0.24) 0%, rgba(0,207,200,0.10) 100%)',
    cream: 'linear-gradient(135deg, rgba(255,251,247,0.9) 0%, rgba(255,224,239,0.6) 100%)',
  };
  const hasOverlay = React.Children.count(children) > 0;
  return (
    <div className="stripe-ph" style={{ position: 'relative', overflow: 'hidden', borderRadius: 18, ...style }}>
      <div style={{ position: 'absolute', inset: 0, backgroundImage: tints[tint] }} />
      {!hasOverlay && label && (
        <div style={{ position: 'absolute', left: 8, bottom: 8 }}>
          <span style={{
            fontFamily: 'JetBrains Mono, monospace', fontSize: 9, letterSpacing: '0.08em',
            textTransform: 'uppercase', color: 'rgba(31,41,55,0.55)',
            background: 'rgba(255,255,255,0.78)', padding: '3px 7px', borderRadius: 999,
            border: '1px solid rgba(255,255,255,0.85)',
          }}>{label}</span>
        </div>
      )}
      {children}
    </div>
  );
};

// ===== Pill button =====
const Pill = ({ children, variant = 'grad', size = 'md', icon, onClick, style = {} }) => {
  const t = useT();
  const sizes = {
    sm: { h: 32, px: 14, fs: 12 },
    md: { h: 44, px: 18, fs: 14 },
    lg: { h: 52, px: 22, fs: 15 },
  };
  const s = sizes[size];
  const variants = {
    grad: {
      backgroundImage: 'linear-gradient(110deg, #00CFC8 0%, #2BD9D2 50%, #FF9ACD 100%)',
      color: 'white',
      boxShadow: '0 8px 22px -8px rgba(0,207,200,0.55), 0 6px 18px -8px rgba(255,154,205,0.55)',
    },
    ghost: {
      background: t.card, color: t.ink, border: `1px solid ${t.line}`,
    },
    dark: { background: t.ink, color: t.bg },
    quiet: { background: 'transparent', color: t.soft },
  };
  return (
    <button onClick={onClick} style={{
      height: s.h, padding: `0 ${s.px}px`, borderRadius: 999, border: 'none',
      fontFamily: 'inherit', fontWeight: 600, fontSize: s.fs, cursor: 'pointer',
      display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 6,
      transition: 'transform .2s ease, box-shadow .2s ease',
      ...variants[variant], ...style,
    }} onMouseDown={e => e.currentTarget.style.transform = 'translateY(1px)'}
       onMouseUp={e => e.currentTarget.style.transform = 'translateY(0)'}
       onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}>
      {children}
      {icon}
    </button>
  );
};

// ===== Chip =====
const Chip = ({ children, active = false, onClick, icon, style = {} }) => {
  const t = useT();
  return (
    <button onClick={onClick} style={{
      display: 'inline-flex', alignItems: 'center', gap: 5,
      padding: '6px 11px', borderRadius: 999,
      border: active ? '1px solid transparent' : `1px solid ${t.line}`,
      background: active ? t.ink : t.card,
      color: active ? t.bg : t.soft,
      fontSize: 11.5, fontWeight: 500, fontFamily: 'inherit',
      cursor: 'pointer', flexShrink: 0,
      ...style,
    }}>
      {icon}
      {children}
    </button>
  );
};

// ===== Card =====
const Card = ({ style = {}, children, padding = 14 }) => {
  const t = useT();
  return (
    <div style={{
      background: t.card, borderRadius: 22, border: `1px solid ${t.line}`,
      padding, ...style,
    }}>{children}</div>
  );
};

// ===== Section heading =====
const SectionTitle = ({ title, action }) => {
  const t = useT();
  return (
    <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', padding: '0 18px', marginTop: 22, marginBottom: 12 }}>
      <h3 style={{
        margin: 0, fontFamily: 'Plus Jakarta Sans', fontSize: 20, fontWeight: 700,
        letterSpacing: '-0.02em', color: t.ink,
      }}>{title}</h3>
      {action && (
        <button onClick={action.onClick} style={{ background: 'none', border: 'none', color: t.soft, fontSize: 12, fontFamily: 'inherit', cursor: 'pointer', fontWeight: 500 }}>
          {action.label}
        </button>
      )}
    </div>
  );
};

// ===== Bottom nav (iOS / Android shared markup) =====
const TabBar = ({ tab, setTab }) => {
  const t = useT();
  const tr = useTr();
  const items = [
    { id: 'home', l: tr.nav_home, i: I.Home },
    { id: 'search', l: tr.nav_search, i: I.Search },
    { id: 'matches', l: tr.nav_match, i: I.Heart },
    { id: 'chat', l: tr.nav_chat, i: I.Chat },
    { id: 'me', l: tr.nav_me, i: I.User },
  ];
  return (
    <div style={{
      position: 'absolute', left: 12, right: 12, bottom: 22,
      height: 64, borderRadius: 28,
      background: t.card === '#FFFFFF' ? 'rgba(255,255,255,0.85)' : 'rgba(26,28,34,0.85)',
      backdropFilter: 'blur(20px) saturate(160%)',
      WebkitBackdropFilter: 'blur(20px) saturate(160%)',
      border: `1px solid ${t.line}`,
      boxShadow: '0 12px 36px -12px rgba(31,41,55,0.18)',
      display: 'flex', alignItems: 'center', justifyContent: 'space-around',
      zIndex: 30,
    }}>
      {items.map(it => {
        const active = tab === it.id;
        return (
          <button key={it.id} onClick={() => setTab(it.id)} style={{
            background: 'none', border: 'none', cursor: 'pointer',
            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3,
            padding: '6px 8px',
          }}>
            <div style={{ position: 'relative' }}>
              <it.i s={22} c={active ? 'url(#tab-grad)' : t.mute} filled={active && it.id === 'home'} />
              {active && (
                <span style={{
                  position: 'absolute', bottom: -7, left: '50%', transform: 'translateX(-50%)',
                  width: 4, height: 4, borderRadius: 999,
                  backgroundImage: 'linear-gradient(110deg, #00CFC8, #FF9ACD)',
                }} />
              )}
            </div>
            <span style={{
              fontSize: 9.5, fontWeight: 600, letterSpacing: '0.02em',
              color: active ? t.ink : t.mute,
            }}>{it.l}</span>
          </button>
        );
      })}
      {/* svg gradient defs for tab icons */}
      <svg width="0" height="0" style={{ position: 'absolute' }}>
        <defs>
          <linearGradient id="tab-grad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#00CFC8"/>
            <stop offset="100%" stopColor="#FF9ACD"/>
          </linearGradient>
        </defs>
      </svg>
    </div>
  );
};

Object.assign(window, { ThemeCtx, T, useT, useLang, useTr, COPY, I, Avatar, Ph, Pill, Chip, Card, SectionTitle, TabBar });
