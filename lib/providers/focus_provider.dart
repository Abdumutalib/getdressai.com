import 'dart:async';
import 'dart:convert';

import 'package:flutter/services.dart';
import 'package:flutter/foundation.dart';
import 'package:shared_preferences/shared_preferences.dart';

import '../models/focus_session.dart';

class FocusProvider extends ChangeNotifier {
  static const int coinsPerCompletedSession = 25;
  static const String starterBiomeId = 'zen_grove';
  static const Map<String, int> biomeCosts = {
    starterBiomeId: 0,
    'moonlit_lake': 150,
    'desert_dawn': 300,
  };
  static const String _storageKey = 'zenith.focus_state.v1';

  SharedPreferences? _preferences;
  Future<void> _pendingPersistence = Future<void>.value();
  final List<FocusSession> _sessions = [];
  final Set<String> _unlockedBiomeIds = {starterBiomeId};
  final Stopwatch _stopwatch = Stopwatch();

  Timer? _ticker;
  bool _isLoading = true;
  bool _isRunning = false;
  bool _isResetting = false;
  bool _isDisposed = false;
  Duration _selectedDuration = const Duration(minutes: 25);
  Duration _remaining = const Duration(minutes: 25);
  int _zenCoins = 0;
  String _selectedBiomeId = starterBiomeId;
  String? _initializationError;
  String? _operationError;
  String? _notice;

  bool get isLoading => _isLoading;
  bool get isRunning => _isRunning;
  bool get isResetting => _isResetting;
  Duration get selectedDuration => _selectedDuration;
  Duration get remaining => _remaining;
  int get zenCoins => _zenCoins;
  String get selectedBiomeId => _selectedBiomeId;
  String? get initializationError => _initializationError;
  String? get operationError => _operationError;
  String? get notice => _notice;
  List<FocusSession> get sessions => List.unmodifiable(_sessions);
  Set<String> get unlockedBiomeIds => Set.unmodifiable(_unlockedBiomeIds);

  int get totalFocusSeconds =>
      _sessions.fold(0, (total, session) => total + session.durationSeconds);

  int get totalCoinsEarned =>
      _sessions.fold(0, (total, session) => total + session.coinsEarned);

  int get todayFocusSeconds {
    final now = DateTime.now();
    return _sessions
        .where((session) => _isSameDay(session.completedAt, now))
        .fold(0, (total, session) => total + session.durationSeconds);
  }

  String exportData() {
    return const JsonEncoder.withIndent('  ').convert({
      'exportedAt': DateTime.now().toUtc().toIso8601String(),
      'zenCoins': _zenCoins,
      'unlockedBiomeIds': _unlockedBiomeIds.toList(),
      'selectedBiomeId': _selectedBiomeId,
      'sessions': _sessions.map((session) => session.toJson()).toList(),
    });
  }

  List<int> get focusMinutesLastSevenDays {
    final today = DateTime.now();
    return List.generate(7, (index) {
      final day = DateTime(
        today.year,
        today.month,
        today.day,
      ).subtract(Duration(days: 6 - index));
      final seconds = _sessions
          .where((session) => _isSameDay(session.completedAt, day))
          .fold(0, (total, session) => total + session.durationSeconds);
      return (seconds / 60).round();
    }, growable: false);
  }

  Future<void> initialize() async {
    if (_isDisposed || _isResetting) return;
    _isLoading = true;
    _initializationError = null;
    _notifyListeners();

    try {
      _preferences = await SharedPreferences.getInstance();
      final savedState = _preferences!.getString(_storageKey);
      if (savedState != null) {
        _restoreState(savedState);
      }
    } on PlatformException catch (error) {
      _initializationError =
          'Zenith could not access local storage: ${error.message ?? error.code}';
    } on MissingPluginException catch (error) {
      _initializationError =
          'Zenith local storage is unavailable: '
          '${error.message ?? 'plugin not registered'}';
    } on FormatException catch (error) {
      _initializationError =
          'Saved focus data could not be read. Reset local data to continue. '
          '${error.message}';
    } catch (error) {
      _initializationError =
          'Zenith could not load local data: $error';
    }

    _isLoading = false;
    _notifyListeners();
  }

