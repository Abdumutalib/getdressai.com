import 'dart:math' as math;

import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import '../providers/focus_provider.dart';
import '../theme/app_theme.dart';

class TimerScreen extends StatelessWidget {
  const TimerScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final provider = context.watch<FocusProvider>();
    final progress = provider.selectedDuration.inMilliseconds == 0
        ? 0.0
        : 1.0 -
              (provider.remaining.inMilliseconds /
                      provider.selectedDuration.inMilliseconds)
                  .clamp(0.0, 1.0)
                  .toDouble();
    final completedCount = provider.sessions.length;
    final growthLevel = math.min(4, completedCount ~/ 2);
    final time = _formatDuration(provider.remaining);

    return Scaffold(
      appBar: AppBar(
        title: Row(
          children: [
            Container(
              width: 34,
              height: 34,
              decoration: BoxDecoration(
                color: AppTheme.accent.withValues(alpha: 0.2),
                borderRadius: BorderRadius.circular(12),
              ),
              child: const Icon(
                Icons.spa_rounded,
                color: AppTheme.accent,
                size: 20,
              ),
            ),
            const SizedBox(width: 10),
            Text(
              'zenith',
              style: Theme.of(
                context,
              ).textTheme.titleLarge?.copyWith(letterSpacing: -0.6),
            ),
          ],
        ),
        actions: [
          Container(
            margin: const EdgeInsets.only(right: 16),
            padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
            decoration: BoxDecoration(
              color: AppTheme.surface,
              borderRadius: BorderRadius.circular(30),
              border: Border.all(color: AppTheme.divider),
            ),
            child: Row(
              children: [
                const Icon(
                  Icons.brightness_5_rounded,
                  color: AppTheme.mint,
                  size: 17,
                ),
                const SizedBox(width: 6),
                Text(
                  '${provider.zenCoins}',
                  style: Theme.of(context).textTheme.labelLarge,
                ),
              ],
            ),
          ),
        ],
      ),
      body: SafeArea(
        top: false,
        child: LayoutBuilder(
          builder: (context, constraints) {
            final compact = constraints.maxHeight < 650;
            final ringSize = math.min(
              constraints.maxWidth - 52,
              compact ? 248.0 : 290.0,
            );
            return SingleChildScrollView(
              padding: const EdgeInsets.fromLTRB(24, 8, 24, 28),
              child: Center(
                child: ConstrainedBox(
                  constraints: const BoxConstraints(maxWidth: 480),
                  child: Column(
                    children: [
                      Text(
                        provider.isRunning
                            ? 'Stay in your flow'
                            : 'Make space to focus',
                        textAlign: TextAlign.center,
                        style: Theme.of(context).textTheme.headlineMedium,
                      ),
                      const SizedBox(height: 7),
                      Text(
                        provider.isRunning
                            ? 'One thing at a time. You’re doing great.'
                            : 'A little progress, made with intention.',
                        textAlign: TextAlign.center,
                        style: Theme.of(context).textTheme.bodyMedium,
                      ),
                      SizedBox(height: compact ? 24 : 32),
                      SizedBox(
                        width: ringSize,
                        height: ringSize,
                        child: Stack(
                          alignment: Alignment.center,
                          children: [
                            Container(
                              width: ringSize,
                              height: ringSize,
                              decoration: BoxDecoration(
                                shape: BoxShape.circle,
                                color: AppTheme.surface,
                                boxShadow: [
                                  BoxShadow(
                                    color: AppTheme.accent.withValues(
                                      alpha: provider.isRunning ? 0.17 : 0.08,
                                    ),
                                    blurRadius: provider.isRunning ? 48 : 30,
                                    spreadRadius: 2,
                                  ),
                                ],
                              ),
                            ),
                            SizedBox(
                              width: ringSize,
                              height: ringSize,
                              child: CircularProgressIndicator(
                                value: progress,
                                strokeWidth: 7,
                                strokeCap: StrokeCap.round,
                                color: AppTheme.accent,
                                backgroundColor: AppTheme.divider,
                              ),
                            ),
                            Column(
                              mainAxisSize: MainAxisSize.min,
                              children: [
                                AnimatedScale(
                                  scale: provider.isRunning ? 1.12 : 1,
                                  duration: const Duration(milliseconds: 900),
                                  curve: Curves.easeInOut,
                                  child: _DigitalIsland(
                                    growthLevel: growthLevel,
                                    biomeId: provider.selectedBiomeId,
                                  ),
                                ),
                                const SizedBox(height: 15),
                                Text(
                                  time,
                                  style: Theme.of(context)
                                      .textTheme
                                      .headlineLarge
                                      ?.copyWith(
                                        fontSize: compact ? 42 : 48,
                                        fontFeatures: const [
                                          FontFeature.tabularFigures(),
                                        ],
                                      ),
                                ),
                                const SizedBox(height: 5),
                                Text(
                                  provider.isRunning
                                      ? 'FOCUSING'
                                      : 'MINUTES OF CALM',
                                  style: Theme.of(context).textTheme.labelLarge
                                      ?.copyWith(
                                        color: AppTheme.textSecondary,
                                        letterSpacing: 1.4,
                                        fontSize: 10,
                                      ),
                                ),
                              ],
                            ),
                          ],
                        ),
                      ),
                      SizedBox(height: compact ? 20 : 28),
                      _DurationSelector(
                        selectedMinutes: provider.selectedDuration.inMinutes,
                        enabled: !provider.isRunning,
                        onSelected: (minutes) => provider.setSessionDuration(
                          Duration(minutes: minutes),
                        ),
                      ),
                      const SizedBox(height: 20),
                      SizedBox(
                        width: double.infinity,
                        child: ElevatedButton.icon(
                          onPressed: provider.isRunning
                              ? provider.resetSession
                              : provider.startSession,
                          icon: Icon(
                            provider.isRunning
                                ? Icons.stop_rounded
                                : Icons.play_arrow_rounded,
                          ),
                          label: Text(
                            provider.isRunning
                                ? 'End session'
                                : 'Start focusing',
                          ),
                        ),
                      ),
                      const SizedBox(height: 13),
                      Text(
                        provider.isRunning
                            ? 'Leaving Zenith resets this session.'
                            : 'Complete your session to grow your world · +'
                                  '${FocusProvider.coinsPerCompletedSession} ZenCoins',
                        textAlign: TextAlign.center,
                        style: Theme.of(
                          context,
                        ).textTheme.bodyMedium?.copyWith(fontSize: 12),
                      ),
                    ],
                  ),
                ),
              ),
            );
          },
        ),
      ),
    );
  }

  String _formatDuration(Duration duration) {
    final minutes = duration.inMinutes;
    final seconds = duration.inSeconds.remainder(60);
    return '${minutes.toString().padLeft(2, '0')}:'
        '${seconds.toString().padLeft(2, '0')}';
  }
}

