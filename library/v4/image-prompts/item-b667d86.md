# 人像极简胶片工作室温柔

Community prompt · 时尚摄影
Language: zh · Domains: nature, product, entertainment · Source: K01

Source page: https://github.com/BaYue-SYJ/shuixian-prompts

Picture: https://r2.qqsrc.com/images/twitter/30875.jpg

```
{
"task": "portrait_replacement_editorial_series",
"goal": "将原图中的人物替换为用户上传的人像参考，保留原图构图、姿势、表情、光影和极简杂志感，同时移除所有logo、水印、商标、署名与版权相关元素，并加入原创故障风英文排版。",
"reference_usage": {
"uploaded_portrait": "使用用户上传的人像作为唯一身份与面部参考",
"identity_consistency": "所有画面保持同一人物的脸型、五官比例、发型特征和整体辨识度自然统一",
"scene_reference": "参考原图的构图、机位、动作、表情、眼神、服装轮廓、光影和空间关系",
"style_reference": "极简时尚棚拍，低饱和高级灰，柔和自然光，轻胶片颗粒，安静克制的杂志人像质感"
},
"main_prompt": "将原图人物替换为用户上传的人像。保留人物靠墙或坐姿的构图关系、低头微笑或轻柔回眸的自然神态、宽松白色细条纹衬衫与黑色高腰阔腿裤的极简穿搭轮廓。人物表情要像被镜头偶然捕捉到的一瞬间，不是刻意摆拍，笑容自然、克制、带一点害羞和故事感。保持柔和侧光、浅灰白墙、木地板、轻微阴影和低饱和胶片质感。人物面部真实细腻，皮肤保留自然纹理，发丝松散自然，眼神和嘴角变化真实，身体比例协调，手部结构准确。整体呈现安静、高级、略带回忆感的时尚杂志摄影风格。",
"story_mood": {
"narrative": "像拍摄结束前，她忽然低头笑了一下。周围的人还在举着手机，画面却像短暂失去信号，只留下那一秒停在记忆里。",
"emotion": "温柔、克制、怀念、偶然被捕捉到的心动",
"expression": "低头浅笑、眼神避开镜头、嘴角自然上扬，笑意真实不过度",
"avoid": "夸张大笑、僵硬表情、统一眼神、刻意摆拍感"
},
"styling": {
"clothing": "无品牌白色细条纹宽松衬衫，袖口自然卷起，搭配无品牌黑色高腰阔腿裤和简洁黑色鞋履",
"hair": "深色自然蓬松长发或松散低马尾，少量碎发贴近脸侧，避免过度整齐",
"makeup": "自然清透底妆，轻微腮红，柔和裸色唇，保留真实皮肤纹理",
"accessories": "可保留简洁银色或绿色宝石感首饰，但不得出现可识别品牌设计"
},
"lighting_and_camera": {
"lighting": "柔和自然侧光，低对比阴影，人物身后墙面保留轻微投影",
"camera": "50mm至85mm人像镜头质感，浅景深，真实摄影比例",
"color_grading": "低饱和灰白调，轻微冷灰与暖肤色平衡",
"texture": "细腻胶片颗粒、轻微扫描噪点、自然镜头柔化，不要过度锐化"
},
"typography": {
"style": "极简故障风英文排版",
"main_title": "SMILE IN STATIC",
"alternative_titles": [
"SOFT STATIC",
"LOST IN SIGNAL",
"A MOMENT REMAINS",
"THE SMILE I KEPT"
],
"supporting_text": [
"editorial silence",
"soft response",
"memory frame 09",
"signal lost, moment saved"
],
"placement": "主标题放在左上或大面积留白区域，小字放在右上、人物边缘或画面下方，不遮挡五官",
"visual_effects": [
"细长无衬线或等宽字体",
"轻微RGB错位",
"少量横向断裂",
"半透明叠字",
"轻微CRT扫描线",
"局部数字噪点"
],
"density": "文字保持少量和高级留白，避免廉价特效和满版堆叠"
},
"copyright_safety": {
"remove_elements": [
"所有品牌logo",
"商标",
"水印",
"平台角标",
"工作室署名",
"摄影师签名",
"账号信息",
"受保护品牌文字",
"原图版权文字"
],
"clothing_rule": "服装、内搭、鞋履和首饰均使用无品牌原创设计",
"typography_rule": "只使用原创英文短句，不复制具体品牌广告语、杂志标题或受保护作品名称"
},
"negative_prompt": [
"logo",

"brand name",
"copyright text",
"platform mark",
"studio signature",
"celebrity face",
"face swap artifact",
"identity inconsistency",
"unnatural smile",
"forced expression",
"stiff pose",
"empty eyes",
"crooked eyes",
"misaligned facial features",
"plastic skin",
"over-retouched skin",
"deformed hands",
"extra fingers",
"missing fingers",
"unnatural body proportions",
"blurry face",
"low resolution",
"oversaturated color",
"cheap glitch effect",
"heavy text covering face"
],
"output": {
"format": "single image",
"aspect_ratio": "3:4",
"quality": "high detail editorial photography",
"series_rule": "若生成多张，每张保持同一人物身份，但表情、眼神、动作和机位自然变化，不重复同一种笑容"
}
}
```

Creator's prompt, collected for private study. Ask before republishing.
