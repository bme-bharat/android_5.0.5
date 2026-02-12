import React, { useRef, useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  Platform,
  StatusBar,
  ActivityIndicator,
  Animated,
  TouchableWithoutFeedback,
} from "react-native";
import Slider from "@react-native-community/slider";

import { useFocusEffect, useNavigation } from "@react-navigation/native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Close from "../assets/svgIcons/close-large.svg";
import Play from "../assets/svgIcons/play.svg";
import Pause from "../assets/svgIcons/pause.svg";
import Mute from "../assets/svgIcons/mute.svg";
import Volume from "../assets/svgIcons/volume.svg";
import { colors, dimensions } from "../assets/theme.jsx";
import BMEVideoPlayer, { BMEVideoPlayerHandle } from "./BMEVideoPlayer";

const SEEK_IGNORE_MS = 300;
const CONTROL_TIMEOUT = 3000; // ms

const InlineVideo = ({ route }) => {
  const { source, poster, videoHeight } = route.params;
  const videoRef = useRef<BMEVideoPlayerHandle>(null);
  const sliderValueRef = useRef(0);
  const hideTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const [paused, setPaused] = useState(false);
  const [muted, setMuted] = useState(false);
  const [position, setPosition] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isSliding, setIsSliding] = useState(false);
  const [ignoreUpdatesUntil, setIgnoreUpdatesUntil] = useState(0);
  const [loading, setLoading] = useState(true);
  const [sliderDisabled, setSliderDisabled] = useState(false);
  const [wasPausedBeforeSliding, setWasPausedBeforeSliding] = useState(false);
  const [showControls, setShowControls] = useState(true);

  const opacityAnim = useRef(new Animated.Value(1)).current;

  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const topInset =
    Platform.OS === "android" ? StatusBar.currentHeight || 0 : insets.top;

  // ------------------ Playback Status ------------------
  const handlePlaybackStatus = useCallback(
    (event) => {
      const now = Date.now();
      if (now < ignoreUpdatesUntil || isSliding) return;

      if (event.position !== undefined) setPosition(event.position);
      if (event.duration !== undefined) setDuration(event.duration);
      if (event.status === "notSeekable") setSliderDisabled(true);
      else if (event.status === "seekable") setSliderDisabled(false);

      if (event.status === "buffering") setLoading(true);
      else if (event.status === "progress") setLoading(false);
      else if (event.status === "ended") setPaused(true);
    },
    [isSliding, ignoreUpdatesUntil]
  );

  // ------------------ Toggle Playback ------------------
  const togglePlayPause = () => {
    setPaused((prev) => !prev);
    resetHideControlsTimer();
  };

  // ------------------ Toggle Mute ------------------
  const toggleMute = () => {
    setMuted((prev) => !prev);
    resetHideControlsTimer();
  };

  // ------------------ Seek Video ------------------
  const handleSeekComplete = (value: number) => {
    sliderValueRef.current = value;
    setPosition(value);
    videoRef.current?.seekTo(value);

    setIgnoreUpdatesUntil(Date.now() + SEEK_IGNORE_MS);
    setIsSliding(false);
    setPaused(false);
  };

  const formatTime = (sec: number) => {
    if (!sec || sec < 0) sec = 0;
    const m = Math.floor(sec / 60);
    const s = Math.floor(sec % 60);
    return `${m}:${s < 10 ? "0" : ""}${s}`;
  };

  // ------------------ Auto-hide Controls ------------------
  const resetHideControlsTimer = () => {
    if (hideTimeoutRef.current) clearTimeout(hideTimeoutRef.current);
    hideTimeoutRef.current = setTimeout(() => {
      fadeOutControls();
    }, CONTROL_TIMEOUT);
  };

  const fadeInControls = () => {
    setShowControls(true);
    Animated.timing(opacityAnim, {
      toValue: 1,
      duration: 200,
      useNativeDriver: true,
    }).start();
    resetHideControlsTimer();
  };

  const fadeOutControls = () => {
    Animated.timing(opacityAnim, {
      toValue: 0,
      duration: 300,
      useNativeDriver: true,
    }).start(() => setShowControls(false));
  };

  const toggleControls = () => {
    if (showControls) {
      fadeOutControls();
    } else {
      fadeInControls();
    }
  };

  // ------------------ Lifecycle ------------------
  useFocusEffect(
    useCallback(() => {
      setPaused(false);
      resetHideControlsTimer();
      return () => {
        setPaused(true);
        videoRef.current?.release();
        if (hideTimeoutRef.current) clearTimeout(hideTimeoutRef.current);
      };
    }, [])
  );

  useEffect(() => {
    return () => {
      videoRef.current?.release();
    };
  }, []);

  const handleClose = () => {
    setPaused(true);
    videoRef.current?.stop();
    navigation.goBack();
  };

  const clearHideControlsTimer = () => {
    if (hideTimeoutRef.current) clearTimeout(hideTimeoutRef.current);
    hideTimeoutRef.current = null;
  };

  // ------------------ UI ------------------
  return (
    <View style={styles.videoContainer}>
      <TouchableWithoutFeedback onPress={toggleControls}>
        <View style={styles.videoWrapper}>
          <BMEVideoPlayer
            ref={videoRef}
            source={source}
            paused={paused}
            muted={muted}
            onPlaybackStatus={handlePlaybackStatus}
            style={{ width: "100%", aspectRatio: videoHeight || 9/16 }}
            resizeMode="contain"
            repeat
            poster={poster}
            posterResizeMode="cover"
          />

          {/* Center Play/Pause */}
          <View style={styles.centralIcon}>
            {loading ? (
              <ActivityIndicator size="large" color="#FFF" />
            ) : (
              <TouchableOpacity
                activeOpacity={0.8}
                onPress={togglePlayPause}
                style={styles.playPauseCenter}
              >
                {paused ? (
                  <Play
                    width={dimensions.icon.xl}
                    height={dimensions.icon.xl}
                    color={colors.background}
                  />
                ) : (
                  <Pause
                    width={dimensions.icon.xl}
                    height={dimensions.icon.xl}
                    color={colors.background}
                  />
                )}
              </TouchableOpacity>
            )}
          </View>
          {/* Animated Controls */}
          <Animated.View style={[styles.overlay, { opacity: opacityAnim }]}>
            {/* Top Row */}
            <View style={[styles.topControls, { top: topInset + 10 }]}>
              <TouchableOpacity onPress={handleClose} style={styles.iconButton}>
                <Close
                  width={dimensions.icon.medium}
                  height={dimensions.icon.medium}
                  color={colors.background}
                />
              </TouchableOpacity>
            </View>



            {/* Bottom Row */}
            <View style={styles.bottomControls}>
              <TouchableOpacity onPress={togglePlayPause} style={styles.smallPlayPause}>
                {paused ? (
                  <Play
                    width={dimensions.icon.medium}
                    height={dimensions.icon.medium}
                    color={colors.background}
                  />
                ) : (
                  <Pause
                    width={dimensions.icon.medium}
                    height={dimensions.icon.medium}
                    color={colors.background}
                  />
                )}
              </TouchableOpacity>

              <Slider
                style={styles.slider}
                minimumValue={0}
                disabled={sliderDisabled}
                maximumValue={duration > 0 ? duration : 0}
                value={position}
                onSlidingStart={() => {
                  clearHideControlsTimer(); // stop auto-hide
                  setIsSliding(true);
                  setWasPausedBeforeSliding(paused);
                  setPaused(true);
                }}
                onValueChange={(value) => {
                  sliderValueRef.current = value;
                  setPosition(value);
                }}
                onSlidingComplete={(value) => {
                  handleSeekComplete(value);
                  setIsSliding(false);
                  setPaused(wasPausedBeforeSliding);
                  resetHideControlsTimer(); // resume auto-hide after sliding ends
                }}
                minimumTrackTintColor="#075cab"
                maximumTrackTintColor="rgba(255,255,255,0.5)"
                thumbTintColor="#fff"
              />

              <Text style={styles.timeText}>
                {formatTime(position)} / {formatTime(duration)}
              </Text>

              <TouchableOpacity onPress={toggleMute} style={styles.iconButtonMute}>
                {muted ? (
                  <Mute
                    width={dimensions.icon.medium}
                    height={dimensions.icon.medium}
                    color={colors.background}
                  />
                ) : (
                  <Volume
                    width={dimensions.icon.medium}
                    height={dimensions.icon.medium}
                    color={colors.background}
                  />
                )}
              </TouchableOpacity>
            </View>
          </Animated.View>
        </View>
      </TouchableWithoutFeedback>
    </View>
  );
};

