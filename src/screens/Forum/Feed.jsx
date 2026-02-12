
import React, { useState, useEffect, useCallback, useRef, Profiler, useMemo } from "react";
import { View, Text, TouchableOpacity, TextInput, Dimensions, StyleSheet, Keyboard, ActivityIndicator, RefreshControl, InputAccessoryView, Platform } from "react-native";
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { useIsFocused } from "@react-navigation/native";
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import apiClient from "../ApiClient";
import { useNetwork } from "../AppUtils/IdProvider";
import { showToast } from "../AppUtils/CustomToast";
import CommentsSection from "../AppUtils/Comments";
import { useBottomSheet } from "../AppUtils/SheetProvider";
import CommentInputBar from "../AppUtils/InputBar";
import { EventRegister } from "react-native-event-listeners";
import { useConnection } from "../AppUtils/ConnectionProvider";
import { openMediaViewer } from "../helperComponents/mediaViewer";
import ReactionSheet from "../helperComponents/ReactionUserSheet";
import { useReactionPickerModal } from './ReactionPicker.jsx'
import { useForumMedia } from "../helperComponents/forumViewableItems";
import useRenderForumItem from './useRenderForumItem';
import useForumFetcher, { enrichForum } from './useForumFetcher';

import scrollAnimations from '../helperComponents/scrollAnimations';
import AppStyles from '../AppUtils/AppStyles';
import Animated from "react-native-reanimated";
import { FeedStyles as styles } from "../Styles/FeedStyles";
import { searchForumPostsWithEnrichment } from "./useSearch";
import ShimmerSkeleton from "../Skeleton";

import ArrowLeftIcon from '../../assets/svgIcons/back.svg';
import Search from '../../assets/svgIcons/search.svg';
import Close from '../../assets/svgIcons/close.svg';
import ShareIcon from '../../assets/svgIcons/share.svg';
import Add from '../../assets/svgIcons/add.svg';

import { colors, dimensions } from '../../assets/theme.jsx';
import { useSafeAreaInsets } from "react-native-safe-area-context";

