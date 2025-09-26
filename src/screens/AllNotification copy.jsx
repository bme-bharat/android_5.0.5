import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  FlatList, 
  StyleSheet, 
  KeyboardAvoidingView, 
  Platform, 
  ActivityIndicator,
  Image
} from 'react-native';
import { useNavigation } from '@react-navigation/native';

import Ionicons from 'react-native-vector-icons/MaterialCommunityIcons';
// Mock API client - replace with your actual apiClient
const apiClient = {
  post: async (endpoint, data) => {
    // Mock response for postInForum
    if (endpoint === '/postInForum') {
      return new Promise(resolve => setTimeout(() => resolve({
        data: {
          status: 'success',
          forum_details: {
            forum_id: `mock_${Math.random().toString(36).substr(2, 9)}`,
            posted_on: Math.floor(Date.now() / 1000),
            user_id: data.user_id,
            author: 'You',
            author_category: 'User',
          },
          status_message: 'Successfully posted!'
        }
      }), 500));
    }
    
    // Mock response for getAllForumPosts
    if (endpoint === '/getAllForumPosts') {
      const mockMessages = [
        {
          forum_id: 'mock_1',
          text: 'Welcome to the chat!',
          user_id: 'system_1',
          author: 'System',
          author_category: 'Bot',
          posted_on: Math.floor(Date.now() / 1000) - 3600,
          extraData: { message: { text: 'Welcome to the chat!' } }
        },
        {
          forum_id: 'mock_2',
          text: 'How can I help you today?',
          user_id: 'system_1',
          author: 'Support',
          author_category: 'Staff',
          posted_on: Math.floor(Date.now() / 1000) - 1800,
          extraData: { message: { text: 'How can I help you today?' } }
        }
      ];
      return new Promise(resolve => setTimeout(() => resolve({
        data: {
          status: 'success',
          response: mockMessages,
          count: mockMessages.length
        }
      }), 500));
    }
  }
};

// Mock user data - replace with your actual useNetwork hook
const useMockNetwork = () => ({
  myId: `user_${Math.random().toString(36).substr(2, 6)}`,
  myData: {
    name: 'You',
    category: 'Member',
    fileKey: null,
    gender: 'Male'
  }
});

