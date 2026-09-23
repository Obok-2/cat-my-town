import { Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';

const ACCESS_TOKEN_KEY = 'cat_my_town_access_token';

export const getAccessToken = async () => {
  if (Platform.OS === 'web') return globalThis.localStorage?.getItem(ACCESS_TOKEN_KEY) ?? null;
  return SecureStore.getItemAsync(ACCESS_TOKEN_KEY);
};

export const saveAccessToken = async (accessToken) => {
  if (Platform.OS === 'web') {
    globalThis.localStorage?.setItem(ACCESS_TOKEN_KEY, accessToken);
    return;
  }
  await SecureStore.setItemAsync(ACCESS_TOKEN_KEY, accessToken);
};

export const removeAccessToken = async () => {
  if (Platform.OS === 'web') {
    globalThis.localStorage?.removeItem(ACCESS_TOKEN_KEY);
    return;
  }
  await SecureStore.deleteItemAsync(ACCESS_TOKEN_KEY);
};

export const getAuthorizationHeaders = async () => {
  const accessToken = await getAccessToken();
  return accessToken ? { Authorization: `Bearer ${accessToken}` } : {};
};
