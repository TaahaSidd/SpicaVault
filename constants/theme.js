// ─── Brand ────────────────────────────────────────────────────────────────────
export const Brand = {
  primary: '#F59E0B',
  primaryDim: '#B45309',
  primarySoft: '#FEF3C7',
  danger: '#EF4444',
  success: '#22C55E',
  accent: '#6366F1',
};

// ─── Dark Palette ─────────────────────────────────────────────────────────────
const dark = {
  background: '#0A0A0F',
  surface: '#13131A',
  elevated: '#1E1E2E',
  overlay: '#2A2A3E',
  text: '#F0F0F5',
  textSecondary: '#9BA1B4',
  textDisabled: '#4A4A5E',
  border: '#2A2A3E',
  borderSubtle: '#1E1E2E',
  icon: '#9BA1B4',
  iconActive: '#F59E0B',
  tabIconDefault: '#4A4A5E',
  tabIconSelected: '#F59E0B',
  tabBar: '#13131A',
  statusBar: 'light',
};

// ─── Light Palette ────────────────────────────────────────────────────────────
const light = {
  background: '#F8F8FC',
  surface: '#FFFFFF',
  elevated: '#FFFFFF',
  overlay: '#E8E8F0',
  text: '#11111A',
  textSecondary: '#5A5A7A',
  textDisabled: '#AFAFC0',
  border: '#E0E0EE',
  borderSubtle: '#F0F0F8',
  icon: '#5A5A7A',
  iconActive: '#F59E0B',
  tabIconDefault: '#AFAFC0',
  tabIconSelected: '#F59E0B',
  tabBar: '#FFFFFF',
  statusBar: 'dark',
};

export const Colors = { dark, light };

// ─── Typography — Android only ────────────────────────────────────────────────
export const Fonts = {
  sans: 'Roboto',
  mono: 'monospace',
};

// ─── Type Scale ───────────────────────────────────────────────────────────────
export const FontSize = {
  xs: 11,
  sm: 13,
  md: 15,
  lg: 17,
  xl: 20,
  xxl: 24,
  display: 32,
};

export const FontWeight = {
  regular: '400',
  medium: '500',
  semibold: '600',
  bold: '700',
};

// ─── Spacing ──────────────────────────────────────────────────────────────────
export const Spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
  xxxl: 48,
};

// ─── Radius ───────────────────────────────────────────────────────────────────
export const Radius = {
  sm: 6,
  md: 10,
  lg: 16,
  xl: 24,
  full: 999,
};

// ─── Shadows — Android uses elevation only ────────────────────────────────────
export const Shadow = {
  sm: { elevation: 2 },
  md: { elevation: 5 },
  lg: { elevation: 10 },
};