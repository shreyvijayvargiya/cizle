# AI voice cloning demo with recorded speech samples

By @aiehon_aya
Language: ? · Domains: general · Source: V04

Original post: https://x.com/aiehon_aya/status/2105779901412298854

Source page: https://data.openchamber.dev/opus-5-5-videos/v/aiehon_aya-2105779901412298854

Demo video: https://video.twimg.com/ext_tw_video/2105779746755735552/pu/vid/avc1/1280x720/DSA37n92svx1VlyB.mp4?tag=12

```
Irodori-TTS（https://t.co/HVnD1xsmd7）をこのPCに入れて、わたしの声でしゃべれるようにしてください。

1. GPUとVRAMを調べて、動くモデルを選んでインストールする（VRAM 8GBなら v4-Large の int8 量子化版）。テストで3本鳴らす
2. 声を録音するページをブラウザで作る。台本（ふつう・驚き・うれしい・拗ねる・からかう・ささやき・ナレーションなど15本と、自由トーク30秒）を表示して、スペースキーで録音と停止、音量メーターと音割れの判定、最初に3秒の無音チェック。48kHzモノラルのWAVで保存する
3. 録った声を手本に新しいセリフを4つ作る。手本の組み合わせを変えて2種類つくり、聞き比べて選べるページにする
4. 選んだ声を既定にして、コマンド1行でその声がしゃべるようにする

録音と生成した音声は、あとで見つけやすいフォルダにまとめて保存する。本人の許可がない人の声はまねしない。
```

Creator's prompt, collected for private study. Ask before republishing.
