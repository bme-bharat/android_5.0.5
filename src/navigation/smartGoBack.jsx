import { BackHandler } from 'react-native';
import { navigationRef } from "../../App";

export function smartGoBack() {
  if (!navigationRef.isReady()) return false;

  // Normal back flow
  if (navigationRef.canGoBack()) {
    navigationRef.goBack();
    return true;
  }

  BackHandler.exitApp();
  return true;
}
