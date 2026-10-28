# DESIGN.md — Chatwork（チャットワーク）

By @kzhrknt · design-system
Language: ja · Domains: product, nature · Source: J01

Source page: https://github.com/kzhrknt/awesome-design-md-jp/blob/HEAD/design-md/chatwork/DESIGN.md

```
# DESIGN.md — Chatwork（チャットワーク）

> Chatwork（https://go.chatwork.com/ja/）のデザイン仕様書。
> 国内利用者数 No.1 の中小企業向けビジネスチャットツール。
> 実サイトの computed style 実測（2026-06-12 取得）に基づく。

---

## 1. Visual Theme & Atmosphere

- **デザイン方針**: 清潔感のあるプロフェッショナルな SaaS デザイン。温かみのあるウォームストーングレー `#f5f5f4` を背景にし、**ブランドレッド `#f03748` の CTA** と **ダークネイビー `#13202f` の見出し・フッター**で信頼感と行動喚起を両立
- **密度**: 本文の line-height は 1.6 を基本とし、機能説明では 1.85 まで広げる。コーポレートサイトとしてゆったりした余白設計
- **キーワード**: ウォームニュートラル、ブランドレッド、信頼性、中小企業向け、ダークネイビーフッター
- **特徴**:
  - 和文フォントに **Chatwork Sans（独自ブランドフォント、4ウェイト構成）** を採用。L / R / B / EB の4ファミリーに分かれ、CSS 変数 `--rise--fontFamily-chatworkSans*` で管理
  - **ブランドカラーは `#f03748`（鮮やかなレッド）**。「無料ダウンロード」「無料ではじめる」等の主要 CTA に使用
  - **テキストリンクは `#df1c13`（やや暗いレッド）** で、CTA のレッドとは別色
  - **ダークネイビー `#13202f`** がフッター背景・見出し・ヘッダーログインリンクに使われ、信頼感の軸
  - **イエローアクセント `#ffbe2e`** をハイライトバッジやアクセント演出に使用
  - ページ背景に `#f5f5f4`（ウォームストーングレー）を敷き、白 `#ffffff` のコンテンツ面との二層構造
  - 導入社数・利用者数等の大きな数字と顧客ロゴバーで社会的証明を強調するデザイン
  - ダークモード非対応（実測時点）

---

## 2. Color Palette & Roles

> 実サイトの computed style 実測値。すべて hex 表記。CSS 変数は `--rise--` プレフィクス。

### Brand

- **Brand Red** (`#f03748`): メインのブランドカラー。主要 CTA「無料ダウンロード」「無料ではじめる」の背景。バッジ・アクセント要素にも使用（uniqueBackgrounds count: 18）
- **Link Red** (`#df1c13`): テキストリンク色。Brand Red よりやや暗い深みのある赤
- **Yellow Accent** (`#ffbe2e`): ハイライトバッジ、装飾アクセント（count: 3）

### CTA / Buttons

- **Primary CTA**: 背景 `#f03748` / 文字 `#ffffff` / radius `26px`（ピル）/ font Helvetica/Arial 16px / weight 800
- **Header CTA**: 背景 `#f03748` / 文字 `#ffffff` / Chatwork Sans B 21px / weight 700 / 「無料ではじめる」
- **Login Link**: 文字 `#13202f` / 背景なし / テキストリンク

### Neutral — Dark Navy Scale

| Token | hex | RGB | 役割 |
|-------|-----|-----|------|
| Dark Navy | `#13202f` | (19, 32, 47) | 見出し、フッター背景、ヘッダーリンク（`--rise--color-cw-black`） |
| Body Text | `#191919` | (25, 25, 25) | 本文テキスト、カード内テキスト |
| White | `#ffffff` | (255, 255, 255) | カード面、コンテンツ背景（`--rise--color-cw-white`） |

### Surface & Background

