import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import '../providers/focus_provider.dart';
import '../theme/app_theme.dart';

class ShopScreen extends StatelessWidget {
  const ShopScreen({super.key});

  static const List<_Biome> _biomes = [
    _Biome(
      id: FocusProvider.starterBiomeId,
      name: 'Zen Grove',
      tagline: 'A quiet place to begin.',
      icon: Icons.park_rounded,
      colors: [Color(0xFF264F4D), Color(0xFF162B39)],
      cost: 0,
    ),
    _Biome(
      id: 'moonlit_lake',
      name: 'Moonlit Lake',
      tagline: 'Still water. Clear mind.',
      icon: Icons.nightlight_round,
      colors: [Color(0xFF46417F), Color(0xFF202344)],
      cost: 150,
    ),
    _Biome(
      id: 'desert_dawn',
      name: 'Desert Dawn',
      tagline: 'Find your warm horizon.',
      icon: Icons.wb_twilight_rounded,
      colors: [Color(0xFF9B5C54), Color(0xFF47334A)],
      cost: 300,
    ),
  ];

  @override
  Widget build(BuildContext context) {
    final provider = context.watch<FocusProvider>();

    return Scaffold(
      appBar: AppBar(
        title: Text(
          'Your worlds',
          style: Theme.of(context).textTheme.titleLarge,
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
                Text('${provider.zenCoins}'),
              ],
            ),
          ),
        ],
      ),
      body: SafeArea(
        top: false,
        child: ListView(
          padding: const EdgeInsets.fromLTRB(20, 8, 20, 28),
          children: [
            Text(
              'Grow a calmer corner.',
              style: Theme.of(context).textTheme.headlineMedium,
            ),
            const SizedBox(height: 6),
            Text(
              'Complete focus sessions to unlock new places.',
              style: Theme.of(context).textTheme.bodyMedium,
            ),
            const SizedBox(height: 22),
            ..._biomes.map((biome) {
              final unlocked = provider.isBiomeUnlocked(biome.id);
              final selected = provider.selectedBiomeId == biome.id;
              return Padding(
                padding: const EdgeInsets.only(bottom: 14),
                child: _BiomeCard(
                  biome: biome,
                  unlocked: unlocked,
                  selected: selected,
                  onAction: () async {
                    if (selected) return;
                    if (unlocked) {
                      await context.read<FocusProvider>().selectBiome(biome.id);
                      return;
                    }
                    final didUnlock = await context
                        .read<FocusProvider>()
                        .unlockBiome(biomeId: biome.id, cost: biome.cost);
                    if (didUnlock && context.mounted) {
                      await context.read<FocusProvider>().selectBiome(biome.id);
                    }
                  },
                ),
              );
            }),
            const SizedBox(height: 4),
            _PremiumCard(onTap: () => _showPaywall(context)),
            const SizedBox(height: 20),
            Text(
              'ZenCoins are earned by completing full focus sessions. They have '
              'no cash value and are only used inside Zenith.',
              textAlign: TextAlign.center,
              style: Theme.of(
                context,
              ).textTheme.bodyMedium?.copyWith(fontSize: 11),
            ),
          ],
        ),
      ),
    );
  }

  Future<void> _showPaywall(BuildContext context) {
    return showModalBottomSheet<void>(
      context: context,
      isScrollControlled: true,
      useSafeArea: true,
      backgroundColor: AppTheme.surface,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(28)),
      ),
      builder: (sheetContext) => const _SubscriptionPaywall(),
    );
  }
}

class _Biome {
  const _Biome({
    required this.id,
    required this.name,
    required this.tagline,
    required this.icon,
    required this.colors,
    required this.cost,
  });

  final String id;
  final String name;
  final String tagline;
  final IconData icon;
  final List<Color> colors;
  final int cost;
}

class _BiomeCard extends StatelessWidget {
  const _BiomeCard({
    required this.biome,
    required this.unlocked,
    required this.selected,
    required this.onAction,
  });

  final _Biome biome;
  final bool unlocked;
  final bool selected;
  final VoidCallback onAction;

