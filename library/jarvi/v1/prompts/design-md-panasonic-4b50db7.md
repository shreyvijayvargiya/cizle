# DESIGN.md — Panasonic（パナソニック）

By @kzhrknt · design-system
Language: ja · Domains: product, data · Source: J01

Source page: https://github.com/kzhrknt/awesome-design-md-jp/blob/HEAD/design-md/panasonic/DESIGN.md

```
# DESIGN.md — Panasonic（パナソニック）

> Panasonic（https://panasonic.jp/）のデザイン仕様書。
> 家電・住設・電子デバイスを展開する総合エレクトロニクスメーカーのコーポレート＆プロダクトサイト。
> 実サイトの computed style 実測（2026-05-09 取得）に基づく。

---

## 1. Visual Theme & Atmosphere

- **デザイン方針**: ライトグレー `#f2f2f2` のニュートラル背景に、**ゴーストボタン（アウトラインのみ）** と **Noto Sans JP のクリーンなタイポグラフィ**で、製品を主役にした控えめで信頼感のあるデザイン
- **密度**: 本文 line-height 1.5 で標準的。見出しも line-height 1.5 を統一的に適用し、密度よりも均質なリズムを優先
- **キーワード**: ニュートラルグレー、プロダクトフォーカス、ゴーストCTA、Noto Sans JP の端正さ、家電メーカーの信頼感
- **特徴**:
  - 和文フォントに **Noto Sans JP** を採用。Google Fonts で配信されるオープンフォントで、環境を問わず同じ表示になる
  - **ブランドカラーは明確な単色ではなく、ニュートラルグレー系のトーンが全体を支配**。CTA も `#333333` のダークグレーで、ブルーやレッドのような彩度の高い色を使わない
  - CTA は **ゴーストボタン（透明背景 + ボーダー）** で統一。radius 0px の直角仕上げで、家電メーカーらしい端正さとモダンさを表現
  - ページ背景に `#f2f2f2`（ライトグレー）を広く使い、カードやコンテンツ面は `#ffffff`（白）で浮かせる
  - フッターとオーバーレイに `#333333`（ダークグレー）を使用し、ライトグレー基調にコントラストを作る
  - テキストは `#1a1a1a`（near-black）を基本に、補助を `#666666` でトーンダウン。純黒 `#000000` は入力欄にのみ使用
  - 見出しのウェイトに **400（Light/Regular）と 500（Medium）を多用**し、700 はロゴ等に限定。家電メーカーとしては軽やかな印象
  - ダークモード非対応（実測時点）

---

## 2. Color Palette & Roles

> 実サイトの computed style 実測値。すべて hex 表記。

### Neutral — Gray Scale

| Token | hex | RGB | 役割 |
|-------|-----|-----|------|
| Near Black | `#1a1a1a` | (26, 26, 26) | 本文テキスト・見出し |
| Dark Gray | `#333333` | (51, 51, 51) | CTA 文字色・ボーダー・フッター背景 |
| Mid Gray | `#666666` | (102, 102, 102) | 補助テキスト・ラベル |
| Border Gray | `#cccccc` | (204, 204, 204) | セクション区切り線 |
| Light Gray | `#f2f2f2` | (242, 242, 242) | ページ背景・ヘッダー背景・入力欄背景 |
| White | `#ffffff` | (255, 255, 255) | カード面・コンテンツ背景 |
| Black | `#000000` | (0, 0, 0) | 入力欄テキスト |

### CTA / Buttons

- **Ghost CTA**: 背景 `transparent` / 文字 `#333333` / border `1px solid #333333` / radius `0px`（直角）/ padding `8px 20px` / 18px / weight 400
- **Ghost CTA (Hover)**: 背景 `#333333` / 文字 `#ffffff`（推奨）

### Overlay

- **Dark Overlay**: `rgba(0, 0, 0, 0.5)` — ハンバーガーメニュー展開時・モーダル背景

### Semantic（実測未確認・推奨値）

実サイトには明確なエラー／成功色は表面化していない。推奨する補完値:

- **Danger**: `#cc0000` 程度のレッド（家電メーカーの安全色に近い）
- **Success**: `#00875a` 程度のグリーン
- **Warning**: `#cc7700` 程度のオレンジ

---

## 3. Typography Rules

### 3.1 和文フォント

- **ゴシック体**: **Noto Sans JP** を最優先。Google Fonts で配信
- **フォールバック**: `Noto Sans Display`（欧文グリフ用）→ `sans-serif`
- **明朝体**: 使用しない（サイト全体ゴシック統一）