class _DigitalIsland extends StatelessWidget {
  const _DigitalIsland({required this.growthLevel, required this.biomeId});

  final int growthLevel;
  final String biomeId;

  @override
  Widget build(BuildContext context) {
    final icon = switch (biomeId) {
      'moonlit_lake' => Icons.nightlight_round,
      'desert_dawn' => Icons.wb_twilight_rounded,
      _ => Icons.park_rounded,
    };
    final size = 42.0 + growthLevel * 4;

    return AnimatedContainer(
      duration: const Duration(milliseconds: 500),
      curve: Curves.easeOutBack,
      width: 66,
      height: 66,
      decoration: BoxDecoration(
        shape: BoxShape.circle,
        color: AppTheme.accent.withValues(alpha: 0.13),
        border: Border.all(color: AppTheme.accent.withValues(alpha: 0.28)),
      ),
      child: TweenAnimationBuilder<double>(
        tween: Tween<double>(begin: size, end: size),
        duration: const Duration(milliseconds: 500),
        curve: Curves.easeOutBack,
        builder: (context, animatedSize, _) =>
            Icon(icon, color: AppTheme.mint, size: animatedSize),
      ),
    );
  }
}

class _DurationSelector extends StatelessWidget {
  const _DurationSelector({
    required this.selectedMinutes,
    required this.enabled,
    required this.onSelected,
  });

  final int selectedMinutes;
  final bool enabled;
  final ValueChanged<int> onSelected;

  @override
  Widget build(BuildContext context) {
    return Row(
      mainAxisAlignment: MainAxisAlignment.center,
      children: [25, 45, 60]
          .map((minutes) {
            final selected = minutes == selectedMinutes;
            return Padding(
              padding: const EdgeInsets.symmetric(horizontal: 5),
              child: ChoiceChip(
                label: Text('$minutes min'),
                selected: selected,
                onSelected: enabled ? (_) => onSelected(minutes) : null,
                showCheckmark: false,
                backgroundColor: AppTheme.surface,
                selectedColor: AppTheme.accent.withValues(alpha: 0.2),
                side: BorderSide(
                  color: selected ? AppTheme.accent : AppTheme.divider,
                ),
                labelStyle: TextStyle(
                  color: selected
                      ? AppTheme.textPrimary
                      : AppTheme.textSecondary,
                  fontWeight: selected ? FontWeight.w700 : FontWeight.w500,
                ),
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(14),
                ),
              ),
            );
          })
          .toList(growable: false),
    );
  }
}
