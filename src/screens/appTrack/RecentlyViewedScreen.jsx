import React, { useEffect, useState, useRef, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Image,
  StyleSheet,
  ScrollView,
  Animated,
  Dimensions,
  useWindowDimensions,
  Button,
  TextInput,
  BackHandler,

} from 'react-native';
import { getRecentItems } from './RecentViews';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import LinearGradient from 'react-native-linear-gradient';
import { colors } from '../../assets/theme';
import RBSheet from "react-native-raw-bottom-sheet";
import { Linking } from "react-native";
import { TrueSheet } from "@lodev09/react-native-true-sheet"
import FastImage from '@d11/react-native-fast-image';
import IMAGES from '../../navigation/images';

const { width } = Dimensions.get('window');
const FOLDER_WIDTH = width * 0.4;
const FOLDER_HEIGHT = width * 0.25;
const FOLDER_GAP = 10;
const SNAP_INTERVAL = FOLDER_WIDTH + FOLDER_GAP;


const RecentlyViewedScreen = () => {
  const navigation = useNavigation();

  const [recentItems, setRecentItems] = useState([]);
  const [openFolder, setOpenFolder] = useState(null);

  const scaleAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  const refRBSheet = useRef(null);
    const [sheetOpen, setSheetOpen] = useState(false);

  const [selectedContact, setSelectedContact] = useState(null);

  useFocusEffect(
    useCallback(() => {
      fetchRecent();
    }, [])
  );

    useEffect(() => {
        const subscription = BackHandler.addEventListener(
            'hardwareBackPress',
            () => {
                if (sheetOpen && refRBSheet.current) {
                  refRBSheet.current.dismiss(); // dismiss sheet instead of exiting
                    return true; // prevent default back action
                }
                return false; // allow default back action
            }
        );
    
        return () => subscription.remove(); // cleanup correctly
    }, [sheetOpen]);

  const fetchRecent = async () => {
    const items = await getRecentItems();
    setRecentItems(items || []);
  };

  /* ---------------- helpers ---------------- */

  const getId = (data) =>
    data.post_id || data.product_id || data.contact_id || data.service_id || data.id;

  const getTitle = (item) => {
    const d = item.data;
    switch (item.type) {
      case 'job':
        return d.job_title;
      case 'product':
        return d.title;
      case 'contact':
        return d.target_user_name;
      case 'service':
        return d.title;
      default:
        return 'Untitled';
    }
  };

  const getImage = (item) => {
    const d = item.data;
    if (d.image) return d.image;

    if (Array.isArray(d.media)) {
      const img = d.media.find(m => m.type === 'image');
      return img?.url || null;
    }
    return null;
  };

  const openItem = (item) => {
    const d = item.data;

    switch (item.type) {
      case 'job':
        navigation.navigate('JobDetail', { post_id: d.post_id, post: d });
        break;
      case 'product':
        navigation.navigate('ProductDetails', { product_id: d.product_id });
        break;
      case 'contact':
        setSelectedContact(d);
        setTimeout(() => {
          refRBSheet.current?.present();
        }, 0);
        break;

      case 'service':
        navigation.navigate('ServiceDetails', { service_id: d.service_id });
        break;
    }
  };

  /* ---------------- animation ---------------- */

  const openFolderView = (key) => {
    setOpenFolder(key);
    scaleAnim.setValue(0.9);
    fadeAnim.setValue(0);

    Animated.parallel([
      Animated.spring(scaleAnim, {
        toValue: 1,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const closeFolderView = () => {
    Animated.timing(fadeAnim, {
      toValue: 0,
      duration: 150,
      useNativeDriver: true,
    }).start(() => {
      setOpenFolder(null);
    });
  };

  const folderImages = {
    job: IMAGES.RECENT_JOBS,
    product: IMAGES.RECENT_PRODUCTS,
    contact: IMAGES.RECENT_CONTACTS,
    service: IMAGES.RECENT_SERVICES,
  };

  const folderColors = {
    job:     'rgba(255, 165,   0, 0.25)',
    product: 'rgba(135, 206, 250, 0.25)',
    contact: 'rgba(255, 182, 193, 0.25)',
    service: 'rgba(144, 238, 144, 0.25)',
  };
  

  const renderFolderPreview = (folderKey, folderTitle) => {
    const bgImage = folderImages[folderKey];
    const bgColor = folderColors[folderKey] || '#f0f0f0';

    return (
      <View style={styles.previewWrapper}>
        {/* colorful background */}
        <View style={[styles.folderBackground, { backgroundColor: bgColor }]} />

        {/* small corner image */}
        {bgImage && (
          <FastImage
            source={bgImage}
            style={styles.folderCornerImage}
            resizeMode={FastImage.resizeMode.contain}
          />
        )}

        {/* bottom title */}
        <View
          colors={['transparent', 'rgba(255,255,255,0.9)']}
          style={styles.folderGradient}
        >
          <Text style={styles.folderOverlayTitle}>{folderTitle}</Text>
        </View>
      </View>
    );
  };





  /* ---------------- render item ---------------- */

  const renderItem = ({ item }) => {
    const image = getImage(item);
    const title = getTitle(item);

    return (
      <TouchableOpacity style={styles.item} onPress={() => openItem(item)} activeOpacity={1}>
        {image ? (
          <Image source={{ uri: image }} style={styles.itemImage} />
        ) : (
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {title?.[0]?.toUpperCase()}
            </Text>
          </View>
        )}
        <Text numberOfLines={1} style={styles.itemTitle}>
          {title}
        </Text>
      </TouchableOpacity>
    );
  };

  /* ---------------- data ---------------- */

  const folders = [
    // { key: 'job', title: 'Jobs', data: recentItems.filter(i => i.type === 'job') },
    { key: 'product', title: 'Products', data: recentItems.filter(i => i.type === 'product') },
    { key: 'contact', title: 'Contacts', data: recentItems.filter(i => i.type === 'contact') },
    { key: 'service', title: 'Services', data: recentItems.filter(i => i.type === 'service') },
  ].filter(folder => folder.data.length > 0); // ✅ hide empty folders

  /* ---------------- UI ---------------- */

  const renderOpenFolder = () => {
    if (!openFolder) return null;

    const folder = folders.find(f => f.key === openFolder);

    return (
      <Animated.View
        style={[
          styles.openContainer,
          {
            opacity: fadeAnim,
            transform: [{ scale: scaleAnim }],
          },
        ]}
      >
        <TouchableOpacity onPress={closeFolderView} style={styles.backBtn}>
          <Text style={styles.backWrapper}>
            <Text style={styles.backIcon}>‹</Text>
            <Text style={styles.backText}> Back</Text>
          </Text>
        </TouchableOpacity>

        <FlatList
          data={folder.data}
          keyExtractor={(item) =>
            `${item.type}-${getId(item.data)}`
          }
          renderItem={renderItem}
          numColumns={3}
          contentContainerStyle={{ paddingHorizontal: 12 }}
        />
      </Animated.View>
    );
  };


  return (
    <>

      {openFolder ? (
        renderOpenFolder()
      ) : folders?.length > 0 ? (
        <View style={{ marginVertical: 5,paddingHorizontal: 8, }}>
          <Text style={styles.sectionTitle}>Recently viewed</Text>

          <FlatList
            data={folders}
            keyExtractor={(folder) => folder.key}
            horizontal
            // numColumns={2}
            // columnWrapperStyle={{ justifyContent: 'space-between',  marginBottom: 5, paddingHorizontal:5 }}
            showsHorizontalScrollIndicator={false}
            // decelerationRate="fast"
            // snapToInterval={SNAP_INTERVAL}
            // snapToAlignment="start"
            contentContainerStyle={styles.folderRow}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.folder}
                onPress={() => openFolderView(item.key)}
                disabled={!item.data.length}
                activeOpacity={1}
              >
                {renderFolderPreview(item.key, item.title)}
              </TouchableOpacity>
            )}
          />

        </View>
      ) : null}

      <TrueSheet
        ref={refRBSheet}
        detents={['auto']}
        style={{ alignItems: 'center', paddingVertical: 40 }}
        onDidPresent={() => setSheetOpen(true)}
        onDidDismiss={() => setSheetOpen(false)}
      >

        {selectedContact && (
          <>
            {/* IMAGE */}
            {/* {selectedContact.image ? (
              <Image
                source={{ uri: selectedContact.image }}
                style={styles.sheetImage}
              />
            ) : (
              <View style={styles.sheetAvatar}>
                <Text style={styles.avatarText}>
                  {selectedContact.target_user_name?.[0]?.toUpperCase()}
                </Text>
              </View>
            )} */}

            {/* NAME */}
            <Text style={styles.sheetTitle}>
              {selectedContact.target_user_name}
            </Text>

            {/* PHONE */}
            {selectedContact.target_user_phone_number && (
              <TouchableOpacity
                onPress={() =>
                  Linking.openURL(`tel:${selectedContact.target_user_phone_number}`)
                }
                style={styles.sheetButton}
              >
                <Text style={styles.sheetButtonText}>
                  {selectedContact.target_user_phone_number}
                </Text>
              </TouchableOpacity>
            )}

            {/* {selectedContact.successMessage && (
              <Text style={styles.sheetMessage}>
                {selectedContact.successMessage}
              </Text>
            )} */}
          </>
        )}

      </TrueSheet>

    </>

  );
};

export default RecentlyViewedScreen;

const styles = StyleSheet.create({
  sectionTitle: {
    fontSize: 16,
    fontWeight: '400',
    paddingVertical: 8,
    color: '#333',
  },

  folderRow: {
    // paddingHorizontal: 10,
    // backgroundColor:'green',

  },

  folder: {
    borderRadius: 16,
    marginRight: FOLDER_GAP,
  },


  previewWrapper: {
    width: '100%',
    position: 'relative',
    width: FOLDER_WIDTH,
    height: FOLDER_HEIGHT,
    borderWidth: 1,
    borderColor: '#f0f0f0',
    borderRadius: 16,
    overflow: 'hidden',
    marginVertical:10
  },

  folderGradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 100,
    justifyContent: 'flex-end',
    paddingHorizontal: 12,
    paddingBottom: 8,
    // borderBottomLeftRadius: 16,
    // borderBottomRightRadius: 16,

  },

  folderBackground: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#f9f9f9', // light simple background
    borderRadius: 12,
  },

  folderCornerImage: {
    position: 'absolute',
    top: 10,
    right: 10,
    width: 50,   // small image
    height: 50,
    borderRadius: 8,
  },

  folderOverlayTitle: {
    color: colors.text_primary,
    fontSize: 16,
    fontWeight: '400',
  },

  previewGrid: {
    width: '100%',
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginVertical: 10,
    paddingHorizontal: 16,
  },

  previewItem: {
    width: '48%',   // 👈 forces 2 per row
    aspectRatio: 1,
    marginBottom: 8,
  },

  previewImage: {
    width: '100%',
    height: '100%',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#f0f0f0'
  },


  previewAvatar: {
    width: '100%',
    height: '100%',
    borderRadius: 8,
    backgroundColor: 'rgba(255, 255, 255, 1)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#f0f0f0'
  },

  previewAvatarText: {
    color: '#075cab',
    fontWeight: '700',
    fontSize: 20,
  },


  /* open folder */

  openContainer: {
    flex: 1,
    marginVertical: 5,
    backgroundColor: '#F7F8FA'
  },

  backBtn: {
    paddingHorizontal: 16,
    paddingVertical: 8,

  },

  backWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center'
  },

  backIcon: {
    fontSize: 28,     // 🔥 bigger chevron
    lineHeight: 28,
    marginRight: 2,
    color: '#333',
  },

  backText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
  },
  openTitle: {
    fontSize: 22,
    fontWeight: '700',
    margin: 16,
  },

  /* items */

  item: {
    width: (width - 48) / 3,
    alignItems: 'center',
    marginBottom: 16,
  },

  itemImage: {
    width: 80,
    height: 80,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#f0f0f0',
    resizeMode:'contain'
  },

  avatar: {
    width: 80,
    height: 80,
    borderRadius: 10,
    backgroundColor: '#075cab',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#f0f0f0'
  },

  avatarText: {
    color: '#fff',
    fontSize: 22,
    fontWeight: 'bold',
  },

  itemTitle: {
    fontSize: 12,
    marginTop: 6,
    textAlign: 'center',
  },
  sheetImage: {
    width: 96,
    height: 96,
    borderRadius: 48,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#eee',
  },

  sheetAvatar: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: '#075cab',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },

  sheetTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: '#222',
    marginBottom: 14,
    textAlign: 'center',
  },

  sheetButton: {
    width: '85%',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: '#F7F8FA',
    alignItems: 'center',
    marginBottom: 12,
  },

  sheetButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#075cab',
  },

  sheetMessage: {
    fontSize: 13,
    color: '#666',
    textAlign: 'center',
    lineHeight: 18,
    paddingHorizontal: 10,
  },



});
