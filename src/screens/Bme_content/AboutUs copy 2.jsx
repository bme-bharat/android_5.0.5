import React, { useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  ScrollView,
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
  withSpring,
  withRepeat,
  withTiming,
  FadeInDown,
  interpolateColor,
  Easing,
} from "react-native-reanimated";
import Svg, { Path } from "react-native-svg";

const { width, height } = Dimensions.get("window");
const minHeight = height * 0.6;
const CARD_WIDTH = width -32;
const SVG_WIDTH = CARD_WIDTH * 0.4;
const CARD_HEIGHT = height * 0.3;
const TAB_CONTAINER_PADDING = 4;
const TAB_COUNT = 2;
const TAB_WIDTH =
  (width - 32 - TAB_CONTAINER_PADDING * 2) / TAB_COUNT;

const PLAN_COLORS = {
  monthly: {
    gradient: ["#4facfe", "#00c6ff"],
    cardBg: "#1e2a38",
    accent: "#4facfe",

    badgeBg: "#4facfe",
    price: "#4facfe",
    check: "#4facfe",
    tab: "#4facfe",
    cta: "#4facfe",
    tabText: "#fff"
  },
  yearly: {
    gradient: ["#ffdf70", "#f5b800", "#d49a00"],
    cardBg: "#2b2b2b",
    accent: "#f5c443",

    badgeBg: "#f5c443",
    price: "#f5c443",
    check: "#f5c443",
    tab: "#f5c443",
    cta: "#f5c443",
    tabText: "#fff"

  },
};

