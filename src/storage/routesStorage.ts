import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';
import { FitRoute } from '../types/route';

const ROUTES_STORAGE_KEY = 'fitroute.routes';

export async function saveRoutesToStorage(routes: FitRoute[]): Promise<void> {
  const serialized = JSON.stringify(routes);

  if (Platform.OS === 'web' && typeof window !== 'undefined' && window.localStorage) {
    window.localStorage.setItem(ROUTES_STORAGE_KEY, serialized);
    return;
  }

  await AsyncStorage.setItem(ROUTES_STORAGE_KEY, serialized);
}

export async function loadRoutesFromStorage(): Promise<FitRoute[]> {
  let raw: string | null = null;

  if (Platform.OS === 'web' && typeof window !== 'undefined' && window.localStorage) {
    raw = window.localStorage.getItem(ROUTES_STORAGE_KEY);
  } else {
    raw = await AsyncStorage.getItem(ROUTES_STORAGE_KEY);
  }

  if (!raw) {
    return [];
  }

  try {
    return JSON.parse(raw) as FitRoute[];
  } catch {
    return [];
  }
}
