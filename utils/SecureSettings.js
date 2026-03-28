import * as SecureStore from 'expo-secure-store';

// ─── Keys ─────────────────────────────────────────────────────────────────────
// Centralise all SecureStore keys here so there's no key mismatch between screens.
export const KEYS = {
    AUTO_DELETE: 'sv_auto_remove_originals',
    PIN_ENABLED: 'sv_pin_enabled',
    PIN_VALUE: 'sv_pin_value',
    BIOMETRIC: 'sv_biometric_enabled',
    STEALTH_MODE: 'sv_stealth_mode',
    CALC_CODE: 'sv_calc_code',
};

// ─── Auto-delete preference ───────────────────────────────────────────────────
export async function getAutoDelete() {
    try {
        const val = await SecureStore.getItemAsync(KEYS.AUTO_DELETE);
        return val === 'true';
    } catch {
        return false;
    }
}

export async function setAutoDelete(enabled) {
    await SecureStore.setItemAsync(KEYS.AUTO_DELETE, enabled ? 'true' : 'false');
}

// ─── PIN ──────────────────────────────────────────────────────────────────────
export async function getPinEnabled() {
    try {
        const val = await SecureStore.getItemAsync(KEYS.PIN_ENABLED);
        return val === 'true';
    } catch {
        return false;
    }
}

export async function getPin() {
    try {
        return await SecureStore.getItemAsync(KEYS.PIN_VALUE);
    } catch {
        return null;
    }
}

export async function setPin(pin) {
    await SecureStore.setItemAsync(KEYS.PIN_VALUE, pin);
    await SecureStore.setItemAsync(KEYS.PIN_ENABLED, 'true');
}

export async function clearPin() {
    await SecureStore.deleteItemAsync(KEYS.PIN_VALUE);
    await SecureStore.setItemAsync(KEYS.PIN_ENABLED, 'false');
}

// ─── Biometric ────────────────────────────────────────────────────────────────
export async function getBiometricEnabled() {
    try {
        const val = await SecureStore.getItemAsync(KEYS.BIOMETRIC);
        return val === 'true';
    } catch {
        return false;
    }
}

export async function setBiometricEnabled(enabled) {
    await SecureStore.setItemAsync(KEYS.BIOMETRIC, enabled ? 'true' : 'false');
}

// ─── Stealth Mode ─────────────────────────────────────────────────────────────
export async function getStealthMode() {
    try {
        const val = await SecureStore.getItemAsync(KEYS.STEALTH_MODE);
        return val || 'none'; // Default to 'none' if nothing is set
    } catch {
        return 'none';
    }
}

export async function setStealthMode(mode) {
    // mode can be 'none' | 'calculator' | 'decoy'
    await SecureStore.setItemAsync(KEYS.STEALTH_MODE, mode);
}

// ─── Calc Pin ─────────────────────────────────────────────────────────────
export async function getCalcCode() {
    try {
        return await SecureStore.getItemAsync(KEYS.CALC_CODE);
    } catch {
        return null;
    }
}

export async function setCalcCode(code) {
    await SecureStore.setItemAsync(KEYS.CALC_CODE, code);
}