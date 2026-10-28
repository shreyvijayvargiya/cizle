# DESIGN.md — STORES（ストアーズ）

By @kzhrknt · design-system
Language: ja · Domains: product, scifi · Source: J01

Source page: https://github.com/kzhrknt/awesome-design-md-jp/blob/HEAD/design-md/stores/DESIGN.md

```
# DESIGN.md — STORES（ストアーズ）

> STORES（https://stores.fun/、旧 https://stores.jp/）のデザイン仕様書。
> 店舗の売上をあげる総合プラットフォーム（ネットショップ・予約・キャッシュレス決済・POSレジ）。
> 実サイトの computed style 実測（2026-05-05 取得）に基づく。

---

## 1. Visual Theme & Atmosphere

- **デザイン方針**: ベージュ寄りのウォームニュートラルを基調に、**ビビッドブルー `#0066ff` のピル CTA** と **ミントグリーン `#40f2b4` のプロモバッジ**で店舗向け SaaS の前向きさ・即時性を表現
- **密度**: 本文の line-height は 1.75 と広め。見出しはタイトに `-0.03em〜-0.02em` のトラッキングで詰める。情報密度より読みやすさ優先
- **キーワード**: ウォームニュートラル、ビビッドブルー、ミントアクセント、ShoraiSansStdN の整った字面、店舗向け SaaS の信頼感
- **特徴**:
  - 和文フォントに **ShoraiSansStdN（将来サンスタンダード N、Morisawa Adobe Fonts）** を採用。日本語を主体に組まれた現代的なゴシック体で、競合の Noto Sans JP / Hiragino とは違うブランド資産
  - **ブランドカラーは `#0066ff`（純度の高いブルー）**。Tailwind カスタムトークン `bg-brand` / `border-brand` / `text-brand` がこれに該当
  - **アクセントは `#40f2b4`（ミントグリーン）**。"導入するなら今！" のような期間限定プロモバッジで使用（`bg-bg-emphasis-green`）
  - サーフェスに `#f2f2f0`（緑寄りのウォームグレー）を使い、純白とのコントラストで階層を作る
  - 色温度の異なる**ウォームグレー文字** `#737368`（R=G>B）を補助テキストに採用。冷たい灰色ではなく落ち着いた印象
  - "詳細" のような小ピルバッジは `#0a0a0a`（near-black）を使うが、**主要 CTA はブルー `#0066ff`**
  - 本文の文字色は `#000000`（純黒）も使用される（mosh が避ける純黒との対照）
  - ダークモード非対応（実測時点）

---

## 2. Color Palette & Roles

> 実サイトの computed style 実測値。すべて hex 表記。

### Brand

- **Brand Blue** (`#0066ff`): メインのブランドカラー。主要 CTA "無料でアカウント作成" の背景、テキストリンク、セカンダリ CTA の文字色（Tailwind トークン `bg-brand` / `border-brand` / `text-brand`）
- **Brand Mint Accent** (`#40f2b4`): プロモ・期間限定バッジの背景（`bg-bg-emphasis-green`）。"導入するなら今！" 等で使用
- **Recommended Plan Surface** (`#e5fbff`): "おすすめプラン" バッジ／推奨プランカードの薄いシアン面。Brand Blue の派生

### CTA / Buttons

- **Primary CTA**: 背景 `#0066ff` / 文字 `#ffffff` / radius `9999px`（pill）/ padding `0px 24px` / 16px / weight 600
- **Secondary CTA**: 背景 `#ffffff` / 文字 `#0066ff` / border `1px solid #ebebe9` / radius `9999px`（pill）/ padding `8px 16px` / 14px / weight 600
- **Tertiary（テキスト）**: 文字 `#0066ff` / underline / 16px / weight 600
- **Pill Badge (Dark)** (`#0a0a0a`): "詳細" 等の小ピル背景（主要 CTA ではない）

### Neutral — Warm Gray Scale

