# 62.5-second hand-drawn cartoon product intro video for BaoCut

By @dotey
Language: ? · Domains: entertainment, scifi, product · Source: V04

Original post: https://x.com/dotey/status/2104111348388941915

Source page: https://data.openchamber.dev/opus-5-5-videos/v/dotey-2104111348388941915

Demo video: https://video.twimg.com/amplify_video/2104109483177742336/vid/avc1/1920x1080/H2qNahdElkPybP4K.mp4?tag=29

```
为 BaoCut 做一支 62.5 秒、1920×1080@30fps、英文的产品介绍视频，风格是手绘卡通加魔法少女式的夸张特效，要可爱、炫酷、适合转发。

先读 designs/baocut 原型和 apps/baocut 拿真实的编辑器、Brand kit、Elements、Agent 面板布局；读 scripts/dev/app-icon 拿图标：星芒加播放头、三条彩色轨道。模板数、贴纸数、声波数、本地模型名、支持的 Agent CLI 都以代码为准；翻译不能写成本地功能。

要突出这些特色：自动字幕、翻译、AI 配音、剪口癖、品牌套件、模板、动态贴纸与声波、智能裁剪、本地文生图、全部模型在本机跑、内置 Agent 复用本机的 Claude Code / Codex 等 CLI 而不需要 API key。

叙事：
图标拆开，星芒和播放头变成超级可爱的小机器人 Bao 手里的魔法棒，三条轨道拉长成时间轴，底板变成预览。Bao 给猫咪女主播 Mimi 的视频连施九段咒语（Subtitlio!、Translato!……），她说话时的 meow / purrr / nya~ 口癖变成小老鼠，被 Bao 一棒一个敲掉。

接着玻璃罩落下，表示「全部在你的 Mac 上跑」。最后一切倒带，Bao 敲碎 API key 输入框，一句话交给 Agent 全部做完，再把魔法棒插回图标。关键动作配震屏、冲击波和白闪。

第 0 帧是「Edit videos like MAGIC」封面，Bao 举着魔法棒指向一张已经变好的猫咖成片卡，四周是九个功能标签。

实现：
放在 scripts/dev/robot-video/，分成 lib / 角色 / 编辑器 / 故事 / 音频几个文件，用 canvas 确定性逐帧绘制。
节拍表 T 和冲击点表 IMPACTS 同时驱动画面与音效，配乐是 120 BPM 的合成木琴律动。
render.mjs 导出 mp4，index.html 做预览。
每段抽关键帧拼图自查后再整片渲染。
```

Creator's prompt, collected for private study. Ask before republishing.
