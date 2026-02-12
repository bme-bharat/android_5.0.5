
import React, { useCallback, useRef } from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, Image, Modal, Linking, RefreshControl, Pressable, TouchableWithoutFeedback, Share, ActivityIndicator, Alert } from 'react-native';
import { useState, useEffect } from 'react';
import { useNavigation } from '@react-navigation/native';

import { Image as FastImage } from 'react-native';
import default_image from '../../images/homepage/buliding.jpg'
import ImageViewer from 'react-native-image-zoom-viewer';
import apiClient from '../ApiClient';
import { showToast } from '../AppUtils/CustomToast';
import { useNetwork } from '../AppUtils/IdProvider';
import { openMediaViewer } from '../helperComponents/mediaViewer';
import { generateAvatarFromName } from '../helperComponents/useInitialsAvatar';
import AppStyles from '../AppUtils/AppStyles';
import { openLink } from '../AppUtils/openLinks';
import ArrowLeftIcon from '../../assets/svgIcons/back.svg';
import ShareIcon from '../../assets/svgIcons/share.svg';
import { colors, dimensions } from '../../assets/theme';
import { trackRecent } from "../appTrack/RecentViews"
import ContactSupplierModal from '../helperComponents/ContactsModal';
import Avatar from '../helperComponents/Avatar';
import { MaterialIcons } from '@react-native-vector-icons/material-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { smartGoBack } from '../../navigation/smartGoBack';
import { AppHeader } from '../AppUtils/AppHeader';
const PRIMARY = '#075cab'
const PRIMARY_LIGHT = '#E6EEF9'

