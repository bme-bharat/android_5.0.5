import React from 'react';
import { ScrollView, View, StyleSheet, TouchableOpacity, Text } from 'react-native';
import { AppHeader } from '../AppUtils/AppHeader.jsx';
import { useNavigation } from '@react-navigation/native';
import MaterialIcons from '@react-native-vector-icons/material-icons';
import { colors } from '../../assets/theme.jsx';
import { Switch } from 'react-native-paper';
import { useNotificationToggle } from '../AppUtils/NotificationSetting.jsx';

const Policies = () => {
  const navigation = useNavigation();
  const { notificationEnabled, toggleNotifications, isProcessing } = useNotificationToggle();
  // Local reusable row (same component, as you wanted)
  const PolicyRow = ({ title, onPress }) => {
    return (
      <TouchableOpacity
        activeOpacity={0.7}
        style={styles.item}
        onPress={onPress}
      >
        <Text style={styles.itemText}>{title}</Text>
        <MaterialIcons
          name="chevron-right"
          size={26}
          color={colors.text_primary}
        />
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <AppHeader title={'Settings & Policies'} />

      <ScrollView contentContainerStyle={styles.content}>
        <PolicyRow
          title="About Us"
          onPress={() => navigation.navigate('AboutUs')}
        />

        <PolicyRow
          title="Privacy Policy"
          onPress={() => navigation.navigate('PrivacyPolicy')}
        />

        <PolicyRow
          title="Cancellation Policy"
          onPress={() => navigation.navigate('CancellationPolicy')}
        />

        <PolicyRow
          title="Legal Compliance"
          onPress={() => navigation.navigate('LegalPolicy')}
        />

        <PolicyRow
          title="Terms & Conditions"
          onPress={() => navigation.navigate('TermsAndConditions')}
        />
        <PolicyRow
          title="Delete account"
          onPress={() => navigation.navigate('DeleteAccountFlow')}
        />
        <View style={styles.settingRow}>
          <View style={styles.textContainer}>
            <Text style={styles.title}>Notifications</Text>
            <Text style={styles.subtitle}>
              Receive alerts, updates & important messages
            </Text>
          </View>

          <Switch
            value={notificationEnabled}
            onValueChange={toggleNotifications}
            disabled={isProcessing}
            trackColor={{ false: '#E5E7EB', true: '#C7D2FE' }}
            thumbColor={notificationEnabled ? '#075cab' : '#F3F4F6'}
            ios_backgroundColor="#E5E7EB"
          />
        </View>
      </ScrollView>
    </View>
  );
};

export default Policies;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 16,
  },
  item: {
    paddingVertical: 16,
    paddingHorizontal: 14,
    alignItems: 'center',
    justifyContent: 'space-between',
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  itemText: {
    fontSize: 15,
    fontWeight: '500',
    color: colors.text_primary,
    letterSpacing: 0.2,
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    paddingHorizontal: 12,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    marginVertical: 6,
    elevation: 1,              // Android
    shadowColor: '#000',       // iOS
    shadowOpacity: 0.05,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },
  textContainer: {
    flex: 1,
    marginRight: 12,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  subtitle: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2,
  },
});
