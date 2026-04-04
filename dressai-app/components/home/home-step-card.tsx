import { Platform, StyleSheet } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import type { HomeStep } from '@/services/screen-content';

type HomeStepCardProps = {
  step: HomeStep;
};

export function HomeStepCard({ step }: HomeStepCardProps) {
  return (
    <ThemedView style={styles.container}>
      <ThemedText type="subtitle">{step.title}</ThemedText>
      <ThemedText>{formatBody(step.body)}</ThemedText>
    </ThemedView>
  );
}

function formatBody(text: string) {
  return text.replace('your platform shortcut', Platform.select({ ios: 'cmd + d', android: 'cmd + m', web: 'F12' }) || 'developer tools');
}

const styles = StyleSheet.create({
  container: {
    gap: 8,
    marginBottom: 8,
  },
});