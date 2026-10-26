# 角色动漫

Community prompt · 角色板or三视图
Language: zh · Domains: entertainment · Source: K01

Source page: https://github.com/BaYue-SYJ/shuixian-prompts

Picture: https://r2.qqsrc.com/images/originals/13952.jpg

```
{
  "type": "四象限角色设计参考表",
  "style": "{argument name=\"art style\" default=\"动漫概念艺术，精细角色设计表\"}",
  "layout": {
    "structure": "2x2 网格",
    "quadrants": [
      {
        "position": "左上",
        "title": "{argument name=\"world title\" default=\"獣響界アルドラン - 兽响界 Aldran\"}",
        "sections": [
          { "name": "配色方案", "count": 5, "type": "色卡" },
          { "name": "身高比例", "count": 4, "type": "角色剪影" },
          { "name": "角色介绍", "count": 4, "type": "持武器肖像", "labels": ["HC-01 卡拉斯 (Karasu)", "HC-02 加尔德 (Gardo)", "HC-03 艾拉 (Aira)", "HC-04 希罗 (Shiro)"] },
          { "name": "表情", "count": 4, "type": "每位角色 3 种表情" },
          { "name": "身体细节", "count": 4, "type": "每位角色 3 处特写" },
          { "name": "队伍/装备", "count": 3, "type": "团队与装备插图" }
        ]
      },
      {
        "position": "右上",
        "title": "{argument name=\"character 1 name\" default=\"加尔德 (虎族)\"}",
        "description": "虎族重装战士",
        "sections": [
          { "name": "全身", "count": 3, "labels": ["全身 正面", "全身 背面", "全身 左侧面"] },
          { "name": "3/4 视图", "count": 1, "labels": ["三视图辅助 (斜前)"] },
          { "name": "表情", "count": 3, "labels": ["通常 (平常)", "战斗 (专注)", "罕见柔和 (信任)"] },
          { "name": "身体细节", "count": 2, "labels": ["耳朵形状与内侧毛色", "尾巴条纹图案"] },
          { "name": "装备细节", "count": 2, "labels": ["右肩甲细节", "右手护身符 / 手部特征"] },
          { "name": "武器", "count": 1, "labels": ["大剑“钢岚 (Kouran)”"] },
          { "name": "比例", "count": 1, "labels": ["比例尺对比"] }
        ]
      },
      {
        "position": "左下",
        "title": "{argument name=\"character 2 name\" default=\"希罗 (白狐族)\"}",
        "description": "白狐族法师",
        "sections": [
          { "name": "全身", "count": 3, "labels": ["全身 正面", "全身 背面", "全身 左侧面"] },
          { "name": "3/4 视图", "count": 1, "labels": ["三视图辅助 (斜前)"] },
          { "name": "表情", "count": 3, "labels": ["通常 (静谧)", "魔力集中时", "罕见微笑"] },
          { "name": "身体细节", "count": 2, "labels": ["尾巴布局", "耳朵形状"] },
          { "name": "装备细节", "count": 2, "labels": ["袖内封印纹样", "服装细节 / 足部"] },
          { "name": "武器", "count": 1, "labels": ["魔杖“灯魂杖 (Tokonjou)”"] },
          { "name": "比例", "count": 1, "labels": ["比例尺对比"] }
        ]
      },
      {
        "position": "右下",
        "title": "{argument name=\"character 3 name\" default=\"卡拉斯 (狼族)\"}",
        "description": "狼族主角",
        "sections": [
          { "name": "全身", "count": 3, "labels": ["全身 正面", "全身 背面", "全身 左侧面"] },
          { "name": "3/4 视图", "count": 1, "labels": ["三视图辅助 (斜前)"] },
          { "name": "表情", "count": 3, "labels": ["通常 (警惕)", "战斗专注", "罕见放松"] },
          { "name": "身体细节", "count": 2, "labels": ["耳朵活动状态", "尾尖纹理"] },
          { "name": "装备细节", "count": 3, "labels": ["旅行斗篷", "战斗姿态", "装备细节 / 靴底设计"] },
          { "name": "武器", "count": 1, "labels": ["武器“牙斩 (Kibakiri)”"] },
          { "name": "比例", "count": 1, "labels": ["比例尺对比"] }
        ]
      }
    ]
  }
}
```

Creator's prompt, collected for private study. Ask before republishing.
