# DESIGN.md — タイミー（Timee）

By @kzhrknt · design-system
Language: ja · Domains: product · Source: J01

Source page: https://github.com/kzhrknt/awesome-design-md-jp/blob/HEAD/design-md/timee/DESIGN.md

```
# DESIGN.md — タイミー（Timee）

> タイミー（https://timee.co.jp/）のデザイン仕様書。
> スキマバイトのマッチングアプリ。ワーカーと企業を即時マッチングする単発バイトプラットフォーム。
> 実サイトの computed style 実測（2026-05-21 取得）に基づく。

---

## 1. Visual Theme & Atmosphere

- **デザイン方針**: **タイミーイエロー `#ffd700` の大面積ヒーロー**と **アクセントブルー `#007aff`** のピル CTA で、「スキマ時間にすぐ働ける」即時性とポップな親しみやすさを表現
- **密度**: ヒーロー＋カードベースの広々したレイアウト。line-height 1.5 で可読性を確保。カード間の余白も広め
- **キーワード**: タイミーイエロー、ポップ、ピル CTA with box-shadow、即時性、Noto Sans JP 統一、若年層向け
- **特徴**:
  - ブランドカラーは **`#ffd700`（ゴールドイエロー）**。CSS 変数 `--yellow` で定義。ヒーローセクション全面に使用
  - **CTA はブルー `#007aff`**（CSS 変数 `--blue`）のピルボタンで、**`box-shadow: 0px 4px 0px #005edb`** による立体感のある "押せる" デザインが特徴的
  - **セカンダリ CTA は黄色 `#ffd700`** に黒テキスト + 黒 box-shadow `0px 8px 0px #212121` + 黒 border で、さらに遊び心のあるポップなボタン
  - テキストは `#212121`（near-black、CSS 変数 `--black`）で統一
  - 数値のアクセントに `#ff3b30`（iOS レッド、CSS 変数 `--red`）を使用（"18,000" 等の数値強調）
  - タグバッジは near-black `#212121` 背景 + 白文字
  - ユーザーの声の引用は `#eaeaea`（CSS 変数 `--lightGray`）背景
  - ダークモード非対応

---

## 2. Color Palette & Roles

> 実サイトの computed style 実測値。すべて hex 表記。CSS Custom Properties あり。

### Brand

- **Timee Yellow** (`#ffd700` / `--yellow`): メインのブランドカラー。ヒーローセクション全面背景。セカンダリ CTA 背景
- **Timee Yellow Light** (`#fff4a3` / `--creme`): 薄いイエロー。マーカー（蛍光ペン）表現の中間色
- **Marker** (`--marker: linear-gradient(transparent 65%, #ffea7b 65%)`): テキストハイライト用の蛍光ペンマーカー

### CTA / Buttons

- **Primary CTA (Blue)**: 背景 `#007aff` / 文字 `#ffffff` / radius `9999px`（pill）/ padding `16px 0px` / 18px / weight 700 / **shadow `0px 4px 0px #005edb`** / hover: `translate-y(4px)` + shadow 消失
- **Secondary CTA (Yellow)**: 背景 `#ffd700` / 文字 `#212121` / border `2px solid #212121` / radius `9999px`（pill）/ padding `24px 20px` / 20px / weight 700 / **shadow `0px 8px 0px #212121`** / letter-spacing 1.6px
- **Tertiary (Yellow)**: 背景 `#ffd700` / 文字 `#212121` / radius `99px`（pill）/ padding `20px` / weight 700
- **Text Link**: 文字 `#007aff` / weight 700 / underline border-bottom

### Neutral

| Token | hex | CSS 変数 | 役割 |
|-------|-----|----------|------|
| Black | `#212121` | `--black` | テキスト・タグバッジ背景・ボタン border |
| Gray | `#b7b8bc` | `--gray` | ページネーション非アクティブ |
| Light Gray | `#eaeaea` | `--lightGray` | 引用面・ピル inactive 背景 |
| Surface Disabled | `#dcdcdc` | — | 区切り線 |
| White | `#ffffff` | — | ページ背景・ヘッダー |

### Semantic

- **Accent Blue** (`#007aff` / `--blue`): CTA・リンク色
- **Danger / Accent Red** (`#ff3b30` / `--red`): 数値強調（"18,000" 等）
- **Secondary Gray** (`#666666`): 注釈テキスト

### Header

- **Header BG**: `#ffffff`（白）
- **Header Height**: グローバルメニュー + 固定ヘッダー

---

## 3. Typography Rules

### 3.1 和文フォント

- **ゴシック体**: **Noto Sans JP** を最優先
- **フォールバック**: sans-serif
- **明朝体**: 使用しない
- **Corporate ページ追加フォント**: M PLUS Rounded 1c、Zen Maru Gothic（丸ゴシック系を企業向けページで使用）

### 3.2 欧文フォント

- **Corporate ページ**: Nunito（丸みのあるサンセリフ）、Smooch Sans（ディスプレイ用）
- トップページでは Noto Sans JP の欧文グリフで統一