| Token | hex | RGB | 役割 |
|-------|-----|-----|------|
| Background | `#f5f5f4` | (245, 245, 244) | ページ背景（body）。ウォームストーングレー |
| Surface | `#ffffff` | (255, 255, 255) | カード、メインコンテンツ領域 |
| Surface Gray | `#f6f6f6` | (246, 246, 246) | セカンダリサーフェス（count: 6） |
| Surface Alt | `#f8f8f8` | (248, 248, 248) | まとめセクション |
| Surface Warm | `#f7f1e7` | (247, 241, 231) | ウォームアクセント面（温かみのある強調） |
| Border | `#ebebeb` | (235, 235, 235) | 区切り線、ディバイダー |

### Semantic（推奨補完値）

実サイトの主要な意味的色としてブランドレッドが使われている。SaaS プロダクト向けの補完:

- **Danger**: `#f03748`（Brand Red をそのまま使用するのが自然）
- **Success**: `#22c55e` 程度のグリーン
- **Warning**: `#ffbe2e`（Yellow Accent と共用可）

---

## 3. Typography Rules

### 3.1 和文フォント

- **ゴシック体**: **Chatwork Sans** を最優先。独自ブランドフォントで、4ウェイト構成:
  - **Chatwork Sans L** — Light
  - **Chatwork Sans R** — Regular（本文）
  - **Chatwork Sans B** — Bold（見出し・CTA）
  - **Chatwork Sans EB** — Extra Bold（最強調）
- **フォールバック**: `"Hiragino Sans"` → `"ヒラギノ角ゴシック"` → `"ヒラギノ角ゴ Pro"` → `"Hiragino Kaku Gothic Pro"` → `"Hiragino Kaku Gothic ProN"` → `"ヒラギノ角ゴ ProN W3"` → `Meiryo` → `Helvetica` → `Arial` → `system-ui` → `sans-serif`
- **明朝体**: 使用しない（サイト全体ゴシック統一）

### 3.2 欧文フォント

- 独立した欧文書体の指定はなく、**Chatwork Sans の欧文グリフ**を優先
- フォールバックチェーン末尾の `Helvetica` → `Arial` が欧文フォールバックを兼ねる
- CTA ボタンの一部で `Helvetica, Arial` が直接指定されるケースがある（「無料ダウンロード」ボタン）

### 3.3 font-family 指定

'''css
/* 本文（Chatwork Sans R = Regular） */
font-family: "Chatwork Sans R", "Hiragino Sans", "ヒラギノ角ゴシック",
  "ヒラギノ角ゴ Pro", "Hiragino Kaku Gothic Pro",
  "Hiragino Kaku Gothic ProN", "ヒラギノ角ゴ ProN W3",
  Meiryo, Helvetica, Arial, system-ui, sans-serif;

/* 見出し・CTA（Chatwork Sans B = Bold） */
font-family: "Chatwork Sans B", "Hiragino Sans", "ヒラギノ角ゴシック",
  "ヒラギノ角ゴ Pro", "Hiragino Kaku Gothic Pro",
  "Hiragino Kaku Gothic ProN", "ヒラギノ角ゴ ProN W3",
  Meiryo, Helvetica, Arial, system-ui, sans-serif;
'''

**CSS Custom Properties**:
'''css
--rise--fontFamily-chatworkSansL: "Chatwork Sans L", /* ...fallback chain */;
--rise--fontFamily-chatworkSansR: "Chatwork Sans R", /* ...fallback chain */;
--rise--fontFamily-chatworkSansB: "Chatwork Sans B", /* ...fallback chain */;
--rise--fontFamily-chatworkSansEB: "Chatwork Sans EB", /* ...fallback chain */;
'''

**フォールバックの考え方**:
- Chatwork Sans（独自フォント）を最優先し、和文・欧文ともにブランド書体で統一する
- Chatwork Sans が利用できない環境では Hiragino Sans へフォールバック
- ヒラギノは **Pro と ProN の両方**をフォールバックに含む手堅い指定
- フォールバックチェーンに Helvetica / Arial が入っているが、和文フォントより後なので、日本語表示への影響はない

> **代替フォント注記**: Chatwork Sans は独自ブランドフォントのため、外部では利用できない。デザインのプレビューや資料での代替として **Noto Sans JP**（weight 400 / 700）を使用すると、ニュートラルなゴシック体として近い印象が出る。欧文部分の代替には **Inter** が適している（preview.html はこの代替を使用）。

