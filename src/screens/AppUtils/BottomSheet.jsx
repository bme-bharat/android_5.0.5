// BottomSheet.js
import React, { forwardRef, useImperativeHandle, useState } from 'react';
import { Dimensions, View, StyleSheet, TouchableWithoutFeedback, Keyboard, Pressable, Text, LogBox } from 'react-native';
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
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { colors, dimensions } from '../../assets/theme';
import Close from '../../assets/svgIcons/close-large.svg';


const { height: SCREEN_HEIGHT } = Dimensions.get('window');
const MAX_TRANSLATE_Y = -SCREEN_HEIGHT;

LogBox.ignoreLogs([
    'Sending `onAnimatedValueUpdate` with no listeners registered',
]);

const BottomSheet = forwardRef(({ children, onClose }, ref) => {
    const translateY = useSharedValue(0);
    const gestureContext = useSharedValue({ startY: 0 });
    const isActive = useSharedValue(false);
    const [active, setActive] = useState(false);

    const dismissKeyboard = () => {
        Keyboard.dismiss();
    };

    useAnimatedReaction(
        () => translateY.value,
        (currentTranslateY, prevTranslateY) => {
            if (currentTranslateY > -150 && prevTranslateY <= -150) {
                runOnJS(dismissKeyboard)();

            }
        }
    );

    const scrollTo = (destination) => {
        'worklet';
        const clamped = Math.max(destination, MAX_TRANSLATE_Y);
        const shouldClose = clamped === 0;

        if (shouldClose) {
            runOnJS(dismissKeyboard)();
        }

        isActive.value = !shouldClose;
        runOnJS(setActive)(!shouldClose);

        translateY.value = withSpring(clamped, {
            damping: 20,
            stiffness: 200,
            overshootClamping: true,
        }, () => {
            if (shouldClose && onClose) {
                runOnJS(onClose)();
            }
        });
    };


    const closeSheet = () => {
        runOnJS(dismissKeyboard)();
        scrollTo(0);
        if (onClose) runOnJS(onClose)();
    };

    useImperativeHandle(ref, () => ({
        scrollTo,
        isActive: () => isActive.value,
    }));

    const gesture = Gesture.Pan()
        .onStart(() => {
            gestureContext.value = {
                startY: translateY.value,
            };
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
            const SNAP_THRESHOLD = SCREEN_HEIGHT / 3;
            if (event.velocityY > 500 || translateY.value > -SNAP_THRESHOLD) {
                scrollTo(0);
            } else {
                scrollTo(MAX_TRANSLATE_Y);
            }
        });

    const animatedStyle = useAnimatedStyle(() => {
        const borderRadius = interpolate(
            translateY.value,
            [MAX_TRANSLATE_Y, 0],
            [25, 5],
            Extrapolation.CLAMP
        );

        return {
            transform: [{ translateY: translateY.value }],
            borderRadius,
        };
    });

    const backdropOpacity = useAnimatedStyle(() => ({
        opacity: withTiming(isActive.value ? 0.5 : 0, { duration: 150 }),
    }));

    return (
        <>
            <TouchableWithoutFeedback onPress={closeSheet}>
                <Animated.View
                    pointerEvents={active ? 'auto' : 'none'}
                    style={[styles.backdrop, backdropOpacity]}
                />
            </TouchableWithoutFeedback>

            <GestureDetector gesture={gesture}>
                <Animated.View style={[styles.sheet, animatedStyle]}>
                    {/* Drag handle + close icon */}
                    <View style={styles.header}>
                        <View style={styles.handle} />
                        <View style={styles.titleRow}>
                            <Text style={styles.title}>Comments</Text>
                            <Pressable onPress={closeSheet}>
                                <Close width={dimensions.icon.small} height={dimensions.icon.small} color={colors.secondary} />

                            </Pressable>
                        </View>
                    </View>
                    <View style={styles.divider} />

                    {children}
                </Animated.View>
            </GestureDetector>
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
        top: SCREEN_HEIGHT,
        left: 0,
        right: 0,
        height: SCREEN_HEIGHT,
        backgroundColor: 'white',
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
        paddingVertical: 8
    },
    divider: {
        borderBottomWidth: 1,
        borderBottomColor: '#ddd'
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