### 3.3 font-family 指定

'''css
/* トップページ（ワーカー向け） */
font-family: "Noto Sans JP", sans-serif;

/* 企業向けページ（corporate） */
font-family: var(--font-noto-sans-jp);
/* = "Noto Sans JP", "Hiragino Sans", "Yu Gothic Medium", Meiryo, sans-serif */

/* 企業向け丸ゴシック */
font-family: var(--font-rounded-mplus);
/* = "M PLUS Rounded 1c", "Hiragino Sans", "Yu Gothic Medium", Meiryo, sans-serif */
'''

### 3.4 文字サイズ・ウェイト階層

> 実測値（トップページ、2026-05-21 取得）

| Role | Font | Size | Weight | Line Height | Letter Spacing | Color | 備考 |
|------|------|------|--------|-------------|----------------|-------|------|
| Hero H2 | Noto Sans JP | 34px | 700 | 51px (×1.5) | normal | `#212121` | "お仕事についてもっと詳しく知りたい！" |
| Section H2 | Noto Sans JP | 32px | 700 | 48px (×1.5) | normal | `#212121` | "例えばこんなお仕事が" |
| Emphasis Span | Noto Sans JP | 32px | 700 | 48px (×1.5) | normal | `#212121` / `#ff3b30` | "幅広い年代の" / "18,000" |
| Stat Span | Noto Sans JP | 30px | 700 | 42px (×1.4) | normal | `#212121` | "単発" |
| CTA Text | Noto Sans JP | 24px | 700 | 36px (×1.5) | 1.28px (0.05em) | `#ffffff` | "お近くのお仕事を探す" |
| Secondary CTA | Noto Sans JP | 20px | 700 | 30px (×1.5) | 1.6px (0.08em) | `#212121` | "企業様向けページはこちら" |
| Category Pill | Noto Sans JP | 20px | 700 | 30px (×1.5) | 1px (0.05em) | `#212121` / `#ffffff` | "20代"（選択タブ） |
| H3 Section | Noto Sans JP | 18px | 700 | 27px (×1.5) | normal | `#212121` | "倉庫作業" |
| Nav Item | Noto Sans JP | 18px | 700 | 18px (×1.0) | normal | `#212121` | ナビ項目 |
| H3 Card | Noto Sans JP | 17px | 700 | 22.1px (×1.3) | normal | `#212121` | "40代（男性）会社員" |
| H3 Job Title | Noto Sans JP | 16px | 700 | 24px (×1.5) | normal | `#212121` | 求人タイトル |
| Body | Noto Sans JP | 16px | 400 | 24px (×1.5) | normal | `#212121` | 本文 |
| Body (Quote) | Noto Sans JP | 15px | 400 | 19.95px (×1.33) | normal | `#212121` | ユーザーの声 |
| Header Link | Noto Sans JP | 14px | 700 | 16.8px (×1.2) | normal | `#ffffff` / `#212121` | ヘッダーリンク |
| Caption | Noto Sans JP | 14px | 400 | 21px (×1.5) | normal | `#212121` | 補足テキスト |
| CTA Sub | Noto Sans JP | 14px | 400 | 21px (×1.5) | 1.28px (0.05em) | `#ffffff` | "スマホアプリをインストールする" |
| Tag Badge | Noto Sans JP | 13px | 400 | 13px (×1.0) | normal | `#ffffff` | "スーパー" タグ |
| Annotation | Noto Sans JP | 12px | 400 | 16.8px (×1.4) | normal | `#666666` | 注釈テキスト |
| Inline Link | Noto Sans JP | 12px | 700 | 18px (×1.5) | normal | `#007aff` | テキストリンク |

### 3.5 行間・字間

- **本文の行間 (line-height)**: 1.5（16px → 24px）
- **見出しの行間**: 1.5（見出しも line-height 1.5 で統一）
- **ナビ・タグの行間**: 1.0（タイトに詰める）
- **本文の字間 (letter-spacing)**: normal（0）— 本文にはトラッキングなし
- **CTA の字間**: 0.05em〜0.08em（ボタンテキストのみ広めに設定）

**ガイドライン**:
- 本文は letter-spacing: normal（トラッキングなし）
- CTA テキストのみ letter-spacing を広げて強調する
- 数値のアクセント（金額・人数）は red `#ff3b30` で色分け

### 3.6 禁則処理・改行ルール

'''css
word-break: break-all;
overflow-wrap: break-word;
'''

### 3.7 OpenType 機能

'''css
font-feature-settings: normal;
'''

- palt は使用しない。ベタ組みで統一

### 3.8 縦書き

該当なし

---

## 4. Component Stylings

### Buttons

**Primary (Blue Pill with Shadow)**
- Background: `#007aff`
- Text: `#ffffff`
- Padding: 16px 0px（full-width）
- Border Radius: 9999px（pill）
- Font Size: 18px
- Font Weight: 700
- Box Shadow: `0px 4px 0px #005edb`
- Hover: `transform: translateY(4px)` + shadow 消失