### 3.4 文字サイズ・ウェイト階層

> 実測値（トップページ、2026-06-12 取得）。CSS Design Tokens も併記。

| Role | Font | Size | Weight | Line Height | Letter Spacing | Color | 備考 |
|------|------|------|--------|-------------|----------------|-------|------|
| Display (stat) | Chatwork Sans R | 28px | 700 | 50.4px (x1.8) | 2px (0.07em) | `#13202f` | 「導入社数98万社」等の数値強調 |
| H1 | Chatwork Sans B | 34px | 700 | 54.4px (x1.6) | normal | `#13202f` | 「国内利用者数No.1 中小企業向けビジネスチャット」 |
| H2 Hero | Chatwork Sans B | 41px | 700 | 65.6px (x1.6) | normal | `#13202f` | 「日本製ビジネスチャット、Chatworkとは？」 |
| H2 CTA Section | Chatwork Sans B | 24px | 700 | 36px (x1.5) | normal | `#ffffff` | 「お気軽にお問い合わせください」（ネイビー面上の白文字） |
| H3 Feature | Chatwork Sans B | 26px | 700 | 39px (x1.5) | normal | `#13202f` | 「だれでも簡単に使えるビジネスチャット」 |
| H3 Sub | Chatwork Sans B | 18.72px | 700 | 28.08px (x1.5) | normal | `#191919` | 「他にも使える便利機能」 |
| H3 Company | Chatwork Sans B | 17px | 700 | 25.5px (x1.5) | normal | `#191919` | 「株式会社礎」（導入事例） |
| Body | Chatwork Sans R | 16px | 400 | 25.6px (x1.6) | normal | `#191919` | 本文テキスト |
| Body Feature | Chatwork Sans R | 16px | 400 | 29.6px (x1.85) | normal | `#191919` | 機能説明テキスト（行間広め） |
| CTA Label | Chatwork Sans B | 21px | 700 | 27.3px (x1.3) | normal | `#ffffff` | 「無料ではじめる」（レッド CTA 上の白文字） |
| Nav | Chatwork Sans B | 14px | 700 | 22.4px (x1.6) | normal | `#13202f` | 「特徴・機能」等のナビゲーションラベル |
| Footer Link | Chatwork Sans R | 14px | 400 | 24px (x1.71) | normal | `#ffffff` | フッターナビゲーション |
| Caption | Chatwork Sans R | 10px | 400 | 15px (x1.5) | normal | `#191919` | プライバシー・法的テキスト |

**Design Tokens（CSS Custom Properties）**:

| Token | Value | 用途 |
|-------|-------|------|
| `--rise--fontSize-headline1` | 2.5rem (40px) | セクション大見出し |
| `--rise--fontSize-headline2` | 2.0rem (32px) | サブセクション見出し |
| `--rise--fontSize-headline3` | 1.5rem (24px) | 小見出し |
| `--rise--fontSize-subtitle` | 1.25rem (20px) | サブタイトル |
| `--rise--fontSize-body1` | 1rem (16px) | 本文 |
| `--rise--fontSize-body2` | .875rem (14px) | 補助テキスト |
| `--rise--fontSize-caption` | .75rem (12px) | キャプション |
| `--rise--fontSize-other-large` | 3rem (48px) | 大数値・ディスプレイ |
| `--rise--fontSize-other-xSmall` | .625rem (10px) | 最小テキスト |
| `--rise--fontSize-button-large` | 1.25rem (20px) | 大ボタン |
| `--rise--fontSize-button-medium` | 1rem (16px) | 中ボタン |
| `--rise--fontSize-button-small` | .875rem (14px) | 小ボタン |

### 3.5 行間・字間

**行間 (line-height)** — 実測:
- **本文 (16px)**: `1.6`（25.6px / 16px）— `--rise--lineHeight-base: 1.6`
- **機能説明本文 (16px)**: `1.85`（29.6px / 16px）— 特殊な広い行間
- **見出し (24〜41px)**: `1.5`（タイト）— `--rise--lineHeight-headline: 1.5`
- **数値強調 (28px)**: `1.8`（50.4px / 28px）— 字間 2px と合わせた特別処理
- **CTA (21px)**: `1.3`（27.3px / 21px）— ボタン内のタイトな行間
- **ナビ (14px)**: `1.6`
- **キャプション (10px)**: `1.5`

