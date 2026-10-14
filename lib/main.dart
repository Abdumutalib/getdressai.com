import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import 'providers/focus_provider.dart';
import 'screens/main_navigation.dart';
import 'theme/app_theme.dart';

void main() {
  WidgetsFlutterBinding.ensureInitialized();
  runApp(
    ChangeNotifierProvider(
      create: (_) => FocusProvider()..initialize(),
      child: const ZenithApp(),
    ),
  );
}

class ZenithApp extends StatelessWidget {
  const ZenithApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'Zenith: Focus & Build',
      debugShowCheckedModeBanner: false,
      theme: AppTheme.dark,
      home: const MainNavigation(),
    );
  }
}
