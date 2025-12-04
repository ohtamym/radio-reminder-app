/**
 * ÆüŞq¨¯¹İüÈ
 *
 * ¢×ê±ü·çóhSg(Y‹ÆüŞ-š’Æ
 */

import { colors } from './colors';
import { typography } from './typography';
import { spacing } from './spacing';

/**
 * ÜüÀüJ„nš©
 * ;b-øn3.4 Ü¿ó¹¿¤ë3.5 «üÉ¹¿¤ëkúeO
 */
export const borderRadius = {
  button: 8, // Ü¿ónÒ8
  card: 12, // «üÉnÒ8
  small: 4, // Uj nÒ8ª×·çó	
} as const;

/**
 * ·ãÉ¦nš©
 * ;b-øn3.5 «üÉ¹¿¤ëkúeO
 * React Nativenelevation’(
 */
export const shadows = {
  card: {
    // Android(
    elevation: 2,
    // iOS(
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,
  },
  button: {
    // Ü¿ónıD·ãÉ¦ª×·çó	
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.18,
    shadowRadius: 1.0,
  },
} as const;

/**
 * Ü¿ó¹¿¤ënš©
 * ;b-øn3.4 Ü¿ó¹¿¤ëkúeO
 */
export const buttons = {
  height: 48, // Ü¿ónØU
  pressedOpacity: 0.8, // ¿Ã×Bn¦
} as const;

/**
 * qÆüŞªÖ¸§¯È
 */
export const theme = {
  colors,
  typography,
  spacing,
  borderRadius,
  shadows,
  buttons,
} as const;

// %¨¯¹İüÈ
export { colors, typography, spacing };

// ‹¨¯¹İüÈ
export type Theme = typeof theme;
export type { Colors } from './colors';
export type { Typography } from './typography';
export type { Spacing } from './spacing';
