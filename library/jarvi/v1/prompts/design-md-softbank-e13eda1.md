# DESIGN.md — SoftBank (ソフトバンク)

By @kzhrknt · design-system
Language: ja · Domains: product · Source: J01

Source page: https://github.com/kzhrknt/awesome-design-md-jp/blob/HEAD/design-md/softbank/DESIGN.md

```
# DESIGN.md — SoftBank (ソフトバンク)

> SoftBank (https://www.softbank.jp/) のデザイン仕様書。
> 日本の大手通信キャリア。モバイル通信・光回線・IoT・法人向けソリューション等を展開。
> 実サイトの computed style 実測 (2026-06-03 取得) に基づく。

---

## 1. Visual Theme & Atmosphere

- **デザイン方針**: 白背景にビビッドブルー `#357eec` を差し色にした、日本の通信キャリアらしいクリーン＆コーポレートなデザイン。派手さより信頼感・安定感を優先
- **密度**: 本文 line-height 1.5、body ベース 14px と情報量は多め。大セクション見出しは 40px で堂々と立て、コンパクトに詰まったコーポレートサイトの密度感
- **キーワード**: コーポレートブルー、信頼感、システムフォント、ピル CTA、通信キャリアの堅実さ
- **特徴**:
  - **システムフォントスタック**で統一。Meiryo を先頭に置く Windows ファーストの設計（Windows ユーザーが多い通信キャリアサイトとして合理的）
  - **ブランドカラーは `#357eec`（SoftBank ブルー）**。CTA・リンク・アクセント面に使用。ヒーロー領域では `#3b87fb` のやや明るいバリエーションも
  - **赤 `#dc371e` は「重要なお知らせ」専用**のアラート色。エラーやバッジに限定
  - **オレンジ `#ff6101` はアクセント**。キャンペーンやハイライトに使用
  - テキスト色は `#424242`（見出し）/ `#3f3f3f`（本文）と、純黒を避けたダークグレー系
  - ナビゲーションのピルボタンに `rgba(255,255,255,0.1)` の**フロストグラス効果**
  - サーフェスは `#f0f0f0`（ニュートラルグレー）と `#ecf0f4`（ブルーティントグレー）の2系統
  - CSS Custom Properties は不使用。クラシックな CSS 設計
  - letter-spacing / palt の明示的な適用は確認されず、素朴な日本語組版
  - ダークモード非対応（実測時点）

---

## 2. Color Palette & Roles

> 実サイトの computed style 実測値。すべて hex 表記。

### Brand

- **SoftBank Blue** (`#357eec`): メインのブランドカラー。/mobile/ ページの CTA・リンク・ボタンに多用（10回以上出現）
- **Hero Blue** (`#3b87fb`): トップページのヒーロー・メニュー領域の背景。SoftBank Blue のやや明るいバリエーション
- **Orange Accent** (`#ff6101`): キャンペーン・ハイライト色。注目を引くアクセント

### CTA / Buttons

- **Primary CTA**: 背景 `#357eec` / 文字 `#ffffff` / radius `50px`（pill）/ padding `3px 40px`
- **Nav Pill**: 背景 `rgba(255,255,255,0.1)` / 文字 `#ffffff` / radius `52px`（pill）/ padding `7px 10px` / フロストグラス効果
- **Tag Pill**: 背景 `#f0f0f0` / 文字 `#666666` / radius `9999px` / padding `10px 20px`
- **Alert Badge**: 背景 `#dc371e` / 文字 `#ffffff` / radius `10px` / padding `4px 8px`

### Semantic

- **Danger / Alert** (`#dc371e`): 「重要なお知らせ」バッジ。エラー・緊急情報
- **Warning**: `#ff6101`（オレンジアクセントと兼用）
- **Success**: 実測未確認。推奨 `#0fa044` 程度のグリーン

### Neutral

| Token | hex | RGB | 役割 |
|-------|-----|-----|------|
| Text Heading | `#424242` | (66, 66, 66) | 見出し・大タイトル |
| Text Body | `#3f3f3f` | (63, 63, 63) | 本文テキスト |
| Text Nav / Footer | `#333333` | (51, 51, 51) | ナビ・フッター |
| Text Base | `#000000` | (0, 0, 0) | body のベース色（小テキスト） |
| Gray | `#666666` | (102, 102, 102) | タグ・補助テキスト |
| Border | `#cccccc` | (204, 204, 204) | 区切り線・入力欄ボーダー |
| Surface Gray | `#f0f0f0` | (240, 240, 240) | タグ背景・薄い面 |
| Surface Blue | `#ecf0f4` | (236, 240, 244) | 情報セクション背景（ブルーティント） |
| Surface Blue Alt | `#eaf0f7` | (234, 240, 247) | サブセクション背景（ブルーティント） |
| White | `#ffffff` | (255, 255, 255) | ページ背景 |

