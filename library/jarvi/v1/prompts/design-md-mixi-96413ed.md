# DESIGN.md — MIXI

By @kzhrknt · design-system
Language: ja · Domains: gaming, product · Source: J01

Source page: https://github.com/kzhrknt/awesome-design-md-jp/blob/HEAD/design-md/mixi/DESIGN.md

```
# DESIGN.md — MIXI

> 株式会社MIXI（https://mixi.co.jp/）のデザイン仕様書。
> 実サイトの CSS computed style に基づく。モンスターストライク等を手がけるテック・ゲーム企業のコーポレートサイト。

---

## 1. Visual Theme & Atmosphere

- **デザイン方針**: 白を基調としたクリーンなコーポレートサイト。MIXIレッド `#e5004d` をアクセントに使い、フルワイドのヒーロー画像カルーセルで事業の熱量を伝える。余白を大きくとったミニマルな構成
- **密度**: 情報密度は低め。大きなビジュアルと十分なホワイトスペースでゆったりとした印象。本文 line-height: 1.86 で日本語としては広めの行間
- **キーワード**: ミニマル、コーポレート、レッドアクセント、フルワイドビジュアル、ホワイトスペース
- **特徴**: MIXIレッド `#e5004d` はバナーやバッジのアクセントに限定使用。CTAボタンは黒背景。フローティングカード型ヘッダー。Noto Sans JP を Web フォントとして使用し、統一感のある書体設計

---

## 2. Color Palette & Roles

### Primary（ブランドカラー）

- **MIXI Red** (`#e5004d`): バナー背景、「熱い」バッジ、アクセント。MIXIの象徴色
- **Black** (`#111`): テキストのベースカラー、CTA ボタン背景

### Neutral（ニュートラル）

- **Text Primary** (`#333`): 本文テキスト
- **Text Dark** (`#000`): 強調テキスト
- **Text Secondary** (`#666`): 補助テキスト
- **Text Muted** (`#888`): 注釈、タイムスタンプ
- **Text Lightest** (`#919191`): 最も薄い補助テキスト
- **Gray** (`#999`): ボーダー、アイコン
- **Background** (`#ffffff`): ページ背景（純白）
- **Surface Light** (`#f7f7f7`): セクション背景（最淡グレー）
- **Surface Subtle** (`#eee`): 区切り背景（淡グレー）
- **Border** (`#ccc`): フォームコントロールのボーダー

### Semantic（意味的な色）

- **Error** (`#e74c3c`): エラー状態
- **Focus** (`#85b7d9`): フォームフォーカスリング
- **Hover Border** (`#999`): フォームホバー時ボーダー

---

## 3. Typography Rules

### 3.1 和文フォント

**ゴシック体（デフォルト）**:
- Noto Sans JP（Google Fonts、Web フォントとして読み込み）
- ヒラギノ角ゴ ProN（macOS / iOS フォールバック）
- ヒラギノ角ゴシック（macOS フォールバック）
- メイリオ（Windows フォールバック）

### 3.2 欧文フォント

- **サンセリフ**: Noto Sans JP に含まれる欧文グリフをそのまま使用
- **フォールバック**: sans-serif

### 3.3 font-family 指定

'''css
/* サイト全体 */
font-family: "Noto Sans JP", "Hiragino Kaku Gothic ProN", "Hiragino Sans", meiryo, sans-serif;
'''

**フォールバックの考え方**:
- Noto Sans JP を Web フォントとして読み込み、全体の統一感を確保
- macOS は「Hiragino Kaku Gothic ProN」→「Hiragino Sans」の二段構え
- Windows はメイリオにフォールバック
- 欧文専用フォントは使わず、Noto Sans JP の欧文グリフで統一

### 3.4 文字サイズ・ウェイト階層

> 以下は computed style による実測値

| Role | Font | Size | Weight | Line Height | Letter Spacing | 備考 |
|------|------|------|--------|-------------|----------------|------|
| Hero Statement | Noto Sans JP | 35px | 600 | 54.95px (x1.57) | 0.7px (0.02em) | ヒーロー内キャッチコピー |
| Body | Noto Sans JP | 15px | 400 | 27.9px (x1.86) | 0.3px (0.02em) | 本文テキスト |
| News Item | Noto Sans JP | 13px | 400 | 22.1px (x1.7) | 0.26px (0.02em) | ニュース一覧テキスト |
| Nav Link | Noto Sans JP | 13px | 600 | 14.95px (x1.15) | normal | ヘッダーナビゲーション |
| Menu Label | Noto Sans JP | 13px | 600 | 18.2px (x1.4) | normal | 「全てのメニュー」ラベル |
| Footer | Noto Sans JP | 12px | 400 | 13.8px (x1.15) | 0.6px (0.05em) | フッターテキスト |

### 3.5 行間・字間

**行間 (line-height)** — 実測値:
- ヒーロー: `1.57`（54.95px / 35px）— 大きな文字は詰め気味
- 本文: `1.86`（27.9px / 15px）— 日本語本文として広めの行間
- ニュース一覧: `1.7`（22.1px / 13px）
- ナビ・フッター: `1.15`（14.95px / 13px, 13.8px / 12px）— UIラベルは詰め

**字間 (letter-spacing)** — 実測値:
- 本文・ヒーロー: `0.02em` 相当（各サイズに 0.02em を適用）
- フッター: `0.05em`（0.6px / 12px）
- ナビゲーション: `normal`

**ガイドライン**:
- コンテンツテキストには一律 `0.02em` の字間を適用
- ナビゲーション等の UI ラベルは `normal`
- フッターはやや広めの `0.05em`

### 3.6 禁則処理・改行ルール

'''css
word-wrap: break-word;
overflow-wrap: break-word;
'''

### 3.7 OpenType 機能

