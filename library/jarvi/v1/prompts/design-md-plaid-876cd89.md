# DESIGN.md — Plaid（プレイド）

By @kzhrknt · design-system
Language: ja · Domains: product, math, data · Source: J01

Source page: https://github.com/kzhrknt/awesome-design-md-jp/blob/HEAD/design-md/plaid/DESIGN.md

```
# DESIGN.md — Plaid（プレイド）

> Plaid（https://plaid.co.jp/）のデザイン仕様書。
> KARTE を提供する CX/SaaS プラットフォーム企業のコーポレートサイト。
> 実サイトの computed style 実測（2026-06 取得）に基づく。

---

## 1. Visual Theme & Atmosphere

- **デザイン方針**: チャコールダーク (`#181d22`) のナビ・フッターに白ホワイト本文エリアを組み合わせた「洗練されたモノトーン」を基調に、レッドアクセント `#bf0023` の "VIEW MORE" テキストリンクで引き締める。ビジュアルの主役は大型欧文ディスプレイ（120px / 90px）と広いレタースペーシング
- **密度**: 本文は `line-height: 1.9` と余裕があり、見出し・本文ともに広めの `letter-spacing`（0.1〜0.12em）でゆったりとした欧文感を演出。情報密度よりも「格」と「読みやすさ」を優先
- **キーワード**: モノトーン、ダークヘッダー、洗練、広ストローク、データドリブン SaaS
- **特徴**:
  - 欧文ファースト: フォントスタック先頭は `"HCo Gotham SSm"`（Hoefler & Co の Gotham Screen Smart、ライセンスフォント）
  - ページ内で英語の大型ディスプレイテキスト（120px / 90px）と日本語の小見出し（20〜21px）が組み合わさるバイリンガル階層
  - CTA は派手なピルボタンではなく `#bf0023` のテキストリンク（"VIEW MORE"）のみ。コンポーネントの主張より余白と文字で語るスタイル
  - カードは白面＋左右対称ダブルシャドウ（両側 24–40px の非常に淡い影）で浮かせる
  - フッターの SNS アイコンは `border: 1px solid #ffffff` の円形（radius 50%）

---

## 2. Color Palette & Roles

> 実サイトの computed style 実測値。すべて hex 表記。

### Brand

- **Brand Red** (`#bf0023`): "VIEW MORE" テキストリンク等のアクセントカラー。CTA・リンク強調に使用

### Dark / Dark Surface

- **Dark Nav / Footer** (`#181d22`): グローバルナビ背景、フッター背景。深いチャコール

### Text

- **Text Primary** (`#222222`): 本文・見出し・カード内テキスト等、白背景エリアの主要テキスト
- **Text on Dark** (`#ffffff`): ダーク背景（ナビ・フッター・ダークセクション）上のテキスト

### Neutral / Surface

- **Background** (`#ffffff`): ページ背景、白コンテンツエリア
- **Card Surface** (`#ffffff`): カード背景（白）

### Elevation / Shadow

- **Card Shadow**: `rgba(47, 60, 72, 0.03) -4px 24px 40px 0px, rgba(47, 60, 72, 0.03) 4px 24px 40px 0px`（左右対称の極薄ダブルシャドウ）

### Semantic（実測未確認・推奨値）

- **Danger**: `#bf0023` を転用（Brand Red）
- **Success**: `#1e7b65` 程度の落ち着いたグリーン
- **Warning**: `#d97706` 程度のオレンジ

---

## 3. Typography Rules

### 3.1 和文フォント

- **ゴシック体**: `"Noto Sans JP"` を第2優先（HCo Gotham SSm の和文グリフを補う役割）
- **フォールバック**: `"Hiragino Kaku Gothic ProN"` → `"Hiragino Sans"` → `"BIZ UDPGothic"` → `Meiryo` → `sans-serif`
- **明朝体**: 使用しない（サイト全体ゴシック統一）

### 3.2 欧文フォント

- **サンセリフ**: `"HCo Gotham SSm"`（Hoefler & Co の Gotham Screen Smart）を最優先
- HCo Gotham SSm はスクリーン最適化版の Gotham。幾何学的なサンセリフで、weight 400〜700 に渡るクリーンな字形が特徴

### 3.3 font-family 指定

'''css
/* 全要素共通（body, h1〜h5, p, a, span, button, nav, header, footer） */
font-family: "HCo Gotham SSm", "Noto Sans JP", "Hiragino Kaku Gothic ProN",
  "Hiragino Sans", "BIZ UDPGothic", Meiryo, sans-serif;
'''

**フォールバックの考え方**:
- HCo Gotham SSm（Hoefler & Co）を最優先し、欧文・数字をブランド書体で統一する
- HCo Gotham SSm は Webフォントとしてサイトが読み込んでいるため、未取得環境では Noto Sans JP へフォールバック
- フォールバックは和文を持つフォントで構成し、欧文専用書体（Helvetica Neue 等）は挟まない

