
import { StyleSheet, Text, View, Image, ScrollView, Modal, Linking, Platform, TouchableOpacity, TouchableWithoutFeedback } from 'react-native';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useFocusEffect, useNavigation, useRoute } from '@react-navigation/native';
import ContactSupplierModal from '../helperComponents/ContactsModal';
import { openMediaViewer } from '../helperComponents/mediaViewer';
import ResumeModal from '../helperComponents/resumeModal';
import ArrowLeftIcon from '../../assets/svgIcons/back.svg';

import { colors, dimensions } from '../../assets/theme.jsx';
import AppStyles from '../AppUtils/AppStyles.js';
import Avatar from '../helperComponents/Avatar.jsx';
import apiClient from '../ApiClient.jsx';
import { smartGoBack } from '../../navigation/smartGoBack.jsx';
import { AppHeader } from '../AppUtils/AppHeader.jsx';
import MaterialIcons from '@react-native-vector-icons/material-icons';

const CompanyGetJobCandidatesScreen = () => {
  const route = useRoute();
  const {
    posts: routePosts,
    imageUrl,
    userId,
  } = route.params || {};

  const navigation = useNavigation()
  const scrollViewRef = useRef(null)
  const [modalVisible, setModalVisible] = useState(false);
  const contactSheetRef = useRef(null);
  const [profile, setPosts] = useState(routePosts || {});
  console.log('profile',profile)
  const [loading, setLoading] = useState(!routePosts);
  const [error, setError] = useState(null);
  const [imageUrls, setImageUrls] = useState(imageUrl || {});

  useEffect(() => {
    if (routePosts) return;
    if (!userId) return;

    const fetchPosts = async () => {
      try {
        const response = await apiClient.post('/getJobProfiles', {
          command: 'getJobProfiles',
          user_id: userId,
        });

        if (response.data.status === 'success') {
          const postsData = response.data.response;
          if (Array.isArray(postsData) && postsData.length > 0) {
            setPosts(postsData[0]); // ✅ FIX
          }

          const imageUrlsObject = {};

          await Promise.all(
            postsData.map(async (post) => {
              if (post.fileKey) {
                try {
                  const res = await apiClient.post('/getObjectSignedUrl', {
                    command: 'getObjectSignedUrl',
                    key: post.fileKey,
                  });
                  const img_url = res.data;
                  if (img_url) {
                    imageUrlsObject[post.seeker_id] = img_url;
                  }
                } catch (e) {
                  console.warn('Error fetching image URL for', post.seeker_id, e);
                }
              }
            })
          );

          setImageUrls(imageUrlsObject);
        } else {
          console.warn('API Error:', response.data.status_message);
        }
      } catch (err) {
        console.error('Error fetching posts:', err);
        setError(err);
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, [userId]);


  const Row = ({ icon, label, value }) => (
    <TouchableOpacity activeOpacity={0.7} style={styles.row}>
      <View style={styles.left}>
        <View style={styles.iconWrap}>
          <MaterialIcons name={icon} size={20} color="#000" />
        </View>
        <View style={styles.textWrap}>
          <Text style={styles.value}>{value}</Text>
          <Text style={styles.label}>{label}</Text>
        </View>
      </View>

      {/* <MaterialIcons name="chevron-right" size={24} color="#777" /> */}
    </TouchableOpacity>
  );

  const isLoading = !profile
  const isRemoved = error
  const hasProfile = profile?.first_name

  return (

    <View style={styles.container}>


      <AppHeader
        title={"Candidate details"}

      />
      {isLoading && (
        <View style={AppStyles.center}>
          <ActivityIndicator size="small" color="#075cab" />
        </View>
      )}

      {!isLoading && isRemoved && (
        <View style={AppStyles.center}>
          <Text style={AppStyles.removedText}>
            Create job profile
          </Text>
        </View>
      )}
      {!isLoading && !isRemoved && hasProfile && (
        <>
          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 16 }}
            showsHorizontalScrollIndicator={false} ref={scrollViewRef}>
            <TouchableOpacity
              onPress={() => {
                if (typeof imageUrl === 'string') {
                  openMediaViewer([{ type: 'image', url: imageUrl }])
                }
              }}
              activeOpacity={0.8}
              style={styles.imageContainer}
            >

              <Avatar
                imageUrl={imageUrls}
                name={profile?.first_name}
                size={100}
              />
            </TouchableOpacity>

            <Row
              icon="person"
              value= {`${(profile?.first_name || '').trim()} ${(profile?.last_name || '').trim()}`}
              label="candidate"
            />

            <Row
              icon="transgender"
              value={profile?.gender}
              label="Gender"
            />

            <Row
              icon="work"
              value={profile?.work_experience}
              label="Work experience"
            />
            {profile?.college && (
              <Row
                icon="school"
                value={profile?.college}
                label="College"
              />
            )}


            <Row
              icon="school"
              value={profile?.education_qualifications}
              label="Educational qualification"
            />


            <Row
              icon="engineering"
              value={profile?.expert_in}
              label="Expert in"
            />


            <Row
              icon="location-on"
              value={`${profile?.city || ''}, ${profile?.state || ''}`.trim()}
              label="Address"
            />

            <Row
              icon="domain"
              value={profile?.domain_strength}
              label="Domain strength"
            />

            <Row
              icon="category"
              value={profile?.industry_type}
              label="Industry type"
            />

            {profile?.languages && (
              <Row
                icon="school"
                value={profile?.languages}
                label="Languages known"
              />
            )}
            <Row
              icon="laptop"
              value={profile?.preferred_cities}
              label="Preferred cities"
            />

            <Row
              icon="attach-money"
              value={profile?.expected_salary}
              label="Expected salary"
            />




          </ScrollView>
          <View style={styles.actionRow}>

            <TouchableOpacity
              onPress={() => {
                contactSheetRef.current?.present();
              }}
              style={styles.halfButtonPrimary}
            >
              <View style={styles.rowCenter}>
                {/* <MaterialIcons
                  name="phone"
                  size={20}
                  color={colors.primary}
                  style={styles.icon}
                /> */}
                <Text style={styles.buttonTextPrimary}>Contact details</Text>
              </View>
            </TouchableOpacity>
            {/* <View style={styles.centerDivider} /> */}

            <TouchableOpacity onPress={() => setModalVisible(true)}
              style={styles.halfButtonDelete} >
              <Text style={styles.buttonTextPrimary}>View resume</Text>
            </TouchableOpacity>
          </View>
        </>
      )}
      <ContactSupplierModal
        ref={contactSheetRef}
        company_id={profile?.user_id}
      />

      <ResumeModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        company_id={profile?.user_id}
      />
    </View>
  );
};


const styles = StyleSheet.create({
  container: {
    flex: 1,

  },

  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderColor: '#f0f0f0'

  },
  imageContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 10,
    marginBottom: 20
  },
  image: {
    width: '100%',
    height: '100%',
    borderRadius: 80,
    justifyContent: 'center',
    alignItems: 'center'
  },
  avatarText: {
    fontSize: 40,
    fontWeight: 'bold',
  },

  textContainer: {
    // borderWidth: 1,
    // borderColor: '#ccc',
    borderRadius: 10,
    // padding: 15,

  },

  contact: {
    fontSize: 16,
    color: '#075cab',
    textDecorationLine: 'underline',
    padding: 10,
    textAlign: 'center',

  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)', // Semi-transparent background
  },
  modalContent: {
    width: '80%',
    backgroundColor: '#ffffff',
    padding: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'space-between', // Make sure the content is spaced properly
    height: '12%', // Adjust height based on the content
  },
  cancelButton: {
    position: 'absolute',
    top: 2,
    right: 2,
    backgroundColor: 'transparent',
    padding: 5,
  },
  modalText: {
    fontSize: 16,
    textAlign: 'center',
    color: '#000',
    marginBottom: 10,
  },
  phoneNumber: {
    color: '#075cab',
    fontWeight: 'bold',
    top: 10,
  },

  stickyContactButton: {
    position: 'absolute',
    bottom: -100,
    right: 10,
    backgroundColor: '#075cab',
    borderRadius: 50,
    padding: 15,
  },

  modalContainerImage: { flex: 1, backgroundColor: 'white', justifyContent: 'center', alignItems: 'center' },
  closeButton1: { position: 'absolute', top: 60, right: 20 },
  modalImage: { width: '100%', height: '100%', borderRadius: 10 },

  dropdownContainer1: {
    position: 'absolute',
    top: 50,
    right: 20,
    backgroundColor: 'white',
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 10,
    elevation: 5,
    zIndex: 1,
  },

  dropdownItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
  },


  dropdownText: {
    fontSize: 16,
    color: '#075cab',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderColor: '#e2e2e2',
  },

  left: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },

  iconWrap: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#e2e2e2',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  textWrap: {
    flexShrink: 1
  },
  value: {
    fontSize: 15,
    fontWeight: '400',
    color: colors.text_primary,

  },

  label: {
    fontSize: 13,
    color: '#888',
    marginTop: 2,
  },
  title: {
    fontSize: 18,
    fontWeight: '500',
    color: colors.text_primary,

  },
  category: {
    fontSize: 14,
    fontWeight: '400',
    color: colors.text_secondary,
  },
  textContainer: {
    marginLeft: 10,
    flex: 1
  },
  actionRow: {
    flexDirection: 'row',
    marginHorizontal: 10,
    paddingVertical: 6,
    // borderTopWidth: 1,
    // borderColor: '#e0e0e0',
    overflow: 'hidden',
    // backgroundColor: 'red'
  },
  centerDivider: {
    width: 1,
    backgroundColor: '#e0e0e0',   // 👈 vertical center line
  },
  halfButtonDelete: {
    flex: 1,               // 👈 takes half
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 8,
    // borderWidth: 1,
    // borderColor: colors.danger,
    marginHorizontal: 6,
    backgroundColor: '#E7F0FA',
  },

  halfButtonPrimary: {
    flex: 1,               // 👈 takes half
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 8,
    // borderWidth: 1,
    // borderColor: colors.primary,
    backgroundColor: '#E7F0FA',
    marginHorizontal: 6,

  },

  buttonTextPrimary: {
    fontWeight: '500',
    color: colors.primary,
  },
  rowCenter: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  icon: {
    marginRight: 6,
  },

});

export default CompanyGetJobCandidatesScreen;