const JobDetailScreen = ({ route }) => {
  const { myId, myData } = useNetwork();

  const { post_id } = route.params || {};
  const routePost = route.params?.post;
  const [profileCreated, setProfileCreated] = useState(false)
  const navigation = useNavigation();
  const [post, setPost] = useState([])
  const [jobImageUrls, setJobImageUrls] = useState({});
  const [isApplied, setIsApplied] = useState(false);
  const [profile, setProfile] = useState(null);
  const [isModalVisible, setModalVisible] = useState(false);
  const contactSheetRef = useRef(null);

  const openModal = (type) => {
    setModalVisible(true);
  };


  const fetchProfile1 = async () => {
    if (!myId) return;

    try {
      const response = await apiClient.post('/getUserDetails', {
        command: 'getUserDetails',
        user_id: myId,
      });

      if (response.data.status === 'success') {
        const profileData = response.data.status_message;
        setProfile(profileData);
      }
    } catch (error) {
      console.error('❌ Error in fetchProfile1:', error);
    }
  };

  useEffect(() => {
    if (!post?.post_id) return;

    const jobImage = jobImageUrls?.[post.post_id];

    trackRecent({
      type: 'job',
      data: {
        ...post,
        image:
          jobImage?.type === 'url'
            ? jobImage.value
            : null, // ✅ resolved URL saved
      },
      id: post.post_id,
    });
  }, [post?.post_id, jobImageUrls]);






  const fetchProfile = async () => {
    try {
      const response = await apiClient.post('/getJobProfiles', {
        command: 'getJobProfiles',
        user_id: myId,
      });

      if (response.data.status === 'error') {
        setProfileCreated(false);
      } else if (response.data.status === 'success') {
        const profileData = response.data.response?.[0];
        setProfileCreated(!!profileData); // true if profileData exists, false otherwise
      }
    } catch (error) {
      console.error('❌ Error fetching profile:', error);
      setProfileCreated(false); // Optional fallback
    }
  };



  useEffect(() => {
    fetchProfile();
    fetchProfile1();
  }, [myId])
  const withTimeout = (promise, timeout = 5000) => {
    return Promise.race([
      promise,
      new Promise((_, reject) => setTimeout(() => reject(new Error("Request timed out")), timeout)),
    ]);
  };

  const fetchJobs = async () => {
    try {
      const requestData = {
        command: 'getJobPost',
        post_id: post_id,
      };

      const res = await withTimeout(apiClient.post('/getJobPost', requestData), 5000);

      const hasValidResponse = res.data.response?.length > 0;

      if (hasValidResponse) {
        const jobData = res.data.response[0];


        // fileKey exists → try fetching signed URL
        try {
          const imgRes = await apiClient.post('/getObjectSignedUrl', {
            command: 'getObjectSignedUrl',
            key: jobData.fileKey,
          });

          if (imgRes.data) {
            setJobImageUrls(prev => ({
              ...prev,
              [jobData.post_id]: { type: "url", value: imgRes.data },
            }));
          }
        } catch (error) {
          console.warn('Error fetching image URL, falling back to avatar:', error);
        }

        setPost(jobData);
      } else {
        setPost({ removed_by_author: true });
      }
    } catch (error) {
      showToast('Network error', 'error');
    }
  };




  useEffect(() => {
    if (routePost) {
      setPost(routePost);
      const fileKey = routePost?.fileKey || routePost?.company_file_key

      if (fileKey) {
        (async () => {
          try {
            const imgRes = await apiClient.post('/getObjectSignedUrl', {
              command: 'getObjectSignedUrl',
              key: fileKey,
            });

            if (imgRes.data) {
              setJobImageUrls(prev => ({
                ...prev,
                [routePost.post_id]: { type: "url", value: imgRes.data },
              }));
            }
          } catch (error) {

          }
        })();
      }
    } else {
      console.log('No routePost found, fetching from API'); // 🟡 LOG: from API
      fetchJobs();
    }
  }, []);



  useEffect(() => {
    fetchAppliedJobs();
  }, [])


  const shareJob = async (post) => {
    try {
      const baseUrl = 'https://bmebharat.com/jobs/post/';
      const jobUrl = `${baseUrl}${post.post_id}`;

      const result = await Share.share({
        message: `Checkout this job: ${jobUrl}`,
      });

      if (result.action === Share.sharedAction) {
        if (result.activityType) {

        } else {

        }
      } else if (result.action === Share.dismissedAction) {

      }
    } catch (error) {

    }
  };




  const fetchAppliedJobs = async () => {
    try {
      const response = await apiClient.post('/getUsersAppliedJobs', {
        command: 'getUsersAppliedJobs',
        user_id: myId,
      });

      if (response.data.status === "success" && response.data.response) {
        const appliedJobsList = response.data.response;

        const appliedJob = appliedJobsList.find(job => job.post_id === post_id);
        setIsApplied(appliedJob?.applied_status === "Applied");

      } else {
        setIsApplied(false);
      }
    } catch (error) {

    }
  };



  const handleApplyJob = async () => {
    if (!profileCreated) {

      showToast('Please create your job profile before applying', 'info');

      setTimeout(() => {
        navigation.navigate('UserJobProfileCreate');
      }, 300);

      return;
    }

    if (isApplied) {

      handleRevoke(post.job_title);
    } else {
      try {
        const response = await apiClient.post('/applyJobs', {
          command: 'applyJobs',
          company_id: post.company_id,
          user_id: myId,
          post_id: post.post_id,
        });

        if (response.data.status === 'success') {
          setIsApplied(true);

          showToast('Job application successful', 'success');

        } else {
          showToast('Something went wrong', 'error');

        }
      } catch (error) {

        showToast('Something went wrong', 'error');

      }
    }
  };


  const confirmAction = () => {
    handleRevoke();
    setModalVisible(false);
  };


  const handleRevoke = async () => {
    try {

      const response = await apiClient.post('/revokeJobs', {
        command: "revokeJobs",
        company_id: post.company_id,
        user_id: myId,
        post_id: post.post_id,
      });

      if (response.data.status === 'success') {
        setIsApplied(false);
        showToast('The application has been successfully revoked', 'success');
      } else {
        showToast('Something went wrong', 'error');

      }
    } catch (error) {
      showToast('Network error', 'error');

    }
  };

  const handleNavigate = (company) => {
    navigation.navigate('CompanyDetails', { userId: company.company_id, profile: company });
  };




  const InfoItem = ({ label, value, icon }) => (
    <View style={styles.infoItem}>
      <View style={styles.infoIcon}>
        <MaterialIcons name={icon} size={20} color="#075CAB" />
      </View>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={styles.infoValue}>{value}</Text>
    </View>
  );


  const Section = ({ title, children }) => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {children}
    </View>
  )

  const Bullet = ({ text, label }) => (
    <View style={styles.bulletRow}>
      <Text style={styles.kLabel} numberOfLines={1}
        ellipsizeMode="tail"
      >{label}</Text>
      <Text style={styles.kColon}>:</Text>
      <Text style={styles.kValue}>{text}</Text>
    </View>
  )

  const KeyValue = ({ label, value, link, onPress }) => {
    if (!value) return null
    return (
      <View style={{ flexDirection: 'row', marginBottom: 6 }}>
        <Text style={styles.kLabel} numberOfLines={1}
          ellipsizeMode="tail"
        >{label}</Text>
        <Text style={styles.kColon}>:</Text>
        <Text
          onPress={onPress}
          style={[
            styles.kValue,
            link && { color: '#075cab', textDecorationLine: 'underline' },
          ]}
        >
          {value}
        </Text>
      </View>
    )
  }

  const isLoading = !post
  const isRemoved = post?.removed_by_author
  const hasJob = post?.job_title

  return (

    <>

      {/* ===== HEADER (ALWAYS) ===== */}
      <AppHeader
        title="Job Details"
        onShare={() => shareJob(post)}
      />

      {/* ===== BODY ===== */}
      {isLoading && (
        <View style={AppStyles.center}>
          <ActivityIndicator size="small" color="#075cab" />
        </View>
      )}

      {!isLoading && isRemoved && (
        <View style={AppStyles.center}>
          <Text style={AppStyles.removedText}>
            This post was removed by the author
          </Text>
        </View>
      )}

      {!isLoading && !isRemoved && hasJob && (
        <>

          {post?.job_title ? (
            <ScrollView
              showsVerticalScrollIndicator={false}
              contentContainerStyle={[

                { paddingHorizontal: 12, paddingBottom: '10%' },
              ]}
            >
              {/* ================= IMAGE / AVATAR ================= */}

              <TouchableOpacity
                activeOpacity={1}
                onPress={() => handleNavigate(post)}
                style={{ alignItems: 'center', marginTop: 10 }}
              >
                <Avatar
                  imageUrl={post?.imageUrl}
                  name={post?.company_name}
                  size={100}
                />
              </TouchableOpacity>


              {/* ================= TITLE ================= */}
              <Text style={styles.jobTitle}>{post?.job_title}</Text>

              <Text
                style={styles.company}
                onPress={() => handleNavigate(post)}
              >
                {post?.company_name || ''} · {post?.company_category || ''}
              </Text>

              {/* ================= INFO ROW ================= */}
              <View style={styles.infoRow}>
                <InfoItem
                  label="Salary"
                  value={post?.Package || '—'}
                  icon="attach-money"
                />
                <InfoItem
                  label="Experience"
                  value={post?.experience_required || '—'}
                  icon="work-outline"
                />
                <InfoItem
                  label="Location"
                  value={post?.working_location?.split(',')[0] || '—'}
                  icon="place"
                />
              </View>

              {/* ================= REQUIREMENTS ================= */}
              {(post?.required_qualifications ||
                post?.required_expertise ||
                post?.speicializations_required) && (
                  <Section title="Requirements">
                    {post?.required_qualifications?.trim() && (
                      <Bullet label="Qualifications" text={post.required_qualifications.trim()} />
                    )}
                    {post?.required_expertise?.trim() && (
                      <Bullet label="expertise" text={post.required_expertise.trim()} />
                    )}
                    {post?.speicializations_required && (
                      <Bullet label="speicializations" text={post.speicializations_required} />
                    )}
                  </Section>
                )}

              {/* ================= LANGUAGES ================= */}

              {/* {post?.preferred_languages?.trim() && (
            <Section title="Languages">
              {post.preferred_languages.split(',').map((lang, index) => (
                <Bullet key={index} text={lang.trim()} />
              ))}
            </Section>
          )} */}

              {/* ================= OTHER DETAILS ================= */}
              <Section title="Other Details">
                <KeyValue label="Industry" value={post?.industry_type} />

                {post?.Website && (
                  <KeyValue
                    label="Website"
                    value={post.Website.trim()}
                    link
                    onPress={() => openLink(post.Website)}
                  />
                )}

                {post?.preferred_languages && (
                  <KeyValue
                    label="Languages"
                    value={post.preferred_languages.trim()}
                  />
                )}
                <KeyValue
                  label="Posted on"
                  value={
                    post?.job_post_created_on
                      ? (() => {
                        const date = new Date(post.job_post_created_on * 1000)
                        const d = String(date.getDate()).padStart(2, '0')
                        const m = String(date.getMonth() + 1).padStart(2, '0')
                        const y = date.getFullYear()
                        return `${d}-${m}-${y}`
                      })()
                      : ''
                  }
                />
              </Section>


              {/* ================= JOB DESCRIPTION ================= */}
              {post?.job_description?.trim() && (
                <Section title="Job Description">
                  <Text style={styles.sectionText}>
                    {post.job_description.trim()}
                  </Text>
                </Section>
              )}


            </ScrollView>

          ) : null}
        </>
      )}
      {/* ================= CONTACT CTA ================= */}
      {myId !== post?.company_id && (
        <TouchableOpacity
          style={styles.floatingContact}
          onPress={() => contactSheetRef.current?.present()}
          activeOpacity={0.85}
        >
          <MaterialIcons name="phone-in-talk" size={36} color="#075cab" />

        </TouchableOpacity>
      )}


      <ContactSupplierModal
        ref={contactSheetRef}
        company_id={post?.company_id}
      />

      {(profile?.user_type === 'users') && (
        <View style={styles.footer}>
          <TouchableOpacity
            style={[
              styles.applyBtn,
              isApplied && styles.applyButtonRevoke,
            ]}
            onPress={() => {
              if (!profileCreated) {

                showToast("Job profile doesn't exists. Create one before applying for a job", 'info');

                setTimeout(() => {
                  navigation.navigate('UserJobProfileCreate');
                }, 300);
              } else {
                if (isApplied) {
                  openModal('revoke');
                } else {
                  handleApplyJob();
                }
              }
            }}

            activeOpacity={0.8}
          >
            <Text style={[styles.buttonText, isApplied && styles.revokeText]}>
              {isApplied ? 'Revoke' : 'Apply'}
            </Text>

          </TouchableOpacity>
        </View>
      )}

      {/* <View style={styles.footer}>
        <TouchableOpacity style={styles.applyBtn}>
          <Text style={styles.applyText}>Apply Now</Text>
        </TouchableOpacity>
      </View> */}



      <Modal
        transparent={true}
        animationType="fade"
        visible={isModalVisible}

      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>
              Confirm revocation
            </Text>
            <Text style={styles.modalMessage}>
              Are you sure you want to revoke your application?
            </Text>
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={styles.modalButton}
                onPress={() => setModalVisible(false)}
              >
                <Text style={styles.buttonText1}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.modalButton}
                onPress={confirmAction}
              >
                <Text style={styles.buttonText2}>Confirm</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

    </ >

  );
};




