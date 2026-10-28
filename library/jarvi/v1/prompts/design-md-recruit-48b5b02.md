# DESIGN.md — Recruit（リクルート）

By @kzhrknt · design-system
Language: ja · Domains: product · Source: J01

Source page: https://github.com/kzhrknt/awesome-design-md-jp/blob/HEAD/design-md/recruit/DESIGN.md

```
# DESIGN.md — Recruit（リクルート）

> 株式会社リクルート（https://www.recruit.co.jp/）のデザイン仕様書。
> 「まだ、ここにない、出会い。」を掲げる日本最大級の人材・メディアテクノロジー企業。
> 実サイトの computed style 実測（2026-05-18 取得）に基づく。

---

## 1. Visual Theme & Atmosphere

- **デザイン方針**: ブランドブルー `#0065bd` を軸に、ライトブルーグレー `#f3f5fa` の面と白の階層で構成されたエディトリアル・コーポレートサイト。ライフスタイル写真を大きく使い「人と社会の出会い」を視覚的に訴求
- **密度**: 本文 15px / line-height 1.55 とゆとりある組み。セクション見出しは 28〜36px で堂々と。コーポレートサイトらしい落ち着いた情報配置
- **キーワード**: コーポレートブルー、エディトリアル、Tazugane Gothic × Graphik Web、和欧の書体コントラスト、余白のリズム
- **特徴**:
  - 和文に **Tazugane Gothic（タヅガネゴシック）** を採用。フォントワークス制作、リクルートのブランド書体として一貫使用
  - 英文セクションタイトルに **Graphik Web** を使用。ブランドブルー `#0065bd` で大きく表示し、和欧の書体コントラストでグローバル企業の印象を強化
  - 背景は白 `#ffffff` とライトブルーグレー `#f3f5fa` の 2 色で階層を作る。純白でもニュートラルグレーでもない「わずかにブルーを帯びたグレー」がブランドの知的な印象を支える
  - CSS Custom Properties でブランドカラーを管理（`--COLOR_BRAND_PRIMARY`, `--COLOR_BASE_DARK` 等）
  - WordPress ベースの CMS 構築
  - ダークモード非対応

---

## 2. Color Palette & Roles

> 実サイトの computed style 実測値 + CSS Custom Properties。すべて hex 表記。

### Brand

- **Brand Primary** (`#0065bd`): リクルートブルー。英文セクションタイトル、カード下部のアクセントライン、疑似要素の装飾（`--COLOR_BRAND_PRIMARY`）
- **Brand Secondary** (`#0e8bd1`): 明るいブルー。セカンダリアクセント（`--COLOR_BRAND_SECONDARY`）
- **Brand Secondary 2** (`#37b1de`): さらに明るいブルー。グラデーション・ホバー用（`--COLOR_BRAND_SECONDARY_2`）

### Neutral

| Token | hex | CSS Custom Property | 役割 |
|-------|-----|---------------------|------|
| Base Dark | `#2d3133` | `--COLOR_BASE_DARK` | 本文テキスト |
| Base Light | `#ffffff` | `--COLOR_BASE_LIGHT` | ページ背景 |
| Outline | `#d8d8db` | `--COLOR_OUTLINE` | ボーダー・区切り線 |
| Sub Gray | `#838484` | — | 補助テキスト・日付 |
| Surface Blue Gray | `#f3f5fa` | — | セクション背景面 |
| White Semi | `rgba(255,255,255,0.8)` | — | FV コピー背景オーバーレイ |
| Footer Dark | `#2d3133` | — | フッター背景 |

### Semantic

- **Danger** (`#e02412`): `--COLOR_ROLE_DANGER_DARK`。エラー・危険操作

### CTA / Buttons

- コーポレートサイトのため CTA ボタンは最小限
- リンクは `#0065bd`（ブランドブルー）のテキストリンク形式
- カード全体がクリッカブルなリンクカード形式が主

---

## 3. Typography Rules

### 3.1 和文フォント

- **ゴシック体**: **Tazugane Gothic（タヅガネゴシック）** を最優先。フォントワークス制作のリクルートブランド書体。Web フォントとして配信
- **フォールバック**: sans-serif のみ（シンプルなフォールバック）
- **明朝体**: 使用しない

### 3.2 欧文フォント

- **ディスプレイ**: **Graphik Web** — セクションタイトル（"News", "Culture" 等）に使用。Bold 700 でブランドブルー表示
- **本文**: Tazugane Gothic の欧文グリフを使用

### 3.3 font-family 指定

'''css
/* 和文本文 */
font-family: "Tazugane Gothic", sans-serif;

/* 英文セクションタイトル */
font-family: "Graphik Web", sans-serif;
'''

**フォールバックの考え方**:
- Tazugane Gothic を Web フォントとして配信し、和文・欧文ともにブランド書体で統一
- 英文セクションタイトルのみ Graphik Web を使用し、和欧の書体コントラストを演出
- フォールバックは sans-serif のみで、特定のシステムフォントに依存しない

> **代替フォント注記**: Tazugane Gothic はフォントワークス制作のブランド書体。preview.html では **Zen Kaku Gothic New**（Google Fonts）を代替使用。Graphik Web の代替には **Inter**（Google Fonts）を使用。

### 3.4 文字サイズ・ウェイト階層

> 実測値（トップ／会社情報ページ、2026-05-18 取得）

