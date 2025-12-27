import tkinter as tk
from tkinter import filedialog, messagebox
from pathlib import Path
import shutil
from datetime import datetime

# ==============================
# 設定値
# ==============================
DOWNLOADS = Path.home() / "Downloads"
DEFAULT_TARGET = Path(
    r"C:\Users\kisar\Documents\git\WEBアプリ\Web---\TEMP_PYTHON\note_auto\notes_html"
)
MAX_ITEMS = 5  # 表示件数（5 / 10 / 20 などに変更可）

# ==============================
# 初期化
# ==============================
DEFAULT_TARGET.mkdir(parents=True, exist_ok=True)

html_files = sorted(
    DOWNLOADS.glob("*.html"),
    key=lambda p: p.stat().st_mtime,
    reverse=True
)[:MAX_ITEMS]

# ==============================
# GUI
# ==============================
root = tk.Tk()
root.title("HTML移動セレクタ（複数選択）")

# --- 移動先ディレクトリ管理 ---
target_dir = tk.StringVar(value=str(DEFAULT_TARGET))

def change_target_dir():
    path = filedialog.askdirectory(
        title="移動先フォルダを選択",
        initialdir=target_dir.get()
    )
    if path:
        target_dir.set(path)

# --- 上部：移動先表示 ---
frame_top = tk.Frame(root)
frame_top.pack(fill="x", padx=10, pady=5)

tk.Label(frame_top, text="移動先フォルダ：").pack(side="left")

tk.Entry(
    frame_top,
    textvariable=target_dir,
    width=80
).pack(side="left", padx=5)

tk.Button(
    frame_top,
    text="設定",
    command=change_target_dir
).pack(side="left")

# --- old退避オプション ---
move_old = tk.BooleanVar(value=True)

frame_option = tk.Frame(root)
frame_option.pack(fill="x", padx=10, pady=5)

tk.Checkbutton(
    frame_option,
    text="移動前に、既存のHTMLを old/ フォルダに退避する",
    variable=move_old
).pack(anchor="w")

# --- 説明 ---
tk.Label(
    root,
    text=f"Downloads 配下の最近の HTML（最大 {MAX_ITEMS} 件）から移動対象を選択してください"
).pack(anchor="w", padx=10, pady=5)

# --- HTMLファイル一覧（チェックボックス） ---
checks = []

for f in html_files:
    var = tk.BooleanVar()
    ts = datetime.fromtimestamp(f.stat().st_mtime).strftime("%Y-%m-%d %H:%M")
    label = f"{ts} | {f.name}"

    chk = tk.Checkbutton(
        root,
        text=label,
        variable=var,
        anchor="w",
        justify="left"
    )
    chk.pack(fill="x", padx=20)

    checks.append((var, f))

# --- 移動処理 ---
def move_files():
    dest = Path(target_dir.get())
    dest.mkdir(parents=True, exist_ok=True)

    # 既存HTMLを old/ に退避
    if move_old.get():
        old_dir = dest / "old"
        old_dir.mkdir(exist_ok=True)

        for existing in dest.glob("*.html"):
            shutil.move(str(existing), str(old_dir / existing.name))

    moved = 0
    for var, f in checks:
        if var.get():
            shutil.move(str(f), str(dest / f.name))
            moved += 1

    messagebox.showinfo(
        "完了",
        f"{moved} 件のファイルを移動しました。"
    )
    root.destroy()

# --- 実行ボタン ---
tk.Button(
    root,
    text="選択したファイルを移動",
    command=move_files,
    height=2
).pack(pady=10)

root.mainloop()
