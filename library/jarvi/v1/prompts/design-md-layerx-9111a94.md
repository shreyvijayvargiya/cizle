# DESIGN.md — LayerX（レイヤーエックス）

By @kzhrknt · design-system
Language: ja · Domains: product, finance, data · Source: J01

Source page: https://github.com/kzhrknt/awesome-design-md-jp/blob/HEAD/design-md/layerx/DESIGN.md

```
# DESIGN.md — LayerX（レイヤーエックス）

> LayerX（https://layerx.co.jp/）のデザイン仕様書。
> バックオフィス DX・法人支出管理（バクラク）・フィンテック事業を展開するスタートアップ。
> 実サイトの computed style 実測（2026-06 取得）に基づく。

---

## 1. Visual Theme & Atmosphere

- **デザイン方針**: ダークネイビー `#152632` を主軸テキスト色に、**ブルーパープル `#534dff` のピル CTA** と **グリーン `#ccefd1` のカテゴリバッジ**で先端テック企業の革新性と信頼感を同居させる。白背景に整然と並ぶタイポグラフィが主役
- **密度**: 見出しは `letter-spacing: 0.04em` の広めトラッキングで伸びやかに。本文は `line-height: 1.5`。情報密度より品格優先のコーポレートサイト
- **キーワード**: ネイビー×パープル、デュアルフォントシステム、PPMori の欧文グリフ、モダン金融テック、上質感
- **特徴**:
  - **デュアルフォントシステム**: 欧文見出しに **PPMori-SemiBold**（Pangram Pangram）、和文ボディに **TazuganeGothicStdN**（Morisawa）を組み合わせる。和欧の組版を書体で明確に役割分担させた珍しい構成
  - **`"chws"` font-feature**: ボディテキストに `font-feature-settings: "chws"` を適用。和欧間・句読点前後のスペーシングをコンテキストに応じて自動調整する現代的日本語組版手法
  - **見出しの `"palt" "ss02"`**: 見出し・ラベルには `"liga" 0, "palt", "ss02"` を適用し、日本語のプロポーショナル字詰めとスタイリスティックセット変換を有効化
  - **テキスト色はネイビー `#152632`**。純黒を使わず、ブルーがかった深色で上質なトーンを保つ
  - CTA ボタンに **`box-shadow: rgba(21,38,50,0.13) 0px 8px 40px`** を採用。軽い浮遊感でクリック誘導
  - ダークモード非対応（実測時点）

---

## 2. Color Palette & Roles

> 実サイトの computed style 実測値。すべて hex 表記。

### Brand

- **Brand Blue-Purple** (`#534dff`): メインのブランドカラー。主要 CTA "Join Us / 採用情報" の背景色。CSS Custom Property `--pause-bg-color`
- **Brand Purple Text** (`#ffffff`): CTA 上の文字色。`--pause-text-color`

### CTA / Buttons

- **Primary CTA（パープルピル）** — "Join Us"
  - Background: `#534dff`
  - Text: `#ffffff`
  - Border Radius: `9999px`（完全ピル）
  - Shadow: `rgba(21,38,50,0.13) 0px 8px 40px`

### Badge

- **Category Badge（グリーン）** — "Fintech事業" 等
  - Background: `#ccefd1`
  - Text: `#152632`
  - Border Radius: `9999px`（完全ピル）
  - Padding: `5px 10px 2px`
  - Font: 12px / line-height 1.4 / letter-spacing 0.02em

### Neutral — Dark Navy Scale

| Token | hex | RGB | 役割 |
|-------|-----|-----|------|
| Text Primary | `#152632` | (21,38,50) | 見出し・本文の主要テキスト。ブルー寄りのネイビー |
| Text Secondary | `#727888` | (114,120,136) | 補助テキスト、キャプション |
| Border | `#d3d4d9` | (211,212,217) | 区切り線・入力欄枠 |
| Surface | `#f6f6f7` | (246,246,247) | カード背景・薄面 |
| White | `#ffffff` | (255,255,255) | ページ背景 |

### Semantic（推奨値）

