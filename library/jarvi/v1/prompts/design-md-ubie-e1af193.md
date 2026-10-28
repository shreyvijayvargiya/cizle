# DESIGN.md — Ubie（ユビー）

By @kzhrknt · design-system
Language: ja · Domains: product, health, entertainment · Source: J01

Source page: https://github.com/kzhrknt/awesome-design-md-jp/blob/HEAD/design-md/ubie/DESIGN.md

```
# DESIGN.md — Ubie（ユビー）

> Ubie（https://ubie.life/）のデザイン仕様書。
> 医療 AI スタートアップ。生活者向け症状検索エンジンと、医療機関向け AI 問診を展開。
> 実サイトの computed style 実測（2026-06-21 取得）に基づく。

---

## 1. Visual Theme & Atmosphere

- **デザイン方針**: 白を基調にした清潔感のあるレイアウトに、**ブルー `#3959cc` の CTA** と **ピンク `#e34b83` のアクセント（採用・セクションラベル）** で医療 AI の信頼性と親しみやすさを両立
- **密度**: 本文の line-height は 1.8 と広め。見出しは 0.05em の正のトラッキングで品よく広げる。余白をたっぷり取り、情報密度より安心感を優先
- **キーワード**: クリーンホワイト、メディカルブルー、ピンクアクセント、A1ゴシックの丸みのある温かさ、ヘルスケアの信頼感
- **特徴**:
  - ヒーロー見出しに **A1ゴシック B JIS2004**（Morisawa）を採用。丸みのある柔らかいゴシック体で、医療の堅さを和らげつつ信頼感を保つ
  - 本文は **Noto Sans JP** を使用。ウェイト 400（本文）/ 700（見出し）/ 900（ナビ強調）を使い分ける
  - セクションラベル（"News"、"Service" 等）に **Open Sans** 700 をピンク色で使用。欧文ラベルが視覚的アクセントとして機能
  - リード文に **A1ゴシック M JIS2004**（Medium ウェイト）を使い、ヒーローの B ウェイトとは異なる軽やかなトーン
  - サーフェスは `#f7f7f7` / `#f9f9f9` のニュートラルグレー。ウォーム傾向ではなく、医療系らしいクールな中立色
  - ニュースタグに **薄いラベンダー `#e4e8f6`** を使用（"media"、"プレスリリース" 等）。ブランドブルーの派生色
  - ヘッダーに `box-shadow: rgba(0, 0, 0, 0.15) 0px 2px 10px 2px` の影。固定ヘッダーの浮遊感を表現
  - Intersection Observer による fade-in アニメーション（`.appear` クラス）
  - ダークモード非対応（実測時点）

---

## 2. Color Palette & Roles

> 実サイトの computed style 実測値。すべて hex 表記。

### Brand

- **Brand Blue** (`#3959cc`): メインのブランドカラー。CTA "お問合せ"・"もっと見る"・"WEB版"・"サービスを見る" の背景（CSS 変数 `--s-color-938f8a7c`）
- **Accent Pink** (`#e34b83`): セクションラベル（"News" 等の h2）・採用 CTA の背景。サイト全体で視線誘導に使う暖色アクセント（CSS 変数 `--s-color-0eaf5d52`）
- **Surface Lavender** (`#e4e8f6`): ニュースカテゴリタグ（"media"、"プレスリリース" 等）の背景。ブランドブルーの薄い派生色
- **Gradient** (`linear-gradient(90deg, #ebeefa, #fde3ed)`): ブランドブルーからピンクへのグラデーション。CSS 変数 `--s-color-f5ad1296` で定義

### CTA / Buttons

