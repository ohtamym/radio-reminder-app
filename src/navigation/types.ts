/**
 * Navigation Types - ナビゲーションの型定義
 *
 * React Navigationのスタック画面とパラメータの型定義
 */

/**
 * ルートスタックのパラメータリスト
 *
 * 各画面に渡されるパラメータの型を定義
 */
export type RootStackParamList = {
  /**
   * タスク一覧画面
   * パラメータなし
   */
  TaskList: undefined;

  /**
   * 番組登録/編集画面
   * - programId: 編集モードの場合に番組IDを渡す（オプショナル）
   */
  ProgramForm: {
    programId?: number;
  } | undefined;

  /**
   * タスク詳細画面
   * - taskId: 表示するタスクのID（必須）
   */
  TaskDetail: {
    taskId: number;
  };

  /**
   * 履歴画面
   * パラメータなし
   */
  History: undefined;
};

/**
 * ナビゲーションプロップの型
 *
 * 各画面コンポーネントのナビゲーションプロパティの型
 *
 * @example
 * import { NativeStackScreenProps } from '@react-navigation/native-stack';
 * import { RootStackParamList } from '@/navigation/types';
 *
 * type TaskListScreenProps = NativeStackScreenProps<RootStackParamList, 'TaskList'>;
 *
 * const TaskListScreen: React.FC<TaskListScreenProps> = ({ navigation, route }) => {
 *   // navigation と route が正しく型付けされる
 * };
 */
