# DESIGN.md — Goodpatch（グッドパッチ）

By @kzhrknt · design-system
Language: ja · Domains: product, data, math · Source: J01

Source page: https://github.com/kzhrknt/awesome-design-md-jp/blob/HEAD/design-md/goodpatch/DESIGN.md

```
# DESIGN.md — Goodpatch（グッドパッチ）

> Goodpatch（https://goodpatch.com/）のデザイン仕様書。
> デザインの力でビジネス課題を解決するデザインカンパニー。UI/UX デザイン、デザイン戦略、組織デザインを手がける。
> 実サイトの computed style 実測（2026-05-21 取得）に基づく。

---

## 1. Visual Theme & Atmosphere

- **デザイン方針**: ライトグレー `#f6f6f6` のニュートラル背景に、**ブランドブルー `#096fc8` のピル CTA** と **オレンジ〜ゴールドのグラデーションヒーロータイポグラフィ**でデザインカンパニーとしての洗練と躍動感を両立
- **密度**: 本文の line-height は 2.0 と広め。ヒーローは 150px の超大型タイポグラフィで空間を贅沢に使う。情報密度を抑え、余白と書体の美しさで語るスタイル
- **キーワード**: ブランドブルー、Galano Grotesque の幾何学的な字面、游ゴシック体 Pr6N の正統派和文、オレンジグラデーション、デザインカンパニーの信頼感
- **特徴**:
  - 欧文フォントに **My Galano Grotesque**（幾何学的サンセリフ）を採用。ヒーロー・ナビ・セクション見出し・CTA ラベルなど、英語で見せるすべての要素に使用
  - 和文フォントに **A+EqpB-游ゴシック体 Pr6N M / B**（Adobe Fonts 版游ゴシック Pr6N）を採用。本文は Medium (M)、サブヘッドや太字箇所は Bold (B) を使い分ける
  - **欧文と和文で完全にフォントを分離**する設計。`font-family` が要素ごとに切り替わる（nav・header・CTA は Galano Grotesque、body・footer・和文見出しは游ゴシック体 Pr6N）
  - **ブランドカラーは `#096fc8`**（やや深みのあるブルー）。CTA ボタン、セクションラベル（"Services"、"News"）、サブヘッド、フッター CTA テキストすべてに使用
  - ヒーローの "Design to empower" は **1文字ずつ色が変わるオレンジ〜ゴールドグラデーション**（`#f4963d` → `#f49c3d` → `#f3ab3e` → `#f2c63f` → `#f2d040`）で表現。静的なグラデーション CSS ではなく、span 単位の個別色指定
  - フッターは **ダークカラー `#191b1f`** で、テキストは `#6e6e6e`（muted）。フッター直前に白背景の大型 CTA カード（Contact / Careers）が配置される
  - ワークカードのホバー時にタイトルが `#81b0da`（淡いブルー）に変化するインタラクション
  - 実測では `box-shadow: none` が基本。フラットデザイン
  - ダークモード非対応（実測時点）

---

## 2. Color Palette & Roles

> 実サイトの computed style 実測値。すべて hex 表記。

### Brand

- **Brand Blue** (`#096fc8`): メインのブランドカラー。主要 CTA "Why design" "View services" の背景、セクションラベル "Services" "News" "Work" のテキスト色、サブヘッド（和文）の文字色、ヘッダーメニューボタンの背景、フッター CTA カードの文字色
- **Hero Gradient (Orange→Gold)**: ヒーロータイポグラフィの文字色グラデーション
  - `#f4963d` — 先頭文字（濃いオレンジ）
  - `#f49c3d` — 2文字目
  - `#f3ab3e` — 3文字目
  - `#f2c63f` — 中盤（ゴールド寄り）
  - `#f2d040` — 末尾文字（ゴールド）
- **Hover Blue** (`#81b0da`): ワークカードホバー時のタイトル・サブタイトル・タグの色変化

### CTA / Buttons