- **Primary CTA**: 背景 `#3959cc` / 文字 `#ffffff`（推定）/ radius `8px` / padding は内部要素で制御
- **Accent CTA（採用）**: 背景 `#e34b83` / 文字 `#ffffff`（推定）/ radius `0px`（ヘッダーバー型）
- **Outline CTA**: 背景 透明 / border `1px solid #9ca0a8` / radius `12px` / "医療機関の方はこちら" "製薬企業の方はこちら" に使用
- **Text Button**: 背景 透明 / radius `4px` / shadow `rgba(0, 0, 0, 0.2) 0px 0px 0px 0px` / "採用情報を詳しくみる →" に使用

### Neutral

| Token | hex | RGB | 役割 |
|-------|-----|-----|------|
| Text Primary | `#20242c` | (32, 36, 44) | 見出し・ヒーロー |
| Text Secondary | `#3d4454` | (61, 68, 84) | h3・ナビ・補助テキスト / フッター背景 |
| Text Tertiary | `#6d727e` | (109, 114, 126) | 日付・メタ情報 |
| Dark Text | `#333333` | (51, 51, 51) | body 既定・リンク・ボタンテキスト |
| Border | `#9ca0a8` | (156, 160, 168) | Outline CTA のボーダー |
| Surface Light | `#f7f7f7` | (247, 247, 247) | セクション背景（count: 6） |
| Surface Footer | `#f9f9f9` | (249, 249, 249) | フッター背景 |
| White | `#ffffff` | (255, 255, 255) | ページ背景・ヘッダー背景 |

### Semantic（実測未確認・推奨値）

実サイトには明確なエラー／成功色は表面化していない。ヘルスケア SaaS 向けに推奨する補完値:

- **Danger**: `#dc2626` 程度のレッド
- **Success**: `#16a34a` 程度のグリーン
- **Warning**: `#d97706` 程度のオレンジ

### Header

- **Header BG**: `#ffffff`（白ベタ）
- **Header Shadow**: `rgba(0, 0, 0, 0.15) 0px 2px 10px 2px`
- **Header Padding**: `0px 0px 0px 24px`
- **Position**: `fixed top: 0`

### Footer

- **Footer BG**: `#f9f9f9`
- **Footer Text**: `#3d4454`（CSS 変数 `--s-color-de9e0e41`）
- **Footer Padding**: `80px 100px 140px`
- **Copyright BG**: `#3d4454`（ダーク帯）

---

## 3. Typography Rules

### 3.1 和文フォント

- **ディスプレイ（ヒーロー見出し）**: **A1ゴシック B JIS2004**（Morisawa）。丸みのあるゴシック体で、医療の堅さを柔らかく表現
- **リード文**: **A1ゴシック M JIS2004**（Medium ウェイト）。ヒーローより軽いトーンで本文への橋渡し
- **本文**: **Noto Sans JP** を主に使用
- **フォールバック**: `Hiragino Kaku Gothic ProN`（body の既定）→ `sans-serif`
- **明朝体**: 使用しない（サイト全体ゴシック統一）

### 3.2 欧文フォント

- **セクションラベル**: **Open Sans** 700。"News"、"Service" 等の英語ラベル専用
- **数値・補足**: **Lato** / **Roboto** / **Montserrat** が CSS 変数に定義されているが、実際の使用箇所は限定的
- body の欧文既定は `sans-serif`（システムフォント）

### 3.3 font-family 指定

'''css
/* ヒーロー見出し */
font-family: "A1ゴシック B JIS2004", "Zen Maru Gothic", "Noto Sans JP",
  "Hiragino Kaku Gothic ProN", sans-serif;

/* リード文 */
font-family: "A1ゴシック M JIS2004", "Zen Maru Gothic", "Noto Sans JP",
  "Hiragino Kaku Gothic ProN", sans-serif;

/* セクションラベル（英語） */
font-family: "Open Sans", sans-serif;

/* 本文・小見出し */
font-family: "Noto Sans JP", "Hiragino Kaku Gothic ProN", sans-serif;

/* body 既定 */
font-family: "Hiragino Kaku Gothic ProN", sans-serif;
'''

