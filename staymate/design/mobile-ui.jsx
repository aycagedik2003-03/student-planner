/* Staymate Mobile — UI primitives, icons, theme */
const { useState, useEffect, useRef, useMemo, createContext, useContext } = React;

// ===== Theme context =====
const ThemeCtx = createContext({ dark: false, lang: 'en' });

// Brand palette — teal + violet + magenta, derived from Roomski logo
const BRAND = {
  teal:       '#1FBFCC',
  tealDk:     '#0E9AAB',
  tealLt:     '#E6F8FA',
  violet:     '#8E5CD9',
  violetDk:   '#6B3FC0',
  violetLt:   '#F0EAFB',
  magenta:    '#D93B8B',
  magentaLt:  '#FBE7F1',
};

// Primary gradient — used only on CTA + highlights
const GRAD = 'linear-gradient(110deg, #1FBFCC 0%, #8E5CD9 55%, #D93B8B 100%)';

const T = {
  L: {
    bg: '#FFFFFF', bgSoft: '#F7F8FA', card: '#FFFFFF',
    ink: '#0F172A', soft: '#475569', mute: '#94A3B8',
    line: 'rgba(15,23,42,0.08)', lineSoft: 'rgba(15,23,42,0.04)',
    brandA: BRAND.teal, brandADk: BRAND.tealDk, brandALt: BRAND.tealLt,
    brandB: BRAND.violet, brandBLt: BRAND.violetLt,
    brandC: BRAND.magenta, brandCLt: BRAND.magentaLt,
  },
  D: {
    bg: '#0B0D12', bgSoft: '#14171D', card: '#181B23',
    ink: '#F4F4F5', soft: '#CBD2DA', mute: '#7B8290',
    line: 'rgba(255,255,255,0.08)', lineSoft: 'rgba(255,255,255,0.04)',
    brandA: '#3FD0DC', brandADk: '#1FBFCC', brandALt: 'rgba(31,191,204,0.14)',
    brandB: '#A47BE5', brandBLt: 'rgba(142,92,217,0.14)',
    brandC: '#E76AA8', brandCLt: 'rgba(217,59,139,0.14)',
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
    splash_eyebrow:  "NEW · Spring '26",
    splash_title:    'Find your\nsoft roommate.',
    splash_sub:      'Vibe-matched, deposit-protected, drama-free.',
    splash_cta:      'Get started',
    splash_signin:   'I have an account',
    login_title:     'Welcome back ✿',
    login_sub:       'Log in to find your people.',
    login_email:     'Email',
    login_phone:     'Phone',
    login_continue:  'Continue',
    login_or:        'or continue with',
    login_terms:     'By continuing you agree to our Terms & soft house rules.',
    home_hi:         'hi mira',
    home_q:          'Who fits your home?',
    home_today:      "Today's 6 matches",
    home_seeAll:     'See all',
    home_quick:      'Quick filters',
    nav_home:        'Home',
    nav_search:      'Listings',
    nav_match:       'Matches',
    nav_chat:        'Chat',
    nav_me:          'Me',
    search_title:    'Listings',
    search_ph:       'Warsaw, Mokotów, near metro…',
    search_sort:     'Sort by',
    search_filters:  'Filters',
    listings_all:    'All cities',
    listings_empty:  'No results',
    listings_emptySub: 'Try adjusting your filters',
    listings_count:  'listings',
    detail_about:    'about',
    detail_room:     'the room',
    detail_house:    'house rules',
    detail_book:     'Send a request',
    detail_msg:      'Message',
    chat_typing:     'typing…',
    chat_input:      'Message Zofia',
    matches_title:   'Matches',
    matches_sub:     'People who match your vibe & timing.',
    profile_title:   'Profile',
    profile_edit:    'Edit profile',
    profile_quiz:    'Quiz done',
    profile_traits:  'traits',
    profile_verify:  'Verify student ID',
    profile_see:     'See matches',
  },
  pl: {
    splash_eyebrow:  "NOWOŚĆ · Wiosna '26",
    splash_title:    'Znajdź swojego\nidealnego współlokatora.',
    splash_sub:      'Dopasowani vibe-em, kaucja chroniona, bez dramy.',
    splash_cta:      'Zaczynamy',
    splash_signin:   'Mam już konto',
    login_title:     'Witaj z powrotem ✿',
    login_sub:       'Zaloguj się i znajdź swoich ludzi.',
    login_email:     'Email',
    login_phone:     'Telefon',
    login_continue:  'Dalej',
    login_or:        'albo zaloguj przez',
    login_terms:     'Klikając akceptujesz Regulamin i miłe zasady domowe.',
    home_hi:         'cześć mira',
    home_q:          'Kto pasuje do twojego domu?',
    home_today:      'Dzisiejsze 6 dopasowań',
    home_seeAll:     'Pokaż wszystkie',
    home_quick:      'Szybkie filtry',
    nav_home:        'Start',
    nav_search:      'Oferty',
    nav_match:       'Mecze',
    nav_chat:        'Chat',
    nav_me:          'Ja',
    search_title:    'Oferty',
    search_ph:       'Warszawa, Mokotów, przy metrze…',
    search_sort:     'Sortuj',
    search_filters:  'Filtry',
    listings_all:    'Wszystkie',
    listings_empty:  'Brak wyników',
    listings_emptySub: 'Spróbuj zmienić filtry',
    listings_count:  'ofert',
    detail_about:    'o mnie',
    detail_room:     'pokój',
    detail_house:    'zasady domu',
    detail_book:     'Wyślij prośbę',
    detail_msg:      'Wiadomość',
    chat_typing:     'pisze…',
    chat_input:      'Napisz do Zofii',
    matches_title:   'Mecze',
    matches_sub:     'Osoby pasujące do twojego vibe i terminów.',
    profile_title:   'Profil',
    profile_edit:    'Edytuj',
    profile_quiz:    'Quiz done',
    profile_traits:  'cech',
    profile_verify:  'Zweryfikuj legitymację',
    profile_see:     'Zobacz mecze',
  },
};
const useTr = () => COPY[useLang()] || COPY.en;

