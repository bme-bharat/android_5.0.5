import { StyleSheet, Text, View, FlatList, ActivityIndicator, TouchableOpacity, Alert } from 'react-native';
import React, { useState, useEffect } from 'react';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useNetwork } from './AppUtils/IdProvider';
import { useConnection } from './AppUtils/ConnectionProvider';
import apiClient from './ApiClient';
import ArrowLeftIcon from '../assets/svgIcons/back.svg';
import { colors, dimensions } from '../assets/theme.jsx';
import AppStyles from './AppUtils/AppStyles.js';
import { AppHeader } from './AppUtils/AppHeader.jsx';


const AllNotification = () => {
  const { myId, myData } = useNetwork();

  const [notifications, setNotifications] = useState([]);
  const route = useRoute();
  const { userId } = route.params;
  const navigation = useNavigation();
  const { isConnected } = useConnection();

  useEffect(() => {
    const fetchNotifications = async () => {
      if (!isConnected) {

        return;
      }
      try {
        const response = await apiClient.post('/getUserNotifications', {
          command: 'getUserNotifications',
          user_id: myId,
        });

        if (response.status === 200) {
          const notifications = response.data.data || [];

          if (notifications.length === 0) {
            setNotifications({ removed_by_author: true });
          } else {
            const sortedNotifications = notifications.sort((a, b) => b.timestamp - a.timestamp);
            setNotifications(sortedNotifications);
          }
        } else {
          setNotifications({ removed_by_author: true });

        }
      } catch (err) {
        setNotifications({ removed_by_author: true });

      } finally {

      }
    };

    fetchNotifications();
  }, [myId]);

  const updateReadStatus = async (notificationId) => {
    try {
      const response = await apiClient.post('/updateReadStatus', {
        command: 'updateReadStatus',
        notification_id: notificationId,
      });

      if (response.status === 200 && response.data.updatedAttributes.read) {
        setNotifications((prevNotifications) =>
          prevNotifications.map((notification) =>
            notification.notification_id === notificationId
              ? { ...notification, read: true }
              : notification
          )
        );
      }
    } catch (error) {

    }
  };


  const renderNotification = ({ item }) => {
    const navigateToScreen = async () => {
      if (!item.read) {
        await updateReadStatus(item.notification_id);
      }

      switch (item.notificationType) {
        case 'comment':
          navigation.navigate('Comment', {
            forum_id: item.forum_id,
            highlightId: item.comment_id,
          });
          break;

        case 'reaction':
          navigation.navigate('Comment', {
            forum_id: item.forum_id,
            highlightReactId: item.reaction_id,
          });
          break;

        case 'forum_post':
          navigation.navigate('Comment', {
            forum_id: item.forum_id,
          });
          break;

        case 'job_application':
          navigation.navigate('CompanyGetJobCandidates', {
            userId: item.seeker_id,
          });
          break;

        case 'subscription_alert':
          if (item.user_type === 'company') {
            navigation.navigate('CompanySubscription');
          } else if (item.user_type === 'users') {
            navigation.navigate('UserSubscription');
          }
          break;

        case 'service_enquiry':
          if (item.enquiry_id) {
            navigation.navigate('EnquiryDetails', {
              enquiryID: item.enquiry_id,
            });
          } else {
            console.warn('❌ Missing enquiry_id in notification item:', item);
          }
          break;

        case 'job_suggestion':
          if (item.job_post_id) {
            navigation.navigate('JobDetail', {
              post_id: item.job_post_id,
            });
          } else {
            console.warn('❌ Missing enquiry_id in notification item:', item);
          }
          break;

        case 'contact_alert':
          if (item.enquirer_user_type === 'users') {
            navigation.navigate('UserDetails', {
              userId: item.enquirer_id,
            });
          } else if (item.enquirer_user_type === 'company') {
            navigation.navigate('CompanyDetails', {
              userId: item.enquirer_id,
            });
          } else {
            console.warn('❌ Unknown enquirer_user_type:', item.enquirer_user_type);
          }
          break;


        // Add more types as needed
      }
    };


    return (
      <TouchableOpacity onPress={navigateToScreen} activeOpacity={0.8} style={styles.notificationItem}>

        <Text style={[styles.message, item.read && styles.readMessage, !item.read && styles.unreadMessage]}>
          {item.message}
        </Text>

        <Text key={item.id} style={{ alignSelf: 'flex-end', color: colors.text_secondary, fontSize: 11, fontWeight: '300' }}>
          {formatTimeAgo(item.timestamp)}
        </Text>


      </TouchableOpacity>
    );
  };

  const formatTimeAgo = (timestamp) => {
    const now = new Date();
    const timeAgo = now.getTime() - timestamp * 1000; // Convert the timestamp to milliseconds
    const seconds = Math.floor(timeAgo / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    // Return the relative time in different formats
    if (seconds < 60) {
      return `${seconds} sec ago`;
    } else if (minutes < 60) {
      return `${minutes} mins ago`;
    } else if (hours < 24) {
      return `${hours} hrs ago`;
    } else {
      return `${days} days ago`;
    }
  };


  const isLoading = !notifications
  const isRemoved = notifications?.removed_by_author
  const hassNotification = notifications?.length > 0

  return (
    <View style={styles.container}>
      <AppHeader
        title={'All notifications'}

      />
      {isLoading && (
        <View style={AppStyles.center}>
          <ActivityIndicator size="small" color="#075cab" />
        </View>
      )}

      {!isLoading && isRemoved && (
        <View style={AppStyles.center}>
          <Text style={AppStyles.removedText}>
            No notifications available
          </Text>
        </View>
      )}

      {!isLoading && !isRemoved && hassNotification && (
        <>
          <FlatList
            data={notifications}
            keyExtractor={(item) => item.notification_id}
            renderItem={renderNotification}
            showsVerticalScrollIndicator={false}

          />
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',

    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  backButton: {
    alignSelf: 'flex-start',
    padding: 10,

  }
  ,
  notificationItem: {
    backgroundColor: '#ffffff',
    borderRadius: 8,
    padding: 10,
    marginBottom: 5,
    marginHorizontal: 5,
    elevation: 2,
    top: 5
  },
  message: {
    color: '#333',
  },
  readMessage: {
    color: colors.text_secondary,
  },
  unreadMessage: {
    color: colors.text_primary,
    fontWeight: '500'

  },
  commentorName: {

    color: '#555',
    marginBottom: 5,
  },
  unreadCommentorName: {
    fontWeight: 'bold',
    color: '#000',
  },
  timestamp: {

    color: '#888',
    marginTop: 10,
    textAlign: 'right',
  },
});



export default AllNotification;
