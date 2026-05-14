/* Staymate Mobile — main app: routes screens, lays out frames on canvas, tweaks */
const { useState: uSt, useEffect: uEf } = React;

const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
  "dark": false,
  "lang": "en"
}/*EDITMODE-END*/;

// ===== Frame App: drives the prototype state inside one device =====
function ProtoApp({ start = 'home', startHome = 'A' }) {
  const [route, setRoute] = uSt(start);
  const [tab, setTab] = uSt('home');
  const [person, setPerson] = uSt(PEOPLE[0]);
  const [homeKind, setHomeKind] = uSt(startHome);

  // tab-driven nav
  const onTab = (id) => {
    setTab(id);
    if (id === 'home')    setRoute('home');
    if (id === 'search')  setRoute('search');
    if (id === 'matches') setRoute('matches');
    if (id === 'chat')    setRoute('chat');
    if (id === 'me')      setRoute('profile');
  };

  const goPerson = (p) => { setPerson(p); setRoute('detail'); };

  switch (route) {
    case 'splash':
      return <Splash onCta={() => setRoute('login')} onSignin={() => setRoute('login')} />;
    case 'login':
      return <Login onBack={() => setRoute('splash')} onContinue={() => { setRoute('home'); setTab('home'); }} />;
    case 'home':
      if (homeKind === 'B') return <HomeB onPerson={goPerson} tab={tab} setTab={onTab} />;
      if (homeKind === 'C') return <HomeC onPerson={goPerson} tab={tab} setTab={onTab} />;
      return <HomeA onPerson={goPerson} onSearch={() => { setRoute('search'); setTab('search'); }} tab={tab} setTab={onTab} />;
    case 'search':
      return <SearchScreen onPerson={goPerson} onBack={() => { setRoute('home'); setTab('home'); }} tab={tab} setTab={onTab} />;
    case 'detail':
      return <Detail person={person} onBack={() => setRoute('home')} onChat={() => { setRoute('chat'); setTab('chat'); }} onBook={() => { setRoute('chat'); setTab('chat'); }} />;
    case 'chat':
      return <Chat person={person} onBack={() => { setRoute('matches'); setTab('matches'); }} tab={tab} setTab={onTab} />;
    case 'matches':
      return <Matches onPerson={goPerson} tab={tab} setTab={onTab} />;
    case 'profile':
      return <Profile tab={tab} setTab={onTab} />;
    default:
      return <Splash onCta={() => setRoute('login')} onSignin={() => setRoute('login')} />;
  }
}

// ===== iOS / Android frame wrappers =====
function IOSFrame({ children, dark }) {
  return (
    <div style={{
      width: 402, height: 874, borderRadius: 56, overflow: 'hidden',
      position: 'relative', background: dark ? '#000' : '#FFFFFF',
      boxShadow: '0 40px 80px -20px rgba(31,41,55,0.22), 0 0 0 1px rgba(0,0,0,0.08)',
      border: dark ? '8px solid #1a1a1c' : '8px solid #e8e8ea',
    }}>
      {/* Dynamic Island */}
      <div style={{
        position: 'absolute', top: 11, left: '50%', transform: 'translateX(-50%)',
        width: 126, height: 37, borderRadius: 24, background: '#000', zIndex: 100,
      }} />
      {/* Status bar */}
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0, height: 54, zIndex: 99,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '0 36px', paddingTop: 18, fontFamily: '-apple-system, "SF Pro", system-ui',
        fontWeight: 600, fontSize: 16, color: dark ? '#fff' : '#1F2937', pointerEvents: 'none',
      }}>
        <span>9:41</span>
        <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
          <svg width="18" height="11" viewBox="0 0 18 11" fill={dark ? '#fff' : '#1F2937'}>
            <rect x="0" y="7" width="3" height="4" rx="0.5"/>
            <rect x="4.5" y="5" width="3" height="6" rx="0.5"/>
            <rect x="9" y="2.5" width="3" height="8.5" rx="0.5"/>
            <rect x="13.5" y="0" width="3" height="11" rx="0.5"/>
          </svg>
          <svg width="24" height="11" viewBox="0 0 24 11" fill="none">
            <rect x="0.5" y="0.5" width="20" height="10" rx="2.5" stroke={dark ? '#fff' : '#1F2937'} strokeOpacity="0.4"/>
            <rect x="2" y="2" width="17" height="7" rx="1.5" fill={dark ? '#fff' : '#1F2937'}/>
            <path d="M22 4v3c.6-.2 1-.7 1-1.5s-.4-1.3-1-1.5z" fill={dark ? '#fff' : '#1F2937'} fillOpacity="0.5"/>
          </svg>
        </div>
      </div>
      {/* Content */}
      <div style={{ position: 'absolute', inset: 0 }}>
        {children}
      </div>
      {/* Home indicator */}
      <div style={{
        position: 'absolute', bottom: 8, left: '50%', transform: 'translateX(-50%)',
        width: 134, height: 5, borderRadius: 999, zIndex: 200,
        background: dark ? 'rgba(255,255,255,0.6)' : 'rgba(31,41,55,0.4)',
      }} />
    </div>
  );
}

