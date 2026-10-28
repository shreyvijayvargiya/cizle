# DESIGN.md — JAL（日本航空）

By @kzhrknt · design-system
Language: ja · Domains: product · Source: J01

Source page: https://github.com/kzhrknt/awesome-design-md-jp/blob/HEAD/design-md/jal/DESIGN.md

```
# DESIGN.md — JAL（日本航空）

> JAL（https://www.jal.co.jp/）のデザイン仕様書。
> 日本を代表する航空会社。国内線・国際線の予約をはじめ、マイレージ、旅行商品を提供する総合エアラインサイト。
> 実サイトの computed style 実測（2026-05-21 取得）に基づく。

---

## 1. Visual Theme & Atmosphere

- **デザイン方針**: 黒ヘッダーに **JALレッド `#cc0000`** のピル CTA を配した、航空ブランドらしい信頼感と格調。ページ背景はライトグレー `#f4f5f6` で情報密度の高い予約UIを整理する
- **密度**: 予約フォーム・プロモカード・お知らせが並ぶ情報密度の高い構成。line-height 1.5 で読みやすさを確保しつつ、コンパクトに詰める
- **キーワード**: JALレッド、ブラックヘッダー、ピル CTA、航空ブランドの信頼感、Noto Sans JP 統一
- **特徴**:
  - ヘッダーは **全面ブラック `#000000`** で、白文字＋レッドの CTA ボタンが際立つ
  - ブランドカラーは **`#cc0000`（JALレッド）**。CTA "空席照会"・"ログイン" のピルボタン背景に使用
  - ページ背景は `#f4f5f6`（クールグレー）で、白い `#ffffff` のカード・フォームとの階層を作る
  - 本文テキストは `#333333` を一貫して使用。純黒 `#000000` は見出し系のみ
  - `font-feature-settings: normal` — palt は使わず、ベタ組みで統一
  - letter-spacing は `0.336px`（≈ 0.02em）がグローバルに適用
  - ダークモード非対応（実測時点）

---

## 2. Color Palette & Roles

> 実サイトの computed style 実測値。すべて hex 表記。

### Brand

- **JAL Red** (`#cc0000`): メインのブランドカラー。ヘッダー CTA "空席照会"・"ログイン" のピルボタン背景。プロモバナーのアクセント
- **JAL Red (Alert Surface)** (`#fcf1f1`): 薄いレッド面。重要なお知らせ・アラート領域の背景

### CTA / Buttons

- **Primary CTA**: 背景 `#cc0000` / 文字 `#ffffff` / radius `50px`（pill）/ padding `13px 40px` / 16px / weight 700
- **Primary CTA (Small)**: 背景 `#cc0000` / 文字 `#ffffff` / radius `50px`（pill）/ padding `8px 16px` / 12px / weight 700 / border `1px solid #cc0000`
- **Secondary (Tab)**: 背景 `transparent` / 文字 `#333333` / radius `6px` / padding `12px 2px 2px` / weight 700
- **Text Link**: 文字 `#cccccc`（ヘッダー内）/ `#333333`（本文内）/ weight 700

### Neutral

| Token | hex | RGB | 役割 |
|-------|-----|-----|------|
| Black | `#000000` | (0, 0, 0) | ヘッダー背景・h1 見出し |
| Text Primary | `#333333` | (51, 51, 51) | 本文テキスト・見出し |
| Gray | `#666666` | (102, 102, 102) | フッター・補助テキスト |
| Light Gray Nav | `#cccccc` | (204, 204, 204) | ヘッダー内リンク色 |
| Border / Disabled | `#bfbfbf` | (191, 191, 191) | ボーダー・無効状態 |
| Surface Warm | `#f2f1ef` | (242, 241, 239) | ウォーム面背景 |
| Surface Cool | `#f1f1f1` | (241, 241, 241) | クール面背景 |
| Background | `#f4f5f6` | (244, 245, 246) | ページ全体の背景色 |
| Surface Alert | `#fcf1f1` | (252, 241, 241) | アラート・お知らせ面 |
| White | `#ffffff` | (255, 255, 255) | カード・フォーム・メインビュー面 |

### Semantic

- **Danger / Alert**: `#cc0000`（ブランドレッドと兼用）
- **Info Surface**: `#f2f1ef`（ウォームサーフェス）

### Header / Footer

