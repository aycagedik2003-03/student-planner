import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Platform, ActivityIndicator } from 'react-native';
import { NavigationContainer, NavigatorScreenParams } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

import AuthScreen             from './src/screens/AuthScreen';
import OnboardingScreen       from './src/screens/OnboardingScreen';
import QuizScreen             from './src/screens/QuizScreen';
import ProfileScreen          from './src/screens/ProfileScreen';
import ProfileTabScreen       from './src/screens/ProfileTabScreen';
import MatchScreen            from './src/screens/MatchScreen';
import ChatScreen             from './src/screens/ChatScreen';
import ChatListScreen        from './src/screens/ChatListScreen';
import FilterScreen           from './src/screens/FilterScreen';
import ListingScreen          from './src/screens/ListingScreen';
import ListingDetailScreen    from './src/screens/ListingDetailScreen';
import CreateListingScreen    from './src/screens/CreateListingScreen';
import CompatibilityReportScreen from './src/screens/CompatibilityReportScreen';
import VerificationScreen     from './src/screens/VerificationScreen';
import SettingsScreen         from './src/screens/SettingsScreen';
import ProfileEditScreen      from './src/screens/ProfileEditScreen';
import PrivacyPolicyScreen    from './src/screens/PrivacyPolicyScreen';
import TermsOfServiceScreen   from './src/screens/TermsOfServiceScreen';

import { authService }             from './src/api/AuthService';
import { useAppStore }             from './src/store';
import { registerForPushNotifications } from './src/services/NotificationService';
import { navigationRef }           from './src/utils/navigationRef';

// ── Tab param list ─────────────────────────────────────────────────────────────
export type TabParamList = {
  Match:      undefined;
  Listings:   undefined;
  ProfileTab: undefined;
  Settings:   undefined;
};

// ── Root stack param list ──────────────────────────────────────────────────────
export type RootStackParamList = {
  Auth:            { mode?: 'login' | 'register' } | undefined;
  Onboarding:      undefined;
  Quiz:            undefined;
  Profile:         undefined;
  MainTabs:        NavigatorScreenParams<TabParamList> | undefined;
  Filter:          undefined;
  Chat:            { matchId: string };
  ChatList:        undefined;
  ListingDetail:   { listingId: string };
  CreateListing:   undefined;
  Verification:    undefined;
  ProfileEdit:     undefined;
  PrivacyPolicy:   undefined;
  TermsOfService:  undefined;
  CompatibilityReport: {
    userId: string;
    userName: string;
    userInitial: string;
    userAvatarColor: string;
    userMatch: number;
    compat: { sleep: number; clean: number; social: number; work: number; lifestyle: number };
    traits: string[];
  };
};

// ── Tab icons ──────────────────────────────────────────────────────────────────
const TAB_ICONS: Record<string, string> = {
  Match:      '✦',
  Listings:   '🏠',
  ProfileTab: '◉',
  Settings:   '⚙',
};

// ── Bottom tab navigator ───────────────────────────────────────────────────────
const Tab = createBottomTabNavigator<TabParamList>();

function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: '#00CFC8',
        tabBarInactiveTintColor: '#9CA3AF',
        tabBarStyle: {
          backgroundColor: '#FFFFFF',
          borderTopWidth: 1,
          borderTopColor: 'rgba(31,41,55,0.08)',
          height: 60,
          paddingBottom: 8,
          paddingTop: 4,
        },
        tabBarLabelStyle: { fontSize: 11, fontWeight: '600', letterSpacing: 0.2 },
        tabBarIcon: ({ color }) => (
          <Text style={{ color, fontSize: 18 }}>{TAB_ICONS[route.name]}</Text>
        ),
      })}
    >
      <Tab.Screen name="Match"      component={MatchScreen}      options={{ tabBarLabel: 'Keşfet'  }} />
      <Tab.Screen name="Listings"   component={ListingScreen}    options={{ tabBarLabel: 'İlanlar' }} />
      <Tab.Screen name="ProfileTab" component={ProfileTabScreen} options={{ tabBarLabel: 'Profil'  }} />
      <Tab.Screen name="Settings"   component={SettingsScreen}   options={{ tabBarLabel: 'Ayarlar' }} />
    </Tab.Navigator>
  );
}

// ── Root stack navigator ───────────────────────────────────────────────────────
const Stack = createNativeStackNavigator<RootStackParamList>();

