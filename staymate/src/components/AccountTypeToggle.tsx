import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { COLORS, RADII } from '../utils/constants';

type UserRole = 'student' | 'landlord';

interface AccountTypeToggleProps {
  value: UserRole;
  onChange: (v: UserRole) => void;
  studentLabel: string;
  studentDesc: string;
  landlordLabel: string;
  landlordDesc: string;
}

export default function AccountTypeToggle({
  value, onChange,
  studentLabel, studentDesc,
  landlordLabel, landlordDesc,
}: AccountTypeToggleProps) {
  const OPTIONS = [
    { role: 'student'  as UserRole, emoji: '🎓', label: studentLabel,  desc: studentDesc },
    { role: 'landlord' as UserRole, emoji: '🏠', label: landlordLabel, desc: landlordDesc },
  ];

  return (
    <View style={s.row}>
      {OPTIONS.map((opt) => {
        const active = value === opt.role;
        return (
          <Pressable
            key={opt.role}
            onPress={() => onChange(opt.role)}
            style={({ pressed }) => [
              s.card,
              active && s.cardOn,
              pressed && !active && s.cardPressed,
            ]}
          >
            <View style={s.topRow}>
              <Text style={s.emoji}>{opt.emoji}</Text>
              {active && <View style={s.dot} />}
            </View>
            <Text style={[s.cardLabel, active && s.cardLabelOn]}>{opt.label}</Text>
            <Text style={s.desc}>{opt.desc}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const s = StyleSheet.create({
  row:          { flexDirection: 'row', gap: 10, marginBottom: 20 },
  card:         {
    flex: 1, borderRadius: RADII.lg, padding: 14,
    borderWidth: 2, borderColor: '#E5E7EB', backgroundColor: '#fff',
  },
  cardOn:       { borderWidth: 2, borderColor: COLORS.primary, backgroundColor: COLORS.tealLight },
  cardPressed:  { backgroundColor: '#F9FAFB' },
  topRow:       { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
  emoji:        { fontSize: 22 },
  dot:          { width: 10, height: 10, borderRadius: 5, backgroundColor: COLORS.primary },
  cardLabel:    { fontSize: 13, fontWeight: '700', color: COLORS.soft, lineHeight: 18 },
  cardLabelOn:  { color: COLORS.primary },
  desc:         { fontSize: 11, color: COLORS.muted, marginTop: 3, lineHeight: 15 },
});
