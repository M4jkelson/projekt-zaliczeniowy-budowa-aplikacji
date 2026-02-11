import AsyncStorage from '@react-native-async-storage/async-storage';
import { FitRoute } from '../types/route';

const ROUTES_STORAGE_KEY = 'fitroute.routes';

export async function saveRoutesToStorage(routes: FitRoute[]): Promise<void> {
  await AsyncStorage.setItem(ROUTES_STORAGE_KEY, JSON.stringify(routes));
}

export async function loadRoutesFromStorage(): Promise<FitRoute[]> {
  const raw = await AsyncStorage.getItem(ROUTES_STORAGE_KEY);
  if (!raw) {
    return [];
  }

  try {
    return JSON.parse(raw) as FitRoute[];
  } catch {
    return [];
  }
}
