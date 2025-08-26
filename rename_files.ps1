# rename_files.ps1

# --- 設定 ---
# このスクリプトは "c:\Users\kageyama\Tools\Webアプリ" に保存して実行してください。
$baseDir = "c:\Users\kageyama\Tools\Webアプリ"
Set-Location $baseDir

# ファイル名の対応表（[古いパス] -> [新しいパス]）
$renameMap = @{
    "my-local-stack\memo-20240825-learnings.html"                     = "my-local-stack\log-20240825-learnings.html";
    "my-local-stack\memo-20240824-misc.html"                                    = "my-local-stack\guide-docker-php-mysql-crud.html";
}

# --- 実行 ---
Write-Host "以下のファイル移動・リネームを実行します。よろしいですか？ (y/n)" -ForegroundColor Cyan
foreach ($oldPath in $renameMap.Keys) {
    Write-Host "  - FROM: $oldPath"
    Write-Host "    TO:   $($renameMap[$oldPath])"
}
$confirmation = Read-Host

if ($confirmation -ne 'y') {
    Write-Host "処理を中断しました。" -ForegroundColor Yellow
    exit
}

Write-Host "----------------------------------------"
Write-Host "処理を開始します..."
Write-Host "----------------------------------------"

# ファイルを移動・リネーム
foreach ($oldPath in $renameMap.Keys) {
    $newPath = $renameMap[$oldPath]
    if (Test-Path $oldPath) {
        try {
            # Move-Item コマンドでファイルの移動とリネームを同時に実行
            Move-Item -Path $oldPath -Destination $newPath -Force -ErrorAction Stop
            Write-Host "[SUCCESS] '$oldPath' -> '$newPath'" -ForegroundColor Green
        } catch {
            Write-Host "[ERROR] '$oldPath' の処理中にエラーが発生しました: $($_.Exception.Message)" -ForegroundColor Red
        }
    } else {
        Write-Host "[NOT FOUND] '$oldPath' は見つかりませんでした。" -ForegroundColor Yellow
    }
}

Write-Host "----------------------------------------"
Write-Host "すべての処理が完了しました。" -ForegroundColor Cyan