実サイトには明確なセマンティックカラーが表面化していないため、ブランドカラーと調和する推奨補完値:

- **Danger**: `#e53e3e`
- **Success**: `#38a169`
- **Warning**: `#d69e2e`

---

## 3. Typography Rules

### 3.1 和文フォント

- **ゴシック体（本文用）**: **TazuganeGothicStdN-Regular**（Morisawa、Adobe Fonts）を最優先。Noto Sans JP や Hiragino とは異なる均整の取れた字面
- **ゴシック体（見出し・ラベル用）**: **TazuganeGothicStdN-Bold**
- **フォールバック**: `"Noto Sans JP"` → `"Hiragino Kaku Gothic ProN"` → `Meiryo` → `sans-serif`
- **明朝体**: 使用しない（サイト全体ゴシック統一）

### 3.2 欧文フォント

- **サンセリフ（見出し・ラベル用）**: **PPMori-SemiBold**（Pangram Pangram）。モダンで中立的なジオメトリックサンセリフ。Google Fonts 代替: **DM Sans**（weight 600）
- **サンセリフ（欧文本文）**: PPMori の Regular ウェイト
- **等幅**: 実測上使用なし

### 3.3 font-family 指定

'''css
/* 本文（和文主体） */
font-family: TazuganeGothicStdN-Regular, "Noto Sans JP",
  "Hiragino Kaku Gothic ProN", Meiryo, sans-serif;

/* 見出し・ラベル（欧文先頭、和文 Bold にフォールバック） */
font-family: PPMori-SemiBold, TazuganeGothicStdN-Bold,
  "Noto Sans JP", "Hiragino Kaku Gothic ProN", Meiryo, sans-serif;

/* 英語見出し（欧文のみ） */
font-family: PPMori-SemiBold, sans-serif;
'''

**フォールバックの考え方**:
- 見出し・ラベルは **PPMori（欧文）を先頭**に置き、和文グリフは TazuganeGothicStdN-Bold に委ねる。欧文と和文の書体を明確に役割分担させる設計
- 本文は **TazuganeGothicStdN-Regular（和文優先）**。欧文グリフも同書体が担う
- Adobe Fonts のフォントはドメインライセンスのため未契約環境では即座に Noto Sans JP へフォールバック

> **代替フォント注記**: PPMori-SemiBold は Pangram Pangram 有料書体。preview.html では **DM Sans**（Google Fonts、weight 400/600）で代替。TazuganeGothicStdN は Morisawa Adobe Fonts 書体。preview.html では **Zen Kaku Gothic New**（Google Fonts、weight 400/700）で代替。字面の大きさと均整の取れた印象が近い。

### 3.4 文字サイズ・ウェイト階層

> 実測値（コーポレートトップ、2026-06 取得）

| Role | Font | Size | Weight | Line Height | Letter Spacing | Color | 備考 |
|------|------|------|--------|-------------|----------------|-------|------|
| Hero JP | PPMori-SB + TazuganeGothic-B | 60px | 400 | 1.4 (84px) | 0.04em (2.4px) | `#152632` | メインキャッチコピー |
| Display JP | PPMori-SB + TazuganeGothic-M | 44px | 400 | 1.4 (61.6px) | 0.04em | `#ffffff` | ダーク面上の大見出し |
| Body Large | PPMori-SB + TazuganeGothic-B | 32px | 400 | 1.9 (60.8px) | 0 | `#152632` | ヒーロー本文 |
| H2 (EN) | PPMori-SemiBold | 24px | 400 | 1.2 (28.8px) | 0 | `#152632` | 英語セクション見出し |
| H3 (EN) | PPMori-SemiBold | 14px | 400 | 1.2 (16.8px) | 0 | `#152632` | 英語サブ見出し |
| Nav Label XL | PPMori-SB + TazuganeGothic-B | 20px | 400 | 1.4 (28px) | 0.02em | `#152632` | ナビ・大ラベル |
| Label L | PPMori-SB + TazuganeGothic-B | 16px | 400 | 1.4 (22.4px) | 0.02em | `#152632` | カードタイトル等 |
| Label M | PPMori-SB + TazuganeGothic-B | 14px | 400 | 1.4 (19.6px) | 0.02em | `#152632` | サブラベル |
| Label S / Badge | PPMori-SB + TazuganeGothic-B | 12px | 400 | 1.4 (16.8px) | 0.02em | `#152632` | バッジ・タグ |
| Body | TazuganeGothicStdN-Regular | 16px | 400 | 1.5 (24px) | 0 | `#152632` | 本文 |