- **Primary CTA (Blue Pill)**: 背景 `#096fc8` / 文字 `#ffffff` / radius `1584px`（pill）/ padding `16px 24px` / 14.5px / Galano Grotesque / weight 400
- **Secondary CTA (White Pill)**: 背景 `#ffffff` / 文字 `#096fc8` / radius `1584px`（pill）/ padding `16px 24px` / 14.5px / Galano Grotesque / weight 400
- **Footer CTA Card**: 背景 `#ffffff` / 文字 `#096fc8` / radius `8px` / padding `66px 16px` / 見出し Galano 48px weight 600 + 和文サブ 14.5px 游ゴシック Pr6N B
- **Cookie Consent**: 背景 `#096fc8` / 文字 `#ffffff` / radius `1584px`（pill）/ padding `0px 40px` / 14.5px / 游ゴシック Pr6N M

### Badge

- **受付中** (`#ff7669`): イベント受付中バッジの背景（鮮やかなコーラル）
- **ケーススタディ** (`#76b7ed`): ケーススタディバッジの背景（明るいスカイブルー）
- **開催終了** (`#96a0a6`): 終了イベントバッジの背景（ニュートラルグレー）
- **ナレッジ・ノウハウ** (`#0b6fca`): ナレッジバッジの背景（Brand Blue とほぼ同色）

### Neutral

| Token | hex | RGB | 役割 |
|-------|-----|-----|------|
| Text Primary | `#333333` | (51, 51, 51) | 本文テキスト・ヒーロー見出しのデフォルト色 |
| Text Muted | `#6e6e6e` | (110, 110, 110) | フッターテキスト・パンくず |
| Text Subtitle | `#8f95a1` | (143, 149, 161) | ワークカードのタグ（"Organization Design" 等） |
| Skeleton Blue | `#81b0da` | (129, 176, 218) | ワークグリッドのスケルトン／ホバー色 |
| Dark Surface | `#45474a` | (69, 71, 74) | フッター内の装飾背景 |
| Background | `#f6f6f6` | (246, 246, 246) | ページ背景 |
| Footer BG | `#191b1f` | (25, 27, 31) | フッター背景 |
| White | `#ffffff` | (255, 255, 255) | カード面・セカンダリ CTA・フッター CTA カード |

### Semantic（実測未確認・推奨値）

実サイトにはエラー／成功色は表面化していない。補完推奨値:

- **Danger**: `#dc2626` 程度の赤
- **Success**: `#16a34a` 程度の緑
- **Warning**: `#d97706` 程度のオレンジ

---

## 3. Typography Rules

### 3.1 和文フォント

- **ゴシック体**: **A+EqpB-游ゴシック体 Pr6N M**（Medium）を本文に、**A+EqpB-游ゴシック体 Pr6N B**（Bold）をサブヘッド・太字箇所に使用。Adobe Fonts 版の游ゴシック Pr6N
- **フォールバック**: `sans-serif`（実測では最小限のフォールバック）
- **明朝体**: 使用しない（サイト全体ゴシック統一）

> **注意**: Adobe Fonts の "A+EqpB-" 接頭辞は内部的なサブセット識別子。CSS 上の指定は `"A+EqpB-游ゴシック体 Pr6N M"` のままだが、一般的な再現環境では **游ゴシック体 Pr6N**（YuGothic Pr6N）または **Noto Sans JP** で代替する

### 3.2 欧文フォント

- **サンセリフ**: **My Galano Grotesque** — 幾何学的サンセリフ。ヘッダー、ナビゲーション、CTA ボタンラベル、セクション英語見出し、ワークカードタイトルに使用
- フォールバック: `sans-serif`

> **注意**: "My Galano Grotesque" も Adobe Fonts 経由の配信。一般環境での代替として **DM Sans** または **Poppins**（weight 400 / 600 / 700）が字面の幾何学的な印象に近い

### 3.3 font-family 指定

'''css
/* 欧文主体の要素（header, nav, CTA, section heading, work card title） */
font-family: "My Galano Grotesque", sans-serif;

/* 和文本文（body, footer, 和文サブヘッド, 和文段落） */
font-family: "A+EqpB-游ゴシック体 Pr6N M", sans-serif;

/* 和文サブヘッド・太字（section subtitle, teaser title） */
font-family: "A+EqpB-游ゴシック体 Pr6N B", sans-serif;
'''

