import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  ScrollView,
  Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import { RootStackParamList } from '../../App';

type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'CompatibilityReport'>;
  route: RouteProp<RootStackParamList, 'CompatibilityReport'>;
};

const C = {
  bg: '#FFFFFF', bgSoft: '#FAFAFA', ink: '#1F2937', soft: '#4B5563',
  mute: '#9CA3AF', line: 'rgba(31,41,55,0.08)',
  brandA: '#00CFC8', tealBg: '#E6FBFA', tealTx: '#00A8A2',
  brandB: '#FF9ACD', pinkBg: '#FFF0F7', pinkTx: '#F06EB1',
};

type Phase = 'loading' | 'streaming' | 'done';

const COMPAT_ROWS = [
  { key: 'sleep'     as const, label: 'Uyku Düzeni' },
  { key: 'clean'     as const, label: 'Temizlik'    },
  { key: 'social'    as const, label: 'Sosyallik'   },
  { key: 'work'      as const, label: 'Çalışma'     },
  { key: 'lifestyle' as const, label: 'Yaşam Tarzı' },
];

// ── Fake rapor üretici ────────────────────────────────────────────────────────
function buildReport(name: string, compat: Props['route']['params']['compat']): string {
  const avg = Math.round(
    (compat.sleep + compat.clean + compat.social + compat.work + compat.lifestyle) / 5
  );

  if (avg >= 90) {
    return (
      `${name} ile uyumluluğun mükemmel seviyede! ` +
      `Uyku düzeniniz ve temizlik alışkanlıklarınız neredeyse özdeş — bu, günlük rutinde sıfır sürtüşme anlamına geliyor. ` +
      `Sosyal tercihlerde küçük farklılıklar var, ama bunlar açık iletişimle kolayca yönetilebilir. ` +
      `Uzun vadede huzurlu ve dengeli bir ev ortamı kurabilirsiniz.`
    );
  }
  if (avg >= 80) {
    return (
      `${name} ile genel uyumluluğun çok iyi. ` +
      `Çalışma alışkanlıklarınız ve temizlik standartlarınız büyük ölçüde örtüşüyor. ` +
      `Uyku saatlerinde orta düzeyde bir fark göze çarpıyor — bunu baştan netleştirmenizi öneririm. ` +
      `Birlikte net ev kuralları belirleyerek uzun soluklu, keyifli bir birliktelik kurabilirsiniz.`
    );
  }
  return (
    `${name} ile bazı önemli ortak noktalara sahipsiniz. ` +
    `Temizlik ve evcil hayvan konularını önceden açıkça konuşmanız kritik önem taşıyor. ` +
    `Yaşam tarzı farklılıkları yönetilebilir düzeyde; karşılıklı saygı ve uzlaşıya hazır olursanız bu uyum işe yarayabilir. ` +
    `İlk birkaç haftayı bir deneme süreci olarak değerlendirmenizi tavsiye ederim.`
  );
}

// ── Gerçek API çağrısı yapısı (API key eklenince aktif olacak) ────────────────
/*
async function callClaudeAPI(
  prompt: string,
  onToken: (token: string) => void,
  onDone: () => void,
): Promise<void> {
  const API_KEY = ''; // process.env.ANTHROPIC_API_KEY
  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': API_KEY,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: 'claude-sonnet-4-6',
      max_tokens: 500,
      stream: true,
      system:
        'Sen bir oda arkadaşı uyumluluk analistisin. Türkçe konuş, samimi ve yardımcı ol.',
      messages: [{ role: 'user', content: prompt }],
    }),
  });
  // SSE stream parsing: her satır "data: {...}" formatında gelir
  const reader = response.body?.getReader();
  const decoder = new TextDecoder();
  if (!reader) { onDone(); return; }
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    const chunk = decoder.decode(value, { stream: true });
    for (const line of chunk.split('\n')) {
      if (!line.startsWith('data: ')) continue;
      const json = line.slice(6);
      if (json === '[DONE]') { onDone(); return; }
      try {
        const parsed = JSON.parse(json);
        const token = parsed.delta?.text ?? '';
        if (token) onToken(token);
      } catch {}
    }
  }
  onDone();
}
*/

