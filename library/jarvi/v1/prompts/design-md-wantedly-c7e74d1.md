# DESIGN.md — Wantedly（ウォンテッドリー）

By @kzhrknt · design-system
Language: ja · Domains: product · Source: J01

Source page: https://github.com/kzhrknt/awesome-design-md-jp/blob/HEAD/design-md/wantedly/DESIGN.md

```
# DESIGN.md — Wantedly（ウォンテッドリー）

> Wantedly（https://www.wantedly.com/）のデザイン仕様書。
> 「共感でつながる」ビジネス SNS／採用プラットフォーム。
> 実サイトの computed style 実測（2026-05-06 取得）に基づく。

---

## 1. Visual Theme & Atmosphere

- **デザイン方針**: 純白の余白に **シアン #21bddb** のブランドアクセントを置き、Poppins と Helvetica Neue でモダンに整えた採用 SNS の軽やかさ。Medium / Notion 系の "情報を読むための SaaS" の流れ
- **密度**: 本文 14px / line-height 1.57 はやや欧米寄りの締まり。見出しは **72px** ヒーローまで大きく取り、ヒーローと本文のジャンプ率が高い
- **キーワード**: 共感シアン、Poppins モダン、ピル CTA、半透明テキスト、軽量な余白、SNS の軽さ
- **特徴**:
  - **ブランドカラーは #21bddb（シアン／ターコイズ）**。スクロール CTA・ロゴ・アプリバナーで確認できる、Wantedly の象徴色
  - **テキストカラーが半透明黒**（`rgba(0,0,0,0.84)`、`rgba(0,0,0,0.74)`、`rgba(0,0,0,0.4)`）。Medium / 旧 Material Design 系の慣習で、純黒よりやわらかい印象
  - **欧文フォントが Poppins**。Geometric Sans の中でも丸みのある書体で、技術スタートアップらしい温度感
  - **ボタンはほぼすべて完全ピル**（`border-radius: 100px` 〜 実装上の極端な値 `143986px`）
  - 補助テキストは **#9e9e9e**（グレー 600 程度）。冷たすぎず温かすぎないニュートラル
  - サーフェスは **#f5f5f5 / #eeeeee** の段階的グレー
  - ダークモード非対応

---

## 2. Color Palette & Roles

> 実サイトの computed style 実測値。すべて hex 表記。

### Brand

- **Brand Cyan** (`#21bddb`): Wantedly のブランドカラー。ヒーロー CTA バナー・ロゴ・アクセントで使用
- **Brand Cyan Dark** (`#1294ad`): リンクのテキスト色（about ページ "お問い合わせ" 等）
- **Brand Cyan Deep** (`#006f8e`): バナー内リンク・フッターリンクのテキスト色（最も濃い派生）

### CTA / Buttons

- **Primary CTA**: 背景 `#21bddb` / 文字 `#ffffff` / radius `100px`（pill）/ padding `10px 16px` / 14px / weight 600
- **Secondary CTA（白ピル）**: 背景 `#ffffff` / 文字 `rgba(0,0,0,0.56)` / box-shadow `inset 0 0 0 1px rgba(0,0,0,0.1)` / radius `100px`（pill）/ 12〜14px / weight 600
- **Ghost CTA**: 背景 transparent / 文字 `rgba(0,0,0,0.24)` / radius `100px` / padding `0 20px`（無効状態 / disabled の表現にも使用）

### Neutral — Translucent Black Scale

Wantedly の文字色は **半透明黒** が中心。背景に応じて浮かび上がる量が変わる。

| Token | 値 | 役割 |
|-------|-----|------|
| Text Primary | `rgba(0, 0, 0, 0.84)` | 見出し・本文（Medium 互換の「ほぼ黒」） |
| Text Secondary | `rgba(0, 0, 0, 0.74)` | フッター見出し・補助 |
| Text Tertiary | `rgba(0, 0, 0, 0.56)` | セカンダリボタン文字 |
| Text Quaternary | `rgba(0, 0, 0, 0.4)` | キャプション・無効テキスト |
| Text Disabled | `rgba(0, 0, 0, 0.24)` | 完全無効状態 |
| Text Link | `#1294ad` / `#006f8e` | リンク（シアン系） |
| Text Helper | `#9e9e9e` | 灰色固定の補助（"採用担当者さまへ" 等のラベル） |