### Header / Overlay

- **Hero BG**: `#3b87fb`（ソリッドブルー）
- **Nav Pill BG**: `rgba(255, 255, 255, 0.1)`（半透明白 + 背景のブルーが透ける）
- **Info Section BG**: `#ecf0f4` + border-radius `10px`

---

## 3. Typography Rules

### 3.1 和文フォント

- **ゴシック体**: **Meiryo** を最優先。Windows ユーザーを主ターゲットとする通信キャリアらしい選択
- **フォールバック**: `Hiragino Kaku Gothic ProN`（macOS）→ `Hiragino Sans`（macOS 新版）→ `system-ui` → `sans-serif`
- **明朝体**: 使用しない（サイト全体ゴシック統一）

### 3.2 欧文フォント

- 専用の欧文書体は持たず、**Meiryo / Hiragino の欧文グリフ**を使用
- font-family に Helvetica Neue / Arial 等の欧文フォントは含まれない
- system-ui がフォールバックに入っており、各 OS のシステムフォントに委ねる設計

### 3.3 font-family 指定

'''css
/* 全要素共通（body, h2, h3, p, a, span, button, nav, footer） */
font-family: Meiryo, "Hiragino Kaku Gothic ProN", "Hiragino Sans", system-ui, sans-serif;
'''

**フォールバックの考え方**:
- Meiryo を最優先し、Windows 環境での表示品質を確保
- macOS では Hiragino Kaku Gothic ProN（旧指定）→ Hiragino Sans（新指定）の順
- 最後に system-ui で各 OS のシステムフォントにフォールバックし、sans-serif で締める
- 欧文専用書体は挟まない。Meiryo / Hiragino の欧文グリフをそのまま使う

> **代替フォント注記**: Meiryo は Windows のシステムフォントのため、macOS / Linux 環境では Hiragino にフォールバックする。デザインプレビューや社外資料では **Noto Sans JP**（weight 400 / 700）を使用すると、ニュートラルゴシックとして近い印象が出る（preview.html はこの代替を使用）。

### 3.4 文字サイズ・ウェイト階層

> 実測値（トップページ / /mobile/ ページ、2026-06-03 取得）

| Role | Font | Size | Weight | Line Height | Letter Spacing | Color | 備考 |
|------|------|------|--------|-------------|----------------|-------|------|
| Section H2 | Meiryo | 40px | **700** | 50px (x1.25) | normal | `#424242` | "ソフトバンクの取り組み" |
| H3 | Meiryo | 26px | 700 | 37.14px (x1.43) | normal | `#424242` | セクション小見出し |
| H3 (白背景) | Meiryo | 26px | 700 | 37.14px (x1.43) | normal | `#ffffff` | ダークセクション見出し |
| Hero Link | Meiryo | 17px | 700 | — | normal | `#ffffff` | モバイルヒーローの CTA テキスト |
| Body | Meiryo | 16px | 400 | 24px (x**1.5**) | normal | `#3f3f3f` | 本文 |
| Base | Meiryo | 14px | 400 | 20px (x1.43) | normal | `#000000` | body のベース・ナビリンク |
| Nav Span | Meiryo | 16px | 400-500 | — | normal | `#ffffff` | ヘッダーナビゲーション |
| Footer | Meiryo | 14px | 400 | — | normal | `#333333` | フッターリンク・注釈 |
| Small | Meiryo | 12px | 400 | — | normal | `#666666` | 注釈・利用規約 |

### 3.5 行間・字間

**行間 (line-height)** -- 実測:
- **本文 (16px)**: `1.5`（24px / 16px）-- 日本語として標準的
- **ベース (14px)**: `1.43`（20px / 14px）-- コンパクト
- **見出し (40px)**: `1.25`（50px / 40px）-- タイト
- **見出し (26px)**: `1.43`（37.14px / 26px）

**字間 (letter-spacing)** -- 実測:
- **全要素**: `normal`（0）-- 明示的な letter-spacing 指定なし
- palt / kern の適用も確認されず、Meiryo のデフォルトメトリクスに任せる方針

**ガイドライン**:
- SoftBank のタイポグラフィは装飾を排したシンプル設計。letter-spacing の操作なし
- line-height も 1.43-1.5 と日本語コーポレートサイトの標準値
- ウェイトは 400（本文）と 700（見出し）の2段階のみ。600 は使わない

### 3.6 禁則処理・改行ルール

'''css
/* 推奨設定（実サイト準拠） */
word-break: normal;
overflow-wrap: break-word;
line-break: strict;
'''

- 見出しの改行位置は CMS 側で管理（ハードコーディングされた `<br>` は少ない）
- 14px のベーステキストが多く、長文の折り返しは OS デフォルトの禁則に委ねる

