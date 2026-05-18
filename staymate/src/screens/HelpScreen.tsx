import React from 'react';
import { View, Text, Pressable, StyleSheet, ScrollView, Linking } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../App';
import { useTranslation } from '../i18n/useTranslation';

type Props = { navigation: NativeStackNavigationProp<RootStackParamList> };

const C = { bg: '#fff', ink: '#1F2937', soft: '#4B5563', mute: '#9CA3AF', line: '#E5E7EB', brand: '#1D9E75', brandBg: '#E1F5EE' };

const FAQS = [
  { q: 'Nasıl eşleşme alırım?', a: 'Quiz\'i tamamladıktan sonra sistem kişilik uyumuna göre önerileri hesaplar.' },
  { q: 'Dil nasıl değiştirilir?', a: 'Ayarlar ekranında DİL bölümünden istediğin dili seçebilirsin.' },
  { q: 'Profilim neden görünmüyor?', a: 'Ayarlar > Gizlilik > "Profili Gizle" seçeneğini kontrol et.' },
  { q: 'Eşleşme nasıl iptal edilir?', a: 'Şu an için mesaj listesinden ilgili kişiyi gizleyebilirsin.' },
  { q: 'Hesabımı nasıl silerim?', a: 'Ayarlar > Hesap > "Hesabı Sil" bölümünden işlemi tamamlayabilirsin.' },
];

export default function HelpScreen({ navigation }: Props) {
  const { t } = useTranslation();

  return (
    <SafeAreaView style={st.root}>
      <View style={st.header}>
        <Pressable onPress={() => navigation.goBack()} style={st.backBtn}>
          <Text style={st.backBtnTxt}>←</Text>
        </Pressable>
        <Text style={st.title}>{t('settings.helpSupport')}</Text>
        <View style={{ width: 38 }} />
      </View>

      <ScrollView contentContainerStyle={st.body}>
        <Text style={st.sectionLabel}>SIK SORULAN SORULAR</Text>

        {FAQS.map((faq, i) => (
          <View key={i} style={st.faqCard}>
            <Text style={st.faqQ}>❓ {faq.q}</Text>
            <Text style={st.faqA}>{faq.a}</Text>
          </View>
        ))}

        <Text style={st.sectionLabel}>İLETİŞİM</Text>
        <Pressable
          style={st.contactBtn}
          onPress={() => Linking.openURL('mailto:roomski.app@gmail.com')}
        >
          <Text style={st.contactBtnTxt}>✉️  roomski.app@gmail.com</Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

const st = StyleSheet.create({
  root:       { flex: 1, backgroundColor: '#F5F5F5' },
  header:     { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingVertical: 16, backgroundColor: C.bg, borderBottomWidth: 1, borderBottomColor: C.line },
  backBtn:    { width: 38, height: 38, borderRadius: 19, backgroundColor: '#F3F4F6', alignItems: 'center', justifyContent: 'center' },
  backBtnTxt: { fontSize: 18, color: C.ink },
  title:      { fontSize: 18, fontWeight: '800', color: C.ink },
  body:       { padding: 16 },
  sectionLabel:{ color: C.mute, fontSize: 11, fontWeight: '700', letterSpacing: 1.2, marginBottom: 10, marginTop: 8, marginLeft: 4 },
  faqCard:    { backgroundColor: C.bg, borderRadius: 14, padding: 16, marginBottom: 10, borderWidth: 1, borderColor: C.line },
  faqQ:       { fontSize: 14, fontWeight: '700', color: C.ink, marginBottom: 8 },
  faqA:       { fontSize: 13, color: C.soft, lineHeight: 20 },
  contactBtn: { backgroundColor: C.brandBg, borderRadius: 14, paddingVertical: 16, alignItems: 'center', borderWidth: 1, borderColor: C.brand + '55' },
  contactBtnTxt:{ color: C.brand, fontSize: 15, fontWeight: '700' },
});
