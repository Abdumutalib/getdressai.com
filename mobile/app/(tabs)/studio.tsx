import DressAiLegacyApp from '@/components/dressai-legacy-app';

/**
 * Full DressAI flow (auth, image generation, PRO, referrals) — lives under expo-router
 * so one LocaleProvider in root layout covers the whole app.
 */
export default function StudioScreen() {
  return <DressAiLegacyApp />;
}