// ===== Icons (minimal stroke SVGs) =====
const I = {
  Logo: ({ s = 22 }) => (
    <svg width={s} height={s} viewBox="0 0 32 32" fill="none">
      <defs>
        <linearGradient id="lg-logo" x1="2" y1="6" x2="30" y2="28" gradientUnits="userSpaceOnUse">
          <stop stopColor="#1FBFCC"/>
          <stop offset="0.55" stopColor="#8E5CD9"/>
          <stop offset="1" stopColor="#D93B8B"/>
        </linearGradient>
      </defs>
      <path d="M5 14.5 16 5l11 9.5V26a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V14.5z" fill="url(#lg-logo)"/>
      <path d="M13 28v-7a3 3 0 0 1 6 0v7" fill="white"/>
      <circle cx="16" cy="14" r="1.6" fill="white"/>
    </svg>
  ),
  Search:   ({ s=18, c='currentColor' }) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></svg>,
  Home:     ({ s=22, c='currentColor', filled=false }) => filled
    ? <svg width={s} height={s} viewBox="0 0 24 24" fill={c}><path d="M12 3 3 11h2v9h5v-6h4v6h5v-9h2z"/></svg>
    : <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="m3 11 9-7 9 7"/><path d="M5 10v10h14V10"/><path d="M10 20v-6h4v6"/></svg>,
  Heart:    ({ s=22, c='currentColor', filled=false }) => <svg width={s} height={s} viewBox="0 0 24 24" fill={filled?c:'none'} stroke={c} strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><path d="M20.8 8.6a5.4 5.4 0 0 0-9.3-3 5.4 5.4 0 0 0-9.3 3c0 6.5 9.3 11.5 9.3 11.5s9.3-5 9.3-11.5z"/></svg>,
  Chat:     ({ s=22, c='currentColor' }) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12a8 8 0 0 1-11.5 7.2L4 21l1.8-5.5A8 8 0 1 1 21 12z"/></svg>,
  User:     ({ s=22, c='currentColor' }) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/></svg>,
  Sparkle:  ({ s=16, c='currentColor' }) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><path d="M12 3v4M12 17v4M3 12h4M17 12h4M5.5 5.5l2.8 2.8M15.7 15.7l2.8 2.8M18.5 5.5l-2.8 2.8M8.3 15.7l-2.8 2.8"/></svg>,
  Pin:      ({ s=14, c='currentColor' }) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-7.5 8-13a8 8 0 1 0-16 0c0 5.5 8 13 8 13z"/><circle cx="12" cy="9" r="2.6"/></svg>,
  Star:     ({ s=14, c='currentColor', filled=true }) => <svg width={s} height={s} viewBox="0 0 24 24" fill={filled?c:'none'} stroke={c} strokeWidth="1.6" strokeLinejoin="round"><path d="m12 3 2.7 5.5 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.8 1-6.1L3.2 9.4l6.1-.9z"/></svg>,
  Bell:     ({ s=20, c='currentColor' }) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><path d="M6 9a6 6 0 1 1 12 0c0 5 2 6 2 6H4s2-1 2-6z"/><path d="M10 19a2 2 0 0 0 4 0"/></svg>,
  Filter:   ({ s=16, c='currentColor' }) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><path d="M4 5h16M7 12h10M10 19h4"/></svg>,
  Plus:     ({ s=18, c='currentColor' }) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2" strokeLinecap="round"><path d="M12 5v14M5 12h14"/></svg>,
  Arrow:    ({ s=16, c='currentColor' }) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="m13 5 7 7-7 7"/></svg>,
  Back:     ({ s=18, c='currentColor' }) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5"/><path d="m12 19-7-7 7-7"/></svg>,
  Send:     ({ s=18, c='currentColor' }) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="m4 12 17-9-6 18-3-7z"/><path d="m12 14 4-5"/></svg>,
  Check:    ({ s=14, c='currentColor' }) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="m5 12 5 5L20 7"/></svg>,
  X:        ({ s=16, c='currentColor' }) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2" strokeLinecap="round"><path d="M6 6l12 12M18 6 6 18"/></svg>,
  Coffee:   ({ s=14, c='currentColor' }) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M4 9h13v6a4 4 0 0 1-4 4H8a4 4 0 0 1-4-4z"/><path d="M17 11h2a2 2 0 0 1 0 4h-2"/><path d="M8 3v2M11 3v2M14 3v2"/></svg>,
  Plant:    ({ s=14, c='currentColor' }) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M12 14c0-5 3-8 8-9-1 5-4 8-8 9z"/><path d="M12 14c0-5-3-8-8-9 1 5 4 8 8 9z"/><path d="M12 14v6"/></svg>,
  Moon:     ({ s=14, c='currentColor' }) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M21 13a9 9 0 1 1-10-10 7 7 0 0 0 10 10z"/></svg>,
  Music:    ({ s=14, c='currentColor' }) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/><path d="M9 18V6l12-2v12"/></svg>,
  Settings: ({ s=18, c='currentColor' }) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19 12c0-.4 0-.8-.1-1.2l2-1.6-2-3.4-2.4.9c-.6-.5-1.3-.9-2.1-1.2L14 3h-4l-.4 2.5a7 7 0 0 0-2.1 1.2L5.1 5.8l-2 3.4 2 1.6c-.1.4-.1.8-.1 1.2 0 .4 0 .8.1 1.2l-2 1.6 2 3.4 2.4-.9c.6.5 1.3.9 2.1 1.2L10 21h4l.4-2.5c.8-.3 1.5-.7 2.1-1.2l2.4.9 2-3.4-2-1.6c.1-.4.1-.8.1-1.2z"/></svg>,
  Globe:    ({ s=16, c='currentColor' }) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c3 3 3 15 0 18M12 3c-3 3-3 15 0 18"/></svg>,
  GradCap:  ({ s=16, c='currentColor' }) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M22 10v6M6 12v5c0 1.7 2.7 3 6 3s6-1.3 6-3v-5"/><path d="m2 7 10-4 10 4-10 4z"/></svg>,
  Bed:      ({ s=16, c='currentColor' }) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M2 20v-8a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v8"/><path d="M4 10V6a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v4"/><path d="M2 20h20"/></svg>,
};

