import React from 'react';
import { View, Text, ScrollView, Switch, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from '../i18n/useTranslation';
import { useAppStore } from '../store';

const C = {
  bg: '#F5F5F5', card: '#FFFFFF', ink: '#000000',
  sub: '#888888', line: '#EEEEEE', brand: '#1D9E75',
};

export default function NotificationCenterScreen() {
  const { t } = useTranslation();
  const settings       = useAppStore(s => s.notificationSettings);
  const updateSetting  = useAppStore(s => s.updateNotificationSetting);

  const ROWS = [
    {
      key:   'newMatch'   as const,
      icon:  '❤️',
      label: t('settings.notifMatches')   || 'Yeni Eşleşme',
      sub:   t('settings.notifMatchesSub')|| 'Birisi seni favori aldığında',
    },
    {
      key:   'newMessage' as const,
      icon:  '💬',
      label: t('settings.notifMessages')   || 'Yeni Mesaj',
      sub:   t('settings.notifMessagesSub')|| 'Birisi sana yazdığında',
    },
    {
      key:   'system'     as const,
      icon:  '🔔',
      label: 'Sistem',
      sub:   'Güncellemeler ve duyurular',
    },
  ];

  return (
    <SafeAreaView style={st.root} edges={['top']}>
      <View style={st.header}>
        <Text style={st.headerTitle}>🔔 Bildirimler</Text>
      </View>

      <ScrollView style={{ flex: 1 }} contentContainerStyle={st.body}>
        <View style={st.card}>
          {ROWS.map((row, idx) => (
            <View key={row.key}>
              <View style={st.row}>
                <Text style={st.rowIcon}>{row.icon}</Text>
                <View style={st.rowText}>
                  <Text style={st.rowLabel}>{row.label}</Text>
                  <Text style={st.rowSub}>{row.sub}</Text>
                </View>
                <Switch
                  value={settings[row.key]}
                  onValueChange={() => updateSetting(row.key, !settings[row.key])}
                  trackColor={{ false: '#CCCCCC', true: C.brand }}
                  thumbColor="#FFFFFF"
                />
              </View>
              {idx < ROWS.length - 1 && <View style={st.divider} />}
            </View>
          ))}
        </View>

        <Text style={st.hint}>
          Bildirimleri kapatmak uygulamanın bildirim iznini etkilemez.
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const st = StyleSheet.create({
  root:       { flex: 1, backgroundColor: C.bg },
  header:     { paddingHorizontal: 20, paddingVertical: 16, backgroundColor: C.card, borderBottomWidth: 1, borderBottomColor: C.line },
  headerTitle:{ fontSize: 20, fontWeight: '800', color: C.ink },
  body:       { padding: 16 },
  card:       { backgroundColor: C.card, borderRadius: 16, padding: 4, marginBottom: 12, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 1 },
  row:        { flexDirection: 'row', alignItems: 'center', padding: 16, gap: 14 },
  rowIcon:    { fontSize: 22, width: 28, textAlign: 'center' },
  rowText:    { flex: 1 },
  rowLabel:   { fontSize: 16, fontWeight: '600', color: C.ink },
  rowSub:     { fontSize: 12, color: C.sub, marginTop: 3 },
  divider:    { height: 1, backgroundColor: C.line, marginLeft: 58 },
  hint:       { fontSize: 12, color: '#AAAAAA', textAlign: 'center', marginTop: 8, lineHeight: 18, paddingHorizontal: 16 },
});
