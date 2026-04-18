import { ScrollView, StyleSheet, View } from 'react-native';

import { LanguageBar } from '@/components/language-bar';
import { ThemedText } from '@/components/themed-text';
import { useLocale } from '@/contexts/locale';

export default function StyleHubScreen() {
  const { t } = useLocale();
  const presets = [
    t('presetLuxury'),
    t('presetStreetwear'),
    t('presetWedding'),
    t('presetOffice'),
    t('presetGym'),
    t('presetAnime'),
    t('presetCelebrity'),
    t('presetCasual'),
  ];

  const sections = [
    { title: t('exploreWardrobeTitle'), body: t('exploreWardrobeBody') },
    { title: t('exploreMarketplaceTitle'), body: t('exploreMarketplaceBody') },
    { title: t('explorePremiumTitle'), body: t('explorePremiumBody') },
    { title: t('exploreProfileTitle'), body: t('exploreProfileBody') },
  ];

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <LanguageBar />

      <View style={styles.hero}>
        <ThemedText style={styles.kicker}>{t('exploreKicker')}</ThemedText>
        <ThemedText type="title" style={styles.title}>
          {t('exploreTitle')}
        </ThemedText>
        <ThemedText style={styles.subtitle}>{t('exploreSubtitle')}</ThemedText>
      </View>

      {sections.map((section) => (
        <View key={section.title} style={styles.card}>
          <ThemedText type="subtitle" style={styles.cardTitle}>
            {section.title}
          </ThemedText>
          <ThemedText style={styles.cardBody}>{section.body}</ThemedText>
        </View>
      ))}

      <View style={styles.workflowBox}>
        <ThemedText style={styles.workflowEyebrow}>{t('exploreWorkflowEyebrow')}</ThemedText>
        <ThemedText type="subtitle" style={styles.workflowTitle}>
          {t('exploreWorkflowCopy')}
        </ThemedText>
      </View>

      <View style={styles.stylesBox}>
        <ThemedText type="defaultSemiBold" style={styles.noteTitle}>
          {t('explorePopularStylesTitle')}
        </ThemedText>
        <ThemedText style={styles.noteBody}>{t('explorePopularStylesBody')}</ThemedText>
        <View style={styles.chipRow}>
          {presets.map((preset) => (
            <View key={preset} style={styles.chip}>
              <ThemedText style={styles.chipText}>{preset}</ThemedText>
            </View>
          ))}
        </View>
      </View>

      <View style={styles.noteBox}>
        <ThemedText type="defaultSemiBold" style={styles.noteTitle}>
          {t('exploreNoteTitle')}
        </ThemedText>
        <ThemedText style={styles.noteBody}>{t('exploreNoteBody')}</ThemedText>
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
    gap: 14,
  },
  hero: {
    borderRadius: 28,
    padding: 22,
    backgroundColor: '#20150f',
    gap: 12,
  },
  kicker: {
    fontSize: 13,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1.1,
    color: '#f3c9ab',
  },
  title: {
    fontSize: 31,
    lineHeight: 35,
    color: '#fff8f1',
  },
  subtitle: {
    color: '#e4d4c7',
    lineHeight: 24,
  },
  card: {
    borderRadius: 22,
    padding: 18,
    backgroundColor: '#fffdfa',
    borderWidth: 1,
    borderColor: '#eadfd2',
    gap: 8,
  },
  cardTitle: {
    color: '#20150f',
  },
  cardBody: {
    color: '#59483d',
  },
  noteBox: {
    marginTop: 6,
    borderRadius: 22,
    padding: 18,
    backgroundColor: '#efe4d7',
    gap: 8,
  },
  noteTitle: {
    color: '#6b3f25',
  },
  noteBody: {
    color: '#5b4639',
  },
  workflowBox: {
    borderRadius: 22,
    padding: 18,
    backgroundColor: '#20150f',
    gap: 8,
  },
  workflowEyebrow: {
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1,
    color: '#f3c9ab',
  },
  workflowTitle: {
    color: '#fff8f1',
  },
  stylesBox: {
    borderRadius: 22,
    padding: 18,
    backgroundColor: '#fffdfa',
    borderWidth: 1,
    borderColor: '#eadfd2',
    gap: 10,
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: '#f3eadf',
  },
  chipText: {
    color: '#5b4639',
    fontSize: 12,
    fontWeight: '600',
  },
});
