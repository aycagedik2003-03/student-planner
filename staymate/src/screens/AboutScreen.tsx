import React from 'react';
import { View, Text, Image, ScrollView, Pressable, Linking, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../App';
import { useTranslation } from '../i18n/useTranslation';

type Props = { navigation: NativeStackNavigationProp<RootStackParamList> };

const content = {
  pl: {
    title:    'Roomski',
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
      { title: 'Kontakt', text: 'roomski.app@gmail.com' },
    ],
  },
  tr: {
    title:    'Roomski',
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
        text:  '✓ Polonyalı öğrenciler için AI\n✓ Hızlı sonuç\n✓ Güvenli iletişim\n✓ Gizlilik koruması\n✓ Tamamen ücretsiz',
      },
      { title: 'İletişim', text: 'roomski.app@gmail.com' },
    ],
  },
  en: {
    title:    'Roomski',
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
        text:  '✓ AI built for Polish students\n✓ Fast matching\n✓ Secure messaging\n✓ Privacy protected\n✓ Completely free',
      },
      { title: 'Contact', text: 'roomski.app@gmail.com' },
    ],
  },
} as const;

type Lang = keyof typeof content;

const CONTACT_LABEL: Record<Lang, string> = {
  pl: 'Skontaktuj się z nami',
  tr: 'Bize Ulaş',
  en: 'Contact Us',
};

export default function AboutScreen({ navigation }: Props) {
  const { language } = useTranslation();
  const lang: Lang = (language in content ? language : 'en') as Lang;
  const current = content[lang];

  return (
    <SafeAreaView style={st.root}>
      <View style={st.header}>
        <Pressable style={st.backBtn} onPress={() => navigation.goBack()}>
          <Text style={st.backTxt}>←</Text>
        </Pressable>
        <Text style={st.headerTitle}>Roomski</Text>
        <View style={{ width: 38 }} />
      </View>

      <ScrollView style={{ flex: 1, backgroundColor: '#fff' }}>
        <View style={{ padding: 24, alignItems: 'center' }}>
          <Image
            source={require('../../assets/roomski-logo.png')}
            style={{ width: 80, height: 80, marginBottom: 8 }}
            resizeMode="contain"
          />
          <Text style={{ fontSize: 32, fontWeight: 'bold', color: '#000', marginBottom: 4 }}>
            {current.title}
          </Text>
          <Text style={{ fontSize: 12, color: '#888', marginBottom: 16 }}>
            {current.version}
          </Text>
          <Text style={{ fontSize: 16, color: '#00BCD4', fontWeight: '600', textAlign: 'center', marginBottom: 32 }}>
            {current.subtitle}
          </Text>

          {current.sections.map((section, idx) => (
            <View key={idx} style={{ width: '100%', marginBottom: 24 }}>
              <Text style={{ fontSize: 18, fontWeight: 'bold', color: '#000', marginBottom: 8 }}>
                {section.title}
              </Text>
              <Text style={{ fontSize: 14, color: '#666', lineHeight: 22 }}>
                {section.text}
              </Text>
            </View>
          ))}

          <Pressable
            onPress={() => Linking.openURL('mailto:roomski.app@gmail.com')}
            style={{ marginTop: 32, padding: 12, backgroundColor: '#00BCD4', borderRadius: 8, width: '100%' }}
          >
            <Text style={{ color: '#fff', textAlign: 'center', fontWeight: '600' }}>
              {CONTACT_LABEL[lang]}
            </Text>
          </Pressable>

          <Text style={{ fontSize: 12, color: '#ccc', marginTop: 32, textAlign: 'center' }}>
            © 2026 Roomski. All rights reserved.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const st = StyleSheet.create({
  root:        { flex: 1, backgroundColor: '#fff' },
  header:      { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: '#E5E7EB' },
  backBtn:     { width: 38, height: 38, borderRadius: 19, backgroundColor: '#F3F4F6', alignItems: 'center', justifyContent: 'center' },
  backTxt:     { fontSize: 18, color: '#1F2937' },
  headerTitle: { fontSize: 18, fontWeight: '800', color: '#1F2937' },
});