- **Header BG**: `#000000`（ブラック）
- **Footer BG**: `#666666`（グレー）
- **Overlay**: `rgba(0, 0, 0, 0.7)`（モーダル背景）

---

## 3. Typography Rules

### 3.1 和文フォント

- **ゴシック体**: **Noto Sans JP** を最優先。Google Fonts のオープンソースフォント
- **フォールバック**: メイリオ → sans-serif
- **明朝体**: 使用しない（サイト全体ゴシック統一）

### 3.2 欧文フォント

- 専用の欧文書体は持たず、**Noto Sans JP の欧文グリフ**を優先
- フォールバックに各 OS のシステムフォント

### 3.3 font-family 指定

'''css
/* 全要素共通（body, h1〜h3, p, a, span, button, nav, header, footer） */
font-family: "Noto Sans JP", メイリオ, sans-serif;
'''

**フォールバックの考え方**:
- Noto Sans JP を最優先し、和文・欧文ともに統一
- メイリオは Windows 環境でのフォールバック
- フォールバックチェーンが短くシンプルなのが特徴

### 3.4 文字サイズ・ウェイト階層

> 実測値（トップページ、2026-05-21 取得）

| Role | Font | Size | Weight | Line Height | Letter Spacing | Color | 備考 |
|------|------|------|--------|-------------|----------------|-------|------|
| Hero H2 | Noto Sans JP | 30px | 700 | 45px (×1.5) | 0.336px (0.02em) | `#ffffff` | "最高のサービスのために" |
| Section H2 | Noto Sans JP | 24px | 700 | 36px (×1.5) | 0.336px (0.02em) | `#333333` / `#ffffff` | "あなたへのおすすめ情報"・"関連サービス" |
| Feature H2 | Noto Sans JP | 20px | 700 | 24px (×1.2) | 0.336px (0.02em) | `#333333` | "予約管理" |
| H3 Title | Noto Sans JP | 19.9px | 700 | 29.85px (×1.5) | 0.336px (0.02em) | `#333333` | "カテゴリから探す" |
| H3 Card | Noto Sans JP | 18px | 700 | 27px (×1.5) | 0.336px (0.02em) | `#333333` | "JALオンライン" |
| H3 Small | Noto Sans JP | 14px | 700 | 21px (×1.5) | 0.336px (0.02em) | `#333333` | カード内見出し |
| H3 Caption | Noto Sans JP | 12px | 400 | 18px (×1.5) | 0.336px (0.02em) | `#333333` | "共通" タブラベル |
| Body | Noto Sans JP | 16.8px | 400 | 25.2px (×1.5) | 0.336px (0.02em) | `#333333` | 本文（body デフォルト） |
| Body (Form) | Noto Sans JP | 15px | 400 | 19.5px (×1.3) | 0.336px (0.02em) | `#333333` | フォーム内注釈 |
| Caption | Noto Sans JP | 14px | 400 | 21px (×1.5) | 0.336px (0.02em) | `#333333` | 補足テキスト |
| Small | Noto Sans JP | 12px | 400 | 18px (×1.5) | 0.336px (0.02em) | `#333333` | 注釈・フッター |
| Nav Link (Header) | Noto Sans JP | 12px | 700 | 12px (×1.0) | 0.336px (0.02em) | `#cccccc` | ヘッダーナビ |
| CTA Label | Noto Sans JP | 16px | 700 | 16px (×1.0) | 0.336px (0.02em) | `#cccccc` / `#ffffff` | ピル CTA 文字 |
| Tab Label | Noto Sans JP | 16px | 700 | 25.6px (×1.6) | 0.336px (0.02em) | `#333333` | "国内線" タブ |

### 3.5 行間・字間

- **本文の行間 (line-height)**: 1.5（16.8px → 25.2px）
- **見出しの行間**: 1.2〜1.5
- **ナビ・ボタンの行間**: 1.0（タイトに詰める）
- **本文の字間 (letter-spacing)**: 0.336px（≈ 0.02em）— 全要素にグローバル適用
- **見出しの字間**: 同じく 0.02em

**ガイドライン**:
- letter-spacing がグローバルに 0.02em で統一されているのが特徴
- 見出しもトラッキングを詰めず、本文と同じ字間で揃える
- ナビやボタンは line-height: 1.0 でタイトに詰める

### 3.6 禁則処理・改行ルール

'''css
word-break: break-all;
overflow-wrap: break-word;
line-break: strict;
'''

### 3.7 OpenType 機能