const AllNotification = () => {
  // State management
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const flatListRef = useRef(null);
  
  // Mock data
  const { myId, myData } = useMockNetwork();
  const navigation = useNavigation();
  const conversationId = "global_chat_1";

  // Mock avatar images
  const mockAvatars = {
    Male: 'https://randomuser.me/api/portraits/men/1.jpg',
    Female: 'https://randomuser.me/api/portraits/women/1.jpg',
    Bot: 'https://robohash.org/system',
    Staff: 'https://randomuser.me/api/portraits/lego/1.jpg',
    default: 'https://randomuser.me/api/portraits/med/men/1.jpg'
  };

  // Format messages
  const formatMessages = useCallback((posts) => {
    return posts?.map(post => ({
      id: post.forum_id,
      text: post.extraData?.message?.text || post.text || '',
      senderId: post.user_id,
      senderName: post.author,
      timestamp: new Date((post.posted_on || 0) * 1000).toISOString(),
      status: 'sent',
      userData: {
        avatar: mockAvatars[post.author_gender || post.author_category || 'default'],
        category: post.author_category || 'User'
      }
    })) || [];
  }, []);

  // Fetch messages
  const fetchMessages = useCallback(async () => {
    try {
      const res = await apiClient.post('/getAllForumPosts', {
        type: 'All',
        command: "getAllForumPosts",
        user_id: myId,
        extraData: { conversationId }
      });

      if (res.data?.status === 'success') {
        setMessages(prev => {
          const newMessages = formatMessages(res.data.response);
          const existingIds = new Set(prev.map(m => m.id));
          
          return [
            ...prev.filter(m => m.status !== 'sending'),
            ...newMessages.filter(m => !existingIds.has(m.id))
          ].sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
        });
      }
    } catch (error) {
      console.error("Fetch error:", error);
    } finally {
      setIsLoading(false);
    }
  }, [myId, formatMessages]);

  // Initial load
  useEffect(() => {
    fetchMessages();
    const interval = setInterval(fetchMessages, 10000);
    return () => clearInterval(interval);
  }, [fetchMessages]);

  // Send message
  const handleSendMessage = async () => {
    if (!newMessage.trim() || isSending) return;

    const tempId = Date.now().toString();
    const newMsg = {
      id: tempId,
      text: newMessage,
      senderId: myId,
      senderName: myData.name,
      timestamp: new Date().toISOString(),
      status: 'sending',
      userData: {
        avatar: mockAvatars[myData.gender],
        category: myData.category
      }
    };

    setMessages(prev => [...prev, newMsg]);
    setNewMessage('');
    setIsSending(true);

    try {
      const res = await apiClient.post('/postInForum', {
        command: "postInForum",
        user_id: myId,
        extraData: {
          action: 'send',
          conversationId,
          message: { text: newMessage }
        }
      });

      if (res.data?.status === 'success') {
        console.log('res.data',res.data)
        setMessages(prev => prev.map(msg => 
          msg.id === tempId ? {
            ...msg,
            id: res.data.forum_details.forum_id,
            status: 'sent',
            timestamp: new Date(res.data.forum_details.posted_on * 1000).toISOString()
          } : msg
        ));
      }
    } catch (error) {
      setMessages(prev => prev.map(msg => 
        msg.id === tempId ? { ...msg, status: 'failed' } : msg
      ));
    } finally {
      setIsSending(false);
    }
  };

  // Render message
  const renderMessage = ({ item }) => {
    const isMe = item.senderId === myId;
    return (
      <View style={[
        styles.messageContainer,
        isMe ? styles.myMessageContainer : styles.otherMessageContainer
      ]}>
        {!isMe && (
          <Image 
            source={{ uri: item.userData.avatar }} 
            style={styles.avatar} 
            resizeMode="cover"
          />
        )}
        
        <View style={[
          styles.messageBubble,
          isMe ? styles.myMessage : styles.otherMessage
        ]}>
          {!isMe && (
            <View style={styles.userInfo}>
              <Text style={styles.senderName}>{item.senderName}</Text>
              <Text style={styles.userCategory}>{item.userData.category}</Text>
            </View>
          )}
          
          <Text style={isMe ? styles.myText : styles.otherText}>
            {item.text}
          </Text>
          
          <View style={styles.messageFooter}>
            <Text style={[
              styles.timestamp,
              isMe ? styles.myTimestamp : styles.otherTimestamp
            ]}>
              {new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </Text>
            
            {isMe && (
              <Text style={styles.statusIcon}>
                {item.status === 'failed' ? ' ❌' : ''}
                {item.status === 'sending' ? ' ⏳' : ''}
                {item.status === 'sent' ? ' ✓✓' : ''}
              </Text>
            )}
          </View>
        </View>
      </View>
    );
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#6e48aa" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.canGoBack() ? navigation.goBack() : navigation.navigate('Home3')}
        >
          <Ionicons name="arrow-left" size={24} color="white" />
        </TouchableOpacity>
        
        <View style={styles.headerContent}>
          <Text style={styles.headerText}>Global Chat</Text>
          <Text style={styles.headerSubtext}>{messages.length} messages</Text>
        </View>
      </View>

      {/* Message List */}
      <FlatList
        ref={flatListRef}
        data={messages}
        renderItem={renderMessage}
        keyExtractor={item => item.id}
        onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
        onLayout={() => flatListRef.current?.scrollToEnd({ animated: true })}
        style={styles.messagesContainer}
        contentContainerStyle={styles.messagesContent}
        showsVerticalScrollIndicator={false}
      />

      {/* Input Area */}
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.inputContainer}
      >
        <TextInput
          style={styles.input}
          value={newMessage}
          onChangeText={setNewMessage}
          placeholder="Type your message..."
          placeholderTextColor="#999"
          multiline
          onSubmitEditing={handleSendMessage}
          editable={!isSending}
        />
        
        <TouchableOpacity 
          style={[
            styles.sendButton, 
            (!newMessage.trim() || isSending) && styles.disabledButton
          ]} 
          onPress={handleSendMessage}
          disabled={!newMessage.trim() || isSending}
        >
          {isSending ? (
            <ActivityIndicator color="white" size="small" />
          ) : (
            <Ionicons name="send" size={20} color="white" />
          )}
        </TouchableOpacity>
      </KeyboardAvoidingView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
    paddingHorizontal: 10,
    backgroundColor: '#6e48aa',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  backButton: {
    padding: 5,
    marginRight: 10,
  },
  headerContent: {
    flex: 1,
  },
  headerText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
  },
  headerSubtext: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 12,
    marginTop: 2,
  },
  messagesContainer: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  messagesContent: {
    paddingVertical: 15,
    paddingHorizontal: 12,
  },
  messageContainer: {
    flexDirection: 'row',
    marginBottom: 12,
    alignItems: 'flex-end',
  },
  myMessageContainer: {
    justifyContent: 'flex-end',
  },
  otherMessageContainer: {
    justifyContent: 'flex-start',
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  messageBubble: {
    maxWidth: '80%',
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 18,
  },
  myMessage: {
    backgroundColor: '#6e48aa',
    borderBottomRightRadius: 2,
  },
  otherMessage: {
    backgroundColor: 'white',
    borderBottomLeftRadius: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  userInfo: {
    marginBottom: 4,
  },
  senderName: {
    fontWeight: '600',
    fontSize: 14,
    color: '#333',
  },
  userCategory: {
    fontSize: 10,
    color: '#666',
    fontStyle: 'italic',
    marginTop: 1,
  },
  myText: {
    color: 'white',
    fontSize: 15,
    lineHeight: 20,
  },
  otherText: {
    color: '#333',
    fontSize: 15,
    lineHeight: 20,
  },
  messageFooter: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    marginTop: 4,
  },
  timestamp: {
    fontSize: 11,
    opacity: 0.7,
  },
  myTimestamp: {
    color: 'rgba(255,255,255,0.7)',
  },
  otherTimestamp: {
    color: '#999',
  },
  statusIcon: {
    marginLeft: 5,
    fontSize: 12,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
    backgroundColor: 'white',
  },
  input: {
    flex: 1,
    minHeight: 40,
    maxHeight: 120,
    paddingVertical: 8,
    paddingHorizontal: 15,
    backgroundColor: '#f0f2f5',
    borderRadius: 20,
    fontSize: 15,
    color: '#333',
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#6e48aa',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  disabledButton: {
    backgroundColor: '#ccc',
  },
});

export default AllNotification;