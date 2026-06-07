import React, { useEffect, useState } from 'react';
import { View, Text, Image, StyleSheet, Platform, ActivityIndicator } from 'react-native';
import { NavigationContainer, NavigatorScreenParams } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { LinearGradient } from 'expo-linear-gradient';
import { Feather } from '@expo/vector-icons';

import AuthScreen                from './src/screens/AuthScreen';
import OnboardingScreen          from './src/screens/OnboardingScreen';
import QuizScreen                from './src/screens/QuizScreen';
import ProfileScreen             from './src/screens/ProfileScreen';
import ChatScreen                from './src/screens/ChatScreen';
import ChatListScreen            from './src/screens/ChatListScreen';
import FilterScreen              from './src/screens/FilterScreen';
import ListingDetailScreen       from './src/screens/ListingDetailScreen';
import CreateListingScreen       from './src/screens/CreateListingScreen';
import CompatibilityReportScreen from './src/screens/CompatibilityReportScreen';
import VerificationScreen        from './src/screens/VerificationScreen';
import SettingsScreen            from './src/screens/SettingsScreen';
import ProfileEditScreen         from './src/screens/ProfileEditScreen';
import PrivacyPolicyScreen       from './src/screens/PrivacyPolicyScreen';
import TermsOfServiceScreen      from './src/screens/TermsOfServiceScreen';
import MyListingsScreen          from './src/screens/MyListingsScreen';
import LandlordProfileScreen     from './src/screens/LandlordProfileScreen';
import InterestedStudentsScreen  from './src/screens/InterestedStudentsScreen';
import BrowseListingsScreen      from './src/screens/BrowseListingsScreen';
import ChangeEmailScreen         from './src/screens/ChangeEmailScreen';
import ChangePasswordScreen      from './src/screens/ChangePasswordScreen';
import HelpScreen                from './src/screens/HelpScreen';
import DeleteAccountScreen       from './src/screens/DeleteAccountScreen';
import AboutScreen               from './src/screens/AboutScreen';
import NotificationCenterScreen  from './src/screens/NotificationCenterScreen';
import EmailVerificationScreen   from './src/screens/EmailVerificationScreen';
import PasswordResetScreen        from './src/screens/PasswordResetScreen';

import { authService }                   from './src/api/AuthService';
import { profileService }                from './src/api/ProfileService';
import { storage }                       from './src/utils/storage';

const IS_UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
import { useAppStore }                   from './src/store';
import { useTranslation }                from './src/i18n/translations';
import { registerForPushNotifications }  from './src/services/NotificationService';
import { navigationRef }                 from './src/utils/navigationRef';
import { AuthProvider }                  from './src/context/AuthContext';
import BottomTabNavigator                from './src/navigation/BottomTabNavigator';

// ── Student tab param list ─────────────────────────────────────────────────────
export type TabParamList = {
  Match:         undefined;
  BrowseListings:undefined;
  ChatListTab:   undefined;
  Notifications: undefined;
  ProfileTab:    undefined;
};

// ── Landlord tab param list ────────────────────────────────────────────────────
export type LandlordTabParamList = {
  MyListings:      undefined;
  ChatListTab:     undefined;
  Notifications:   undefined;
  LandlordProfile: undefined;
};