> **代替フォント注記**: HCo Gotham SSm は Hoefler & Co のライセンスフォント。デザインのプレビューや社外資料での再現が難しい。代替として **Nunito Sans**（Google Fonts, weight 400 / 500 / 700）を使うと、幾何学的なサンセリフの雰囲気が最も近い。和文補完は **Noto Sans JP** で行う（preview.html はこの組み合わせを使用）。

### 3.4 文字サイズ・ウェイト階層

> 実測値（トップページ、2026-06 取得）

| Role | Font | Size | Weight | Line Height | Letter Spacing | Color | 備考 |
|------|------|------|--------|-------------|----------------|-------|------|
| Display (EN) | HCo Gotham SSm | 120px | 500 | 1.0 | -0.02em | `#222222` | 欧文大型ディスプレイ |
| Hero H1 (JP) | HCo Gotham SSm + Noto Sans JP | 58px | 700 | 1.45 | 0.11em | `#222222` | ヒーロー日本語見出し |
| Hero H2 (EN, dark bg) | HCo Gotham SSm | 90px | 400 | 1.0 | -0.02em | `#ffffff` | ダーク背景セクション欧文見出し |
| Section Label H2 (EN) | HCo Gotham SSm | 21px | 700 | 1.0 | 0.067em | `#222222` | セクション英語ラベル見出し |
| Section Label JP | HCo Gotham SSm + Noto Sans JP | 20px | 700 | 1.0 | 0.07em | `#222222` | セクション日本語ラベル見出し |
| Body Lead | HCo Gotham SSm + Noto Sans JP | 21px | 400 | 1.8 | 0.12em | `#222222` | リードコピー・本文大 |
| Body | HCo Gotham SSm + Noto Sans JP | 14px | 400 | 1.9 | 0.1em | `#222222` | 標準本文 |
| Body (dark bg) | HCo Gotham SSm + Noto Sans JP | 14px | 400 | 1.85 | 0.1em | `#ffffff` | ダーク背景の本文 |
| Nav Link | HCo Gotham SSm | 14px | 700 / 400 | 1.65 | 0.06em | `#ffffff` | グローバルナビリンク |
| Footer Nav | HCo Gotham SSm + Noto Sans JP | 12px | 400 | 1.65 | 0.07em | `#ffffff` | フッターナビ |
| Footer Small | HCo Gotham SSm + Noto Sans JP | 12px | 400 | 1.65 | 0.07em | `#ffffff` | コピーライト等 |

### 3.5 行間・字間

**行間 (line-height)** — 実測:
- **本文 (14px)**: `1.9`（26.6px / 14px）— SaaS コーポレートとして余裕のある行間
- **リード本文 (21px)**: `1.8`（37.8px / 21px）
- **大型欧文ディスプレイ (120px / 90px)**: `1.0`（詰める）
- **見出し (58px)**: `1.45`（84.1px / 58px）
- **セクションラベル (20〜21px)**: `1.0`（一行高さ）
- **ナビ・フッター (12〜14px)**: `1.65`

**字間 (letter-spacing)** — 実測:
- **本文 (14px)**: `0.1em`（1.4px）— 広めの正のトラッキング
- **リード本文 (21px)**: `0.12em`— さらに広い
- **ヒーロー H1 (58px)**: `0.11em`（6.38px）— 大見出しでも広トラッキング（欧文の `-0.02em` とは逆方向）
- **大型欧文ディスプレイ (90〜120px)**: `-0.02em`— 欧文は詰める
- **セクションラベル (20〜21px)**: `0.067〜0.07em`
- **ナビ**: `0.06em`
- **フッター**: `0.07em`

**ガイドライン**:
- 日本語見出し・本文は **広めの正のトラッキング（0.07〜0.12em）** がブランドの基本リズム
- 欧文大型ディスプレイは `-0.02em` の**負トラッキング**でタイトに詰める（日本語とは逆方向）
- 両者の混在を適切に扱うため、日本語と欧文で letter-spacing の効果が異なる点を意識する

### 3.6 禁則処理・改行ルール

'''css
/* 推奨設定 */
word-break: normal;
overflow-wrap: break-word;
line-break: strict;
'''

- 大型欧文ディスプレイは改行位置を `<br>` で手動指定する運用
- ナビリンクは `white-space: nowrap` を推奨

### 3.7 OpenType 機能

'''css
/* 本文・メイン */
font-feature-settings: "tnum";   /* 等幅数字（tabular numbers）*/

/* フッターナビ */
font-feature-settings: "palt";   /* プロポーショナル字詰め */
'''

- **tnum**: `body` / `main` エリアで適用。データや数字が整列しやすい表記に
- **palt**: フッターナビで適用。日本語の文字間密度を整える
- 本文エリアには `palt` は適用しない（`tnum` のみ）

