#!/bin/bash
# React Native / Expo アプリのログを表示するスクリプト

echo "React Native / Expo ログを表示しています..."
echo "停止するには Ctrl+C を押してください"
echo ""

# エラー、警告、情報レベルのログを表示
adb logcat -v time *:E *:W *:I | grep -i "reactnative\|reactnativejs\|expo\|error\|exception"

