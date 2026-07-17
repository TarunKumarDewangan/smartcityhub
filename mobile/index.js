import 'react-native-gesture-handler';
import { registerRootComponent } from 'expo';
import { LogBox } from 'react-native';
import ErrorDiagnostics from './src/utils/ErrorDiagnostics';

// Ignore harmless Expo development warnings/errors
LogBox.ignoreLogs([
  "Call to function 'ExpoKeepAwake.activate' has been rejected",
]);

// Register global JS error handling as early as possible
ErrorDiagnostics.setGlobalErrorHandler();

import App from './App';

// registerRootComponent calls AppRegistry.registerComponent('main', () => App);
// It also ensures that whether you load the app in Expo Go or in a native build,
// the environment is set up appropriately
registerRootComponent(App);
