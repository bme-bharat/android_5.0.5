import React from 'react'
import { TouchableOpacity, Image, View, Text, StyleSheet } from 'react-native'

export default function FileTile({ item, size = 100, onPress, onSelect, selected }) {
  const isMedia = item.mime.startsWith('image') || item.mime.startsWith('video')

  return (
    <TouchableOpacity onPress={onPress} onLongPress={onSelect} style={{ margin: 2 }}>
      <View style={{ width: size, height: size, backgroundColor: '#eee', borderRadius: 6, overflow: 'hidden' }}>
        {isMedia ? (
          <Image
            source={{ uri: item.thumbnailUri || item.uri }}
            style={{ width: size, height: size }}
            resizeMode="cover"
          />
        ) : (
          <View style={[styles.docPlaceholder, { width: size, height: size }]}>
            <Text style={styles.docText}>{item.name?.split('.').pop()?.toUpperCase()}</Text>
          </View>
        )}
        {selected && <View style={styles.overlay}><Text style={styles.check}>✓</Text></View>}
      </View>
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  docPlaceholder: { justifyContent: 'center', alignItems: 'center', backgroundColor: '#ccc' },
  docText: { fontSize: 16, fontWeight: '700', color: '#555' },
  overlay: {
    position: 'absolute',
    top: 4,
    right: 4,
    backgroundColor: '#0a84ff',
    borderRadius: 12,
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center'
  },
  check: { color: '#fff', fontWeight: '700' }
})