| Role | Font | Size | Weight | Line Height | Letter Spacing | Color | 備考 |
|------|------|------|--------|-------------|----------------|-------|------|
| EN Section Title | Graphik Web | 36px | 700 | 54px (×1.5) | normal | `#0065bd` | "News", "Culture" |
| JP Section H2 | Tazugane Gothic | 30px | 400 | 45px (×1.5) | normal | `#2d3133` | 「外食はもっと便利に楽しく」 |
| Section Lead (p) | Tazugane Gothic | 28px | 400 | 43.4px (×1.55) | normal | `#2d3133` | 「企業情報」 |
| Body | Tazugane Gothic | 15px | 400 | 23.25px (×1.55) | normal | `#000000` | 本文 |
| Nav Animated | Tazugane Gothic | 12px | 400 | 24px (×2.0) | normal | `#2d3133` | ヘッダーアニメーションテキスト |
| Small / Label | Tazugane Gothic | 10px | 400 | 15px (×1.5) | normal | `#2d3133` | ラベル・キャプション |

### 3.5 行間（line-height）の方針

- **×1.5 を基準**: セクション見出し・本文ともに 1.5〜1.55 の狭い範囲に収まる
- ナビのアニメーションテキストのみ ×2.0（読みやすさのため）

### 3.6 字間（letter-spacing）の方針

- **全て normal**: letter-spacing の明示的な指定なし
- Tazugane Gothic, Graphik Web ともにデフォルトメトリクスで組む

### 3.7 OpenType 機能

'''css
/* font-feature-settings は設定なし */
font-feature-settings: normal;
'''

- palt 非適用。Tazugane Gothic のデフォルトメトリクスを使用

### 3.8 禁則処理・改行

- デフォルトの禁則処理
- Tailwind CSS ベースのユーティリティ（`overflow-hidden`, `whitespace-nowrap` 等）が部分的に使用

---

## 4. Component Stylings

### リンクカード

- 背景: 白 `#ffffff`
- 下部にブランドブルー `#0065bd` のアクセントライン（`::after` 疑似要素）
- ホバー時: 画像拡大アニメーション
- テキスト: `#2d3133`

### ニュースリスト

- 日付: `#838484`（Sub Gray）/ 12px
- タイトル: `#2d3133` / 15px / 400
- カテゴリラベル: テキストリンク形式

### ヘッダー

- 背景: 白 `#ffffff`
- ロゴ: 左上「RECRUIT」+ 「株式会社リクルート」
- ナビ: 右寄せ、アニメーション付きテキストリンク
- 下線アクセント: ブランドブルー `#0065bd`

### ファーストビュー（FV）

- 全幅のライフスタイル写真
- 半透明白オーバーレイ `rgba(255,255,255,0.8)` 上にコピーテキスト
- キャッチコピー: 30px / 400 / `#2d3133`
- サブコピー: 15px / 400

---

## 5. Layout Principles

- **最大幅**: コンテンツはセンタリング
- **セクション背景**: 白 `#ffffff` と `#f3f5fa` を交互に配置して階層を作る
- **セクション間余白**: 大きめ（80〜120px 程度）
- **カード**: ブランドブルー下線のリンクカードが基本パターン
- **写真**: ライフスタイル写真を大きく使い、人と社会の接点を表現

---

## 6. Depth & Elevation

- **影の使用**: 最小限。フラット＋色面で階層を表現
- **ヘッダー**: 白背景、スクロールに応じた挙動あり
- **カード**: 影なし。下線アクセント（`#0065bd`）で区切り
- **FV オーバーレイ**: `rgba(255,255,255,0.8)` の半透明面

---

## 7. Do's and Don'ts

### Do's（推奨）

- ブランドブルー `#0065bd` をアクセントカラーとして一貫使用する
- 英文セクションタイトルは Graphik Web / Bold / ブルーで表示する
- 和文本文は Tazugane Gothic / Regular で組む
- 白と `#f3f5fa` の 2 色で背景の階層を作る
- リンクカードの下部にブランドブルーのアクセントラインを入れる

### Don'ts（非推奨）

- ブランドブルーを背景色として大面積に使わない（アクセント・ラインとして使用）
- Graphik Web を本文に使わない（セクションタイトル専用）
- 鮮やかすぎる色（赤・オレンジ等）をアクセントに使わない
- letter-spacing を追加しない（全て normal）
- カードに強い影を付けない（フラット＋下線がブランドスタイル）

---

## 8. Responsive Behavior

- **ブレークポイント**: 実測未取得（Tailwind ベースのため tw 標準の可能性が高い）
- **モバイル**: ハンバーガーメニュー、カードは 1 カラム、FV 写真はクロップ
- **セクションタイトル**: 英文タイトルのサイズが縮小

---

## 9. Agent Prompt Guide

> AI エージェントがこの DESIGN.md を参照してリクルート風の UI を生成するためのガイド。

### 必須トークン

'''css
:root {
  --COLOR_BRAND_PRIMARY: #0065bd;
  --COLOR_BRAND_SECONDARY: #0e8bd1;
  --COLOR_BRAND_SECONDARY_2: #37b1de;
  --COLOR_BASE_DARK: #2d3133;
  --COLOR_BASE_LIGHT: #ffffff;
  --COLOR_OUTLINE: #d8d8db;
  --surface-blue-gray: #f3f5fa;
}
'''

### 生成時の注意点

1. **和文は Tazugane Gothic、英文タイトルは Graphik Web**: 2 書体の使い分けがブランドの核心
2. **英文タイトルは Bold + ブランドブルー**: `font-family: "Graphik Web"; font-weight: 700; color: #0065bd;`
3. **本文テキストは `#2d3133`**: 純黒 `#000000` も部分的に使われるが、基本は Base Dark
4. **背景は白 + `#f3f5fa` の 2 色**: セクション間を色面で区切る
5. **CTA は控えめ**: テキストリンク形式が基本。派手なボタンは使わない
6. **line-height は ×1.5**: 統一的に 1.5 前後で組む
```

Prompt file from a public GitHub repository, kept with its repository and path. Check the repository's licence before reusing it.
