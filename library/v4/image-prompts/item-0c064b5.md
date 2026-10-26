# 少女信息图动漫海洋未来

Community prompt · 漫画
Language: en · Domains: entertainment, nature, data · Source: K01

Source page: https://github.com/BaYue-SYJ/shuixian-prompts

Picture: https://r2.qqsrc.com/images/originals/13611.jpg

```
{
  "type": "数字艺术创作流程信息图",
  "header": {
    "title": "{argument name=\"main title\" default=\"盛夏少女\"}",
    "subtitle": "湛蓝天空，闪烁光影。那一瞬间，成为永恒的回忆。",
    "process_label": "{argument name=\"process title\" default=\"制作工程\"}"
  },
  "centerpiece": {
    "description": "高质量的大幅动漫插画，描绘了 {argument name=\"character appearance\" default=\"一位留着飘逸蓝长发、戴着系有蓝色丝带草帽、身穿白色无袖夏装的动漫少女\"} 站在 {argument name=\"setting\" default=\"阳光明媚的海滩、波光粼粼的蓝色海洋、带有镜头光晕的晴朗天空\"} 前。"
  },
  "layout": {
    "left_column": {
      "count": 3,
      "steps": [
        { "label": "1 草图构图", "image_type": "粗略铅笔草图", "bullet_points": 3 },
        { "label": "2 线稿", "image_type": "干净的单色线稿", "bullet_points": 3 },
        { "label": "3 底色", "image_type": "平涂颜色", "extra_elements": "7 个圆形色卡", "bullet_points": 3 }
      ]
    },
    "bottom_row": {
      "count": 4,
      "steps": [
        { "label": "4 阴影", "image_type": "基础赛璐珞阴影", "bullet_points": 2 },
        { "label": "5 光影", "image_type": "添加光效和高光", "bullet_points": 2 },
        { "label": "6 细节刻画", "image_type": "精细细节渲染", "bullet_points": 2 },
        { "label": "7 特效添加", "image_type": "最终后期处理效果", "bullet_points": 3 }
      ]
    },
    "right_column": {
      "top_section": {
        "label": "完成",
        "image_type": "缩小的最终插画",
        "description_text": "2 行文字"
      },
      "focus_points": {
        "title": "核心要点",
        "count": 4,
        "items": [
          { "label": "光影表现", "image_crop": "镜头光晕与太阳", "description_text": "简短段落" },
          { "label": "瞳孔光泽", "image_crop": "少女蓝色眼睛特写", "description_text": "简短段落" },
          { "label": "发丝飘动", "image_crop": "飘逸发丝特写", "description_text": "简短段落" },
          { "label": "色彩与氛围", "image_crop": "海洋与天空背景", "description_text": "简短段落" }
        ]
      },
      "tools_used": {
        "title": "使用工具",
        "count": 3,
        "logos": [
          "{argument name=\"primary software\" default=\"CLIP STUDIO PAINT\"}",
          "Photoshop (Ps)",
          "Lightroom (Lr)"
        ]
      }
    },
    "footer": {
      "text": "微小的感动，点缀着世界。每一个瞬间，都将成为未来的宝藏。"
    }
  }
}
```

Creator's prompt, collected for private study. Ask before republishing.