function AndroidFrame({ children, dark }) {
  return (
    <div style={{
      width: 412, height: 874, borderRadius: 38, overflow: 'hidden',
      position: 'relative', background: dark ? '#0E0F12' : '#FFFFFF',
      boxShadow: '0 40px 80px -20px rgba(31,41,55,0.22), 0 0 0 1px rgba(0,0,0,0.08)',
      border: '6px solid #c4c8c6',
    }}>
      {/* Punch hole */}
      <div style={{
        position: 'absolute', top: 14, left: '50%', transform: 'translateX(-50%)',
        width: 22, height: 22, borderRadius: 999, background: '#1a1a1c', zIndex: 100,
      }} />
      {/* Status bar */}
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0, height: 44, zIndex: 99,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '0 22px', paddingTop: 14, fontFamily: 'Roboto, system-ui',
        fontWeight: 500, fontSize: 13.5, color: dark ? '#fff' : '#1F2937', pointerEvents: 'none',
      }}>
        <span>9:41</span>
        <div style={{ display: 'flex', gap: 5, alignItems: 'center' }}>
          <svg width="14" height="10" viewBox="0 0 14 10" fill={dark ? '#fff' : '#1F2937'}>
            <path d="M7 9.5L.5 3a9 9 0 0 1 13 0L7 9.5z"/>
          </svg>
          <svg width="16" height="11" viewBox="0 0 16 11" fill="none">
            <rect x="0.5" y="0.5" width="13" height="10" rx="2" stroke={dark ? '#fff' : '#1F2937'}/>
            <rect x="2" y="2" width="10" height="7" rx="1" fill={dark ? '#fff' : '#1F2937'}/>
            <path d="M14.5 4v3" stroke={dark ? '#fff' : '#1F2937'}/>
          </svg>
        </div>
      </div>
      <div style={{ position: 'absolute', inset: 0 }}>
        {children}
      </div>
      {/* Gesture pill */}
      <div style={{
        position: 'absolute', bottom: 7, left: '50%', transform: 'translateX(-50%)',
        width: 110, height: 4, borderRadius: 999, zIndex: 200,
        background: dark ? 'rgba(255,255,255,0.5)' : 'rgba(31,41,55,0.45)',
      }} />
    </div>
  );
}

// Mini frame (for variations row)
function MiniIOS({ children, dark, label }) {
  return (
    <div>
      <IOSFrame dark={dark}>{children}</IOSFrame>
      {label && <div style={{ marginTop: 12, fontSize: 11, fontFamily: 'JetBrains Mono', letterSpacing: '0.1em', textTransform: 'uppercase', color: '#4B5563', textAlign: 'center' }}>{label}</div>}
    </div>
  );
}

// ===== Tweaks Panel =====
function StaymateTweaks() {
  const [t, setTw] = useTweaks(TWEAK_DEFAULTS);
  return (
    <TweaksPanel title="Staymate · Tweaks">
      <TweakSection title="Theme">
        <TweakRadio label="Mode" value={t.dark ? 'dark' : 'light'}
          options={[{value:'light',label:'Light'},{value:'dark',label:'Dark'}]}
          onChange={v => setTw('dark', v === 'dark')}/>
      </TweakSection>
      <TweakSection title="Language">
        <TweakRadio label="Locale" value={t.lang}
          options={[{value:'en',label:'EN'},{value:'pl',label:'PL'}]}
          onChange={v => setTw('lang', v)}/>
      </TweakSection>
    </TweaksPanel>
  );
}