// ===== Avatar (gradient bg) =====
const Avatar = ({ size=40, hue=0, label='', ring=false }) => {
  const grads = [
    'linear-gradient(135deg,#1FBFCC,#33D9D3)',
    'linear-gradient(135deg,#D93B8B,#E76AA8)',
    'linear-gradient(135deg,#8E5CD9,#1FBFCC)',
    'linear-gradient(135deg,#33D9D3,#8E5CD9)',
    'linear-gradient(135deg,#A47BE5,#D93B8B)',
    'linear-gradient(135deg,#1FBFCC,#8E5CD9)',
  ];
  return (
    <div style={{
      width: size, height: size, borderRadius: '50%',
      background: grads[hue % grads.length],
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      color: 'white', fontWeight: 700, fontSize: size * 0.36,
      boxShadow: ring ? `0 0 0 2.5px white, 0 0 0 4.5px ${BRAND.teal}` : 'none',
      flexShrink: 0,
    }}>{label}</div>
  );
};

// ===== Photo Placeholder (patterned gradient) =====
const Ph = ({ tint='turq', label, style={}, children }) => {
  const tints = {
    turq:   'linear-gradient(135deg, rgba(31,191,204,0.22) 0%, rgba(142,92,217,0.10) 100%)',
    rose:   'linear-gradient(135deg, rgba(217,59,139,0.20) 0%, rgba(142,92,217,0.10) 100%)',
    violet: 'linear-gradient(135deg, rgba(142,92,217,0.22) 0%, rgba(31,191,204,0.10) 100%)',
    cream:  'linear-gradient(135deg, rgba(250,250,248,0.95) 0%, rgba(240,234,251,0.6) 100%)',
  };
  const hasChildren = React.Children.count(children) > 0;
  return (
    <div style={{
      position: 'relative', overflow: 'hidden', borderRadius: 18, background: '#F8FAFC',
      backgroundImage: 'repeating-linear-gradient(135deg, rgba(31,191,204,0.07) 0 6px, rgba(142,92,217,0.07) 6px 12px, transparent 12px 22px)',
      ...style,
    }}>
      <div style={{ position: 'absolute', inset: 0, backgroundImage: tints[tint] }}/>
      {!hasChildren && label && (
        <div style={{ position: 'absolute', left: 8, bottom: 8 }}>
          <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 9, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'rgba(15,23,42,0.55)', background: 'rgba(255,255,255,0.80)', padding: '3px 7px', borderRadius: 999, border: '1px solid rgba(255,255,255,0.85)' }}>{label}</span>
        </div>
      )}
      {children}
    </div>
  );
};

