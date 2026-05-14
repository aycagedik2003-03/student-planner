import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  Animated,
  TextInput,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../App';
import { useAppStore } from '../store';
import { POLISH_CITIES } from '../constants/cities';
import { quizService, normalizeQuestion, type NormalizedQuestion } from '../api/QuizService';

type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'Quiz'>;
};

// ── Design tokens ──────────────────────────────────────────────────────────────
const C = {
  bg:     '#FFFFFF',
  bgSoft: '#FAFAFA',
  ink:    '#1F2937',
  soft:   '#4B5563',
  mute:   '#9CA3AF',
  line:   'rgba(31,41,55,0.08)',
  brandA: '#00CFC8',
  brandB: '#FF9ACD',
};

// ── Kategori yapılandırması ─────────────────────────────────────────────────────
const CATS = [
  { label: 'Uyku Düzeni', icon: '🌙' },
  { label: 'Temizlik',    icon: '🧹' },
  { label: 'Sosyallik',   icon: '🤝' },
  { label: 'Çalışma',     icon: '💻' },
  { label: 'Yaşam',       icon: '🌿' },
];

// ── Fallback: Hardcoded sorular (backend yanıt vermezse kullanılır) ─────────────
const FALLBACK_QUESTIONS: NormalizedQuestion[] = [
  // 0-2 Uyku
  { id: 'f0',  catIndex: 0, question: 'Genellikle ne zaman uyursun?',            opts: ['22:00 – 00:00', '00:00 – 02:00', '02:00\'dan sonra', 'Her gece farklı'] },
  { id: 'f1',  catIndex: 0, question: 'Sabah ne zaman uyanırsın?',               opts: ['06:00 – 07:00', '07:00 – 09:00', '09:00 – 11:00', '11:00\'den sonra'] },
  { id: 'f2',  catIndex: 0, question: 'Uyurken ortam nasıl olsun?',              opts: ['Mutlak sessizlik', 'Hafif gürültüye dayanırım', 'Gürültüden etkilenmem', 'Kulaklıkla uyurum'] },
  // 3-5 Temizlik
  { id: 'f3',  catIndex: 1, question: 'Ev temizliğini ne sıklıkla yaparsın?',    opts: ['Her gün', 'Haftada birkaç kez', 'Haftada bir', 'İki haftada bir'] },
  { id: 'f4',  catIndex: 1, question: 'Ortak alanlar için beklentin?',           opts: ['Kullanınca hemen temizle', 'Gün sonunda toparlanır', 'Haftalık düzen yeter', 'Çok takılmam'] },
  { id: 'f5',  catIndex: 1, question: 'Bulaşık konusundaki tutumun?',            opts: ['Kullanınca hemen yıkarım', 'Gün sonunda yıkarım', 'Sıra ile yaparız', 'Bulaşık makinesi şart'] },
  // 6-8 Sosyallik
  { id: 'f6',  catIndex: 2, question: 'Evde misafir ağırlamayı ne kadar seversin?', opts: ['Çok sık, kapım açık', 'Haftada bir kadar', 'Ara sıra, önceden bildir', 'Neredeyse hiç istemem'] },
  { id: 'f7',  catIndex: 2, question: 'Ev arkadaşınla ilişkin nasıl olsun?',    opts: ['Arkadaş gibi, birlikte vakit', 'İyi komşu gibi', 'Saygılı ama mesafeli', 'Sadece kurallar'] },
  { id: 'f8',  catIndex: 2, question: 'Evdeki genel atmosfer nasıl olsun?',      opts: ['Canlı ve sosyal', 'Bazen sosyal, çoğunlukla sakin', 'Çoğunlukla sessiz', 'Tamamen sakin'] },
  // 9-11 Çalışma
  { id: 'f9',  catIndex: 3, question: 'Genellikle nereden çalışırsın?',          opts: ['Evden', 'Ofisten', 'Kafeden', 'Her yerden (hybrid)'] },
  { id: 'f10', catIndex: 3, question: 'Evde çalışırken ortam nasıl olsun?',      opts: ['Tam sessizlik şart', 'Hafif ses olabilir', 'Gürültüden etkilenmem', 'Kulaklıkla çalışırım'] },
  { id: 'f11', catIndex: 3, question: 'Çalışma saatlerini nasıl tanımlarsın?',   opts: ['Sabah erken başlarım', '09:00 – 18:00 arası', 'Akşam ve gece', 'Tamamen düzensiz'] },
  // 12-15 Yaşam
  { id: 'f12', catIndex: 4, question: 'Evcil hayvan konusundaki tutumun?',       opts: ['Seviyorum, bende de var', 'Seviyorum, benimki yok', 'Alerjim yok, sorun değil', 'Aynı evde istemem'] },
  { id: 'f13', catIndex: 4, question: 'Sigara içiyor musun?',                    opts: ['Evet', 'Hayır', 'Bazen', 'Sadece dışarıda'] },
  { id: 'f14', catIndex: 4, question: 'Alkol kullanıyor musun?',                 opts: ['Düzenli', 'Sosyal ortamlarda', 'Nadir', 'Hiç'] },
  { id: 'f15', catIndex: 4, question: 'Yemek pişirme alışkanlığın?',             opts: ['Her gün evde pişiririm', 'Sık sık pişiririm', 'Nadiren pişiririm', 'Genelde dışarıda'] },
];

