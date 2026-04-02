import React, { useEffect } from "react";
import { View, StyleSheet } from "react-native";
import Animated, { useSharedValue, useAnimatedStyle, withRepeat, withTiming, Easing } from "react-native-reanimated";
import { MaterialCommunityIcons } from "@expo/vector-icons";

// Hanger анимация: айланиш ва нур (glow)
export default function HangerSpinner({ size = 64, color = "#888" }) {
  const rotation = useSharedValue(0);
  const glow = useSharedValue(0.7);

  useEffect(() => {
    rotation.value = withRepeat(
      withTiming(360, { duration: 1200, easing: Easing.linear }),
      -1,
      false
    );
    glow.value = withRepeat(
      withTiming(1, { duration: 600, easing: Easing.inOut(Easing.ease) }),
      -1,
      true
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rotation.value}deg` }],
    shadowOpacity: glow.value,
    shadowRadius: 16 * glow.value,
    shadowColor: color,
  }));

  return (
    <Animated.View style={[styles.container, animatedStyle]}>
      <MaterialCommunityIcons name="hanger" size={size} color={color} />
      {/* Нур эффекти учун shadow */}
      <View style={[StyleSheet.absoluteFill, { borderRadius: size / 2, shadowColor: color, shadowOpacity: 0.5, shadowRadius: 24 }]} />
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    justifyContent: "center",
  },
});
