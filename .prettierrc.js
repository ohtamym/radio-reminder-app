module.exports = {
  // 基本設定
  semi: true, // セミコロンを使用
  trailingComma: 'es5', // ES5準拠の末尾カンマ
  singleQuote: true, // シングルクォートを使用
  printWidth: 100, // 1行の最大文字数
  tabWidth: 2, // インデント幅
  useTabs: false, // スペースを使用

  // React/JSX設定
  jsxSingleQuote: false, // JSXではダブルクォート
  bracketSameLine: false, // JSXの閉じタグは改行
  arrowParens: 'always', // アロー関数の引数を常に括弧で囲む

  // その他
  endOfLine: 'auto', // 改行コードを自動判定
  bracketSpacing: true, // オブジェクトリテラルの括弧内にスペース
};
