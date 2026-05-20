// src/navigation/BottomTabNavigator.tsx
//
// Floating glass tab bar with all 5 screens integrated
// Home (Discover) → Search → Matches → Chat → Profile (Me)

import React from 'react';
import { View, Text, Pressable, StyleSheet, Platform } from 'react-native';
import { createBottomTabNavigator, BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { Feather } from '@expo/vector-icons';
import { COLORS, GRADIENT, SHADOW } from '../utils/constants';
import { useT, TKey } from '../i18n/translations';
import { useAuth } from '../context/AuthContext';

// Import all screens
import HomeScreen from '../screens/HomeScreen';
import SearchScreen from '../screens/SearchScreen';
import MatchesScreen from '../screens/MatchesScreen';
import ChatScreen from '../screens/ChatScreen';
import ProfileScreen from '../screens/ProfileScreen';

const Tab = createBottomTabNavigator();

type TabKey = 'home' | 'search' | 'match' | 'chat' | 'me';
const TABS: {
  key: TabKey;
  route: string;
  icon: keyof typeof Feather.glyphMap;
  labelKey: TKey;
}[] = [
  { key: 'home', route: 'Home', icon: 'home', labelKey: 'nav_home' },
  { key: 'search', route: 'Search', icon: 'search', labelKey: 'nav_search' },
  {
    key: 'match',
    route: 'Matches',
    icon: 'heart',
    labelKey: 'nav_match',
  },
  {
    key: 'chat',
    route: 'Chat',
    icon: 'message-circle',
    labelKey: 'nav_chat',
  },
  { key: 'me', route: 'Me', icon: 'user', labelKey: 'nav_me' },
];

// ─── Custom tab bar ───────────────────────────────────────────────────────────
function GlassTabBar({ state, navigation }: BottomTabBarProps) {
  const { t } = useT();
  return (
    <View style={s.wrap} pointerEvents="box-none">
      <View style={s.bar}>
        {Platform.OS === 'ios' && (
          <BlurView intensity={40} tint="light" style={StyleSheet.absoluteFill} />
        )}
        {TABS.map((tab, i) => {
          const focused = state.index === i;
          return (
            <Pressable
              key={tab.key}
              onPress={() => navigation.navigate(tab.route)}
              style={s.item}
              hitSlop={8}>
              {focused ? (
                <LinearGradient
                  colors={GRADIENT.brand as any}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={s.activePill}>
                  <Feather name={tab.icon} size={20} color="#fff" />
                  <Text style={s.activeLabel}>{t(tab.labelKey)}</Text>
                </LinearGradient>
              ) : (
                <View style={s.idleItem}>
                  <Feather name={tab.icon} size={22} color={COLORS.muted} />
                </View>
              )}
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

// ─── Navigator ────────────────────────────────────────────────────────────────
export default function BottomTabNavigator() {
  const { signOut } = useAuth();

  return (
    <Tab.Navigator
      tabBar={(props) => <GlassTabBar {...props} />}
      screenOptions={{ headerShown: false }}>
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Search" component={SearchScreen} />
      <Tab.Screen name="Matches" component={MatchesScreen} />
      <Tab.Screen name="Chat" component={ChatScreen} />
      <Tab.Screen
        name="Me"
        options={{ lazy: false }}>
        {() => (
          <ProfileScreen
            user={{ name: 'test' }}
            onLogout={signOut}
          />
        )}
      </Tab.Screen>
    </Tab.Navigator>
  );
}

const s = StyleSheet.create({
  wrap: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingBottom: 22,
  },
  bar: {
    height: 64,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    gap: 4,
    borderRadius: 32,
    backgroundColor:
      Platform.OS === 'ios'
        ? 'rgba(255,255,255,0.78)'
        : 'rgba(255,255,255,0.96)',
    borderWidth: 1,
    borderColor: COLORS.line,
    overflow: 'hidden',
    alignSelf: 'stretch',
    ...SHADOW.float,
  },
  item: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    height: 48,
  },
  idleItem: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  activePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 999,
    ...SHADOW.glow,
  },
  activeLabel: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 12.5,
  },
});
