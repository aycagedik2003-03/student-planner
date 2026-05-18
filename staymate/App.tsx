import React, { useEffect, useState } from 'react';
import { View, Text, Image, StyleSheet, Platform, ActivityIndicator } from 'react-native';
import { NavigationContainer, NavigatorScreenParams } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { LinearGradient } from 'expo-linear-gradient';

import AuthScreen                from './src/screens/AuthScreen';
import OnboardingScreen          from './src/screens/OnboardingScreen';
import QuizScreen                from './src/screens/QuizScreen';
import ProfileScreen             from './src/screens/ProfileScreen';
import ProfileTabScreen          from './src/screens/ProfileTabScreen';
import MatchScreen               from './src/screens/MatchScreen';
import ChatScreen                from './src/screens/ChatScreen';
import ChatListScreen            from './src/screens/ChatListScreen';
import FilterScreen              from './src/screens/FilterScreen';
import ListingScreen             from './src/screens/ListingScreen';
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

import { authService }                   from './src/api/AuthService';
import { useAppStore }                   from './src/store';
import { registerForPushNotifications }  from './src/services/NotificationService';
import { navigationRef }                 from './src/utils/navigationRef';

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
  MyListings:         undefined;
  InterestedStudents: undefined;
  ChatListTab:        undefined;
  Notifications:      undefined;
  LandlordProfile:    undefined;
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
  About:           undefined;
  Settings:        undefined;
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

// ── Tab icon maps ──────────────────────────────────────────────────────────────
const STUDENT_ICONS: Record<string, string> = {
  Match:         '✦',
  BrowseListings:'🏠',
  ChatListTab:   '💬',
  Notifications: '🔔',
  ProfileTab:    '◉',
};
const LANDLORD_ICONS: Record<string, string> = {
  MyListings:         '🏠',
  InterestedStudents: '🎓',
  ChatListTab:        '💬',
  Notifications:      '🔔',
  LandlordProfile:    '◉',
};

// ── Student tabs ───────────────────────────────────────────────────────────────
const StudentTab = createBottomTabNavigator<TabParamList>();

function StudentTabs() {
  return (
    <StudentTab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor:   '#E91E63',
        tabBarInactiveTintColor: '#00BCD4',
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
          <Text style={{ color, fontSize: 18 }}>{STUDENT_ICONS[route.name]}</Text>
        ),
      })}
    >
      <StudentTab.Screen name="Match"          component={MatchScreen}               options={{ tabBarLabel: 'Keşfet'      }} />
      <StudentTab.Screen name="BrowseListings" component={BrowseListingsScreen}      options={{ tabBarLabel: 'İlanlar'     }} />
      <StudentTab.Screen name="ChatListTab"    component={ChatListScreen}            options={{ tabBarLabel: 'Mesajlar'    }} />
      <StudentTab.Screen name="Notifications"  component={NotificationCenterScreen}  options={{ tabBarLabel: 'Bildirimler' }} />
      <StudentTab.Screen name="ProfileTab"     component={ProfileTabScreen}          options={{ tabBarLabel: 'Profil'      }} />
    </StudentTab.Navigator>
  );
}

// ── Landlord tabs ──────────────────────────────────────────────────────────────
const LandlordTab = createBottomTabNavigator<LandlordTabParamList>();

function LandlordTabs() {
  return (
    <LandlordTab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor:   '#E91E63',
        tabBarInactiveTintColor: '#00BCD4',
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
          <Text style={{ color, fontSize: 18 }}>{LANDLORD_ICONS[route.name]}</Text>
        ),
      })}
    >
      <LandlordTab.Screen name="MyListings"         component={MyListingsScreen}           options={{ tabBarLabel: 'İlanlarım'   }} />
      <LandlordTab.Screen name="InterestedStudents" component={InterestedStudentsScreen}  options={{ tabBarLabel: 'Öğrenciler'  }} />
      <LandlordTab.Screen name="ChatListTab"        component={ChatListScreen}            options={{ tabBarLabel: 'Mesajlar'    }} />
      <LandlordTab.Screen name="Notifications"      component={NotificationCenterScreen}  options={{ tabBarLabel: 'Bildirimler' }} />
      <LandlordTab.Screen name="LandlordProfile"    component={LandlordProfileScreen}     options={{ tabBarLabel: 'Profil'      }} />
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
  const { setToken, setUserType } = useAppStore();

  const [isReady,      setIsReady]      = useState(false);
  const [initialRoute, setInitialRoute] =
    useState<keyof RootStackParamList>('Auth');

  useEffect(() => {
    const bootstrap = async () => {
      try {
        registerForPushNotifications().catch(() => {});

        const token = await authService.getToken();
        if (token) {
          setToken(token);

          // user_type'ı storage'dan oku ve store'a yaz
          const storedType = await authService.getUserType();
          setUserType(storedType);

          // user_type'a göre başlangıç ekranını belirle
          setInitialRoute(storedType === 'landlord' ? 'LandlordTabs' : 'Onboarding');
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
  }, [setToken, setUserType]);

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
        <Stack.Screen name="MainTabs"     component={StudentTabs}  />
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
        <Stack.Screen name="Settings"         component={SettingsScreen} />
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
