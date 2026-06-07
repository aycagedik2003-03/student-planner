import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { useAppStore } from '../store';
import { setLanguage, Lang } from '../i18n/translations';
import { COLORS, RADII } from '../utils/constants';

const LANGUAGES: { code: Lang; label: string }[] = [
  { code: 'pl', label: 'Polski'  },
  { code: 'tr', label: 'Türkçe' },
  { code: 'en', label: 'English' },
];

interface Props {
  compact?: boolean; // true → show short code (PL/TR/EN), false → full name
}

export default function LanguageSelector({ compact = false }: Props) {
  const current = useAppStore((s) => s.language);

  return (
    <View style={s.row}>
      {LANGUAGES.map((lang) => {
        const active = lang.code === current;
        return (
          <Pressable
            key={lang.code}
            onPress={() => setLanguage(lang.code)}
            style={({ pressed }) => [
              s.btn,
              active && s.btnActive,
              pressed && { opacity: 0.8 },
            ]}
          >
            <Text style={[s.txt, active && s.txtActive]}>
              {compact ? lang.code.toUpperCase() : lang.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const s = StyleSheet.create({
  row: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
  },
  btn: {
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: RADII.pill,
    borderWidth: 1,
    borderColor: COLORS.line,
    backgroundColor: COLORS.bgSoft,
  },
  btnActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  txt: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.soft,
  },
  txtActive: {
    color: '#fff',
    fontWeight: '700',
  },
});
