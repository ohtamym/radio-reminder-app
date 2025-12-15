import { registerRootComponent } from 'expo';
// react-native-screensを明示的にインポート（Androidでの型エラー対策）
import 'react-native-screens';
// グローバルエラーハンドラーを設定
import {
  setupGlobalErrorHandler,
  setupPromiseRejectionHandler,
} from './src/utils/globalErrorHandler';

// グローバルエラーハンドラーを設定（ErrorBoundaryではキャッチできないエラーもキャッチ）
setupGlobalErrorHandler();
setupPromiseRejectionHandler();

import App from './App';

// registerRootComponent calls AppRegistry.registerComponent('main', () => App);
// It also ensures that whether you load the app in Expo Go or in a native build,
// the environment is set up appropriately
registerRootComponent(App);