  @override
  Widget build(BuildContext context) {
    final actionLabel = selected
        ? 'Selected'
        : unlocked
        ? 'Select'
        : '${biome.cost}';

    return Container(
      height: 156,
      clipBehavior: Clip.antiAlias,
      decoration: BoxDecoration(
        gradient: LinearGradient(
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
          colors: biome.colors,
        ),
        borderRadius: BorderRadius.circular(24),
        border: Border.all(
          color: selected ? AppTheme.mint : Colors.white.withValues(alpha: 0.1),
          width: selected ? 1.5 : 1,
        ),
      ),
      child: Stack(
        children: [
          Positioned(
            right: -20,
            top: -34,
            child: Icon(
              biome.icon,
              size: 180,
              color: Colors.white.withValues(alpha: 0.06),
            ),
          ),
          Padding(
            padding: const EdgeInsets.all(18),
            child: Row(
              children: [
                Container(
                  width: 54,
                  height: 54,
                  decoration: BoxDecoration(
                    color: Colors.white.withValues(alpha: 0.12),
                    borderRadius: BorderRadius.circular(18),
                  ),
                  child: Icon(biome.icon, color: Colors.white, size: 27),
                ),
                const SizedBox(width: 14),
                Expanded(
                  child: Column(
                    mainAxisAlignment: MainAxisAlignment.center,
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        biome.name,
                        style: Theme.of(context).textTheme.titleLarge,
                      ),
                      const SizedBox(height: 4),
                      Text(
                        biome.tagline,
                        style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                          color: Colors.white.withValues(alpha: 0.75),
                        ),
                      ),
                      const SizedBox(height: 12),
                      SizedBox(
                        height: 34,
                        child: OutlinedButton(
                          onPressed: selected ? null : onAction,
                          style: OutlinedButton.styleFrom(
                            foregroundColor: Colors.white,
                            disabledForegroundColor: Colors.white,
                            side: BorderSide(
                              color: Colors.white.withValues(alpha: 0.42),
                            ),
                            padding: const EdgeInsets.symmetric(horizontal: 12),
                            minimumSize: Size.zero,
                            textStyle: const TextStyle(fontSize: 11),
                          ),
                          child: Row(
                            mainAxisSize: MainAxisSize.min,
                            children: [
                              if (!unlocked) ...[
                                const Icon(
                                  Icons.brightness_5_rounded,
                                  size: 13,
                                ),
                                const SizedBox(width: 4),
                              ],
                              Text(actionLabel),
                            ],
                          ),
                        ),
                      ),
                    ],
                  ),
                ),
                if (selected)
                  const Icon(Icons.check_circle_rounded, color: AppTheme.mint),
              ],
            ),
          ),
        ],
      ),
    );
  }
}

class _PremiumCard extends StatelessWidget {
  const _PremiumCard({required this.onTap});

  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(24),
      child: Ink(
        padding: const EdgeInsets.all(20),
        decoration: BoxDecoration(
          color: AppTheme.surface,
          borderRadius: BorderRadius.circular(24),
          border: Border.all(color: AppTheme.accent.withValues(alpha: 0.45)),
        ),
        child: Row(
          children: [
            Container(
              width: 48,
              height: 48,
              decoration: BoxDecoration(
                color: AppTheme.accent.withValues(alpha: 0.17),
                borderRadius: BorderRadius.circular(16),
              ),
              child: const Icon(
                Icons.auto_awesome_rounded,
                color: AppTheme.accent,
              ),
            ),
            const SizedBox(width: 14),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    'Zenith Plus',
                    style: Theme.of(context).textTheme.titleLarge,
                  ),
                  const SizedBox(height: 3),
                  Text(
                    'Explore premium focus tools',
                    style: Theme.of(context).textTheme.bodyMedium,
                  ),
                ],
              ),
            ),
            const Icon(Icons.arrow_forward_ios_rounded, size: 16),
          ],
        ),
      ),
    );
  }
}

class _SubscriptionPaywall extends StatefulWidget {
  const _SubscriptionPaywall();

  @override
  State<_SubscriptionPaywall> createState() => _SubscriptionPaywallState();
}

class _SubscriptionPaywallState extends State<_SubscriptionPaywall> {
  bool _annualPlanSelected = true;

