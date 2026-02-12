import React, { useEffect, useState } from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';

export default function PaymentStatus({
  visible,
  status,    // 'success' | 'failure' | 'loading'
  amount,
  paymentId,
  dateTime,
  onRetry,
  onContinue,       // 🔥 NEW: auto redirect handler
  onClose,
  fromDrawer,
}) {

  const isSuccess = status === 'success';
  const isFailure = status === 'failure';
  const isLoading = status === 'loading';

  const [countdown, setCountdown] = useState(5);

  useEffect(() => {
    console.log('🟡 PaymentStatus useEffect fired', {
      visible,
      isSuccess,
    });

    if (!visible || status !== 'success') return;

    console.log('▶️ Starting success countdown (5s)');
    setCountdown(5);

    const interval = setInterval(() => {
      setCountdown((prev) => {
        const next = prev - 1;
        console.log('⏱ Countdown tick:', prev, '→', next);

        if (prev <= 1) {
          console.log('⏹ Countdown reached zero, clearing interval');
          clearInterval(interval);
          return 0;
        }

        return next;
      });
    }, 1000);

    const timer = setTimeout(() => {
      console.log('🚀 Auto redirect timer fired. fromDrawer =', fromDrawer);
      onContinue?.(fromDrawer);
    }, 5000);

    return () => {
      console.log('🧹 Cleaning up PaymentStatus timers');
      clearInterval(interval);
      clearTimeout(timer);
    };
  }, [visible, isSuccess]);


  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      statusBarTranslucent
    >
      <View style={styles.overlay}>
        <View style={styles.card}>

          {/* Icon */}
          <View style={[
            styles.iconCircle,
            {
              backgroundColor:
                isLoading ? '#3498DB' :
                  isSuccess ? '#2ECC71' :
                    '#FF4D4F'
            }
          ]}>
            <MaterialIcons
              name={
                isLoading ? 'hourglass-top' :
                  isSuccess ? 'check-circle' :
                    'cancel'
              }
              size={48}
              color="#fff"
            />
          </View>


          {/* Amount */}
          <Text style={styles.amount}>₹{amount}</Text>

          {/* Title */}
          <Text
            style={[
              styles.title,
              {
                color: isLoading
                  ? '#3498DB'
                  : isSuccess
                    ? '#2ECC71'
                    : '#FF4D4F',
              },
            ]}
          >
            {isLoading
              ? 'Verifying Payment...'
              : isSuccess
                ? 'Payment Successful!'
                : 'Payment Failed!'}
          </Text>


          {/* Subtitle */}
          <Text style={styles.subtitle}>
            {isLoading
              ? 'Please wait while we verify your payment securely...'
              : isSuccess
                ? 'Your payment was completed successfully.'
                : 'Hey, seems like there was some trouble.\nWe are there with you. Just hold back.'}
          </Text>

          {/* Meta */}
          {(paymentId || dateTime) && (
            <Text style={styles.meta}>
              {paymentId ? `Payment ID: ${paymentId}` : ''}
              {paymentId && dateTime ? ', ' : ''}
              {dateTime || ''}
            </Text>
          )}

          {isSuccess ? (
            <View style={styles.successAutoBox}>
              <Text style={styles.successHint}>
                Redirecting in {countdown}s...
              </Text>
            </View>
          ) : isLoading ? (
            null
          ) : (
            <TouchableOpacity style={styles.primaryBtn} onPress={onRetry}>
              <Text style={styles.primaryBtnText}>TRY AGAIN</Text>
            </TouchableOpacity>
          )}

          {isFailure && (
            <TouchableOpacity onPress={onClose} style={{ padding: 5 }}>
              <Text style={styles.secondaryText}>Close</Text>
            </TouchableOpacity>
          )}

        </View>
      </View>
    </Modal>
  );
}


const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  card: {
    width: '85%',
    backgroundColor: '#fff',
    borderRadius: 16,
    paddingVertical: 32,
    paddingHorizontal: 20,
    alignItems: 'center',
    elevation: 8,
  },
  iconCircle: {
    width: 90,
    height: 90,
    borderRadius: 45,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  amount: {
    fontSize: 32,
    fontWeight: '800',
    marginBottom: 8,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: '#555',
    textAlign: 'center',
    marginBottom: 12,
    lineHeight: 20,
  },
  meta: {
    fontSize: 12,
    color: '#999',
    marginBottom: 20,
  },
  successAutoBox: {
    marginTop: 12,
  },
  successHint: {
    fontSize: 12,
    color: '#666',
  },

  primaryBtn: {
    backgroundColor: '#0B6B43',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 28,
    marginBottom: 12,
    minWidth: 160,
    alignItems: 'center',
  },
  primaryBtnText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 14,
    letterSpacing: 0.5,
  },
  secondaryText: {
    fontSize: 12,
    color: '#888',
  },
});
