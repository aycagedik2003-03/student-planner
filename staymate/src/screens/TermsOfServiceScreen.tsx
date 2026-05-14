import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../App';
import { useTranslation } from '../i18n/useTranslation';

type Props = { navigation: NativeStackNavigationProp<RootStackParamList, 'TermsOfService'> };

const C = {
  bg: '#FFFFFF', ink: '#1F2937', soft: '#4B5563',
  mute: '#9CA3AF', line: 'rgba(31,41,55,0.08)',
};

function Section({ title, children }: { title: string; children: string }) {
  return (
    <View style={st.section}>
      <Text style={st.sectionTitle}>{title}</Text>
      <Text style={st.sectionBody}>{children}</Text>
    </View>
  );
}

export default function TermsOfServiceScreen({ navigation }: Props) {
  const { t } = useTranslation();

  return (
    <SafeAreaView style={st.root} edges={['top', 'bottom']}>
      <StatusBar barStyle="dark-content" backgroundColor={C.bg} />

      {/* Header */}
      <View style={st.header}>
        <TouchableOpacity style={st.backBtn} onPress={() => navigation.goBack()} activeOpacity={0.7}>
          <Text style={st.backTxt}>←</Text>
        </TouchableOpacity>
        <Text style={st.hTitle}>{t('auth.termsOfService')}</Text>
        <View style={st.backBtn} />
      </View>

      <ScrollView contentContainerStyle={st.content} showsVerticalScrollIndicator={false}>
        <Text style={st.lastUpdated}>Son güncelleme: {new Date().toLocaleDateString('tr-TR')}</Text>

        <Section title="1. Hizmetin Kapsamı">
          {`Staymate, üniversite öğrencilerine ve genç profesyonellere ev arkadaşı bulma platformu sunar. Platform; profil oluşturma, eşleştirme ve mesajlaşma işlevlerini içerir.`}
        </Section>

        <Section title="2. Kullanım Koşulları">
          {`• Platformu yalnızca yasal amaçlarla kullanabilirsiniz.\n• Gerçek ve güncel bilgi sağlamakla yükümlüsünüz.\n• Hesabınızı başkasına devredemezsiniz.\n• Taciz, nefret söylemi veya spam içerik yasaktır.`}
        </Section>

        <Section title="3. Hesap Güvenliği">
          {`Hesabınızın güvenliğinden siz sorumlusunuz. Şüpheli aktivite fark ederseniz hemen bildirin: support@staymate.app`}
        </Section>

        <Section title="4. Fikri Mülkiyet">
          {`Platform içeriği, logoları ve tasarımı Staymate'e aittir. İzinsiz kullanım yasaktır.`}
        </Section>

        <Section title="5. Sorumluluğun Sınırlandırılması">
          {`Staymate, kullanıcılar arasındaki anlaşmazlıklarda aracı değildir. Platform \"olduğu gibi\" sunulur; belirli bir amaca uygunluk garantisi verilmez.`}
        </Section>

        <Section title="6. Hesap Askıya Alma">
          {`Kullanım koşullarını ihlal eden hesaplar uyarısız askıya alınabilir veya silinebilir.`}
        </Section>

        <Section title="7. Değişiklikler">
          {`Bu koşulları güncelleme hakkını saklı tutarız. Önemli değişiklikler e-posta ile bildirilir.`}
        </Section>

        <Section title="8. Uygulanacak Hukuk">
          {`Bu koşullar Polonya hukukuna tabidir. Uyuşmazlıklar Poznań mahkemelerinde çözülür.`}
        </Section>

        <Text style={st.footer}>İletişim: support@staymate.app</Text>
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
  lastUpdated:  { color: C.mute, fontSize: 12, marginBottom: 20 },
  section:      { marginBottom: 22 },
  sectionTitle: { color: C.ink, fontSize: 14, fontWeight: '700', marginBottom: 8 },
  sectionBody:  { color: C.soft, fontSize: 13, lineHeight: 22 },
  footer:       { color: C.mute, fontSize: 12, marginTop: 24, textAlign: 'center' },
});
