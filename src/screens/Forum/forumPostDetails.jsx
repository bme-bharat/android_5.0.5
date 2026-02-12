


import React, { useEffect, useState, useCallback, useRef } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  Image,
  TouchableOpacity,
  Modal,

  Linking,
  Share,
  Keyboard,
  ActivityIndicator,
  InputAccessoryView,
  Dimensions,
  TouchableWithoutFeedback,
  Pressable
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';

import Video from 'react-native-video';
import { Image as FastImage } from 'react-native';
import apiClient from '../ApiClient';
import { showToast } from '../AppUtils/CustomToast';
import { useNetwork } from '../AppUtils/IdProvider';
import { useBottomSheet } from '../AppUtils/SheetProvider';
import CommentsSection from '../AppUtils/Comments';
import CommentInputBar from '../AppUtils/InputBar';
import { EventRegister } from 'react-native-event-listeners';
import { useConnection } from '../AppUtils/ConnectionProvider';
import { getSignedUrl, getTimeDisplay, getTimeDisplayForum } from '../helperComponents/signedUrls';
import { openMediaViewer } from '../helperComponents/mediaViewer';
import ReactionSheet from '../helperComponents/ReactionUserSheet';
import { ForumBody, normalizeHtml } from './forumBody';
import useForumReactions, { fetchForumReactionsRaw, reactionConfig } from './useForumReactions';
import ArrowLeftIcon from '../../assets/svgIcons/back.svg';
import ShareIcon from '../../assets/svgIcons/share.svg';
import Comment from '../../assets/svgIcons/comment.svg';
import Thumb from '../../assets/svgIcons/thumb.svg';
import { ScaledSheet } from 'react-native-size-matters';

import { colors, dimensions } from '../../assets/theme.jsx';
import AppStyles from '../AppUtils/AppStyles.js';
import Avatar from '../helperComponents/Avatar.jsx'
import { smartGoBack } from '../../navigation/smartGoBack.jsx';
import { AppHeader } from '../AppUtils/AppHeader.jsx';
import { Divider, Avatar as PaperAvatar } from 'react-native-paper';

const screenHeight = Dimensions.get('window').height;
const { width } = Dimensions.get('window');
const { width: deviceWidth, height: deviceHeight } = Dimensions.get('window');
const IMAGE_WIDTH = Dimensions.get('window').width - 10;