### 3.5 行間・字間

**行間 (line-height)** — 実測:
- **ヒーロー見出し (60px)**: `1.4`（84px）
- **本文 (16px)**: `1.5`（24px）
- **英語見出し (24px)**: `1.2`（28.8px）
- **ラベル・バッジ (12〜20px)**: `1.4`

**字間 (letter-spacing)** — 実測:
- **ヒーロー・大見出し**: **`0.04em`**（日本語見出しらしい広めのトラッキング）
- **ナビ・ラベル類**: `0.02em`（中程度）
- **英語見出し・本文**: `0`
- ラベル系は正の字間で読みやすさを確保、英語ベースの見出しはノートラッキング

**ガイドライン**:
- 日本語見出しは `letter-spacing: 0.04em` が LayerX の基本リズム。欧文優先の見出しは `0`
- ラベル系は `0.02em` の正トラッキングで整然とした印象を維持
- 本文は字間 `0`（chws font-feature でコンテキスト字詰めをブラウザに委ねる）

### 3.6 禁則処理・改行ルール

'''css
/* 推奨設定 */
word-break: break-word;
overflow-wrap: break-word;
'''

- 見出しは `<br>` で意味単位の改行を手動指定するケースあり
- ピルバッジは `white-space: nowrap`

### 3.7 OpenType 機能

'''css
/* 本文（TazuganeGothicStdN-Regular） */
font-feature-settings: "chws";
/* → contextual half-width spacing。和欧間・句読点前後のスペーシングを自動調整する現代的日本語組版 */

/* 見出し・ラベル（PPMori-SemiBold + TazuganeGothicStdN-Bold） */
font-feature-settings: "liga" 0, "palt", "ss02";
/* → リガチャ無効化 + プロポーショナル字詰め + スタイリスティックセット02 */
'''

- **`"chws"`**: CSS Text Level 4 の機能。OpenType `chws` タグに対応するフォントで和欧間・記号前後のスペースを自動的に最適化する。TazuganeGothicStdN が対応しているため有効活用
- **`"palt"`**: 和文の字幅をプロポーショナルに調整し、詰め組みを実現。見出し・ラベルに適用
- **`"ss02"`**: TazuganeGothicStdN のスタイリスティックセット。字形バリエーションを選択

### 3.8 縦書き

- 該当なし。横書きのみ

---

## 4. Component Stylings

### Buttons

**Primary CTA（パープルピル）** — "Join Us / 採用情報"
- Background: `#534dff`
- Text: `#ffffff`
- Border Radius: `9999px`（完全ピル）
- Shadow: `rgba(21,38,50,0.13) 0px 8px 40px`
- Font: PPMori-SemiBold, 14〜16px
- Padding: `10px 24px`（推奨）

**Secondary（ゴーストピル）** — メニューボタン等
- Background: `#ffffff`
- Text: `#152632`
- Border: `1px solid #d3d4d9`（推奨）
- Border Radius: `9999px`（完全ピル）
- Shadow: `rgba(21,38,50,0.13) 0px 8px 40px`（実測時と同様）

**Category Badge（グリーンピル）** — "Fintech事業"
- Background: `#ccefd1`
- Text: `#152632`
- Border Radius: `9999px`
- Padding: `5px 10px 2px`
- Font: PPMori-SemiBold + TazuganeGothicStdN-Bold, 12px, line-height 1.4, letter-spacing 0.02em

### Inputs（推奨実装）

