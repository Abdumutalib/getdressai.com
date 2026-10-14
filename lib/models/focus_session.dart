class FocusSession {
  const FocusSession({
    required this.id,
    required this.startedAt,
    required this.completedAt,
    required this.durationSeconds,
    required this.coinsEarned,
  });

  final String id;
  final DateTime startedAt;
  final DateTime completedAt;
  final int durationSeconds;
  final int coinsEarned;

  Map<String, Object> toJson() => {
    'id': id,
    'startedAt': startedAt.toIso8601String(),
    'completedAt': completedAt.toIso8601String(),
    'durationSeconds': durationSeconds,
    'coinsEarned': coinsEarned,
  };

  factory FocusSession.fromJson(Object? value) {
    if (value is! Map<String, dynamic>) {
      throw const FormatException('A saved focus session is not an object.');
    }

    final id = value['id'];
    final startedAtValue = value['startedAt'];
    final completedAtValue = value['completedAt'];
    final durationSeconds = value['durationSeconds'];
    final coinsEarned = value['coinsEarned'];

    if (id is! String ||
        id.isEmpty ||
        startedAtValue is! String ||
        completedAtValue is! String ||
        durationSeconds is! int ||
        durationSeconds <= 0 ||
        coinsEarned is! int ||
        coinsEarned < 0) {
      throw const FormatException('A saved focus session has invalid fields.');
    }

    final startedAt = DateTime.tryParse(startedAtValue);
    final completedAt = DateTime.tryParse(completedAtValue);
    if (startedAt == null ||
        completedAt == null ||
        completedAt.isBefore(startedAt)) {
      throw const FormatException('A saved focus session has invalid dates.');
    }

    return FocusSession(
      id: id,
      startedAt: startedAt,
      completedAt: completedAt,
      durationSeconds: durationSeconds,
      coinsEarned: coinsEarned,
    );
  }
}
