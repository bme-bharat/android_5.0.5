import React from 'react';
import { View, Image, TouchableOpacity, StyleSheet, Text } from 'react-native';
import Video from 'react-native-video';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import Pdf from '../../assets/svgIcons/pdf.svg';
import File from '../../assets/svgIcons/file.svg';
import Close from '../../assets/svgIcons/close.svg';
import Ppt from '../../assets/svgIcons/ppt.svg';

import Excel from '../../assets/svgIcons/excel.svg';
import PlainText from '../../assets/svgIcons/text.svg';
import Word from '../../assets/svgIcons/word.svg';
import { colors, dimensions } from '../../assets/theme.jsx';

export const MediaPreview = ({
  uri,
  mime, 
  type,
  name,
  thumbnailBase64,
  onRemove,
  style,
  imageStyle,
  videoStyle,
}) => {
  if (!uri && !thumbnailBase64) {
    console.warn('[MediaPreview] Nothing to preview (no uri or thumbnailBase64)');
    return null;
  }

  const effectiveType = mime || type; 
  const isImage = effectiveType?.startsWith('image/');
  const isVideo = effectiveType?.startsWith('video/');
  // detect if it's a known document (based on file extension)
  const ext = name?.split('.').pop()?.toLowerCase();
  const isDocument = !isImage && !isVideo && ['pdf', 'doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx', 'txt'].includes(ext);

  // if it's not image, video, or document, don't render anything
  if (!isImage && !isVideo && !isDocument) {
    console.warn('[MediaPreview] Unsupported file type, nothing to preview', { uri, mime, type, name });
    return null;
  }

  let source = null;
  if (isImage) {
    if (thumbnailBase64) {
      source = { uri: `data:${effectiveType};base64,${thumbnailBase64}` };
    } else if (uri?.startsWith('content://')) {
      console.warn('[MediaPreview] Image URI starts with content://, expected Base64 for preview', { uri, effectiveType, name });
    } else if (uri) {
      source = { uri };
    }
  }


  const renderDocumentIcon = () => {
    if (!name) return ;

    const ext = name.split('.').pop()?.toLowerCase();
    switch (ext) {
      case 'pdf':
        return <Pdf width={dimensions.icon.xl} height={dimensions.icon.xl} color={colors.danger} />;
      case 'xls':
      case 'xlsx':
        return <Excel width={dimensions.icon.xl} height={dimensions.icon.xl} color={colors.success} />;
      case 'txt':
        return <PlainText width={dimensions.icon.xl} height={dimensions.icon.xl} color={colors.primary} />;
      case 'doc':
      case 'docx':
        return <Word width={dimensions.icon.xl} height={dimensions.icon.xl} color={colors.primary} />;
        case 'ppt':
      case 'pptx':
        return <Ppt width={dimensions.icon.xl} height={dimensions.icon.xl} color={colors.warning} />;
      default:
        return <File width={dimensions.icon.xl} height={dimensions.icon.xl} color={colors.primary} />;
    }
  };

  return (
    <View style={[styles.container, style]}>
      {onRemove && (
        <TouchableOpacity onPress={onRemove} style={styles.removeButton}>
         <Close width={dimensions.icon.ml} height={dimensions.icon.ml} color={colors.secondary} />
        </TouchableOpacity>
      )}

      {isImage && source ? (
        <Image
          source={source}
          style={[styles.media, imageStyle]}
          resizeMode="contain"
        />
      ) : isVideo ? (
        <Video
          source={{ uri }}
          style={[styles.media, videoStyle]}
          muted
          controls
          resizeMode="contain"
        />
      ) : (
        <View style={styles.documentContainer}>
          {renderDocumentIcon()}
          <Text style={styles.documentName} numberOfLines={1}>
            {name || 'Document'}
          </Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    height: 250,
    borderRadius: 8,
    overflow: 'hidden',
    marginTop: 10,
    backgroundColor: '#f5f5f5',
  },
  media: {
    width: '100%',
    height: '100%',
  },
  removeButton: {
    position: 'absolute',
    top: 0,
    right: 0,
    zIndex: 10,
    borderRadius: 40,
    padding: 5,
  },
  documentContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  documentName: {
    marginTop: 8,
    fontSize: 14,
    color: '#555',
    maxWidth: '80%',
  },
});
