

import React, { useCallback, useEffect, useRef, useState } from 'react';
import { View, FlatList, Image, StyleSheet, ToastAndroid, TouchableOpacity, Text, Alert, TextInput, RefreshControl, Share, Keyboard, ActivityIndicator } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import Ionicons from 'react-native-vector-icons/Ionicons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Toast from 'react-native-toast-message';
import { Image as FastImage } from 'react-native';
import Message from '../../components/Message';
import defaultImage from '../../images/homepage/image.jpg'
import { useDispatch, useSelector } from 'react-redux';
import apiClient from '../ApiClient';
import { showToast } from '../AppUtils/CustomToast';
import { useNetwork } from '../AppUtils/IdProvider';
import { EventRegister } from 'react-native-event-listeners';
import { MyPostBody } from './forumBody';
import { deleteS3KeyIfExists } from '../helperComponents/s3Helpers';
import ArrowLeftIcon from '../../assets/svgIcons/back.svg';
import Add from '../../assets/svgIcons/add.svg';

import { colors, dimensions } from '../../assets/theme.jsx';
import { useNavigation, useRoute } from '@react-navigation/native';


const defaultLogo = Image.resolveAssetSource(defaultImage).uri;

const videoExtensions = [
  '.mp4', '.mov', '.avi', '.mkv', '.flv', '.wmv', '.webm',
  '.m4v', '.3gp', '.3g2', '.f4v', '.f4p', '.f4a', '.f4b', '.qt', '.quicktime'
];