// ===== Root =====
function App() {
  const [tw] = useTweaks(TWEAK_DEFAULTS);
  const dark = !!tw.dark;
  const lang = tw.lang || 'en';

  return (
    <ThemeCtx.Provider value={{ dark, lang }}>
      <DesignCanvas>

        <DCSection id="flow" title="Staymate · roommate finder" subtitle="Tap through the live prototype on each device — both share state.">
          <DCArtboard id="ios-flow" label="iOS · Liquid glass" width={418} height={890}>
            <div style={{ padding: 0 }}>
              <IOSFrame dark={dark}><ProtoApp start="splash" startHome="A" /></IOSFrame>
            </div>
          </DCArtboard>
          <DCArtboard id="android-flow" label="Android · Material 3" width={424} height={886}>
            <AndroidFrame dark={dark}><ProtoApp start="splash" startHome="A" /></AndroidFrame>
          </DCArtboard>
        </DCSection>

        <DCSection id="home-variants" title="Home · 3 variations" subtitle="Same data, three discovery patterns. Tap any to interact.">
          <DCArtboard id="home-feed"  label="A · Editorial feed (default)" width={418} height={890}>
            <IOSFrame dark={dark}><ProtoApp start="home" startHome="A" /></IOSFrame>
          </DCArtboard>
          <DCArtboard id="home-stack" label="B · Swipe stack" width={418} height={890}>
            <IOSFrame dark={dark}><ProtoApp start="home" startHome="B" /></IOSFrame>
          </DCArtboard>
          <DCArtboard id="home-map"   label="C · Map first" width={418} height={890}>
            <IOSFrame dark={dark}><ProtoApp start="home" startHome="C" /></IOSFrame>
          </DCArtboard>
        </DCSection>

        <DCSection id="screens-ios" title="iOS · Key screens" subtitle="Each frame is interactive — tabs and links work.">
          <DCArtboard id="ios-detail"  label="Profile · detail" width={418} height={890}>
            <IOSFrame dark={dark}><ProtoApp start="detail" /></IOSFrame>
          </DCArtboard>
          <DCArtboard id="ios-search"  label="Search" width={418} height={890}>
            <IOSFrame dark={dark}><ProtoApp start="search" /></IOSFrame>
          </DCArtboard>
          <DCArtboard id="ios-chat"    label="Chat" width={418} height={890}>
            <IOSFrame dark={dark}><ProtoApp start="chat" /></IOSFrame>
          </DCArtboard>
          <DCArtboard id="ios-matches" label="Matches" width={418} height={890}>
            <IOSFrame dark={dark}><ProtoApp start="matches" /></IOSFrame>
          </DCArtboard>
          <DCArtboard id="ios-profile" label="Profile · me" width={418} height={890}>
            <IOSFrame dark={dark}><ProtoApp start="profile" /></IOSFrame>
          </DCArtboard>
          <DCArtboard id="ios-login"   label="Login" width={418} height={890}>
            <IOSFrame dark={dark}><ProtoApp start="login" /></IOSFrame>
          </DCArtboard>
        </DCSection>

        <DCSection id="screens-android" title="Android · Material parity" subtitle="Same flow, native Material 3 chrome.">
          <DCArtboard id="and-home"    label="Home" width={424} height={886}>
            <AndroidFrame dark={dark}><ProtoApp start="home" startHome="A" /></AndroidFrame>
          </DCArtboard>
          <DCArtboard id="and-detail"  label="Detail" width={424} height={886}>
            <AndroidFrame dark={dark}><ProtoApp start="detail" /></AndroidFrame>
          </DCArtboard>
          <DCArtboard id="and-chat"    label="Chat" width={424} height={886}>
            <AndroidFrame dark={dark}><ProtoApp start="chat" /></AndroidFrame>
          </DCArtboard>
          <DCArtboard id="and-profile" label="Profile" width={424} height={886}>
            <AndroidFrame dark={dark}><ProtoApp start="profile" /></AndroidFrame>
          </DCArtboard>
        </DCSection>

      </DesignCanvas>
      <StaymateTweaks />
    </ThemeCtx.Provider>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<App />);
