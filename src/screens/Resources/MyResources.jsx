import React, { useCallback, useEffect, useRef, useState } from 'react';
import { View, FlatList, Image, StyleSheet, ToastAndroid, TouchableOpacity, Text, Alert, TextInput, RefreshControl, Share, Keyboard, ActivityIndicator } from 'react-native';
import axios from 'axios';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import Ionicons from 'react-native-vector-icons/Ionicons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Toast from 'react-native-toast-message';
import { useFocusEffect } from '@react-navigation/native';
import Video from 'react-native-video';
import { Image as FastImage } from 'react-native';
import Message from '../../components/Message';

import defaultImage from '../../images/homepage/image.jpg'

import { useDispatch } from 'react-redux';
import { deleteResourcePost } from '../Redux/Resource_Actions';
import { showToast } from '../AppUtils/CustomToast';
import apiClient from '../ApiClient';
import { useNetwork } from '../AppUtils/IdProvider';
import { EventRegister } from 'react-native-event-listeners';
import { MyPostBody } from '../Forum/forumBody';
import { deleteS3KeyIfExists } from '../helperComponents/s3Helpers';
import { getSignedUrl } from '../helperComponents/signedUrls';
import ArrowLeftIcon from '../../assets/svgIcons/back.svg';
import Pdf from '../../assets/svgIcons/pdf.svg';
import Excel from '../../assets/svgIcons/excel.svg';
import Word from '../../assets/svgIcons/word.svg';
import PPT from '../../assets/svgIcons/ppt.svg';
import File from '../../assets/svgIcons/file.svg';
import Add from '../../assets/svgIcons/add.svg';

import { colors, dimensions } from '../../assets/theme.jsx';
import AppStyles, { STATUS_BAR_HEIGHT } from '../AppUtils/AppStyles.js';
const defaultLogo = Image.resolveAssetSource(defaultImage).uri;

