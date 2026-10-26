# 人像信息图优雅

Community prompt · 人or物拆解
Language: zh · Domains: data · Source: K01

Source page: https://github.com/BaYue-SYJ/shuixian-prompts

Picture: https://r2.qqsrc.com/images/originals/14172.jpg

```
{
  "type": "7 天时尚穿搭指南信息图",
  "header": {
    "title": "{argument name=\"main title\" default=\"一周穿搭指南\"}",
    "subtitle": "{argument name=\"style keywords\" default=\"温柔 | 靓丽 | 优雅\"}",
    "slogan_cn": "优雅不设限，自信每一天",
    "slogan_en": "{argument name=\"english slogan\" default=\"ELEGANCE HAS NO LIMIT, BE CONFIDENT EVERY DAY\"}"
  },
  "subject": "{argument name=\"subject description\" default=\"年轻优雅的亚洲女性\"}",
  "layout": {
    "columns": 7,
    "column_elements": [
      "日期标题",
      "主视觉人像",
      "4 个细节缩略图",
      "穿搭规格",
      "关键词与配色",
      "3 个色块",
      "星级评分",
      "面料与价格",
      "4 季图标"
    ],
    "days": [
      { "day": "周一 (MONDAY)", "outfit": "米色西装套装", "scene": "场景：重要会议 / 正式商务" },
      { "day": "周二 (TUESDAY)", "outfit": "粉色西装套装", "scene": "场景：日常通勤" },
      { "day": "周三 (WEDNESDAY)", "outfit": "奶油色针织开衫套装", "scene": "场景：生活休闲" },
      { "day": "周四 (THURSDAY)", "outfit": "香槟色吊带裙", "scene": "场景：外出私会" },
      { "day": "周五 (FRIDAY)", "outfit": "蓝色针织上衣，白色半身裙", "scene": "场景：休闲社交" },
      { "day": "周六 (SATURDAY)", "outfit": "白色运动内衣，紫色紧身裤", "scene": "场景：运动休闲" },
      { "day": "周日 (SUNDAY)", "outfit": "米色居家针织套装", "scene": "场景：居家 / 约会" }
    ]
  },
  "footer": {
    "tips": "{argument name=\"footer tips\" default=\"Tips: 根据天气与场合灵活调整，配饰是提升整体造型的关键；保持自信与舒适，才是穿搭的最终目的。\"}",
    "legend": [
      "春: 春季适用",
      "夏: 夏季适用",
      "秋: 秋季适用",
      "冬: 冬季适用"
    ]
  }
}
```

Creator's prompt, collected for private study. Ask before republishing.
