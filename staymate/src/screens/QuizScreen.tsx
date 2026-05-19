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
  Alert,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../App';
import { useAppStore } from '../store';
import { POLISH_CITIES } from '../constants/cities';
import { quizService, normalizeQuestion, type NormalizedQuestion } from '../api/QuizService';
import { useTranslation } from '../i18n/useTranslation';

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

// ── Kategori ikonları (label'lar artık t() ile geliyor) ───────────────────────
const CAT_ICONS = ['🌙', '🧹', '🤝', '💻', '🌿'];

// ── Kategori segmentlerini hesapla (label artık dışarıdan veriliyor) ──────────
// Fallback sorular locale'e göre dinamik üretilir — buildFallback() ile

// ── Fallback sorular — locale'e göre dinamik ──────────────────────────────────
function buildFallback(t: (k: string) => string): NormalizedQuestion[] {
  return [
    { id: 'f0',  catIndex: 0, question: t('quiz.q0'),  opts: [t('quiz.q0o0'), t('quiz.q0o1'), t('quiz.q0o2'), t('quiz.q0o3')] },
    { id: 'f1',  catIndex: 0, question: t('quiz.q1'),  opts: [t('quiz.q1o0'), t('quiz.q1o1'), t('quiz.q1o2'), t('quiz.q1o3')] },
    { id: 'f2',  catIndex: 0, question: t('quiz.q2'),  opts: [t('quiz.q2o0'), t('quiz.q2o1'), t('quiz.q2o2'), t('quiz.q2o3')] },
    { id: 'f3',  catIndex: 1, question: t('quiz.q3'),  opts: [t('quiz.q3o0'), t('quiz.q3o1'), t('quiz.q3o2'), t('quiz.q3o3')] },
    { id: 'f4',  catIndex: 1, question: t('quiz.q4'),  opts: [t('quiz.q4o0'), t('quiz.q4o1'), t('quiz.q4o2'), t('quiz.q4o3')] },
    { id: 'f5',  catIndex: 1, question: t('quiz.q5'),  opts: [t('quiz.q5o0'), t('quiz.q5o1'), t('quiz.q5o2'), t('quiz.q5o3')] },
    { id: 'f6',  catIndex: 2, question: t('quiz.q6'),  opts: [t('quiz.q6o0'), t('quiz.q6o1'), t('quiz.q6o2'), t('quiz.q6o3')] },
    { id: 'f7',  catIndex: 2, question: t('quiz.q7'),  opts: [t('quiz.q7o0'), t('quiz.q7o1'), t('quiz.q7o2'), t('quiz.q7o3')] },
    { id: 'f8',  catIndex: 2, question: t('quiz.q8'),  opts: [t('quiz.q8o0'), t('quiz.q8o1'), t('quiz.q8o2'), t('quiz.q8o3')] },
    { id: 'f9',  catIndex: 3, question: t('quiz.q9'),  opts: [t('quiz.q9o0'), t('quiz.q9o1'), t('quiz.q9o2'), t('quiz.q9o3')] },
    { id: 'f10', catIndex: 3, question: t('quiz.q10'), opts: [t('quiz.q10o0'), t('quiz.q10o1'), t('quiz.q10o2'), t('quiz.q10o3')] },
    { id: 'f11', catIndex: 3, question: t('quiz.q11'), opts: [t('quiz.q11o0'), t('quiz.q11o1'), t('quiz.q11o2'), t('quiz.q11o3')] },
    { id: 'f12', catIndex: 4, question: t('quiz.q12'), opts: [t('quiz.q12o0'), t('quiz.q12o1'), t('quiz.q12o2'), t('quiz.q12o3')] },
    { id: 'f13', catIndex: 4, question: t('quiz.q13'), opts: [t('quiz.q13o0'), t('quiz.q13o1'), t('quiz.q13o2'), t('quiz.q13o3')] },
    { id: 'f14', catIndex: 4, question: t('quiz.q14'), opts: [t('quiz.q14o0'), t('quiz.q14o1'), t('quiz.q14o2'), t('quiz.q14o3')] },
    { id: 'f15', catIndex: 4, question: t('quiz.q15'), opts: [t('quiz.q15o0'), t('quiz.q15o1'), t('quiz.q15o2'), t('quiz.q15o3')] },
  ];
}

// ── Kategori segmentlerini hesapla ────────────────────────────────────────────
function buildSegments(questions: NormalizedQuestion[], catLabels: string[]) {
  const segs: { label: string; icon: string; from: number; to: number }[] = [];
  questions.forEach((q, i) => {
    const label = catLabels[q.catIndex] ?? `Cat ${q.catIndex + 1}`;
    const icon  = CAT_ICONS[q.catIndex] ?? '❓';
    const last  = segs[segs.length - 1];
    if (last && last.label === label) {
      last.to = i;
    } else {
      segs.push({ label, icon, from: i, to: i });
    }
  });
  return segs;
}

