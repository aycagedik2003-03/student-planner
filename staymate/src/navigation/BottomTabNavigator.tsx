// src/navigation/BottomTabNavigator.tsx
//
// Floating glass tab bar with all 5 screens integrated
// Home (Discover) → Search → Matches → Chat → Profile (Me)

import React from 'react';
import { View, Text, Pressable, StyleSheet, Platform } from 'react-native';
import { createBottomTabNavigator, BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { getFocusedRouteNameFromRoute } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { Feather } from '@expo/vector-icons';
import { COLORS, SHADOW } from '../utils/constants';
import { useT, TKey } from '../i18n/translations';
import { useAuth } from '../context/AuthContext';

// Import all screens
import HomeScreen from '../screens/HomeScreen';
import SearchScreen from '../screens/SearchScreen';
import MatchesScreen from '../screens/MatchesScreen';
import ChatListScreen from '../screens/ChatListScreen';
import ChatDetailScreen from '../screens/ChatDetailScreen';
import ProfileScreen from '../screens/ProfileScreen';

// ─── Messages stack types ─────────────────────────────────────────────────────
export type ChatStackParamList = {
  ChatList:   undefined;
  ChatDetail: { chatId: string; name: string; avatar_url: string | null };
};

const ChatStack = createNativeStackNavigator<ChatStackParamList>();

function MessagesStack() {
  return (
    <ChatStack.Navigator initialRouteName="ChatList" screenOptions={{ headerShown: false }}>
      <ChatStack.Screen name="ChatList"   component={ChatListScreen} />
      <ChatStack.Screen name="ChatDetail" component={ChatDetailScreen} />
    </ChatStack.Navigator>
  );
}

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
function GlassTabBar({ state, navigation, descriptors }: BottomTabBarProps) {
  const { t } = useT();
  const { bottom } = useSafeAreaInsets();
  const pb = Math.max(bottom, 12);

  // Let any screen opt-out of the tab bar by setting tabBarStyle: { display: 'none' }
  const focusedOptions = descriptors[state.routes[state.index].key].options as any;
  if (focusedOptions?.tabBarStyle?.display === 'none') return null;

  return (
    <View style={[s.wrap, { paddingBottom: pb }]} pointerEvents="box-none">
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
              <Feather
                name={tab.icon}
                size={24}
                color={focused ? COLORS.primary : COLORS.muted}
              />
              {focused && <View style={s.activeDot} />}
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
      <Tab.Screen
        name="Chat"
        component={MessagesStack}
        options={({ route }) => {
          const focused = getFocusedRouteNameFromRoute(route) ?? 'ChatList';
          return focused === 'ChatDetail'
            ? { tabBarStyle: { display: 'none' } }
            : {};
        }}
      />
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
    // paddingBottom is set dynamically via useSafeAreaInsets
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
    gap: 4,
    height: 48,
  },
  activeDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: COLORS.primary,
  },
});
