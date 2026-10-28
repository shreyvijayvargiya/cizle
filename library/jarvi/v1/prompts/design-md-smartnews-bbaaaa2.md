# DESIGN.md — SmartNews（スマートニュース）

By @kzhrknt · design-system
Language: ja · Domains: product, data · Source: J01

Source page: https://github.com/kzhrknt/awesome-design-md-jp/blob/HEAD/design-md/smartnews/DESIGN.md

```
# DESIGN.md — SmartNews（スマートニュース）

> SmartNews（https://www.smartnews.com/ja/、コーポレート: https://about.smartnews.com/ja/）のデザイン仕様書。
> ニュースアグリゲーションアプリ。3,000以上のメディアから記事を配信し、クーポン・天気・エンタメ等の生活情報も提供する。
> 実サイトの computed style 実測（2026-06-20 取得）に基づく。2ページ（コンシューマーサイト・コーポレートサイト）を横断抽出。

---

## 1. Visual Theme & Atmosphere

- **デザイン方針**: 白地に**4色のブランドカラー（Blue / Red / Orange / Green）** を機能カテゴリのシグナルとして配置。テキストは `#333333` の落ち着いたダークグレーに統一し、ニュースメディアとしての信頼感と清潔感を演出
- **密度**: 本文の line-height は 1.8 と広め。見出しはタイトに詰めて（-0.025em）情報の階層をつくる。モバイルファーストで `text-dynamic-min-*` による流体タイポグラフィを採用
- **キーワード**: ニュースブルー、4色カテゴリバッジ、system-ui のシステムネイティブ感、フラットでクリーンな白基調、モバイルファースト
- **特徴**:
  - **コンシューマーサイト**（smartnews.com/ja/）は `system-ui, Roboto, sans-serif` でシステムネイティブ感を重視。欧文アクセントに **Barlow**（Google Fonts）を body に指定
  - **コーポレートサイト**（about.smartnews.com/ja/）は `"Noto Sans JP", sans-serif` を使用。見出しの display フォントに `neulis-sans, toppan-bunkyu-midashi-go-std`（Adobe Fonts / 凸版文久見出しゴシック）
  - **ブランドカラーは4色**。メインは **Brand Blue `#0fbbe7`**（CTA・エンタメ）。Red `#ff645b`（ニュース・地域）、Orange `#ffc73d`（天気・リンクカラー）、Green `#54e470`（おトク・クーポン）
  - コーポレートサイトの CTA は **黒ピル `#000000`** に **オレンジボーダー `#ffc73c`** の組み合わせ
  - 特徴的なカテゴリバッジ（h3）は `rounded-[1rem]` の角丸に各色背景 + 白テキスト
  - テキストカラーは一貫して `#333333`（RGB 51, 51, 51）。純黒 `#000000` は使わない
  - コーポレートサイトのテキストは `#0e0e0e`（RGB 14, 14, 14）でほぼ黒
  - セクション背景に `#f6f6f6`（コンシューマー）/ `#f3f3f3`・`#f4ecea`（コーポレート、ウォームベージュ）を使用
  - ダークモード非対応（実測時点）

---

## 2. Color Palette & Roles

> 実サイトの computed style 実測値。すべて hex 表記。

### Brand — 4色カテゴリシステム

- **Brand Blue** (`#0fbbe7`): メインブランドカラー。主要 CTA "今すぐダウンロード！" の背景、エンタメカテゴリバッジ（Tailwind トークン `bg-brand-blue` / `text-brand-blue`）
- **Brand Red** (`#ff645b`): ニュース・地域情報カテゴリバッジの背景（`bg-brand-red`）。ヘッダーナビのアクティブインジケーター `border-b-brand-red`
- **Brand Orange** (`#ffc73d`): 天気カテゴリバッジの背景（`bg-brand-orange`）。リンクカラー（`text-brand-orange`）
- **Brand Green** (`#54e470`): おトク・クーポンカテゴリバッジの背景（`bg-brand-green`）

### CTA / Buttons