| Token | hex | RGB | 役割 |
|-------|-----|-----|------|
| Black | `#000000` | (0, 0, 0) | 見出し・主要テキスト |
| Near Black | `#0a0a0a` | (10, 10, 10) | ナビ・補助テキスト・小ピルバッジ背景 |
| Warm Gray | `#737368` | (115, 115, 104) | 補助テキスト（**ウォーム傾向**: R=G>B） |
| Surface | `#f2f2f0` | (242, 242, 240) | カード／アラート面背景（**ウォーム傾向**） |
| Border Secondary | `#ebebe9` | (235, 235, 233) | セカンダリボタンの細ボーダー |
| White | `#ffffff` | (255, 255, 255) | ページ背景・ナビポップオーバー |

### Semantic（実測未確認・推奨値）

実サイトには明確なエラー／成功色は表面化していない。SaaS 向けに推奨する補完値:

- **Danger**: `#dc2626` 程度の彩度を抑えたレッド
- **Success**: `#16a34a` 程度のグリーン
- **Warning**: `#d97706` 程度のオレンジ

### Header / Overlay

- **Header BG**: `rgba(255, 255, 255, 0.3)`（半透明白＋`backdrop-blur`）
- **Nav Popover BG**: `#ffffff`（白）
- **Nav Popover Radius**: `16px`

---

## 3. Typography Rules

### 3.1 和文フォント

- **ゴシック体**: **ShoraiSansStdN（将来サンスタンダードN）** を最優先。Morisawa Adobe Fonts のフォント
- **フォールバック**: `Hiragino Sans`（Apple OS）→ `Noto Sans CJK JP`（Linux／Android）→ `Yu Gothic`（Windows）→ `Meiryo`（古い Windows）→ `sans-serif`
- **明朝体**: 使用しない（サイト全体ゴシック統一）

### 3.2 欧文フォント

- 専用の欧文書体は持たず、**ShoraiSansStdN の欧文グリフ**を優先
- フォールバックに各 OS のシステム和文フォントの欧文グリフ
- 純粋な欧文サンセリフ（Helvetica Neue / Inter 等）は font-family に含まれない

### 3.3 font-family 指定

'''css
/* 全要素共通（body, h1〜h4, p, a, span, button, nav, header, footer） */
font-family: ShoraiSansStdN, "Hiragino Sans", "Noto Sans CJK JP",
  "Yu Gothic", Meiryo, sans-serif;
'''

**フォールバックの考え方**:
- ShoraiSansStdN（Adobe Fonts）を最優先し、和文・欧文ともにブランド書体で統一する
- Adobe Fonts ライセンス上 Web では `use.typekit.net` 経由でしか配信されないため、未契約環境では即座に Hiragino Sans へフォールバック
- フォールバックは **和文を持つフォント**だけで構成。Helvetica Neue 等の欧文専用書体は挟まない（ShoraiSansStdN 不在時に欧文部分だけ別書体になる事故を避ける）

> **代替フォント注記**: ShoraiSansStdN は Adobe Fonts のドメインライセンスのため、デザインのプレビューや社外資料で再現できない場合がある。代替として **Noto Sans JP**（weight 400 / 600）を使用すると、字面の整い方とウォームトーンの面で近い印象が出る（preview.html はこの代替を使用）。

### 3.4 文字サイズ・ウェイト階層

> 実測値（トップ／料金ページ、2026-05-05 取得）

