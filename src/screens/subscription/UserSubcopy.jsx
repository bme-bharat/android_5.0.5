

import React, { useEffect, useRef, useState } from 'react';
import { Alert, View, Text, ScrollView, StyleSheet, TouchableOpacity, ToastAndroid,  Animated, ActivityIndicator, Modal, TouchableWithoutFeedback } from 'react-native';
import axios from 'axios';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import RazorpayCheckout from 'react-native-razorpay';
import RNRestart from 'react-native-restart';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { useNavigation, useRoute } from '@react-navigation/native';
import { showToast } from '../AppUtils/CustomToast';
import { useNetwork } from '../AppUtils/IdProvider';
import apiClient from '../ApiClient';

const UserSubscriptionScreen = () => {
  const { myId, myData } = useNetwork();

  const navigation = useNavigation();
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState('success');
  const [showRecommendedModal, setShowRecommendedModal] = useState(false);
  const [selectedPackage, setSelectedPackage] = useState(null);

  const name = myData?.first_name;
  const phone = myData?.user_phone_number;
  const email = myData?.user_email_id;
  // console.log('name',name)
  // console.log('phone',phone)
  // console.log('email',email)


  const packages = [
    {
      name: 'Basic',
      day: '30',
      price: '59',
      amount: 59,
      validity: '30',
      features: [true, true, true, true, true, true, true, true, true],
    },
    // {
    //   name: 'Pro',
    //   day: '180',
    //   price: '336',
    //   amount: 336,
    //   validity: '180',
    //   features: [true, true, true, true, true, true, true, true],
    // },
    // {
    //   name: 'Elite',
    //   day: '365',
    //   price: '637',
    //   amount: 637,
    //   validity: '365',
    //   features: [true, true, true, true, true, true, true, true],
    // },
  ];

  const featuresList = [
    'Job updates',
    'Premium knowledge resources',
    'Access to companies and product\'s information',
    'Unlimited access to forum',
    'Enhanced job portal features ',
    'Priority customer support',
    'Regular updates on biomedical engineering',
    'Professional networking',
    'Access to latest biomedical events and exhibitions',
  ];

  const initiatePayment = async (pkg) => {

    try {
      const response = await axios.post('https://5kh43xmxxl.execute-api.ap-south-1.amazonaws.com/dev/razorpay', {
        command: 'razorpay',
        user_id: myId,
        amount: pkg.amount,
        currency: 'INR',
        plan_type: pkg.name,
      }, {
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': 'k1xuty5IpZ2oHOEOjgMz57wHfdFT8UQ16DxCFkzk',
        },
      });
      // console.log("response.data1",response.data)
      // Check if the response contains the order
      if (response.data && response.data.order) {
        // console.log("response.data2",response.data)
        const order = response.data.order;

        const options = {
          key: 'rzp_live_l3vOFR4C3UPqLa',
          amount: order.amount,
          currency: order.currency,
          name: 'BME BHARAT',
          description: 'BME BHARAT Transaction',
          image: 'https://bmebharat.com/assets/images/logo.png',
          order_id: order.id,
          prefill: {
            name: name || "undefined",
            email: email || "undefined",
            contact: phone || "undefined",
          },
          notes: {
            address: 'BME BHARAT Office Address',
          },
          theme: {
            color: '#3399cc',
          },
        };


        RazorpayCheckout.open(options)
          .then((data) => {
            setModalType('loading');
            setShowModal(true);
            verifyPayment(data);
          })
          .catch((error) => {

            setModalType('failure');
            setShowModal(true);

            deleteDueTransaction();
          });
      } else {

      }
    } catch (error) {

      showToast("You don't have an internet connection", 'error');

    }
  };

  const deleteDueTransaction = async () => {
    try {
      const response = await axios.post(
        'https://5kh43xmxxl.execute-api.ap-south-1.amazonaws.com/dev/deleteDueTransactions', // API endpoint for deleting due transaction
        {
          command: 'deleteDueTransactions',
          user_id: myId,
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'x-api-key': 'k1xuty5IpZ2oHOEOjgMz57wHfdFT8UQ16DxCFkzk',
          }
        }
      );

      if (response.data.statusCode === 400) {

      } else {


      }
    } catch (error) {


    }
  };


  const verifyPayment = async (paymentData) => {
    try {
      const verifyResponse = await axios.post('https://5kh43xmxxl.execute-api.ap-south-1.amazonaws.com/dev/verifyPayment', {
        command: 'verifyPayment',
        razorpay_order_id: paymentData.razorpay_order_id,
        razorpay_payment_id: paymentData.razorpay_payment_id,
        razorpay_signature: paymentData.razorpay_signature,
      }, {
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': 'k1xuty5IpZ2oHOEOjgMz57wHfdFT8UQ16DxCFkzk',
        },
      });

      if (verifyResponse.data.statusCode === 200) {
        setModalType('success');
        await fetchAndStore();

      } else {
        setModalType('failure');
      }
    } catch (error) {
      setModalType('failure');
    } finally {

    }
  };

  const fetchAndStore = async () => {
    try {

      const response = await axios.post(
        'https://h7l1568kga.execute-api.ap-south-1.amazonaws.com/dev/getUserDetails',
        {
          command: 'getUserDetails',
          user_id: myId,
        },
        {
          headers: {
            'x-api-key': 'k1xuty5IpZ2oHOEOjgMz57wHfdFT8UQ16DxCFkzk',
          }
        }
      );

      console.log('Full API Response:', JSON.stringify(response.data, null, 2));

      if (response.data?.status === 'success' && response.data?.status_message) {
        const userData = response.data.status_message;

        console.log('Extracted userData:', JSON.stringify(userData, null, 2));

        await AsyncStorage.setItem('normalUserData', JSON.stringify(userData));

        const storedData = await AsyncStorage.getItem('normalUserData');
        console.log('Stored normalUserData from AsyncStorage:', storedData);

        return userData;
      } else {
        console.warn('Failed to fetch user data. Response:', JSON.stringify(response.data, null, 2));
      }
    } catch (error) {
      console.error('Error fetching and storing user data:', error);
    }
  };




  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
        <Icon name="arrow-left" size={24} color="#075cab" />
      </TouchableOpacity>

      <ScrollView
        contentContainerStyle={styles.scrollViewContent}
        showsVerticalScrollIndicator={false}
      >
        <TouchableOpacity activeOpacity={1}>
          <View style={styles.fullpage}>
            <View style={styles.subscriptionWrapper}>

              <Text style={styles.durationtext}>Subscription</Text>
              <Text style={[styles.durationtext, { fontWeight: '400', fontSize: 17 }]}>
                Validity-30 days
              </Text>

            </View>

            <View style={styles.divider} />

            <View style={styles.table}>
              <View style={styles.row}>

                {packages.map((pkg, pkgIndex) => (
                  <Text key={pkgIndex} style={styles.amountText}>
                    ₹ {pkg.amount}
                  </Text>

                ))}

              </View>

              {featuresList.map((feature, index) => (
                <View
                  key={index}
                  style={[
                    styles.featureRow,
                    { backgroundColor: index % 2 === 0 ? '#F8F9FC' : '#F8F9FC' },
                  ]}
                >
                  <View style={styles.iconRow}>
                    {packages.map((pkg, pkgIndex) => (
                      <Icon
                        key={pkgIndex}
                        name={pkg.features[index] ? 'check-bold' : 'close'}
                        size={22}
                        color={pkg.features[index] ? 'green' : 'red'}
                        style={styles.icon}
                      />
                    ))}
                  </View>
                  <Text style={styles.featureText}>{feature}</Text>
                </View>
              ))}

              {packages.map((pkg, pkgIndex) => (
                <View key={pkgIndex} style={styles.column}>
                  <TouchableOpacity
                    style={styles.button}
                    onPress={() => {
                      setSelectedPackage(pkg);
                      setShowRecommendedModal(true);
                    }}
                  >
                    <Text style={styles.buttonText}>Buy now</Text>
                  </TouchableOpacity>

                </View>
              ))}
            </View>
          </View>
        </TouchableOpacity>
      </ScrollView>

      <Modal
        visible={showModal}
        transparent
        animationType="fade"
        hardwareAccelerated
        statusBarTranslucent
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Icon
              name={
                modalType === 'success'
                  ? 'check-circle'
                  : modalType === 'failure'
                    ? 'close-circle'
                    : 'progress-clock'
              }
              size={60}
              color={
                modalType === 'success'
                  ? 'green'
                  : modalType === 'failure'
                    ? 'red'
                    : 'gray'
              }
            />

            <Text style={[
              styles.modalTitle,
              { color: modalType === 'success' ? 'green' : modalType === 'failure' ? 'red' : 'gray' }
            ]}>
              {modalType === 'success'
                ? 'Payment Successful'
                : modalType === 'failure'
                  ? 'Payment Failed'
                  : 'Verifying Payment...'}
            </Text>

            {modalType === 'loading' && (
              <ActivityIndicator size="large" color="#3399cc" style={{ marginVertical: 20 }} />
            )}

            <Text style={styles.modalMessage}>
              {modalType === 'success'
                ? "We've sent receipt to your registered email."
                : modalType === 'failure'
                  ? 'Your payment could not be completed.'
                  : 'Please wait while we verify your payment...'}
            </Text>

            {modalType !== 'loading' && (
              <TouchableOpacity
                style={styles.modalButton}
                onPress={() => {
                  setShowModal(false);
                  if (modalType === 'success') {
                    setTimeout(() => {
                      RNRestart.Restart();
                    }, 500);
                  }
                }}
              >
                <Text style={styles.modalButtonText}>
                  {modalType === 'success' ? 'Continue' : 'Try Again'}
                </Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </Modal>

      <Modal
        visible={showRecommendedModal}
        transparent
        animationType="fade"
        hardwareAccelerated
        statusBarTranslucent
      >
        <TouchableWithoutFeedback onPress={() => setShowRecommendedModal(false)}>
          <View style={styles.modalOverlay}>
            <TouchableWithoutFeedback onPress={() => { }}>
              <View style={styles.recommendModalContent}>
                <TouchableOpacity
                  style={styles.closeIcon}
                  onPress={() => setShowRecommendedModal(false)}
                >
                  <Icon name="close" size={22} color="#444" />
                </TouchableOpacity>

                <Icon name="star-circle" size={56} color="#f9a825" />
                <Text style={styles.recommendModalTitle}>🎉 Special Offer: Get 1 Month FREE!</Text>

                <Text style={styles.recommendModalText}>
                  <Text style={{ fontWeight: 'bold', }}>
                    Subscribe to the BME Bharat app for 12 months and pay for only 11!
                  </Text>
                </Text>


                <View style={styles.planBlock}>
                  {/* Premium Plan */}
                  <Text style={styles.strikePrice}>
                    499 x 12 = <Text style={styles.strikeOnly}>₹5,988</Text>
                  </Text>
                  <Text style={styles.realPrice}>
                    ₹5,489 <Text style={styles.savingsText}>(Save ₹499)</Text>
                  </Text>

                  <View style={{ height: 12 }} />

                  {/* Basic Plan */}
                  <Text style={styles.strikePrice}>
                    ₹59 x 12 = <Text style={styles.strikeOnly}>₹708</Text>
                  </Text>
                  <Text style={styles.realPrice}>
                    ₹649 <Text style={styles.savingsText}>(Save ₹59)</Text>
                  </Text>
                </View>



                <Text style={styles.recommendModalSubText}>
                  Enjoy uninterrupted access for a full year!
                </Text>
                <Text style={styles.recommendModalSubText}>
                  Limited-time offer – Grab it now!
                </Text>

                <View style={styles.recommendButtons}>
                  <TouchableOpacity
                    style={[styles.modalButton, { backgroundColor: '#f57c00' }]}
                    onPress={() => {
                      setShowRecommendedModal(false);
                      // initiatePayment({
                      //   name: 'Premium',
                      //   amount: 5489,
                      //   validity: '365',
                      //   features: new Array(9).fill(true),
                      // });
                    }}
                  >
                    <Text style={styles.modalButtonText}>Get Premium Plan</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    onPress={() => {
                      setShowRecommendedModal(false);
                      initiatePayment(selectedPackage);
                    }}
                    style={{ paddingVertical: 8 }}
                  >
                    <Text style={{ color: '#888', fontSize: 14, textAlign: 'center' }}>
                      No thanks, continue with Basic
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>





    </View>

  );
};


