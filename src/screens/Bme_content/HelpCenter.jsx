import {
  StyleSheet,
  Text,
  View,
  Linking,
  TouchableOpacity,
  ScrollView,

} from 'react-native';
import React from 'react';
import { useNavigation } from '@react-navigation/native';

import ArrowLeftIcon from '../../assets/svgIcons/back.svg';
import Email from '../../assets/svgIcons/mail.svg';
import Phone from '../../assets/svgIcons/phone.svg';
import WhatsApp from '../../assets/svgIcons/whatsapp.svg';
import Instagram from '../../assets/svgIcons/instagram.svg';
import Facebook from '../../assets/svgIcons/facebook.svg';
import Youtube from '../../assets/svgIcons/youtube.svg';
import Linkedin from '../../assets/svgIcons/linkedin.svg';
import Web from '../../assets/svgIcons/web.svg';
import X from '../../assets/svgIcons/x.svg';

import { colors, dimensions } from '../../assets/theme';
import { AppHeader } from '../AppUtils/AppHeader';

const HelpCenter = () => {
  const navigation = useNavigation();

  const contactDetails = {
    email: 'bmebharat@gmail.com',
    phone: '+918310491223',
    website: 'https://bmebharat.com/',

    social: {
      facebook: 'https://www.facebook.com/bme.bharat',
      instagram: 'https://www.instagram.com/b_m_e_bharat',
      youtube: 'https://www.youtube.com/channel/UCxEPxTe3RhRXlBd3Er4653Q',
      linkedin: 'https://www.linkedin.com/company/bme-bharat/',
      x: 'https://x.com/bme_india',   // Already correct
    },

    whatsapp: 'https://wa.me/918310491223',
  };


  const openWebsiteExternally = (url) => {
    if (Platform.OS === "android") {
      // Forces opening in Chrome browser even if app link exists
      Linking.openURL(`googlechrome://navigate?url=${url}`)
        .catch(() => {
          // Fallback to normal browser
          Linking.openURL(url);
        });
    } else {
      // iOS does not auto-trigger app links for regular openURL
      Linking.openURL(url);
    }
  };

  const handlePress = url => {
    Linking.openURL(url).catch(err =>
      console.error('Error opening URL:', err),
    );
  };

  const openWhatsapp = () => {
    const phone = contactDetails.phone; // your phone number
    const message = "Hello! I want to know more about BME Bharat services.";

    const url = `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;

    Linking.openURL(url).catch(err => {
      console.error("Failed to open WhatsApp:", err);
    });
  };

  return (
    <>


      <AppHeader
        title="Help"

      />
      {/* Body */}
      <ScrollView contentContainerStyle={[{ padding: 10 }]}>
        <Text style={styles.description}>
          You can get in touch with us through the platforms below. Our team
          will reach out to you as soon as possible.
        </Text>

        {/* Customer Support */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Customer Support</Text>

          <TouchableOpacity style={styles.row} onPress={() => handlePress(`mailto:${contactDetails.email}`)}>
            <View style={[styles.iconWrapper]}>
              <Email width={dimensions.medium} height={dimensions.medium} color={colors.primary} />
            </View>
            <View style={styles.textColumn}>
              <Text style={styles.label}>Email</Text>
              <Text style={styles.detail}>{contactDetails.email}</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity style={styles.row} onPress={() => handlePress(`tel:${contactDetails.phone}`)}>
            <View style={[styles.iconWrapper]}>
              <Phone width={dimensions.medium} height={dimensions.medium} color={'#28a745'} />
            </View>
            <View style={styles.textColumn}>
              <Text style={styles.label}>Phone</Text>
              <Text style={styles.detail}>{contactDetails.phone}</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity style={styles.row} onPress={() => openWebsiteExternally(contactDetails.website)} >
            <View style={[styles.iconWrapper]}>
              <Web width={dimensions.medium} height={dimensions.medium} color={'#555'} />
            </View>
            <View style={styles.textColumn}>
              <Text style={styles.label}>Website</Text>
              <Text style={styles.detail}>{contactDetails.website}</Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* WhatsApp */}
        <View style={styles.card}>
          <View style={styles.row1}>
            <View style={[styles.iconWrapper]}>
              <WhatsApp width={dimensions.medium} height={dimensions.medium} color={'#25D366'} />
            </View>
            <View style={styles.textColumn}>
              <Text style={styles.label}>WhatsApp</Text>
              <Text
                style={styles.detailLink} // 👈 special style for clickable usernames
                onPress={() => openWhatsapp()}

              >
                @BME Bharat
              </Text>
            </View>
          </View>
        </View>

        {/* Social Media */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Connect with us</Text>

          <View style={styles.row}>
            <View style={[styles.iconWrapper]}>
              <Facebook width={dimensions.medium} height={dimensions.medium} color={'#1877F2'} />
            </View>
            <View style={styles.textColumn}>
              <Text style={styles.label}>Facebook</Text>
              <Text
                style={styles.detailLink}
                onPress={() => handlePress(contactDetails.social.facebook)}
              >
                @BME Bharat
              </Text>
            </View>
          </View>

          <View style={styles.row}>
            <View style={[styles.iconWrapper]}>
              <Instagram width={dimensions.medium} height={dimensions.medium} color={'#E4405F'} />
            </View>
            <View style={styles.textColumn}>
              <Text style={styles.label}>Instagram</Text>
              <Text
                style={styles.detailLink}
                onPress={() => handlePress(contactDetails.social.instagram)}
              >
                @b_m_e_bharat
              </Text>
            </View>
          </View>

          <View style={styles.row}>
            <View style={[styles.iconWrapper]}>
              <Youtube width={dimensions.medium} height={dimensions.medium} color={'#FF0000'} />
            </View>
            <View style={styles.textColumn}>
              <Text style={styles.label}>YouTube</Text>
              <Text
                style={styles.detailLink}
                onPress={() => handlePress(contactDetails.social.youtube)}
              >
                @BME BHARAT
              </Text>
            </View>
          </View>

          <View style={styles.row}>
            <View style={[styles.iconWrapper]}>
              <Linkedin width={dimensions.medium} height={dimensions.medium} color={'#0077B5'} />
            </View>
            <View style={styles.textColumn}>
              <Text style={styles.label}>LinkedIn</Text>
              <Text
                style={styles.detailLink}
                onPress={() => handlePress(contactDetails.social.linkedin)}
              >
                @BME Bharat
              </Text>
            </View>
          </View>

          <View style={styles.row}>
            <View style={[styles.iconWrapper]}>
              <X width={dimensions.medium} height={dimensions.medium} color={'#000'} />
            </View>
            <View style={styles.textColumn}>
              <Text style={styles.label}>X</Text>
              <Text
                style={styles.detailLink}
                onPress={() => handlePress(contactDetails.social.x)}
              >
                @BME_BHARAT
              </Text>
            </View>
          </View>
        </View>


      </ScrollView>
    </>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F9F9F9',

  },

  backButton: {
    alignSelf: 'flex-start',
    padding: 10
  },
  container: {

    paddingHorizontal: 12,
  },
  description: {
    fontSize: 13,
    fontWeight: '500',
    color: colors.text_secondary,
    marginBottom: 10,
    lineHeight: 20,
    letterSpacing: 0.2
  },
  card: {
    backgroundColor: '#FFF',
    borderRadius: 14,
    padding: 16,
    marginBottom: 18,
    elevation: 2,
    // borderWidth: 1,
    // borderColor: '#eee',
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text_primary,
    marginBottom: 14,
  },
  row1: {
    flexDirection: 'row',
    alignItems: 'center',

  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  iconWrapper: {
    width: 35,
    height: 35,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  textColumn: {

  },
  label: {
    fontSize: 13,
    fontWeight: '500',
    color: colors.text_secondary,
  },
  detail: {
    fontSize: 13,
    fontWeight: '500',
    color: colors.primary,
  },
  detailLink: {
    fontSize: 13,
    fontWeight: '500',
    color: colors.primary,
  }

});

export default HelpCenter;
