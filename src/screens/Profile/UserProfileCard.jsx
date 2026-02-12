import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import Icon1 from 'react-native-vector-icons/MaterialIcons';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { Image as FastImage } from 'react-native';
import { settingStyles as styles } from '../Styles/settingStyles';
import User from '../../assets/svgIcons/user.svg';
import Company from '../../assets/svgIcons/company.svg';

import Phone from '../../assets/svgIcons/phone.svg';
import Email from '../../assets/svgIcons/mail.svg';
import Register from '../../assets/svgIcons/register.svg';
import School from '../../assets/svgIcons/school.svg';


import { colors, dimensions } from '../../assets/theme.jsx';
import { commonStyles } from '../AppUtils/AppStyles.js';
import Avatar from '../helperComponents/Avatar.jsx';
import MaterialIcons from '@react-native-vector-icons/material-icons';
import LinearGradient from 'react-native-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';


const UserProfileCard = ({ profile, onEdit, onNavigate }) => {
  const isCompany = profile?.user_type === 'company';
    const insets = useSafeAreaInsets();

  return (
    <TouchableOpacity activeOpacity={1} onPress={onNavigate} >
      <LinearGradient
        colors={
          ['#239eab', '#74deee']
        }

        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[styles.profileContainer,{paddingTop:insets?.top + 24}]}
      >
        <View
          style={{
            backgroundColor: '#fff',
            borderRadius: 12,
            flexDirection: 'row',
            alignItems: 'center',
            padding: 12,
          }}
        >
          <Avatar
            imageUrl={profile?.imageUrl}
            name={profile?.first_name || profile?.company_name}
            size={50}

          />
        </View>
        <View style={styles.profileDetails}>
          {isCompany ? (
            <>

              <Text style={styles.fName} numberOfLines={1} ellipsizeMode='tail'>{profile?.company_name?.trim()}</Text>

              {/* <Text style={styles.value}>{(profile?.company_contact_number || '').trim()}</Text> */}

              <Text style={styles.value}>{profile?.company_email_id || ''}</Text>

              {/* <Text style={styles.value}>{(profile?.business_registration_number || '').trim()}  </Text> */}


            </>
          ) : (
            <>

              <Text style={styles.fName} numberOfLines={1} ellipsizeMode='tail'>
                {(profile?.first_name || '').trim()} {(profile?.last_name || '').trim()}
              </Text>

              {/* <Text style={styles.value}>{(profile?.user_phone_number || '').trim()}</Text> */}

              <Text style={styles.value}>{profile?.user_email_id || ''}</Text>
              {/* 
            {!!profile?.college?.trim() && (

              <Text style={styles.value}>{profile.college.trim()}</Text>

            )} */}
            </>
          )}
        </View>

        <MaterialIcons name='chevron-right' size={26} color={colors.text_primary} />
      </LinearGradient>

    </TouchableOpacity>
  );
};

export default UserProfileCard;