### 3.2 欧文フォント

- **Noto Sans Display** がフォールバックチェーンに含まれるが、基本的に Noto Sans JP の欧文グリフを使用
- 欧文専用書体（Helvetica Neue 等）は font-family に含まれない

### 3.3 font-family 指定

'''css
/* 全要素共通（body, h1〜h4, p, a, span, button, input, nav, header, footer） */
font-family: "Noto Sans JP", "Noto Sans Display", sans-serif;
'''

**フォールバックの考え方**:
- Noto Sans JP を最優先し、和文・欧文ともに同一書体で統一する
- Noto Sans Display は欧文のディスプレイサイズでの品質向上用
- Hiragino Sans や游ゴシックへのフォールバックは含めない（Noto Sans JP が Google Fonts で確実に配信されるため）

### 3.4 文字サイズ・ウェイト階層

> 実測値（トップページ・記事ページ、2026-05-09 取得）

| Role | Font | Size | Weight | Line Height | Letter Spacing | Color | 備考 |
|------|------|------|--------|-------------|----------------|-------|------|
| H1 (Page Title) | Noto Sans JP | 36px | **400** | 54px (×1.5) | normal | `#1a1a1a` | 記事ページタイトル。thin/regular で軽やか |
| H1 (Logo) | Noto Sans JP | 32px | 700 | 0px | normal | — | ロゴ用の非表示 h1 |
| H2 (Section) | Noto Sans JP | 32px | **400** | 48px (×1.5) | normal | `#1a1a1a` | セクション見出し。400 で控えめ |
| H3 (Large) | Noto Sans JP | 26px | **500** | 39px (×1.5) | normal | `#1a1a1a` | サブセクション。Medium ウェイト |
| H3 (Card) | Noto Sans JP | 20px | **500** | 30px (×1.5) | normal | `#1a1a1a` | カードタイトル |
| H4 | Noto Sans JP | 20px | **500** | 30px (×1.5) | normal | `#1a1a1a` | H3 と同一仕様 |
| P (Body) | Noto Sans JP | 16px | 400 | 24px (×1.5) | normal | `#1a1a1a` | 本文 |
| P (Lead) | Noto Sans JP | 20px | 400 | 30px (×1.5) | normal | `#1a1a1a` | 製品名・リード文 |
| P (Secondary) | Noto Sans JP | 16px | 400 | 24px (×1.5) | normal | `#666666` | トピックラベル |
| Span (Nav Bold) | Noto Sans JP | 16px | 700 | 24px (×1.5) | normal | `#1a1a1a` | ナビカテゴリ名 |
| CTA | Noto Sans JP | 18px | 400 | 27px (×1.5) | normal | `#333333` | ゴーストボタン文字 |
| Input (Small) | Noto Sans JP | 12px | 400 | normal | normal | `#000000` | 検索窓（ヘッダー） |
| Input (Large) | Noto Sans JP | 16px | 400 | normal | normal | `#000000` | 大型入力欄 |

### 3.5 行間・字間

**行間 (line-height)** — 実測:
- **全体**: `1.5` で統一。見出しも本文も同じ比率。Panasonic は line-height のバリエーションを持たない
- **ナビ・CTA**: 同様に `1.5`

**字間 (letter-spacing)** — 実測:
- **全要素**: `normal`（0）。正のトラッキングも負のトラッキングも使用しない
- Panasonic は文字詰め・字間調整を行わず、Noto Sans JP のメトリクスに完全に委ねている

**ガイドライン**:
- 日本語本文は **line-height 1.5 + letter-spacing normal** が Panasonic の基本リズム
- 見出しと本文で行間を変えない。均質なリズムを重視
- 追加の字間調整は不要。書体のデフォルトメトリクスで十分な可読性

### 3.6 禁則処理・改行ルール

'''css
/* 推奨設定（実サイト準拠） */
word-break: normal;
overflow-wrap: break-word;
line-break: strict;
'''

### 3.7 OpenType 機能

'''css
font-feature-settings: normal;
'''

- 実測上、`palt` / `kern` の明示的有効化は確認されなかった
- Noto Sans JP のデフォルトメトリクスをそのまま使用する方針
- 見出しの字詰めも行わない（STORES や note とは異なるアプローチ）

### 3.8 縦書き

- 該当なし。横書きのみ

---

## 4. Component Stylings

### Buttons

