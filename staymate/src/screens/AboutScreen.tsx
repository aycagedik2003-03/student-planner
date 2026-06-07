import React from 'react';
import { View, Text, Image, ScrollView, Pressable, Linking, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../App';
import { useTranslation } from '../i18n/translations';

type Props = { navigation: NativeStackNavigationProp<RootStackParamList> };

const content = {
  pl: {
    subtitle: 'Pierwsza polska platforma do dopasowywania współlokatorów oparta na sztucznej inteligencji',
    sections: [
      {
        title: 'O Roomski',
        text:  'Znalezienie odpowiedniego współlokatora może być równie ważne co znalezienie odpowiedniego mieszkania.\n\nRoomski wykorzystuje inteligentną technologię dopasowywania do połączenia osób o zgodnych preferencjach mieszkaniowych, zmniejszając konflikty i tworząc lepsze doświadczenia wspólnego zamieszkania.',
      },
      {
        title: 'Jak To Działa?',
        text:  '1. Utwórz Profil — Opowiedz nam o sobie i swoich preferencjach.\n2. Wypełnij Quiz — Krótka anketa kompatybilności.\n3. Otrzymaj Dopasowania — AI sugeruje najlepszych współlokatorów.\n4. Połącz się i Czatuj — Bezpieczna komunikacja na platformie.\n5. Znajdź Swój Dom — Zacznij nowy rozdział z pewnością.',
      },
      {
        title: 'Dlaczego Roomski?',
        text:  '✓ Dopasowywanie oparte na AI\n✓ Zaprojektowane dla studentów i młodych profesjonalistów\n✓ Bezpieczna i prywatna komunikacja\n✓ Spersonalizowane rekomendacje\n✓ Całkowicie bezpłatne użytkowanie',
      },
      {
        title: 'Kontakt',
        text:  'roomski.app@gmail.com\n\nBudowanie lepszych doświadczeń wspólnego zamieszkania w całej Polsce.',
      },
    ],
    contactLabel: 'Skontaktuj się z naszym zespołem',
  },
  tr: {
    subtitle: "Polonya'nın İlk Yapay Zeka Tabanlı Oda Arkadaşı Eşleştirme Platformu",
    sections: [
      {
        title: 'Roomski Hakkında',
        text:  'Doğru oda arkadaşı bulmak, doğru daireyi bulmak kadar önemlidir.\n\nRoomski, yaşam tercihlerine uyumlu kişileri bağlayan akıllı eşleştirme teknolojisini kullanarak anlaşmazlıkları azaltır ve daha iyi paylaşımlı yaşam deneyimleri yaratır.',
      },
      {
        title: 'Nasıl Çalışır?',
        text:  '1. Profil Oluştur — Kendin ve yaşam tarzın hakkında anlat.\n2. Uyumluluk Testini Tamamla — Kısa bir anket.\n3. Akıllı Eşleşmeler Al — AI en uygun oda arkadaşlarını önerir.\n4. Bağlan ve Sohbet Et — Platform içinde güvenli iletişim.\n5. Yeni Evini Bul — Doğru kişiyle yeni bölümüne başla.',
      },
      {
        title: 'Neden Roomski?',
        text:  '✓ Yapay zeka ile uyumluluk eşleştirmesi\n✓ Öğrenciler ve genç profesyoneller için tasarlandı\n✓ Güvenli ve özel iletişim\n✓ Kişiselleştirilmiş öneriler\n✓ Tamamen ücretsiz',
      },
      {
        title: 'İletişim',
        text:  'roomski.app@gmail.com\n\nPolonye genelinde daha iyi oda arkadaşı deneyimleri yaratıyoruz.',
      },
    ],
    contactLabel: 'Ekibimizle iletişime geçin',
  },
  en: {
    subtitle: "Poland's First AI-Powered Roommate Matching Platform",
    sections: [
      {
        title: 'About Roomski',
        text:  'Finding the right roommate can be as important as finding the right apartment.\n\nRoomski uses intelligent matching technology to connect people with compatible living preferences, reducing conflicts and creating better shared living experiences.',
      },
      {
        title: 'How It Works',
        text:  '1. Create Your Profile — Tell us about yourself and your preferences.\n2. Complete the Quiz — A short compatibility assessment.\n3. Receive Smart Matches — AI suggests the most suitable roommates.\n4. Connect & Chat — Secure communication within the platform.\n5. Find Your Home — Begin your next chapter with confidence.',
      },
      {
        title: 'Why Roomski?',
        text:  '✓ AI-powered compatibility matching\n✓ Designed for students and young professionals\n✓ Secure and private communication\n✓ Personalized recommendations\n✓ Completely free to use',
      },
      {
        title: 'Contact',
        text:  'roomski.app@gmail.com\n\nBuilding better roommate experiences across Poland.',
      },
    ],
    contactLabel: 'Get in touch with our team',
  },
} as const;

type Lang = keyof typeof content;

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
          <Text style={{ fontSize: 32, fontWeight: '800', color: '#1F2937', marginBottom: 4 }}>
            Roomski
          </Text>
          <Text style={{ fontSize: 12, color: '#9CA3AF', marginBottom: 16, letterSpacing: 0.5 }}>
            v2026.1.0
          </Text>
          <Text style={{ fontSize: 15, color: '#00BCD4', fontWeight: '600', textAlign: 'center', marginBottom: 32, lineHeight: 22 }}>
            {current.subtitle}
          </Text>

          {current.sections.map((section, idx) => (
            <View key={idx} style={{ width: '100%', marginBottom: 24 }}>
              <Text style={{ fontSize: 16, fontWeight: '800', color: '#1F2937', marginBottom: 10 }}>
                {section.title}
              </Text>
              <Text style={{ fontSize: 14, color: '#4B5563', lineHeight: 24 }}>
                {section.text}
              </Text>
            </View>
          ))}

          <Pressable
            onPress={() => Linking.openURL('mailto:roomski.app@gmail.com')}
            style={{ marginTop: 8, padding: 15, backgroundColor: '#00BCD4', borderRadius: 999, width: '100%', alignItems: 'center' }}
          >
            <Text style={{ color: '#fff', textAlign: 'center', fontWeight: '700', fontSize: 15 }}>
              {current.contactLabel}
            </Text>
          </Pressable>

          <Text style={{ fontSize: 12, color: '#D1D5DB', marginTop: 32, marginBottom: 8, textAlign: 'center' }}>
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

