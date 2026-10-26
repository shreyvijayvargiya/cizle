# Interactive 3D web concept viewer for a mechanical Dune sandworm

By @AYi_AInotes
Language: ? · Domains: science, data, engineering · Source: V04

Original post: https://x.com/AYi_AInotes/status/2104826052979597409

Source page: https://data.openchamber.dev/opus-5-5-videos/v/ayi_ainotes-2104826052979597409

Demo video: https://video.twimg.com/amplify_video/2104820394767335424/vid/avc1/2236x1080/ohQzgQlSplY1U4_O.mp4?tag=29

```
我附上了参考视频里的 4 帧截图。请把它做成一个真实可运行的网页应用，外观尽量贴近参考图。

做一个单文件、自包含的 HTML（用 import map 从 CDN 引入 Three.js，不需要构建步骤），呈现一个可交互的 3D 概念设计查看器。主题是《沙丘》沙虫的机械机器人版本，名称为 "SANDWORM MK-X — Subterranean Terrain Adaptive Excavation Unit"。

## 视觉方向
- 风格：工业概念设计图 / 工程设计文档。暖象牙色纸张背景（约 #EDE6D8），炭黑色细线条，克制的强调色：一种信号橙，加一种青色（用于 X-RAY）。不要做成暗色霓虹科幻风。
- 雾的颜色和纸张底色一致，让 3D 场景像印在纸上的跨页插图一样融进页面。
- 等宽字体或技术感无衬线字体，小号大写标签，极细边框，刻度线和比例尺。

## 机器人本体（全部程序化生成，不用外部模型）
- 身体由约 40–60 节分段装甲环沿样条曲线排列而成。每节环：圆柱外壳分成多块面板，带程序化细节——通风格栅、舱门、铆钉、凹槽，每节环略有不同。环与环之间是很深的暗色缝隙（见参考图 C）。
- 头部：一个大型圆形掘进前端，有多圈同心旋转的钻环、大量放射状的齿/刀片，以及模块化的颚部结构（见参考图 B）。
- 尾部逐渐收细。
- 运动：蠕动波沿身体传播；沙虫沿一条循环路径前进，会钻进沙丘又钻出来。破土处有沙尘粒子喷涌，身后留下一道浅沟和长长的投影。
- 材质：带风化感的米白色陶瓷装甲，缝隙里有更深的污垢；PBR 材质，柔和的方向光（太阳）加半球光，柔和阴影。

## 环境
- 程序化沙丘地形（多层噪声叠加），细微的风蚀波纹纹理，沙面上画着淡淡的等高线，远处沙丘渐隐进雾里。
- 用来体现尺度的小道具：一组前哨站建筑、一个地震监测站标记、少量散落的岩石、几架扑翼机样式的无人机在飞。

## HUD 叠层（HTML/CSS 覆盖在画布上，像一张设计图纸）
- 左上参数卡：CLASS、LENGTH 1,312 m、DIAMETER 187 m、MASS、PROPULSION（Peristaltic linear drive）、POWER PLANT、DEPTH CAPABILITY、CREW NONE (AUTONOMOUS)，再加一张迷你部署地图。
- 右上："HEAD SECTION — CROSS VIEW"，用 SVG 绘制（同心环、刀片、刻度环、比例尺），并列出头部各系统。
- 左下：地形示意图，带等高线和沙虫的行进路线，位置标记实时移动。
- 底部一排面板：整条身体的剖面侧视图，标注各模块（tail stabilizer、power & reactor、central actuation、head excavation），配米制比例尺；"SEGMENT DETAIL — TYPICAL RING" 单节环的爆炸图，零件编号；"LOCOMOTION CYCLE" 展示蠕动波的 4 个阶段，与实时动画同步。
- 部件标注在 3D 视图左右两侧排成整齐的两列（Segmented torso rings、Dorsal maintenance hatches、Sand-flow intake vents / Thermal exhaust ports、Modular jaw assembly、Primary excavation ring、Terrain sensor suite），每条标注用细引线连到沙虫身上对应的 3D 锚点；锚点被遮住时标注淡出。
- 3D 视图底边加一条细坐标尺。

## 控制（顶部栏）
- 镜头预设，切换时平滑缓动过渡：FRONT、SIDE、AERIAL、CHASE（跟随头部）、OUTPOST（从建筑旁的地面视角看）、ORBIT（缓慢自动环绕）。同时支持 OrbitControls 自由视角。按钮下方显示一行状态文字，例如 "FRONT VIEW · UNDER WAY · SURFACE PLOUGH"。
- X-RAY 开关：沙虫埋在沙子下面的部分显示为半透明青色外壳（见参考图 E），露出地面的部分保持实体。
- PAUSE / PLAY，以及 REFERENCE POSE（沙虫缓动成一条笔直、完全露出地面的姿态，方便检视）。

## 质量要求
- 必须像一件完成度很高的作品集作品，而不是 demo。配色统一、留白讲究，不能有 Three.js 默认的样子。
- 60fps：装甲环和细节用 InstancedMesh 或合并几何体，控制 draw call 数量。
- 自适应窗口尺寸；所有代码在一个文件里；不要有占位符或 TODO。

把完整的 HTML 文件放在一个代码块里输出。

网页打不开 / 白屏。控制台报错如下：

【把控制台的红字整段粘贴在这里】

请找到原因并修复。不要改动其他功能。修完后输出完整的 HTML 文件。

第一张和第二张是参考图，第三张是你当前做出来的效果。请只改沙虫本体，让它更接近参考图：

1. 装甲环：每节环的面板要更厚、更立体，面板之间有凹槽；加更多细节——格栅、舱门、铆钉、小方块凸起，每节环都略有不同。
2. 环与环之间的缝要更深、更黑，能看到里面的暗色结构。
3. 头部：像参考图 B 那样，外圈一圈密集的放射状齿，内部多层同心环，中心有钻芯；外圈装甲要比身体更粗、更厚。
4. 材质：米白色陶瓷感，缝隙和边角有一点脏污和磨损，不要塑料感。

界面叠层、镜头、交互都不要动。输出完整的 HTML 文件。

第一张是参考图，第二张是你当前的效果。请只调整界面叠层（HTML/CSS/SVG），让排版接近参考图：

1. 各面板的位置和大小参照参考图：左上参数表（无边框，文字直接压在画面上）、右上头部剖面卡片、左下地形示意图、底部三块面板等高并排。
2. 3D 部件标注排成左右两列，整齐对齐，用细引线连到沙虫对应部位；标注不能压住任何面板。
3. 字体更小更细，字间距更大，整体像工程图纸；线条统一用很细的炭黑色。
4. 画面底部加一条细坐标尺（刻度加数字）。

不要改 3D 场景。输出完整的 HTML 文件。

参考这两张图，逐个检查并修好这些交互：

1. 6 个镜头预设（FRONT / SIDE / AERIAL / CHASE / OUTPOST / ORBIT）切换时平滑过渡，大约 1.5 秒，带缓动效果。
2. 每个镜头下沙虫都要完整或大部分在画面里，不能太小或只露一截。CHASE 要跟在头部斜后上方；AERIAL 像参考图 D 那样从高处俯视，能看到沙尘和影子。
3. 用鼠标拖拽时自动切到自由视角；再点预设按钮能切回来。
4. REFERENCE POSE：沙虫在约 2 秒内平滑地变成一条浮在地面上的直线；再点一次恢复运动。
5. 加键盘快捷键：1–6 切镜头，X 切 X-RAY，空格暂停，R 切参考姿态。

输出完整的 HTML 文件。

第一张是参考图：打开 X-RAY 后，埋在沙子下面的那段身体显示成半透明青色（能透过沙地看到），露出地面的部分保持原样的实体材质。第二张是你当前的效果。

请按参考图改：
1. 用 shader 按"是否在地形高度以下"逐像素判断：地面以下的部分画成半透明青色（带菲涅尔边缘光），地面以上正常渲染。
2. 地下部分要能透过沙地看到（沙地不能完全遮住它）。
3. 可选：地下部分隐约显示内部的脊柱和液压杆结构。
4. 切换 X-RAY 时有 0.3 秒左右的淡入淡出。

输出完整的 HTML 文件。

最后一轮收尾：
1. 性能：检查 draw call 数量，把装甲环和小细节都合并成 InstancedMesh 或合并几何体，目标是 1080p 下稳定 60fps。在右下角显示 FPS。
2. 细节：沙尘粒子更柔和（软边、逐渐淡出），破土时会翻起一圈沙浪；远处沙丘融进雾里。
3. 检查所有按钮的选中状态显示正确；窗口缩放时布局不乱。
4. 去掉所有没用到的代码。

输出完整的 HTML 文件。
```

Creator's prompt, collected for private study. Ask before republishing.