**フォールバックの考え方**:
- A1ゴシック（Morisawa）はドメインライセンスのため外部では表示できない。代替として **Zen Maru Gothic**（Google Fonts、Morisawa 系で丸みのある字形が近い）を推奨
- Noto Sans JP は Google Fonts で広く利用可能。A1ゴシック不在時の和文フォールバックとしても機能
- Open Sans は Google Fonts で利用可能。セクションラベル専用のため他要素に適用しない

> **代替フォント注記**: A1ゴシック B/M JIS2004 は Morisawa のドメインライセンスフォント。デザインのプレビューや社外資料で再現できない場合、**Zen Maru Gothic**（Google Fonts）を使用すると丸みのある温かさが近い印象になる（preview.html はこの代替を使用）。

### 3.4 文字サイズ・ウェイト階層

> 実測値（トップページ、2026-06-21 取得）

| Role | Font | Size | Weight | Line Height | Letter Spacing | Color | 備考 |
|------|------|------|--------|-------------|----------------|-------|------|
| Hero H1 | A1ゴシック B | 72px | 400 | 100.8px (x1.4) | 3.6px (0.05em) | `#20242c` | "テクノロジーで、医療の願いを解き放つ" |
| Section Label H2 | Open Sans | 24px | 700 | 33.6px (x1.4) | normal | `#e34b83` | "News"（ピンク、英語ラベル） |
| Lead P | A1ゴシック M | 20px | 400 | 32px (x1.6) | 1px (0.05em) | `#20242c` | "私たちUbieは、医療先進国日本発の企業として..." |
| Sub Label P | Open Sans | 14px | 700 | 19.6px (x1.4) | normal | `#333333` | "医療機関の方はこちら" |
| H3 Category | Noto Sans JP | 13px | 700 | 22.1px (x1.7) | 0.65px (0.05em) | `#3d4454` | "生活者向け" |
| Nav P | Noto Sans JP | 14px | 900 | 16.8px (x1.2) | 0.7px (0.05em) | `#3d4454` | "Ubieについて"（ナビゲーション） |
| Body P | Noto Sans JP | 14px | 400 | 25.2px (x1.8) | 0.7px (0.05em) | `#3d4454` | 本文テキスト |
| Date P | Noto Sans JP | 15px | 400 | 21px (x1.4) | 0.75px (0.05em) | `#6d727e` | "2026/06/04" |
| Tag P | Noto Sans JP | 12px | 400 | 12px (x1.0) | normal | `#3d4454` | "media"（ラベンダー面 `#e4e8f6`、radius 16px） |
| Header CTA | Noto Sans JP | 12px | 700 | 16.8px (x1.4) | normal〜0.6px (0.05em) | `#ffffff` | "お問合せ"・"採用情報" |

### 3.5 行間・字間

**行間 (line-height)** -- 実測:
- **ヒーロー (72px)**: `1.4`（100.8px / 72px）
- **リード文 (20px)**: `1.6`（32px / 20px）
- **本文 (14px)**: `1.8`（25.2px / 14px）-- 医療系らしい読みやすさ重視
- **小見出し (13px)**: `1.7`（22.1px / 13px）
- **セクションラベル (24px)**: `1.4`（33.6px / 24px）
- **ナビ (14px)**: `1.2`（16.8px / 14px）-- 一行ナビはタイト
- **タグ (12px)**: `1.0`（12px / 12px）-- ピル内は高さ固定

**字間 (letter-spacing)** -- 実測:
- **ヒーロー・リード文・本文**: **+0.05em** が基本（72px で 3.6px、20px で 1px、14px で 0.7px）
- **セクションラベル（Open Sans）**: `normal`（欧文は既定のメトリクスに任せる）
- **ナビ**: +0.05em
- **タグ**: `normal`

**ガイドライン**:
- 日本語テキストは **全階層で letter-spacing 0.05em** が Ubie の基本リズム。見出しも本文も同じトラッキング値で統一されている（STORES のように見出しを負に詰める手法とは対照的）
- 本文の line-height は **1.8** を基本にする。医療情報を読むユーザーへの配慮
- Open Sans の英語ラベルは letter-spacing を触らない（フォント自体のメトリクスが整っている）

