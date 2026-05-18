export const COLORS = {
  // Primary gradient colors
  primary:   '#00BCD4', // Cyan
  secondary: '#E91E63', // Magenta
  accent:    '#9C27B0', // Purple

  // Gradients
  gradient:      ['#00BCD4', '#E91E63'] as string[],
  lightGradient: ['#E0F7FA', '#FCE4EC'] as string[],
  softGradient:  ['rgba(0, 188, 212, 0.1)', 'rgba(233, 30, 99, 0.1)'] as string[],

  // Brand
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
  bg:        '#FAFAFA',
  line:      'rgba(31,41,55,0.08)',

  // States
  success: '#4CAF50',
  error:   '#F44336',
  warning: '#FFC107',
  info:    '#2196F3',
};

export const SPACING = {
  xs:  4,
  sm:  8,
  md:  12,
  lg:  16,
  xl:  24,
  xxl: 32,
};

export const GRADIENT = {
  primary:   { colors: ['#00BCD4', '#E91E63'] as string[], start: { x: 0, y: 0 }, end: { x: 1, y: 1 } },
  light:     { colors: ['#E0F7FA', '#FCE4EC'] as string[], start: { x: 0, y: 0 }, end: { x: 1, y: 1 } },
  soft:      { colors: ['rgba(0,188,212,0.12)', 'rgba(233,30,99,0.12)'] as string[], start: { x: 0, y: 0 }, end: { x: 1, y: 1 } },
  horizontal:{ colors: ['#00BCD4', '#E91E63'] as string[], start: { x: 0, y: 0.5 }, end: { x: 1, y: 0.5 } },
};
