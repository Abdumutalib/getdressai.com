export type HomeStep = {
  title: string;
  body: string;
  actionLabel?: string;
};

export type ExploreSection = {
  title: string;
  body: string;
  linkHref?: string;
  linkLabel?: string;
  image?: 'react-logo';
  iosOnlyNote?: string;
};

export const homeSteps: HomeStep[] = [
  {
    title: 'Step 1: Try it',
    body: 'Edit app/(tabs)/index.tsx to see changes. Open developer tools from your platform shortcut when you need to inspect runtime behavior.',
  },
  {
    title: 'Step 2: Explore',
    body: 'Open the modal and Explore tab to review what is included in this starter app.',
    actionLabel: 'Open modal preview',
  },
  {
    title: 'Step 3: Get a fresh start',
    body: 'Run npm run reset-project when you want to replace the current app directory with a clean starter structure.',
  },
];

export const exploreSections: ExploreSection[] = [
  {
    title: 'File-based routing',
    body: 'This app uses app/(tabs)/index.tsx and app/(tabs)/explore.tsx for routes. The tabs layout lives in app/(tabs)/_layout.tsx.',
    linkHref: 'https://docs.expo.dev/router/introduction',
    linkLabel: 'Learn more',
  },
  {
    title: 'Android, iOS, and web support',
    body: 'The same project runs on Android, iOS, and web. You can open the web version by pressing w in the Expo terminal.',
  },
  {
    title: 'Images',
    body: 'Static assets can use @2x and @3x suffixes so React Native picks the correct density resource automatically.',
    linkHref: 'https://reactnative.dev/docs/images',
    linkLabel: 'Learn more',
    image: 'react-logo',
  },
  {
    title: 'Light and dark mode components',
    body: 'The template already supports light and dark color schemes through themed primitives and color-scheme hooks.',
    linkHref: 'https://docs.expo.dev/develop/user-interface/color-themes/',
    linkLabel: 'Learn more',
  },
  {
    title: 'Animations',
    body: 'This template includes animated UI examples built on react-native-reanimated.',
    iosOnlyNote: 'On iOS, the ParallaxScrollView component also provides a parallax header experience.',
  },
];