  @override
  Widget build(BuildContext context) {
    final bottomInset = MediaQuery.viewInsetsOf(context).bottom;

    return SingleChildScrollView(
      child: Padding(
        padding: EdgeInsets.fromLTRB(24, 12, 24, 24 + bottomInset),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Center(
              child: Container(
                width: 38,
                height: 4,
                decoration: BoxDecoration(
                  color: AppTheme.textSecondary.withValues(alpha: 0.4),
                  borderRadius: BorderRadius.circular(4),
                ),
              ),
            ),
            const SizedBox(height: 28),
            const Icon(
              Icons.auto_awesome_rounded,
              color: AppTheme.accent,
              size: 32,
            ),
            const SizedBox(height: 16),
            Text(
              'Make room for more.',
              style: Theme.of(context).textTheme.headlineMedium,
            ),
            const SizedBox(height: 8),
            Text(
              'A preview of the premium experience planned for Zenith Plus.',
              style: Theme.of(context).textTheme.bodyMedium,
            ),
            const SizedBox(height: 22),
            Row(
              children: [
                Expanded(
                  child: _PlanOption(
                    title: 'Monthly',
                    subtitle: 'Billed monthly',
                    selected: !_annualPlanSelected,
                    onTap: () => setState(() => _annualPlanSelected = false),
                  ),
                ),
                const SizedBox(width: 10),
                Expanded(
                  child: _PlanOption(
                    title: 'Annual',
                    subtitle: 'Billed yearly',
                    selected: _annualPlanSelected,
                    onTap: () => setState(() => _annualPlanSelected = true),
                  ),
                ),
              ],
            ),
            const SizedBox(height: 20),
            const _PaywallBenefit(
              icon: Icons.public_rounded,
              text: 'Access to every premium biome',
            ),
            const _PaywallBenefit(
              icon: Icons.timer_outlined,
              text: 'Flexible long-form focus sessions',
            ),
            const _PaywallBenefit(
              icon: Icons.insights_rounded,
              text: 'More ways to understand your habits',
            ),
            const SizedBox(height: 22),
            Container(
              width: double.infinity,
              padding: const EdgeInsets.all(14),
              decoration: BoxDecoration(
                color: AppTheme.elevatedSurface,
                borderRadius: BorderRadius.circular(16),
              ),
              child: Text(
                'Price, trial eligibility, and renewal terms must be configured '
                'and will be shown by your app store before purchase.',
                textAlign: TextAlign.center,
                style: Theme.of(context).textTheme.bodyMedium,
              ),
            ),
            const SizedBox(height: 18),
            SizedBox(
              width: double.infinity,
              child: ElevatedButton(
                onPressed: () {
                  Navigator.of(context).pop();
                  ScaffoldMessenger.of(context).showSnackBar(
                    const SnackBar(
                      content: Text(
                        'Store billing is not configured in this build. '
                        'No purchase was made.',
                      ),
                    ),
                  );
                },
                child: const Text('Explore Zenith Plus'),
              ),
            ),
            Center(
              child: TextButton(
                onPressed: () {
                  Navigator.of(context).pop();
                  ScaffoldMessenger.of(context).showSnackBar(
                    const SnackBar(
                      content: Text(
                        'Restore purchases will be available when store billing '
                        'is configured.',
                      ),
                    ),
                  );
                },
                child: const Text('Restore purchases'),
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class _PlanOption extends StatelessWidget {
  const _PlanOption({
    required this.title,
    required this.subtitle,
    required this.selected,
    required this.onTap,
  });

  final String title;
  final String subtitle;
  final bool selected;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(16),
      child: Ink(
        padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 13),
        decoration: BoxDecoration(
          color: selected
              ? AppTheme.accent.withValues(alpha: 0.14)
              : AppTheme.elevatedSurface,
          borderRadius: BorderRadius.circular(16),
          border: Border.all(
            color: selected ? AppTheme.accent : AppTheme.divider,
          ),
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(title, style: Theme.of(context).textTheme.titleMedium),
            const SizedBox(height: 3),
            Text(subtitle, style: Theme.of(context).textTheme.bodyMedium),
          ],
        ),
      ),
    );
  }
}

class _PaywallBenefit extends StatelessWidget {
  const _PaywallBenefit({required this.icon, required this.text});

  final IconData icon;
  final String text;

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 14),
      child: Row(
        children: [
          Icon(icon, color: AppTheme.mint, size: 19),
          const SizedBox(width: 12),
          Text(text, style: Theme.of(context).textTheme.bodyLarge),
        ],
      ),
    );
  }
}
