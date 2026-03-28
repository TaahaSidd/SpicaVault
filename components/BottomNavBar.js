import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Brand, Colors, FontSize, FontWeight } from '../constants/theme';

const theme = Colors.dark;

const TABS = [
    { name: 'Vault', icon: 'shield', iconOutline: 'shield-outline', screen: 'Vault' },
    { name: 'Favourites', icon: 'heart', iconOutline: 'heart-outline', screen: 'Favourites' },
    { name: 'Albums', icon: 'folder', iconOutline: 'folder-outline', screen: 'Albums' },
    { name: 'Settings', icon: 'settings', iconOutline: 'settings-outline', screen: 'Settings' },
];

export default function BottomNavBar({ active, onNavigate }) {
    const insets = useSafeAreaInsets();

    return (
        <View style={[styles.container, { backgroundColor: theme.surface, paddingBottom: insets.bottom || 12 }]}>
            {TABS.map((tab) => {
                const isActive = active === tab.name;
                return (
                    <TouchableOpacity
                        key={tab.name}
                        style={styles.tab}
                        onPress={() => onNavigate(tab.screen)}
                        activeOpacity={0.7}
                    >
                        <Ionicons
                            name={isActive ? tab.icon : tab.iconOutline}
                            size={22}
                            color={isActive ? Brand.primary : theme.textSecondary}
                        />
                        <Text style={[styles.label, { color: isActive ? Brand.primary : theme.textSecondary }]}>
                            {tab.name}
                        </Text>
                    </TouchableOpacity>
                );
            })}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        borderTopWidth: 0.5,
        borderTopColor: Colors.dark.border,
        paddingTop: 10,
        borderRadius: 30,
    },
    tab: {
        flex: 1,
        alignItems: 'center',
        gap: 4,
    },
    label: {
        fontSize: FontSize.xs,
        fontWeight: FontWeight.medium,
    },
});