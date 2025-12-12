import React, { useEffect } from "react";
import { Platform, View } from "react-native";
import { AvoidSoftInput } from "react-native-avoid-softinput";

const KeyboardAvoid = ({ children }) => {
  useEffect(() => {
    // Enable the library on Android (fixes OnePlus/Oppo/Realme bug)
    if (Platform.OS === "android") {
      AvoidSoftInput.setAdjustResize();  // forces proper resize even on broken OEMs
      AvoidSoftInput.setEnabled(true);
    }

    return () => {
      if (Platform.OS === "android") {
        AvoidSoftInput.setEnabled(false);
      }
    };
  }, []);

  return <View style={{ flex: 1 }}>{children}</View>;
};

export default KeyboardAvoid;
