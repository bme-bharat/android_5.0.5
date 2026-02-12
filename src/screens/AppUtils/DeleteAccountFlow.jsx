import React, { useRef, useState } from 'react';
import { View, Text, TouchableOpacity, TextInput, ScrollView, StyleSheet } from 'react-native';
import { AppHeader } from '../AppUtils/AppHeader';
import { OtpInput } from 'react-native-otp-entry';
import { colors } from '../../assets/theme';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { showToast } from './CustomToast';
import apiClient from '../ApiClient';
import { useSelector } from 'react-redux';
import KeyboardAvoid from './KeyboardAvoid';
import RNRestart from 'react-native-restart';

const DeleteAccountFlow = ({ navigation }) => {
    const profile = useSelector(state => state.CompanyProfile.profile)

    const [confirmed, setConfirmed] = useState(false);
    const [phoneSubmitted, setPhoneSubmitted] = useState(false);
    const [otpVerified, setOtpVerified] = useState(false);

    const [phoneNumber, setPhoneNumber] = useState('');
    const fullPhoneNumber = `+91${phoneNumber}`;
    const [otp, setOTP] = useState('');
    const otpRef = useRef('');
    const [timer, setTimer] = useState(30);
    const [isResendEnabled, setIsResendEnabled] = useState(false);

    const [isDeleting, setIsDeleting] = useState(false);

    /* ---------------- Timer ---------------- */

    const startTimer = () => {
        setIsResendEnabled(false);
        setTimer(30);

        const interval = setInterval(() => {
            setTimer(prev => {
                if (prev <= 1) {
                    clearInterval(interval);
                    setIsResendEnabled(true);
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);
    };

    /* ---------------- Handlers ---------------- */

    const handleConfirmDelete = () => {
        setConfirmed(true);
    };

    const normalizePhone = (num = '') => {
        // Remove spaces, +, and non-digits
        const digits = num.replace(/\D/g, '');

        // If starts with 91 and length > 10, take last 10
        if (digits.startsWith('91') && digits.length > 10) {
            return digits.slice(-10);
        }

        // Otherwise, assume it's already 10-digit Indian number
        return digits;
    };

    const handleSendOTP = async () => {
        if (!phoneNumber) {
            showToast('Please enter your phone number', 'error');
            return;
        } else if (phoneNumber.length < 10) {
            showToast('Phone number must be 10 digits', 'error');
            return;
        }

        const fullPhoneNumber = '+91' + phoneNumber; // prepend country code

        try {
            const otpRes = await apiClient.post('/sendOtpDeleteAccountMsg91', {
                command: 'sendOtpDeleteAccountMsg91',
                user_phone_number: fullPhoneNumber,
            });

            console.log('otpRes', otpRes.data);

            // ✅ Use 'type' instead of 'status'
            if (otpRes.data?.type === 'success') {
                startTimer();
                setPhoneSubmitted(true);
                showToast('OTP sent', 'success');
            } else {
                showToast(otpRes.data?.errorMessage || 'Failed to send OTP', 'error');
            }
        } catch (error) {
            console.error('Send OTP Error:', error?.response || error);
            showToast('Try again later', 'error');
        }
    };







    const handleVerifyOTP = async () => {
        const enteredOTP = otpRef.current;
        console.log('Entered OTP:', enteredOTP);

        if (enteredOTP.length !== 6 || !/^\d{6}$/.test(enteredOTP)) {
            showToast("Please enter a valid 6 digit OTP", 'error');
            return;
        }

        try {
            const res = await axios.post(
                'https://h7l1568kga.execute-api.ap-south-1.amazonaws.com/dev/verifyOtpMsg91',
                {
                    command: 'verifyOtpMsg91',
                    otp: enteredOTP,
                    user_phone_number: fullPhoneNumber,
                },
                {
                    headers: {
                        'x-api-key': 'k1xuty5IpZ2oHOEOjgMz57wHfdFT8UQ16DxCFkzk',
                    },
                }
            );

            console.log('res', res.data);

            if (res.data.type === 'success') {
                setOtpVerified(true);
                showToast(res.data.message || 'OTP verified successfully', 'success');
            } else {
                // ✅ Show exact backend error like "OTP expired"
                showToast(res.data.message || "OTP doesn't match", 'error');
            }

        } catch (error) {
            console.log('verify otp error', error?.response?.data);

            // ✅ Handle API errors properly too
            const apiMessage =
                error?.response?.data?.message ||
                error?.message ||
                'Try again later';

            showToast(apiMessage, 'error');
        }
    };


    const handleDeleteAccount = async () => {
        if (isDeleting) return;

        setIsDeleting(true);

        try {
            const response = await axios.post(
                'https://h7l1568kga.execute-api.ap-south-1.amazonaws.com/dev/deleteAccount',
                {
                    command: 'deleteAccount',
                    user_phone_number: fullPhoneNumber,
                },
                {
                    headers: { 'x-api-key': 'k1xuty5IpZ2oHOEOjgMz57wHfdFT8UQ16DxCFkzk' },
                }
            );
            console.log('response.data', response.data)
            if (response.data.status === 'success') {

                showToast("Account Deleted successfully", 'success');
                await AsyncStorage.clear();
                RNRestart.Restart();

            } else {

                showToast("Account deletion failed or already deleted", 'error');

            }
        } catch (error) {
            console.log('Delete account error:', {
                message: error?.message,
                status: error?.response?.status,
                data: error?.response?.data,
            });

            // If backend still returned success somehow
            if (error?.response?.data?.status === 'success') {
                showToast("Account Deleted successfully", 'success');
                await AsyncStorage.clear();
                RNRestart.Restart();
                return;
            }

            const apiMessage =
                error?.response?.data?.message ||
                error?.message ||
                "Something went wrong. Please try again.";

            showToast(apiMessage, 'error');
        }
        finally {
            setIsDeleting(false);
        }
    };
    /* ---------------- UI ---------------- */

    return (
        <KeyboardAvoid>
            <View style={styles.container}>
                <AppHeader title="Delete Account" />

                <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled" keyboardDismissMode='on-drag'>

                    {/* 1️⃣ CONFIRM */}
                    <View style={[styles.card, confirmed && styles.lockedCard]}>
                        <Text style={styles.title}>1. Confirm Account Deletion</Text>

                        <Text style={styles.description}>
                            Are you sure you want to delete your account?{'\n\n'}By
                            confirming, you will permanently lose all data associated with
                            this account within 5 business days, including your posts in the feed, comments, uploaded files (images,
                            videos, documents), and transaction details. This action is irreversible.
                        </Text>

                        {confirmed ? (
                            <Text style={styles.statusText}>Status: Confirmed</Text>
                        ) : (
                            <View style={styles.row}>
                                <TouchableOpacity
                                    style={styles.secondaryBtn}
                                    onPress={() => navigation.goBack()}
                                >
                                    <Text style={styles.secondaryText}>No, Cancel</Text>
                                </TouchableOpacity>

                                <TouchableOpacity
                                    style={styles.dangerBtn}
                                    onPress={handleConfirmDelete}
                                >
                                    <Text style={styles.dangerText}>Yes, Continue</Text>
                                </TouchableOpacity>
                            </View>
                        )}
                    </View>

                    {/* 2️⃣ PHONE */}
                    {confirmed && (
                        <View style={[styles.card, phoneSubmitted && styles.lockedCard]}>
                            <Text style={styles.title}>2. Verify Phone Number</Text>

                            <Text style={styles.description}>
                                Enter your registered phone number to continue.
                            </Text>

                            {phoneSubmitted ? (
                                <Text style={styles.statusText}>
                                    Status: Submitted ({phoneNumber})
                                </Text>
                            ) : (
                                <>
                                    <TextInput
                                        style={styles.input}
                                        placeholder="Enter phone number"
                                        keyboardType="number-pad"
                                        maxLength={10}
                                        value={phoneNumber}
                                        onChangeText={setPhoneNumber}
                                    />

                                    <TouchableOpacity
                                        style={[
                                            styles.primaryBtn,
                                            phoneNumber.length < 10 && styles.disabledBtn,
                                        ]}
                                        disabled={phoneNumber.length < 10}
                                        onPress={handleSendOTP}
                                    >
                                        <Text style={styles.primaryText}>Send OTP</Text>
                                    </TouchableOpacity>
                                </>
                            )}
                        </View>
                    )}

                    {/* 3️⃣ OTP */}
                    {phoneSubmitted && (
                        <View style={[styles.card, otpVerified && styles.lockedCard]}>
                            <Text style={styles.title}>3. Enter OTP</Text>

                            <Text style={styles.description}>
                                Enter the 6-digit OTP sent to {phoneNumber}
                            </Text>

                            {otpVerified ? (
                                <Text style={styles.statusText}>Status: Verified</Text>
                            ) : (
                                <>
                                    <OtpInput
                                        numberOfDigits={6}
                                        focusColor="#075cab"
                                        autoFocus
                                        type="numeric"
                                        onTextChange={(text) => {
                                            setOTP(text);
                                            otpRef.current = text;
                                        }}
                                        theme={{
                                            containerStyle: styles.otpContainer,
                                            pinCodeContainerStyle: styles.pinCodeContainer,
                                            pinCodeTextStyle: styles.pinCodeText,
                                        }}
                                    />

                                    {isResendEnabled ? (
                                        <TouchableOpacity onPress={handleSendOTP}>
                                            <Text style={styles.linkText}>Resend OTP</Text>
                                        </TouchableOpacity>
                                    ) : (
                                        <Text style={styles.timerText}>Resend in {timer}s</Text>
                                    )}

                                    <TouchableOpacity
                                        style={[
                                            styles.primaryBtn,
                                            otp.length !== 6 && styles.disabledBtn,
                                        ]}
                                        disabled={otp.length !== 6}
                                        onPress={handleVerifyOTP}
                                    >
                                        <Text style={styles.primaryText}>Verify OTP</Text>
                                    </TouchableOpacity>
                                </>
                            )}
                        </View>
                    )}

                    {/* 4️⃣ FINAL DELETE */}
                    {otpVerified && (
                        <View style={[styles.card, styles.finalDangerCard]}>
                            <Text style={styles.title}>4. Final Deletion</Text>

                            <Text style={styles.description}>
                                All verification steps are complete.
                                If you continue, your account will be scheduled for deletion.
                            </Text>

                            <Text style={styles.warningText}>
                                Your account will be permanently deleted.
                            </Text>

                            {/* 🔵 Recovery info */}
                            <Text style={styles.recoveryText}>
                                If you log in again within 5 days, you can regain access to your account.
                                After 5 days, your account and data will be permanently removed.
                            </Text>

                            <TouchableOpacity
                                style={styles.finalDeleteBtn}
                                onPress={handleDeleteAccount}
                            >
                                <Text style={styles.finalDeleteText}>
                                    Permanently Delete My Account
                                </Text>
                            </TouchableOpacity>
                        </View>
                    )}


                </ScrollView>
            </View>
        </KeyboardAvoid>
    );
};

export default DeleteAccountFlow;

/* ---------------- Styles ---------------- */

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    content: {
        padding: 20,
    },
    card: {
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 20,
        elevation: 2,
    },
    lockedCard: {
        backgroundColor: '#f4f4f4',
        marginBottom: 10,
    },
    finalDangerCard: {
        borderWidth: 1,
        borderColor: colors.danger,
        backgroundColor: '#fff5f5',
    },
    title: {
        fontSize: 18,
        fontWeight: '600',
        marginBottom: 10,
    },
    description: {
        fontSize: 14,
        color: '#666',
        lineHeight: 20,
        marginBottom: 10,
    },
    statusText: {
        fontSize: 14,
        color: '#555',
        fontStyle: 'italic',
        marginTop: 6,
    },
    warningText: {
        fontSize: 14,
        color: colors.danger,
        fontWeight: '600',
        marginBottom: 10,
    },
    recoveryText: {
        marginTop: 8,
        fontSize: 13,
        color: '#555',
        lineHeight: 18,
    },

    input: {
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 8,
        padding: 12,
        fontSize: 16,
        marginBottom: 20,
    },
    row: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        gap: 12,
    },
    primaryBtn: {
        backgroundColor: colors.primary,
        padding: 14,
        borderRadius: 8,
        alignItems: 'center',
        marginTop: 16,
    },
    dangerBtn: {
        backgroundColor: '#eee',
        padding: 14,
        borderRadius: 8,
        flex: 1,
        alignItems: 'center',
    },
    secondaryBtn: {
        backgroundColor: '#eee',
        padding: 14,
        borderRadius: 8,
        flex: 1,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: colors.primary
    },
    disabledBtn: {
        opacity: 0.5,
    },
    primaryText: {
        color: '#fff',
        fontWeight: '600',
    },
    dangerText: {
        color: colors.text_primary,
        fontWeight: '600',
    },
    secondaryText: {
        color: colors.primary,
        fontWeight: '500',

    },
    linkText: {
        color: colors.primary,
        textAlign: 'center',
        marginTop: 10,
    },
    timerText: {
        textAlign: 'center',
        color: '#999',
        marginTop: 10,
    },

    // OTP
    otpContainer: {
        marginVertical: 20,
    },
    pinCodeContainer: {
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 8,
    },
    pinCodeText: {
        fontSize: 18,
    },

    finalDeleteBtn: {
        backgroundColor: colors.danger,
        padding: 16,
        borderRadius: 10,
        alignItems: 'center',
        marginTop: 10,
    },
    finalDeleteText: {
        color: '#fff',
        fontWeight: '700',
        fontSize: 16,
    },
});
