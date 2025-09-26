import React, { useEffect, useState } from 'react'
import { FlatList, Dimensions } from 'react-native'
import FileTile from './FileTile'
import { NativeModules } from 'react-native'

const { DocumentPicker } = NativeModules
const PAGE_SIZE = 50

export default function GalleryGrid({ category = 'images', onPreview, onSelect, selected = [] }) {
  const [page, setPage] = useState(0)
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(false)

  useEffect(() => { loadPage(0) }, [category])

  const loadPage = async (p) => {
    setLoading(true)
    try {
      const res = await DocumentPicker.scanMedia({ category, page: p, pageSize: PAGE_SIZE })
      const arr = Array.isArray(res) ? res : []
      setItems(p === 0 ? arr : [...items, ...arr])
      setPage(p)
    } catch (e) {
      console.warn(e)
    } finally { setLoading(false) }
  }

  const onEndReached = () => { if (!loading) loadPage(page + 1) }

  const numColumns = 3
  const size = Dimensions.get('window').width / numColumns - 6

  return (
    <FlatList
      data={items}
      keyExtractor={(item) => item.id}
      numColumns={numColumns}
      onEndReached={onEndReached}
      onEndReachedThreshold={0.5}
      renderItem={({ item }) => (
        <FileTile
          item={item}
          size={size}
          onPress={() => onPreview && onPreview(item)}
          onSelect={() => onSelect && onSelect([...selected, item])}
          selected={selected.find(s => s.id === item.id)}
        />
      )}
    />
  )
}
