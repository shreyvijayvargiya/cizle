# 女性UI包装室内

Community prompt · 直播画面
Language: zh · Domains: general · Source: K01

Source page: https://github.com/BaYue-SYJ/shuixian-prompts

Picture: https://r2.qqsrc.com/images/originals/13790.jpg

```
{
  "type": "移动端直播 UI 原型图",
  "subject": {
    "description": "年轻亚裔女性，身着浅桃色传统汉服，带有花卉刺绣，佩戴饰有粉色花朵的华丽金饰与珍珠发簪，面带微笑，注视镜头，手持一罐圆形花茶",
    "foreground_objects": {
      "count": 5,
      "items": [
        "主播手持的圆罐",
        "桌上的圆罐",
        "桌上的长方形礼盒",
        "打开的罐子，内含干茶叶",
        "盛有盛开粉色花朵的透明玻璃茶杯"
      ],
      "labels": ["牡丹花茶"]
    },
    "background": "中式传统室内环境，暖色灯光，木质格栅屏风，粉色花枝"
  },
  "ui_layout": {
    "top_bar": {
      "elements": ["19:37", "信号栏", "WiFi", "电池"]
    },
    "top_left": {
      "host_info": {
        "name": "{argument name=\"host name\" default=\"小雅国风严选\"}",
        "stats": "83.0万本场点赞",
        "button": "关注"
      },
      "badges": ["带货榜", "人气榜"],
      "promo_banner": "领券下单更优惠 点击领取"
    },
    "top_right": {
      "viewers": {
        "count": 3,
        "text": "10万+",
        "close_button": "X"
      },
      "links": ["更多直播 >"],
      "event_banner": {
        "title": "{argument name=\"event banner text\" default=\"抖音618好物节\"}",
        "dates": "5.24-6.18"
      }
    },
    "mid_left_events": {
      "gift_count": 2,
      "gifts": [
        {"user": "可乐", "action": "送小心心", "combo": "x 16"},
        {"user": "安安", "action": "送人气票", "combo": "x 21"}
      ],
      "join_notification": "加入了直播间"
    },
    "bottom_left_chat": {
      "message_count": 5,
      "messages": [
        "{argument name=\"chat message\" default=\"主播这款花茶喝了美容养颜吗？\"}",
        "包装也太好看了吧！",
        "拍了2号链接，期待发货~",
        "主播讲讲功效呗",
        "已经回购三次了，味道很正！"
      ]
    },
    "bottom_product_card": {
      "title": "小雅严选 {argument name=\"product name\" default=\"牡丹花茶\"}礼盒装",
      "guarantee": "坏损包退 7天无理由退货",
      "price": "{argument name=\"product price\" default=\"¥ 89.9\"}",
      "button": "抢"
    },
    "bottom_nav_bar": {
      "input_placeholder": "说点什么...",
      "icons_count": 5,
      "icons": ["笑脸", "购物车", "礼物", "爱心", "更多选项"]
    }
  }
}
```

Creator's prompt, collected for private study. Ask before republishing.
