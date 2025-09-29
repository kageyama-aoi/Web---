import os
import glob
import pandas as pd

# ダウンロードフォルダのパス
download_dir = os.path.join(os.path.expanduser("~"), "Downloads")

# ダウンロードフォルダ内のCSVファイル一覧を取得
csv_files = glob.glob(os.path.join(download_dir, "*.csv"))

if not csv_files:
    print("❌ ダウンロードフォルダにCSVファイルが見つかりません。")
else:
    # 最新タイムスタンプのCSVファイルを選ぶ
    latest_csv = max(csv_files, key=os.path.getmtime)

    # 元のファイル名と拡張子を分解
    base_name, _ = os.path.splitext(os.path.basename(latest_csv))

    # 出力ファイル名（変換済みと分かるように "_converted" を付与）
    output_filename = f"{base_name}_converted.tsv"
    output_path = os.path.join(download_dir, output_filename)

    # CSVを読み込み
    df = pd.read_csv(latest_csv)

    # TSVとして保存
    df.to_csv(output_path, sep="\t", index=False)

    print("✅ 変換完了！")
    print(f"入力ファイル: {latest_csv}")
    print(f"出力ファイル: {output_path}")
