import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../App';
import { useTranslation } from '../i18n/useTranslation';

type Props = { navigation: NativeStackNavigationProp<RootStackParamList, 'PrivacyPolicy'> };

const C = {
  bg: '#FFFFFF', ink: '#1F2937', soft: '#4B5563',
  mute: '#9CA3AF', line: 'rgba(31,41,55,0.08)',
  brandA: '#00CFC8', tealBg: '#E6FBFA', tealTx: '#00A8A2',
};

function Section({ title, children }: { title: string; children: string }) {
  return (
    <View style={st.section}>
      <Text style={st.sectionTitle}>{title}</Text>
      <Text style={st.sectionBody}>{children}</Text>
    </View>
  );
}

export default function PrivacyPolicyScreen({ navigation }: Props) {
  const { t } = useTranslation();

  return (
    <SafeAreaView style={st.root} edges={['top', 'bottom']}>
      <StatusBar barStyle="dark-content" backgroundColor={C.bg} />

      {/* Header */}
      <View style={st.header}>
        <TouchableOpacity style={st.backBtn} onPress={() => navigation.goBack()} activeOpacity={0.7}>
          <Text style={st.backTxt}>←</Text>
        </TouchableOpacity>
        <Text style={st.hTitle}>{t('auth.privacyPolicy')}</Text>
        <View style={st.backBtn} />
      </View>

      <ScrollView contentContainerStyle={st.content} showsVerticalScrollIndicator={false}>
        <Text style={st.lastUpdated}>Son güncelleme: {new Date().toLocaleDateString('tr-TR')}</Text>

        <Section title="1. Veri Sorumlusu">
          {`Staymate, ul. [ADRES], Poznań, Polska\nİletişim: privacy@staymate.app`}
        </Section>

        <Section title="2. Toplanan Veriler">
          {`• Ad ve Soyad\n• E-posta adresi\n• Telefon numarası (isteğe bağlı)\n• Profil fotoğrafları\n• Kişilik anketi yanıtları\n• Sohbet geçmişi ve eşleşmeler\n• Konum (izin verilirse)`}
        </Section>

        <Section title="3. İşleme Amacı">
          {`• Ev arkadaşı eşleştirme hizmetinin sunulması\n• Kullanıcılar arası iletişim\n• Platform güvenliğinin iyileştirilmesi\n• Yasal gerekliliklere uyum`}
        </Section>

        <Section title="4. Hukuki Dayanak">
          {`Veri işleme şu temellere dayanmaktadır:\n• Rızanız (GDPR Md. 6/1/a)\n• Sözleşmenin ifası (Md. 6/1/b)\n• Yasal yükümlülükler (Md. 6/1/c)\n• Meşru menfaatler (Md. 6/1/f)`}
        </Section>

        <Section title="5. Haklarınız">
          {`• Verilere erişim hakkı (GDPR Md. 15)\n• Düzeltme hakkı (Md. 16)\n• Silme hakkı (Md. 17)\n• İşlemeyi kısıtlama hakkı (Md. 18)\n• Veri taşınabilirliği hakkı (Md. 20)\n• Rızanızı geri çekme hakkı (Md. 7/3)\n\nTalepleriniz için: privacy@staymate.app`}
        </Section>

        <Section title="6. Veri Güvenliği">
          {`Mesajlar için uçtan uca şifreleme (E2E) kullanıyoruz.\nTüm veriler güvenli veri merkezlerinde saklanmaktadır.`}
        </Section>

        <Section title="7. Politika Değişiklikleri">
          {`Değişiklik hakkımızı saklı tutarız.\nGüncelleme durumunda e-posta ile bildirilirsiniz.`}
        </Section>

        <Text style={st.footer}>Sorularınız için: privacy@staymate.app</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const st = StyleSheet.create({
  root:    { flex: 1, backgroundColor: C.bg },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 18, paddingTop: 14, paddingBottom: 12,
    borderBottomWidth: 1, borderBottomColor: C.line,
  },
  backBtn:  { width: 38, height: 38, borderRadius: 999, backgroundColor: '#FAFAFA', borderWidth: 1, borderColor: C.line, alignItems: 'center', justifyContent: 'center' },
  backTxt:  { color: C.ink, fontSize: 17 },
  hTitle:   { color: C.ink, fontSize: 17, fontWeight: '800', letterSpacing: -0.2 },
  content:  { padding: 20, paddingBottom: 40 },
  lastUpdated: { color: C.mute, fontSize: 12, marginBottom: 20 },
  section:      { marginBottom: 22 },
  sectionTitle: { color: C.ink, fontSize: 14, fontWeight: '700', marginBottom: 8 },
  sectionBody:  { color: C.soft, fontSize: 13, lineHeight: 22 },
  footer:       { color: C.mute, fontSize: 12, marginTop: 24, textAlign: 'center' },
});
