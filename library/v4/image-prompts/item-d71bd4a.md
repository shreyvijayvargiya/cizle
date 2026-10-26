# 建筑信息图插画优雅

Community prompt · 多文字海报
Language: zh · Domains: data, history · Source: K01

Source page: https://github.com/BaYue-SYJ/shuixian-prompts

Picture: https://r2.qqsrc.com/images/originals/13494.jpg

```
{
  "type": "信息图时间轴",
  "style": {
    "background": "{argument name=\"background style\" default=\"纹理米色宣纸\"}",
    "art_style": "{argument name=\"art style\" default=\"传统中国水墨画风格\"}"
  },
  "header": {
    "title": "{argument name=\"main title\" default=\"中国历史朝代图\"}",
    "subtitle": "{argument name=\"subtitle\" default=\"华夏文明·源远流长\"}",
    "elements": ["红色书法标题", "右上角红色方形印章", "祥云纹饰"]
  },
  "layout": {
    "sections_count": 4,
    "sections": [
      {
        "id": "1",
        "label": "壹 先秦时期",
        "date_range": "(约前 2070 年—前 221 年)",
        "description": "华夏起源，诸侯纷争，百家争鸣。",
        "timeline_nodes": 4,
        "dynasties": ["夏", "商", "西周", "东周"],
        "illustrations": ["手持竹简的学者", "青铜鼎", "青铜礼器", "马车", "竹简与毛笔"]
      },
      {
        "id": "2",
        "label": "贰 秦汉三国",
        "date_range": "(前 221 年—280 年)",
        "description": "大一统时代，开疆拓土，英雄辈出。",
        "timeline_nodes": 3,
        "dynasties": ["秦", "汉", "三国"],
        "illustrations": ["兵马俑", "骑马的骑兵", "三位身着传统盔甲的将军"]
      },
      {
        "id": "3",
        "label": "叁 两晋南北朝 隋唐五代",
        "date_range": "(280 年—960 年)",
        "description": "分裂与融合并存，盛世辉煌，文化鼎盛。",
        "timeline_nodes": 5,
        "dynasties": ["两晋", "南北朝", "隋", "唐", "五代十国"],
        "illustrations": ["饮酒的学者", "坐佛像", "带船的拱形石桥", "优雅的唐代仕女", "持旗骑兵"]
      },
      {
        "id": "4",
        "label": "肆 宋元明清",
        "date_range": "(960 年—1912 年)",
        "description": "经济繁荣，民族融合，走向近代。",
        "timeline_nodes": 4,
        "dynasties": ["宋", "元", "明", "清"],
        "illustrations": ["繁华的河畔城镇景观", "回身射箭的骑射手", "宫殿建筑群", "清代官员"]
      }
    ]
  },
  "footer": {
    "quote": "{argument name=\"bottom quote\" default=\"以史为鉴，可以知兴替；以人为镜，可以明得失。\"}",
    "decorations": ["左下角竹叶", "右下角长城插画"]
  }
}
```

Creator's prompt, collected for private study. Ask before republishing.