// ── Root stack param list ──────────────────────────────────────────────────────
export type RootStackParamList = {
  Auth:            { mode?: 'login' | 'register' } | undefined;
  Onboarding:      undefined;
  Quiz:            undefined;
  Profile:         undefined;
  MainTabs:        NavigatorScreenParams<TabParamList> | undefined;
  LandlordTabs:    NavigatorScreenParams<LandlordTabParamList> | undefined;
  Filter:          undefined;
  Chat:            { matchId: string };
  ChatList:        undefined;
  ListingDetail:   { listingId: string };
  CreateListing:   undefined;
  MyListings:      undefined;
  ChangeEmail:     undefined;
  ChangePassword:  undefined;
  Help:            undefined;
  DeleteAccount:   undefined;
  About:             undefined;
  Settings:          undefined;
  EmailVerification: { email: string };
  PasswordReset:     undefined;
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

// StudentTabs replaced by BottomTabNavigator (imported above)

// ── Landlord tabs ──────────────────────────────────────────────────────────────
const LandlordTab = createBottomTabNavigator<LandlordTabParamList>();

type LandlordIcon = keyof typeof Feather.glyphMap;
const LANDLORD_FEATHER: Record<string, LandlordIcon> = {
  MyListings:      'home',
  ChatListTab:     'message-circle',
  Notifications:   'bell',
  LandlordProfile: 'user',
};

function LandlordTabs() {
  const { t, language } = useTranslation();
  return (
    <LandlordTab.Navigator
      key={language}
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor:   '#1FBFCC',
        tabBarInactiveTintColor: '#aaaaaa',
        tabBarShowLabel: false,
        tabBarStyle: {
          backgroundColor: '#ffffff',
          borderTopWidth: 0,
          height: 64,
          paddingBottom: 8,
          paddingTop: 8,
          elevation: 12,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: -2 },
          shadowOpacity: 0.08,
          shadowRadius: 8,
        },
        tabBarLabelStyle: {
          fontSize: 10,
          fontWeight: '600',
          marginTop: 2,
        },
        tabBarIcon: ({ color, size }) => (
          <Feather name={LANDLORD_FEATHER[route.name] ?? 'circle'} size={22} color={color} />
        ),
      })}
    >
      <LandlordTab.Screen name="MyListings"      component={MyListingsScreen}         options={{ tabBarLabel: () => t('tabs.myListings')   }} />
      <LandlordTab.Screen name="ChatListTab"     component={ChatListScreen}           options={{ tabBarLabel: () => t('tabs.messages')      }} />
      <LandlordTab.Screen name="Notifications"   component={NotificationCenterScreen} options={{ tabBarLabel: () => t('tabs.notifications') }} />
      <LandlordTab.Screen name="LandlordProfile" component={LandlordProfileScreen}   options={{ tabBarLabel: () => t('tabs.profile')       }} />
    </LandlordTab.Navigator>
  );
}

// ── Root stack navigator ───────────────────────────────────────────────────────
const Stack = createNativeStackNavigator<RootStackParamList>();

// ── Splash ─────────────────────────────────────────────────────────────────────
function SplashScreen() {
  return (
    <LinearGradient
      colors={['#00BCD4', '#E91E63']}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={splash.root}
    >
      <View style={splash.logoMark}>
        <Image
          source={require('./assets/roomski-logo.png')}
          style={{ width: 72, height: 68 }}
          resizeMode="contain"
        />
      </View>
      <Text style={splash.appName}>roomski</Text>
      <Text style={splash.tagline}>find your people. feel at home.</Text>
      <ActivityIndicator color="rgba(255,255,255,0.8)" style={{ marginTop: 32 }} />
    </LinearGradient>
  );
}

const splash = StyleSheet.create({
  root:     { flex: 1, alignItems: 'center', justifyContent: 'center' },
  logoMark: { width: 96, height: 96, borderRadius: 28, backgroundColor: 'rgba(255,255,255,0.2)', alignItems: 'center', justifyContent: 'center', marginBottom: 16 },
  logoIcon: { fontSize: 52 },
  appName:  { color: '#fff', fontSize: 32, fontWeight: '800', letterSpacing: -0.5 },
  tagline:  { color: 'rgba(255,255,255,0.85)', fontSize: 13, marginTop: 6 },
});

