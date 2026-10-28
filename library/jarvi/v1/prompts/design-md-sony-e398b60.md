# DESIGN.md — SONY（ソニー）

By @kzhrknt · design-system
Language: ja · Domains: product, gaming, music · Source: J01

Source page: https://github.com/kzhrknt/awesome-design-md-jp/blob/HEAD/design-md/sony/DESIGN.md

```
# DESIGN.md — SONY（ソニー）

> SONY（https://www.sony.co.jp/）のデザイン仕様書。
> テクノロジーとエンタテインメントの融合を掲げるグローバル企業のコーポレートサイト。
> 実サイトの computed style 実測（2026-05-09 取得）に基づく。

---

## 1. Visual Theme & Atmosphere

- **デザイン方針**: **ダークテーマ基調**（`#111111` 背景 + 白テキスト）で、プレミアム感と技術的な先進性を表現。映像・ゲーム・音楽が事業の柱であることを反映し、暗い背景で画像やビジュアルが映えるシネマティックな世界観
- **密度**: ヒーローセクションはフルスクリーンの大胆な画像・映像演出。コーポレート情報は適度な密度でまとめ、ニュースリストは行間 1.5 でコンパクトに
- **キーワード**: ダーク＆シネマティック、SST 独自フォント、クリーンな白テキスト、先進的テクノロジー、エンタテインメント
- **特徴**:
  - フォントに **SST（Sony Sans Text）** ファミリーを使用。SST は Sony が Monotype と共同開発したコーポレートフォント。日本語は **SSTJapanesePro** を使用
  - ページ背景は `#111111`（純黒ではない暗灰色）で、長時間の閲覧時の目の負担を軽減
  - テキストリンクは `#3865e0`（Sony ブルー）
  - ニュースタイトル等に `font-feature-settings: "palt"` + `letter-spacing: 1.6px`（0.1em）の広めのトラッキングを適用
  - ヒーローコピーは weight 300（Light）で上品な印象
  - ダークモードがデフォルト。ライトモード非対応（コーポレートサイト）

---

## 2. Color Palette & Roles

> 実サイトの computed style 実測値。すべて hex 表記。

### Brand

- **Sony Black** (`#111111`): ページ背景。純黒 `#000000` ではなく暗灰色で奥行きを持たせる
- **Sony Blue** (`#3865e0`): テキストリンク、アクセントカラー（CSS 変数 `--color-link`）
- **Sony Red** (`#dd0000`): 注意喚起・重要なお知らせ（CSS 変数 `--color-red`）
- **OneTrust Blue** (`#2d75c7`): Cookie 同意バナー等のシステムボタン

### CTA / Buttons

- **System Button**: 背景 `#2d75c7` / 文字 `#ffffff` / radius `2px` / padding `12px 30px` / 12px / weight 700
- **Portal Badge**: 背景 `#ffffff` / 文字 `#000000` / radius `3px` / padding `4px 11px` / 12px / weight 400
- **Outline Button**: 背景 `#ffffff` / 文字 `#646464` / border `1px solid #646464` / radius `2px` / padding `12px 10px`

### Neutral

| Token | hex | RGB | 役割 |
|-------|-----|-----|------|
| White | `#ffffff` | (255, 255, 255) | 主要テキスト（ダーク背景上） |
| Background Black | `#111111` | (17, 17, 17) | ページ背景 |
| Primary Black | `#000000` | (0, 0, 0) | CSS 変数 `--color-primary` |
| Dark Gray | `#646464` | (100, 100, 100) | 補助テキスト、ボーダー |
| Light Gray | `#c8c8c8` | (200, 200, 200) | 薄い区切り線 |
| Surface Gray | `#eeeeee` | (238, 238, 238) | 明るい面背景（ライトセクション用） |

### Overlay

- **Card Overlay**: `rgba(0, 0, 0, 0.7)` — カードホバー時の暗転オーバーレイ
- **Scroll Overlay**: `rgba(0, 0, 0, 0.4)` — セクション背景の半透明レイヤー
- **White Mist**: `rgba(255, 255, 255, 0.5)` — 番号・インジケーター用
- **Green Accent**: `#468254` — サステナビリティセクション等のアクセント

---

## 3. Typography Rules

### 3.1 和文フォント

- **ゴシック体**: **SSTJapanesePro** を最優先。Sony が Monotype と共同開発したコーポレート和文ゴシック
- **フォールバック**: Meiryo → Hiragino Kaku Gothic ProN → sans-serif
- **明朝体**: 使用しない（サイト全体ゴシック統一）

### 3.2 欧文フォント

- **サンセリフ**: **SST（Sony Sans Text）** ファミリー。W20 = Light、W55 = Regular 相当
- **フォールバック**: Arial → Helvetica Neue

