import { StyleSheet } from 'react-native';
import { COLORS, RADII, SPACING, SHADOW } from '../utils/constants';

// ─── Shared button design tokens ─────────────────────────────────────────────
// Import this file in any screen:
//   import { buttonStyles as bs } from '../styles/buttonStyles';
// Usage:
//   <Pressable style={[bs.primary, bs.fullWidth]}> ... </Pressable>

export const buttonStyles = StyleSheet.create({

  // ── Primary ─────────────────────────────────────────────────────────────────
  // Solid teal — main CTA (login, register, send, apply)
  primary: {
    backgroundColor: COLORS.primary,
    borderRadius: RADII.pill,
    paddingVertical: 15,
    paddingHorizontal: SPACING.xl,
    alignItems: 'center',
    justifyContent: 'center',
    ...SHADOW.glow,
  },
  primaryText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
  primaryDisabled: {
    opacity: 0.45,
  },

  // ── Secondary ───────────────────────────────────────────────────────────────
  // Teal outline — second-priority actions (cancel, back, edit)
  secondary: {
    backgroundColor: COLORS.tealLight,
    borderRadius: RADII.pill,
    borderWidth: 1.5,
    borderColor: COLORS.primary,
    paddingVertical: 14,
    paddingHorizontal: SPACING.xl,
    alignItems: 'center',
    justifyContent: 'center',
  },
  secondaryText: {
    color: COLORS.primary,
    fontSize: 15,
    fontWeight: '700',
  },

  // ── Tertiary ────────────────────────────────────────────────────────────────
  // Ghost — low-emphasis (switch mode, "already have account")
  tertiary: {
    backgroundColor: 'transparent',
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tertiaryText: {
    color: COLORS.primary,
    fontSize: 14,
    fontWeight: '600',
  },

  // ── Error / Danger ───────────────────────────────────────────────────────────
  // Red tint — delete, logout
  error: {
    backgroundColor: 'rgba(229,72,77,0.10)',
    borderRadius: RADII.pill,
    borderWidth: 1,
    borderColor: 'rgba(229,72,77,0.25)',
    paddingVertical: 14,
    paddingHorizontal: SPACING.xl,
    alignItems: 'center',
    justifyContent: 'center',
  },
  errorText: {
    color: COLORS.error,
    fontSize: 15,
    fontWeight: '700',
  },

  // ── Filter / Chip ────────────────────────────────────────────────────────────
  // Small pill chips (price range, All/Unread, etc.)
  filter: {
    backgroundColor: '#fff',
    borderRadius: RADII.pill,
    borderWidth: 1,
    borderColor: COLORS.line,
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  filterActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  filterText: {
    color: COLORS.soft,
    fontSize: 13,
    fontWeight: '600',
    lineHeight: 18,
  },
  filterTextActive: {
    color: '#fff',
  },

  // ── Toggle segment ──────────────────────────────────────────────────────────
  // Side-by-side segment control (Student | Landlord)
  toggle: {
    flex: 1,
    paddingVertical: 11,
    borderRadius: RADII.lg,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.bgSoft,
    borderWidth: 1.5,
    borderColor: COLORS.line,
  },
  toggleActive: {
    backgroundColor: COLORS.tealLight,
    borderColor: COLORS.primary,
  },
  toggleText: {
    color: COLORS.soft,
    fontSize: 14,
    fontWeight: '600',
  },
  toggleTextActive: {
    color: COLORS.primary,
    fontWeight: '700',
  },

  // ── Icon button ─────────────────────────────────────────────────────────────
  // Square icon-only pill (edit pencil, header actions)
  iconBtn: {
    width: 40,
    height: 40,
    borderRadius: RADII.lg,
    backgroundColor: COLORS.bgSoft,
    borderWidth: 1,
    borderColor: COLORS.line,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconBtnActive: {
    backgroundColor: COLORS.tealLight,
    borderColor: COLORS.primary,
  },

  // ── Counter (±) ─────────────────────────────────────────────────────────────
  // Room count +/−
  counter: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.bgSoft,
    borderWidth: 1.5,
    borderColor: COLORS.line,
    alignItems: 'center',
    justifyContent: 'center',
  },
  counterText: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.ink,
    lineHeight: 22,
  },

  // ── FAB (Floating Action Button) ────────────────────────────────────────────
  // Bottom-right fixed "+" button
  fab: {
    position: 'absolute',
    right: SPACING.xl,
    bottom: 100,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    ...SHADOW.glow,
  },
  fabText: {
    color: '#fff',
    fontSize: 28,
    fontWeight: '300',
    lineHeight: 32,
  },

  // ── Layout helpers ───────────────────────────────────────────────────────────
  fullWidth: {
    alignSelf: 'stretch',
  },
  halfWidth: {
    flex: 1,
  },
  centeredButton: {
    alignSelf: 'center',
  },
  buttonRow: {
    flexDirection: 'row',
    gap: SPACING.sm,
    alignItems: 'center',
  },
});
