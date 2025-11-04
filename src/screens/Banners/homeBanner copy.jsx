import React, { useCallback, useEffect, useState, useRef } from 'react';
import {
  View,
  Image,
  Dimensions,
  TouchableOpacity,
  ActivityIndicator,
  Linking,
  Animated,
} from 'react-native';
import Carousel from 'react-native-reanimated-carousel';
import Video from 'react-native-video';
import { useNavigation } from '@react-navigation/native';
import apiClient from '../ApiClient';
import Play from '../../assets/svgIcons/play.svg';
import { colors, dimensions } from '../../assets/theme';
import BMEVideoPlayer from '../BMEVideoPlayer';
import poster from '../../images/homepage/PlayIcon.png';
const { width } = Dimensions.get('window');

const resolvedPoster = poster
  ? Image.resolveAssetSource(poster)?.uri
  : undefined;


const HomeBanner = ({bannerId, activeBannerId}) => {
  const [loading, setLoading] = useState(true);
  const [banners, setBanners] = useState([]);
  const [playingIndex, setPlayingIndex] = useState(null);
  const carouselRef = useRef(null);
  const navigation = useNavigation();
  const videoRefs = useRef([]);
  const overlayOpacity = useRef(new Animated.Value(1)).current;

  const handleRedirect = useCallback((url) => {
    if (!url) return;
    const safeUrl = url.startsWith('http') ? url : `https://${url}`;
    Linking.openURL(safeUrl).catch((err) =>
      console.warn('Failed to open URL:', err)
    );
  }, []);

  const onPressBanner = useCallback(
    (item) => {
      if (item.id) {
        navigation.navigate('CompanyDetails', { userId: item.id });
      } else if (item.redirect?.target_url) {
        const url = item.redirect.target_url;
        try {
          const pathname = new URL(url).pathname;
          const segments = pathname.split('/').filter(Boolean);
          const companyId = segments[segments.length - 1];
          if (companyId) {
            navigation.navigate('CompanyDetails', { userId: companyId });
          } else if (item.redirect?.backup_url) {
            handleRedirect(item.redirect.backup_url);
          }
        } catch (err) {
          console.warn('Invalid URL, fallback to backup_url', err);
          if (item.redirect?.backup_url) handleRedirect(item.redirect.backup_url);
        }
      } else if (item.redirect?.backup_url) {
        handleRedirect(item.redirect.backup_url);
      }
    },
    [navigation, handleRedirect]
  );

  const fetchBanners = useCallback(async () => {
    try {
      const response = await apiClient.post('/getBannerImages', {
        command: 'getBannerImages',
        banners_id: 'ban01',
      });
      if (response.data.status === 'success') {
        const bannerData = response.data.response;
        const mediaUrls = [];
        for (const banner of bannerData) {
          if (banner.files?.length > 0) {
            for (const file of banner.files) {
              try {
                const res = await apiClient.post('/getObjectSignedUrl', {
                  command: 'getObjectSignedUrl',
                  bucket_name: 'bme-app-admin-data',
                  key: file.fileKey,
                });
                if (res.data) {
                  const type = file.fileKey.endsWith('.mp4') ? 'video' : 'image';
                  mediaUrls.push({
                    url: res.data,
                    type,
                    redirect: file.redirect,
                    id: banner.company_id,
                  });
                }
              } catch (err) {
                console.log('Signed URL fetch error:', err);
              }
            }
          }
        }
        setBanners(mediaUrls);
      }
    } catch (err) {
      console.error('Banner fetch failed:', err);
    }
  }, []);

  useEffect(() => {
    fetchBanners();
  }, [fetchBanners]);

  const handlePlayPress = (index) => {
    // Fade out overlay
    Animated.timing(overlayOpacity, {
      toValue: 0,
      duration: 250,
      useNativeDriver: true,
    }).start();
    setPlayingIndex(index);
  };

  const handleVideoEnd = (index) => {
    if (playingIndex === index) {
      setPlayingIndex(null);

      setTimeout(() => {
        carouselRef.current?.next();
      }, 50);
    }
  };


  return (
    <View style={{ alignItems: 'center' }}>
      <Carousel
        ref={carouselRef}
        width={width}
        height={width * 0.5}
        data={banners}
        loop
        windowSize={3}
        // autoPlay={playingIndex === null && activeBannerId === bannerId}
        autoPlay={playingIndex === null}
        autoPlayInterval={3000}
        scrollAnimationDuration={1000}
        mode="parallax"
        modeConfig={{ parallaxScrollingScale: 0.95, parallaxScrollingOffset: 20 }}
        renderItem={({ item, index }) => (
          <TouchableOpacity
            activeOpacity={0.9}
            onPress={() => onPressBanner(item)}
            style={{
              flex: 1,
              borderRadius: 16,
              overflow: 'hidden',
              elevation: 3,
              backgroundColor: '#fff',
            }}
          >
            {item.type === 'video' ? (
              <View style={{ flex: 1, backgroundColor:'transparent' }}>
                <BMEVideoPlayer
                  ref={(ref) => (videoRefs.current[index] = ref)}
                  source={item.url}
                  paused={playingIndex !== index}
                  muted={false}
                  style={{ width: '100%', height: '100%' }}
                  resizeMode="cover"
                  repeat={false}
                  onEndReached={() => handleVideoEnd(index)}
                  onPlaybackStatus={(status) => {
                    switch (status.status) {
                      case "loading":
                      case "buffering":
                        setLoading(true);
                        break;
                      case "loaded":
                      case "playing":
                      case "ended":
                        setLoading(false);
                        break;
                      default:
                        break;
                    }
                  }}
                  
                  // poster={resolvedPoster}
                  // posterResizeMode="contain"
                />

                {/* Animated play overlay */}
                {playingIndex !== index && (
                  <Animated.View
                    style={{
                      position: 'absolute',
                      top: '50%',
                      left: '50%',
                      transform: [{ translateX: -30 }, { translateY: -30 }],
                      backgroundColor: 'rgba(0,0,0,0.5)',
                      borderRadius: 100,
                      padding: 10,
                      justifyContent: 'center',
                      alignItems: 'center',
                      opacity: overlayOpacity,
                    }}
                  >
                    <TouchableOpacity onPress={() => handlePlayPress(index)} activeOpacity={1}>
                      <Play
                        width={dimensions.icon.xl}
                        height={dimensions.icon.xl}
                        color={colors.background}
                      />
                    </TouchableOpacity>
                  </Animated.View>
                )}
              </View>
            ) : (
              <Image
                source={{ uri: item.url }}
                style={{ width: '100%', height: '100%' }}
                resizeMode="cover"
                onLoadStart={() => setLoading(true)}
                onLoadEnd={() => setLoading(false)}
              />
            )}

            {loading && (
              <ActivityIndicator
                size="small"
                color="#fff"
                style={{ position: 'absolute', top: '45%', left: '45%' }}
              />
            )}

          </TouchableOpacity>
        )}
      />
    </View>
  );
};

export default HomeBanner;
