# DESIGN.md — teamLab（チームラボ）

By @kzhrknt · design-system
Language: ja · Domains: product, math · Source: J01

Source page: https://github.com/kzhrknt/awesome-design-md-jp/blob/HEAD/design-md/teamlab/DESIGN.md

```
# DESIGN.md — teamLab（チームラボ）

> teamLab（https://www.teamlab.art/jp/）公式サイトのデザイン仕様書。
> 「アートコレクティブ」を掲げ、東京・大阪・京都・各地でデジタルアート作品を常設展示する世界的なアート集団。
> 実サイトの computed style 実測（2026-05-07 取得）に基づく。

---

## 1. Visual Theme & Atmosphere

- **デザイン方針**: ほぼ純黒 `#0e0f0e` をキャンバスに、白テキスト・グレーキャプション・写真で構築する**ダーク・ミニマリズム**。アート作品の発色を最大化するため、UI 自身は装飾色を一切持たない**色のないデザイン**
- **密度**: ヒーローセクションは作品写真が画面いっぱいに敷き詰められ、UI は写真の上にうっすら被るテキストオーバーレイのみ。**情報密度は低く、写真密度が高い**メディア型レイアウト
- **キーワード**: 純黒背景、白文字、Helvetica 先頭、角丸ゼロ、アート優先、ボーダーCTA、無加工写真直置き
- **特徴**:
  - **CSS Custom Properties は z-index 系のみ**で、色フォント余白のトークンは未定義 — レガシー / シンプル運用の典型
  - **Web フォント未使用**。Helvetica → Arial → ヒラギノ角ゴ Pro W3 → 游ゴシック → Osaka → メイリオ → MS PGothic → 中国語/繁体字 → sans-serif の**OS 既定フォントの長大なフォールバック**で多言語対応
  - **letter-spacing は基本 normal**。例外は言語切替の `0.24px (≈+0.02em)` のみ — 詰めも開きもしない素朴な組
  - 全コンポーネントが**角丸 0px**。ボタンも矩形バー
  - **CTA は塗りなし＋ 1px のグレー枠**（`#5a5a5a`）のみ。色を持たないボタン文化
  - 「ON VIEW」「常設」等の小バッジは **白塗り＋黒文字（10px / weight 700）** の超小型ピル
  - サブメタ・日付テキストは `#999999`（mid-gray）に統一
  - 全テキストの line-height は 1.6（body）または 1.5（h2）— 日本語可読性の標準値
  - ダークモード前提（ライト切替なし）

---

## 2. Color Palette & Roles

> 実サイトの computed style 実測値。すべて hex 表記。
> teamLab の UI は色を持たず、**4 階調の無彩色**だけで構築されている。

### Brand

- 実質的なブランドカラー無し。**写真とアート作品の中の色**だけがブランドの彩度を担う
- 強いて言えば「ロゴと UI に色を入れない」という**色の不在そのもの**がブランド

### Surface（背景）

- **Page Background** (`#0e0f0e`): ページ全体の極暗グリーン寄りブラック。純黒 #000 ではなくわずかに緑が混じる（rgb(14, 15, 14)）
- **Hero / Section Background** (`#0e0f0e`): 上記と同色。セクション間で背景色は変わらない
- **Badge Background** (`#ffffff`): 「ON VIEW」「VIDEO」等の小バッジ — 暗背景の中で唯一の白面

### Text / Foreground

- **Text on Dark** (`#ffffff`): 見出し・本文・ナビ・CTA テキスト
- **Text Muted** (`#999999`): 日付・キャプション・サブメタ（rgb(153, 153, 153)）
- **Badge Text on White** (`#000000`): 白バッジ内の黒テキスト

### Border

- **CTA Border** (`#5a5a5a`): ボタンの外枠（1px solid）
- **Subtle Divider**: ボーダー類は基本的に出さず、写真の角と空間で区切る

### Semantic（補完）

- 実 UI に表面化したエラー・成功色は確認できない。アラート色を追加する場合は **赤（`#e23b3b`）／ 緑（`#3aa66e`）／ 黄（`#e0a73a`）** をミュートに

---

## 3. Typography Rules

### 3.1 和文フォント

teamLab は **Web フォントを一切読み込まず**、OS 既定の和文フォントへフォールバックする伝統的構成。

