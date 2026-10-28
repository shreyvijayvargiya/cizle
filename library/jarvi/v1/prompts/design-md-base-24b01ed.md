# DESIGN.md — BASE（ベイス）

By @kzhrknt · design-system
Language: ja · Domains: product, math · Source: J01

Source page: https://github.com/kzhrknt/awesome-design-md-jp/blob/HEAD/design-md/base/DESIGN.md

```
# DESIGN.md — BASE（ベイス）

> BASE（https://thebase.com/）のデザイン仕様書。
> 無料で簡単にネットショップを開設できる EC プラットフォーム。
> 実サイトの computed style 実測（2026-05-18 取得）に基づく。

---

## 1. Visual Theme & Atmosphere

- **デザイン方針**: 白基調にティールグリーン `#0bb7ae` のピル CTA と温かみのあるイラストで「誰でも簡単にお店が開ける」安心感と親しみやすさを表現
- **密度**: ヒーロー・セクション見出しは大きめ（48〜56px）でゆったり。body の line-height は 1.3 と標準的で、`palt` によるプロポーショナル詰めが全体を引き締める
- **キーワード**: ティールグリーン、フレンドリー、ピル CTA、Gilroy × TazuganeGothicStdN、palt 全体適用
- **特徴**:
  - 欧文ディスプレイに **Gilroy**（幾何学的サンセリフ）、和文に **TazuganeGothicStdN**（タヅガネゴシック）を採用。Gilroy の丸みと TazuganeGothicStdN の端正さで SaaS らしい清潔感を演出
  - ブランドカラーは `#0bb7ae`（ティールグリーン、`--color-prime-500`）。CTA・アクセント・セクション背景に一貫して使用
  - アクセントにピンク `#fc6589`（`--color-pink`）を使用。キャンペーンバナー・プロモ要素で目を引く
  - CSS Custom Properties で色・スペーシングを体系的に管理（`--color-prime-*`, `--color-gray-*`, `--spacing-*`）
  - `font-feature-settings: "palt"` がグローバル適用。全テキストがプロポーショナル詰め
  - ダークモード非対応（実測時点）

---

## 2. Color Palette & Roles

> 実サイトの computed style 実測値 + CSS Custom Properties。すべて hex 表記。

### Brand

- **Prime 500** (`#0bb7ae`): メインのブランドカラー。主要 CTA「無料でショップを開設する」の背景、セクション背景の `::before` 疑似要素、ブランドアクセント全般
- **Prime 600** (`#00a099`): ホバー時の CTA 背景
- **Prime 100〜900**: `#e0f3f4` → `#c6e9eb` → `#a6dddd` → `#7fd1cf` → `#59c4c0` → `#0bb7ae` → `#00a099` → `#00938b` → `#00827a` → `#105151`

### Accent

- **Pink** (`#fc6589`): キャンペーンバナーのテキスト・ハンドメイドキャンペーン等のプロモ要素
- **Pink Light** (`#ffe4ea`): キャンペーンバナー背景（radius 6px）
- **Brown** (`#a33e36`): ウォームアクセント。限定的に使用
- **Inspiration Red** (`#ff4600`): 強調要素（hover: `#de3b00`）

### CTA / Buttons

- **Primary CTA**: 背景 `#0bb7ae` / 文字 `#ffffff` / radius `72px`（pill）/ 20px / weight 600
- **Header CTA**: 背景 `#0bb7ae` / 文字 `#ffffff` / radius `0px 0px 8px 8px`（下角のみ丸）/ 16px / weight 400
- **Campaign Banner**: 背景 `#ffe4ea` / 文字 `#fa6482` / radius `6px` / 16px

### Neutral — Gray Scale

| Token | hex | 役割 |
|-------|-----|------|
| Core Black | `#0d181e` | `--color-core-black` |
| Origin Gray | `#233237` | 本文テキスト・フッター背景（`--color-origin-gray`）|
| Gray 900 | `#1e1f2a` | — |
| Gray 800 | `#2e3242` | — |
| Gray 700 | `#45495b` | — |
| Gray 600 | `#636978` | — |
| Gray 500 | `#838996` | — |
| Gray 400 | `#9ba2ae` | — |
| Gray 300 | `#c1c7d1` | — |
| Gray 200 | `#dadce0` | — |
| Gray 100 | `#edeef1` | サーフェス・区切り |
| Gray 50 | `#f7f8f9` | 薄い背景面 |
| White | `#ffffff` | ページ背景 |