| Role | Font | Size | Weight | Line Height | Letter Spacing | Color | 備考 |
|------|------|------|--------|-------------|----------------|-------|------|
| Hero H1 | ShoraiSansStdN | 48px | **600** | 55.2px (×1.15) | -1.44px (-0.03em) | `#000000` | "レジ・決済・予約・ECをひとつで管理できる店舗システム" |
| Section H2 (Bold) | ShoraiSansStdN | 48px | 600 | 55.2px (×1.15) | -1.44px (-0.03em) | `#000000` | "店舗運営を、ワンストップで。" |
| Section H2 (Light) | ShoraiSansStdN | 48px | **400** | 55.2px (×1.15) | -1.44px (-0.03em) | `#000000` / `#0a0a0a` | "資料ダウンロード"・"よくある質問"（軽い見出し） |
| Pricing H2 | ShoraiSansStdN | 40px | 600 | 48px (×1.2) | -0.8px (-0.02em) | `#000000` | "単品プランがあるサービス" |
| H3 Card Title | ShoraiSansStdN | 24px | 600 | 33.6px (×1.4) | -0.48px (-0.02em) | `#000000` | "スタンダード"・"予約システム" |
| H3 Sub | ShoraiSansStdN | 20px | 600 | 28px (×1.4) | -0.4px (-0.02em) | `#000000` / `#0a0a0a` | "キャッシュレス決済" |
| H4 / Lead | ShoraiSansStdN | 20px | 600 | 35px (×1.75) | 0.4px (0.02em) | `#000000` | "【小売店向け】..." の段落リード |
| H3 Inline | ShoraiSansStdN | 16px | 600 | 28px (×1.75) | 0.32px (0.02em) | `#000000` | "決済端末"（リスト中見出し） |
| Body | ShoraiSansStdN | 16px | 400 | 28px (×**1.75**) | 0.32px (0.02em) | `#000000` / `#737368` | 本文 |
| Caption | ShoraiSansStdN | 14px | 400 | 24.5px (×1.75) | 0.28px (0.02em) | `#0a0a0a` / `#737368` | 補足・サブテキスト |
| Caption Bold | ShoraiSansStdN | 14px | 600 | 19.6px (×1.4) | 0.28px (0.02em) | `#0a0a0a` | リンク強調・タグ |
| Small | ShoraiSansStdN | 12px | 400 | 18px (×1.5) | 0.36px (0.03em) | `#737368` | 注釈 |
| Pill Label | ShoraiSansStdN | 12px | 600 | 18px (×1.5) | 0.36px (0.03em) | `#ffffff` | "詳細" 等のピルバッジ |
| Nav Link | ShoraiSansStdN | 14px | 400 / 600 | 14px (×1.0) | 0.28px (0.02em) | `#0a0a0a` | グローバルナビ |
| Mobile Nav Title | ShoraiSansStdN | 20px | 600 | 20px (×1.0) | 0.4px (0.02em) | `#0a0a0a` | モバイル展開ナビ |

### 3.5 行間・字間

**行間 (line-height)** — 実測:
- **本文 (16px)**: `1.75`（28px / 16px）— note ほどではないが、SaaS としては広め
- **補助テキスト (14px)**: `1.75`（24.5px / 14px）
- **小注釈 (12px)**: `1.5`（18px / 12px）
- **見出し (24〜48px)**: `1.15〜1.4`（タイト）
- **ナビ／ピル**: `1.0`（一行高さ）

**字間 (letter-spacing)** — 実測:
- **本文・補助・小注釈**: **正のトラッキング**（+0.02em〜+0.03em）。日本語の可読性を上げる定石
- **見出し (40〜48px)**: **負のトラッキング**（-0.02em〜-0.03em）。タイトに詰めて見出しの密度を作る
- **見出し (20〜24px)**: -0.02em
- **ナビ・ボタン・タグ**: +0.02em〜+0.03em

**ガイドライン**:
- 日本語本文は **line-height 1.75 + letter-spacing 0.02em** が STORES の基本リズム
- 見出しは **重ね詰め**（負のトラッキング）でモダンに、本文は **広め**（正のトラッキング）で生活感を出す
- 軽い見出し（"資料ダウンロード"・"よくある質問"）は weight 400 で立てすぎない。重い見出しは weight 600

### 3.6 禁則処理・改行ルール

'''css
/* 推奨設定（実サイト準拠） */
word-break: normal;            /* 既定の日本語禁則 */
overflow-wrap: anywhere;       /* 長い英単語の折り返し */
line-break: strict;            /* 厳格な禁則処理 */
'''

- ヒーロー見出しは `<br>` で改行位置を手動指定（"レジ・決済・予約・ECを<br>ひとつで管理できる店舗システム"）
- ピル系（"詳細"）は `white-space: nowrap`

### 3.7 OpenType 機能

