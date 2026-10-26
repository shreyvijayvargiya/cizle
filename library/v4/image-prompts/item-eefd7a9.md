# 中文语文教材页面排版

Community prompt · 手写体
Language: en · Domains: education, edtech, history · Source: K01

Source page: https://github.com/BaYue-SYJ/shuixian-prompts

Picture: https://r2.qqsrc.com/images/originals/13749.jpg

```
{
  "type": "教育教材页面排版",
  "style": "简洁排版，中国传统美学，柔和米色背景",
  "header": {
    "tag": "第六单元 · 古代文言文",
    "title": "{argument name=\"main title\" default=\"出师表\"}",
    "author": "{argument name=\"author info\" default=\"诸葛亮 〔三国 · 蜀汉〕\"}"
  },
  "layout": {
    "sections": [
      {
        "title": "学习目标",
        "position": "右上角方框",
        "count": 3,
        "description": "带有柔和红色背景的编号学习目标"
      },
      {
        "title": "课文",
        "position": "左侧主栏",
        "count": 6,
        "description": "包含 14 个上标注释编号的古文段落"
      },
      {
        "title": "注释",
        "position": "插图下方右侧方框",
        "count": 14,
        "description": "与文中上标对应的编号词汇解释"
      },
      {
        "title": "思考探究",
        "position": "左下角",
        "count": 2,
        "description": "编号讨论题"
      }
    ],
    "illustration": {
      "position": "中右侧",
      "description": "{argument name=\"illustration subject\" default=\"诸葛亮手持羽扇，立于汉军旗前，水墨画风格\"}"
    },
    "footer": {
      "page_number": "102",
      "book_info": "{argument name=\"textbook info\" default=\"语文 九年级 上册\"}"
    }
  }
}
```

Creator's prompt, collected for private study. Ask before republishing.