// ── Splash / loading ekranı ────────────────────────────────────────────────────
function SplashScreen() {
  return (
    <View style={splash.root}>
      <View style={splash.logoMark}>
        <Text style={splash.logoTxt}>s</Text>
      </View>
      <ActivityIndicator color="#00CFC8" style={{ marginTop: 24 }} />
    </View>
  );
}

const splash = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoMark: {
    width: 56,
    height: 56,
    borderRadius: 18,
    backgroundColor: '#00CFC8',
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoTxt: {
    color: '#fff',
    fontSize: 28,
    fontWeight: '800',
  },
});

// ── Main App ───────────────────────────────────────────────────────────────────
export default function App() {
  const { setToken } = useAppStore();

  /**
   * Uygulama açılışında SecureStore'da saklı token var mı diye bakıyoruz.
   * - Varsa  → initialRoute = 'Onboarding' (kullanıcı oturum açmış)
   * - Yoksa  → initialRoute = 'Auth'        (giriş/kayıt ekranı)
   *
   * Kontrol tamamlanana kadar SplashScreen gösteriyoruz.
   */
  const [isReady,      setIsReady]      = useState(false);
  const [initialRoute, setInitialRoute] =
    useState<keyof RootStackParamList>('Auth');

  useEffect(() => {
    const bootstrap = async () => {
      try {
        // Push bildirim izni (hata yutulur — kritik değil)
        registerForPushNotifications().catch(() => {});

        // Token kontrolü
        const token = await authService.getToken();
        if (token) {
          setToken(token);            // runtime store'a yaz
          setInitialRoute('Onboarding');
        } else {
          setInitialRoute('Auth');
        }
      } catch {
        setInitialRoute('Auth');
      } finally {
        setIsReady(true);
      }
    };

    bootstrap();
  }, [setToken]);

  // Token yüklenene kadar splash göster
  if (!isReady) {
    if (Platform.OS === 'web') {
      return (
        <View style={st.webShell}>
          <View style={st.phone}>
            <SplashScreen />
          </View>
        </View>
      );
    }
    return <SplashScreen />;
  }

  const nav = (
    <NavigationContainer ref={navigationRef}>
      <Stack.Navigator
        initialRouteName={initialRoute}
        screenOptions={{ headerShown: false, animation: 'fade' }}
      >
        {/* Auth akışı */}
        <Stack.Screen name="Auth"       component={AuthScreen} />

        {/* Ana akış */}
        <Stack.Screen name="Onboarding"          component={OnboardingScreen} />
        <Stack.Screen name="Quiz"                component={QuizScreen} />
        <Stack.Screen name="Profile"             component={ProfileScreen} />
        <Stack.Screen name="MainTabs"            component={MainTabs} />
        <Stack.Screen name="Filter"              component={FilterScreen} />
        <Stack.Screen name="Chat"                component={ChatScreen} />
        <Stack.Screen name="ChatList"            component={ChatListScreen} />
        <Stack.Screen name="ListingDetail"       component={ListingDetailScreen} />
        <Stack.Screen name="CreateListing"       component={CreateListingScreen} />
        <Stack.Screen name="CompatibilityReport" component={CompatibilityReportScreen} />
        <Stack.Screen name="Verification"        component={VerificationScreen} />
        <Stack.Screen name="ProfileEdit"         component={ProfileEditScreen} />
        <Stack.Screen name="PrivacyPolicy"       component={PrivacyPolicyScreen} />
        <Stack.Screen name="TermsOfService"      component={TermsOfServiceScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );

  if (Platform.OS === 'web') {
    return (
      <View style={st.webShell}>
        <View style={st.phone}>{nav}</View>
      </View>
    );
  }

  return nav;
}

const st = StyleSheet.create({
  webShell: {
    flex: 1,
    backgroundColor: '#F0EFEC',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '100vh' as any,
  },
  phone: {
    width: 390,
    height: 844,
    borderRadius: 44,
    overflow: 'hidden',
    backgroundColor: '#FFFFFF',
    shadowColor: '#1F2937',
    shadowOffset: { width: 0, height: 40 },
    shadowOpacity: 0.22,
    shadowRadius: 60,
    borderWidth: 1,
    borderColor: 'rgba(31,41,55,0.08)',
  },
});
