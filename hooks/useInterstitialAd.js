// hooks/useInterstitialAd.js
import { useEffect, useRef, useState } from 'react';
import {
    AdEventType,
    InterstitialAd,
} from 'react-native-google-mobile-ads';
import { AD_IDS } from '../constants/ads';

/**
 * useInterstitialAd — loads and shows interstitial ads
 *
 * Usage:
 * const { showAd } = useInterstitialAd();
 * // after import completes:
 * await showAd();
 */
export function useInterstitialAd() {
    const interstitial = useRef(
        InterstitialAd.createForAdRequest(AD_IDS.interstitial, {
            requestNonPersonalizedAdsOnly: true,
        })
    ).current;

    const [loaded, setLoaded] = useState(false);

    useEffect(() => {
        const unsubscribeLoaded = interstitial.addAdEventListener(
            AdEventType.LOADED,
            () => setLoaded(true)
        );
        const unsubscribeClosed = interstitial.addAdEventListener(
            AdEventType.CLOSED,
            () => {
                setLoaded(false);
                // Preload next ad
                interstitial.load();
            }
        );
        const unsubscribeError = interstitial.addAdEventListener(
            AdEventType.ERROR,
            (error) => {
                console.log('Interstitial error:', error);
                setLoaded(false);
            }
        );

        // Load first ad
        interstitial.load();

        return () => {
            unsubscribeLoaded();
            unsubscribeClosed();
            unsubscribeError();
        };
    }, []);

    const showAd = async () => {
        if (loaded) {
            await interstitial.show();
        }
    };

    return { showAd, isLoaded: loaded };
}