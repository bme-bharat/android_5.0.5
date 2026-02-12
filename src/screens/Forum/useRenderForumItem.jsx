import { useCallback, useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, TouchableWithoutFeedback, Share, Dimensions, StyleSheet, ActivityIndicator } from 'react-native';
import { Image as FastImage } from 'react-native';

import { ForumBody, normalizeHtml } from './forumBody';
import useForumReactions, { fetchForumReactionsRaw, reactionConfig } from './useForumReactions';
import { getTimeDisplayForum } from '../helperComponents/signedUrls';
import { useNavigation } from '@react-navigation/native';
import { useNetwork } from '../AppUtils/IdProvider';
import Video from 'react-native-video';
import LinearGradient from 'react-native-linear-gradient';
import { enrichForumPost } from './useForumFetcher';

import ArrowLeftIcon from '../../assets/svgIcons/back.svg';
import Search from '../../assets/svgIcons/search.svg';
import Close from '../../assets/svgIcons/close.svg';
import ShareIcon from '../../assets/svgIcons/share.svg';
import Eye from '../../assets/svgIcons/eye.svg';
import Fire from '../../assets/svgIcons/fire.svg';
import Thumb from '../../assets/svgIcons/thumb.svg';
import Comment from '../../assets/svgIcons/comment.svg';
import Reload from '../../assets/svgIcons/reload.svg';

import { colors, dimensions } from '../../assets/theme.jsx';

import BMEVideoPlayer from '../BMEVideoPlayer';
import Avatar from '../helperComponents/Avatar.jsx';
import { Divider, Avatar as PaperAvatar } from 'react-native-paper';
import { useReactionPickerModal } from './ReactionPicker.jsx'
const { width: deviceWidth, height: deviceHeight } = Dimensions.get('window');
const maxAllowedHeight = Math.round(deviceHeight * 0.6);

