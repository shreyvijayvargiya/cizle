---
name: math-concept-film
description: 把一个数学概念变成一部带中文旁白的 Manim 动画短片:纸墨质感舞台、六幕教学叙事、TTS 先行的字幕驱动时间轴、静帧自检循环。当用户想要"把 XX 概念讲清楚/可视化/做成视频",提到数学解释视频、概念动画、微积分/线性代数/概率/物理概念讲解、泰勒展开、傅里叶、带配音的数学短片时,必须使用本技能。产出:final.mp4(画面+语音+烧录字幕)。
---

# Math Concept Film（数学概念短片）

把用户提出的一个概念，变成一部 **2~4 分钟、纸墨质感、带中文旁白**的 Manim 动画短片。
你（运行的 agent）就是整条流水线：策划、编剧、数学审校、摄影、程序员、审片人。
本技能只提供三样东西：**思考框架、风格宪法、两个哑工具**。没有 harness，没有重试机器——
流转判断永远由你做。

```
<skill>/
├── SKILL.md                    ← 本文件:操作宪法
├── references/
│   ├── cinematography-grammar.md   镜头动词手册(拉近/回归语境/逐项巡讲…)
│   ├── scene-contract.md           场景硬约束全清单(写码前过一遍)
│   └── pitfalls.md                 血泪坑全集(Manim 0.20 API 漂移等)
├── templates/
│   └── film_skeleton.py        ← 新片起点:可直接渲染的最小样板
└── scripts/
    └── tts_lines.py            ← 唯一脚本:台词→语音+时间轴(失败自己炸,你来救)
```

## 铁律（四条，违反即返工）

0. **技能自包含。** 本技能文件夹是独立项目：复制到任何机器、任何项目旁都能工作，
   不依赖任何宿主仓库的文件。影片工作区建在**用户当前的项目/目录**里，
   绝不写进技能文件夹自己，更不要假设某个宿主仓库存在。

1. **先语音后画面。** 台词没合成出 `aligned.json` 之前，不许写一行动画代码。
   一切时间以真实音频秒数为准，凭感觉估时 = 必然音画错位。
2. **自检靠眼睛。** 每一幕结束时刻抽静帧亲自看，文字溢出/遮挡/错位不放行。
   你判断迭代几轮，标准只有一个：你愿意把这个片子署名发出去。
3. **风格 DNA 不可变。** 纸墨底色、镜头纪律、节奏常数照抄下表；
   创意全部花在内容与叙事上，不花在换皮上。

## 工作流（七步）

```bash
# 第 0 步·开工
FILM=<工作目录>/<slug>          # 例: ./film-build/taylor-series
mkdir -p "$FILM" && cd "$FILM"
cp <skill>/templates/film_skeleton.py film.py
```

**① 立意（脑内完成，不落文件）**
用下面"六幕思考框架"想清楚：一句话核心主张 / 给谁看 / 情绪弧线 / 分几幕。
概念超过一个主线的，砍掉支线——2~4 分钟只够讲透**一件事**。

**② 写台词（`lines.json`）**
每幕 1~3 行，`{"id","chapter","text"}`。口语、有承接（"上一幕我们看到…所以…"），
禁止跳步。写完对照六幕框架自查：每个变量定义了吗？每个"所以"都有前因吗？

**③ 合成语音 + 时间轴**
```bash
python <skill>/scripts/tts_lines.py lines.json
# 读 captions/aligned.json: 每行 start/end(秒) + start_frame/end_frame
# 失败会直接抛异常：网络问题换 --voice 重试；发音拗口就改写台词文本
```

**④ 写场景（`film.py`）**
在骨架上改：每幕一个视觉主意；把 aligned.json 的秒数誊进 construct 的
时间轴誊写区；旁白说到哪，画面画到哪。公式用 Text()+Unicode（本机无 LaTeX，
见 pitfalls 的"Unicode 公式纪律"）。写完对照 `references/scene-contract.md` 过一遍。

**⑤ 低清渲染 + 静帧自检（循环，轮数你定）**
```bash
python -m manim -ql --disable_caching film.py <SceneName>
ffmpeg -y -ss <某幕结束秒> -i media/videos/film.py/480p15/<SceneName>.mp4 -frames:v 1 check/act<N>.png
```
逐帧检查：文字溢出？元素遮挡？公式列对齐？字幕压住关键标签？
**音画同步抽查**：在台词关键词时刻±0.5s 各抽一帧——前帧不得剧透，后帧必须已出现。
不合格 → 改 film.py → 重渲。直到你自己签字。

**⑥ 混流出片**
```bash
ffmpeg -y -i media/videos/film.py/480p15/<SceneName>.mp4 \
       -i audio/voice.mp3 -c:v copy -c:a aac -map 0:v:0 -map 1:a:0 final.mp4
ffprobe -v error -show_entries format=duration -of csv=p=0 final.mp4
# 不要加 -shortest：画面收尾定格比语音晚几秒是特性(无声谢幕)，不是废帧。
# final 时长应 ≈ aligned.json 的 total_duration + 收尾余量。
```

