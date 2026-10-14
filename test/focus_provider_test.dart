import 'dart:convert';

import 'package:flutter_test/flutter_test.dart';
import 'package:provider/provider.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:zenith_focus_build/main.dart';
import 'package:zenith_focus_build/providers/focus_provider.dart';

void main() {
  TestWidgetsFlutterBinding.ensureInitialized();

  setUp(() {
    SharedPreferences.setMockInitialValues({});
  });

  test('backgrounding resets an unfinished session without a reward', () async {
    final provider = FocusProvider();
    await provider.initialize();
    provider.setSessionDuration(const Duration(minutes: 1));

    provider.startSession();
    expect(provider.isRunning, isTrue);

    provider.handleAppBackgrounded();

    expect(provider.isRunning, isFalse);
    expect(provider.remaining, const Duration(minutes: 1));
    expect(provider.sessions, isEmpty);
    expect(provider.zenCoins, 0);
    expect(provider.notice, contains('background'));
    provider.dispose();
  });

  testWidgets('focus, stats, and worlds tabs render', (tester) async {
    await tester.pumpWidget(
      ChangeNotifierProvider(
        create: (_) => FocusProvider()..initialize(),
        child: const ZenithApp(),
      ),
    );
    await tester.pumpAndSettle();

    expect(find.text('Make space to focus'), findsOneWidget);
    await tester.tap(find.text('Stats'));
    await tester.pumpAndSettle();
    expect(find.text('Your progress'), findsOneWidget);

    await tester.tap(find.text('Worlds'));
    await tester.pumpAndSettle();
    expect(find.text('Your worlds'), findsOneWidget);

    await tester.binding.handlePopRoute();
    await tester.pumpAndSettle();
    expect(find.text('Make space to focus'), findsOneWidget);
  });

  test('biome purchase and selection persist between launches', () async {
    SharedPreferences.setMockInitialValues({
      'zenith.focus_state.v1': jsonEncode({
        'sessions': <Object>[],
        'zenCoins': 150,
        'unlockedBiomeIds': [FocusProvider.starterBiomeId],
        'selectedBiomeId': FocusProvider.starterBiomeId,
      }),
    });

    final provider = FocusProvider();
    await provider.initialize();

    final unlocked = await provider.unlockBiome(
      biomeId: 'moonlit_lake',
      cost: 150,
    );
    expect(unlocked, isTrue);
    await provider.selectBiome('moonlit_lake');
    provider.dispose();

    final restored = FocusProvider();
    await restored.initialize();

    expect(restored.zenCoins, 0);
    expect(restored.isBiomeUnlocked('moonlit_lake'), isTrue);
    expect(restored.selectedBiomeId, 'moonlit_lake');
    restored.dispose();
  });

  test('reset stops a session and removes queued writes', () async {
    SharedPreferences.setMockInitialValues({
      'zenith.focus_state.v1': jsonEncode({
        'sessions': <Object>[],
        'zenCoins': 150,
        'unlockedBiomeIds': [FocusProvider.starterBiomeId],
        'selectedBiomeId': FocusProvider.starterBiomeId,
      }),
    });
    final provider = FocusProvider();
    await provider.initialize();

    final unlock = provider.unlockBiome(biomeId: 'moonlit_lake', cost: 150);
    provider.startSession();
    expect(provider.isRunning, isTrue);

    final reset = provider.resetLocalData();
    expect(provider.isResetting, isTrue);
    provider.startSession();
    await Future.wait([unlock, reset]);

    expect(provider.isRunning, isFalse);
    expect(provider.sessions, isEmpty);
    expect(provider.zenCoins, 0);
    expect(provider.unlockedBiomeIds, {FocusProvider.starterBiomeId});
    final preferences = await SharedPreferences.getInstance();
    expect(preferences.containsKey('zenith.focus_state.v1'), isFalse);
    provider.dispose();
  });

  test('corrupt local state can be cleared through recovery', () async {
    SharedPreferences.setMockInitialValues({
      'zenith.focus_state.v1': '{not valid json',
    });
    final provider = FocusProvider();
    await provider.initialize();
    expect(provider.initializationError, isNotNull);

    await provider.resetLocalData();

    expect(provider.initializationError, isNull);
    expect(provider.sessions, isEmpty);
    expect(provider.zenCoins, 0);
    final preferences = await SharedPreferences.getInstance();
    expect(preferences.containsKey('zenith.focus_state.v1'), isFalse);
    provider.dispose();
  });
}
