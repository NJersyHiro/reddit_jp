#!/bin/bash

echo "Windows上のChromeをデバッグモードで起動します..."

# WindowsホストのIPアドレスをより確実な方法で取得
HOST_IP=192.168.1.209

if [ -z "$HOST_IP" ]; then
    echo "エラー: WindowsホストのIPアドレスが取得できませんでした。"
    exit 1
fi

echo "WindowsホストのIPアドレスを $HOST_IP として検出しました。"

# WindowsのChrome実行ファイルのパス
CHROME_PATH="/mnt/c/Program Files/Google/Chrome/Application/chrome.exe"

# デバッグ用プロファイルの保存先 (Windowsのパス形式)
# ユーザーの環境に合わせています
USER_DATA_DIR="C:\\Users\\th1kh\\chrome-debug"

# Chromeを起動
"$CHROME_PATH" \
  --remote-debugging-port=9222 \
  --user-data-dir="$USER_DATA_DIR" \
  --no-first-run \
  --no-default-browser-check > /dev/null 2>&1 &

echo "Chromeの起動を3秒間待機します..."
sleep 3

# ★★★ ポート番号を9222に修正 ★★★
echo "デバッグポートの接続を確認します... (接続先: http://$HOST_IP:9222)"
if curl -s "http://$HOST_IP:9222/json/version" --connect-timeout 5 | grep -q "Chrome"; then
  echo "成功: Chromeのデバッグポートに接続できました！"
  echo "このChromeウィンドウは開いたままで、Claudeに指示を出してください。"
else
  echo "失敗: Chromeのデバッグポートに接続できませんでした。"
fi