**フォールバックの考え方**:
- Goodpatch は**要素ごとに font-family を切り替える**設計。単一の font-family チェーンではなく、欧文要素と和文要素で明示的に異なるフォントを指定する
- Galano Grotesque は欧文グリフのみ。和文を入れると sans-serif フォールバックになるため、和文を含む要素には游ゴシック体 Pr6N を指定する
- 游ゴシック体 Pr6N の M（Medium）と B（Bold）は CSS の `font-weight` ではなく **フォントファミリー名で切り替え**ている（両方 computed weight は 400）

**代替フォント指定（preview.html 用）**:

'''css
/* 欧文代替 */
font-family: "DM Sans", "Poppins", sans-serif;

/* 和文代替 */
font-family: "Noto Sans JP", "Yu Gothic", "Hiragino Sans", sans-serif;
'''

### 3.4 文字サイズ・ウェイト階層

> 実測値（トップページ、2026-05-21 取得）

| Role | Font | Size | Weight | Line Height | Letter Spacing | Color | 備考 |
|------|------|------|--------|-------------|----------------|-------|------|
| Hero H1 | Galano Grotesque | 150px | **700** | 127.5px (x0.85) | -5.25px (-0.035em) | `#333333` / gradient | "Design to empower" |
| Section Heading (En) | Galano Grotesque | 60px | 600 | 57px (x0.95) | -1.5px (-0.025em) | `#096fc8` | "Work" 等のセクション単語 |
| Subhead (En Large) | Galano Grotesque | 53px | 600 | 60px (x1.13) | -1.33px (-0.025em) | `#096fc8` | "News" 等のセクション見出し |
| Footer CTA Title | Galano Grotesque | 48px | 600 | 57.6px (x1.2) | -1.2px (-0.025em) | `#096fc8` | "Contact" "Careers" |
| Work Card Title | Galano Grotesque | 40px | 600 | 44px (x1.1) | -1px (-0.025em) | `#333333` | "Habee" 等（palt 有効） |
| Subhead (En Small) | Galano Grotesque | 16px | 400 | 20px (x1.25) | normal | `#096fc8` | "Services" 等のセクションラベル |
| SubheadJp (Medium) | 游ゴシック Pr6N B | 28px | 400 | 32px (x1.14) | -1.12px (-0.04em) | `#333333` | "事例紹介"（halt 有効） |
| SubheadJp (XS) | 游ゴシック Pr6N B | 16px | 400 | 20px (x1.25) | -0.64px (-0.04em) | `#096fc8` | "共創パートナー"（halt 有効） |
| Teaser Title | 游ゴシック Pr6N B | 40px | 400 | 48px (x1.2) | normal / -1.6px | `#333333` | "デザインには、ビジネス課題を解決する力があります。"（halt 有効） |
| News Card Title | 游ゴシック Pr6N B | 17.8px | 400 | 28px (x1.57) | normal | `#333333` | ニュースカードのタイトル |
| Body | 游ゴシック Pr6N M | 16px | 400 | 32px (x**2.0**) | normal | `#333333` | 本文・Vision 文 |
| Work Card Subtitle | 游ゴシック Pr6N M | 14.5px | 400 | 24px (x1.65) | normal | `#333333` | ワークカードの説明文 |
| Nav Link | Galano Grotesque | 16px | 400 | 20px (x1.25) | normal | `#333333` | グローバルナビ |
| CTA Label | Galano Grotesque | 14.5px | 400 | 24px (x1.65) | normal | `#ffffff` | "Why design" 等 |
| Banner Text | Galano Grotesque | 14px | 400 | 19px (x1.36) | normal | `#ffffff` | グローバルガイドバナー |
| Breadcrumb | Galano Grotesque | 13.3px | 400 | 20px (x1.5) | normal | `#6e6e6e` | パンくずリスト |
| Work Card Tag | Galano Grotesque | 14.5px | 400 | 20px (x1.38) | normal | `#8f95a1` | "Organization Design" 等 |
| Copyright | Galano Grotesque | 12.3px | 400 | 20px (x1.63) | normal | `#6e6e6e` | フッターコピーライト |
| Scroll Label | Galano Grotesque | 22.9px | 400 | 28px (x1.22) | normal | `#333333` | "Scroll" ラベル |