**Secondary (Yellow Pill with Shadow)**
- Background: `#ffd700`
- Text: `#212121`
- Border: 2px solid `#212121`
- Padding: 24px 20px
- Border Radius: 9999px（pill）
- Font Size: 20px
- Font Weight: 700
- Letter Spacing: 1.6px
- Box Shadow: `0px 8px 0px #212121`

**Tertiary (Yellow Pill)**
- Background: `#ffd700`
- Text: `#212121`
- Padding: 20px
- Border Radius: 99px
- Font Weight: 700

### Category Pills (Tab)

- **Active**: Background `#212121` / Text `#ffffff` / Border `1px solid #212121` / Radius `999px`
- **Inactive**: Background `#eaeaea` / Text `#212121` / Border `1px solid #212121` / Radius `999px`
- Padding: 内部余白付き / Font Size: 20px / Weight: 700 / Letter Spacing: 1px

### Tag Badges

- Background: `#212121`
- Text: `#ffffff`
- Padding: 4px 8px 6px
- Border Radius: 0px
- Font Size: 13px
- Font Weight: 400

### Cards

- Background: `#ffffff`
- Border: none
- Border Radius: 8px（推定）
- Padding: 16px
- Shadow: none

### Quote Block

- Background: `#eaeaea`
- Text: `#212121`
- Padding: 15px 20px
- Font Size: 15px

---

## 5. Layout Principles

### Spacing Scale

| Token | Value | CSS 変数 |
|-------|-------|----------|
| XS | 4px | — |
| S | 8px | — |
| M | 16px | — |
| L | 20px | `--padding` |
| XL | 40px | — |
| XXL | 80px | — |

### Container

- Max Width: 1020px（CSS 変数 `--max-width`）
- Padding (horizontal): 20px（CSS 変数 `--padding`）

### Transition

- デフォルト: 0.3s（CSS 変数 `--transition`）

---

## 6. Depth & Elevation

| Level | Shadow | 用途 |
|-------|--------|------|
| 0 | none | 通常のカード |
| CTA Blue | `0px 4px 0px #005edb` | プライマリ CTA（押し込み表現） |
| CTA Yellow | `0px 8px 0px #212121` | セカンダリ CTA（より深い押し込み表現） |

box-shadow を elevation ではなく、**ボタンの立体感（押せる感）** に使うのが特徴。hover 時に `translateY` でシャドウが消え、ボタンが押し込まれたように見える。

---

## 7. Do's and Don'ts

### Do（推奨）

- ヒーローセクションは `#ffd700`（タイミーイエロー）で全面塗りにする
- CTA ボタンには `box-shadow` で立体感を出し、hover で押し込みアニメーションをつける
- 数値の強調には `#ff3b30`（レッド）を使う
- CTA テキストの letter-spacing は 0.05em 以上に広げる
- タグバッジは `#212121` 背景 + 白文字で統一する

### Don't（禁止）

- タイミーイエロー `#ffd700` をテキスト色に使わない（背景色専用）
- CTA を角丸 8px 等にしない（pill 形状 + shadow で統一）
- box-shadow なしの CTA を作らない（立体感がブランドの一部）
- 本文に letter-spacing を追加しない（normal で統一）
- ブルー `#007aff` を背景色に使わない（CTA 専用）

---

## 8. Responsive Behavior

### Breakpoints

| Name | Width | 説明 |
|------|-------|------|
| Mobile | ≤ 767px | モバイルレイアウト |
| Tablet | ≤ 1020px | タブレット（max-width と一致） |
| Desktop | > 1020px | デスクトップレイアウト |

### タッチターゲット

- 最小サイズ: 44px × 44px（WCAG基準）

### フォントサイズの調整

- モバイルでは本文 14–16px、見出しはデスクトップの 70–80% 程度に縮小

---

## 9. Agent Prompt Guide

### クイックリファレンス

'''
Brand Color: #ffd700 (Yellow)
Accent Color: #007aff (Blue CTA)
Accent Red: #ff3b30 (数値強調)
Text Color: #212121
Background: #ffffff
Font: "Noto Sans JP", sans-serif
Body Size: 16px
Line Height: 1.5
Letter Spacing: normal (CTA は 0.05em+)
CTA Radius: 9999px (pill)
CTA Shadow: 0px 4px 0px #005edb
Max Width: 1020px
'''

### プロンプト例

'''
タイミーのデザインシステムに従って、求人カード一覧を作成してください。
- ブランドカラー: #ffd700（ヒーロー背景に使用）
- CTA: #007aff 背景、白文字、border-radius: 9999px、box-shadow: 0px 4px 0px #005edb
- フォント: "Noto Sans JP", sans-serif
- テキスト色: #212121
- タグバッジ: #212121 背景、白文字、padding: 4px 8px
- 数値強調: #ff3b30
- 行間: line-height: 1.5
'''
```

Prompt file from a public GitHub repository, kept with its repository and path. Check the repository's licence before reusing it.