**Ghost CTA（唯一のボタンスタイル）** — "すべてのキャンペーンを見る"・"サポート情報トップへ" 等
- Background: `transparent`
- Text: `#333333`
- Padding: `8px 20px`
- Border: `1px solid #333333`
- Border Radius: `0px`（直角 — ピルや角丸ではない）
- Font: Noto Sans JP, 18px, weight 400
- Hover: 背景 `#333333` / 文字 `#ffffff`（推奨）

**Text Link** — 本文中のリンク
- Background: transparent
- Text: `#1a1a1a`
- Padding: `0`
- Font: Noto Sans JP, 16px, weight 400
- Decoration: underline

### Inputs

**Search Input (Small)**
- Background: `#f2f2f2`
- Border: none
- Border Radius: `0px`
- Padding: `6px 14px`
- Font: Noto Sans JP, 12px, weight 400
- Color: `#000000`

**Form Input (Large)**
- Background: `#f2f2f2`
- Border: none（推奨: `1px solid #cccccc`）
- Border (focus): `1px solid #333333`（推奨）
- Border Radius: `0px`
- Padding: `14px 16px`
- Font: Noto Sans JP, 16px, weight 400
- Height: `48px`

### Cards / Surfaces

- Background: `#ffffff`
- Border: なし（面の色差で階層を表現）
- Border Radius: `0px`（直角が基本）
- Shadow: 基本フラット（`box-shadow: none`）
- Card を Light Gray `#f2f2f2` の背景に置くことで浮き上がりを表現

### Header

- Background: `#f2f2f2`
- Border Bottom: なし
- Height: 64px 程度
- Position: sticky / fixed

### Footer

- Background: `#333333`
- Text: `#ffffff`
- Padding: `48px 32px`

---

## 5. Layout Principles

### Spacing Scale（推奨 8px グリッド）

| Token | Value | 用途 |
|-------|-------|------|
| XS | 4px | アイコンと文字の間 |
| S | 8px | ボタン内の縦余白 |
| M | 16px | カード内の段落間 |
| L | 24px | セクション内の見出しと本文 |
| XL | 32px | サイドマージン・ガター |
| XXL | 64px | セクション間の縦余白 |

### Container

- Max Width: `1920px`（CSS 変数 `--max-width`）
- Min Width: `1280px`（CSS 変数 `--min-width`）
- Content Width: `calc(1280px + 32px * 2)` = `1344px`（CSS 変数 `--content-width`）
- Padding (horizontal): `32px`（CSS 変数 `--side-margin`）

### Grid

- Columns: 12
- Gutter: `32px`（CSS 変数 `--gutter-width`）

### Border Radius Scale

| Token | Value | 用途 |
|-------|-------|------|
| None | 0px | ボタン・入力欄・カード（全要素共通） |

> Panasonic は **直角デザインを徹底**しており、角丸を使わない。ピルや大角丸は存在しない。

---

## 6. Depth & Elevation

| Level | Shadow | 用途 |
|-------|--------|------|
| 0 | `none` | カード・ボタン・ヘッダ（基本フラット） |
| 1 | `0 2px 8px rgba(0, 0, 0, 0.06)` | ホバー時の浮き上がり（推奨） |
| 2 | `0 4px 16px rgba(0, 0, 0, 0.08)` | ドロップダウン・メガメニュー（推奨） |
| 3 | `0 8px 32px rgba(0, 0, 0, 0.12)` | モーダル・ダイアログ（推奨） |

- 実測ではほぼ全要素 `box-shadow: none`
- 立体感は **背景色の差**（`#f2f2f2` 上の `#ffffff` カード）と **ダークセクション** `#333333` で表現
- 影を使う場合も `rgba(0, 0, 0, 0.06〜0.12)` の控えめな値で
- overlay は `rgba(0, 0, 0, 0.5)` でモーダル・ハンバーガー展開時に使用

---

## 7. Do's and Don'ts

### Do（推奨）

- 和文フォントは **Noto Sans JP を最優先**、フォールバックは Noto Sans Display → sans-serif
- 本文の line-height は **1.5** で統一する。見出しも同じ 1.5 を維持する
- letter-spacing は **normal（0）** を維持する。書体のメトリクスに委ねる
- CTA は **ゴーストボタン（透明背景 + `#333333` ボーダー + 直角 radius 0px）** で統一する
- ページ背景に **`#f2f2f2`（ライトグレー）**、カード面に **`#ffffff`（白）** を使い、色差で階層を作る
- フッターは **`#333333`（ダークグレー）** でコントラストを出す
- テキストは `#1a1a1a`（near-black）を基本に、補助は `#666666` でトーンダウンする
- 見出しは weight **400（Regular）〜500（Medium）** を基本とし、軽やかさを保つ
- weight 500 を h3/h4 の中間ウェイトとして活用する（Noto Sans JP が 500 に対応しているため）

