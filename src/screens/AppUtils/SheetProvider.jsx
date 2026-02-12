// BottomSheetProvider.js
import React, { createContext, useContext, useRef, useState, useCallback, useEffect } from 'react';
import BottomSheet from './BottomSheet';
import { BackHandler, Dimensions, Keyboard, LogBox } from 'react-native';

const screenHeight = Dimensions.get('window').height;
const OPEN_HEIGHT = screenHeight * 0.8;

const BottomSheetContext = createContext({
  openSheet: (content) => {},
  closeSheet: () => {},
  isOpen: false,
});

LogBox.ignoreLogs([
  'Sending `onAnimatedValueUpdate` with no listeners registered',
]);

export const BottomSheetProvider = ({ children }) => {
  const ref = useRef(null);
  const [sheetContent, setSheetContent] = useState(null);
  const [isOpen, setIsOpen] = useState(false);
  const requestInputBarClose = useRef(null);

  const setOnRequestInputBarClose = useCallback((fn) => {
    requestInputBarClose.current = fn;
  }, []);

  useEffect(() => {
    const backHandler = BackHandler.addEventListener(
      'hardwareBackPress',
      () => {
        if (isOpen) {
          ref.current?.scrollTo(OPEN_HEIGHT); // ✅ CLOSE
          return true;
        }
        return false;
      }
    );

    return () => backHandler.remove();
  }, [isOpen]);

  const openSheet = useCallback((content) => {
    setSheetContent(content);
    setIsOpen(true);
    setTimeout(() => ref.current?.scrollTo(0), 50); // ✅ OPEN
  }, []);

  const closeSheet = useCallback(() => {
    if (requestInputBarClose.current) {
      requestInputBarClose.current();
    }
    Keyboard.dismiss();
    ref.current?.scrollTo(OPEN_HEIGHT); // ✅ CLOSE
  }, []);

  return (
    <BottomSheetContext.Provider
      value={{ openSheet, closeSheet, isOpen, setOnRequestInputBarClose }}
    >
      {children}

      {isOpen && (
        <BottomSheet
          ref={ref}
          onClose={() => {
            setIsOpen(false);
            setSheetContent(null);
          }}
        >
          {sheetContent}
        </BottomSheet>
      )}
    </BottomSheetContext.Provider>
  );
};

export const useBottomSheet = () => useContext(BottomSheetContext);
