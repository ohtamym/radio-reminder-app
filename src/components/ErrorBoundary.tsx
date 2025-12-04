/**
 * ErrorBoundary コンポーネント
 *
 * Reactコンポーネントツリー内のエラーをキャッチし、
 * フォールバックUIを表示するエラーバウンダリ
 */

import React, { Component, ReactNode } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { theme } from '@/theme';

// ============================================
// 型定義
// ============================================

interface Props {
  /** 子コンポーネント */
  children: ReactNode;
  /** カスタムフォールバックUI（オプション） */
  fallback?: ReactNode;
}

interface State {
  /** エラーが発生したかどうか */
  hasError: boolean;
  /** 発生したエラー */
  error?: Error;
}

// ============================================
// ErrorBoundary コンポーネント
// ============================================

/**
 * エラーバウンダリコンポーネント
 *
 * React 16以降のエラーバウンダリ機能を使用
 * クラスコンポーネントである必要がある
 *
 * @example
 * <ErrorBoundary>
 *   <App />
 * </ErrorBoundary>
 */
export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  /**
   * エラーが発生したときに呼ばれる静的メソッド
   * stateを更新してエラーUIを表示する
   */
  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  /**
   * エラー情報をログに記録
   * 本番環境ではエラー追跡サービスに送信することを推奨
   */
  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // エラーログの出力
    console.error('Error caught by boundary:', {
      error: {
        name: error.name,
        message: error.message,
        stack: error.stack,
      },
      errorInfo: {
        componentStack: errorInfo.componentStack,
      },
      timestamp: new Date().toISOString(),
    });

    // 本番環境ではエラー追跡サービスに送信
    // 例: Sentry.captureException(error, { contexts: { react: errorInfo } });
  }

  /**
   * エラー状態をリセットして再試行
   */
  handleReset = () => {
    this.setState({ hasError: false, error: undefined });
  };

  render() {
    if (this.state.hasError) {
      // カスタムフォールバックUIが指定されている場合はそれを使用
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // デフォルトのエラーUI
      return (
        <View style={styles.container}>
          <Text style={styles.emoji}>⚠️</Text>
          <Text style={styles.title}>エラーが発生しました</Text>
          <Text style={styles.message}>
            {this.state.error?.message || '不明なエラー'}
          </Text>
          <View style={styles.buttonContainer}>
            {/*
              再試行ボタン
              注: Buttonコンポーネントがまだ実装されていないため、
              後でButtonコンポーネントに置き換える
            */}
            <View style={styles.button}>
              <Text
                style={styles.buttonText}
                onPress={this.handleReset}
              >
                再試行
              </Text>
            </View>
          </View>
        </View>
      );
    }

    return this.props.children;
  }
}

// ============================================
// スタイル定義
// ============================================

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: theme.spacing.lg,
    backgroundColor: theme.colors.background,
  },
  emoji: {
    fontSize: 64,
    marginBottom: theme.spacing.md,
  },
  title: {
    fontSize: theme.typography.fontSize.h1,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.text,
    marginBottom: theme.spacing.md,
  },
  message: {
    fontSize: theme.typography.fontSize.body,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.lg,
    textAlign: 'center',
    paddingHorizontal: theme.spacing.md,
  },
  buttonContainer: {
    width: '100%',
    paddingHorizontal: theme.spacing.md,
  },
  button: {
    backgroundColor: theme.colors.primary,
    borderRadius: theme.borderRadius.button,
    height: theme.buttons.height,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonText: {
    color: theme.colors.textWhite,
    fontSize: theme.typography.fontSize.body,
    fontWeight: theme.typography.fontWeight.bold,
  },
});
