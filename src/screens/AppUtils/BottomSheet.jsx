import React, { forwardRef, useImperativeHandle, useState } from 'react';
import {
  Dimensions,
  View,
  StyleSheet,
  TouchableWithoutFeedback,
  Keyboard,
  Pressable,
  Text,
  LogBox,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  runOnJS,
  useAnimatedReaction,
  interpolate,
  Extrapolation,
} from 'react-native-reanimated';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import { colors, dimensions } from '../../assets/theme';
import Close from '../../assets/svgIcons/close-large.svg';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');


LogBox.ignoreLogs([
  'Sending `onAnimatedValueUpdate` with no listeners registered',
]);

const BottomSheet = forwardRef(({ children, onClose }, ref) => {
  const insets = useSafeAreaInsets();

  const OPEN_HEIGHT = SCREEN_HEIGHT * 0.8;
  const MAX_TRANSLATE_Y = 0;              // fully open
  const MIN_TRANSLATE_Y = OPEN_HEIGHT;   // fully closed (push down)
  

  const translateY = useSharedValue(OPEN_HEIGHT);

  const gestureContext = useSharedValue({ startY: 0 });
  const isActive = useSharedValue(true);
  const [active, setActive] = useState(true);

  const dismissKeyboard = () => Keyboard.dismiss();

  useAnimatedReaction(
    () => translateY.value,
    (current, prev) => {
      if (current > -150 && prev <= -150) runOnJS(dismissKeyboard)();
    }
  );

  const scrollTo = (dest) => {
    "worklet";

    const clamped = Math.min(
      Math.max(dest, MAX_TRANSLATE_Y),
      MIN_TRANSLATE_Y
    );
    
    
    const shouldClose = clamped === MIN_TRANSLATE_Y;

    isActive.value = !shouldClose;
    runOnJS(setActive)(!shouldClose);

    translateY.value = withSpring(
      clamped,
      { damping: 20, stiffness: 200, overshootClamping: true },
      () => {
        if (shouldClose && onClose) runOnJS(onClose)();
      }
    );
  };


  const closeSheet = () => {
    runOnJS(dismissKeyboard)();
    scrollTo(MIN_TRANSLATE_Y);
  };
  
  

  useImperativeHandle(ref, () => ({
    scrollTo,
    isActive: () => isActive.value,
  }));

  // 🟢 Gesture active only on the handle
  const gesture = Gesture.Pan()
    .onStart(() => {
      gestureContext.value = { startY: translateY.value };
    })
    .onUpdate((event) => {
      const clampedY = gestureContext.value.startY + event.translationY;
      translateY.value = Math.max(
        clampedY < MAX_TRANSLATE_Y
          ? MAX_TRANSLATE_Y - (MAX_TRANSLATE_Y - clampedY) * 0.2
          : clampedY,
        MAX_TRANSLATE_Y
      );
    })
    .onEnd((event) => {
      if (event.velocityY > 500 || translateY.value > OPEN_HEIGHT / 2) {
        scrollTo(MIN_TRANSLATE_Y);   // close (down)
      } else {
        scrollTo(MAX_TRANSLATE_Y);  // open (0)
      }
    });
    
    




  const animatedStyle = useAnimatedStyle(() => {
    const borderRadius = interpolate(
      translateY.value,
      [0, OPEN_HEIGHT],
      [25, 5],
      Extrapolation.CLAMP
    );


    return {
      transform: [{ translateY: translateY.value }],
      borderTopLeftRadius: borderRadius,
      borderTopRightRadius: borderRadius,
    };

  });

  const backdropOpacity = useAnimatedStyle(() => ({
    opacity: withTiming(isActive.value ? 0.5 : 0, { duration: 150 }),
  }));


  return (
    <>
      {/* Dimmed backdrop */}
      <TouchableWithoutFeedback onPress={closeSheet}>
        <Animated.View
          pointerEvents={active ? 'auto' : 'none'}
          style={[styles.backdrop, backdropOpacity]}
        />
      </TouchableWithoutFeedback>

      {/* Sheet */}
      <Animated.View
        style={[
          styles.sheet,
          animatedStyle,
        { height: OPEN_HEIGHT, bottom: 0 }

        ]}
      >

        {/* Drag handle + header row */}
        <GestureDetector gesture={gesture}>
          <View style={styles.header}>
            <View style={styles.handle} />
            <View style={styles.titleRow}>
              <Text style={styles.title}>Comments</Text>
              <Pressable onPress={closeSheet}>
                <Close
                  width={dimensions.icon.small}
                  height={dimensions.icon.small}
                  color={colors.secondary}
                />
              </Pressable>
            </View>
          </View>
        </GestureDetector>

        <View style={styles.divider} />

        {/* Scrollable content */}
        <View style={{ flex: 1 }}>{children}</View>
      </Animated.View>
    </>
  );
});

const styles = StyleSheet.create({
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#000',
    zIndex: 999,
  },
  sheet: {
    position: 'absolute',
    left: 0,
    right: 0,

    backgroundColor: '#F7F8FA',
    zIndex: 1000,
    paddingTop: 10,
  },
  handle: {
    width: 40,
    height: 3,
    borderRadius: 3,
    backgroundColor: '#ccc',
    alignSelf: 'center',
  },
  header: {
    justifyContent: 'center',
    paddingHorizontal: 20,
    paddingVertical: 8,
  },
  divider: {
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  closeText: {
    fontSize: 28,
    fontWeight: '600',
    color: '#333',
  },
});

export default BottomSheet;