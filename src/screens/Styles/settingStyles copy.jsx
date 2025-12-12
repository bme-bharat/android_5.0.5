import { StyleSheet } from "react-native";
import { colors } from "../../assets/theme";

export const settingStyles = StyleSheet.create({

  bottomNavContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingVertical: 12,
    paddingBottom: 15,
    backgroundColor: '#ffffff',
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    zIndex: 100,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,

  },

  profileContainer: {
    width: '100%',
    backgroundColor: 'white',
    alignSelf: 'center',
    borderBottomLeftRadius: 12,
    borderBottomRightRadius: 12,
    padding: 16,
    marginBottom: 5,
    elevation: 3,
  },
  
  editProfileButton: {
    position: 'absolute',
    right: 10,
    top: 10,
    backgroundColor: colors.primary,
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 8,
    zIndex: 10,
  },
  
  editProfileText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '600',
  },
  
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',

  },
  
  leftImageWrapper: {
    width: 80,
    height: 80,
    borderRadius: 10,
    overflow: 'hidden',
    marginRight: 16,
  },
  
  profileDetails: {
    flex: 1,
    alignItems: 'flex-start',
    // marginLeft: 30,
    marginTop: 10

  },

  navItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },

  navText: {
    fontSize: 12,
    color: 'black',
    marginTop: 2,
  },

  imageContainer: {
    width: 140,
    height: 140,
    borderRadius: 80,
    marginBottom: 10,
  },
  detailImage: {
    width: '100%',
    height: '100%',
    borderRadius: 10,
  },
  
  avatarFallback: {
    width: 80,
    height: 80,
    backgroundColor: '#ddd',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 10,
  },
  
  avatarText: {
    fontSize: 32,
    fontWeight: '700',
    color: '#222',
  },
  rightInfo: {
    flex: 1,
    justifyContent: 'flex-start',
  },
  
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  
  colon: {
    marginHorizontal: 6,
    fontSize: 15,
    color: '#333',
  },
  
  value: {
    flex: 1,
    fontSize: 15,
    color: '#222',
    fontWeight: '500',
  },
  
  drawerItem: {
    marginTop: 5,
    flexDirection: 'row',
    fontSize: 15,
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 5,
    paddingHorizontal: 5,
    paddingVertical: 5,
    marginHorizontal: 5,
    shadowColor: '#ffffff',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
  },
  container: {
    flexGrow: 1,

  },


  version: {
    fontSize: 16,
    color: '#075cab',
    fontWeight: '500',
  },
  drawerLabel: {
    marginLeft: 12,
    fontSize: 16,
    color: "#075cab",
    fontWeight: "500",
    marginVertical: 8,
  },

  subItemsContainer: {
    paddingVertical: 4,
    marginHorizontal: 5,
    backgroundColor: 'white',
    // borderRadius: 5,
    borderBottomRightRadius: 5,
    borderBottomLeftRadius: 5,
  },

  appversion: {
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 50

  },
  appText: {
    fontSize: 13,
    color: 'gray',
    // marginBottom: 5,
    fontWeight: '400',
    textAlign: 'justify',
    alignItems: 'center',

  },


  subItem: {
    padding: 5,
    marginHorizontal: 30,
    marginVertical: 1,
    fontSize: 15,
    fontWeight: "500",
    color: "black",

  },

  container1: {
    flex: 1,
  },

  dropdownIcon: {
    marginLeft: 'auto',
    color: '#075cab',
  },
  collapsedProfile: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 60,
    backgroundColor: '#ffffff',
    zIndex: 10,
    elevation: 6,
    paddingHorizontal: 16,
    borderBottomWidth: 0.5,
    borderBottomColor: '#dcdcdc',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    justifyContent: 'center',
  },

  miniProfileContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  miniLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  miniImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 10,
    borderWidth: 1.2,
    borderColor: '#7baee9',
    backgroundColor: '#e6f0ff',
  },

  miniName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1e2a38',
    marginLeft: 10

  },
  avatarContainerMini: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 20,
  },
  avatarTextMini: {
    fontSize: 18,
    fontWeight: 'bold',
  },

});