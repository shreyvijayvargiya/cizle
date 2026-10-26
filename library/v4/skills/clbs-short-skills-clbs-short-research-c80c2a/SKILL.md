---
name: clbs-short-research
description: ショート動画（YouTube Shorts / TikTok / Instagram Reels）の異常値（バズ動画）を媒体横断でリサーチし、特に「冒頭1〜2秒のフック（何が写り・何を喋り・どんなテロップか）」を最重視して解剖・モデリングする汎用スキル。YouTube/TikTokはチャンネルURLだけで自動取得（自己セットアップでyt-dlp/ffmpegを用意→異常値ランク・冒頭フレーム・字幕・コメントを自動収集→Claudeがvision解析）、Instagramは手動スクショ。報告書は媒体別に分けて出力する。「ショートリサーチ」「ショート動画リサーチ」「TikTokリサーチ」「リールリサーチ」「Shortsリサーチ」「ショート競合分析」「バズショート分析」「フック分析」「冒頭2秒分析」「ショートの異常値を見つけて」などのキーワードで必ず使用すること。長尺YouTube本編のリサーチは `clbs-youtube-research`、ショート台本作成は `clbs-short-script`、Takumi量子論専用のショート台本は `clbs-video-script-short` を使う。後段の `clbs-short-script` に `04_short_research_summary.yaml` を渡して企画・台本の精度を上げる前段スキル。
---

# clbs-short-research — ショート動画リサーチ＆冒頭フック解剖（汎用）

# v2.0 — 媒体横断（YouTube Shorts / TikTok / Instagram Reels）の異常値を、
#         「冒頭1〜2秒フック」を心臓部として解剖し、媒体別に整理する前段スキル。
#   方針: ① YouTube/TikTok は自動取得（自己セットアップ付き）、Instagram は手動スクショ
#         ② 媒体別レポート（どの媒体での結果かを必ず分ける）
#         ③ 冒頭フック最重視（何が写る × 何を喋る × テロップ を分解）

## 位置づけ

ショート動画の企画・台本を作る前段のリサーチスキル。
リサーチ → 異常値の冒頭フック解剖 → モデリング材料整理までを担当する。
企画立案・台本執筆そのものは `clbs-short-script`（汎用）/ `clbs-video-script-short`（Takumi専用）に引き渡す。

| このスキルがやること | やらないこと |
|---|---|
| 媒体横断で異常値を特定し冒頭フックを解剖 | 企画10案出し・台本執筆（→ `clbs-short-script`） |
| 媒体別レポート＋引き渡しYAML作成 | 長尺YouTube本編の分析（→ `clbs-youtube-research`） |
| フック型・テロップ・モデリング元の言語化 | 動画編集（`clbs-short-edit`・後日作成） |

### 出力ファイル（プロジェクトの `research/` 配下）

| ファイル | 内容 |
|---|---|
| `01_landscape.md` | 媒体横断の全体像（各媒体のポジショニング・伸び方の違い） |
| `02_hook_teardown_youtube.md` | **YouTube Shorts** の異常値の冒頭フック解剖（媒体別） |
| `02_hook_teardown_tiktok.md` | **TikTok** の異常値の冒頭フック解剖（媒体別） |
| `02_hook_teardown_instagram.md` | **Instagram Reels** の異常値の冒頭フック解剖（媒体別） |
| `03_viral_modeling.md` | 媒体横断のバズ方程式・モデリングすべき型 |
| `04_short_research_summary.yaml` | 後段 `clbs-short-script` への統合サマリ（フックライブラリ込み） |

> 媒体別ファイルは、その媒体の異常値が無ければ作らなくてよい（`01_landscape.md` に「未取得」と明記）。

---

## 取得方式：媒体ごとに最適な方を使う

| 媒体 | 方式 | 何が自動か |
|---|---|---|
| **YouTube Shorts** | **自動**（`_tools/`） | チャンネルURLだけで 異常値ランク・冒頭フレーム・字幕(=冒頭セリフ)・コメント・カバー を自動取得 |
| **TikTok** | **半自動**（`_tools/`） | 動画URLで 冒頭フレーム・カバーは自動。再生数/コメントは不安定→一部スクショ補完 |
| **Instagram Reels** | **手動スクショ** | ログインの壁で自動不可。ユーザーが冒頭スクショ＋冒頭セリフを送る |

