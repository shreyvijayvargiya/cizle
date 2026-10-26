# 角色动漫复古温柔

Community prompt · 角色板or三视图
Language: zh · Domains: entertainment · Source: K01

Source page: https://github.com/BaYue-SYJ/shuixian-prompts

Picture: https://r2.qqsrc.com/images/originals/13935.jpg

```
{
  "type": "动漫角色参考图",
  "character": {
    "hair": "{argument name=\"发色\" default=\"金色\"}",
    "eyes": "{argument name=\"眼睛颜色\" default=\"蓝色\"}",
    "outfit": "{argument name=\"制服风格\" default=\"带白色饰边的军装风格连衣裙\"}",
    "main_color": "{argument name=\"制服主色调\" default=\"蓝色\"}"
  },
  "layout": {
    "top_section": {
      "description": "全身三视图",
      "count": 3,
      "views": ["正面", "侧面", "背面"]
    },
    "bottom_left_top": {
      "description": "面部表情",
      "count": 6,
      "expressions": ["中性", "眨眼微笑", "张嘴笑", "浅笑", "害羞", "温柔微笑"]
    },
    "bottom_left_bottom": {
      "description": "配饰与细节",
      "count": 5,
      "items": ["贝雷帽", "带有黑色连裤袜和蓝色鱼鳍装饰高跟鞋的腿部", "蓝白相间的蝴蝶结", "制服上衣躯干", "手套一对"]
    },
    "bottom_right_top": {
      "description": "服装拆解",
      "count": 3,
      "items": ["外套正面与荷叶边裙摆", "夹克背面", "裙子背面"]
    },
    "bottom_right_middle": {
      "description": "额外细节与配色方案",
      "items": ["蓝色高跟鞋一对", "单只手套"],
      "color_palette_count": 8
    },
    "bottom_right_bottom": {
      "description": "文本框",
      "label": "设定与备注"
    }
  },
  "style": "简洁的动漫艺术风格，白色背景配以细微的水平线，装饰性复古边框"
}
```

Creator's prompt, collected for private study. Ask before republishing.
