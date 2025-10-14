import AsyncStorage from '@react-native-async-storage/async-storage';

const KEY = 'last_location_v1';

export type CachedLocation = {
  latitude: number;
  longitude: number;
  accuracy?: number | null;
  timestamp: number; // ms epoch
};

export async function saveLocationToCache(loc: Omit<CachedLocation, 'timestamp'>) {
  const payload: CachedLocation = { ...loc, timestamp: Date.now() };
  try {
    await AsyncStorage.setItem(KEY, JSON.stringify(payload));
  } catch {}
}

export async function getLocationFromCache(maxAgeMs: number): Promise<CachedLocation | null> {
  try {
    const raw = await AsyncStorage.getItem(KEY);
    if (!raw) return null;
    const parsed: CachedLocation = JSON.parse(raw);
    if (Date.now() - parsed.timestamp <= maxAgeMs) return parsed;
    return null;
  } catch {
    return null;
  }
}


