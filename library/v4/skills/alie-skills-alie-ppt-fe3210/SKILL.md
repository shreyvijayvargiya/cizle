---
name: alie-ppt
description: 阿烈的原生可编辑中文课件 PPTX 生成引擎。当用户点名"alie-ppt""阿烈PPT""阿烈课件""用阿烈的方法做PPT"，或要求做"原生可编辑、文字框色块都能改"的中文培训/讲课/招商课件，且偏好午夜玻璃或暖白讲堂风格时使用。产出 .pptx（python-pptx 原生构建，非图片版、非 HTML 转制），内置两套签名风格、九种页型、Keynote PDF 校验闭环，纯本地零成本。
---

# alie-ppt · 阿烈的可编辑课件引擎

## 定位

给"要拿去讲课、培训、招商"的人做 PPT。观众是老板和学员，deck 讲完还要被甲方拿去改。
所以这套 skill 只产出**原生可编辑 PPTX**：每一个字都是文字框，每一块色都是形状，放进 PowerPoint / WPS / Keynote 都能直接改。

## 五条铁律

1. **可编辑是底线。** 全部用 python-pptx 原生元素。python-pptx 做不出的效果（复杂渐变、辉光、玻璃模糊），先渲染成 PNG 作为底层贴图，文字永远原生放在上层——绝不交付整页图片。
2. **先确认再生成。** 大纲和风格没被用户点头前，不进入构建环节。确定性在生成前挣。
3. **一页一主张。** 每页只讲一句话，标题就是观点本身。"关于XX的几点思考"这种空标题不允许出现。
4. **案例页不打勾打叉。** 不用"✕普通说法 / ✓高手说法"的低端对比套路，用定位金句式呈现（公式见 [references/page-patterns.md](references/page-patterns.md)）。
5. **交付前必过校验闭环。** 构建 → Keynote 导 PDF → 逐页目检 → 改构建脚本重跑。发现问题只改脚本，不手工修 pptx。

## 工作流（5 步）

### Step 1 · 需求三问

开工前问清三件事：
- **听众是谁**（老板/员工/学员/投资人——决定语言颗粒度）
- **什么场合、讲多久**（时长→页数换算：有人讲的课 1 分钟 ≈ 1 页；发出去自己翻的 deck 砍半）
- **希望观众带走什么**（一句话写不出来，就先帮用户想清楚再动手）

### Step 2 · 大纲确认

输出「页号 + 页型 + 该页主张（一句话）」的清单给用户确认。
主张写不出一句话的页，砍掉。用户点头前不进 Step 4。

### Step 3 · 风格确认

两套签名风格，规范见 references/：

| 风格 | 代号 | 适用场 |
|---|---|---|
| 午夜玻璃 | `midnight_glass` | AI / 科技 / 产品发布 / 对外分享 |
| 暖白讲堂 | `warm_lecture` | 线下培训 / 知识付费课件 / 内训 |

用户有品牌色时，按 references 里的「风格扩展」新增一套 token，不硬套现有风格。

### Step 4 · 构建

用 [scripts/pptx_kit.py](scripts/pptx_kit.py) 写一个 `build_xxx.py`（照抄 [examples/build_samples.py](examples/build_samples.py) 的结构），然后 `python3 build_xxx.py` 运行（Mac 上建议 `/usr/bin/python3`）。

页型速查（详细版式见 references/page-patterns.md）：

| 页型 | 方法 | 干什么用 |
|---|---|---|
| 封面 | `cover()` | 标题 + 副题 + 品牌行 |
| 章节页 | `section()` | 大号章节数字，给课程分幕 |
| 大字观点页 | `statement()` | 一句主张打满全屏 |
| 定位金句案例页 | `quote_case()` | 案例标签 + 金句 + 细节注脚 |
| 步骤页 | `steps()` | 2–4 步方法论卡片 |
| 数据页 | `data_row()` | 2–4 个大数字横排 |
| 对比页 | `compare()` | 并列陈述 + 结论行（不打勾打叉） |
| 清单页 | `checklist()` | 行动清单，超过 6 条自动双栏 |
| 收尾页 | `closing()` | 金句收束 + CTA |

### Step 5 · 校验闭环

1. `scripts/export_pdf_mac.sh 输出.pptx` 用 Keynote 导出 PDF（首次运行 macOS 会弹「自动化」授权，点允许）
2. `pdftoppm -png -r 60 输出.pdf 页面前缀` 转成图片逐页目检
3. 检查点：文字溢出、元素重叠、字号过小（正文最小 13pt）、对齐、页码
4. 有问题 → 改 build 脚本 → 重跑。循环到目检通过才交付。

## 平台备注

- 字体：苹方（PingFang SC）+ Menlo（数字/编号）。非 Mac 打开自动替换字体，版式不受影响。
- 本 skill 不调用任何付费 API，纯本地运行，零成本。
- Linux/Windows 用户：校验环节把 Keynote 换成 LibreOffice（`soffice --convert-to pdf`）即可，其余全通用。
