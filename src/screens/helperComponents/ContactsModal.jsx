import React, { forwardRef, useEffect, useState } from 'react';
import {
    Modal,
    View,
    Text,
    TouchableWithoutFeedback,
    TouchableOpacity,
    ActivityIndicator,
    Linking,
    Alert,
    StyleSheet,
    BackHandler,
} from 'react-native';
import apiClient from '../ApiClient';
import { showToast } from '../AppUtils/CustomToast';
import { useNetwork } from '../AppUtils/IdProvider';
import Information from '../../assets/svgIcons/information.svg';
import { colors, dimensions } from '../../assets/theme.jsx';
import { trackRecent } from "../appTrack/RecentViews";
import { TrueSheet } from "@lodev09/react-native-true-sheet"
import FastImage from '@d11/react-native-fast-image';

const ContactSupplierModal = forwardRef(({ company_id }, sheetRef) => {
    const { myId } = useNetwork();
    const [contactDetails, setContactDetails] = useState(null);
    const [loading, setLoading] = useState(true);
    const [sheetOpen, setSheetOpen] = useState(false);


    const openDialPad = (number) => {
        const url = `tel:${number}`;
        Linking.openURL(url).catch(() => {
            showToast("Unable to open the dialer. Please check your device settings", 'error');
        });
    };

    useEffect(() => {
        const subscription = BackHandler.addEventListener(
            'hardwareBackPress',
            () => {
                if (sheetOpen && sheetRef.current) {
                    sheetRef.current.dismiss(); // dismiss sheet instead of exiting
                    return true; // prevent default back action
                }
                return false; // allow default back action
            }
        );

        return () => subscription.remove(); // cleanup correctly
    }, [sheetOpen]);



    const fetchContactDetails = async () => {
        if (!company_id || !myId) return;
        setLoading(true);

        try {

            const response = await apiClient.post('/getContactDetails', {
                command: 'getContactDetails',
                target_user_id: company_id,
                user_id: myId,
            });

            if (response?.data?.status === 'success') {
                setContactDetails(response.data.response);

            } else {

                setContactDetails(null);
            }
        } catch (error) {

        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (!contactDetails?.target_user_id) return;

        trackRecent({
            type: 'contact',
            data: {
                ...contactDetails,
            },
            id: contactDetails?.target_user_id
        });
    }, [contactDetails?.target_user_id]);


    const handlePresent = () => {
        setSheetOpen(true);
        fetchContactDetails()
    };

    const handleDismiss = () => {
        setSheetOpen(false);
        setContactDetails(null);
        setLoading(true);  // reset loader for next open
        // do NOT call sheetRef.current.dismiss() here!
    };




    return (
        <TrueSheet
            ref={sheetRef}
            detents={['auto']}
            onDidPresent={handlePresent}
            onDidDismiss={handleDismiss}

            style={{ paddingVertical: 24, }}
        >
            <View style={styles.contactModalBox}>
                {loading ? (
                    <ActivityIndicator size="small" color="#075cab" />
                ) : contactDetails ? (
                    <>
                        {/* {image ? (
                            <FastImage
                                source={{ uri: image }}
                                style={styles.sheetImage}
                            />
                        ) : (
                            contactDetails?.target_user_name ? (
                                <View style={
                                    styles.sheetAvatar
                                } >
                                    <Text style={styles.avatarText}>
                                        {contactDetails?.target_user_name?.[0]?.toUpperCase()}
                                    </Text>
                                </View>
                            ) : null

                        )} */}

                        <View style={styles.contentContainer}>
                            {contactDetails.target_user_name && (
                                <Text style={styles.companyName}>
                                    {contactDetails.target_user_name}
                                </Text>
                            )}
                            {contactDetails.target_user_phone_number && (
                                <TouchableOpacity
                                    onPress={() =>
                                        openDialPad(contactDetails.target_user_phone_number)
                                    }
                                    style={styles.actionButton}
                                >
                                    <Text style={styles.actionButtonText}>
                                        {contactDetails.target_user_phone_number}
                                    </Text>
                                </TouchableOpacity>
                            )}

                            <View style={styles.successMessageRow}>
                                <Information
                                    width={dimensions.icon.small}
                                    height={dimensions.icon.small}
                                    color="#888"
                                />
                                <Text style={styles.contactModalMessage}>
                                    {contactDetails.successMessage}
                                </Text>
                            </View>
                        </View>
                    </>
                ) : (
                    <Text style={styles.contactModalLoading}>
                        Failed to load contact details.
                    </Text>
                )}

            </View>
        </TrueSheet >
    );
});


const styles = StyleSheet.create({
    contactModalBackdrop: {
        flex: 1,
        justifyContent: 'center',
        backgroundColor: 'rgba(0,0,0,0.5)',
        paddingHorizontal: 20,
    },

    contactModalBox: {
        width: '100%',
        backgroundColor: '#fff',
        borderRadius: 14,
        padding: 16,
    },
    sheetImage: {
        width: 96,
        height: 96,
        borderRadius: 48,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: '#eee',
    },

    sheetAvatar: {
        width: 96,
        height: 96,
        borderRadius: 48,
        backgroundColor: '#075cab',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 12,
    },
    avatarText: {
        color: '#fff',
        fontSize: 22,
        fontWeight: 'bold',
    },
    contentContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        gap: 12,
    },

    companyName: {
        fontWeight: '600',
        fontSize: 16,
        color: colors.text_primary,
        textAlign: 'center',
    },

    actionButton: {
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRadius: 6,
        backgroundColor: '#f0f0f0',
        width: '70%',
        alignItems: 'center',
        marginBottom: 10
    },

    actionButtonText: {
        color: colors.primary,
        fontWeight: '600',
        fontSize: 16,
    },

    successMessageRow: {
        flexDirection: 'row',
        paddingHorizontal: 16
    },

    warningIcon: {
        marginRight: 6,
    },

    contactModalMessage: {
        fontSize: 13,
        color: colors.text_secondary,
        textAlign: 'center',
        fontWeight: '500',
    },

    contactModalLoading: {
        fontSize: 14,
        color: '#666',
        textAlign: 'center',
        paddingVertical: 20,
    },

    contactLabel: {
        fontSize: 15,
        fontWeight: '600',
        color: '#000',
        width: 60,
    },

    contactValue: {
        fontSize: 15,
        color: '#075cab',
        flexShrink: 1,
        paddingHorizontal: 10,
    },
});


export default ContactSupplierModal;
