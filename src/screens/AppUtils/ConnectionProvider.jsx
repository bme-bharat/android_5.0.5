import React, { createContext, useState, useEffect, useContext } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import NetInfo from '@react-native-community/netinfo';

const ConnectionContext = createContext({
  isConnected: true,
});

export const ConnectionProvider = ({ children }) => {
  const [isConnected, setIsConnected] = useState(true);
  const [showBanner, setShowBanner] = useState(false);

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener((state) => {
      const connected = Boolean(state.isConnected);
      setIsConnected(connected);

      if (!connected) {
        setShowBanner(true);
      } else {
        setTimeout(() => setShowBanner(false), 2000);
      }
    });

    return () => unsubscribe();
  }, []);

  return (
    <ConnectionContext.Provider value={{ isConnected }}>
    
      {showBanner && (
        <View
          style={[
            styles.banner,
            { backgroundColor: isConnected ? '#4CD964' : '#FF3B30' },
          ]}
        >
          <Text style={styles.bannerText}>
            {isConnected ? 'Back Online' : 'No Internet Connection'}
          </Text>
        </View>
      )}
      {children}
    </ConnectionContext.Provider>
  );
};

export const useConnection = () => useContext(ConnectionContext);

const styles = StyleSheet.create({
  banner: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 999,
  },
  bannerText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});
