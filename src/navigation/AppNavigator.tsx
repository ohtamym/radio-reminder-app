/**
 * AppNavigator - アプリケーションのナビゲーション設定
 *
 * React Navigationを使用したスタックナビゲーターの設定
 * - 全画面の登録
 * - ヘッダースタイルの設定
 * - 初期画面の設定
 */

import React from 'react';
import { TouchableOpacity, Text } from 'react-native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { TaskListScreen, ProgramFormScreen, TaskDetailScreen, HistoryScreen } from '@/screens';
import { RootStackParamList } from './types';
import { theme } from '@/theme';

// ============================================
// ナビゲーター作成
// ============================================

const Stack = createNativeStackNavigator<RootStackParamList>();

// ============================================
// コンポーネント
// ============================================

/**
 * アプリケーションナビゲーター
 *
 * 全画面をスタックナビゲーターに登録
 * 共通ヘッダースタイルを適用
 *
 * @example
 * <NavigationContainer>
 *   <AppNavigator />
 * </NavigationContainer>
 */
export const AppNavigator: React.FC = () => {
  return (
    <Stack.Navigator
      initialRouteName="TaskList"
      screenOptions={{
        // 共通ヘッダースタイル
        headerStyle: {
          backgroundColor: theme.colors.primary,
        },
        headerTintColor: theme.colors.textWhite,
        headerTitleStyle: {
          fontWeight: 'bold',
        },
        contentStyle: { backgroundColor: theme.colors.background },
      }}
    >
      {/* タスク一覧画面（初期画面） */}
      <Stack.Screen
        name="TaskList"
        component={TaskListScreen}
        options={({ navigation }) => ({
          title: 'ラジオリマインダー',
          headerLeft: () => null, // 戻るボタンを非表示（ルート画面）
          headerRight: () => (
            <TouchableOpacity
              onPress={() => navigation.navigate('ProgramForm')}
              style={{ paddingHorizontal: 16 }}
            >
              <Text style={{ color: theme.colors.textWhite, fontSize: 28 }}>+</Text>
            </TouchableOpacity>
          ),
        })}
      />

      {/* 番組登録/編集画面 */}
      <Stack.Screen
        name="ProgramForm"
        component={ProgramFormScreen}
        options={({ route }) => ({
          // パラメータに応じてタイトルを変更
          title: route.params?.programId ? '番組編集' : '番組登録',
        })}
      />

      {/* タスク詳細画面 */}
      <Stack.Screen
        name="TaskDetail"
        component={TaskDetailScreen}
        options={{
          title: 'タスク詳細',
        }}
      />

      {/* 履歴画面 */}
      <Stack.Screen
        name="History"
        component={HistoryScreen}
        options={{
          title: '聴取履歴',
        }}
      />
    </Stack.Navigator>
  );
};

// ============================================
// エクスポート
// ============================================

export default AppNavigator;