### 自己セットアップ（受講生でも導入不要にする仕組み）

自動取得は `yt-dlp`（必須）と `ffmpeg`（任意）を使う。エージェントが**初回に1回**セットアップを走らせれば、
無ければ単体バイナリを `_bin/` に直接DLする（**アカウント登録不要・sudo不要・PATHを汚さない**）。

```bash
TOOLS=~/.claude/skills/clbs-short-research/_tools
python3 $TOOLS/setup_tools.py --json   # 確認＆不足を自動導入。結果JSONを読む
```
- `auto_ready: true` → 自動取得モードで進む
- `has_ffmpeg: false` → 冒頭フレーム抽出は省略し、**字幕(=冒頭セリフ)＋カバー画像**で冒頭フックを読む（YouTubeは成立する）
- `auto_ready: false`（yt-dlpすら用意できない／Python無し等）→ **手動スクショモードに降格**して進める

> Instagramは方式に関わらず手動。YouTube/TikTokだけ自動。

---

## 知識ベース（必要時にRead）

| ファイル | 用途 |
|---|---|
| `references/hook_taxonomy.md` | 冒頭2秒フック5型＋常識破壊フレーム8種＋心理トリガー — 解剖時の分類軸 |
| `references/platform_notes.md` | 媒体ごとの評価指標・フックの効き方・注意点（媒体別レポートの観点） |
| `references/report_templates.md` | 各出力ファイルの雛形 |

## 準拠する方法論（講義資料・常識破壊パターン集 由来）

- **冒頭フック最重視**: 視聴維持率は「3秒40% / 20秒20% / 完了10%」が基準。最初の1〜2秒で勝負が決まる。
- **異常値モデリング（守破離の守）**: 「普段の平均再生数の10倍」「フォロワー数の3倍再生」など異常値を探す。
  できるだけ**フォロワーが少ない競合の直近半年以内**の異常値を参考にする（知名度の影響を排除／古いとアルゴリズムが違う）。
- **順算思考**: 伸びる動画は「冒頭の入りで反応が取れるもの」から作られている。
  だからリサーチも「冒頭2秒に何を仕込んでいるか」を最優先で抜く。

---

## 禁止事項と振る舞いのルール（厳守）

1. **数値の捏造は厳禁**: 取得できなかった数値は `[要確認]` で明示。曖昧な推測値を入れない。
2. **取得日を明記**: 再生数等は変動するため取得日を併記。
3. **媒体を必ず分ける**: 「どの媒体での結果か」を全ての所見で明示する（このスキルの肝）。
4. **冒頭フックを最優先で書く**: 各異常値で「何が写る／何を喋る／テロップ」を分けて記述してから他要素へ。
5. **メタコメント禁止**: 「リサーチしました」等のシステム的アナウンスは出さない。挨拶は最小限、すぐヒアリングへ。
6. **企画立案に踏み込まない**: 企画案・台本は後段スキルに引き渡す。ここは「材料」まで。

---

## 全体設計図

```
STEP0 ヒアリング（最小限）＋ 自動取得の自己セットアップ
   ▼
STEP1 媒体別ランドスケープ（各媒体で誰が伸びているか）
   │  → research/01_landscape.md
   ▼
STEP2 異常値の特定（媒体ごと）
   │  YouTube/TikTok: hook_ingest.py が再生数で自動ランク
   │  Instagram: ユーザーのリール一覧スクショから特定
   ▼
STEP3 冒頭フック解剖（心臓部・媒体別ファイル）
   │  自動: hook_frames/ か cover.jpg を vision で読み hook_card を埋める
   │  手動(IG): 冒頭スクショ＋冒頭セリフを vision で読む
   │  → research/02_hook_teardown_<platform>.md
   ▼
STEP4 媒体横断モデリング → research/03_viral_modeling.md
   ▼
STEP5 統合サマリ → research/04_short_research_summary.yaml
   ▼
完了：clbs-short-script へ引き渡し可能
```

