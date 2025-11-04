import React from 'react';
import { View, Text, Button, FlatList, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';

export const ChatClient = (props) => {
  return (
    <View style={styles.container}>
      {/* Members List */}
      <View style={styles.membersList}>
        <FlatList
          data={props.members}
          keyExtractor={(item) => item}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.memberItem}
              onPress={() => props.onPrivateMessage(item)}
            >
              <Text style={styles.memberText}>{item}</Text>
            </TouchableOpacity>
          )}
        />
      </View>

      {/* Chat & Buttons */}
      <View style={styles.chatContainer}>
        <ScrollView style={styles.chatScroll}>
          {props.chatRows.map((item, i) => (
            <View key={i} style={styles.chatRow}>
              {item}
            </View>
          ))}
        </ScrollView>

        <View style={styles.buttonsContainer}>
          {props.isConnected && (
            <Button title="Send Public Message" onPress={props.onPublicMessage} />
          )}
          {props.isConnected && (
            <Button title="Disconnect" onPress={props.onDisconnect} />
          )}
          {!props.isConnected && (
            <Button title="Connect" onPress={props.onConnect} />
          )}
        </View>

        {/* Connection Indicator */}
        <View
          style={[
            styles.connectionIndicator,
            { backgroundColor: props.isConnected ? '#00da00' : '#e2e2e2' },
          ]}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: '#f4ede3',
    paddingTop: 20,
  },
  membersList: {
    width: 100,
    backgroundColor: '#3e103f',
  },
  memberItem: {
    paddingVertical: 12,
    paddingHorizontal: 10,
  },
  memberText: {
    color: 'white',
    fontWeight: '800',
  },
  chatContainer: {
    flex: 1,
    padding: 10,
    position: 'relative',
  },
  chatScroll: {
    flex: 1,
    marginBottom: 10,
  },
  chatRow: {
    marginBottom: 9,
  },
  buttonsContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    gap: 7,
  },
  connectionIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
    position: 'absolute',
    top: 8,
    right: 9,
  },
});
