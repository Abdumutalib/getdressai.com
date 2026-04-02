import React, { useRef, useEffect } from "react";
import { Animated, View, StyleSheet } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";

// Oddiy Animated билан hanger иконаси айланади (spin)
export default function HangerSpin({ size = 64, color = "#c94f3d" }) {
  const rotate = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.timing(rotate, {
        toValue: 1,
        duration: 2000,
        useNativeDriver: true,
      })
    ).start();
  }, []);

  const spin = rotate.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "360deg"],
  });

  return (
    <Animated.View style={[styles.container, { transform: [{ rotate: spin }] }]}> 
      <MaterialCommunityIcons name="hanger" size={size} color={color} />
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    justifyContent: "center",
  },
});
