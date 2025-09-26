import React, { useEffect, useState } from "react";
import {
    Keyboard,
    KeyboardAvoidingView,
    Platform,
    TouchableWithoutFeedback,
} from "react-native";

const KeyboardAvoid = ({ children }) => {

    return (
        <KeyboardAvoidingView
            style={{ flex: 1 }}
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            >
                {children}
         
        </KeyboardAvoidingView>
    );
};

export default KeyboardAvoid;
