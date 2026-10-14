import 'package:flutter/services.dart';
import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import '../providers/focus_provider.dart';
import '../theme/app_theme.dart';

class StatsScreen extends StatelessWidget {
  const StatsScreen({super.key});

  Future<void> _copyExport(BuildContext context, FocusProvider provider) async {
    try {
      await Clipboard.setData(ClipboardData(text: provider.exportData()));
      if (context.mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('Your data export was copied to the clipboard.'),
          ),
        );
      }
    } on PlatformException catch (error) {
      if (context.mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Export failed: ${error.message ?? error.code}'),
          ),
        );
      }
    } on MissingPluginException catch (error) {
      if (context.mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text(
              'Clipboard is unavailable: '
              '${error.message ?? 'plugin not registered'}',
            ),
          ),
        );
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    final provider = context.watch<FocusProvider>();
    final weeklyMinutes = provider.focusMinutesLastSevenDays;
    final maxMinutes = weeklyMinutes.fold<int>(0, (max, value) {
      return value > max ? value : max;
    });

    return Scaffold(
      appBar: AppBar(
        title: Text(
          'Your progress',
          style: Theme.of(context).textTheme.titleLarge,
        ),
      ),
      body: SafeArea(
        top: false,
        child: ListView(
          padding: const EdgeInsets.fromLTRB(20, 8, 20, 28),
          children: [
            Text(
              'Small steps add up.',
              style: Theme.of(context).textTheme.headlineMedium,
            ),
            const SizedBox(height: 6),
            Text(
              'Your focus stays yours. Stats are stored on this device.',
              style: Theme.of(context).textTheme.bodyMedium,
            ),
            const SizedBox(height: 24),
            Row(
              children: [
                Expanded(
                  child: _MetricCard(
                    icon: Icons.bolt_rounded,
                    iconColor: AppTheme.accent,
                    label: 'FOCUS TODAY',
                    value: _formatHours(provider.todayFocusSeconds),
                    unit: 'hours',
                  ),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: _MetricCard(
                    icon: Icons.park_rounded,
                    iconColor: AppTheme.mint,
                    label: 'ALL-TIME FOCUS',
                    value: _formatHours(provider.totalFocusSeconds),
                    unit: 'hours',
                  ),
                ),
              ],
            ),
            const SizedBox(height: 12),
            _MetricCard(
              icon: Icons.brightness_5_rounded,
              iconColor: const Color(0xFFFFD477),
              label: 'ZENCOINS EARNED',
              value: '${provider.totalCoinsEarned}',
              unit: 'available to spend',
              horizontal: true,
            ),
            const SizedBox(height: 24),
            Card(
              child: Padding(
                padding: const EdgeInsets.fromLTRB(20, 20, 20, 16),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      'Focus this week',
                      style: Theme.of(context).textTheme.titleLarge,
                    ),
                    const SizedBox(height: 4),
                    Text(
                      '${_formatHours(weeklyMinutes.fold<int>(0, (a, b) => a + b) * 60)} hours completed',
                      style: Theme.of(context).textTheme.bodyMedium,
                    ),
                    const SizedBox(height: 24),
                    SizedBox(
                      height: 144,
                      child: Row(
                        crossAxisAlignment: CrossAxisAlignment.end,
                        children: List.generate(7, (index) {
                          final minutes = weeklyMinutes[index];
                          final fraction = maxMinutes == 0
                              ? 0.0
                              : minutes / maxMinutes;
                          final height = minutes == 0
                              ? 5.0
                              : 16.0 + fraction * 76;
                          final day = DateTime.now().subtract(
                            Duration(days: 6 - index),
                          );
                          final isToday = index == 6;

                          return Expanded(
                            child: Column(
                              mainAxisAlignment: MainAxisAlignment.end,
                              children: [
                                Text(
                                  minutes == 0 ? '' : '${minutes}m',
                                  style: Theme.of(context).textTheme.bodyMedium
                                      ?.copyWith(fontSize: 10),
                                ),
                                const SizedBox(height: 8),
                                AnimatedContainer(
                                  duration: const Duration(milliseconds: 450),
                                  curve: Curves.easeOutCubic,
                                  width: 18,
                                  height: height,
                                  decoration: BoxDecoration(
                                    color: minutes == 0
                                        ? AppTheme.divider
                                        : isToday
                                        ? AppTheme.mint
                                        : AppTheme.accent.withValues(
                                            alpha: 0.75,
                                          ),
                                    borderRadius: BorderRadius.circular(9),
                                  ),
                                ),
                                const SizedBox(height: 10),
                                Text(
                                  _weekday(day.weekday),
                                  style: Theme.of(context).textTheme.bodyMedium
                                      ?.copyWith(
                                        color: isToday
                                            ? AppTheme.textPrimary
                                            : AppTheme.textSecondary,
                                        fontSize: 10,
                                      ),
                                ),
                              ],
                            ),
                          );
                        }),
                      ),
                    ),
                  ],
                ),
              ),
            ),
            const SizedBox(height: 16),
            Card(
              child: Padding(
                padding: const EdgeInsets.all(18),
                child: Row(
                  children: [
                    Container(
                      width: 44,
                      height: 44,
                      decoration: BoxDecoration(
                        color: AppTheme.mint.withValues(alpha: 0.12),
                        borderRadius: BorderRadius.circular(14),
                      ),
                      child: const Icon(
                        Icons.lock_outline_rounded,
                        color: AppTheme.mint,
                      ),
                    ),
                    const SizedBox(width: 14),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            'Private by design',
                            style: Theme.of(context).textTheme.titleMedium,
                          ),
                          const SizedBox(height: 3),
                          Text(
                            'Your history stays on this device.',
                            style: Theme.of(context).textTheme.bodyMedium,
                          ),
                        ],
                      ),
                    ),
                  ],
                ),
              ),
            ),
            const SizedBox(height: 16),
            Card(
              child: Padding(
                padding: const EdgeInsets.all(18),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      'Your data',
                      style: Theme.of(context).textTheme.titleLarge,
                    ),
                    const SizedBox(height: 4),
                    Text(
                      'Export a copy or remove your on-device history.',
                      style: Theme.of(context).textTheme.bodyMedium,
                    ),
                    const SizedBox(height: 12),
                    Wrap(
                      spacing: 8,
                      children: [
                        OutlinedButton.icon(
                          onPressed: () => _copyExport(context, provider),
                          icon: const Icon(Icons.copy_rounded, size: 17),
                          label: const Text('Export'),
                        ),
                        TextButton.icon(
                          onPressed: provider.isResetting
                              ? null
                              : () async {
                                  final shouldDelete = await showDialog<bool>(
                                    context: context,
                                    builder: (dialogContext) => AlertDialog(
                                      title: const Text('Delete local data?'),
                                      content: const Text(
                                        'This permanently removes your focus history, '
                                        'ZenCoins, and unlocked worlds from this device.',
                                      ),
                                      actions: [
                                        TextButton(
                                          onPressed: () => Navigator.pop(
                                            dialogContext,
                                            false,
                                          ),
                                          child: const Text('Keep my data'),
                                        ),
                                        TextButton(
                                          onPressed: () => Navigator.pop(
                                            dialogContext,
                                            true,
                                          ),
                                          child: const Text('Delete data'),
                                        ),
                                      ],
                                    ),
                                  );
                                  if (shouldDelete == true && context.mounted) {
                                    await context
                                        .read<FocusProvider>()
                                        .resetLocalData();
                                  }
                                },
                          icon: const Icon(
                            Icons.delete_outline_rounded,
                            size: 17,
                          ),
                          label: const Text('Delete data'),
                        ),
                      ],
                    ),
                  ],
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  static String _formatHours(int seconds) =>
      (seconds / 3600).toStringAsFixed(1);

  static String _weekday(int weekday) =>
      const ['M', 'T', 'W', 'T', 'F', 'S', 'S'][weekday - 1];
}

