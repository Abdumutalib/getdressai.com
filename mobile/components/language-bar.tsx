import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { useLocale } from '@/contexts/locale';
import { LANG_OPTIONS } from '@/lib/mobile-i18n';

export function LanguageBar() {
  const { lang, setLang, t } = useLocale();

  return (
    <View style={styles.wrap}>
      <Text style={styles.label}>{t('langLabel')}</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.row}>
        {LANG_OPTIONS.map((o) => {
          const active = lang === o.id;
          return (
            <Pressable
              key={o.id}
              onPress={() => void setLang(o.id)}
              style={[styles.chip, active && styles.chipActive]}
              accessibilityRole="button"
              accessibilityState={{ selected: active }}>
              <Text style={[styles.chipText, active && styles.chipTextActive]}>{o.label}</Text>
            </Pressable>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { marginBottom: 16, gap: 8 },
  label: { fontSize: 12, fontWeight: '600', color: '#5b4b41' },
  row: { flexDirection: 'row', gap: 8, paddingVertical: 2 },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: '#d4c4b6',
    backgroundColor: '#fffdfa',
  },
  chipActive: {
    backgroundColor: '#20150f',
    borderColor: '#20150f',
  },
  chipText: { fontSize: 12, color: '#4b3c33' },
  chipTextActive: { color: '#fff8f1', fontWeight: '600' },
});
