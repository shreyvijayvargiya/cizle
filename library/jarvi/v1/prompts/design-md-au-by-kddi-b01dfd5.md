# DESIGN.md — au by KDDI

By @kzhrknt · design-system
Language: ja · Domains: product · Source: J01

Source page: https://github.com/kzhrknt/awesome-design-md-jp/blob/HEAD/design-md/au/DESIGN.md

```
# DESIGN.md — au by KDDI

> au（https://www.au.com/）のデザイン仕様書。
> 実サイトの CSS（noto-sans-cjk-jp via Adobe Fonts）および computed style に基づく。
> 一部コンポーネントにはシステムフォント（Helvetica, ヒラギノ角ゴ ProN）が使用されている。

---

## 1. Visual Theme & Atmosphere

- **デザイン方針**: 通信キャリアとしての信頼感と親しみやすさを両立させた、クリーンなコンシューマー向けデザイン。ブランドカラーのオレンジをCTAに集中させ、本文は控えめなグレー系で読みやすさを確保
- **密度**: 情報量が多いポータル型だが、セクションごとに十分な余白を取り、視線の誘導が明確。カード型UIを多用
- **キーワード**: 信頼感、クリーン、親しみやすい、コンシューマーフレンドリー、オレンジアクセント
- **特徴**: 純粋な黒（`#000000`）は使わず、`#1b1b1b`（見出し）と `#333333`（本文）の2段階のダーク色で柔らかい印象を作っている。letter-spacing と palt は全要素に適用されていない

---

## 2. Color Palette & Roles

### Primary（ブランドカラー）

- **au Orange** (`#eb5505`): メインのブランドカラー。主要CTAボタン（"au IDでログイン"、"料金プランを詳しくみる" 等）に使用
- **au Red** (`#e40000`): 災害用伝言板バナー、セカンダリボタンのアクセントに使用

### Sub-brand

- **UQ Brand** (`#e4007f`): CSS変数 `--webm-brand-uq`。UQ mobile 関連要素のブランドカラー

### Semantic（意味的な色）

- **Danger / Alert** (`#ff0800`): 災害用伝言板ボタンのボーダー・テキスト色（`rgb(255, 8, 0)` 実測）
- **Info / Service** (`#0e0d6a`): 災害時サービス案内ボタンのボーダー・テキスト色（`rgb(14, 13, 106)` 実測）

### Neutral（ニュートラル）

- **Text Primary** (`#333333`): 本文テキスト（body, p）
- **Text Dark** (`#1b1b1b`): 見出しテキスト（h2, h3）、カードラベル
- **Text Light** (`#676767`): 補足テキスト、注意書き（`txtColor-light` クラス）
- **Text Muted** (`#777777`): 更に薄い補足テキスト（モバイルページで確認、`rgb(119, 119, 119)`）
- **Link** (`#0066aa`): テキストリンク色
- **Border** (`#d1d1d1`): 入力欄の枠線
- **Border Light** (`#e5e5e5`): CSS変数 `--webm-border`。カード区切り線等
- **Background** (`#ffffff`): ページ背景
- **Surface Gray** (`#f7f7f7`): ナビゲーション背景、セクション背景
- **Surface Gray Alt** (`#f3f3f3`): フッターメニュー、サブメニュー背景

---

## 3. Typography Rules

### 3.1 和文フォント

**ゴシック体（デフォルト）**:
- noto-sans-cjk-jp（Adobe Fonts によるホスティング）— メインの和文フォント
- ヒラギノ角ゴ ProN W3（一部バナー・古いコンポーネントで使用）

### 3.2 欧文フォント

- **サンセリフ**: Helvetica（一部バナーコンポーネントで使用）
- **明朝体**: 使用なし

### 3.3 font-family 指定

'''css
/* メインコンテンツ — Adobe Fonts (noto-sans-cjk-jp) */
font-family: noto-sans-cjk-jp;

/* バナー・一部コンポーネント */
font-family: Helvetica, "ヒラギノ角ゴ ProN W3", "Hiragino Kaku Gothic ProN", sans-serif;

/* preview.html 用代替（Google Fonts） */
font-family: "Noto Sans JP", sans-serif;
'''

**フォールバックの考え方**:
- メインコンテンツには Adobe Fonts の noto-sans-cjk-jp を単独で指定（Adobe Fonts が読み込まれる前提）
- 一部のバナーやシステム寄りのコンポーネントでは、システムフォントスタック（Helvetica + ヒラギノ角ゴ ProN）を使用
- preview.html では Adobe Fonts がライセンス制約で使えないため、Google Fonts の Noto Sans JP で代替

### 3.4 文字サイズ・ウェイト階層

> 以下は DevTools の computed style による実測値

**トップページ**