- **Primary CTA（コンシューマー）**: 背景 `#0fbbe7` / 文字 `#ffffff` / radius `40px`（pill 4rem） / padding `17px 78px` / ~17px / weight 700
- **Primary CTA（コーポレート）**: 背景 `#000000` / 文字 `#ffffff` / border `1px solid #ffc73c` / radius `50px`（pill）/ padding `15px 80px 15px 30px` / 14px / weight 400
- **Secondary CTA（コーポレート）**: 背景 `#ffffff` / 文字 `#000000` / border `1px solid #ffc73c` / radius `50px`（pill）/ padding `15px 80px 15px 30px` / 14px / weight 400 — "採用サイト" 等
- **NEW Badge**: 背景 `#ffd700`（ゴールド）/ 小さいバッジ

### Neutral

| Token | hex | RGB | 役割 |
|-------|-----|-----|------|
| Dark Gray (Consumer) | `#333333` | (51, 51, 51) | 見出し・本文テキスト |
| Near Black (Corporate) | `#0e0e0e` | (14, 14, 14) | コーポレート見出し・本文 |
| Gray Text | `#6e6e6e` | (110, 110, 110) | 補助テキスト（コーポレートフッター等） |
| Surface Light | `#f6f6f6` | (246, 246, 246) | コンシューマーのセクション背景 |
| Surface Warm | `#f4ecea` | (244, 238, 234) | コーポレートのセクション背景（ウォームベージュ） |
| Surface Gray | `#f3f3f3` | (243, 243, 243) | コーポレートのニュース一覧背景 |
| Border Default | `#e5e7eb` | (229, 231, 235) | Tailwind の default border |
| White | `#ffffff` | (255, 255, 255) | ページ背景 |

### Semantic（実測未確認・推奨値）

実サイトにはエラー／成功色は表面化していない。推奨する補完値:

- **Danger**: `#dc2626`
- **Success**: `#16a34a`
- **Warning**: `#d97706`

### Header

- **Consumer Header**: 背景 `rgba(0, 0, 0, 0.3)`（半透明黒オーバーレイ）+ 白テキスト
- **Corporate Header**: 背景 `rgba(255, 255, 255, 0.8)`（半透明白）+ radius `20px` + `box-shadow: 0 0 6px rgba(0, 0, 0, 0.12)` のフローティングヘッダー

---

## 3. Typography Rules

### 3.1 和文フォント

- **コンシューマーサイト**: OS のシステムフォントに依存（`system-ui` 指定）。macOS では SF Pro / Hiragino Sans、Windows では Yu Gothic / Meiryo にフォールバック
- **コーポレートサイト（本文）**: **Noto Sans JP**（Google Fonts）を使用
- **コーポレートサイト（display）**: **凸版文久見出しゴシック Std**（toppan-bunkyu-midashi-go-std、Adobe Fonts）を使用。欧文は **Neulis Sans** と組み合わせ
- **明朝体**: 使用しない（全体ゴシック統一）

### 3.2 欧文フォント

- **コンシューマーサイト**: **Barlow**（Google Fonts）を body に指定し、数字・欧文をモダンに。フォールバックに `ui-sans-serif, system-ui, Segoe UI, Roboto, Helvetica Neue, Arial, Noto Sans, sans-serif`
- **コーポレートサイト**: **Neulis Sans**（Adobe Fonts）を display 見出しに使用。本文は Noto Sans JP の欧文グリフに依存

### 3.3 font-family 指定

'''css
/* コンシューマーサイト body */
font-family: Barlow, ui-sans-serif, system-ui, -apple-system, "system-ui",
  "Segoe UI", Roboto, "Helvetica Neue", Arial, "Noto Sans", sans-serif,
  "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", "Noto Color Emoji";

/* コンシューマーサイト 見出し・本文 */
font-family: system-ui, Roboto, sans-serif;

/* コーポレートサイト 本文 */
font-family: "Noto Sans JP", sans-serif;

/* コーポレートサイト display 見出し */
font-family: neulis-sans, toppan-bunkyu-midashi-go-std, sans-serif;
'''

**フォールバックの考え方**:
- コンシューマーサイトはモバイルアプリの延長で、OS ネイティブの書体に合わせる意図。`system-ui` が先頭
- body には `Barlow` が先頭にあり、ラテン文字（数字含む）を Barlow で描画し、和文は `system-ui` / `Roboto` にフォールバック
- コーポレートサイトは `Noto Sans JP` で和欧統一。display は Adobe Fonts のライセンスフォント