const YourForumListScreen = ({ userId, onScroll }) => {
  const route = useRoute();

  const { myId, myData } = useNetwork();

  const profileUserId = route.params?.userId ?? myId

  const isMyProfile = profileUserId === myId
  const navigation = useNavigation();
  const [allForumPost, setAllForumPost] = useState([]);
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
  const [postToDelete, setPostToDelete] = useState(null);
  const scrollViewRef = useRef(null)
  const [fileKeyToDelete, setFileKeyToDelete] = useState(null);
  const [isRefreshing, setIsRefreshing] = useState(false);


  useEffect(() => {

    fetchPosts();

  }, []);

  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMorePosts, setHasMorePosts] = useState(false);
  const [lastEvaluatedKey, setLastEvaluatedKey] = useState(null);

  useEffect(() => {
    const listeners = [
      EventRegister.addEventListener('onForumPostCreated', async ({ newPost }) => {
        try {
          const signedUrl = await getSignedUrlForPost(newPost);
          setAllForumPost(prev => [{
            ...newPost,
            signedUrl: signedUrl || defaultLogo
          }, ...prev]);
        } catch {
          setAllForumPost(prev => [{
            ...newPost,
            signedUrl: defaultLogo
          }, ...prev]);
        }
      }),

      EventRegister.addEventListener('onForumPostDeleted', ({ forum_id }) => {
        setAllForumPost(prev => prev.filter(post => post.forum_id !== forum_id));
      }),

      EventRegister.addEventListener('onForumPostUpdated', async ({ updatedPost }) => {
        try {
          // Only try to get signed URL if fileKey exists
          const signedUrl = updatedPost.fileKey
            ? await getSignedUrlForPost(updatedPost)
            : null;

          setAllForumPost(prev => prev.map(post =>
            post.forum_id === updatedPost.forum_id
              ? {
                ...updatedPost,
                signedUrl: signedUrl || defaultLogo,
                posted_on: updatedPost.posted_on // Ensure this is included
              }
              : post
          ));
        } catch {
          setAllForumPost(prev => prev.map(post =>
            post.forum_id === updatedPost.forum_id
              ? {
                ...updatedPost,
                signedUrl: defaultLogo,
                posted_on: updatedPost.posted_on // Ensure this is included
              }
              : post
          ));
        }
      })
    ];

    return () => listeners.forEach(listener => EventRegister.removeEventListener(listener));
  }, [defaultLogo]); // Add defaultLogo as dependency



  const fetchPosts = async (lastEvaluatedKey = null) => {
    if (!profileUserId || loading || loadingMore) return;

    lastEvaluatedKey ? setLoadingMore(true) : setLoading(true);

    try {
      const requestData = {
        command: "getUsersAllForumPosts",
        user_id: profileUserId,
        limit: 10,
        ...(lastEvaluatedKey && { lastEvaluatedKey })
      };

      const response = await apiClient.post("/getUsersAllForumPosts", requestData);

      if (response.data.status === "success") {
        let posts = response.data.response || [];
        posts.sort((a, b) => b.posted_on - a.posted_on);

        // Fetch signed URLs and add them directly to each post
        const postsWithMedia = await Promise.all(
          posts.map(async (post) => {
            // For posts with fileKey, try to get signed URL
            // For posts without fileKey, use default logo immediately
            const signedUrl = await getSignedUrlForPost(post, defaultLogo);
            return { ...post, signedUrl };
          })
        );

        setAllForumPost(prev => {
          if (!lastEvaluatedKey) {
            return postsWithMedia;
          } else {
            // Filter out any duplicates that might already exist
            const newPosts = postsWithMedia.filter(
              post => !prev.some(p => p.forum_id === post.forum_id)
            );
            return [...prev, ...newPosts];
          }
        });

        // Pagination
        if (response.data.lastEvaluatedKey) {
          setLastEvaluatedKey(response.data.lastEvaluatedKey);
          setHasMorePosts(true);
        } else {
          setHasMorePosts(false);
        }
      }
    } catch (error) {
      console.error('Failed to fetch posts:', error);
      setHasError(true);
      if (!lastEvaluatedKey) {
        setAllForumPost([]);
      }
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  const getSignedUrlForPost = async (post, defaultLogo) => {
    // If no fileKey, immediately return default logo
    if (!post.fileKey) return defaultLogo;

    const fileKey = post.fileKey?.split("?")[0]?.toLowerCase() || "";
    const isVideo = videoExtensions.some((ext) => fileKey.endsWith(ext));
    const keyToFetch = isVideo ? post.thumbnail_fileKey : post.fileKey;

    if (!keyToFetch) return defaultLogo;

    try {
      const response = await apiClient.post("/getObjectSignedUrl", {
        command: "getObjectSignedUrl",
        key: keyToFetch,
      });

      return response.data || defaultLogo;
    } catch (error) {
      console.error("Error getting signed URL:", error);
      return defaultLogo;
    }
  };

  const handleEditPress = (post, imageUrl) => {
    navigation.navigate("ForumEdit", { post, imageUrl });
  };

  const forumDetails = (forum_id, url) => {
    navigation.navigate("Comment", { forum_id, url });
  };

  const handleDelete = (forum_id, fileKey, thumbnail_fileKey) => {
    const filesToDelete = [fileKey, thumbnail_fileKey];

    setPostToDelete(forum_id);
    setFileKeyToDelete(filesToDelete);
    setShowDeleteConfirmation(true);
  };


  const confirmDelete = async () => {
    setShowDeleteConfirmation(false);

    // ✅ Use utility function for S3 deletions
    if (fileKeyToDelete && fileKeyToDelete.length > 0) {
      try {
        for (const key of fileKeyToDelete) {
          await deleteS3KeyIfExists(key);
        }
      } catch (error) {

        return;
      }
    }

    try {
      const response = await apiClient.post('/deleteForumPost', {
        command: "deleteForumPost",
        user_id: myId,
        forum_id: postToDelete,
      });

      if (response.data.status === 'success') {
        EventRegister.emit('onForumPostDeleted', { forum_id: postToDelete });
        showToast("Forum post deleted", 'success');
      } else {
        throw new Error(response.data.status_message || "Failed to delete post.");
      }
    } catch (error) {
      showToast("Something went wrong", 'error');
    }
  };



  const cancelDelete = () => {
    setShowDeleteConfirmation(false);
    setPostToDelete(null);
    setFileKeyToDelete(null);
  };

  // This stays OUTSIDE the RenderPostItem component
  const RightActions = ({ item, imageUri, isDefaultImage, onEdit, onDelete }) => {
    return (
      <View style={styles.swipeActionsContainer}>
        <TouchableOpacity
          style={[styles.actionButton, styles.editSwipeButton]}
          onPress={() => onEdit(item, isDefaultImage ? undefined : imageUri)}
        >
          <Text style={styles.actionText}>Edit</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionButton, styles.deleteSwipeButton]}
          onPress={() => onDelete(item.forum_id, item.fileKey, item.thumbnail_fileKey)}
        >
          <Text style={styles.actionText}>Delete</Text>
        </TouchableOpacity>
      </View>
    );
  };

  const handleRefresh = async() => {
    setIsRefreshing(true);
    await fetchPosts();
    setIsRefreshing(false);
  }
  const RenderPostItem = ({ item }) => {
    const imageUri = item.signedUrl || item.thumbnailUrl || item.imageUrl || defaultLogo;

    const formattedDate = item.posted_on
      ? new Date(item.posted_on * 1000).toLocaleDateString('en-GB', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
      }).replace(/\//g, '-')
      : 'No date';
    const cleanUri = (uri) => uri?.split('?')[0];

    const isDefaultImage = cleanUri(imageUri) === cleanUri(defaultLogo);
    const renderRight = () => (
      <RightActions
        item={item}
        imageUri={imageUri}
        isDefaultImage={isDefaultImage}
        onEdit={handleEditPress}
        onDelete={handleDelete}
      />
    );

    return (


      <TouchableOpacity activeOpacity={1} onPress={() => {
        forumDetails(item.forum_id, isDefaultImage ? undefined : imageUri);
      }} style={styles.postContainer}>

        <View style={styles.imageContainer}>
          <Image
            source={{ uri: imageUri }}
            style={styles.image}
            resizeMode="contain"
            onError={() => console.log('Image load error')}
          />

        </View>

        <View style={styles.textContainer}>
          <MyPostBody
            html={item.forum_body}
            forumId={item?.forum_id}
            numberOfLines={2}
          />
          <Text style={styles.value}>{formattedDate || ""}</Text>
          {isMyProfile &&
            <View style={styles.buttonContainer}>
              <TouchableOpacity
                style={styles.editButton}
                onPress={() => handleEditPress(item, isDefaultImage ? undefined : imageUri)}
              >
                <Text style={styles.editButtonText}>Edit</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.deleteButton}
                onPress={() => handleDelete(item.forum_id, item.fileKey, item.thumbnail_fileKey)}
              >
                <Text style={styles.deleteButtonText}>Delete</Text>
              </TouchableOpacity>
            </View>
          }
        </View>

      </TouchableOpacity>

    );
  };


  if (Array.isArray(allForumPost) && allForumPost.length === 0 && !loading) {

    return (

      <>

        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <Text style={{ fontSize: 16, color: 'gray' }}>No posts available</Text>
        </View>
      </>
    );
  }


  return (


    <>

      <FlatList
        data={allForumPost}
        renderItem={RenderPostItem}
        onScroll={onScroll}
        refreshControl={
          <RefreshControl refreshing={isRefreshing} onRefresh={handleRefresh} />
        }
        onScrollBeginDrag={() => Keyboard.dismiss()}
        keyExtractor={(item) => item.forum_id}
        showsHorizontalScrollIndicator={false}
        showsVerticalScrollIndicator={false}
        ref={scrollViewRef}
        onEndReached={() => hasMorePosts && fetchPosts(lastEvaluatedKey)} // Fetch more posts
        onEndReachedThreshold={0.5}
        bounces={false}
      />


      {showDeleteConfirmation && (
        <Message
          visible={showDeleteConfirmation}
          onCancel={cancelDelete}
          onOk={confirmDelete}
          title="Delete Confirmation"
          iconType="warning"  // You can change this to any appropriate icon type
          message="Are you sure you want to delete this post?"
        />
      )}

    </>


  );
};