### 3.5 行間・字間

**行間 (line-height)** -- 実測:
- **本文 (16px 游ゴシック Pr6N M)**: `2.0`（32px / 16px）-- 記事系サイトと同水準の広い行間
- **ワークカード説明 (14.5px)**: `1.65`（24px / 14.5px）
- **ニュースカードタイトル (17.8px)**: `1.57`（28px / 17.8px）
- **和文サブヘッド (28px)**: `1.14`（32px / 28px）-- 見出しはタイト
- **和文ティーザー (40px)**: `1.2`（48px / 40px）
- **ヒーロー (150px)**: `0.85`（127.5px / 150px）-- 超タイト。文字がオーバーラップ気味
- **欧文セクション見出し (53-60px)**: `0.95-1.13` -- タイト
- **ナビ (16px Galano)**: `1.25`（20px / 16px）

**字間 (letter-spacing)** -- 実測:
- **本文・ワークカード説明・ナビ・CTA**: `normal`（ブラウザデフォルト）
- **ヒーロー (150px)**: `-0.035em`（-5.25px）。タイトに詰めて密度を出す
- **欧文見出し (40-60px)**: `-0.025em`（-1px〜-1.5px）
- **和文サブヘッド SubheadJp**: `-0.04em`（-0.64px @ 16px、-1.12px @ 28px）。halt と組み合わせ
- **和文ティーザー (40px)**: `-0.04em`（-1.6px）の場合あり。要素による

**ガイドライン**:
- 本文は **letter-spacing: normal + line-height 2.0** が Goodpatch の基本リズム。STORES (+0.02em, 1.75) や note (0.04em, 2.0) と比べ、字間はデフォルトに任せ行間で読みやすさを確保するスタイル
- 欧文見出しは **-0.025em〜-0.035em** で強くタイトに詰める。大きいサイズほど詰め幅が大きい
- 和文サブヘッドは **-0.04em + halt** でプロポーショナルに詰める

### 3.6 禁則処理・改行ルール

'''css
/* 推奨設定（実サイト準拠） */
word-break: normal;
overflow-wrap: break-word;
line-break: strict;
'''

- ティーザー見出しは全角スペースで手動改行位置を調整（"ビジネス課題を 解決する力があります。"）
- ナビ・CTA ラベルは英語単体のため改行問題は発生しにくい

### 3.7 OpenType 機能

'''css
/* 和文サブヘッド（SubheadJp） — halt */
font-feature-settings: "halt";
/* 用途: "共創パートナー"、"事例紹介" 等の和文セクションサブタイトル */

/* ワークカードタイトル — palt */
font-feature-settings: "palt";
/* 用途: "エクスラボ＆コンサルティング" 等の和欧混植カードタイトル（Galano Grotesque 指定だが日本語も含む） */
'''

- **halt**: 和文専用のプロポーショナルメトリクス。SubheadJp クラスの要素に適用。letter-spacing -0.04em と組み合わせて和文見出しをタイトに組む
- **palt**: ワークカードタイトル（`.WorkCard-title`）に適用。Galano Grotesque 指定だが日本語テキストも含むため、和文グリフのプロポーショナル字詰めに使用
- **本文には `palt` / `halt` を適用しない**（`font-feature-settings: normal`）

### 3.8 縦書き

- 該当なし。横書きのみ

---

## 4. Component Stylings

### Buttons

**Primary CTA (Blue Pill)** -- "Why design" "View services" "View selected works"
- Background: `#096fc8`
- Text: `#ffffff`
- Padding: `16px 24px`
- Border Radius: `1584px`（完全ピル）
- Font: My Galano Grotesque, 14.5px, weight 400
- Border: none
- Box Shadow: none

**Secondary CTA (White Pill)** -- "View career info"
- Background: `#ffffff`
- Text: `#096fc8`
- Padding: `16px 24px`
- Border Radius: `1584px`（完全ピル）
- Font: My Galano Grotesque, 14.5px, weight 400
- Border: none