const styles = StyleSheet.create({

  applyButtonRevoke: {
    // borderColor: '#FF0000',
    // borderWidth: 1,
    backgroundColor: '#e0e0e0'

  },

  buttonText: {
    color: '#075CAB',
    fontSize: 16,
    fontWeight: '600'
  },

  revokeText: {
    color: '#FF0000',
  },

  buttonActive: {
    opacity: 0.8,
  },

  modalContainer: {
    width: '80%',
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 10,
    alignItems: 'center',
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },

  modalMessage: {
    fontSize: 15,
    color: 'black',
    marginBottom: 20,
    textAlign: 'center', // Centered message
    fontWeight: '400',
    lineHeight: 23,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '500',
    color: '#333',
    marginBottom: 12,
    textAlign: 'center',
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
  },

  modalButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
    minWidth: 100,
    alignItems: 'center',
    margin: 10
  },

  buttonText1: {
    color: 'red',
    fontSize: 17,
    fontWeight: '600',
  },
  buttonText2: {
    color: 'green',
    fontSize: 17,
    fontWeight: '600',
  },

  phoneNumber: {
    color: '#075cab',
    fontWeight: 'bold',
    padding: 10,

  },
  modalWrapper: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },

  modalContent: {
    width: '80%',
    backgroundColor: '#ffffff',
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20
  },

  modalText: {
    fontSize: 16,
    textAlign: 'center',
    color: '#000',
  },

  closeButton: {
    position: 'absolute',
    top: 10,
    right: 10,
    padding: 5,

    borderRadius: 20,
  },
  closeButtonText: {
    color: '#075cab',
    fontSize: 16,
  },

  detailImage: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: '#eee',
  },

  /* ---------- TITLE ---------- */
  jobTitle: {
    marginTop: 16,
    textAlign: 'center',
    fontSize: 20,
    fontWeight: '700',
    color: '#111',
  },
  company: {
    marginTop: 4,
    textAlign: 'center',

    color: '#666',
  },

  /* ---------- INFO ROW ---------- */
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginVertical: 24,

  },
  infoItem: {
    alignItems: 'center',
    flex: 1,
  },

  infoIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: PRIMARY_LIGHT,
    marginBottom: 6,
    alignItems: 'center',
    justifyContent: 'center',

  },
  infoLabel: {
    color: '#888',
  },
  infoValue: {
    fontWeight: '500',
    color: '#222',
    marginTop: 2,
    textAlign: 'center',
  },

  /* ---------- SECTIONS ---------- */
  section: {
    marginTop: 5,
  },
  sectionTitle: {

    fontWeight: '700',
    marginBottom: 8,
    color: '#111',
  },
  sectionText: {
    lineHeight: 20,
    color: '#555',
  },

  /* ---------- BULLETS ---------- */
  bulletRow: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  bulletDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: PRIMARY,
    marginTop: 6,
    marginRight: 8,
  },
  bulletText: {
    flex: 1,

    lineHeight: 20,
    color: '#555',
  },

  /* ---------- KEY VALUE ---------- */
  kLabel: {
    width: 100,
    color: '#666',
  },
  kColon: {
    marginHorizontal: 4,
    color: '#666',
  },
  kValue: {
    flex: 1,
    color: '#111',
  },
  floatingContact: {
    position: 'absolute',
    right: 16,
    bottom: 80, // IMPORTANT: above footer
    width: 52,
    height: 52,
    borderRadius: 26,
    borderWidth: 1,
    borderColor: '#075cab',
    backgroundColor: '#FFF',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 6, // Android shadow
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowOffset: { width: 0, height: 3 },
    shadowRadius: 4,
  },

  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 16,
    paddingVertical: 8,
    // borderTopWidth: 1,
    // borderTopColor: '#ddd',
    backgroundColor: '#FFF'
  },

  applyBtn: {
    height: 48,
    backgroundColor: '#E7F0FA',
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },

});


export default JobDetailScreen;