不透明色版:
- **Heading Black** (`#24282a`): h1・h2 の本来の黒（不透明バージョン）
- **Pure White** (`#ffffff`): カード・ナビ背景

### Neutral — Surfaces

- **Surface 0**: `#ffffff`（カード・ヘッダ）
- **Surface 1**: `#f5f5f5`（セクション帯。"Wantedly は400万人〜" の説明帯背景）
- **Surface 2**: `#eeeeee`（小カード・モバイルアプリ誘導の面）
- **Surface 3**: `rgba(0, 0, 0, 0.06)` ≒ `#f0f0f0`（フォーム入力の薄い面）
- **Overlay**: `rgba(0, 0, 0, 0.74)`（画像オーバーレイ "1/5" のページネーション）

### Semantic（推奨値）

実サイトに表面化したエラー／成功色は確認できなかったが、SaaS 向けの推奨補完値:

- **Danger**: `#e53935`
- **Success**: `#43a047`
- **Warning**: `#fb8c00`

---

## 3. Typography Rules

### 3.1 和文フォント

- **ゴシック体**: 専用 Web フォントは持たず、システムの和文ゴシックを段階的に指定
  - Apple: **Hiragino Sans / ヒラギノ角ゴシック / Hiragino Kaku Gothic ProN**
  - Windows: **メイリオ / Meiryo**、`ＭＳ Ｐゴシック`
  - Web フォント補強として **Noto Sans JP**（一部スタイルで指定）

### 3.2 欧文フォント

- **見出し・主要 UI**: **Poppins**（Google Fonts、Geometric Sans）
- **本文・フッター**: **Helvetica Neue → Helvetica → Arial**
- **フォーム入力**: **Lato**（Google Fonts）

役割で書体を使い分けているのが特徴:

| 用途 | 欧文フォント |
|------|-------------|
| 見出し（h1, h2, セクションタイトル）・主要 CTA | **Poppins** |
| 本文・ナビ・フッターリンク | **Helvetica Neue** |
| フォーム入力・テキストエリア | **Lato** |

### 3.3 font-family 指定

実サイトの実測値（4 バリエーション）:

'''css
/* 主要パターン: Poppins 主導（見出し・CTA・本文セクション） */
font-family: Poppins, "Helvetica Neue", Helvetica, Arial,
  "Hiragino Sans", ヒラギノ角ゴシック, "Hiragino Kaku Gothic ProN",
  "ヒラギノ角ゴ Pro W3", "Noto Sans JP", Roboto,
  メイリオ, Meiryo, "ＭＳ Ｐゴシック", sans-serif;

/* 本文・フッター・ナビ（Poppins なし） */
font-family: "Helvetica Neue", Helvetica, Arial,
  "Hiragino Sans", ヒラギノ角ゴシック, "Hiragino Kaku Gothic ProN",
  "ヒラギノ角ゴ Pro W3", Roboto, メイリオ, Meiryo,
  "ＭＳ Ｐゴシック", sans-serif;

/* フォーム・テキストエリア（Lato 主導） */
font-family: Lato, "Helvetica Neue", Helvetica,
  "Hiragino Sans", "ヒラギノ角ゴシック Pro", "Hiragino Kaku Gothic Pro",
  メイリオ, Meiryo, Osaka, "ＭＳ Ｐゴシック", "MS PGothic", sans-serif;
'''

**フォールバックの考え方**:
- **欧文を最優先**してから和文を続ける構成（"和欧混植時に欧文部分だけブランド書体にする" 設計）
- これは Medium / Apple JP と同じ考え方で、欧文部分の見栄えを優先する SNS／メディア寄り
- 和文が先ではないため、**欧文と和文で字面の高さがズレる** ことがある（その代わり Poppins / Helvetica の固有の表情を残せる）

### 3.4 文字サイズ・ウェイト階層

> 実測値（トップページ・about ページ、2026-05-06 取得）

