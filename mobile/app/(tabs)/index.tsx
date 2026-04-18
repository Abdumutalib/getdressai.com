import { ScrollView, StyleSheet, View } from 'react-native';

import { LanguageBar } from '@/components/language-bar';
import { ThemedText } from '@/components/themed-text';
import { useLocale } from '@/contexts/locale';

export default function HomeScreen() {
  const { t } = useLocale();

  const highlightCards = [
    { title: t('homeCard1Title'), body: t('homeCard1Body') },
    { title: t('homeCard2Title'), body: t('homeCard2Body') },
    { title: t('homeCard3Title'), body: t('homeCard3Body') },
  ];

  const quickSteps = [t('homeStep1'), t('homeStep2'), t('homeStep3')];

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={styles.content}
      removeClippedSubviews
      showsVerticalScrollIndicator={false}>
      <LanguageBar />

      <View style={styles.hero}>
        <ThemedText style={styles.kicker}>{t('homeKicker')}</ThemedText>
        <ThemedText type="title" style={styles.title}>
          {t('homeTitle')}
        </ThemedText>
        <ThemedText style={styles.subtitle}>{t('homeSubtitle')}</ThemedText>

        <View style={styles.metricRow}>
          <View style={styles.metricCard}>
            <ThemedText style={styles.metricValue}>{t('homeMetricTryOnTitle')}</ThemedText>
            <ThemedText style={styles.metricLabel}>{t('homeMetricTryOnBody')}</ThemedText>
          </View>
          <View style={styles.metricCard}>
            <ThemedText style={styles.metricValue}>{t('homeMetricWardrobeTitle')}</ThemedText>
            <ThemedText style={styles.metricLabel}>{t('homeMetricWardrobeBody')}</ThemedText>
          </View>
        </View>
      </View>

      <View style={styles.section}>
        <ThemedText type="subtitle" style={styles.sectionTitle}>
          {t('homeSectionPromise')}
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
          {t('homeSectionHow')}
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
