


import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View, FlatList, TouchableOpacity, ActivityIndicator, Image } from 'react-native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { useNavigation } from '@react-navigation/native';
import apiClient from '../ApiClient';
import ArrowLeftIcon from '../../assets/svgIcons/back.svg';

import { colors, dimensions } from '../../assets/theme';
import AppStyles from '../AppUtils/AppStyles';
import { AppHeader } from '../AppUtils/AppHeader';
import { useNetwork } from '../AppUtils/IdProvider';
import FastImage from '@d11/react-native-fast-image';

const YourSubscriptionListScreen = () => {
  const { myId, myData } = useNetwork();
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);



  useEffect(() => {
    const fetchTransactions = async () => {
      if (myId) {
        setLoading(true);
        try {
          const response = await apiClient.post(
            '/getUsersTransactions',
            {
              command: "getUsersTransactions",
              user_id: myId,
            }
          );

          const completedTransactions = response.data.response.filter(
            transaction => transaction.transaction_status === "captured"
          );
          setTransactions(completedTransactions);
          // console.log('completedTransactions', completedTransactions)
        } catch (err) {
          setError(true);
        } finally {
          setLoading(false);
        }
      }
    };

    fetchTransactions();
  }, [myId]);

  const renderItem = ({ item }) => {
    return (
      <View style={styles.txCard}>

        {/* Header */}
        <View style={styles.txHeader}>
          <Text style={styles.planName}>{item.subscription_plan}</Text>
          <Text style={styles.amount}>₹{item.amount}</Text>
        </View>

        {/* Status */}
        <View style={styles.statusRow}>
          <Text style={styles.statusLabel}>Status</Text>
          <Text
            style={[
              styles.statusValue,
              item.transaction_status === 'captured'
                ? styles.success
                : styles.failed,
            ]}
          >
            {item.transaction_status === 'captured'
              ? 'Successful'
              : item.transaction_status}
          </Text>
        </View>

        {/* Details */}
        <View style={styles.row}>
          <Text style={styles.label}>Transaction ID</Text>
          <Text style={styles.valueMono} numberOfLines={1}>
            {item.razorpay_payment_id}
          </Text>
        </View>

        <View style={styles.row}>
          <Text style={styles.label}>Order ID</Text>
          <Text style={styles.valueMono} numberOfLines={1}>
            {item.order_id}
          </Text>
        </View>

        <View style={styles.row}>
          <Text style={styles.label}>Payment Method</Text>
          <Text style={styles.value}>
            {item.payment_gateway === 'RAZORPAY' ? 'UPI / Razorpay' : item.payment_gateway}
          </Text>
        </View>

        <View style={styles.row}>
          <Text style={styles.label}>Paid On</Text>
          <Text style={styles.value}>
            {/* format in your parent if needed */}
            {new Date(item.transaction_on * 1000).toLocaleString()}
          </Text>
        </View>

        {/* Subscription */}
        <View style={styles.divider} />

        <View style={styles.row}>
          <Text style={styles.label}>Validity</Text>
          <Text style={styles.value}>{item.transaction_duration}</Text>
        </View>

        <View style={styles.row}>
          <Text style={styles.label}>Expires On</Text>
          <Text style={styles.value}>
            {new Date(item.subscription_expires_on * 1000).toLocaleDateString()}
          </Text>
        </View>

        <View style={styles.row}>
          <Text style={styles.label}>Subscription Status</Text>
          <Text style={[styles.value, styles.success]}>
            {item.isActive ? 'Active' : 'Expired'}
          </Text>
        </View>

      </View>
    );
  };



  const isLoading = loading
  const isRemoved = error
  const hasSubscription = transactions?.length > 0

  return (
    <View style={styles.container}>


      <AppHeader
        title={"My subscriptions"}

      />
      {isLoading && (
        <View style={AppStyles.center}>
          <ActivityIndicator size="small" color="#075cab" />
        </View>
      )}

      {isRemoved && (
        <View style={AppStyles.center}>
          <Text style={AppStyles.removedText}>
            No active subscriptions
          </Text>
        </View>
      )}


      {!isLoading && !isRemoved && hasSubscription && (
        <>
          <FlatList
            data={[...transactions].sort((a, b) => b.transaction_on - a.transaction_on)} // newest first
            renderItem={renderItem}
            keyExtractor={(item) => item.transaction_id}
            showsHorizontalScrollIndicator={false}

          />

        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    // padding: 10,

  },

  header: {
    fontSize: 18,
    fontWeight: '600',
    padding: 10,
    color: '#075cab',
    textAlign: 'center',
  },
  backButton: {
    alignItems: 'flex-start',
    padding: 10

  },
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderColor: '#f0f0f0'

  },
  itemContainer: {
    top: 5,
    padding: 10,
    marginHorizontal: 5,
    marginBottom: 5,
    borderRadius: 12,
    backgroundColor: '#ffffff',
    borderColor: '#ddd',
    borderWidth: 0.5,
    elevation: 3,
    shadowColor: '#0d6efd',
  },
  detailContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  lableIconContainer: {
    flexDirection: 'row',
    flex: 1, // Take up available space
    color: 'black',
    fontWeight: '500',
    fontSize: 15,
    textAlign: 'left', // Align text to the left
    alignSelf: 'flex-start',
  },
  itemTitle: {
    flex: 1, // Take up available space
    color: colors.text_primary,
    fontWeight: '400',
    fontSize: 14,
    textAlign: 'left', // Align text to the left
    alignSelf: 'flex-start',
  },
  itemValue: {
    flex: 2, // Take the remaining space
    flexShrink: 1,
    color: colors.text_secondary,
    fontWeight: '400',
    fontSize: 13,
    textAlign: 'left', // Align text to the left
    alignSelf: 'flex-start',
  },
  colon: {
    width: 20, // Fixed width for the colon
    textAlign: 'center', // Center the colon
    color: 'black',
    fontWeight: '500',
    fontSize: 15,
    alignSelf: 'flex-start',

  },
  loadingText: {
    fontSize: 18,
    color: '#00796b',
    marginTop: 10,
    textAlign: 'center',
  },
  errorText: {
    fontSize: 20,
    marginTop: 10,
    textAlign: 'center',
    color: "black"
  },
  txCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 14,
    marginHorizontal: 16,
    marginVertical: 8,

    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
    elevation: 2,
  },

  txHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },

  planName: {
    fontSize: 15,
    fontWeight: '700',
    color: '#111',
  },

  amount: {
    fontSize: 18,
    fontWeight: '800',
    color: '#111',
  },

  statusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },

  statusLabel: {
    fontSize: 12,
    color: '#777',
  },

  statusValue: {
    fontSize: 12,
    fontWeight: '700',
  },

  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 4,
  },

  label: {
    fontSize: 12,
    color: '#777',
  },

  value: {
    fontSize: 12,
    color: '#111',
    maxWidth: '60%',
    textAlign: 'right',
  },

  valueMono: {
    fontSize: 11,
    color: '#333',
    fontFamily: 'monospace',
    maxWidth: '60%',
    textAlign: 'right',
  },

  divider: {
    height: 1,
    backgroundColor: '#EEE',
    marginVertical: 8,
  },

  success: {
    color: '#2ECC71',
  },

  failed: {
    color: '#FF4D4F',
  },

});

export default YourSubscriptionListScreen;
