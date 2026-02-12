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
  Image,
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
import Job from '../../assets/svgIcons/jobs.svg';
import FastImage from "@d11/react-native-fast-image";
import Svg, { Path } from "react-native-svg";

const { width, height } = Dimensions.get("window");
const minHeight = height * 0.7;
const CARD_WIDTH = width - 32;
const badgeWidth = 100;
const badgeHeight = badgeWidth * (148 / 277); // calculate height to preserve aspect ratio

const TAB_CONTAINER_PADDING = 4;
const TAB_COUNT = 2;
const TAB_WIDTH =
  (width - 32 - TAB_CONTAINER_PADDING * 2) / TAB_COUNT;

const PLAN_COLORS = {
  monthly: {
    gradient: ["#4CAF50", "#81C784"],
    cardBg: "#E6F6E6",
    accent: "#023389",
  },

  yearly: {
    gradient: ["#075CAB", "#4A90E2"],
    cardBg: "#E6F3FF",
    accent: "#2A94CE",
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
    borderColor: interpolateColor(
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
          ? ["#000", "#666"]
          : ["#666", "#000"]
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
    const borderColor = interpolateColor(
      ctaProgress.value,
      [0, 1],
      [
        PLAN_COLORS.monthly.accent,
        PLAN_COLORS.yearly.accent,
      ]
    );

    return {
      borderColor,
      // transform: [{ scale: ctaScale.value }],
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
        'Job updates and career opportunities',
        'Premium knowledge resources and technical materials',
        'Access to companies and product information',
        'Unlimited access to professional discussion forums',
        'Enhanced job portal features and profile visibility',
        'Priority customer support assistance',
        'Professional networking with industry experts',
        'Access to latest biomedical events and exhibitions',
        'Verified industry job postings from hospitals and companies',
        'Internship and industrial training opportunity updates',
        'Marketplace access for biomedical equipment and services'
      ],

      yearly: [
        'Access to technical documents, manuals & service resources',
        'Industry project collaboration opportunities',
        'Early access to new platform features',
        'Job updates and career opportunities',
        'Premium knowledge resources and technical materials',
        'Access to companies and product information',
        'Unlimited access to professional discussion forums',
        'Enhanced job portal features and profile visibility',
        'Priority customer support assistance',
        'Professional networking with industry experts',
        'Access to latest biomedical events and exhibitions',
        'Verified industry job postings from hospitals and companies',
        'Internship and industrial training opportunity updates',
        'Marketplace access for biomedical equipment and services',

      ],

    },
    company: {
      monthly: [
        'Job posting and recruitment access',
        'Premium knowledge resources and industry updates',
        'Access to companies and product information',
        'Unlimited access to professional discussion forums',
        'Enhanced recruitment and talent search tools',
        'Priority customer support assistance',
        'Exclusive access to biomedical talent pool',
        'Access to latest biomedical events and exhibitions',
        'Product and service catalog listings',
        'Business inquiry and quotation request access'
      ],
      yearly: [
        'Early access to upcoming business features',
        'Company profile enhancement and visibility options',
        'Professional networking with hospitals and partners',
        'Job posting and recruitment access',
        'Premium knowledge resources and industry updates',
        'Access to companies and product information',
        'Unlimited access to professional discussion forums',
        'Enhanced recruitment and talent search tools',
        'Priority customer support assistance',
        'Exclusive access to biomedical talent pool',
        'Access to latest biomedical events and exhibitions',
        'Product and service catalog listings',
        'Business inquiry and quotation request access',

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
      monthly: { label: "₹79 / month", validity: "30", name: "Basic", strike: "", free: "" },
      yearly: { label: "₹869 / year", name: "Premium", strike: "₹948 / year", free: "1 month free" },
    },
    company: {
      monthly: { label: "₹699 / month", validity: "30", name: "Basic", strike: "", free: "" },
      yearly: { label: "₹7689 / year", name: "Premium", strike: "₹8,388 / year", free: "1 month free" },
    },
  };

  const [showYearlyRecommend, setShowYearlyRecommend] = useState(false);
  const [pendingMonthlyPkg, setPendingMonthlyPkg] = useState(null);

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

      <View
        style={[
          styles.gradientCard,
          { backgroundColor: colors.accent }
        ]}
      >
        <View style={styles.card}>

          <View style={styles.svgContainer}>
            <Svg
              viewBox="0 0 400 300"
              width="100%"
              height="100%"
              preserveAspectRatio="none"
            >
              <Path
                d="M140 0C140 50 180 100 280 120C380 140 400 200 400 300V0H140Z"
                fill={colors.accent}
              />
            </Svg>
          </View>


          <View style={styles.cardHeader}>
            <Text style={styles.planTitle}>{pkg.name} Plan</Text>
            <Text style={styles.price}>
              {pkg.label}
            </Text>
            {pkg.free &&
              <Text style={styles.billed}>
                {pkg.free}
              </Text>
            }

            {pkg.validity &&
              <Text style={styles.billed}>
                Validity: {pkg.validity} days
              </Text>
            }

            <Text style={styles.strikePrice1}>
              {pkg.strike}
            </Text>

          </View>


          <Text style={styles.featureTitle}>Features</Text>

          <ScrollView
            style={{ flex: 1, }}
            showsVerticalScrollIndicator={false}

          >
            {features.map((item, index) => (
              <View key={index} style={styles.featureRow}>
                <View style={styles.check}>
                  <MaterialIcons name="check" size={22} color={'green'} />
                </View>
                <Text style={styles.featureText}>{item}</Text>
              </View>
            ))}
          </ScrollView>



        </View>
        {/* {type === "monthly" && (
          <View style={styles.yearlyValueBox}>
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
        )} */}
      </View>



    );
  };

  const YearlyRecommendationModal = ({
    visible,
    onMonthly,
    onYearly,
    onCancel,
    userType,
  }) => {
    const monthlyPkg = PACKAGE_MATRIX[userType].monthly;
    const yearlyPkg = PACKAGE_MATRIX[userType].yearly;

    const monthlyPrice = Number(monthlyPkg.label.match(/\d+/)[0]);
    const yearlyPrice = Number(yearlyPkg.label.match(/\d+/)[0]);

    const yearlyFromMonthly = monthlyPrice * 12;
    const savings = yearlyFromMonthly - yearlyPrice;

    return (
      <Modal visible={visible} transparent animationType="slide">
        <View style={styles.recommendOverlay}>
          <View style={styles.recommendSheet}>

            {/* Close Icon */}
            <TouchableOpacity
              style={styles.closeIcon}
              onPress={onCancel}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <MaterialIcons name="close" size={22} color="#444" />
            </TouchableOpacity>
            <View style={styles.offerBadge}>
              <MaterialIcons name="local-offer" size={16} color="#D32F2F" />
              <Text style={styles.offerBadgeText}>SPECIAL OFFER</Text>
            </View>

            <Text style={styles.freeHighlight}>
              🎁 Get <Text style={styles.freeStrong}>1 Month Free</Text>
            </Text>

            <Text style={styles.recommendDesc}>
              You're about to choose the Monthly plan.
              Switch to Yearly and unlock maximum savings.
            </Text>

            {/* Comparison Cards */}
            <View style={styles.compareRow}>

              {/* Monthly */}
              <View style={styles.compareCard}>
                <Text style={styles.compareLabel}>Monthly</Text>
                <Text style={styles.comparePrice}>{monthlyPkg.label}</Text>

              </View>

              {/* Yearly Highlight */}
              <View style={[styles.compareCard, styles.yearlyHighlight]}>
                <Text style={styles.compareLabelYearly}>Yearly ⭐</Text>

                <Text style={styles.compareStrike}>
                  {yearlyPkg.strike || `₹${yearlyFromMonthly} / year`}
                </Text>

                <Text style={styles.comparePriceYearly}>
                  {yearlyPkg.label}
                </Text>

                {yearlyPkg.free && (
                  <View style={styles.freePill}>
                    <Text style={styles.freePillText}>
                      {yearlyPkg.free}
                    </Text>
                  </View>
                )}

                <Text style={styles.saveTextBig}>
                  Save ₹{savings} / year
                </Text>
              </View>

            </View>

            {/* CTA Buttons */}
            <TouchableOpacity
              style={styles.upgradeBtn}
              activeOpacity={0.9}
              onPress={onYearly}
            >
              <Text style={styles.upgradeBtnText}>
                Upgrade to Yearly & Save ₹{savings}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.continueMonthlyBtn}
              onPress={onMonthly}
            >
              <Text style={styles.continueMonthlyText}>
                Continue with Monthly
              </Text>
            </TouchableOpacity>

          </View>
        </View>
      </Modal>
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
        style={{ backgroundColor: 'transparent', height: 44 }}
        title="Subscription Plans"
        color={'#000'}

      >
        {fromDrawer && !needsSubscription &&
          <Appbar.BackAction
            onPress={smartGoBack}
            color="#000"
            size={22}
          />
        }
        <Appbar.Content
          title={"Subscription Plans"}
          titleStyle={styles.title}
          color="#075cab"
        />

        {!fromDrawer && needsSubscription &&

          <Appbar.Action
            icon="logout"
            onPress={() => setMessageVisible(true)}
            color="#000"
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
          <FastImage
            source={require('../../images/homepage/offer.gif')}
            style={{ width: 60, height: 60, position: 'absolute', right: 0, top: -20 }}
            resizeMode={FastImage.resizeMode.contain}
          />
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

        <View style={styles.ctaRow}>
          {/* {fromDrawer && !needsSubscription && (
            <TouchableOpacity
              activeOpacity={0.9}
              style={styles.mySubsBtn}
              onPress={() => navigation.navigate('YourSubscriptionList')}
            >
              <Job
                width={dimensions.icon.medium}
                height={dimensions.icon.medium}
                color={colors.background}
              />

              <Text style={styles.mySubsText}>
                My Subscriptions
              </Text>
            </TouchableOpacity>
          )} */}

          <TouchableOpacity
            style={[styles.ctaInner, { borderColor: tab === 0 ? PLAN_COLORS.monthly.accent : PLAN_COLORS.yearly.accent, }]}
            activeOpacity={0.9}
            disabled={isInitiatingPayment}
            onPress={() => {
              const type = tab === 0 ? 'monthly' : 'yearly';
              const pkg = PACKAGE_MATRIX[userType][type];
              const amount = Number(pkg.label.match(/\d+/)[0]);

              // 👇 Intercept Monthly
              if (type === 'monthly') {
                setPendingMonthlyPkg({
                  ...pkg,
                  amount,
                });
                setShowYearlyRecommend(true);
                return;
              }

              // 👇 Direct Yearly = Proceed Normally
              initiatePayment({
                ...pkg,
                amount,
              });
            }}

          >
            <Text style={[styles.ctaText, { color: tab === 0 ? PLAN_COLORS.monthly.accent : PLAN_COLORS.yearly.accent }]}>
              {isInitiatingPayment
                ? 'Processing...'
                : tab === 0
                  ? 'Continue monthly'
                  : 'Upgrade to yearly'}
            </Text>
          </TouchableOpacity>
        </View>



      </View>
      <YearlyRecommendationModal
        visible={showYearlyRecommend}
        userType={userType}
        onCancel={() => setShowYearlyRecommend(false)}

        onMonthly={() => {
          setShowYearlyRecommend(false);
          if (pendingMonthlyPkg) {
            initiatePayment(pendingMonthlyPkg);
            setPendingMonthlyPkg(null);
          }
        }}

        onYearly={() => {
          setShowYearlyRecommend(false);
          const yearlyPkg = PACKAGE_MATRIX[userType].yearly;

          initiatePayment({
            ...yearlyPkg,
            amount: Number(yearlyPkg.label.match(/\d+/)[0]),
          });

          setPendingMonthlyPkg(null);
        }}
      />


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
  svgContainer: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: '120%',
    height: '60%',
    zIndex: 0,
  },

  title: {
    color: '#000',
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
    backgroundColor: "#FFF",
    borderRadius: 30,
    marginBottom: 10,
    padding: TAB_CONTAINER_PADDING,
  },

  tabIndicator: {
    position: "absolute",
    top: TAB_CONTAINER_PADDING,
    left: TAB_CONTAINER_PADDING,
    height: 44, // 👈 matches tab height
    borderRadius: 26,
    borderWidth: 2,
  },

  tab: {
    height: 44,
    justifyContent: "center",
    alignItems: "center",
    flexDirection: 'row',

  },

  tabText: {
    color: "#666",
    fontWeight: "500",
  },

  gradientCard: {
    borderRadius: 28,
    overflow: "hidden", // 👈 IMPORTANT
    flex: 1,
    padding: 4,
  },

  card: {
    borderRadius: 26,
    paddingHorizontal: 20,
    paddingTop: 10,
    flex: 1,
    overflow: "hidden",
    backgroundColor: '#FFF'
  },
  Bg: {
    position: 'absolute',
    right: 0,
    top: 0,
    width: width * 0.7,
    height: width * 0.7,
  },


  cardHeader: {

    justifyContent: 'flex-end',
    alignItems: 'flex-end',
  },
  planTitle: {
    color: '#FFF',
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
  strikePrice1: {
    color: "#FFF",
    fontSize: 20,
    textDecorationLine: "line-through",
  },
  price: {
    color: "#FFF",
    fontSize: 20,
  },

  billed: {
    color: '#FFF',
    marginTop: 4,
  },

  divider: {
    borderBottomWidth: 1,
    borderBottomColor: "#444",
    marginVertical: 16,
  },
  featureTitle: {
    color: colors.text_primary,
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 10,
  },
  featureRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 14,
  },
  check: {
    width: 26,
    height: 26,
    borderRadius: 11,
    // backgroundColor: "#5cb85c",
    alignItems: 'flex-start',
    justifyContent: "center",
    marginRight: 10,

  },
  featureText: {
    fontSize: 15,
    fontWeight: '400',
    color: colors.text_primary,
    flexShrink: 1,
    letterSpacing: 0.3
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

  ctaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    // gap: 12,   
    // paddingHorizontal: 10,
    paddingVertical: 8
  },

  mySubsBtn: {
    flexShrink: 0,   // don’t let it shrink

    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 14,
    backgroundColor: '#f2f2f2',
    elevation: 4,
  },

  mySubsText: {
    color: '#000',
    marginLeft: 8,
    fontWeight: '500',
    paddingTop: 2,
  },

  cta: {
    flex: 1,          // 🔥 THIS makes it take remaining space
    height: 52,
    overflow: 'hidden',
    borderWidth: 2,
    borderRadius: 14,

  },

  ctaInner: {
    flex: 1,
    height: 52,
    borderWidth: 2,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    // borderRadius: 14,
    // borderWidth:2,
    // borderColor:'#075CAB',
  },


  ctaText: { color: "#000", fontSize: 18, fontWeight: "500" },

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
  recommendOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.55)',
    justifyContent: 'flex-end',
  },

  recommendSheet: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    paddingBottom: 28,
    elevation: 20,
  },

  closeIcon: {
    position: 'absolute',
    top: 12,
    right: 12,
    zIndex: 10,
    padding: 6,
  },

  offerBadge: {
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF3E0',
    borderColor: '#FF9800',
    borderWidth: 1,
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 4,
    marginBottom: 6,
  },

  offerBadgeText: {
    marginLeft: 6,
    fontSize: 11,
    fontWeight: '800',
    color: '#E65100',
    letterSpacing: 0.5,
  },

  freeHighlight: {
    textAlign: 'center',
    fontSize: 16,
    fontWeight: '700',
    color: '#1B5E20',
    marginBottom: 8,
  },

  freeStrong: {
    fontSize: 18,
    fontWeight: '900',
    color: '#2E7D32',
  },

  recommendDesc: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 18,
  },

  compareRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
  },

  compareCard: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#eee',
    borderRadius: 14,
    padding: 14,
    alignItems: 'center',
  },

  yearlyHighlight: {
    borderColor: '#0A7AFF',
    backgroundColor: '#F2F7FF',
  },

  compareLabel: {
    fontSize: 13,
    color: '#777',
    marginBottom: 6,
  },

  compareLabelYearly: {
    fontSize: 13,
    color: '#0A7AFF',
    fontWeight: '700',
    marginBottom: 6,
  },

  comparePrice: {
    fontSize: 16,
    fontWeight: '700',
  },

  compareStrike: {
    fontSize: 12,
    color: '#999',
    textDecorationLine: 'line-through',
  },

  comparePriceYearly: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0A7AFF',
  },

  compareSub: {
    fontSize: 11,
    color: '#888',
    marginTop: 4,
  },

  freePill: {
    backgroundColor: '#E8F5E9',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
    marginTop: 6,
  },

  freePillText: {
    fontSize: 11,
    color: '#2E7D32',
    fontWeight: '700',
  },

  saveTextBig: {
    marginTop: 8,
    fontSize: 12,
    color: '#1B5E20',
    fontWeight: '700',
  },

  upgradeBtn: {
    backgroundColor: '#0A7AFF',
    paddingVertical: 14,
    borderRadius: 12,
    marginBottom: 10,
  },

  upgradeBtnText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '800',
    textAlign: 'center',
  },

  continueMonthlyBtn: {
    borderWidth: 1,
    borderColor: '#ddd',
    paddingVertical: 12,
    borderRadius: 12,
    marginBottom: 6,
  },

  continueMonthlyText: {
    color: '#444',
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  },

  cancelText: {
    textAlign: 'center',
    color: '#999',
    marginTop: 4,
  },


});

export default Subscription;