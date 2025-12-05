/**
 * シャドウの設定
 *
 * 画面設計書の3.5 カード仕様に基づく
 * React Nativeではelevationとshadow系プロパティを併用
 */

export const shadows = {
  /** カードのシャドウ */
  card: {
    // Android用
    elevation: 2,
    // iOS用
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,
  },
  /** ボタンの浮き上がりシャドウ */
  button: {
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

export type Shadows = typeof shadows;