> **代替フォント注記**: Neulis Sans / 凸版文久見出しゴシック Std は Adobe Fonts のドメインライセンスのため、preview.html では表示できない。代替として **Zen Kaku Gothic New**（Google Fonts、Morisawa 系）を使用すると字面の重心が近い印象が出る。コンシューマーサイトの `system-ui` は環境依存のため、preview.html では **Noto Sans JP** で代替する。

### 3.4 文字サイズ・ウェイト階層

> 実測値。コンシューマーサイト（CS）とコーポレートサイト（Corp）を区別。
> コンシューマーサイトは base 10px の rem + `text-dynamic-min-*` で流体サイズのため、px 値は viewport 幅 1440px 時の実測。

| Role | Font | Size | Weight | Line Height | Letter Spacing | Color | 備考 |
|------|------|------|--------|-------------|----------------|-------|------|
| Hero H1 (CS) | system-ui | ~26px | **700** | ~52px (x2.0) | -0.65px (-0.025em) | `#333333` | "情報で、人生は変わる。" |
| Section H1 (CS) | system-ui | ~27px | **700** | ~44px (x1.6) | normal | `#333333` | "スマートニュースは..." |
| Section H2 Brand (CS) | system-ui | ~21px | **500** | ~34px (x1.6) | normal | `#0fbbe7` | Brand Blue のセクションリード |
| Section H2 Bold (CS) | system-ui | ~21px | **700** | ~32px (x1.5) | normal | `#333333` | レビュー見出し |
| Step H2 (CS) | system-ui | ~31px | **700** | ~36px (x1.15) | normal | `#333333` | "STEP1" |
| Feature H3 (CS) | system-ui | ~23px | **700** | 28px (x1.23) | normal | `#ffffff` | カテゴリバッジ（色背景） |
| Display H2 (Corp) | neulis-sans | ~57px | **700** | ~74px (x1.3) | normal | `#0e0e0e` | "世界中の良質な情報を..." |
| Large H2 (Corp) | neulis-sans | 90px | **700** | ~117px (x1.3) | normal | `#0e0e0e` | "ミッションMission" |
| H3 (Corp) | Noto Sans JP | ~29px | **700** | ~38px (x1.3) | normal | `#0e0e0e` | セクション見出し |
| Body (CS) | system-ui | ~17px | 400 | ~31px (x**1.8**) | normal | `#333333` | 本文 |
| Body (Corp) | Noto Sans JP | 18px | 400 | ~29px (x1.6) | normal | `#0e0e0e` | 本文 |
| Caption (CS) | system-ui | ~10px | 400 | ~18px (x1.8) | normal | `#333333` | 注釈、ナビ |
| Caption (Corp) | Noto Sans JP | ~13px | 400 | ~20px (x1.6) | normal | `#0e0e0e` | 注釈 |
| Small (Corp) | Noto Sans JP | ~13px | 400 | ~20px (x1.6) | normal | `#6e6e6e` | フッター補助テキスト |
| Nav (Corp) | Noto Sans JP | 15px | 400 | ~23px (x1.5) | normal | `#0e0e0e` | グローバルナビ |
| CTA Button (CS) | system-ui | ~17px | 700 | ~26px (x1.5) | normal | `#ffffff` | "今すぐダウンロード！" |
| Display Number (CS) | system-ui | ~65px | **900** | ~73px (x1.13) | -0.65px (-0.01em) | `#333333` | "情報量No.1!" |

### 3.5 行間・字間

**行間 (line-height)** -- 実測:
- **本文 (CS ~17px)**: `1.8`（30.7px / 17px）-- ニュースアプリらしいゆったりした行間
- **本文 (Corp 18px)**: `1.6`（28.8px / 18px）
- **見出し (CS hero)**: `2.0`（51.6px / 25.8px）-- ヒーローの見出しは特に広い
- **見出し (CS section)**: `1.5〜1.6`
- **見出し (Corp display)**: `1.3`（73.7px / 56.7px）
- **カテゴリバッジ (h3)**: `1.23`（28px / 22.75px）
- **コーポレート本文**: `1.6`（25.6px / 16px）

