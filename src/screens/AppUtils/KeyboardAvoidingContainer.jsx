import { useEffect, useRef } from "react";
import { Keyboard, Animated, Platform } from "react-native";

export const useKeyboardInput = () => {
  const inputTranslateY = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (Platform.OS !== "android") return;

    const showSub = Keyboard.addListener("keyboardDidShow", (e) => {
      Animated.timing(inputTranslateY, {
        toValue: -e.endCoordinates.height,
        duration: 250,
        useNativeDriver: true,
      }).start();
    });

    const hideSub = Keyboard.addListener("keyboardDidHide", () => {
      Animated.timing(inputTranslateY, {
        toValue: 0,
        duration: 250,
        useNativeDriver: true,
      }).start();
    });

    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, []);

  return { inputTranslateY };
};
