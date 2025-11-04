import React, {
  forwardRef,
  useImperativeHandle,
  useRef,
  useCallback,
  useEffect,
  useState,
} from "react";
import {
  requireNativeComponent,
  UIManager,
  findNodeHandle,
  NativeSyntheticEvent,
  ViewProps,
  AppState,
  AppStateStatus,
  ImageSourcePropType,
} from "react-native";

type PlaybackStatusEvent = {
  status: string;
  position?: number;
  duration?: number;
  message?: string;
};

type SeekEvent = {
  position: number;
};

type BMEVideoPlayerProps = ViewProps & {
  source: string;
  paused?: boolean;
  muted?: boolean;
  volume?: number;
  resizeMode?: "contain" | "cover" | "stretch";
  poster?: ImageSourcePropType;
  posterResizeMode?: "contain" | "cover" | "stretch";
  repeat?: boolean;
  showProgressBar?: boolean; 
  onPlaybackStatus?: (event: PlaybackStatusEvent) => void;
  onSeek?: (event: SeekEvent) => void; // 🔹 new callback
  onEndReached?: () => void;
};

export type BMEVideoPlayerHandle = {
  play: () => void;
  pause: () => void;
  seekTo: (seconds: number) => void;
  release: () => void;
  stop: () => void;            
};

const NativeBMEVideoPlayer =
  requireNativeComponent<BMEVideoPlayerProps>("BMEVideoPlayer");

const BMEVideoPlayer = forwardRef<BMEVideoPlayerHandle, BMEVideoPlayerProps>(
  ({ paused: pausedProp, onPlaybackStatus, onSeek, ...props }, ref) => {
    const nativeRef = useRef<any>(null);
    const [isAppActive, setIsAppActive] = useState(true);

    // Track AppState
    useEffect(() => {
      const subscription = AppState.addEventListener(
        "change",
        (nextState: AppStateStatus) => {
          setIsAppActive(nextState === "active");
        }
      );
      return () => subscription.remove();
    }, []);


    // Compute actual paused state
    const actualPaused = pausedProp || !isAppActive;

    // Dispatch command helper
    const dispatchCommand = useCallback((commandName: string, args: any[] = []) => {
      const reactTag = findNodeHandle(nativeRef.current);
      if (reactTag == null) return;
      const commandId =
        UIManager.getViewManagerConfig("BMEVideoPlayer").Commands[commandName];
      if (commandId == null) return;
      UIManager.dispatchViewManagerCommand(reactTag, commandId, args);
    }, []);

    // Expose imperative API
    useImperativeHandle(ref, () => ({
      play: () => dispatchCommand("play"),
      pause: () => dispatchCommand("pause"),
      seekTo: (seconds: number) => dispatchCommand("seekTo", [seconds]),
      release: () => dispatchCommand("release"),
      stop: () => dispatchCommand("stop"),
    }));

    // Wrap event handler (only if provided)
    const handlePlaybackStatus = useCallback(
      (event: NativeSyntheticEvent<PlaybackStatusEvent>) => {
        if (onPlaybackStatus) {
          onPlaybackStatus(event.nativeEvent);
        }
      },
      [onPlaybackStatus]
    );

    const handleEndReached = useCallback(
      (event: NativeSyntheticEvent<any>) => {
        props.onEndReached?.();
      },
      [props.onEndReached]
    );
    
    const handleSeek = useCallback(
      (event: NativeSyntheticEvent<SeekEvent>) => {
        onSeek?.(event.nativeEvent);
      },
      [onSeek]
    );
    
    return (
      <NativeBMEVideoPlayer
        {...props}
        paused={actualPaused}
        ref={nativeRef}
        onPlaybackStatus={onPlaybackStatus ? handlePlaybackStatus : undefined}
        onSeek={onSeek ? handleSeek : undefined}
        onEndReached={props.onEndReached ? handleEndReached : undefined}

      />
    );
  }
);

export default BMEVideoPlayer;