// ===== Pill button =====
const Pill = ({ children, variant='grad', size='md', onClick, style={} }) => {
  const t = useT();
  const sz = { sm: { h: 32, px: 14, fs: 12 }, md: { h: 44, px: 20, fs: 14 }, lg: { h: 54, px: 24, fs: 15 } }[size];
  const vars = {
    grad:  { backgroundImage: GRAD, color: 'white', boxShadow: '0 10px 28px -12px rgba(31,191,204,0.42), 0 8px 22px -14px rgba(142,92,217,0.38)' },
    ghost: { background: t.card, color: t.ink, border: `1px solid ${t.line}` },
    dark:  { background: t.ink, color: t.bg },
    quiet: { background: 'transparent', color: t.soft },
  };
  return (
    <button onClick={onClick} style={{
      height: sz.h, padding: `0 ${sz.px}px`, borderRadius: 999, border: 'none',
      fontFamily: 'inherit', fontWeight: 600, fontSize: sz.fs, cursor: 'pointer',
      display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 6,
      transition: 'transform .15s, box-shadow .15s',
      ...vars[variant], ...style,
    }}
    onMouseDown={e => e.currentTarget.style.transform = 'translateY(1px)'}
    onMouseUp={e => e.currentTarget.style.transform = ''}
    onMouseLeave={e => e.currentTarget.style.transform = ''}>
      {children}
    </button>
  );
};

