import { Link } from 'expo-router';
import { StyleSheet, View } from 'react-native';

import ParallaxScrollView from '@/components/parallax-scroll-view';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Fonts } from '@/constants/theme';

const studioModes = [
  {
    title: 'Quick try-on',
    body: 'Upload one look, get outfit swaps and styling direction in minutes.',
  },
  {
    title: 'Closet planning',
    body: 'Turn saved pieces into clean capsules for work, events, and travel.',
  },
  {
    title: 'Shop with intent',
    body: 'See what to buy next instead of endlessly scrolling products.',
  },
];

const proofPoints = [
  { value: '12+', label: 'shop drops curated' },
  { value: '3', label: 'styling flows in app' },
  { value: '1', label: 'single source of looks' },
];

export function HomeScreen() {
  return (
    <ParallaxScrollView
      headerBackgroundColor={{ light: '#f2e7dd', dark: '#271d19' }}
      headerImage={
        <View style={styles.heroArtwork}>
          <View style={styles.heroCircleLarge} />
          <View style={styles.heroCircleSmall} />
          <View style={styles.heroCard}>
            <ThemedText style={styles.heroCardEyebrow}>DRESSAI STUDIO</ThemedText>
            <ThemedText style={styles.heroCardText}>Build outfits before you buy them.</ThemedText>
          </View>
        </View>
      }>
      <ThemedView style={styles.heroBlock}>
        <ThemedText style={styles.eyebrow}>PERSONAL STYLE ENGINE</ThemedText>
        <ThemedText type="title" style={styles.heroTitle}>
          Your fashion feed should feel like a fitting room, not a catalog.
        </ThemedText>
        <ThemedText style={styles.heroBody}>
          DressAI turns inspiration, saved products, and your own wardrobe into guided outfits you can actually wear.
        </ThemedText>
      </ThemedView>

      <ThemedView style={styles.actionRow}>
        <Link href="/explore" style={styles.primaryAction}>
          <ThemedText style={styles.primaryActionText}>Open style flows</ThemedText>
        </Link>
        <Link href="/modal" style={styles.secondaryAction}>
          <ThemedText style={styles.secondaryActionText}>See launch checklist</ThemedText>
        </Link>
      </ThemedView>

      <ThemedView style={styles.metricsRow}>
        {proofPoints.map((item) => (
          <ThemedView key={item.label} style={styles.metricCard}>
            <ThemedText style={styles.metricValue}>{item.value}</ThemedText>
            <ThemedText style={styles.metricLabel}>{item.label}</ThemedText>
          </ThemedView>
        ))}
      </ThemedView>

      <ThemedView style={styles.sectionHeader}>
        <ThemedText type="subtitle" style={styles.sectionTitle}>
          What the mobile experience should do first
        </ThemedText>
        <ThemedText style={styles.sectionBody}>
          Make the user feel styled, directed, and one tap away from the next action.
        </ThemedText>
      </ThemedView>

      {studioModes.map((mode, index) => (
        <ThemedView key={mode.title} style={styles.modeCard}>
          <ThemedText style={styles.modeIndex}>0{index + 1}</ThemedText>
          <ThemedText type="subtitle" style={styles.modeTitle}>
            {mode.title}
          </ThemedText>
          <ThemedText style={styles.modeBody}>{mode.body}</ThemedText>
        </ThemedView>
      ))}
    </ParallaxScrollView>
  );
}

const styles = StyleSheet.create({
  heroArtwork: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  heroCircleLarge: {
    position: 'absolute',
    width: 210,
    height: 210,
    borderRadius: 999,
    backgroundColor: '#d39f72',
    opacity: 0.35,
    top: 28,
    right: 28,
  },
  heroCircleSmall: {
    position: 'absolute',
    width: 110,
    height: 110,
    borderRadius: 999,
    backgroundColor: '#5e6d63',
    opacity: 0.25,
    bottom: 36,
    left: 36,
  },
  heroCard: {
    width: 220,
    padding: 18,
    borderRadius: 24,
    backgroundColor: 'rgba(20, 18, 17, 0.78)',
    gap: 10,
  },
  heroCardEyebrow: {
    color: '#f3dfcd',
    fontSize: 11,
    letterSpacing: 1.6,
    fontWeight: '700',
  },
  heroCardText: {
    color: '#fff7ef',
    fontSize: 20,
    lineHeight: 28,
    fontFamily: Fonts.serif,
  },
  heroBlock: {
    gap: 14,
  },
  eyebrow: {
    color: '#b16f43',
    fontSize: 12,
    letterSpacing: 1.8,
    fontWeight: '700',
  },
  heroTitle: {
    fontFamily: Fonts.serif,
    fontSize: 34,
    lineHeight: 40,
  },
  heroBody: {
    fontSize: 17,
    lineHeight: 26,
    color: '#5f5752',
  },
  actionRow: {
    flexDirection: 'row',
    gap: 12,
    flexWrap: 'wrap',
  },
  primaryAction: {
    backgroundColor: '#111111',
    borderRadius: 999,
    paddingHorizontal: 18,
    paddingVertical: 14,
  },
  primaryActionText: {
    color: '#fff7ef',
    fontWeight: '700',
  },
  secondaryAction: {
    borderWidth: 1,
    borderColor: '#d7c3b3',
    borderRadius: 999,
    paddingHorizontal: 18,
    paddingVertical: 14,
  },
  secondaryActionText: {
    color: '#3b312b',
    fontWeight: '600',
  },
  metricsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  metricCard: {
    minWidth: 92,
    flex: 1,
    padding: 16,
    borderRadius: 20,
    backgroundColor: '#f6eee7',
    gap: 4,
  },
  metricValue: {
    fontSize: 24,
    lineHeight: 30,
    fontWeight: '800',
    color: '#2b221d',
  },
  metricLabel: {
    color: '#6c6159',
    fontSize: 13,
    lineHeight: 18,
  },
  sectionHeader: {
    gap: 8,
    marginTop: 4,
  },
  sectionTitle: {
    fontFamily: Fonts.rounded,
  },
  sectionBody: {
    color: '#5f5752',
  },
  modeCard: {
    padding: 20,
    borderRadius: 24,
    backgroundColor: '#161311',
    gap: 10,
  },
  modeIndex: {
    color: '#d4a37a',
    fontSize: 12,
    letterSpacing: 1.4,
    fontWeight: '700',
  },
  modeTitle: {
    color: '#fff7ef',
    fontFamily: Fonts.rounded,
  },
  modeBody: {
    color: '#dbcabf',
    lineHeight: 24,
  },
});