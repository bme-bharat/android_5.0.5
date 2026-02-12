import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  ScrollView,
  ImageBackground,
  Modal,
  Platform,
} from "react-native";
import LinearGradient from "react-native-linear-gradient";
import PagerView from "react-native-pager-view";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNetwork } from "../AppUtils/IdProvider";
import MaterialIcons from '@react-native-vector-icons/material-icons'
import { AppHeader } from "../AppUtils/AppHeader";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  interpolateColor,
  Easing,
} from "react-native-reanimated";
import Badge from '../../assets/svgIcons/badge.svg';
import { ScaledSheet } from 'react-native-size-matters';
import { Image } from "react-native-svg";
import Message from "../../components/Message";
import { useNavigation, useRoute } from "@react-navigation/native";
import { useLogoutManager } from "../AppUtils/useLogoutManager";
import LottieView from "lottie-react-native";
import Close from '../../assets/svgIcons/close-large.svg';
import { colors, dimensions } from '../../assets/theme.jsx';
import { showToast } from '../AppUtils/CustomToast.jsx';
import RazorpayCheckout from 'react-native-razorpay';
import axios from "axios";
import PaymentStatus from "./PaymentStatus.jsx";
import { Appbar } from "react-native-paper";
import { smartGoBack } from "../../navigation/smartGoBack.jsx";
const { width, height } = Dimensions.get("window");
const minHeight = height * 0.6;
const CARD_WIDTH = width - 32;
const badgeWidth = 100;
const badgeHeight = badgeWidth * (148 / 277); // calculate height to preserve aspect ratio

const TAB_CONTAINER_PADDING = 4;
const TAB_COUNT = 2;
const TAB_WIDTH =
  (width - 32 - TAB_CONTAINER_PADDING * 2) / TAB_COUNT;

const PLAN_COLORS = {
  monthly: {
    gradient: ["#075CAB", "#4A90E2"],  // softer blue variant of header
    // gradient: ["#4A90E2", "#81C7FF"],
    cardBg: "#E6F3FF",                // light, airy background
    accent: "#075CAB",                // pick the softer tone, not raw header
  },

  yearly: {
    gradient: ["#4CAF50", "#81C784"],
    cardBg: "#E6F6E6",
    accent: "#4CAF50"
  },

};





