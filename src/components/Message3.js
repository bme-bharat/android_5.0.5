
import React from 'react';
import { Modal, Text, TouchableOpacity, View, StyleSheet } from 'react-native';

const Message3 = ({ visible, onClose, onCancel, onOk, title, message, iconType }) => {


  return (
    <Modal
      transparent={true}
      visible={visible}
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.alertBox}>
          {/* Icon based on iconType */}
          {/* <View style={styles.iconContainer}>
            {getIcon()}
          </View> */}

          {/* Title */}
          <Text style={styles.title}>{title}</Text>

          {/* Message */}
          <Text style={styles.message}>{message}</Text>

          {/* Buttons */}
          <View style={styles.buttonContainer}>
            {/* OK Button */}
            <TouchableOpacity onPress={onOk} style={styles.confirmButton} >
              <Text style={styles.buttonText1}>Leave</Text>
            </TouchableOpacity>
            {/* Cancel Button */}
            <TouchableOpacity onPress={onCancel} style={styles.deleteButton}>
              <Text style={styles.buttonText}>Stay</Text>
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
  //  backgroundColor: 'green',
   paddingHorizontal:25,
   padding: 10,
   borderRadius: 10,
   borderRadius: 10,
   alignItems: 'center',
   justifyContent: 'space-between',
   
  },
  deleteButton: {
    //  backgroundColor: '#FF0000',
     paddingHorizontal:25,
     padding: 10,
     borderRadius: 10,
     borderRadius: 10,
     alignItems: 'center',
     justifyContent: 'space-between',
    
  },

  alertBox: {
    margin:10,
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
  },

  title: {
    fontSize: 20,
    fontWeight: '500',
    color: '#333',
    marginBottom: 12,
    textAlign: 'center', // Centered title
  },
  message: {
    fontSize: 15,
    color: 'black',
    textAlign: 'center', // Centered message
    fontWeight: '400',
    lineHeight: 23,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignSelf: 'center',      // centers the whole button row
    marginTop: 20,
    width: '60%',             // adjust width as needed for spacing
  },
  
  button: {
    width: '45%',
    paddingVertical: 10,
    borderRadius: 5,
    // alignItems: 'center',
    // justifyContent: 'center',
  },
  cancelButton: {
    backgroundColor: '#FF6347',
    borderWidth: 1,
    borderColor: '#ccc',
  },
  okButton: {
    backgroundColor: '#3498db',
  },
  buttonText1: {
    color: 'red',
    fontSize: 17,
    fontWeight: '600',
  },
  buttonText: {
    color: 'green',
    fontSize: 17,
    fontWeight: '600',
  }
});

export default Message3;