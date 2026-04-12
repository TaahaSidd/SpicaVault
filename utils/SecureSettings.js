import * as SecureStore from 'expo-secure-store';

// ─── Keys ─────────────────────────────────────────────────────────────────────
export const KEYS = {
    AUTO_DELETE: 'sv_auto_remove_originals',
    PIN_ENABLED: 'sv_pin_enabled',
    PIN_VALUE: 'sv_pin_value',
    BIOMETRIC: 'sv_biometric_enabled',
    STEALTH_MODE: 'sv_stealth_mode',
    CALC_CODE: 'sv_calc_code',
    DECOY_PIN: 'sv_decoy_pin',       // ✅ new
};

// ─── Auto-delete ──────────────────────────────────────────────────────────────
export async function getAutoDelete() {
    try { return (await SecureStore.getItemAsync(KEYS.AUTO_DELETE)) === 'true'; }
    catch { return false; }
}
export async function setAutoDelete(enabled) {
    await SecureStore.setItemAsync(KEYS.AUTO_DELETE, enabled ? 'true' : 'false');
}

// ─── PIN ──────────────────────────────────────────────────────────────────────
export async function getPinEnabled() {
    try { return (await SecureStore.getItemAsync(KEYS.PIN_ENABLED)) === 'true'; }
    catch { return false; }
}
export async function getPin() {
    try { return await SecureStore.getItemAsync(KEYS.PIN_VALUE); }
    catch { return null; }
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
    try { return (await SecureStore.getItemAsync(KEYS.BIOMETRIC)) === 'true'; }
    catch { return false; }
}
export async function setBiometricEnabled(enabled) {
    await SecureStore.setItemAsync(KEYS.BIOMETRIC, enabled ? 'true' : 'false');
}

// ─── Stealth Mode ─────────────────────────────────────────────────────────────
export async function getStealthMode() {
    try { return (await SecureStore.getItemAsync(KEYS.STEALTH_MODE)) || 'none'; }
    catch { return 'none'; }
}
export async function setStealthMode(mode) {
    await SecureStore.setItemAsync(KEYS.STEALTH_MODE, mode);
}

// ─── Calculator Code ──────────────────────────────────────────────────────────
export async function getCalcCode() {
    try { return await SecureStore.getItemAsync(KEYS.CALC_CODE); }
    catch { return null; }
}
export async function setCalcCode(code) {
    await SecureStore.setItemAsync(KEYS.CALC_CODE, code);
}

// ─── Decoy PIN ────────────────────────────────────────────────────────────────
export async function getDecoyPin() {
    try { return await SecureStore.getItemAsync(KEYS.DECOY_PIN); }
    catch { return null; }
}
export async function setDecoyPin(pin) {
    await SecureStore.setItemAsync(KEYS.DECOY_PIN, pin);
}
export async function clearDecoyPin() {
    await SecureStore.deleteItemAsync(KEYS.DECOY_PIN);
}