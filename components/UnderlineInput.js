import { useState } from 'react';
import { StyleSheet, Text, TextInput, View } from 'react-native';
import { Brand, Colors, Spacing } from '../constants/theme';

const theme = Colors.dark;

const UnderlineInput = ({
    label,
    value,
    onChangeText,
    placeholder,
    autoFocus = true,
    maxLength = 25
}) => {
    const [isFocused, setIsFocused] = useState(false);

    return (
        <View style={styles.container}>
            {label && <Text style={[styles.label, { color: isFocused ? Brand.primary : theme.textSecondary }]}>
                {label}
            </Text>}

            <TextInput
                style={styles.input}
                value={value}
                onChangeText={onChangeText}
                placeholder={placeholder}
                placeholderTextColor={theme.textSecondary + '60'}
                autoFocus={autoFocus}
                maxLength={maxLength}
                onFocus={() => setIsFocused(true)}
                onBlur={() => setIsFocused(false)}
                selectionColor={Brand.primary} // The cursor color
                cursorColor={Brand.primary}    // Explicit cursor for Android
            />

            {/* This is the actual Samsung-style line */}
            <View
                style={[
                    styles.underline,
                    {
                        backgroundColor: isFocused ? Brand.primary : theme.textSecondary + '40',
                        height: isFocused ? 2 : 1 // Gets thicker when focused
                    }
                ]}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        width: '100%',
        marginVertical: Spacing.sm,
        paddingHorizontal: 4,
    },
    label: {
        fontSize: 12,
        marginBottom: 8,
        fontWeight: '600',
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    input: {
        color: '#fff',
        fontSize: 18, // Slightly larger for that premium feel
        paddingVertical: 10,
        includeFontPadding: false, // Removes extra Android padding
    },
    underline: {
        width: '100%',
        borderRadius: 1, // Softens the edges of the line
    },
});

export default UnderlineInput;