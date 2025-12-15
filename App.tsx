/**
 * App - アプリケーションのエントリーポイント
 *
 * 全てのProviderとNavigationを統合
 * - ErrorBoundary: エラーハンドリング
 * - DatabaseProvider: データベース接続
 * - NavigationContainer: React Navigation
 * - AppNavigator: 画面遷移
 * - NotificationService: 通知機能の初期化
 */

import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
// react-native-screensを明示的にインポート（Androidでの型エラー対策）
import 'react-native-screens';
import { StatusBar } from 'expo-status-bar';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { DatabaseProvider } from '@/contexts/DatabaseContext';
import { AppNavigator } from '@/navigation';
import { NotificationService } from '@/services/NotificationService';

/**
 * アプリケーションルートコンポーネント
 *
 * レイヤー構造:
 * 1. ErrorBoundary - アプリ全体のエラーキャッチ
 * 2. DatabaseProvider - データベース接続の提供
 * 3. NavigationContainer - React Navigationのコンテナ
 * 4. AppNavigator - 画面スタックナビゲーター
 */
const App: React.FC = () => {
  // 通知機能の初期化
  useEffect(() => {
    // 通知ハンドラーの設定
    NotificationService.configure();

    // 通知パーミッションの要求
    NotificationService.requestPermissions();
  }, []);

  return (
    <SafeAreaProvider>
      <ErrorBoundary>
        <DatabaseProvider>
          <NavigationContainer>
            <AppNavigator />
            <StatusBar style="light" translucent={false} backgroundColor="#2196F3" />
          </NavigationContainer>
        </DatabaseProvider>
      </ErrorBoundary>
    </SafeAreaProvider>
  );
};

export default App;