**字間 (letter-spacing)** — 実測:
- **本文・見出し**: `normal`（0）。Chatwork Sans は letter-spacing なしが基本
- **数値強調 (28px)**: `2px`（0.07em）。大きな数字を読みやすく広げる特殊処理

**ガイドライン**:
- Chatwork Sans は letter-spacing を加えない設計。フォント自体のメトリクスで字間を制御
- 本文は `line-height: 1.6` が基本リズム。機能説明等の長文では `1.85` まで広げる
- 見出しは `line-height: 1.5` で統一
- 数値強調のみ letter-spacing `2px` の例外がある

### 3.6 禁則処理・改行ルール

'''css
/* 推奨設定（実サイト準拠） */
word-break: normal;
overflow-wrap: break-word;
line-break: strict;
'''

- ヒーロー見出しは `<br>` で改行位置を手動指定
- CTA ラベルは `white-space: nowrap`

### 3.7 OpenType 機能

'''css
font-feature-settings: normal;
'''

- 実測上、`palt` / `kern` の明示的有効化は確認されなかった
- Chatwork Sans のメトリクスに任せ、追加の字詰めを行わない方針

### 3.8 縦書き

- 該当なし。横書きのみ

---

## 4. Component Stylings

### Buttons

**Primary CTA（レッドピル）** — 「無料ダウンロード」「無料ではじめる」
- Background: `#f03748`
- Text: `#ffffff`
- Padding: ピル形状（高さ約 52px）
- Border Radius: `26px`（ピル）
- Font: Chatwork Sans B / Helvetica, Arial（ボタンにより異なる）, 16〜21px, weight 700〜800
- Border: none

**Secondary CTA（推奨実装）** — 「お問い合わせ」等
- Background: `#ffffff`
- Text: `#f03748`
- Border: `1px solid #f03748`
- Padding: `12px 24px`
- Border Radius: `26px`（ピル）
- Font: Chatwork Sans B, 16px, weight 700

**Login Link** — 「ログイン」
- Background: transparent
- Text: `#13202f`
- Padding: 0
- Font: Chatwork Sans R, 14px, weight 400
- Border: none（テキストリンク）

**Industry Card** — 業種別カード
- Background: `#ffffff`
- Text: `#191919`
- Border Radius: `5px`
- Padding Bottom: `40px`

**Resource Card** — 資料ダウンロードカード
- Background: `#ffffff`
- Text: `#191919`
- Border Radius: `16px`
- Padding Bottom: `20px`

**Close Button** — ポップアップ閉じ
- Font: Arial, 22px
- Text: `#ffffff`（白 x マーク）

### Inputs（推奨実装）

- Background: `#ffffff`
- Border: `1px solid #ebebeb`
- Border (focus): `1px solid #f03748`（ブランドレッドでフォーカス表現）
- Border Radius: `5px`
- Padding: `12px 16px`
- Font: Chatwork Sans R, 16px, weight 400
- Height: `44px`

### Cards / Surfaces

- Background: `#ffffff`（メイン）/ `#f6f6f6`（セカンダリ）/ `#f7f1e7`（ウォームアクセント）
- Border: `1px solid #ebebeb` または border なし
- Border Radius: `5px`（業種カード）/ `16px`（資料カード）
- Shadow: 基本フラット

### Header

- Background: `#ffffff`
- Position: `fixed top: 0`
- Chatwork ロゴ + ナビゲーション + CTA
- ナビは Chatwork Sans B, 14px, weight 700

### Footer

- Background: `#13202f`（ダークネイビー）
- Text: `#ffffff`
- Font: Chatwork Sans R, 14px, weight 400
- ナビリンク、会社情報、プライバシーポリシー等

### Badge

**Highlight Badge（イエロー）**
- Background: `#ffbe2e`
- Text: `#13202f`
- Border Radius: `4px`
- Font: Chatwork Sans B, 12〜14px, weight 700

---

## 5. Layout Principles

### Spacing Scale（推奨 8px グリッド）