| Role | Font | Size | Weight | Line Height | Letter Spacing | Color | 備考 |
|------|------|------|--------|-------------|----------------|-------|------|
| Hero H2 | Poppins | **72px** | 700 | 96px (×1.33) | normal | `#ffffff` | "私を本気にさせる仕事はどこにある?"（白抜きヒーロー） |
| Section H2 | Poppins | 40px | 700 | 56px (×1.4) | normal | `rgba(0,0,0,0.84)` | "さあ、このプロフィールで〜" |
| H1 Lead | Poppins | 28px | 400 | 42px (×1.5) | normal | `#24282a` | サブセクション導入 |
| Description | Poppins | 24px | 700 | 36px (×1.5) | 0.34px (0.014em) | `#24282a` | "登録ユーザー400万人以上〜" |
| Feature Title | Poppins | 18px | 700 | 28px (×1.55) | 0.18px (0.01em) | `#24282a` | "募集掲載" 等の機能名 |
| Body | Helvetica Neue | 14px | 400 | 22px (×1.57) | normal | `#24282a` | 本文・ナビ |
| Body (Footer Bold) | Poppins | 16px | 600 | 24px (×1.5) | 0.2px (0.012em) | `rgba(0,0,0,0.84)` | "私たちについて" 等 |
| Footer Caption | Lato | 14px | 400 | 32px (×**2.29**) | normal | `rgba(0,0,0,0.74)` | "運営会社" 等のフッターリンク |
| Caption | Helvetica Neue | 12px | 400 | 16px (×1.33) | normal | `rgba(0,0,0,0.4)` | 補足・"\|" セパレータ |
| Feature Caption | Poppins | 12px | 500 | 16px (×1.33) | normal | `#24282a` | "掲載数無制限・採用成功報酬０円" |
| Button Pill | Poppins | 12〜14px | 600 | 24〜36px | normal | varies | ピル CTA |
| Form Input | Lato | 16px | 400 | 27.36px (×1.71) | normal | `rgba(0,0,0,0.84)` | テキストフィールド |

### 3.5 行間・字間

**行間 (line-height)** — 実測:
- **本文 (14px)**: `1.57`（22px / 14px）— 欧文寄り、note や日経より締まっている
- **Description (24px)**: `1.5`（36px / 24px）
- **Section H2 (40px)**: `1.4`
- **Hero H2 (72px)**: `1.33`
- **フッターリンク (Lato 14px)**: `2.29`（リンクのクリック領域確保のため広い）

**字間 (letter-spacing)** — 実測:
- 本文・ナビ・小テキスト: **`normal`**（0）が基本
- Description (24px): `0.34px` ≒ `0.014em`（**わずかに広く**）
- Feature Title (18px): `0.18px` ≒ `0.01em`
- 見出し (40〜72px): **`normal`**（Poppins の固有メトリクスに任せる）

**ガイドライン**:
- 日本語本文の line-height は **1.5〜1.6** を維持（欧文寄りの欲しめの締まり）
- 字間は基本 **`normal`**。Poppins / Helvetica の固有設計をそのまま使う
- 大見出しに `letter-spacing` をかけない — Poppins のジオメトリを崩さない

### 3.6 禁則処理・改行ルール

'''css
/* 推奨設定 */
word-break: normal;
overflow-wrap: break-word;
line-break: strict;
'''

- ヒーロー見出しは **手動改行**（"私を本気に\nさせる仕事は\nどこにある?"）でリズムを作る
- フッターは **`white-space: nowrap`** でリンクが折り返さないようにする想定

### 3.7 OpenType 機能

'''css
font-feature-settings: normal;
'''

- 実測上 **`palt` も `kern` も明示有効化されていない**
- Poppins・Helvetica Neue の固有メトリクス＋必要に応じた letter-spacing で見た目を整える方針
- 和文のプロポーショナル詰め（palt）が必要な場合は明示的に付加する

### 3.8 縦書き

- 該当なし。横書きのみ

---

## 4. Component Stylings

### Buttons

**Primary CTA（シアンピル）** — メインの行動喚起
- Background: `#21bddb`
- Text: `#ffffff`
- Padding: `10px 16px`
- Border Radius: `100px`（完全ピル）
- Font: Poppins, 14px, weight 600
- Border: none
- Box Shadow: `rgba(0, 0, 0, 0.02) 0 0 0 1px, rgba(0, 0, 0, 0.1) 0 2px 6px 0`

**Secondary CTA（白ピル）** — "アプリを入手"
- Background: `#ffffff`
- Text: `rgba(0, 0, 0, 0.56)`
- Border: none（box-shadow で疑似ボーダー）
- Box Shadow: `rgba(0, 0, 0, 0.02) 0 0 0 1px, rgba(0, 0, 0, 0.1) 0 0 0 1px`
- Padding: `0 16px`（高さは line-height で確保）
- Border Radius: `100px`（完全ピル）
- Font: Poppins, 12px, weight 600