---

## 実行ワークフロー（厳守）

### STEP0：ヒアリング＋自己セットアップ

```
ショート動画のリサーチを始めます。3つだけ教えてください。

■ 確認1：あなた（クライアント）のジャンル／バックエンド商品
■ 確認2：調べたい媒体（複数可） □ YouTube Shorts  □ TikTok  □ Instagram Reels
■ 確認3：対象アカウント／競合（媒体ごとに・URLか@ハンドル。未指定ならこちらで探します）
```

YouTube/TikTok を調べるなら、ヒアリングと並行して自己セットアップを1回走らせる:
```bash
python3 ~/.claude/skills/clbs-short-research/_tools/setup_tools.py --json
```
結果の `auto_ready` を見て、自動モード or 手動モードを決める（Instagramは常に手動）。

### STEP1：媒体別ランドスケープ

媒体ごとに「同ジャンルで今伸びているアカウント」を3〜5特定する。
- WebSearch で「<ジャンル> TikTok 人気」「<ジャンル> リール 伸びてる」等を媒体別に検索。
- フォロワー数・主テーマ・代表的な異常値を1〜2行で要約。
- `01_landscape.md` に媒体別セクションで記述（`references/report_templates.md`）。

### STEP2：異常値の特定（媒体ごと）

判定基準: 平均再生の **3〜10倍** ／ フォロワー数を超える再生 ／ できるだけ **直近半年・少フォロワー**。

- **YouTube（自動）**: チャンネルURLを渡すと `hook_ingest.py` が再生数を補完して自動ランクする（STEP3でまとめて実行）。
- **TikTok（半自動）**: 候補の動画URLをユーザーに数本もらう（再生数表示のスクショもあると確実）。
- **Instagram（手動）**: ユーザーに **リール一覧のスクショ** を依頼（サムネ左下に再生数）。それを vision で読み、平均比で異常値を特定する。

```
（Instagramの場合）リール一覧のスクショを送ってください（サムネに再生数が出ているもの）。
こちらで平均比から異常値リールを特定します。
```

### STEP3：冒頭フック解剖（心臓部）

#### A. YouTube / TikTok（自動）

セットアップ済みなら `hook_ingest.py` で素材を取得する。

```bash
TOOLS=~/.claude/skills/clbs-short-research/_tools

# YouTube: チャンネルから異常値を自動ランクして上位を取得
python3 $TOOLS/hook_ingest.py --out research/clips \
  --channel "https://www.youtube.com/@handle" --top 6 --rank-scan 40

# 動画を明示（YouTube/TikTok混在可）
python3 $TOOLS/hook_ingest.py --out research/clips \
  --videos "https://www.youtube.com/shorts/XXXX" "https://www.tiktok.com/@u/video/YYYY"
```

取得物（媒体別 `research/clips/<platform>/<id>/`）:
- `hook_frames/` — 冒頭 0.0/0.5/1.0/1.5/2.0 秒のフレーム（ffmpegがある時。**何が写る＋テロップ**）
- `cover.jpg` — カバー画像（ffmpeg無しでも視覚フックの代替になる）
- `hook_opening_speech.txt` — 冒頭3秒の発話（**何を喋るか**）
- `transcript.plain.txt` / `comments.md` / `meta.json` / `hook_card.md`
- `index.json` — `channel_stats.ranking`（再生数・平均比つき異常値ランク）

**フックカードを埋める（vision分析）**: 各 `hook_card.md` について、`hook_frames/`（無ければ `cover.jpg`）を
Read（vision）で確認し、以下を判定:
1. **何が写っているか** — 被写体・構図・動き
2. **焼き込みテロップ** — 画像上の文字を**そのまま**
3. **何を喋っているか** — `hook_opening_speech.txt`
4. **フック型** — 5型（`references/hook_taxonomy.md`）＋常識破壊フレーム
5. **視覚×言語の役割分担**

