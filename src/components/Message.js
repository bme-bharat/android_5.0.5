

import React from 'react';
import { Modal, Text, TouchableOpacity, View, StyleSheet } from 'react-native';

const Message = ({ visible, onClose, onCancel, onOk, title, message, iconType }) => {

  return (
    <Modal
      transparent={true}
      visible={visible}
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.alertBox}>

          {/* <View style={styles.iconContainer}>
            {getIcon()}
          </View> */}

          <Text style={styles.title}>{title}</Text>

          {/* Message */}
          <Text style={styles.message}>{message}</Text>

          {/* Buttons */}
          <View style={styles.buttonContainer}>
            {/* OK Button */}
            <TouchableOpacity onPress={onOk} style={styles.confirmButton} >
              <Text style={styles.buttonText1}>Yes</Text>
            </TouchableOpacity>
            {/* Cancel Button */}
            <TouchableOpacity onPress={onCancel} style={styles.deleteButton}>
              <Text style={styles.buttonText}>No</Text>
            </TouchableOpacity>


          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    
  },

  confirmButton: {
    // backgroundColor: '#3498db',
    padding: 10,
    paddingHorizontal:30,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'space-between',

  },
  deleteButton: {
    // backgroundColor: '#FF0000',
    paddingHorizontal:30,
    padding: 10,
    borderRadius: 10,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  alertBox: {
    padding:20,
    backgroundColor: '#f8f9fa',
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    // elevation: 7,
    margin:10,

  },
  iconContainer: {
    marginBottom: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 22,
    fontWeight: '500',
    color: '#333',
    marginBottom: 12,
    textAlign: 'justify', // Centered message
  },
  message: {
    fontSize: 16,
    color: 'black',
    marginBottom: 20,
    textAlign: 'justify', // Centered message
    fontWeight: '400',
    lineHeight: 23,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '60%', // or adjust as needed
    alignSelf: 'center', // centers the button row itself
  },
  

  buttonText1: {
    color: 'red',
    fontSize: 16,
    fontWeight: 'bold',
  },
  buttonText: {
    color: 'green',
    fontSize: 16,
    fontWeight: 'bold',
  }
});

export default Message;