const CommentScreen = ({ route }) => {
  const { highlightId, highlightReactId, forum_id, url } = route.params;
  const { myId, myData } = useNetwork();
  const { isConnected } = useConnection();
  const { openSheet, closeSheet } = useBottomSheet();

  const [post, setPost] = useState(null);
  const [mediaUrl, setMediaUrl] = useState('');
  const [mediaUrl1, setMediaUrl1] = useState('');

  const navigation = useNavigation();
  const [count, setCount] = useState();
  const [errorMessage, setErrorMessage] = useState();
  const [loading, seLoading] = useState();
  const commentSectionRef = useRef(null);

  useEffect(() => {
    if (!highlightId || !post) return;

    const timeout = setTimeout(() => {
      openCommentsSheet();
    }, 1000);

    return () => clearTimeout(timeout);
  }, [highlightId, post]);


  useEffect(() => {
    if (highlightReactId && reactionSheetRef.current) {
      // Delay to ensure sheet is mounted
      const timeout = setTimeout(() => {
        reactionSheetRef.current?.present(forum_id, 'All', highlightReactId);
      }, 1000); // Give enough time for ReactionSheet to mount

      return () => clearTimeout(timeout);
    }
  }, [highlightReactId, forum_id]);

  const reactionSheetRef = useRef();
  const commentRef = useRef(null);
  const [reaction, setReaction] = useState();
  const activeReactions = reactionConfig.filter(
    cfg => reaction?.reactionsCount?.[cfg.type] > 0
  );

  useEffect(() => {
    async function logReactions() {
      try {
        const reactions = await fetchForumReactionsRaw(forum_id, myId);
        setReaction(reactions);

      } catch (error) {

      }
    }
    logReactions();
  }, []);

  const { handleReactionUpdate } = useForumReactions(myId);

  const selectedReaction = reactionConfig.find(r => r.type === reaction?.userReaction && reaction?.userReaction !== 'None');

  const [showReactions, setShowReactions] = useState(false);
  const openCommentsSheet = () => {
    if (!post) return;
    openSheet(
      <View style={{ flex: 1, backgroundColor: '#F7F8FA' }}>
        {/* Container with column layout */}
        <View style={{ flex: 1 }}>
          {/* Comments list fills space above input */}
          <CommentsSection
            forum_id={forum_id}
            currentUserId={myId}
            ref={commentSectionRef}
            highlightCommentId={highlightId}
          />
        </View>

        <CommentInputBar
          storedUserId={myId}
          forum_id={forum_id}
          item={post}
          onCommentAdded={(newCommentData) => {
            console.log('newCommentData', newCommentData)
            commentSectionRef.current?.handleCommentAdded(newCommentData);
          }}
          onEditComplete={(updatedComment) => {
            commentSectionRef.current?.handleEditComplete(updatedComment);
          }}
        />
        {/* Fixed input bar at bottom */}

      </View>,

    );
  };




  const withTimeout = (promise, timeout = 5000) => {
    return Promise.race([
      promise,
      new Promise((_, reject) => setTimeout(() => reject(new Error("Request timed out")), timeout)),
    ]);
  };

  const fetchPosts = async () => {

    seLoading(true);


    try {
      const requestData = {
        command: 'getForumPost',
        forum_id: forum_id,
      };

      const res = await withTimeout(apiClient.post('/getForumPost', requestData), 5000);


      // Handle both array and object formats
      const postData = Array.isArray(res.data.response)
        ? res.data.response[0]
        : res.data.response;


      // If post is missing or empty object
      if (!postData || Object.keys(postData).length === 0) {

        setErrorMessage('This post was removed by the author');
        setMediaUrl('');
        setMediaUrl1('');
        seLoading(false);
        return;
      }

      // ✅ Clear any previous error
      setErrorMessage('');

      // Set post and comments
      await fetchCommentsCount(forum_id);


      const mediaUrlPromise = postData?.fileKey
        ? getSignedUrl('mediaUrl', postData.fileKey)
        : Promise.resolve({ mediaUrl: '' });


      const mediaUrl1Promise = postData?.author_fileKey
        ? getSignedUrl('mediaUrl1', postData.author_fileKey)
        : Promise.resolve({ mediaUrl1: '' });

      const [mediaRes, authorMediaRes] = await Promise.all([mediaUrlPromise, mediaUrl1Promise]);

      setMediaUrl(mediaRes.mediaUrl || '');

      if (authorMediaRes.mediaUrl1) {

        setMediaUrl1(authorMediaRes.mediaUrl1);
      }

      setPost(postData);

    } catch (error) {

      if (error.message === 'Network Error' || !error.response) {
        showToast('Network error, please check your connection', 'error');

      } else {
        setErrorMessage('This post was removed by the author');
      }

      setMediaUrl('');

      setMediaUrl1('');

    }
    finally {
      seLoading(false);
    }
  };




  useEffect(() => {
    fetchPosts();
  }, [forum_id]);

  const shareJob = async (item) => {
    try {
      const baseUrl = 'https://bmebharat.com/latest/comment/';
      const jobUrl = `${baseUrl}${item.forum_id}`;

      const result = await Share.share({
        message: `Checkout this post: ${jobUrl}`,
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

  const fetchCommentsCount = async (forum_id) => {
    try {
      const requestData = {
        command: "getForumCommentsCount",
        forum_id
      };
      const res = await withTimeout(apiClient.post('/getForumCommentsCount', requestData), 10000);

      if (res.data.status === 'success') {
        const commentCount = res.data.count;
        setCount(commentCount)

      } else {

      }
    } catch (error) {

    }
  };

  useEffect(() => {
    // Replace this with the ID of the post you want to track
    const trackedForumId = forum_id; // make sure this comes from props or state

    const commentDeletedListener = EventRegister.addEventListener('onCommentDeleted', ({ forum_id }) => {
      if (forum_id === trackedForumId) {
        setCount(prevCount => Math.max(prevCount - 1, 0));
      }
    });

    const commentAddedListener = EventRegister.addEventListener('onCommentAdded', ({ forum_id }) => {
      if (forum_id === trackedForumId) {
        setCount(prevCount => prevCount + 1);
      }
    });

    return () => {
      EventRegister.removeEventListener(commentDeletedListener);
      EventRegister.removeEventListener(commentAddedListener);
    };
  }, [forum_id]);



  const handleNavigate = (item) => {
    if (item.user_type === "company") {
      navigation.navigate('CompanyDetails', { userId: item.user_id });
    } else if (item.user_type === "users") {

      navigation.navigate('UserDetails', { userId: item.user_id });
    }
  };




  // const toggleFullText = () => {
  //   setExpandedTexts((prev) => !prev);
  // };


  const toggleFullText = (id) => {
    setExpandedTexts(prev => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const [expandedTexts, setExpandedTexts] = useState({});

  const videoExtensions = [
    '.mp4', '.mov', '.avi', '.mkv', '.flv', '.wmv', '.webm',
    '.m4v', '.3gp', '.3g2', '.f4v', '.f4p', '.f4a', '.f4b', '.qt', '.quicktime'
  ];

  const isVideo = post?.fileKey && videoExtensions.some(ext => post.fileKey.endsWith(ext));



  const isRemoved = errorMessage
  const isLoading = !isRemoved && !post;
  const hasPost = post?.forum_body

  const maxAllowedHeight = Math.round(deviceHeight * 0.6);

  let height;
  if (post?.extraData?.aspectRatio) {
    const aspectRatioHeight = Math.round(deviceWidth / post.extraData?.aspectRatio);

    height = aspectRatioHeight > maxAllowedHeight ? maxAllowedHeight : aspectRatioHeight;
  } else {

    height = deviceWidth;
  }

  return (
    <>
      <AppHeader
        title="Post"
      // onShare={() => shareJob(post)}
      />

      {isRemoved ? (
        <View style={AppStyles.center}>
          <Text style={AppStyles.removedText}>
            This post was removed by the author
          </Text>
        </View>
      ) : !post ? (
        <View style={AppStyles.center}>
          <ActivityIndicator size="small" color="#075cab" />
        </View>
      ) : null}

      {!isRemoved && hasPost && (
        <>
          <ScrollView contentContainerStyle={[{ paddingHorizontal: 5 }]}
            onScrollBeginDrag={() => Keyboard.dismiss()}
            showsVerticalScrollIndicator={false}
          >

            <View style={styles.headerContainer}>
              <TouchableOpacity style={styles.leftHeader} onPress={() => handleNavigate(post)} activeOpacity={1}>
                <Avatar
                  imageUrl={mediaUrl1}
                  name={post?.author}
                  size={40}
                />

                <View style={styles.authorInfo}>
                  <Text style={styles.author} numberOfLines={1} >{post?.author || ''}</Text>
                  <Text style={styles.authorCategory}>{post?.author_category || ''}</Text>
                </View>
              </TouchableOpacity>

              <View style={styles.rightHeader}>
                <Text style={styles.timeText}>
                  {getTimeDisplayForum(post?.posted_on)}
                </Text>
              </View>
            </View>

            <ForumBody
              html={normalizeHtml(post?.forum_body, '')}
              forumId={post?.forum_id}
              isExpanded={expandedTexts[post?.forum_id]}
              toggleFullText={toggleFullText}
              ignoredDomTags={['font']}
            />

            {mediaUrl ? (
              isVideo ? (

                <Video
                  source={{ uri: mediaUrl }}
                  style={{
                    width: '100%',
                    height: height,
                  }}
                  controls
                  repeat={true}
                  paused={false}
                  resizeMode="cover"
                  poster={url ? { uri: url } : undefined} // ✅ ensure poster is an object
                  posterResizeMode="cover"
                />

              ) : (
                // <SnapbackZoom
                //   hitSlop={{ vertical: 50, horizontal: 50 }}
                //   timingConfig={{ duration: 150, easing: Easing.linear }}
                //   onTap={(e) => console.log(e)}
                //   onDoubleTap={(e) => console.log(e)}
                //   onPinchStart={(e) => console.log(e)}
                //   onPinchEnd={(e) => console.log(e)}
                //   onUpdate={(e) => {
                //     'worklet';
                //     console.log(e);
                //   }}
                //   onGestureEnd={() => console.log('animation finished!')}

                // >
                //   <Image
                //     source={{ uri: mediaUrl }}
                //     style={[styles.image, { width: IMAGE_WIDTH, height: height }]}
                //     resizeMode="cover"
                //   />
                // </SnapbackZoom>
                <TouchableOpacity
                  onPress={() => openMediaViewer([{ type: 'image', url: mediaUrl }])}
                  activeOpacity={1}
                  onLongPress={() => {
                    setShowReactions(true);
                  }}
                  delayLongPress={100}
                >
                  <Image
                    source={{ uri: mediaUrl }}
                    style={[styles.image, { width: '100%', height: height }]}
                    resizeMode="cover"
                  />
                </TouchableOpacity>
              )
            ) : null}


            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>

              {activeReactions.length > 0 && (

                <TouchableOpacity style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: 6, paddingHorizontal: 12, }}
                  onPress={() => reactionSheetRef.current?.present(post?.forum_id, 'All')} >
                  {activeReactions.map((cfg, index) => (
                    <PaperAvatar.Icon
                      key={cfg.type}
                      size={20}
                      icon={cfg.outlineIcon}
                      style={[
                        styles.avatar,
                        { marginLeft: index === 0 ? 0 : -6 },
                      ]}
                    />
                  ))}
                  {reaction.totalReactions > 0 && (
                    <Text style={{ color: colors.text_secondary, fontSize: 12 }}>({reaction.totalReactions})</Text>
                  )}
                </TouchableOpacity>
              )}

              {(count > 0 || post?.viewsCount) && (
                <TouchableOpacity
                  style={{ paddingVertical: 6, paddingHorizontal: 12, marginLeft: 'auto' }}
                  onPress={() => {
                    openCommentsSheet();
                  }}
                >
                  <Text style={{ marginLeft: 'auto', fontSize: 12 }}>
                    {`${post?.viewsCount > 0 ? `${post?.viewsCount} Views` : ''}${post.viewsCount > 0 && count > 0 ? ' · ' : ''
                      }${count > 0
                        ? `${count > 0 ? ` ${count}` : ''} Comments`
                        : ''
                      }`}
                  </Text>
                </TouchableOpacity>
              )}
            </View>
            <Divider style={{ height: 1, backgroundColor: '#ddd' }} />
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', }}>

              <TouchableOpacity
                onPress={async () => {
                  setShowReactions(false);

                  const selectedType = reaction?.userReaction && reaction?.userReaction !== 'None' ? 'None' : 'Like';
                  setReaction(prev => {
                    const currentReaction = prev?.userReaction || 'None';
                    let newTotal = Number(prev?.totalReactions || 0);
                    const hadReaction = currentReaction && currentReaction !== 'None';

                    const updatedCounts = { ...prev?.reactionsCount };

                    if (selectedType === 'None' && hadReaction) {
                      updatedCounts[currentReaction] = Math.max(0, (updatedCounts[currentReaction] || 1) - 1);
                      newTotal -= 1;
                    } else if (!hadReaction) {
                      updatedCounts['Like'] = (updatedCounts['Like'] || 0) + 1;
                      newTotal += 1;
                    } else if (hadReaction && currentReaction !== 'Like') {
                      updatedCounts[currentReaction] = Math.max(0, (updatedCounts[currentReaction] || 1) - 1);
                      updatedCounts['Like'] = (updatedCounts['Like'] || 0) + 1;
                    }
                    return {
                      ...prev,
                      userReaction: selectedType === 'None' ? null : 'Like',
                      totalReactions: newTotal,
                      reactionsCount: updatedCounts,
                    };
                  });

                  await handleReactionUpdate(forum_id, selectedType);
                }}

                onLongPress={() => {
                  setShowReactions(true);
                }}
                delayLongPress={100}

                style={{ paddingVertical: 6, paddingHorizontal: 12, flexDirection: 'row' }}

              >
                {selectedReaction ? (
                  <>
                    <Text style={{ fontSize: 16 }}>{selectedReaction.emoji} </Text>
                    {/* <Text style={{ fontSize: 12, color: '#777' }}>{selectedReaction.label}</Text> */}
                  </>
                ) : (
                  <>
                    {/* <Text style={{ fontSize: 12, color: '#777', marginRight: 6 }}>React: </Text> */}
                    <Thumb width={dimensions.icon.medium} height={dimensions.icon.medium} color={colors.text_primary} />

                  </>
                )}
                <Text style={{ color: colors.text_primary, }}> Like</Text>

              </TouchableOpacity>

              <TouchableOpacity
                style={{ paddingVertical: 6, paddingHorizontal: 12, flexDirection: 'row' }}
                onPress={() => {
                  openCommentsSheet();
                }}>
                <Comment width={dimensions.icon.medium} height={dimensions.icon.medium} color={colors.text_primary} styles={{ padding: 10 }} />

                <Text style={{ color: colors.text_primary, }}> Comment</Text>

              </TouchableOpacity>


              <TouchableOpacity
                style={{ paddingVertical: 6, paddingHorizontal: 12, flexDirection: 'row' }}
                onPress={() => shareJob(post)}
              >
                <ShareIcon width={dimensions.icon.medium} height={dimensions.icon.medium} color={colors.text_primary} styles={{ padding: 10 }} />

                <Text style={{ color: colors.text_primary, }}> Share</Text>

              </TouchableOpacity>
            </View>


          </ScrollView>
        </>
      )}
      <Modal
        visible={showReactions}
        transparent
        animationType="fade"
        onRequestClose={() => setShowReactions(false)} // Android back button
      >
        {/* BACKDROP */}
        <Pressable
          style={styles.backdrop}
          onPress={() => setShowReactions(false)}
        />

        {/* REACTION POPUP */}
        <View style={styles.reactionModalWrapper}>
          <View style={styles.reactionContainer}>
            {reactionConfig.map(({ type, emoji, label }) => {
              const isSelected = reaction?.userReaction === type;

              return (
                <TouchableOpacity
                  key={type}
                  style={[
                    styles.reactionButton,
                    isSelected && styles.selectedReaction,
                  ]}
                  onPress={async () => {
                    setReaction(prev => {
                      const currentReaction = prev?.userReaction || 'None';
                      let newTotal = Number(prev?.totalReactions || 0);
                      const hadReaction = currentReaction && currentReaction !== 'None';

                      const updatedCounts = { ...prev?.reactionsCount };

                      if (type === 'None' && hadReaction) {
                        updatedCounts[currentReaction] = Math.max(0, (updatedCounts[currentReaction] || 1) - 1);
                        newTotal -= 1;
                      } else if (!hadReaction) {
                        updatedCounts[type] = (updatedCounts[type] || 0) + 1;
                        newTotal += 1;
                      } else if (hadReaction && currentReaction !== type) {
                        updatedCounts[currentReaction] = Math.max(0, (updatedCounts[currentReaction] || 1) - 1);
                        updatedCounts[type] = (updatedCounts[type] || 0) + 1;
                      }

                      return {
                        ...prev,
                        userReaction: type === 'None' ? null : type,
                        totalReactions: newTotal,
                        reactionsCount: updatedCounts,
                      };
                    });

                    await handleReactionUpdate(forum_id, type);
                    setShowReactions(false); // hide the popup after selection
                  }}
                >
                  <Text style={{ fontSize: 30 }}>{emoji}</Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>
      </Modal>



      <ReactionSheet ref={reactionSheetRef} />
      {/* <CommentsSection
        forum_id={forum_id}
        currentUserId={myId}
        ref={commentSectionRef}
        highlightCommentId={highlightId}
      /> */}

    </>
  );
};

const styles = ScaledSheet.create({
  divider: {
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',

  },
  inputBar: {
    position: 'absolute',
    bottom: 60,
    left: 0,
    right: 0,
  },
  avatar: {
    backgroundColor: '#E7F0FA',
    borderWidth: 1,
    borderColor: '#eee',
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f1f1f1',
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: '#ccc',
  },

  input: {
    flex: 1,
    fontSize: 14,
    color: 'black',
    paddingVertical: 6,
  },

  submitButton: {
    marginLeft: 10,
    backgroundColor: '#075cab',
    padding: 8,
    borderRadius: 20,
  },

  erroText: {
    fontWeight: '400',
    textAlign: 'center',
    padding: 10,
    fontSize: 16
  },

  scrollViewContent: {
    top: 10,
    flexGrow: 1,
    paddingBottom: '20%',
    paddingHorizontal: 5
  },

  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',

    paddingVertical: 10
  },

  backButton: {
    alignSelf: 'flex-start',
    padding: 10

  },

  leftHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,        // 🔑 take remaining width
    minWidth: 0,    // 🔥 REQUIRED
  },


  profileIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 10,
    backgroundColor: '#eee'
  },
  authorInfo: {
    marginLeft: 8,
    flex: 1,        // 🔑 allow shrinking
    minWidth: 0,    // 🔥 prevents overflow
  },


  // Author styling
  author: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text_primary,
    width: '70%'

  },

  // Author Category Styling
  authorCategory: {
    fontSize: 13,
    fontWeight: '300',
    alignSelf: 'flex-start',
    color: 'black'
  },


  rightHeader: {
    alignItems: 'flex-end', // Align time to the right
  },




  iconContainer: {

    flexDirection: 'row',
    height: 50,
  },

  commentButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  iconText: {
    fontSize: 15,
    color: '#075cab',
    textAlign: "left",
    fontWeight: '500',
    paddingHorizontal: 4,
  },

  timeText: {
    fontSize: 13,
    fontWeight: '300',
    color: '#666',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.2)',
  },

  reactionModalWrapper: {
    position: 'absolute',
    bottom: 120,   // 👈 adjust relative to button
    left: 20,
    right: 20,
    alignItems: 'center',
  },


  reactionContainer: {
    position: 'absolute',
    bottom: 40,
    left: 0,
    borderRadius: 40,
    flexDirection: 'row',
  },
  reactionButton: {
    padding: 8,
    margin: 4,
    backgroundColor: '#f0f0f0',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#ccc'
  },
  selectedReaction: {
    backgroundColor: '#c2d8f0',
  },
});

export default CommentScreen; 
