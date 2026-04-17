import { ScrollView, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';

const sections = [
  {
    title: 'Wardrobe',
    body: 'Save strong looks, remember fit notes, and keep your personal style history in one place.',
  },
  {
    title: 'Marketplace',
    body: 'Move from inspiration to product discovery with a shopping-oriented flow similar to the website.',
  },
  {
    title: 'Premium',
    body: 'Use premium when you want more generations, longer sessions, and deeper styling support.',
  },
  {
    title: 'Profile',
    body: 'Keep one identity, one plan, and one product promise across mobile and web.',
  },
];

export default function StyleHubScreen() {
  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <View style={styles.hero}>
        <ThemedText style={styles.kicker}>Style Hub</ThemedText>
        <ThemedText type="title" style={styles.title}>
          The same product language as the website.
        </ThemedText>
        <ThemedText style={styles.subtitle}>
          This tab mirrors the web experience: wardrobe, marketplace, premium, and profile all live
          inside one clear fashion workflow.
        </ThemedText>
      </View>

      {sections.map((section) => (
        <View key={section.title} style={styles.card}>
          <ThemedText type="subtitle" style={styles.cardTitle}>
            {section.title}
          </ThemedText>
          <ThemedText style={styles.cardBody}>{section.body}</ThemedText>
        </View>
      ))}

      <View style={styles.noteBox}>
        <ThemedText type="defaultSemiBold" style={styles.noteTitle}>
          Alignment note
        </ThemedText>
        <ThemedText style={styles.noteBody}>
          The biggest remaining gap is technical, not visual: the website signs in with Supabase,
          while the older mobile flow still talks to the API auth endpoints. The product story is now
          much closer, but auth should be unified next.
        </ThemedText>
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
});