### 3.8 縦書き

- 該当なし。横書きのみ

---

## 4. Component Stylings

### Buttons / CTA

Plaid コーポレートサイトには目立つピルボタン CTA はなく、**テキストリンクが主要 CTA**。

**TEXT LINK CTA** — "VIEW MORE"
- Background: transparent
- Text: `#bf0023`
- Font: HCo Gotham SSm, 14px, weight 500
- Decoration: なし（または hover 時 underline）
- Arrow icon: `→` 等を併記するパターン

**Nav Language Switch** — "JP / EN"
- Text: `#ffffff`
- Font: 14px, weight 400〜700

### Inputs（推奨実装）

- Background: `#ffffff`
- Border: `1px solid #cccccc`
- Border (focus): `1px solid #222222`
- Border Radius: `4px`
- Padding: `10px 14px`
- Font: 14px, weight 400
- Height: `44px`

### Cards

- Background: `#ffffff`
- Border: なし
- Border Radius: `0px`（カード自体は角丸なし、フラット）
- Padding: `52px 50px 55px`（上下左右ともに広めの内側余白）
- Shadow: `rgba(47, 60, 72, 0.03) -4px 24px 40px 0px, rgba(47, 60, 72, 0.03) 4px 24px 40px 0px`（左右対称の両側シャドウ）

### Header / Navigation

- Background: `#181d22`（チャコールダーク）
- Position: sticky / fixed, top: 0
- Text Color: `#ffffff`
- Language Switch: JP / EN テキストリンク

### Footer

- Background: `#181d22`
- Text Color: `#ffffff`
- Social Icon Circle: `border: 1px solid #ffffff`, `border-radius: 50%`
- Nav Font: 12px, weight 400, `font-feature-settings: "palt"`

---

## 5. Layout Principles

### Spacing Scale（推奨 8px グリッド）

| Token | Value | 用途 |
|-------|-------|------|
| XS | 8px | アイコンと文字の間 |
| S | 16px | インライン要素の間隔 |
| M | 24px | カード内の段落間 |
| L | 48px | セクション内の要素間 |
| XL | 80px | セクション上下余白 |
| XXL | 120px | ヒーロー等の大余白 |

### Container

- Max Width: `1200px` 程度（推奨）
- Padding (horizontal): desktop `48px` / mobile `20px`

### Card Padding

- `52px 50px 55px`（上 52px / 左右 50px / 下 55px）— 広い内側余白がブランド感を支える

### Grid

- 12 カラムグリッド（Flexbox または CSS Grid）
- Gutter: 24〜32px

---

## 6. Depth & Elevation

| Level | Shadow | 用途 |
|-------|--------|------|
| 0 | `none` | フラット要素（ナビ・フッター・デフォルト） |
| 1 | `rgba(47,60,72,0.03) -4px 24px 40px 0px, rgba(47,60,72,0.03) 4px 24px 40px 0px` | カード（左右対称ダブルシャドウ） |
| 2 | `0 8px 24px rgba(47, 60, 72, 0.08)` | ドロップダウン・ポップオーバー（推奨） |
| 3 | `0 16px 48px rgba(47, 60, 72, 0.12)` | モーダル（推奨） |

- 実サイトのカードは **左右対称の両側シャドウ**（-4px と +4px）という珍しい実装。モノ感を維持しながら深さを出す
- 影の色は `rgba(47, 60, 72, 0.03)` と非常に薄く、チャコール系の半透明
- ナビ・フッター・ページ背景はシャドウなし（ダーク／白の面のコントラストで階層を表現）

---

## 7. Do's and Don'ts

### Do（推奨）

- フォントスタックは必ず `"HCo Gotham SSm"` を先頭に、`"Noto Sans JP"` → ヒラギノ → Meiryo の順でフォールバック
- 日本語見出し・本文の `letter-spacing` は **0.07〜0.12em** の正のトラッキングを使う
- 欧文大型ディスプレイは `-0.02em` の**負のトラッキング**で詰める
- 本文エリアには `font-feature-settings: "tnum"` を適用し、数字を等幅に
- フッターナビには `font-feature-settings: "palt"` を適用
- カード影は必ず **左右対称ダブルシャドウ** で実装する（左右どちらかだけのシャドウはブランドから外れる）
- CTA は `#bf0023` のテキストリンク形式にとどめ、ピルボタンを多用しない
- 本文の line-height は `1.9`（14px ベース）を基本にする

### Don't（禁止）

