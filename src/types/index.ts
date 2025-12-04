/**
 * TypeScript‹š©
 *
 * ¢×ê±ü·çóhSg(Y‹‹š©’Æ
 * Çü¿Ùü¹-økúeDfš©
 */

// ============================================
// ¹Æü¿¹‹
// ============================================

/**
 * ¿¹¯n¹Æü¿¹
 * - unlistened: *tÖ
 * - listening: tÖ-
 * - completed: tÖŒ†
 */
export type TaskStatus = 'unlistened' | 'listening' | 'completed';

/**
 * pŠÔW-šn.%
 * - none: pŠÔWjWXz	
 * - weekly: Î1pŠÔW
 */
export type RepeatType = 'none' | 'weekly';

// ============================================
// Çü¿Ùü¹¨óÆ£Æ£‹
// ============================================

/**
 * jDŞ¹¿programsÆüÖë	
 */
export interface Program {
  /** ;­ü */
  id: number;
  /** >@ */
  station_name: string;
  /** jD */
  program_name: string;
  /** Üå0=åÜ, 1=Ü, ..., 6=Ü	 */
  day_of_week: number;
  /** >B;B	5-29 */
  hour: number;
  /** >B;	0, 15, 30, 45 */
  minute: number;
  /** pŠÔW.% */
  repeat_type: RepeatType;
  /** {2åBISO8601b	 */
  created_at: string;
  /** ô°åBISO8601b	 */
  updated_at: string;
}

/**
 * ¿¹¯tasksÆüÖë	
 */
export interface Task {
  /** ;­ü */
  id: number;
  /** jDŞ¹¿IDè­ü	 */
  program_id: number;
  /** >åBISO8601b	 */
  broadcast_datetime: string;
  /** PåBISO8601b	 */
  deadline_datetime: string;
  /** ¹Æü¿¹ */
  status: TaskStatus;
  /** tÖŒ†åBISO8601bNULLn4BŠ	 */
  completed_at: string | null;
  /** {2åBISO8601b	 */
  created_at: string;
  /** ô°åBISO8601b	 */
  updated_at: string;
}

// ============================================
// P‹ûá5‹
// ============================================

/**
 * ¿¹¯hjDÅ1’PW_‹
 * ;bh:(k(
 */
export interface TaskWithProgram extends Task {
  /** >@ */
  station_name: string;
  /** jD */
  program_name: string;
  /** pŠÔW.% */
  repeat_type: RepeatType;
}

// ============================================
// Õ©üàe›(‹
// ============================================

/**
 * jD{2ûèÆÕ©üànÇü¿‹
 * created_at, updated_atoêÕUŒ‹_+~jD
 */
export interface ProgramFormData {
  /** >@ */
  station_name: string;
  /** jD */
  program_name: string;
  /** Üå0=åÜ, 1=Ü, ..., 6=Ü	 */
  day_of_week: number;
  /** >B;B	5-29 */
  hour: number;
  /** >B;	0, 15, 30, 45 */
  minute: number;
  /** pŠÔW.% */
  repeat_type: RepeatType;
}
