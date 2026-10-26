# Autoplaying tactical RPG battle scene in one HTML file

By @stella_24r
Language: ? · Domains: gaming · Source: V04

Original post: https://x.com/stella_24r/status/2103253988011635091

Source page: https://data.openchamber.dev/opus-5-5-videos/v/stella_24r-2103253988011635091

Demo video: https://video.twimg.com/amplify_video/2103253649103425536/vid/avc1/1920x1080/rwlKp1nDvke982X4.mp4?tag=29

```
タクティクスRPGのバトルシーンを、ブラウザで開くだけで自動再生されるHTMLファイル1枚で作ってください

【条件】
・画像ファイル、音声ファイルは一切使わない。ドット絵、BGM、効果音はすべてコードで生成
・内部解像度320×180のCanvasを整数倍に拡大して、ドットがにじまないようにする
・クォータービュー（アイソメトリック）のマップ。草地、川、森、岩場の高台、土の道
・約60秒のデモ。クリックかスペースキーで開始、Rキーでリスタート

【登場キャラ】
味方：騎士、魔導士、弓兵（それぞれ名前、レベル、HPを持つ）
敵：ゴブリン3体、ボスの紅いドラゴン

【シナリオ】
1 タイトル表示「第三章 霧の渓谷」
2 PLAYER PHASE 騎士が移動してゴブリンを攻撃
3 魔導士がコマンドメニューから「サンダー」を選び、雷でゴブリン2体を倒す
4 ENEMY PHASE ドラゴンが炎のブレス、騎士がガードで耐える
5 弓兵の奥義カットイン「流星ノ矢」、矢の雨が降り注ぐ
6 CRITICAL!! 999ダメージ、ドラゴンが光の粒になって消える
7 VICTORY!! と LEVEL UP
8 カメラが引いて「TO BE CONTINUED…」

【演出】
・行動中のキャラに名前、レベル、HPバーのステータスパネルを出す
・ダメージ数字のポップ、画面の揺れ、パーティクル、カメラのパン
・会話ウィンドウは1文字ずつ表示
・BGMは通常戦とボス戦で切り替え、攻撃ごとに効果音を鳴らす
・フォントはGoogle FontsのDotGothic16
```

Creator's prompt, collected for private study. Ask before republishing.