### Semantic

- **Red Lighter BG** (`#fff4f4`): エラー系の背景
- **Red Lighter Text** (`#f87e7e`): エラー系のテキスト

---

## 3. Typography Rules

### 3.1 和文フォント

- **ゴシック体**: **TazuganeGothicStdN（タヅガネゴシックスタンダード N）** を最優先。Adobe Fonts 提供のモダンゴシック
- **フォールバック**: Meiryo → Arial → sans-serif
- **明朝体**: 使用しない（サイト全体ゴシック統一）

### 3.2 欧文フォント

- **ディスプレイ**: **Gilroy** — 幾何学的サンセリフ。見出し・ブランド名に使用
- **フォールバック**: TazuganeGothicStdN の欧文グリフに任せる

### 3.3 font-family 指定

'''css
/* 全要素共通（body 継承） */
font-family: Gilroy, TazuganeGothicStdN, Meiryo, Arial, sans-serif;

/* CSS Custom Property */
--font-family-base: "TazuganeGothicStdN", Meiryo, Arial, sans-serif;
'''

**フォールバックの考え方**:
- Gilroy を先頭に置き、英数字は幾何学的サンセリフで統一
- 和文は TazuganeGothicStdN（Adobe Fonts ライセンス）にフォールバック
- 未契約環境では Meiryo → Arial → sans-serif

> **代替フォント注記**: Gilroy は商用ライセンスフォント、TazuganeGothicStdN は Adobe Fonts。preview.html では Gilroy の代替に **Outfit**（Google Fonts、幾何学的サンセリフ）、TazuganeGothicStdN の代替に **Noto Sans JP** を使用。

### 3.4 文字サイズ・ウェイト階層

> 実測値（トップページ、2026-05-18 取得）

| Role | Size | Weight | Line Height | Letter Spacing | Color | 備考 |
|------|------|--------|-------------|----------------|-------|------|
| Hero H2 | 56px | 600 | 72.8px (×1.3) | normal | `#233237` | 「まずはお試し開設を」 |
| Section H2 | 48px | 600 | 63.84px (×1.33) | 1.44px (0.03em) | `#233237` | 「BASEが強い3つの理由」 |
| Section H3 | 36px | 600 | 50.4px (×1.4) | 1.08px (0.03em) | `#ffffff` | ティール面上の白テキスト |
| Card H3 | 28px | 700 | 28px (×1.0) | normal | `#ffffff` | プラン名「スタンダードプラン」 |
| Nav H3 | 16px | 400 | 28.8px (×1.8) | 0.48px (0.03em) | `#233237` | ナビメニュー見出し |
| Body | 16px | 400 | 28.8px (×1.8) | 0.48px (0.03em) | `#233237` | 本文 |
| Body Small | 14px | 600 | 18px (×1.29) | normal | `#233237` | 補足テキスト |
| Caption | 12px | 400 | — | normal | `#233237` | 注釈 |
| CTA Label | 20px | 600 | — | normal | `#ffffff` | 「無料でショップを開設する」 |
| Campaign | 17.4px | 700 | 22.6px (×1.3) | 0.48px | `#fc6589` | キャンペーンバナーテキスト |

### 3.5 行間（line-height）の方針

- 見出し: 1.0〜1.4（サイズに応じて詰める）
- 本文: 1.8（16px × 1.8 = 28.8px）
- ナビ・ラベル: 1.0〜1.29

### 3.6 字間（letter-spacing）の方針

- 見出し: `0.03em`（1.08〜1.44px）程度で軽く広げる
- 本文: `0.03em`（0.48px）
- CTA・カード見出し: `normal`（詰めない）

### 3.7 OpenType 機能

'''css
/* body に適用（全要素に継承） */
font-feature-settings: "palt";
'''

