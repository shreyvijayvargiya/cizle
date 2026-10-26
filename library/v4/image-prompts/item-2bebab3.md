# 角色动漫城市咖啡馆

Community prompt · 角色板or三视图
Language: en · Domains: entertainment · Source: K01

Source page: https://github.com/BaYue-SYJ/shuixian-prompts

Picture: https://r2.qqsrc.com/images/originals/13740.jpg

```
{
  "type": "动漫角色设定集",
  "header": {
    "title": "{argument name=\"character name\" default=\"SHIBUYA SHION\"}",
    "subtitle": "渋谷 紫音",
    "description": "以城市为舞台的 20 岁城市探险家 / 图形艺术家。",
    "top_right_text": "{argument name=\"main title\" default=\"设定画 SETTEI GA\"}"
  },
  "character": {
    "hair": "{argument name=\"hair color\" default=\"深紫色，发梢为浅紫色\"}",
    "eyes": "{argument name=\"eye color\" default=\"紫色\"}",
    "outfit": "{argument name=\"outfit\" default=\"浅紫色连帽衫、牛仔短裤、黑色高帮运动鞋、黑色双肩包\"}"
  },
  "layout": {
    "centerpiece": {
      "count": 3,
      "labels": ["正面", "侧面", "背面"],
      "description": "全身站立姿势"
    },
    "left_column": [
      {
        "title": "面部特写",
        "count": 1
      },
      {
        "title": "表情",
        "count": 3,
        "labels": ["正常", "微笑", "严肃"]
      },
      {
        "title": "个人资料",
        "type": "text_box",
        "content_fields": ["年龄：20 岁", "职业：城市探险家／图形艺术家", "基地：涩谷", "性格：好奇心旺盛、冷静、意外地好相处", "爱好：摄影、素描、城市漫步、咖啡馆巡礼"]
      }
    ],
    "right_column": [
      {
        "title": "细节",
        "items": [
          {
            "subtitle": "连帽衫",
            "count": 2,
            "labels": ["连帽衫 (前)", "连帽衫 (后)"]
          },
          {
            "subtitle": "双肩包",
            "count": 3,
            "labels": ["正面", "侧面", "背面"]
          },
          {
            "subtitle": "鞋子",
            "count": 4,
            "labels": ["顶面", "侧面", "侧面", "底面"]
          },
          {
            "subtitle": "配饰",
            "count": 2,
            "labels": ["耳环 (双耳)", "双肩包拉链头"]
          }
        ]
      }
    ],
    "bottom_section": [
      {
        "title": "设定备注",
        "type": "text_box",
        "description": "带有签名 'Shion' 的手写背景故事段落"
      },
      {
        "title": "配色方案",
        "count": 8,
        "labels": ["头发", "发色挑染", "眼睛", "连帽衫", "牛仔", "鞋子/包", "皮肤", "金属"]
      },
      {
        "title": "信息栏",
        "type": "text_box",
        "content_fields": ["姓名: SHIBUYA SHION", "年龄: 20", "身高: 160cm", "生日: 7/12", "项目: SHIBUYA ARTIST", "日期: 2025 年 12 月"]
      }
    ]
  }
}
```

Creator's prompt, collected for private study. Ask before republishing.
