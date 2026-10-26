# 人像信息图插画优雅

Community prompt · 人or物拆解
Language: zh · Domains: data · Source: K01

Source page: https://github.com/BaYue-SYJ/shuixian-prompts

Picture: https://r2.qqsrc.com/images/originals/14175.jpg

```
{
  "type": "{argument name=\"aesthetic\" default=\"优雅的博物馆级信息图\"}",
  "theme": "中国传统服饰指南",
  "header": {
    "title": "{argument name=\"main title\" default=\"魏晋杂裾垂髾服图鉴\"}",
    "subtitle": "形制、层次与魏晋风度",
    "description": "关于服饰优雅飘逸特质的介绍性段落。"
  },
  "centerpiece": {
    "subject": "{argument name=\"subject\" default=\"中国年轻女性\"}",
    "clothing": "{argument name=\"clothing style\" default=\"魏晋时期层叠飘逸的袍服\"}",
    "colors": "{argument name=\"primary color\" default=\"丁香紫与淡蓝色\"}",
    "pose": "姿态优雅，双手交叠于腰间，全身肖像",
    "details": "精致的发饰、飘逸的垂带、多层裙摆"
  },
  "layout": {
    "left_column": {
      "title": "结构解析 (自上而下)",
      "count": 8,
      "format": "小方形缩略图配以粗体标签和描述性文字",
      "labels": ["发髻与步摇", "交领上襦", "大袖", "杂裾", "垂髾", "腰系", "裙摆层次", "丝履"]
    },
    "top_right": {
      "title": "材质与工艺",
      "count": 4,
      "format": "带有标签和文字的面料质感样本",
      "labels": ["纱", "罗", "绢", "轻锦"]
    },
    "middle_right": {
      "title": "纹样、色彩与寓意",
      "patterns": {
        "count": 4,
        "format": "带有标签的圆形纹样样本",
        "labels": ["卷草纹", "云纹", "连珠纹", "羽纹"]
      },
      "colors": {
        "count": 5,
        "format": "带有名称和描述的矩形色块样本",
        "labels": ["月白", "浅紫", "烟青", "藕荷", "淡赭"]
      }
    },
    "bottom_left": {
      "title": "穿着顺序 (由内而外)",
      "count": 6,
      "format": "由向右箭头连接的服饰插图",
      "labels": ["中衣", "上襦", "杂裾垂髾外层", "腰系", "鞋履", "发饰"]
    },
    "bottom_right": {
      "title": "魏晋杂裾垂髾服核心特征",
      "count": 5,
      "format": "项目符号文本列表",
      "illustration": "右下角的小型飞鹤图案"
    }
  },
  "background": "带有细微边框线的纹理质感浅米色羊皮纸"
}
```

Creator's prompt, collected for private study. Ask before republishing.
