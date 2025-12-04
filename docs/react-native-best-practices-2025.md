# React Native ベストプラクティス 2025

## 目次

1. [概要](#概要)
2. [アーキテクチャ](#アーキテクチャ)
3. [プロジェクト構成](#プロジェクト構成)
4. [コーディング規約](#コーディング規約)
5. [パフォーマンス最適化](#パフォーマンス最適化)
6. [状態管理](#状態管理)
7. [テスト](#テスト)
8. [New Architecture対応](#new-architecture対応)
9. [その他のベストプラクティス](#その他のベストプラクティス)

---

## 概要

React Nativeは2015年にMetaによって導入され、JavaScriptとReactを使用してiOSとAndroidの両方のプラットフォームでネイティブアプリを構築できるクロスプラットフォームフレームワークです。

2025年現在、React Nativeは**New Architecture**を標準として採用し、大幅なパフォーマンス向上と開発者体験の改善が実現されています。

### React Native 0.82の主要な変更点

- **New Architectureが唯一のアーキテクチャに**: React Native 0.76以降、New Architectureがデフォルトとなり、0.82では従来のLegacy Architectureが完全に廃止
- **Hermes V1の実験的サポート**: より高速なJavaScriptエンジンのオプション提供
- **React 19.1.1へのアップデート**: 最新のReact機能をサポート
- **DOM Node APIのサポート**: Web開発との互換性向上

---

## アーキテクチャ

### New Architecture の主要コンポーネント

#### 1. JSI (JavaScript Interface)

従来のBridgeアーキテクチャを置き換える同期通信インターフェース。

**特徴:**
- JavaScriptとC++オブジェクト間で直接参照を保持可能
- シリアライゼーションコストの削減
- 同期的なメソッド呼び出しが可能

**メリット:**
- リアルタイムデータ処理の高速化
- ゲーム、AR、IoTダッシュボードなどのパフォーマンス要求の高いアプリに最適

#### 2. Fabric (新しいレンダリングエンジン)

UIの更新とレンダリングを最適化する新しいレンダリングシステム。

**特徴:**
- 同期的なUI更新
- React 18の並行レンダリング機能をサポート
- ネイティブビューとの統合を改善
- 60 FPSの安定した描画性能

**改善点:**
- UI更新時のフレームドロップが大幅に減少
- スクロールやアニメーションの滑らかさが向上

#### 3. TurboModules

ネイティブモジュールの遅延読み込みを可能にする新しいモジュールシステム。

**特徴:**
- 必要な時にのみモジュールを読み込み
- 起動時間の短縮
- メモリ使用量の削減
- 型安全性の向上

**パフォーマンス向上:**
- 初期ロード時間が最大40%改善
- メモリ使用量が20-30%削減

#### 4. Codegen

JavaScriptとネイティブコード間のインターフェースを自動生成するツール。

**メリット:**
- 型安全性の保証
- ヒューマンエラーの削減
- メンテナンスコストの低減

#### 5. Hermes JavaScript Engine

React Native専用に最適化されたJavaScriptエンジン（2025年現在デフォルト）。

**特徴:**
- Ahead-of-Time (AOT)コンパイル
- 起動時間の最大30%短縮
- メモリ使用量の最適化
- バンドルサイズの削減

**有効化方法（React Native 0.82では標準）:**
```javascript
// android/app/build.gradle
project.ext.react = [
    enableHermes: true
]
```

---

## プロジェクト構成

### 推奨フォルダ構造

適切なプロジェクト構造は、スケーラビリティと保守性を向上させる重要な要素です。

#### 基本構造（小規模プロジェクト）

```
MyApp/
├── src/
│   ├── assets/           # 静的ファイル（画像、フォント）
│   │   ├── images/
│   │   └── fonts/
│   ├── components/       # 再利用可能なコンポーネント
│   ├── hooks/           # カスタムフック
│   ├── screens/         # 画面コンポーネント
│   ├── navigation/      # ナビゲーション設定
│   ├── services/        # API通信、外部サービス
│   ├── utils/           # ヘルパー関数
│   ├── types/           # TypeScript型定義
│   └── App.tsx
├── __tests__/          # テストファイル
├── package.json
└── tsconfig.json
```

#### 中・大規模プロジェクト構造

```
MyApp/
├── src/
│   ├── assets/
│   │   ├── images/
│   │   ├── fonts/
│   │   └── icons/
│   ├── components/      # 共通コンポーネント
│   │   ├── atoms/       # 最小単位のコンポーネント（Button、Input等）
│   │   ├── molecules/   # 複数のatomsを組み合わせたコンポーネント
│   │   └── organisms/   # 複雑なUIブロック
│   ├── features/        # 機能別モジュール
│   │   ├── auth/
│   │   │   ├── components/
│   │   │   ├── hooks/
│   │   │   ├── screens/
│   │   │   ├── services/
│   │   │   └── types/
│   │   ├── profile/
│   │   └── dashboard/
│   ├── navigation/
│   │   ├── AppNavigator.tsx
│   │   ├── AuthNavigator.tsx
│   │   └── types.ts
│   ├── services/
│   │   ├── api/
│   │   │   ├── client.ts
│   │   │   ├── interceptors.ts
│   │   │   └── endpoints/
│   │   └── storage/
│   ├── store/           # 状態管理
│   │   ├── slices/
│   │   ├── actions/
│   │   └── store.ts
│   ├── theme/           # テーマ・スタイル設定
│   │   ├── colors.ts
│   │   ├── typography.ts
│   │   ├── spacing.ts
│   │   └── index.ts
│   ├── hooks/           # グローバルカスタムフック
│   ├── utils/           # ユーティリティ関数
│   ├── types/           # グローバル型定義
│   ├── constants/       # 定数定義
│   └── App.tsx
├── __tests__/
│   ├── unit/
│   ├── integration/
│   └── e2e/
├── .env                 # 環境変数
├── package.json
└── tsconfig.json
```

### プロジェクト構造のベストプラクティス

#### 1. 機能ベース vs タイプベース

**機能ベース構造（推奨：大規模プロジェクト）**
- 機能ごとにファイルをグループ化
- モジュールの独立性が高い
- チーム開発に適している

**タイプベース構造（推奨：小規模プロジェクト）**
- ファイルタイプごとにグループ化（components、screens、utils等）
- シンプルで理解しやすい
- 小規模プロジェクトの初期段階に最適

#### 2. Atomic Designパターン

コンポーネントを5つの階層に分類する設計手法。

```
components/
├── atoms/          # 最小単位（Button、Text、Icon等）
├── molecules/      # atomsの組み合わせ（SearchBar、Card等）
├── organisms/      # moleculesの組み合わせ（Header、Form等）
├── templates/      # ページレイアウト
└── pages/          # 完全なページ
```

**メリット:**
- コンポーネントの再利用性が向上
- 一貫性のあるデザインシステムの構築
- チーム間でのコンポーネント理解が容易

**注意点:**
- チーム全体がAtomic Designを理解している必要がある
- 分類の判断が難しい場合がある

#### 3. ファイル命名規則

```typescript
// コンポーネント: PascalCase
UserProfile.tsx
LoginButton.tsx

// フック: camelCase with 'use' prefix
useAuth.ts
useFetchData.ts

// ユーティリティ: camelCase
formatDate.ts
validateEmail.ts

// 定数: UPPER_SNAKE_CASE
API_ENDPOINTS.ts
COLOR_PALETTE.ts

// 型定義: PascalCase with 'Type' or 'Interface' suffix
UserType.ts
ApiResponseInterface.ts
```

---

## コーディング規約

### 1. TypeScriptの使用（必須）

TypeScriptは型安全性を提供し、大規模プロジェクトのメンテナンス性を大幅に向上させます。

**メリット:**
- コンパイル時のエラー検出
- IDEの強力な自動補完機能
- リファクタリングの安全性向上
- 開発効率の向上

**設定例:**

```json
// tsconfig.json
{
  "compilerOptions": {
    "target": "esnext",
    "module": "commonjs",
    "lib": ["es2017"],
    "jsx": "react-native",
    "strict": true,
    "noImplicitAny": true,
    "strictNullChecks": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "resolveJsonModule": true,
    "moduleResolution": "node",
    "allowSyntheticDefaultImports": true
  },
  "exclude": [
    "node_modules",
    "babel.config.js",
    "metro.config.js"
  ]
}
```

**型定義の例:**

```typescript
// types/user.ts
export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  createdAt: Date;
}

export type UserStatus = 'active' | 'inactive' | 'suspended';

export interface UserProfile extends User {
  status: UserStatus;
  bio: string;
  socialLinks: {
    twitter?: string;
    github?: string;
  };
}

// コンポーネントでの使用
import { User } from '@/types/user';

interface UserCardProps {
  user: User;
  onPress: (userId: string) => void;
}

const UserCard: React.FC<UserCardProps> = ({ user, onPress }) => {
  // 実装
};
```

### 2. 関数コンポーネントの使用（必須）

クラスコンポーネントではなく、関数コンポーネントとHooksを使用します。

**理由:**
- シンプルで読みやすいコード
- パフォーマンスの向上
- Hooksの活用が可能
- React 19の最新機能をフル活用

**良い例:**

```typescript
// ✅ 関数コンポーネント + Hooks
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface CounterProps {
  initialCount?: number;
}

const Counter: React.FC<CounterProps> = ({ initialCount = 0 }) => {
  const [count, setCount] = useState(initialCount);

  useEffect(() => {
    console.log(`Count changed: ${count}`);
  }, [count]);

  return (
    <View style={styles.container}>
      <Text style={styles.text}>{count}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  text: {
    fontSize: 24,
  },
});

export default Counter;
```

**悪い例:**

```typescript
// ❌ クラスコンポーネント（非推奨）
import React, { Component } from 'react';
import { View, Text } from 'react-native';

class Counter extends Component {
  constructor(props) {
    super(props);
    this.state = { count: 0 };
  }

  componentDidMount() {
    console.log('Component mounted');
  }

  render() {
    return (
      <View>
        <Text>{this.state.count}</Text>
      </View>
    );
  }
}
```

### 3. プレゼンテーショナルコンポーネントとコンテナコンポーネントの分離

**プレゼンテーショナルコンポーネント（表示専用）:**

```typescript
// components/UserCard.tsx
import React from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';
import { User } from '@/types/user';

interface UserCardProps {
  user: User;
  onPress?: () => void;
}

export const UserCard: React.FC<UserCardProps> = ({ user, onPress }) => {
  return (
    <View style={styles.container}>
      <Image source={{ uri: user.avatar }} style={styles.avatar} />
      <View style={styles.info}>
        <Text style={styles.name}>{user.name}</Text>
        <Text style={styles.email}>{user.email}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    padding: 16,
    backgroundColor: '#fff',
    borderRadius: 8,
    marginBottom: 8,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
  },
  info: {
    marginLeft: 12,
    justifyContent: 'center',
  },
  name: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  email: {
    fontSize: 14,
    color: '#666',
  },
});
```

**コンテナコンポーネント（ロジック担当）:**

```typescript
// features/users/containers/UserListContainer.tsx
import React, { useEffect } from 'react';
import { FlatList } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { UserCard } from '@/components/UserCard';
import { fetchUsers } from '@/store/slices/userSlice';
import { RootState } from '@/store/store';

export const UserListContainer: React.FC = () => {
  const dispatch = useDispatch();
  const { users, loading } = useSelector((state: RootState) => state.users);

  useEffect(() => {
    dispatch(fetchUsers());
  }, [dispatch]);

  const handleUserPress = (userId: string) => {
    // ナビゲーション処理
  };

  return (
    <FlatList
      data={users}
      renderItem={({ item }) => (
        <UserCard 
          user={item} 
          onPress={() => handleUserPress(item.id)} 
        />
      )}
      keyExtractor={(item) => item.id}
      refreshing={loading}
      onRefresh={() => dispatch(fetchUsers())}
    />
  );
};
```

### 4. カスタムフックの活用

ロジックを再利用可能なカスタムフックに抽出します。

```typescript
// hooks/useAuth.ts
import { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { User } from '@/types/user';

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    try {
      const userData = await AsyncStorage.getItem('user');
      if (userData) {
        setUser(JSON.parse(userData));
      }
    } catch (error) {
      console.error('Failed to load user:', error);
    } finally {
      setLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    // ログイン処理
  };

  const logout = async () => {
    await AsyncStorage.removeItem('user');
    setUser(null);
  };

  return { user, loading, login, logout };
};

// 使用例
import { useAuth } from '@/hooks/useAuth';

const ProfileScreen = () => {
  const { user, logout } = useAuth();

  return (
    <View>
      <Text>{user?.name}</Text>
      <Button title="Logout" onPress={logout} />
    </View>
  );
};
```

### 5. スタイリングのベストプラクティス

#### StyleSheetの使用

```typescript
import { StyleSheet } from 'react-native';

// ✅ 良い例: StyleSheetを使用
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  text: {
    fontSize: 16,
    color: '#333',
  },
});

// ❌ 悪い例: インラインスタイル
<View style={{ flex: 1, backgroundColor: '#fff' }}>
  <Text style={{ fontSize: 16, color: '#333' }}>Hello</Text>
</View>
```

#### テーマの定義

```typescript
// theme/colors.ts
export const colors = {
  primary: '#007AFF',
  secondary: '#5856D6',
  success: '#34C759',
  warning: '#FF9500',
  error: '#FF3B30',
  background: '#F2F2F7',
  surface: '#FFFFFF',
  text: {
    primary: '#000000',
    secondary: '#8E8E93',
    disabled: '#C7C7CC',
  },
};

// theme/typography.ts
export const typography = {
  h1: {
    fontSize: 32,
    fontWeight: 'bold' as const,
    lineHeight: 40,
  },
  h2: {
    fontSize: 24,
    fontWeight: 'bold' as const,
    lineHeight: 32,
  },
  body: {
    fontSize: 16,
    lineHeight: 24,
  },
  caption: {
    fontSize: 12,
    lineHeight: 16,
  },
};

// theme/spacing.ts
export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

// theme/index.ts
export { colors } from './colors';
export { typography } from './typography';
export { spacing } from './spacing';

// 使用例
import { colors, typography, spacing } from '@/theme';

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.background,
    padding: spacing.md,
  },
  title: {
    ...typography.h1,
    color: colors.text.primary,
  },
});
```

---

## パフォーマンス最適化

### 1. 不要な再レンダリングの防止

#### React.memoの使用

```typescript
import React, { memo } from 'react';

interface ItemProps {
  title: string;
  description: string;
}

// メモ化により、propsが変更されない限り再レンダリングされない
export const Item = memo<ItemProps>(({ title, description }) => {
  console.log('Item rendered');
  
  return (
    <View>
      <Text>{title}</Text>
      <Text>{description}</Text>
    </View>
  );
});

// カスタム比較関数を使用
export const ItemWithCustomCompare = memo<ItemProps>(
  ({ title, description }) => {
    return (
      <View>
        <Text>{title}</Text>
        <Text>{description}</Text>
      </View>
    );
  },
  (prevProps, nextProps) => {
    // trueを返すと再レンダリングをスキップ
    return prevProps.title === nextProps.title;
  }
);
```

#### useCallbackとuseMemoの活用

```typescript
import React, { useState, useCallback, useMemo } from 'react';
import { FlatList } from 'react-native';

const UserList = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [users, setUsers] = useState<User[]>([]);

  // 関数のメモ化 - 依存配列が変更されない限り同じ参照を保持
  const handleUserPress = useCallback((userId: string) => {
    navigation.navigate('UserDetail', { userId });
  }, [navigation]);

  // 計算結果のメモ化
  const filteredUsers = useMemo(() => {
    return users.filter(user => 
      user.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [users, searchTerm]);

  // 重い計算のメモ化
  const userStats = useMemo(() => {
    return {
      total: users.length,
      active: users.filter(u => u.status === 'active').length,
      inactive: users.filter(u => u.status === 'inactive').length,
    };
  }, [users]);

  return (
    <FlatList
      data={filteredUsers}
      renderItem={({ item }) => (
        <UserCard 
          user={item} 
          onPress={handleUserPress}
        />
      )}
      keyExtractor={(item) => item.id}
    />
  );
};
```

### 2. リストの最適化

#### FlatListのベストプラクティス

```typescript
import React from 'react';
import { FlatList, View, Text, StyleSheet } from 'react-native';

interface Item {
  id: string;
  title: string;
  description: string;
}

const OptimizedList: React.FC<{ data: Item[] }> = ({ data }) => {
  // アイテムレイアウトの事前計算
  const getItemLayout = useCallback(
    (data: Item[] | null | undefined, index: number) => ({
      length: ITEM_HEIGHT,
      offset: ITEM_HEIGHT * index,
      index,
    }),
    []
  );

  // レンダリング最適化
  const renderItem = useCallback(({ item }: { item: Item }) => (
    <ItemComponent item={item} />
  ), []);

  // キーの抽出を最適化
  const keyExtractor = useCallback((item: Item) => item.id, []);

  return (
    <FlatList
      data={data}
      renderItem={renderItem}
      keyExtractor={keyExtractor}
      
      // パフォーマンス最適化設定
      getItemLayout={getItemLayout}
      removeClippedSubviews={true}
      maxToRenderPerBatch={10}
      updateCellsBatchingPeriod={50}
      initialNumToRender={10}
      windowSize={21}
      
      // メモリ使用量の削減
      onEndReachedThreshold={0.5}
    />
  );
};

const ITEM_HEIGHT = 80;
```

#### FlashListの使用（推奨）

```typescript
import { FlashList } from '@shopify/flash-list';

// FlashListは内部的にセルリサイクリングを実装
// FlatListよりも高いパフォーマンスを提供
const OptimizedFlashList = ({ data }: { data: Item[] }) => {
  return (
    <FlashList
      data={data}
      renderItem={({ item }) => <ItemComponent item={item} />}
      estimatedItemSize={80}
      keyExtractor={(item) => item.id}
    />
  );
};
```

### 3. 画像の最適化

```typescript
import FastImage from 'react-native-fast-image';

// ✅ 最適化された画像の使用
const OptimizedImage = ({ uri }: { uri: string }) => {
  return (
    <FastImage
      source={{
        uri,
        priority: FastImage.priority.normal,
        cache: FastImage.cacheControl.immutable,
      }}
      style={styles.image}
      resizeMode={FastImage.resizeMode.cover}
    />
  );
};

// 画像のリサイズとキャッシュ
const ProfileAvatar = ({ userId }: { userId: string }) => {
  const imageUrl = `https://api.example.com/users/${userId}/avatar?size=100`;
  
  return (
    <FastImage
      source={{
        uri: imageUrl,
        priority: FastImage.priority.high,
      }}
      style={styles.avatar}
    />
  );
};

// WebP形式の使用（推奨）
const WebPImage = () => {
  return (
    <FastImage
      source={require('./image.webp')}
      style={styles.image}
    />
  );
};
```

### 4. アニメーションの最適化

#### react-native-reanimatedの使用

```typescript
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
} from 'react-native-reanimated';

// ✅ ネイティブスレッドで実行されるアニメーション
const AnimatedBox = () => {
  const offset = useSharedValue(0);

  const animatedStyles = useAnimatedStyle(() => ({
    transform: [{ translateX: offset.value }],
  }));

  const handlePress = () => {
    offset.value = withSpring(offset.value + 50);
  };

  return (
    <>
      <Animated.View style={[styles.box, animatedStyles]} />
      <Button title="Move" onPress={handlePress} />
    </>
  );
};

// スムーズなスクロールアニメーション
const AnimatedScrollView = () => {
  const scrollY = useSharedValue(0);

  const headerStyle = useAnimatedStyle(() => ({
    opacity: 1 - scrollY.value / 100,
    transform: [{ translateY: -scrollY.value / 2 }],
  }));

  const scrollHandler = useAnimatedScrollHandler((event) => {
    scrollY.value = event.contentOffset.y;
  });

  return (
    <>
      <Animated.View style={[styles.header, headerStyle]}>
        <Text>Header</Text>
      </Animated.View>
      <Animated.ScrollView onScroll={scrollHandler} scrollEventThrottle={16}>
        {/* コンテンツ */}
      </Animated.ScrollView>
    </>
  );
};
```

### 5. Console.logの削除

本番環境ではconsole文を自動的に削除する設定を追加します。

```bash
# babel-plugin-transform-remove-consoleのインストール
npm install --save-dev babel-plugin-transform-remove-console
```

```javascript
// babel.config.js
module.exports = {
  presets: ['module:metro-react-native-babel-preset'],
  plugins: [
    // 本番ビルドでconsole文を削除
    ['transform-remove-console', { exclude: ['error', 'warn'] }],
  ],
};
```

### 6. バンドルサイズの最適化

#### コード分割とLazy Loading

```typescript
import React, { Suspense, lazy } from 'react';
import { ActivityIndicator } from 'react-native';

// コンポーネントの遅延読み込み
const HeavyComponent = lazy(() => import('./HeavyComponent'));

const App = () => {
  return (
    <Suspense fallback={<ActivityIndicator size="large" />}>
      <HeavyComponent />
    </Suspense>
  );
};
```

#### 依存関係の最適化

```bash
# バンドルサイズの分析
npx react-native-bundle-visualizer

# 不要な依存関係の削除
npm uninstall unused-package

# ツリーシェイキングに適したインポート
import { Button } from 'react-native'; // ✅ 良い
import * as RN from 'react-native'; // ❌ 悪い
```

### 7. ネイティブスレッドの活用

```typescript
import { InteractionManager } from 'react-native';

// 重い処理をアニメーション後に実行
const handleNavigation = () => {
  navigation.navigate('NextScreen');
  
  InteractionManager.runAfterInteractions(() => {
    // アニメーション完了後に実行される重い処理
    loadHeavyData();
  });
};
```

---

## 状態管理

### 1. 状態管理の選択

プロジェクトの規模に応じて適切な状態管理ソリューションを選択します。

| 規模 | 推奨ツール | 理由 |
|------|-----------|------|
| 小規模 | Context API + useState | シンプル、学習コストが低い |
| 中規模 | Zustand / Recoil | 軽量、パフォーマンス良好 |
| 大規模 | Redux Toolkit | 成熟、デバッグツール充実 |

### 2. Redux Toolkitの実装例

```typescript
// store/slices/userSlice.ts
import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { User } from '@/types/user';
import { api } from '@/services/api';

interface UserState {
  users: User[];
  currentUser: User | null;
  loading: boolean;
  error: string | null;
}

const initialState: UserState = {
  users: [],
  currentUser: null,
  loading: false,
  error: null,
};

// 非同期アクション
export const fetchUsers = createAsyncThunk(
  'users/fetchUsers',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get<User[]>('/users');
      return response.data;
    } catch (error) {
      return rejectWithValue('Failed to fetch users');
    }
  }
);

export const fetchCurrentUser = createAsyncThunk(
  'users/fetchCurrentUser',
  async (userId: string) => {
    const response = await api.get<User>(`/users/${userId}`);
    return response.data;
  }
);

// スライスの作成
const userSlice = createSlice({
  name: 'users',
  initialState,
  reducers: {
    setCurrentUser: (state, action: PayloadAction<User>) => {
      state.currentUser = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // fetchUsers
      .addCase(fetchUsers.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUsers.fulfilled, (state, action) => {
        state.loading = false;
        state.users = action.payload;
      })
      .addCase(fetchUsers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // fetchCurrentUser
      .addCase(fetchCurrentUser.fulfilled, (state, action) => {
        state.currentUser = action.payload;
      });
  },
});

export const { setCurrentUser, clearError } = userSlice.actions;
export default userSlice.reducer;

// store/store.ts
import { configureStore } from '@reduxjs/toolkit';
import userReducer from './slices/userSlice';

export const store = configureStore({
  reducer: {
    users: userReducer,
    // 他のreducerを追加
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false, // 必要に応じて
    }),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

// hooks/useAppDispatch.ts
import { useDispatch } from 'react-redux';
import { AppDispatch } from '@/store/store';

export const useAppDispatch = () => useDispatch<AppDispatch>();

// コンポーネントでの使用
import { useSelector } from 'react-redux';
import { useAppDispatch } from '@/hooks/useAppDispatch';
import { fetchUsers } from '@/store/slices/userSlice';
import { RootState } from '@/store/store';

const UserListScreen = () => {
  const dispatch = useAppDispatch();
  const { users, loading, error } = useSelector(
    (state: RootState) => state.users
  );

  useEffect(() => {
    dispatch(fetchUsers());
  }, [dispatch]);

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorMessage message={error} />;

  return (
    <FlatList
      data={users}
      renderItem={({ item }) => <UserCard user={item} />}
      keyExtractor={(item) => item.id}
    />
  );
};
```

### 3. Zustandの実装例（軽量な代替）

```typescript
// store/userStore.ts
import create from 'zustand';
import { User } from '@/types/user';
import { api } from '@/services/api';

interface UserStore {
  users: User[];
  currentUser: User | null;
  loading: boolean;
  error: string | null;
  
  fetchUsers: () => Promise<void>;
  setCurrentUser: (user: User) => void;
  clearError: () => void;
}

export const useUserStore = create<UserStore>((set) => ({
  users: [],
  currentUser: null,
  loading: false,
  error: null,

  fetchUsers: async () => {
    set({ loading: true, error: null });
    try {
      const response = await api.get<User[]>('/users');
      set({ users: response.data, loading: false });
    } catch (error) {
      set({ error: 'Failed to fetch users', loading: false });
    }
  },

  setCurrentUser: (user) => set({ currentUser: user }),
  clearError: () => set({ error: null }),
}));

// コンポーネントでの使用
import { useUserStore } from '@/store/userStore';

const UserListScreen = () => {
  const { users, loading, error, fetchUsers } = useUserStore();

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  // レンダリング処理
};
```

### 4. ベストプラクティス

#### ローカル状態とグローバル状態の使い分け

```typescript
// ✅ ローカル状態: 単一コンポーネントでのみ使用
const FormComponent = () => {
  const [inputValue, setInputValue] = useState('');
  const [isValid, setIsValid] = useState(false);
  
  // フォームの状態はこのコンポーネント内のみで使用
};

// ✅ グローバル状態: 複数のコンポーネントで共有
// - ユーザー認証情報
// - テーマ設定
// - 言語設定
// - アプリ全体で使用するデータ

// ❌ 避けるべき: すべてをグローバル状態に入れる
```

#### Reselectを使った派生状態の最適化

```typescript
import { createSelector } from '@reduxjs/toolkit';
import { RootState } from '@/store/store';

// メモ化されたセレクター
export const selectActiveUsers = createSelector(
  [(state: RootState) => state.users.users],
  (users) => users.filter(user => user.status === 'active')
);

export const selectUserStats = createSelector(
  [(state: RootState) => state.users.users],
  (users) => ({
    total: users.length,
    active: users.filter(u => u.status === 'active').length,
    inactive: users.filter(u => u.status === 'inactive').length,
  })
);

// コンポーネントでの使用
const Dashboard = () => {
  const activeUsers = useSelector(selectActiveUsers);
  const stats = useSelector(selectUserStats);
  
  // usersが変更されない限り、再計算されない
};
```

---

## テスト

### 1. テスト戦略

効果的なテスト戦略は、以下の3つのレベルで構成されます。

```
E2Eテスト (5-10%)    ← 最も時間がかかる、最も信頼性が高い
     ↑
統合テスト (20-30%)  ← バランスが良い
     ↑
ユニットテスト (60-70%) ← 最も高速、最も多く書く
```

### 2. ユニットテストの実装

#### セットアップ

```bash
# React Native Testing Libraryとその依存関係のインストール
npm install --save-dev @testing-library/react-native @testing-library/jest-native
```

```javascript
// jest.config.js
module.exports = {
  preset: 'react-native',
  setupFilesAfterEnv: ['@testing-library/jest-native/extend-expect'],
  transformIgnorePatterns: [
    'node_modules/(?!(react-native|@react-native|@react-navigation)/)',
  ],
  collectCoverageFrom: [
    'src/**/*.{ts,tsx}',
    '!src/**/*.d.ts',
    '!src/**/*.stories.tsx',
  ],
};
```

#### コンポーネントのテスト

```typescript
// __tests__/components/Button.test.tsx
import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { Button } from '@/components/Button';

describe('Button Component', () => {
  it('renders correctly with title', () => {
    const { getByText } = render(<Button title="Click me" onPress={() => {}} />);
    expect(getByText('Click me')).toBeTruthy();
  });

  it('calls onPress when pressed', () => {
    const onPressMock = jest.fn();
    const { getByText } = render(<Button title="Click me" onPress={onPressMock} />);
    
    fireEvent.press(getByText('Click me'));
    expect(onPressMock).toHaveBeenCalledTimes(1);
  });

  it('disables button when disabled prop is true', () => {
    const onPressMock = jest.fn();
    const { getByText } = render(
      <Button title="Click me" onPress={onPressMock} disabled />
    );
    
    const button = getByText('Click me').parent;
    expect(button).toBeDisabled();
  });

  it('renders loading state', () => {
    const { getByTestId } = render(
      <Button title="Click me" onPress={() => {}} loading />
    );
    
    expect(getByTestId('loading-indicator')).toBeTruthy();
  });
});
```

#### カスタムフックのテスト

```typescript
// __tests__/hooks/useAuth.test.ts
import { renderHook, act } from '@testing-library/react-hooks';
import { useAuth } from '@/hooks/useAuth';
import AsyncStorage from '@react-native-async-storage/async-storage';

jest.mock('@react-native-async-storage/async-storage');

describe('useAuth Hook', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('loads user from storage on mount', async () => {
    const mockUser = { id: '1', name: 'John Doe', email: 'john@example.com' };
    (AsyncStorage.getItem as jest.Mock).mockResolvedValue(JSON.stringify(mockUser));

    const { result, waitForNextUpdate } = renderHook(() => useAuth());

    expect(result.current.loading).toBe(true);
    await waitForNextUpdate();
    
    expect(result.current.user).toEqual(mockUser);
    expect(result.current.loading).toBe(false);
  });

  it('handles login correctly', async () => {
    const { result } = renderHook(() => useAuth());

    await act(async () => {
      await result.current.login('john@example.com', 'password');
    });

    expect(result.current.user).not.toBeNull();
    expect(AsyncStorage.setItem).toHaveBeenCalled();
  });

  it('handles logout correctly', async () => {
    const { result } = renderHook(() => useAuth());

    await act(async () => {
      await result.current.logout();
    });

    expect(result.current.user).toBeNull();
    expect(AsyncStorage.removeItem).toHaveBeenCalledWith('user');
  });
});
```

#### API呼び出しのテスト

```typescript
// __tests__/services/userService.test.ts
import { fetchUsers, createUser } from '@/services/userService';
import { api } from '@/services/api';

jest.mock('@/services/api');

describe('User Service', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('fetchUsers', () => {
    it('successfully fetches users', async () => {
      const mockUsers = [
        { id: '1', name: 'John', email: 'john@example.com' },
        { id: '2', name: 'Jane', email: 'jane@example.com' },
      ];

      (api.get as jest.Mock).mockResolvedValue({ data: mockUsers });

      const users = await fetchUsers();

      expect(api.get).toHaveBeenCalledWith('/users');
      expect(users).toEqual(mockUsers);
    });

    it('handles error when fetch fails', async () => {
      const errorMessage = 'Network Error';
      (api.get as jest.Mock).mockRejectedValue(new Error(errorMessage));

      await expect(fetchUsers()).rejects.toThrow(errorMessage);
    });
  });

  describe('createUser', () => {
    it('successfully creates a user', async () => {
      const newUser = { name: 'John', email: 'john@example.com' };
      const createdUser = { id: '1', ...newUser };

      (api.post as jest.Mock).mockResolvedValue({ data: createdUser });

      const result = await createUser(newUser);

      expect(api.post).toHaveBeenCalledWith('/users', newUser);
      expect(result).toEqual(createdUser);
    });
  });
});
```

#### Redux Storeのテスト

```typescript
// __tests__/store/userSlice.test.ts
import { configureStore } from '@reduxjs/toolkit';
import userReducer, { 
  fetchUsers, 
  setCurrentUser 
} from '@/store/slices/userSlice';
import { api } from '@/services/api';

jest.mock('@/services/api');

describe('User Slice', () => {
  let store: ReturnType<typeof configureStore>;

  beforeEach(() => {
    store = configureStore({
      reducer: {
        users: userReducer,
      },
    });
  });

  it('handles setCurrentUser', () => {
    const user = { id: '1', name: 'John', email: 'john@example.com' };
    
    store.dispatch(setCurrentUser(user));
    
    expect(store.getState().users.currentUser).toEqual(user);
  });

  it('handles fetchUsers pending state', () => {
    store.dispatch(fetchUsers.pending('', undefined));
    
    expect(store.getState().users.loading).toBe(true);
    expect(store.getState().users.error).toBeNull();
  });

  it('handles fetchUsers fulfilled state', async () => {
    const mockUsers = [
      { id: '1', name: 'John', email: 'john@example.com' },
    ];

    (api.get as jest.Mock).mockResolvedValue({ data: mockUsers });

    await store.dispatch(fetchUsers());

    expect(store.getState().users.users).toEqual(mockUsers);
    expect(store.getState().users.loading).toBe(false);
  });
});
```

### 3. スナップショットテスト

```typescript
// __tests__/components/UserCard.test.tsx
import React from 'react';
import renderer from 'react-test-renderer';
import { UserCard } from '@/components/UserCard';

describe('UserCard Snapshot', () => {
  it('renders correctly', () => {
    const user = {
      id: '1',
      name: 'John Doe',
      email: 'john@example.com',
      avatar: 'https://example.com/avatar.jpg',
    };

    const tree = renderer
      .create(<UserCard user={user} onPress={() => {}} />)
      .toJSON();

    expect(tree).toMatchSnapshot();
  });
});
```

### 4. E2Eテスト（Detox）

```bash
# Detoxのインストール
npm install --save-dev detox
```

```javascript
// e2e/firstTest.e2e.js
describe('Login Flow', () => {
  beforeAll(async () => {
    await device.launchApp();
  });

  beforeEach(async () => {
    await device.reloadReactNative();
  });

  it('should show login screen', async () => {
    await expect(element(by.id('login-screen'))).toBeVisible();
  });

  it('should login successfully', async () => {
    await element(by.id('email-input')).typeText('user@example.com');
    await element(by.id('password-input')).typeText('password123');
    await element(by.id('login-button')).tap();
    
    await expect(element(by.id('home-screen'))).toBeVisible();
  });

  it('should show error for invalid credentials', async () => {
    await element(by.id('email-input')).typeText('invalid@example.com');
    await element(by.id('password-input')).typeText('wrong');
    await element(by.id('login-button')).tap();
    
    await expect(element(by.text('Invalid credentials'))).toBeVisible();
  });
});
```

### 5. テストのベストプラクティス

```typescript
// ✅ 良いテスト
describe('UserProfile', () => {
  it('displays user name and email', () => {
    const user = { name: 'John', email: 'john@example.com' };
    const { getByText } = render(<UserProfile user={user} />);
    
    expect(getByText('John')).toBeTruthy();
    expect(getByText('john@example.com')).toBeTruthy();
  });
});

// ❌ 悪いテスト（実装の詳細に依存）
it('has correct state', () => {
  const wrapper = shallow(<UserProfile />);
  expect(wrapper.state('username')).toBe('John');
});

// ✅ ユーザーの視点でテスト
it('submits form when button is clicked', async () => {
  const onSubmit = jest.fn();
  const { getByPlaceholderText, getByText } = render(
    <LoginForm onSubmit={onSubmit} />
  );

  fireEvent.changeText(
    getByPlaceholderText('Email'),
    'user@example.com'
  );
  fireEvent.changeText(
    getByPlaceholderText('Password'),
    'password123'
  );
  fireEvent.press(getByText('Login'));

  await waitFor(() => {
    expect(onSubmit).toHaveBeenCalledWith({
      email: 'user@example.com',
      password: 'password123',
    });
  });
});
```

### 6. テストカバレッジ

```json
// package.json
{
  "scripts": {
    "test": "jest",
    "test:watch": "jest --watch",
    "test:coverage": "jest --coverage"
  },
  "jest": {
    "coverageThreshold": {
      "global": {
        "branches": 70,
        "functions": 70,
        "lines": 70,
        "statements": 70
      }
    }
  }
}
```

---

## New Architecture対応

### 1. New Architectureへの移行

#### 前提条件

- React Native 0.76以降を使用（New Architectureがデフォルト）
- 既存プロジェクトの場合: まずReact Native 0.81に移行してNew Architectureを有効化
- サードパーティライブラリの互換性を確認

#### 有効化方法（React Native 0.76未満の場合）

```javascript
// android/gradle.properties
newArchEnabled=true

// iOS（Podfileから実行）
RCT_NEW_ARCH_ENABLED=1 pod install
```

#### Expo プロジェクトでの有効化

```json
// app.json
{
  "expo": {
    "plugins": [
      [
        "expo-build-properties",
        {
          "ios": {
            "newArchEnabled": true
          },
          "android": {
            "newArchEnabled": true
          }
        }
      ]
    ]
  }
}
```

### 2. TurboModulesの作成

```typescript
// NativeMyModule.ts
import type { TurboModule } from 'react-native';
import { TurboModuleRegistry } from 'react-native';

export interface Spec extends TurboModule {
  getString(input: string): string;
  getNumber(input: number): number;
  getBoolean(input: boolean): boolean;
  getArray(input: Array<any>): Array<any>;
  getObject(input: Object): Object;
  getValueWithCallback(callback: (value: string) => void): void;
  getValueWithPromise(error: boolean): Promise<string>;
}

export default TurboModuleRegistry.get<Spec>('MyModule') as Spec | null;

// MyModule.ts（使用側）
import NativeMyModule from './NativeMyModule';

export function getString(input: string): string {
  return NativeMyModule?.getString(input) ?? '';
}

export function getValueWithPromise(error: boolean): Promise<string> {
  return NativeMyModule?.getValueWithPromise(error) ?? Promise.resolve('');
}
```

### 3. Fabricコンポーネントの作成

```typescript
// MyComponentNativeComponent.ts
import codegenNativeComponent from 'react-native/Libraries/Utilities/codegenNativeComponent';
import type { ViewProps } from 'react-native';
import type { HostComponent } from 'react-native';

interface NativeProps extends ViewProps {
  color?: string;
  opacity?: number;
}

export default codegenNativeComponent<NativeProps>(
  'MyComponent'
) as HostComponent<NativeProps>;
```

### 4. 移行時の一般的な問題と解決策

#### 問題1: 状態のバッチング

New Architectureでは状態更新が同期的にバッチ処理されます。

```typescript
// ✅ 解決策: useState の関数形式を使用
const [count, setCount] = useState(0);

const increment = () => {
  setCount(prev => prev + 1); // 前の状態に基づいて更新
  setCount(prev => prev + 1);
  // 最終的に count は 2 増える
};

// ❌ 問題: 直接値を設定
const incrementBad = () => {
  setCount(count + 1);
  setCount(count + 1);
  // 両方が同じ値を使用するため、1しか増えない
};
```

#### 問題2: UIManagerの変更

```typescript
// ❌ 古いアプローチ
import { UIManager, findNodeHandle } from 'react-native';

UIManager.measure(findNodeHandle(ref.current), (x, y, width, height) => {
  // 処理
});

// ✅ 新しいアプローチ
ref.current?.measure((x, y, width, height, pageX, pageY) => {
  // 処理
});
```

#### 問題3: react-native-reanimatedのパフォーマンス

```typescript
// react-native-reanimated 3.x以降を使用
npm install react-native-reanimated@latest

// babel.config.js
module.exports = {
  plugins: [
    'react-native-reanimated/plugin', // 必ず最後に配置
  ],
};
```

### 5. パフォーマンス最適化

#### JSIを活用した直接通信

```typescript
import { NativeModules } from 'react-native';

// JSI経由での高速な同期呼び出し
const { MyJSIModule } = NativeModules;

// 同期的なデータ取得（Legacy Bridgeよりも高速）
const data = MyJSIModule.getDataSync();
```

#### Fabric対応のスタイル最適化

```typescript
// StyleSheetを使用してFabricの最適化を活用
import { StyleSheet } from 'react-native';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    // Fabricが効率的に処理
  },
});

// 動的スタイルの場合もStyleSheetを使用
const dynamicStyles = StyleSheet.create({
  box: (color: string) => ({
    backgroundColor: color,
  }),
});
```

### 6. 互換性チェック

```bash
# React Native Directoryを使用した依存関係チェック
npx expo-doctor

# または手動でチェック
npm ls react-native
```

### 7. デバッグ

```typescript
// Flipperでの新しいアーキテクチャのデバッグ
// android/app/src/debug/java/com/yourapp/ReactNativeFlipper.java

import com.facebook.react.ReactInstanceManager;

public class ReactNativeFlipper {
  public static void initializeFlipper(
    Context context,
    ReactInstanceManager reactInstanceManager
  ) {
    // Flipper初期化コード
  }
}
```

---

## その他のベストプラクティス

### 1. セキュリティ

#### 機密情報の保護

```bash
# react-native-dotenvのインストール
npm install react-native-dotenv
```

```javascript
// babel.config.js
module.exports = {
  plugins: [
    [
      'module:react-native-dotenv',
      {
        moduleName: '@env',
        path: '.env',
      },
    ],
  ],
};

// .env
API_KEY=your_api_key_here
API_URL=https://api.example.com

// 使用
import { API_KEY, API_URL } from '@env';

console.log(API_URL); // https://api.example.com
```

#### セキュアストレージの使用

```bash
npm install react-native-keychain
```

```typescript
import * as Keychain from 'react-native-keychain';

// 認証情報の保存
const saveCredentials = async (username: string, password: string) => {
  await Keychain.setGenericPassword(username, password);
};

// 認証情報の取得
const getCredentials = async () => {
  const credentials = await Keychain.getGenericPassword();
  if (credentials) {
    return {
      username: credentials.username,
      password: credentials.password,
    };
  }
  return null;
};

// 認証情報の削除
const deleteCredentials = async () => {
  await Keychain.resetGenericPassword();
};
```

### 2. ナビゲーション

#### React Navigation 6.xのベストプラクティス

```typescript
// navigation/types.ts
import { NativeStackScreenProps } from '@react-navigation/native-stack';

export type RootStackParamList = {
  Home: undefined;
  Profile: { userId: string };
  Settings: undefined;
};

export type HomeScreenProps = NativeStackScreenProps<
  RootStackParamList,
  'Home'
>;
export type ProfileScreenProps = NativeStackScreenProps<
  RootStackParamList,
  'Profile'
>;

// navigation/AppNavigator.tsx
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { HomeScreen } from '@/screens/HomeScreen';
import { ProfileScreen } from '@/screens/ProfileScreen';
import { RootStackParamList } from './types';

const Stack = createNativeStackNavigator<RootStackParamList>();

export const AppNavigator = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="Home"
        screenOptions={{
          headerStyle: {
            backgroundColor: '#007AFF',
          },
          headerTintColor: '#fff',
          headerTitleStyle: {
            fontWeight: 'bold',
          },
        }}
      >
        <Stack.Screen 
          name="Home" 
          component={HomeScreen}
          options={{ title: 'ホーム' }}
        />
        <Stack.Screen 
          name="Profile" 
          component={ProfileScreen}
          options={({ route }) => ({ 
            title: `${route.params.userId}のプロフィール` 
          })}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

// screens/HomeScreen.tsx
import React from 'react';
import { View, Button } from 'react-native';
import { HomeScreenProps } from '@/navigation/types';

export const HomeScreen: React.FC<HomeScreenProps> = ({ navigation }) => {
  return (
    <View>
      <Button
        title="プロフィールへ"
        onPress={() => navigation.navigate('Profile', { userId: 'user123' })}
      />
    </View>
  );
};
```

### 3. 国際化（i18n）

```bash
npm install react-i18next i18next
```

```typescript
// i18n/config.ts
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import en from './locales/en.json';
import ja from './locales/ja.json';

i18n.use(initReactI18next).init({
  resources: {
    en: { translation: en },
    ja: { translation: ja },
  },
  lng: 'ja',
  fallbackLng: 'en',
  interpolation: {
    escapeValue: false,
  },
});

export default i18n;

// locales/en.json
{
  "welcome": "Welcome",
  "greeting": "Hello, {{name}}!",
  "button": {
    "submit": "Submit",
    "cancel": "Cancel"
  }
}

// locales/ja.json
{
  "welcome": "ようこそ",
  "greeting": "こんにちは、{{name}}さん!",
  "button": {
    "submit": "送信",
    "cancel": "キャンセル"
  }
}

// App.tsx
import './i18n/config';

// 使用例
import { useTranslation } from 'react-i18next';

const HomeScreen = () => {
  const { t, i18n } = useTranslation();

  return (
    <View>
      <Text>{t('welcome')}</Text>
      <Text>{t('greeting', { name: 'John' })}</Text>
      <Button title={t('button.submit')} onPress={() => {}} />
      
      <Button
        title="Switch to English"
        onPress={() => i18n.changeLanguage('en')}
      />
    </View>
  );
};
```

### 4. エラーハンドリング

```typescript
// utils/errorHandler.ts
import { Alert } from 'react-native';

export class AppError extends Error {
  constructor(
    message: string,
    public code?: string,
    public statusCode?: number
  ) {
    super(message);
    this.name = 'AppError';
  }
}

export const handleError = (error: unknown) => {
  if (error instanceof AppError) {
    Alert.alert('エラー', error.message);
    // エラーログサービスに送信
    logError(error);
  } else if (error instanceof Error) {
    Alert.alert('予期しないエラー', error.message);
    logError(error);
  } else {
    Alert.alert('エラー', '不明なエラーが発生しました');
  }
};

const logError = (error: Error) => {
  // Sentryなどのエラー追跡サービスに送信
  console.error(error);
};

// コンポーネントでの使用
import { handleError } from '@/utils/errorHandler';

const fetchData = async () => {
  try {
    const response = await api.get('/data');
    return response.data;
  } catch (error) {
    handleError(error);
  }
};
```

#### Error Boundaryの実装

```typescript
// components/ErrorBoundary.tsx
import React, { Component, ReactNode } from 'react';
import { View, Text, Button, StyleSheet } from 'react-native';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
    // エラーログサービスに送信
  }

  handleReset = () => {
    this.setState({ hasError: false, error: undefined });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <View style={styles.container}>
          <Text style={styles.title}>エラーが発生しました</Text>
          <Text style={styles.message}>
            {this.state.error?.message || '不明なエラー'}
          </Text>
          <Button title="再試行" onPress={this.handleReset} />
        </View>
      );
    }

    return this.props.children;
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  message: {
    fontSize: 16,
    color: '#666',
    marginBottom: 20,
    textAlign: 'center',
  },
});