// ===== Chip =====
const Chip = ({ children, active=false, onClick, icon, style={} }) => {
  const t = useT();
  return (
    <button onClick={onClick} style={{
      display: 'inline-flex', alignItems: 'center', gap: 5,
      padding: '6px 12px', borderRadius: 999,
      border: active ? '1px solid transparent' : `1px solid ${t.line}`,
      background: active ? t.ink : t.card,
      color: active ? t.bg : t.soft,
      fontSize: 11.5, fontWeight: 500, fontFamily: 'inherit', cursor: 'pointer', flexShrink: 0,
      ...style,
    }}>{icon}{children}</button>
  );
};

// ===== Card =====
const Card = ({ style={}, children, padding=16 }) => {
  const t = useT();
  return (
    <div style={{ background: t.card, borderRadius: 22, border: `1px solid ${t.line}`, padding, ...style }}>
      {children}
    </div>
  );
};

// ===== Section heading =====
const SectionTitle = ({ title, action }) => {
  const t = useT();
  return (
    <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', padding: '0 18px', marginTop: 22, marginBottom: 12 }}>
      <h3 style={{ margin: 0, fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif", fontSize: 20, fontWeight: 700, letterSpacing: '-0.02em', color: t.ink }}>{title}</h3>
      {action && <button onClick={action.onClick} style={{ background: 'none', border: 'none', color: t.soft, fontSize: 12, fontFamily: 'inherit', cursor: 'pointer', fontWeight: 500 }}>{action.label}</button>}
    </div>
  );
};

// ===== Bottom tab bar — glass blur + gradient dot indicator =====
const TabBar = ({ tab, setTab }) => {
  const t = useT();
  const tr = useTr();
  const { dark } = useContext(ThemeCtx);
  const items = [
    { id: 'home',    l: tr.nav_home,   Icon: I.Home  },
    { id: 'search',  l: tr.nav_search, Icon: I.Home  },
    { id: 'matches', l: tr.nav_match,  Icon: I.Heart },
    { id: 'chat',    l: tr.nav_chat,   Icon: I.Chat  },
    { id: 'me',      l: tr.nav_me,     Icon: I.User  },
  ];
  return (
    <div style={{
      position: 'absolute', left: 10, right: 10, bottom: 20, height: 66, borderRadius: 30,
      background: dark ? 'rgba(24,27,35,0.88)' : 'rgba(255,255,255,0.88)',
      backdropFilter: 'blur(22px) saturate(160%)', WebkitBackdropFilter: 'blur(22px) saturate(160%)',
      border: `1px solid ${t.line}`, boxShadow: '0 14px 40px -14px rgba(15,23,42,0.18)',
      display: 'flex', alignItems: 'center', justifyContent: 'space-around', zIndex: 30,
    }}>
      {items.map(({ id, l, Icon }) => {
        const active = tab === id;
        return (
          <button key={id} onClick={() => setTab(id)} style={{
            background: 'none', border: 'none', cursor: 'pointer',
            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3, padding: '6px 10px',
          }}>
            <div style={{ position: 'relative' }}>
              <Icon s={22} c={active ? t.ink : t.mute} filled={active && id === 'home'}/>
              {active && (
                <span style={{
                  position: 'absolute', bottom: -6, left: '50%', transform: 'translateX(-50%)',
                  width: 16, height: 3, borderRadius: 999, backgroundImage: GRAD,
                }}/>
              )}
            </div>
            <span style={{ fontSize: 9.5, fontWeight: 600, letterSpacing: '0.02em', color: active ? t.ink : t.mute }}>{l}</span>
          </button>
        );
      })}
    </div>
  );
};

Object.assign(window, { ThemeCtx, BRAND, GRAD, T, useT, useLang, useTr, COPY, I, Avatar, Ph, Pill, Chip, Card, SectionTitle, TabBar });