**Ghost / Disabled** — "Wantedlyへの意見を送る"（非活性想定）
- Background: transparent
- Text: `rgba(0, 0, 0, 0.24)`
- Padding: `0 20px`
- Border Radius: `100px`
- Font: Poppins, 14px, weight 600

**Text Link** — フッターリンク・本文リンク
- Color: `#006f8e` ／ `#1294ad`
- Font: Helvetica Neue, 14px, weight 400
- Decoration: 通常なし（ホバー時 underline 推奨）

### Inputs（実測準拠）

- Background: `rgba(0, 0, 0, 0.06)`（≒ `#f0f0f0`）
- Border: なし
- Border Radius: `4px`
- Padding: `6px 12px`
- Font: Lato, 16px, weight 400
- Color: `rgba(0, 0, 0, 0.84)`
- Height: 約 39px（padding + line-height）

### Textarea

- Background: `transparent`
- Border Radius: `4px`
- Padding: `6px 12px`
- Font: Lato, 14px, weight 400
- Color: `#000000`

### Cards / Surfaces

- Background: `#ffffff`（メイン）／ `#f5f5f5`（説明帯）／ `#eeeeee`（誘導カード）
- Border: なしが基本
- Border Radius: `4〜8px`（実測未確認、推奨）
- Shadow: 基本フラット

### Header / Nav

- Background: `#ffffff`（不透明）
- Border Bottom: `1px solid rgba(0, 0, 0, 0.06)` 程度（推奨）
- z-index: 50 程度

### Footer

- Background: `#ffffff`
- Padding: `72px 82px 12px 64px`（実測）
- Color: `#24282a`

---

## 5. Layout Principles

### Spacing Scale（推奨 8px グリッド）

| Token | Value | 用途 |
|-------|-------|------|
| XS | 4px | アイコンと文字の間 |
| S | 8px | ボタン内の縦余白 |
| M | 16px | カード内の段落間／ボタンの横余白 |
| L | 24px | カードの内側余白 |
| XL | 48px | セクション内の見出しと本文の余白 |
| XXL | 72px | フッター上下／セクション間の縦余白 |

### Container

- Max Width: `1200px` 程度（推奨）
- Padding (horizontal): mobile `16px` / desktop `24〜80px`（フッターは 64px〜82px の実測）

### Border Radius Scale

| Token | Value | 用途 |
|-------|-------|------|
| Small | 4px | 入力欄・テキストエリア |
| Medium | 8px | カード（推奨） |
| Pill | 100px | バッジ・タグ・主要 CTA・セカンダリ CTA すべて |

### Grid

- 12 カラムグリッドが実装上自然（CSS Grid または Flexbox）
- Gutter: 24px

---

## 6. Depth & Elevation

| Level | Shadow | 用途 |
|-------|--------|------|
| 0 | `none` | カード・ヘッダ（基本フラット） |
| 1 | `rgba(0, 0, 0, 0.02) 0 0 0 1px, rgba(0, 0, 0, 0.1) 0 2px 6px 0` | プライマリ CTA・セカンダリ CTA |
| 2 | `rgba(0, 0, 0, 0.02) 0 0 0 1px, rgba(0, 0, 0, 0.1) 0 0 0 1px` | 白ピル（疑似ボーダー） |
| 3 | `0 8px 24px rgba(0, 0, 0, 0.1)` | モーダル・ドロップダウン（推奨） |

- ボタンの立体感は **2層シャドウ**（極薄ボーダー + ぼかし影）で表現
- カードはほぼ平面。サーフェス階層（白 → `#f5f5f5` → `#eeeeee`）で奥行きを作る

---

## 7. Do's and Don'ts

### Do（推奨）

