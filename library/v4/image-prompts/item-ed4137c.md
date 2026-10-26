# 猫信息图海报

Community prompt · 人or物拆解
Language: en · Domains: data, education · Source: K01

Source page: https://github.com/BaYue-SYJ/shuixian-prompts

Picture: https://r2.qqsrc.com/images/originals/13899.jpg

```
{
  "type": "infographic chart",
  "header": {
    "title": "{argument name=\"main title\" default=\"猫咪全品种科普图鉴\"}",
    "subtitle": "{argument name=\"subtitle\" default=\"涵盖全球所有猫咪品种 | 名称 & 性格特点\"}",
    "decorations": "paw print icons"
  },
  "layout": {
    "style": "grid-based encyclopedia poster, pastel color-coded sections",
    "sections": [
      {
        "title": "{argument name=\"section 1 title\" default=\"短毛猫\"}",
        "color": "pastel green",
        "layout": "2 rows of 9 columns",
        "count": 18,
        "item_format": "breed name above, realistic cat portrait, personality description below"
      },
      {
        "title": "{argument name=\"section 2 title\" default=\"长毛猫\"}",
        "color": "pastel pink",
        "layout": "2 rows of 9 columns",
        "count": 18,
        "item_format": "breed name above, realistic cat portrait, personality description below"
      },
      {
        "title": "稀有及特色猫",
        "color": "pastel orange",
        "layout": "2 rows of 9 columns",
        "count": 18,
        "item_format": "breed name above, realistic cat portrait, personality description below"
      },
      {
        "title": "无毛及卷毛猫",
        "color": "pastel blue",
        "layout": "1 row of 9 columns",
        "count": 9,
        "item_format": "breed name above, realistic cat portrait, personality description below"
      }
    ]
  },
  "footer": {
    "left_section": {
      "title": "{argument name=\"footer tips title\" default=\"小贴士:\"}",
      "content": "3 numbered bullet points"
    },
    "right_section": {
      "title": "图例说明:",
      "content": "color legend with 4 items matching main sections"
    }
  }
}
```

Creator's prompt, collected for private study. Ask before republishing.
