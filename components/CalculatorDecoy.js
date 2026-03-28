import { useState } from 'react';
import { Dimensions, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Colors, FontSize, FontWeight, Spacing } from '../constants/theme';

const theme = Colors.dark;
const { width } = Dimensions.get('window');
const BUTTON_SIZE = (width - (Spacing.lg * 2) - (Spacing.md * 3)) / 4;

export default function CalculatorDecoy({ onUnlock, secretCode = "5+5", isSetupMode = false }) {
    const [display, setDisplay] = useState('0');
    const [equation, setEquation] = useState('');

    const handleTap = (type, value) => {
        if (type === 'number') {
            setDisplay(display === '0' ? value : display + value);
        }
        if (type === 'operator') {
            setEquation(display + value);
            setDisplay('0');
        }
        if (type === 'clear') {
            setDisplay('0');
            setEquation('');
        }
        if (type === 'equal') {
            const currentFullEquation = equation + display;

            // 1. SETUP LOGIC: If we are setting a code, return the string to the parent
            if (isSetupMode) {
                if (currentFullEquation === '0') return; // Don't allow empty code
                onUnlock(currentFullEquation);
                return;
            }

            // 2. UNLOCK LOGIC: Compare against the saved secretCode
            if (currentFullEquation === secretCode) {
                onUnlock();
                return;
            }

            // 3. NORMAL MATH: Perform calculation for the "decoy" effect
            try {
                const result = Function(`'use strict'; return (${currentFullEquation})`)();
                setDisplay(String(result));
                setEquation('');
            } catch (e) {
                setDisplay('Error');
            }
        }
    };

    const Button = ({ label, type, color = theme.elevated, textColor = '#fff' }) => (
        <TouchableOpacity
            style={[styles.button, { backgroundColor: color }]}
            onPress={() => handleTap(type, label)}
        >
            <Text style={[styles.buttonText, { color: textColor }]}>{label}</Text>
        </TouchableOpacity>
    );

    return (
        <View style={styles.container}>
            <View style={styles.displayContainer}>
                <Text style={styles.equationText}>{equation}</Text>
                <Text style={styles.displayText} numberOfLines={1}>{display}</Text>
            </View>

            <View style={styles.grid}>
                <View style={styles.row}>
                    <Button label="C" type="clear" color={theme.overlay} />
                    <Button label="+/-" type="posneg" color={theme.overlay} />
                    <Button label="%" type="operator" color={theme.overlay} />
                    <Button label="/" type="operator" color="#F59E0B" />
                </View>
                <View style={styles.row}>
                    <Button label="7" type="number" />
                    <Button label="8" type="number" />
                    <Button label="9" type="number" />
                    <Button label="*" type="operator" color="#F59E0B" />
                </View>
                <View style={styles.row}>
                    <Button label="4" type="number" />
                    <Button label="5" type="number" />
                    <Button label="6" type="number" />
                    <Button label="-" type="operator" color="#F59E0B" />
                </View>
                <View style={styles.row}>
                    <Button label="1" type="number" />
                    <Button label="2" type="number" />
                    <Button label="3" type="number" />
                    <Button label="+" type="operator" color="#F59E0B" />
                </View>
                <View style={styles.row}>
                    <TouchableOpacity
                        style={[styles.button, styles.zeroButton]}
                        onPress={() => handleTap('number', '0')}
                    >
                        <Text style={styles.buttonText}>0</Text>
                    </TouchableOpacity>
                    <Button label="." type="number" />
                    <Button label="=" type="equal" color="#F59E0B" />
                </View>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: theme.background, justifyContent: 'flex-end', paddingBottom: Spacing.xxl },
    displayContainer: { paddingHorizontal: Spacing.xl, alignItems: 'flex-end', marginBottom: Spacing.lg },
    equationText: { color: theme.textSecondary, fontSize: FontSize.lg, marginBottom: Spacing.xs },
    displayText: { color: '#fff', fontSize: 64, fontWeight: FontWeight.light },
    grid: { paddingHorizontal: Spacing.lg, gap: Spacing.md },
    row: { flexDirection: 'row', justifyContent: 'space-between', gap: Spacing.md },
    button: { width: BUTTON_SIZE, height: BUTTON_SIZE, borderRadius: BUTTON_SIZE / 2, alignItems: 'center', justifyContent: 'center' },
    zeroButton: { width: (BUTTON_SIZE * 2) + Spacing.md, alignItems: 'flex-start', paddingLeft: BUTTON_SIZE / 2.5, backgroundColor: theme.elevated },
    buttonText: { fontSize: 28, fontWeight: FontWeight.medium }
});