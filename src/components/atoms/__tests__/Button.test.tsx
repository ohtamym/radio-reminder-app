/**
 * Button コンポーネントのテスト
 *
 * テスト内容:
 * - レンダリング確認
 * - バリアント別の表示
 * - インタラクション（onPress）
 * - disabled状態
 * - fullWidth表示
 * - アクセシビリティ
 */

import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import Button from '../Button';

describe('Button', () => {
  // ============================================
  // レンダリングのテスト
  // ============================================

  it('デフォルトプロパティでレンダリングできる', () => {
    const { getByText } = render(<Button>テストボタン</Button>);

    expect(getByText('テストボタン')).toBeTruthy();
  });

  it('子要素のテキストが表示される', () => {
    const { getByText } = render(<Button>保存する</Button>);

    expect(getByText('保存する')).toBeTruthy();
  });

  // ============================================
  // バリアントのテスト
  // ============================================

  it('primaryバリアントでレンダリングできる', () => {
    const { getByText } = render(<Button variant="primary">プライマリー</Button>);

    expect(getByText('プライマリー')).toBeTruthy();
  });

  it('secondaryバリアントでレンダリングできる', () => {
    const { getByText } = render(<Button variant="secondary">セカンダリー</Button>);

    expect(getByText('セカンダリー')).toBeTruthy();
  });

  it('dangerバリアントでレンダリングできる', () => {
    const { getByText } = render(<Button variant="danger">削除</Button>);

    expect(getByText('削除')).toBeTruthy();
  });

  // ============================================
  // インタラクションのテスト
  // ============================================

  it('onPressが呼ばれる', () => {
    const handlePress = jest.fn();
    const { getByText } = render(<Button onPress={handlePress}>押してください</Button>);

    fireEvent.press(getByText('押してください'));

    expect(handlePress).toHaveBeenCalledTimes(1);
  });

  it('複数回タップするとonPressが複数回呼ばれる', () => {
    const handlePress = jest.fn();
    const { getByText } = render(<Button onPress={handlePress}>ボタン</Button>);

    const button = getByText('ボタン');
    fireEvent.press(button);
    fireEvent.press(button);
    fireEvent.press(button);

    expect(handlePress).toHaveBeenCalledTimes(3);
  });

  // ============================================
  // disabled状態のテスト
  // ============================================

  it('disabled=trueの場合、onPressが呼ばれない', () => {
    const handlePress = jest.fn();
    const { getByText } = render(
      <Button disabled onPress={handlePress}>
        無効ボタン
      </Button>
    );

    fireEvent.press(getByText('無効ボタン'));

    expect(handlePress).not.toHaveBeenCalled();
  });

  it('disabled=falseの場合、onPressが呼ばれる', () => {
    const handlePress = jest.fn();
    const { getByText } = render(
      <Button disabled={false} onPress={handlePress}>
        有効ボタン
      </Button>
    );

    fireEvent.press(getByText('有効ボタン'));

    expect(handlePress).toHaveBeenCalledTimes(1);
  });

  // ============================================
  // fullWidthのテスト
  // ============================================

  it('fullWidth=trueでレンダリングできる', () => {
    const { getByText } = render(<Button fullWidth>全幅ボタン</Button>);

    expect(getByText('全幅ボタン')).toBeTruthy();
  });

  it('fullWidth=falseでレンダリングできる', () => {
    const { getByText } = render(<Button fullWidth={false}>通常幅ボタン</Button>);

    expect(getByText('通常幅ボタン')).toBeTruthy();
  });

  // ============================================
  // アクセシビリティのテスト
  // ============================================

  it('accessibilityRoleがbuttonである', () => {
    const { getByRole } = render(<Button>アクセシブル</Button>);

    expect(getByRole('button')).toBeTruthy();
  });

  it('disabled状態がaccessibilityStateに反映される', () => {
    const { getByRole } = render(<Button disabled>無効</Button>);

    const button = getByRole('button');
    expect(button.props.accessibilityState).toEqual({ disabled: true });
  });

  it('有効状態がaccessibilityStateに反映される', () => {
    const { getByRole } = render(<Button>有効</Button>);

    const button = getByRole('button');
    expect(button.props.accessibilityState).toEqual({ disabled: false });
  });

  // ============================================
  // 複合的なテスト
  // ============================================

  it('バリアントとfullWidthを組み合わせて使用できる', () => {
    const handlePress = jest.fn();
    const { getByText } = render(
      <Button variant="danger" fullWidth onPress={handlePress}>
        全幅の削除ボタン
      </Button>
    );

    const button = getByText('全幅の削除ボタン');
    expect(button).toBeTruthy();

    fireEvent.press(button);
    expect(handlePress).toHaveBeenCalledTimes(1);
  });

  it('すべてのプロパティを組み合わせて使用できる', () => {
    const handlePress = jest.fn();
    const { getByText } = render(
      <Button variant="secondary" fullWidth disabled onPress={handlePress}>
        複合プロパティ
      </Button>
    );

    const button = getByText('複合プロパティ');
    expect(button).toBeTruthy();

    fireEvent.press(button);
    expect(handlePress).not.toHaveBeenCalled(); // disabledなので呼ばれない
  });
});
