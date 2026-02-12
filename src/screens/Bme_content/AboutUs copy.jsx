import React, { useMemo, useState } from "react";
import {
  View,
  Text,
  Pressable,
  LayoutAnimation,
  Platform,
  UIManager,
  ScrollView,
  useWindowDimensions,
  StyleSheet,
  StatusBar,
} from "react-native";

import Animated, {
  useSharedValue,
  withSpring,
  useAnimatedStyle,
} from "react-native-reanimated";
import { RadioButton } from 'react-native-paper';
import { colors } from "../../assets/theme";
import FastImage from "@d11/react-native-fast-image";
import ASSET_IMAGES from '../../images/homepage/index'
import { useNetwork } from "../AppUtils/IdProvider";
import Svg, { Path, Circle, Line, Polygon, Defs, Stop } from "react-native-svg";

import { headerHeight } from "../AppUtils/AppStyles";
import { TopWavyBackground, BottomWavyBackground } from './WavyBackground'
import LinearGradient from "react-native-linear-gradient";



const AboutUs = () => {
  const scale = useSharedValue(1);
  const { myData } = useNetwork();

  const { width, height } = useWindowDimensions();
  const HORIZONTAL_PADDING = 20; // parent padding
  const CARD_GAP = 12;          // space between cards (optional but recommended)

  const CARD_WIDTH = (width - HORIZONTAL_PADDING * 2 - CARD_GAP) / 2;
  const CARD_HEIGHT = 100;



  const userType = myData?.user_type === 'users' ? 'users' : 'company';


  const FEATURE_MATRIX = {
    users: {
      monthly: [
        'Job updates',
        'Limited premium resources',
        'Forum access',
        'Standard support',
      ],
      yearly: [
        'Job updates',
        'Premium knowledge resources',
        'Access to companies and product\'s information',
        'Unlimited access to forum',
        'Enhanced job portal features ',
        'Priority customer support',
        'Regular updates on biomedical engineering',
        'Professional networking',
        'Access to latest biomedical events and exhibitions',
        '1Job updates',
        '1Premium knowledge resources',
        '1Access to companies and product\'s information',
        '1Unlimited access to  forum',
        '1Enhanced job portal features ',
        '1Priority customer support',
        '1Regular updates on biomedical engineering',
        '1Exclusive access to talent',
        '1Company profile enhancements',
        'P1rofessional networking',
        'Ac1cess to latest biomedical events and exhibitions',
      ],
    },
    company: {
      monthly: [
        'Job posting',
        'Limited talent access',
        'Company profile',
        'Standard support',
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
  };

  const PACKAGE_MATRIX = {
    users: {
      monthly: { amount: 79, label: '₹79 / month', validity: '30', name: "Basic" },
      yearly: { amount: 869, label: '₹869 / year', validity: '365', name: "Premium" },
    },
    company: {
      monthly: { amount: 699, label: '₹699 / month', validity: '30', name: "Basic" },
      yearly: { amount: 7689, label: '₹7689 / year', validity: '365', name: "Premium" },
    },
  };

  const plans = [
    { key: 'monthly', title: 'Monthly', badge: 'MOST FLEXIBLE' },
    { key: 'yearly', title: 'Yearly', badge: 'BEST VALUE' },
  ];
  const [activePlan, setActivePlan] = useState('monthly'); // ✅ default

  const activeFeatures = FEATURE_MATRIX[userType][activePlan];
  const getYearlyPricing = () => {
    const monthlyAmount = PACKAGE_MATRIX[userType].monthly.amount;
    const yearlyAmount = PACKAGE_MATRIX[userType].yearly.amount;

    const yearlyFromMonthly = monthlyAmount * 12;
    const savings = yearlyFromMonthly - yearlyAmount;

    return {
      monthlyAmount,
      yearlyFromMonthly,
      yearlyAmount,
      savings,
    };
  };

  const featureAnim = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <View style={{ flex: 1, paddingTop: headerHeight, }}>
      {/* <Canvas
          style={{
            ...StyleSheet.absoluteFillObject,
          }}
        >
          <Rect x={0} y={0} width={width - 40} height={height}>
            <RadialGradient
              c={vec((width - 40) / 2, (height * 0.5) / 2)} 
              r={(width - 40) / 1.5} 
              colors={["#5B8CFF55", "#151A2C00"]} 
            />
          </Rect>
        </Canvas> */}

      {/* 🌊 BACKGROUND WAVES */}
      <View
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: 260, // ⬅ more than SVG
          zIndex: -1,
        }}
      >
        <TopWavyBackground height={160} />

      </View>
      <Text style={{ color: "#075cab", fontSize: 22, fontWeight: "600", marginBottom: 12, marginHorizontal: 20 }}>
        What you get
      </Text>


      <View style={{ position: 'absolute', width: '100%', height: '100%', }}>
        <Svg width="100%" height="100%">
          {Array.from({ length: 10 }).map((_, i) => (
            <Circle
              key={i}
              cx={Math.random() * width}
              cy={Math.random() * height}
              r={Math.random() * 12 + 8}
              fill="rgba(37, 99, 235, 0.05)"
            />
          ))}
        </Svg>
      </View>
      <Animated.View
        style={[
          {
            // marginHorizontal: 20,
            // borderTopLeftRadius: 20,
            // borderTopRightRadius: 20,

            flex: 1,

            // overflow: "hidden",
            // borderTopWidth: 1,
            // borderRightWidth: 1,
            // borderLeftWidth: 1,

            // borderColor: 'rgb(211, 210, 210)'
          },
          featureAnim,
        ]}
      >
        <ScrollView
          showsVerticalScrollIndicator={true}
          contentContainerStyle={{ paddingHorizontal: 20, marginHorizontal: 20 }}
        >
          {/* <LinearGradient
          colors={['#E8F4FF', '#FFFFFF']}
          style={{ ...StyleSheet.absoluteFillObject, paddingTop: headerHeight }}
        /> */}
          {activeFeatures.map((item) => (
            <View key={item} style={{ flexDirection: 'row', marginBottom: 10 }}>
              <Text style={{ color: '#16A34A', marginRight: 8, fontWeight: '700' }}>
                ✓
              </Text>
              <Text style={{ color: '#1D1B20', fontWeight: '600', fontSize: 16, flex: 1 }}>
                {item}
              </Text>
            </View>
          ))}

        </ScrollView>
        {/* <BottomWavyBackground height={160} /> */}

      </Animated.View>

      {/* 🔒 FIXED BOTTOM AREA */}
      <View
        style={{
          // position: 'absolute',
          // width: '100%',
          // bottom: 20,
          // alignSelf: 'center'
          // backgroundColor: '#D3D2D2',
          // backgroundColor: '#fff',
          // borderTopLeftRadius: 20,
          // borderTopRightRadius: 20,
          padding: 20,
        }}
      >
        {/* <View
          style={{
            alignSelf: "center",
            width: 44,
            height: 5,
            borderRadius: 3,
            backgroundColor: "#D1D5DB",
            marginBottom: 16,
          }}
        /> */}

        <View
          style={{
            marginBottom: 16,
            flexDirection: "row",
            justifyContent: "space-between",
          }}
        >


          {plans.map((plan) => {
            const selected = activePlan === plan.key;

            return (
              <Pressable
                key={plan.key}
                onPress={() => setActivePlan(plan.key)}
              >

                <LinearGradient
                  colors={selected ? ['#DBEAFE', '#DBEAFE'] : ['#F7F8FA', '#F7F8FA']}
                  // start={{ x: 0.5, y: 0 }}  
                  // end={{ x: 0.5, y: 0.5 }}
                  style={{
                    width: CARD_WIDTH,
                    height: 100,
                    padding: 20,
                    borderRadius: 20,
                    borderWidth: 2,
                    borderColor: selected ? '#075cab' : '#5B8CFF55',
                    overflow: 'hidden'

                  }}
                >


                  {plan.key === 'yearly' && (
                    <View
                      style={{
                        position: 'absolute',
                        top: 0,
                        right: 1,
                        paddingHorizontal: 10,
                        borderBottomLeftRadius: 20,
                        borderTopRightRadius: 20,

                        borderBottomWidth: 1,
                        borderLeftWidth: 1,
                        borderColor: selected ? '#075cab' : '#5B8CFF55',
                        backgroundColor: selected ? '#075cab' : '#5B8CFF55',
                        alignItems:'center'
                      }}
                    >
                      <Text style={{ color: '#FFF', fontSize: 12, }}>
                        {plan.badge}
                      </Text>
                    </View>
                  )}
                  <View style={{ flexDirection: 'row', alignItems: 'center' }}>


                    <RadioButton
                      value={plan.key}
                      status={selected ? 'checked' : 'unchecked'}
                      onPress={() => setActivePlan(plan.key)}
                      color="#075cab"
                    />

                    <View>
                      <Text style={{ fontSize: 18, fontWeight: '700' }}>
                        {plan.title}
                      </Text>

                    </View>

                  </View>
                  {plan.key === 'monthly' && (
                    <Text style={styles.realPrice}>
                      ₹ {PACKAGE_MATRIX[userType].monthly.amount} <Text style={styles.savingsText}>Only</Text>
                    </Text>
                  )}
                  {plan.key === 'yearly' && (() => {
                    const {
                      monthlyAmount,
                      yearlyFromMonthly,
                      yearlyAmount,
                      savings,
                    } = getYearlyPricing();

                    return (
                      <View style={{ alignItems: 'flex-start', }}>
                        {/* <Text style={styles.strikePrice}>
                          {monthlyAmount} x 12 ={' '}
                          <Text style={styles.strikeOnly}>
                            ₹ {yearlyFromMonthly.toLocaleString('en-IN')}
                          </Text>
                        </Text> */}

                        <Text style={styles.realPrice}>
                          ₹ {yearlyAmount.toLocaleString('en-IN')}{' '}
                          <Text style={styles.savingsText}>
                            (Save ₹{savings.toLocaleString('en-IN')})
                          </Text>

                        </Text>

                      </View>
                    );
                  })()}

                </LinearGradient>
              </Pressable>
            );
          })}

        </View>

        {/* CTA */}
        <Pressable
          style={{
            height: 56,
            borderRadius: 28,
            overflow: "hidden",
          }}
        >
          <LinearGradient
            colors={["#2563EB", "#2563EB"]}
            style={{ flex: 1, alignItems: "center", justifyContent: "center" }}
          >
            <Text style={{ color: "#FFF", fontSize: 18, fontWeight: "700" }}>
              Continue
            </Text>
          </LinearGradient>
        </Pressable>
      </View>

    </View>
  );

};

export default AboutUs;

const styles = StyleSheet.create({

  strikePrice: {
    fontSize: 14,
    color: '#999',
  },
  strikeOnly: {
    textDecorationLine: 'line-through',
    color: '#999',
  },

  planBlock: {
    paddingVertical: 18,
    paddingHorizontal: 50,
    borderRadius: 12,

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
    fontWeight: '400',
  },
})