export default function SubscriptionScreen() {
  const { myData } = useNetwork();
  const pagerRef = useRef(null);

  const userType = myData?.user_type === "users" ? "users" : "company";
  const [tab, setTab] = useState(0); // 0 = monthly, 1 = yearly

  const tabX = useSharedValue(0);

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
      [PLAN_COLORS.monthly.tab, PLAN_COLORS.yearly.tab]
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

  const ctaScale = useSharedValue(1);

  useEffect(() => {
    ctaScale.value = withRepeat(
      withTiming(1.04, { duration: 1200 }),
      -1,
      true
    );
  }, []);

  const ctaProgress = useSharedValue(0); // 0 = monthly, 1 = yearly

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


  const FEATURE_MATRIX = {
    users: {
      monthly: [
        "Job updates",
        "Limited premium resources",
        "Forum access",
        "Standard support",
      ],
      yearly: [
        "Job updates",
        "Premium knowledge resources",
        "Access to companies and products",
        "Unlimited forum access",
        "Enhanced job portal features",
        "Priority customer support",
        "Biomedical engineering updates",
        "Professional networking",
        "Events & exhibitions access",

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
        contentContainerStyle={{ paddingBottom: 20, CARD_WIDTH }}
        showsVerticalScrollIndicator={false}
      >
        <LinearGradient
          colors={colors.gradient}
          style={[
            styles.gradientCard,
            isYearlyCard && styles.yearlyGlow,
          ]}
        >
          <View
            style={[
              styles.card,
              { backgroundColor: colors.cardBg },
            ]}
          >

            <Svg viewBox="25 202 300 120"

              width={SVG_WIDTH} height={100} style={{ position: "absolute", top: -20, right: 0,   }}>
              <Path
                d="
     M151,299 c-98,1 0,-98 -99,-98 l224,-1 q50,0 51,49 l-1,51 l0,50 q1,-48 -40,-51 l-226,0
    "
                fill={colors.badgeBg}
              />
            </Svg>
            <View style={styles.cardHeader}>
              <Text style={styles.planTitle}>{pkg.name} Plan</Text>
              <View
                style={{
                position: "absolute", top: 0, right: 0, 
                   backgroundColor: colors.badgeBg ,
                   
                }}
              >
                <Text style={styles.includedText}>
                  {isYearlyCard ? "SAVE MORE" : "FLEXIBLE"}
                </Text>
              </View>
            </View>

            <Text style={[styles.price, { color: colors.price }]}>
              {pkg.label}
            </Text>

            <Text style={styles.billed}>
              Validity: {pkg.validity} days
            </Text>

            <View style={styles.divider} />

            <Text style={styles.featureTitle}>Features</Text>

            {features.map((item, index) => (
              <View key={index} style={styles.featureRow}>
                <View
                  style={[
                    styles.check,
                    // { backgroundColor: colors.check },
                  ]}
                >
                  <MaterialIcons name="check" size={16} color={colors.check} />
                </View>
                <Text style={styles.featureText}>{item}</Text>
              </View>
            ))}
          </View>
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

              <Text style={styles.saveText}>
                Save ₹{savings}
              </Text>
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
      <AppHeader
        title="Subscription Plan"

      />
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

        {/* CTA */}
        <Animated.View style={[styles.cta, ctaStyle]}>
          <TouchableOpacity activeOpacity={0.9}>
            <Text style={styles.ctaText}>
              {tab === 0 ? "Continue Monthly" : "Upgrade to Yearly"}
            </Text>
          </TouchableOpacity>
        </Animated.View>


      </View>

    </View>
  );
}


const styles = StyleSheet.create({
  container: {
    flex: 1,

  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 10,
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#eee",
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    fontSize: 20,
    fontWeight: "600",
    marginLeft: 16,
  },
  tabWrapper: {
    flexDirection: "row",
    backgroundColor: "#ddd",
    borderRadius: 30,
    marginVertical: 20,
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
  activeTabText: {
    color: "#fff",
    fontWeight: "700",

  },
  gradientCard: {
    borderRadius: 28,
    padding: 3,
    overflow: "hidden", // 👈 IMPORTANT
  },

  card: {
    backgroundColor: "#2b2b2b",
    borderRadius: 26,
    padding: 20,
    minHeight: minHeight, // 👈 KEY FIX
    width:'100%'
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
  includedBadge: {
    backgroundColor: "#f5c443",
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
  },
  includedText: {
    fontWeight: "600",
    color: "#FFF",
  },
  priceRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    marginTop: 14,
  },
  oldPrice: {
    color: "#888",
    textDecorationLine: "line-through",
    fontSize: 16,
  },
  price: {
    color: "#f5c443",
    fontSize: 28,
    fontWeight: "700",
  },
  priceDark: {
    color: "#000",
    fontSize: 26,
    fontWeight: "700",
  },
  priceSub: {
    color: "#aaa",
    marginLeft: 4,
  },
  billed: {
    color: "#aaa",
    marginTop: 4,
  },
  desc: {
    color: "#bbb",
    marginTop: 12,
    lineHeight: 20,
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
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
  },
  featureText: {
    color: "#ddd",
  },
  secondaryCard: {
    backgroundColor: "#e8e8e2",
    borderRadius: 26,
    padding: 20,
    marginTop: 16,
  },
  planTitleDark: {
    color: "#000",
    fontSize: 18,
    fontWeight: "600",
  },
  includedBadgeLight: {
    backgroundColor: "#ddd",
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
  },
  includedTextDark: {
    color: "#333",
    fontWeight: "600",
  },
  nextBtn: {
    backgroundColor: "#f5c443",
    borderRadius: 30,
    paddingVertical: 16,
    alignItems: "center",
    marginTop: 10,
    marginBottom: 20,
  },
  nextText: {
    fontSize: 18,
    fontWeight: "700",
    color: "#FFF",
  },

  yearlyGlow: {
    shadowColor: "#f5c443",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 18,
    elevation: 12,
  },
  ribbon: {
    position: "absolute",
    top: 12,
    right: 12,
    backgroundColor: "#f5c443",
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    zIndex: 10,
  },

  ribbonText: {
    fontWeight: "700",
    fontSize: 12,
    color: "#000",
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

  valueText: {
    marginLeft: 8,
    color: "#2E7D32",
    fontSize: 14,
  },

  valueHighlight: {
    fontWeight: "700",
    color: "#1B5E20",
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
    margin: 16,
    paddingVertical: 16,
    borderRadius: 30,
    alignItems: "center",
  },
  ctaText: { color: "#fff", fontSize: 18, fontWeight: "700" },
});
