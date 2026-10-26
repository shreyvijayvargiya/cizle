# Dusk temple scene built in three.js with a 70-second video

By @leo_xiaolei
Language: ? · Domains: agriculture · Source: V04

Original post: https://x.com/leo_xiaolei/status/2112545748944556038

Source page: https://data.openchamber.dev/opus-5-5-videos/v/leo_xiaolei-2112545748944556038

Demo video: https://video.twimg.com/amplify_video/2112545540097667072/vid/avc1/1280x720/MyKsk9awSEiI_yrr.mp4?tag=29

```
我想用 three.js 做一座黄昏时刻的寺庙，最后输出成 70 秒的视频。
规则：不准用任何 3D 模型、贴图或照片，所有东西全用代码生成。
先不要渲染画面，先输出一份场景平面图 ⁠layout.js⁠：定义好主殿、五重塔、拱桥、莲花池、山门的位置和尺寸，单位用“米”。之后所有的代码都只能从这个文件里读取坐标。
太阳定在西南偏西方向、地平线上方约 7 度，打暖色光。
【段落 2：分身施工】
平面图确定后，开启 6 个 Sub-agent（子智能体）并行施工，每个 Agent 负责一个区域：地形、池塘（莲花、锦鲤）、主殿、五重塔、拱桥、树木。
每个 Agent 只能修改自己的文件。
全局材质（朱漆、金箔、青铜、屋瓦、木头）统一写在 ⁠materials.js⁠ 里供大家调用。
随机数一律使用固定种子（固定 Seed），保证每次打开渲染出来的样子一模一样。
（注：这一步记得附上几张高清的寺庙照片，给 AI 作为参考）
【段落 3：镜头调度】
安排 10 个镜头，每个镜头 7 秒。
每个镜头都从一个小物件的特写开始（灯笼、莲花、风铃、佛像面部等），再慢慢拉远露出整个场景。镜头开头先在特写停留片刻，中间加速拉远，结尾放慢缓动。
最后一个镜头，从逆光的枫叶拉远，最后过渡到整座寺庙的全景俯拍（航拍视角）。
```

Creator's prompt, collected for private study. Ask before republishing.
