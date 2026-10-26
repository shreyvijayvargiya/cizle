# 女性App温柔

Community prompt · 直播画面
Language: en · Domains: nature · Source: K01

Source page: https://github.com/BaYue-SYJ/shuixian-prompts

Picture: https://r2.qqsrc.com/images/originals/13843.jpg

```
{
  "type": "移动端直播 App 界面模型",
  "video_feed": {
    "subject": "{argument name=\"host appearance\" default=\"年轻亚裔女性，长黑发，白色蕾丝上衣，单手托腮，温柔微笑\"}",
    "background": "温馨的房间，带有动物抱枕的沙发，摆放着写有 'FLOWER' 相框的架子，花瓶里插着粉色玫瑰，暖色调灯光"
  },
  "ui_overlay": {
    "status_bar": {
      "elements": ["20:34", "定位图标", "信号栏", "WiFi", "电量 78%"]
    },
    "top_header": {
      "host_info": {
        "name": "{argument name=\"host name\" default=\"小鹿酱💕\"}",
        "subtitle": "12.8 万本场点赞",
        "button": "关注"
      },
      "top_viewers_count": 3,
      "top_viewers_labels": ["1.2w", "9800", "8700"],
      "total_viewers": "1.9 万",
      "close_button": "X"
    },
    "badges_and_prompts": {
      "top_left_count": 2,
      "top_left_labels": ["小时榜第 3 名", "人气榜"],
      "top_right_count": 2,
      "top_right_labels": ["更多直播 >", "许下心愿，一起完成任务"]
    },
    "gift_notifications": {
      "count": 2,
      "items": [
        { "user": "@阿飞", "action": "送小心心", "multiplier": "{argument name=\"gift multiplier\" default=\"x 66\"}" },
        { "user": "向阳而生", "action": "送鲜花", "multiplier": "x 10" }
      ]
    },
    "chat_stream": {
      "count": 7,
      "messages": [
        "甜甜 加入了直播间",
        "尼古拉斯: {argument name=\"chat message 1\" default=\"主播今天好美呀～\"}",
        "小心心: {argument name=\"chat message 2\" default=\"唱一首歌吧，想听你唱歌～\"}",
        "一只小鹿: 支持支持，天天看你直播 😘",
        "快乐每一天: 人美心善，说话又好听！",
        "小可爱: 主播粉丝团怎么加入呀？",
        "系统: 直播内容严禁违规，文明直播，一起营造良好的直播环境。"
      ]
    },
    "bottom_bar": {
      "input_placeholder": "说点什么...",
      "icon_count": 5,
      "icons": ["笑脸", "粉色爱心", "礼盒", "三个点", "柱状图"],
      "floating_elements": "右侧飘起的粉色和蓝色爱心"
    }
  }
}
```

Creator's prompt, collected for private study. Ask before republishing.
