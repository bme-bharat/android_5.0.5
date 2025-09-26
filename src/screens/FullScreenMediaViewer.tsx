import React, { useRef, useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  TouchableWithoutFeedback,
  TouchableOpacity,
  Animated,
  Platform,
  StatusBar,
  ActivityIndicator,
} from "react-native";
import Slider from '@react-native-community/slider';
import BMEVideoPlayer, { BMEVideoPlayerHandle } from "./BMEVideoPlayer";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import Icon from "react-native-vector-icons/Ionicons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Close from '../assets/svgIcons/close.svg';
import Play from '../assets/svgIcons/play.svg';
import Pause from '../assets/svgIcons/pause.svg';
import Mute from '../assets/svgIcons/mute.svg';
import Volume from '../assets/svgIcons/volume.svg';
import play from '../images/homepage/PlayIcon.png'
import { colors, dimensions } from '../assets/theme.jsx';

const { height } = Dimensions.get("window");
const AUTO_HIDE_DELAY = 3000;
const SEEK_IGNORE_MS = 300;

const InlineVideo = ({ route }) => {
  const { source, poster, videoHeight } = route.params;
  const videoRef = useRef<BMEVideoPlayerHandle>(null);
  const sliderValueRef = useRef(0);

  const [paused, setPaused] = useState(false);
  const [muted, setMuted] = useState(false);
  const [position, setPosition] = useState(0);
  const [duration, setDuration] = useState(0);
  const [controlsVisible, setControlsVisible] = useState(false);
  const [isSliding, setIsSliding] = useState(false);
  const [ignoreUpdatesUntil, setIgnoreUpdatesUntil] = useState(0);
  const [loading, setLoading] = useState(true);

  const fadeAnim = useRef(new Animated.Value(1)).current;
  const hideTimeout = useRef<NodeJS.Timeout | null>(null);
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const [sliderDisabled, setSliderDisabled] = useState(false);

  const topInset =
    Platform.OS === "android" ? StatusBar.currentHeight || 0 : insets.top;
  const bottomInset = Platform.OS === "android" ? insets.bottom : 16;

  // -------- Playback status from native player --------
  const handlePlaybackStatus = useCallback(
    (event) => {
      const now = Date.now();
      if (now < ignoreUpdatesUntil || isSliding) return;

      if (event.position !== undefined) setPosition(event.position);
      if (event.duration !== undefined) setDuration(event.duration);
      if (event.status === "notSeekable") {
        setSliderDisabled(true);
      } else if (event.status === "seekable") {
        setSliderDisabled(false);
      }

      if (event.status === "buffering") setLoading(true);
      else if (event.status === "progress") setLoading(false);
      else if (event.status === "ended") setPaused(true);
    },
    [isSliding, ignoreUpdatesUntil]
  );

  // -------- Show controls (does NOT hide if already visible) --------
  const showControls = (isPaused = paused) => {
    if (hideTimeout.current) clearTimeout(hideTimeout.current);

    setControlsVisible(true);
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 200,
      useNativeDriver: true,
    }).start();

    // Auto-hide only if playing AND not sliding
    if (!isPaused && !isSliding) {
      hideTimeout.current = setTimeout(() => {
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }).start(() => setControlsVisible(false));
      }, AUTO_HIDE_DELAY);
    }
  };



  // -------- Toggle play/pause --------
  const togglePlayPause = () => {
    setPaused((prev) => {
      const next = !prev;
      showControls(next);
      return next;
    });
  };

  // -------- Toggle mute --------
  const toggleMute = () => {
    setMuted((prev) => !prev);
    showControls();
  };

  // -------- Toggle controls on tap --------
  const toggleControls = () => {
    if (controlsVisible) {
      // Hide controls
      if (hideTimeout.current) clearTimeout(hideTimeout.current);
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }).start(() => setControlsVisible(false));
    } else {
      // Show controls
      showControls();
    }
  };

  // -------- Seek video --------
  const handleSeekComplete = (value: number) => {
    sliderValueRef.current = value;
    setPosition(value); // optimistic
    videoRef.current?.seekTo(value);

    setIgnoreUpdatesUntil(Date.now() + SEEK_IGNORE_MS);
    setIsSliding(false);

    // resume playback after seek
    setPaused(false);
    showControls();
  };

  // -------- Keep controls visible when paused --------
  useEffect(() => {
    if (paused) {
      if (hideTimeout.current) clearTimeout(hideTimeout.current);
      setControlsVisible(true);
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }).start();
    } else {
      showControls(); // schedules auto-hide
    }
  }, [paused]);

  // -------- Format seconds to mm:ss --------
  const formatTime = (sec: number) => {
    if (!sec || sec < 0) sec = 0;
    const m = Math.floor(sec / 60);
    const s = Math.floor(sec % 60);
    return `${m}:${s < 10 ? "0" : ""}${s}`;
  };

  // -------- Focus/unfocus handling --------
  useFocusEffect(
    useCallback(() => {
      setPaused(false);
      return () => {
        setPaused(true);
        videoRef.current?.release();
      };
    }, [])
  );

  useEffect(() => {
    return () => {
      if (hideTimeout.current) clearTimeout(hideTimeout.current);
      videoRef.current?.release();
    };
  }, []);

  const handleClose = () => {
    setPaused(true);
    videoRef.current?.stop();
    navigation.goBack();
  };

  return (
    <TouchableWithoutFeedback onPress={toggleControls}>
      <View style={[styles.videoContainer]}>
        <BMEVideoPlayer
          ref={videoRef}
          source={source}
          paused={paused}
          muted={muted}
          onPlaybackStatus={handlePlaybackStatus}
          style={{ width: "100%", aspectRatio: videoHeight }}
          resizeMode="contain"
          repeat
          poster={poster}
          posterResizeMode="cover"

        />

        {/* Controls */}
        {controlsVisible && (
          <Animated.View style={[styles.overlay, { opacity: fadeAnim }]}>
            {/* Top row */}
            <View style={[styles.topControls,]}>
              <TouchableOpacity onPress={handleClose} style={styles.iconButton}>
                <Close width={dimensions.icon.xl} height={dimensions.icon.xl} color={colors.background} />

              </TouchableOpacity>

              {loading && (
                <View
                  style={styles.iconButton} >
                  <ActivityIndicator size="small" color="#FFF" />
                </View>
              )}
            </View>

            {/* Central play/pause */}
            <View style={styles.centralIcon}>
              <TouchableOpacity activeOpacity={0.8} onPress={togglePlayPause} style={{ backgroundColor: "rgba(0,0,0,0.5)", borderRadius: 100, padding: 10 }}>
                {paused ? (
                  <Play width={dimensions.icon.xl} height={dimensions.icon.xl} color={colors.background} />
                ) : (
                  <Pause width={dimensions.icon.xl} height={dimensions.icon.xl} color={colors.background} />

                )}
              </TouchableOpacity>
            </View>

            {/* Bottom row */}
            <View style={[styles.bottomControls,]}>
              <TouchableOpacity
                onPress={togglePlayPause}
                style={styles.smallPlayPause}
              >
                {paused ? (
                  <Play width={dimensions.icon.medium} height={dimensions.icon.medium} color={colors.background} />
                ) : (
                  <Pause width={dimensions.icon.medium} height={dimensions.icon.medium} color={colors.background} />

                )}

              </TouchableOpacity>

              <Slider
                style={styles.slider}
                minimumValue={0}
                disabled={sliderDisabled}
                maximumValue={duration > 0 ? duration : 0}
                value={position}

                onValueChange={(value) => {
                  if (isSliding) {
                    sliderValueRef.current = value;
                    setPosition(value);
                  }
                }}
                onSlidingStart={() => {
                  setIsSliding(true);
                  showControls(); // keeps controls visible
                }}

                onSlidingComplete={(value) => {
                  handleSeekComplete(value);
                  setIsSliding(false);
                  showControls(); // re-start auto-hide if needed
                }}

                minimumTrackTintColor="#075cab"
                maximumTrackTintColor="rgba(255,255,255,0.5)"
                thumbTintColor="#fff"
              />
              <Text style={styles.timeText}>
                -{formatTime(duration - position)}
              </Text>

              <TouchableOpacity onPress={toggleMute} style={styles.iconButtonMute}>
                {muted ? (
                  <Mute width={dimensions.icon.medium} height={dimensions.icon.medium} color={colors.background} />
                ) : (
                  <Volume width={dimensions.icon.medium} height={dimensions.icon.medium} color={colors.background} />
                )}

              </TouchableOpacity>
            </View>
          </Animated.View>
        )}
      </View>
    </TouchableWithoutFeedback>
  );
};

const styles = StyleSheet.create({
  videoContainer: {
    width: "100%",
    height: '100%',
    backgroundColor: "#000",
    justifyContent: "center",
    alignItems: "center",
  },
  overlay: {
    position: "absolute",
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
  },

  centralIcon: {
    position: "absolute",
    top: 0,
    bottom: 0,
    right: 0,
    left: 0,
    justifyContent: "center",
    alignItems: "center",
    zIndex: 20,
  },

  topControls: {
    position: "absolute",
    top: 10, // safe area + padding
    left: 0,
    right: 0,
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 12,
    zIndex: 30,
  },
  bottomControls: {
    position: "absolute",
    bottom: Platform.OS === "android" ? 16 : 16, // or use insets.bottom
    left: 0,
    right: 0,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    zIndex: 30,
    backgroundColor: "rgba(0,0,0,0.5)",
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
  },
  smallPlayPause: {
    
  },
});

export default InlineVideo;