const styles = StyleSheet.create({
  priceComparison: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
    marginBottom: 20,
    gap: 12,
    width: '100%',
  },

  priceCard: {
    flex: 1,
    backgroundColor: '#e8f5e9',
    borderRadius: 12,
    padding: 14,
    alignItems: 'center',
  },

  planLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: '#555',
  },


  strikePrice: {
    fontSize: 14,
    color: '#999',
  },
  strikeOnly: {
    textDecorationLine: 'line-through',
    color: '#999',
  },

  planBlock: {
    width: '100%',
    paddingVertical: 18,
    paddingHorizontal: 50,
    borderRadius: 12,
    backgroundColor: '#e3f2fd',
    marginVertical: 10,
    alignItems: 'center',

  },


  realPrice: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2e7d32',
    marginTop: 2,
  },


  savingsText: {
    fontSize: 14,
    color: '#388e3c',
    fontWeight: '500',
  },
  closeIcon: {
    position: 'absolute',
    top: 12,
    right: 12,
    zIndex: 10,
    padding: 4,
    backgroundColor:'#f0f0f0',
    borderRadius:75,
  },  

  recommendModalContent: {
    backgroundColor: '#fff',
    padding: 20,
    margin: 20,
    borderRadius: 16,
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,

  },

  recommendModalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#333',
    marginVertical: 12,
    textAlign: 'center',

  },


  recommendModalText: {
    fontSize: 16,
    marginVertical: 10,
    textAlign: 'center',
    color: '#333',

  },

  recommendModalSubText: {
    fontSize: 14,
    color: '#555',
    textAlign: 'center',
    marginBottom: 16,
  },

  recommendButtons: {
    flexDirection: 'column',
    gap: 12,
    width: '100%',
  },

  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 999,
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 20,
    alignItems: 'center',
    width: '80%',
    elevation: 5,
  },

  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 10,
    color: 'green',
  },
  modalMessage: {
    fontSize: 16,
    marginVertical: 10,
    textAlign: 'center',
  },
  modalButton: {
    marginTop: 15,
    backgroundColor: '#075cab',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',

  },
  modalButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },


  amountText: {
    textAlign: 'center',
    fontSize: 27,
    color: '#075cab',
    fontWeight: '600',

  },
  sparkleContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    pointerEvents: 'none',
    zIndex: 999,

  },

  star: {
    position: 'absolute',
    width: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },

  ray: {
    position: 'absolute',
    width: 2,
    height: 10,
    backgroundColor: 'gold',
    borderRadius: 1,
  },



  backButton: {
    padding: 10,
    alignSelf: 'flex-start'
  },

  container: {
    backgroundColor: 'white',
    flex: 1,
  },

  scrollViewContent: {
    paddingBottom: '20%',
    paddingHorizontal: 10,
  },


  divider: {
    height: 0.7,
    backgroundColor: "#075cab",
  },
  subscriptionWrapper: {
    padding: 10
  },
  fullpage: {
    borderWidth: 0.5,
    borderColor: '#075cab',
    borderRadius: 25,
    padding: 2,
  },
  durationtext: {
    fontWeight: '600',
    fontSize: 22,
    color: '#075cab',
    textAlign: 'center',
    padding: 2,
  },
  row: {
    flexDirection: 'row',
    marginBottom: 5,
    alignSelf: 'center'
  },
  buyNowRow: {
    alignSelf: 'center',
    borderWidth: 0.5,
    borderColor: '#075cab',
    // paddingTop: 10,
    paddingHorizontal: 20
  },
  featureText1: {
    flex: 1,
    fontWeight: 'bold',
    fontSize: 16,
  },

  table: {
    borderRadius: 5,
    overflow: 'hidden',

    // padding: 1,
  },
  button: {
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 20,
    alignItems: 'center',
    alignSelf: 'center',
    borderColor: '#075cab',
    borderWidth: 0.5,
    backgroundColor: '#ffffff',

    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 4,

    marginVertical: 15,
    transform: [{ translateY: -1 }],
  },

  buttonText: {
    textAlign: 'center',
    fontSize: 18,
    color: '#075cab',
    fontWeight: '900',

  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 8,
    marginVertical: 2,

  },

  featureText: {
    flex: 5,
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
    paddingLeft: 30,

  },

  iconRow: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-around',
  },



});

export default UserSubscriptionScreen;