class _MetricCard extends StatelessWidget {
  const _MetricCard({
    required this.icon,
    required this.iconColor,
    required this.label,
    required this.value,
    required this.unit,
    this.horizontal = false,
  });

  final IconData icon;
  final Color iconColor;
  final String label;
  final String value;
  final String unit;
  final bool horizontal;

  @override
  Widget build(BuildContext context) {
    final content = Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Row(
          children: [
            Icon(icon, color: iconColor, size: 18),
            const SizedBox(width: 7),
            Expanded(
              child: Text(
                label,
                maxLines: 1,
                overflow: TextOverflow.ellipsis,
                style: Theme.of(context).textTheme.labelLarge?.copyWith(
                  color: AppTheme.textSecondary,
                  fontSize: 9,
                  letterSpacing: 0.8,
                ),
              ),
            ),
          ],
        ),
        const SizedBox(height: 14),
        Text(
          value,
          style: Theme.of(
            context,
          ).textTheme.headlineMedium?.copyWith(fontSize: horizontal ? 31 : 28),
        ),
        const SizedBox(height: 2),
        Text(unit, style: Theme.of(context).textTheme.bodyMedium),
      ],
    );

    return Card(
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: horizontal
            ? Row(
                children: [
                  Expanded(child: content),
                  const SizedBox(width: 16),
                  const Icon(
                    Icons.auto_awesome_rounded,
                    color: AppTheme.accent,
                    size: 32,
                  ),
                ],
              )
            : content,
      ),
    );
  }
}
