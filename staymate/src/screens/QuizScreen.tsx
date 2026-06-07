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
import { quizService, type NormalizedQuestion } from '../api/QuizService';
import { profileService } from '../api/ProfileService';
import { useTranslation } from '../i18n/translations';

type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'Quiz'>;
};
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
const CAT_ICONS = ['🌙', '🧹', '🤝', '💻', '🌿'];

function o(t: (k: string) => string, q: string, count: number): string[] {
  return Array.from({ length: count }, (_, i) => t(`quiz.${q}o${i}`));
}

function buildFallback(t: (k: string) => string): NormalizedQuestion[] {
  return [
    { id: 'f0',  catIndex: 0, question: t('quiz.q0'),  opts: o(t, 'q0',  3) },
    { id: 'f1',  catIndex: 0, question: t('quiz.q1'),  opts: o(t, 'q1',  2) },
    { id: 'f2',  catIndex: 1, question: t('quiz.q2'),  opts: o(t, 'q2',  5) },
    { id: 'f3',  catIndex: 1, question: t('quiz.q3'),  opts: o(t, 'q3',  4) },
    { id: 'f4',  catIndex: 2, question: t('quiz.q4'),  opts: o(t, 'q4',  3) },
    { id: 'f5',  catIndex: 2, question: t('quiz.q5'),  opts: o(t, 'q5',  3) },
    { id: 'f6',  catIndex: 3, question: t('quiz.q6'),  opts: o(t, 'q6',  3) },
    { id: 'f7',  catIndex: 3, question: t('quiz.q7'),  opts: o(t, 'q7',  3) },
    { id: 'f8',  catIndex: 4, question: t('quiz.q8'),  opts: o(t, 'q8',  3) },
    { id: 'f9',  catIndex: 4, question: t('quiz.q9'),  opts: o(t, 'q9',  3) },
    { id: 'f10', catIndex: 4, question: t('quiz.q10'), opts: o(t, 'q10', 4) },
    { id: 'f11', catIndex: 4, question: t('quiz.q11'), opts: o(t, 'q11', 4) },
    { id: 'f12', catIndex: 4, question: t('quiz.q12'), opts: o(t, 'q12', 3) },
    { id: 'f13', catIndex: 4, question: t('quiz.q13'), opts: o(t, 'q13', 3) },
    { id: 'f14', catIndex: 4, question: t('quiz.q14'), opts: o(t, 'q14', 3) },
  ];
}
export default function QuizScreen({ navigation }: Props) {
  const { t } = useTranslation();
  const setQuizAnswers   = useAppStore(s => s.setQuizAnswers);
  const setQuizCity      = useAppStore(s => s.setQuizCity);
  const savedCity        = useAppStore(s => s.quizCity);
  const setQuizCompleted = useAppStore(s => s.setQuizCompleted);
  const setProfile       = useAppStore(s => s.setProfile);

  const catLabels = [
    t('quiz.catSleep'), t('quiz.catClean'), t('quiz.catSocial'), t('quiz.catWork'), t('quiz.catLife'),
  ];
  const [questions,   setQuestions]   = useState<NormalizedQuestion[]>(() => buildFallback(t));
  const [questionsLoading, setQLoading] = useState(true);
  const [usingFallback, setUsingFallback] = useState(false);
  const [phase, setPhase]               = useState<'city' | 'quiz'>(savedCity ? 'quiz' : 'city');
  const [selectedCity, setSelectedCity] = useState<string | null>(savedCity);
  const [citySearch, setCitySearch]     = useState('');
  const [idx, setIdx]         = useState(0);
  const [answers, setAnswers] = useState<(number | null)[]>(Array(15).fill(null));
  const [picked, setPicked]   = useState<number | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitErr, setSubmitErr]   = useState<string | null>(null);

  const fade  = useRef(new Animated.Value(1)).current;
  const slide = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    let cancelled = false;

    quizService
      .getQuestions()
      .then(rawQuestions => {
        if (cancelled || !rawQuestions?.length) {
          if (!cancelled) setUsingFallback(true);
          return;
        }
        // Always use locale text — backend only confirms question count and IDs.
        // This ensures questions display in the active language regardless of
        // what language the backend stores them in.
        const localFb = buildFallback(t);
        const count = Math.min(rawQuestions.length, localFb.length);
        const normalized: NormalizedQuestion[] = localFb.slice(0, count).map((fb, i) => ({
          id:       String(rawQuestions[i]?.id ?? i),
          catIndex: fb.catIndex,
          question: fb.question,
          opts:     fb.opts,
        }));

        if (!cancelled) {
          setQuestions(normalized);
          setAnswers(Array(normalized.length).fill(null));
          setUsingFallback(false);
        }
      })
      .catch(() => {
        if (!cancelled) setUsingFallback(true);
      })
      .finally(() => { if (!cancelled) setQLoading(false); });

    return () => { cancelled = true; };
  }, []);
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
  const goNext = async () => {
    if (picked === null) return;
    const finalAnswers = [...answers];
    finalAnswers[idx] = picked;

    if (!isLast) {
      transition(1, () => { setIdx(i => i + 1); setPicked(answers[idx + 1]); });
      return;
    }
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
    setQuizAnswers(validAnswers);
    setSubmitErr(null);
    setSubmitting(true);

    try {
      await quizService.submitOnboarding({
        answers: validAnswers,
        city:    selectedCity,
      });

      // Store'a quiz tamamlandı olarak kaydet
      setQuizCompleted(true);

      // Profili yeniden yükle (traits backend'den gelecek)
      try {
        const updatedProfile = await profileService.getProfile();
        setProfile(updatedProfile);
      } catch {
        // Profil alınamazsa devam et
      }

      navigation.replace('MainTabs');
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
  const Header = (
    <View style={st.header}>
      <TouchableOpacity style={st.backBtn} onPress={goBack} activeOpacity={0.7}>
        <Text style={st.backIco}>←</Text>
      </TouchableOpacity>
      <View style={st.counterRow}>
        <Text style={st.counterNum}>{phase === 'city' ? 1 : idx + 2}</Text>
        <Text style={st.counterSep}> / </Text>
        <Text style={st.counterTotal}>{questions.length + 1}</Text>
      </View>
      {/* Fallback badge */}
      {usingFallback
        ? <View style={st.fallbackBadge}><Text style={st.fallbackTxt}>offline</Text></View>
        : <View style={st.backBtn} />
      }
    </View>
  );

  if (phase === 'city') {
    return (
      <SafeAreaView style={st.root}>
        <StatusBar barStyle="dark-content" backgroundColor={C.bg} />
        {Header}

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
  return (
    <SafeAreaView style={st.root}>
      <StatusBar barStyle="dark-content" backgroundColor={C.bg} />
      {Header}

      <Animated.View style={[st.body, { opacity: fade, transform: [{ translateY: slide }] }]}>
        <View style={st.catChip}>
          <Text style={st.catIco}>{cat.icon}</Text>
          <Text style={st.catLabel}>{cat.label}</Text>
        </View>

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

