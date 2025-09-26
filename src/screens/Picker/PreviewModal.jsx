import React, { useEffect } from 'react'
import { Modal, View, Text, Image, TouchableOpacity, StyleSheet, Dimensions } from 'react-native'
import Video from 'react-native-video'

export default function PreviewModal({ item, onClose, onUpload }) {
  useEffect(() => {
    console.log('PreviewModal item:', item)
  }, [item])

  if (!item) return null

  const isImage = item.mime.startsWith('image')
  const isVideo = item.mime.startsWith('video')
  const screenWidth = Dimensions.get('window').width
  const screenHeight = Dimensions.get('window').height

  let source;
  if (isImage) {
    if (item.thumbnailBase64) {
      // Make sure the Base64 string has the proper data URI prefix
      source = { uri: `data:${item.mime};base64,${item.thumbnailBase64}` };
      console.log('Using Base64 thumbnail for image preview');
    } else if (item.uri.startsWith('content://')) {
      console.warn(
        'Cannot display content:// URI directly. Use thumbnailBase64 or convert to file path.'
      );
      source = null; // fallback
    } else {
      source = { uri: item.uri };
    }
  }

  return (
    <Modal visible={!!item} transparent={true} animationType="slide">
      <View style={styles.backdrop}>
        <View style={styles.container}>
          <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
            <Text style={styles.closeText}>X</Text>
          </TouchableOpacity>

          {isImage && source ? (
            <Image
              source={source}
              style={{ width: screenWidth - 40, height: screenHeight / 2, borderRadius: 8 }}
              resizeMode="contain"
            />
          ) : isVideo ? (
            <Video
              source={{ uri: item.uri }}
              style={{ width: screenWidth - 40, height: screenHeight / 2, borderRadius: 8 }}
              controls
            />
          ) : (
            <View style={styles.docPreview}>
              <Text style={styles.docName}>{item.name}</Text>
            </View>
          )}

          <TouchableOpacity style={styles.uploadBtn} onPress={() => onUpload && onUpload(item)}>
            <Text style={styles.uploadText}>Upload</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  )
}


const styles = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' },
  container: { backgroundColor: '#fff', padding: 16, borderRadius: 12, alignItems: 'center', width: '90%' },
  closeBtn: { position: 'absolute', top: 8, right: 8, zIndex: 10 },
  closeText: { fontSize: 18, fontWeight: '700' },
  docPreview: { justifyContent: 'center', alignItems: 'center', width: 200, height: 200, backgroundColor: '#eee', borderRadius: 8 },
  docName: { fontSize: 16, fontWeight: '700', textAlign: 'center' },
  uploadBtn: { marginTop: 16, backgroundColor: '#0a84ff', paddingHorizontal: 24, paddingVertical: 12, borderRadius: 8 },
  uploadText: { color: '#fff', fontWeight: '700' }
})
