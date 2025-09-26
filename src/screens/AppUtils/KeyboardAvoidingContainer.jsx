import React, { createContext, useContext, useEffect, useRef, useState } from "react";
import { Keyboard, Animated, Platform } from "react-native";

const KeyboardInputContext = createContext({
  keyboardHeight: 0,
  inputTranslateY: new Animated.Value(0),
});

export const KeyboardInputProvider = ({ children }) => {
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
  }, [inputTranslateY]);

  return (
    <KeyboardInputContext.Provider value={{ inputTranslateY }}>
      {children}
    </KeyboardInputContext.Provider>
  );
};

// Custom hook to use in input component
export const useKeyboardInput = () => useContext(KeyboardInputContext);
