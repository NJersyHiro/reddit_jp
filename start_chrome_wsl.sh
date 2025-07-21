#!/bin/bash

echo "WSL内でLinux版Chromeをデバッグモードで起動します..."

# WSL内のユーザーデータディレクトリ
# 'th1kh'の部分はご自身のユーザー名に合わせてください
USER_DATA_DIR="/home/th1kh/chrome-debug-wsl"

# Linux版Chromeを起動
# --no-sandboxはWSL環境で必要になる場合があります
google-chrome-stable \
  --remote-debugging-port=9222 \
  --user-data-dir="$USER_DATA_DIR" \
  --no-first-run \
  --no-sandbox > /dev/null 2>&1 &

echo "Chromeの起動を3秒間待機します..."
sleep 3

echo "デバッグポートの接続を確認します... (接続先: http://localhost:9222)"
if curl -s "http://localhost:9222/json/version" --connect-timeout 5 | grep -q "Chrome"; then
  echo "成功: Linux版Chromeのデバッグポートに接続できました！ 🎉"
  echo "このChromeウィンドウは開いたままで、Claudeに指示を出してください。"
else
  echo "失敗: デバッグポートに接続できませんでした。"
fi