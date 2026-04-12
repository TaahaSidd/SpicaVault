/**
 * SearchBar.js
 *
 * Reusable search input with clear button.
 *
 * Usage:
 *   import SearchBar from '../components/SearchBar';
 *   <SearchBar value={search} onChangeText={setSearch} placeholder="Search…" />
 *
 * Props:
 *   value         — string
 *   onChangeText  — (text: string) => void
 *   placeholder   — string (default: 'Search…')
 *   style         — optional container style override
 *   autoFocus     — boolean (default: false)
 */

import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, TextInput, TouchableOpacity, View } from 'react-native';
import { Colors, FontSize, Spacing } from '../constants/theme';

const theme = Colors.dark;

export default function SearchBar({
    value,
    onChangeText,
    placeholder = 'Search…',
    style,
    autoFocus = false,
}) {
    return (
        <View style={[styles.wrap, style]}>
            <Ionicons name="search-outline" size={16} color={theme.textSecondary} />
            <TextInput
                style={styles.input}
                value={value}
                onChangeText={onChangeText}
                placeholder={placeholder}
                placeholderTextColor={theme.textSecondary}
                returnKeyType="search"
                autoFocus={autoFocus}
                autoCorrect={false}
                autoCapitalize="none"
            />
            {value.length > 0 && (
                <TouchableOpacity onPress={() => onChangeText('')} activeOpacity={0.7} hitSlop={8}>
                    <Ionicons name="close-circle" size={16} color={theme.textSecondary} />
                </TouchableOpacity>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    wrap: {
        flexDirection: 'row', alignItems: 'center',
        backgroundColor: Colors.dark.elevated,
        borderRadius: 12,
        paddingHorizontal: Spacing.md,
        paddingVertical: 10,
        gap: Spacing.sm,
    },
    input: {
        flex: 1, color: '#fff',
        fontSize: FontSize.sm, padding: 0,
    },
});