- Background: `#ffffff`
- Border: `1px solid #d3d4d9`
- Border (focus): `1px solid #534dff`
- Border Radius: `8px`
- Padding: `12px 16px`
- Font: TazuganeGothicStdN-Regular, 16px
- Height: `44px`
- Outline (focus): none（border-color 変更のみ）

### Cards / Surfaces

- Background: `#ffffff`（メイン）／ `#f6f6f7`（薄面・強調なし）
- Border: `1px solid #d3d4d9` または border なし
- Border Radius: `12px`〜`16px`
- Shadow: `rgba(21,38,50,0.13) 0px 8px 40px`（浮遊感のある大ぼかし）

### Header

- Background: `#ffffff`（推奨）
- Border Bottom: `1px solid #d3d4d9`
- Height: `6rem`（実測 `--header-h: 6rem`）
- Position: `fixed top: 0`

### Footer

- Background: `#152632`（ネイビー）
- Text: `#ffffff`
- Padding: `48px 24px`

---

## 5. Layout Principles

### Spacing Scale（推奨 8px グリッド）

| Token | Value | 用途 |
|-------|-------|------|
| XS | 4px | バッジ内の細余白 |
| S | 8px | コンポーネント内小余白 |
| M | 16px | カード内の段落間 |
| L | 24px | カードの内側余白 |
| XL | 48px | セクション内の垂直余白 |
| XXL | 80px | セクション間の垂直余白 |

### Container

- Max Width: `1200px`（推奨）
- Padding (horizontal): mobile `16px` / desktop `40px`

### Border Radius Scale

| Token | Value | 用途 |
|-------|-------|------|
| Small | 4px | 入力欄エラーリング |
| Medium | 8px | 入力欄・小カード |
| Large | 12〜16px | メインカード |
| Pill | 9999px | CTA・バッジ・タグ |

### Grid

- 12 カラム Grid（推奨）
- Gutter: 24px

---

## 6. Depth & Elevation

| Level | Shadow | 用途 |
|-------|--------|------|
| 0 | `none` | 通常カード・入力欄 |
| 1 | `rgba(21,38,50,0.08) 0px 4px 20px` | ホバー時の浮き（推奨） |
| 2 | `rgba(21,38,50,0.13) 0px 8px 40px` | CTA ボタン・メインカード・メニューボタン（実測値） |
| 3 | `rgba(21,38,50,0.18) 0px 16px 60px` | モーダル・ダイアログ（推奨） |

- 影のベース色は純黒 `rgba(0,0,0,*)` ではなく**テキストプライマリ色 `rgba(21,38,50,*)` を使う**。ネイビーがかった自然な影色でブランドトーンを維持
- 拡散半径が大きい（40px）割に opacity は低い（0.13）。「ふわっとした浮遊感」が LayerX の質感

---

## 7. Do's and Don'ts

### Do（推奨）

- **見出し・ラベルは PPMori-SemiBold を先頭に**、TazuganeGothicStdN-Bold をフォールバック和文として組み合わせる
- **本文に `font-feature-settings: "chws"` を付与**する。TazuganeGothicStdN が対応しており、和欧間・句読点前後のスペーシングが自動最適化される
- **見出し・ラベルには `"palt"` を付与**してプロポーショナル字詰めを有効化する
- テキスト色はネイビー `#152632`。純黒 `#000000` は使わない
- CTA ボタンの `box-shadow` は **`rgba(21,38,50,0.13) 0px 8px 40px`** で大きく拡散させて浮遊感を出す
- 日本語見出しの letter-spacing は `0.04em`、ラベルは `0.02em` で適度に開く
- バッジ・タグは `9999px` のピルで統一する
- 影色は `rgba(21,38,50,*)` を使い、ネイビーがかったブランドトーンを影にも反映させる

### Don't（禁止）

