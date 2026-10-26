# 角色动漫冷调

Community prompt · 角色板or三视图
Language: en · Domains: entertainment · Source: K01

Source page: https://github.com/BaYue-SYJ/shuixian-prompts

Picture: https://r2.qqsrc.com/images/originals/13934.jpg

```
{
  "type": "动漫角色设定集",
  "header": {
    "title": "角色设定资料",
    "character_name": "{argument name=\"character name\" default=\"夏洛特·福尔摩斯\"}",
    "english_name": "Charlotte Holmes"
  },
  "character_design": {
    "hair": "{argument name=\"hair color\" default=\"白色\"}，长发，黑色丝带发饰",
    "eyes": "{argument name=\"eye color\" default=\"蓝色\"}",
    "outfit": "{argument name=\"outfit description\" default=\"黑色长款大衣，带盘扣的白色马甲，黑色长裤，黑色靴子\"}"
  },
  "layout": {
    "left_column": [
      {
        "section": "表情与面部",
        "count": 3,
        "labels": ["通常", "微笑", "冷静·思考"]
      },
      {
        "section": "细节设计",
        "count": 6,
        "labels": ["领口与盘扣", "发饰（丝带）", "大衣：袖口", "大衣：背部腰带", "内搭（马甲）", "裤装与靴子"]
      },
      {
        "section": "配色方案",
        "count": 8,
        "labels": ["头发", "皮肤", "眼睛", "丝带", "大衣", "内搭", "盘扣与金属件", "裤子与靴子"],
        "includes": "十六进制颜色代码"
      },
      {
        "section": "角色备注",
        "content": "角色特征要点列表，身高 170 cm，年龄 20 多岁"
      }
    ],
    "right_main_area": {
      "section": "三视图",
      "background": "0 到 170 cm 的身高测量网格",
      "count": 3,
      "poses": ["正面", "侧面", "背面"]
    }
  }
}
```

Creator's prompt, collected for private study. Ask before republishing.
