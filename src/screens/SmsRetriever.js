import { NativeModules, NativeEventEmitter } from 'react-native';
import { useEffect, useRef, useState } from 'react';

const { SmsRetrieverModule } = NativeModules;

export const useOtpRetriever = (onOtpReceived) => {
  const [isListening, setIsListening] = useState(false);
  const listenerRef = useRef(null);

  useEffect(() => {
    if (!SmsRetrieverModule) {
      console.warn('[SmsRetrieverJS] SmsRetrieverModule undefined');
      return;
    }

    const emitter = new NativeEventEmitter(SmsRetrieverModule);

    listenerRef.current = emitter.addListener('onSmsReceived', (event) => {
      console.log('[SmsRetrieverJS] OTP received:', event);
      setIsListening(false); // stop loader
      onOtpReceived(event.otp);
    });

    // Start SMS Retriever
    setIsListening(true);
    SmsRetrieverModule.startSmsListener()
      .then(() => console.log('[SmsRetrieverJS] SmsRetriever started'))
      .catch((err) => {
        console.error('[SmsRetrieverJS] Start failed', err);
        setIsListening(false);
      });

    return () => {
      listenerRef.current?.remove();
      setIsListening(false);
    };
  }, []);

  return { isListening };
};