**字間 (letter-spacing)** -- 実測:
- **Hero 見出し (CS)**: `-0.025em`（-0.645px / 25.8px）-- タイトに詰める
- **Display Number (CS)**: `-0.01em`（-0.645px / 64.5px）
- **本文 (CS / Corp)**: `normal`（0）-- 字間調整なし
- **ナビ・CTA**: `normal`

**ガイドライン**:
- コンシューマーサイトは `line-height: 1.8` + `letter-spacing: normal` が基本リズム
- 見出しのみ `-0.025em` のタイトトラッキングで「情報で、人生は変わる。」のようなキャッチコピーを引き締める
- コーポレートサイトは `line-height: 1.6` が基本。display 見出しは `1.3` でコンパクト

### 3.6 禁則処理・改行ルール

'''css
/* コンシューマーサイト（Tailwind 由来） */
word-break: normal;
overflow-wrap: break-word;

/* カテゴリバッジ */
white-space: nowrap;          /* バッジ内で折り返さない */

/* 本文 */
text-align: justify;          /* 両端揃え（一部セクション） */
'''

- ヒーロー見出しは改行位置を CSS で制御（`text-center` + flex）
- "※1" "※2" 等の注釈は `absolute` 配置で右肩上に

### 3.7 OpenType 機能

'''css
font-feature-settings: normal;
'''

- 実測上、`palt` / `kern` の明示的有効化は確認されなかった
- `system-ui` のメトリクスに依存。letter-spacing で見た目を調整する方針

### 3.8 縦書き

- 該当なし。横書きのみ

---

## 4. Component Stylings

### Buttons

**Primary CTA（ブルーピル）** -- "今すぐダウンロード！"
- Background: `#0fbbe7`
- Text: `#ffffff`
- Padding: `17px 78px`（1em 4.5em）
- Border Radius: `40px`（4rem、pill）
- Font: system-ui, ~17px, weight 700
- Border: none
- 注: 十分な padding でタッチターゲットを確保。`truncate` で長い文言のはみ出しを防ぐ

**Primary CTA（コーポレート、黒ピル＋オレンジボーダー）** -- "私たちのミッションとバリュー"
- Background: `#000000`
- Text: `#ffffff`
- Border: `1px solid #ffc73c`（オレンジ）
- Padding: `15px 80px 15px 30px`（左右非対称: 右にアロー分の余白）
- Border Radius: `50px`（pill）
- Font: Noto Sans JP, 14px, weight 400

**Secondary CTA（コーポレート、白ピル）** -- "採用サイト"
- Background: `#ffffff`
- Text: `#000000`
- Border: `1px solid #ffc73c`（オレンジ）
- Padding: `15px 80px 15px 30px`
- Border Radius: `50px`（pill）
- Font: Noto Sans JP, 14px, weight 400

**Category Badge（4色）** -- "ニュース" "天気" "おトク" "エンタメ"
- Background: `#ff645b` / `#ffc73d` / `#54e470` / `#0fbbe7`（カテゴリ別）
- Text: `#ffffff`
- Padding: `23px`（1em）
- Border Radius: `10px`（1rem）
- Font: system-ui, ~23px, weight 700

**Scroll-to-Top Button**
- Background: `rgba(196, 196, 196, 0.7)`
- Border Radius: `50%`（円形）
- Padding: `10px`
- Position: `fixed bottom-right`

### Inputs（推奨実装）

- Background: `#ffffff`
- Border: `1px solid #e5e7eb`
- Border (focus): `1px solid #0fbbe7`（Brand Blue）
- Border Radius: `8px`
- Padding: `12px 16px`
- Font: system-ui, 16px, weight 400
- Height: `44px`

### Cards / Surfaces

- **コンシューマー "利用される理由" カード**:
  - Background: `#ffffff`
  - Border Radius: `16px`（2xl）
  - Shadow: `3px 3px 4px rgba(0, 0, 0, 0.15)`（`shadow-reasons`）
  - Padding: `5%`（比率指定）
- **コンシューマー レビューカード**:
  - Background: `#f6f6f6`
  - Border Radius: `16px`
  - Shadow: none
  - Padding: `7%`
- **コーポレート ベネフィットカード**:
  - Background: `#ffffff`
  - Border: `10px solid #fd4749`（太いブランドレッドのボーダー）
  - Border Radius: `60px 0 0 60px`（左上・左下のみ大きな角丸）
  - Padding: ~`78px`