const styles = StyleSheet.create({

  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 10
  },
  postContainer: {
    flexDirection: 'row',
    marginBottom: 5,
    marginHorizontal: 5,
    backgroundColor: '#FFF',
    borderRadius: 10,
    // borderWidth: 0.5,
    // borderColor: '#ddd',
  },

  swipeContainer: {
    marginBottom: 5,

  },
  rowWrapper: {
    minHeight: 120,           // 🔑 SINGLE source of truth
    overflow: 'hidden',
    marginBottom: 5,
  },

  swipeActionsContainer: {
    flexDirection: 'row',
    overflow: 'hidden',
  },

  actionButton: {
    width: 90,
    justifyContent: 'center',
    alignItems: 'center',
  },

  editSwipeButton: {
    backgroundColor: '#2E7D32', // calm green
  },

  deleteSwipeButton: {
    backgroundColor: '#C62828', // strong red
  },

  actionText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },

  noPostsContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  noPostsText: {
    color: 'black',
    fontSize: 18,
    fontWeight: '400',
    padding: 10
  },
  backButton: {
    alignSelf: 'flex-start',
    padding: 10
  },
  searchContainer: {
    flex: 1,
    padding: 10,
    alignSelf: 'center',
    backgroundColor: 'whitesmoke',
  },


  imageContainer: {
    flex: 1,
    justifyContent: 'flex-start',
    // backgroundColor:'red',
    alignItems: 'center',
    padding: 10
  },

  image: {
    width: 100,
    height: 100,
    borderRadius: 8,
    // backgroundColor:'blue',
  },



  textContainer: {
    flex: 2,
    padding: 15,
    gap: 8,
  },

  title: {
    fontSize: 15,
    fontWeight: '600',
    color: "black"

  },
  body: {
    textAlign: 'justify',
    fontSize: 15,
    color: 'black',
    fontWeight: '400',
  },

  downtext: {
    fontSize: 15,
    marginLeft: 10,
    color: 'gray',
    fontWeight: "450"
  },
  value: {
    flex: 2,
    flexShrink: 1,
    color: 'black',
    fontWeight: '400',
    fontSize: 14,
    textAlign: 'left',
    alignSelf: 'flex-start',
    marginBottom: 5,
  },

  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 10,
  },
  editButton: {
    width: 80,
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: '#ffffff',
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 1 },
    justifyContent: 'center'
  },
  editButtonText: {
    marginLeft: 5,
    fontSize: 16,
    color: "#075cab",
  },
  deleteButtonText: {
    color: "#FF0000",
  },
  deleteButton: {
    width: 80,
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    marginLeft: 10,
    borderRadius: 8,
    backgroundColor: '#ffffff',
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 1 },
    justifyContent: 'center'

  },


});

export default YourForumListScreen;
