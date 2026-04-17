import { ScrollView, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';

const highlightCards = [
  {
    title: 'AI looks that feel wearable',
    body: 'Start from your occasion, preferred fit, and vibe. GetDressAI turns that into look ideas you can actually use.',
  },
  {
    title: 'Wardrobe-first guidance',
    body: 'Save what you like, compare ideas, and keep one product story across the mobile app and the website.',
  },
  {
    title: 'Premium when you need more',
    body: 'Free users can explore the core flow. Premium unlocks more generations, deeper try-on sessions, and richer styling help.',
  },
];

const quickSteps = [
  'Open Try-On to test one look with your own photo.',
  'Use Style Hub to review wardrobe, marketplace, and premium sections.',
  'Sign in to keep the same identity and product story across devices.',
];

export default function HomeScreen() {
  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <View style={styles.hero}>
        <ThemedText style={styles.kicker}>GetDressAI</ThemedText>
        <ThemedText type="title" style={styles.title}>
          One wardrobe story across web and mobile.
        </ThemedText>
        <ThemedText style={styles.subtitle}>
          Discover looks, preview try-on results, and move from inspiration to shopping without
          switching to a different product mindset.
        </ThemedText>

        <View style={styles.metricRow}>
          <View style={styles.metricCard}>
            <ThemedText style={styles.metricValue}>Try-On</ThemedText>
            <ThemedText style={styles.metricLabel}>Upload your photo and test an outfit.</ThemedText>
          </View>
          <View style={styles.metricCard}>
            <ThemedText style={styles.metricValue}>Wardrobe</ThemedText>
            <ThemedText style={styles.metricLabel}>Keep saved looks and repeatable style cues.</ThemedText>
          </View>
        </View>
      </View>

      <View style={styles.section}>
        <ThemedText type="subtitle" style={styles.sectionTitle}>
          Core product promise
        </ThemedText>
        {highlightCards.map((card) => (
          <View key={card.title} style={styles.card}>
            <ThemedText type="defaultSemiBold" style={styles.cardTitle}>
              {card.title}
            </ThemedText>
            <ThemedText style={styles.cardBody}>{card.body}</ThemedText>
          </View>
        ))}
      </View>

      <View style={styles.section}>
        <ThemedText type="subtitle" style={styles.sectionTitle}>
          How to use this app
        </ThemedText>
        {quickSteps.map((step) => (
          <View key={step} style={styles.stepRow}>
            <View style={styles.stepDot} />
            <ThemedText style={styles.stepText}>{step}</ThemedText>
          </View>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#f7f3ed',
  },
  content: {
    padding: 20,
    paddingBottom: 40,
    gap: 20,
  },
  hero: {
    borderRadius: 28,
    padding: 24,
    gap: 14,
    backgroundColor: '#efe5da',
  },
  kicker: {
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 1.2,
    textTransform: 'uppercase',
    color: '#7a4b2f',
  },
  title: {
    fontSize: 34,
    lineHeight: 38,
    color: '#1d140e',
  },
  subtitle: {
    fontSize: 16,
    lineHeight: 25,
    color: '#4b3c33',
  },
  metricRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  metricCard: {
    flex: 1,
    borderRadius: 20,
    padding: 16,
    backgroundColor: 'rgba(255,255,255,0.72)',
  },
  metricValue: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1d140e',
  },
  metricLabel: {
    marginTop: 6,
    fontSize: 13,
    lineHeight: 19,
    color: '#5b4b41',
  },
  section: {
    gap: 12,
  },
  sectionTitle: {
    color: '#20150f',
  },
  card: {
    backgroundColor: '#fffdfa',
    borderRadius: 20,
    padding: 18,
    borderWidth: 1,
    borderColor: '#eadfd2',
    gap: 8,
  },
  cardTitle: {
    color: '#20150f',
  },
  cardBody: {
    color: '#5b4b41',
  },
  stepRow: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'flex-start',
    paddingVertical: 4,
  },
  stepDot: {
    width: 10,
    height: 10,
    borderRadius: 999,
    backgroundColor: '#b86a3c',
    marginTop: 8,
  },
  stepText: {
    flex: 1,
    color: '#4b3c33',
  },
});