const AllPosts = () => {
    const navigation = useNavigation();
    const { onScroll, headerStyle, bottomStyle, toolbarBgStyle, barStyle } = scrollAnimations();
    const { openReactionPicker, ReactionModal } = useReactionPickerModal();



    const parentNavigation = navigation.getParent();
    const currentRouteName = parentNavigation?.getState()?.routes[parentNavigation.getState().index]?.name;

    const { myId, myData } = useNetwork();
    const { isConnected } = useConnection();
    const [hasFetchedPosts, setHasFetchedPosts] = useState(false);
    const { openSheet, closeSheet } = useBottomSheet();
    const videoRefs = useRef({});
    const [searchQuery, setSearchQuery] = useState('');
    const [activeVideo, setActiveVideo] = useState(null);
    const isFocused = useIsFocused();

    const [videoEndStates, setVideoEndStates] = useState({});
    const [searchResults, setSearchResults] = useState(false);
    const isRefreshingRef = useRef(false);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [searchTriggered, setSearchTriggered] = useState(false);
    const searchInputRef = useRef(null);

    const scrollOffsetY = useRef(0);
    const flatListRef = useRef(null);

    const withTimeout = (promise, timeout = 10000) => {
        return Promise.race([
            promise,
            new Promise((_, reject) => setTimeout(() => reject(new Error("Request timed out")), timeout)),
        ]);
    };

    const reactionSheetRef = useRef(null);
    const [activeReactionForumId, setActiveReactionForumId] = useState(null);



    const {
        localPosts,
        fetchPosts,
        loading,
        forumIds,
        loadingMore,
        hasMorePosts,
        lastEvaluatedKey,
        setLocalPosts,
    } = useForumFetcher({
        command: 'getAllForumPosts',
        type: 'All',
        fetchLimit: 10,
        isConnected,
        myId
    });


    const {

        onViewableItemsChanged,
        viewabilityConfig,
    } = useForumMedia(localPosts, isFocused, setActiveVideo);


    const missedEventsRef = useRef({
        created: [],
        deleted: [],
        updated: [],
        commentAdded: [],
        commentDeleted: [],
    });

    useEffect(() => {
        const listener = EventRegister.addEventListener('onForumPostCreated', async ({ newPost }) => {
            if (!isFocused) {
                missedEventsRef.current.created.push(newPost);
                return;
            }

            try {
                const enrichedPost = await enrichForum(newPost, myId);
                setLocalPosts((prev) => [enrichedPost, ...prev]);
            } catch (error) {
                setLocalPosts((prev) => [newPost, ...prev]);
            }

        });


        const deleteListener = EventRegister.addEventListener('onForumPostDeleted', ({ forum_id }) => {
            if (!isFocused) {
                missedEventsRef.current.deleted.push(forum_id);
                return;
            }


            setLocalPosts((prev) => prev.filter((post) => post.forum_id !== forum_id));
        });

        const updateListener = EventRegister.addEventListener('onForumPostUpdated', async ({ updatedPost }) => {
            if (!isFocused) {
                missedEventsRef.current.updated.push(updatedPost);
                return;
            }

            try {
                const enrichedPost = await enrichForum(updatedPost, myId);
                setLocalPosts((prev) =>
                    prev.map((post) =>
                        post.forum_id === enrichedPost.forum_id ? enrichedPost : post
                    )
                );
            } catch {
                setLocalPosts((prev) =>
                    prev.map((post) =>
                        post.forum_id === updatedPost.forum_id ? updatedPost : post
                    )
                );
            }
        });


        // 🔻 Listener to DECREASE comment count on deletion
        const commentDeletedListener = EventRegister.addEventListener('onCommentDeleted', ({ forum_id }) => {
            if (!isFocused) return;

            setLocalPosts(prev =>
                prev.map(post => {
                    if (post.forum_id === forum_id) {
                        return {
                            ...post,
                            commentCount: Math.max((post.commentCount || 0) - 1, 0),
                            comments_count: Math.max((post.comments_count || 0) - 1, 0),
                        };
                    }
                    return post;
                })
            );
        });

        // 🔺 Listener to INCREASE comment count on comment added
        const commentAddedListener = EventRegister.addEventListener('onCommentAdded', ({ forum_id }) => {
            setLocalPosts(prev =>
                prev.map(post => {
                    if (post.forum_id === forum_id) {
                        return {
                            ...post,
                            commentCount: (post.commentCount || 0) + 1,
                            comments_count: (post.comments_count || 0) + 1,
                        };
                    }
                    return post;
                })
            );
        });

        return () => {
            EventRegister.removeEventListener(listener);
            EventRegister.removeEventListener(deleteListener);
            EventRegister.removeEventListener(updateListener);
            EventRegister.removeEventListener(commentDeletedListener);
            EventRegister.removeEventListener(commentAddedListener);
        };
    }, []);

    useFocusEffect(
        useCallback(() => {
            const processMissedEvents = async () => {
                for (const newPost of missedEventsRef.current.created) {
                    try {
                        const enrichedPost = await enrichForum(newPost, myId);
                        setLocalPosts((prev) => [enrichedPost, ...prev]);
                    } catch {
                        setLocalPosts((prev) => [newPost, ...prev]);
                    }
                }

                for (const updatedPost of missedEventsRef.current.updated) {
                    try {
                        const enrichedPost = await enrichForum(updatedPost, myId);
                        setLocalPosts((prev) =>
                            prev.map((post) =>
                                post.forum_id === enrichedPost.forum_id ? enrichedPost : post
                            )
                        );
                    } catch {
                        setLocalPosts((prev) =>
                            prev.map((post) =>
                                post.forum_id === updatedPost.forum_id ? updatedPost : post
                            )
                        );
                    }
                }

                // Clear the missed events after handling
                missedEventsRef.current = {
                    created: [],
                    deleted: [],
                    updated: [],
                    commentAdded: [],
                    commentDeleted: [],
                };
            };

            processMissedEvents();
        }, [])
    );


    useEffect(() => {
        if (!hasFetchedPosts) {
            fetchPosts();
            setHasFetchedPosts(true);
        }
    }, [hasFetchedPosts]);



    const handleEndReached = useCallback(() => {
        if (loading || loadingMore || !hasMorePosts) return;
        fetchPosts(lastEvaluatedKey);
    }, [loading, loadingMore, hasMorePosts, lastEvaluatedKey, fetchPosts]);


    const commentSectionRef = useRef();
    const bottomSheetRef = useRef(null);


    const openCommentSheet = (forum_id, user_id, myId, item) => {

        openSheet(
            <View style={{ flex: 1, backgroundColor: '#F7F8FA' }}>
                <View style={{ flex: 1 }}>
                    <CommentsSection
                        forum_id={forum_id}
                        currentUserId={myId}
                        ref={commentSectionRef}
                        closeBottomSheet={() => {
                            console.log('[Comment Sheet] Closing sheet');
                            bottomSheetRef.current?.scrollTo(0);
                        }}
                    />

                </View>
                <CommentInputBar
                    storedUserId={myId}
                    forum_id={forum_id}
                    item={item}
                    onCommentAdded={(newCommentData) => {
                        console.log('[Comment Added] New comment:', newCommentData);
                        commentSectionRef.current?.handleCommentAdded(newCommentData);
                    }}
                    onEditComplete={(updatedComment) => {
                        console.log('[Comment Edited] Updated comment:', updatedComment);
                        commentSectionRef.current?.handleEditComplete(updatedComment);
                    }}
                />

            </View>,

        );
    };
    const isTabRefreshingRef = useRef(false);

    React.useEffect(() => {
        const unsubscribe = navigation.addListener('tabPress', (e) => {
            if (!navigation.isFocused()) return;

            e.preventDefault();

            if (isTabRefreshingRef.current) return;
            isTabRefreshingRef.current = true;

            console.log('tab pressed again → scroll to top → refresh');

            // 1️⃣ Scroll to top
            flatListRef.current?.scrollToOffset({
                offset: 0,
                animated: true,
            });

            // 2️⃣ Refresh AFTER scroll is scheduled
            requestAnimationFrame(() => {
                Promise.resolve(handleRefresh()).finally(() => {
                    isTabRefreshingRef.current = false;
                });
            });
        });

        return unsubscribe;
    }, [navigation, handleRefresh]);


    const renderItem = useRenderForumItem({
        localPosts,
        setLocalPosts,
        forumIds,
        openReactionPicker,
        searchResults,
        setSearchResults,
        activeVideo,
        videoEndStates,
        setVideoEndStates,
        isFocused,
        videoRefs,
        activeReactionForumId,
        setActiveReactionForumId,
        openCommentSheet,
        myId,
        searchQuery,
        openMediaViewer,
        reactionSheetRef,
        context: "latest"
    });


    const lastCheckedTimeRef = useRef(Math.floor(Date.now() / 1000));
    const [lastCheckedTime, setLastCheckedTime] = useState(lastCheckedTimeRef.current);
    const [newJobCount, setNewJobCount] = useState(0);
    const [showNewJobAlert, setShowNewJobAlert] = useState(false);

    const updateLastCheckedTime = (time) => {
        lastCheckedTimeRef.current = time;
        setLastCheckedTime(time);
    };

    useEffect(() => {
        const interval = setInterval(() => {
            checkForNewJobs();
        }, 10000); // every 10 seconds

        return () => clearInterval(interval);
    }, []);

    const checkForNewJobs = async () => {
        const now = Math.floor(Date.now() / 1000);

        try {
            const response = await apiClient.post('/getNewLatestForumPostsCount', {
                command: 'getNewLatestForumPostsCount',
                user_id: myId,
                lastVisitedTime: lastCheckedTimeRef.current,
            });

            const { count = 0, user_ids = [] } = response?.data || {};
            const filteredUserIds = user_ids.filter(id => id !== myId);
            const filteredCount = filteredUserIds.length;

            if (filteredCount > 0) {
                setNewJobCount(filteredCount);
                setShowNewJobAlert(true);
            } else {

                setShowNewJobAlert(false);
            }
        } catch (error) {

        }
    };

    useEffect(() => {
        return () => {
            Object.values(videoRefs.current || {}).forEach(ref => {
                try {
                    ref?.release?.();
                } catch (e) { }
            });
            videoRefs.current = {};
        };
    }, []);


    const handleRefresh = useCallback(async () => {

        if (!isConnected) {

            showToast('No internet connection', 'error');
            return;
        }

        if (isRefreshingRef.current) {

            return;
        }

        try {

            isRefreshingRef.current = true;
            setIsRefreshing(true);
            Object.values(videoRefs.current || {}).forEach(ref => {
                try {
                    ref?.stop?.();     // optional
                    ref?.pause?.();    // optional
                    ref?.release?.();  // ✅ MOST IMPORTANT
                } catch (e) { }
            });
            videoRefs.current = {};
            setLocalPosts([])

            setSearchQuery('');
            setSearchTriggered(false);
            setSearchResults([]);
            setActiveVideo(null);
            setVideoEndStates({});
            searchInputRef.current?.blur();

            setNewJobCount(0);
            setShowNewJobAlert(false);
            const newCheckTime = Math.floor(Date.now() / 1000);
            updateLastCheckedTime(newCheckTime);

            await fetchPosts(null, true);

        } catch (error) {

        } finally {
            setIsRefreshing(false);

            setTimeout(() => {
                isRefreshingRef.current = false;

            }, 300);
        }
    }, [
        fetchPosts,
        isConnected,
        showToast,
        searchQuery,
        activeVideo,
        updateLastCheckedTime,
    ]);

    const debounceTimeout = useRef(null);

    const handleDebouncedTextChange = useCallback((text) => {
        setSearchQuery(text);

        if (debounceTimeout.current) {
            clearTimeout(debounceTimeout.current);
        }

        const trimmedText = text.trim();

        if (trimmedText === '') {
            setSearchTriggered(false);
            setSearchResults([]);
            return;
        }

        debounceTimeout.current = setTimeout(() => {
            handleSearch(trimmedText);
        }, 300);
    }, [handleSearch]);




    const handleSearch = useCallback(async (text) => {
        setSearchQuery(text);

        const { posts, count } = await searchForumPostsWithEnrichment({
            text,
            myId,
            isConnected,
            withTimeout
        });

        setSearchResults(posts);
        setSearchTriggered(true);
    }, [myId, isConnected]);


    const onRender = (id, phase, actualDuration) => {
        // console.log(`[Profiler] ${id} - ${phase}`);
        // console.log(`Actual render duration: ${actualDuration}ms`);
    };

    const insets = useSafeAreaInsets();
    const headerHeight = insets?.top+ 44;

    return (


        <>

            <Animated.View style={[AppStyles.toolbar, toolbarBgStyle, { paddingTop: insets.top }]}>

                <Animated.View style={[AppStyles.searchRow, headerStyle]}>
                    <View style={AppStyles.searchBar}>
                        <Search width={dimensions.icon.medium} height={dimensions.icon.medium} color={colors.text_secondary} />

                        <TextInput
                            ref={searchInputRef}
                            placeholder="Search posts..."
                            style={AppStyles.searchInput}
                            placeholderTextColor="#666"
                            value={searchQuery}
                            onChangeText={handleDebouncedTextChange}
                        />
                    </View>
                    <TouchableOpacity
                        style={AppStyles.circle}
                        onPress={() => { navigation.navigate('ForumPost') }}
                        activeOpacity={1}
                    >
                        <Add width={dimensions.icon.xl} height={dimensions.icon.xl} color={colors.primary} />


                    </TouchableOpacity>
                </Animated.View>
                {showNewJobAlert && (
                    <TouchableOpacity onPress={handleRefresh} style={{ position: 'absolute', top: headerHeight, alignSelf: 'center', backgroundColor: '#075cab', padding: 10, margin: 10, borderRadius: 10, zIndex: 10 }}>
                        <Text style={{ color: 'white', fontWeight: '500' }}>{newJobCount} new post{newJobCount > 1 ? 's' : ''} available — Tap to refresh</Text>
                    </TouchableOpacity>
                )}
            </Animated.View>



            <Animated.FlatList
                data={!searchTriggered || searchQuery.trim() === '' ? localPosts : searchResults}
                renderItem={renderItem}
                ref={flatListRef}
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps="never"
                onScrollBeginDrag={() => {
                    Keyboard.dismiss();
                    searchInputRef.current?.blur?.();

                }}
                onScroll={onScroll}
                scrollEventThrottle={16}
                overScrollMode={'never'}
                keyExtractor={(item, index) => `${item.forum_id}-${index}`}

                onViewableItemsChanged={onViewableItemsChanged}
                viewabilityConfig={viewabilityConfig}
                refreshControl={
                    <RefreshControl refreshing={isRefreshing} onRefresh={handleRefresh}
                        progressViewOffset={headerHeight} />
                }

                onEndReached={handleEndReached}
                onEndReachedThreshold={0.3}
                contentContainerStyle={{paddingTop:headerHeight}}

                ListHeaderComponent={
                    <>
                        {searchTriggered && searchResults.length > 0 && (
                            <Text style={styles.companyCount}>
                                {searchResults.length} results found
                            </Text>
                        )}
                    </>
                }
                ListEmptyComponent={
                    (searchTriggered && searchResults.length === 0) ? (
                        <View style={{ alignItems: 'center', marginTop: 40 }}>
                            <Text style={{ fontSize: 16, color: '#666' }}>No posts found</Text>
                        </View>
                    ) : null
                }

                ListFooterComponent={
                    loadingMore || loading ? (
                        <View >
                            <ShimmerSkeleton />
                        </View>
                    ) : null
                }

            />


            {/* <Animated.View style={[AppStyles.bottom,]}>

                <BottomNavigationBar
                    tabs={tabConfig}
                    currentRouteName={currentRouteName}
                    navigation={navigation}
                    flatListRef={listRef}
                    scrollOffsetY={scrollOffsetY}
                    handleRefresh={handleRefresh}
                />
            </Animated.View> */}
            <ReactionSheet ref={reactionSheetRef} />
            <ReactionModal />

        </>

    );
};



export default AllPosts;