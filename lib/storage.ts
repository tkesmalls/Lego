import { Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';

const API_KEY = 'rebrickable_api_key';
const CURRENCY_KEY = 'preferred_currency';

async function getItem(key: string): Promise<string | null> {
  if (Platform.OS === 'web') {
    return localStorage.getItem(key);
  }
  return SecureStore.getItemAsync(key);
}

async function setItem(key: string, value: string): Promise<void> {
  if (Platform.OS === 'web') {
    localStorage.setItem(key, value);
    return;
  }
  await SecureStore.setItemAsync(key, value);
}

export async function saveApiKey(key: string): Promise<void> {
  await setItem(API_KEY, key);
}

export async function loadApiKey(): Promise<string | null> {
  return getItem(API_KEY);
}

export async function saveCurrency(currency: string): Promise<void> {
  await setItem(CURRENCY_KEY, currency);
}

export async function loadCurrency(): Promise<string> {
  return (await getItem(CURRENCY_KEY)) ?? 'USD';
}