const YourResourcesList = ({ navigation, route }) => {
  const { myId, myData } = useNetwork();

  const [allForumPost, setAllForumPost] = useState([]);
  console.log('allForumPost', allForumPost)
  const [imageUrls, setImageUrls] = useState({});
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
  const [postToDelete, setPostToDelete] = useState(null);
  const [lastEvaluatedKey, setLastEvaluatedKey] = useState(null);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const scrollViewRef = useRef(null)
  const [fileKeyToDelete, setFileKeyToDelete] = useState(null);
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const handleResourceCreated = async ({ newPost }) => {

      const enrichedPost = await fetchSignedUrlForPost(newPost, setImageUrls);
      setAllForumPost(prev => [enrichedPost, ...(Array.isArray(prev) ? prev : [])]);
    };

    const handleResourceUpdated = async ({ updatedPost }) => {

      const enrichedPost = await fetchSignedUrlForPost(updatedPost, setImageUrls);
      setAllForumPost(prev =>
        (Array.isArray(prev) ? prev : []).map(post =>
          post.resource_id === enrichedPost.resource_id ? enrichedPost : post
        )
      );
    };

    const handleResourceDeleted = ({ deletedPostId }) => {
      setAllForumPost(prev =>
        (Array.isArray(prev) ? prev : []).filter(post => post.resource_id !== deletedPostId)
      );
      setImageUrls(prev => {
        const newUrls = { ...prev };
        delete newUrls[deletedPostId];
        return newUrls;
      });
    };

    const createListener = EventRegister.addEventListener('onResourcePostCreated', handleResourceCreated);
    const updateListener = EventRegister.addEventListener('onResourcePostUpdated', handleResourceUpdated);
    const deleteListener = EventRegister.addEventListener('onResourcePostDeleted', handleResourceDeleted);

    return () => {
      EventRegister.removeEventListener(createListener);
      EventRegister.removeEventListener(updateListener);
      EventRegister.removeEventListener(deleteListener);
    };
  }, []);



  const fetchSignedUrlForPost = async (post, setImageUrls) => {
    const fileKey = post?.fileKey;

    // If fileKey is missing → set defaultLogo and return early
    if (!fileKey) {
      setImageUrls(prev => ({ ...prev, [post.resource_id]: defaultLogo }));
      return post;
    }

    try {
      const signedUrl = await getSignedUrl(post.resource_id, fileKey);

      setImageUrls(prev => ({
        ...prev,
        [post.resource_id]: signedUrl || defaultLogo, // fallback just in case
      }));

      return post;
    } catch (err) {
      setImageUrls(prev => ({ ...prev, [post.resource_id]: defaultLogo }));
      return post;
    }
  };





  useEffect(() => {
    fetchResources();
  }, [])

  const fetchResources = async (loadMore = false) => {
    if (!myId) return;
    setLoading(true);
    try {
      const response = await apiClient.post("/getUsersAllResourcePosts", {
        command: "getUsersAllResourcePosts",
        user_id: myId,
        limit: 10,
        lastEvaluatedKey: loadMore ? lastEvaluatedKey : null,
      });

      if (response.data.status !== "success") {
        setAllForumPost({ removed_by_author: true });
        return;
      }

      const posts = response.data.response || [];
      if (posts.length === 0 && !loadMore) {
        setAllForumPost({ removed_by_author: true });
        return;
      }

      posts.sort((a, b) => b.posted_on - a.posted_on);
      setAllForumPost(loadMore ? [...allForumPost, ...posts] : posts);
      setLastEvaluatedKey(response.data.lastEvaluatedKey);

      const urlsObject = {};
      await Promise.all(
        posts.map(async (post) => {
          try {
            const mimeType = post?.extraData?.mimeType || "";
            const isVideo = mimeType.startsWith("video");
            const isImage = mimeType.startsWith("image");

            let fileKeyToUse = isVideo
              ? post.thumbnail_fileKey || post.fileKey
              : post.fileKey;

            if (!fileKeyToUse) {
              urlsObject[post.resource_id] = defaultLogo;
              return;
            }

            const signedUrl = await getSignedUrl(post.resource_id, fileKeyToUse);
            urlsObject[post.resource_id] = signedUrl || defaultLogo;
          } catch (err) {
            urlsObject[post.resource_id] = defaultLogo;
          }
        })
      );

      setImageUrls(prev => ({ ...prev, ...urlsObject }));
    } catch (err) {
      setAllForumPost({ removed_by_author: true });
    } finally {
      setLoading(false);
      setIsLoadingMore(false);
    }
  };


  const loadMorePosts = () => {
    if (lastEvaluatedKey && !isLoadingMore) {
      setIsLoadingMore(true);

      setTimeout(() => {
        fetchResources(true).finally(() => {

        });
      }, 500);
    }
  };


  useFocusEffect(
    useCallback(() => {
      if (scrollViewRef.current) {
        scrollViewRef.current.scrollToOffset({ offset: 0, animated: false });
      }
    }, [])
  );


  const handleEditPress = (post, imageUrl) => {
    navigation.navigate("ResourcesEdit", { post, imageUrl });
  };


  const handleDelete = (forum_id, fileKey, thumbnail_fileKey) => {
    const filesToDelete = [fileKey, thumbnail_fileKey];


    setPostToDelete(forum_id);
    setFileKeyToDelete(filesToDelete);
    setShowDeleteConfirmation(true);
  };

  const confirmDelete = async () => {
    setShowDeleteConfirmation(false);

    if (fileKeyToDelete?.length > 0) {
      try {
        for (const key of fileKeyToDelete) {
          if (key) {

            await deleteS3KeyIfExists(key); // ✅ use utility function
          }
        }
      } catch (error) {

        return;
      }
    }

    try {
      const response = await apiClient.post('/deleteResourcePost', {
        command: "deleteResourcePost",
        user_id: myId,
        resource_id: postToDelete,
      });

      if (response.data.status === 'success') {

        EventRegister.emit('onResourcePostDeleted', {
          deletedPostId: postToDelete,
        });

        dispatch(deleteResourcePost(postToDelete));
        setAllForumPost(prevPosts =>
          prevPosts.filter(post => post.resource_id !== postToDelete)
        );

        showToast("Resource post deleted", 'success');
      } else {
        throw new Error("Failed to delete post.");
      }
    } catch (error) {
      console.error("❌ Error deleting post:", error);
    }
  };


  const cancelDelete = () => {
    setShowDeleteConfirmation(false);
    setPostToDelete(null);
    setFileKeyToDelete(null);
  };

  const fileIcons = {
    PDF: { Icon: Pdf, color: colors.danger },
    XLS: { Icon: Excel, color: colors.success },
    XLSX: { Icon: Excel, color: colors.success },
    DOC: { Icon: Word, color: colors.primary },
    DOCX: { Icon: Word, color: colors.primary },
    PPT: { Icon: PPT, color: colors.warning },
    PPTX: { Icon: PPT, color: colors.warning },
    DEFAULT: { Icon: File, color: colors.gray },
  };

  const getFileIconData = (filename) => {
    const ext = filename?.split('.').pop()?.toUpperCase();
    return fileIcons[ext] || fileIcons.DEFAULT;
  };
  const RenderPostItem = ({ item }) => {

    const { Icon, color } = getFileIconData(item?.extraData?.name);

    const rawFileUrl = imageUrls[item.resource_id];
    const fileUrl = typeof rawFileUrl === "object"
      ? Object.values(rawFileUrl)[0]   // take first value
      : rawFileUrl || item.fileUrl || item.imageUrl || defaultLogo;

    const isDefaultImage =
      fileUrl === defaultLogo || fileUrl?.includes('image.jpg');

    const formattedDate = new Date(item.posted_on * 1000)
      .toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      })
      .replace(/\//g, "-");

    return (
      <TouchableOpacity
        activeOpacity={1}
        onPress={() =>
          navigation.navigate("ResourceDetails", { resourceID: item.resource_id })
        }
      >
        <View style={styles.postContainer}>
          <View style={styles.imageContainer}>
            {item?.extraData?.type?.startsWith("image/") ? (
              <Image
                source={{ uri: fileUrl }}
                style={styles.image}
                resizeMode="contain"
              />
            ) : item?.extraData?.type?.startsWith("video/") ? (
              <Video
                source={{ uri: fileUrl }}
                style={styles.video}
                resizeMode="contain"
                paused
              />
            ) : item?.fileKey ? (
              <View style={styles.documentContainer}>
                <Icon width={dimensions.icon.xl} height={dimensions.icon.xl} color={color} />
                <Text style={[styles.docText, { color }]}>
                  {item?.extraData?.name?.split(".")?.pop()?.toUpperCase() || "DOC"}
                </Text>
              </View>
            ) : (
              // Fallback to image if nothing matches
              <Image
                source={{ uri: fileUrl }}
                style={styles.image}
                resizeMode="contain"
              />
            )}
          </View>


          <View style={styles.textContainer}>
            <View style={styles.productDetails}>
              <Text numberOfLines={1} style={styles.value}>
                {item.title || ""}
              </Text>

              <MyPostBody
                html={item.resource_body}
                forumId={item.resource_id}
                numberOfLines={2}
              />
            </View>

            {item.posted_on && (
              <Text style={styles.value}>{formattedDate || ""}</Text>
            )}


            <View style={styles.buttonContainer}>
              <TouchableOpacity
                style={[styles.editButton, { marginRight: 10 }]}
                onPress={() => handleEditPress(item, isDefaultImage ? undefined : fileUrl)}
              >

                <Text style={styles.editButtonText}>Edit</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.editButton}
                onPress={() =>
                  handleDelete(item.resource_id, item.fileKey, item.thumbnail_fileKey)
                }
              >
                <Text style={styles.deleteButtonText}>Delete</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </TouchableOpacity>
    );
  };


  const keyExtractor = (item) => {
    return item.forum_id ? item.forum_id.toString() : `${item.forum_id}_${item.posted_on}`;
  };

  if (
    loading ||
    !allForumPost ||
    allForumPost.length === 0 ||
    allForumPost?.removed_by_author
  ) {
    return (
      <View style={styles.container}>
        <View style={[AppStyles.toolbar, { backgroundColor: '#075cab' }]} />

        <View style={styles.headerContainer}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => {
              if (navigation.canGoBack()) {
                navigation.goBack();
              } else {
                navigation.navigate('Home3');
              }
            }}
          >
            <ArrowLeftIcon width={dimensions.icon.medium} height={dimensions.icon.medium} color={colors.primary} />

          </TouchableOpacity>

          {!loading && (
            <TouchableOpacity
              style={styles.circle}
              onPress={() => navigation.navigate('ResourcesPost')}
            >
              <Add width={dimensions.icon.medium} height={dimensions.icon.medium} color={colors.primary} />

              <Text style={styles.shareText}>Contribute</Text>
            </TouchableOpacity>
          )}
        </View>

        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          {loading ? (
            <ActivityIndicator size="small" color="#075cab" />
          ) : (
            <Text style={{ fontSize: 16, color: 'gray' }}>No resources available</Text>
          )}
        </View>
      </View>
    );
  }


  return (
    <View style={styles.container}>
      <View style={[AppStyles.toolbar, { backgroundColor: '#075cab' }]} />

      <View style={styles.headerContainer}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <ArrowLeftIcon width={dimensions.icon.medium} height={dimensions.icon.medium} color={colors.primary} />

        </TouchableOpacity>

        <TouchableOpacity style={styles.circle}
          onPress={() => navigation.navigate('ResourcesPost')}>
          <Add width={dimensions.icon.medium} height={dimensions.icon.medium} color={colors.primary} />

          <Text style={styles.shareText}>Contribute</Text>
        </TouchableOpacity>
      </View>


      <FlatList
        data={allForumPost}
        renderItem={RenderPostItem}
        contentContainerStyle={{ paddingBottom: '20%' }}
        keyExtractor={keyExtractor}
        showsHorizontalScrollIndicator={false}
        showsVerticalScrollIndicator={false}
        ref={scrollViewRef}
        onScrollBeginDrag={() => Keyboard.dismiss()}
        onEndReached={loadMorePosts}
        onEndReachedThreshold={0.5}

        // refreshControl={
        //   <RefreshControl
        //     refreshing={isRefreshing}
        //     onRefresh={handleRefresh}
        //   />
        // }
        bounces={false}
      />

      {showDeleteConfirmation && (
        <Message
          visible={showDeleteConfirmation}
          onCancel={cancelDelete}
          onOk={confirmDelete}
          title="Delete Confirmation"
          iconType="warning"
          message="Are you sure you want to delete this post?"
        />
      )}

      <Toast />
    </View>
  );
};




