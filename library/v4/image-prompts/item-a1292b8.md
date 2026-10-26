# 人像海报复古优雅

Community prompt · 人or物拆解
Language: zh · Domains: history · Source: K01

Source page: https://github.com/BaYue-SYJ/shuixian-prompts

Picture: https://r2.qqsrc.com/images/originals/14189.jpg

```
{
  "type": "中国传统服饰图文海报",
  "header": {
    "main_title": "{argument name=\"main title\" default=\"宋制褙子襦裙图鉴\"}",
    "subtitle": "形制、材质与清雅风尚",
    "intro_text": "简短描述宋代服饰的历史背景与审美风格。"
  },
  "centerpiece": {
    "description": "一位年轻亚洲女性优雅站立、双手交叠的全身肖像。",
    "clothing": "{argument name=\"clothing style\" default=\"宋制褙子与襦裙，浅绿色外罩褙子，米色内搭襦裙\"}"
  },
  "layout": {
    "style": "博物馆展览指南，结构严谨，排版清晰",
    "background": "{argument name=\"background texture\" default=\"复古羊皮纸，米色\"}",
    "sections": [
      {
        "title": "结构解析 (自上而下)",
        "position": "左侧栏",
        "count": 8,
        "labels": ["发髻与簪花", "对襟褙子", "内搭上襦", "窄袖", "侧衩", "长裙 / 百迭裙", "衣缘", "鞋履"],
        "details": "带有文字说明和指向中心人物的指示线的缩略图。"
      },
      {
        "title": "材质与工艺",
        "position": "右上角",
        "count": 4,
        "labels": ["绢", "罗", "纱", "细麻"]
      },
      {
        "title": "纹样、色彩与寓意",
        "position": "中右侧",
        "count": 4,
        "labels": ["折枝花纹", "小团花纹", "如意纹", "暗花纹"],
        "details": "圆形纹样样本。"
      },
      {
        "title": "色彩体系",
        "position": "中右侧，纹样下方",
        "count": 5,
        "labels": ["月白", "茶色", "淡青", "藕灰", "豆绿"],
        "details": "矩形色块样本。"
      },
      {
        "title": "穿着顺序 (由内而外)",
        "position": "左下角",
        "count": 7,
        "labels": ["抹胸/中衣", "上襦", "长裙", "褙子", "系带", "鞋履", "发饰"],
        "details": "通过箭头连接的顺序服装插图。"
      },
      {
        "title": "宋制褙子襦裙核心特征",
        "position": "右下角",
        "count": 5,
        "details": "关于服饰特征的要点列表。"
      }
    ]
  }
}
```

Creator's prompt, collected for private study. Ask before republishing.
