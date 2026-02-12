import * as React from 'react';
import { StyleSheet, View } from 'react-native';
import { Dialog, Portal, Text, Button } from 'react-native-paper';

const Message = ({
  visible,
  onCancel,
  onOk,
  title,
  message,
}) => {
  return (
    <Portal>
      <Dialog
        visible={visible}
        onDismiss={onCancel}
        style={styles.dialog}
      >
        {/* Title */}
        <Dialog.Title style={styles.title}>
          {title}
        </Dialog.Title>

        {/* Message */}
        <Dialog.Content>
          <Text style={styles.message}>
            {message}
          </Text>
        </Dialog.Content>

        {/* Actions */}
        <Dialog.Actions style={styles.buttonContainer}>
          <Button
            onPress={onOk}
            textColor="red"
            style={styles.actionButton}
            contentStyle={styles.buttonContent}
            labelStyle={styles.buttonLabel}
          >
            Yes
          </Button>

          <Button
            onPress={onCancel}
            textColor="green"
            style={styles.actionButton}
            contentStyle={styles.buttonContent}
            labelStyle={styles.buttonLabel}
          >
            No
          </Button>
        </Dialog.Actions>

      </Dialog>
    </Portal>
  );
};

export default Message;

const styles = StyleSheet.create({
  dialog: {
    borderRadius: 15,
    paddingVertical: 10,
    backgroundColor: '#FFF',
  },

  title: {
    fontSize: 22,
    fontWeight: '500',
    color: '#333',
    textAlign: 'justify',
  },

  message: {
    fontSize: 16,
    color: 'black',
    fontWeight: '400',
    lineHeight: 23,
    textAlign: 'justify',
  },

  buttonContainer: {
    justifyContent: 'space-around',
    paddingHorizontal: 20,
  },

  actionButton: {
    borderRadius: 10,
  },

  buttonContent: {    // 👈 increases touch height
    paddingHorizontal: 20,   // 👈 increases touch width
  },

  buttonLabel: {
    fontSize: 16,
    fontWeight: 'bold',
  },
});
