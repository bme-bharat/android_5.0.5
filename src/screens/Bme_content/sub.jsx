import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Dimensions,
  ScrollView,
} from 'react-native';
import Svg, { Path, Defs, LinearGradient, Stop } from 'react-native-svg';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';

const { width, height } = Dimensions.get('window');

/* ================= DATA ================= */

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
      'Unlimited forum access',
      'Priority support',
      'Professional networking',
      'Biomedical events access',
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
      'Unlimited job posting',
      'Exclusive talent access',
      'Enhanced company profile',
      'Priority support',
      'Event & exhibition access',
    ],
  },
};

const PACKAGE_MATRIX = {
  users: {
    monthly: { label: '₹79 / month', name: 'Basic' },
    yearly: { label: '₹869 / year', name: 'Premium' },
  },
  company: {
    monthly: { label: '₹699 / month', name: 'Basic' },
    yearly: { label: '₹7689 / year', name: 'Premium' },
  },
};

const PLANS = [
  { key: 'monthly', title: 'Monthly', badge: 'MOST FLEXIBLE' },
  { key: 'yearly', title: 'Yearly', badge: 'BEST VALUE' },
];

/* ================= SCREEN ================= */

export default function SubscriptionScreen() {
  // 🔁 simulate
  const myData = { user_type: 'users' };
  const userType = myData?.user_type === 'users' ? 'users' : 'company';

  const [activePlan, setActivePlan] = useState('monthly');

  const theme = activePlan === 'monthly' ? MONTHLY_THEME : YEARLY_THEME;

  const features = FEATURE_MATRIX[userType][activePlan];
  const pack = PACKAGE_MATRIX[userType][activePlan];

  return (
    <View style={styles.root}>
      <View style={styles.cardWrapper}>
        <View style={[styles.card, { backgroundColor: theme.card }]}>

          <Animated.View
            key={activePlan}
            entering={FadeIn.duration(350)}
            exiting={FadeOut.duration(200)}
            style={styles.content}
          >
            <View style={[styles.badge, { backgroundColor: theme.badge }]}>
              <Text style={styles.badgeText}>
                {PLANS.find(p => p.key === activePlan)?.badge}
              </Text>
            </View>

            <Text style={styles.planName}>{pack.name}</Text>
            <Text style={[styles.price, { color: theme.primary }]}>
              {pack.label}
            </Text>

            <ScrollView showsVerticalScrollIndicator={false}>
              {features.map((f, i) => (
                <View key={i} style={styles.featureRow}>
                  <View style={[styles.dot, { backgroundColor: theme.primary }]} />
                  <Text style={styles.featureText}>{f}</Text>
                </View>
              ))}
            </ScrollView>
          </Animated.View>
        </View>
      </View>

      {/* BOTTOM TOGGLE */}
      <View style={styles.bottomBar}>
        {PLANS.map(p => {
          const active = activePlan === p.key;
          return (
            <Pressable
              key={p.key}
              onPress={() => setActivePlan(p.key)}
              style={[
                styles.bottomItem,
                active && { backgroundColor: theme.bottomActive },
              ]}
            >
              <Text style={styles.bottomTitle}>{p.title}</Text>
              <Text style={styles.bottomBadge}>{p.badge}</Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

/* ================= CURTAIN ================= */

function Curtain({ theme }) {
  return (
    <View style={styles.curtain}>
      <Svg width="100%" height="100%" viewBox="0 0 400 140">
        <Defs>
          <LinearGradient id="g1" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0%" stopColor={theme.wave1} />
            <Stop offset="100%" stopColor={theme.wave2} />
          </LinearGradient>
        </Defs>

        <Path
          d="
            M0 0
            H400
            V70
            C320 120, 260 90, 200 105
            C140 120, 80 90, 0 70
            Z
          "
          fill="url(#g1)"
        />
      </Svg>
    </View>
  );
}

/* ================= THEMES ================= */

const MONTHLY_THEME = {
  primary: '#2F80ED',
  card: '#FFFFFF',
  wave1: '#E8F1FF',
  wave2: '#C9DEFF',
  badge: '#2F80ED',
  bottomActive: '#E8F1FF',
};

const YEARLY_THEME = {
  primary: '#7A4DFF',
  card: '#FFFFFF',
  wave1: '#F1EBFF',
  wave2: '#D7C8FF',
  badge: '#7A4DFF',
  bottomActive: '#EFE7FF',
};

/* ================= STYLES ================= */

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#f3f3f3',
  },
  cardWrapper: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  card: {
    width: width * 0.88,
    height: height * 0.68,
    borderRadius: 26,
    overflow: 'hidden',
    elevation: 12,
  },
  curtain: {
    height: 140,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  badge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 20,
    marginBottom: 12,
  },
  badgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '700',
  },
  planName: {
    fontSize: 26,
    fontWeight: '800',
    marginBottom: 4,
  },
  price: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 18,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 10,
  },
  featureText: {
    fontSize: 15,
    color: '#444',
  },
  bottomBar: {
    flexDirection: 'row',
    height: 80,
    borderTopWidth: 1,
    borderColor: '#ddd',
  },
  bottomItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bottomTitle: {
    fontSize: 16,
    fontWeight: '700',
  },
  bottomBadge: {
    fontSize: 11,
    color: '#666',
  },
});
