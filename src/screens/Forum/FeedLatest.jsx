
import React, { useState, useEffect, useCallback, useRef, Profiler, useMemo } from "react";
import { View, Text, TouchableOpacity, TextInput, Dimensions, StyleSheet, Keyboard, ActivityIndicator, RefreshControl, InputAccessoryView, Platform, StatusBar } from "react-native";
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { useIsFocused } from "@react-navigation/native";

import { useNetwork } from "../AppUtils/IdProvider";
import { showToast } from "../AppUtils/CustomToast";
import CommentsSection from "../AppUtils/Comments";
import { useBottomSheet } from "../AppUtils/SheetProvider";
import CommentInputBar from "../AppUtils/InputBar";
import { useConnection } from "../AppUtils/ConnectionProvider";
import { openMediaViewer } from "../helperComponents/mediaViewer";
import ReactionSheet from "../helperComponents/ReactionUserSheet";
import { useForumMedia } from "../helperComponents/forumViewableItems";
import useRenderForumItem from './useRenderForumItem';
import useForumFetcher from './useForumFetcher';
import scrollAnimations from '../helperComponents/scrollAnimations';
import AppStyles from '../AppUtils/AppStyles';
import Animated from "react-native-reanimated";
import { FeedStyles as styles } from "../Styles/FeedStyles";
import ShimmerSkeleton from "../Skeleton";
import { searchForumPostsWithEnrichment } from "./useSearch";
import ArrowLeftIcon from '../../assets/svgIcons/back.svg';
import Search from '../../assets/svgIcons/search.svg';
import Close from '../../assets/svgIcons/close.svg';
import ShareIcon from '../../assets/svgIcons/share.svg';
import Add from '../../assets/svgIcons/add.svg';

import { colors, dimensions } from '../../assets/theme.jsx';
import { useReactionPickerModal } from "./ReactionPicker.jsx";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const { height: screenHeight } = Dimensions.get('window');

const LatestPosts = () => {
    const navigation = useNavigation();
    const { onScroll, headerStyle, bottomStyle, toolbarBgStyle, barStyle } = scrollAnimations();

    const { myId, myData } = useNetwork();
    const { isConnected } = useConnection();
    const [hasFetchedPosts, setHasFetchedPosts] = useState(false);
    const { openSheet, closeSheet } = useBottomSheet();
    const videoRefs = useRef({});


    const [searchQuery, setSearchQuery] = useState('');
    const [activeVideo, setActiveVideo] = useState(null);
    const isFocused = useIsFocused();

    const [searchCount, setSearchCount] = useState(false);
    const [videoEndStates, setVideoEndStates] = useState({});

    const [searchResults, setSearchResults] = useState([]);
    const isRefreshingRef = useRef(false);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [searchTriggered, setSearchTriggered] = useState(false);
    const searchInputRef = useRef(null);

    const listRef = useRef(null);

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
        command: 'getLatestPosts',
        type: 'Latest',
        fetchLimit: 10,
        isConnected,
        myId
    });

    const {
        onViewableItemsChanged,
        viewabilityConfig,
    } = useForumMedia(localPosts, isFocused, setActiveVideo);


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
    const { openReactionPicker, ReactionModal } = useReactionPickerModal();

    const renderItem = useRenderForumItem({
        localPosts,
        setLocalPosts,
        forumIds,
        searchResults,
        setSearchResults,
        activeVideo,
        videoEndStates,
        openReactionPicker,
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
        listRef.current?.scrollToOffset({ offset: 0, animated: true });
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
                    <TouchableOpacity onPress={() => navigation.goBack()} style={AppStyles.backButton} activeOpacity={1}>
                        <ArrowLeftIcon width={dimensions.icon.medium} height={dimensions.icon.medium} fill={colors.primary} />

                    </TouchableOpacity>
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
                </Animated.View>

            </Animated.View>


            <Animated.FlatList
                data={!searchTriggered || searchQuery.trim() === '' ? localPosts : searchResults}
                renderItem={renderItem}
                ref={listRef}
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


            <ReactionSheet ref={reactionSheetRef} />
            <ReactionModal />

        </>

    );
};



export default LatestPosts;