- **第1候補（Mac）**: ヒラギノ角ゴ Pro W3 / Hiragino Kaku Gothic Pro
- **第2候補（Windows / Mac 新）**: 游ゴシック / Yu Gothic / YuGothic
- **第3候補（Mac 旧）**: Osaka
- **第4候補（Windows 旧）**: メイリオ / Meiryo
- **第5候補（Windows 古）**: ＭＳ Ｐゴシック / MS P Gothic
- **東アジア**: Microsoft YaHei / 微软雅黑 / SimSun / Microsoft JhengHei / 微軟正黑體 / PMingLiU

### 3.2 欧文フォント

- **第1候補**: Helvetica
- **第2候補**: Arial
- **等幅**: 該当なし（コードブロックは未表示）

### 3.3 font-family 指定

実サイトの実測値（**body / h2 / p すべて同一の font-family**）:

'''css
font-family: Helvetica, Arial,
  "ヒラギノ角ゴ Pro W3", "Hiragino Kaku Gothic Pro",
  游ゴシック, "Yu Gothic", YuGothic,
  Osaka,
  メイリオ, Meiryo,
  "ＭＳ Ｐゴシック", "MS P Gothic",
  "Microsoft YaHei", 微软雅黑,
  SimSun,
  "Microsoft JhengHei", 微軟正黑體,
  PMingLiU,
  sans-serif;
'''

**フォールバックの考え方**:
- **欧文 Helvetica/Arial を先頭**に置く — ASCII グリフを欧文書体で組む
- 和文は **ヒラギノ角ゴ Pro が最優先**。Windows では游ゴシック → メイリオへフォールバック
- 中国語・繁体字フォントまで含む長大チェーン — グローバル展開に対応
- AI で再現する場合、**Helvetica Neue / Arial / "Hiragino Kaku Gothic ProN" / "Yu Gothic" / sans-serif** に簡略化して問題なし

### 3.4 文字サイズ・ウェイト階層

> 実測値（トップページ、2026-05-07 取得）

| Role | Size | Weight | Line Height | Letter Spacing | Color | 備考 |
|------|------|--------|-------------|----------------|-------|------|
| Section h2 | **20px** | **700** | 30px (×1.5) | normal | `#ffffff` | "WORKS" 等の節タイトル |
| Body | 16px | 400 | 25.6px (×1.6) | normal | `#ffffff` | 段落・作品名 |
| Nav Link | 16px | 400 | 25.6px (×1.6) | normal | `#000000` (light) / `#ffffff` (dark) | グローバルナビ |
| Nav Active | 14px | 600 | 22.4px (×1.6) | normal | `#ffffff` | "WORKS" 等のアクティブ |
| Sub Meta | 13px | 400 | 20.8px (×1.6) | normal | `#ffffff` / `#999999` | "2025.10.07(火) - 常設" |
| Caption | 12px | 400 | 19.2px (×1.6) | normal | `#999999` | "2025.4.18(金) - 常設" |
| Lang Switch | 12px | 400 | 19.2px (×1.6) | 0.24px (+0.02em) | `#ffffff` | "Deutsch / English / Español..." |
| Mini Badge | **10px** | **700** | 16px (×1.6) | normal | `#000000` on `#ffffff` | "ON VIEW" / "VIDEO" |
| CTA Text | 14px | 400 | 22.4px (×1.6) | normal | `#ffffff` | "もっとみる" 等 |

### 3.5 行間・字間

- **本文の行間**: **1.6**（25.6 / 16）— 日本語標準の中庸値
- **見出し（h2）の行間**: **1.5**（30 / 20）
- **小文字（10〜12px）の行間**: **1.6**（19.2 / 12, 16 / 10）— 維持
- **letter-spacing**: 基本 **normal（0）**。例外は言語切替の +0.24px（≈ +0.02em）のみ

**ガイドライン**:
- teamLab の和文は短文・タイトル中心。長文段落は登場しない
- **letter-spacing は触らない**（normal 維持）— Helvetica と Hiragino のメトリクスをそのまま信頼する素朴な組
- 言語切替や小バッジ等、**12px 以下の小文字にだけ** letter-spacing +0.02em 付与で潰れ防止

### 3.6 禁則処理・改行ルール

'''css
word-break: normal;
overflow-wrap: break-word;
line-break: strict;
'''

- ブラウザ既定の禁則処理に依存（カスタム CSS 上書きなし）
- 作品名は基本的に短く、改行は手動で `<br>` を入れる前提

### 3.7 OpenType 機能

'''css
font-feature-settings: normal;
'''

- **palt / kern を有効化していない** — 詰めない素朴な組が teamLab の選択
- AI 再現時に詰めを足したい場合のみ `font-feature-settings: "palt"` を限定的に追加（見出しのみ）