'''css
font-feature-settings: normal;
'''

- **palt は使用しない**。全要素で `normal`（ベタ組み）
- letter-spacing: 0.02em のグローバル設定で字間を調整している

### 3.8 縦書き

該当なし

---

## 4. Component Stylings

### Buttons

**Primary (Pill)**
- Background: `#cc0000`
- Text: `#ffffff`
- Padding: 13px 40px
- Border Radius: 50px（pill）
- Font Size: 16px
- Font Weight: 700

**Primary Small (Pill)**
- Background: `#cc0000`
- Text: `#ffffff`
- Border: 1px solid `#cc0000`
- Padding: 8px 16px
- Border Radius: 50px（pill）
- Font Size: 12px
- Font Weight: 700

**Secondary (Tab)**
- Background: `transparent`
- Text: `#333333`
- Padding: 15px
- Border Radius: 0px
- Font Size: 16px
- Font Weight: 700

### Inputs

- Background: `#ffffff`
- Border: 1px solid `#bfbfbf`
- Border Radius: 6px
- Padding: 12px
- Font Size: 16.8px

### Cards

- Background: `#ffffff`
- Border: none
- Border Radius: 0px
- Padding: 15px
- Shadow: none（フラットなカードスタイル）

---

## 5. Layout Principles

### Spacing Scale

| Token | Value |
|-------|-------|
| XS | 4px |
| S | 8px |
| M | 16px |
| L | 24px |
| XL | 40px |
| XXL | 64px |

### Container

- Max Width: 1200px
- Padding (horizontal): 16px

### Grid

- Columns: 12
- Gutter: 16px

---

## 6. Depth & Elevation

| Level | Shadow | 用途 |
|-------|--------|------|
| 0 | none | カード、ボタン（フラット基調） |
| 1 | `0 2px 4px rgba(0,0,0,0.1)` | ドロップダウン |
| 2 | `0 4px 8px rgba(0,0,0,0.15)` | モーダル |

JAL のサイトはフラット基調で、shadow の使用は最小限。

---

## 7. Do's and Don'ts

### Do（推奨）

- ヘッダーは全面ブラック `#000000` にし、JALレッド `#cc0000` のピル CTA を配置する
- 本文テキストは `#333333`、背景は `#f4f5f6` で統一する
- letter-spacing は 0.02em をグローバルに適用する
- CTA ボタンは radius 50px のピル形状にする
- ナビゲーションリンクは weight 700 で統一する

### Don't（禁止）

- JALレッド `#cc0000` を本文テキスト色に使わない（CTA とアラート専用）
- ヘッダー以外の場所で `#000000` 背景を多用しない（ヘッダーの格調が薄れる）
- 本文の letter-spacing を 0.02em 以外に変更しない（全体の統一感が崩れる）
- font-feature-settings: palt を追加しない（ベタ組みで統一されている）
- 角丸 CTA（8px 等）を使わない（ピル形状で統一）

---

## 8. Responsive Behavior

### Breakpoints

| Name | Width | 説明 |
|------|-------|------|
| Mobile | ≤ 767px | モバイルレイアウト |
| Tablet | ≤ 1024px | タブレットレイアウト |
| Desktop | > 1024px | デスクトップレイアウト |

### タッチターゲット

- 最小サイズ: 44px × 44px（WCAG基準）

### フォントサイズの調整

- モバイルでは本文 14–16px、見出しはデスクトップの 70–80% 程度に縮小

---

## 9. Agent Prompt Guide

### クイックリファレンス

'''
Brand Color: #cc0000
Text Color: #333333
Background: #f4f5f6
Surface: #ffffff
Header BG: #000000
Font: "Noto Sans JP", メイリオ, sans-serif
Body Size: 16.8px
Line Height: 1.5
Letter Spacing: 0.02em
CTA Radius: 50px (pill)
'''

### プロンプト例

'''
JAL のデザインシステムに従って、フライト検索結果カードを作成してください。
- ブランドカラー: #cc0000（CTAボタンのみ）
- フォント: "Noto Sans JP", メイリオ, sans-serif
- 行間: 本文は line-height: 1.5、letter-spacing: 0.02em
- カード背景: #ffffff、ページ背景: #f4f5f6
- ボタン: #cc0000 背景、白文字、border-radius: 50px のピル形状
- テキスト色: #333333
'''
```

Prompt file from a public GitHub repository, kept with its repository and path. Check the repository's licence before reusing it.
