import React, { useState, useEffect, useCallback, useRef } from 'react';
import { View, Text, Button, FlatList, ScrollView, TouchableOpacity, StyleSheet, Modal, TextInput, Alert } from 'react-native';

const URL = 'wss://6xhohxdci4.execute-api.ap-south-1.amazonaws.com/chatApi/';

export default function App() {
  const socket = useRef(null);
  const [isConnected, setIsConnected] = useState(false);
  const [members, setMembers] = useState([]);
  const [chatRows, setChatRows] = useState([]);

  // Modal states
  const [modalVisible, setModalVisible] = useState(false);
  const [modalCallback, setModalCallback] = useState(null);
  const [modalValue, setModalValue] = useState('');
  const [modalTitle, setModalTitle] = useState('');

  const showModal = useCallback((title, callback) => {
    setModalTitle(title);
    setModalCallback(() => callback);
    setModalValue('');
    setModalVisible(true);
  }, []);

  const handleModalSubmit = useCallback(() => {
    if (modalCallback) {
      modalCallback(modalValue);
    }
    setModalVisible(false);
  }, [modalCallback, modalValue]);

  const onSocketOpen = useCallback(() => {
    setIsConnected(true);
    showModal('Enter your name', (name) => {
      socket.current?.send(JSON.stringify({ action: 'setName', name }));
    });
  }, [showModal]);

  const onSocketClose = useCallback(() => {
    setMembers([]);
    setIsConnected(false);
    setChatRows([]);
  }, []);

  const onSocketMessage = useCallback((dataStr) => {
    const data = JSON.parse(dataStr);
    if (data.members) {
      setMembers(data.members);
    } else if (data.publicMessage) {
      setChatRows(old => [...old, { type: 'public', text: data.publicMessage }]);
    } else if (data.privateMessage) {
      Alert.alert('Private Message', data.privateMessage);
    } else if (data.systemMessage) {
      setChatRows(old => [...old, { type: 'system', text: data.systemMessage }]);
    }
  }, []);

  const onConnect = useCallback(() => {
    if (socket.current?.readyState !== WebSocket.OPEN) {
      socket.current = new WebSocket(URL);
      socket.current.addEventListener('open', onSocketOpen);
      socket.current.addEventListener('close', onSocketClose);
      socket.current.addEventListener('message', (event) => {
        onSocketMessage(event.data);
      });
    }
  }, [onSocketOpen, onSocketClose, onSocketMessage]);

  useEffect(() => {
    return () => {
      socket.current?.close();
    };
  }, []);

  const onSendPrivateMessage = useCallback((to) => {
    showModal(`Enter private message for ${to}`, (message) => {
      socket.current?.send(JSON.stringify({ action: 'sendPrivate', message, to }));
    });
  }, [showModal]);

  const onSendPublicMessage = useCallback(() => {
    showModal('Enter public message', (message) => {
      socket.current?.send(JSON.stringify({ action: 'sendPublic', message }));
    });
  }, [showModal]);

  const onDisconnect = useCallback(() => {
    if (isConnected) {
      socket.current?.close();
    }
  }, [isConnected]);

  return (
    <View style={styles.container}>

      {/* Members List */}
      <FlatList
        horizontal
        data={members}
        keyExtractor={(item) => item}
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.memberButton} onPress={() => onSendPrivateMessage(item)}>
            <Text style={styles.memberText}>{item}</Text>
          </TouchableOpacity>
        )}
        style={styles.membersList}
        showsHorizontalScrollIndicator={false}
      />

      {/* Chat Messages */}
      <ScrollView style={styles.chatScroll}>
        {chatRows.map((row, index) => (
          <View key={index} style={[styles.chatRow, row.type === 'system' ? styles.systemRow : styles.publicRow]}>
            <Text style={row.type === 'system' ? styles.systemText : styles.publicText}>{row.text}</Text>
          </View>
        ))}
      </ScrollView>

      {/* Buttons */}
      <View style={styles.buttonsContainer}>
        {isConnected && <Button title="Send Public" onPress={onSendPublicMessage} />}
        {isConnected && <Button title="Disconnect" onPress={onDisconnect} />}
        {!isConnected && <Button title="Connect" onPress={onConnect} />}
      </View>

      {/* Connection Indicator */}
      <View style={[styles.connectionIndicator, { backgroundColor: isConnected ? '#00da00' : '#e2e2e2' }]} />

      {/* Input Modal */}
      <Modal visible={modalVisible} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>{modalTitle}</Text>
            <TextInput
              value={modalValue}
              onChangeText={setModalValue}
              style={styles.modalInput}
              autoFocus
            />
            <View style={styles.modalButtons}>
              <Button title="Submit" onPress={handleModalSubmit} />
              <Button title="Cancel" onPress={() => setModalVisible(false)} />
            </View>
          </View>
        </View>
      </Modal>

    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f4ede3',
    paddingTop: 40,
    paddingHorizontal: 10,
  },
  membersList: {
    maxHeight: 50,
    marginBottom: 10,
  },
  memberButton: {
    backgroundColor: '#3e103f',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 20,
    marginRight: 8,
  },
  memberText: {
    color: 'white',
    fontWeight: 'bold',
  },
  chatScroll: {
    flex: 1,
    marginBottom: 10,
  },
  chatRow: {
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 6,
    marginBottom: 5,
    elevation: 1,
  },
  systemRow: {
    backgroundColor: '#e1e1e1',
  },
  publicRow: {
    backgroundColor: '#ffffff',
  },
  systemText: {
    fontStyle: 'italic',
  },
  publicText: {
    fontWeight: 'bold',
  },
  buttonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 20,
  },
  connectionIndicator: {
    width: 14,
    height: 14,
    borderRadius: 7,
    position: 'absolute',
    top: 45,
    right: 15,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    width: 300,
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 20,
  },
  modalTitle: {
    fontSize: 16,
    marginBottom: 10,
  },
  modalInput: {
    borderBottomWidth: 1,
    borderColor: '#888',
    marginBottom: 15,
    paddingVertical: 4,
    paddingHorizontal: 2,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
});
