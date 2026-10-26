# 角色动漫赛博温柔

Community prompt · 角色板or三视图
Language: zh · Domains: scifi, engineering, entertainment · Source: K01

Source page: https://github.com/BaYue-SYJ/shuixian-prompts

Picture: https://r2.qqsrc.com/images/originals/13910.jpg

```
{
  "type": "动漫角色设计文档",
  "character": {
    "concept": "{argument name=\"character concept\" default=\"带有精灵耳的赛博格女仆\"}",
    "hair": "{argument name=\"hair color\" default=\"浅蓝色\"} 短波波头，配有发带",
    "eyes": "{argument name=\"eye color\" default=\"红色\"}",
    "outfit": "{argument name=\"outfit style\" default=\"黑白女仆装\"}",
    "features": "手臂和腿部的机械关节，赛博格颈部"
  },
  "layout": {
    "style": "简洁的技术蓝图风格，带有网格线和编号分区",
    "sections": [
      {
        "number": "01",
        "title": "三视图",
        "count": 3,
        "description": "全身视图：正面、侧面、背面"
      },
      {
        "number": "02",
        "title": "表情图表",
        "count": 5,
        "labels": ["中性", "温柔微笑", "略显忧伤", "专注 / 严肃", "轻微惊讶"]
      },
      {
        "number": "03",
        "title": "部件拆解",
        "count": 4,
        "components": [
          {"name": "女仆装", "labels": ["发带与丝带", "上层荷叶边", "肘部关节", "围裙", "裙摆层", "蕾丝 / 内衬裙"]},
          {"name": "手臂（右）", "labels": ["上臂面板", "肩部关节", "肘部关节", "前臂面板", "腕部关节", "手部单元"]},
          {"name": "颈部接口", "labels": ["赛博格脊柱连接器"]},
          {"name": "腿部（右）", "labels": ["大腿面板", "髋关节", "膝关节", "小腿面板", "踝关节", "足部单元"]}
        ]
      },
      {
        "number": "04",
        "title": "配色方案",
        "count": 8,
        "swatches": [
          {"label": "头发", "hex": "#87CEEB"},
          {"label": "眼睛", "hex": "#C62828"},
          {"label": "服装 - 黑色", "hex": "#1A1A1A"},
          {"label": "服装 - 白色", "hex": "#FFFFFF"},
          {"label": "蕾丝 / 荷叶边", "hex": "#E6E6EA"},
          {"label": "机械 - 白色", "hex": "#F2F4F7"},
          {"label": "机械 - 深色", "hex": "#121417"},
          {"label": "强调色（蓝色）", "hex": "#00BFFF"}
        ]
      },
      {
        "number": "05",
        "title": "世界观备注",
        "text": "{argument name=\"world note text\" default=\"一个伪装成女仆的赛博格维护单元。她居住在一座巨大的哥特式巨型建筑中，无休止地维护着被遗忘的建筑。尽管拥有机械身体，她仍保留着安静的情感和自主意识。\"}"
      }
    ]
  }
}
```

Creator's prompt, collected for private study. Ask before republishing.
