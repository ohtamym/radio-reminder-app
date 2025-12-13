/**
 * Input コンポーネントのテスト
 *
 * テスト内容:
 * - レンダリング確認
 * - ラベル表示
 * - エラー表示
 * - プレースホルダー
 * - 入力インタラクション
 */

import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import Input from '../Input';

describe('Input', () => {
  // ============================================
  // レンダリングのテスト
  // ============================================

  it('デフォルトプロパティでレンダリングできる', () => {
    const { getByPlaceholderText } = render(
      <Input placeholder="入力してください" />
    );

    expect(getByPlaceholderText('入力してください')).toBeTruthy();
  });

  it('プレースホルダーが表示される', () => {
    const { getByPlaceholderText } = render(
      <Input placeholder="例: TBSラジオ" />
    );

    expect(getByPlaceholderText('例: TBSラジオ')).toBeTruthy();
  });

  // ============================================
  // ラベルのテスト
  // ============================================

  it('ラベルが表示される', () => {
    const { getByText } = render(
      <Input label="放送局名" placeholder="入力" />
    );

    expect(getByText('放送局名')).toBeTruthy();
  });

  it('ラベルなしでレンダリングできる', () => {
    const { getByPlaceholderText } = render(
      <Input placeholder="入力" />
    );

    expect(getByPlaceholderText('入力')).toBeTruthy();
  });

  // ============================================
  // エラー表示のテスト
  // ============================================

  it('エラーメッセージが表示される', () => {
    const { getByText } = render(
      <Input
        label="番組名"
        placeholder="入力"
        error="番組名は必須です"
      />
    );

    expect(getByText('番組名は必須です')).toBeTruthy();
  });

  it('エラーなしでレンダリングできる', () => {
    const { queryByText, getByPlaceholderText } = render(
      <Input label="番組名" placeholder="入力" />
    );

    expect(getByPlaceholderText('入力')).toBeTruthy();
    // エラーメッセージは表示されない
  });

  it('エラーがある場合、ラベルとエラーの両方が表示される', () => {
    const { getByText } = render(
      <Input
        label="放送局名"
        placeholder="入力"
        error="必須項目です"
      />
    );

    expect(getByText('放送局名')).toBeTruthy();
    expect(getByText('必須項目です')).toBeTruthy();
  });

  // ============================================
  // 入力インタラクションのテスト
  // ============================================

  it('onChangeTextが呼ばれる', () => {
    const handleChange = jest.fn();
    const { getByPlaceholderText } = render(
      <Input
        placeholder="入力してください"
        onChangeText={handleChange}
      />
    );

    const input = getByPlaceholderText('入力してください');
    fireEvent.changeText(input, 'TBSラジオ');

    expect(handleChange).toHaveBeenCalledTimes(1);
    expect(handleChange).toHaveBeenCalledWith('TBSラジオ');
  });

  it('複数回入力するとonChangeTextが複数回呼ばれる', () => {
    const handleChange = jest.fn();
    const { getByPlaceholderText } = render(
      <Input
        placeholder="入力"
        onChangeText={handleChange}
      />
    );

    const input = getByPlaceholderText('入力');
    fireEvent.changeText(input, 'T');
    fireEvent.changeText(input, 'TB');
    fireEvent.changeText(input, 'TBS');

    expect(handleChange).toHaveBeenCalledTimes(3);
    expect(handleChange).toHaveBeenNthCalledWith(1, 'T');
    expect(handleChange).toHaveBeenNthCalledWith(2, 'TB');
    expect(handleChange).toHaveBeenNthCalledWith(3, 'TBS');
  });

  it('valueプロパティが反映される', () => {
    const { getByDisplayValue } = render(
      <Input
        placeholder="入力"
        value="TBSラジオ"
      />
    );

    expect(getByDisplayValue('TBSラジオ')).toBeTruthy();
  });

  // ============================================
  // 複合的なテスト
  // ============================================

  it('すべてのプロパティを組み合わせて使用できる', () => {
    const handleChange = jest.fn();
    const { getByText, getByPlaceholderText, getByDisplayValue } = render(
      <Input
        label="番組名"
        placeholder="例: アフター6ジャンクション"
        value="レコメン"
        error="番組名が正しくありません"
        onChangeText={handleChange}
      />
    );

    expect(getByText('番組名')).toBeTruthy();
    expect(getByPlaceholderText('例: アフター6ジャンクション')).toBeTruthy();
    expect(getByDisplayValue('レコメン')).toBeTruthy();
    expect(getByText('番組名が正しくありません')).toBeTruthy();

    const input = getByPlaceholderText('例: アフター6ジャンクション');
    fireEvent.changeText(input, '新しい番組名');

    expect(handleChange).toHaveBeenCalledWith('新しい番組名');
  });

  it('エラー状態から正常状態に変更できる', () => {
    const { rerender, getByText, queryByText, getByPlaceholderText } = render(
      <Input
        label="番組名"
        placeholder="入力"
        error="エラーがあります"
      />
    );

    expect(getByText('エラーがあります')).toBeTruthy();

    // エラーを解除
    rerender(
      <Input
        label="番組名"
        placeholder="入力"
      />
    );

    expect(queryByText('エラーがあります')).toBeNull();
    expect(getByPlaceholderText('入力')).toBeTruthy();
  });

  // ============================================
  // スナップショットテスト
  // ============================================

  it('基本的なInputのスナップショットが一致する', () => {
    const { toJSON } = render(
      <Input label="ラベル" placeholder="プレースホルダー" />
    );
    expect(toJSON()).toMatchSnapshot();
  });

  it('エラー付きInputのスナップショットが一致する', () => {
    const { toJSON } = render(
      <Input
        label="ラベル"
        placeholder="プレースホルダー"
        error="エラーメッセージ"
      />
    );
    expect(toJSON()).toMatchSnapshot();
  });
});