### Header

- **コンシューマー**:
  - Background: transparent（ヒーロー上に重なる）
  - Padding Top: `6vh`
  - ナビリンクに `border-bottom: 3px solid brand-red` でアクティブ表示
- **コーポレート**:
  - Background: `rgba(255, 255, 255, 0.8)` + `backdrop-filter` 推定
  - Border Radius: `20px`
  - Shadow: `0 0 6px rgba(0, 0, 0, 0.12)`
  - フローティングヘッダー

### Footer

- **コンシューマー**: CTA "今すぐ...ダウンロード！" をフッター直前にも配置。padding `5%`（72px 相当）
- **コーポレート**: 黒背景 `#0e0e0e` に白テキスト `#ffffff`。`footer-last-nav` にフッターナビ

---

## 5. Layout Principles

### Spacing Scale（推奨 8px グリッド）

| Token | Value | 用途 |
|-------|-------|------|
| XS | 4px | アイコンと文字の間 |
| S | 8px | バッジ内の余白 |
| M | 16px | テキスト段落間、カード内の間隔 |
| L | 24px | セクション内見出しと本文 |
| XL | 48px | セクション間の縦余白 |
| XXL | 72px | ヒーロー・フッターの余白 |

### Container

- Max Width: **1440px**（Tailwind 既定の推定値。body base 10px が viewport 依存で変動）
- Padding (horizontal): mobile `5%`（比率指定） / desktop `8%` 程度

### Border Radius Scale

| Token | Value | 用途 |
|-------|-------|------|
| Small | 4px | 小バッジ |
| Medium | 10px | カテゴリバッジ |
| Large | 16px | カード（`rounded-2xl`） |
| XLarge | 20px | ヘッダー（コーポレート） |
| Pill | 40px〜50px | CTA ボタン |
| Circle | 50% | スクロールトップボタン |

### Grid

- コンシューマーサイト: 1カラム中央配置（モバイルファースト）
- コーポレートサイト: max-width 制約の中央寄せ。セクションごとに全幅背景

---

## 6. Depth & Elevation

| Level | Shadow | 用途 |
|-------|--------|------|
| 0 | `none` | 大半の要素（基本フラット） |
| 1 | `3px 3px 4px rgba(0, 0, 0, 0.15)` | "利用される理由" カード（`shadow-reasons`） |
| 2 | `0 0 6px rgba(0, 0, 0, 0.12)` | コーポレートヘッダー |
| 3 | `0 8px 24px rgba(0, 0, 0, 0.10)` | モーダル・ダイアログ（推奨） |

- コンシューマーサイトは**ほぼフラット**。影は "利用される理由" セクションのカードのみ
- コーポレートサイトのヘッダーには軽い拡散影
- 立体感は**色面の切り替え**（白 → `#f6f6f6` → 白）とカテゴリバッジの色背景で表現

---

## 7. Do's and Don'ts

### Do（推奨）

- Brand Blue `#0fbbe7` を主要 CTA に使用する（コンシューマーサイト）
- カテゴリの区別は**4色バッジ**（Blue / Red / Orange / Green）で表現する
- 本文の line-height は **1.8** を基本にする（ニュースの可読性）
- テキストカラーは **`#333333`** を使い、純黒 `#000000` は避ける（コンシューマーサイト）
- CTA ボタンは **pill（40〜50px radius）** で統一する
- セクション背景の切り替えには `#f6f6f6`（コンシューマー）/ `#f4ecea`（コーポレートのウォームベージュ）を使う
- コーポレートサイトの CTA は黒背景 + オレンジボーダーの組み合わせを保つ
- カテゴリバッジは `border-radius: 10px`（1rem）の角丸で、pill にはしない

### Don't（禁止）

- 4色カテゴリバッジの色を**別の用途に流用しない**（Red をエラー、Green を成功に使わない。これらはカテゴリの合図色）
- コンシューマーサイトの CTA に**黒や白**を使わない -- Brand Blue `#0fbbe7` がメインアクション
- 本文に **`line-height: 1.5` 以下**を使わない（ニュースアプリの読みやすさが崩れる）
- コンシューマーサイトで **`letter-spacing: 0.04em` 以上**の広いトラッキングを使わない（サイト全体が `normal` で統一）
- カテゴリバッジを**角ばった直角**にしない（`border-radius: 10px` が基本）
- コーポレートの黒ピル CTA から**オレンジボーダーを省かない**（ブランドの特徴的な組み合わせ）
- `#f6f6f6` や `#f4ecea` のセクション背景を**冷たい青グレー**（`#f3f4f6` 等）に置き換えない

