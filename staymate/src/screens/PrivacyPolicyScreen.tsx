import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../App';
import { useTranslation } from '../i18n/translations';

type Props = { navigation: NativeStackNavigationProp<RootStackParamList, 'PrivacyPolicy'> };

const C = {
  bg: '#FFFFFF', ink: '#1F2937', soft: '#4B5563',
  mute: '#9CA3AF', line: 'rgba(31,41,55,0.08)',
};

function Section({ title, body }: { title: string; body: string }) {
  return (
    <View style={st.section}>
      <Text style={st.sectionTitle}>{title}</Text>
      <Text style={st.sectionBody}>{body}</Text>
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
        <Text style={st.lastUpdated}>{t('privacy.lastUpdated')}</Text>

        <Section title={t('privacy.s1Title')} body={t('privacy.s1Body')} />
        <Section title={t('privacy.s2Title')} body={t('privacy.s2Body')} />
        <Section title={t('privacy.s3Title')} body={t('privacy.s3Body')} />
        <Section title={t('privacy.s4Title')} body={t('privacy.s4Body')} />
        <Section title={t('privacy.s5Title')} body={t('privacy.s5Body')} />
        <Section title={t('privacy.s6Title')} body={t('privacy.s6Body')} />
        <Section title={t('privacy.s7Title')} body={t('privacy.s7Body')} />

        <Text style={st.footer}>{t('privacy.footer')}</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const st = StyleSheet.create({
  root: { flex: 1, backgroundColor: C.bg },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 18, paddingTop: 14, paddingBottom: 12,
    borderBottomWidth: 1, borderBottomColor: C.line,
  },
  backBtn:      { width: 38, height: 38, borderRadius: 999, backgroundColor: '#FAFAFA', borderWidth: 1, borderColor: C.line, alignItems: 'center', justifyContent: 'center' },
  backTxt:      { color: C.ink, fontSize: 17 },
  hTitle:       { color: C.ink, fontSize: 17, fontWeight: '800', letterSpacing: -0.2 },
  content:      { padding: 20, paddingBottom: 40 },
  lastUpdated:  { color: C.mute, fontSize: 12, marginBottom: 20 },
  section:      { marginBottom: 22 },
  sectionTitle: { color: C.ink, fontSize: 14, fontWeight: '700', marginBottom: 8 },
  sectionBody:  { color: C.soft, fontSize: 13, lineHeight: 22 },
  footer:       { color: C.mute, fontSize: 12, marginTop: 24, textAlign: 'center' },
});