const Subscription = () => {
  const { myId, myData, requireSubscription, completeSubscription, pendingUser, needsSubscription } = useNetwork();
  const route = useRoute();

  const navigation = useNavigation();

  const [messageVisible, setMessageVisible] = useState(false);
  const { logoutNow } = useLogoutManager();

  const pagerRef = useRef(null);

  const fromDrawer = route.params?.fromDrawer || false
  const [userId, setUserId] = useState(null);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [showRecommendedModal, setShowRecommendedModal] = useState(false);
  const [selectedPackage, setSelectedPackage] = useState(null);
  const [isInitiatingPayment, setIsInitiatingPayment] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState('');
  const [lastPaymentId, setLastPaymentId] = useState(null);
  const [modalCountdown, setModalCountdown] = useState(5);

  const completingRef = useRef(false);
  const [tab, setTab] = useState(0);
  const tabX = useSharedValue(0);


  const userType = myData?.user_type === "users" ? "users" : "company";
  const ctaScale = useSharedValue(1);
  const ctaProgress = useSharedValue(0);


  useEffect(() => {
    if (!myData) return;

    setUserId(myId);

    if (myData.user_type === 'company') {
      setName(myData.company_name || '');
      setEmail(myData.company_email_id || '');
      setPhone(myData.company_contact_number || '');
    } else {
      setName(myData.user_name || '');
      setEmail(myData.user_email_id || '');
      setPhone(myData.user_phone_number || '');
    }

  }, [myData, myId]);

  useEffect(() => {
    tabX.value = withTiming(tab * TAB_WIDTH, {
      duration: 260,
      easing: Easing.out(Easing.cubic),
    });
  }, [tab]);


  const indicatorStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: tabX.value }],
    backgroundColor: interpolateColor(
      tab,
      [0, 1],
      [PLAN_COLORS.monthly.accent, PLAN_COLORS.yearly.accent]
    ),
  }));

  const tabTextStyle = (index) =>
    useAnimatedStyle(() => ({
      color: interpolateColor(
        tab,
        [0, 1],
        index === 0
          ? ["#fff", "#666"]
          : ["#666", "#fff"]
      ),
    }));



  useEffect(() => {
    ctaScale.value = withRepeat(
      withTiming(1.04, { duration: 1200 }),
      -1,
      true
    );
  }, []);


  useEffect(() => {
    ctaProgress.value = withTiming(tab, { duration: 300 });
  }, [tab]);

  const ctaStyle = useAnimatedStyle(() => {
    const backgroundColor = interpolateColor(
      ctaProgress.value,
      [0, 1],
      [
        PLAN_COLORS.monthly.accent,
        PLAN_COLORS.yearly.accent,
      ]
    );

    return {
      backgroundColor,
      transform: [{ scale: ctaScale.value }],
    };
  });

  // useEffect(() => {
  //   if (!showModal) return;

  //   setModalCountdown(5);

  //   const interval = setInterval(() => {
  //     setModalCountdown((prev) => {
  //       if (prev <= 1) {
  //         clearInterval(interval);
  //         return 0;
  //       }
  //       return prev - 1;
  //     });
  //   }, 1000);

  //   const timer = setTimeout(async () => {
  //     try {
  //       console.log('⏱ Auto closing modal. Type:', modalType);
  //       setShowModal(false);

  //       if (modalType === 'success') {
  //         await handleLoginSuccess();

  //         if (fromDrawer && navigation.canGoBack()) {
  //           navigation.goBack();
  //         }
  //       }
  //     } catch (e) {
  //       console.error('Auto modal handler error:', e);
  //     }
  //   }, 5000);

  //   return () => {
  //     clearTimeout(timer);
  //     clearInterval(interval);
  //   };
  // }, [showModal, modalType]);



  const initiatePayment = async (pkg) => {
    console.log('📦 initiatePayment() called with:', pkg);
    setIsInitiatingPayment(true);
    setSelectedPackage(pkg);

    try {
      const payload = {
        command: 'razorpay',
        user_id: userId,
        amount: pkg.amount,
        currency: 'INR',
        plan_type: pkg.name,
      };

      console.log('📤 Sending payload to Razorpay API:', payload);

      const response = await axios.post(
        'https://5kh43xmxxl.execute-api.ap-south-1.amazonaws.com/dev/razorpay',
        payload,
        {
          headers: {
            'Content-Type': 'application/json',
            'x-api-key': 'k1xuty5IpZ2oHOEOjgMz57wHfdFT8UQ16DxCFkzk',
          },
        }
      );

      console.log('✅ Razorpay API response:', response.data);

      if (response.data?.order) {
        const order = response.data.order;

        const options = {
          key: 'rzp_live_l3vOFR4C3UPqLa',
          amount: order.amount,
          currency: order.currency,
          name: 'BME BHARAT',
          description: 'Plan Subscription Payment',
          image: 'https://bmebharat.com/assets/images/logo.png',
          order_id: order.id,
          prefill: {
            name: name || 'User',
            email: email || 'test@example.com',
            contact: (phone || '').replace(/\D/g, '').slice(-10),
          },
          notes: { address: 'BME BHARAT Office Address' },
          theme: { color: '#3399cc' },
        };

        console.log('🧾 Razorpay Checkout options:', options);

        try {
          const result = await RazorpayCheckout.open(options);
          console.log('✅ Razorpay Payment Success:', result);
          setLastPaymentId(result.razorpay_payment_id);
          setModalType('loading');
          setShowModal(true);
          await verifyPayment(result);
        } catch (error) {
          console.log('❌ Razorpay Error RAW:', error);
          // console.error('❌ Razorpay Failed:', JSON.stringify(error, null, 2));

          const razorError = error?.error || error;
          const errorCode = razorError?.code;
          const errorDesc = razorError?.description || '';
          const errorStep = razorError?.step;

          /**
           * 🟡 USER INTENTIONAL EXIT
           * Razorpay RN sometimes sends BAD_REQUEST_ERROR
           * when user closes checkout during authentication
           */
          const isUserCancelled =
            errorCode === 'BAD_REQUEST_ERROR' &&
            errorStep === 'payment_authentication' &&
            (!errorDesc || errorDesc === 'undefined');

          if (isUserCancelled) {
            console.log('🚪 User exited Razorpay checkout (treated as cancel)');

            // Clean up but DO NOT show failure
            await deleteDueTransaction();

            showToast('Payment cancelled', 'info'); // optional

            return; // 🚨 critical — do not mark as failure
          }

          /**
           * 🔴 REAL PAYMENT FAILURE
           */
          setModalType('failure');
          setShowModal(true);
          await deleteDueTransaction();
        }

      } else {
        console.warn('⚠️ No "order" in response:', response.data);
      }
    } catch (error) {
      // console.error('🚫 initiatePayment() error:', error.message);
      if (error.response) {
        console.log('❗ Server response:', JSON.stringify(error.response.data, null, 2));
      }
      // showToast("You don't have an internet connection", 'error');
    } finally {
      setIsInitiatingPayment(false);
      console.log('🔚 initiatePayment() completed');
    }
  };


  const deleteDueTransaction = async () => {
    try {
      const response = await axios.post(
        'https://5kh43xmxxl.execute-api.ap-south-1.amazonaws.com/dev/deleteDueTransactions', // API endpoint for deleting due transaction
        {
          command: 'deleteDueTransactions',
          user_id: userId, // Pass the user ID
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
      const verifyResponse = await axios.post(
        'https://5kh43xmxxl.execute-api.ap-south-1.amazonaws.com/dev/verifyPayment',
        {
          command: 'verifyPayment',
          razorpay_order_id: paymentData.razorpay_order_id,
          razorpay_payment_id: paymentData.razorpay_payment_id,
          razorpay_signature: paymentData.razorpay_signature,
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'x-api-key': 'k1xuty5IpZ2oHOEOjgMz57wHfdFT8UQ16DxCFkzk',
          },
        }
      );

      if (verifyResponse.data.statusCode === 200) {
        await handleLoginSuccess();
        setModalType('success');   // just change state
      } else {
        setModalType('failure');
      }

    } catch (error) {
      showToast("Payment verification failed. Please try again later", 'error');
      setModalType('failure');

    }
  };

  const handlePaymentContinue = useCallback((fromDrawer) => {
    setShowModal(false);

    if (fromDrawer) {
      navigation.replace('YourSubscriptionList');
    }
  }, [navigation]);


  const handleLoginSuccess = async () => {
    try {
      // Screen
      await completeSubscription();

    } catch (error) {
      console.error('Error processing user details:', error);
    }
  };

  const FEATURE_MATRIX = {
    users: {
      monthly: [
        'Job updates',
        'Premium knowledge resources',
        'Access to companies and product\'s information',
        'Unlimited access to forum',
        'Enhanced job portal features ',
        'Priority customer support',
        'Regular updates on biomedical engineering',
        'Professional networking',
        'Access to latest biomedical events and exhibitions'
      ],
      yearly: [
        'Job updates',
        'Premium knowledge resources',
        'Access to companies and product\'s information',
        'Unlimited access to  forum',
        'Enhanced job portal features ',
        'Priority customer support',
        'Regular updates on biomedical engineering',
        'Exclusive access to talent',
        'Company profile enhancements',
        'Professional networking',
        'Access to latest biomedical events and exhibitions',

      ],
    },
    company: {
      monthly: [
        "Job posting",
        "Limited talent access",
        "Company profile",
        "Standard support",
      ],
      yearly: [
        "Unlimited job posting",
        "Exclusive talent access",
        "Enhanced company profile",
        "Priority support",
        "Networking & events",
      ],
    },
  };

  const YEARLY_TEASERS = {
    users: [
      "Unlimited forum access",
      "Priority customer support",
      "Professional networking",
    ],
    company: [
      "Unlimited job posting",
      "Exclusive talent access",
      "Priority support",
    ],
  };

  const PACKAGE_MATRIX = {
    users: {
      monthly: { label: "₹79 / month", validity: "30", name: "Basic" },
      yearly: { label: "₹869 / year", validity: "365", name: "Premium" },
    },
    company: {
      monthly: { label: "₹699 / month", validity: "30", name: "Basic" },
      yearly: { label: "₹7689 / year", validity: "365", name: "Premium" },
    },
  };


  const renderCard = (type) => {
    const isYearlyCard = type === "yearly";
    const pkg = PACKAGE_MATRIX[userType][type];
    const features = FEATURE_MATRIX[userType][type];
    const colors = PLAN_COLORS[type];

    const monthlyPkg = PACKAGE_MATRIX[userType].monthly;
    const yearlyPkg = PACKAGE_MATRIX[userType].yearly;

    const monthlyPrice = Number(monthlyPkg.label.match(/\d+/)[0]);
    const yearlyPrice = Number(yearlyPkg.label.match(/\d+/)[0]);

    const yearlyFromMonthly = monthlyPrice * 12;
    const savings = yearlyFromMonthly - yearlyPrice;

    return (
      <ScrollView
        key={type}
        contentContainerStyle={{ paddingBottom: 20 }}
        showsVerticalScrollIndicator={false}
      >
        <LinearGradient
          colors={colors.gradient}
          style={[
            styles.gradientCard,
          ]}
        >
          <ImageBackground

            source={require('../../images/homepage/bg.png')}
            resizeMode="cover"
            style={[
              styles.card,
              { backgroundColor: "rgba(0, 0, 0, 0.54)" },
            ]}
            tintColor={colors.accent}
          >

            <View style={{
              position: "absolute", top: 0, right: -2, width: badgeWidth,
              height: badgeHeight,

            }}>
              <Badge
                width={badgeWidth}
                height={badgeHeight}
                fill={colors.accent}
              />
              <View style={{
                position: "absolute",
                top: -10,
                right: -10,
                width: "100%",
                height: "100%",
                justifyContent: "center",
                alignItems: "center",
              }}>
                <Text style={styles.includedText}>
                  {isYearlyCard ? "SAVE MORE" : "FLEXIBLE"}
                </Text>
              </View>
            </View>

            <View style={styles.cardHeader}>
              <Text style={styles.planTitle}>{pkg.name} Plan</Text>
              {/* <View
                style={{
                  position: "absolute", top: 0, right: 0,
                  // backgroundColor: colors.accent,

                }}
              >
                <Text style={styles.includedText}>
                  {isYearlyCard ? "SAVE MORE" : "FLEXIBLE"}
                </Text>
              </View> */}
            </View>

            <Text style={[styles.price, { color: colors.accent }]}>
              {pkg.label}
            </Text>

            <Text style={styles.billed}>
              Validity: {pkg.validity} days
            </Text>

            <View style={[styles.divider, { borderBottomColor: colors.accent }]} />

            <Text style={styles.featureTitle}>Features</Text>

            {features.map((item, index) => (
              <View key={index} style={styles.featureRow}>
                <View
                  style={[
                    styles.check,
                    // { backgroundColor: colors.accent },
                  ]}
                >
                  <MaterialIcons name="check" size={16} color={colors.accent} />
                </View>
                <Text style={styles.featureText}>{item}</Text>
              </View>
            ))}
          </ImageBackground>
        </LinearGradient>

        {type === "monthly" && (
          <View style={styles.yearlyValueBox}>

            {/* Savings — STRIKE METHOD */}
            <View style={styles.valueRow}>
              <MaterialIcons name="savings" size={18} color="#1B5E20" />

              <Text style={styles.strikePrice}>
                ₹{yearlyFromMonthly}/year
              </Text>

              <Text style={styles.currentPrice}>
                ₹{yearlyPrice}/year
              </Text>
              <View style={styles.savePill}>
                <Text style={styles.saveText}>
                  Save ₹{savings}
                </Text>
              </View>
            </View>

            <View style={styles.valueDivider} />

            {/* Yearly perks */}
            <Text style={styles.yearlyValueTitle}>
              🔓 Unlock with Yearly Plan
            </Text>

            {YEARLY_TEASERS[userType].map((item, index) => (
              <View key={index} style={styles.yearlyValueRow}>
                <MaterialIcons
                  name="lock"
                  size={16}
                  color={PLAN_COLORS.yearly.price}
                />
                <Text style={styles.yearlyValueText}>{item}</Text>
              </View>
            ))}
          </View>
        )}

      </ScrollView>
    );
  };


  return (
    <View style={styles.container}>
      {/* Header */}
      {/* <AppHeader
        title="Subscription Plans"
        backgroundColor={tab === 0 ? PLAN_COLORS.monthly.accent : PLAN_COLORS.yearly.accent}
        showBack={fromDrawer && !needsSubscription}
        onLogout={() => setMessageVisible(true)}
      /> */}

      <Appbar.Header
        // mode={centerTitle ? 'center-aligned' : 'small'}
        // elevated={elevated}
        style={{ backgroundColor: tab === 0 ? PLAN_COLORS.monthly.accent : PLAN_COLORS.yearly.accent, height:56 }}
        title="Subscription Plans"
      >
        {fromDrawer && !needsSubscription &&
          <Appbar.BackAction
            onPress={smartGoBack}
            color="#FFF"
            size={22}
          />
        }
        <Appbar.Content
          title={"Subscription Plans"}
          titleStyle={styles.title}
          color="#FFF"
        />

        {!fromDrawer && needsSubscription &&

          <Appbar.Action
            icon="logout"
            onPress={() => setMessageVisible(true)}
            color="#FFF"
            size={22}
          />
        }

      </Appbar.Header>

      <View style={styles.content}>


        {/* Tabs */}
        <View style={styles.tabWrapper}>
          <Animated.View
            style={[
              styles.tabIndicator,
              { width: TAB_WIDTH },
              indicatorStyle,
            ]}
          />

          {["Monthly", "Yearly"].map((label, index) => (
            <TouchableOpacity
              key={label}
              onPress={() => {
                setTab(index);
                pagerRef.current?.setPage(index);
              }}
              style={[styles.tab, { width: TAB_WIDTH }]}
              activeOpacity={0.85}
            >
              <Animated.Text
                style={[
                  styles.tabText,
                  tabTextStyle(index),
                ]}
              >
                {label}
              </Animated.Text>

            </TouchableOpacity>
          ))}
        </View>


        {/* Swipeable Cards */}
        <PagerView
          ref={pagerRef}
          style={{ flex: 1 }}
          initialPage={0}
          onPageSelected={(e) => setTab(e.nativeEvent.position)}
          overScrollMode="never"

        >
          {renderCard("monthly")}
          {renderCard("yearly")}
        </PagerView>


        <Animated.View style={[styles.cta, ctaStyle]}>
          <TouchableOpacity
            style={StyleSheet.absoluteFill}   // 🔥 fills entire parent
            activeOpacity={0.9}
            disabled={isInitiatingPayment}
            onPress={() => {
              const type = tab === 0 ? 'monthly' : 'yearly';
              const pkg = PACKAGE_MATRIX[userType][type];

              initiatePayment({
                ...pkg,
                amount: Number(pkg.label.match(/\d+/)[0]),
              });
            }}
          >
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', }}>
              <Text style={styles.ctaText}>
                {isInitiatingPayment
                  ? 'Processing...'
                  : tab === 0
                    ? 'Continue Monthly'
                    : 'Upgrade to Yearly'}
              </Text>
            </View>
          </TouchableOpacity>
        </Animated.View>




      </View>

      <PaymentStatus
        visible={showModal}
        fromDrawer={fromDrawer}
        status={modalType}
        amount={selectedPackage?.amount}
        paymentId={lastPaymentId}     // store from Razorpay result
        dateTime={new Date().toLocaleString()}
        onRetry={() => {
          setShowModal(false);
          // re-trigger payment
          if (selectedPackage) {
            initiatePayment(selectedPackage);
          }
        }}
        onContinue={handlePaymentContinue}
        onClose={() => setShowModal(false)}

      />



      {messageVisible && (
        <Message
          visible={messageVisible}
          onCancel={() => setMessageVisible(false)}
          onClose={() => setMessageVisible(false)}
          onOk={() => {
            setMessageVisible(false);
            logoutNow();
          }}
          title="Confirm Logout"
          message="Are you sure you want to logout?"
          iconType="info"
        />
      )}
    </View>
  );
}


