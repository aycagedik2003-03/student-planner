import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { storage } from './storage';
import { useAppStore, DEFAULT_FILTERS } from '../store';
import { navigationRef } from './navigationRef';

const SESSION_KEYS = [
  'userToken',
  'refreshToken',
  'userId',
  'userType',
  'tokenExpiresAt',
];

export const hardReset = async (): Promise<void> => {
  try {
    console.log('[HardReset] Starting emergency reset…');

    // 1. Clear session storage keys (web: localStorage, native: SecureStore)
    await Promise.all(SESSION_KEYS.map(k => storage.deleteItem(k)));

    // 2. Clear AsyncStorage (language pref + any mock data)
    try {
      const keys = await AsyncStorage.getAllKeys();
      if (keys.length > 0) await AsyncStorage.multiRemove([...keys]);
      console.log('[HardReset] AsyncStorage cleared');
    } catch (err) {
      console.warn('[HardReset] AsyncStorage clear failed:', err);
    }

    // 3. Web: also wipe sessionStorage
    if (Platform.OS === 'web') {
      try { sessionStorage.clear(); } catch {}
    }

    // 4. Reset Zustand store state
    const store = useAppStore.getState();
    store.clearUser();
    useAppStore.setState({
      matches:        [],
      activeMatches:  [],
      filteredMatches: null,
      messages:       {},
      quizAnswers:    [],
      quizCity:       null,
      filters:        { ...DEFAULT_FILTERS },
    });

    console.log('[HardReset] Store cleared');

    // 5. Navigate to Auth screen
    if (navigationRef.current?.isReady()) {
      navigationRef.current.reset({ index: 0, routes: [{ name: 'Auth' }] });
      console.log('[HardReset] Navigated to Auth');
    } else if (Platform.OS === 'web') {
      // Fallback: full page reload (nav ref not ready)
      window.location.href = window.location.origin;
    }

    console.log('[HardReset] Done.');
  } catch (err) {
    console.error('[HardReset] Error:', err);
    // Last resort: hard reload
    if (Platform.OS === 'web') {
      try { window.location.reload(); } catch {}
    }
  }
};
