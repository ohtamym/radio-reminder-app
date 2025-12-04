/**
 * ¢◊Í±¸∑ÁÛhSg(Yãöpö©
 *
 * Åˆö©¯h«¸øŸ¸π-¯k˙eO
 */

import { TaskStatus, RepeatType } from '@/types';
import { colors } from '@/theme';

// ============================================
// B;xûnöp
// ============================================

/**
 * >B;B	nxû¢
 * 5B^29B29B = ÃÂ5B	
 */
export const HOURS = Array.from({ length: 25 }, (_, i) => i + 5);

/**
 * >B;	nxû¢
 * 0153045
 */
export const MINUTES = [0, 15, 30, 45] as const;

// ============================================
// ‹Ânöp
// ============================================

/**
 * ‹Ânxû¢
 * value: 0=Â‹1=‹...6=‹
 */
export const DAY_OF_WEEK_OPTIONS = [
  { label: 'Â‹Â', value: 0 },
  { label: '‹Â', value: 1 },
  { label: 'k‹Â', value: 2 },
  { label: '4‹Â', value: 3 },
  { label: '(‹Â', value: 4 },
  { label: '—‹Â', value: 5 },
  { label: '‹Â', value: 6 },
] as const;

/**
 * ‹ÂnÌ.bÂBh:(	
 */
export const DAY_OF_WEEK_SHORT = ['Â', '', 'k', '4', '(', '—', ''] as const;

// ============================================
// pä‘W-önöp
// ============================================

/**
 * pä‘W-önxû¢
 */
export const REPEAT_TYPE_OPTIONS = [
  { label: 'jWXz	', value: 'none' as RepeatType },
  { label: 'Œ1', value: 'weekly' as RepeatType },
] as const;

// ============================================
// π∆¸øπnöp
// ============================================

/**
 * π∆¸øπThn-ö
 * uáWrÈŸÎíö©
 */
export const STATUS_CONFIG = {
  unlistened: {
    emoji: '=4',
    color: colors.statusUnlistened,
    label: '*t÷',
  },
  listening: {
    emoji: '=·',
    color: colors.statusListening,
    label: 't÷-',
  },
  completed: {
    emoji: '',
    color: colors.statusCompleted,
    label: 't÷',
  },
} as const satisfies Record<TaskStatus, { emoji: string; color: string; label: string }>;

// ============================================
// Ph:nrQ
// ============================================

/**
 * ãäÂpk‹X_rn÷ó¢p
 * @param daysRemaining ãäÂp
 * @returns r≥¸…
 */
export const getDeadlineColor = (daysRemaining: number): string => {
  if (daysRemaining <= 1) {
    return colors.deadlineUrgent; // d
  } else if (daysRemaining <= 3) {
    return colors.deadlineWarning; // ƒ
  } else {
    return colors.deadlineNormal; // ∞Ï¸
  }
};

/**
 * PnrQö©™÷∏ßØ»b	
 */
export const DEADLINE_COLORS = {
  urgent: colors.deadlineUrgent, // ãä1ÂÂÖ
  warning: colors.deadlineWarning, // ãä2-3Â
  normal: colors.deadlineNormal, // ãä4ÂÂ

} as const;

// ============================================
// ]n÷nöp
// ============================================

/**
 * radikonø§‡’Í¸t÷P
 * >å7Âì + 29Bì8Âån5:00~g	
 */
export const TIMEFREE_PERIOD_DAYS = 7;
export const TIMEFREE_DEADLINE_HOUR = 5; // 5:00 AM

/**
 * etn›ìÂp	
 */
export const HISTORY_RETENTION_DAYS = 30;
