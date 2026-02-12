import { StyleSheet, Platform } from "react-native";
import { colors, lightColors } from '../../assets/theme';

export const TextStyles = StyleSheet.create({

    heading: {
        fontSize: 28,
        lineHeight: 36,
        letterSpacing: 0,
        // fontWeight: '400', 
        color: lightColors.textPrimary,
        
    },

    title: {
        fontSize: 22,
        lineHeight: 28,
        letterSpacing: 0,
        // fontWeight: '400',
        color: lightColors.textPrimary,
    },

    body: {
        fontSize: 16, // M3 standard for Body Large
        lineHeight: 24,
        letterSpacing: 0.5,
        // fontWeight: '400',
        color: lightColors.textSecondary,
    },

    caption: {
        fontSize: 11, 
        lineHeight: 16,
        letterSpacing: 0.5,
        fontWeight: '500', 
        color: lightColors.textTertiary,
    }
});