- `palt`（プロポーショナル詰め）がグローバル適用
- 全テキストがプロポーショナルメトリクスで組まれる

### 3.8 禁則処理・改行

- `word-break`: デフォルト（`normal`）
- `overflow-wrap`: デフォルト

---

## 4. Component Stylings

### Buttons

| Type | BG | Text | Border | Radius | Size/Weight |
|------|-----|------|--------|--------|-------------|
| Primary CTA | `#0bb7ae` | `#ffffff` | none | `72px`（pill） | 20px / 600 |
| Header CTA | `#0bb7ae` | `#ffffff` | none | `0 0 8px 8px` | 16px / 400 |
| Campaign | `#ffe4ea` | `#fa6482` | none | `6px` | 16px / 400 |

### Cards

- 背景: `#ffffff`
- border-radius: 推定 8〜12px
- box-shadow: なし（フラット）
- 料金プランカードはティール面上で白背景

### プラン料金表示

- プラン名: 28px / 700 / 白テキスト（ティール or ダーク背景上）
- 料金数値: 大きめの Bold 表示
- 背景色でプランを区別（ティール / ダーク）

---

## 5. Layout Principles

- **最大幅**: コンテンツは中央揃え、セクションは全幅背景
- **セクション間余白**: `--spacing-120`（120px）〜 `--spacing-144`（144px）
- **コンポーネント間余白**: `--spacing-24`〜`--spacing-64`
- **グリッド**: カード系は 3 カラムが基本
- **ヘッダー**: 白背景、左にロゴ、右にナビ + ログイン + CTA

---

## 6. Depth & Elevation

- **影の使用**: 最小限。フラットデザインが基本
- **ヘッダー**: 固定ヘッダー、影なし or 薄い下線
- **カード**: box-shadow なし。背景色のコントラストで階層を表現
- **フッター**: `#233237`（Origin Gray）のダーク背景で区別

---

## 7. Do's and Don'ts

### Do's（推奨）

- ティール `#0bb7ae` のピル CTA を主要アクションに使う
- palt（プロポーショナル詰め）を全テキストに適用する
- Gilroy の幾何学的な字形で英数字を表示する
- 白基調 + ティールアクセントのカラーバランスを保つ
- キャンペーン要素にはピンク系（`#fc6589` / `#ffe4ea`）を使う

### Don'ts（非推奨）

- 黒いボタンを主要 CTA に使わない（ティールがブランド）
- letter-spacing を大きく広げすぎない（最大 0.03em 程度）
- 明朝体を使わない（全体ゴシック統一）
- palt を無効にしない（ブランドの文字組みの核心）
- ティール以外の色（赤・オレンジ等）を CTA に使わない

---

## 8. Responsive Behavior

- **ブレークポイント**: 実測未取得（推定 768px / 1024px）
- **モバイル**: ハンバーガーメニュー、CTA はフル幅ピルに変化
- **ヒーロー**: テキストサイズが縮小、イラストは非表示 or 縮小

---

## 9. Agent Prompt Guide

> AI エージェントがこの DESIGN.md を参照して BASE 風の UI を生成するためのガイド。

### 必須トークン

'''css
:root {
  --color-prime-500: #0bb7ae;
  --color-prime-600: #00a099;
  --color-origin-gray: #233237;
  --color-pink: #fc6589;
  --color-gray-100: #edeef1;
  --color-gray-50: #f7f8f9;
  --color-white: #ffffff;
  --font-family-base: "TazuganeGothicStdN", Meiryo, Arial, sans-serif;
}
'''

### 生成時の注意点

1. **CTA は必ずティールのピル**: `background: #0bb7ae; border-radius: 72px; color: #fff; font-weight: 600;`
2. **palt を忘れない**: `font-feature-settings: "palt";` を body に適用
3. **Gilroy が先頭**: font-family の先頭は Gilroy（欧文表示用）
4. **テキスト色は `#233237`**: 純黒 `#000000` ではなく Origin Gray を使用
5. **ピンクはキャンペーン専用**: `#fc6589` は通常のUIには使わない
```

Prompt file from a public GitHub repository, kept with its repository and path. Check the repository's licence before reusing it.
