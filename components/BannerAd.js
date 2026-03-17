// components/BannerAd.js
import { StyleSheet, View } from 'react-native';
import { BannerAd, BannerAdSize } from 'react-native-google-mobile-ads';
import { AD_IDS } from '../constants/ads';
import { Colors } from '../constants/theme';

/**
 * VaultBannerAd — drop this anywhere you want a banner
 *
 * Usage:
 * <VaultBannerAd />
 */
export default function VaultBannerAd() {
    return (
        <View style={styles.container}>
            <BannerAd
                unitId={AD_IDS.banner}
                size={BannerAdSize.ANCHORED_ADAPTIVE_BANNER}
                requestOptions={{ requestNonPersonalizedAdsOnly: true }}
                onAdFailedToLoad={(error) => console.log('Banner error:', error)}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        backgroundColor: Colors.dark.surface,
        alignItems: 'center',
    },
});