// ── Ana bileşen ────────────────────────────────────────────────────────────────
export default function QuizScreen({ navigation }: Props) {
  const { t } = useTranslation();
  const setQuizAnswers = useAppStore(s => s.setQuizAnswers);
  const setQuizCity    = useAppStore(s => s.setQuizCity);
  const savedCity      = useAppStore(s => s.quizCity);

  const catLabels = [
    t('quiz.catSleep'), t('quiz.catClean'), t('quiz.catSocial'), t('quiz.catWork'), t('quiz.catLife'),
  ];

  // ── Soru yükleme state'i ───────────────────────────────────────────────────
  const [questions,   setQuestions]   = useState<NormalizedQuestion[]>(() => buildFallback(t));
  const [questionsLoading, setQLoading] = useState(true);
  const [usingFallback, setUsingFallback] = useState(false);

  // ── City pre-step state ────────────────────────────────────────────────────
  const [phase, setPhase]               = useState<'city' | 'quiz'>(savedCity ? 'quiz' : 'city');
  const [selectedCity, setSelectedCity] = useState<string | null>(savedCity);
  const [citySearch, setCitySearch]     = useState('');

  // ── Quiz state ─────────────────────────────────────────────────────────────
  const [idx, setIdx]         = useState(0);
  const [answers, setAnswers] = useState<(number | null)[]>(Array(16).fill(null));
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

        // Her backend sorusunu normalize et; eksik alanlar için locale fallback kullan
        const localFb = buildFallback(t);
        const normalized = rawQuestions.map((raw, i) => {
          const fb = localFb[i] ?? localFb[0];
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

  const segments = buildSegments(questions, catLabels);
  const shownCities = POLISH_CITIES.filter(c =>
    c.toLowerCase().includes(citySearch.toLowerCase()),
  );

  const confirmCity = () => {
    if (!selectedCity) return;
    setQuizCity(selectedCity);
    setPhase('quiz');
  };

  const q      = questions[idx];
  const cat    = q
    ? { label: catLabels[q.catIndex] ?? 'Genel', icon: CAT_ICONS[q.catIndex] ?? '❓' }
    : { label: catLabels[0], icon: CAT_ICONS[0] };
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

    // ── Validation ─────────────────────────────────────────────────────────────
    const incompleteIdx = finalAnswers.findIndex(ans => ans === null || ans === undefined);
    if (incompleteIdx !== -1) {
      Alert.alert(
        t('quiz.notCompleted'),
        t('quiz.progress').replace('{0}', String(incompleteIdx + 1)).replace('{1}', String(questions.length)),
      );
      setIdx(incompleteIdx);
      setPicked(finalAnswers[incompleteIdx] as number | null);
      return;
    }

    if (finalAnswers.length < 8) {
      Alert.alert(t('quiz.notCompleted'), t('quiz.notCompletedDesc'));
      return;
    }

    const validAnswers = finalAnswers.map(ans => parseInt(String(ans), 10));
    if (validAnswers.some(a => isNaN(a))) {
      Alert.alert(t('common.error'), t('quiz.submitError'));
      return;
    }

    // ── Submit ─────────────────────────────────────────────────────────────────
    setQuizAnswers(validAnswers);
    setSubmitErr(null);
    setSubmitting(true);

    try {
      console.log('Submitting quiz answers:', validAnswers);
      await quizService.submitAnswers(validAnswers);
      console.log('Quiz submitted successfully');
      navigation.replace('Profile');
    } catch (err: any) {
      console.error('Quiz submit error:', err.response?.data);
      const errorMsg =
        err?.response?.data?.detail  ||
        err?.response?.data?.message ||
        err?.response?.data?.error   ||
        t('quiz.submitError');
      const msg = Array.isArray(errorMsg) ? errorMsg[0] : String(errorMsg);
      setSubmitErr(msg);
      Alert.alert(t('common.error'), msg);
    } finally {
      setSubmitting(false);
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
          <Text style={st.loadingTxt}>{t('common.loading')}</Text>
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
            <Text style={st.catLabel}>{t('quiz.categories.location')}</Text>
          </View>
          <Text style={st.eyebrow}>vibe quiz · {t('quiz.selectCity').toLowerCase()}</Text>
          <Text style={st.question}>{t('quiz.cityQuestion')}</Text>

          <View style={st.citySearchWrap}>
            <Text style={st.citySearchIcon}>🔍</Text>
            <TextInput
              style={st.citySearchInput}
              placeholder={t('quiz.citySearch')}
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
              {selectedCity ? `${selectedCity} · ${t('quiz.continue').replace(' →', '')}` : t('quiz.selectCityButton')}
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
                {isLast ? t('quiz.complete').replace(' ✓', '') : t('quiz.continue').replace(' →', '')}
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
