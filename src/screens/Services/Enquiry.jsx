import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation, useRoute } from '@react-navigation/native';
import React, { useEffect, useRef, useState } from 'react';
import { View, Text, TextInput, Button, Alert, StyleSheet, TouchableOpacity, ScrollView, NativeModules } from 'react-native';

import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

import RNFS from 'react-native-fs';
import apiClient from '../ApiClient';
import { showToast } from '../AppUtils/CustomToast';
import { useNetwork } from '../AppUtils/IdProvider';
import AppStyles from '../AppUtils/AppStyles';
import { MediaPreview } from '../helperComponents/MediaPreview';
import ArrowLeftIcon from '../../assets/svgIcons/back.svg';
import Upload from '../../assets/svgIcons/upload.svg';

import { colors, dimensions } from '../../assets/theme.jsx';

const { DocumentPicker } = NativeModules;

const EnquiryForm = () => {
    const route = useRoute();
    const navigation = useNavigation();
    const { company_id, service_id } = route.params || {};
    const [description, setDescription] = useState('');
    const [loading, setLoading] = useState(false);
    const [selectedPDF, setSelectedPDF] = useState(null);
    const { myId, myData } = useNetwork();
    const [file, setFile] = useState(null);
    const [fileType, setFileType] = useState(null);

    const isSubmittingRef = useRef(false);

    const handleEnquire = async () => {
        if (isSubmittingRef.current || loading) return;
        isSubmittingRef.current = true;
      
        if (!description.trim()) {
          showToast("Description is mandatory", 'info');
          isSubmittingRef.current = false;
          return;
        }

        setLoading(true);

        try {
            const uploadedFileKey = await handleUploadFile();

            const payload = {
                command: 'enquireService',
                company_id,
                user_id: myId,
                service_id,
                enquiry_fileKey: uploadedFileKey,
                enquiry_description: description,
            };

            const response = await fetch(
                'https://h7l1568kga.execute-api.ap-south-1.amazonaws.com/dev/enquireService',
                {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload),
                }
            );

            const result = await response.json();

            if (!response.ok || result.status !== 'success') {
                const errorMessage = result?.errorMessage || "Submission failed";
                showToast(errorMessage, 'error');

                if (errorMessage === "You already enquired this service.") {
                    setTimeout(() => navigation.goBack());
                }

                throw new Error(errorMessage);
            }

            showToast("Enquiry submitted successfully", 'success');
            setDescription('');
            setSelectedPDF(null);

            navigation.goBack()

        } catch (error) {
            // error handling here, loading false in finally
            if (error.message !== "You already enquired this service.") {
                setSelectedPDF(null);
            }
        } finally {
            setLoading(false);
        }
    };

    const handleUploadFile = async () => {
        setLoading(true);

        if (!file) {
       
            setLoading(false);
            return null;
        }

        try {
            // Get the actual file size
            const fileStat = await RNFS.stat(file.uri);
            const fileSize = fileStat.size;

            // Request upload URL from the backend
            const res = await apiClient.post('/uploadFileToS3', {
                command: 'uploadFileToS3',
                headers: {
                    'Content-Type': fileType,
                    'Content-Length': fileSize,
                },
            });

            if (res.data.status === 'success') {
                const uploadUrl = res.data.url;
                const fileKey = res.data.fileKey;

                // Convert the file to a Blob for upload
                const fileBlob = await uriToBlob(file.uri);

                // Upload the file to S3 using the PUT method (sending the Blob as body)
                const uploadRes = await fetch(uploadUrl, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': fileType,
                    },
                    body: fileBlob,
                });

                if (uploadRes.status === 200) {
                    // No success toast here as requested

                    return fileKey; // Return the file key for saving in post data
                } else {
                    throw new Error('Failed to upload file to S3');
                }
            } else {
                throw new Error(res.data.errorMessage || 'Failed to get upload URL');
            }
        } catch (error) {
            if (!error.response) {
                // Network or internet error (no response)
                showToast("You don't have an internet connection", 'error');
            } else {
                showToast('Something went wrong', 'error');
            }
            return null;
        } finally {
            setLoading(false);
        }
    };

    const handleRemoveMedia = () => {
        setFile(null);
        setFileType('');

    };

    const selectDocument = async () => {
        try {
            // Open the native document picker
            const pickedFiles = await DocumentPicker.pick({
                allowMultiple: false,
                type: ['application/pdf'], // restrict to PDF only
            });

            if (!pickedFiles || pickedFiles.length === 0) return;

            const file = pickedFiles[0];
            const fileSize = file.size;
            const MAX_SIZE = 5 * 1024 * 1024; // 5MB
            const mimeType = file.mime || file.type || 'application/octet-stream';

            if (mimeType === 'application/pdf') {
                if (fileSize <= MAX_SIZE) {
                    setFile(file);
                    setFileType(mimeType);
                } else {
                    showToast("File size must be less than 5MB.", "error");
                    setFile(null);
                    setFileType(null);
                }
            } else {
                showToast("Please upload a PDF file.", "error");
                setFile(null);
                setFileType(null);
            }
        } catch (err) {
            if (err?.message?.includes('cancelled')) {
                // User cancelled, no toast needed
                return;
            }
            console.error("Native DocumentPicker error:", err);
            showToast("An unexpected error occurred while picking the file.", "error");
        }
    };






    const uriToBlob = async (uri) => {
        const response = await fetch(uri);
        return await response.blob();
    };


    return (
        <View style={styles.container}>
            <View style={styles.headerContainer}>
                <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
                    <ArrowLeftIcon width={dimensions.icon.medium} height={dimensions.icon.medium} color={colors.primary} />

                </TouchableOpacity>
            </View >
            <ScrollView style={styles.container1}>

                <Text style={styles.label}>Enquiry Description:</Text>
                <TextInput
                    style={styles.input}
                    multiline
                    value={description}
                    onChangeText={(text) => {
                        // Remove leading spaces only
                        const cleanedText = text.replace(/^\s+/, '');
                        setDescription(cleanedText);
                    }}
                    placeholder="Type your enquiry here"
                />

                {!file && (
                    <View style={styles.mediaContainer}>

                        <TouchableOpacity style={styles.placeholder} onPress={selectDocument}>
                            <Upload width={dimensions.icon.medium} height={dimensions.icon.medium} color={colors.primary} />
                            <Text style={styles.placeholderText}>Upload file</Text>
                        </TouchableOpacity>

                    </View>
                )}
                <MediaPreview
                    uri={file?.uri}
                    mime={file?.mime || 'application/octet-stream'}  // ensure type is never undefined
                    name={file?.name}
                    thumbnailBase64={file?.thumbnailBase64} // optional chaining
                    onRemove={handleRemoveMedia}
                />
                <TouchableOpacity
                    onPress={handleEnquire}
                    style={[
                        AppStyles.Postbtn,
                        (loading || !description.trim()) && styles.disabledButton,
                    ]}
                    disabled={loading || !description.trim()}
                >
                    <Text style={[
                        AppStyles.PostbtnText,
                        (loading || !description.trim()) && styles.buttonDisabledText,
                    ]}>
                      Submit
                    </Text>
                </TouchableOpacity>

            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,

    },
    container1: {
        flex: 1,
        // backgroundColor: '#fff',
        paddingHorizontal: 15,
        paddingTop: 10
    },
    headerContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: 'white',
        borderBottomWidth: 1,
        borderColor: '#f0f0f0'
    },

    backButton: {
        padding: 10,
        alignSelf: 'flex-start',
    },
    button: {
        width: 140,
        // backgroundColor: '#075cab',
        paddingVertical: 12,
        borderRadius: 8,
        alignItems: 'center',
        justifyContent: 'center',
        alignSelf: 'center',
        marginTop: 20,
    },
    disabledButton: {
        backgroundColor: '#ccc',
        borderColor: '#ccc',
        borderWidth: 0.5,
    },

    buttonDisabledText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '500',
    },
    label: {
        fontSize: 16,
        fontWeight: '600',
        color: '#333',
        marginBottom: 10,
    },
    input: {
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 12,
        padding: 12,
        fontSize: 15,
        textAlignVertical: 'top',
        minHeight: 200,
        maxHeight: 400,
        marginBottom: 20,
        backgroundColor: '#fafafa',
    },
    mediaContainer: {
        marginBottom: 20,
    },
    mediaWrapper: {
        position: 'relative',
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#ddd',
        backgroundColor: '#f9f9f9',
        alignItems: 'center',
        justifyContent: 'center',
    },
    documentName: {
        fontSize: 14,
        color: '#333',
        maxWidth: 180,
        textAlign: 'center',
    },
    closeIcon: {
        position: 'absolute',
        top: 8,
        right: 8,
        backgroundColor: '#eee',
        borderRadius: 12,
        padding: 2,
    },
    placeholder: {
        borderWidth: 1,
        borderColor: '#ccc',
        borderStyle: 'dashed',
        borderRadius: 12,
        padding: 20,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#f5f5f5',
    },
    placeholderText: {
        fontSize: 14,
        color: '#888',
    },
});


export default EnquiryForm;
