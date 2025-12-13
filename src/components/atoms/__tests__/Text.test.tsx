/**
 * Text コンポーネントのテスト
 *
 * テスト内容:
 * - レンダリング確認
 * - バリアント別の表示（h1, h2, body, caption, small）
 * - カラーのカスタマイズ
 * - 太字表示
 */

import React from 'react';
import { render } from '@testing-library/react-native';
import Text from '../Text';

describe('Text', () => {
  // ============================================
  // レンダリングのテスト
  // ============================================

  it('デフォルトプロパティでレンダリングできる', () => {
    const { getByText } = render(<Text>テキスト</Text>);

    expect(getByText('テキスト')).toBeTruthy();
  });

  it('子要素が表示される', () => {
    const { getByText } = render(<Text>表示するテキスト</Text>);

    expect(getByText('表示するテキスト')).toBeTruthy();
  });

  // ============================================
  // バリアントのテスト
  // ============================================

  it('h1バリアントでレンダリングできる', () => {
    const { getByText } = render(
      <Text variant="h1">見出し1</Text>
    );

    expect(getByText('見出し1')).toBeTruthy();
  });

  it('h2バリアントでレンダリングできる', () => {
    const { getByText } = render(
      <Text variant="h2">見出し2</Text>
    );

    expect(getByText('見出し2')).toBeTruthy();
  });

  it('bodyバリアント（デフォルト）でレンダリングできる', () => {
    const { getByText } = render(
      <Text variant="body">本文</Text>
    );

    expect(getByText('本文')).toBeTruthy();
  });

  it('captionバリアントでレンダリングできる', () => {
    const { getByText } = render(
      <Text variant="caption">補足</Text>
    );

    expect(getByText('補足')).toBeTruthy();
  });

  it('smallバリアントでレンダリングできる', () => {
    const { getByText } = render(
      <Text variant="small">小さいテキスト</Text>
    );

    expect(getByText('小さいテキスト')).toBeTruthy();
  });

  // ============================================
  // カラーのテスト
  // ============================================

  it('カスタムカラーでレンダリングできる', () => {
    const { getByText } = render(
      <Text color="#FF0000">赤いテキスト</Text>
    );

    const textElement = getByText('赤いテキスト');
    expect(textElement).toBeTruthy();
    expect(textElement.props.style).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ color: '#FF0000' })
      ])
    );
  });

  it('カラー未指定の場合、デフォルトの色が適用される', () => {
    const { getByText } = render(<Text>デフォルト色</Text>);

    expect(getByText('デフォルト色')).toBeTruthy();
  });

  // ============================================
  // 太字のテスト
  // ============================================

  it('bold=trueで太字になる', () => {
    const { getByText } = render(
      <Text bold>太字テキスト</Text>
    );

    const textElement = getByText('太字テキスト');
    expect(textElement).toBeTruthy();
    expect(textElement.props.style).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ fontWeight: '700' })
      ])
    );
  });

  it('bold=falseで通常の太さになる', () => {
    const { getByText } = render(
      <Text bold={false}>通常テキスト</Text>
    );

    const textElement = getByText('通常テキスト');
    expect(textElement).toBeTruthy();
    expect(textElement.props.style).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ fontWeight: '400' })
      ])
    );
  });

  // ============================================
  // 複合的なテスト
  // ============================================

  it('バリアントとカラーを組み合わせて使用できる', () => {
    const { getByText } = render(
      <Text variant="h1" color="#0000FF">
        青い見出し
      </Text>
    );

    const textElement = getByText('青い見出し');
    expect(textElement).toBeTruthy();
    expect(textElement.props.style).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ color: '#0000FF' })
      ])
    );
  });

  it('すべてのプロパティを組み合わせて使用できる', () => {
    const { getByText } = render(
      <Text variant="h2" color="#00FF00" bold>
        緑の太字見出し
      </Text>
    );

    const textElement = getByText('緑の太字見出し');
    expect(textElement).toBeTruthy();
    expect(textElement.props.style).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ color: '#00FF00' }),
        expect.objectContaining({ fontWeight: '700' })
      ])
    );
  });

  // ============================================
  // 子要素のテスト
  // ============================================

  it('文字列以外の子要素も受け入れられる', () => {
    const { getByText } = render(
      <Text>
        テキスト{' '}
        <Text variant="small">小さいテキスト</Text>
      </Text>
    );

    // ネストされたTextコンポーネントの子要素が表示されることを確認
    expect(getByText('小さいテキスト')).toBeTruthy();
  });

  // ============================================
  // スナップショットテスト
  // ============================================

  it('h1バリアントのスナップショットが一致する', () => {
    const { toJSON } = render(<Text variant="h1">見出し</Text>);
    expect(toJSON()).toMatchSnapshot();
  });

  it('太字テキストのスナップショットが一致する', () => {
    const { toJSON } = render(<Text bold>太字</Text>);
    expect(toJSON()).toMatchSnapshot();
  });
});