  void setSessionDuration(Duration duration) {
    if (_isResetting ||
        _isRunning ||
        duration < const Duration(seconds: 1) ||
        duration > const Duration(minutes: 180)) {
      return;
    }
    _selectedDuration = duration;
    _remaining = duration;
    _notice = null;
    _notifyListeners();
  }

  void startSession() {
    if (_isLoading || _isResetting || _isRunning || _preferences == null) {
      return;
    }

    _operationError = null;
    _notice = null;
    _remaining = _selectedDuration;
    _stopwatch
      ..reset()
      ..start();
    _isRunning = true;
    _ticker?.cancel();
    _ticker = Timer.periodic(const Duration(seconds: 1), (_) {
      _updateCountdown();
    });
    _notifyListeners();
  }

  void resetSession() {
    if (!_isRunning || _isResetting) return;
    _stopActiveSession();
    _remaining = _selectedDuration;
    _notice = 'Session reset. Only completed sessions earn ZenCoins.';
    _notifyListeners();
  }

  void handleAppBackgrounded() {
    if (!_isRunning) return;
    _stopActiveSession();
    _remaining = _selectedDuration;
    _notice = 'Session reset because Zenith moved to the background.';
    _notifyListeners();
  }

  bool isBiomeUnlocked(String biomeId) => _unlockedBiomeIds.contains(biomeId);

  Future<bool> unlockBiome({required String biomeId}) async {
    final cost = biomeCosts[biomeId];
    if (_isResetting || cost == null) {
      _operationError = 'This biome is not available.';
      _notifyListeners();
      return false;
    }
    if (_unlockedBiomeIds.contains(biomeId)) return true;
    if (_zenCoins < cost) {
      _operationError = 'Complete more focus sessions to unlock this biome.';
      _notifyListeners();
      return false;
    }

    _operationError = null;
    _zenCoins -= cost;
    _unlockedBiomeIds.add(biomeId);
    _notice = 'Biome unlocked. Make it your focus space anytime.';
    _notifyListeners();
    await _persistState();
    return true;
  }

  Future<void> selectBiome(String biomeId) async {
    if (_isResetting) return;
    if (!_unlockedBiomeIds.contains(biomeId)) {
      _operationError = 'Unlock this biome before selecting it.';
      _notifyListeners();
      return;
    }
    _selectedBiomeId = biomeId;
    _operationError = null;
    _notifyListeners();
    await _persistState();
  }

  void clearNotice() {
    if (_notice == null && _operationError == null) return;
    _notice = null;
    _operationError = null;
    _notifyListeners();
  }

  Future<void> resetLocalData() async {
    if (_isResetting) return;
    _isResetting = true;
    _operationError = null;
    _notice = null;
    if (_isRunning) {
      _stopActiveSession();
      _remaining = _selectedDuration;
    }
    _notifyListeners();

    try {
      _preferences ??= await SharedPreferences.getInstance();
      await _pendingPersistence;
      final removed = await _preferences!.remove(_storageKey);
      if (!removed && _preferences!.containsKey(_storageKey)) {
        _setResetError('Zenith could not remove its saved data.');
        return;
      }
      _sessions.clear();
      _unlockedBiomeIds
        ..clear()
        ..add(starterBiomeId);
      _zenCoins = 0;
      _selectedBiomeId = starterBiomeId;
      _selectedDuration = const Duration(minutes: 25);
      _remaining = _selectedDuration;
      _initializationError = null;
      _operationError = null;
      _notice = 'Local data has been reset.';
      _isLoading = false;
    } on PlatformException catch (error) {
      _setResetError(
        'Zenith could not reset local data: ${error.message ?? error.code}',
      );
    } on MissingPluginException catch (error) {
      _setResetError(
        'Zenith local storage is unavailable: '
        '${error.message ?? 'plugin not registered'}',
      );
    } finally {
      _isResetting = false;
      _notifyListeners();
    }
  }

  @override
  void dispose() {
    _isDisposed = true;
    _ticker?.cancel();
    _stopwatch.stop();
    super.dispose();
  }

  void _stopActiveSession() {
    _ticker?.cancel();
    _ticker = null;
    _stopwatch
      ..stop()
      ..reset();
    _isRunning = false;
  }