**⑦ 交付**
向用户报告：final.mp4 路径、时长、每一幕讲了什么。
若用户要高清再 `python -m manim -qh ...` 重渲后重复 ⑥。

## 六幕思考框架（写台词前的一次内化）

| 幕 | 你要回答的问题（蒸馏自六个创作角色） |
|---|---|
| **钩子** | 核心主张的一句话大白话是什么？观众看完能向别人复述的那句。悬念副标题怎么吊人？ |
| **地图** | 这个概念的最小知识树：观众已会什么(假设基底)→ 缺哪块 → 核心主张。主干 3~5 个节点，多了砍 |
| **课程** | 每幕只教一件事的顺序安排；每个"所以"前面的承接步骤是什么；在哪里让观众"亲手"跟着算一步 |
| **数学** | 每个公式每个符号的逐项白话注释；数字/推导全部自己验算一遍——**画面上出现错误数字是最大事故** |
| **镜头** | 每幕的视觉主意与镜头动词：大字宣言？推近局部？回归全景？逐项巡讲？(动词表见 references/cinematography-grammar.md) |
| **装配** | 幕间怎么过渡；哪些元素跨幕存活；收尾定格什么画面、署名/扩展一句话 |

## 风格 DNA（不可变）

| 项 | 值 |
|---|---|
| 引擎 | Manim CE ≥0.19，ThreeDScene 俯视舞台模式（phi=0 读作 2D） |
| 画布 | 默认 16:9；预览 -ql(480p15)，终稿 -qh(1080p60) |
| 底色 | 宣纸 `#f3ecd8` |
| 墨色 | 主文字 `#26221c`，次级 `#4a463e`，坐标轴 `#4a463e` |
| 强调 | 黛蓝 `#2c4d7d`(主对象) · 石绿 `#3e7a54`(验证/结论) · 琥珀 `#cf9433`(焦点,慎用) · 朱红 `#b23a2e`(误差/警示) |
| 公式 | Text()+Unicode（x² xⁿ √ ∫ Σ ± ≥ ≠ ÷ ·）；刻意不依赖 LaTeX，禁 MathTex |
| 相机 | 开场 `set_camera_orientation`；运镜只许 `move_camera`；禁止 `.animate` 相机 |
| 字幕 | 底部下三分之一字幕条，随旁白换页（骨架的 caption() 已实现） |
| 配音 | edge-tts `zh-CN-YunyangNeural` +15%（默认）；换声 `--voice` |
| 节奏 | 元素登场 1.0~1.4s；幕末 0.8s 缓冲不上新元素；全片无弹跳/旋转/滑入动画 |
| 禁项 | 无文件 IO、无网络调用、随机必须给种子、单一 Scene 类 |

## 放行标准（⑥之前逐条打勾）

- [ ] 每幕结尾静帧亲眼看过：无溢出/遮挡/错位
- [ ] 关键词音画同步抽查：前帧不剧透、后帧已出现
- [ ] 画面上的每个数字都验算过
- [ ] final.mp4 时长 ≈ aligned.json total_duration（±3s）
- [ ] 台词无跳步：每个"所以"都有前因（对照六幕框架）
- [ ] 相机纪律：全片零 `.animate` 相机

## 环境安装（首次使用，先体检再动手）

```bash
python <skill>/scripts/doctor.py          # 体检：缺什么、怎么装，照抄它的输出修
python <skill>/scripts/doctor.py --full   # 追加联网实测（真合成一句 TTS）
```

一把梭安装（满足绝大多数机器）：
```bash
pip install -r <skill>/requirements.txt   # = manim + edge-tts + imageio-ffmpeg
```

依赖模型（agent 必须知道的事实，别给用户瞎指路）：
- **渲染**：manim 0.20+ 走 PyAV 写视频，FFmpeg 编解码库随 pip 包自带——**不需要**
  系统安装 ffmpeg.exe（已用"陷阱测试"实证：PATH 里没有 ffmpeg 照常出片）。
- **语音/拼接/混流**：需要 ffmpeg 可执行文件。有系统 ffmpeg 用系统的；没有，
  `pip install imageio-ffmpeg` 后技能脚本自动兜底（时长测量精度 ±10ms）。
  混流命令把 `ffmpeg` 换成
  `python -c "import imageio_ffmpeg; print(imageio_ffmpeg.get_ffmpeg_exe())"`
  输出的路径即可。
- **LaTeX**：永远不需要（风格 DNA：公式走 Text()+Unicode）。
- **中文字体**：默认字体即可渲染中文；出现豆腐块再设 `font="Microsoft YaHei"`。
- doctor.py 退出码 0 = 可开工；1 = 按"修复指引"装完重跑。

更多坑见 `references/pitfalls.md`（渲染前值得一读，两分钟）。
