# 角色动漫插画樱花山忧郁

Community prompt · 角色板or三视图
Language: zh · Domains: entertainment, nature · Source: K01

Source page: https://github.com/BaYue-SYJ/shuixian-prompts

Picture: https://r2.qqsrc.com/images/originals/13920.jpg

```
{
  "instruction": "以 REFERENCE_0 作为基础角色设计，在白色背景上生成一份综合性的多板块动漫角色设定集。提取并分离参考图中的服装、配饰和主题元素，以填充技术细节板块。",
  "type": "动漫角色设定集",
  "header": {
    "name": "{argument name=\"character name\" default=\"篝火 椿\"}",
    "furigana": "かがりび つばき",
    "tag": "CV : ───",
    "document_type": "设定资料",
    "quote": "{argument name=\"character quote\" default=\"「炎の如く咲き、椿の如く散る――その生き様こそが、我が道なり。」\"}",
    "icon": "黑色山茶花纹章"
  },
  "layout": {
    "sections": [
      {
        "title": "三面图 -正面・侧面・背面-",
        "position": "top-left",
        "description": "全身三面转面图",
        "count": 3,
        "labels": ["正面", "侧面", "背面"]
      },
      {
        "title": "表情变化",
        "position": "top-right",
        "description": "头部表情设定集",
        "count": 9,
        "labels": ["通常", "微笑", "愤怒", "悲伤", "惊讶", "战斗", "忧郁", "害羞", "闭眼"]
      },
      {
        "title": "服装细节",
        "position": "mid-left",
        "description": "服装组件的平铺布局",
        "count": 7,
        "labels": ["和服", "前", "后", "袖纹", "腰带", "足部", "草履", "足袋"]
      },
      {
        "title": "装备・小物",
        "position": "center",
        "description": "展示油纸伞的武器/道具细节",
        "count": 3,
        "labels": ["和伞（炎椿）", "正面", "侧面", "伞柄装饰"]
      },
      {
        "title": "主题・装饰",
        "position": "mid-right",
        "description": "独立的设计主题元素",
        "count": 3,
        "labels": ["山茶花", "火焰纹样", "羽翼纹样"]
      },
      {
        "title": "调色板",
        "position": "bottom-left",
        "description": "按行排列的色卡",
        "count": 20,
        "labels": ["头发", "瞳孔", "和服", "腰带・小物", "火焰"]
      },
      {
        "title": "世界观",
        "position": "bottom-center",
        "description": "包含夜间传统日式神社、樱花与火焰小型风景插画的背景设定文本块",
        "count": 1,
        "labels": ["{argument name=\"lore subtitle\" default=\"- 炎与华交织的日式幻想世界 -\"}"]
      },
      {
        "title": "家纹・符号",
        "position": "bottom-right",
        "description": "带有说明文字的独立家纹图案",
        "count": 1,
        "labels": ["椿纹"]
      }
    ]
  }
}
```

Creator's prompt, collected for private study. Ask before republishing.
