import FastImage from '@d11/react-native-fast-image';
import React from 'react';
import { Text, StyleSheet, View } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Svg, { Defs, RadialGradient, Stop, Circle } from 'react-native-svg';

const Avatar = ({
  imageUrl = null,
  name = '',
  size = 40,
  radius = null,
  gradientColors = ['#E7F0FA', '#7BA4D0'],
}) => {
  const initial = name?.trim()?.[0]?.toUpperCase() || '';

  // ✅ normalize image uri
  const imageUri =
    typeof imageUrl === 'string'
      ? imageUrl
      : typeof imageUrl?.uri === 'string'
        ? imageUrl.uri
        : null;

  const borderRadius = radius ?? size / 2;

  if (imageUri) {
    return (
      <FastImage
        source={{ uri: imageUri }}
        style={{
          width: size,
          height: size,
          borderRadius,
          backgroundColor: '#FFF',

        }}
        resizeMode={FastImage.resizeMode.contain}
      />
    );
  }

  return (
    <View
      colors={gradientColors}
      style={{
        width: size,
        height: size,
        borderRadius,
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
        backgroundColor: '#E7F0FA',
        // borderWidth: 3,
        // borderColor: '#fff',
      }}
    >
      <Text
        style={{
          color: '#2E5E99',
          fontWeight: '600',
          fontSize: size * 0.45,
        }}
      >
        {initial}
      </Text>
    </View>
  );
};

export default Avatar;