- フォントスタックに欧文専用書体（Helvetica Neue, Arial 等）を Noto Sans JP より**前に**挿入しない
- 日本語見出しに **負の letter-spacing** を使わない（STORES・freee 等とは逆方向。Plaid は常に正または -0.02em のみ欧文大型テキスト限定）
- 主要 CTA に**ピルボタン**（border-radius 9999px）を使わない — テキストリンクがブランドの約束
- カード影を**片側シャドウ**（box-shadow: 0 4px 8px ...）にしない — 左右対称ダブルシャドウが仕様
- ナビ・フッターに **`#181d22` 以外のダーク色**を使わない（`#1a1a1a`, `#0d0d0d` 等はトーンが違う）
- 本文テキスト色に **純黒 `#000000`** を使わない — `#222222`（やや和らいだ黒）が仕様
- フッター SNS アイコンの円形ボーダーを**実装省略**しない（`border: 1px solid #fff; border-radius: 50%` が必須）

---

## 8. Responsive Behavior

### Breakpoints（推奨）

| Name | Width | 説明 |
|------|-------|------|
| Mobile | ≤ 767px | モバイルレイアウト（ハンバーガーナビ） |
| Tablet | ≤ 1023px | タブレット（2カラムを1カラムに） |
| Desktop | ≥ 1024px | デスクトップ（フルレイアウト） |

### モバイル時の調整

- ヒーロー H1 (58px): → `32〜38px`
- 大型欧文ディスプレイ (90〜120px): → `48〜64px`
- Body Lead (21px): → `17〜18px`（line-height 1.8 維持）
- 本文 (14px): 維持（letter-spacing 0.1em 維持）
- ナビ: ハンバーガーアイコン（`#181d22` のストローク）→ 展開時フルスクリーン or ドロワー

### タッチターゲット

- テキストリンク CTA: タップ余白を `padding: 8px 0` 以上確保
- ナビリンク: 最小高さ 44px 以上

### ダークモード

- 該当なし（実測時点で未対応）

---

## 9. Agent Prompt Guide

### クイックリファレンス

'''
Brand Red (CTA link): #bf0023
Text Primary: #222222
Text on Dark: #ffffff
Dark Nav/Footer BG: #181d22
Page Background: #ffffff

Font: "HCo Gotham SSm", "Noto Sans JP", "Hiragino Kaku Gothic ProN",
      "Hiragino Sans", "BIZ UDPGothic", Meiryo, sans-serif
（HCo Gotham SSm 不在時の代替: "Nunito Sans" + "Noto Sans JP"）

Body: 14px / weight 400 / line-height 1.9 / letter-spacing 0.1em / font-feature-settings: "tnum"
Body Lead: 21px / weight 400 / line-height 1.8 / letter-spacing 0.12em
Hero H1 (JP): 58px / weight 700 / line-height 1.45 / letter-spacing 0.11em
Display (EN large): 90–120px / weight 400–500 / line-height 1.0 / letter-spacing -0.02em
Section Label: 20–21px / weight 700 / line-height 1.0 / letter-spacing 0.067–0.07em
Nav Link: 14px / weight 700 or 400 / line-height 1.65 / letter-spacing 0.06em / color #ffffff
Footer: 12px / weight 400 / line-height 1.65 / letter-spacing 0.07em / font-feature-settings: "palt"

Card Padding: 52px 50px 55px
Card Shadow: rgba(47,60,72,0.03) -4px 24px 40px 0px, rgba(47,60,72,0.03) 4px 24px 40px 0px
'''

### プロンプト例

'''
Plaid（plaid.co.jp）のデザインに従って、CX プラットフォームの紹介セクションを作成してください。
- フォント: "HCo Gotham SSm", "Noto Sans JP", "Hiragino Kaku Gothic ProN", "Hiragino Sans", "BIZ UDPGothic", Meiryo, sans-serif
- ナビ・フッター背景: #181d22（チャコールダーク）/ テキスト #ffffff
- 本文: 14px / weight 400 / line-height 1.9 / letter-spacing 0.1em / color #222222
- 本文の font-feature-settings: "tnum"（等幅数字）
- リード本文: 21px / weight 400 / line-height 1.8 / letter-spacing 0.12em
- セクションラベル: 21px / weight 700 / line-height 1.0 / letter-spacing 0.067em
- 欧文大型テキスト: 90–120px / weight 400–500 / line-height 1.0 / letter-spacing -0.02em / color #ffffff（ダーク背景）
- CTA: テキストリンク、color #bf0023 / 14px / weight 500（ピルボタンは使わない）
- カード: 背景 #ffffff / shadow: rgba(47,60,72,0.03) -4px 24px 40px 0px, rgba(47,60,72,0.03) 4px 24px 40px 0px / padding 52px 50px 55px
- 見出し色・本文色はすべて #222222（純黒 #000000 は使わない）
- フッター SNS アイコンは border: 1px solid #fff; border-radius: 50%; の円形
- フッターナビ: 12px / weight 400 / font-feature-settings: "palt"
'''
```

Prompt file from a public GitHub repository, kept with its repository and path. Check the repository's licence before reusing it.
