import * as React from 'react'
import { StyleSheet, Platform, TouchableOpacity, Text, ActivityIndicator } from 'react-native'
import { Appbar, useTheme } from 'react-native-paper'
import { smartGoBack } from '../../navigation/smartGoBack'
import MaterialIcons from '@react-native-vector-icons/material-icons'

const HEADER_HEIGHT = 44 // MD3 default small

export const AppHeader = ({
  title,
  onShare,
  onEdit,
  editLabel = 'Edit',
  onLogout,

  // POST CONTROL PROPS 👇
  onPost,
  postLabel = 'Post',
  postLoading = false,
  postDisabled = false,

  backgroundColor = '#F7F8FA',
  elevated = true,
  centerTitle = true,
}) => {

  return (
    <Appbar.Header
      // mode={centerTitle ? 'center-aligned' : 'small'}
      elevated={elevated}
      style={[
        styles.header,
        {
          backgroundColor,
          height: HEADER_HEIGHT,
        },
      ]}
    >
      
      {/* LEFT */}
      <Appbar.BackAction
        onPress={smartGoBack}
        color="#075cab"
        size={22}
      />

      {/* CENTER */}
      {title && (
        <Appbar.Content
          title={title}
          titleStyle={styles.title}
          color="#075cab"
        />
      )}

      {/* RIGHT */}
      {onShare && (
        <Appbar.Action
          icon="share-outline"
          onPress={onShare}
          color="#075cab"
          size={22}
        />
      )}

      {onEdit && (
        // <Appbar.Action
        //   icon="pencil"
        //   onPress={onEdit}
        //   color="#FFF"
        //   size={22}
        // />

        <TouchableOpacity
          onPress={onEdit}
          style={styles.postButton}

        >
          {/* <Appbar.Action
          icon="plus-box"
          color="#FFF"
          size={20}
          style={styles.postIcon}
        /> */}
          <MaterialIcons name="edit" size={18} color="#075cab" style={{ marginRight: 4 }} />
          <Text style={styles.postText}>{editLabel}</Text>


        </TouchableOpacity>
      )}

      {onLogout && (
        <Appbar.Action
          icon="logout"
          onPress={onLogout}
          color="#075cab"
          size={22}
        />
      )}

      {onPost && (
        <TouchableOpacity
          onPress={onPost}
          activeOpacity={0.7}
          disabled={postDisabled || postLoading}

          style={[
            styles.postButton,
            (postDisabled || postLoading) && styles.postButtonDisabled,
          ]}

        >
          {/* <Appbar.Action
            icon="plus-box"
            color="#FFF"
            size={20}
            style={styles.postIcon}
          /> */}
          {postLoading ? (
            <ActivityIndicator size="small" color="#075cab" />
          ) : (
            <Text style={styles.postText}>{postLabel}</Text>
          )}

        </TouchableOpacity>
      )}
    </Appbar.Header>
  )
}

const styles = StyleSheet.create({
  header: {
    paddingHorizontal: 4,
    // justifyContent: 'center',
  },
  title: {
    color: '#075CAB',
    fontSize: 18,
    fontWeight: Platform.OS === 'ios' ? '600' : '500',
    letterSpacing: 0.2,
  },
  postButton: {
    minWidth: 64,
    height: 32,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 6,
    flexDirection: 'row'
  },
  postButtonDisabled: {
    opacity: 0.5,
  },
  postText: {
    color: '#075cab',
    fontSize: 15,
    fontWeight: '600',
  },


})