### 3.6 禁則処理・改行ルール

'''css
/* 推奨設定（実サイト準拠） */
word-break: normal;            /* 既定の日本語禁則 */
overflow-wrap: anywhere;       /* 長い英単語の折り返し */
'''

- ヒーロー見出しは改行位置が自然になるよう `<br>` で手動制御と推定
- タグラベル（"media" 等）は `white-space: nowrap` 相当

### 3.7 OpenType 機能

'''css
font-feature-settings: normal;
'''

- 実測上、`palt` / `kern` の明示的有効化は確認されなかった
- A1ゴシックのメトリクスに任せ、letter-spacing 0.05em で見た目を調整する方針

### 3.8 縦書き

- 該当なし。横書きのみ

---

## 4. Component Stylings

### Buttons

**Primary CTA（ブルー角丸）** -- "お問合せ"・"もっと見る"・"サービスを見る"
- Background: `#3959cc`
- Text: `#ffffff`（推定）
- Padding: 内部要素で制御
- Border Radius: `8px`
- Font: sans-serif, 16px, weight 400（ヘッダー CTA はシステムフォント）
- Border: none

**Accent CTA（ピンクバー）** -- "採用情報"
- Background: `#e34b83`
- Text: `#ffffff`（推定）
- Border Radius: `0px`（ヘッダーの右端バー型）
- Font: sans-serif, 16px, weight 400
- Border: none

**Outline CTA（角丸ボーダー）** -- "医療機関の方はこちら" "製薬企業の方はこちら"
- Background: 透明
- Text: `#333333`
- Border: `1px solid #9ca0a8`
- Padding: 内部要素で制御
- Border Radius: `12px`
- Font: sans-serif, 16px, weight 400

**Text Button（テキスト＋矢印）** -- "採用情報を詳しくみる →"
- Background: 透明
- Text: `#333333`
- Border Radius: `4px`
- Shadow: `rgba(0, 0, 0, 0.2) 0px 0px 0px 0px`（ホバー時に展開と推定）
- Font: sans-serif, 15px, weight 400

### Tag / Badge

**Category Tag** -- "media"、"プレスリリース"、"Media"
- Background: `#e4e8f6`（ラベンダー）
- Text: `#3d4454`
- Padding: `6px 8px`
- Border Radius: `16px`
- Font: Noto Sans JP, 12px, weight 400

### Inputs（推奨実装）

- Background: `#ffffff`
- Border: `1px solid #9ca0a8`
- Border (focus): `1px solid #3959cc`（ブランドブルー）
- Border Radius: `8px`
- Padding: `12px 16px`
- Font: Noto Sans JP, 16px, weight 400
- Height: `44px`

### Cards / Surfaces

- Background: `#ffffff`（メイン）／ `#f7f7f7`（セクション背景）
- Border: なし（実測ではカード間はスペースで分離）
- Border Radius: `8px`（推奨）
- Shadow: 基本フラット（`box-shadow: none`）

### Header

- Background: `#ffffff`（白ベタ）
- Shadow: `rgba(0, 0, 0, 0.15) 0px 2px 10px 2px`
- Position: `fixed top: 0`
- Padding: `0px 0px 0px 24px`
- 右端に **ピンク採用バー** `#e34b83` と **ブルーお問合せバー** `#3959cc` が並ぶ特徴的なレイアウト

### Footer

- Background: `#f9f9f9`
- Text: `#3d4454`
- Padding: `80px 100px 140px`
- Copyright 帯: 背景 `#3d4454`（ダーク）/ 文字 白

---

## 5. Layout Principles

### Spacing Scale（推奨 8px グリッド）

