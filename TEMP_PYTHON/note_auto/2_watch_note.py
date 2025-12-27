from pathlib import Path
import time
import re
import shutil
from bs4 import BeautifulSoup

# ==============================
# 設定
# ==============================
BASE = Path(__file__).parent

SRC = BASE / "notes_html"

OUT_BASE = BASE / "outputs"
OUT_MD = OUT_BASE / "body_md"
OUT_TXT = OUT_BASE / "body_txt"
OUT_OUTLINE = OUT_BASE / "outline"

OUTPUT_DIRS = [OUT_MD, OUT_TXT, OUT_OUTLINE]

# ==============================
# 初期化
# ==============================
SRC.mkdir(parents=True, exist_ok=True)
for d in OUTPUT_DIRS:
    d.mkdir(parents=True, exist_ok=True)

# ==============================
# ユーティリティ
# ==============================
def archive_existing_outputs():
    """
    各 output ディレクトリ配下の既存ファイルを
    old/ フォルダに退避する
    """
    for out_dir in OUTPUT_DIRS:
        old_dir = out_dir / "old"
        old_dir.mkdir(exist_ok=True)

        for f in out_dir.iterdir():
            if f.is_file():
                shutil.move(str(f), str(old_dir / f.name))


# ==============================
# メインループ
# ==============================
seen = set()
first_run = True

print("watch_note.py 起動中（Ctrl+Cで終了）")

while True:
    html_files = list(SRC.glob("*.html"))

    for html in html_files:
        if html in seen:
            continue

        # --- 初回処理時のみ、既存アウトプットを退避 ---
        if first_run:
            archive_existing_outputs()
            first_run = False

        soup = BeautifulSoup(
            html.read_text(encoding="utf-8", errors="ignore"),
            "lxml"
        )

        # ノイズ除去
        for tag in soup(["script", "style", "noscript"]):
            tag.decompose()

        container = soup.select_one("article.p-article__body") or soup.body
        if container is None:
            print(f"Skip (no body): {html.name}")
            seen.add(html)
            continue

        blocks = []
        headings = []

        for el in container.find_all(["h1", "h2", "h3", "h4", "p", "li"]):
            text = re.sub(r"\s+", " ", el.get_text(" ", strip=True))
            if not text:
                continue

            blocks.append((el.name, text))
            if el.name.startswith("h"):
                headings.append((el.name, text))

        name = html.stem

        # ==============================
        # body_md
        # ==============================
        md_lines = []
        for tag, text in blocks:
            if tag == "h1":
                md_lines += [f"# {text}", ""]
            elif tag == "h2":
                md_lines += [f"## {text}", ""]
            elif tag == "h3":
                md_lines += [f"### {text}", ""]
            elif tag == "h4":
                md_lines += [f"#### {text}", ""]
            elif tag == "li":
                md_lines.append(f"- {text}")
            else:
                md_lines += [text, ""]

        body_md = "\n".join(md_lines).strip() + "\n"
        (OUT_MD / f"{name}.md").write_text(body_md, encoding="utf-8")

        # ==============================
        # body_txt
        # ==============================
        body_txt = re.sub(
            r"^#{1,6}\s+",
            "",
            body_md,
            flags=re.MULTILINE
        )
        (OUT_TXT / f"{name}.txt").write_text(body_txt, encoding="utf-8")

        # ==============================
        # outline
        # ==============================
        outline_lines = []
        for tag, text in headings:
            level = int(tag[1])
            outline_lines.append(
                "  " * (level - 1) + f"- {text}"
            )

        (OUT_OUTLINE / f"{name}.outline.md").write_text(
            "\n".join(outline_lines),
            encoding="utf-8"
        )

        print(f"Processed: {html.name}")
        seen.add(html)

    time.sleep(2)
