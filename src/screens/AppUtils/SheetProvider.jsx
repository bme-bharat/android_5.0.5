// BottomSheetProvider.js
import React, { createContext, useContext, useRef, useState, useCallback, useEffect } from 'react';
import BottomSheet from './BottomSheet';
import { BackHandler, Dimensions, Keyboard,LogBox } from 'react-native';

const screenHeight = Dimensions.get('window').height;

const {  } = require('react-native').Dimensions.get('window');
const MAX_TRANSLATE_Y = -screenHeight *0.80 ;

const BottomSheetContext = createContext({
    openSheet: (content, snapPoint) => {},
    closeSheet: () => {},
    isOpen: false,
});

LogBox.ignoreLogs([
  'Sending `onAnimatedValueUpdate` with no listeners registered',
]);

export const BottomSheetProvider = ({ children }) => {
  const ref = useRef(null);
  const [sheetContent, setSheetContent] = useState(null);
  const [snapPoint, setSnapPoint] = useState(MAX_TRANSLATE_Y);
  const [isOpen, setIsOpen] = useState(false);
  const requestInputBarClose = useRef(null);

  const setOnRequestInputBarClose = useCallback((fn) => {
    requestInputBarClose.current = fn;
  }, []);

  // ⬇⬇ ADD THIS ⬇⬇
  useEffect(() => {
    const backHandler = BackHandler.addEventListener(
      "hardwareBackPress",
      () => {
        if (isOpen) {
          ref.current?.scrollTo(0);   // close the sheet
          return true;                // BLOCK back navigation
        }
        return false;                 // allow normal back
      }
    );
  
    return () => backHandler.remove();
  }, [isOpen]);
  
  // ⬆⬆ END ADDITION ⬆⬆

  const openSheet = useCallback((content, point = MAX_TRANSLATE_Y) => {
      setSheetContent(content);
      setSnapPoint(point);
      setIsOpen(true);
      setTimeout(() => ref.current?.scrollTo(point), 50);
  }, []);

  const closeSheet = useCallback(() => {
    if (requestInputBarClose.current) {
      requestInputBarClose.current();
    }
    Keyboard.dismiss();
    ref.current?.scrollTo(0);
  }, []);

  return (
     <BottomSheetContext.Provider value={{ openSheet, closeSheet, isOpen, setOnRequestInputBarClose }}>
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
