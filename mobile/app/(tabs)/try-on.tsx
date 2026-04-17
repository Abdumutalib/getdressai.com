import { readAsStringAsync, EncodingType } from 'expo-file-system';
import * as ImagePicker from 'expo-image-picker';
import { Image } from 'expo-image';
import { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';

import { LanguageBar } from '@/components/language-bar';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useLocale } from '@/contexts/locale';
import { fetchGarmentBase64, getSampleGarment, postHybridVton } from '@/lib/hybrid-vton';

type GarmentType = 'upper' | 'lower' | 'dress';

const GARMENT_ORDER: GarmentType[] = ['upper', 'lower', 'dress'];

function garmentLabel(t: (k: string) => string, type: GarmentType) {
  if (type === 'upper') return t('tryonGarmentUpper');
  if (type === 'lower') return t('tryonGarmentLower');
  return t('tryonGarmentDress');
}

export default function TryOnScreen() {
  const { t } = useLocale();
  const [personUri, setPersonUri] = useState<string | null>(null);
  const [garmentType, setGarmentType] = useState<GarmentType>('upper');
  const [loading, setLoading] = useState(false);
  const [resultB64, setResultB64] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const pickPerson = useCallback(async () => {
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) {
      Alert.alert(t('alertPermTitle'), t('alertPermBody'));
      return;
    }
    const res = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      quality: 0.9,
    });
    if (res.canceled || !res.assets[0]) return;
    setPersonUri(res.assets[0].uri);
    setResultB64(null);
    setError(null);
  }, [t]);

  const runTryOn = useCallback(async () => {
    if (!personUri) {
      Alert.alert(t('alertTryonTitle'), t('alertTryonNeedPhoto'));
      return;
    }
    setLoading(true);
    setError(null);
    setResultB64(null);
    try {
      const personB64 = await readAsStringAsync(personUri, {
        encoding: EncodingType.Base64,
      });
      const sample = getSampleGarment();
      const garmentBase64 = await fetchGarmentBase64(sample.url);
      const type = garmentType;
      const out = await postHybridVton({
        personBase64: personB64,
        garmentBase64,
        garmentType: type,
      });
      if (out.resultImage) setResultB64(out.resultImage);
      else throw new Error('No result image');
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : String(e);
      setError(msg);
      Alert.alert(t('alertVtonTitle'), msg);
    } finally {
      setLoading(false);
    }
  }, [personUri, garmentType, t]);

  return (
    <ScrollView style={styles.scroll} contentContainerStyle={styles.content}>
      <LanguageBar />

      <ThemedView style={styles.header}>
        <ThemedText style={styles.kicker}>{t('tryonKicker')}</ThemedText>
        <ThemedText type="title">{t('tryonTitle')}</ThemedText>
        <ThemedText style={styles.hint}>{t('tryonHint')}</ThemedText>
      </ThemedView>

      <Pressable style={styles.btn} onPress={pickPerson}>
        <ThemedText type="defaultSemiBold">{t('tryonStep1')}</ThemedText>
      </Pressable>

      {personUri ? (
        <Image source={{ uri: personUri }} style={styles.preview} contentFit="contain" />
      ) : null}

      <ThemedText style={styles.label}>{t('tryonStep2')}</ThemedText>
      <View style={styles.row}>
        {GARMENT_ORDER.map((gt) => (
          <Pressable
            key={gt}
            onPress={() => setGarmentType(gt)}
            style={[styles.chip, garmentType === gt && styles.chipOn]}>
            <ThemedText style={garmentType === gt ? styles.chipTextOn : undefined}>
              {garmentLabel(t, gt)}
            </ThemedText>
          </Pressable>
        ))}
      </View>

      <Pressable
        style={[styles.btn, styles.btnPrimary, loading && styles.btnDisabled]}
        onPress={runTryOn}
        disabled={loading || !personUri}>
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <ThemedText style={styles.btnPrimaryText}>{t('tryonStep3')}</ThemedText>
        )}
      </Pressable>

      {error ? <ThemedText style={styles.err}>{error}</ThemedText> : null}

      {resultB64 ? (
        <ThemedView style={styles.resultBox}>
          <ThemedText type="subtitle">{t('tryonResultTitle')}</ThemedText>
          <ThemedText style={styles.resultHint}>{t('tryonResultHint')}</ThemedText>
          <Image
            source={{ uri: `data:image/png;base64,${resultB64}` }}
            style={styles.resultImg}
            contentFit="contain"
          />
        </ThemedView>
      ) : null}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: { flex: 1 },
  content: { padding: 16, paddingBottom: 48 },
  header: { marginBottom: 16, gap: 8 },
  kicker: {
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 1,
    textTransform: 'uppercase',
    color: '#7a4b2f',
  },
  hint: { opacity: 0.75, fontSize: 13, lineHeight: 19 },
  btn: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 12,
    padding: 14,
    alignItems: 'center',
    marginBottom: 12,
  },
  btnPrimary: { backgroundColor: '#171717', borderColor: '#171717' },
  btnDisabled: { opacity: 0.6 },
  btnPrimaryText: { color: '#fff' },
  preview: { width: '100%', height: 220, borderRadius: 12, marginBottom: 12, backgroundColor: '#eee' },
  label: { marginTop: 8, marginBottom: 8, fontWeight: '600' },
  row: { flexDirection: 'row', gap: 8, flexWrap: 'wrap', marginBottom: 16 },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#ccc',
  },
  chipOn: { backgroundColor: '#171717', borderColor: '#171717' },
  chipTextOn: { color: '#fff' },
  err: { color: '#b91c1c', marginTop: 8 },
  resultBox: { marginTop: 16, gap: 8 },
  resultHint: { opacity: 0.75, fontSize: 13, lineHeight: 19 },
  resultImg: { width: '100%', height: 360, borderRadius: 12, backgroundColor: '#f5f5f5' },
});
