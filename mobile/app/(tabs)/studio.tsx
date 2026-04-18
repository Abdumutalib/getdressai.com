import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';

import { LanguageBar } from '@/components/language-bar';
import { ThemedText } from '@/components/themed-text';
import { useLocale } from '@/contexts/locale';
import { createAuthedHeaders, getAppOrigin } from '@/lib/mobile-api';

type StoredGeneration = {
  id: string;
  mode: 'photo' | 'mannequin';
  preset: string;
  resultUrl: string;
};

export default function StudioScreen() {
  const { t } = useLocale();
  const router = useRouter();
  const [items, setItems] = useState<StoredGeneration[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    async function loadHistory() {
      try {
        const headers = await createAuthedHeaders();
        const response = await fetch(`${getAppOrigin()}/api/generate`, {
          method: 'GET',
          headers,
        });
        const data = await response.json();

        if (!active || !response.ok || !Array.isArray(data.items)) {
          return;
        }

        setItems(data.items.slice(0, 3));
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    void loadHistory();
    return () => {
      active = false;
    };
  }, []);

  const creditCount = loading ? '--' : String(Math.max(items.length * 7, 12));

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={styles.content}
      removeClippedSubviews
      showsVerticalScrollIndicator={false}>
      <LanguageBar />

      <View style={styles.hero}>
        <View style={styles.heroText}>
          <ThemedText style={styles.kicker}>{t('studioKicker')}</ThemedText>
          <ThemedText type="title" style={styles.title}>
            {t('studioTitle')}
          </ThemedText>
          <ThemedText style={styles.subtitle}>{t('studioSubtitle')}</ThemedText>
        </View>

        <View style={styles.creditCard}>
          <ThemedText style={styles.creditLabel}>{t('studioCreditsLabel')}</ThemedText>
          <ThemedText style={styles.creditValue}>{creditCount}</ThemedText>
          <ThemedText style={styles.creditNote}>{t('studioCreditsNote')}</ThemedText>
        </View>
      </View>

      <View style={styles.ctaRow}>
        <Pressable style={styles.primaryButton} onPress={() => router.push('/(tabs)/try-on')}>
          <ThemedText style={styles.primaryText}>{t('studioOpenTryOn')}</ThemedText>
        </Pressable>
        <Pressable style={styles.secondaryButton} onPress={() => router.push('/(tabs)/explore')}>
          <ThemedText style={styles.secondaryText}>{t('studioOpenStyleHub')}</ThemedText>
        </Pressable>
      </View>

      <View style={styles.section}>
        <ThemedText type="subtitle" style={styles.sectionTitle}>
          {t('studioRecentTitle')}
        </ThemedText>
        <ThemedText style={styles.sectionNote}>{t('studioSavedLooksNote')}</ThemedText>

        {items.length ? (
          items.map((item) => (
            <View key={item.id} style={styles.resultCard}>
              <Image source={{ uri: item.resultUrl }} style={styles.resultImage} contentFit="cover" />
              <View style={styles.resultContent}>
                <ThemedText type="defaultSemiBold" style={styles.resultTitle}>
                  {item.preset}
                </ThemedText>
                <ThemedText style={styles.resultMeta}>
                  {item.mode === 'photo' ? t('studioSavedFromPhoto') : t('studioSavedFromMannequin')}
                </ThemedText>
              </View>
            </View>
          ))
        ) : (
          <View style={styles.emptyCard}>
            <ThemedText style={styles.emptyText}>{t('studioRecentEmpty')}</ThemedText>
          </View>
        )}
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
    gap: 18,
  },
  hero: {
    gap: 14,
  },
  heroText: {
    borderRadius: 28,
    padding: 22,
    backgroundColor: '#20150f',
    gap: 10,
  },
  kicker: {
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 1.1,
    textTransform: 'uppercase',
    color: '#f3c9ab',
  },
  title: {
    fontSize: 32,
    lineHeight: 36,
    color: '#fff8f1',
  },
  subtitle: {
    color: '#e4d4c7',
    lineHeight: 24,
  },
  creditCard: {
    borderRadius: 24,
    padding: 18,
    backgroundColor: '#efe5da',
    gap: 6,
  },
  creditLabel: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 1,
    textTransform: 'uppercase',
    color: '#7a4b2f',
  },
  creditValue: {
    fontSize: 30,
    fontWeight: '800',
    color: '#20150f',
  },
  creditNote: {
    color: '#5b4b41',
  },
  ctaRow: {
    flexDirection: 'row',
    gap: 12,
  },
  primaryButton: {
    flex: 1,
    borderRadius: 18,
    paddingVertical: 15,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#4F46E5',
  },
  primaryText: {
    color: '#ffffff',
    fontWeight: '700',
  },
  secondaryButton: {
    flex: 1,
    borderRadius: 18,
    paddingVertical: 15,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#EEF2FF',
  },
  secondaryText: {
    color: '#312E81',
    fontWeight: '700',
  },
  section: {
    gap: 12,
  },
  sectionTitle: {
    color: '#20150f',
  },
  sectionNote: {
    color: '#5b4b41',
  },
  resultCard: {
    flexDirection: 'row',
    gap: 12,
    padding: 14,
    borderRadius: 22,
    backgroundColor: '#fffdfa',
    borderWidth: 1,
    borderColor: '#eadfd2',
  },
  resultImage: {
    width: 96,
    height: 120,
    borderRadius: 18,
    backgroundColor: '#E5E7EB',
  },
  resultContent: {
    flex: 1,
    justifyContent: 'center',
    gap: 6,
  },
  resultTitle: {
    color: '#20150f',
  },
  resultMeta: {
    color: '#5b4b41',
  },
  emptyCard: {
    borderRadius: 22,
    padding: 18,
    backgroundColor: '#fffdfa',
    borderWidth: 1,
    borderColor: '#eadfd2',
  },
  emptyText: {
    color: '#5b4b41',
  },
});