'''css
font-feature-settings: normal;
'''

- 実測上、`palt` / `kern` の明示的有効化は確認されなかった
- ShoraiSansStdN のメトリクスに任せ、letter-spacing で見た目を調整する方針

### 3.8 縦書き

- 該当なし。横書きのみ

---

## 4. Component Stylings

### Buttons

**Primary CTA（ブルーピル）** — "無料でアカウント作成"
- Background: `#0066ff`
- Text: `#ffffff`
- Padding: `0px 24px`（高さは line-height で確保、44〜48px 程度）
- Border Radius: `9999px`（完全ピル）
- Font: ShoraiSansStdN, 16px, weight 600
- Border: none

**Secondary CTA（白ピル＋ブルー文字）** — "資料ダウンロード（無料）"
- Background: `#ffffff`
- Text: `#0066ff`
- Border: `1px solid #ebebe9`
- Padding: `8px 16px`
- Border Radius: `9999px`（完全ピル）
- Font: ShoraiSansStdN, 14px, weight 600
- 注: ヒーロー直下では2行構成（上段に小コピー、下段に "資料ダウンロード（無料）"）の特殊レイアウトもある

**Text Link** — "すべて表示する"・本文中のリンク
- Background: transparent
- Text: `#0066ff`
- Padding: `0`
- Font: ShoraiSansStdN, 14〜16px, weight 400〜600
- Border: none（必要に応じて underline）

**Pill Badge (Dark)** — "詳細"
- Background: `#0a0a0a`
- Text: `#ffffff`
- Padding: `4px 10px`
- Border Radius: `9999px`
- Font: ShoraiSansStdN, 12px, weight 600

**Promo Badge (Mint)** — "導入するなら今！"
- Background: `#40f2b4`
- Text: `#000000`
- Padding: `4px 8px 4px 12px`
- Border Radius: `24px`（左大きく、右小さく見える非対称演出）
- Font: ShoraiSansStdN, 14px, weight 600

**Mobile Menu Button**（ナビトリガー）
- Background: transparent
- Text: `#0a0a0a`
- Padding: `8px 12px`
- Font: ShoraiSansStdN, 14px, weight 600

**Plan Card CTA**（推奨実装）
- Background: `#0066ff`（ブランド色を踏襲）
- Text: `#ffffff`
- Padding: `12px 24px`
- Border Radius: `9999px`（料金カード CTA もピルが基本）
- Font: ShoraiSansStdN, 14〜16px, weight 600

### Inputs（推奨実装）

- Background: `#ffffff`
- Border: `1px solid #e5e5e0`（surface 系のウォームボーダー）
- Border (focus): `1px solid #0a0a0a`
- Border Radius: `8px`
- Padding: `12px 16px`
- Font: ShoraiSansStdN, 16px, weight 400
- Height: `44px`

### Cards / Surfaces

- Background: `#ffffff`（メイン）／ `#f2f2f0`（注釈・アラート系の面）
- Border: `1px solid #f2f2f0` または border なし
- Border Radius: `8px`（注釈ボックス）／ `16px`（ナビポップオーバー、大カード）
- Shadow: 基本フラット（`box-shadow: none`）

### Header

- Background: `rgba(255, 255, 255, 0.3)`（半透明白）+ `backdrop-filter: blur(...)`
- Border Bottom: なし
- Position: `fixed top: 0`
- z-index: 50 程度

### Nav Popover（hover/click で展開する大ナビ）

- Background: `#ffffff`
- Border Radius: `16px`
- Shadow: `0 8px 24px rgba(0, 0, 0, 0.08)` 程度（推奨）
- Padding: `24px 32px`

### Footer

- Background: `#ffffff`
- Border Top: `1px solid #f2f2f0`
- Padding: `48px 24px`

### Pill Badge（"詳細" など）

- Background: `#0a0a0a`
- Text: `#ffffff`
- Padding: `4px 10px`
- Border Radius: `9999px`
- Font: ShoraiSansStdN, 12px, weight 600, letter-spacing 0.36px

---

## 5. Layout Principles

