import { createRef } from 'react';
import { NavigationContainerRef } from '@react-navigation/native';
import type { RootStackParamList } from '../../App';

export const navigationRef = createRef<NavigationContainerRef<RootStackParamList>>();

export function navigateTo(name: keyof RootStackParamList, params?: any) {
  if (navigationRef.current?.isReady()) {
    navigationRef.current.navigate(name as any, params);
  }
}