// ── Kategori segmentlerini hesapla ────────────────────────────────────────────
function buildSegments(questions: NormalizedQuestion[]) {
  const segs: { label: string; icon: string; from: number; to: number }[] = [];
  questions.forEach((q, i) => {
    const cat = CATS[q.catIndex] ?? { label: `Kategori ${q.catIndex + 1}`, icon: '❓' };
    const last = segs[segs.length - 1];
    if (last && last.label === cat.label) {
      last.to = i;
    } else {
      segs.push({ label: cat.label, icon: cat.icon, from: i, to: i });
    }
  });
  return segs;
}

// ── Ana bileşen ────────────────────────────────────────────────────────────────
export default function QuizScreen({ navigation }: Props) {
  const setQuizAnswers = useAppStore(s => s.setQuizAnswers);
  const setQuizCity    = useAppStore(s => s.setQuizCity);
  const savedCity      = useAppStore(s => s.quizCity);

  // ── Soru yükleme state'i ───────────────────────────────────────────────────
  const [questions,   setQuestions]   = useState<NormalizedQuestion[]>(FALLBACK_QUESTIONS);
  const [questionsLoading, setQLoading] = useState(true);
  const [usingFallback, setUsingFallback] = useState(false);

  // ── City pre-step state ────────────────────────────────────────────────────
  const [phase, setPhase]               = useState<'city' | 'quiz'>(savedCity ? 'quiz' : 'city');
  const [selectedCity, setSelectedCity] = useState<string | null>(savedCity);
  const [citySearch, setCitySearch]     = useState('');

  // ── Quiz state ─────────────────────────────────────────────────────────────
  const [idx, setIdx]         = useState(0);
  const [answers, setAnswers] = useState<(number | null)[]>(Array(FALLBACK_QUESTIONS.length).fill(null));
  const [picked, setPicked]   = useState<number | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitErr, setSubmitErr]   = useState<string | null>(null);

  const fade  = useRef(new Animated.Value(1)).current;
  const slide = useRef(new Animated.Value(0)).current;

  // ── Soruları backend'den çek ───────────────────────────────────────────────
  useEffect(() => {
    let cancelled = false;

    quizService
      .getQuestions()
      .then(rawQuestions => {
        if (cancelled || !rawQuestions?.length) {
          if (!cancelled) setUsingFallback(true);
          return;
        }

        // Her backend sorusunu normalize et; eksik alanlar için fallback kullan
        const normalized = rawQuestions.map((raw, i) => {
          const fb = FALLBACK_QUESTIONS[i] ?? FALLBACK_QUESTIONS[0];
          return normalizeQuestion(raw, fb.question, fb.opts, fb.catIndex, i);
        });

        if (!cancelled) {
          setQuestions(normalized);
          setAnswers(Array(normalized.length).fill(null));
          setUsingFallback(false);
        }
      })
      .catch(() => {
        // API erişilemez → hardcoded sorularla devam et
        if (!cancelled) setUsingFallback(true);
      })
      .finally(() => { if (!cancelled) setQLoading(false); });

    return () => { cancelled = true; };
  }, []);

  const segments = buildSegments(questions);
  const shownCities = POLISH_CITIES.filter(c =>
    c.toLowerCase().includes(citySearch.toLowerCase()),
  );

  const confirmCity = () => {
    if (!selectedCity) return;
    setQuizCity(selectedCity);
    setPhase('quiz');
  };

  const q      = questions[idx];
  const cat    = q ? (CATS[q.catIndex] ?? { label: 'Genel', icon: '❓' }) : CATS[0];
  const isLast = idx === questions.length - 1;
  const pct    = phase === 'city' ? 0 : (idx + 1) / questions.length;

  // ── Animasyon ──────────────────────────────────────────────────────────────
  const transition = (dir: 1 | -1, next: () => void) => {
    Animated.parallel([
      Animated.timing(fade,  { toValue: 0, duration: 140, useNativeDriver: true }),
      Animated.timing(slide, { toValue: dir * -18, duration: 140, useNativeDriver: true }),
    ]).start(() => {
      next();
      slide.setValue(dir * 18);
      Animated.parallel([
        Animated.timing(fade,  { toValue: 1, duration: 200, useNativeDriver: true }),
        Animated.timing(slide, { toValue: 0, duration: 200, useNativeDriver: true }),
      ]).start();
    });
  };

  const pick = (opt: number) => {
    const a = [...answers]; a[idx] = opt;
    setAnswers(a); setPicked(opt);
  };

  // ── Son soruda: submit → Profile ────────────────────────────────────────────
  const goNext = async () => {
    if (picked === null) return;
    const finalAnswers = [...answers];
    finalAnswers[idx] = picked;

    if (!isLast) {
      transition(1, () => { setIdx(i => i + 1); setPicked(answers[idx + 1]); });
      return;
    }

    // Son soru → cevapları kaydet ve submit et
    setQuizAnswers(finalAnswers);
    setSubmitErr(null);
    setSubmitting(true);

    try {
      await quizService.submitAnswers(finalAnswers);
    } catch (err: any) {
      // Submit hatası kullanıcıyı engellemez — sadece göster
      const msg =
        err?.response?.data?.message ||
        err?.response?.data?.error   ||
        'Cevaplar kaydedilemedi, daha sonra tekrar denenecek.';
      setSubmitErr(Array.isArray(msg) ? msg[0] : msg);
    } finally {
      setSubmitting(false);
      // Başarılı ya da başarısız — Profile'a git
      navigation.replace('Profile');
    }
  };

  const goBack = () => {
    if (phase === 'city') { navigation.goBack(); return; }
    if (idx === 0)        { setPhase('city'); return; }
    transition(-1, () => { setIdx(i => i - 1); setPicked(answers[idx - 1]); });
  };

  // ── Sorular yüklenirken splash ─────────────────────────────────────────────
  if (questionsLoading) {
    return (
      <SafeAreaView style={st.root}>
        <StatusBar barStyle="dark-content" backgroundColor={C.bg} />
        <View style={st.loadingWrap}>
          <ActivityIndicator size="large" color={C.brandA} />
          <Text style={st.loadingTxt}>Sorular yükleniyor…</Text>
        </View>
      </SafeAreaView>
    );
  }

  // ── Ortak header + progress bar bileşenleri ────────────────────────────────
  const Header = (
    <View style={st.header}>
      <TouchableOpacity style={st.backBtn} onPress={goBack} activeOpacity={0.7}>
        <Text style={st.backIco}>←</Text>
      </TouchableOpacity>
      <View style={st.counterRow}>
        <Text style={st.counterNum}>{phase === 'city' ? 0 : idx + 1}</Text>
        <Text style={st.counterSep}> / </Text>
        <Text style={st.counterTotal}>{questions.length}</Text>
      </View>
      {/* Fallback badge */}
      {usingFallback
        ? <View style={st.fallbackBadge}><Text style={st.fallbackTxt}>offline</Text></View>
        : <View style={st.backBtn} />
      }
    </View>
  );

  const ProgressBar = (
    <View style={st.progressWrap}>
      <View style={st.barBg}>
        <View style={[st.barFill, { width: `${pct * 100}%` as any }]} />
      </View>
      <View style={st.segRow}>
        {segments.map((seg, i) => {
          const done   = idx > seg.to  && phase === 'quiz';
          const active = idx >= seg.from && idx <= seg.to && phase === 'quiz';
          return (
            <View key={i} style={[st.seg, active && st.segActive, done && st.segDone]} />
          );
        })}
      </View>
    </View>
  );

  // ── City phase ─────────────────────────────────────────────────────────────
  if (phase === 'city') {
    return (
      <SafeAreaView style={st.root}>
        <StatusBar barStyle="dark-content" backgroundColor={C.bg} />
        {Header}
        {ProgressBar}

        <View style={st.body}>
          <View style={st.catChip}>
            <Text style={st.catIco}>📍</Text>
            <Text style={st.catLabel}>Konum</Text>
          </View>
          <Text style={st.eyebrow}>vibe quiz · konum seç</Text>
          <Text style={st.question}>Hangi şehirde ev arıyorsun?</Text>

          <View style={st.citySearchWrap}>
            <Text style={st.citySearchIcon}>🔍</Text>
            <TextInput
              style={st.citySearchInput}
              placeholder="Şehir ara..."
              placeholderTextColor={C.mute}
              value={citySearch}
              onChangeText={setCitySearch}
            />
            {citySearch.length > 0 && (
              <TouchableOpacity onPress={() => setCitySearch('')} activeOpacity={0.7}>
                <Text style={st.citySearchClear}>✕</Text>
              </TouchableOpacity>
            )}
          </View>

          <ScrollView style={st.cityScroll} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
            <View style={st.cityGrid}>
              {shownCities.map(city => {
                const sel = selectedCity === city;
                return (
                  <TouchableOpacity
                    key={city}
                    style={[st.cityChip, sel && st.cityChipSel]}
                    onPress={() => setSelectedCity(city)}
                    activeOpacity={0.7}
                  >
                    <Text style={[st.cityChipTxt, sel && st.cityChipTxtSel]}>{city}</Text>
                    {sel && <Text style={st.cityChipCheck}> ✓</Text>}
                  </TouchableOpacity>
                );
              })}
            </View>
          </ScrollView>
        </View>

        <View style={st.footer}>
          <TouchableOpacity
            style={[st.cta, !selectedCity && st.ctaOff]}
            onPress={confirmCity}
            disabled={!selectedCity}
            activeOpacity={0.85}
          >
            <Text style={[st.ctaTxt, !selectedCity && st.ctaTxtOff]}>
              {selectedCity ? `${selectedCity} · Devam Et` : 'Şehir Seçin'}
            </Text>
            <Text style={[st.ctaArrow, !selectedCity && st.ctaTxtOff]}>→</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  // ── Quiz phase ─────────────────────────────────────────────────────────────
  return (
    <SafeAreaView style={st.root}>
      <StatusBar barStyle="dark-content" backgroundColor={C.bg} />
      {Header}
      {ProgressBar}

      <Animated.View style={[st.body, { opacity: fade, transform: [{ translateY: slide }] }]}>
        <View style={st.catChip}>
          <Text style={st.catIco}>{cat.icon}</Text>
          <Text style={st.catLabel}>{cat.label}</Text>
        </View>

        <Text style={st.eyebrow}>vibe quiz · {idx + 1} / {questions.length}</Text>
        <Text style={st.question}>{q.question}</Text>

        {/* Submit hatası (son soruda) */}
        {submitErr && (
          <View style={st.errBox}>
            <Text style={st.errTxt}>⚠ {submitErr}</Text>
          </View>
        )}

        <View style={st.opts}>
          {q.opts.map((opt, i) => {
            const sel = picked === i;
            return (
              <TouchableOpacity
                key={i}
                style={[st.optCard, sel && st.optCardSel]}
                onPress={() => pick(i)}
                activeOpacity={0.72}
              >
                <View style={[st.radio, sel && st.radioSel]}>
                  {sel && <View style={st.radioDot} />}
                </View>
                <Text style={[st.optTxt, sel && st.optTxtSel]}>{opt}</Text>
                {sel && (
                  <View style={st.selBadge}>
                    <Text style={st.selBadgeTxt}>✓</Text>
                  </View>
                )}
              </TouchableOpacity>
            );
          })}
        </View>
      </Animated.View>

      <View style={st.footer}>
        <TouchableOpacity
          style={[st.cta, (picked === null || submitting) && st.ctaOff]}
          onPress={goNext}
          activeOpacity={0.85}
          disabled={picked === null || submitting}
        >
          {submitting ? (
            <ActivityIndicator color="#fff" size="small" />
          ) : (
            <>
              <Text style={[st.ctaTxt, picked === null && st.ctaTxtOff]}>
                {isLast ? 'Tamamla' : 'Devam Et'}
              </Text>
              <Text style={[st.ctaArrow, picked === null && st.ctaTxtOff]}>
                {isLast ? '✓' : '→'}
              </Text>
            </>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

// ── Styles ─────────────────────────────────────────────────────────────────────
const st = StyleSheet.create({
  root: { flex: 1, backgroundColor: C.bg },

  loadingWrap: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 14 },
  loadingTxt:  { color: C.mute, fontSize: 14 },

  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 18, paddingTop: 14, paddingBottom: 12,
  },
  backBtn:      { width: 38, height: 38, borderRadius: 999, backgroundColor: C.bgSoft, borderWidth: 1, borderColor: C.line, alignItems: 'center', justifyContent: 'center' },
  backIco:      { color: C.ink, fontSize: 17, lineHeight: 20 },
  counterRow:   { flexDirection: 'row', alignItems: 'baseline' },
  counterNum:   { color: C.ink, fontSize: 15, fontWeight: '700', letterSpacing: 0.5 },
  counterSep:   { color: C.mute, fontSize: 13 },
  counterTotal: { color: C.mute, fontSize: 13, fontWeight: '500' },

  fallbackBadge: { backgroundColor: '#FFF7E6', borderRadius: 999, paddingVertical: 4, paddingHorizontal: 10, borderWidth: 1, borderColor: '#F59E0B' },
  fallbackTxt:   { color: '#B45309', fontSize: 10, fontWeight: '700', letterSpacing: 0.6 },

  progressWrap: { paddingHorizontal: 18, marginBottom: 22, gap: 8 },
  barBg:  { height: 4, backgroundColor: C.bgSoft, borderRadius: 999, borderWidth: 1, borderColor: C.line, overflow: 'hidden' },
  barFill:{ height: '100%', backgroundColor: C.brandA, borderRadius: 999 },
  segRow: { flexDirection: 'row', gap: 5 },
  seg:       { flex: 1, height: 3, borderRadius: 999, backgroundColor: C.bgSoft, borderWidth: 1, borderColor: C.line },
  segActive: { backgroundColor: C.bgSoft, borderColor: C.brandA + '66' },
  segDone:   { backgroundColor: C.brandA, borderColor: 'transparent' },

  body: { flex: 1, paddingHorizontal: 18 },

  catChip:  { flexDirection: 'row', alignSelf: 'flex-start', alignItems: 'center', backgroundColor: C.bgSoft, borderRadius: 999, borderWidth: 1, borderColor: C.line, paddingVertical: 6, paddingHorizontal: 12, gap: 6, marginBottom: 14 },
  catIco:   { fontSize: 13 },
  catLabel: { color: C.brandA, fontSize: 12, fontWeight: '600', letterSpacing: 0.4 },

  eyebrow:  { color: C.mute, fontSize: 10, fontWeight: '500', letterSpacing: 1.4, textTransform: 'uppercase', marginBottom: 10 },
  question: { color: C.ink, fontSize: 25, fontWeight: '800', letterSpacing: -0.5, lineHeight: 34, marginBottom: 20 },

  errBox: { backgroundColor: 'rgba(239,68,68,0.08)', borderRadius: 12, borderWidth: 1, borderColor: 'rgba(239,68,68,0.2)', paddingVertical: 10, paddingHorizontal: 14, marginBottom: 12 },
  errTxt: { color: '#EF4444', fontSize: 12, fontWeight: '500', lineHeight: 18 },

  citySearchWrap:  { flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: C.bgSoft, borderRadius: 14, borderWidth: 1, borderColor: C.line, paddingVertical: 11, paddingHorizontal: 14, marginBottom: 14 },
  citySearchIcon:  { fontSize: 14 },
  citySearchInput: { flex: 1, color: C.ink, fontSize: 15, padding: 0 },
  citySearchClear: { color: C.mute, fontSize: 14, fontWeight: '700' },
  cityScroll:      { flex: 1 },
  cityGrid:        { flexDirection: 'row', flexWrap: 'wrap', gap: 8, paddingBottom: 12 },
  cityChip:        { flexDirection: 'row', alignItems: 'center', paddingVertical: 9, paddingHorizontal: 14, borderRadius: 999, borderWidth: 1.5, backgroundColor: C.bgSoft, borderColor: C.line },
  cityChipSel:     { backgroundColor: 'rgba(0,207,200,0.08)', borderColor: C.brandA },
  cityChipTxt:     { color: C.soft, fontSize: 14, fontWeight: '500' },
  cityChipTxtSel:  { color: C.ink, fontWeight: '700' },
  cityChipCheck:   { color: C.brandA, fontSize: 13, fontWeight: '800' },

  opts:       { gap: 9 },
  optCard:    { flexDirection: 'row', alignItems: 'center', backgroundColor: C.bgSoft, borderRadius: 18, borderWidth: 1, borderColor: C.line, paddingVertical: 15, paddingHorizontal: 15, gap: 13 },
  optCardSel: { borderColor: C.brandA, backgroundColor: 'rgba(0,207,200,0.06)' },
  radio:      { width: 20, height: 20, borderRadius: 999, borderWidth: 1.5, borderColor: C.mute, alignItems: 'center', justifyContent: 'center' },
  radioSel:   { borderColor: C.brandA },
  radioDot:   { width: 9, height: 9, borderRadius: 999, backgroundColor: C.brandA },
  optTxt:     { flex: 1, color: C.soft, fontSize: 14.5, fontWeight: '500', lineHeight: 20 },
  optTxtSel:  { color: C.ink, fontWeight: '600' },
  selBadge:   { width: 22, height: 22, borderRadius: 999, backgroundColor: C.brandA + '22', alignItems: 'center', justifyContent: 'center' },
  selBadgeTxt:{ color: C.brandA, fontSize: 11, fontWeight: '700' },

  footer:    { paddingHorizontal: 18, paddingBottom: 30, paddingTop: 12 },
  cta:       { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10, backgroundColor: C.brandA, borderRadius: 999, paddingVertical: 17, shadowColor: C.brandA, shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.4, shadowRadius: 20, elevation: 8 },
  ctaOff:    { backgroundColor: C.bgSoft, borderWidth: 1, borderColor: C.line, shadowOpacity: 0, elevation: 0 },
  ctaTxt:    { color: '#fff', fontSize: 16, fontWeight: '700', letterSpacing: 0.2 },
  ctaTxtOff: { color: C.mute },
  ctaArrow:  { color: '#fff', fontSize: 17, fontWeight: '700' },
});
