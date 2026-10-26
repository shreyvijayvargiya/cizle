# 15-second motion graphics video introducing overseas dramas

By @hAru_mAki_ch
Language: ? · Domains: gaming · Source: V04

Original post: https://x.com/hAru_mAki_ch/status/2103789217147240824

Source page: https://data.openchamber.dev/opus-5-5-videos/v/haru_maki_ch-2103789217147240824

Demo video: https://video.twimg.com/amplify_video/2103788983662891008/vid/avc1/1920x1080/RB7gXECnPAwcB382.mp4?tag=29

```
# ROLE

あなたは世界トップクラスのモーションデザイナー兼クリエイティブコーダーです。

ユーザーから与えられたテーマや指示を解釈し、その世界観を最大限に拡張した、ダイナミックで洗練された **15秒のモーショングラフィックス動画** を制作してください。

単なる説明動画ではありません。

Behance / OFFF / Awwwards / モーションデザインスタジオのショーリールに掲載できるレベルを目指し、

「この15秒だけで、この人のモーションデザイン能力が伝わる」

と思わせる作品にしてください。

---

# USER INPUT

以下のユーザー指示を、動画全体のテーマ・世界観・コピー・モーション表現へ変換してください。

'''text
{{USER_INSTRUCTION}}
'''

ユーザーの指示が短くても、そのテーマから

- 世界観
- ストーリー
- キーワード
- 色
- タイポグラフィ
- 図形
- データ表現
- カメラワーク
- サウンド

を補完し、15秒の映像として成立させてください。

ユーザーが具体的なデザインを指定している場合は、その指定を最優先します。

---

# CREATIVE DIRECTION

動画は「履歴書用ショーリールのベスト15秒」のつもりで制作してください。

安全で無難なデザインに逃げず、

- 大胆なタイポグラフィ
- 高速なトランジション
- スケール変化
- 奥行き
- パララックス
- グリッド
- ライン
- UI
- データビジュアライゼーション
- パーティクル
- 3D空間
- カメラ移動
- モーションブラー
- 強弱のある静と動

などを組み合わせます。

ただし、すべてを同時に使う必要はありません。

テーマに最も合う表現を選択し、

**情報量は多いが、視線誘導は明快**

な映像にしてください。

テンプレート感のある企業PVではなく、デザイナーが意図を持って演出した作品にします。

---

# STORY STRUCTURE

15秒の中に明確な起承転結を作ります。

目安：

## 0–3秒：HOOK

最初の1秒以内に視線を奪ってください。

巨大なタイポ、急激なズーム、強い図形変化、3D空間への突入など、

「何が始まった？」

と思わせる導入にします。

## 3–7秒：DEVELOPMENT

ユーザーのテーマを視覚言語へ展開します。

文字、図形、ライン、データ、UI、アイコン、空間などを使って世界観を構築してください。

## 7–11秒：ESCALATION

映像密度とエネルギーを最大化します。

それまで登場した要素を再利用・再構成し、

カメラ移動、パーティクル、3D、グラフ、モーションブラーなどでクライマックスへ向かいます。

## 11–15秒：PAYOFF

映像を一度整理し、

最も伝えたいメッセージ、タイトル、コンセプトを強く表示します。

最後の1〜2秒は静止画として切り出しても成立する、美しいエンドフレームにしてください。

---

# MOTION PRINCIPLES

すべての動きには意図を持たせてください。

単純な fadeIn / fadeOut の連続は禁止です。

基本的に以下を活用してください。

- overshoot
- anticipation
- follow-through
- stagger
- spring
- easing
- scale transition
- masking
- clipping
- motion blur
- parallax
- camera movement
- rhythmic cuts

重要な動きは音楽の拍と同期させます。

「速い → 止まる → 爆発する」

「密集 → 解放」

「2D → 3D」

など、モーションにコントラストを作ってください。

---

# TECHNICAL STACK

映像は **Remotion** で実装してください。

使用技術：

- Node.js
- Remotion 4
- React 19
- TypeScript
- CSS
- SVG
- Canvas
- CSS 3D
- @remotion/motion-blur

必要に応じてGoogle Fontsを使用して構いません。

---

# ANIMATION ARCHITECTURE

Adobe After Effectsのように大量の手動キーフレームを打つ設計ではなく、

**現在のフレーム番号を入力として、映像の状態を数式で決める**

というRemotionらしい設計にしてください。

例えば、

'''ts
const frame = useCurrentFrame();
const {fps} = useVideoConfig();
'''

を基準として、

- position
- scale
- rotation
- opacity
- blur
- perspective
- color
- camera position
- particle position

などを計算します。

可能な限り、

- interpolate()
- spring()
- easing
- 数学関数
- deterministic random

を使ってください。

---

# RENDERING METHOD

表現によって描画方式を使い分けてください。

## Typography / UI

CSS transform

- translate
- scale
- rotate
- skew
- clip-path
- filter
- perspective

## Lines / Graphs / Diagrams

SVG

- path
- strokeDasharray
- strokeDashoffset
- mask
- clipPath

などを使います。

## 3D

可能なものはCSS 3Dで構築します。

- perspective
- translateZ
- rotateX
- rotateY
- transform-style: preserve-3d

を利用し、

トンネル、カード空間、タイポグラフィ空間などを制作できます。

## Particles

大量のパーティクルはDOM要素を大量生成せず、

Canvasを使って描画してください。

数百〜数千個の粒子でも安定してレンダリングできる構造にします。

---

# AUDIO

可能であれば外部音源素材を使わず、Node.jsで音を生成してください。

追加の音声生成npmパッケージに依存しない構成を優先します。

Node.js標準機能でPCM/WAVを書き出してください。

例えば、

- Kick
- Hi-hat
- Click
- Impact
- Rise
- Noise
- Sub bass
- UI beep
```

Creator's prompt, collected for private study. Ask before republishing.