| Token | Value | 用途 |
|-------|-------|------|
| XS | 4px | アイコンと文字の間 |
| S | 8px | タグ内の縦余白 |
| M | 16px | カード内の段落間 |
| L | 24px | ヘッダーの横余白 |
| XL | 48px | セクション間の縦余白 |
| XXL | 80px | フッター上下のゆとり |
| XXXL | 100px | フッターの横余白 |
| XXXXL | 140px | フッター下余白 |

### Container

- Max Width: `1200px` 程度（推奨値）
- Padding (horizontal): mobile `16px` / desktop `24〜32px`

### Border Radius Scale

| Token | Value | 用途 |
|-------|-------|------|
| Small | 4px | テキストボタン |
| Medium | 8px | CTA ボタン・カード |
| Large | 12px | Outline CTA |
| XLarge | 16px | タグバッジ |

### Grid

- 実測では CSS Grid / Flexbox ベースのレイアウト
- Gutter: 24px（推奨）

---

## 6. Depth & Elevation

| Level | Shadow | 用途 |
|-------|--------|------|
| 0 | `none` | カード・ボタン（基本フラット） |
| 1 | `0 2px 10px 2px rgba(0, 0, 0, 0.15)` | ヘッダー（実測値） |
| 2 | `0 8px 24px rgba(0, 0, 0, 0.08)` | ドロップダウン（推奨） |
| 3 | `0 16px 40px rgba(0, 0, 0, 0.10)` | モーダル・ダイアログ（推奨） |

- 実測ではヘッダー以外はほぼ `box-shadow: none`
- 立体感は **サーフェスカラーの切り替え**（`#ffffff` ↔ `#f7f7f7`）で表現
- 影を使う場合も控えめな彩度で、医療系の清潔感を保つ

---

## 7. Do's and Don'ts

### Do（推奨）

- ヒーロー見出しは **A1ゴシック B（または Zen Maru Gothic 代替）** で丸みのある温かい印象を出す
- 本文は **Noto Sans JP** の weight 400 / 700 / 900 を使い分ける
- セクションラベルは **Open Sans** 700 で **ピンク `#e34b83`** に。英語ラベルが視覚的リズムを作る
- 本文の line-height は **1.8** を基本にする（医療情報の可読性重視）
- letter-spacing は全階層で **0.05em** を基本にする（品のある開放感）
- 主要 CTA は **`#3959cc` のブルー角丸（radius 8px）**
- Outline CTA は **border `#9ca0a8` + radius 12px** で柔らかく
- タグは **ラベンダー `#e4e8f6` + radius 16px** でニュースカテゴリを分類
- サーフェスは **ニュートラルグレー `#f7f7f7`** を使い、清潔感を保つ
- フッターの copyright 帯は **`#3d4454`** のダーク面で締める

### Don't（禁止）

- ヒーロー見出しに **Noto Sans JP やシステムゴシック** を使わない（A1ゴシック / Zen Maru Gothic の丸みが Ubie の印象に不可欠）
- 主要 CTA に **ピンク `#e34b83`** を使わない — ピンクは採用とセクションラベル専用。CTA はブルー `#3959cc`
- CTA の border-radius を **9999px（ピル形状）** にしない — Ubie は `8px` の控えめな角丸が基本
- 本文に **line-height: 1.5 以下** を使わない（医療系の余裕ある行間が崩れる）
- **letter-spacing を負の値** にしない — Ubie は全体で正のトラッキング（0.05em）で統一
- セクションラベルの色を **ブルー `#3959cc`** にしない（ラベルはピンク、CTA はブルーの使い分けが重要）
- **ウォームグレー**（`#f2f2f0`、`#737368` 等）を使わない — Ubie のサーフェスは **ニュートラル**（`#f7f7f7`）
- 本文テキストに **純黒 `#000000`** を使わない — Ubie の本文は `#3d4454`（ダークグレー）、見出しは `#20242c`

---

## 8. Responsive Behavior

### Breakpoints（推奨値）