### 3.8 縦書き

- 該当なし。横書きのみ

---

## 4. Component Stylings

### Buttons

teamLab の UI には**塗りボタンが存在しない**。CTA は枠線だけのテキストバーに統一。

**Outlined CTA（"もっとみる" 等）**
- Background: `transparent`
- Text: `#ffffff`
- Border: `1px solid #5a5a5a`
- Padding: `12px 24px`（推奨）
- Border Radius: `0px`
- Font: 14px / weight 400 / letter-spacing normal
- Hover: border `#ffffff` / opacity 1（推奨）

**Mini Badge（"ON VIEW" / "VIDEO" / "常設"）**
- Background: `#ffffff`
- Text: `#000000`
- Padding: `4px 8px`
- Border Radius: `0px`
- Font: 10px / weight 700 / letter-spacing normal / uppercase

**Lang Switch**
- Background: `transparent`
- Text: `#ffffff`
- Padding: `0`
- Font: 12px / weight 400 / letter-spacing 0.24px
- 区切りはスラッシュ `/` ではなく中黒・空白・縦棒等で

### Inputs

実 UI に検索欄等は表面化していないが、teamLab トーンに合わせる場合:

- Background: `transparent` または `#1a1a1a`
- Border: `1px solid #5a5a5a`
- Border (focus): `1px solid #ffffff`
- Border Radius: `0px`
- Padding: `8px 12px`
- Font: 14px / Helvetica + Hiragino
- Color: `#ffffff`

### Cards / Work Tiles

teamLab の作品カードは**写真直置き**で、ボックス装飾なし。

- Background: `transparent`
- Border: なし
- Border Radius: `0px`（写真の四角を尊重）
- Padding: 写真直下にメタ領域 12〜16px
- Shadow: なし（フラット）
- 構造: 写真 → 小バッジ（"ON VIEW"）→ 作品タイトル（16px white） → 開催情報（13px white） → 会場名（13px gray）

### Header / Nav

- Background: `#0e0f0e` または半透明黒
- Color: `#ffffff`（ナビ）
- Padding: `16px 32px`
- Logo "teamLab" 左、ナビ項目右、言語切替右端
- Active 項目は font-weight 600、それ以外 400

### Footer

- Background: `#0e0f0e`
- Color: `#ffffff`（メイン）/ `#999999`（補足）
- リンク列: NEWS / CAREERS / Privacy Policy 等を横並び
- Padding: `48px 32px 32px`

---

## 5. Layout Principles

### Spacing Scale（推奨 8px グリッド）

| Token | Value | 用途 |
|-------|-------|------|
| XS | 4px | バッジ内余白 |
| S | 8px | リスト項目間 |
| M | 16px | カード内段落間 |
| L | 24px | カード間 |
| XL | 40px | セクション内余白 |
| XXL | 80px | セクション間 |

### Container

- Max Width: 1280px（推奨）
- Padding (horizontal): mobile 16px / desktop 32px

### Grid

- 作品カード: 2 カラム（mobile）→ 3 カラム（tablet）→ 4 カラム（desktop）
- Gutter: 16〜24px

### Border Radius Scale

| Token | Value | 用途 |
|-------|-------|------|
| Square | 0px | 全要素 |

- teamLab は**全要素で角丸ゼロ**。バッジも CTA も写真も直角

---

## 6. Depth & Elevation

| Level | Shadow | 用途 |
|-------|--------|------|
| 0 | `none` | カード・写真・パネル（基本フラット） |
| 1 | `0 0 0 1px rgba(255,255,255,0.1)` | ホバー時の薄境界（推奨） |

- teamLab は**影を一切使わない**。立体表現はゼロで、写真の発色だけが視覚階層を作る
- カード・モーダルすべてフラット
- ホバー演出は opacity / border-color の変化のみ

---

## 7. Do's and Don'ts

### Do（推奨）

- **背景は `#0e0f0e`**（純黒 #000 ではない）— わずかにグリーン寄りの深い黒で写真が映える
- **本文 16px / line-height 1.6 / weight 400** を基準に
- **見出し（h2）は 20px / weight 700 / line-height 1.5**
- **letter-spacing は基本 normal**。詰めず開かない
- **CTA は塗りなし、`1px solid #5a5a5a` の枠線**だけで構成
- **小バッジは白塗り＋黒文字、10px weight 700**
- **角丸はすべて 0px**
- **影・グラデーション・カラフルなアクセントを使わない**
- 補足テキストは `#999999`（mid-gray）に統一
- 言語切替・サブメタなど 12px 以下にだけ `letter-spacing: 0.24px` 付与