### 3.7 OpenType 機能

'''css
font-feature-settings: normal;
'''

- 実測上、`palt` / `kern` の明示的有効化は確認されなかった
- Meiryo は Windows 標準のメトリクスサイドベアリングをそのまま使用
- シンプルなコーポレートサイトとして、OpenType 機能に依存しない設計

### 3.8 縦書き

- 該当なし。横書きのみ

---

## 4. Component Stylings

### Buttons

**Primary CTA（ブルーピル）** -- /mobile/ ヒーロー
- Background: `#357eec`
- Text: `#ffffff`
- Padding: `3px 40px`（幅広の横余白）
- Border Radius: `50px`（pill）
- Font: Meiryo, 16px, weight 700
- Border: none

**Nav Pill（フロストグラス）** -- ヘッダーナビ
- Background: `rgba(255, 255, 255, 0.1)`
- Text: `#ffffff`
- Padding: `7px 10px`
- Border Radius: `52px`（pill）
- Font: Meiryo, 14px, weight 400
- Backdrop: ブルー背景上のフロストグラス効果

**Tag Pill（グレー）** -- カテゴリタグ
- Background: `#f0f0f0`
- Text: `#666666`
- Padding: `10px 20px`
- Border Radius: `9999px`（完全ピル）
- Font: Meiryo, 14px, weight 400

**Alert Badge（レッド）** -- "重要なお知らせ"
- Background: `#dc371e`
- Text: `#ffffff`
- Padding: `4px 8px`
- Border Radius: `10px`
- Font: Meiryo, 12px, weight 700

**Secondary（白＋ブルーボーダー）** -- 推奨実装
- Background: `#ffffff`
- Text: `#357eec`
- Border: `1px solid #357eec`
- Padding: `12px 32px`
- Border Radius: `50px`（pill）
- Font: Meiryo, 14px, weight 700

### Inputs（推奨実装）

- Background: `#ffffff`
- Border: `1px solid #cccccc`
- Border (focus): `1px solid #357eec`
- Border Radius: `4px`
- Padding: `10px 14px`
- Font: Meiryo, 14px, weight 400
- Height: `40px`

### Cards / Surfaces

- Background: `#ffffff`（メイン）/ `#ecf0f4`（ブルーティント情報面）/ `#f0f0f0`（ニュートラル面）
- Border: `1px solid #cccccc` または border なし
- Border Radius: `10px`（情報カード）/ `4px`（入力系）
- Shadow: 基本フラット

### Header

- Background: `#3b87fb`（ソリッドブルー、トップページ）/ `#ffffff`（下層ページ）
- Nav Pill: `rgba(255, 255, 255, 0.1)` + radius `52px`
- Position: fixed
- z-index: 高め

### Footer

- Background: `#333333`（ダークグレー）または `#ffffff`
- Text: `#ffffff`（ダーク背景時）/ `#333333`（白背景時）
- Padding: `40px 24px`

---

## 5. Layout Principles

### Spacing Scale（推奨 8px グリッド）

| Token | Value | 用途 |
|-------|-------|------|
| XS | 4px | アイコンとテキストの間 |
| S | 8px | バッジ内パディング |
| M | 16px | カード内の段落間 |
| L | 24px | セクション内の見出しと本文 |
| XL | 40px | セクション間の縦余白 |
| XXL | 80px | ヒーロー上下のゆとり |

### Container

- Max Width: `1200px`（推奨値）
- Padding (horizontal): mobile `16px` / desktop `32px`

### Border Radius Scale

| Token | Value | 用途 |
|-------|-------|------|
| Small | 4px | 入力欄 |
| Medium | 10px | カード・情報セクション・バッジ |
| Pill | 50px / 9999px | CTA・タグ・ナビボタン |

### Grid

- 12 カラムグリッドベース
- Gutter: 20-24px

---

## 6. Depth & Elevation

| Level | Shadow | 用途 |
|-------|--------|------|
| 0 | `none` | カード・ボタン・ヘッダ（基本フラット） |
| 1 | `0 2px 8px rgba(0, 0, 0, 0.08)` | ホバー時の浮き上がり（推奨） |
| 2 | `0 4px 16px rgba(0, 0, 0, 0.10)` | ドロップダウン・ポップオーバー |
| 3 | `0 8px 32px rgba(0, 0, 0, 0.12)` | モーダル・ダイアログ（推奨） |

- 実測ではほぼ全要素 `box-shadow: none`
- 立体感は **背景色の切り替え**（`#ffffff` ↔ `#ecf0f4` ↔ `#3b87fb`）で表現
- ナビのフロストグラス効果（`rgba(255,255,255,0.1)` + backdrop-blur）が唯一の視覚的深度

---

## 7. Do's and Don'ts

### Do（推奨）

