import * as SecureStore from 'expo-secure-store';

const API_KEY = 'rebrickable_api_key';
const CURRENCY_KEY = 'preferred_currency';

export async function saveApiKey(key: string): Promise<void> {
  await SecureStore.setItemAsync(API_KEY, key);
}

export async function loadApiKey(): Promise<string | null> {
  return SecureStore.getItemAsync(API_KEY);
}

export async function saveCurrency(currency: string): Promise<void> {
  await SecureStore.setItemAsync(CURRENCY_KEY, currency);
}

export async function loadCurrency(): Promise<string> {
  return (await SecureStore.getItemAsync(CURRENCY_KEY)) ?? 'USD';
}
