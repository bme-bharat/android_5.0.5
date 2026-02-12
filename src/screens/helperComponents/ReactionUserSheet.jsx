// Inside ReactionSheet.js
import React, { forwardRef, useEffect, useImperativeHandle, useMemo, useRef, useState } from 'react';
import {
  Dimensions, View, Text, StyleSheet,
  TouchableWithoutFeedback, FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Pressable,
  Image,

  TextInput,
  BackHandler
} from 'react-native';
import Animated, {
  useSharedValue, useAnimatedStyle, withSpring, withTiming,
  runOnJS, useAnimatedReaction, interpolate, Extrapolation,
  configureReanimatedLogger,
  ReanimatedLogLevel
} from 'react-native-reanimated';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';

import { useNavigation } from '@react-navigation/native';
import { Image as FastImage } from 'react-native';
import { useForumReactionUsers } from '../Forum/useForumReactions';
import Close from '../../assets/svgIcons/close-large.svg';

import { colors, dimensions } from '../../assets/theme.jsx';
import { TrueSheet } from '@lodev09/react-native-true-sheet';
import Avatar from './Avatar.jsx';
const { height: SCREEN_HEIGHT } = Dimensions.get('window');
const MAX_TRANSLATE_Y = -SCREEN_HEIGHT * 0.80;