const styles = ScaledSheet.create({
  container: {
    flex: 1,

  },
  title: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: Platform.OS === 'ios' ? '600' : '500',
    letterSpacing: 0.2,
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
  },

  tabWrapper: {
    flexDirection: "row",
    backgroundColor: "#ddd",
    borderRadius: 30,
    marginVertical: 10,
    padding: TAB_CONTAINER_PADDING,
  },

  tabIndicator: {
    position: "absolute",
    top: TAB_CONTAINER_PADDING,
    left: TAB_CONTAINER_PADDING,
    height: 44, // 👈 matches tab height
    borderRadius: 26,
  },

  tab: {
    height: 44,
    justifyContent: "center",
    alignItems: "center",
  },

  tabText: {
    color: "#666",
    fontWeight: "500",
  },

  gradientCard: {
    borderRadius: 28,
    padding: 3,
    overflow: "hidden", // 👈 IMPORTANT
    flex: 1
  },

  card: {
    borderRadius: 26,
    padding: 20,
    minHeight: minHeight, // 👈 KEY FIX
    width: width - 32 - 6, // account for gradient padding

    overflow: "visible",
  },

  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  planTitle: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "600",
  },

  includedText: {
    fontWeight: "600",
    color: "#FFF",
    fontSize: 12,          // reduce font to fit
    textAlign: "center",    // center horizontally
    width: "90%",           // prevent overflow
    flexWrap: "wrap",       // allow wrapping if needed
  },

  price: {
    color: "#f5c443",
    fontSize: 28,
    fontWeight: "700",
  },

  billed: {
    color: "#aaa",
    marginTop: 4,
  },

  divider: {
    borderBottomWidth: 1,
    borderBottomColor: "#444",
    marginVertical: 16,
  },
  featureTitle: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 10,
  },
  featureRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  check: {
    width: 22,
    height: 22,
    borderRadius: 11,
    // backgroundColor: "#5cb85c",
    alignItems: 'flex-start',
    justifyContent: "center",
    marginRight: 10,

  },
  featureText: {
    color: "#ddd",
  },

  yearlyValueBox: {
    backgroundColor: "#E9F5EC",
    borderRadius: 16,
    padding: 14,
    marginTop: 14,
    borderWidth: 1,
    borderColor: "#B7E1C1",
  },

  valueRow: {
    flexDirection: "row",
    alignItems: "center",
  },

  valueDivider: {
    height: 1,
    backgroundColor: "#CFE8D6",
    marginVertical: 10,
  },

  yearlyValueTitle: {
    fontWeight: "700",
    color: "#5C4A00",
    marginBottom: 6,
  },

  yearlyValueRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 6,
  },

  yearlyValueText: {
    marginLeft: 8,
    color: "#5C4A00",
    fontSize: 14,
  },

  strikePrice: {
    marginLeft: 8,
    color: "#8FAF9B",
    textDecorationLine: "line-through",
    fontSize: 14,
  },

  currentPrice: {
    marginLeft: 8,
    color: "#1B5E20",
    fontWeight: "700",
    fontSize: 15,
  },

  savePill: {
    marginLeft: 10,
    backgroundColor: "#1B5E20",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
  },

  saveText: {
    color: "#FFF",
    fontSize: 12,
    fontWeight: "700",
  },

  cta: {
    paddingVertical: 26,
    borderRadius: 30,
    alignItems: "center",
    marginVertical: 5,
    marginHorizontal: 8
  },
  ctaText: { color: "#fff", fontSize: 18, fontWeight: "700" },

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
});

export default Subscription;