// BottomSheetProvider.js
import React, { createContext, useContext, useRef, useState, useCallback } from 'react';
import BottomSheet from './BottomSheet';
import { Dimensions, Keyboard,LogBox } from 'react-native';

const screenHeight = Dimensions.get('window').height;

const {  } = require('react-native').Dimensions.get('window');
const MAX_TRANSLATE_Y = -screenHeight ;

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
    
    const openSheet = useCallback((content, point = MAX_TRANSLATE_Y) => {
        setSheetContent(content);
        setSnapPoint(point);
        setIsOpen(true);
        setTimeout(() => ref.current?.scrollTo(point), 50);
    }, []);

    const closeSheet = useCallback(() => {
      // 1. Immediately dismiss the input bar (if any)
      if (requestInputBarClose.current) {
        requestInputBarClose.current(); // Should blur the TextInput immediately
      }
    
      // 2. Dismiss keyboard right after that
      Keyboard.dismiss();
    
      // 3. Start closing the sheet without delay
      ref.current?.scrollTo(0);
    }, []);
    
      
      

    return (
       <BottomSheetContext.Provider value={{ openSheet, closeSheet, isOpen, setOnRequestInputBarClose }}>
            {children}
            {isOpen && (
                <BottomSheet ref={ref} onClose={() => {
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
