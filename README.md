# Zenith: Focus & Build

A standalone Flutter app for mindful focus sessions, local progress tracking,
ZenCoins, and biome unlocks.

## Run locally

Install Flutter 3.x, then run these commands from this directory:

```sh
flutter pub get
flutter run
```

## Web

Build the browser version for the root of a domain with:

```sh
flutter build web --release --base-href /
```

The generated static site is written to `build/web`.

## Project map

```text
zenith/
├── pubspec.yaml
└── lib/
    ├── main.dart
    ├── models/
    │   └── focus_session.dart
    ├── providers/
    │   └── focus_provider.dart
    ├── screens/
    │   ├── main_navigation.dart
    │   ├── timer_screen.dart
    │   ├── stats_screen.dart
    │   └── shop_screen.dart
    └── theme/
        └── app_theme.dart
```

Focus history, coin balance, and unlocked biomes are stored on-device with
`shared_preferences`. An unfinished session is intentionally discarded when
the app is backgrounded or the process exits; unfinished sessions never award
coins. Local-only rewards are for personal motivation and are not a secure
currency.

The subscription screen is a paywall presentation only. StoreKit/Google Play
Billing product IDs, legal offer terms, and purchase verification must be
configured before enabling real subscriptions. No purchase is simulated.

## Release configuration

The Android and iOS project templates still use `com.example` application
identifiers. Replace them with bundle IDs you control before publishing; an
identifier cannot be safely guessed or changed after store submission.

Android release builds use the upload key configured in
`android/key.properties`; they no longer fall back to the generated debug key.
Create an upload keystore, copy `android/key.properties.example` to
`android/key.properties`, and fill it with your private values. Keep both the
keystore and properties file out of version control. Configure App Store
signing and provisioning in Xcode with your Apple Developer account before
distributing an iOS build.
