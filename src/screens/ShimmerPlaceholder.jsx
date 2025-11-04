import React, { useRef, useEffect } from 'react';
import { Animated, StyleSheet, Dimensions, View } from 'react-native';

const { width: windowWidth } = Dimensions.get('window');
const ITEM_WIDTH = windowWidth - 10; // same as HomeBanner
const ASPECT_RATIO = 16 / 9; // same as HomeBanner

const GlowPlaceholder = ({ style }) => {
  const glowAnim = useRef(new Animated.Value(0.5)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(glowAnim, {
          toValue: 1,
          duration: 800,
          useNativeDriver: false,
        }),
        Animated.timing(glowAnim, {
          toValue: 0.5,
          duration: 800,
          useNativeDriver: false,
        }),
      ])
    ).start();
  }, [glowAnim]);

  const bgColor = glowAnim.interpolate({
    inputRange: [0.5, 1],
    outputRange: ['#dcdcdc', '#f2f2f2'],
  });

  return (
    <Animated.View
      style={[
        styles.placeholder,
        style,
        { backgroundColor: bgColor },
      ]}
    />
  );
};

const styles = StyleSheet.create({
  placeholder: {
    width: ITEM_WIDTH,
    aspectRatio: ASPECT_RATIO,
    marginHorizontal: 5,
    borderRadius: 12,
    backgroundColor: '#e0e0e0',
  },
});

export default GlowPlaceholder;
