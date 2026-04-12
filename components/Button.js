import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useRef } from 'react';
import {
    ActivityIndicator,
    Animated,
    Easing,
    StyleSheet,
    TouchableOpacity,
    TouchableWithoutFeedback,
    View
} from 'react-native';
import { Brand, Colors, FontSize, FontWeight, Radius, Spacing } from '../constants/theme';

const theme = Colors.dark;

const Button = ({
    title,
    onPress,
    variant = 'primary', // primary, secondary, outline, ghost, danger, text
    size = 'medium',    // small, medium, large
    icon,
    iconPosition = 'left',
    loading = false,
    disabled = false,
    fullWidth = false,
    holdToTrigger = false,
    holdDuration = 2000,
    style,
    textStyle
}) => {
    const animatedValue = useRef(new Animated.Value(0)).current;

    const handlePressIn = () => {
        if (!holdToTrigger || disabled || loading) return;

        Animated.timing(animatedValue, {
            toValue: 1,
            duration: holdDuration,
            easing: Easing.linear,
            useNativeDriver: false,
        }).start(({ finished }) => {
            if (finished) {
                Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
                onPress?.();
                setTimeout(() => animatedValue.setValue(0), 200);
            }
        });
    };

    const handlePressOut = () => {
        if (!holdToTrigger) return;
        Animated.timing(animatedValue, {
            toValue: 0,
            duration: 300,
            easing: Easing.out(Easing.quad),
            useNativeDriver: false,
        }).start();
    };

    // --- INTERPOLATIONS ---
    const progressWidth = animatedValue.interpolate({
        inputRange: [0, 1],
        outputRange: ['0%', '100%'],
    });

    const dynamicTextColor = animatedValue.interpolate({
        inputRange: [0, 0.45, 0.46, 1],
        outputRange: [
            variant === 'danger' ? '#EF4444' : (styles[`${variant}Text`]?.color || '#fff'),
            variant === 'danger' ? '#EF4444' : (styles[`${variant}Text`]?.color || '#fff'),
            '#fff',
            '#fff'
        ],
    });

    const renderIcon = () => {
        if (!icon) return null;

        let iconColor = theme.text;
        if (['outline', 'ghost', 'text'].includes(variant)) iconColor = Brand.primary;
        if (variant === 'danger') iconColor = '#EF4444';
        if (disabled) iconColor = theme.textSecondary;

        const iconSize = size === 'small' ? 16 : size === 'large' ? 22 : 18;

        return (
            <Ionicons
                name={icon}
                size={iconSize}
                color={iconColor}
                style={iconPosition === 'left' ? styles.iconLeft : styles.iconRight}
            />
        );
    };

    const BaseButton = holdToTrigger ? TouchableWithoutFeedback : TouchableOpacity;

    return (
        <BaseButton
            onPress={!holdToTrigger ? onPress : undefined}
            onPressIn={handlePressIn}
            onPressOut={handlePressOut}
            disabled={disabled || loading}
            activeOpacity={variant === 'text' ? 0.6 : 0.8}
        >
            <View style={[
                styles.button,
                styles[variant],
                variant !== 'text' && styles[size],
                fullWidth && styles.fullWidth,
                disabled && styles.disabled,
                style,
                { overflow: 'hidden' }
            ]}>

                {/* PROGRESS FILL LAYER (For Long Press Actions) */}
                {holdToTrigger && (
                    <Animated.View style={[
                        styles.progressFill,
                        {
                            width: progressWidth,
                            backgroundColor: variant === 'danger' ? '#EF4444' : Brand.primary
                        }
                    ]} />
                )}

                {loading ? (
                    <ActivityIndicator
                        color={variant === 'primary' ? '#000' : Brand.primary}
                        size="small"
                    />
                ) : (
                    <View style={styles.content}>
                        {iconPosition === 'left' && renderIcon()}

                        <Animated.Text style={[
                            styles.title,
                            styles[`${size}Text`],
                            styles[`${variant}Text`],
                            holdToTrigger && { color: dynamicTextColor },
                            disabled && styles.disabledText,
                            textStyle,
                        ]}>
                            {title}
                        </Animated.Text>

                        {iconPosition === 'right' && renderIcon()}
                    </View>
                )}
            </View>
        </BaseButton>
    );
};

const styles = StyleSheet.create({
    button: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: Radius.full,
        position: 'relative',
    },
    content: {
        flexDirection: 'row',
        alignItems: 'center',
        zIndex: 2,
    },
    progressFill: {
        position: 'absolute',
        left: 0,
        top: 0,
        bottom: 0,
        zIndex: 1,
        opacity: 0.3, // Subtle progress bar
    },
    // Variants
    primary: { backgroundColor: Brand.primary },
    secondary: { backgroundColor: theme.overlay },
    outline: { backgroundColor: 'transparent', borderWidth: 1.5, borderColor: Brand.primary },
    ghost: { backgroundColor: 'transparent' },
    danger: {
        backgroundColor: '#EF4444', // Solid Red
        borderWidth: 0,             // Remove border
    },
    text: { backgroundColor: 'transparent', paddingHorizontal: 0, paddingVertical: 4 },

    // Sizes
    small: { paddingVertical: Spacing.sm, paddingHorizontal: Spacing.md },
    medium: { paddingVertical: Spacing.md, paddingHorizontal: Spacing.xl },
    large: { paddingVertical: Spacing.lg, paddingHorizontal: Spacing.xxl },

    disabled: { backgroundColor: theme.border, borderColor: theme.border },
    fullWidth: { width: '100%' },

    // Text Styles
    title: { fontWeight: FontWeight.bold, letterSpacing: -0.2 },
    primaryText: { color: '#000' },
    secondaryText: { color: theme.text },
    outlineText: { color: Brand.primary },
    ghostText: { color: Brand.primary },
    dangerText: {
        color: '#FFFFFF'
    },
    textText: { color: Brand.primary },
    disabledText: { color: theme.textSecondary },

    smallText: { fontSize: FontSize.xs },
    mediumText: { fontSize: FontSize.md },
    largeText: { fontSize: FontSize.lg },

    iconLeft: { marginRight: Spacing.sm },
    iconRight: { marginLeft: Spacing.sm },
});

export default Button;