export default function useRenderForumItem({
  localPosts,
  setLocalPosts,
  forumIds,
  searchResults,        // Add this
  setSearchResults,
  activeVideo,
  videoEndStates,
  setVideoEndStates,
  isFocused,
  openReactionPicker,
  videoRefs,
  activeReactionForumId,
  setActiveReactionForumId,
  openCommentSheet,
  searchQuery,
  openMediaViewer,
  reactionSheetRef,
  context = "latest"
}) {
  const [interactions, setInteractions] = useState({});
  useEffect(() => {
    if (forumIds.length > 0) {
      enrichForumPost(localPosts, myId).then(enriched => {
        const interactionsMap = enriched.reduce((acc, post) => {
          acc[post.forum_id] = {
            commentCount: post.commentCount || 0,
            reactionsCount: post.reactionsCount || {},
            totalReactions: post.totalReactions || 0,
            userReaction: post.userReaction || null,
          };
          return acc;
        }, {});
        setInteractions(interactionsMap);
      });
    }
  }, [forumIds, localPosts, myId]);

  const navigation = useNavigation();
  const [expandedTexts, setExpandedTexts] = useState({});
  const { myId, myData } = useNetwork();
  const { handleReactionUpdate } = useForumReactions(myId);


  const [reactions, setReactions] = useState([])

  // useEffect(() => {
  //   if (!forumIds.length || !myId) return;

  //   const fetchAllReactions = async () => {
  //     try {
  //       const results = await Promise.all(
  //         forumIds.map((id) => fetchForumReactionsRaw(id, myId))
  //       );

  //       const combined = forumIds.map((forumId, index) => ({
  //         forumId,
  //         ...results[index],
  //       }));

  //       setReactions(combined);
  //     } catch (e) {
  //       console.error('Failed to fetch forum reactions', e);
  //       setReactions([]);
  //     }
  //   };

  //   fetchAllReactions();
  // }, [forumIds, myId]);

  const handleNavigate = (item) => {

    if (item.user_type === "company") {
      navigation.navigate('CompanyDetails', { userId: item.user_id });
    } else if (item.user_type === "users") {
      navigation.navigate('UserDetails', { userId: item.user_id });
    }

  };

  const toggleFullText = (id) => {
    setExpandedTexts(prev => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const sharePost = async (item) => {
    try {
      const baseUrl = 'https://bmebharat.com/latest/comment/';
      const jobUrl = `${baseUrl}${item.forum_id}`;

      const result = await Share.share({
        message: `Checkout this post: ${jobUrl}`, // Added message prefix
      });

      if (result.action === Share.sharedAction) {
        if (result.activityType) {
          // shared with activity type of result.activityType
        } else {
          // shared without specifying activity type
        }
      } else if (result.action === Share.dismissedAction) {
        // dismissed
      }
    } catch (error) {
      console.error('Error sharing post:', error);
    }
  };

  const updatePostReaction = (forumId, selectedType, currentReaction) => {
    // Update localPosts if this post exists there
    setInteractions(prev => {
      const existing = prev[forumId] || {
        commentCount: 0,
        reactionsCount: {},
        totalReactions: 0,
        userReaction: 'None'
      };

      let newTotal = Number(existing.totalReactions || 0);
      const hadReaction = existing.userReaction && existing.userReaction !== 'None';

      if (selectedType === 'None' && hadReaction) newTotal -= 1;
      else if (!hadReaction) newTotal += 1;

      const reactionsCount = { ...existing.reactionsCount };

      if (hadReaction) {
        reactionsCount[existing.userReaction] =
          Math.max((reactionsCount[existing.userReaction] || 1) - 1, 0);
      }

      if (selectedType !== 'None') {
        reactionsCount[selectedType] = (reactionsCount[selectedType] || 0) + 1;
      }

      return {
        ...prev,
        [forumId]: {
          ...existing,
          userReaction: selectedType === 'None' ? 'None' : selectedType,
          totalReactions: newTotal,
          reactionsCount
        }
      };
    });


    // Also update searchResults if this post exists there
    if (searchResults) {
      setSearchResults(prev => prev.map(p => {
        if (p.forum_id !== forumId) return p;
        let newTotal = Number(p.totalReactions || 0);
        const hadReaction = currentReaction && currentReaction !== 'None';
        if (selectedType === 'None' && hadReaction) newTotal -= 1;
        else if (!hadReaction) newTotal += 1;
        return {
          ...p,
          userReaction: selectedType === 'None' ? null : selectedType,
          totalReactions: newTotal,
        };
      }));
    }
  };

  const getActiveReactions = (reactionsCount = {}) => {
    return reactionConfig.filter(
      cfg => reactionsCount?.[cfg.type] > 0
    );
  };

  const renderItem = useCallback(({ item }) => {

    const interactionData = interactions[item.forum_id] || {
      commentCount: 0,
      reactionsCount: {},
      totalReactions: 0,
      userReaction: 'None',
    };


    let height;
    if (item.extraData?.aspectRatio) {
      const aspectRatioHeight = Math.round(deviceWidth / item.extraData?.aspectRatio);

      height = aspectRatioHeight > maxAllowedHeight ? maxAllowedHeight : aspectRatioHeight;
    } else {

      height = deviceWidth;
    }

    return (
      <View style={styles.comments}>
        {/* Author section */}
        <TouchableOpacity style={styles.dpContainer} onPress={() => handleNavigate(item)} activeOpacity={0.7}>

          <Avatar
            imageUrl={item?.authorSignedUrl}
            name={item.author}
            size={40}
          />


          <View style={styles.textContainer}>
            <View style={styles.title3}>
              <TouchableOpacity style={{ flexDirection: 'row', alignItems: 'center' }} activeOpacity={0.7} onPress={() => handleNavigate(item)}>
                <Text style={{ flex: 1, alignSelf: 'flex-start', color: 'black', fontSize: 15, fontWeight: '600', color: colors.text_primary }}>
                  {(item.author || '').trim()}
                </Text>

                {item.isTrending === 'yes' && context !== "trending" && (
                  <Text style={styles.trendingBadge}>
                    🔥 Trending
                  </Text>
                )}


              </TouchableOpacity>
            </View>

            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end' }}>
              <Text style={styles.title}>{item.author_category || ''}</Text>
              <Text style={styles.date1}>{getTimeDisplayForum(item.posted_on)}</Text>
            </View>
          </View>
        </TouchableOpacity>

        {/* Post content */}

        <ForumBody
          html={normalizeHtml(item?.forum_body, searchQuery)}
          forumId={item.forum_id}
          isExpanded={expandedTexts[item.forum_id]}
          toggleFullText={toggleFullText}
        />

        {item.fileKey && (
          <TouchableOpacity
            style={{
              width: "100%",
              height: height,          // <-- LIMITED HEIGHT
              overflow: "hidden",      // <-- IMP: enables cropping
              justifyContent: 'center',
            }}
            activeOpacity={1}
          >
            {item?.extraData?.type?.startsWith("video/") ? (
              <TouchableOpacity
                activeOpacity={0.9}
                onPress={() =>
                  navigation.navigate("InlineVideo", {
                    source: item?.fileKeySignedUrl,
                    poster: item?.thumbnailSignedUrl,
                    videoHeight: item.extraData?.aspectRatio,
                  })
                } >
                <BMEVideoPlayer
                  ref={(ref) => {
                    if (ref) {
                      videoRefs.current[item.forum_id] = ref;
                    } else {
                      delete videoRefs.current[item.forum_id];
                    }
                  }}

                  showProgressBar={true}
                  source={item?.fileKeySignedUrl}
                  style={{
                    width: '100%',

                    // 🔥 FULL NATURAL HEIGHT (not limited)
                    height: item.extraData?.aspectRatio
                      ? deviceWidth / item.extraData?.aspectRatio
                      : deviceWidth,

                  }}
                  controls
                  paused={activeVideo !== item.forum_id || !isFocused}
                  resizeMode="cover"
                  poster={item?.thumbnailSignedUrl}
                  posterResizeMode="cover"
                />
              </TouchableOpacity>
            ) : (
              <TouchableOpacity
                onPress={() =>
                  openMediaViewer([{ type: "image", url: item?.fileKeySignedUrl }])
                }
                activeOpacity={1}
              >
                <FastImage
                  source={{ uri: item?.fileKeySignedUrl }}
                  style={{ width: "100%", height: height }}
                />
              </TouchableOpacity>
            )}
          </TouchableOpacity>
        )}

        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          {getActiveReactions(interactionData.reactionsCount).length > 0 && (
            <TouchableOpacity style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: 6, paddingHorizontal: 12, }}
              onPress={() => reactionSheetRef.current?.present(item.forum_id, 'All')} >
              {getActiveReactions(interactionData.reactionsCount).map((cfg, index) => (
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
              {interactionData.totalReactions > 0 && (
                <Text style={{ color: colors.text_secondary, fontSize: 12 }}>({interactionData.totalReactions})</Text>
              )}
            </TouchableOpacity>
          )}

          {(interactionData.commentCount > 0 || item.viewsCount > 0) && (
            <TouchableOpacity
              style={{ paddingVertical: 6, paddingHorizontal: 12, marginLeft: 'auto', }}
              onPress={() => openCommentSheet(item.forum_id, item.user_id, myId, item)}
            >
              <Text style={{ marginLeft: 'auto', fontSize: 12 }}>
                {`${item.viewsCount > 0 ? `${item.viewsCount} Views` : ''}${item.viewsCount > 0 && interactionData.commentCount > 0 ? ' · ' : ''
                  }${interactionData.commentCount > 0
                    ? `${interactionData.commentCount} Comments`
                    : ''
                  }`}
              </Text>
            </TouchableOpacity>
          )}
        </View>
        <Divider style={{
          height: 1, backgroundColor: '#ddd',
        }} />
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', }}>

          <TouchableOpacity
            onLongPress={(e) => {
              openReactionPicker(
                item.forum_id,
                interactionData.userReaction || 'None',
                e,
                (selectedType) => {
                  // ✅ OPTIMISTIC UPDATE YOUR LIST STATE
                  updatePostReaction(
                    item.forum_id,
                    selectedType,
                    interactionData.userReaction || 'None'
                  );
                }
              );
            }}

            delayLongPress={300}
            style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, }}
            onPress={async () => {
              const currentReaction = interactionData.userReaction || 'None';
              const selectedType = currentReaction !== 'None' ? 'None' : 'Like';

              updatePostReaction(item.forum_id, selectedType, currentReaction);

              await handleReactionUpdate(item.forum_id, selectedType, item);
            }}
          >
            {interactionData.userReaction && interactionData.userReaction !== 'None' ? (
              <>
                <Text style={{ fontSize: 15 }}>
                  {reactionConfig.find(r => r.type === interactionData.userReaction)?.emoji || '👍'}
                </Text>
                {/* <Text style={{ fontSize: 12, color: '#777', marginLeft: 4 }}>
                    {reactionConfig.find(r => r.type === interactionData.userReaction)?.label || 'Like'}
                  </Text> */}
              </>
            ) : (
              <View style={{ alignItems: 'center', flexDirection: 'row' }}>
                <Thumb width={dimensions.icon.medium} height={dimensions.icon.medium} color={colors.text_primary} />
              </View>
            )}
            <Text style={{ color: colors.text_primary, }}> Like</Text>


          </TouchableOpacity>


          <TouchableOpacity
            onPress={() => openCommentSheet(item.forum_id, item.user_id, myId, item)}
            style={{ paddingVertical: 6, paddingHorizontal: 12, flexDirection: 'row' }}>
            <Comment width={dimensions.icon.medium} height={dimensions.icon.medium} color={colors.text_primary} styles={{ padding: 10 }} />

            <Text style={{ color: colors.text_primary, }}> Comment</Text>

          </TouchableOpacity>


          <TouchableOpacity
            onPress={() => sharePost(item)} style={{ paddingVertical: 6, paddingHorizontal: 12, flexDirection: 'row' }}>
            <ShareIcon width={dimensions.icon.medium} height={dimensions.icon.medium} color={colors.text_primary} styles={{ padding: 10 }} />

            <Text style={{ color: colors.text_primary, }}> Share</Text>

          </TouchableOpacity>


        </View>

      </View>
    );
  }, [
    localPosts, activeVideo, isFocused, expandedTexts, activeReactionForumId, handleNavigate, openMediaViewer, reactionSheetRef, deviceWidth
  ]);


  return renderItem;
}


const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'whitesmoke',
  },

  comments: {
    paddingHorizontal: 5,
    paddingVertical: 10,
    backgroundColor: 'white',
    minHeight: 120,
    marginBottom: 5,

  },
  trendingHighlight: {
    borderWidth: 2,
    borderColor: '#FFD700', // gold border
    backgroundColor: '#fffbea', // subtle yellow background
    borderRadius: 8,
  },

  image1: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
    borderRadius: 100,
    backgroundColor: '#eee'
  },
  trendingBadge: {
    flexDirection: 'row',
    backgroundColor: '#fee2e2', // bg-red-100
    color: '#dc2626',           // text-red-600
    fontSize: 12,               // text-xs
    fontWeight: '600',         // font-semibold
    paddingHorizontal: 8,      // px-2
    paddingVertical: 2,        // py-0.5
    borderRadius: 9999,        // rounded-full
    alignSelf: 'flex-start',
  },
  trendingBadgeText: {
    fontSize: 11,
    fontWeight: '500',
    color: '#fff'
  },
  trendingIcon: {
    marginLeft: 4
  },


  title: {
    fontSize: 13,
    color: colors.text_secondary,
    // marginBottom: 5,
    fontWeight: '300',
    textAlign: 'justify',
    alignItems: 'center',
  },

  title3: {
    fontSize: 15,
    color: 'black',
    // marginBottom: 5,
    fontWeight: '500',
    flexDirection: 'row',  // Use row to align items horizontally
    flexWrap: 'wrap',
    alignItems: 'center',
    justifyContent: 'space-between',


  },
  date1: {
    fontSize: 11,
    fontWeight: "300",
    color: colors.text_secondary,


  },
  title1: {
    backgroundColor: 'red'

  },

  readMore: {
    color: 'gray', // Blue color for "Read More"
    fontWeight: '300', // Make it bold if needed
    fontSize: 13,
  },

  dpContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dpContainer1: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignSelf: 'center',
    alignItems: 'center',
    justifyContent: 'center'

  },
  textContainer: {
    flex: 1,
    justifyContent: 'space-between',
    marginLeft: 10,

  },
  iconContainer: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 10,
    height: 30
  },
  avatar: {
    backgroundColor: '#E7F0FA',
    borderWidth: 1,
    borderColor: '#eee',
  },

  iconButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',

  },
  iconText: {
    fontSize: 12,
    color: '#075cab',
  },

  iconTextUnderlined: {
    fontSize: 13,
    fontWeight: '500',
    color: '#075cab',
    marginLeft: 1,
    marginRight: 3
  },

  label: {
    fontWeight: '600',
    textTransform: 'capitalize',
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