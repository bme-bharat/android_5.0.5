import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { settingStyles as styles } from '../Styles/settingStyles';
import { colors, dimensions } from '../../assets/theme';
import MaterialIcons from '@react-native-vector-icons/material-icons';

const DrawerNavigationList = ({ items, isConnected }) => {
  return items
    .filter(Boolean)
    .map((item, index) => (
      <View key={index}>
        {/* Parent Item */}
        <TouchableOpacity
          onPress={() => {
            if (isConnected) item.onPress?.();
          }}
          style={{flexDirection:'row', justifyContent:'space-between', alignItems:'center', paddingVertical:8, paddingHorizontal: 16,top:6 }}
        >
          <View style={styles.drawerItem}>
            {item.icon && (
              <item.icon
                width={dimensions.icon.minlarge}
                height={dimensions.icon.minlarge}
                color={colors.text_primary}
              />
            )}
            <Text style={styles.drawerLabel}>{item.label} </Text>
          </View>
          <MaterialIcons name='chevron-right' size={26} color={colors.text_primary}/>

        </TouchableOpacity>

        {/* Sub Items – always visible */}
        {item.subItems?.length > 0 && (
          <View style={styles.subItemsContainer}>
            {item.subItems.map((subItem, subIndex) => (
              <TouchableOpacity
                key={subIndex}
                activeOpacity={0.7}
                onPress={() => {
                  if (isConnected) subItem.onPress?.();
                }}
              >
                <Text style={styles.subItem}>{subItem.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </View>
    ));
};

export default DrawerNavigationList;
