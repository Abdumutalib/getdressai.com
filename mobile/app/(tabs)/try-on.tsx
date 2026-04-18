import * as ImagePicker from 'expo-image-picker';
import { Image } from 'expo-image';
import * as Linking from 'expo-linking';
import { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  TextInput,
  View,
} from 'react-native';

import { LanguageBar } from '@/components/language-bar';
import { ThemedText } from '@/components/themed-text';
import { useLocale } from '@/contexts/locale';
import { createAuthedHeaders, getAppOrigin } from '@/lib/mobile-api';

type MeasurementKey = 'height' | 'chest' | 'waist' | 'hips' | 'inseam';

type Recommendation = {
  id: string;
  title: string;
  marketplace: string;
  price: number;
  currency: string;
  image: string;
  affiliateUrl: string;
  totalFitScore: number;
  recommendedSize: string;
};

const DEFAULT_MEASUREMENTS: Record<MeasurementKey, string> = {
  height: '170',
  chest: '92',
  waist: '74',
  hips: '98',
  inseam: '78',
};

export default function TryOnScreen() {
  const { t } = useLocale();
  const presetLabels = useMemo(
    () => [
      t('presetLuxury'),
      t('presetStreetwear'),
      t('presetWedding'),
      t('presetOffice'),
      t('presetGym'),
      t('presetAnime'),
      t('presetCelebrity'),
      t('presetCasual'),
    ],
    [t],
  );
  const [selectedPreset, setSelectedPreset] = useState(presetLabels[0] || 'Luxury');
  const [photo, setPhoto] = useState<{ uri: string; mimeType?: string; fileName?: string } | null>(null);
  const [measurements, setMeasurements] = useState(DEFAULT_MEASUREMENTS);
  const [clothingRequest, setClothingRequest] = useState('');
  const [loading, setLoading] = useState(false);
  const [recommending, setRecommending] = useState(false);
  const [resultImage, setResultImage] = useState<string | null>(null);
  const [recommendedSize, setRecommendedSize] = useState('');
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);

  useEffect(() => {
    if (!presetLabels.includes(selectedPreset)) {
      setSelectedPreset(presetLabels[0] || 'Luxury');
    }
  }, [presetLabels, selectedPreset]);

  async function pickPhoto() {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert(t('alertPermTitle'), t('alertPermBody'));
      return;
    }

    const response = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      quality: 0.9,
    });

    if (response.canceled || !response.assets[0]) {
      return;
    }

    const asset = response.assets[0];
    setPhoto({
      uri: asset.uri,
      mimeType: asset.mimeType || 'image/jpeg',
      fileName: asset.fileName || 'mobile-upload.jpg',
    });
    setResultImage(null);
    setRecommendations([]);
    setRecommendedSize('');
  }

  async function handleGenerate() {
    if (!photo) {
      Alert.alert(t('alertTryonTitle'), t('alertTryonNeedPhoto'));
      return;
    }

    setLoading(true);

    try {
      const formData = new FormData();
      const requestText = clothingRequest.trim() || selectedPreset;

      formData.append('mode', 'photo');
      formData.append('gender', 'female');
      formData.append('prompt', `${selectedPreset}. ${requestText}`);
      formData.append('preset', selectedPreset);
      formData.append('clothingRequest', requestText);
      formData.append(
        'measurements',
        JSON.stringify(Object.fromEntries(Object.entries(measurements).map(([key, value]) => [key, Number(value)]))),
      );
      formData.append('file', {
        uri: photo.uri,
        name: photo.fileName || 'mobile-upload.jpg',
        type: photo.mimeType || 'image/jpeg',
      } as never);

      const headers = await createAuthedHeaders();
      const response = await fetch(`${getAppOrigin()}/api/generate`, {
        method: 'POST',
        headers,
        body: formData,
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.error || 'Could not generate result.');
      }

      setResultImage(data.resultUrl || null);

      if (data.sourceImagePath) {
        await handleRecommend(data.sourceImagePath);
      }
    } catch (error) {
      Alert.alert(t('alertVtonTitle'), error instanceof Error ? error.message : 'Something went wrong.');
    } finally {
      setLoading(false);
    }
  }

  async function handleRecommend(sourceImagePath?: string) {
    if (!photo && !sourceImagePath) {
      return;
    }

    setRecommending(true);

    try {
      const headers = await createAuthedHeaders({ 'Content-Type': 'application/json' });
      const requestText = clothingRequest.trim() || selectedPreset;
      const response = await fetch(`${getAppOrigin()}/api/recommend-products`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          prompt: `${selectedPreset}. ${requestText}`,
          preset: selectedPreset,
          clothingRequest: requestText,
          gender: 'female',
          sourceImagePath,
          measurements: Object.fromEntries(Object.entries(measurements).map(([key, value]) => [key, Number(value)])),
        }),
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.error || 'Could not load recommendations.');
      }

      setRecommendedSize(data.recommendedSize || '');
      setRecommendations(Array.isArray(data.products) ? data.products : []);
    } catch (error) {
      Alert.alert(t('alertVtonTitle'), error instanceof Error ? error.message : 'Something went wrong.');
    } finally {
      setRecommending(false);
    }
  }

  const measurementFields: Array<{ key: MeasurementKey; label: string }> = [
    { key: 'height', label: t('tryonHeight') },
    { key: 'chest', label: t('tryonChest') },
    { key: 'waist', label: t('tryonWaist') },
    { key: 'hips', label: t('tryonHips') },
    { key: 'inseam', label: t('tryonInseam') },
  ];

  return (
    <ScrollView style={styles.scroll} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      <LanguageBar />

      <View style={styles.hero}>
        <ThemedText type="defaultSemiBold">{t('tryonKicker')}</ThemedText>
        <ThemedText type="title">{t('tryonTitle')}</ThemedText>
        <ThemedText>{t('tryonHint')}</ThemedText>
      </View>

      <View style={styles.section}>
        <ThemedText type="subtitle">{t('tryonStep1')}</ThemedText>
        <Pressable style={styles.primaryButton} onPress={pickPhoto}>
          <ThemedText style={styles.primaryButtonText}>{t('tryonPhotoButton')}</ThemedText>
        </Pressable>
        {photo ? <Image source={{ uri: photo.uri }} style={styles.preview} contentFit="cover" /> : null}
      </View>

      <View style={styles.section}>
        <ThemedText type="subtitle">{t('tryonMeasurementsTitle')}</ThemedText>
        <ThemedText>{t('tryonMeasurementsBody')}</ThemedText>
        <View style={styles.measurementGrid}>
          {measurementFields.map((field) => (
            <View key={field.key} style={styles.measurementCard}>
              <ThemedText type="defaultSemiBold">{field.label}</ThemedText>
              <View style={styles.measurementInputRow}>
                <TextInput
                  value={measurements[field.key]}
                  onChangeText={(value) => setMeasurements((current) => ({ ...current, [field.key]: value }))}
                  keyboardType="number-pad"
                  style={styles.measurementInput}
                />
                <ThemedText>{t('tryonUnit')}</ThemedText>
              </View>
            </View>
          ))}
        </View>
      </View>

      <View style={styles.section}>
        <ThemedText type="subtitle">{t('tryonPresetTitle')}</ThemedText>
        <View style={styles.presetWrap}>
          {presetLabels.map((preset) => (
            <Pressable
              key={preset}
              onPress={() => setSelectedPreset(preset)}
              style={[styles.presetChip, selectedPreset === preset && styles.presetChipActive]}>
              <ThemedText style={selectedPreset === preset ? styles.presetChipTextActive : undefined}>{preset}</ThemedText>
            </Pressable>
          ))}
        </View>
      </View>

      <View style={styles.section}>
        <ThemedText type="subtitle">{t('tryonCustomLabel')}</ThemedText>
        <TextInput
          value={clothingRequest}
          onChangeText={setClothingRequest}
          placeholder={t('tryonCustomPlaceholder')}
          placeholderTextColor="#7C88A1"
          style={styles.textInput}
        />
      </View>

      <Pressable style={[styles.primaryButton, loading && styles.buttonDisabled]} onPress={handleGenerate} disabled={loading}>
        {loading ? <ActivityIndicator color="#ffffff" /> : <ThemedText style={styles.primaryButtonText}>{t('tryonStep3')}</ThemedText>}
      </Pressable>

      <Pressable
        style={[styles.secondaryButton, recommending && styles.buttonDisabled]}
        onPress={() => void handleRecommend()}
        disabled={recommending}>
        {recommending ? <ActivityIndicator color="#4F46E5" /> : <ThemedText type="defaultSemiBold">{t('tryonRecommendButton')}</ThemedText>}
      </Pressable>

      {resultImage ? (
        <View style={styles.section}>
          <ThemedText type="subtitle">{t('tryonResultTitle')}</ThemedText>
          <ThemedText>{t('tryonResultHint')}</ThemedText>
          <Image source={{ uri: resultImage }} style={styles.resultImage} contentFit="cover" />
        </View>
      ) : null}

      <View style={styles.section}>
        <View style={styles.recommendationHeader}>
          <View style={{ flex: 1 }}>
            <ThemedText type="subtitle">{t('tryonRecommendationsTitle')}</ThemedText>
            <ThemedText>{t('tryonRecommendationsBody')}</ThemedText>
          </View>
          {recommendedSize ? (
            <View style={styles.sizeBadge}>
              <ThemedText type="defaultSemiBold">
                {t('tryonRecommendedSize')}: {recommendedSize}
              </ThemedText>
            </View>
          ) : null}
        </View>

        {!recommendations.length ? (
          <View style={styles.emptyCard}>
            <ThemedText>{t('tryonNoRecommendations')}</ThemedText>
          </View>
        ) : (
          recommendations.map((item) => (
            <View key={item.id} style={styles.productCard}>
              <Image source={{ uri: item.image }} style={styles.productImage} contentFit="cover" />
              <View style={styles.productContent}>
                <ThemedText type="defaultSemiBold">{item.title}</ThemedText>
                <ThemedText>
                  {item.price} {item.currency} - {item.marketplace}
                </ThemedText>
                <Pressable style={styles.linkButton} onPress={() => void Linking.openURL(item.affiliateUrl)}>
                  <ThemedText type="defaultSemiBold">{t('tryonOpenProduct')}</ThemedText>
                </Pressable>
              </View>
            </View>
          ))
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: { flex: 1 },
  content: { padding: 18, paddingBottom: 56, gap: 18 },
  hero: {
    gap: 10,
    padding: 22,
    borderRadius: 26,
    backgroundColor: '#F3F6FF',
  },
  section: {
    gap: 10,
  },
  primaryButton: {
    backgroundColor: '#4F46E5',
    borderRadius: 18,
    paddingVertical: 15,
    alignItems: 'center',
    justifyContent: 'center',
  },
  secondaryButton: {
    borderRadius: 18,
    paddingVertical: 15,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#EEF2FF',
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  buttonDisabled: {
    opacity: 0.65,
  },
  preview: {
    width: '100%',
    height: 260,
    borderRadius: 24,
    backgroundColor: '#E5E7EB',
  },
  measurementGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  measurementCard: {
    width: '48%',
    padding: 14,
    borderRadius: 18,
    backgroundColor: '#EEF2FF',
    gap: 8,
  },
  measurementInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  measurementInput: {
    flex: 1,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 15,
    color: '#0F172A',
  },
  presetWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  presetChip: {
    paddingHorizontal: 14,
    paddingVertical: 11,
    borderRadius: 999,
    backgroundColor: '#EEF2FF',
  },
  presetChipActive: {
    backgroundColor: '#C7D2FE',
  },
  presetChipTextActive: {
    color: '#312E81',
    fontWeight: '700',
  },
  textInput: {
    borderRadius: 18,
    backgroundColor: '#EEF2FF',
    paddingHorizontal: 16,
    paddingVertical: 15,
    fontSize: 15,
    color: '#0F172A',
  },
  recommendationHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 12,
  },
  sizeBadge: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 999,
    backgroundColor: '#E0E7FF',
  },
  emptyCard: {
    padding: 18,
    borderRadius: 20,
    backgroundColor: '#F8FAFC',
  },
  resultImage: {
    width: '100%',
    height: 360,
    borderRadius: 24,
    backgroundColor: '#E5E7EB',
  },
  productCard: {
    flexDirection: 'row',
    gap: 12,
    padding: 14,
    borderRadius: 22,
    backgroundColor: '#FFFFFF',
  },
  productImage: {
    width: 92,
    height: 120,
    borderRadius: 18,
    backgroundColor: '#E5E7EB',
  },
  productContent: {
    flex: 1,
    gap: 8,
    justifyContent: 'space-between',
  },
  linkButton: {
    alignSelf: 'flex-start',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 999,
    backgroundColor: '#EEF2FF',
  },
});
