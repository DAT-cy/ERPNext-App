import React from 'react';
// OTA Updates disabled - expo-updates import kept for potential future use
// eslint-disable-next-line @typescript-eslint/no-var-requires, @typescript-eslint/no-unused-vars
const Updates: any = require('expo-updates');

type ForceUpdateGateProps = {
  children: React.ReactNode;
};

/**
 * ForceUpdateGate Component
 * 
 * DISABLED: OTA Updates have been disabled to minimize device data collection.
 * This component now acts as a simple wrapper with no device ID collection.
 * 
 * Note: expo-updates SDK may still be bundled but will not actively collect
 * device identifiers when ENABLED is set to false in AndroidManifest.
 * 
 * Privacy Compliance: This change helps minimize Device ID collection as per
 * Google Play Data Safety requirements.
 */
export default function ForceUpdateGate({ children }: ForceUpdateGateProps) {
  // OTA Updates disabled to minimize Device ID collection
  // If you need OTA updates, enable in AndroidManifest and uncomment the code below
  // Make sure to declare Device ID collection in Google Play Data Safety form
  
  /* 
  useEffect(() => {
    let isMounted = true;

    const checkForUpdates = async () => {
      // Skip update checks in development to avoid noise
      if (__DEV__) return;
 
      // Check if updates are enabled in manifest
      if (Updates.isEnabled === false) return;

      try {
        const updateResult = await Updates.checkForUpdateAsync();
        if (!isMounted) return;

        if (updateResult.isAvailable) {
          Alert.alert(
            'Có bản cập nhật mới',
            'Đã có phiên bản mới. Bạn có muốn cập nhật ngay không?',
            [
              {
                text: 'Để sau',
                style: 'cancel',
              },
              {
                text: 'Cập nhật',
                onPress: async () => {
                  try {
                    const fetched = await Updates.fetchUpdateAsync();
                    if (fetched.isNew) {
                      await Updates.reloadAsync();
                    }
                  } catch {
                    // Swallow errors to avoid blocking the app
                  }
                },
              },
            ]
          );
        }
      } catch {
        // Ignore update check errors
      }
    };

    checkForUpdates();

    return () => {
      isMounted = false;
    };
  }, []);
  */

  return <>{children}</>;
}


