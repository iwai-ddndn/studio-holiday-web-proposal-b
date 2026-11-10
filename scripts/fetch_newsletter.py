#!/usr/bin/env python3
"""SubstackのRSSフィードを取得して data/newsletter.json を生成する。

GitHub Actions（.github/workflows/newsletter-sync.yml）から日次で実行され、
変更があればコミットされる。ローカルで手動実行してもよい:

    python3 scripts/fetch_newsletter.py
"""
import json
import pathlib
import re
import subprocess

FEED_URL = "https://substack.studioholiday.jp/feed"
OUT = pathlib.Path(__file__).resolve().parent.parent / "data" / "newsletter.json"
MAX_POSTS = 10


def text_of(block: str, tag: str) -> str:
    m = re.search(rf"<{tag}>(?:<!\[CDATA\[)?(.*?)(?:\]\]>)?</{tag}>", block, re.S)
    return (m.group(1).strip() if m else "")


def main() -> None:
    # urllibだと環境によってはSSL証明書が見つからないため、curlで取得する
    xml = subprocess.run(
        ["curl", "-sfL", "--max-time", "30", "-A", "sthl-newsletter-sync", FEED_URL],
        capture_output=True, text=True, check=True,
    ).stdout

    posts = []
    for block in re.findall(r"<item>(.*?)</item>", xml, re.S)[:MAX_POSTS]:
        title = text_of(block, "title")
        link = text_of(block, "link")
        if title and link:
            posts.append({"title": title, "url": link})

    if not posts:  # フィードが空・形式変更などの場合は既存JSONを壊さない
        raise SystemExit("no posts parsed; keeping existing JSON")

    OUT.parent.mkdir(parents=True, exist_ok=True)
    OUT.write_text(
        json.dumps({"source": FEED_URL, "posts": posts}, ensure_ascii=False, indent=2) + "\n",
        encoding="utf-8",
    )
    print(f"wrote {OUT.relative_to(OUT.parent.parent)} ({len(posts)} posts)")


if __name__ == "__main__":
    main()