**Footer CTA Card** -- "Contact" "Careers"
- Background: `#ffffff`
- Text: `#096fc8`（見出し・説明文ともに）
- Padding: `66px 16px`
- Border Radius: `8px`（角丸、ピルではない）
- Font: 見出し = Galano Grotesque 48px weight 600 / 説明文 = 游ゴシック Pr6N B 14.5px
- Border: none

**Cookie Consent Accept** -- "同意する"
- Background: `#096fc8`
- Text: `#ffffff`
- Padding: `0px 40px`
- Border Radius: `1584px`（完全ピル）
- Font: 游ゴシック Pr6N M, 14.5px, weight 400
- Border: none

**Cookie Consent Decline** -- "Cookieを無効化"
- Background: transparent
- Text: `#096fc8`
- Padding: `0px`
- Border Radius: `0px`
- Font: 游ゴシック Pr6N M, 14.5px, weight 400
- Border: none（テキストリンクスタイル）

**Header Menu Button**（ナビトリガー）
- Background: `#096fc8`
- Text: `#ffffff`
- Padding: `0px`
- Border Radius: `1584px`（完全ピル）
- Border: `1px solid #f6f6f6`
- Font: Galano Grotesque, 16px

### Badges

**受付中** (Event accepting)
- Background: `#ff7669`
- Text: `#ffffff`（推奨）
- Border Radius: 小さい角丸

**ケーススタディ** (Case study)
- Background: `#76b7ed`
- Text: `#ffffff`（推奨）
- Border Radius: 小さい角丸

**開催終了** (Event ended)
- Background: `#96a0a6`
- Text: `#ffffff`（推奨）
- Border Radius: 小さい角丸

### Work Cards

- Background: `rgba(0, 0, 0, 0)`（透明。カード自体に背景なし）
- Title: Galano Grotesque, 40px, weight 600, letter-spacing -1px, `font-feature-settings: "palt"`, color `#333333`
- Title (hover): color `#81b0da`
- Subtitle: 游ゴシック Pr6N M, 14.5px, line-height 24px, color `#333333`
- Subtitle (hover): color `#81b0da`
- Tag: Galano Grotesque, 14.5px, color `#8f95a1`
- Tag (hover): color `#81b0da`
- Border: none
- Shadow: none

### Inputs（推奨実装）

- Background: `#ffffff`
- Border: `1px solid #cccccc`
- Border (focus): `1px solid #096fc8`
- Border Radius: `4px`
- Padding: `12px 16px`
- Font: 游ゴシック Pr6N M, 16px, weight 400
- Height: `44px`

### Header

- Background: `rgba(0, 0, 0, 0)`（透明）
- Position: fixed top
- ナビリンクは Galano Grotesque 16px、色 `#333333`
- メニューボタン（モバイル）: `#096fc8` ピル

### Footer

- Background: `#191b1f`（ダーク）
- Text: `#6e6e6e`（muted）
- Padding: `104px 0px 40px`
- Font: 游ゴシック Pr6N M 16px（和文リンク）/ Galano Grotesque（欧文リンク・コピーライト）
- Copyright: Galano Grotesque 12.3px, `#6e6e6e`

### Footer CTA Section（Footer 直前の誘導エリア）

- Background: `#096fc8`（ブランドブルーの面）
- 2カラム構成: Contact カード + Careers カード（白背景 `#ffffff`、radius `8px`）
- Social セクション: "Stay tuned" Galano 40px weight 600 白文字

---

## 5. Layout Principles

### Spacing Scale（推奨 8px グリッド）

| Token | Value | 用途 |
|-------|-------|------|
| XS | 4px | アイコンと文字の間 |
| S | 8px | バッジ内余白、小間隔 |
| M | 16px | CTA 内の縦余白、カード内段落間 |
| L | 24px | CTA 内の横余白、セクション内の見出しと本文 |
| XL | 48px | セクション間の縦余白 |
| XXL | 104px | フッター上余白 |

### Container

- Max Width: `1200px` 程度（推奨値）
- Padding (horizontal): mobile `16px` / desktop `24〜40px`

### Border Radius Scale

| Token | Value | 用途 |
|-------|-------|------|
| Small | 4px | バッジ、入力欄（推奨） |
| Medium | 8px | フッター CTA カード |
| Pill | 1584px / 9999px | 主要 CTA・セカンダリ CTA・ヘッダーメニューボタン |