const styles = StyleSheet.create({
  videoContainer: {
    flex: 1,
    backgroundColor: "#000",
    justifyContent: "center",
    alignItems: "center",
  },
  videoWrapper: {
    flex: 1,
    width: "100%",
    justifyContent: "center",
    alignItems: "center",
  },
  overlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: "space-between",
  },
  topControls: {
    position: "absolute",
    left: 0,
    right: 0,
    flexDirection: "row",
    justifyContent: "flex-end",
    paddingHorizontal: 12,
    zIndex: 30,
  },
  bottomControls: {
    position: "absolute",
    bottom: Platform.OS === "android" ? 16 : 16,
    left: 0,
    right: 0,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    zIndex: 30,
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  centralIcon: {
    position: "absolute",
    top: 0,
    bottom: 0,
    right: 0,
    left: 0,
    justifyContent: "center",
    alignItems: "center",
  },
  playPauseCenter: {
    backgroundColor: "rgba(0,0,0,0.5)",
    borderRadius: 100,
    padding: 12,
  },
  iconButton: {
    backgroundColor: "rgba(0,0,0,0.5)",
    padding: 8,
    borderRadius: 60,
  },
  iconButtonMute: {
    backgroundColor: "rgba(0,0,0,0.5)",
    padding: 8,
    marginHorizontal: 5,
    borderRadius: 20,
  },
  slider: {
    flex: 1,
    height: 8,
    borderRadius: 8,
  },
  timeText: {
    color: "#FFF",
    fontSize: 12,
    marginLeft: 5,
  },
  smallPlayPause: {
    marginRight: 5,
  },
});

export default InlineVideo;