### Spacing Scale（推奨 8px グリッド）

| Token | Value | 用途 |
|-------|-------|------|
| XS | 4px | アイコンと文字の間 |
| S | 8px | ボタン内の縦余白 |
| M | 16px | カード内の段落間／ボタンの横余白 |
| L | 24px | カードの内側余白／セクション内の見出しと本文 |
| XL | 48px | セクション間の縦余白 |
| XXL | 80px | ヒーロー上下のゆとり |

### Container

- Max Width: `1200px` 程度（実測時に固定中央寄せのコンテナ幅は確定できなかったため、推奨値）
- Padding (horizontal): mobile `16px` / desktop `24〜32px`

### Border Radius Scale

| Token | Value | 用途 |
|-------|-------|------|
| Small | 4px | 入力欄エラーリング・テーブル罫 |
| Medium | 8px | カード・注釈ボックス・通常ボタン |
| Large | 16px | ナビポップオーバー・大カード |
| Pill | 9999px | バッジ・タグ・主要 CTA |

### Grid

- 12 カラムグリッドが実装上自然（CSS Grid または Flexbox）
- Gutter: 24px

---

## 6. Depth & Elevation

| Level | Shadow | 用途 |
|-------|--------|------|
| 0 | `none` | カード・ボタン・ヘッダ（基本フラット） |
| 1 | `0 2px 8px rgba(0, 0, 0, 0.06)` | ホバー時の浮き上がり（推奨） |
| 2 | `0 8px 24px rgba(0, 0, 0, 0.08)` | ナビポップオーバー・ドロップダウン |
| 3 | `0 16px 40px rgba(0, 0, 0, 0.10)` | モーダル・ダイアログ（推奨） |

- 実測ではほぼ全要素 `box-shadow: none`
- 立体感は **半透明オーバーレイ**（header の `rgba(255, 255, 255, 0.3)` + backdrop-blur）と **ウォームサーフェス** `#f2f2f0` で表現
- 影を使う場合も **彩度の低い黒**（`rgba(0, 0, 0, 0.06〜0.10)`）で控えめに

---

## 7. Do's and Don'ts

### Do（推奨）

- 和文フォントは **ShoraiSansStdN を最優先**、フォールバックは Hiragino Sans → Noto Sans CJK JP → Yu Gothic → Meiryo
- 本文の line-height は **1.75** を基本にする（24px / 14px、28px / 16px）
- 本文の letter-spacing は **+0.02em**、見出しは **-0.02em〜-0.03em** で対比を作る
- 主要 CTA は **`#0066ff` のブルーピル**、セカンダリは **白＋ブルー文字＋ウォームボーダー** のピル
- 期間限定プロモは **`#40f2b4` のミントバッジ** で目立たせる
- サーフェスは **ウォームグレー `#f2f2f0`** を使い、冷たい灰色（`#f3f4f6` 等）は避ける
- 補助テキストは **`#737368`**（ウォームグレー）で、青みのある `#6b7280` は使わない
- 軽い見出し（誘導見出し）は weight 400、強い見出しは weight 600 と使い分ける

### Don't（禁止）

- ShoraiSansStdN のフォールバックチェーンに **欧文専用書体を挟まない**（`Helvetica Neue` 等）
- 主要 CTA に **黒（`#0a0a0a` / `#000000`）を使わない** — STORES の押しはあくまで `#0066ff` のブルー（黒ピルは "詳細" のような小バッジ用）
- 本文に **`line-height: 1.5` 以下**を使わない（STORES の余白感が崩れる）
- **冷たいグレー**（`#9ca3af`、`#6b7280`、`#f3f4f6`）を使わない（ウォームトーンを壊す）
- 見出しに **正の letter-spacing** を使わない（タイトに詰めるのが基本）
- **角張った直角ボタン**（border-radius 0）や **小角丸（4〜8px）の CTA** を使わない — 主要・セカンダリともピル `9999px` が基本
- ミントグリーン `#40f2b4` を **常時表示の要素**に使わない（プロモ・期間限定の合図色）

---

## 8. Responsive Behavior

