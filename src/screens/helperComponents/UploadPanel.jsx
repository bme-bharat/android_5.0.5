import React, { useRef, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Pressable,
} from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';

export default function UploadPanel() {
  const [open, setOpen] = useState(false);
  const translateY = useRef(new Animated.Value(300)).current;

  const show = () => {
    setOpen(true);
    Animated.timing(translateY, {
      toValue: 0,
      duration: 220,
      useNativeDriver: true,
    }).start();
  };

  const hide = () => {
    Animated.timing(translateY, {
      toValue: 300,
      duration: 180,
      useNativeDriver: true,
    }).start(() => setOpen(false));
  };

  return (
    <View style={{ flex: 1 }}>
      {/* Upload trigger */}
      <TouchableOpacity style={styles.uploadBox} onPress={show}>
        <Text style={styles.uploadText}>Upload</Text>
      </TouchableOpacity>

      {open && (
        <>
          {/* Backdrop */}
          <Pressable style={styles.backdrop} onPress={hide} />

          {/* Bottom panel */}
          <Animated.View
            style={[
              styles.panel,
              { transform: [{ translateY }] },
            ]}
          >
            <View style={styles.row}>
              <PanelItem icon="photo-camera" label="Camera" />
              <PanelItem icon="photo-library" label="Photos" />
              <PanelItem icon="attach-file" label="Files" />
            </View>
          </Animated.View>
        </>
      )}
    </View>
  );
}

const PanelItem = ({ icon, label }) => (
  <TouchableOpacity style={styles.item}>
    <MaterialIcons name={icon} size={26} color="#000" />
    <Text style={styles.label}>{label}</Text>
  </TouchableOpacity>
);

const styles = StyleSheet.create({
    uploadBox: {
      margin: 20,
      padding: 18,
      borderRadius: 12,
      borderWidth: 1,
      borderStyle: 'dashed',
      borderColor: '#bbb',
      alignItems: 'center',
    },
    uploadText: {
      fontSize: 16,
      fontWeight: '600',
    },
    backdrop: {
      ...StyleSheet.absoluteFillObject,
      backgroundColor: 'rgba(0,0,0,0.35)',
    },
    panel: {
      position: 'absolute',
      bottom: 0,
      width: '100%',
      backgroundColor: '#fff',
      borderTopLeftRadius: 18,
      borderTopRightRadius: 18,
      paddingVertical: 24,
    },
    row: {
      flexDirection: 'row',
      justifyContent: 'space-around',
    },
    item: {
      alignItems: 'center',
      width: 90,
    },
    label: {
      marginTop: 8,
      fontSize: 14,
    },
  });
  