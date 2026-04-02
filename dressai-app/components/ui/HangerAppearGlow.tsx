import React, { useEffect } from "react";
import { View, StyleSheet } from "react-native";
import Animated, { useSharedValue, useAnimatedStyle, withTiming, withSequence, Easing } from "react-native-reanimated";
import { MaterialCommunityIcons } from "@expo/vector-icons";

// Hanger: пайдо бўлиш (fade-in + scale), кейин glow (shadow)
export default function HangerAppearGlow({ size = 64, color = "#c94f3d" }) {
  const opacity = useSharedValue(0);
  const scale = useSharedValue(0.7);
  const glow = useSharedValue(0.5);

  useEffect(() => {
    opacity.value = withTiming(1, { duration: 400 });
    scale.value = withSequence(
      withTiming(1.1, { duration: 300, easing: Easing.out(Easing.ease) }),
      withTiming(1, { duration: 200, easing: Easing.in(Easing.ease) })
    );
    glow.value = withTiming(1, { duration: 600, easing: Easing.inOut(Easing.ease) });
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ scale: scale.value }],
    shadowOpacity: glow.value,
    shadowRadius: 18 * glow.value,
    shadowColor: color,
  }));

  return (
    <Animated.View style={[styles.container, animatedStyle]}>
      <MaterialCommunityIcons name="hanger" size={size} color={color} />
      {/* Glow эффекти учун shadow */}
      <View style={[StyleSheet.absoluteFill, { borderRadius: size / 2, shadowColor: color, shadowOpacity: 0.4, shadowRadius: 24 }]} />
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    justifyContent: "center",
  },
});
