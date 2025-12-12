import React from 'react';
import { View, Text, TouchableOpacity, Image as FastImage } from 'react-native';
import { settingStyles as styles } from '../Styles/settingStyles';
import User from '../../assets/svgIcons/user.svg';
import Company from '../../assets/svgIcons/company.svg';
import Phone from '../../assets/svgIcons/phone.svg';
import Email from '../../assets/svgIcons/mail.svg';
import Register from '../../assets/svgIcons/register.svg';
import School from '../../assets/svgIcons/school.svg';
import { colors, dimensions } from '../../assets/theme.jsx';
import { commonStyles } from '../AppUtils/AppStyles.js';
import Quill from "../../assets/svgIcons/quill.svg";

const UserProfileCard = ({ profile, onEdit, onNavigate }) => {
  const isCompany = profile?.user_type === 'company';

  return (
    <TouchableOpacity activeOpacity={1} onPress={onNavigate} style={styles.profileContainer}>



      <View style={styles.row}>

        {/* LEFT — Image */}
        <TouchableOpacity activeOpacity={1} onPress={onNavigate} style={styles.leftImageWrapper}>
          {profile?.imageUrl ? (
            <FastImage
              source={{ uri: profile?.imageUrl }}
              style={styles.detailImage}
              resizeMode="cover"
              onError={() => { }}
            />
          ) : (
            <View style={[styles.avatarFallback]}>
              <Text style={styles.avatarText}>
                {profile?.companyAvatar?.initials}
              </Text>
            </View>
          )}
        </TouchableOpacity>

        {/* RIGHT — Details */}
        <View style={styles.rightInfo}>
          {isCompany ? (
            <>
              <View style={styles.titleRow}>
                <Company width={20} height={20} />
                <Text style={styles.colon}>|</Text>
                <Text style={styles.value}>{profile?.company_name?.trim()}</Text>
              </View>

              <View style={styles.titleRow}>
                <Phone width={20} height={20} />
                <Text style={styles.colon}>|</Text>
                <Text style={styles.value}>{profile?.company_contact_number}</Text>
              </View>

              <View style={styles.titleRow}>
                <Email width={20} height={20} />
                <Text style={styles.colon}>|</Text>
                <Text style={styles.value}>{profile?.company_email_id}</Text>
              </View>

              <View style={styles.titleRow}>
                <Register width={20} height={20} />
                <Text style={styles.colon}>|</Text>
                <Text style={styles.value}>{profile?.business_registration_number}</Text>
              </View>
            </>
          ) : (
            <>
              <View style={styles.titleRow}>
                <User width={20} height={20} />
                <Text style={styles.colon}>|</Text>
                <Text style={styles.value}>
                  {(profile?.first_name || '').trim()} {(profile?.last_name || '').trim()}
                </Text>
              </View>

              <View style={styles.titleRow}>
                <Phone width={20} height={20} />
                <Text style={styles.colon}>|</Text>
                <Text style={styles.value}>{profile?.user_phone_number}</Text>
              </View>

              <View style={styles.titleRow}>
                <Email width={20} height={20} />
                <Text style={styles.colon}>|</Text>
                <Text style={styles.value}>{profile?.user_email_id}</Text>
              </View>

              {!!profile?.college?.trim() && (
                <View style={styles.titleRow}>
                  <School width={20} height={20} />
                  <Text style={styles.colon}>|</Text>
                  <Text style={styles.value}>{profile.college.trim()}</Text>
                </View>
              )}
            </>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
};

export default UserProfileCard;