// App.tsx
import { ErrorBoundary } from '@/components/ErrorBoundary';

const App = () => {
  return (
    <ErrorBoundary>
      <AppNavigator />
    </ErrorBoundary>
  );
};
```

### 5. ディープリンク

```typescript
// utils/linking.ts
import { Linking } from 'react-native';

const config = {
  screens: {
    Home: '',
    Profile: 'profile/:userId',
    Settings: 'settings',
  },
};

export const linking = {
  prefixes: ['myapp://', 'https://myapp.com'],
  config,
};

// App.tsx
import { NavigationContainer } from '@react-navigation/native';
import { linking } from '@/utils/linking';

const App = () => {
  return (
    <NavigationContainer linking={linking}>
      <AppNavigator />
    </NavigationContainer>
  );
};

// ディープリンクの処理
const handleDeepLink = async () => {
  const url = await Linking.getInitialURL();
  if (url) {
    // URLを処理
    console.log('Initial URL:', url);
  }

  // URLの変更を監視
  Linking.addEventListener('url', ({ url }) => {
    console.log('URL changed:', url);
  });
};
```

### 6. コード品質ツール

#### ESLintの設定

```bash
npm install --save-dev @react-native-community/eslint-config
```

```json
// .eslintrc.js
module.exports = {
  root: true,
  extends: '@react-native-community',
  parser: '@typescript-eslint/parser',
  plugins: ['@typescript-eslint'],
  rules: {
    'react-hooks/exhaustive-deps': 'warn',
    '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
    'no-console': ['warn', { allow: ['warn', 'error'] }],
  },
};
```

#### Prettierの設定

```json
// .prettierrc
{
  "arrowParens": "avoid",
  "bracketSameLine": true,
  "bracketSpacing": true,
  "singleQuote": true,
  "trailingComma": "es5",
  "tabWidth": 2,
  "semi": true,
  "printWidth": 100
}
```

### 7. CI/CD

#### GitHub Actionsの例

```yaml
# .github/workflows/ci.yml
name: CI

