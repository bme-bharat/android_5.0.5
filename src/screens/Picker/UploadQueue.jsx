import React from 'react'
import { View, Text, StyleSheet, FlatList } from 'react-native'

export default function UploadQueue({ uploads = [] }) {
  if (!uploads.length) return null

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Uploads</Text>
      <FlatList
        data={uploads}
        keyExtractor={item => item.uri}
        renderItem={({ item }) => (
          <View style={styles.item}>
            <Text numberOfLines={1} style={styles.name}>{item.uri.split('/').pop()}</Text>
            <Text style={styles.progress}>
              {item.status === 'done' ? '✅' :
                item.status === 'failed' ? '❌' :
                  `${item.progress}%`}
            </Text>
          </View>
        )}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  container: { padding: 8, backgroundColor: '#f0f0f0', maxHeight: 150 },
  title: { fontWeight: '700', marginBottom: 4 },
  item: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 2, paddingHorizontal: 4 },
  name: { flex: 1, fontSize: 12 },
  progress: { width: 50, textAlign: 'right', fontSize: 12 }
})