// ── Fake streaming (API key yokken) ──────────────────────────────────────────
function fakeStream(
  text: string,
  onToken: (accumulated: string) => void,
  onDone: () => void,
): ReturnType<typeof setInterval> {
  const words = text.split(' ');
  let idx = 0;
  const id = setInterval(() => {
    idx++;
    onToken(words.slice(0, idx).join(' '));
    if (idx >= words.length) {
      clearInterval(id);
      onDone();
    }
  }, 85);
  return id;
}

// ── Component ─────────────────────────────────────────────────────────────────
export default function CompatibilityReportScreen({ navigation, route }: Props) {
  const {
    userId,
    userName,
    userInitial,
    userAvatarColor,
    userMatch,
    compat,
    traits,
  } = route.params;

  const [phase, setPhase]           = useState<Phase>('loading');
  const [reportText, setReportText] = useState('');
  const streamRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // ── Dot loading animation ────────────────────────────────────────────────
  const dots = useRef([
    new Animated.Value(0.3),
    new Animated.Value(0.3),
    new Animated.Value(0.3),
  ]).current;
  const dotLoop = useRef<Animated.CompositeAnimation | null>(null);

  const startDots = useCallback(() => {
    const pulse = (a: Animated.Value, delay: number) =>
      Animated.loop(
        Animated.sequence([
          Animated.delay(delay),
          Animated.timing(a, { toValue: 1, duration: 260, useNativeDriver: true }),
          Animated.timing(a, { toValue: 0.3, duration: 260, useNativeDriver: true }),
          Animated.delay(Math.max(0, 780 - delay - 520)),
        ]),
      );
    dotLoop.current = Animated.parallel([pulse(dots[0], 0), pulse(dots[1], 260), pulse(dots[2], 520)]);
    dotLoop.current.start();
  }, [dots]);

  const stopDots = useCallback(() => {
    dotLoop.current?.stop();
    dots.forEach(d => d.setValue(0.3));
  }, [dots]);

  // ── Bar animations ────────────────────────────────────────────────────────
  const barAnims = useRef(COMPAT_ROWS.map(() => new Animated.Value(0))).current;

  const animateBars = useCallback(() => {
    Animated.stagger(
      110,
      barAnims.map(a =>
        Animated.timing(a, { toValue: 1, duration: 520, useNativeDriver: false }),
      ),
    ).start();
  }, [barAnims]);

  // ── Pulse animation for the match score ──────────────────────────────────
  const matchPulse = useRef(new Animated.Value(1)).current;

  const startMatchPulse = useCallback(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(matchPulse, { toValue: 1.05, duration: 800, useNativeDriver: true }),
        Animated.timing(matchPulse, { toValue: 1,    duration: 800, useNativeDriver: true }),
      ]),
    ).start();
  }, [matchPulse]);

  // ── Mount: loading → streaming → done ────────────────────────────────────
  useEffect(() => {
    startDots();
    startMatchPulse();

    // Simulated API "thinking" delay
    const loadTimer = setTimeout(() => {
      stopDots();
      setPhase('streaming');

      const report = buildReport(userName, compat);
      streamRef.current = fakeStream(
        report,
        (accumulated) => setReportText(accumulated),
        () => {
          setPhase('done');
          animateBars();
        },
      );
    }, 1800);

    return () => {
      clearTimeout(loadTimer);
      if (streamRef.current) clearInterval(streamRef.current);
      dotLoop.current?.stop();
    };
  }, []);

  // ── Cursor blink ─────────────────────────────────────────────────────────
  const cursorOpacity = useRef(new Animated.Value(1)).current;
  useEffect(() => {
    if (phase !== 'streaming') return;
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(cursorOpacity, { toValue: 0, duration: 400, useNativeDriver: true }),
        Animated.timing(cursorOpacity, { toValue: 1, duration: 400, useNativeDriver: true }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [phase, cursorOpacity]);

  return (
    <SafeAreaView style={st.root} edges={['top', 'bottom']}>
      <StatusBar barStyle="dark-content" backgroundColor={C.bg} />

      {/* ── Header ── */}
      <View style={st.header}>
        <TouchableOpacity style={st.hBtn} onPress={() => navigation.goBack()} activeOpacity={0.7}>
          <Text style={st.hBtnTxt}>←</Text>
        </TouchableOpacity>
        <View style={st.hCenter}>
          <Text style={st.hEyebrow}>🤖</Text>
          <Text style={st.hTitle}>AI Uyumluluk Raporu</Text>
        </View>
        <View style={st.hBtn} />
      </View>

      <ScrollView
        style={st.scroll}
        contentContainerStyle={st.scrollContent}
        showsVerticalScrollIndicator={false}
      >

        {/* ── Hero: iki avatar + uyum skoru ── */}
        <View style={st.hero}>
          <View style={st.heroBlob1} />
          <View style={st.heroBlob2} />

          <View style={st.avatarRow}>
            {/* Benim avatarım */}
            <View style={st.avatarGroup}>
              <View style={[st.avatar, { backgroundColor: C.brandA }]}>
                <Text style={st.avatarTxt}>M</Text>
              </View>
              <Text style={st.avatarLabel}>Sen</Text>
            </View>

            {/* Bağlayıcı + skor */}
            <Animated.View style={[st.connector, { transform: [{ scale: matchPulse }] }]}>
              <View style={st.connectorLine} />
              <View style={st.scoreBadge}>
                <Text style={st.scorePercent}>{userMatch}%</Text>
                <Text style={st.scoreLabel}>uyum</Text>
              </View>
              <View style={st.connectorLine} />
            </Animated.View>

            {/* Diğer kullanıcının avatarı */}
            <View style={st.avatarGroup}>
              <View style={[st.avatar, { backgroundColor: userAvatarColor }]}>
                <Text style={st.avatarTxt}>{userInitial}</Text>
              </View>
              <Text style={st.avatarLabel}>{userName}</Text>
            </View>
          </View>

          {/* Kısa özellik özeti */}
          {traits.length > 0 && (
            <View style={st.traitRow}>
              {traits.slice(0, 3).map((t, i) => (
                <View key={i} style={st.traitPill}>
                  <Text style={st.traitPillTxt}>{t}</Text>
                </View>
              ))}
            </View>
          )}
        </View>

        {/* ── AI Analiz kartı ── */}
        <View style={st.analysisCard}>
          <View style={st.analysisHeader}>
            <Text style={st.analysisEyebrow}>AI ANALİZİ</Text>
            <View style={[st.statusPill, phase === 'done' && st.statusPillDone]}>
              {phase === 'loading' && (
                <View style={st.dotsRow}>
                  {dots.map((d, i) => (
                    <Animated.View key={i} style={[st.dot, { opacity: d }]} />
                  ))}
                  <Text style={st.statusText}> analiz ediyor...</Text>
                </View>
              )}
              {phase !== 'loading' && (
                <Text style={[st.statusText, phase === 'done' && st.statusTextDone]}>
                  {phase === 'streaming' ? '⟳ yazıyor...' : '✓ tamamlandı'}
                </Text>
              )}
            </View>
          </View>

          {/* Rapor metni */}
          <View style={st.reportTextWrap}>
            {phase === 'loading' ? (
              <View style={st.loadingPlaceholder}>
                <View style={[st.skeletonLine, { width: '100%' }]} />
                <View style={[st.skeletonLine, { width: '88%', marginTop: 8 }]} />
                <View style={[st.skeletonLine, { width: '92%', marginTop: 8 }]} />
                <View style={[st.skeletonLine, { width: '70%', marginTop: 8 }]} />
              </View>
            ) : (
              <Text style={st.reportText}>
                {reportText}
                {phase === 'streaming' && (
                  <Animated.Text style={[st.cursor, { opacity: cursorOpacity }]}>
                    {'▌'}
                  </Animated.Text>
                )}
              </Text>
            )}
          </View>
        </View>

        {/* ── Kategori çubukları ── */}
        <View style={st.compatCard}>
          <Text style={st.compatTitle}>Kategori Detayları</Text>
          {COMPAT_ROWS.map(({ key, label }, i) => {
            const pct = compat[key];
            const color = pct >= 85 ? C.brandA : C.brandB;
            return (
              <View key={key} style={st.compatRow}>
                <View style={st.compatLabelRow}>
                  <Text style={st.compatLabel}>{label}</Text>
                  <Text style={[st.compatPct, { color }]}>{pct}%</Text>
                </View>
                <View style={st.compatBarBg}>
                  <Animated.View
                    style={[
                      st.compatBarFill,
                      {
                        backgroundColor: color,
                        width: barAnims[i].interpolate({
                          inputRange: [0, 1],
                          outputRange: ['0%', `${pct}%`],
                        }),
                      },
                    ]}
                  />
                </View>
              </View>
            );
          })}
        </View>

        <View style={{ height: 20 }} />
      </ScrollView>

      {/* ── Sabit aksiyon butonları ── */}
      <View style={st.footer}>
        <TouchableOpacity
          style={st.likeBtn}
          onPress={() => navigation.goBack()}
          activeOpacity={0.85}
        >
          <Text style={st.likeBtnTxt}>♥ Eşleş</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={st.chatBtn}
          onPress={() => navigation.navigate('Chat', { matchId: userId })}
          activeOpacity={0.85}
        >
          <Text style={st.chatBtnTxt}>Mesaj Gönder →</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────────
const st = StyleSheet.create({
  root: { flex: 1, backgroundColor: C.bg },

  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 18, paddingTop: 14, paddingBottom: 12,
    borderBottomWidth: 1, borderBottomColor: C.line,
  },
  hBtn: {
    width: 38, height: 38, borderRadius: 999,
    backgroundColor: C.bgSoft, borderWidth: 1, borderColor: C.line,
    alignItems: 'center', justifyContent: 'center',
  },
  hBtnTxt: { color: C.ink, fontSize: 17 },
  hCenter: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  hEyebrow: { fontSize: 16 },
  hTitle: { color: C.ink, fontSize: 15, fontWeight: '700', letterSpacing: -0.2 },

  scroll: { flex: 1 },
  scrollContent: { paddingHorizontal: 18, paddingTop: 20 },

  // Hero
  hero: {
    alignItems: 'center', paddingBottom: 20, position: 'relative', overflow: 'hidden',
  },
  heroBlob1: {
    position: 'absolute', width: 280, height: 280, borderRadius: 999,
    backgroundColor: C.brandA, top: -140, left: -100, opacity: 0.09,
  },
  heroBlob2: {
    position: 'absolute', width: 280, height: 280, borderRadius: 999,
    backgroundColor: C.brandB, top: -140, right: -100, opacity: 0.09,
  },
  avatarRow: {
    flexDirection: 'row', alignItems: 'center', gap: 0, marginBottom: 16,
  },
  avatarGroup: { alignItems: 'center', gap: 8 },
  avatar: {
    width: 72, height: 72, borderRadius: 999,
    alignItems: 'center', justifyContent: 'center',
    shadowColor: '#000', shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.18, shadowRadius: 14, elevation: 6,
  },
  avatarTxt:   { color: '#fff', fontSize: 28, fontWeight: '800' },
  avatarLabel: { color: C.soft, fontSize: 12, fontWeight: '600' },

  connector: {
    flexDirection: 'row', alignItems: 'center', marginHorizontal: 8, gap: 6,
  },
  connectorLine: { width: 24, height: 1.5, backgroundColor: C.line },
  scoreBadge: {
    backgroundColor: C.tealBg, borderRadius: 16,
    borderWidth: 1.5, borderColor: C.brandA,
    paddingHorizontal: 12, paddingVertical: 8,
    alignItems: 'center',
    shadowColor: C.brandA, shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25, shadowRadius: 8, elevation: 4,
  },
  scorePercent: { color: C.tealTx, fontSize: 20, fontWeight: '800', lineHeight: 24 },
  scoreLabel:   { color: C.tealTx, fontSize: 10, fontWeight: '600', letterSpacing: 0.5 },

  traitRow: { flexDirection: 'row', gap: 6, flexWrap: 'wrap', justifyContent: 'center' },
  traitPill: {
    backgroundColor: C.bgSoft, borderRadius: 999, borderWidth: 1, borderColor: C.line,
    paddingVertical: 4, paddingHorizontal: 10,
  },
  traitPillTxt: { color: C.soft, fontSize: 11 },

  // Analysis card
  analysisCard: {
    backgroundColor: C.bgSoft, borderRadius: 22, borderWidth: 1, borderColor: C.line,
    padding: 18, marginBottom: 16,
  },
  analysisHeader: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    marginBottom: 14,
  },
  analysisEyebrow: {
    color: C.mute, fontSize: 10, fontWeight: '700', letterSpacing: 1.4,
  },
  statusPill: {
    backgroundColor: C.bgSoft, borderRadius: 999, borderWidth: 1, borderColor: C.line,
    paddingVertical: 4, paddingHorizontal: 10,
  },
  statusPillDone: { backgroundColor: C.tealBg, borderColor: C.brandA },
  dotsRow: { flexDirection: 'row', alignItems: 'center' },
  dot: {
    width: 7, height: 7, borderRadius: 999,
    backgroundColor: C.brandA, marginHorizontal: 2,
  },
  statusText:     { color: C.mute, fontSize: 11, fontWeight: '600' },
  statusTextDone: { color: C.tealTx },

  reportTextWrap: { minHeight: 80 },
  reportText: { color: C.ink, fontSize: 15, lineHeight: 26, letterSpacing: 0.1 },
  cursor:     { color: C.brandA, fontWeight: '300' },

  // Skeleton loading
  loadingPlaceholder: {},
  skeletonLine: {
    height: 14, borderRadius: 7,
    backgroundColor: C.line,
  },

  // Compat bars
  compatCard: {
    backgroundColor: C.bgSoft, borderRadius: 22, borderWidth: 1, borderColor: C.line,
    padding: 18, marginBottom: 16,
  },
  compatTitle: { color: C.ink, fontSize: 14, fontWeight: '700', marginBottom: 16 },
  compatRow:   { marginBottom: 13 },
  compatLabelRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 },
  compatLabel: { color: C.soft, fontSize: 13 },
  compatPct:   { fontSize: 13, fontWeight: '800' },
  compatBarBg: {
    height: 6, backgroundColor: C.line, borderRadius: 999, overflow: 'hidden',
  },
  compatBarFill: { height: '100%', borderRadius: 999 },

  // Footer
  footer: {
    paddingHorizontal: 18, paddingBottom: 12, paddingTop: 12,
    borderTopWidth: 1, borderTopColor: C.line, backgroundColor: C.bg,
    gap: 10,
  },
  likeBtn: {
    backgroundColor: C.brandA, borderRadius: 999, paddingVertical: 17,
    alignItems: 'center',
    shadowColor: C.brandA, shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4, shadowRadius: 14, elevation: 6,
  },
  likeBtnTxt: { color: '#fff', fontSize: 16, fontWeight: '700' },
  chatBtn: {
    backgroundColor: C.tealBg, borderRadius: 999, paddingVertical: 15,
    alignItems: 'center', borderWidth: 1.5, borderColor: C.brandA,
  },
  chatBtnTxt: { color: C.tealTx, fontSize: 15, fontWeight: '700' },
});
