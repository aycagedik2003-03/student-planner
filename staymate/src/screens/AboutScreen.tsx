import React from 'react';
import { View, Text, ScrollView, Pressable, StyleSheet, Linking } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../App';
import { useTranslation } from '../i18n/useTranslation';

type Props = { navigation: NativeStackNavigationProp<RootStackParamList> };

type Lang = 'tr' | 'pl' | 'en';

const content: Record<Lang, {
  title: string; version: string; subtitle: string;
  sections: { title: string; text: string }[];
}> = {
  pl: {
    title:    '🏘️ Roomski',
    version:  'v2026.1.0',
    subtitle: "Poland's First AI Roommate Matching Platform",
    sections: [
      {
        title: 'O Nas',
        text:  'Roomski zmienia sposób, w jaki studenci znajdują wspólników. Zamiast losowych meczy na Facebooku, używamy AI, aby znaleźć idealną osobę dla Ciebie.',
      },
      {
        title: 'Jak to działa?',
        text:  '1. Stwórz profil\n2. Odpowiedz na Quiz o osobowości\n3. Otrzymaj inteligentne rekomendacje\n4. Czatuj i poznaj\n5. Znajdź swój dom',
      },
      {
        title: 'Dlaczego Roomski?',
        text:  '✓ Algorytm AI opracowany dla polskich studentów\n✓ Szybkie dopasowanie\n✓ Bezpieczna komunikacja\n✓ Ochrona prywatności\n✓ Darmowe użytkowanie',
      },
      { title: 'Kontakt', text: 'support@roomski.app' },
    ],
  },
  tr: {
    title:    '🏘️ Roomski',
    version:  'v2026.1.0',
    subtitle: "Polonya'nın İlk AI Oda Arkadaşı Platformu",
    sections: [
      {
        title: 'Hakkımızda',
        text:  'Roomski, öğrencilerin oda arkadaşı bulma şeklini değiştiriyor. Rasgele Facebook aramaları yerine, AI ile mükemmel kişiyi bulursun.',
      },
      {
        title: 'Nasıl Çalışır?',
        text:  '1. Profil oluştur\n2. Kişilik Quizi cevapla\n3. Akıllı eşleşmeleri gör\n4. Sohbet et ve tanı\n5. Evin bulunmuş',
      },
      {
        title: 'Neden Roomski?',
        text:  "✓ Polonyalı öğrenciler için AI\n✓ Hızlı sonuç\n✓ Güvenli iletişim\n✓ Gizlilik koruması\n✓ Tamamen ücretsiz",
      },
      { title: 'İletişim', text: 'support@roomski.app' },
    ],
  },
  en: {
    title:    '🏘️ Roomski',
    version:  'v2026.1.0',
    subtitle: "Poland's First AI Roommate Matching Platform",
    sections: [
      {
        title: 'About Us',
        text:  'Roomski changes how Polish students find roommates. Instead of random Facebook searches, we use AI to match you with your perfect fit.',
      },
      {
        title: 'How It Works',
        text:  '1. Create your profile\n2. Answer personality quiz\n3. Get smart matches\n4. Chat and connect\n5. Find your home',
      },
      {
        title: 'Why Roomski?',
        text:  "✓ AI built for Polish students\n✓ Fast matching\n✓ Secure messaging\n✓ Privacy protected\n✓ Completely free",
      },
      { title: 'Contact', text: 'support@roomski.app' },
    ],
  },
};

const CONTACT_LABEL: Record<Lang, string> = {
  pl: 'Skontaktuj się z nami',
  tr: 'Bize Ulaş',
  en: 'Contact Us',
};

export default function AboutScreen({ navigation }: Props) {
  const { language } = useTranslation();
  const lang = (language as Lang) in content ? (language as Lang) : 'en';
  const c = content[lang];

  return (
    <SafeAreaView style={st.root}>
      <View style={st.header}>
        <Pressable style={st.backBtn} onPress={() => navigation.goBack()}>
          <Text style={st.backTxt}>←</Text>
        </Pressable>
        <Text style={st.headerTitle}>Roomski</Text>
        <View style={{ width: 38 }} />
      </View>

      <ScrollView contentContainerStyle={st.body} showsVerticalScrollIndicator={false}>
        <View style={st.hero}>
          <Text style={st.heroIcon}>🏘️</Text>
          <Text style={st.heroTitle}>{c.title}</Text>
          <Text style={st.heroVersion}>{c.version}</Text>
          <Text style={st.heroSubtitle}>{c.subtitle}</Text>
        </View>

        {c.sections.map((section, idx) => (
          <View key={idx} style={st.section}>
            <Text style={st.sectionTitle}>{section.title}</Text>
            <Text style={st.sectionText}>{section.text}</Text>
          </View>
        ))}

        <Pressable
          style={st.contactBtn}
          onPress={() => Linking.openURL('mailto:support@roomski.app')}
        >
          <Text style={st.contactBtnTxt}>{CONTACT_LABEL[lang]}</Text>
        </Pressable>

        <Text style={st.copyright}>© 2026 Roomski. All rights reserved.</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const st = StyleSheet.create({
  root:       { flex: 1, backgroundColor: '#fff' },
  header:     { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: '#E5E7EB' },
  backBtn:    { width: 38, height: 38, borderRadius: 19, backgroundColor: '#F3F4F6', alignItems: 'center', justifyContent: 'center' },
  backTxt:    { fontSize: 18, color: '#1F2937' },
  headerTitle:{ fontSize: 18, fontWeight: '800', color: '#1F2937' },
  body:       { padding: 24, paddingBottom: 48 },
  hero:       { alignItems: 'center', marginBottom: 36 },
  heroIcon:   { fontSize: 52, marginBottom: 10 },
  heroTitle:  { fontSize: 32, fontWeight: 'bold', color: '#000', marginBottom: 4 },
  heroVersion:{ fontSize: 12, color: '#9CA3AF', marginBottom: 12 },
  heroSubtitle:{ fontSize: 16, color: '#1D9E75', fontWeight: '600', textAlign: 'center' },
  section:    { marginBottom: 24, backgroundColor: '#F9FAFB', borderRadius: 14, padding: 16, borderWidth: 1, borderColor: '#E5E7EB' },
  sectionTitle:{ fontSize: 16, fontWeight: '800', color: '#1F2937', marginBottom: 10 },
  sectionText: { fontSize: 14, color: '#4B5563', lineHeight: 22 },
  contactBtn:  { backgroundColor: '#1D9E75', borderRadius: 12, paddingVertical: 15, alignItems: 'center', marginTop: 8, marginBottom: 32 },
  contactBtnTxt:{ color: '#fff', fontSize: 16, fontWeight: '700' },
  copyright:   { fontSize: 12, color: '#D1D5DB', textAlign: 'center' },
});
