# 少女品牌动漫

Community prompt · 角色板or三视图
Language: en · Domains: entertainment, product, data · Source: K01

Source page: https://github.com/BaYue-SYJ/shuixian-prompts

Picture: https://r2.qqsrc.com/images/originals/13950.jpg

```
{
  "type": "服装设计与缝纫纸样参考图",
  "header": {
    "title": "{argument name=\"brand name\" default=\"Lumière Noir\"}",
    "subtitle": "ルミエール・ノワール",
    "document_type": "{argument name=\"document title\" default=\"衣装型紙図\"}",
    "character_illustration": {
      "count": 2,
      "poses": ["正面视图", "背面视图"],
      "description": "身着 {argument name=\"outfit style\" default=\"带有白色夹克和格子裙的单色偶像制服\"} 的 {argument name=\"character type\" default=\"长发动漫少女\"}"
    },
    "size_chart": "6 项身体测量数据列表"
  },
  "layout": {
    "grid_sections": [
      {
        "id": "1",
        "title": "1. 夹克",
        "description": "带有测量线的夹克纸样部件",
        "piece_count": 8,
        "labels": ["前身片", "前身片 (里布)", "后身片", "后身片 (里布)", "袖子", "领子", "口袋", "口袋口布"]
      },
      {
        "id": "2",
        "title": "2. 马甲 (内搭)",
        "description": "格子马甲纸样部件",
        "piece_count": 2,
        "labels": ["前身片", "后身片"]
      },
      {
        "id": "3",
        "title": "3. 丝带领结",
        "description": "带有宝石的黑色丝带领结插图",
        "piece_count": 1
      },
      {
        "id": "4",
        "title": "4. 胸针/徽章底座",
        "description": "华丽的徽章插图",
        "text_detail": "{argument name=\"emblem initials\" default=\"LN\"}",
        "piece_count": 1
      },
      {
        "id": "5",
        "title": "5. 裙子 (四层蛋糕裙)",
        "description": "裙子纸样部件",
        "piece_count": 5,
        "labels": ["第一层", "第二层", "第三层", "第四层", "裙身 (里布)"]
      },
      {
        "id": "6",
        "title": "6. 袖口",
        "description": "袖口纸样部件",
        "piece_count": 3
      },
      {
        "id": "7",
        "title": "7. 花边袜",
        "description": "白色花边袜插图",
        "piece_count": 1
      },
      {
        "id": "8",
        "title": "8. 鞋子 (参考尺寸)",
        "description": "黑色绑带高跟鞋插图",
        "piece_count": 1
      }
    ],
    "bottom_sections": [
      {
        "title": "使用面料及配件",
        "description": "材料和配件清单",
        "elements": [
          {"type": "面料表格", "rows": 10},
          {"type": "配件清单", "items": 7}
        ]
      },
      {
        "title": "缝纫要点与成品展示",
        "description": "缝纫说明和成品照片",
        "elements": [
          {"type": "说明列表", "count": 6},
          {"type": "图示", "count": 2, "description": "接缝处理和衬布指南"},
          {"type": "人体模型照片", "count": 4, "poses": ["正面全身", "正面半身", "背面半身", "细节特写"]}
        ]
      }
    ]
  }
}
```

Creator's prompt, collected for private study. Ask before republishing.