on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main, develop ]

jobs:
  test:
    runs-on: ubuntu-latest
    
    steps:
    - uses: actions/checkout@v3
    
    - name: Setup Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '18'
        cache: 'npm'
    
    - name: Install dependencies
      run: npm ci
    
    - name: Run linter
      run: npm run lint
    
    - name: Run tests
      run: npm test -- --coverage
    
    - name: Upload coverage
      uses: codecov/codecov-action@v3

  build-android:
    runs-on: ubuntu-latest
    needs: test
    
    steps:
    - uses: actions/checkout@v3
    
    - name: Setup Java
      uses: actions/setup-java@v3
      with:
        distribution: 'temurin'
        java-version: '17'
    
    - name: Setup Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '18'
    
    - name: Install dependencies
      run: npm ci
    
    - name: Build Android
      run: |
        cd android
        ./gradlew assembleRelease

  build-ios:
    runs-on: macos-latest
    needs: test
    
    steps:
    - uses: actions/checkout@v3
    
    - name: Setup Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '18'
    
    - name: Install dependencies
      run: npm ci
    
    - name: Install Pods
      run: |
        cd ios
        pod install
    
    - name: Build iOS
      run: |
        cd ios
        xcodebuild -workspace MyApp.xcworkspace \
          -scheme MyApp \
          -configuration Release \
          -sdk iphoneos \
          build
```

---

## まとめ

React Native開発における2025年のベストプラクティスは以下の点に集約されます。

### 重要なポイント

1. **New Architectureの採用**: JSI、Fabric、TurboModulesによる高速化
2. **TypeScriptの必須化**: 型安全性による開発効率とコード品質の向上
3. **関数コンポーネント + Hooks**: モダンなReactパターンの採用
4. **適切なプロジェクト構造**: スケーラブルで保守しやすいコードベース
5. **パフォーマンス最適化**: メモ化、リスト最適化、画像最適化
6. **包括的なテスト**: ユニット、統合、E2Eテストの実装
7. **状態管理の最適化**: プロジェクト規模に応じた適切なツール選択
8. **セキュリティとエラーハンドリング**: 堅牢なアプリケーションの構築

### 継続的な学習

React Nativeエコシステムは常に進化しています。以下のリソースを活用して最新情報を入手してください。

- [React Native公式ドキュメント](https://reactnative.dev/)
- [React Native Blog](https://reactnative.dev/blog)
- [React Native Directory](https://reactnative.directory/)
- [Expo Documentation](https://docs.expo.dev/)

---

**最終更新**: 2025年12月

このガイドは、React Native 0.82および最新のエコシステムに基づいています。
