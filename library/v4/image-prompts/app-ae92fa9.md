# 女性涂鸦App温暖

Community prompt · 直播画面
Language: en · Domains: general · Source: K01

Source page: https://github.com/BaYue-SYJ/shuixian-prompts

Picture: https://r2.qqsrc.com/images/originals/13847.jpg

```
{
  "type": "手机直播 App 界面模型",
  "subject": {
    "description": "{argument name=\"broadcaster appearance\" default=\"一位留着黑色长发、身穿白色荷叶边上衣的年轻亚裔女性\"}",
    "action": "手持一张写有手写文字和涂鸦爱心的白纸标语牌",
    "sign_text": "{argument name=\"sign text\" default=\"谢谢 Gorden Sun 的大火箭！\"}",
    "background": "温馨的房间，配有泰迪熊、相框和架子上温暖发光的台灯，右侧可见麦克风"
  },
  "ui_layout": {
    "top_bar": {
      "left": {
        "broadcaster_info": {
          "name": "{argument name=\"broadcaster name\" default=\"小甜心✨\"}",
          "stats": "28.6 万本场点赞",
          "button": "关注",
          "rank_badge": "小时榜第 3 名"
        }
      },
      "right": {
        "viewers": {
          "avatars_count": 3,
          "total_count": "1.2 万"
        },
        "controls": [
          "关闭按钮",
          "更多直播 >",
          "礼物展馆 24/28"
        ]
      }
    },
    "mid_screen": {
      "gift_notification_banner": {
        "sender": "{argument name=\"gift sender name\" default=\"Gorden Sun\"}",
        "action": "送了",
        "gift": "{argument name=\"gift name\" default=\"大火箭\"}",
        "quantity": "x1",
        "icon": "火箭"
      }
    },
    "bottom_area": {
      "chat_overlay": {
        "message_count": 7,
        "messages": [
          "Gorden Sun 送出大火箭 🚀 x1",
          "小飞侠: 哇哦，大火箭！",
          "甜甜圈: 主播好美呀～",
          "爱你呦: 666666",
          "一路向北: 支持支持！",
          "粉红色的回忆: 主播棒棒哒～",
          "用户12345678910 关注了主播"
        ]
      },
      "interaction_bar": {
        "input_placeholder": "说点什么...",
        "icons_count": 5,
        "icons": [
          "笑脸",
          "链接",
          "爱心",
          "礼盒",
          "三个点"
        ]
      },
      "floating_animation": "右下角一串彩色漂浮的爱心"
    }
  }
}
```

Creator's prompt, collected for private study. Ask before republishing.
