/**
 * Badge コンポーネントのテスト
 *
 * テスト内容:
 * - レンダリング確認
 * - ステータス別の表示（unlistened, listening, completed）
 * - 絵文字とラベルの表示
 */

import React from 'react';
import { render } from '@testing-library/react-native';
import Badge from '../Badge';

describe('Badge', () => {
  // ============================================
  // レンダリングのテスト
  // ============================================

  it('unlistenedステータスでレンダリングできる', () => {
    const { getByText } = render(<Badge status="unlistened" />);

    expect(getByText('📻')).toBeTruthy(); // 絵文字
    expect(getByText('未聴取')).toBeTruthy(); // ラベル
  });

  it('listeningステータスでレンダリングできる', () => {
    const { getByText } = render(<Badge status="listening" />);

    expect(getByText('🎧')).toBeTruthy(); // 絵文字
    expect(getByText('聴取中')).toBeTruthy(); // ラベル
  });

  it('completedステータスでレンダリングできる', () => {
    const { getByText } = render(<Badge status="completed" />);

    expect(getByText('✅')).toBeTruthy(); // 絵文字
    expect(getByText('聴取済')).toBeTruthy(); // ラベル
  });

  // ============================================
  // ステータス別の詳細テスト
  // ============================================

  describe('unlistenedステータス', () => {
    it('正しい絵文字が表示される', () => {
      const { getByText } = render(<Badge status="unlistened" />);
      expect(getByText('📻')).toBeTruthy();
    });

    it('正しいラベルが表示される', () => {
      const { getByText } = render(<Badge status="unlistened" />);
      expect(getByText('未聴取')).toBeTruthy();
    });
  });

  describe('listeningステータス', () => {
    it('正しい絵文字が表示される', () => {
      const { getByText } = render(<Badge status="listening" />);
      expect(getByText('🎧')).toBeTruthy();
    });

    it('正しいラベルが表示される', () => {
      const { getByText } = render(<Badge status="listening" />);
      expect(getByText('聴取中')).toBeTruthy();
    });
  });

  describe('completedステータス', () => {
    it('正しい絵文字が表示される', () => {
      const { getByText } = render(<Badge status="completed" />);
      expect(getByText('✅')).toBeTruthy();
    });

    it('正しいラベルが表示される', () => {
      const { getByText } = render(<Badge status="completed" />);
      expect(getByText('聴取済')).toBeTruthy();
    });
  });

  // ============================================
  // スナップショットテスト
  // ============================================

  it('unlistenedステータスのスナップショットが一致する', () => {
    const { toJSON } = render(<Badge status="unlistened" />);
    expect(toJSON()).toMatchSnapshot();
  });

  it('listeningステータスのスナップショットが一致する', () => {
    const { toJSON } = render(<Badge status="listening" />);
    expect(toJSON()).toMatchSnapshot();
  });

  it('completedステータスのスナップショットが一致する', () => {
    const { toJSON } = render(<Badge status="completed" />);
    expect(toJSON()).toMatchSnapshot();
  });
});