const styles = StyleSheet.create({
  heading: {
    fontSize: 24,
    fontWeight: '500',
    marginBottom: 20,
    marginTop: 10,
    color: "#075cab"
  },

  postContainer: {
    flexDirection: 'row',
    marginBottom: 5,
    marginHorizontal: 5,
    backgroundColor: 'white',
    justifyContent: 'center',
    borderRadius: 10,
    borderWidth: 0.5,
    borderColor: '#ddd',
    shadowColor: '#000',
    top: 5
  },
  imageContainer: {
    flex: 1,
    justifyContent: 'flex-start',
    // backgroundColor:'red',
    alignItems: 'center',
    padding: 10,
  },
  noPostsText: {
    color: 'black',
    textAlign: "center",
    fontSize: 18,
    fontWeight: '400',
    padding: 10,
  },
  noPostsContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },

  backButton: {
    alignSelf: 'flex-start',
    padding: 10
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
    color: '#075cab',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 4,

  },

  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderColor: '#f0f0f0'
  },
  container: {
    flex: 1,
    backgroundColor: 'white',
    paddingTop: STATUS_BAR_HEIGHT
  },
  createPostButton: {
    position: 'absolute',
    bottom: 40,
    right: 10,
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: "#075cab"
  },


  image: {
    width: 100,
    height: 100,
    resizeMode: 'contain'
  },

  video: {
    width: 100,
    height: 100,


  },
  documentContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 10,
    padding: 10,
  },
  docText: {
    marginTop: 5,
    fontSize: 14,
    fontWeight: 'bold',
    color: '#075cab',
  },


  textContainer: {
    flex: 2,
    padding: 15,
    gap: 8,

  },
  productDetails: {
    flex: 1, // Take remaining space
    // marginLeft: 15,
  },

  value: {
    flex: 2, // Take the remaining space
    flexShrink: 1,
    color: 'black',
    fontWeight: '400',
    fontSize: 14,
    textAlign: 'left', // Align text to the left
    alignSelf: 'flex-start',
    marginBottom: 5,
  },

  downtext: {
    fontSize: 15,
    marginLeft: 10,
    color: 'gray',
    fontWeight: "450"
  },
  body1: {
    fontSize: 14,
    margin: 10,
    marginBottom: 5,
    textAlign: 'left',
    color: 'black',
    fontWeight: "300"
  },
  label: {
    color: 'black',
    fontSize: 13,
    fontWeight: '300',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 10,
    backgroundColor: 'white',
  },
  editButton: {
    justifyContent: 'center',
    width: 80,
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: 'white',
    borderRadius: 5,
    elevation: 2

  },
  editButtonText: {
    marginLeft: 5,
    fontSize: 16,
    color: "#075cab",
    backgroundColor: 'white',

  },
  deleteButtonText: {
    color: "#FF0000",
    backgroundColor: 'white',

  },

});



export default YourResourcesList
