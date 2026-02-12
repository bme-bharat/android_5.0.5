import { useState, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  Pressable,
  StyleSheet,
  Dimensions,
} from 'react-native';

import useForumReactions, { reactionConfig } from './useForumReactions';

import { useNetwork } from '../AppUtils/IdProvider';
const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
export function useReactionPickerModal() {
  const { myId } = useNetwork();
  const { handleReactionUpdate } = useForumReactions(myId);

  const [visible, setVisible] = useState(false);
  const [forumId, setForumId] = useState(null);
  const [userReaction, setUserReaction] = useState('None');
  const [anchorPos, setAnchorPos] = useState({ x: 0, y: 0 });
  const [onOptimisticUpdate, setOnOptimisticUpdate] = useState(null);
  const PICKER_WIDTH = 260;
  const PICKER_HEIGHT = 70;

  const safeLeft = Math.min(
    Math.max(anchorPos.x - PICKER_WIDTH / 2, 12),
    SCREEN_WIDTH - PICKER_WIDTH 
  );

  const safeTop = Math.min(
    Math.max(anchorPos.y - PICKER_HEIGHT - 12, 12),
    SCREEN_HEIGHT - PICKER_HEIGHT 
  );

  const open = useCallback(
    (fid, currentReaction = 'None', pressEvent, optimisticCb) => {
      const { pageX, pageY } = pressEvent?.nativeEvent || {};

      setForumId(fid);
      setUserReaction(currentReaction || 'None');

      if (typeof optimisticCb === 'function') {
        setOnOptimisticUpdate(() => optimisticCb);
      }

      if (pageX && pageY) {
        setAnchorPos({ x: pageX, y: pageY });
      }

      setVisible(true);
    },
    []
  );


  const close = useCallback(() => {
    setVisible(false);
    setForumId(null);
  }, []);

  const selectReaction = useCallback(
    (type, item) => {
      const selectedType = userReaction === type ? 'None' : type;
  
      // ✅ OPTIMISTIC: UPDATE LIST UI IMMEDIATELY
      if (onOptimisticUpdate) {
        onOptimisticUpdate(selectedType);
      }
  
      // modal local
      setUserReaction(selectedType);
  
      // ✅ CLOSE IMMEDIATELY (NO LAG)
      close();
  
      // 🔥 Fire & forget network
      handleReactionUpdate(forumId, selectedType, item)
        .catch((e) => {
          console.error('Reaction update failed', e);
          // (optional) rollback here if needed
        });
    },
    [forumId, userReaction, handleReactionUpdate, close, onOptimisticUpdate]
  );
  


  const ReactionModal = useCallback(
    ({ item }) => {
      if (!visible) return null;

      return (
        <Modal
          visible={visible}
          transparent
          animationType="none"
          onRequestClose={close}
        >
          {/* Backdrop */}
          <Pressable style={styles.overlay} onPress={close} />

          {/* Picker */}
          <View
            style={[
              styles.reactionContainer,
              {
                left: safeLeft,
                top: safeTop,
                width: PICKER_WIDTH,
                height: PICKER_HEIGHT,
                justifyContent: 'center',
              },
            ]}
          >


            {reactionConfig.map(({ type, emoji }) => {
              const isSelected = userReaction === type;

              return (
                <TouchableOpacity
                  key={type}
                  onPress={() => selectReaction(type, item)}
                  style={[
                    styles.reactionButton,
                    isSelected && styles.selectedReaction,
                  ]}
                >
                  <Text style={{ fontSize: 22 }}>{emoji}</Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </Modal>
      );
    },
    [visible, userReaction, selectReaction, close, anchorPos]

  );

  return {
    openReactionPicker: open,
    closeReactionPicker: close,
    ReactionModal,
  };
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.2)',
  },
  reactionContainer: {
    position: 'absolute',
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 30,
    paddingVertical: 10,
    paddingHorizontal: 14,

    // 🔒 HARD CONSTRAINTS (prevents stretch bug)
    maxWidth: 320,
    minHeight: 56,

    elevation: 8,
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
  },

  reactionButton: {
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  selectedReaction: {
    transform: [{ scale: 1.2 }],
  },
});