| Name | Min Width | 説明 |
|------|-----------|------|
| `sm` | 640px | 大きめモバイル |
| `md` | 768px | タブレット |
| `lg` | 1024px | デスクトップ |
| `xl` | 1280px | 広いデスクトップ |

### モバイル時の調整

- ヒーロー H1: 72px → 36〜40px
- セクションラベル H2: 24px → 18〜20px
- 本文サイズは 14px を維持（line-height も 1.8 維持）
- ナビはハンバーガーメニュー化（`button` "menu"）

### タッチターゲット

- CTA ボタン: 高さ 44px 以上
- タグバッジ: 24px 程度（装飾寄り）

### ダークモード

- 該当なし（実測時点で未対応）

---

## 9. Agent Prompt Guide

### クイックリファレンス

'''
Brand Blue (CTA): #3959cc
Accent Pink (Label/Recruit): #e34b83
Surface Lavender (Tag): #e4e8f6
Text Primary (Heading): #20242c
Text Secondary (Body): #3d4454
Text Tertiary (Meta): #6d727e
Text Default: #333333
Border: #9ca0a8
Surface Light: #f7f7f7
Surface Footer: #f9f9f9
Footer Dark: #3d4454
White: #ffffff
Header Shadow: rgba(0, 0, 0, 0.15) 0px 2px 10px 2px
Gradient: linear-gradient(90deg, #ebeefa, #fde3ed)

Hero Font: "A1ゴシック B JIS2004", "Zen Maru Gothic", "Noto Sans JP", "Hiragino Kaku Gothic ProN", sans-serif
Lead Font: "A1ゴシック M JIS2004", "Zen Maru Gothic", "Noto Sans JP", "Hiragino Kaku Gothic ProN", sans-serif
Label Font: "Open Sans", sans-serif
Body Font: "Noto Sans JP", "Hiragino Kaku Gothic ProN", sans-serif

Hero: 72px / weight 400 / line-height 1.4 / letter-spacing 0.05em / color #20242c
Section Label: Open Sans 24px / weight 700 / line-height 1.4 / color #e34b83
Lead: 20px / weight 400 / line-height 1.6 / letter-spacing 0.05em / color #20242c
Body: 14px / weight 400 / line-height 1.8 / letter-spacing 0.05em / color #3d4454
Nav: 14px / weight 900 / line-height 1.2 / letter-spacing 0.05em / color #3d4454

Border Radius: 4px（テキストボタン）/ 8px（CTA・カード）/ 12px（Outline）/ 16px（タグ）
Shadow: ヘッダーのみ。それ以外はフラット
'''

### プロンプト例

'''
Ubie のデザインに従って、医療 AI サービスのランディングページを作成してください。
- ヒーローフォント: "A1ゴシック B JIS2004" または "Zen Maru Gothic"（Google Fonts 代替）
- ヒーロー見出し: 72px / weight 400 / line-height 1.4 / letter-spacing 0.05em / color #20242c
- セクションラベル: Open Sans 24px / weight 700 / color #e34b83（ピンク、英語）
- 本文: Noto Sans JP 14px / weight 400 / line-height 1.8 / letter-spacing 0.05em / color #3d4454
- 主要 CTA: 背景 #3959cc / 白文字 / border-radius 8px
- Outline CTA: border 1px solid #9ca0a8 / radius 12px / 透明背景
- タグ: 背景 #e4e8f6（ラベンダー）/ 文字 #3d4454 / radius 16px / padding 6px 8px
- セクション背景: #f7f7f7（ニュートラルグレー）
- フッター: 背景 #f9f9f9、copyright 帯は #3d4454
- ヘッダー影: rgba(0, 0, 0, 0.15) 0px 2px 10px 2px
- 採用関連のアクセントのみピンク #e34b83、CTA はブルー #3959cc
- 全テキストの letter-spacing は 0.05em で統一
- line-height は本文 1.8、見出し 1.4
'''
```

Prompt file from a public GitHub repository, kept with its repository and path. Check the repository's licence before reusing it.
