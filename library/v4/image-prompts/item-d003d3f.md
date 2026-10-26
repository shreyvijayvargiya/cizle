# 角色动漫城堡

Community prompt · 角色板or三视图
Language: en · Domains: entertainment · Source: K01

Source page: https://github.com/BaYue-SYJ/shuixian-prompts

Picture: https://r2.qqsrc.com/images/originals/14200.jpg

```
{
  "type": "动漫角色设定集",
  "character": {
    "name": "{argument name=\"character name\" default=\"真田大助\"}",
    "appearance": "长发棕色的年轻武士，身着武士风格盔甲，{argument name=\"main color\" default=\"红色\"} 胸甲与护具，{argument name=\"secondary color\" default=\"海军蓝\"} 百褶袴，白色短披风"
  },
  "layout": {
    "header": {
      "title": "{argument name=\"character name\" default=\"真田大助\"}",
      "subtitle": "{argument name=\"character concept\" default=\"以战国时代为背景的故事主角。日英混血的年轻武将。\"}",
      "badge": "设定资料"
    },
    "right_side": {
      "main_portrait": "大型全身站立姿势，自信的微笑",
      "background_elements": {
        "emblem": "六文钱家纹",
        "quote": "{argument name=\"catchphrase\" default=\"守护这个国家。带着这份骄傲。\"}",
        "scenery": "右下角为单色调的日本城堡与军队旗帜"
      }
    },
    "sections": [
      {
        "title": "个人资料",
        "position": "top-left",
        "content": "包含 6 行描述性文字的表格"
      },
      {
        "title": "三面图",
        "position": "mid-left",
        "count": 3,
        "labels": ["正面", "侧面", "背面"]
      },
      {
        "title": "表情差分",
        "position": "top-center",
        "count": 6,
        "labels": ["通常", "微笑", "认真", "愤怒", "惊讶", "思考"]
      },
      {
        "title": "服装与装备细节",
        "position": "bottom-left",
        "count": 9,
        "labels": ["胸甲", "肩甲", "腕甲(笼手)", "腿甲(胫当・膝当)", "皮靴", "白披风(短)", "腰带", "袴/和服部分", "打刀"]
      },
      {
        "title": "配色方案",
        "position": "bottom-center",
        "count": 8,
        "labels": ["真田红", "浓蓝", "金", "白", "棕", "茶褐色", "肤色", "银"]
      },
      {
        "title": "世界观",
        "position": "bottom-center-right",
        "content": "描述背景设定的段落文字"
      }
    ]
  }
}
```

Creator's prompt, collected for private study. Ask before republishing.
