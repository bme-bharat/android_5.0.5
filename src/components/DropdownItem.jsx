// DropdownItem.jsx
import React from 'react';
import { View, Text } from 'react-native';

const DropdownItem = ({ item, isSelected = false }) => (
  <View
    style={{
      padding: 12,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      backgroundColor: isSelected ? '#E8F1FF' : '#fff',
    }}
  >
    <Text style={{ color: isSelected ? '#075cab' : '#000' }}>{item.label}</Text>
    {isSelected && (
      <Text style={{ color: '#16A34A', fontWeight: '700' }}>✓</Text>
    )}
  </View>
);

export default DropdownItem;
