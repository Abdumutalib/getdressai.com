import { StyleSheet } from 'react-native';

import { ExternalLink } from '@/components/external-link';
import ParallaxScrollView from '@/components/parallax-scroll-view';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Fonts } from '@/constants/theme';
import { appConfig } from '@/services/config';

const workflows = [
  {
    title: 'Generate looks from intent',
    body: 'Start from context like office, dinner, weekend, or vacation and let styling logic narrow the options.',
  },
  {
    title: 'Pair products with owned pieces',
    body: 'The strongest shopping flow is not discovery alone. It is compatibility with what the user already has.',
  },
  {
    title: 'Move from inspiration to action',
    body: 'Every screen should point toward edit, save, buy, or re-style so the session never stalls.',
  },
];

const launchChecks = [
  'Backend API wired through Expo config',
  'Mobile UI upgraded from starter template',
  'Next step: connect auth, upload, and result flows',
];

export function ExploreScreen() {
  return (
    <ParallaxScrollView
      headerBackgroundColor={{ light: '#d8ddd7', dark: '#1f2521' }}
      headerImage={
        <IconSymbol
          size={250}
          color="#59655d"
          name="chevron.left.forwardslash.chevron.right"
          style={styles.headerImage}
        />
      }>
      <ThemedView style={styles.titleContainer}>
        <ThemedText type="title" style={styles.title}>
          Mobile product direction
        </ThemedText>
        <ThemedText style={styles.subtitle}>
          The app should feel like a stylist in your pocket, not an Expo demo with renamed tabs.
        </ThemedText>
      </ThemedView>

      <ThemedView style={styles.apiCard}>
        <ThemedText style={styles.apiEyebrow}>CONNECTED BACKEND</ThemedText>
        <ThemedText type="subtitle" style={styles.apiValue}>
          {appConfig.apiBaseUrl}
        </ThemedText>
      </ThemedView>

      {workflows.map((workflow) => (
        <ThemedView key={workflow.title} style={styles.workflowCard}>
          <ThemedText type="subtitle" style={styles.workflowTitle}>
            {workflow.title}
          </ThemedText>
          <ThemedText style={styles.workflowBody}>{workflow.body}</ThemedText>
        </ThemedView>
      ))}

      <ThemedView style={styles.checklistCard}>
        <ThemedText type="subtitle" style={styles.checklistTitle}>
          Current launch checklist
        </ThemedText>
        {launchChecks.map((item) => (
          <ThemedText key={item} style={styles.checklistItem}>
            • {item}
          </ThemedText>
        ))}
      </ThemedView>

      <ExternalLink href="https://getdressed.ai/" style={styles.referenceLink}>
        <ThemedText type="link">Reference benchmark: getdressed.ai</ThemedText>
      </ExternalLink>
    </ParallaxScrollView>
  );
}

const styles = StyleSheet.create({
  headerImage: {
    bottom: -60,
    left: -10,
    position: 'absolute',
  },
  titleContainer: {
    gap: 10,
  },
  title: {
    fontFamily: Fonts.serif,
    fontSize: 34,
    lineHeight: 40,
  },
  subtitle: {
    color: '#5f6661',
    lineHeight: 25,
  },
  apiCard: {
    padding: 18,
    borderRadius: 22,
    backgroundColor: '#eef2ee',
    gap: 8,
  },
  apiEyebrow: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 1.6,
    color: '#556259',
  },
  apiValue: {
    color: '#18201b',
    fontFamily: Fonts.rounded,
  },
  workflowCard: {
    padding: 20,
    borderRadius: 24,
    backgroundColor: '#162019',
    gap: 10,
  },
  workflowTitle: {
    color: '#f4f7f4',
    fontFamily: Fonts.rounded,
  },
  workflowBody: {
    color: '#cfd8d1',
    lineHeight: 24,
  },
  checklistCard: {
    padding: 20,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: '#cfd7d1',
    gap: 10,
  },
  checklistTitle: {
    fontFamily: Fonts.rounded,
  },
  checklistItem: {
    color: '#48514b',
  },
  referenceLink: {
    paddingVertical: 4,
  },
});