# 角色动漫头像冷调

Community prompt · 角色板or三视图
Language: zh · Domains: entertainment, math, scifi · Source: K01

Source page: https://github.com/BaYue-SYJ/shuixian-prompts

Picture: https://r2.qqsrc.com/images/originals/13944.jpg

```
{
  "type": "科幻动漫角色参考图",
  "header": {
    "title": "{argument name=\"character name\" default=\"NOAH CHRONOS\"}",
    "subtitle": "{argument name=\"subtitle\" default=\"现实重构执行者 / 永恒秩序核心节点\"}",
    "quote": "世界并未破碎，它正在被重新设计。",
    "color_palette": { "count": 5, "colors": ["黑色", "深灰色", "海军蓝", "灰蓝色", "深红色"] }
  },
  "character_design": {
    "appearance": "年轻男性，凌乱的黑发，发光的蓝色眼睛",
    "outfit": "{argument name=\"coat style\" default=\"带有几何多边形纹理的黑色战术风衣\"}, 高筒靴，皮带，绑带",
    "action": "左手握着 {argument name=\"energy type\" default=\"发光的蓝色闪电能量\"}"
  },
  "layout": {
    "sections": [
      {
        "title": "主要三视图",
        "position": "左侧和中央",
        "count": 3,
        "labels": ["正面", "侧面", "背面"],
        "description": "展示角色不同角度的全身姿势"
      },
      {
        "title": "情感操作系统状态",
        "position": "右上角",
        "count": 5,
        "labels": ["中立：系统就绪", "冷漠：秩序模式", "损坏：混沌感染", "混沌感染", "冷静：完全同步"],
        "description": "带有不同表情和瞳色的头像特写"
      },
      {
        "title": "配件",
        "position": "左下角",
        "count": 2,
        "labels": ["同步接口设备 = 连接至情感操作系统", "现实位移吊坠 = 维度控制钥匙"],
        "description": "战术手套和发光水晶吊坠的详细特写"
      },
      {
        "title": "系统参数",
        "position": "左下角",
        "count": 3,
        "labels": ["秩序控制 / 时间", "中立 未定义状态", "混沌 腐蚀 / 侵蚀"],
        "description": "蓝色、灰色和红色的圆形 UI 图标"
      },
      {
        "title": "现实覆盖风衣 / 混沌无效化装甲",
        "position": "右下角",
        "count": 1,
        "labels": ["反混沌屏蔽", "战术模块"],
        "description": "带有指示线的风衣无头展示图"
      }
    ]
  },
  "footer": {
    "quote": "{argument name=\"footer quote\" default=\"现实可以被重写。\"}",
    "alignment": "秩序 [菱形] 混沌"
  }
}
```

Creator's prompt, collected for private study. Ask before republishing.