### Don't（禁止）

- 背景に純黒 `#000000` を使わない（`#0e0f0e` の深い黒を厳守）
- 本文 letter-spacing に palt / 0.04em 等の詰めを適用しない（teamLab は詰めない）
- ボタンに `background-color` 付き矩形を作らない（線ベースで構成）
- 角丸（`border-radius` > 0）を使わない
- カラフルなブランド色・アクセントカラーを UI に追加しない（色は写真の中だけ）
- 影・elevation を使わない（フラット原則）
- Web フォントを読み込まない（OS フォントのフォールバックで構成）
- 本文に純白 `#ffffff` 以外のオフホワイトを使わない（純白統一）

---

## 8. Responsive Behavior

### Breakpoints

| Name | Width | 説明 |
|------|-------|------|
| Mobile | ≤ 768px | スマホ |
| Tablet | 769–1024px | タブレット |
| Desktop | > 1024px | デスクトップ |

### モバイル時の調整

- Section h2: 20px → 18px（推奨）
- Body: 16px 維持（モバイルでも縮小しない）
- ナビは drawer ハンバーガーへ切り替え
- 作品グリッド 4 → 2 → 1 カラム

### タッチターゲット

- 最小 44×44px。CTA・バッジは padding `12px 24px` 以上を確保

### ダークモード

- **常時ダーク**。ライトモード切替は提供しない

---

## 9. Agent Prompt Guide

### クイックリファレンス

'''
Background: #0e0f0e（深いブラック、純黒 #000 ではない）
Text Primary: #ffffff
Text Muted: #999999
Badge BG: #ffffff
Badge Text: #000000
Border (CTA): #5a5a5a

Font: Helvetica, Arial, "ヒラギノ角ゴ Pro W3", "Hiragino Kaku Gothic Pro", 游ゴシック, "Yu Gothic", YuGothic, Osaka, メイリオ, Meiryo, "ＭＳ Ｐゴシック", "MS P Gothic", "Microsoft YaHei", 微软雅黑, SimSun, "Microsoft JhengHei", 微軟正黑體, PMingLiU, sans-serif
Web Fallback (簡略): "Helvetica Neue", Arial, "Hiragino Kaku Gothic ProN", "Yu Gothic", sans-serif

Body: 16px / weight 400 / line-height 1.6 / letter-spacing normal
Heading h2: 20px / weight 700 / line-height 1.5 / letter-spacing normal
Sub Meta: 13px / weight 400 / line-height 1.6 / color #ffffff or #999999
Caption: 12px / weight 400 / line-height 1.6 / color #999999
Mini Badge: 10px / weight 700 / line-height 1.6 / black on white
Lang Switch: 12px / weight 400 / letter-spacing 0.24px

Border Radius: 0px（全要素）
Shadow: none（基本フラット）
font-feature-settings: normal（palt 適用なし）
'''

### プロンプト例

'''
teamLab のデザインに従って、作品一覧ページを作成してください。
- 背景: #0e0f0e（純黒 #000 ではなく、わずかにグリーン寄りの深い黒）
- フォント: "Helvetica Neue", Arial, "Hiragino Kaku Gothic ProN", "Yu Gothic", sans-serif
- letter-spacing は基本 normal。言語切替などの 12px 以下にだけ +0.02em
- セクション見出し: 20px / weight 700 / line-height 1.5 / color #ffffff
- 作品タイトル（カード内）: 16px / weight 400 / line-height 1.6 / color #ffffff
- 開催情報（日付）: 13px / weight 400 / line-height 1.6 / color #ffffff
- 会場名（サブメタ）: 13px / weight 400 / line-height 1.6 / color #999999
- 「ON VIEW」「常設」バッジ: 10px / weight 700 / 黒文字 #000 / 白背景 #fff / padding 4px 8px / border-radius 0
- CTA「もっとみる」: 14px / weight 400 / 白文字 / 透明背景 / 1px solid #5a5a5a / border-radius 0 / padding 12px 24px
- 作品カードは写真直置き、影・ボーダー・角丸なし
- 影・グラデーション・カラフルなアクセントは一切使わない
- 言語切替は letter-spacing: 0.24px（+0.02em）で組む
'''
```

Prompt file from a public GitHub repository, kept with its repository and path. Check the repository's licence before reusing it.
