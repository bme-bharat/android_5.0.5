import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet, Dimensions } from 'react-native';

const { height } = Dimensions.get('window'); // Get the height of the screen

const styles = StyleSheet.create({
  dropdownContainer: {
  maxHeight: 400,
    width: '100%',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)', // Modal overlay
  },
  dropdownButton: {
    padding: 10,
    backgroundColor: '#f0f0f0',
    borderRadius: 5,
    alignItems: 'center',
  },
  dropdownText: {
    fontSize: 16,
    color: '#333',
  },
  dropdownList: {
    position: 'absolute',
    top: '100%',
    left: 0,
    right: 0,
  
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    zIndex: 2000,
    maxHeight: 200, // Set a max height for the dropdown
  },
  dropdownItem: {
    padding: 10,
  },
  dropdownItemText: {
    fontSize: 13,
    color: '#333',
  },
});

const PhoneDropDown = ({ options, selectedValue, onSelect }) => {
  const [isDropdownVisible, setDropdownVisible] = useState(false);

  return (
    <View style={styles.dropdownContainer}>
      <TouchableOpacity
        activeOpacity={1}
        onPress={() => setDropdownVisible(!isDropdownVisible)}
        style={styles.dropdownButton}
      >
        <Text style={styles.dropdownText}>{selectedValue}</Text>
      </TouchableOpacity>

      {isDropdownVisible && (
        <View style={styles.dropdownList}>
          <ScrollView 
            keyboardShouldPersistTaps="handled" 
            contentContainerStyle={{ paddingBottom: 10 }}
            style={{ maxHeight: Math.min(200, height * 0.4) }} // Dynamic height based on screen size
          >
            {options.map((item, index) => (
              <TouchableOpacity
                key={index}
                activeOpacity={1}
                style={styles.dropdownItem}
                onPress={() => {
                  onSelect(item); // Pass the full country object
                  setDropdownVisible(false);
                }}
              >
                <Text style={styles.dropdownItemText}>
                  {item.label} ({item.value})
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      )}
    </View>
  );
};

export default PhoneDropDown;