// ── Main App ───────────────────────────────────────────────────────────────────
export default function App() {
  const { setToken, setUserType, setProfile, setQuizCompleted, loadLanguage } = useAppStore();

  const [isReady,      setIsReady]      = useState(false);
  const [initialRoute, setInitialRoute] =
    useState<keyof RootStackParamList>('Auth');

  useEffect(() => {
    const bootstrap = async () => {
      try {
        // Restore persisted language before anything renders
        await loadLanguage();

        // Evict stale mock sessions.
        // A mock session has userId like "mock_1748..." or token like "mock_access_...".
        // Sending these to the backend causes 422 UUID validation errors.
        const storedUserId    = await storage.getItem('userId');
        const storedUserToken = await storage.getItem('userToken');
        const isMockSession =
          (storedUserId    && !IS_UUID.test(storedUserId)       ) ||
          (storedUserToken && storedUserToken.startsWith('mock_'));
        if (isMockSession) {
          if (__DEV__) console.log('[Boot] Stale mock session detected — clearing');
          await authService.logout(); // clears SecureStore; API call is best-effort
          setInitialRoute('Auth');
          setIsReady(true);
          return;
        }

        registerForPushNotifications().catch(() => {});

        const token = await authService.getToken();
        if (token) {
          setToken(token);

          const storedType = await authService.getUserType();
          setUserType(storedType);

          if (storedType === 'landlord') {
            setInitialRoute('LandlordTabs');
          } else {
            try {
              const profile = await profileService.getProfile();
              setProfile(profile);
              const done = !!(profile.quizCompleted || (profile.traits && profile.traits.length > 0));
              setQuizCompleted(done);
              setInitialRoute(done ? 'MainTabs' : 'Onboarding');
            } catch (err: any) {
              // 401/403 → token expired or invalid. interceptor already cleared storage;
              // route to Auth so the user logs in with fresh credentials.
              const status = err?.response?.status;
              if (!status || status === 401 || status === 403) {
                setInitialRoute('Auth');
              } else {
                // Network error / 5xx — let the user try from Onboarding
                setInitialRoute('Onboarding');
              }
            }
          }
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
  }, [setToken, setUserType, setProfile, setQuizCompleted, loadLanguage]);

  if (!isReady) {
    if (Platform.OS === 'web') {
      return (
        <View style={st.webShell}>
          <View style={st.phone}><SplashScreen /></View>
        </View>
      );
    }
    return <SplashScreen />;
  }

  const nav = (
    <AuthProvider>
    <NavigationContainer ref={navigationRef}>
      <Stack.Navigator
        initialRouteName={initialRoute}
        screenOptions={{ headerShown: false, animation: 'fade' }}
      >
        {/* Auth */}
        <Stack.Screen name="Auth"       component={AuthScreen} />

        {/* Ortak akış */}
        <Stack.Screen name="Onboarding" component={OnboardingScreen} />
        <Stack.Screen name="Quiz"       component={QuizScreen} />
        <Stack.Screen name="Profile"    component={ProfileScreen} />

        {/* Tab containers */}
        <Stack.Screen name="MainTabs"     component={BottomTabNavigator}  />
        <Stack.Screen name="LandlordTabs" component={LandlordTabs} />

        {/* Ortak stack ekranları */}
        <Stack.Screen name="Filter"              component={FilterScreen} />
        <Stack.Screen name="Chat"                component={ChatScreen} />
        <Stack.Screen name="ChatList"            component={ChatListScreen} />
        <Stack.Screen name="ListingDetail"       component={ListingDetailScreen} />
        <Stack.Screen name="CreateListing"       component={CreateListingScreen} />
        <Stack.Screen name="MyListings"          component={MyListingsScreen} />
        <Stack.Screen name="CompatibilityReport" component={CompatibilityReportScreen} />
        <Stack.Screen name="Verification"        component={VerificationScreen} />
        <Stack.Screen name="ProfileEdit"         component={ProfileEditScreen} />
        <Stack.Screen name="PrivacyPolicy"    component={PrivacyPolicyScreen} />
        <Stack.Screen name="TermsOfService"   component={TermsOfServiceScreen} />
        <Stack.Screen name="ChangeEmail"      component={ChangeEmailScreen} />
        <Stack.Screen name="ChangePassword"   component={ChangePasswordScreen} />
        <Stack.Screen name="Help"             component={HelpScreen} />
        <Stack.Screen name="DeleteAccount"    component={DeleteAccountScreen} />
        <Stack.Screen name="About"            component={AboutScreen} />
        <Stack.Screen name="Settings"           component={SettingsScreen} />
        <Stack.Screen name="EmailVerification"  component={EmailVerificationScreen} />
        <Stack.Screen name="PasswordReset"      component={PasswordResetScreen} />
      </Stack.Navigator>
    </NavigationContainer>
    </AuthProvider>
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