### 3.3 font-family 指定

'''css
/* メインコンテンツ */
font-family: SSTJapanesePro, "SST W20 Light", "SST W55 Light",
  Arial, "Helvetica Neue", Meiryo, "Hiragino Kaku Gothic ProN", sans-serif;

/* システム UI（Cookie バナー等） */
font-family: "SST W20 Regular", "SST W55 Regular", sans-serif;
'''

**フォールバックの考え方**:
- SST は Sony のコーポレートフォントであり、Web 配信されるカスタムフォント
- 日本語版（SSTJapanesePro）→ 欧文版 SST Light/Regular → システムフォントの順
- 欧文フォールバックに Arial / Helvetica Neue を入れている（SST の代替として字形が近い）
- 和文のフォールバックは Meiryo → Hiragino の順（Windows 優先）

> **代替フォント注記**: SST は Sony 専用のコーポレートフォントのため外部では使用不可。代替として **Noto Sans JP**（weight 300 / 400 / 700）+ **Inter** を使用すると、クリーンでニュートラルな印象が近い（preview.html はこの代替を使用）。

### 3.4 文字サイズ・ウェイト階層

> 実測値（トップ／コーポレートページ、2026-05-09 取得）

| Role | Font | Size | Weight | Line Height | Letter Spacing | Color | 備考 |
|------|------|------|--------|-------------|----------------|-------|------|
| Hero Copy | SSTJapanesePro | 31.5px | **300** | 63px (×2.0) | 3.15px (0.1em) | `#ffffff` | "テクノロジーの力で" |
| Section H2 | SSTJapanesePro | 24px | 700 | 36px (×1.5) | normal | `#ffffff` | "ミッション" |
| News Title (H3) | SSTJapanesePro | 16px | 400 | 24px (×1.5) | 1.6px (0.1em) | `#ffffff` | ニュースリストタイトル |
| Body | SSTJapanesePro | 16px | 400 | 24px (×1.5) | normal | `#ffffff` | 本文 |
| Company Name | SSTJapanesePro | 14px | 400 | 21px (×1.5) | normal | `#ffffff` | "ソニー株式会社" |
| Portal Badge | SSTJapanesePro | 12px | 400 | 12px (×1.0) | 1.6px (0.13em) | `#000000` | "ソニーグループポータルサイト" |
| Scroll Label | SSTJapanesePro | 10px | 400 | 10px (×1.0) | 1px (0.1em) | `#ffffff` | "Scroll" |
| System H2 | SST W20 Regular | 18px | 700 | 21.6px (×1.2) | normal | `#696969` | "Cookieの設定管理" |
| System Body | SST W20 Regular | 14px | 600 | 21px (×1.5) | normal | `#696969` | Cookie パネル |
| System H4 | SST W20 Regular | 14px | 600 | 21px (×1.5) | normal | `#696969` | "厳密に必要な Cookie" |

### 3.5 行間・字間

- **本文の行間 (line-height)**: 1.5（`24px` / `16px`）
- **ヒーローの行間**: 2.0（`63px` / `31.5px`）— 大きめの行間で余白を活かしたレイアウト
- **見出しの行間**: 1.5（H2）〜 1.2（システム系）
- **本文の字間 (letter-spacing)**: normal（0）
- **ニュースタイトルの字間**: 0.1em（`1.6px`）— `palt` と組み合わせたワイドトラッキング
- **ヒーローの字間**: 0.1em（`3.15px`）— 大きなサイズでは広めの字間

**ガイドライン**:
- ダークテーマでは字間をやや広めに取ると視認性が向上する
- ニュース・タイトルの 0.1em は Sony のコーポレートスタイルとして一貫

### 3.6 禁則処理・改行ルール

'''css
word-break: break-all;
overflow-wrap: break-word;
'''

### 3.7 OpenType 機能

'''css
/* ニュースタイトル・本文の一部 */
font-feature-settings: "palt";

/* ヒーロー・見出し */
font-feature-settings: "palt" 0;
'''

- **palt**: ニュースリスト等のテキスト密度が高い箇所で有効化
- ヒーロー・大見出しでは `"palt" 0` で明示的にオフ（大きなサイズでは字詰めしない）

### 3.8 縦書き

該当なし

---

## 4. Component Stylings

### Buttons

**System Primary**
- Background: `#2d75c7`
- Text: `#ffffff`
- Padding: 12px 30px
- Border Radius: 2px
- Font Size: 12px
- Font Weight: 700
- Letter Spacing: 0.96px (0.08em)