---

## 8. Responsive Behavior

### Breakpoints

コンシューマーサイトは `text-dynamic-min-*` による流体タイポグラフィを採用。base font-size (`10px`) が viewport 比で変動するため、固定ブレークポイントへの依存は少ない。

| Name | Min Width | 説明 |
|------|-----------|------|
| Mobile | < 640px | 1カラム、タップ優先 |
| Tablet | 640px〜1024px | 中間レイアウト |
| Desktop | > 1024px | フル幅レイアウト |

### モバイル時の調整

- ヒーロー H1: ~26px → 14px（`text-dynamic-min-14px`）
- セクション H2: ~21px → 16px（`text-dynamic-min-16px`）
- 本文: ~17px → 12px（`text-dynamic-min-12px`）
- カテゴリバッジ: ~23px（動的、`text-dynamic-feature`）
- ナビはヘッダーに `li` でインライン配置（ハンバーガーメニューなし）

### タッチターゲット

- 主要 CTA: padding `17px 78px` で十分なタップ領域
- ナビリンク: padding `14px` の `border-bottom` インジケーター
- スクロールトップボタン: `50%` radius の円形、padding `10px`

### ダークモード

- 該当なし（実測時点で未対応）

---

## 9. Agent Prompt Guide

### クイックリファレンス

'''
Brand Blue (CTA): #0fbbe7
Brand Red (ニュース): #ff645b
Brand Orange (天気): #ffc73d
Brand Green (おトク): #54e470
Text Color (Consumer): #333333
Text Color (Corporate): #0e0e0e
Gray Text: #6e6e6e
Surface Light: #f6f6f6
Surface Warm (Corp): #f4ecea
White: #ffffff

Font (Consumer): system-ui, Roboto, sans-serif
Font (Consumer body): Barlow, ui-sans-serif, system-ui, ... (長いフォールバック)
Font (Corporate body): "Noto Sans JP", sans-serif
Font (Corporate display): neulis-sans, toppan-bunkyu-midashi-go-std, sans-serif
（Adobe Fonts 不在時の代替: Zen Kaku Gothic New）

Body Size (CS): ~17px / line-height 1.8 / weight 400 / letter-spacing normal
Body Size (Corp): 18px / line-height 1.6 / weight 400 / letter-spacing normal
Heading (CS): ~26px / line-height 2.0 / weight 700 / letter-spacing -0.025em
Heading (Corp display): ~57px / line-height 1.3 / weight 700 / letter-spacing normal

Border Radius: 10px（バッジ）/ 16px（カード）/ 40-50px（CTA pill）
Shadow: 基本 none。カードのみ 3px 3px 4px rgba(0,0,0,0.15)
'''

### プロンプト例

'''
SmartNews のデザインに従って、ニュースカテゴリのフィード画面を作成してください。
- フォント: system-ui, Roboto, sans-serif
- セクション見出し: ~21px / weight 700 / line-height 1.5 / color #333333
- 本文: ~17px / weight 400 / line-height 1.8 / letter-spacing normal / color #333333
- 補助テキスト: ~10px / weight 400 / line-height 1.8 / color #333333
- 主要 CTA: 背景 #0fbbe7（Brand Blue）/ 白文字 / border-radius 40px / padding 17px 78px / weight 700
- カテゴリバッジ: 背景色は4色（#ff645b / #ffc73d / #54e470 / #0fbbe7）/ 白文字 / radius 10px / padding 23px / weight 700
- カード背景: 白 #ffffff / radius 16px / shadow 3px 3px 4px rgba(0,0,0,0.15)
- セクション背景: #f6f6f6 で切り替え
- テキストは #333333 で統一、純黒 #000000 は使わない
- 4色カテゴリバッジの色をセマンティック（エラー / 成功）に流用しない
'''
```

Prompt file from a public GitHub repository, kept with its repository and path. Check the repository's licence before reusing it.
