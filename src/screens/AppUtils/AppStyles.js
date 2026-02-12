import { Dimensions, Platform, StyleSheet } from 'react-native';
import { colors } from '../../assets/theme';
import { initialWindowMetrics } from 'react-native-safe-area-context';

const { width } = Dimensions.get("window");

const CARD_WIDTH = width * 0.6; // 70% of screen width

export default AppStyle = StyleSheet.create({

  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },

  removedText: {
    fontSize: 16,
    color: '#9E9E9E',
    textAlign: 'center',
    lineHeight: 22,
  },
  menuContainer: {
    padding: 10
  },
  bottom: {
    height: 60,
    backgroundColor: "#075cab",
    justifyContent: "center",
    alignItems: "center",
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
  },
  buttonContainer: {
    backgroundColor: '#075cab',
    paddingVertical: 5,
    borderRadius: 6,
    alignItems: 'center',
    paddingHorizontal: 15,
  },


  Postbtn: {
    alignSelf: 'center',
    width: 90,
    paddingVertical: 5,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    borderColor: '#075cab',
    borderWidth: 1,
    marginVertical: 20,
  },

  PostbtnSkip: {
    alignSelf: 'center',
    width: 60,
    paddingVertical: 5,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    borderColor: '#075cab',
    borderWidth: 1,
    marginVertical: 5,
    marginHorizontal: 10,
    backgroundColor: '#ffffff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 2,
  },

  PostbtnText: {
    color: '#075cab',
    fontWeight: '500',
    fontSize: 15,
  },

  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.background,
    borderBottomWidth: 1,
    borderColor: '#f0f0f0',

  },
  headerContainerForum: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'white',
  },
  circle: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 2,
    borderRadius: 4,

  },
  shareText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',

  },
  backButton: {
    padding: 10,
    alignSelf: 'center',
    borderRadius: 10,
  },
  dotsContainer: {
    marginTop: 12,
    gap: 8,
    position: 'absolute',
    bottom: 20, // move higher or lower as needed
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },

  dot: {
    width: 6,
    height: 6,
    borderRadius: 4,
    backgroundColor: '#888',
  },

  activeDot: {
    backgroundColor: '#000',
  },

  cardImage1: {
    width: 100,
    height: 100,
    borderRadius: 50,
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
    marginBottom: 20,
    marginTop: 10,
  },

  cardImage: {
    width: '100%',
    height: '100%',
  },

  searchRow: {
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 12,
    overflow: 'hidden',
    borderRadius: 4,
    gap: 8,
  },
  searchInput: {
    // fontSize: 16,
    flex: 1,
    height: 36,
    includeFontPadding: false,
  },
  searchBar: {
    flex: 1,
    borderColor: '#075cab',
    borderRadius: 4,
    overflow: 'hidden',
    borderWidth: 1,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 8
  },
  searchIcon: {
    marginRight: 8,
    color: "#666",
  },


  toolbar: {
    position: "absolute",
    top: 0,
    width: "100%",
    zIndex: 50,
    backgroundColor: '#FFF'
    // elevation: 2,
    // shadowColor: '#000',
    // shadowOffset: { width: 0, height: 2 },
    // shadowOpacity: 0.2,

  },

  topHeader: {
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
  },

});