### Don't（禁止）

- CTA に **ピルシェイプ（border-radius 9999px）や角丸（4〜8px）** を使わない — 直角 0px が Panasonic の規範
- CTA に **彩色（ブルー・レッド等）の背景色**を使わない — 透明＋ダークグレーボーダーが基本
- 見出しに **weight 700（Bold）** を多用しない — ロゴとナビカテゴリ名以外は 400〜500 が基本
- **letter-spacing を追加しない**（正のトラッキングも負のトラッキングも不要）
- **palt / kern を有効にしない** — Noto Sans JP のデフォルトメトリクスを使う
- 本文に **line-height 1.75〜2.0** を使わない（Panasonic は 1.5 統一）
- **ウォーム系グレー**（`#f2f2f0` のような green 寄り）を使わない — Panasonic のグレーは `#f2f2f2` の純ニュートラル
- テキストに **純黒 `#000000`** を使わない（入力欄以外は `#1a1a1a` を使用）

---

## 8. Responsive Behavior

### Breakpoints（推奨値）

| Name | Min Width | 説明 |
|------|-----------|------|
| `sm` | 640px | 大きめモバイル |
| `md` | 768px | タブレット |
| `lg` | 1024px | デスクトップ |
| `xl` | 1280px | 広いデスクトップ（`--min-width`） |
| `xxl` | 1920px | 最大幅（`--max-width`） |

### モバイル時の調整

- H1: 36px → 24〜28px
- H2: 32px → 22〜26px
- 本文サイズは 16px を維持（line-height も 1.5 維持）
- ナビはハンバーガー化、展開時にダーク背景（`#333333`）のフルスクリーンメニュー

### タッチターゲット

- CTA ボタン: 高さ 43px 程度（padding 8px + 18px font + 1.5 line-height）
- 入力欄（大）: 48px

### ダークモード

- 該当なし（実測時点で未対応）

---

## 9. Agent Prompt Guide

### クイックリファレンス

'''
Near Black (Text): #1a1a1a
Dark Gray (CTA/Footer): #333333
Mid Gray (Secondary Text): #666666
Border Gray: #cccccc
Light Gray (Page BG): #f2f2f2
White (Card/Surface): #ffffff
Overlay: rgba(0, 0, 0, 0.5)

Font: "Noto Sans JP", "Noto Sans Display", sans-serif
（Google Fonts で配信。環境依存なし）

Body Size: 16px / line-height 1.5 / weight 400 / letter-spacing normal
H1: 36px / line-height 1.5 / weight 400
H2: 32px / line-height 1.5 / weight 400
H3: 20〜26px / line-height 1.5 / weight 500
CTA: 18px / weight 400 / ghost button / border #333 / radius 0

Border Radius: 0px（全要素直角）
Shadow: 基本 none。階層は #f2f2f2 / #ffffff / #333333 の色差で表現
font-feature-settings: normal（palt/kern なし）
'''

### プロンプト例

'''
Panasonic のデザインに従って、家電製品のカテゴリページを作成してください。
- フォント: "Noto Sans JP", "Noto Sans Display", sans-serif
- ページ背景: #f2f2f2（ライトグレー）
- カード背景: #ffffff（白）で背景との色差で浮かせる
- セクション見出し: 32px / weight 400 / line-height 1.5 / color #1a1a1a
- カードタイトル: 20px / weight 500 / line-height 1.5
- 本文: 16px / weight 400 / line-height 1.5 / letter-spacing normal / color #1a1a1a
- 補助テキスト: 16px / weight 400 / color #666666
- CTA: 背景 transparent / 文字 #333333 / border 1px solid #333333 / radius 0px / padding 8px 20px / 18px / weight 400（ゴーストボタン）
- フッター: 背景 #333333 / 文字 #ffffff
- border-radius は全要素 0px（直角）
- box-shadow は基本 none
- letter-spacing / font-feature-settings は normal（palt 不使用）
- 見出しに 700 を使わない（400〜500 が基本）
- ピルボタンや角丸 CTA は使わない
'''
```

Prompt file from a public GitHub repository, kept with its repository and path. Check the repository's licence before reusing it.
