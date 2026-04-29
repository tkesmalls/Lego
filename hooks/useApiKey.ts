import { useState, useEffect, useCallback } from 'react';
import { loadApiKey, saveApiKey, loadCurrency, saveCurrency } from '../lib/storage';
import { setApiKey } from '../lib/api/rebrickable';

export function useApiKey() {
  const [apiKey, setLocalApiKey] = useState<string>('');
  const [currency, setCurrencyState] = useState<string>('USD');
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    (async () => {
      const [key, cur] = await Promise.all([loadApiKey(), loadCurrency()]);
      if (key) {
        setLocalApiKey(key);
        setApiKey(key);
      }
      setCurrencyState(cur);
      setLoaded(true);
    })();
  }, []);

  const updateApiKey = useCallback(async (key: string) => {
    await saveApiKey(key);
    setApiKey(key);
    setLocalApiKey(key);
  }, []);

  const updateCurrency = useCallback(async (cur: string) => {
    await saveCurrency(cur);
    setCurrencyState(cur);
  }, []);

  return { apiKey, currency, loaded, updateApiKey, updateCurrency };
}
