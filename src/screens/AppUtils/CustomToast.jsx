import React, { useState, useRef, useEffect } from 'react';
import {
  Text,
  StyleSheet,
  Dimensions,
  View,
} from 'react-native';
import { GestureDetector, Gesture } from 'react-native-gesture-handler';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
  runOnJS,
} from 'react-native-reanimated';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import Warning from '../../assets/svgIcons/warning.svg';
import Success from '../../assets/svgIcons/success.svg';
import Info from '../../assets/svgIcons/information.svg';
import { colors, dimensions } from '../../assets/theme';

const { width } = Dimensions.get('window');
let toastRef = null;

export const showToast = (message = '', type = 'info', duration = 3000) => {
  if (toastRef) toastRef.show(message, type, duration);
};

const CustomToast = React.forwardRef((props, ref) => {
  const [message, setMessage] = useState('');
  const [type, setType] = useState('info');
  const [visible, setVisible] = useState(false);

  const offsetX = useSharedValue(width);
  const opacity = useSharedValue(0);

  const show = (msg, toastType = 'info', duration = 4000) => {
    setMessage(msg);
    setType(toastType);
    setVisible(true);
    offsetX.value = withTiming(0, { duration: 400 });
    opacity.value = withTiming(1, { duration: 400 });

    setTimeout(() => {
      hide();
    }, duration);
  };

  const hide = () => {
    offsetX.value = withTiming(width, { duration: 300 });
    opacity.value = withTiming(0, { duration: 300 }, () => {
      runOnJS(setVisible)(false);
    });
  };

  const dragGesture = Gesture.Pan()
    .onUpdate((e) => {
      if (e.translationX < 0) {
        offsetX.value = e.translationX;
      }
    })
    .onEnd((e) => {
      if (e.translationX < -50) {
        runOnJS(hide)();
      } else {
        offsetX.value = withSpring(0);
      }
    });

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: offsetX.value }],
    opacity: opacity.value,
  }));

  const getColorForType = (type) => {
    switch (type) {
      case 'success':
        return '#10B981'; // green
      case 'error':
        return '#EF4444'; // red
      case 'info':
      default:
        return '#3B82F6'; // blue
    }
  };
  const getIconForType = (type) => {
    switch (type) {
      case 'success':
        return Success;
      case 'error':
        return Warning;
      case 'info':
      default:
        return Info;
    }
  };

  React.useImperativeHandle(ref, () => ({
    show,
  }));

  if (!visible) return null;
  const IconComponent = getIconForType(type);

  return (
    <View pointerEvents="box-none" style={styles.safeArea}>
      <GestureDetector gesture={dragGesture}>
        <Animated.View style={[styles.toast, animatedStyle]}>
          <IconComponent
            width={dimensions.icon.medium}
            height={dimensions.icon.medium}
            fill={getColorForType(type)}
            style={styles.icon}
          />
          <Text style={[styles.toastText]}>
            {message}
          </Text>
        </Animated.View>
      </GestureDetector>
    </View>
  );
});

export const ToastProvider = ({ children }) => {
  const localRef = useRef();
  useEffect(() => {
    toastRef = localRef.current;
  }, []);

  return (
    <>
      {children}
      <CustomToast ref={localRef} />
    </>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    position: 'absolute',
    top: 0,
    right: 0,
    left: 0,
    zIndex: 1000,
  },
  toast: {
    marginTop: 10,
    marginRight: 20,
    alignSelf: 'flex-end',
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 16,
    paddingVertical: 14,
    paddingHorizontal: 20,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 6,
    maxWidth: width * 0.8,
  },
  icon: {
    marginRight: 14,
  },
  toastText: {
    flex: 1,
    fontSize: 15,
    fontWeight: '600',
    color: 'black',
  },

});