### Grid

- フレキシブルグリッド（CSS Grid / Flexbox）
- ワークカードは 2 カラム配置
- フッター CTA は 2 カラム + Social の 3 分割

---

## 6. Depth & Elevation

| Level | Shadow | 用途 |
|-------|--------|------|
| 0 | `none` | カード・ボタン・ヘッダー（基本フラット） |
| 1 | `0 2px 8px rgba(0, 0, 0, 0.06)` | ホバー時の浮き上がり（推奨） |
| 2 | `0 8px 24px rgba(0, 0, 0, 0.08)` | ドロップダウン・モーダル（推奨） |

- 実測では**全要素 `box-shadow: none`**
- 立体感はインタラクション（ホバー色変化 `#81b0da`）と面色（`#096fc8` ブルー面、`#191b1f` ダーク面、`#ffffff` 白面）のコントラストで表現
- フラットデザインを徹底しており、影ではなく**色の切り替え**で階層を作る

---

## 7. Do's and Don'ts

### Do（推奨）

- 欧文要素（ナビ、CTA、セクション見出し）は **Galano Grotesque**（代替: DM Sans / Poppins）、和文要素は **游ゴシック体 Pr6N M / B**（代替: Noto Sans JP）と**明確に使い分ける**
- 主要 CTA は **`#096fc8` のブルーピル**。ラベルは必ず**英語**（"Why design"、"View services" 等）
- セカンダリ CTA は **白ピル + ブルー文字 `#096fc8`**
- 本文の line-height は **2.0** を基本にする
- 欧文見出しの letter-spacing は **負のトラッキング**（-0.025em〜-0.035em）でタイトに詰める
- 和文サブヘッドには **`font-feature-settings: "halt"` + letter-spacing -0.04em** を適用する
- 和欧混植のワークカードタイトルには **`font-feature-settings: "palt"`** を適用する
- ページ背景は **`#f6f6f6`**（ニュートラルなライトグレー）
- フッターは **`#191b1f`** のダーク、テキストは **`#6e6e6e`**
- バッジの色分けを正確に: 受付中 = `#ff7669`、ケーススタディ = `#76b7ed`、開催終了 = `#96a0a6`

### Don't（禁止）

- 和文と欧文を**同じ font-family チェーンに混ぜない**（Goodpatch は要素単位で完全分離する設計）
- 主要 CTA のラベルに**日本語を使わない**（英語ラベルが基本。和文ラベルは Cookie 同意など補助的な場面のみ）
- 主要 CTA に **角丸 8px を使わない**（8px はフッター CTA カード専用。主要 CTA はピル `1584px` / `9999px`）
- 本文に **`line-height: 1.5` 以下**を使わない（Goodpatch の広い行間が崩れる）
- 本文の letter-spacing に **正の値を入れない**（Goodpatch は `normal` がデフォルト。note のように 0.04em は入れない）
- ヒーローのグラデーションを **CSS `linear-gradient` + `-webkit-background-clip: text`** で再現しない（Goodpatch は span 単位の個別色指定）
- バッジ色を **ブランドブルー `#096fc8` に統一しない**（受付中・ケーススタディ・開催終了は明確に色分けされている）
- フッターに **白背景を使わない**（フッターは `#191b1f` のダーク。フッター CTA カードが白なのは CTA セクションであってフッターではない）
- **box-shadow でカードに影をつけない**（Goodpatch はフラット。影なし）

---

## 8. Responsive Behavior

### Breakpoints（推奨値）

| Name | Min Width | 説明 |
|------|-----------|------|
| Mobile | ≤ 767px | モバイルレイアウト |
| Tablet | 768px〜1023px | タブレットレイアウト |
| Desktop | ≥ 1024px | デスクトップレイアウト |

### モバイル時の調整

- ヒーロー H1: 150px → 60〜80px に縮小（推奨）
- セクション見出し: 53〜60px → 32〜40px
- ワークカードタイトル: 40px → 24〜28px
- 本文サイズは 16px を維持（line-height も 2.0 維持）
- ヘッダーメニューボタン（`#096fc8` ピル）が表示される

### タッチターゲット

