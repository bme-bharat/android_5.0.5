

import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, FlatList, StyleSheet, Modal } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import ArrowDown from '../assets/svgIcons/arrow-down.svg';
import ArrowUp from '../assets/svgIcons/arrow-up.svg';
import { colors, dimensions } from '../assets/theme';

const CustomDropdown = ({
    label,
    data = [],
    selectedItem,
    onSelect,
    buttonStyle,
    buttonTextStyle,
    itemStyle,
    itemTextStyle,
    placeholder = ""
}) => {
    const [visible, setVisible] = useState(false);

    const toggleDropdown = () => {
        setVisible(!visible);
    };

    const handleSelect = (item) => {

        onSelect(item);
        setVisible(false);
    };

    return (
        <View style={styles.dropdownContainer}>
            <TouchableOpacity style={[styles.dropdown, buttonStyle]} onPress={toggleDropdown}>
                <Text style={[styles.selectedText, buttonTextStyle]} numberOfLines={1}  ellipsizeMode="tail" >{selectedItem || placeholder}</Text>
                {visible ? (
                    <ArrowUp
                        width={dimensions.icon.medium}
                        height={dimensions.icon.medium}
                        color={colors.gray}
                    />
                ) : (
                    <ArrowDown
                        width={dimensions.icon.medium}
                        height={dimensions.icon.medium}
                        color={colors.gray}
                    />
                )}
            </TouchableOpacity>
            <Modal
                visible={visible}
                transparent={true}
                animationType="slide"
                onRequestClose={toggleDropdown}
            >
                <TouchableOpacity style={styles.overlay} onPress={toggleDropdown}>
                    <View style={styles.modalContent}>
                        <FlatList
                            data={data}
                            keyExtractor={(item) => item}
                            renderItem={({ item }) => (
                                <TouchableOpacity style={[styles.item, itemStyle]} onPress={() => handleSelect(item)}>
                                    <Text style={[styles.itemText, itemTextStyle]} >{item}</Text>
                                </TouchableOpacity>
                            )}
                        />
                    </View>
                </TouchableOpacity>
            </Modal>
        </View>
    );
};


const styles = StyleSheet.create({
    dropdownContainer: {
        borderRadius: 20
    },
    dropdown: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 10,  // Increased vertical padding to adjust height
        paddingHorizontal: 12,
        borderRadius: 15,
    },
    selectedText: {
        fontSize: 16,
        color: "black"
    },
    overlay: {
        flex: 1,
        justifyContent: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    modalContent: {
        backgroundColor: 'white',
        margin: 20,
        padding: 20,
        borderRadius: 10,
        maxHeight: '50%'  // Limit modal content height (optional)
    },
    item: {
        paddingVertical: 10,
        color: "black",
        borderBottomWidth: 1,
        borderBottomColor: '#ddd'
    },
    itemText: {
        fontSize: 16,
        color: "black",
    },
});


export default CustomDropdown;
