---
name: clbs-short-edit
description: 縦型ショート動画（9:16）の自動編集スキル。顔出しアバター動画（avatar.mp4・音声入り）＋台本（script.txt のV41タグ）＋縦型素材（1:1スクエア画像スライド / 4:3ピクチャー / 9:16全画面Bロール動画）から、素材の自動差し込みと焼き込みテロップ付与を行い、完成MP4（1080x1920）を書き出す。テロップは既定で「顔の下・胸元上（位置B）／2行／大きめ／白＋黄キーワード／太い黒フチ」。v3でtakumi-youtube-editのテロップ精度機構（フレーム量子化ジェットカット・BudouX階層分割＋禁則辞書・stable-ts整合）を移植。前段は `clbs-short-script`（台本＝script.txt）と素材生成（Higgsfield: Nano Banana 画像 / Veo 動画）。「ショート編集」「ショート動画編集」「縦型動画編集」「リール編集」「Shorts編集」「ショートを編集して」「テロップ焼き込み（縦型）」「short-edit」などのキーワードで使用。16:9のYouTube本編編集は `clbs-youtube-edit`、台本作成は `clbs-short-script` を使う。
---

# clbs-short-edit — 縦型ショート動画 自動編集（9:16）

# v3.0 — takumi-youtube-edit のテロップ精度機構を移植（2026-08-17）。
#   アバター動画＋V41タグ台本＋縦型素材 → フレーム量子化ジェットカット＋素材差し込み＋テロップ焼き込み → 完成MP4。
#   テロップ既定位置 = B（顔の下・胸元上）/ 大きめ / 白＋黄 / 太い黒フチ（PIL描画）。
#   3兄弟スキル: clbs-short-research（リサーチ）→ clbs-short-script（台本）→ clbs-short-edit（編集・本スキル）

## 何をするか

| 入力 | 出力 |
|---|---|
| `avatar.mp4`（縦型9:16・音声入り・台本を喋っている） | `final.mp4`（1080x1920・テロップ焼き込み＋素材差し込み済み） |
| `script.txt`（`clbs-short-script` のV41タグ付き台本） | 中間: `_work/telop_cards.json`（カード内訳）・テロップPNG群 |
| 縦型素材: スライド(1:1) / ピクチャー(4:3) / Bロール(9:16) | |

## v3 の仕組み（takumi-youtube-edit 移植）

| # | v2の問題 | v3の対策 |
|---|---|---|
| 1 | select/aselectの量子化誤差がカット毎に蓄積し「テロップ先行・音声遅れ」 | **フレーム量子化ジェットカット**: 全カット境界を1/FPSグリッドへ量子化。映像=半開区間select、音声=asplit+atrim（サンプル精度・映像フレーム数と厳密一致）＋5msマイクロフェード。中間再エンコードを廃止し**1パス合成**（画質も向上） |
| 2 | テロップ分割が簡易ヒューリスティックで語の途中で割れる（「パチンとひと/つ」） | **文（。）>節（、）>BudouX文節の階層分割**＋Knuth-Plass流DP改行（行長ハード制約・文字レベルDPフォールバック） |
| 3 | 固有語（ゼロポイントフィールド等）の泣き別れ | **禁則辞書** `no_break_words.txt`（スキル同梱 `assets/no_break_words.txt` ＋ プロジェクト直下の和集合） |
| 4 | 文窓内のカード時刻が「枚数で均等割り」＝実発話とズレる | **stable-ts強制アライメント**（台本既知・±20ms級）で語時刻からカード開始を割り当て。不在時は文字数比例へ自動フォールバック。短尺カードは同文の隣へ統合（`--telop-min-dur`）・次カード開始まで表示保持 |
| 5 | 無音カットが語尾に食い込む | **word-safeカット**: アライメント成功時、語区間に食い込む無音を語端でクランプ |
| 6 | fps=30決め打ち | ffprobeでfps実測し全工程で使用（HeyGenの標準は30fpsだが、素材が何fpsでも追従） |
| 7 | 冒頭がBロールで始まり本人が映らない | **冒頭メイン画面ガード**: 最初の文が終わるまで素材オーバーレイを自動で外す/遅らせる（既定ON・`--allow-open-overlay` で解除） |

## 縦型レイアウト規格

| 要素 | 縦横比 | 配置 |
|---|---|---|
| アバター | 9:16 | ベース（全画面） |
| `[Bロール N]` | 9:16 | 全画面 cover（差し込み区間だけアバターを覆う・クールな映像メタファー）。**冒頭には置かない（最初の文はメイン画面）** |
| `[ピクチャー N]` | 4:3 | **中央付近のボックス（横1000×縦820に収め、縦中心 y≈640）**。上端のUI/検索欄を避けつつ、テロップは画像の下に出る |
| `[スライド N]` | 1:1 | 同上（中央付近・テロップはその下） |
| テロップ | — | **位置B：顔の下・胸元上（縦中心 y≈1230）／大きめ／1行目 白・2行目 黄／太い黒フチ12px**。画像差し込み中は画像の下に出る（重ねない） |

> **テロップは小分け**: 文>節>BudouX文節の階層で1カード最大2行（1行10字既定・`--max-line-chars`）。
> 禁則辞書の語（量子力学・ゼロポイントフィールド等）は行・カードで泣き別れしない。
> 見出しテロップは台本本体に書かない方針（[[feedback_short_no_telop]]）＝ここで自動字幕的に焼く。

---

## 入力フォルダの作り方

