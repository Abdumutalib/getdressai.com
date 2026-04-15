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

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { fetchGarmentBase64, getSampleGarment, postHybridVton } from '@/lib/hybrid-vton';

type GarmentType = 'upper' | 'lower' | 'dress';

export default function TryOnScreen() {
  const [personUri, setPersonUri] = useState<string | null>(null);
  const [garmentType, setGarmentType] = useState<GarmentType>('upper');
  const [loading, setLoading] = useState(false);
  const [resultB64, setResultB64] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const pickPerson = useCallback(async () => {
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) {
      Alert.alert('Permission', 'Photo library access is required.');
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
  }, []);

  const runTryOn = useCallback(async () => {
    if (!personUri) {
      Alert.alert('Try-on', 'Choose a photo of yourself first.');
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
      const garmentB64 = await fetchGarmentBase64(sample.url);
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
      Alert.alert('VTON', msg);
    } finally {
      setLoading(false);
    }
  }, [personUri, garmentType]);

  return (
    <ScrollView style={styles.scroll} contentContainerStyle={styles.content}>
      <ThemedView style={styles.header}>
        <ThemedText type="title">Virtual try-on</ThemedText>
        <ThemedText style={styles.hint}>
          Uses DressAI API POST /v1/hybrid-vton (set HYBRID_VTON_SERVICE_URL on the server to your GPU
          GetdressAI URL, e.g. http://IP:8787).
        </ThemedText>
      </ThemedView>

      <Pressable style={styles.btn} onPress={pickPerson}>
        <ThemedText type="defaultSemiBold">1. Choose your photo</ThemedText>
      </Pressable>

      {personUri ? (
        <Image source={{ uri: personUri }} style={styles.preview} contentFit="contain" />
      ) : null}

      <ThemedText style={styles.label}>2. Garment type (FASHN)</ThemedText>
      <View style={styles.row}>
        {(['upper', 'lower', 'dress'] as const).map((t) => (
          <Pressable
            key={t}
            onPress={() => setGarmentType(t)}
            style={[styles.chip, garmentType === t && styles.chipOn]}>
            <ThemedText style={garmentType === t ? styles.chipTextOn : undefined}>{t}</ThemedText>
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
          <ThemedText style={styles.btnPrimaryText}>3. Run hybrid try-on</ThemedText>
        )}
      </Pressable>

      {error ? (
        <ThemedText style={styles.err}>{error}</ThemedText>
      ) : null}

      {resultB64 ? (
        <ThemedView style={styles.resultBox}>
          <ThemedText type="subtitle">Result</ThemedText>
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
  hint: { opacity: 0.75, fontSize: 13 },
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
  resultImg: { width: '100%', height: 360, borderRadius: 12, backgroundColor: '#f5f5f5' },
});