- フォントは **Meiryo を最優先**、フォールバックは Hiragino Kaku Gothic ProN → Hiragino Sans → system-ui → sans-serif
- 本文の line-height は **1.5** を基本にする（16px の場合 24px）
- テキスト色は **ダークグレー系**を使う（見出し `#424242`、本文 `#3f3f3f`、ベース `#333333`）
- 主要 CTA は **`#357eec` のブルーピル** (radius 50px)
- 情報セクションの背景は **`#ecf0f4` のブルーティントグレー** で階層を作る
- タグ・カテゴリは **`#f0f0f0` のグレーピル** (radius 9999px)
- ウェイトは **400（本文）と 700（見出し）の2段階** でシンプルに
- アラート・重要情報は **`#dc371e` のレッドバッジ** に限定する

### Don't（禁止）

- font-family に **Meiryo だけ単体で指定しない**（macOS / Linux ではフォールバック必須）
- 主要 CTA に **黒やグレーを使わない** -- SoftBank の CTA は常にブルー `#357eec`
- 本文テキストに **純黒 `#000000` を使わない**（見出しも `#424242` のダークグレー）
- 赤 `#dc371e` を **CTA やブランド要素に使わない**（アラート・重要通知専用）
- ナビに `rgba(255,255,255,0.1)` のフロストグラスを使う際、**backdrop-filter を忘れない**
- **角張った直角ボタン**（radius 0）を CTA に使わない -- ピル形状 (50px+) が基本
- letter-spacing や palt を**勝手に追加しない** -- SoftBank のタイポグラフィは素朴なメトリクスのまま
- **weight 600 や 500 を多用しない** -- 400 と 700 の2段階で十分

---

## 8. Responsive Behavior

### Breakpoints（推奨値）

| Name | Width | 説明 |
|------|-------|------|
| Mobile | <= 767px | モバイルレイアウト |
| Tablet | <= 1023px | タブレットレイアウト |
| Desktop | >= 1024px | デスクトップレイアウト |

### モバイル時の調整

- Section H2: 40px → 24-28px
- H3: 26px → 20px
- 本文サイズは 14-16px を維持
- ナビはハンバーガーメニューに切り替え
- カードは 1 カラムに変更

### タッチターゲット

- 主要 CTA: 高さ 44px 以上
- ナビ要素: 44px x 44px 以上（WCAG 基準）

### ダークモード

- 該当なし（実測時点で未対応）

---

## 9. Agent Prompt Guide

### クイックリファレンス

'''
SoftBank Blue (CTA): #357eec
Hero Blue: #3b87fb
Alert Red: #dc371e
Orange Accent: #ff6101
Text Heading: #424242
Text Body: #3f3f3f
Text Nav: #333333
Gray: #666666
Border: #cccccc
Surface Gray: #f0f0f0
Surface Blue: #ecf0f4
White: #ffffff

Font: Meiryo, "Hiragino Kaku Gothic ProN", "Hiragino Sans", system-ui, sans-serif
（Meiryo 不在環境の代替: Noto Sans JP）

Body Size: 14-16px / line-height 1.5 / weight 400 / letter-spacing normal
Heading Size: 40px / line-height 1.25 / weight 700 / letter-spacing normal
H3 Size: 26px / line-height 1.43 / weight 700

Border Radius: 4px（入力欄）/ 10px（カード）/ 50px-9999px（CTA・ピル）
Shadow: 基本 none。階層は背景色の切り替えで表現
'''

### プロンプト例

'''
SoftBank のデザインに従って、モバイル通信プランの比較セクションを作成してください。
- フォント: Meiryo, "Hiragino Kaku Gothic ProN", "Hiragino Sans", system-ui, sans-serif
- セクション見出し: 40px / weight 700 / line-height 1.25 / color #424242
- 小見出し: 26px / weight 700 / line-height 1.43 / color #424242
- 本文: 16px / weight 400 / line-height 1.5 / color #3f3f3f / letter-spacing normal
- 補助テキスト: 14px / weight 400 / color #666666
- 主要 CTA: 背景 #357eec / 白文字 / border-radius 50px / padding 12px 40px / weight 700
- セカンダリ CTA: 背景 白 / 文字 #357eec / border 1px solid #357eec / radius 50px
- タグ: 背景 #f0f0f0 / 文字 #666666 / radius 9999px / padding 10px 20px
- 情報面: 背景 #ecf0f4 / radius 10px
- アラート: 背景 #dc371e / 白文字 / radius 10px（重要通知のみ）
- テキストは #424242 / #3f3f3f のダークグレー。純黒 #000000 は使わない
- 影は基本 none。階層は背景色で表現
- letter-spacing は一切指定しない（Meiryo のデフォルト）
'''
```

Prompt file from a public GitHub repository, kept with its repository and path. Check the repository's licence before reusing it.