`meta.json` が `manual_needed: true`（取得不能）の動画だけ、下のBに切替えてユーザーに依頼する。

#### B. Instagram（手動スクショ）／ 自動が失敗した動画

各異常値について次を依頼する:
```
この動画（{媒体}）はスクショで解剖します。1本につき：
  ① 冒頭1〜2秒のスクショ 1〜2枚（テロップ＝焼き文字が写っているもの／再生→最初の1〜2秒で一時停止→スクショ）
  ② 冒頭で喋ってる最初のひと言（聞こえたまま）
  ③ わかれば 再生数 / 投稿日 / フォロワー数 / いいね数（アプリ画面のスクショでも可）
```
受け取ったスクショを Read（vision）で読み、上のA同様に1〜5を埋める。

#### C. 媒体別ファイルに統合

媒体ごとに `02_hook_teardown_<platform>.md` を作り、その媒体の異常値の解剖を並べる。
「冒頭フック → 興味づけ → 本題の見せ方 → CTA」の順に、特に冒頭フックを厚く書く。

### STEP4：媒体横断モデリング

`03_viral_modeling.md` に:
- 媒体ごとのフック傾向の違い（テロップの長さ・権威提示の効き方 等）
- 媒体横断で共通して効いている型（フック型・テロップ構造・被写体）
- モデリングすべき型 TOP3（守破離の「守」で8割真似る）＋媒体出典
- バズ方程式（1〜3行）／飽和・マンネリ注意点

### STEP5：統合サマリ（引き渡し）

`04_short_research_summary.yaml` を `references/report_templates.md` のスキーマで出力。
特に **hook_library**（媒体別・型別の効いた冒頭フック実例）を充実させる。

---

## 完了チェックリスト

```
■ 媒体の分離
□ 全ての所見が「どの媒体での結果か」を明示している
□ 調べた媒体ごとに 02_hook_teardown_<platform>.md がある（無い媒体は landscape に明記）

■ 冒頭フックの解剖（心臓部）
□ 各異常値で「何が写る／テロップ／何を喋る」が分けて書けている
□ 各異常値のフック型（5型）と常識破壊フレームが判定されている
□ 自動失敗・Instagramの動画はスクショで埋めた

■ モデリング
□ モデリングすべき型 TOP3 が媒体出典つきで挙がっている
□ バズ方程式が1〜3行で言語化されている

■ 引き渡し
□ 04_short_research_summary.yaml のスキーマが埋まっている
□ hook_library に媒体別・型別の実例が入っている

→ チェック後、「clbs-short-script に進みますか？」と確認する
```

---

## 既知の制約と回避策

| 制約 | 回避策 |
|---|---|
| YouTubeのflat列挙は再生数を返さない | `hook_ingest.py` が再生数を補完してからランク（`--rank-scan` 本まで・多いほど正確で遅い） |
| ffmpeg が無い環境 | 冒頭フレーム抽出は省略し、**字幕＝冒頭セリフ＋サムネ＝カバー**で冒頭フックを読む（YouTubeは成立） |
| faster_whisper が無い | YouTubeは自動字幕で冒頭セリフが取れる。TikTokで字幕も無い時は冒頭セリフをユーザーに依頼 |
| Instagram は自動取得不可（ログインの壁） | 手動スクショモード（リール一覧→異常値特定、冒頭スクショ→解剖） |
| TikTok の再生数・コメントが不安定 | 取れた範囲で記述し `[要確認]`。再生数はアプリ画面スクショで補完 |
| yt-dlp/Python が用意できない環境 | `setup_tools.py` が失敗 → 全面的に手動スクショモードへ降格 |
| テロップ（焼き込み文字）はテキストで取れない | フレーム/カバー/スクショを vision で読む（このスキルの肝） |

---

## 後段スキルへの接続

| 次のステップ | 使うスキル |
|---|---|
| ショート台本を作る（汎用） | `clbs-short-script`（`04_short_research_summary.yaml` を渡す） |
| Takumi量子論のショート台本 | `clbs-video-script-short` |
| 長尺YouTube本編のリサーチ | `clbs-youtube-research` |
