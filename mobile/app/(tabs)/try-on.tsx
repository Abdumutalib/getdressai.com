import * as ImagePicker from 'expo-image-picker';
import { Image } from 'expo-image';
import * as Linking from 'expo-linking';
import { useEffect, useMemo, useRef, useState } from 'react';
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

type PreferenceItem = {
  mode: 'photo' | 'mannequin';
  gender: 'female' | 'male' | 'unisex';
  preset: string;
  prompt: string;
  clothingRequest: string;
  measurements?: Partial<Record<MeasurementKey, number>> | null;
  sourceImagePath?: string | null;
  sourceUrl?: string;
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
  const [photo, setPhoto] = useState<{ uri: string; mimeType?: string; fileName?: string; persisted?: boolean } | null>(null);
  const [measurements, setMeasurements] = useState(DEFAULT_MEASUREMENTS);
  const [clothingRequest, setClothingRequest] = useState('');
  const [loading, setLoading] = useState(false);
  const [recommending, setRecommending] = useState(false);
  const [resultImage, setResultImage] = useState<string | null>(null);
  const [recommendedSize, setRecommendedSize] = useState('');
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [sourceImagePath, setSourceImagePath] = useState<string | null>(null);
  const hydratedRef = useRef(false);
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!presetLabels.includes(selectedPreset)) {
      setSelectedPreset(presetLabels[0] || 'Luxury');
    }
  }, [presetLabels, selectedPreset]);

  function serializeMeasurements(current: Record<MeasurementKey, string>) {
    return Object.fromEntries(
      Object.entries(current)
        .map(([key, value]) => [key, Number(value)] as const)
        .filter((entry) => Number.isFinite(entry[1]) && entry[1] > 0),
    );
  }

  useEffect(() => {
    async function loadInitial() {
      try {
        const headers = await createAuthedHeaders();
        const [preferencesResponse, historyResponse] = await Promise.all([
          fetch(`${getAppOrigin()}/api/preferences`, {
            method: 'GET',
            headers,
          }),
          fetch(`${getAppOrigin()}/api/generate`, {
            method: 'GET',
            headers,
          }),
        ]);

        if (preferencesResponse.ok) {
          const preferencesData = (await preferencesResponse.json()) as { item?: PreferenceItem | null };
          const item = preferencesData.item;
          if (item) {
            if (item.preset) {
              setSelectedPreset(item.preset);
            }
            setClothingRequest(item.clothingRequest || '');
            setSourceImagePath(item.sourceImagePath ?? null);
            if (item.sourceUrl) {
              setPhoto({
                uri: item.sourceUrl,
                fileName: 'saved-photo.jpg',
                mimeType: 'image/jpeg',
                persisted: true,
              });
            }
            if (item.measurements) {
              setMeasurements({
                height: String(item.measurements.height ?? DEFAULT_MEASUREMENTS.height),
                chest: String(item.measurements.chest ?? DEFAULT_MEASUREMENTS.chest),
                waist: String(item.measurements.waist ?? DEFAULT_MEASUREMENTS.waist),
                hips: String(item.measurements.hips ?? DEFAULT_MEASUREMENTS.hips),
                inseam: String(item.measurements.inseam ?? DEFAULT_MEASUREMENTS.inseam),
              });
            }
          }
        }

        if (historyResponse.ok) {
          const historyData = (await historyResponse.json()) as {
            items?: Array<{ resultUrl?: string; sourceImagePath?: string | null; sourceUrl?: string }>;
          };
          const latest = Array.isArray(historyData.items) ? historyData.items[0] : null;
          if (latest?.resultUrl) {
            setResultImage(latest.resultUrl);
          }
          if (!sourceImagePath && latest?.sourceImagePath) {
            setSourceImagePath(latest.sourceImagePath);
          }
          if (!photo && latest?.sourceUrl) {
            setPhoto({
              uri: latest.sourceUrl,
              fileName: 'saved-photo.jpg',
              mimeType: 'image/jpeg',
              persisted: true,
            });
          }
        }
      } catch {
        // Keep the form usable even if restore fails.
      } finally {
        hydratedRef.current = true;
      }
    }

    void loadInitial();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!hydratedRef.current) {
      return;
    }

    if (saveTimerRef.current) {
      clearTimeout(saveTimerRef.current);
    }

    saveTimerRef.current = setTimeout(() => {
      void (async () => {
        try {
          const headers = await createAuthedHeaders({ 'Content-Type': 'application/json' });
          await fetch(`${getAppOrigin()}/api/preferences`, {
            method: 'PUT',
            headers,
            body: JSON.stringify({
              mode: 'photo',
              gender: 'female',
              preset: selectedPreset,
              prompt: `${selectedPreset}. ${clothingRequest.trim() || selectedPreset}`,
              clothingRequest: clothingRequest.trim(),
              sourceImagePath,
              measurements: serializeMeasurements(measurements),
            }),
          });
        } catch {
          // Ignore background autosave failures until the next user action.
        }
      })();
    }, 450);

    return () => {
      if (saveTimerRef.current) {
        clearTimeout(saveTimerRef.current);
        saveTimerRef.current = null;
      }
    };
  }, [clothingRequest, measurements, selectedPreset, sourceImagePath]);

  async function persistSelectedPhoto(nextPhoto: {
    uri: string;
    mimeType?: string;
    fileName?: string;
    persisted?: boolean;
  }) {
    const formData = new FormData();
    formData.append('file', {
      uri: nextPhoto.uri,
      name: nextPhoto.fileName || 'mobile-upload.jpg',
      type: nextPhoto.mimeType || 'image/jpeg',
    } as never);

    const headers = await createAuthedHeaders();
    const uploadResponse = await fetch(`${getAppOrigin()}/api/preferences`, {
      method: 'POST',
      headers,
      body: formData,
    });
    const uploadData = (await uploadResponse.json()) as {
      sourceImagePath?: string;
      sourceUrl?: string;
      error?: string;
    };

    if (!uploadResponse.ok || !uploadData.sourceImagePath) {
      throw new Error(uploadData.error || t('tryonSavePhotoError'));
    }

    setSourceImagePath(uploadData.sourceImagePath);
    if (uploadData.sourceUrl) {
      setPhoto({
        uri: uploadData.sourceUrl,
        mimeType: nextPhoto.mimeType,
        fileName: nextPhoto.fileName,
        persisted: true,
      });
    }
  }

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
    const nextPhoto = {
      uri: asset.uri,
      mimeType: asset.mimeType || 'image/jpeg',
      fileName: asset.fileName || 'mobile-upload.jpg',
      persisted: false,
    };
    setPhoto(nextPhoto);
    setResultImage(null);
    setRecommendations([]);
    setRecommendedSize('');

    try {
      await persistSelectedPhoto(nextPhoto);
    } catch (error) {
      Alert.alert(t('alertVtonTitle'), error instanceof Error ? error.message : t('tryonSavePhotoError'));
    }
  }

  async function takePhoto() {
    const permission = await ImagePicker.requestCameraPermissionsAsync();
    if (!permission.granted) {
      Alert.alert(t('alertPermTitle'), t('alertCameraPermBody'));
      return;
    }

    const response = await ImagePicker.launchCameraAsync({
      cameraType: ImagePicker.CameraType.front,
      quality: 0.9,
      allowsEditing: false,
    });

    if (response.canceled || !response.assets[0]) {
      return;
    }

    const asset = response.assets[0];
    const nextPhoto = {
      uri: asset.uri,
      mimeType: asset.mimeType || 'image/jpeg',
      fileName: asset.fileName || 'mobile-camera.jpg',
      persisted: false,
    };
    setPhoto(nextPhoto);
    setResultImage(null);
    setRecommendations([]);
    setRecommendedSize('');

    try {
      await persistSelectedPhoto(nextPhoto);
    } catch (error) {
      Alert.alert(t('alertVtonTitle'), error instanceof Error ? error.message : t('tryonSavePhotoError'));
    }
  }

  async function handleGenerate() {
    if (!photo && !sourceImagePath) {
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
      formData.append('measurements', JSON.stringify(serializeMeasurements(measurements)));
      if (photo && !photo.persisted) {
        formData.append('file', {
          uri: photo.uri,
          name: photo.fileName || 'mobile-upload.jpg',
          type: photo.mimeType || 'image/jpeg',
        } as never);
      } else if (sourceImagePath) {
        formData.append('existingSourcePath', sourceImagePath);
      }

      const headers = await createAuthedHeaders();
      const response = await fetch(`${getAppOrigin()}/api/generate`, {
        method: 'POST',
        headers,
        body: formData,
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.error || t('tryonGenerateError'));
      }

      setResultImage(data.resultUrl || null);

      setSourceImagePath(data.sourceImagePath || sourceImagePath || null);
      if (data.sourceUrl) {
        setPhoto({
          uri: data.sourceUrl,
          mimeType: photo?.mimeType || 'image/jpeg',
          fileName: photo?.fileName || 'saved-photo.jpg',
          persisted: true,
        });
      }

      await handleRecommend(data.sourceImagePath || sourceImagePath || undefined);
    } catch (error) {
      Alert.alert(t('alertVtonTitle'), error instanceof Error ? error.message : t('tryonGenerateError'));
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
          measurements: serializeMeasurements(measurements),
        }),
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.error || t('tryonRecommendationsError'));
      }

      setRecommendedSize(data.recommendedSize || '');
      setRecommendations(Array.isArray(data.products) ? data.products : []);
    } catch (error) {
      Alert.alert(t('alertVtonTitle'), error instanceof Error ? error.message : t('tryonRecommendationsError'));
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
        <View style={styles.photoActions}>
          <Pressable style={styles.primaryButtonHalf} onPress={pickPhoto}>
            <ThemedText style={styles.primaryButtonText}>{t('tryonPhotoButton')}</ThemedText>
          </Pressable>
          <Pressable style={styles.secondaryButtonHalf} onPress={takePhoto}>
            <ThemedText type="defaultSemiBold">{t('tryonCameraButton')}</ThemedText>
          </Pressable>
        </View>
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
  photoActions: {
    flexDirection: 'row',
    gap: 10,
  },
  primaryButton: {
    backgroundColor: '#4F46E5',
    borderRadius: 18,
    paddingVertical: 15,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryButtonHalf: {
    flex: 1,
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
  secondaryButtonHalf: {
    flex: 1,
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