export const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
  },

  playIcon: {
    position: 'absolute',
    width: 40,
    height: 40,
    top: '50%',
    left: '50%',
    transform: [
      { translateX: -20 }, // half of width
      { translateY: -20 }, // half of height
    ],
  },

  paragraph: {
    padding: 16,
    fontSize: 15,
    textAlign: 'center',
  },
  // --- Original Styles ---
  card5: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 10,
    marginHorizontal: 4,
    borderWidth: 0.5,
    borderColor: '#ddd',
  },

  eduCard: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    // marginHorizontal: 6,
    marginBottom: 5,
    // borderRadius: 8,
    overflow: 'hidden',
    borderWidth: 0.5,
    borderColor: '#ddd',
    height: 110,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },

  },

  eduCardLeft: {
    width: 110,
    height: 110,
    backgroundColor: '#f9f9f9',
    borderRightWidth: 0.5,
    borderColor: '#eee',
    padding: 5,
  },

  eduImage: {
    width: '100%',
    height: '100%',
    borderRadius: 8,
    resizeMode: 'contain',
    alignSelf: 'center'
  },

  eduCardRight: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 12,
    justifyContent: 'center',
    minWidth: 0,              // ✅ allows flex children to shrink instead of overflowing

  },

  eduTitle: {

    fontWeight: '600',

    marginBottom: 5

  },

  eduSubText: {



  },


  label: {
    fontWeight: '600',
    color: colors.text_primary,
  },

  jobMetaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
  },

  cardTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 4,
    flexShrink: 1,
  },

  rowText: {
    marginLeft: 6,
    flexShrink: 1,
    minWidth: 0,
  },


  flatListContainer: {
    paddingBottom: '20%',
  },

  columnWrapper: {
    justifyContent: 'space-between',
    marginBottom: 5,
  },


  notificationContainer: {
    padding: 8,
    marginRight: 10
  },

  notificationBadge: {
    position: 'absolute',
    backgroundColor: 'firebrick',
    borderRadius: 14,
    top: 0,
    right: 0,
    width: 18,
    height: 18,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1,
  },

  notificationText: {
    fontSize: 12,
    color: '#fff',
    paddingHorizontal: 1,
  },

  profileContainer: {

    width: 36,
    height: 36,
    borderRadius: 80,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },


  detailImage: {
    width: '100%',
    height: '100%',
    borderRadius: 80,
  },


  articleCard: {
    padding: 6,
    backgroundColor: '#fff',
    borderRadius: 8,
    borderWidth: 0.5,
    borderColor: '#ddd',
    marginBottom: 5,


  },
  articleCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 12,
    marginBottom: 6
  },
  authorRow: {
    flexDirection: 'row',

  },
  authorSection: {
    alignItems: 'center',
    flexShrink: 1,
    maxWidth: 100,
  },
  badge: {
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  badgeText: {
    fontSize: 13,
    fontWeight: '300',
    color: colors.text_secondary,

  },
  authorImage: {
    width: 50,
    height: 50,
    borderRadius: 30,
    marginRight: 12,
    marginTop: 5
  },

  authorName: {
    fontSize: 15,
    fontWeight: '500',
    textAlign: 'center',
    alignSelf: 'flex-start',
    maxWidth: 150,
  },
  articleMedia: {
    width: 70,
    height: 70,
    borderRadius: 8,
    marginLeft: 8,
    flexShrink: 0,   // 🔒 never shrink
    overflow: 'hidden'
  },

  articleTime: {
    fontSize: 11,
    fontWeight: "300",
    color: colors.text_secondary,
    marginTop: 2
  },


  cardImage1: {
    width: 140,
    height: 140,
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
  },

  cardImage: {
    width: '100%',
    height: '100%',
  },

  appHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#ffffff',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderColor: '#ddd'
  },
  header: {
    width: "100%",
    overflow: "hidden",
    marginBottom: 5,
  },
  headerImage: {
    width: "100%",
    height: '100%',
    borderBottomLeftRadius: 18,
    borderBottomRightRadius: 18

  },

  toolbar: {
    position: "absolute",
    top: 0,
    width: "100%",
    zIndex: 50,
    justifyContent: "flex-start",
  },

  // Top header row (above the search bar)
  topHeader: {
    width: "100%",
    flexDirection: "row",
    alignItems: "center",

  },

  // center user info (username + category)
  userInfo: {
    flex: 1,
    paddingHorizontal: 8,
  },
  userName: {
    fontSize: 18,
    fontWeight: "600",
    color: "#111",
  },
  userCategory: {
    fontSize: 12,
    color: "#666",
    marginTop: 2,
  },

  // Search row (below the top header)
  searchRow: {
    width: "100%",
    paddingBottom: 10,
  },
  searchBar: {
    backgroundColor: "#f2f2f2",
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 2,
    marginTop: 4,
  },
  searchInput: {
    fontSize: 16,
  },

  card: {
    height: 120,
    backgroundColor: "#eee",
    borderRadius: 16,
    marginBottom: 16,
  },

  postCard: {
    width: CARD_WIDTH,
    marginRight: 16,
    backgroundColor: "#fff",
    borderRadius: 18,
    padding: 14,
    borderWidth: 0.5,
    borderColor: '#ddd',
    // shadowColor: "#000",
    // shadowOpacity: 0.08,
    // shadowRadius: 8,
    // shadowOffset: { width: 0, height: 3 },
    // elevation: 4,
  },

  // Header
  postHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },



  postAuthor: {
    fontSize: 15,
    color: "#111",
    fontWeight: "600",
  },

  postCategory: {
    fontSize: 12,
    color: "#777",
    marginTop: 1,
  },

  postTime: {
    fontSize: 11,
    color: "#999",
    marginTop: 2,
  },

  // Post Image
  postImage: {
    width: "100%",
    height: 150,
    borderRadius: 14,
    marginVertical: 12,
    backgroundColor: "#f1f1f1",
    overflow: 'hidden'
  },

});

export const commonStyles = StyleSheet.create({
  title: {
    flexDirection: 'row',
    fontSize: 16,
    fontWeight: '600',
    color: colors.text_primary,
    marginBottom: 5,
    alignSelf: 'center'
  },

  labValContainer: {
    flex: 1,
    justifyContent: 'space-between',
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    borderRadius: 8,
    padding: 10,
    marginVertical: 5,
  },
  valContainer: {
    flex: 1,
    justifyContent: 'space-between',
    flexDirection: 'row',
    alignItems: 'center',

    marginVertical: 5,
    marginHorizontal: 10
  },
  label: {
    flex: 1,
    color: colors.text_primary,
    textAlign: 'left',
    alignSelf: 'flex-start',

  },

  colon: {
    width: 15,
    alignSelf: 'flex-start'
  },
  value: {
    flex: 2, // Take the remaining space
    flexShrink: 1,
    color: colors.text_secondary,
    textAlign: 'left', // Align text to the left
    alignSelf: 'flex-start',
    letterSpacing: 0.2
  },

})