```
project/
  avatar.mp4              # HeyGen等の縦型アバター動画（台本音声入り）
  script.txt              # clbs-short-script 出力（V41タグ＋ナレーション）
  assets/
    slide1.png            # 1:1
    picture1.png          # 4:3
    broll1.mp4            # 9:16
  segments.json           # 文ごとのタイムライン＋テロップ本文（下記の作り方）
  plan.json               # 素材の差し込み区間（下記）
  no_break_words.txt      # 任意（このプロジェクト固有の禁則語）
```

### segments.json（文タイムライン＋テロップ本文）
```json
[{"i":1,"start":0.0,"end":4.04,"text":"あなたが見るまで、目の前の現実は、まだ決まってないらしい"}, ...]
```
タイムラインの作り方（精度順）:
1. **音声クリップ長から算出（最確実）**: アバターが `clbs-short-script`→TTS（Fish等）で作った連結音声で作られている場合、各文クリップ長＋文間沈黙(0.8s)で開始終了を厳密に出せる。
2. **stable-ts整合に任せる**: v3は文窓内のカード時刻を語アライメントで決めるため、文境界が±0.3s程度粗くても実害が出にくい。
3. 取れない場合は文数で均等割り（粗い）。

### plan.json（素材差し込み区間）
台本のタグ位置 → 次の `[カムリターン]` までを各素材の表示区間にする。
**冒頭はメイン画面**: 最初の文の間は素材を重ねない（`[Bロール1]` を台本冒頭に置く旧型式の台本でも、build側のガードが自動で2文目以降へずらす）。
```json
[{"type":"broll","file":"assets/broll1.mp4","start":4.84,"end":9.6,"fit":"cover"},
 {"type":"image","file":"assets/picture1.png","start":12.55,"end":19.7,"fit":"contain"},
 {"type":"image","file":"assets/slide1.png","start":25.8,"end":31.74,"fit":"contain"}]
```

---

## 実行

```bash
# 初回: pip install -r requirements.txt（budoux/stable-ts 込み。無くても動くが
# budoux→文字DP改行 / stable-ts→文字数比例 に自動フォールバックし精度が下がる）
python3 clbs-short-edit/_tools/build_short.py --dir <project>
# → <project>/final.mp4
```

`build_short.py` の処理:
1. fps実測 → 無音検出 → （アライメント成功時）word-safeクランプ → フレーム量子化ジェットカット計画
2. stable-ts強制アライメント（`--align auto` 既定・`_work/align_words.json` にキャッシュ）
3. segments.json の各文を 文>節>BudouX でカード分割 → 語時刻（or 文字数比例）でカード時刻決定 → PILでテロップPNG生成
4. 1パスffmpeg: 映像select半開区間＋音声atrimサンプル精度＋素材/テロップの時間窓オーバーレイ → `final.mp4`（H.264 / AAC / 実測fps）

### 主なパラメータ
| 引数 | 既定 | 説明 |
|---|---|---|
| `--align` | auto | auto=stable-tsがあれば語精度 / stable=必須（失敗で停止） / off=文字数比例 |
| `--model` | small | stable-tsモデル |
| `--min-silence` | 0.20 | これ以上の無音を詰める（小さいほどアグレッシブ） |
| `--keep-pad` | 0.05 | 発話前後に残す余白秒（プツ切れ防止） |
| `--max-line-chars` | 10 | テロップ1行の最大文字数（ハード制約） |
| `--telop-min-dur` | 0.8 | これ未満のカードは同文の隣へ統合 |
| `--allow-open-overlay` | off | 冒頭メイン画面ガードを解除（通常使わない） |
| `--no-jetcut` | off | ジェットカット無効化 |

テロップ見た目の定数（位置・色・サイズ）は `build_short.py` 冒頭: `TELOP_CENTER_Y=1230` / `TELOP_FS=96`（自動縮小・最小54）/ 1行目=白・2行目=黄・黒フチ12px。
エンコードは環境変数 `CLBS_PRESET`（既定 veryfast）/ `CLBS_CRF`（既定 20）。

---

## 既知の調整ポイント

- 改行位置を手で直したい文は segments.json にその文だけ `"cards"` を持たせて自動分割を上書きする（例: `{"i":14,...,"cards":[["パチンとひとつの","場所に決まる"]]}` ＝1カード2行。文字列要素は1行カード）。`cards` 指定カードは自動統合の対象外＝指定どおりに出る。
- カード分割・時刻の確認は `_work/telop_cards.json`（text/start/end）を見る。
- 画像（ピクチャー/スライド）は中央ボックス表示。顔も残したい場合は `IMG_BOX_*` / `IMG_CENTER_Y` を調整。
- ジェットカットを詰めすぎてプツ切れる場合は `--keep-pad` を増やすか `--min-silence` を上げる。
- segments.json の時刻は「実音声タイムライン（秒）」が前提。`--fit-duration`（旧線形フィット）はv3で廃止。

---

## スキル連携（3兄弟）

| ステップ | スキル |
|---|---|
| 競合リサーチ・冒頭フック解剖 | `clbs-short-research` |
| 企画・台本（script.txt・見出しテロップなし・冒頭はメイン画面） | `clbs-short-script` |
| 素材生成（画像=Nano Banana / 動画=Veo・Higgsfield-takumi） | （Higgsfield MCP・[[reference_fish_higgsfield_accounts]]） |
| ナレーション音声（Takumi声） | Fish（[[reference_fish_higgsfield_accounts]]・要takumi参照ID） |
| **縦型編集・テロップ焼き込み** | **`clbs-short-edit`（本スキル）** |

16:9のYouTube本編は `clbs-youtube-edit` / `takumi-youtube-edit`。
