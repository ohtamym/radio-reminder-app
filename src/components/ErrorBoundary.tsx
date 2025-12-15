/**
 * ErrorBoundary コンポーネント
 *
 * Reactコンポーネントツリー内のエラーをキャッチし、
 * フォールバックUIを表示するエラーバウンダリ
 */

import React, { Component, ReactNode } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { theme } from '@/theme';
import { getGlobalError, clearGlobalError } from '@/utils/globalErrorHandler';
import { Button } from '@/components/atoms';

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
  /** エラー情報（componentDidCatchで取得） */
  errorInfo?: React.ErrorInfo;
  /** 詳細表示のON/OFF */
  showDetails: boolean;
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
    this.state = { hasError: false, showDetails: false };
  }

  /**
   * コンポーネントマウント時にグローバルエラーをチェック
   */
  componentDidMount() {
    // グローバルエラーハンドラーでキャッチされたエラーをチェック
    const { error } = getGlobalError();
    if (error) {
      this.setState({ hasError: true, error });
    }
  }

  /**
   * エラーが発生したときに呼ばれる静的メソッド
   * stateを更新してエラーUIを表示する
   */
  static getDerivedStateFromError(error: Error): Partial<State> {
    return { hasError: true, error };
  }

  /**
   * エラー情報をログに記録
   * 本番環境ではエラー追跡サービスに送信することを推奨
   */
  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // エラー情報をstateに保存
    this.setState({ errorInfo });

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

    // Android Logcatにも出力（デバッグ用）
    if (__DEV__) {
      console.error('=== ERROR DETAILS ===');
      console.error('Error Name:', error.name);
      console.error('Error Message:', error.message);
      console.error('Error Stack:', error.stack);
      console.error('Component Stack:', errorInfo.componentStack);
      console.error('====================');
    }

    // 本番環境ではエラー追跡サービスに送信
    // 例: Sentry.captureException(error, { contexts: { react: errorInfo } });
  }

  /**
   * エラー状態をリセットして再試行
   */
  handleReset = () => {
    // グローバルエラーもクリア
    clearGlobalError();
    this.setState({
      hasError: false,
      error: undefined,
      errorInfo: undefined,
      showDetails: false,
    });
  };

  /**
   * 詳細表示の切り替え
   */
  toggleDetails = () => {
    this.setState((prevState) => ({ showDetails: !prevState.showDetails }));
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
          <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
            <Text style={styles.emoji}>⚠️</Text>
            <Text style={styles.title}>エラーが発生しました</Text>
            <Text style={styles.message}>{this.state.error?.message || '不明なエラー'}</Text>
            {(() => {
              const { error: globalError } = getGlobalError();
              if (globalError && globalError !== this.state.error) {
                return (
                  <Text style={styles.globalErrorNote}>
                    ※ ネイティブエラーも検出されました。詳細を表示してください。
                  </Text>
                );
              }
              return null;
            })()}

            {/* 詳細表示ボタン */}
            {this.state.error && (
              <Button
                variant="secondary"
                onPress={this.toggleDetails}
                fullWidth
                style={styles.buttonSpacing}
              >
                {this.state.showDetails ? '詳細を隠す' : '詳細を表示'}
              </Button>
            )}

            {/* エラー詳細 */}
            {this.state.showDetails && this.state.error && (
              <View style={styles.detailsContainer}>
                <Text style={styles.detailsTitle}>エラー詳細</Text>
                <Text style={styles.detailsLabel}>エラー名:</Text>
                <Text style={styles.detailsText}>{this.state.error.name}</Text>

                <Text style={styles.detailsLabel}>エラーメッセージ:</Text>
                <Text style={styles.detailsText}>{this.state.error.message}</Text>

                {this.state.error.stack && (
                  <>
                    <Text style={styles.detailsLabel}>スタックトレース:</Text>
                    <ScrollView style={styles.stackScrollView} nestedScrollEnabled={true}>
                      <Text style={styles.detailsText}>{this.state.error.stack}</Text>
                    </ScrollView>
                  </>
                )}

                {this.state.errorInfo?.componentStack && (
                  <>
                    <Text style={styles.detailsLabel}>コンポーネントスタック:</Text>
                    <ScrollView style={styles.stackScrollView} nestedScrollEnabled={true}>
                      <Text style={styles.detailsText}>{this.state.errorInfo.componentStack}</Text>
                    </ScrollView>
                  </>
                )}

                {(() => {
                  const { error: globalError, info: globalErrorInfo } = getGlobalError();
                  if (globalError && globalError !== this.state.error) {
                    return (
                      <>
                        <Text style={styles.detailsLabel}>
                          グローバルエラー（ネイティブエラー）:
                        </Text>
                        <Text style={styles.detailsText}>エラー名: {globalError.name}</Text>
                        <Text style={styles.detailsText}>メッセージ: {globalError.message}</Text>
                        {globalError.stack && (
                          <ScrollView style={styles.stackScrollView} nestedScrollEnabled={true}>
                            <Text style={styles.detailsText}>{globalError.stack}</Text>
                          </ScrollView>
                        )}
                        {globalErrorInfo && (
                          <ScrollView style={styles.stackScrollView} nestedScrollEnabled={true}>
                            <Text style={styles.detailsText}>{globalErrorInfo}</Text>
                          </ScrollView>
                        )}
                      </>
                    );
                  }
                  return null;
                })()}
              </View>
            )}

            {/* 再試行ボタン */}
            <Button
              variant="primary"
              onPress={this.handleReset}
              fullWidth
              style={styles.buttonSpacing}
            >
              再試行
            </Button>
          </ScrollView>
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
    backgroundColor: theme.colors.background,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: theme.spacing.lg,
    alignItems: 'center',
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
  buttonSpacing: {
    marginBottom: theme.spacing.md,
  },
  detailsContainer: {
    width: '100%',
    marginTop: theme.spacing.md,
    marginBottom: theme.spacing.md,
    padding: theme.spacing.md,
    backgroundColor: theme.colors.background,
    borderRadius: theme.borderRadius.card,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  detailsTitle: {
    fontSize: theme.typography.fontSize.h2,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.text,
    marginBottom: theme.spacing.md,
  },
  detailsLabel: {
    fontSize: theme.typography.fontSize.small,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.textSecondary,
    marginTop: theme.spacing.sm,
    marginBottom: theme.spacing.xs,
  },
  detailsText: {
    fontSize: theme.typography.fontSize.small,
    color: theme.colors.text,
    fontFamily: 'monospace',
    lineHeight: 18,
  },
  stackScrollView: {
    maxHeight: 200,
    backgroundColor: theme.colors.background,
    borderRadius: theme.borderRadius.small,
    padding: theme.spacing.xs,
    marginTop: theme.spacing.xs,
  },
  globalErrorNote: {
    fontSize: theme.typography.fontSize.small,
    color: theme.colors.error || '#ff0000',
    marginTop: theme.spacing.sm,
    marginBottom: theme.spacing.md,
    textAlign: 'center',
    paddingHorizontal: theme.spacing.md,
  },
});
