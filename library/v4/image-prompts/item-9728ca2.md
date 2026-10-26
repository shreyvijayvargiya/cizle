# 龙动漫冷调

Community prompt · 角色板or三视图
Language: en · Domains: entertainment · Source: K01

Source page: https://github.com/BaYue-SYJ/shuixian-prompts

Picture: https://r2.qqsrc.com/images/originals/13969.jpg

```
{
  "type": "动漫角色设定集",
  "character": {
    "description": "年轻男子，{argument name=\"hair color\" default=\"浅蓝色\"} 长发高马尾，表情冷静",
    "outfit": "{argument name=\"outfit style\" default=\"蓝色和服配金色龙纹刺绣及白色羽织\"}"
  },
  "layout": {
    "header": {
      "title": "{argument name=\"character title\" default=\"青龙装束的青年\"}",
      "subtitle": "角色三面图・设定资料",
      "info_box": {
        "labels": ["姓名：", "设定：", "身高：{argument name=\"height\" default=\"178cm\"}", "年龄：20岁左右", "主题：{argument name=\"motif\" default=\"青龙\"}・和装"]
      }
    },
    "main_views": {
      "count": 3,
      "poses": ["正面", "侧面", "背面"],
      "labels": ["正面", "侧面", "背面"]
    },
    "sidebar_right": {
      "expressions": {
        "title": "表情集",
        "count": 4,
        "labels": ["通常", "微笑", "冷静", "思考"]
      },
      "details": {
        "title": "细节・装饰",
        "count": 4,
        "labels": ["家纹装饰金属件", "胸前组纽与流苏", "和服青龙刺绣", "背面家纹"]
      }
    },
    "footer": {
      "memo": {
        "title": "角色设定备注",
        "bullet_points_count": 3
      },
      "color_palette": {
        "title": "配色方案",
        "count": 6,
        "labels": ["头发", "眼睛", "和服", "羽织", "点缀色・刺绣", "腰带・组纽"]
      }
    }
  }
}
```

Creator's prompt, collected for private study. Ask before republishing.
