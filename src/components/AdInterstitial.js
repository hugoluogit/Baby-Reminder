import { useEffect, useRef } from 'react';

let InterstitialAd = null;
let AdEventType = null;
let TestIds = null;
let nativeModuleAvailable = false;

try {
  const Ads = require('react-native-google-mobile-ads');
  InterstitialAd = Ads.InterstitialAd;
  AdEventType = Ads.AdEventType;
  TestIds = Ads.TestIds;
  nativeModuleAvailable = true;
} catch (e) {
  // Native module not available (Expo Go)
}

export default function AdInterstitial() {
  const loadedRef = useRef(false);

  useEffect(() => {
    if (!nativeModuleAvailable) return;

    const interstitial = InterstitialAd.createForAdRequest(TestIds.INTERSTITIAL, {
      requestNonPersonalizedAdsOnly: true,
    });

    const unsubscribeLoaded = interstitial.addAdEventListener(AdEventType.LOADED, () => {
      loadedRef.current = true;
      interstitial.show();
    });

    const unsubscribeClosed = interstitial.addAdEventListener(AdEventType.CLOSED, () => {
      loadedRef.current = false;
    });

    interstitial.load();

    return () => {
      unsubscribeLoaded();
      unsubscribeClosed();
    };
  }, []);

  return null;
}