**System Outline**
- Background: `#ffffff`
- Text: `#646464`
- Border: 1px solid `#646464`
- Padding: 12px 10px
- Border Radius: 2px
- Font Size: 13px
- Font Weight: 600

**Portal Badge**
- Background: `#ffffff`
- Text: `#000000`
- Padding: 4px 11px
- Border Radius: 3px
- Font Size: 12px
- Font Weight: 400
- `font-feature-settings: "palt"`

### Cards

- Background: `rgba(0, 0, 0, 0.7)` overlay on dark images
- Border: none
- Border Radius: 0px（角丸なし）
- Padding: 32px
- テキスト色: `#ffffff`

### Navigation

- Background: `#111111`（ページ背景と同色）
- Height: 68px（CSS 変数 `--header-height`）
- Logo: "SONY" テキスト、16px、weight 400

---

## 5. Layout Principles

### Spacing Scale

| Token | Value | 備考 |
|-------|-------|------|
| XS | 8px | アイコンとラベルの間隔 |
| S | 16px | テキストブロック間 |
| M | 24px | セクション内パディング |
| L | 32px | カードパディング |
| XL | 48px | セクション間 |
| XXL | 96px | ラッパーの左右余白（`--wrapper-spacing-value`） |

### Container

- Max Width: 1680px（CSS 変数 `--container-max-width-value`）
- Content Width: 1088px（CSS 変数 `--content-small-width-value`）
- Article Width: 710px（CSS 変数 `--article-max-width-value`）
- Wrapper Padding: 96px（デスクトップ）/ 24px（モバイル）

### Grid

- ニュースリスト: 1 カラム、リスト型
- カードグリッド: 2〜4 カラム

---

## 6. Depth & Elevation

| Level | Shadow | 用途 |
|-------|--------|------|
| 0 | none | ほぼ全要素（フラットデザイン） |
| 1 | overlay `rgba(0,0,0,0.4)` | セクション背景オーバーレイ |
| 2 | overlay `rgba(0,0,0,0.7)` | カードホバー時のオーバーレイ |

ダークテーマのため、ドロップシャドウではなくオーバーレイの透明度で奥行きを表現する。

---

## 7. Do's and Don'ts

### Do（推奨）

- ダーク背景には `#111111` を使う（純黒 `#000000` は避ける）
- テキストは `#ffffff` を基調に、補助テキストに `#c8c8c8` を使う
- ニュースタイトルは `letter-spacing: 0.1em` + `palt` でワイドトラッキング
- ヒーローコピーは weight 300（Light）で上品に
- ビジュアルを大きく見せるダークテーマの余白設計を維持する
- SST フォントが使えない環境では Noto Sans JP + Inter を代替に

### Don't（禁止）

- ページ背景に純白 `#ffffff` を使わない（ダークテーマの世界観を壊す）
- ボタンの角丸を大きくしない（radius 2〜3px のシャープなスタイル）
- ヒーローに weight 700（Bold）を使わない（Light 300 が Sony のトーン）
- 明朝体を混ぜない（全体をゴシック系で統一）
- `letter-spacing` に em ではなく px を使う場合、フォントサイズとの比率に注意

---

## 8. Responsive Behavior

### Breakpoints

| Name | Width | 説明 |
|------|-------|------|
| Mobile | ≤ 375px | モバイルレイアウト（`--design-width-sp`） |
| Tablet | ≤ 768px | タブレットレイアウト |
| Desktop | > 768px | デスクトップレイアウト |

### タッチターゲット

- 最小サイズ: 44px × 44px

### フォントサイズの調整

- モバイルではヒーローコピーを 20px 程度に縮小
- ラッパーの余白は 96px → 24px（`--wrapper-spacing-sp`）

---

## 9. Agent Prompt Guide

### クイックリファレンス

'''
Background: #111111
Text Color: #ffffff
Link Color: #3865e0
Button Color: #2d75c7
Font: SSTJapanesePro, "SST W20 Light", "SST W55 Light", Arial, "Helvetica Neue", Meiryo, "Hiragino Kaku Gothic ProN", sans-serif
Body Size: 16px / Weight 400
Line Height: 1.5
Hero Weight: 300
Letter Spacing (News): 0.1em
'''

### プロンプト例

'''
Sony のコーポレートサイトのデザインシステムに従って、製品紹介セクションを作成してください。
- 背景: #111111（ダーク）
- テキスト: #ffffff
- フォント: 上記 font-family（SST 系）
- ヒーローコピーは weight 300、letter-spacing 0.1em
- ボタン: #2d75c7 背景、radius 2px
- カードはオーバーレイ方式（画像上に半透明黒 + 白テキスト）
'''
```

Prompt file from a public GitHub repository, kept with its repository and path. Check the repository's licence before reusing it.
