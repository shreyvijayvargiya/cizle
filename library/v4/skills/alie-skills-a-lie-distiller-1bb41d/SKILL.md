---
name: a-lie-distiller
description: >
  阿烈蒸馏 —— 抖音视频/主播内容蒸馏分析工具。下载抖音视频 → 本地 Whisper 提逐字稿 →
  Claude 直接按 5/10 维度深度分析（不调用付费 LLM API，零成本）。
  Use when the user wants to 蒸馏/拆解/分析 a Douyin(抖音) creator or video, benchmark 对标主播,
  提取爆款规律、话术、运营方法论, or distill an account into a reusable playbook.
  Trigger on: "阿烈蒸馏""蒸馏主播""蒸馏这个博主""拆解抖音博主""分析抖音账号""对标主播"
  "分析这个抖音视频""提取爆款规律""下载主播视频分析" 以及带抖音链接的拆解/分析请求.
---

# 阿烈蒸馏 (A-Lie Distiller)

> ⚠️ **使用前必读**：本工具仅供学习研究。下载使用用户**本人登录**的抖音账号、获取公开作品数据。
> 转写默认走**本地 Whisper**，音频不出本机。分析由 **Claude 直接完成，不上传任何内容到第三方 LLM**。

## 这个 skill 做什么

把一个抖音主播/视频「为什么火」拆成可复用的方法论。三段式链路：

```
下载抖音视频  →  本地 Whisper 提逐字稿  →  Claude 按维度深度分析
(可选,需登录)     (mlx_whisper,不上云)      (我亲自分析,免费)
```

**与原 DyD 项目的最大区别**：分析这一环不调用 OpenAI/DeepSeek 等付费 API，而是由我（Claude）直接按 [references/analysis-dimensions.md](references/analysis-dimensions.md) 的方法论分析——更深入、零成本。

脚本目录：`scripts/`　项目源：`~/ClaudeCode/a-lie-distiller/`

---

## ⛔ 执行前必须确认（缺一不可）

触发任务后，以下三项必须由用户**明确给出**，不得自行推断：

1. **模式**
   - `单视频`：分析一条视频（5 维度）
   - `主播蒸馏`：分析一个主播的代表作合集（10 维度）

2. **数量**（仅主播蒸馏需要）：`10` / `20` / `30`（默认 20）
   - 不下载主播全部作品（动辄几百个），只取排名前 N 的代表作

3. **排序依据**（仅主播蒸馏需要）：
   - `点赞`(digg) —— 找最受欢迎的代表作【默认】
   - `评论`(comment) —— 找最有话题/争议、引发讨论的
   - `分享`(share) —— 找最有传播力的

> 如果用户只给了链接没说模式/数量，**先问清楚再动手**。

---

## 工作流

### 模式 A：单视频分析

1. **拿到视频**
   - 用户给视频文件 → 直接进第 2 步
   - 用户给抖音链接 → 见下方「下载前置条件」，用 `scripts/dyd_download.py video <URL>` 下载
2. **提逐字稿**：按 [references/transcription.md](references/transcription.md) 用本地 `mlx_whisper` 转写
3. **我来分析**：读 [references/analysis-dimensions.md](references/analysis-dimensions.md) 的「单视频 5 维度」，结合逐字稿+元数据输出分析
4. **保存**：询问是否存为 `.md` 到 `~/ClaudeCode/a-lie-distiller/reports/`

### 模式 B：主播蒸馏

1. **采集 + 精选下载**：用 `scripts/download_top.py` 采集主播全部作品，按用户选的排序取前 N 个下载
   ```bash
   python3 scripts/download_top.py user "<主页URL>" --top 20 --by digg
   #   --top  10/20/30/0(全部)      --by  digg/comment/share
   ```
2. **批量提逐字稿**：按 [references/transcription.md](references/transcription.md) 批量转写并合并成 `all_transcripts.txt`
3. **我来分析**：读 [references/analysis-dimensions.md](references/analysis-dimensions.md) 的「主播蒸馏 10 维度」，输出深度报告
   - 用户可指定只要某几个维度
4. **保存**：询问是否存为 `.md` 报告

> 也可只走「分析」环节：用户已有逐字稿时，跳过下载和转写，直接喂给我分析。

---

## 下载前置条件（仅当需要从抖音链接下载时）

下载基于 Playwright 连接 Chrome 远程调试端口，**需要用户本人登录抖音**：

1. 以远程调试模式启动 Chrome：
   ```bash
   "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" --remote-debugging-port=9222
   ```
2. 在该 Chrome 里登录抖音、打开目标主播主页
3. 运行下载脚本（脚本会连上这个 Chrome 调用抖音公开 API 分页采集）

> 下载这步涉及浏览器自动化和账号登录，若在当前环境跑不动，可让用户在**终端手动执行**下载脚本，拿到视频/逐字稿后再回来让我分析。分析环节不受任何环境限制。

依赖：`pip install playwright && playwright install chromium`（Python 3.14 装不了就用系统 python3 或终端环境）。

---

## 核心原则

- **分析是灵魂**：下载/转写只是备料，真正价值在我按方法论做的拆解。务必具体、可执行、有金句感，拒绝套话。
- **隐私优先**：转写本地跑，不默认上云；分析不外传。
- **聚焦代表作**：不贪多，前 N 个爆款比全量更有分析价值。
- **落到行动**：每个维度都要回答「所以用户该怎么做」。

## 文件地图

| 路径 | 作用 |
|------|------|
| `scripts/download_top.py` | 精选下载器（采集后按 top/by 筛选） |
| `scripts/dyd_download.py` | 原始下载器（单视频/全量） |
| `scripts/video_filter.py` | 视频筛选（点赞/评论/分享 取前 N） |
| `scripts/a_lie_distiller.py` | 工作流封装 + 数据打包 |
| `scripts/analyzer_claude.py` | 分析数据结构（占位，分析实质由 Claude 做） |
| `references/analysis-dimensions.md` | **分析方法论（必读）** |
| `references/transcription.md` | 本地 Whisper 转写命令 |
