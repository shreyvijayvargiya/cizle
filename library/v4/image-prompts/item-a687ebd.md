# 人像插画海报复古优雅

Community prompt · 人or物拆解
Language: zh · Domains: data, history · Source: K01

Source page: https://github.com/BaYue-SYJ/shuixian-prompts

Picture: https://r2.qqsrc.com/images/originals/14184.jpg

```
{
  "type": "信息图海报",
  "style": "传统中式美学，优雅排版，细腻的水墨插画",
  "background": "{argument name=\"background style\" default=\"复古纹理纸张\"}",
  "header": {
    "main_title": "{argument name=\"main title\" default=\"唐制齐胸襦裙图鉴\"}",
    "subtitle": "形制、材质与盛唐审美",
    "intro_text": "描述历史意义的段落。"
  },
  "centerpiece": {
    "description": "身着 {argument name=\"garment style\" default=\"唐制齐胸襦裙\"} 的美丽年轻女性全身肖像",
    "details": "精致的高发髻配金簪，{argument name=\"main color\" default=\"石榴红\"} 花卉裙摆，{argument name=\"secondary color\" default=\"湖蓝\"} 轻盈披帛，神态安详。"
  },
  "layout": {
    "left_column": {
      "title": "结构解析 (自上而下)",
      "count": 8,
      "format": "带标题与描述的缩略图",
      "labels": ["发髻与花钿", "对襟襦", "齐胸长裙", "系带", "半臂", "披帛", "裙摆层次", "鞋履"]
    },
    "right_column": [
      {
        "title": "材质与工艺",
        "count": 4,
        "format": "带文字的垂直纹理样本",
        "labels": ["绫", "罗", "纱", "锦"]
      },
      {
        "title": "纹样、色彩与寓意",
        "count": 4,
        "format": "带文字的圆形纹样插图",
        "labels": ["团花纹", "宝相花纹", "忍冬纹", "联珠纹"]
      },
      {
        "title": "主色谱系",
        "count": 5,
        "format": "带文字的矩形色块",
        "labels": ["石榴红", "杏黄", "湖蓝", "藕粉", "金色"]
      }
    ],
    "bottom_section": [
      {
        "title": "穿着顺序 (由内而外)",
        "count": 7,
        "format": "由箭头连接的步骤式服饰插图",
        "labels": ["抹胸/内搭", "短襦", "齐胸裙", "半臂", "披帛", "鞋履", "发饰"]
      },
      {
        "title": "唐制齐胸襦裙核心特征",
        "count": 5,
        "format": "项目符号文本列表"
      }
    ]
  }
}
```

Creator's prompt, collected for private study. Ask before republishing.
