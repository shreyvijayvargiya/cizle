# 气泡饮料广告横幅

Community prompt · 饮料甜品海报
Language: ja · Domains: product · Source: K01

Source page: https://github.com/BaYue-SYJ/shuixian-prompts

Picture: https://r2.qqsrc.com/images/twitter/2a24f29f-48fe-415f-8a4b-dffa0b96bfa7_0.jpg

```
{
  "type": "饮料广告横幅",
  "visuals": {
    "model": "年轻亚洲女性，湿发贴在脸上，皮肤上有水珠，{argument name=\\"model pose\\" default=\\"闭眼，脸部向上倾斜，表情宁静\\"}，身穿白色上衣",
    "product": "带有冷凝水的白黄色铝罐，印有 {argument name=\\"fruit type\\" default=\\"柚子\\"} 图案及叶片",
    "props": "2 个新鲜柚子及绿叶放置在罐子旁边",
    "background": "{argument name=\\"background scene\\" default=\\"明亮的蓝天，漂浮着失焦的水滴和灿烂的阳光\\"}"
  },
  "layout": {
    "sections": [
      {
        "title": "左上角 Logo",
        "position": "top-left",
        "count": 1,
        "labels": ["KIRARA"]
      },
      {
        "title": "主文案",
        "position": "left",
        "count": 3,
        "labels": [
          "{argument name=\\"main headline\\" default=\\"ゆず香る、新しいわたし。\\"}",
          "がんばる日々に、やさしいごほうびを。",
          "Refresh!"
        ]
      },
      {
        "title": "右侧文案",
        "position": "mid-right",
        "count": 1,
        "labels": ["私を、ほどくひとしゅわ。"]
      },
      {
        "title": "徽章",
        "position": "various",
        "count": 2,
        "labels": [
          "NEW",
          "国産ゆず果汁 3%"
        ]
      },
      {
        "title": "底部横幅",
        "position": "bottom",
        "count": 4,
        "labels": [
          "{argument name=\\"product name\\" default=\\"YUZU SPARK\\"}",
          "ユズスパーク",
          "やさしさ弾ける、ゆずの微炭酸。",
          "数量限定発売中"
        ]
      }
    ]
  }
}
```

Creator's prompt, collected for private study. Ask before republishing.
