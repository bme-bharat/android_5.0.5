import { StyleSheet } from "react-native";
import { colors } from "../../assets/theme";
import { ScaledSheet } from 'react-native-size-matters';

export const settingStyles = ScaledSheet.create({

  profileContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 18,
    paddingHorizontal: 16,
    backgroundColor: '#fff',
    borderBottomLeftRadius: 18,
    borderBottomRightRadius: 18,
    elevation: 1,              // Android
    shadowColor: '#000',       // iOS
    shadowOpacity: 0.05,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    
  },

  editProfileButton: {
    alignSelf: 'flex-end',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 99,
    padding: 99,

  },
  editProfileText: {
    color: '#075cab',
    fontSize: 15,
    fontWeight: '600',
    paddingHorizontal: 4,
  },
  profileDetails: {
    flex: 1,
    // justifyContent: 'center',
    alignItems: 'flex-start'
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
    borderRadius: 80,
    overflow: 'hidden',

  },
  avatarContainer: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 100,
  },
  avatarText: {
    fontSize: 50,
    fontWeight: 'bold',
  },
  avatarTextMini: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  label: {
    flex: 1,
    color: 'black',
    fontWeight: '500',
    fontSize: 15,
    textAlign: 'left',
    alignSelf: 'flex-start',
  },

  title1: {
    flex: 1,
    justifyContent: 'space-between',
    flexDirection: 'row',  // Align label and detail in a row
    alignItems: 'center',  // Center the items vertically
    borderRadius: 10,

    paddingVertical: 3,
  },
  colon: {
    width: 40, // Fixed width for the colon
    textAlign: 'center', // Center the colon
    color: '#808080',
    fontWeight: '500',
    fontSize: 15,
    alignSelf: 'flex-start',
  },
  fName: {
    fontSize: 18,
    fontWeight: '500',
    color: colors.text_primary,
    marginLeft: 10
  },
  value: {
    flexShrink: 1,
    fontSize: 14,
    marginLeft: 10,
    color: colors.text_secondary,
  },
  drawerItem: {
    flexDirection: 'row',
    fontSize: 15,
    alignItems: 'center',
    borderRadius: 5,
    paddingVertical: 5,

  },


  version: {
    fontSize: 16,
    color: '#075cab',
    fontWeight: '500',
  },
  drawerLabel: {
    fontSize: 16,
    color: colors.text_primary,
    fontWeight: "400",
    marginLeft: 10,
  },

  subItemsContainer: {
    paddingVertical: 5,
    marginHorizontal: 10,
    // borderRadius: 5,
    borderBottomRightRadius: 5,
    borderBottomLeftRadius: 5,
  },

  appversion: {
    justifyContent: 'center',
    alignItems: 'center',
marginVertical:10
  },
  appText: {
    fontSize: 13,
    color: 'gray',
    // marginBottom: 5,
  },

  subItem: {
    padding: 5,
    fontSize: 15,
    fontWeight: "500",
    color: colors.text_secondary,
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