### Breakpoints（Tailwind 互換の推奨値）

| Name | Min Width | 説明 |
|------|-----------|------|
| `sm` | 640px | 大きめモバイル |
| `md` | 768px | タブレット |
| `lg` | 1024px | デスクトップ（モバイルナビとデスクトップナビの分岐点） |
| `xl` | 1280px | 広いデスクトップ |

実装上、`nav.lg:hidden` と `nav.hidden` の対比から **lg=1024px** がモバイル／デスクトップの主な閾値。

### モバイル時の調整

- ヒーロー H1: 48px → 32〜36px
- セクション H2: 48px → 28〜32px
- 本文サイズは 16px を維持（line-height も 1.75 維持）
- ナビは漢字ハンバーガー化、展開時にフルスクリーンメニュー

### タッチターゲット

- 主要 CTA: 高さ 44px 以上（padding `12px 24px` + 16px font + 1.4 line-height ≒ 44px）
- ピルバッジ: 26px 程度（タップ用というより装飾）

### ダークモード

- 該当なし（実測時点で未対応）

---

## 9. Agent Prompt Guide

### クイックリファレンス

'''
Brand Blue (CTA): #0066ff
Mint Accent (Promo Badge): #40f2b4
Pill Dark (詳細 等): #0a0a0a
Pure Black (見出し): #000000
Warm Gray Text: #737368
Warm Surface: #f2f2f0
Border Secondary: #ebebe9
White: #ffffff
Header BG: rgba(255, 255, 255, 0.3) + backdrop-blur

Font: ShoraiSansStdN, "Hiragino Sans", "Noto Sans CJK JP", "Yu Gothic", Meiryo, sans-serif
（ShoraiSansStdN 不在時の代替提案: Zen Kaku Gothic New または Noto Sans JP）

Body Size: 16px / line-height 1.75 / weight 400 / letter-spacing 0.02em
Heading Size: 48px / line-height 1.15 / weight 600 / letter-spacing -0.03em
Caption: 14px / line-height 1.75 / letter-spacing 0.02em
Small: 12px / line-height 1.5 / letter-spacing 0.03em

Border Radius: 8px（カード）／16px（ポップオーバー）／9999px（CTA・ピル）
Shadow: 基本 none。階層は #f2f2f0 サーフェスと半透明白で表現
'''

### プロンプト例

'''
STORES のデザインに従って、店舗運営 SaaS の料金プランセクションを作成してください。
- フォント: ShoraiSansStdN, "Hiragino Sans", "Noto Sans CJK JP", "Yu Gothic", Meiryo, sans-serif
- セクション見出し: 40〜48px / weight 600 / letter-spacing -0.02em / color #000000
- カードタイトル: 24px / weight 600 / line-height 1.4 / letter-spacing -0.02em
- 本文: 16px / weight 400 / line-height 1.75 / letter-spacing 0.02em / color #000000
- 補助テキスト: 14px / weight 400 / line-height 1.75 / color #737368
- 主要 CTA: 背景 #0066ff（ブランドブルー）/ 白文字 / border-radius 9999px / padding 0 24px / 16px / weight 600
- セカンダリ CTA: 背景 白 / 文字 #0066ff / border 1px solid #ebebe9 / radius 9999px / padding 8px 16px / 14px / weight 600
- プロモバッジ（期間限定）: 背景 #40f2b4 / 文字 #000 / radius 24px / padding 4px 8px 4px 12px
- カード背景: 白 #ffffff、強調パネルは #f2f2f0（ウォームサーフェス）
- ボーダー: なしか、#ebebe9 / #f2f2f0 の薄いライン
- box-shadow は基本 none。立体感はサーフェスとピル形状で表現
- 純黒 #000000 は見出しに、本文は #000000 / #0a0a0a、補助は #737368
- 主要 CTA を黒にしない（黒は "詳細" 等の小ピル用）
- 冷たいグレー（#9ca3af、#f3f4f6）は使わない
'''
```

Prompt file from a public GitHub repository, kept with its repository and path. Check the repository's licence before reusing it.
