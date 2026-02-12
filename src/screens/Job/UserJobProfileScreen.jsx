import React, { useCallback, useEffect, useRef, useState } from 'react';
import { View, Image, StyleSheet, TouchableOpacity, Text, Alert, Linking, ScrollView, ToastAndroid, Button, ActivityIndicator } from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import Message from '../../components/Message';
import { useSelector } from 'react-redux';
import { Image as FastImage } from 'react-native';
import { showToast } from '../AppUtils/CustomToast';
import { useFileOpener } from '../helperComponents/fileViewer';
import { useNetwork } from '../AppUtils/IdProvider';
import apiClient from '../ApiClient';
import { generateAvatarFromName } from '../helperComponents/useInitialsAvatar';
import ArrowLeftIcon from '../../assets/svgIcons/back.svg';
import Edit from '../../assets/svgIcons/edit.svg';
import Add from '../../assets/svgIcons/add.svg';

import { colors, dimensions } from '../../assets/theme.jsx';
import AppStyles from '../AppUtils/AppStyles.js';
import Animated from 'react-native-reanimated';
import { AppHeader } from '../AppUtils/AppHeader.jsx';
import Avatar from '../helperComponents/Avatar.jsx';
import MaterialIcons from '@react-native-vector-icons/material-icons';

const UserJobProfilescreen = () => {
  const { myId, myData } = useNetwork();
  const navigation = useNavigation();
  const [profile, setProfile] = useState(null);
  const [imageUrl, setImageUrl] = useState(null);
  const [resumeUrl, setResumeUrl] = useState(null);
  const scrollViewRef = useRef(null);
  const profileImage = useSelector(state => state.CompanyProfile.profile);
  const [modalVisible, setModalVisible] = useState(false);
  const [modalTitleDelete, setModalTitleDelete] = useState('');
  const [modalMessageDelete, setModalMessageDelte] = useState('');

  const { openFile } = useFileOpener();
  const [loading, setLoading] = useState(false);

  const handleOpenResume = async () => {
    if (!profile?.resume_key) return;
    setLoading(true);
    try {
      await openFile(profile.resume_key);
    } finally {
      setLoading(false);
    }
  };

  // Handle delete confirmation
  const handleDelete1 = async () => {
    setModalTitleDelete('Confirm Deletion');
    setModalMessageDelte('Are you sure you want to delete this job profile? Deleting it will remove all job applications, this action cannot be undone.');
    setModalVisible(true);
  };
  // setModalMessageDelte("Are you sure you want to delete this job profile?\nDeleting it will remove all job applications,this action cannot be undone.");
  // Handle cancellation
  const onCancel = () => {
    setModalVisible(false);
  };

  useFocusEffect(
    useCallback(() => {

      if (scrollViewRef.current) {
        // Scroll to the top after fetching companies
        scrollViewRef.current.scrollTo({ x: 0, y: 0, animated: false });
      }
    }, [])
  );


  useEffect(() => {
    if (myId) {
      fetchProfile();
    }
  }, [myId]);


  const onDeleteConfirm = async () => {
    try {
      const response = await apiClient.post('/deleteJobProfile', {
        command: 'deleteJobProfile',
        user_id: myId,
        resume_key: resumeUrl
      });

      if (response.data.status === 'success') {
        showToast("Your job profile has been successfully deleted", 'success');
        setModalVisible(false);

        navigation.goBack();

      } else {

        showToast("Something went wrong", 'error');

      }
    } catch (error) {
      showToast("You don't have an internet connection", 'error');

    }
  };

  const fetchProfile = async () => {
    try {
      const response = await apiClient.post('/getJobProfiles', {
        command: 'getJobProfiles',
        user_id: myId,
      });

      if (response.data.status === 'success') {
        const profileData = response.data.response[0];

        if (profileData) {
          setProfile(profileData);

          let first_name = profileData?.first_name

          if (profileData.fileKey && profileData.fileKey !== 'null') {
            const imgUrlResponse = await apiClient.post('/getObjectSignedUrl', {
              command: 'getObjectSignedUrl',
              key: profileData.fileKey,
            });
            setImageUrl(imgUrlResponse.data);
          } else {
            const initialAvatars = generateAvatarFromName(first_name)

            setImageUrl(initialAvatars);

          }

          if (profileData.resume_key) {
            const resumeUrlResponse = await apiClient.post('/getObjectSignedUrl', {
              command: 'getObjectSignedUrl',
              key: profileData.resume_key,
            });
            setResumeUrl(resumeUrlResponse.data);
          }
        } else {
          setProfile({ removed_by_author: true });

        }
      } else {
        setProfile({ removed_by_author: true });

      }
    } catch (error) {
      setProfile({ removed_by_author: true });

    }
  };

  useFocusEffect(
    useCallback(() => {
      if (myId) fetchProfile();
    }, [myId])
  );

  const handleUpdate = () => {
    navigation.navigate('UserJobProfileUpdate', { profile, imageUrl });
  };



  const handleNavigate = () => {
    if (hasProfile) {
      handleUpdate();
    } else {
      navigation.navigate('UserJobProfileCreate');
    }
  };

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
  const isRemoved = profile?.removed_by_author
  const hasProfile = profile?.first_name

  return (
    < >

      <AppHeader
        title="Job profile"
        onEdit={handleNavigate}
        editLabel={hasProfile ? 'Edit' : 'Create'}
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

            <View style={styles.imageContainer}>

              <Avatar
                imageUrl={profileImage?.imageUrl}
                name={profile?.first_name}
                size={50}
                radius={8}
              />


              <View style={styles.textContainer}>
                <Text style={[styles.title]} numberOfLines={1} ellipsizeMode='tail'>
                  {`${(profile?.first_name || '').trim()} ${(profile?.last_name || '').trim()}`}
                </Text>
                <Text style={styles.category}>{profile?.user_email_id || ""}</Text>
              </View>
            </View>

            <View style={styles.Heading}>



              {/* <Row
                icon="email"
                value={(profile?.user_email_id || "").trimStart().trimEnd()}
                label="E-mail Address"
              /> */}

              <Row
                icon="phone"
                value={profile?.user_phone_number}
                label="Phone Number"
              />

              <Row
                icon="location-on"
                value={`${profile?.city || ''}, ${profile?.state || ''}`.trim()}
                label="Address"
              />


              <Row
                icon="transgender"
                value={profile?.gender}
                label="Gender"
              />
              <Row
                icon="date-range"
                value={profile?.date_of_birth}
                label="Date of Birth"
              />
              {(profile?.college?.trimStart().trimEnd()) && (
                <Row
                  icon="work"
                  value={profile?.college.trimStart().trimEnd()}
                  label="Institute / Company"
                />
              )}

              <Row
                icon="person"
                value={profile?.industry_type}
                label="Profile"
              />
              <Row
                icon="school"
                value={profile?.education_qualifications}
                label="Educational qualification"
              />
              <Row
                icon="engineering"
                value={profile.expert_in}
                label="Expert in"
              />

              <Row
                icon="person"
                value={profile?.work_experience}
                label="Experience"
              />
              <Row
                icon="location-on"
                value={profile?.preferred_cities}
                label="Preferred cities"
              />
              <Row
                icon="attach-money"
                value={profile?.expected_salary}
                label="Expected salary"
              />
              <Row
                icon="domain"
                value={profile?.domain_strength}
                label="Domain strength"
              />
              {profile?.languages && (
                <Row
                  icon="person"
                  value={profile?.languages}
                  label="languages"
                />
              )}
              {/* <View style={commonStyles.labValContainer}>
                <Text style={commonStyles.label}>Email ID  </Text>
                <Text style={commonStyles.colon}>:</Text>
                <Text style={commonStyles.value}>{(profile?.user_email_id || "").trimStart().trimEnd()}
                </Text>
              </View> */}

              {/* <View style={commonStyles.labValContainer}>
                <Text style={commonStyles.label}>Phone no.     </Text>
                <Text style={commonStyles.colon}>:</Text>
                <Text style={commonStyles.value}>{profile?.user_phone_number || ""}
                </Text>
              </View>

              <View style={commonStyles.labValContainer}>
                <Text style={commonStyles.label}>Location         </Text>
                <Text style={commonStyles.colon}>:</Text>

                <Text style={commonStyles.value}>{profile?.city}, {profile?.state || ""}
                </Text>
              </View>
              {(profile?.college?.trimStart().trimEnd()) ? (
                <View style={commonStyles.labValContainer}>
                  <Text style={commonStyles.label}>College</Text>
                  <Text style={commonStyles.colon}>:</Text>
                  <Text style={commonStyles.value}>{profile?.college.trimStart().trimEnd()}</Text>
                </View>
              ) : null}

              <View style={commonStyles.labValContainer}>
                <Text style={commonStyles.label}>Educational qualification          </Text>
                <Text style={commonStyles.colon}>:</Text>

                <Text style={commonStyles.value}>{(profile?.education_qualifications || "").trimStart().trimEnd()}
                </Text>
              </View>

              <View style={commonStyles.labValContainer}>
                <Text style={commonStyles.label}>Date of birth      </Text>
                <Text style={commonStyles.colon}>:</Text>

                <Text style={commonStyles.value}>{profile?.date_of_birth ? formatDate(profile?.date_of_birth) : "NULL"}</Text>
              </View>

              <View style={commonStyles.labValContainer}>
                <Text style={commonStyles.label}>Gender          </Text>
                <Text style={commonStyles.colon}>:</Text>

                <Text style={commonStyles.value}>{profile?.gender || ""}
                </Text>
              </View>

              <View style={commonStyles.labValContainer}>
                <Text style={commonStyles.label}>Industry type              </Text>
                <Text style={commonStyles.colon}>:</Text>

                <Text style={commonStyles.value}>{(profile?.industry_type || "").trimStart().trimEnd()}
                </Text>
              </View>

              <View style={commonStyles.labValContainer}>
                <Text style={commonStyles.label}>Expert in              </Text>
                <Text style={commonStyles.colon}>:</Text>
                <View style={{ flex: 2 }}>
                  {profile.expert_in.split(",").map((skill, index) => (
                    <Text key={index} style={commonStyles.value}>
                      {skill.trim()},
                    </Text>
                  ))}
                </View>

              </View>

              <View style={commonStyles.labValContainer}>
                <Text style={commonStyles.label}>Experience</Text>
                <Text style={commonStyles.colon}>:</Text>

                <Text style={commonStyles.value}>{profile?.work_experience || ""}
                </Text>
              </View>

              <View style={commonStyles.labValContainer}>
                <Text style={commonStyles.label}>Preferred cities    </Text>
                <Text style={commonStyles.colon}>:</Text>

                <Text style={[commonStyles.value]}>
                  <View style={{ flexDirection: "column", flex: 1 }}>
                    {profile.preferred_cities
                      .split(",")
                      .map((city, index) => (
                        <Text key={index} style={commonStyles.value}>
                          {city.trim()}
                        </Text>
                      ))}
                  </View>
                </Text>
              </View>

              <View style={commonStyles.labValContainer}>
                <Text style={commonStyles.label}>Expected salary    </Text>
                <Text style={commonStyles.colon}>:</Text>

                <Text style={commonStyles.value}>{profile?.expected_salary || ""}
                </Text>
              </View>

              <View style={commonStyles.labValContainer}>
                <Text style={commonStyles.label}>Domain strength    </Text>
                <Text style={commonStyles.colon}>:</Text>

                <Text style={commonStyles.value}>{profile?.domain_strength || ""}
                </Text>
              </View>

              {profile?.languages && profile?.languages.trim().length > 0 && (
                <View style={commonStyles.labValContainer}>
                  <Text style={commonStyles.label}>Languages known        </Text>
                  <Text style={commonStyles.colon}>:</Text>
                  <View style={{ flex: 2 }}>
                    {profile.languages.split(",").map((language, index) => (
                      <Text key={index} style={commonStyles.value}>
                        {language.trim()}
                      </Text>
                    ))}
                  </View>
                </View>
              )} */}

            </View>

            <View style={styles.actionRow}>
              <TouchableOpacity
                onPress={handleOpenResume}
                disabled={loading}
                style={styles.halfButtonPrimary}
              >
                {loading ? (
                  <ActivityIndicator size="small" color={colors.primary} />
                ) : (
                  <View style={styles.rowCenter}>
                    <MaterialIcons
                      name="remove-red-eye"
                      size={20}
                      color={colors.primary}
                      style={styles.icon}
                    />
                    <Text style={styles.buttonTextPrimary}>View Resume</Text>
                  </View>
                )}
              </TouchableOpacity>
              <View style={styles.centerDivider} />

              <TouchableOpacity style={styles.halfButtonDelete} onPress={handleDelete1}>
                <MaterialIcons
                  name="delete-outline"
                  size={20}
                  color={colors.danger}
                  style={styles.icon}
                />
                <Text style={styles.buttonTextDelete} numberOfLines={1} ellipsizeMode='tail'>Delete job profile</Text>
              </TouchableOpacity>


            </View>
          </ScrollView>

        </>
      )}

      <Message
        visible={modalVisible}
        onCancel={onCancel}
        onOk={onDeleteConfirm}
        title={modalTitleDelete}
        message={modalMessageDelete}
        iconType="warning"
      />

    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },

  container3: {
    flex: 1,
    padding: 10,
    backgroundColor: '#fff',
  },
  scrollViewContainer: {
    paddingBottom: "20%", // Space for the sticky button
    top: 20,
  },

  imageContainer: {
    marginVertical: 10,
    flexDirection: 'row'

  },

  detailImage: {
    width: '100%',
    height: '100%',
    borderRadius: 80,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center'
  },

  Heading: {
    flex: 1,
    justifyContent: 'space-between',
    paddingHorizontal: 5

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
    // marginVertical: 20, 
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
    paddingVertical: 18,
    borderRadius: 8,
    // borderWidth: 1,
    // borderColor: colors.danger,
    // backgroundColor: '#fff',
  },

  halfButtonPrimary: {
    flex: 1,               // 👈 takes half
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 18,
    borderRadius: 8,
    // borderWidth: 1,
    // borderColor: colors.primary,
    // backgroundColor: '#fff',
  },

  rowCenter: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  icon: {
    marginRight: 6,
  },

  buttonTextDelete: {
    fontSize: 15,
    fontWeight: '400',
    color: colors.danger,
  },

  buttonTextPrimary: {
    fontSize: 15,
    fontWeight: '400',
    color: colors.primary,
  },


  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderColor: '#f0f0f0'

  },

  backButton: {
    alignSelf: 'flex-start',
    padding: 10,
  },
  createButton: {
    backgroundColor: '#075cab',
    borderRadius: 50,
    padding: 10,
  },
  circle: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    // paddingVertical: 10,
    paddingHorizontal: 5,
    // marginTop: 10,
    borderRadius: 8,
  },
  shareText: {
    color: colors.text_white,
    fontSize: 16,
    fontWeight: '600',

  },

});

export default UserJobProfilescreen;

