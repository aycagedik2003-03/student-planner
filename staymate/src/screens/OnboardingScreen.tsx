import React from 'react';
import {
  View, Image, Pressable, Text,
  StatusBar, StyleSheet,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../App';
import { useAppStore } from '../store';

type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'Onboarding'>;
};

const CTA:   Record<string, string> = { pl: 'Zacznij',        tr: 'Başla',       en: 'Get started'     };
const LOGIN: Record<string, string> = { pl: 'Mam już konto',  tr: 'Hesabım var', en: 'I have an account' };

export default function OnboardingScreen({ navigation }: Props) {
  const language    = useAppStore(s => s.language);
  const setLanguage = useAppStore(s => s.setLanguage);

  return (
    <SafeAreaView style={st.root} edges={['bottom']}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />

      <View style={st.container}>

        {/* Marketing image — tam ekran arka plan */}
        <Image
          source={require('../../assets/roomski-marketing.png')}
          style={st.bg}
          resizeMode="cover"
        />

        {/* Beyaz overlay — görseldeki "Get started" metnini kapatır */}
        <LinearGradient
          colors={['transparent', '#fff', '#fff']}
          locations={[0, 0.18, 1]}
          style={st.overlay}
        />

        {/* Buton şeridi */}
        <View style={st.bottom}>
          <LinearGradient
            colors={['#00BCD4', '#E91E63']}
            start={{ x: 0, y: 0.5 }}
            end={{ x: 1, y: 0.5 }}
            style={st.ctaGrad}
          >
            <Pressable
              onPress={() => navigation.navigate('Auth', { mode: 'register' })}
              style={st.ctaBtn}
            >
              <Text style={st.ctaTxt}>{CTA[language] ?? 'Get started'}</Text>
            </Pressable>
          </LinearGradient>

          <Pressable
            onPress={() => navigation.navigate('Auth', { mode: 'login' })}
            style={st.loginBtn}
          >
            <Text style={st.loginTxt}>{LOGIN[language] ?? 'I have an account'}</Text>
          </Pressable>

          <View style={st.langRow}>
            {(['pl', 'tr', 'en'] as const).map(l => (
              <Pressable
                key={l}
                onPress={() => setLanguage(l)}
                style={[st.langBtn, language === l && st.langBtnActive]}
              >
                <Text style={[st.langTxt, language === l && st.langTxtActive]}>
                  {l === 'pl' ? 'PL' : l === 'tr' ? 'TR' : 'EN'}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}

const st = StyleSheet.create({
  root:      { flex: 1, backgroundColor: '#fff' },
  container: { flex: 1 },

  // Tam ekran arka plan görseli
  bg: {
    position: 'absolute',
    top: 0, left: 0, right: 0, bottom: 0,
    width: '100%', height: '100%',
  },

  // Alt gradient — görselin buton alanını beyazla örter
  overlay: {
    position: 'absolute',
    left: 0, right: 0, bottom: 0,
    height: '42%',
  },

  // Buton şeridi — en alta sabitlenmiş
  bottom: {
    position: 'absolute',
    left: 0, right: 0, bottom: 0,
    paddingHorizontal: 24,
    paddingTop: 12,
    paddingBottom: 28,
  },

  ctaGrad: { borderRadius: 30, marginBottom: 10 },
  ctaBtn:  { paddingVertical: 16, alignItems: 'center' },
  ctaTxt:  { color: '#fff', fontSize: 16, fontWeight: '700' },

  loginBtn: { alignItems: 'center', paddingVertical: 10 },
  loginTxt: { color: '#666', fontSize: 14, fontWeight: '500' },

  langRow:       { flexDirection: 'row', justifyContent: 'center', gap: 8, marginTop: 10 },
  langBtn:       { paddingHorizontal: 14, paddingVertical: 6, borderRadius: 16, backgroundColor: 'rgba(240,240,240,0.9)' },
  langBtnActive: { backgroundColor: '#00BCD4' },
  langTxt:       { fontSize: 12, fontWeight: '500', color: '#666' },
  langTxtActive: { color: '#fff', fontWeight: '700' },
});