const ReactionSheet = forwardRef(({ onClose }, ref) => {
  const sheetRef = useRef(null);
  const textRef = useRef(null)
  const navigation = useNavigation();
  const translateY = useSharedValue(SCREEN_HEIGHT);
  const gestureContext = useSharedValue({ startY: 0 });
  const isActive = useSharedValue(false);
  const [active, setActive] = useState(false);
  const [reactionType, setReactionType] = useState('All');
  const [forumId, setForumId] = useState(null);
  const [highlightReactId, setHighlightReactId] = useState(null);

  const { usersByReaction, fetchUsers,
    availableReactions, resetUsers,
    getting,
    gettingMore,
    hasMore
  } = useForumReactionUsers(forumId);

  const [availableLabels, setAvailableLabels] = useState([]);

  configureReanimatedLogger({
    level: ReanimatedLogLevel.warn,
    strict: true, // Reanimated runs in strict mode by default
  });



  useEffect(() => {
    if (!availableReactions) return;

    const dynamicTabs = [
      {
        type: 'All',
        emoji: '💬',
        label: 'All',
        count: availableReactions.All || 0,
      },
    ];

    for (const config of reactionConfig) {
      if (config.type === 'All') continue;

      const count = availableReactions[config.type];
      if (count > 0) {
        dynamicTabs.push({
          ...config,
          count,
        });
      }
    }

    setAvailableLabels(dynamicTabs);
  }, [availableReactions]);


  const flatListRef = useRef(null);


  useImperativeHandle(ref, () => ({
    present: (forumIdParam, type = 'All', highlightId = null) => {
      setForumId(forumIdParam);
      setReactionType(type);
      setHighlightReactId(highlightId);

      // open sheet first
      sheetRef.current?.present();
      setActive(true);
      // fetch reactions
      fetchUsers(type, highlightId);
    },

  }));


  useEffect(() => {
    if (forumId && active) {

      fetchUsers(reactionType, highlightReactId);
    }
  }, [forumId, reactionType, active]);


  const highlightedFlash = useSharedValue(0);


  useEffect(() => {
    if (!highlightReactId || usersByReaction.length === 0) return;

    // Trigger flash
    highlightedFlash.value = 1;
    setTimeout(() => {
      highlightedFlash.value = 0;
    }, 600); // reset after animation time
  }, [highlightReactId, usersByReaction]);


  const reactionConfig = [
    { type: 'All', emoji: '💬', color: '#999', label: 'All' }, // New "All" tab
    { type: 'Like', emoji: '👍', color: '#1e88e5', label: 'Like' },
    { type: 'Insightful', emoji: '💡', color: '#fbc02d', label: 'Insightful' },
    { type: 'Support', emoji: '🤝', color: '#43a047', label: 'Support' },
    { type: 'Funny', emoji: '😂', color: '#fdd835', label: 'Funny' },
    { type: 'Thanks', emoji: '🙏', color: '#e53935', label: 'Thanks' },
  ];

  const getEmojiForReaction = (type) => {
    const match = reactionConfig.find(r => r.type === type);
    return match ? { emoji: match.emoji, label: match.label } : { emoji: '', label: '' };
  };


  const handleNavigate = (item) => {
    sheetRef.current?.dismiss();
    setTimeout(() => {
      if (item.user_type === "company") {
        navigation.navigate('CompanyDetails', { userId: item.user_id });
      } else if (item.user_type === "users") {
        navigation.navigate('UserDetails', { userId: item.user_id });
      }
    }, 300);
  };

  const ReactionItem = ({ item, isHighlighted, highlightedFlash, onPress, getEmojiForReaction, reactionType }) => {
    const animatedStyle = useAnimatedStyle(() => {
      const flash = highlightedFlash.value; // ✅ safe inside worklet
      return {
        backgroundColor: isHighlighted && flash ? '#e0f0ff' : '#ffffff',
        borderLeftWidth: isHighlighted && flash ? 4 : 0,
        borderLeftColor: isHighlighted && flash ? '#075cab' : 'transparent',
      };
    }, []); // ✅ don't include shared value `.value` in dependency array


    return (
      <TouchableOpacity onPress={onPress}>
        <Animated.View
          style={[
            {
              flexDirection: 'row',
              alignItems: 'center',
              padding: 6,
              paddingHorizontal: 10,
              borderRadius: 8,
            },
            animatedStyle,
          ]}
        >

          <Avatar
            imageUrl={item?.profileUrl}
            name={item?.author}
            size={40}
          />
          <View style={{marginLeft:10}}>
            <Text style={{ fontWeight: '400', fontSize: 14, color: colors.text_primary }}>{item.author}</Text>
            <Text style={{ fontSize: 12, color: colors.text_secondary }}>
              {(reactionType === 'All' || item.reaction_type !== reactionType)
                ? `${getEmojiForReaction(item.reaction_type).label}  ${getEmojiForReaction(item.reaction_type).emoji}`
                : ''}
            </Text>
          </View>
        </Animated.View>
      </TouchableOpacity>
    );
  };


  return (
    <>

      <TrueSheet
        ref={sheetRef}
        detents={['auto', 0.9]}
        style={{ paddingTop: 40, }}
        onPresent={() => {
          isActive.value = true;
          setActive(true);
        }}
        onDismiss={() => {
          isActive.value = false;
          setActive(false);
          resetUsers();
        }}
      >

        <View style={styles.titleRow}>
          <Text style={styles.title}>Reactions</Text>

        </View>


        <View style={styles.divider} />

        {availableLabels.length > 0 && (
          <View style={styles.reactionTabsContainer}>
            {availableLabels.map((reaction) => (
              <TouchableOpacity
                key={reaction.type}
                onPress={() => {
                  setReactionType(reaction.type);

                  fetchUsers(reaction.type);
                }}
                style={[
                  styles.reactionTab,
                  {
                    backgroundColor: reactionType === reaction.type ? '#e6effa' : '#f5f5f5',
                    borderColor: reactionType === reaction.type ? '#075cab' : '#ddd',
                  },
                ]}
              >
                <Text
                  style={[
                    styles.reactionTabText,
                    { color: reactionType === reaction.type ? '#075cab' : '#555' },
                  ]}
                >
                  {reaction.emoji} {reaction.label} ({reaction.count})
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        )}



        {/* <View style={styles.divider1} /> */}

        {getting ? (
          <View style={{ paddingTop: 50 }}>
            <ActivityIndicator color="#075cab" size="small" />

          </View>
        ) : usersByReaction.length === 0 ? (
          <View style={{ padding: 24, alignItems: 'center' }}>
            <Text style={{ fontSize: 14, color: '#666' }}>
              No reactions found for "{reactionType}"
            </Text>
          </View>
        ) : (
          <FlatList
            ref={flatListRef}
            data={usersByReaction}
            keyExtractor={(item, index) => item.user_id + index}
            contentContainerStyle={{ paddingBottom: '55%' }}
            onEndReachedThreshold={0.4}
            onEndReached={() => {
              if (!gettingMore && hasMore) {
                fetchUsers(reactionType, null, true); // ✅ only use reactionType and loadMore = true
              }
            }}

            ListFooterComponent={() => {
              if (!gettingMore) return null;
              return (
                <View style={{ padding: 10, alignItems: 'center' }}>
                  <ActivityIndicator color="#075cab" size="small" />
                </View>
              );
            }}

            renderItem={({ item, index }) => {
              const isHighlighted = item.reaction_id === highlightReactId;

              return (
                <ReactionItem
                  item={item}
                  isHighlighted={isHighlighted}
                  highlightedFlash={highlightedFlash}
                  onPress={() => handleNavigate(item)}
                  getEmojiForReaction={getEmojiForReaction}
                  reactionType={reactionType}
                />
              );
            }}

          />

        )}

      </TrueSheet>

    </>
  );
});

const styles = StyleSheet.create({
  reactionTabsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingVertical: 5,
    paddingHorizontal: 8,
  },

  reactionTab: {
    padding: 6,
    borderRadius: 8,
    marginRight: 6,
    margin: 2,
  },

  reactionTabText: {
    fontSize: 13,
    fontWeight: '500',

  },

  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#000',
    zIndex: 999,
  },
  sheet: {
    position: 'absolute',
    top: SCREEN_HEIGHT,
    left: 0,
    right: 0,
    height: SCREEN_HEIGHT,
    backgroundColor: '#F7F8FA',
    zIndex: 1000,
    paddingTop: 10,
  },
  handle: {
    width: 40,
    height: 3,
    borderRadius: 3,
    backgroundColor: '#ccc',
    alignSelf: 'center',
  },
  header: {
    justifyContent: 'center',
    paddingHorizontal: 10,
  },

  divider: {
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  divider1: {
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    marginBottom: 5
  },

  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 8
  },

  title: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text_primary,
  },
});

export default ReactionSheet;