| Token | Value | 用途 |
|-------|-------|------|
| XS | 4px | アイコンと文字の間 |
| S | 8px | ボタン内の縦余白 |
| M | 16px | カード内の段落間 |
| L | 24px | カードの内側余白・セクション内の見出しと本文 |
| XL | 48px | セクション間の縦余白 |
| XXL | 80px | ヒーロー・CTA セクションの上下余白 |

### Container

- Max Width: `1200px` 程度（実測時に中央寄せのコンテナ幅は確定できなかったため、推奨値）
- Padding (horizontal): mobile `16px` / desktop `24〜32px`

### Border Radius Scale

| Token | Value | 用途 |
|-------|-------|------|
| Small | 4px | バッジ、入力欄 |
| Medium | 5px | 業種カード |
| Large | 16px | 資料カード、強調パネル |
| Pill | 26px | 主要 CTA ボタン |

### Grid

- 特徴セクションは左右交互の 2 カラムレイアウト（テキスト + スクリーンショット）
- 業種カードは 3〜4 カラムのグリッド配置
- 資料ダウンロードは 3 カラムのカードグリッド
- Gutter: 24px

---

## 6. Depth & Elevation

| Level | Shadow | 用途 |
|-------|--------|------|
| 0 | `none` | カード・ボタン・ヘッダ（基本フラット） |
| 1 | `0 2px 8px rgba(0, 0, 0, 0.06)` | ホバー時の浮き上がり（推奨） |
| 2 | `0 4px 16px rgba(0, 0, 0, 0.08)` | ドロップダウン・ポップアップ |
| 3 | `0 8px 32px rgba(0, 0, 0, 0.12)` | モーダル・ダイアログ（推奨） |

- 実測ではほぼ全要素 `box-shadow: none`
- 立体感は **ウォームストーングレー背景 `#f5f5f4`** と **白サーフェス `#ffffff`** のコントラストで表現
- フッターのダークネイビー `#13202f` とコンテンツの白で明確な領域区分を作る
- 影を使う場合は **彩度の低い黒**（`rgba(0, 0, 0, 0.06〜0.12)`）で控えめに

---

## 7. Do's and Don'ts

### Do（推奨）

- 和文フォントは **Chatwork Sans を最優先**、フォールバックは Hiragino Sans → ヒラギノ角ゴシック → ヒラギノ角ゴ Pro → Meiryo → Helvetica → Arial → system-ui
- 本文の line-height は **1.6** を基本にする。長文の機能説明では **1.85** まで広げてよい
- 主要 CTA は **`#f03748` のレッドピル**（radius 26px）で統一する
- テキストリンクは **`#df1c13`**（CTA よりやや暗い赤）を使う
- 見出し・フッターの文字色は **`#13202f`（ダークネイビー）** を使う
- ページ背景は **ウォームストーングレー `#f5f5f4`** を敷き、コンテンツ面は **白 `#ffffff`** にする
- フッターは **ダークネイビー `#13202f` 背景 + 白文字** で信頼感を出す
- ハイライトバッジは **イエロー `#ffbe2e`** で目立たせる
- 導入実績（社数、利用者数）は大きな数字 + letter-spacing 広め（2px）で視覚的に強調する

### Don't（禁止）

- 主要 CTA に **ダークネイビー `#13202f` や黒を使わない** — CTA はあくまでブランドレッド `#f03748`
- CTA のレッドとテキストリンクのレッドを **混同しない** — CTA は `#f03748`、テキストリンクは `#df1c13`
- 本文に **`line-height: 1.4` 以下**を使わない（Chatwork の読みやすさが崩れる）
- **冷たいブルーグレー**（`#94a3b8`、`#64748b`）をテキスト色に使わない（ウォームトーンを壊す）
- フッター背景に **純黒 `#000000` を使わない**（ダークネイビー `#13202f` が正しい）
- Chatwork Sans のフォールバックチェーンの **順序を変えない**（ヒラギノ系の長いチェーンには意味がある）
- **角張った直角ボタン**（border-radius 0）を CTA に使わない — ピル形状 `26px` が基本
- イエロー `#ffbe2e` を **テキスト色に使わない**（背景・バッジ用のアクセント色）