| Role | Size | Weight | Line Height | Letter Spacing | 備考 |
|------|------|--------|-------------|----------------|------|
| H1 (hidden title) | 16px | 400 | 1.4 | normal | ロゴ下の不可視タイトル "au" |
| Display H2 | 50px | 400 | 1.0 | normal | "Service 暮らしをもっとおもしろく" |
| Section H2 | 24px | 400 | 1.4 | normal | "ピックアップ" |
| Section H2 alt | 22px | 400 | 1.4〜1.7 | normal | "料金について"、"選べる通信ブランド" |
| Tagline H3 | 24px | 700 | 2.0 | normal | "おもしろいほうの未来へ。"（ブランドカラー `#eb5505`） |
| Section H3 | 20px | 400 | 1.2〜1.4 | normal | "ニュース・トピックス" |
| Sub H3 | 18px | 700 | 1.5 | normal | "お客さまの声からの改善" |
| Body (p) | 16px | 400 | 1.7 | normal | 本文テキスト |
| Body alt (p) | 16px | 400 | 1.4 | normal | 一般テキスト |
| Nav global | 15px | 700 | 1.4 | normal | グローバルナビ "商品・サービス" |
| Small | 14px | 400 | 1.7 | normal | 補足テキスト |
| Caption | 12px | 700 | 1.3〜1.4 | normal | ヘッダーリンク、フッター |
| Breadcrumb | 11px | 400 | 1.4 | normal | パンくずリスト |

**サブページ（スマートフォン・携帯電話）**

| Role | Size | Weight | Line Height | Letter Spacing | 備考 |
|------|------|--------|-------------|----------------|------|
| Page H1 | 30px | 400 | 1.4 | normal | "スマートフォン・携帯電話" |
| Section H2 | 22px | 700 | 1.4 | normal | "製品" |
| Section H3 | 20px | 400/700 | 1.4 | normal | "Apple製品"、"製品を比較する" |
| Sub H3 | 18px | 700 | 1.4 | normal | "製品別の料金プラン" |
| H4 | 18px | 700 | 1.4 | normal | "auバリューリンクプラン" |

### 3.5 行間・字間

**行間 (line-height)** — 実測値:
- body グローバル: `22.4px` (16px x 1.4)
- 本文 (p): `27.2px` (16px x 1.7) — モーダル内テキスト
- 本文 (p) alt: `22.4px` (16px x 1.4) — 一般テキスト
- Display H2: `50px` (50px x 1.0)
- Section H2: `33.6px` (24px x 1.4)
- H3: `28px` (20px x 1.4) 〜 `48px` (24px x 2.0)
- Small: `23.8px` (14px x 1.7)
- Caption: `16.8px` (12px x 1.4)

**字間 (letter-spacing)** — 実測値:
- **全要素**: `normal`（letter-spacing は一切適用されていない）

**ガイドライン**:
- au は letter-spacing を適用しないスタイル。palt も全要素で `normal`
- 本文は `1.4` 〜 `1.7` の行間で、情報量の多いページで可読性を確保
- 見出しの weight は 400（軽い）と 700（太い）が混在し、階層を表現

### 3.6 禁則処理・改行ルール

'''css
/* 特別な禁則処理設定は確認されず */
/* body のデフォルト設定を使用 */
'''

- au.com では明示的な禁則処理の CSS 設定は確認されなかった
- ブラウザのデフォルト挙動に委ねている

### 3.7 OpenType 機能

'''css
/* 全要素 — 実測確認済 */
font-feature-settings: normal;
'''

- **palt**: 適用されていない（全要素で `normal`）
- au は noto-sans-cjk-jp の標準字詰めのみを使用し、追加の OpenType 機能は無効

### 3.8 縦書き

- 該当なし。au.com は横書きのみ

---

## 4. Component Stylings

### Buttons

**Primary CTA（au Orange）**
- Background: `#eb5505`
- Text: `#ffffff`
- Padding: 12.8px 40px 12.8px 15px（右矢印アイコン分の余白）
- Border Radius: 0px（角なし — au の特徴）
- Border: 1px solid transparent
- Font Size: 16px
- Font Weight: 700

**Primary CTA（Login）**
- Background: `#eb5505`
- Text: `#ffffff`
- Padding: 12.8px 12px
- Border Radius: 0px
- Font Size: 16px
- Font Weight: 400

**Secondary（アウトライン）**
- Background: `#ffffff`
- Text: `#333333`
- Border: 1px solid `#333333`
- Padding: 12.8px 40px 12.8px 15px
- Border Radius: 0px
- Font Size: 16px
- Font Weight: 400

**Danger（災害用伝言板 — 角丸あり）**
- Background: `#ffffff`
- Text: `#e40000`
- Border: 1px solid `#e40000`
- Padding: 10px
- Border Radius: 8px（ここだけ角丸 — 特殊なコンポーネント）
- Font Size: 16px
- Font Weight: 700

**Nav Pill**
- Background: `#ffffff`
- Text: `#1b1b1b`
- Border: 1px solid `#676767`
- Padding: height 46px（line-height で制御）
- Border Radius: 25px（pill 型）
- Font Size: 16px
- Font Weight: 700

**Card Nav**
- Background: `#ffffff`
- Text: `#1b1b1b`
- Padding: 0px
- Border Radius: 5px
- Shadow: `0px 2px 4px #e6e6e6`
- Font Size: 16px
- Font Weight: 700

### Inputs

