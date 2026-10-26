# 角色暗黑夜景

Community prompt · 角色板or三视图
Language: en · Domains: music, nature · Source: K01

Source page: https://github.com/BaYue-SYJ/shuixian-prompts

Picture: https://r2.qqsrc.com/images/originals/14210.jpg

```
{
  "type": "音乐杂志艺人传记页面",
  "theme": "暗黑颓废摇滚美学，深色背景配以微妙的舞台灯光",
  "header": {
    "left": "摇滚新世代",
    "right": "MUSIC EDGE VOL.186 2025 年 6 月刊"
  },
  "character": {
    "name": "{argument name=\"character name\" default=\"夜坂瑠璃\"}",
    "romaji": "Yosaka Ruri",
    "role": "主唱 & 贝斯手",
    "band": "{argument name=\"band name\" default=\"Rusted Chrome\"}",
    "appearance": {
      "hair": "{argument name=\"hair color\" default=\"黑色\"} 波波头",
      "eyes": "红色",
      "outfit": "黑色连帽衫、红黑条纹衬衫、红黑格纹短裙、带有星月图案的渔网袜、黑色靴子、颈圈",
      "instrument": "{argument name=\"instrument\" default=\"黑色贝斯吉他\"}"
    }
  },
  "layout": {
    "centerpiece": "角色手持贝斯吉他站在舞台上的全身肖像",
    "top_right_insets": {
      "count": 2,
      "descriptions": ["角色对着麦克风歌唱", "角色在舞台上演奏贝斯"]
    },
    "quote": "{argument name=\"quote text\" default=\"言葉にしきれない感情は、服と音でなら表現できる気がする。\"}",
    "sections": [
      {
        "title": "个人档案",
        "position": "左上",
        "content_type": "个人资料文本列表"
      },
      {
        "title": "关于瑠璃",
        "position": "左中",
        "content_type": "文本描述",
        "inset_images": {
          "count": 3,
          "descriptions": ["颈圈与条纹衬衫特写", "格纹短裙与渔网袜特写", "黑色靴子特写"]
        }
      },
      {
        "title": "性格",
        "position": "左下",
        "content_type": "项目符号文本列表"
      },
      {
        "title": "时尚风格",
        "position": "左下",
        "content_type": "文本描述"
      },
      {
        "title": "表情与神态",
        "position": "右中",
        "count": 4,
        "labels": ["通常", "照れ", "集中", "微笑み"]
      },
      {
        "title": "故事",
        "position": "中下",
        "content_type": "长文本段落"
      },
      {
        "title": "音乐根源",
        "position": "右中",
        "content_type": "带有乐队现场剪影插图的文本"
      },
      {
        "title": "人际关系",
        "position": "右下",
        "content_type": "带有 2 张剪影插图（女孩交谈与舞台乐队）的文本"
      },
      {
        "title": "唱片目录",
        "position": "中下",
        "count": 3,
        "labels": ["1st 单曲 Digital Ghost", "2nd 单曲 Static Sea", "3rd 单曲 Imitation Arrow"],
        "inset_images": {
          "count": 3,
          "descriptions": ["黄昏时的城市景观", "深邃海洋", "抽象光束"]
        }
      },
      {
        "title": "梦想与目标",
        "position": "右下",
        "content_type": "带有手写签名“Ruri”和猫咪图标的项目符号文本列表"
      }
    ]
  }
}
```

Creator's prompt, collected for private study. Ask before republishing.
