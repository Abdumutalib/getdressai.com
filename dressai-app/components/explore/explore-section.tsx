import { Image } from 'expo-image';
import { Platform } from 'react-native';

import { ExternalLink } from '@/components/external-link';
import { ThemedText } from '@/components/themed-text';
import { Collapsible } from '@/components/ui/collapsible';
import type { ExploreSection } from '@/services/screen-content';

type ExploreSectionProps = {
  section: ExploreSection;
};

export function ExploreSectionCard({ section }: ExploreSectionProps) {
  return (
    <Collapsible title={section.title}>
      <ThemedText>{section.body}</ThemedText>
      {section.image === 'react-logo' ? (
        <Image
          source={require('@/assets/images/react-logo.png')}
          style={{ width: 100, height: 100, alignSelf: 'center' }}
        />
      ) : null}
      {section.iosOnlyNote && Platform.OS === 'ios' ? <ThemedText>{section.iosOnlyNote}</ThemedText> : null}
      {section.linkHref && section.linkLabel ? (
        <ExternalLink href={section.linkHref}>
          <ThemedText type="link">{section.linkLabel}</ThemedText>
        </ExternalLink>
      ) : null}
    </Collapsible>
  );
}