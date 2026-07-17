import { Alert, BackHandler } from 'react-native';

const setGlobalErrorHandler = () => {
  // Catch JS errors that aren't caught by React Error Boundary
  const defaultHandler = ErrorUtils.getGlobalHandler();
  
  ErrorUtils.setGlobalHandler((error, isFatal) => {
    if (isFatal) {
      Alert.alert(
        'Unexpected Error',
        `The app encountered a fatal error and needs to restart.\n\nError: ${error.message}`,
        [
          {
            text: 'Close App',
            onPress: () => BackHandler.exitApp(),
          },
        ],
        { cancelable: false }
      );
    } else {
      // Log non-fatal errors but don't crash
      console.warn('Non-fatal error caught:', error.message);
      if (defaultHandler) {
        defaultHandler(error, isFatal);
      }
    }
  });

  // Override promise rejection tracking in development to ignore harmless Expo errors
  if (__DEV__) {
    if (global.HermesInternal && global.HermesInternal.enablePromiseRejectionTracker) {
      try {
        global.HermesInternal.enablePromiseRejectionTracker({
          allRejections: true,
          onUnhandled: (id, error) => {
            const message = error instanceof Error ? error.message : String(error);
            if (message.includes("ExpoKeepAwake.activate") || message.includes("keep-awake")) {
              console.warn('[Ignored Hermes Rejection]', message);
              return;
            }
            console.error(error);
          },
          onHandled: (id) => {}
        });
      } catch (e) {
        console.warn('Could not initialize Hermes promise rejection tracking:', e.message);
      }
    } else {
      try {
        const rejectionTracking = require('promise/setimmediate/rejection-tracking');
        rejectionTracking.enable({
          allRejections: true,
          onUnhandled: (id, error) => {
            const message = error instanceof Error ? error.message : String(error);
            if (message.includes("ExpoKeepAwake.activate") || message.includes("keep-awake")) {
              console.warn('[Ignored Rejection]', message);
              return;
            }
            console.error(error);
          },
          onHandled: (id) => {}
        });
      } catch (e) {
        console.warn('Could not initialize custom promise rejection tracking:', e.message);
      }
    }
  }
};

export default {
  setGlobalErrorHandler,
};