  void _setResetError(String message) {
    _operationError = message;
    if (_initializationError != null) {
      _initializationError = message;
    }
  }

  void _notifyListeners() {
    if (!_isDisposed) {
      notifyListeners();
    }
  }

  void _updateCountdown() {
    if (!_isRunning) return;
    final elapsed = _stopwatch.elapsed;
    final nextRemaining = _selectedDuration - elapsed;
    if (nextRemaining <= Duration.zero) {
      _finishSession();
      return;
    }
    _remaining = nextRemaining;
    _notifyListeners();
  }

  void _finishSession() {
    final completedAt = DateTime.now();
    final durationSeconds = _selectedDuration.inSeconds;
    final sessionStartedAt = completedAt.subtract(_stopwatch.elapsed);
    final startedAt = completedAt.isBefore(sessionStartedAt)
        ? completedAt.subtract(_selectedDuration)
        : sessionStartedAt;
    _stopActiveSession();
    _isRunning = false;
    _remaining = Duration.zero;
    _zenCoins += coinsPerCompletedSession;
    _sessions.insert(
      0,
      FocusSession(
        id: completedAt.microsecondsSinceEpoch.toString(),
        startedAt: startedAt,
        completedAt: completedAt,
        durationSeconds: durationSeconds,
        coinsEarned: coinsPerCompletedSession,
      ),
    );
    _notice = 'Beautiful work. $coinsPerCompletedSession ZenCoins earned.';
    _notifyListeners();
    unawaited(_persistState());
  }

  void _restoreState(String serialized) {
    final decoded = jsonDecode(serialized);
    if (decoded is! Map<String, dynamic>) {
      throw const FormatException('The saved data has an invalid format.');
    }

    final sessionsValue = decoded['sessions'];
    final coinsValue = decoded['zenCoins'];
    final unlockedValue = decoded['unlockedBiomeIds'];
    final selectedValue = decoded['selectedBiomeId'];
    if (sessionsValue is! List ||
        coinsValue is! int ||
        coinsValue < 0 ||
        unlockedValue is! List ||
        selectedValue is! String) {
      throw const FormatException('The saved data has invalid fields.');
    }

    final restoredSessions = sessionsValue
        .map<FocusSession>(FocusSession.fromJson)
        .toList(growable: false);
    final restoredBiomes = <String>{starterBiomeId};
    for (final value in unlockedValue) {
      if (value is! String || !biomeCosts.containsKey(value)) {
        throw const FormatException('A saved biome ID is invalid.');
      }
      restoredBiomes.add(value);
    }
    if (!restoredBiomes.contains(selectedValue)) {
      throw const FormatException('The selected biome is not unlocked.');
    }

    _sessions
      ..clear()
      ..addAll(restoredSessions);
    _zenCoins = coinsValue;
    _unlockedBiomeIds
      ..clear()
      ..addAll(restoredBiomes);
    _selectedBiomeId = selectedValue;
  }

  Future<void> _persistState() {
    final preferences = _preferences;
    if (preferences == null) {
      _operationError =
          'Local storage is unavailable. Your progress was not saved.';
      _notifyListeners();
      return Future<void>.value();
    }

    final serialized = jsonEncode({
      'sessions': _sessions.map((session) => session.toJson()).toList(),
      'zenCoins': _zenCoins,
      'unlockedBiomeIds': _unlockedBiomeIds.toList(),
      'selectedBiomeId': _selectedBiomeId,
    });

    final write = _pendingPersistence.then((_) async {
      try {
        final saved = await preferences.setString(_storageKey, serialized);
        if (!saved) {
          _operationError =
              'Zenith could not save your progress on this device.';
        } else {
          _operationError = null;
        }
      } on PlatformException catch (error) {
        _operationError =
            'Progress could not be saved: ${error.message ?? error.code}';
      } on MissingPluginException catch (error) {
        _operationError =
            'Zenith local storage is unavailable: '
            '${error.message ?? 'plugin not registered'}';
      } catch (error) {
        _operationError = 'Progress could not be saved: $error';
      }
      _notifyListeners();
    });
    _pendingPersistence = write;
    return write;
  }

  bool _isSameDay(DateTime left, DateTime right) =>
      left.year == right.year &&
      left.month == right.month &&
      left.day == right.day;
}