- 本文に `"palt"` を付与しない。本文字詰めは `"chws"` に委ね、詰めすぎを防ぐ
- 見出しに `letter-spacing: 0` を使わない（日本語見出しは 0.04em が基本）
- テキスト色に純黒 `#000000` を使わない
- CTA に影なしフラットスタイルを使わない（浮遊感が LayerX の CTA 体験の核心）
- 補助テキストに `#152632` を使わない。`#727888`（グレー）との役割対比を維持する
- フォントに **欧文専用 weight の Regular** を使わない（PPMori は SemiBold を基本 weight とする）
- 冷たいグレー `#9ca3af` や `#6b7280` をテキストに使わない

---

## 8. Responsive Behavior

### Breakpoints（推奨値）

| Name | Min Width | 説明 |
|------|-----------|------|
| `sm` | 640px | 大きめモバイル |
| `md` | 768px | タブレット |
| `lg` | 1024px | デスクトップ（ナビ切替点） |
| `xl` | 1280px | 広いデスクトップ |

### モバイル時の調整

- Hero H1 (60px): → 36〜40px
- Display (44px): → 28〜32px
- Body Large (32px): → 22〜24px
- 本文 16px は維持（line-height 1.5 も維持）
- ナビはハンバーガー化、展開時フルスクリーン

### タッチターゲット

- 主要 CTA: 高さ 44px 以上（padding `10px 24px` + 16px font + 1.4 line-height ≒ 42px、最低 44px 確保を推奨）
- バッジ: 26px 程度（装飾用のため最小サイズ除外）

### ダークモード

- 該当なし（実測時点で未対応）

---

## 9. Agent Prompt Guide

### クイックリファレンス

'''
Brand Purple CTA: #534dff
CTA Shadow: rgba(21,38,50,0.13) 0px 8px 40px
Green Badge BG: #ccefd1
Text Primary: #152632 (ネイビー)
Text Secondary: #727888
Border: #d3d4d9
Surface: #f6f6f7
White: #ffffff

Heading Font: PPMori-SemiBold, TazuganeGothicStdN-Bold, "Noto Sans JP", "Hiragino Kaku Gothic ProN", Meiryo, sans-serif
Body Font: TazuganeGothicStdN-Regular, "Noto Sans JP", "Hiragino Kaku Gothic ProN", Meiryo, sans-serif

Body: 16px / line-height 1.5 / letter-spacing 0 / font-feature-settings: "chws"
Hero JP: 60px / line-height 1.4 / letter-spacing 0.04em / font-feature-settings: "liga" 0, "palt", "ss02"
Label: 14px / line-height 1.4 / letter-spacing 0.02em / font-feature-settings: "liga" 0, "palt", "ss02"
Badge: 12px / line-height 1.4 / letter-spacing 0.02em

Border Radius: 8px（入力欄）/ 12〜16px（カード）/ 9999px（CTA・ピル）
Shadow: rgba(21,38,50,0.13) 0px 8px 40px（CTA・カード）
'''

### プロンプト例

'''
LayerX のデザインシステムに従って、バックオフィス DX サービスのランディングページヒーローを作成してください。
- 見出しフォント: PPMori-SemiBold, TazuganeGothicStdN-Bold, "Noto Sans JP", sans-serif
- 本文フォント: TazuganeGothicStdN-Regular, "Noto Sans JP", sans-serif
- ヒーロー見出し: 60px / line-height 1.4 / letter-spacing 0.04em / color #152632
  font-feature-settings: "liga" 0, "palt", "ss02"
- 本文: 16px / line-height 1.5 / letter-spacing 0 / color #152632
  font-feature-settings: "chws"
- 主要 CTA: 背景 #534dff / 白文字 / border-radius 9999px / padding 10px 24px
  box-shadow: rgba(21,38,50,0.13) 0px 8px 40px
- カテゴリバッジ: 背景 #ccefd1 / 文字 #152632 / border-radius 9999px / padding 5px 10px 2px
  12px / letter-spacing 0.02em
- ページ背景: #ffffff、カード背景: #f6f6f7
- テキスト色: #152632（主要）/ #727888（補助）。純黒 #000000 は使わない
- 影色のベースは rgba(21,38,50,*) を使いネイビートーンを維持する
'''
```

Prompt file from a public GitHub repository, kept with its repository and path. Check the repository's licence before reusing it.
