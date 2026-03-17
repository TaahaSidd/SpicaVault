const IS_DEV = __DEV__;

// Test IDs for development — real IDs for production
export const AD_IDS = {
    banner: IS_DEV
        ? 'ca-app-pub-3940256099942544/6300978111'      // Google test banner
        : 'ca-app-pub-3776614889739454/5808307240',     // Real banner

    interstitial: IS_DEV
        ? 'ca-app-pub-3940256099942544/1033173712'      // Google test interstitial
        : 'ca-app-pub-3776614889739454/7345949305',     // Real interstitial
};

export const APP_ID = 'ca-app-pub-3776614889739454~6224439329';