- Background: `#ffffff`（`rgba(0,0,0,0)` — transparent、container で白背景）
- Border: 1px solid `#d1d1d1`
- Border Radius: 0px
- Padding: 0px 30px 0px 6px（検索欄）/ 5px 32px 5px 6px（モバイル検索欄）
- Font Size: 12px（デスクトップ検索欄）/ 16px（モバイル検索欄）
- Line Height: 30px（デスクトップ）

### Cards

- Background: `#ffffff`
- Border Radius: 5px
- Shadow: `0px 2px 4px #e6e6e6`
- Padding: varies

---

## 5. Layout Principles

### Container

- Max Width: 1280px（推定。メインコンテンツエリア）
- Padding (horizontal): varies by section

### Grid

- カード型レイアウトを多用
- スライダー（Slick.js）によるカルーセル表示

### Spacing

- セクション間の余白は 40〜50px
- カード内の余白は 14〜15px

---

## 6. Depth & Elevation

| Level | Shadow | 用途 |
|-------|--------|------|
| 0 | none | フラットな要素、メインボタン |
| 1 | `0px 2px 4px #e6e6e6` | カードナビゲーション |
| CSS var | `rgb(0 0 0 / 10%)` | `--webm-shadow`。汎用シャドウ |

- au.com は比較的フラットなデザインで、シャドウの使用は控えめ
- ナビゲーションカードにのみ軽いドロップシャドウを適用
- メインCTAボタンにはシャドウなし

---

## 7. Do's and Don'ts

### Do（推奨）

- CTAボタンには `#eb5505`（au Orange）を使い、角丸なし（radius: 0px）で表現する
- テキスト色は `#333333`（本文）と `#1b1b1b`（見出し）の2段階を使い分ける
- 補足テキストは `#676767` を使う
- リンク色は `#0066aa` を統一的に使う
- ボタンの右側に矢印アイコン分の余白（padding-right: 30〜40px）を取る
- フォントは noto-sans-cjk-jp（または Noto Sans JP）を使用する
- line-height は本文で 1.4〜1.7 の範囲を維持する
- Nav Pill（25px radius）と通常ボタン（0px radius）を目的に応じて使い分ける

### Don't（禁止）

- CTAボタンに角丸を付けない（au の通常ボタンは radius: 0px。8px 角丸は災害情報等の特殊用途のみ）
- `#000000`（純粋な黒）をテキストに使わない（`#1b1b1b` または `#333333` を使う）
- letter-spacing や palt を適用しない（au は全要素で `normal`）
- ブランドカラー `#eb5505` を本文テキストに使わない（CTAとブランド要素専用。例外: タグライン見出し）
- `#e40000`（au Red）を一般的なボタンに使わない（災害情報やアラート用途に限定）
- 見出しに weight 400 と 700 を無秩序に混ぜない（Display は 400、セクション見出しは 700 のパターンに従う）

---

## 8. Responsive Behavior

### Breakpoints

| Name | Width | 説明 |
|------|-------|------|
| Mobile | ≤ 767px | モバイルレイアウト（SP）|
| Desktop | > 767px | デスクトップレイアウト（PC）|

### タッチターゲット

- 最小サイズ: 44px 相当（ナビゲーションリンクの padding で確保）

### フォントサイズの調整

- モバイルでは検索欄が 16px に拡大（デスクトップの 12px から。iOS のズーム防止）
- 見出しサイズはモバイルで縮小される

---

## 9. Agent Prompt Guide

### クイックリファレンス

'''
Brand Color: #eb5505（au Orange — CTA・アクセント用）
Brand Red: #e40000（災害情報・アラート用）
UQ Brand: #e4007f（UQ mobile 用）
Link Color: #0066aa

Text Dark: #1b1b1b（見出し）
Text Primary: #333333（本文）
Text Light: #676767（補足）
Background: #ffffff
Surface: #f7f7f7

Font: noto-sans-cjk-jp (Adobe Fonts)
Preview Font: "Noto Sans JP", sans-serif (Google Fonts)
Banner Font: Helvetica, "ヒラギノ角ゴ ProN W3", "Hiragino Kaku Gothic ProN", sans-serif

Body Size: 16px / line-height: 1.4 / letter-spacing: normal
CTA Button: bg #eb5505, color #fff, radius 0px, font-weight 700
Nav Pill: bg #fff, border 1px solid #676767, radius 25px
'''

### プロンプト例

'''
au のデザインに従って、料金プラン比較ページを作成してください。
- フォント: "Noto Sans JP", sans-serif（Adobe Fonts の noto-sans-cjk-jp の代替）
- 見出しテキスト色: #1b1b1b、本文テキスト色: #333333
- 背景: #ffffff、セクション背景: #f7f7f7
- CTAボタン: bg #eb5505, text #fff, border-radius 0px, font-weight 700
- セカンダリボタン: bg #fff, text #333, border 1px solid #333, radius 0px
- リンク色: #0066aa
- letter-spacing: normal（palt なし）
- line-height: 本文は 1.4〜1.7
- カード: bg #fff, radius 5px, shadow 0px 2px 4px #e6e6e6
'''
```

Prompt file from a public GitHub repository, kept with its repository and path. Check the repository's licence before reusing it.