- 主要 CTA: 高さ 56px 程度（padding 16px + 24px line-height = 56px）
- フッター CTA カード: 大型タッチエリア（padding 66px）

### ダークモード

- 該当なし（実測時点で未対応）

---

## 9. Agent Prompt Guide

### クイックリファレンス

'''
Brand Blue (CTA / Section Label): #096fc8
Hero Gradient: #f4963d → #f49c3d → #f3ab3e → #f2c63f → #f2d040
Hover Blue: #81b0da
Text Primary: #333333
Text Muted: #6e6e6e
Text Subtitle: #8f95a1
Badge 受付中: #ff7669
Badge ケーススタディ: #76b7ed
Badge 開催終了: #96a0a6
Background: #f6f6f6
Footer BG: #191b1f
White: #ffffff

欧文 Font: "My Galano Grotesque", sans-serif
（代替: "DM Sans", "Poppins", sans-serif）

和文 Font (本文): "A+EqpB-游ゴシック体 Pr6N M", sans-serif
和文 Font (太字): "A+EqpB-游ゴシック体 Pr6N B", sans-serif
（代替: "Noto Sans JP", "Yu Gothic", "Hiragino Sans", sans-serif）

Body: 16px / line-height 2.0 / weight 400 / letter-spacing normal / 游ゴシック Pr6N M
Hero H1: 150px / line-height 0.85 / weight 700 / letter-spacing -0.035em / Galano Grotesque
Section Heading (En): 53-60px / weight 600 / letter-spacing -0.025em / color #096fc8
SubheadJp: 16-28px / 游ゴシック Pr6N B / halt / letter-spacing -0.04em / color #096fc8
Work Card Title: 40px / weight 600 / palt / letter-spacing -0.025em

Primary CTA: bg #096fc8 / text #fff / radius pill / padding 16px 24px / Galano 14.5px
Secondary CTA: bg #fff / text #096fc8 / radius pill / padding 16px 24px
Footer CTA Card: bg #fff / text #096fc8 / radius 8px / padding 66px 16px
Shadow: 基本 none（フラットデザイン）
'''

### プロンプト例

'''
Goodpatch のデザインに従って、デザインカンパニーのサービス紹介セクションを作成してください。
- 欧文フォント: "My Galano Grotesque", sans-serif（代替: "DM Sans", sans-serif）
- 和文フォント: "Noto Sans JP", "Yu Gothic", "Hiragino Sans", sans-serif
- ページ背景: #f6f6f6
- セクションラベル（英語）: Galano Grotesque 16px / weight 400 / color #096fc8 / text-transform none
- セクション見出し（英語）: Galano Grotesque 53px / weight 600 / letter-spacing -0.025em / color #096fc8
- 和文サブヘッド: 游ゴシック Pr6N B 16px / letter-spacing -0.04em / font-feature-settings "halt" / color #096fc8
- 本文: 游ゴシック Pr6N M 16px / weight 400 / line-height 2.0 / letter-spacing normal / color #333333
- ワークカードタイトル: Galano Grotesque 40px / weight 600 / letter-spacing -0.025em / font-feature-settings "palt" / color #333333
- ワークカード説明: 游ゴシック Pr6N M 14.5px / line-height 1.65 / color #333333
- ワークカードタグ: Galano Grotesque 14.5px / color #8f95a1
- 主要 CTA: 背景 #096fc8 / 白文字 / border-radius 9999px / padding 16px 24px / Galano 14.5px / 英語ラベル
- セカンダリ CTA: 背景 白 / 文字 #096fc8 / border-radius 9999px / padding 16px 24px
- フッター: 背景 #191b1f / テキスト #6e6e6e
- フッター CTA カード: 背景 白 / 文字 #096fc8 / radius 8px
- バッジ: 受付中 #ff7669 / ケーススタディ #76b7ed / 開催終了 #96a0a6
- box-shadow は基本 none。立体感は色面のコントラストで表現
- 欧文見出しは必ず負の letter-spacing で詰める
- 和文サブヘッドには halt、和欧混植には palt を適用
'''
```

Prompt file from a public GitHub repository, kept with its repository and path. Check the repository's licence before reusing it.
