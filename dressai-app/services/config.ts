import Constants from 'expo-constants';

function readApiBaseUrl() {
  const extraApiBaseUrl = Constants.expoConfig?.extra?.apiBaseUrl;

  if (typeof extraApiBaseUrl === 'string' && extraApiBaseUrl.trim().length > 0) {
    return extraApiBaseUrl.trim();
  }

  if (typeof process.env.EXPO_PUBLIC_API_BASE_URL === 'string' && process.env.EXPO_PUBLIC_API_BASE_URL.trim().length > 0) {
    return process.env.EXPO_PUBLIC_API_BASE_URL.trim();
  }

  return 'http://localhost:3000';
}

export const appConfig = {
  apiBaseUrl: readApiBaseUrl(),
};