# 参数化视错觉海报

Community prompt · 9宫格
Language: zh · Domains: general · Source: K01

Source page: https://github.com/BaYue-SYJ/shuixian-prompts

Picture: https://r2.qqsrc.com/images/originals/23636.jpg

```
2x2 网格，针对 AI 推断的图形和颜色执行以下操作：python_scene_graph :: parametric_optical_illusion 类变量：topic = "[主题]" duality = "推断对立或分层的含义" primary_silhouette = "推断主导且可读的外部轮廓" hidden_image = "从负空间中推断次要图像" symbols = "推断极简的辅助符号" palette = "根据情绪推断 2-4 种颜色" style = "极简主义负空间海报" 类组合：first_read = variables.primary_silhouette second_read = variables.hidden_image rule = "两幅图像必须共享边缘和轮廓" density = "低细节，高清晰度" 类形状逻辑：black_shapes = "定义主要轮廓" white_or_color_voids = "定义隐藏图像" intersections = "设计使两种解读都保持意图明确" 类渲染：camera = "平面海报视图" texture = "可选细微纸张纹理" lighting = "无；平面设计清晰度" output = "简洁的视错觉隐喻海报" def generate(): return "将 [主题] 渲染为双重解读的负空间图像，且不包含硬编码符号。"
```

Creator's prompt, collected for private study. Ask before republishing.
