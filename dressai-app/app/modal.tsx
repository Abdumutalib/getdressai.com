import { Link } from 'expo-router';
import { StyleSheet } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Fonts } from '@/constants/theme';

export default function ModalScreen() {
  return (
    <ThemedView style={styles.container}>
      <ThemedText type="title" style={styles.title}>
        Launch focus
      </ThemedText>
      <ThemedText style={styles.body}>
        Mobile app is no longer the default starter, but the next real milestone is wiring upload, auth, and generated look results into these screens.
      </ThemedText>
      <Link href="/" dismissTo style={styles.link}>
        <ThemedText type="link">Back to studio</ThemedText>
      </Link>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 24,
    gap: 14,
  },
  title: {
    fontFamily: Fonts.serif,
  },
  body: {
    color: '#5f5752',
    lineHeight: 24,
  },
  link: {
    paddingVertical: 15,
  },
});