---

## 8. Responsive Behavior

### Breakpoints（推奨値）

| Name | Width | 説明 |
|------|-------|------|
| Mobile | <= 767px | モバイルレイアウト |
| Tablet | 768px〜1023px | タブレットレイアウト |
| Desktop | >= 1024px | デスクトップレイアウト |

### モバイル時の調整

- H2 Hero: 41px → 28〜32px
- H3 Feature: 26px → 20〜22px
- 本文サイズは 16px を維持（line-height も 1.6 維持）
- ナビゲーションはハンバーガーメニューに切り替え
- 業種カードは 1〜2 カラムに折り返し
- 資料ダウンロードカードは 1 カラムにスタック

### タッチターゲット

- 主要 CTA: 高さ 44px 以上（ピル形状で確保）
- ナビリンク: タップ領域 44px 以上を確保

### フォントサイズの調整

- モバイルでは見出しをデスクトップの 70〜80% 程度に縮小
- 本文 14〜16px を維持

### ダークモード

- 該当なし（実測時点で未対応）

---

## 9. Agent Prompt Guide

### クイックリファレンス

'''
Brand Red (CTA): #f03748
Link Red: #df1c13
Yellow Accent: #ffbe2e
Dark Navy (Heading/Footer): #13202f
Body Text: #191919
Background (Warm Stone): #f5f5f4
Surface: #ffffff
Surface Gray: #f6f6f6
Surface Warm: #f7f1e7
Border: #ebebeb

Font (Body): "Chatwork Sans R", "Hiragino Sans", "ヒラギノ角ゴシック",
  "ヒラギノ角ゴ Pro", "Hiragino Kaku Gothic Pro",
  "Hiragino Kaku Gothic ProN", "ヒラギノ角ゴ ProN W3",
  Meiryo, Helvetica, Arial, system-ui, sans-serif
Font (Heading/CTA): "Chatwork Sans B" + 同フォールバック
（Chatwork Sans 不在時の代替提案: Noto Sans JP + Inter）

Body Size: 16px / line-height 1.6 / weight 400 / letter-spacing normal
Heading H2: 32〜41px / line-height 1.5〜1.6 / weight 700 / letter-spacing normal
Feature H3: 26px / line-height 1.5 / weight 700
Caption: 10px / line-height 1.5

Border Radius: 5px（小カード）/ 16px（大カード）/ 26px（CTA ピル）
Shadow: 基本 none。階層は #f5f5f4 背景と #ffffff サーフェスで表現
Footer: #13202f 背景 + #ffffff 文字
'''

### プロンプト例

'''
Chatwork のデザインに従って、ビジネスチャット SaaS のランディングページを作成してください。
- フォント: "Chatwork Sans R" (本文), "Chatwork Sans B" (見出し), フォールバックに
  "Hiragino Sans", "ヒラギノ角ゴシック", Meiryo, Helvetica, Arial, system-ui, sans-serif
- ヒーロー見出し: 34〜41px / weight 700 / line-height 1.6 / color #13202f
- セクション見出し: 24〜26px / weight 700 / line-height 1.5 / color #13202f
- 本文: 16px / weight 400 / line-height 1.6 / color #191919
- 機能説明本文: 16px / weight 400 / line-height 1.85 / color #191919（行間広め）
- 主要 CTA: 背景 #f03748（ブランドレッド）/ 白文字 / border-radius 26px / weight 700
- テキストリンク: color #df1c13 / weight 400
- ページ背景: #f5f5f4（ウォームストーングレー）
- コンテンツ面: #ffffff（白）
- カード: 背景 #ffffff / border-radius 5px（業種）または 16px（資料）
- フッター: 背景 #13202f / 文字 #ffffff / font 14px weight 400
- ハイライトバッジ: 背景 #ffbe2e / 文字 #13202f
- ボーダー: #ebebeb
- box-shadow は基本 none。立体感は背景色とサーフェスのコントラストで表現
- 冷たいグレーは使わない。ウォームトーンを維持
'''
```

Prompt file from a public GitHub repository, kept with its repository and path. Check the repository's licence before reusing it.
