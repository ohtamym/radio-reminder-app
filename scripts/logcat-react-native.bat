@echo off
REM React Native / Expo アプリのログを表示するスクリプト（Windows用）

echo React Native / Expo ログを表示しています...
echo 停止するには Ctrl+C を押してください
echo.

REM エラー、警告、情報レベルのログを表示
adb logcat -v time *:E *:W *:I | findstr /i "reactnative reactnativejs expo error exception"

