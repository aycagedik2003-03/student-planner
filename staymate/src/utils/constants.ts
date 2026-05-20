export const COLORS = {
  // Design system brand
  primary:   '#1FBFCC', // Teal
  secondary: '#8E5CD9', // Violet
  accent:    '#D93B8B', // Magenta

  // Legacy brand (used by existing screens)
  brand:    '#00BCD4',
  brandBg:  '#E0F7FA',
  brandTx:  '#00838F',

  // Neutrals
  white:     '#FFFFFF',
  black:     '#000000',
  ink:       '#1F2937',
  soft:      '#4B5563',
  muted:     '#9CA3AF',
  gray:      '#999999',
  lightGray: '#F5F5F5',
  bg:        '#FFFFFF',
  bgSoft:    '#F9FAFB',
  line:      'rgba(31,41,55,0.08)',

  // States
  success: '#4CAF50',
  error:   '#E5484D',
  warning: '#FFC107',
  info:    '#2196F3',
};

export const SPACING = {
  xs:   4,
  sm:   8,
  md:   12,
  lg:   16,
  xl:   24,
  xxl:  32,
  xxxl: 48,
};

export const RADII = {
  sm:   6,
  md:   10,
  lg:   14,
  xl:   18,
  xxl:  24,
  pill: 999,
};

export const SHADOW = {
  card: {
    shadowColor: '#1F2937',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  float: {
    shadowColor: '#1F2937',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 24,
    elevation: 8,
  },
  glow: {
    shadowColor: '#1FBFCC',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 6,
  },
};

export const GRADIENT = {
  // New design system: direct color arrays (use `as unknown as string[]`)
  brand: ['#1FBFCC', '#8E5CD9', '#D93B8B'] as const,
  teal:  ['#1FBFCC', '#00E5D5'] as const,
  warm:  ['#D93B8B', '#FF9ACD'] as const,

  // Legacy objects (used by existing screens)
  primary:    { colors: ['#00BCD4', '#E91E63'] as string[], start: { x: 0, y: 0 }, end: { x: 1, y: 1 } },
  light:      { colors: ['#E0F7FA', '#FCE4EC'] as string[], start: { x: 0, y: 0 }, end: { x: 1, y: 1 } },
  soft:       { colors: ['rgba(0,188,212,0.12)', 'rgba(233,30,99,0.12)'] as string[], start: { x: 0, y: 0 }, end: { x: 1, y: 1 } },
  horizontal: { colors: ['#00BCD4', '#E91E63'] as string[], start: { x: 0, y: 0.5 }, end: { x: 1, y: 0.5 } },
};