- 見出しと CTA には **Poppins** を、本文には **Helvetica Neue** を使う（書体の役割分担）
- 和文フォントは **Hiragino Sans → ヒラギノ角ゴシック → Noto Sans JP → メイリオ** の順でフォールバック
- ブランドカラーは **`#21bddb`（シアン）**、リンク色は **`#006f8e` / `#1294ad`** の濃いシアン
- ボタンはすべて **完全ピル（`border-radius: 100px`）** にする
- テキスト色は **半透明黒**（`rgba(0,0,0,0.84)` / `0.74` / `0.56` / `0.4`）の階層を使う
- 本文の line-height は **1.57** を基本（欧文寄りの締まり）
- ヒーロー見出しは **手動改行**でリズムを作り、ジャンプ率を高くする

### Don't（禁止）

- 和文フォントを単独指定しない（必ずシステム和文へフォールバックする）
- ボタンに **角丸 4〜8px や直角を使わない** — Wantedly の押しはピル
- ブランドカラーを **濃すぎる青（紺色）** にしない — `#21bddb` は明るめのシアン
- テキストを **純黒 `#000000`** にしない — `rgba(0,0,0,0.84)` のやわらかさが基調
- 見出しに **letter-spacing をかけすぎない** — Poppins のジオメトリが崩れる
- 本文の line-height を **1.4 以下**にしない（漢字が詰まりすぎる）

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

- ヒーロー H2: 72px → 36〜44px
- セクション H2: 40px → 28〜32px
- Description: 24px → 18〜20px
- 本文サイズは 14px を維持

### タッチターゲット

- 主要 CTA: padding `10px 16px` + line-height で約 40〜44px の高さ
- フッターリンク: line-height 32px（タップ領域を広く取る設計）

### ダークモード

- 該当なし（実測時点で未対応）

---

## 9. Agent Prompt Guide

### クイックリファレンス

'''
Brand Cyan: #21bddb
Brand Cyan Dark (Link): #1294ad / #006f8e
Pure White: #ffffff
Surface 1: #f5f5f5
Surface 2: #eeeeee
Heading Black: #24282a
Text Primary: rgba(0, 0, 0, 0.84)
Text Secondary: rgba(0, 0, 0, 0.74)
Text Tertiary: rgba(0, 0, 0, 0.56)
Text Disabled: rgba(0, 0, 0, 0.4)
Helper Gray: #9e9e9e

Heading Font: Poppins, "Helvetica Neue", "Hiragino Sans", "Noto Sans JP", sans-serif
Body Font: "Helvetica Neue", "Hiragino Sans", メイリオ, sans-serif
Form Font: Lato, "Helvetica Neue", "Hiragino Sans", sans-serif

Body: 14px / line-height 1.57 / weight 400 / letter-spacing normal
Hero H2: 72px / line-height 1.33 / weight 700 / Poppins
Section H2: 40px / line-height 1.4 / weight 700 / Poppins
Description: 24px / line-height 1.5 / weight 700 / letter-spacing 0.014em

Border Radius: 4px（input）／ 8px（card）／ 100px（CTA・pill）
Button: padding 10px 16px / radius 100px / Poppins 14px weight 600
Shadow: rgba(0,0,0,0.02) 0 0 0 1px, rgba(0,0,0,0.1) 0 2px 6px 0（CTA）
'''

### プロンプト例

'''
Wantedly のデザインに従って、求人カードのリストを作成してください。
- フォント: Poppins, "Helvetica Neue", "Hiragino Sans", "Noto Sans JP", sans-serif
- カードタイトル: 18px / weight 700 / line-height 1.55 / color rgba(0,0,0,0.84)
- 本文: 14px / weight 400 / line-height 1.57 / color #24282a
- 補助テキスト: 12px / weight 400 / color rgba(0,0,0,0.4)
- 主要 CTA "話を聞きに行く": 背景 #21bddb / 白文字 / radius 100px / padding 10px 16px / Poppins 14px weight 600
- セカンダリ CTA "気になる": 白背景 / rgba(0,0,0,0.56) 文字 / radius 100px / shadow inset 1px
- カード背景: #ffffff、説明帯は #f5f5f5
- リンク色: #1294ad / #006f8e
- box-shadow: rgba(0,0,0,0.02) 0 0 0 1px, rgba(0,0,0,0.1) 0 2px 6px 0
- 見出しは手動改行で 2〜3 行のリズムを作る
- ボタンに角丸 4〜8px は使わない（完全ピル）
- テキストは純黒ではなく rgba(0,0,0,0.84) を基本にする
'''
```

Prompt file from a public GitHub repository, kept with its repository and path. Check the repository's licence before reusing it.