'''css
/* サイト全体で palt / kern は適用されていない */
font-feature-settings: normal;
'''

- palt: 未使用
- kern: 未使用

### 3.8 縦書き

- 該当なし。横書きのみ

---

## 4. Component Stylings

### Buttons

**CTA Button（黒ボタン）**
- Background: `#000`
- Text: `#fff`
- Border: none
- Padding: 12px 24px（推定）
- Border Radius: 3px
- Font: Noto Sans JP
- Font Weight: 600

**Language Switcher（言語切替）**
- Background: transparent
- Text: `#fff`（フッター内）
- Border: 1px solid `#fff`
- Border Radius: 3px

### Inputs

**テキスト入力**
- Border: 1px solid `#ccc`
- Border Radius: 3px
- Focus Border: `#85b7d9`
- Hover Border: `#999`

### Cards

- Background: `#ffffff`
- Border: none
- Border Radius: 4px（推定）
- Shadow: 軽微なシャドウ（ヘッダーフローティングカード）

### Badge（「熱い」バッジ）

- Background: `#e5004d`
- Text: `#ffffff`
- Font Weight: 700
- Border Radius: 4px（推定）

### Header

- Background: `rgba(255, 255, 255, 0.7)` — 半透明白のフローティングカード型
- Border Radius: 8px（推定）
- Shadow: `0 2px 8px rgba(0,0,0,0.08)`（推定）
- Position: fixed / sticky

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
| XXL | 80px |

### Container

- Max Width: 1200px（推定）
- Padding (horizontal): 20px

### Grid

- フルワイドのヒーロー画像カルーセルが特徴
- ニュース一覧: リスト形式
- コンテンツエリアは中央寄せの単カラム構成

---

## 6. Depth & Elevation

| Level | Shadow | 用途 |
|-------|--------|------|
| 0 | none | フラットな要素、ページ背景 |
| 1 | `0 2px 8px rgba(0,0,0,0.08)` | フローティングヘッダー（推定） |
| 2 | `0 4px 16px rgba(0,0,0,0.12)` | ホバー時の強調（推定） |

- ヘッダーが半透明白のフローティングカードで、軽いシャドウで浮遊感を出す
- 全体的にフラットなデザインで、シャドウの使用は控えめ

---

## 7. Do's and Don'ts

### Do（推奨）

- ページ背景は純白 `#ffffff` を使う
- アクセントには MIXI Red `#e5004d` を使う（バナー背景、バッジ）
- CTA ボタンは黒背景 `#000` + 白文字 + `border-radius: 3px`
- フォントは Noto Sans JP を基本にし、フォールバックチェーンを守る
- 本文は 15px / line-height: 1.86 / letter-spacing: 0.02em を維持する
- ヒーロー画像はフルワイドで大きく使い、余白を十分にとる
- ヘッダーは半透明白のフローティングカード型にする
- フッターは黒背景に白文字、言語切替（日本語/English）を配置

### Don't（禁止）

- MIXI Red `#e5004d` を本文テキスト色として使わない（バナー・バッジのアクセント専用）
- CTA ボタンの角丸を大きくしない（3px を維持。pill 型は使わない）
- palt / kern を適用しない（font-feature-settings: normal を維持）
- ヒーロー領域を小さくしない（フルワイドビジュアルがデザインの要）
- 情報密度を高くしすぎない（ホワイトスペースを十分に確保する）
- ページ背景にグレーを使わない（`#ffffff` 純白を使う）
- ナビゲーションのフォントウェイトを 400 にしない（600 を使う）

---

## 8. Responsive Behavior

### Breakpoints

| Name | Width | 説明 |
|------|-------|------|
| Mobile | <= 767px | モバイルレイアウト |
| Tablet | <= 1024px | タブレットレイアウト |
| Desktop | > 1024px | デスクトップレイアウト |

### タッチターゲット

- 最小サイズ: 44px x 44px（WCAG 基準）

### フォントサイズの調整

- モバイルではヒーローテキストを縮小（35px → 24px 程度）
- 本文 15px はモバイルでも維持
- ハンバーガーメニューに切り替え（「全てのメニュー」ラベル: 13px 600）

---

## 9. Agent Prompt Guide

### クイックリファレンス

'''
MIXI Red: #e5004d（バナー背景・バッジ・アクセント）
CTA Black: #000（ボタン背景）

Text Primary: #333
Text Dark: #000
Text Secondary: #666
Text Muted: #888
Background: #ffffff
Surface Light: #f7f7f7
Footer: #000（黒背景）

Font: "Noto Sans JP", "Hiragino Kaku Gothic ProN", "Hiragino Sans", meiryo, sans-serif

Body Size: 15px / line-height: 1.86 / letter-spacing: 0.02em
Hero Statement: 35px / 600 / letter-spacing: 0.02em
Nav Link: 13px / 600
CTA Button: black bg / white text / radius 3px
palt: なし
'''

### プロンプト例

'''
MIXI のデザインに従って、コーポレートページを作成してください。
- フォント: "Noto Sans JP", "Hiragino Kaku Gothic ProN", "Hiragino Sans", meiryo, sans-serif
- ページ背景: #ffffff（純白）
- ヘッダー: 半透明白（rgba(255,255,255,0.7)）のフローティングカード型
- ヒーロー: フルワイド画像カルーセル
- アクセントカラー: #e5004d（バナー・バッジに限定使用）
- CTA ボタン: 黒背景 #000、白文字、radius 3px
- テキスト色: #333
- 本文: 15px, line-height: 1.86, letter-spacing: 0.02em
- フッター: 黒背景、白文字、言語切替あり
- palt / kern は使わない
'''
```

Prompt file from a public GitHub repository, kept with its repository and path. Check the repository's licence before reusing it.
