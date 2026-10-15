import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import '../providers/focus_provider.dart';
import '../theme/app_theme.dart';
import 'shop_screen.dart';
import 'stats_screen.dart';
import 'timer_screen.dart';

class MainNavigation extends StatefulWidget {
  const MainNavigation({super.key});

  @override
  State<MainNavigation> createState() => _MainNavigationState();
}

class _MainNavigationState extends State<MainNavigation>
    with WidgetsBindingObserver {
  int _selectedIndex = 0;
  late final List<Widget> _screens = const [
    TimerScreen(),
    StatsScreen(),
    ShopScreen(),
  ];

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addObserver(this);
  }

  @override
  void dispose() {
    WidgetsBinding.instance.removeObserver(this);
    super.dispose();
  }

  @override
  void didChangeAppLifecycleState(AppLifecycleState state) {
    // "inactive" can be a brief interruption (for example, a system dialog).
    // Only discard the session once the app is actually backgrounded or detached.
    if (state == AppLifecycleState.paused ||
        state == AppLifecycleState.hidden ||
        state == AppLifecycleState.detached) {
      context.read<FocusProvider>().handleAppBackgrounded();
    }
  }

  @override
  Widget build(BuildContext context) {
    final provider = context.watch<FocusProvider>();

    if (provider.isLoading) {
      return const Scaffold(
        body: Center(child: CircularProgressIndicator(color: AppTheme.accent)),
      );
    }

    if (provider.initializationError != null) {
      return _StorageRecoveryScreen(
        message: provider.initializationError!,
        onRetry: provider.initialize,
        onReset: provider.resetLocalData,
      );
    }

    final message = provider.operationError ?? provider.notice;
    return PopScope(
      canPop: _selectedIndex == 0,
      onPopInvokedWithResult: (didPop, result) {
        if (!didPop && _selectedIndex != 0) {
          setState(() => _selectedIndex = 0);
        }
      },
      child: Scaffold(
        body: Column(
          children: [
            if (message != null)
              MaterialBanner(
                content: Text(
                  message,
                  style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                    color: provider.operationError != null
                        ? Theme.of(context).colorScheme.error
                        : AppTheme.textPrimary,
                  ),
                ),
                leading: Icon(
                  provider.operationError != null
                      ? Icons.error_outline_rounded
                      : Icons.auto_awesome_rounded,
                  color: provider.operationError != null
                      ? Theme.of(context).colorScheme.error
                      : AppTheme.mint,
                ),
                actions: [
                  TextButton(
                    onPressed: provider.clearNotice,
                    child: const Text('DISMISS'),
                  ),
                ],
                backgroundColor: AppTheme.surface,
                dividerColor: AppTheme.divider,
              ),
            Expanded(
              child: IndexedStack(index: _selectedIndex, children: _screens),
            ),
          ],
        ),
        bottomNavigationBar: NavigationBar(
          selectedIndex: _selectedIndex,
          onDestinationSelected: (index) {
            setState(() => _selectedIndex = index);
          },
          destinations: const [
            NavigationDestination(
              icon: Icon(Icons.hourglass_empty_rounded),
              selectedIcon: Icon(Icons.hourglass_bottom_rounded),
              label: 'Focus',
            ),
            NavigationDestination(
              icon: Icon(Icons.insights_outlined),
              selectedIcon: Icon(Icons.insights_rounded),
              label: 'Stats',
            ),
            NavigationDestination(
              icon: Icon(Icons.storefront_outlined),
              selectedIcon: Icon(Icons.storefront_rounded),
              label: 'Worlds',
            ),
          ],
        ),
      ),
    );
  }
}

class _StorageRecoveryScreen extends StatelessWidget {
  const _StorageRecoveryScreen({
    required this.message,
    required this.onRetry,
    required this.onReset,
  });

  final String message;
  final Future<void> Function() onRetry;
  final Future<void> Function() onReset;

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: SafeArea(
        child: Center(
          child: ConstrainedBox(
            constraints: const BoxConstraints(maxWidth: 420),
            child: Padding(
              padding: const EdgeInsets.all(28),
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  const Icon(
                    Icons.cloud_off_rounded,
                    color: AppTheme.accent,
                    size: 48,
                  ),
                  const SizedBox(height: 20),
                  Text(
                    'Your progress is unavailable',
                    textAlign: TextAlign.center,
                    style: Theme.of(context).textTheme.headlineMedium,
                  ),
                  const SizedBox(height: 12),
                  Text(message, textAlign: TextAlign.center),
                  const SizedBox(height: 28),
                  SizedBox(
                    width: double.infinity,
                    child: ElevatedButton(
                      onPressed: onRetry,
                      child: const Text('Try again'),
                    ),
                  ),
                  const SizedBox(height: 8),
                  TextButton(
                    onPressed: onReset,
                    child: const Text('Reset local data'),
                  ),
                ],
              ),
            ),
          ),
        ),
      ),
    );
  }
}
